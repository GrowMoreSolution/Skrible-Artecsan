(function () {

    "use strict";

    var core = function (api, auth, $q, restaurant, localStorageService, $rootScope) {


        var data = {
            settings: null,
            refbooks: null,
            new_restaurant: null // can contain data for editable restaurant
        };


        function get_settings() {
            var deferred = $q.defer();
            if (data.settings) {
                deferred.resolve(data.settings);
            } else {
                var keys = {keys: ["email_body_template", "email_invite_on_submission"]};
                api.get_settings(keys).then(function (res) {
                    data.settings = res.data.data.settings;
                    deferred.resolve(data.settings);
                })
            }
            return deferred.promise;
        }

        function get_refbooks() {
            var deferred = $q.defer();
            if (data.refbooks) {
                deferred.resolve(data.refbooks);
            } else {

                var keys = {
                    refbooks: [
                        "tare_types",
                        "analytics_questionare",
                        "bar_serving_details_types",
                        "bar_serving_types",
                        "default_weights",
                        "bar_recipe_measurement_types",
                        "inventory_types",
                        "liquid_dry_conversion",
                        "measurement_types",
                        "measurement_categories",
                        "measurement_likes",
                        "measurement_units",
                        "recipe_types",
						"recipe_cooking_methods",
                        'country_states',
                        "user_types",
                        "entity_types",
                        "content_types",
                        "invite_status",
                        "menu_items",
                        "vendor_sub_cat",
                        "vendor_cat",
                        "measurement_units_of_delivery",
						"accounting_subcategories",
						"accounting_units"
                    ]
                };

                api.get_refbooks(keys).then(function (res) {
                    data.refbooks = res.data.data.refbooks;
                    deferred.resolve(data.refbooks);
                })
            }
            return deferred.promise;
        }

        var init = function () {
            var restaurantID = localStorageService.get('restaurant_id');

            if (restaurantID) {
                restaurant.set_restaurant(restaurantID.restaurant_id).then(function () {
                    // $rootScope.$emit('restaurantSelected');
                })
            }

        };


        return {
            data: data,
            getSettings: get_settings,
            getRefbooks: get_refbooks,
            init: init
        };
    };

    core.$inject = ['api', 'auth', '$q', 'restaurant', 'localStorageService', '$rootScope'];
    angular.module('inspinia').factory('core', core);

})();
