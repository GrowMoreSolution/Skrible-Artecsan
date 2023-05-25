(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.menuItemsMapping', {
                url: "/menu-items-mapping/:type",
                template: "<menu-items-mapping-component></menu-items-mapping-component>",
                data: {pageTitle: 'Menu Items Mapping'}
            });
    })

})();