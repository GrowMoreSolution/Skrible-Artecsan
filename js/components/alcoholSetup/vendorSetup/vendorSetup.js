(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.vendor', {
                url: "/vendor-setup",
                template: "<alcohol-vendor-setup-component></alcohol-vendor-setup-component>",
                data: {pageTitle: 'Vendor Setup'}
            });
    })

})();