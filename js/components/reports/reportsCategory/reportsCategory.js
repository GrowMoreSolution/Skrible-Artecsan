(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.reportsCategory', {
                url: "/reports-category",
                templateUrl: 'js/components/reports/reportsCategory/reportsCategory.html',
                data: {pageTitle: 'Reports'},
                controllerAs: '$ctr',
                controller: function ($rootScope, restaurant) {

                    var that = this;

                    $rootScope.$on('restaurantSelected', function () {
                        that.permissions = restaurant.data.permissions;
						that.subscription_type_id = restaurant.data.info.subscription_type_id;
                    });

                    if (restaurant.data.permissions) {
                        that.permissions = restaurant.data.permissions;
                    }
					if (restaurant.data.info.subscription_type_id) {
                        that.subscription_type_id = restaurant.data.info.subscription_type_id;
                    }
                }
            });
    })

})();