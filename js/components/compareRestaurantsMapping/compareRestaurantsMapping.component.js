(function () {

    'use strict';

    function compareRestaurantsMappingController($state, auth, api, $q, $scope, $filter, $rootScope, alertService, SweetAlert) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

		//temporary access restriction until completion
		/*if (auth.authentication.user.id !== 1 && auth.authentication.user.id !== 80 && auth.authentication.user.id !== 161 && auth.authentication.user.id !== 232) {
			alertService.showError('Access denied!');
            $state.go('home');
            return;
        }*/
		
        var that = this;
		
        that.api = api;
						
		that.r_list = [];
        that.restaurantsList = [];
		that.selectedRestaurants = [];
		that.multiSelectSettings = {selectionLimit: 7, scrollableHeight: '200px', scrollable: true};
		
        that.inventory_category = null;
		that.prev_cat = null;
		that.item_set = [];
		that.mapping_arr = [];
		that.sku_items = {};
		that.finish_save = false;
		
        that.m = {
            order_by: "id",
            order_way: "DESC",  //ASC/DESC
        };
		
		that.validate = function (r_id, item){
			if(that.finish_save){
				item.grid[r_id] = JSON.parse(JSON.stringify(item.grid_copy[r_id]));
				alertService.showError("Please save your previous changes!");
				return;
			}
			
			that.finish_save = true;
			item.need_save = true;
			
			var count = 0;
			for(var m=0; m<that.mapping_arr.length; m++){
				if(item.grid[r_id]!= null && that.mapping_arr[m].grid[r_id] == item.grid[r_id]){
					count++;
				}
			}
			if(count > 1){
				item.grid[r_id] = JSON.parse(JSON.stringify(item.grid_copy[r_id]));
				that.finish_save = false;
				item.need_save = false;
				alertService.showError("This item is already mapped to a SKU!");
				return;
			}
		}
		
		that.saveMapping = function (item) {
			for (var k in item.grid) {
				if(item.grid[k] == null){
					item.grid[k] = -1;
					item.grid_copy[k] = -1;
				}
			}
			api.compareRestaurants_saveMapping(
			{
				item: {v_sku: item.v_sku, grid: item.grid}
			}).then(function (res) {
				item.grid_copy = JSON.parse(JSON.stringify(item.grid));
				that.finish_save = false;
				item.need_save = false;
				alertService.showAlertSave();
			});
		}
		
		that.getSkuItems = function (item, rest_id) {
			return that.sku_items[rest_id];
		}
		
		that.getRestuarants = function (is_init) {
			var ok_to_change = false;
			if(that.prev_cat == null){
				ok_to_change = true;
			}
			else{
				if(that.prev_cat == 'Food'){
					if(that.inventory_category != 'Food'){
						ok_to_change = true;
					}
				}
				else{
					if(that.inventory_category == 'Food'){
						ok_to_change = true;
					}
				}
			}
			
			if(ok_to_change){
				that.prev_cat = that.inventory_category;
			
				var m = {
					caller: 'Compare',
					order_by: that.m.order_by,
					order_way: that.m.order_way
				};

				api.get_restaurants(m).then(function (res) {
					try {
						that.r_list = res.data.data.restaurants_list;    
						var paid_rest = [];
					
						for(var i=0; i<that.r_list.length; i++){
							if((that.r_list[i].subscription_type_id == 5 || that.r_list[i].subscription_type_id == 6 || that.r_list[i].subscription_type_id == 7) && that.r_list[i].is_setup_completed == 1 && that.r_list[i].grant_level == 1){
								paid_rest.push(that.r_list[i]);
							}
						}

						that.r_list = [];
						that.r_list = paid_rest;
						if(that.r_list.length < 2){
							SweetAlert.swal({
								title: "Access Denied!",
								text: "You need to be an Owner/Admin of at least 2 restaurants with paid subscription.",
								type: "warning",
								confirmButtonColor: "#337ab7",
								confirmButtonText: "OK"
							},
							function (res) {
								$state.go('home');
								return;
							});
						}
						else{
							that.r_list.sort(function(a, b) {
								if (a.restaurant_name.toLowerCase() > b.restaurant_name.toLowerCase()) return 1;
								if (a.restaurant_name.toLowerCase() < b.restaurant_name.toLowerCase()) return -1;
							}); 
							
							that.restaurantsList = [];
							for(var i=0; i<that.r_list.length; i++){
								if(that.inventory_category == 'Food'){		//Only food and full service
									if(that.r_list[i].subscription_type_id == 6 || that.r_list[i].subscription_type_id == 7){
										that.restaurantsList.push({id: that.r_list[i].id, label: that.r_list[i].restaurant_name});
									}
								}
								else if(that.inventory_category != 'Food'){	//Only alcohol and full service
									if(that.r_list[i].subscription_type_id == 5 || that.r_list[i].subscription_type_id == 7){
										that.restaurantsList.push({id: that.r_list[i].id, label: that.r_list[i].restaurant_name});
									}
								}
							}
							
							that.selectedRestaurants = that.restaurantsList.length <= 7 ? that.restaurantsList.length ? that.restaurantsList.map(function(r){return r}) : [] : [that.restaurantsList[0], that.restaurantsList[1], that.restaurantsList[2], that.restaurantsList[3], that.restaurantsList[4], that.restaurantsList[5], that.restaurantsList[6]];					
							
							if(is_init){
								that.retriveMergedMapping(is_init);
							}
						}
					} catch (e) {
						console.log(e);
					}
				})
			}
        }

        that.retriveMergedMapping = function (is_init) {
			if(is_init && !that.r_list.length || !that.selectedRestaurants.length){
				return;
			}
			if(!is_init && that.inventory_category == null){
				return;
			}
			
			that.finish_save = false;
			that.loading = 1;
			that.columns = JSON.parse(JSON.stringify(that.selectedRestaurants));
			that.item_set = [];
			that.sku_items = {};
			that.mapping_arr = [];
        	that.api.compareRestaurants_getMapping(
			{
				rest_list: is_init ? that.r_list.map(function(r) {return r.id}) : that.selectedRestaurants.map(function(r) {return r.id}),
				type: that.inventory_category,
				search: is_init ? !is_init : true
			}
			).then(function (res) {
				that.loading = 0;
				if(!is_init){
					that.item_set = res.data.data.result.item_set;
					that.sku_items = res.data.data.result.sku_items;
					var mapping = res.data.data.result.mapping;
					
					for(var i=0; i<that.item_set.length; i++){
						var g = {};
						for(var c=0; c<that.columns.length; c++){
							var found = false;
							for(var m=0; m<mapping.length; m++){
								if(mapping[m].restaurant_id == that.columns[c].id && mapping[m].vendor_sku == that.item_set[i]){
									g[that.columns[c].id] = mapping[m].vendor_sku_id;
									found = true;
									break;
								}
							}
							if(!found){
								g[that.columns[c].id] = null;
							}
						}
						that.mapping_arr.push({v_sku: that.item_set[i], grid: g, grid_copy: JSON.parse(JSON.stringify(g)), need_save: false});
					}
					
				}
            });
        }
		
		that.$onInit = function () {
			that.getRestuarants(true);
			
        };

    }

    compareRestaurantsMappingController.$inject = ['$state', 'auth', 'api', '$q', '$scope', '$filter', '$rootScope', 'alertService', 'SweetAlert'];

    angular.module('inspinia').component('comprestmap', {
        templateUrl: 'js/components/compareRestaurantsMapping/compareRestaurantsMapping.html',
        controller: compareRestaurantsMappingController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();