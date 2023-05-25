(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('restaurantUserProfile', {
                url: "/restaurant-user-profile",
                template: "<restaurant-user-profile-component></restaurant-user-profile-component>",
                data: {pageTitle: ' Restaurant Administrator Profile'}
            });

    })

})();