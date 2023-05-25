(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.performanceScoreDetail', {
                url: "/performanceScoreDetail",
                template: "<performance-score-detail-component></performance-score-detail-component>",
                data: {pageTitle: 'Performance Score Detail'}
            });
    })

})();
