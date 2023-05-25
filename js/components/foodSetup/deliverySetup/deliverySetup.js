(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.delivery', {
                url: "/delivery-setup",
                template: "<delivery-setup-component></delivery-setup-component>",
                data: {pageTitle: ' Delivery Setup'}
            });
    })

})();