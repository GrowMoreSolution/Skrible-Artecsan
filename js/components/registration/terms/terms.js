(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('terms', {
                url: "/terms",
                template: "<terms-component></terms-component>",
                data: {pageTitle: ' Agreement'}
            });

    })

})();