(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.inventoryMerge', {
                url: "/inventory-merge",
                template: "<food-inventory-merge-component></food-inventory-merge-component>",
                data: {pageTitle: ' Inventory Merge'}
            });
    })

})();