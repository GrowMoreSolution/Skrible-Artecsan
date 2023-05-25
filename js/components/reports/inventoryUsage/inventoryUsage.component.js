(function () {
    'use strict';

    function controller(api, $state, auth, localStorageService, restaurant, $rootScope, core, $filter) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.core = core;
        that.data = [];
        that.totals = {
            last_counted: 0,
            purchased_this_period: 0,
            counted_this_period: 0,
            qty_used_this_period: 0,
            pos_sales_this_period: 0,
            over_this_period: 0,
            cost_of_over_this_period: 0
        };

        that.isFood = $state.includes('reports.food');

        that.inventory_type_id = that.isFood ? 1 : 2;

        that.searchModel = {
            date_from: new Date(),
            date_to: new Date()
        };

        that.searchModel.date_from = that.searchModel.date_from.setDate(that.searchModel.date_from.getDate() - 7);

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        that.calculate = function () {

            var last_counted = 0;
            var purchased_this_period = 0;
            var counted_this_period = 0;
            var qty_used_this_period = 0;
            var pos_sales_this_period = 0;
            var over_this_period = 0;
            var cost_of_over_this_period = 0;

            angular.forEach(that.data, function (v, k) {
                console.log(v.pos_sales_this_period);
                last_counted += parseFloat(v.last_counted) || 0;
                purchased_this_period += parseFloat(v.purchased_this_period) || 0;
                counted_this_period += parseFloat(v.counted_this_period) || 0;
                qty_used_this_period += parseFloat(v.qty_used_this_period) || 0;
                pos_sales_this_period += parseFloat(v.pos_sales_this_period) || 0;
                over_this_period += parseFloat(v.over_this_period) || 0;
                cost_of_over_this_period += parseFloat(v.cost_of_over_this_period) || 0;

            });

            that.totals.last_counted = last_counted;
            that.totals.purchased_this_period = purchased_this_period;
            that.totals.counted_this_period = counted_this_period;
            that.totals.qty_used_this_period = qty_used_this_period;
            that.totals.pos_sales_this_period = pos_sales_this_period;
            that.totals.over_this_period = over_this_period;
            that.totals.cost_of_over_this_period = cost_of_over_this_period;
        };

        that.search = function (form) {

            var m = {
                inventory_type_id: that.inventory_type_id,
                date_from: $filter('date')(new Date(that.searchModel.date_from), 'yyyy-MM-dd'),
                // date_from: parseInt(new Date(that.searchModel.date_from).getTime() / 1000),
                date_to: $filter('date')(new Date(that.searchModel.date_to), 'yyyy-MM-dd')
                // date_to: parseInt(new Date(that.searchModel.date_to).getTime() / 1000)
            };

            that.api.inventory_usage_report(m).then(function (res) {
                that.data = res.data.data.inventory_usage_report;
                that.calculate();
            });

        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.refbooks = res;
                that.search(that.form);

            })
        };


    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope', 'core', '$filter'];

    angular.module('inspinia').component('inventoryUsage', {
        templateUrl: 'js/components/reports/inventoryUsage/inventoryUsage.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
