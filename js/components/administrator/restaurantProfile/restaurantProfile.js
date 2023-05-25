(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('administrator.restaurantProfile', {
                url: "/restaurant-profile",
                template: "<restaurant-profile-component></restaurant-profile-component>",
                data: {pageTitle: 'Restaurant Profile'}
            });

    })

})();