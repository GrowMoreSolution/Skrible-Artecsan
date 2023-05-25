(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.support', {
                url: "/support",
                template: "<support></support>",
                data: {pageTitle: 'Support'}
            });
    })

})();
