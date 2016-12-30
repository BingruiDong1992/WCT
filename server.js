var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/wctLogin');
var db = mongoose.connection;

var express = require('express');
var http = require('http');
var path = require('path');
var server = require('socket.io');
var pty = require('pty.js');
var route = require('./routes/route');
var users = require('./routes/users');
var httpserv;
var app = express();

var Terminal = require('./models/terminal')

var userId = null;
var termMap = {};

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.get('/:id', function(req, res, next) {
    userId = req.params.id;
    next();
});

app.use('/', route);
app.use('/users', users);

app.use(express.static(path.join(__dirname, 'public')));


httpserv = http.createServer(app).listen(3000,'localhost',  function() {
    console.log('http on port ' + 3000);
});

var sshport = 22;
var sshhost = 'localhost';
var sshauth = 'password';

var io = server.listen(httpserv,{path: '/wct/socket.io'});
io.sockets.on('connection', function(socket){
    var sshuser = '';
    var term;
    var terminal;
    if (userId in termMap) {
        terminal = termMap[userId];
        term = terminal.term;
        terminal.addUser(userId);
        console.log(terminal.online_user_count);
        console.log("Existing termianl for " + userId);
    }
    else {
        term = pty.spawn('ssh', [sshuser + sshhost, '-p', sshport, '-o', 'PreferredAuthentications=' + sshauth], {
            name: 'xterm-256color',
            cols: 80,
            rows: 30
        });
        terminal = new Terminal(userId, term);
        termMap[userId] = terminal;
        console.log("new termianl for " + userId);
    }

    console.log((new Date()) + " PID=" + term.pid + " STARTED on behalf of user=" + sshuser);
    term.on('data', function(data) {
        socket.emit('output', data);
    });
    term.on('exit', function(_) {
        console.log((new Date()) + " PID=" + term.pid + " ENDED");
    });
    socket.on('resize', function(data) {
        term.resize(data.col, data.row);
    });
    socket.on('input', function(data) {
        term.write(data);
    });
    socket.on('disconnect', function() {
        terminal.removeUser(userId);
        console.log(terminal.online_user_count);
        if (terminal.online_user_count == 0) {
            term.end();
            console.log("End terminal created by " + termMap[terminal.creater]);
            delete termMap[terminal.creater];
        }
    });
});
