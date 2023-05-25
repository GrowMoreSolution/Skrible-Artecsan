(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.vendor', {
                url: "/vendor-setup",
                template: "<vendor-setup-component></vendor-setup-component>",
                data: {pageTitle: ' Vendor Setup'}
            });
    })

})();