(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.inventoryComplete', {
                url: "/inventory-complete",
                templateUrl: 'js/components/alcoholSetup/inventoryComplete/inventoryComplete.html',
                data: {pageTitle: 'Inventory Complete'}
            });
    })

})();