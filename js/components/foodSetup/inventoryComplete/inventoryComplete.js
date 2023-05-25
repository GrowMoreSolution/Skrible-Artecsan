(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.inventoryComplete', {
                url: "/inventory-complete",
                templateUrl: 'js/components/foodSetup/inventoryComplete/inventoryComplete.html',
                data: {pageTitle: 'Inventory Complete'}
            });
    })

})();