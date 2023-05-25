(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.recipeReview', {
                url: "/recipe-review",
                template: "<recipe-review-component></recipe-review-component>",
                data: {pageTitle: 'Recipe Review'}
            });
    })
})();
