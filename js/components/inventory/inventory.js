(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('inventory', {
                url: "/inventory",
                data: {pageTitle: 'Inventory Categories'},
                abstract: true,
                template: '<ui-view></ui-view>'
            });
    })

})();