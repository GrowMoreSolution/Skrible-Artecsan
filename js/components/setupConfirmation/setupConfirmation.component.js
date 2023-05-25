(function () {
    'use strict';

    function controller($state, auth) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.$state = $state;


    }

    controller.$inject = ['$state', 'auth'];

    angular.module('inspinia').component('setupConfirmationComponent', {
        templateUrl: 'js/components/setupConfirmation/setupConfirmation.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();