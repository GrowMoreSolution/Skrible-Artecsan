(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('registration', {
                url: "/registration/:id",
                template: "<registration-component></registration-component>",
                data: {pageTitle: ' Registration'}
            });

    })

})();