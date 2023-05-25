(function () {

    "use strict";

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('food.orderSummary', {
                url: "/order-summary",
                template: "<order-summary-component></order-summary-component>",
                data: {pageTitle: 'Alcohol Order Summary'}
            })

    })

})();