function Terminal(creater, terminal) {
    this.creater = creater;
    this.term = terminal;
    this.users = {creater : true};
    this.online_user_count = 1;
}

Terminal.prototype.addUser = function (userId) {
    this.users[userId] = true;
    this.online_user_count += 1;
};

Terminal.prototype.removeUser = function (userId) {
    delete this.users[userId];
    this.online_user_count -= 1
};

module.exports = Terminal;