(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.inventory', {
                url: "/inventory-setup",
                template: "<alcohol-inventory-setup-component></alcohol-inventory-setup-component>",
                data: {pageTitle: ' Inventory Setup'}
            });
    })

})();