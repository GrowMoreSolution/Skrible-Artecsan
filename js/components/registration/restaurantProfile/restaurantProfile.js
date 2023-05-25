(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('restaurantProfile', {
                url: "/restaurant-profile/:id",
                template: "<restaurant-profile-component></restaurant-profile-component>",
                data: {pageTitle: ' Restaurant Profile'}
            });

    })

})();