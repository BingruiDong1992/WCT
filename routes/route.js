var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/wct', ensureAuthenticated, function(req, res) {
    res.sendFile(path.resolve('views/wct.html'));
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('error', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;