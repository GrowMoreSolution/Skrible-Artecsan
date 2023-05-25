(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('administrator.inventoryComplete', {
                url: "/inventory-complete",
                templateUrl: 'js/components/administrator/inventoryComplete/inventoryComplete.html',
                data: {pageTitle: 'Inventory Complete'}
            });
    })

})();