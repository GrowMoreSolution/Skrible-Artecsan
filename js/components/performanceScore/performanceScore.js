(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.performanceScore', {
                url: "/performanceScore",
                template: "<performance-score-component></performance-score-component>",
                data: {pageTitle: 'Performance Score'}
            });
    })

})();
