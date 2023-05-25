(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.analytics', {
                url: "/analytics",
                template: "<analytics></analytics>",
                data: {pageTitle: 'Analytics'}
            });
    })

})();
