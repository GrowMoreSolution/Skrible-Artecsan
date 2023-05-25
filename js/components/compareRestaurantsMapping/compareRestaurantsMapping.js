(function () {

    "use strict";

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('compareRestaurantsMapping', {
                url: "/compareRestaurantsMapping",
                template: "<comprestmap></comprestmap>",
                data: {pageTitle: 'Compare Restaurants - Mapping'}
            })

    })

})();