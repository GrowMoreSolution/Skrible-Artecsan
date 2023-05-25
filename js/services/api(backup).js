(function () {
    'use strict';

    var api = function (appConfig, $http, $injector) {

        var serviceBase = appConfig.apiDomain;

        var serviceFactory = {};

        function getAuthConfig() {
            var config = {};
            config.headers = {};
            // config.headers['Content-Type'] = 'application/x-www-form-urlencoded'; // TODO

            var auth = $injector.get('auth');

            if (!auth.authentication.isLogged) {
                config.headers['Authorization'] = appConfig.apiAuthorization;
            } else {
                config.headers['Authorization'] = 'Bearer ' + auth.authentication.token;
            }

            return config;
        }

        serviceFactory.get_settings = function (model) {
            return $http.post(serviceBase + 'rb/get_public_settings', model, getAuthConfig());
        };

        serviceFactory.auth_login = function (model) {
            return $http.post(serviceBase + 'auth/login', model, getAuthConfig());
        };

        serviceFactory.get_pos_list = function () {
            return $http.get(serviceBase + 'rb/get_pos_list', getAuthConfig());
        };

        serviceFactory.rb_subscriptions = function () {
            return $http.get(serviceBase + 'rb/subscriptions', getAuthConfig());
        };

        serviceFactory.reset_password = function (model) {
            return $http.post(serviceBase + 'users/reset_password', model, getAuthConfig());
        };

        serviceFactory.get_restaurants = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'restaurants',
                headers: {
                    'Authorization': 'Bearer ' + auth.authentication.token
                },
                params: model
            });
        };

        serviceFactory.get_refbooks = function (model) {
            return $http.post(serviceBase + 'rb/get_refbooks', model, getAuthConfig());
        };

        serviceFactory.users_registration = function (model) {
            return $http.post(serviceBase + 'users/registration', model, getAuthConfig());
        };

        serviceFactory.create_restaurant = function (model) {
            return $http.post(serviceBase + 'restaurants', model, getAuthConfig());
        };

        serviceFactory.update_restaurant = function (model, id) {
            return $http.put(serviceBase + 'restaurants/' + id, model, getAuthConfig());
        };

        serviceFactory.get_restaurant = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id, getAuthConfig());
        };

        serviceFactory.users_invite = function (model) {
            return $http.post(serviceBase + 'users/invite', model, getAuthConfig());
        };

        serviceFactory.locations_lookup = function (model) {
            return $http.post(serviceBase + 'rb/locations_lookup', model, getAuthConfig());
        };

        serviceFactory.contact_us = function (model) {
            return $http.post(serviceBase + 'users/contact_us', model, getAuthConfig());
        };

        serviceFactory.get_invite_info = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'users/get_invite_info',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.redeem_invitation = function (model) {
            return $http.post(serviceBase + 'users/redeem_invitation', model, getAuthConfig());
        };

        serviceFactory.check_if_employee_exists = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/employees', getAuthConfig());
        };

        serviceFactory.change_restaurant_employee_status = function (id, model) {
            return $http.put(serviceBase + 'restaurants/' + id + '/employees', model, getAuthConfig());
        };

        serviceFactory.delete_invite = function (id, model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'DELETE',
                url: serviceBase + 'restaurants/' + id + '/invited',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.set_active_restaurant = function (model) {
            return $http.post(serviceBase + 'users/set_active_restaurant', model, getAuthConfig());
        };

        serviceFactory.get_vendors = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'vendors',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.get_credit_card_checker = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: appConfig.apiBincodesDomain + 'cc/',
                params: model
            });
        };

        serviceFactory.get_chosen_vendors = function (id, model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                url: serviceBase + 'restaurants/' + id + '/vendors',
                params: model
            });
        };

        serviceFactory.add_new_vendor = function (id, model) {
            return $http.post(serviceBase + 'restaurants/' + id + '/addVendor', model, getAuthConfig());
        };

        serviceFactory.add_vendor = function (id, model) {
            return $http.put(serviceBase + 'restaurants/' + id + '/vendors', model, getAuthConfig());
        };

        serviceFactory.add_inventory = function (id, model) {
            return $http.put(serviceBase + 'restaurants/' + id + '/vendors_sku', model, getAuthConfig());
        };

        serviceFactory.get_inventory_by_vendor = function (model, id) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'vendors/' + id + '/inventory',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.get_active_inventory_by_vendor = function (model, id) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'restaurants/' + id + '/vendors_sku',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.update_user_info = function (id, model) {
            return $http.put(serviceBase + 'users/' + id, model, getAuthConfig());
        };

        serviceFactory.get_user_info = function (id) {
            return $http.get(serviceBase + 'users/' + id, getAuthConfig());
        };

        serviceFactory.save_recipe = function (model) {
            return $http.post(serviceBase + 'recipes', model, getAuthConfig());
        };

        serviceFactory.get_recipes = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'recipes',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.get_recipes_setup_process = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'recipes',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.get_recipe = function (id) {
            return $http.get(serviceBase + 'recipes/' + id, getAuthConfig());
        };

        serviceFactory.delete_recipe = function (id) {
            return $http.delete(serviceBase + 'recipes/' + id, getAuthConfig());
        };

        serviceFactory.update_recipe = function (id, model) {
            return $http.put(serviceBase + 'recipes/' + id, model, getAuthConfig());
        };

        serviceFactory.get_menus = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'menus',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.save_menu = function (model) {
            return $http.post(serviceBase + 'menus', model, getAuthConfig());
        };

        serviceFactory.update_mapping = function (model) {
            return $http.get(serviceBase + 'system/update_Mapping', getAuthConfig());
        };

        serviceFactory.update_menu = function (id, model) {
            return $http.put(serviceBase + 'menus/' + id, model, getAuthConfig());
        };

        serviceFactory.update_PLs = function (oldname_and_newname) {
            return $http.put(serviceBase + 'menus/' + oldname_and_newname, getAuthConfig());
        };

        serviceFactory.get_menu_by_id = function (id) {
            return $http.get(serviceBase + 'menus/' + id, getAuthConfig());
        };

        serviceFactory.get_menu_by_name_and_pricing_level = function (name_and_pricing_level) {
            return $http.get(serviceBase + 'menus/' + name_and_pricing_level, getAuthConfig());
        };

        serviceFactory.delete_menu = function (id) {
            return $http.delete(serviceBase + 'menus/' + id, getAuthConfig());
        };

        serviceFactory.checkIfSold = function (id) {
            return $http.get(serviceBase + 'menus/' + id + '/checkIfSold', getAuthConfig());
        };

        serviceFactory.delivery_schedules = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'delivery_schedules',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            })
        };

        serviceFactory.save_delivery = function (model) {
            return $http.post(serviceBase + 'delivery_schedules', model, getAuthConfig());
        };

        serviceFactory.update_delivery = function (id, model) {
            return $http.put(serviceBase + 'delivery_schedules/' + id, model, getAuthConfig());
        };

        serviceFactory.delete_delivery = function (id) {
            return $http.delete(serviceBase + 'delivery_schedules/' + id, getAuthConfig());
        };

        serviceFactory.get_vendors_categories = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'vendors/get_vendors_categories',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.get_omnivore_location = function (id) {
            return $http.get(serviceBase + 'pos/omnivore/locations/' + id, getAuthConfig());
        };

        serviceFactory.get_inventory_audit = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'inventory',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.update_inventory_audit = function (model) {
            return $http.put(serviceBase + 'inventory', model, getAuthConfig());
        };

        serviceFactory.brand_lookup = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'rb/brand_lookup',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.vendors_sku = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'vendors/sku',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.add_update_own_inventory = function (id, model) {
            return $http.post(serviceBase + 'vendors/' + id + '/inventory', model, getAuthConfig());
        };

        serviceFactory.delete_my_sku = function (vendor_id, sku_id) {
            return $http.delete(serviceBase + 'vendors/' + vendor_id + '/inventory/' + sku_id, getAuthConfig());
        };

        serviceFactory.get_modules = function (model) {
            return $http.post(serviceBase + 'rb/get_modules', model, getAuthConfig());
        };

        serviceFactory.get_measure_units = function (model) {
            return $http.post(serviceBase + 'rb/uom_conformity', model, getAuthConfig());
        };

        serviceFactory.getItemsForMap = function (id, model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'restaurants/' + id + '/report',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.setItemsForMap = function (id, model) {
            return $http.post(serviceBase + 'restaurants/' + id + '/report_items_match', model, getAuthConfig());
        };

        serviceFactory.report_items_match = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/report_items_match', getAuthConfig());
        };

        serviceFactory.update_csv_path = function (id, model) {
            return $http.put(serviceBase + 'restaurants/' + id + '/updateCsvPath', model, getAuthConfig());
        };

        serviceFactory.bar_serving_details = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/bar_serving_details', getAuthConfig());
        };

        serviceFactory.save_bar_serving_details = function (model) {
            return $http.post(serviceBase + 'restaurants/bar_serving_details', model, getAuthConfig());
        };

        serviceFactory.get_analytics_answers = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/analytics_answers', getAuthConfig());
        };

        serviceFactory.set_analytics_answers = function (model) {
            return $http.post(serviceBase + 'restaurants/analytics_answers', model, getAuthConfig());
        };

        serviceFactory.get_feedback_stack = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/feedback_stack', getAuthConfig());
        };

        serviceFactory.set_feedback = function (model) {
            return $http.post(serviceBase + 'restaurants/feedback_stack', model, getAuthConfig());
        };

        serviceFactory.get_restaurant_location_details = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/locn_details', getAuthConfig());
        };

        serviceFactory.get_event_categories = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/event_categories', getAuthConfig());
        };

        serviceFactory.get_events = function (id_category) {
            return $http.get(serviceBase + 'restaurants/' + id_category + '/events', getAuthConfig());
        };

        serviceFactory.set_events = function (model) {
            return $http.post(serviceBase + 'restaurants/events', model, getAuthConfig());
        };

        serviceFactory.get_scores = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/performance_score', getAuthConfig());
        };

        serviceFactory.calc_scores = function (id) {
            return $http.get(serviceBase + 'restaurants/' + id + '/performance_score_calc', getAuthConfig());
        };


        serviceFactory.get_order = function (id, model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'orders/' + id,
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.get_orders = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'orders',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.create_order = function (model) {
            return $http.post(serviceBase + 'orders', model, getAuthConfig());
        };
		
		serviceFactory.add_extra_order_items = function (model) {
            return $http.post(serviceBase + 'orders/add_extra_order_items', model, getAuthConfig());
        };

        serviceFactory.update_order = function (model, id) {
            return $http.put(serviceBase + 'orders/' + id, model, getAuthConfig());
        };

        serviceFactory.update_orders = function (model) {
            return $http.put(serviceBase + 'orders', model, getAuthConfig());
        };

        serviceFactory.delete_order = function (id) {
            return $http.delete(serviceBase + 'orders/' + id, getAuthConfig());
        };

        serviceFactory.inventory_usage_report = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'inventory/usage_report',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };
        serviceFactory.sales_data = function (model) {
            return $http.post(serviceBase + 'restaurants/sales_data', model, getAuthConfig());
        };

        serviceFactory.bar_chart_api = function (model) {
            return $http.post(serviceBase + 'restaurants/bar_chart_api', model, getAuthConfig());
        };
        serviceFactory.lateral_chart_api = function (model) {
            return $http.post(serviceBase + 'restaurants/lateral_chart_api', model, getAuthConfig());
        };
        serviceFactory.salesVsCost = function (model) {
            return $http.post(serviceBase + 'restaurants/salesVsCost', model, getAuthConfig());
        };
        serviceFactory.PieChart = function (model) {
            return $http.post(serviceBase + 'restaurants/PieChart', model, getAuthConfig());
        };
        serviceFactory.alcohol = function (model) {
            return $http.post(serviceBase + 'restaurants/Alcohol', model, getAuthConfig());
        };
        serviceFactory.get_suggested_orders = function (model) {
            return $http.post(serviceBase + 'restaurants/get_suggested_orders', model, getAuthConfig());
        };
        serviceFactory.get_full_audit_variance = function (model) {
            return $http.post(serviceBase + 'restaurants/get_full_audit_variance', model, getAuthConfig());
        };
        serviceFactory.get_adjustment_variance = function (model) {
            return $http.post(serviceBase + 'restaurants/get_adjustment_variance', model, getAuthConfig());
        };
        serviceFactory.payment_call = function (model) {
            return $http.post(serviceBase + 'restaurants/payment_call', model, getAuthConfig());
        };
        serviceFactory.process_suggested_order_item = function (model) {
            return $http.post(serviceBase + 'restaurants/process_suggested_order_item', model, getAuthConfig());
        };
        return serviceFactory;
    };

    api.$inject = ['appConfig', '$http', '$injector'];
    angular.module('inspinia').factory('api', api);

})();
