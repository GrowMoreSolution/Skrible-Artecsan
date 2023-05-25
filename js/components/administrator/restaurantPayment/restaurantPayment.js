(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('administrator.restaurantPayment', {
                url: "/restaurant-payment",
                template: "<payment-component></payment-component>",
                data: {pageTitle: 'Payment'}
            });

    })

})();