(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('administrator.menu', {
                url: "/menu",
                templateUrl: 'js/components/administrator/menu/menu.html',
                data: {pageTitle: 'Administrator'}
            });
    })

})();