var browserTerminal;
var socket = io(location.origin, {path: '/wct/socket.io'})
var buf = '';

function Wct(argv) {
    this.argv_ = argv;
    this.io = null;
}

Wct.prototype.run = function() {
    this.io = this.argv_.io.push();

    this.io.onVTKeystroke = this.sendString_.bind(this);
    this.io.sendString = this.sendString_.bind(this);
    this.io.onTerminalResize = this.onTerminalResize.bind(this);
};

Wct.prototype.sendString_ = function(str) {
    socket.emit('input', str);
};

Wct.prototype.onTerminalResize = function(col, row) {
    socket.emit('resize', { col: col, row: row });
};

socket.on('connect', function() {
    lib.init(function() {
        hterm.defaultStorage = new lib.Storage.Local();
        browserTerminal = new hterm.Terminal();
        window.term = browserTerminal;
        browserTerminal.decorate(document.getElementById('terminal'));

        browserTerminal.setCursorPosition(0, 0);
        browserTerminal.setCursorVisible(true);
        browserTerminal.prefs_.set('ctrl-c-copy', true);
        browserTerminal.prefs_.set('ctrl-v-paste', true);
        browserTerminal.prefs_.set('use-default-window-copy', true);

        browserTerminal.runCommandClass(Wct, document.location.hash.substr(1));
        socket.emit('resize', {
            col: browserTerminal.screenSize.width,
            row: browserTerminal.screenSize.height
        });

        if (buf && buf != '')
        {
            browserTerminal.io.writeUTF16(buf);
            buf = '';
        }
    });
});

socket.on('output', function(data) {
    if (!browserTerminal) {
        buf += data;
        return;
    }
    browserTerminal.io.writeUTF16(data);
});

socket.on('disconnect', function() {
    console.log("Socket.io connection closed");
});
