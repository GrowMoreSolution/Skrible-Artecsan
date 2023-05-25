(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.recipe', {
                url: "/recipe-setup",
                template: "<recipe-setup-component></recipe-setup-component>",
                data: {pageTitle: ' Recipe Setup'}
            });
    })

})();