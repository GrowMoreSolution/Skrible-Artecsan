(function () {
    'use strict';

    function setParController(api, $state, auth, core, localStorageService, alertService, SweetAlert, restaurant, $rootScope, $scope, $q) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;
		that.processed_par_items = [];

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions;
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return;
        }

		that.setDirty = function () {
			that.dataChanged = true;
		}
		
		that.goToOrder = function () {
			$state.go('food.newFoodOrder');
		}
		
		that.processPar = function () {
			that.processed_par_items = [];
			for(var pd in that.par_data){
				var pdi = that.par_data[pd];
				if(pdi.substitute_for == null){
					pdi.bu_minimum_order_type = pdi.minimum_order_type.substr();
					pdi.show_minimum_order_type = pdi.minimum_order_type.substr() != 'Each' ? pdi.minimum_order_type.substr() : pdi.uod;
					
					if(pdi.minimum_order_type == 'Case'){
						pdi.suggested_par_units = Math.ceil(pdi.suggested_par_units / (pdi.pack * pdi.size));
					}
					else if(pdi.minimum_order_type == 'Pack'){
						pdi.suggested_par_units = Math.ceil(pdi.suggested_par_units / pdi.size);
					}
					
					if(pdi.actual_order_unit != pdi.minimum_order_type && pdi.actual_par_units != null){
						if(pdi.minimum_order_type == 'Case'){
							if(pdi.actual_order_unit == 'Pack'){
								pdi.actual_par_units = Math.ceil(pdi.actual_par_units / (pdi.pack));
							}
							else{
								pdi.actual_par_units = Math.ceil(pdi.actual_par_units / (pdi.pack * pdi.size));
							}
						}
						else if(pdi.minimum_order_type == 'Pack'){
							if(pdi.actual_order_unit == 'Case'){
								pdi.actual_par_units = Math.ceil(pdi.actual_par_units * pdi.pack);
							}
							else{
								pdi.actual_par_units = Math.ceil(pdi.actual_par_units / pdi.size);
							}
						}
						else{
							if(pdi.actual_order_unit == 'Case'){
								pdi.actual_par_units = Math.ceil(pdi.actual_par_units * pdi.pack * pdi.size);
							}
							else{
								pdi.actual_par_units = Math.ceil(pdi.actual_par_units * pdi.size);
							}
						}
					}
					pdi.units_on_hand = 'Loading...';
					that.processed_par_items.push(pdi);
				}
			}
			
		}
		
		that.checkCount = function (item) {
			if(item.alert_if_low == 1){
				if(that.count_limit < 1){
					swal({
						title: "Limit reached! Please uncheck some items first.",
						timer: 3000,
						showConfirmButton: false,
						type: "warning"
					  });
					item.alert_if_low = 0;
				}
				else{
					that.count_limit--;
				}
			}
			else{
				that.count_limit++;
			}
		}
		
		that.getData = function () {
			that.loading = true;
			Promise.all([that.getParData()]).then(function(response) {
				that.getOH();
				that.getSuggestedOrder();
			});
		}
		
		that.getOH = function () {		
			that.api.food_OH({'RestaurantId': that.restaurant_id.restaurant_id, 'Category': that.category, 'caller': 'oh_report'}).then(function (res) {
				if(res){
					that.oh_table_data = res.data.data.Report;
					for(var pt in that.processed_par_items){
						var found_item = false;
						for(var ot in that.oh_table_data){
							if(that.oh_table_data[ot].vendor_sku_id == that.processed_par_items[pt].vendor_sku_id){
								that.processed_par_items[pt].units_on_hand = that.oh_table_data[ot].total_uod_on_hand;
								found_item = true;
								break;
							}
							if(!found_item){
								that.processed_par_items[pt].units_on_hand = 'N/A';
							}
						}
					}
				}
				that.loading = false;
            });
		}
		
		that.getSuggestedOrder = function () {
			that.api.get_suggested_orders({"RestaurantId": that.restaurant_id.restaurant_id, 'inventory_type_id': 1}).then(function (res) {
				if(res){
					that.suggested_table_data = res.data.data.Report;
					for(var pt in that.processed_par_items){
						for(var ot in that.suggested_table_data){
							if(that.suggested_table_data[ot].vendor_sku_id == that.processed_par_items[pt].vendor_sku_id){
								that.processed_par_items[pt].suggested_amount = that.suggested_table_data[ot].suggested_amount;
								that.processed_par_items[pt].suggested_order_type = that.suggested_table_data[ot].suggested_order_type;
								break;
							}
						}
					}
				}
			});
		}
		
        that.getParData = function () {
			var deferred = $q.defer();
			that.count_limit = 100;	 //set to custom limit as per Skrible requirements
			if(that.dataChanged){
				//show sweet 
				SweetAlert.swal({
                    title: "Are you sure?",
                    text: "Unsaved changes will be lost if you change the category.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ed5565",
                    confirmButtonText: "OK"
                },
                function (sres) {
					if (sres) {
						that.dataChanged = false;
						that.api.get_par({'category': that.category, 'inventory_type_id': 1, 'get_notif_status': true}).then(function (res) {
							if (res) {
								that.par_data = res.data.data.pars;
								that.count_limit = (!isNaN(res.data.data.notif_count)) ? that.count_limit - res.data.data.notif_count : 0;
								that.processPar();
							}
							deferred.resolve();
						});
					}
                });
			}
			else{
				that.api.get_par({'category': that.category, 'inventory_type_id': 1, 'get_notif_status': true}).then(function (res) {
					if (res) {
						that.par_data = res.data.data.pars;
						that.count_limit = (!isNaN(res.data.data.notif_count)) ? that.count_limit - res.data.data.notif_count : 0;
						that.processPar();
					}
					deferred.resolve();
				});
			}
			return deferred.promise;
        }
		
		that.saveActualPar = function () {
			that.api.update_par({'inventory_type_id': 1, 'pars_data': that.par_data.map(function (x) {return {vendor_sku_id: x.vendor_sku_id, actual_par_units: x.actual_par_units, order_unit: x.bu_minimum_order_type, alert_if_low: x.alert_if_low, notify_units: x.notify_units}})}).then(function (res) {
				if (res && res.data.data.code == 1000) {
					that.dataChanged = false;
					alertService.showAlertSave();
                }
				else{
					alertService.showError('Something went wrong!');
				}
			});
		}

        that.$onInit = function () {
            that.api.get_active_SKU_categories({'inventory_type_id': 1}).then(function (res) {
				that.SKU_categories = res.data.data.categories;
				if(that.SKU_categories.length){
					that.category = that.SKU_categories[0].category;
					that.dataChanged = false;
					that.getData();
				}
			});
        };
    }

    setParController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService', 'alertService', 'SweetAlert', 'restaurant', '$rootScope', '$scope', '$q'];

    angular.module('inspinia').component('setFoodParComponent', {
        templateUrl: 'js/components/foodSetup/setPar/setPar.html',
        controller: setParController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
