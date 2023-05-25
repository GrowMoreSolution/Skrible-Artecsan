(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.inventoryMerge', {
                url: "/inventory-merge",
                template: "<alcohol-inventory-merge-component></alcohol-inventory-merge-component>",
                data: {pageTitle: ' Inventory Merge'}
            });
    })

})();