(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.dailyOnHand', {
                url: "/daily-on-hand",
                template: "<daily-on-hand-component></daily-on-hand-component>",
                data: {pageTitle: 'On Hand Status'}
            });
    })
 
})();
