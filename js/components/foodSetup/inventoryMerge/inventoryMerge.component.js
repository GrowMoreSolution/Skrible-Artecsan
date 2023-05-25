(function () {
    'use strict';
	
	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Merge/Edit/Delete Items Help';
						
		that.q_texts = '<article style="display: block;"><p><b>Merge/Edit/Delete Items</b> – Please check out our instruction video <a href="https://youtu.be/C9oPlIVl4nI" target="_blank">here</a>.</li></ul></p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
    function inventoryMergeController(api, $state, auth, localStorageService, alertService, SweetAlert, $rootScope, restaurant, $uibModal, core, $scope, $q) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;


        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }


        that.inventoryList = [];
        that.vendors = [];
        //that.inventoryListSelected = [];
        that.currentVendor = null;
        that.searchModel = {
            order_by: 'item_name', // id, name, city, date, zip
            order_way: "ASC",  //ASC/DESC
            //paginationOffset: 0, // 0 by default
            //paginationCount: 25, //25 by default,
            inRequest: false,
            paginationTotal: 0,

            city: null,
            item_name: null,
            sub_category: null,
            vendor_sku: null,
            filter: 'any',
            category: null
        };

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });
		
		that.showInfo = function () {
			//Quick tutorial
			var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'quick_tutorial.html',
					controller: qt,
					controllerAs: 'qt',
					windowClass: "animated fadeIn modal-lgg",
					size: 'lg'
			});
			//Quick tutorial
		}
		
		that.chkIfSubSelected = function ($index) {
			var e_type = 0;
			var parent_name = "";
			var child_list = [];
			for (var i = 0; that.inventoryList.length > i; i++) {
				if((that.inventoryList[i].id == that.inventoryList[$index].substitute_for) && that.inventoryList[i].substitute_for != null){
					e_type = 1;
					child_list.push(that.inventoryList[i]);
					that.inventoryList[$index].substitute_for = null;
					break;
				}
			}
			if(e_type == 0){
				for (var i = 0; that.inventoryItemsForSubCheck.length > i; i++) {
					if(that.inventoryList[$index].id == that.inventoryItemsForSubCheck[i].substitute_for)
					{
						e_type = 2;
						parent_name = that.inventoryList[$index].item_name;
						child_list.push(that.inventoryItemsForSubCheck[i]);
						that.inventoryList[$index].substitute_for = null;
					}
				}
			}
			
			
			if(e_type == 0){
				for (var i =0; i< that.inventoryItems.length; i++) {
					if(that.inventoryList[$index].substitute_for == that.inventoryItems[i].id){
						if(that.inventoryList[$index].uom_id_of_delivery_unit == 10 || that.inventoryList[$index].uom_id_of_delivery_unit == 11 || that.inventoryList[$index].uom_id_of_delivery_unit == 12 || that.inventoryList[$index].uom_id_of_delivery_unit == 13 || that.inventoryList[$index].uom_id_of_delivery_unit == 16 || that.inventoryList[$index].uom_id_of_delivery_unit == 17 || that.inventoryList[$index].uom_id_of_delivery_unit == 18){
							if(!(that.inventoryItems[i].uom_id_of_delivery_unit == 10 || that.inventoryItems[i].uom_id_of_delivery_unit == 11 || that.inventoryItems[i].uom_id_of_delivery_unit == 12 || that.inventoryItems[i].uom_id_of_delivery_unit == 13 || that.inventoryItems[i].uom_id_of_delivery_unit == 16 || that.inventoryItems[i].uom_id_of_delivery_unit == 17 || that.inventoryItems[i].uom_id_of_delivery_unit == 18)){
								e_type = 3;
								that.inventoryList[$index].substitute_for = null;
							}
						}
						else{
							if(that.inventoryItems[i].uom_id_of_delivery_unit == 10 || that.inventoryItems[i].uom_id_of_delivery_unit == 11 || that.inventoryItems[i].uom_id_of_delivery_unit == 12 || that.inventoryItems[i].uom_id_of_delivery_unit == 13 || that.inventoryItems[i].uom_id_of_delivery_unit == 16 || that.inventoryItems[i].uom_id_of_delivery_unit == 17 || that.inventoryItems[i].uom_id_of_delivery_unit == 18){
								e_type = 3;
								that.inventoryList[$index].substitute_for = null;
							}
						}
						break;
					}
				}
			}
			if(e_type == 1){
				swal({
					title: "Error! "+child_list.map(function(x){return x.item_name}).join("\n")+ " is already a substitute item.",
					type: "error"
				});
			}
			else if(e_type == 2){
				swal({
					title: "Error! "+parent_name+ " is already a primary item of the following.",
					text: child_list.map(function(x){return x.vendor_name+" - "+x.item_name+" - "+(x.is_used == 1 ? "(Active)" : "(Inactive)")}).join("\n"),
					type: "error"
				});
			}
			else if(e_type == 3){
				swal({
					title: "Error! Delivery types of the items are incompatible.",
					type: "error"
				});
			}
		}
		
		that.filterItems = function (id, cat_id) {
			if (!cat_id) return [];
			
			var _a = [];
			
            for (var i =0; i< that.inventoryItems.length; i++) {
                if(that.inventoryItems[i].id != id && that.inventoryItems[i].vendor_cat_id == cat_id){
					_a.push(that.inventoryItems[i])
                }
            }

			if(_a.length){
				var first = JSON.stringify(_a[0]);
				_a.unshift(JSON.parse(first));
				_a[0]['id'] = null;
				_a[0]['vendor_name'] = '--No selection--';
				_a[0]['item_name'] = '--No selection--';
			}
			
            return _a;
        };

		that.actInactItem = function (inventory) {
            var id = that.restaurant_id.restaurant_id;

            var m = {
                vendor_id: that.currentVendor.id,
                sku_id: inventory.id,
                is_active: that.activate_mode == 'active' ? 0 : 1,
                inventory_type_id: 1,
				action: 'update'
            };

            that.api.add_inventory(id, m).then(function (res) {
				try {
					if (res.data.data.code === 1000) {
						swal({
							title: "Updated!",
							timer: 1500,
							showConfirmButton: false,
							type: "success"
						  });
					}
					else{
						if (res.data.data.code.code === 2079) {
							swal({
								title: "Can't perform this action as this item is attached to the following recipes. To make this item inactive you must first visit the recipe screen and either replace the item in the recipe or make the recipe(s) inactive.",
								text: ""+res.data.data.code.res_data.map(function(x){return x.recipe_name+""}).join("\n"),
								type: "error"
							});
						}
						else if (res.data.data.code.code === 2081 || res.data.data.code.code === 2082) {
							swal({
								title: "Cannot perform this action as this is a primary item of the below listed items. To make this item inactive you will need to either remove the attached items or make the attached items inactive.",
								text: ""+res.data.data.code.res_data.map(function(x){return x.child_name}).join("\n"),
								type: "error"
							});
						}
					}
					that.search(false, false);
				} 
				catch (e) {
					console.log(e)
				}
            });

        };
		
		that.deleteItem = function (inventory) {
            var id = that.restaurant_id.restaurant_id;

            var m = {
                vendor_id: that.currentVendor.id,
                sku_id: inventory.id,
                is_active: 0,
                inventory_type_id: 1,
				action: 'delete'
            };

            that.api.add_inventory(id, m).then(function (res) {
                try {
					if (res.data.data.code === 1000) {
						swal({
							title: "Updated!",
							timer: 1500,
							showConfirmButton: false,
							type: "success"
						  });
					}
					else if(res.data.data.code === 2080){
						swal({
							title: "This item has historical data and therefore cannot be deleted. You may instead, make this item inactive.",
							type: "error"
						});
					}
					else{
						if (res.data.data.code.code === 2079) {
							swal({
								title: "Can't perform this action as this item is attached to the following recipes. To make this item inactive you must first visit the recipe screen and either replace the item in the recipe or make the recipe(s) inactive.",
								text: ""+res.data.data.code.res_data.map(function(x){return x.menu_item_name+" ("+x.pricing_level+")"}).join("\n"),
								type: "error"
							});
						}
						else if (res.data.data.code.code === 2081 || res.data.data.code.code === 2082) {
							swal({
								title: "Cannot perform this action as this is a primary item of the below listed items. To make this item inactive you will need to either remove the attached items or make the attached items inactive.",
								text: ""+res.data.data.code.res_data.map(function(x){return x.child_name}).join("\n"),
								type: "error"
							});
						}
					}
					that.search(false, false);
				} 
				catch (e) {
					console.log(e)
				}
            });

        };
		
		that.submit = function ($index) {
            var deferred = $q.defer();

            var id = that.currentVendor.id;

            var m = {
                inventory_type_id: 1,
                sku_items: []
            };

			m.sku_items.push({
				substitute_for: that.inventoryList[$index].substitute_for ? that.inventoryList[$index].substitute_for : null,
				item_name: that.inventoryList[$index].item_name,
				tare_type_id: that.inventoryList[$index].tare_type_id,  //tare_type_id, refbooks
				size: that.inventoryList[$index].content_weight || that.inventoryList[$index].size || 1,
				content_weight: that.inventoryList[$index].content_weight || that.inventoryList[$index].size || 1,
				full_weight: that.inventoryList[$index].full_weight,
				tare_weight: that.inventoryList[$index].tare_weight,
				total_unit_size: that.inventoryList[$index].case_qty * that.inventoryList[$index].pack * (that.inventoryList[$index].content_weight || that.inventoryList[$index].size || 1),
				manufacturer: that.inventoryList[$index].manufacturer,
				vendor_sku: that.inventoryList[$index].vendor_sku,
				case_qty: that.inventoryList[$index].case_qty,
				pack: that.inventoryList[$index].pack,
				//price: that.inventoryList[$index].minimum_order_type == 'Case' ? that.inventoryList[$index].case_cost : that.inventoryList[$index].pack_cost,
				price: that.inventoryList[$index].case_cost,
				vendor_cat_id: that.inventoryList[$index].vendor_cat_id,
				uom_id_of_delivery_unit: that.inventoryList[$index].uom_id_of_delivery_unit,
				vendor_sub_cat_id: that.inventoryList[$index].vendor_sub_cat_id,
				is_active: that.inventoryList[$index].is_active,
				minimum_order_type: that.inventoryList[$index].minimum_order_type,
				id: that.inventoryList[$index].id
			});

            that.api.add_update_own_inventory(id, m).then(function (res) {
                if (res.data.data.code === 1000) {
                    alertService.showAlertSave();
                }
				Promise.all([that.getItemsForSubCheck()]).then(function(response) {
					deferred.resolve();
				});
            });

            return deferred.promise;

        };
		
		that.changeAction = function(){
			if(that.mode == 'merge'){
				getMergeModeData(false);
			}
			else{
				that.activate_mode = 'active';
				getActivateModeData(false);
			}
		}
		
		that.selectActiveInactive = function () {
			that.search(false, false);
		}
		
		that.selectVendor = function (vendor) {
            that.currentVendor = vendor;
            that.search(false, true);
        };
		
		that.search = function (is_category_change, is_vendor_change, keyword) {
            //var deferred = $q.defer();
			that.inventoryList = [];
			that.loading = true;
			that.searchModel.inRequest = true;
		
            var m = {
                order_by: that.searchModel.order_by,
                order_way: that.searchModel.order_way,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount,

                city: that.searchModel.city,
                item_name: that.searchModel.item_name,
                sub_category: that.searchModel.sub_category,
                vendor_sku: that.searchModel.vendor_sku,
                filter: that.searchModel.filter,
                category: is_category_change ? that.searchModel.category : null,
                inventory_type_id: 1
            };

            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                m.paginationOffset = 0;
                if (that.searchModel.order_by == keyword) {
                    that.searchModel.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC';
                    m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.searchModel.order_by = keyword;
                    m.order_by = keyword;
                }
            }
            if (m.paginationOffset > 0 && !keyword) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }

            api.get_inventory_by_vendor(m, that.currentVendor.id).then(function (res) {
				that.loading = false;
				that.searchModel.inRequest = false;
                try {
					that.searchModel.paginationTotal = res.data.data.total;
					//deferred.resolve(res.data.data.sku);
					if(!is_category_change){
						that.inventoryListAll = res.data.data.sku;//response[0];
						var temp_cats = that.inventoryListAll.map(function(x){return x.category});
						var c_set = new Set(temp_cats);
						that.SKU_categories = Array.from(c_set);//.filter(function(x) {return x != 'Non Alcoholic'});
						that.searchModel.category = is_vendor_change ? that.SKU_categories[0] : that.searchModel.category == null ? that.SKU_categories[0] : that.searchModel.category;
						that.inventoryList = that.inventoryListAll.filter(function(x) {return x.category == that.searchModel.category});
					}
					else{
						that.inventoryList = res.data.data.sku;//response[0];
					}
					if(that.mode == 'activate'){
						that.inventoryList = that.inventoryList.filter(function(x) {return x.is_used == (that.activate_mode == 'active' ? 1 : 0)});
					}
					else{
						that.inventoryList = that.inventoryList.filter(function(x) {return x.is_used == 1});
					}

                } 
				catch (e) {
                    console.log(e);
					//deferred.resolve();
                }
            }, function () {
                that.searchModel.inRequest = false;
				//deferred.resolve();
            });
			
            //return deferred.promise;
		}
		
		that.getVendorList = function () {
            var deferred = $q.defer();
			that.api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: 1}).then(function (res) {
				try {
					that.vendors = res.data.data.vendors;
					if (!that.vendors.length) {
						$state.go('foodSetup.vendor');
						return
					}
					that.currentVendor = that.vendors[0];
				} catch (e) {
					console.log(e);
				}
				deferred.resolve();
			})
            return deferred.promise;
		}
		
		that.getItemsForSubCheck = function () {
            var deferred = $q.defer();
			that.api.get_active_inventory_by_vendor({
				inventory_type_id: 1,
				caller: 'sub_list'
			}, that.restaurant_id.restaurant_id).then(function (res) {
				that.inventoryItemsForSubCheck = res.data.data.sku;
				that.inventoryItems = JSON.parse(JSON.stringify(that.inventoryItemsForSubCheck));
				that.inventoryItems = that.inventoryItems.filter(function(x){return x.substitute_for == null});
				
				deferred.resolve();
			});
            return deferred.promise;
		}
		
		var getMergeModeData = function (is_category_change) {
			Promise.all([that.getItemsForSubCheck(), that.getVendorList()]).then(function(response) {
				that.search(is_category_change, true);
			});
		}
		
		var getActivateModeData = function (is_category_change) {
			Promise.all([that.getVendorList()]).then(function(response) {
				that.search(is_category_change, true);
			});
		}
		
        that.$onInit = function () {
			/*if(that.auth.authentication.user.id != 1){
				alert("You are not authorized to use this module!");
				$state.go('foodSubCategories');
			}
			else{
				that.mode = 'merge';
				getMergeModeData(false);
			}*/
			
			//open to all
			that.mode = 'merge';
			getMergeModeData(false);
			//open to all
        };
    }

    inventoryMergeController.$inject = ['api', '$state', 'auth', 'localStorageService', 'alertService', 'SweetAlert', '$rootScope', 'restaurant', '$uibModal', 'core', '$scope', '$q'];

    angular.module('inspinia').component('foodInventoryMergeComponent', {
        templateUrl: 'js/components/foodSetup/inventoryMerge/inventoryMerge.html',
        controller: inventoryMergeController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();