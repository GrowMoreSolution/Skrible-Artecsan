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
		
		serviceFactory.get_promo_ref = function () {
            return $http.get(serviceBase + 'rb/get_promo_ref', getAuthConfig());
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
		
		serviceFactory.get_global_vendors = function (model) {
            return $http.post(serviceBase + 'restaurants/global_vendors', model, getAuthConfig());
        };

        serviceFactory.add_new_vendor = function (id, model) {
            return $http.post(serviceBase + 'restaurants/' + id + '/addVendor', model, getAuthConfig());
        };
		
		serviceFactory.get_vendor_by_id = function (id) {
            return $http.get(serviceBase + 'restaurants/getVendorDetails/' + id, getAuthConfig());
        };
		
		serviceFactory.update_vendor_details = function (id, model) {
            return $http.post(serviceBase + 'restaurants/updateVendorDetails/' + id, model, getAuthConfig());
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
		
		serviceFactory.upload_recipe_image = function (model) {
            return $http.post(serviceBase + 'recipes/upload_recipe_image', model, getAuthConfig());
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
		
		serviceFactory.get_menus_using_this_recipe = function (id) {
            return $http.get(serviceBase + 'recipes/getMenusUsingRecipe/' + id, getAuthConfig());
        };
		
		serviceFactory.get_recipes_using_this_sub_recipe = function (id) {
            return $http.get(serviceBase + 'recipes/getRecipesUsingSubRecipe/' + id, getAuthConfig());
        };
		
		serviceFactory.act_deact_recipe = function (model) {
            return $http.post(serviceBase + 'recipes/act_deact_recipe/', model, getAuthConfig());
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

		serviceFactory.get_menu_category = function (id) {
            return $http.get(serviceBase + 'menus/category' + id, getAuthConfig());
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
		
		serviceFactory.get_recipe_audit = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'inventory/recipe_audit',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };

        serviceFactory.update_inventory_audit = function (model) {
            return $http.put(serviceBase + 'inventory', model, getAuthConfig());
        };
		
		serviceFactory.get_suggested_audit = function (model) {
            return $http.post(serviceBase + 'inventory/get_suggested_audit', model, getAuthConfig());
        };
		
		serviceFactory.delete_suggested_audit = function (model) {
            return $http.post(serviceBase + 'inventory/delete_suggested_audit/', model, getAuthConfig());
        };
		
		serviceFactory.send_audit_COS_email = function (model) {
            return $http.post(serviceBase + 'system/audit_final_save', model, getAuthConfig());
        };
		
		serviceFactory.delete_inventory_audit = function (inv_type_id, is_suggested) {
            return $http.delete(serviceBase + 'inventory/' + inv_type_id + '/' + is_suggested, getAuthConfig());
        };
		
		serviceFactory.update_recipe_audit = function (model) {
            return $http.put(serviceBase + 'inventory/update_recipe_audit', model, getAuthConfig());
        };
		
		serviceFactory.delete_recipe_audit_item = function (model) {
            return $http.post(serviceBase + 'inventory/delete_recipe_audit_item', model, getAuthConfig());
        };
		
		serviceFactory.get_next_full_audit_type = function (model) {
            return $http.post(serviceBase + 'inventory/get_next_full_audit_type', model, getAuthConfig());
        };
		
		serviceFactory.get_restaurant_audit_locations = function (model) {
            return $http.post(serviceBase + 'inventory/get_restaurant_audit_locations', model, getAuthConfig());
        };
		
		serviceFactory.add_edit_locations = function (model) {
            return $http.post(serviceBase + 'inventory/add_edit_locations', model, getAuthConfig());
        };
		
		serviceFactory.get_audit_dates = function (model) {
            return $http.post(serviceBase + 'inventory/get_audit_dates', model, getAuthConfig());
        };

		serviceFactory.set_audit_date = function (model) {
            return $http.post(serviceBase + 'inventory/set_audit_date', model, getAuthConfig());
        };
		
		//schedule audit module
		serviceFactory.get_restaurant_audit_profile = function (model) {
            return $http.post(serviceBase + 'inventory/get_restaurant_audit_profile', model, getAuthConfig());
        };
		
		serviceFactory.update_restaurant_audit_profile = function (model) {
            return $http.post(serviceBase + 'inventory/update_restaurant_audit_profile', model, getAuthConfig());
        };
		
		serviceFactory.get_restaurant_audit_schedule = function (model) {
            return $http.post(serviceBase + 'inventory/get_restaurant_audit_schedule', model, getAuthConfig());
        };
		
		serviceFactory.get_audit_details = function (model) {
            return $http.post(serviceBase + 'inventory/get_audit_details', model, getAuthConfig());
        };
		
		serviceFactory.get_auditors = function (model) {
            return $http.post(serviceBase + 'inventory/get_auditors', model, getAuthConfig());
        };
		
		serviceFactory.update_audit_details = function (model) {
            return $http.post(serviceBase + 'inventory/update_audit_details', model, getAuthConfig());
        };
		
		serviceFactory.get_auditor_transaction_summary = function (model) {
            return $http.post(serviceBase + 'inventory/get_auditor_transaction_summary', model, getAuthConfig());
        };
		
		serviceFactory.get_auditor_schedule = function (model) {
            return $http.post(serviceBase + 'inventory/get_auditor_schedule', model, getAuthConfig());
        };
		
		serviceFactory.accept_deny_audit = function (model) {
            return $http.post(serviceBase + 'inventory/accept_deny_audit', model, getAuthConfig());
        };
		//schedule audit module
		
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

		serviceFactory.sku_lookup = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'rb/sku_lookup',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };
		
		serviceFactory.item_name_lookup = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'rb/item_name_lookup',
                headers: {
                    'Authorization': appConfig.apiAuthorization
                },
                params: model
            });
        };
		
		serviceFactory.validateSKU = function (model) {
            var auth = $injector.get('auth');
            return $http({
                method: 'GET',
                url: serviceBase + 'rb/validateSKU',
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
		
		serviceFactory.update_sku = function (vendor_sku_id, model) {
            return $http.put(serviceBase + 'vendors/' + vendor_sku_id + '/updateSKU', model, getAuthConfig());
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
		
		serviceFactory.change_mapping_category = function (id, model) {
            return $http.post(serviceBase + 'restaurants/' + id + '/change_mapping_category', model, getAuthConfig());
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

        serviceFactory.get_analytics_answers = function (model) {
            return $http.post(serviceBase + 'restaurants/get_analytics_answers', model, getAuthConfig());
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
		
		serviceFactory.get_last_order = function (model) {
            return $http.post(serviceBase + 'orders/get_last_order', model, getAuthConfig());
        };

        serviceFactory.add_extra_order_items = function (model, id) {
            return $http.post(serviceBase + 'orders/add_extra_order_items/' + id, model, getAuthConfig());
        };

		serviceFactory.update_SKU_item_cost = function (model) {
            return $http.post(serviceBase + 'orders/update_SKU_item_cost', model, getAuthConfig());
        };
		
		serviceFactory.process_draft_order_item = function (model) {
            return $http.post(serviceBase + 'orders/process_draft_order_item/', model, getAuthConfig());
        };
		
		serviceFactory.get_draft_order_items = function (model) {
            return $http.post(serviceBase + 'orders/get_draft_order_items', model, getAuthConfig());
        };
		
		serviceFactory.check_if_invoice_exists = function (id) {
            return $http.get(serviceBase + 'orders/' + id + '/invoice', getAuthConfig());
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

		serviceFactory.get_added_invoices = function (model) {
            return $http.post(serviceBase + 'orders/get_added_invoices', model, getAuthConfig());
        };
		
		serviceFactory.get_par = function (model) {
            return $http.post(serviceBase + 'orders/get_par', model, getAuthConfig());
        };
		
		serviceFactory.update_par = function (model) {
            return $http.post(serviceBase + 'orders/update_par', model, getAuthConfig());
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
		
		serviceFactory.dashboard_summary_items = function (model) {
            return $http.post(serviceBase + 'restaurants/dashboardSummaryItems', model, getAuthConfig());
        };
		
		serviceFactory.sales_and_spendings = function (model) {
            return $http.post(serviceBase + 'restaurants/sales_and_spendings', model, getAuthConfig());
        };
        serviceFactory.lateral_chart_api = function (model) {
            return $http.post(serviceBase + 'restaurants/lateral_chart_api', model, getAuthConfig());
        };
		
		serviceFactory.costChangeCostCompare = function (model) {
            return $http.post(serviceBase + 'restaurants/costChangeCostCompare', model, getAuthConfig());
        };
		
		serviceFactory.costChangeDetails = function (model) {
            return $http.post(serviceBase + 'restaurants/costChangeDetails', model, getAuthConfig());
        };
		
		serviceFactory.pmix = function (model) {
            return $http.post(serviceBase + 'restaurants/pmix', model, getAuthConfig());
        };
		
		serviceFactory.sales_current_to_last_period_report = function (model) {
            return $http.post(serviceBase + 'restaurants/sales_current_to_last_period_report', model, getAuthConfig());
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
        serviceFactory.alcoholCostSummary = function (model) {
            return $http.post(serviceBase + 'restaurants/alcoholCostSummary', model, getAuthConfig());
        };
        serviceFactory.MonthlySales = function (model) {
            return $http.post(serviceBase + 'restaurants/MonthlySales', model, getAuthConfig());
        };
        serviceFactory.summary_api = function (model) {
            return $http.post(serviceBase + 'restaurants/summary_api', model, getAuthConfig());
        };
         serviceFactory.PurchaseVsUsage = function (model) {
            return $http.post(serviceBase + 'restaurants/PurchaseVsUsage', model, getAuthConfig());
        };
         serviceFactory.VendorDetail = function (model) {
            return $http.post(serviceBase + 'restaurants/VendorDetail', model, getAuthConfig());
        };
        serviceFactory.salesInventory = function (model) {
            return $http.post(serviceBase + 'restaurants/salesInventory', model, getAuthConfig());
        };
        serviceFactory.Item = function (model) {
            return $http.post(serviceBase + 'restaurants/Item', model, getAuthConfig());
        };
        serviceFactory.salesSummary = function (model) {
            return $http.post(serviceBase + 'restaurants/salesSummary', model, getAuthConfig());
        };
         serviceFactory.sku_table = function (model) {
            return $http.post(serviceBase + 'restaurants/sku_table', model, getAuthConfig());
        };
		serviceFactory.locations_report = function (model) {
            return $http.post(serviceBase + 'restaurants/locations_report', model, getAuthConfig());
        };
		serviceFactory.audit_trend_report = function (model) {
            return $http.post(serviceBase + 'restaurants/audit_trend_report', model, getAuthConfig());
        };
		serviceFactory.performance_score_detail = function (model) {
            return $http.post(serviceBase + 'restaurants/performance_score_detail', model, getAuthConfig());
        };
		serviceFactory.food_performance_score_detail = function (model) {
            return $http.post(serviceBase + 'restaurants/food_performance_score_detail', model, getAuthConfig());
        };
		
		serviceFactory.create_missing_menus = function (model) {
            return $http.post(serviceBase + 'system/create_missing_menus/', model, getAuthConfig());
        };
		
		serviceFactory.act_deact_menu_item = function (model) {
            return $http.post(serviceBase + 'menus/act_deact_menu_item/', model, getAuthConfig());
        };
		
		serviceFactory.food_OH = function (model) {
            return $http.post(serviceBase + 'restaurants/Food_OH', model, getAuthConfig());
        };
		
		serviceFactory.batch_OH = function (model) {
            return $http.post(serviceBase + 'restaurants/batch_OH', model, getAuthConfig());
        };
		
		serviceFactory.waste_report = function (model) {
            return $http.post(serviceBase + 'restaurants/waste_report', model, getAuthConfig());
        };
		
		serviceFactory.get_active_SKU_categories = function (model) {
			return $http.post(serviceBase + 'restaurants/active_SKU_categories', model, getAuthConfig());
        };
		
		serviceFactory.checkForSummarizedSales = function (model) {
			return $http.post(serviceBase + 'restaurants/checkForSummarizedSales', model, getAuthConfig());
        };
		
		serviceFactory.compsetReport_avg_sales = function (model) {
			return $http.post(serviceBase + 'restaurants/compsetReport_avg_sales', model, getAuthConfig());
        };
		
		serviceFactory.compsetReport_daily_sales = function (model) {
			return $http.post(serviceBase + 'restaurants/compsetReport_daily_sales', model, getAuthConfig());
        };
		
		serviceFactory.compsetReport_day_of_week_avg_sales = function (model) {
			return $http.post(serviceBase + 'restaurants/compsetReport_day_of_week_avg_sales', model, getAuthConfig());
        };
		
		serviceFactory.compsetReport_holiday = function (model) {
			return $http.post(serviceBase + 'restaurants/compsetReport_holiday', model, getAuthConfig());
        };
		
		serviceFactory.compsetReport_projected_summary = function (model) {
			return $http.post(serviceBase + 'restaurants/compsetReport_projected_summary', model, getAuthConfig());
        };
		
		serviceFactory.compsetReport_shared_budget = function (model) {
			return $http.post(serviceBase + 'restaurants/compsetReport_shared_budget', model, getAuthConfig());
        };
		
		serviceFactory.save_Other_POS_details = function (model) {
			return $http.post(serviceBase + 'restaurants/save_Other_POS_details', model, getAuthConfig());
        };
		
		serviceFactory.compareRestaurants_lineSales = function (model) {
			return $http.post(serviceBase + 'restaurants/compareRestaurants_lineSales', model, getAuthConfig());
        };
		
		serviceFactory.compareRestaurants_tableSnS = function (model) {
			return $http.post(serviceBase + 'restaurants/compareRestaurants_tableSnS', model, getAuthConfig());
        };
		
		serviceFactory.compareRestaurants_donutScores = function (model) {
			return $http.post(serviceBase + 'restaurants/compareRestaurants_donutScores', model, getAuthConfig());
        };
		
		serviceFactory.compareRestaurants_unitCost = function (model) {
			return $http.post(serviceBase + 'restaurants/compareRestaurants_unitCost', model, getAuthConfig());
        };

        serviceFactory.compareRestaurants_unitPurchased = function (model) {
            return $http.post(serviceBase + 'restaurants/compareRestaurants_unitPurchased', model, getAuthConfig());
        };

        serviceFactory.compareRestaurants_totalPurchase = function (model) {
            return $http.post(serviceBase + 'restaurants/compareRestaurants_totalPurchase', model, getAuthConfig());
        };

        serviceFactory.compareRestaurants_unitSales = function (model) {
            return $http.post(serviceBase + 'restaurants/compareRestaurants_unitSales', model, getAuthConfig());
        };

        serviceFactory.compareRestaurants_retailPrice = function (model) {
            return $http.post(serviceBase + 'restaurants/compareRestaurants_retailPrice', model, getAuthConfig());
        };

        serviceFactory.compareRestaurants_getMapping = function (model) {
            return $http.post(serviceBase + 'restaurants/compareRestaurants_getMapping', model, getAuthConfig());
        };
		
		serviceFactory.compareRestaurants_saveMapping = function (model) {
            return $http.post(serviceBase + 'restaurants/compareRestaurants_saveMapping', model, getAuthConfig());
        };
		
		serviceFactory.getExpenses = function (model) {
            return $http.post(serviceBase + 'accounting/getExpenses', model, getAuthConfig());
        };
		
		serviceFactory.update_expenses = function (model) {
            return $http.put(serviceBase + 'accounting/expenses', model, getAuthConfig());
        };
		
		serviceFactory.get_net_profit = function (model) {
            return $http.post(serviceBase + 'accounting/get_net_profit', model, getAuthConfig());
        };
		
		//email endpoints
		serviceFactory.on_hand_email = function (model) {
            return $http.post(serviceBase + 'system/on_hand_email/', model, getAuthConfig());
        };
		
		serviceFactory.food_on_hand_email = function (model) {
            return $http.post(serviceBase + 'system/food_on_hand_email/', model, getAuthConfig());
        };
		
		serviceFactory.send_free_calc_email = function (model) {
            return $http.post(serviceBase + 'system/food_calc_email/', model, getAuthConfig());
        };
		
		//email endpoints
        return serviceFactory;
    };

    api.$inject = ['appConfig', '$http', '$injector'];
    angular.module('inspinia').factory('api', api);

})();
