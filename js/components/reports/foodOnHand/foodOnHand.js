(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.foodOnHand', {
                url: "/food-on-hand",
                template: "<food-on-hand-component></food-on-hand-component>",
                data: {pageTitle: 'On Hand Status'}
            });
    })
 
})();
