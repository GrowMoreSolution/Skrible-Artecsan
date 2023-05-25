(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.inventory', {
                url: "/inventory-setup",
                template: "<inventory-setup-component></inventory-setup-component>",
                data: {pageTitle: ' Inventory Setup'}
            });
    })

})();