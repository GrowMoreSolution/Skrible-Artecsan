(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.serving-details', {
                url: "/serving-details",
                template: "<bar-serving-details></bar-serving-details>",
                data: {pageTitle: 'Bar Serving Details'}
            });
    })

})();