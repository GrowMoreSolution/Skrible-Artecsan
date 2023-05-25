(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodCalculator', {
                url: "/foodCalculator",
                template: "<food-calculator></food-calculator>",
                data: {pageTitle: ' Food Calculator'}
            });

    })

})();