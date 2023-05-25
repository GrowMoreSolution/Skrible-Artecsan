(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.menu', {
                url: "/menu-setup",
                template: "<menu-setup-component></menu-setup-component>",
                data: {pageTitle: ' Menu Setup'}
            });
    })

})();