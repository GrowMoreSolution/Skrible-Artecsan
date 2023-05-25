(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.confirmation', {
                url: "/confirmation",
                template: '<setup-confirmation-component></setup-confirmation-component>',
                data: {pageTitle: 'Setup Confirmation'}
            });
    })

})();