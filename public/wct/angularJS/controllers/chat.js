(function () {
    angular
        .module("wctApp")
        .controller('chatCtrl', chatController);

    function chatController() {
        var vm = this;
        vm.terminalHeight = '100%';
        vm.chating = false;
        vm.logining = true;
        vm.toggleChat = function () {
            vm.chating = !vm.chating;
        };
        vm.exit = function () {
            window.location.href = '/';
        };
        vm.getTerminalClass = function () {
            if(vm.chating) {
                return "terminal-small";
            }
            else{
                return "terminal-large";
            }
        };
        vm.login = function () {
            vm.logining = !vm.logining;
        }


    }
})();

