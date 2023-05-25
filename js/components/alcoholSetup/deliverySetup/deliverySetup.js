(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.delivery', {
                url: "/delivery-setup",
                template: "<alcohol-delivery-setup-component></alcohol-delivery-setup-component>",
                data: {pageTitle: ' Delivery Setup'}
            });
    })

})();