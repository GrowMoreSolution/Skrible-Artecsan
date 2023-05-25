(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.confirmation', {
                url: "/confirmation",
                template: '<setup-confirmation-component></setup-confirmation-component>',
                data: {pageTitle: 'Setup Confirmation'}
            });
    })

})();