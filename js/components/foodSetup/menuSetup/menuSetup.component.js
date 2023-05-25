(function () {
    'use strict';

    function modalController($uibModal, $uibModalInstance, $state, menu, filtered_menus, rest_id, get_refbooks, recipes_list, alertService, SweetAlert, api) {


        var that = this;
		that.$state = $state;
		
        that.form = {};

        that.recipes = recipes_list;
        that.get_refbooks = get_refbooks;
        that.menu = menu;
		that.filtered_menus = filtered_menus;
		that.rest_id = rest_id;
		that.mindex = 0;
        that.api = api;
		that.stdisable = menu;
		that.savename = null;
        that.savelevel = null;
        that.savePL1 = null;
        that.default_note = " Hover the mouse pointer over the form field headings to display their purpose.";
        that.current_note = that.default_note;
        that.notes = {
          min: "Please enter the menu item name EXACTLY as it appears in your POS. To add your ingredients please select the plus symbol below the Ingredients header below.",
          pl: "Your P.O.S. normally has pricing levels for each Menu Item which can be used for discounts and drink special. Your default pricing level is usually pricing level 1 however if your restaurant uses multiple pricing level please select the level to match your POS. If you do not use pricing levels please select a 0.",
          price: "Please enter the correct retail price that matches the menu item name and price level in your POS.",
          cp: "Represents your cost percentage for this menu item.",
          tc: "Represents your total dollar cost for this menu item.",
		  r: "Please select the plus symbol below and to the right. Here you will add your recipes for the menu item. The recipes will include the name, serving type, recipe amount, total servings and recipe cost.",
		  rname: "The recipes you created in the previous step are populated and can be used here.",
          rst: "This shows if the selected recipe is a single or batch serving.",
          ra: "Please select how much portion out of the total servings of the recipe you want to use in this menu item.",
          rts: "This shows the total servings the recipe can offer.",
          rcost: "Total recipe cost based on recipe amount and cost.",
          c: "You may also add comment to each menu item."
        };

        that.all_pricing_levels = [{"name": 0,"level": "0"}, {"name": 1,"level": "1"},{"name": 2,"level": "2"},{"name": 3,"level": "3"},{"name": 4,"level": "4"},{"name": 5,"level": "5"},{"name": 6,"level": "6"},{"name": 7,"level": "7"},{"name": 8,"level": "8"},{"name": 9,"level": "9"},{"name": 10,"level": "10"}];

        that.selected_pricing_level = that.all_pricing_levels[0].name;

        that.model = {
            menu_item_name: that.menu ? that.menu.menu_item_name : null,
			pricing_level: that.menu ? that.menu.pricing_level : 1,
            description: that.menu ? that.menu.description : null,
            price: that.menu ? that.menu.price : null,
            cost_margin: that.menu ? that.menu.cost_margin : null,
            cost: that.menu ? that.menu.cost : null,
            menu_items: []
        };

		that.reset_mindex = function () {
			if(menu){
				for(var i=0;i<that.filtered_menus.length;i++){
					if(that.menu.id == that.filtered_menus[i].id){
						that.mindex = i;
						break;
					}
				}
			}
		}
		that.reset_mindex();
		
		that.reset_model = function () {
          that.model.menu_item_name = null;
          that.model.pricing_level = 1;
          that.model.price = null;
          that.model.cost_margin = 0;
          that.model.cost = 0;
          that.model.description = null;
          that.model.menu_items = [];
          that.selected_pricing_level = 1;
          that.savePL1 = null;
        };
		
        that.savePL1 = that.model.menu_item_name;
        that.selected_pricing_level = that.model.pricing_level;
		
		that.setMenuItems = function(){
			if (that.menu) {
				if (that.menu.menu_items) {

					for (var j = 0; that.recipes.length > j; j++) {

						for (var i = 0; that.menu.menu_items.length > i; i++) {

							if (that.menu.menu_items[i].recipe_id === that.recipes[j].id) {
								var rec = that.recipes[j];
								rec.recipes_amount = that.menu.menu_items[i].recipes_amount;
								rec.total_cost = that.recipes[j].cost * (rec.recipes_amount / rec.servings) ;
								rec.total_cost = Math.round(rec.total_cost * 1000) / 1000;
								that.model.menu_items.push({
									bu_r: rec,
									recipe: rec,
									cost: that.menu.menu_items[i].cost,
									id: that.menu.menu_items[i].id,
									time: new Date().getTime() + i// fix ng-repeat
								});

							}
						}

					}

				}
			}
		}
		that.setMenuItems();
		
		that.update_note = function (key) {
          that.current_note = " "+that.notes[key];
        }

        that.reset_note = function () {
          that.current_note = that.default_note;
        }
		
		that.prev_menu_item = function () {
			//console.log(that.filtered_menus);
			//console.log(that.menu);
			if(that.mindex != 0){
				that.mindex--;
				that.api.get_menu_by_id(that.filtered_menus[that.mindex].id).then(function (res) {
					that.reset_model();
					that.menu = res.data.data.menus_list[0];
					that.model = {
						menu_item_name: that.menu ? that.menu.menu_item_name : null,
						pricing_level: that.menu ? that.menu.pricing_level : 1,
						category: that.menu ? that.menu.category : null,
						price: that.menu ? that.menu.price : null,
						cost_margin: that.menu ? that.menu.cost_margin : 0,
						cost: that.menu ? that.menu.cost : 0,
						description: that.menu ? that.menu.description : null,
						menu_items: []
					};
					that.setMenuItems();
					that.savePL1 = that.model.menu_item_name;
					that.selected_pricing_level = that.model.pricing_level;
				});
			}
			
        }

		that.next_menu_item = function () {
			if(that.mindex != that.filtered_menus.length-1){
				that.mindex++;
				that.api.get_menu_by_id(that.filtered_menus[that.mindex].id).then(function (res) {
					that.reset_model();
					that.menu = res.data.data.menus_list[0];
					that.model = {
						menu_item_name: that.menu ? that.menu.menu_item_name : null,
						pricing_level: that.menu ? that.menu.pricing_level : 1,
						category: that.menu ? that.menu.category : null,
						price: that.menu ? that.menu.price : null,
						cost_margin: that.menu ? that.menu.cost_margin : 0,
						cost: that.menu ? that.menu.cost : 0,
						description: that.menu ? that.menu.description : null,
						menu_items: []
					};
					that.setMenuItems();
					that.savePL1 = that.model.menu_item_name;
					that.selected_pricing_level = that.model.pricing_level;
				});
			}
		}
		
		that.delete_current = function () {
          that.api.get_menu_by_name_and_pricing_level(that.model.menu_item_name+'&'+that.selected_pricing_level).then(function (res) {
              var len = res.data.data.menus_list.length;
              var del_item = res.data.data.menus_list[0];
			  
              if(len == 1)        //that PL was found
              {
                swal({
                        title: "Are you sure?",
                        text: "This menu will be deleted",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ed5565",
                        confirmButtonText: "Confirm"
                    },
                    function (res) {
                        if (res) {
                            that.api.delete_menu(del_item.id).then(that.update_details);
                        }
                    });

              }
              else if(len == 0)       //that PL was not found
              {
                  swal({
                    title: "Nothing to delete!",
                    timer: 1500,
                    showConfirmButton: false,
                    type: "warning"
                  });
              }
          });
        };
		
		
		that.update_details = function() {
            that.savename = that.model.menu_item_name;
            that.savelevel = that.selected_pricing_level;
			
            that.api.get_menu_by_name_and_pricing_level(that.model.menu_item_name+'&'+that.selected_pricing_level).then(function (res) {
                var len = res.data.data.menus_list.length;
                var edit_item = res.data.data.menus_list[0];

                if(len == 1)        //that PL was found
                {
					that.stdisable = true;
                    that.model.price = edit_item.price;
                    that.model.cost_margin = edit_item.cost_margin
                    that.model.cost = edit_item.cost;
                    //that.model.menu_items = edit_item.menu_items;
                    if (edit_item.menu_items) {
						for (var j = 0; that.recipes.length > j; j++) {
							for (var i = 0; edit_item.menu_items.length > i; i++) {
								if (edit_item.menu_items[i].recipe_id === that.recipes[j].id) {
									that.model.menu_items.push({
										recipe: that.recipes[j],
										cost: edit_item.menu_items[i].cost,
										id: edit_item.menu_items[i].id,
										time: new Date().getTime() + i// fix ng-repeat
									});
								}
							}
						}
					}
                    that.model.description = edit_item.description;
                }
                else if(len == 0)       //that PL was not found
                {
                  that.stdisable = false;
                    that.reset_model();
                    that.model.menu_item_name = that.savename;
                    that.model.pricing_level = that.savelevel;
                    that.selected_pricing_level = that.savelevel;
                }
            });
        };

        that.addRecipe = function () {
            that.model.menu_items.push({
                recipe: null,
                cost: null,
                time: new Date().getTime() // fix ng-repeat
            })
        };

        that.countCost = function (r) {
			var is_insert_new_inv = false;
			if(typeof r != 'undefined'){
				if(r.recipe.id == -2){
					that.$state.go('foodSetup.recipe');
				}
				else if(r.recipe.id == -1){
					is_insert_new_inv = true;
					r.recipe = r.bu_r ? r.bu_r : null;
				}
			}
			if(typeof r != 'undefined'){
				r.bu_r = r.recipe;
			}

            var sum = 0;
            for (var i = 0; that.model.menu_items.length > i; i++) {
                if (that.model.menu_items[i].recipe != null) {
					if(that.model.menu_items[i].recipe.recipe_type_id == 4){
						that.model.menu_items[i].recipe.recipes_amount = that.model.menu_items[i].recipe.servings;
					}
					that.model.menu_items[i].recipe.total_cost = that.model.menu_items[i].recipe.cost * (that.model.menu_items[i].recipe.recipes_amount / that.model.menu_items[i].recipe.servings);
					that.model.menu_items[i].recipe.total_cost = Math.round(that.model.menu_items[i].recipe.total_cost * 1000) / 1000;
                    sum += that.model.menu_items[i].recipe.total_cost;
                }
            }

            that.model.cost = parseFloat((sum).toFixed(2));

            that.model.cost_margin = parseFloat(((that.model.cost / that.model.price) * 100).toFixed(2));

            // that.model.cost_margin = parseFloat((that.model.price - that.model.cost).toFixed(2));
			
			if(is_insert_new_inv){
				SweetAlert.swal({
					title: "Discard Progress?",
					text: "This will open a new window and you may lose your progress. Go back to save your progress or proceed",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#ed5565",
					confirmButtonText: "Discard Progress & Continue",
					cancelButtonText: "Go Back"
				},
				function (res) {
					if (res) {
						$uibModalInstance.dismiss('cancel');
						//open modal
						var modalInstance = $uibModal.open({
							templateUrl: 'add_new_food_inventory_item.html',
							controller: newFoodItem_modalController,
							windowClass: "animated fadeIn modal-lgg",
							controllerAs: '$ctr',
							size: 'lg2x',
							resolve: {
								vendor_list: function () {
									if (that.vendors) return that.vendors;
									return that.api.get_chosen_vendors(that.rest_id, {vendor_type_id: 1}).then(function (res) {
										return that.vendors = res.data.data.vendors;
									})
								},
								inventory_type_id: function () {
									return 1;
								},
								restaurant_id: function () {
									return that.rest_id;
								}
							}
						});
					}
					//
				});
			}

        };

        that.remove = function ($index) {
            that.model.menu_items.splice($index, 1);
            if (that.model.menu_items.length) {
                that.countCost($index)
            }
        };

        that.submit = function (form) {

            if (!that.model.menu_items.length) {
                alertService.showError('Please add at least one recipe');
                return
            }

            if (!form.$valid) {
                return
            }

            var m = {
                inventory_type_id: 1,
                menu_item_name: that.model.menu_item_name,
				pricing_level: that.selected_pricing_level,
				category: 'Food',
                description: that.model.description,
                price: that.model.price,
                cost_margin: that.model.cost_margin,
                cost: that.model.cost,
                menu_items: []
            };

            for (var i = 0; that.model.menu_items.length > i; i++) {
                m.menu_items.push({
                    recipe_id: that.model.menu_items[i].recipe.id,
                    id: that.model.menu_items[i].id,
                    cost: that.model.menu_items[i].recipe.total_cost,
					recipes_amount: that.model.menu_items[i].recipe.recipes_amount
                })
            }
			
			if((that.savePL1 != that.model.menu_item_name) && (that.savePL1 != null))     //update name of the menu and cascade to all of its PLs.
            {
                // update PL1 to new name
                that.api.update_menu(that.menu.id, m).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
                          swal({
                            title: "Menu Item updated successfully!",
                            timer: 1500,
                            showConfirmButton: false,
                            type: "success"
                          });

                            //$uibModalInstance.close();
                            //ADD POP UP INFO MESSAGES
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            }
			else {        //update other values of the menu item
            // create
            if (!that.stdisable) {
                that.api.save_menu(m).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
                          swal({
                            title: "New Menu Item created successfully!",
                            timer: 1500,
                            showConfirmButton: false,
                            type: "success"
                          });
                          //$uibModalInstance.close();
                            //ADD POP UP INFO MESSAGES
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            } else {
                // update
                that.api.update_menu(that.menu.id, m).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
                          swal({
                            title: "Menu Item updated successfully!",
                            timer: 1500,
                            showConfirmButton: false,
                            type: "success"
                          });
                            //$uibModalInstance.close();
                            //ADD POP UP INFO MESSAGES
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            }
          }
        };

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
	
	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Menu Setup Instructions';
						
		that.q_texts = '<article style="display: block;"><p><b>Food Menu Recipe Setup</b> – this screen should match your real Menu. The items from the recipe setup page will be added to the correct menu item<br/><br/><b>Step 1</b> – Enter the Menu Item names just as it appears in your POS or on your actual menu<br/><br/><b>Step 2</b> – The pricing level should be clear in your POS. For example: pricing level 1 could be regular prices while pricing level 2 can be happy hour prices.<br/><br/><b>Step 3</b> – Enter the item’s selling price<br/><br/><b>Step 4</b> – Select the recipe name from the dropdown list which populates from the list of all previous items you created<br/><br/><b>Step 5</b> – In the Serving Type section you will see three options appear. Depending on what appears in the Serving Type section will depend on the number you enter in the Recipe Amount section. The difference between a single serving and a batch or sauce is that batches and Prepared Sauces are served as ounces and single servings are served as full units.<ul><li>Single Serving – This is a single recipe meant to serve a single person.</li><li>Large Batch/Multi Servings - This is a large recipe that’s meant to serve multiple people. We’ve broken the recipe down into ounces. In this section you will tell us how many ounces you are serving from this batch.</li><li>Prepared Sauces – Sauces are typically used as ingredients in Large Batch or Single Serving recipes however they can also be served as their own items. This is where you will tell us how many ounces of your special sauce is to be served on the designated menu item.</li></ul></p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };

    function newFoodItem_modalController($uibModalInstance, $state, alertService, restaurant_id, vendor_list, inventory_type_id, api, core, SweetAlert, $q) {
		var that = this;
		that.$state = $state;
		
        that.form = {};
        that.uniqueItem = [];

        that.categories = [];
        that.sub_categories = [];


        core.getRefbooks().then(function (res) {
            that.deliveryMeasure = res.measurement_units_of_delivery;
            that.categories = res.vendor_cat;
            that.sub_categories = res.vendor_sub_cat;
        });


        that.api = api;

        that.model = {};
		that.vendor_list = vendor_list;
		that.selected_vendor = null;

        that.sku_lookup = function (search_for) {
            return that.api.sku_lookup({search_for: search_for, vendor_id: that.selected_vendor}).then(function (res) {
                return res.data.data.sku.slice(0, 10);
            })

        };

        that.submit = function (form) {

            var deferred = $q.defer();

            if (!form.$valid) {
                alertService.showError('Please validate all inputs');
                deferred.reject();
                return deferred.promise;
            }

            if (!that.uniqueItem.length) {
                alertService.showError('Please, add at least one item');
                deferred.reject();
                return deferred.promise;
            }

			if(that.uniqueItem[0].vendor_sku != null && that.uniqueItem[0].vendor_sku.length){
				that.api.validateSKU({sku: that.uniqueItem[0].vendor_sku, vendor_id: that.selected_vendor}).then(function (res) {
					if(res.data.data.sku_status.length && res.data.data.sku_status[0].sku_status == 'used'){
						alertService.showError('SKU already used!');
						return;
					}
					else{
						var id = that.selected_vendor;

						var m = {
							inventory_type_id: 1,
							sku_items: []
						};

						for (var i = 0; that.uniqueItem.length > i; i++) {
							m.sku_items.push({
								substitute_for: that.uniqueItem[i].substitute_for ? that.uniqueItem[i].substitute_for : null,
								vendor_sku: that.uniqueItem[i].vendor_sku,
								pack: that.uniqueItem[i].pack,
								size: that.uniqueItem[i].size,
								total_unit_size: that.uniqueItem[i].pack * that.uniqueItem[i].size,
								uom_id_of_delivery_unit: that.uniqueItem[i].uom_id_of_delivery_unit,
								brand: 'No Brand',
								brand_id: 1,
								item_name: that.uniqueItem[i].item_name,
								vendor_cat_id: that.uniqueItem[i].vendor_cat_id,
								vendor_sub_cat_id: that.uniqueItem[i].vendor_sub_cat_id,
								yield: 1,
								price: that.uniqueItem[i].case_cost,
								minimum_order_type: that.uniqueItem[i].minimum_order_type,
								is_active: that.uniqueItem[i].is_active,
								id: that.uniqueItem[i].id
							})
						}

						that.api.add_update_own_inventory(id, m).then(function (res) {
							if (res.data.data.code === 1000) {
								that.clear();
								alertService.showAlertSave();
								deferred.resolve();
								//$uibModalInstance.dismiss('cancel');
							}
						});

						return deferred.promise;
					}
				});
			}
        };
		
		that.apply_values = function ($item) {
			that.src =  $item.src;
			that.uniqueItem[0].vendor_sku = $item.vendor_sku;
			that.uniqueItem[0].item_name = $item.item_name;
			that.uniqueItem[0].vendor_cat_id = $item.vendor_cat_id;
			that.uniqueItem[0].vendor_sub_cat_id = $item.vendor_sub_cat_id;
			that.uniqueItem[0].uom_id_of_delivery_unit = $item.uom_id_of_delivery_unit;
			that.uniqueItem[0].pack = $item.pack;
			that.uniqueItem[0].size = $item.size;
			that.uniqueItem[0].case_cost = $item.case_cost;
			that.uniqueItem[0].minimum_order_type = $item.minimum_order_type;
			that.uniqueItem[0].substitute_for = $item.substitute_for;
			that.filterItems();
		}
		
        that.addUniqueItem = function () {

            that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                uom_id_of_delivery_unit: null,
                item_name: null,
                vendor_cat_id: that.categories.length ? that.categories[0].id : null,
                vendor_sub_cat_id: that.sub_categories.length ? that.sub_categories[0].id : null,
                is_active: 1,
                size: null,
                case_cost: null,
                minimum_order_type: 'Case',
                id: null,
				substitute_for: null
            })
        };
		
		that.filterItems = function () {
			that.inventoryListSelected = [];
			for(var i =0; i< that.inventoryItems.length; i++){
				if(that.inventoryItems[i].vendor_cat_id == that.uniqueItem[0].vendor_cat_id &&
					(((that.uniqueItem[0].uom_id_of_delivery_unit == 10 || that.uniqueItem[0].uom_id_of_delivery_unit == 11 || that.uniqueItem[0].uom_id_of_delivery_unit == 12 || that.uniqueItem[0].uom_id_of_delivery_unit == 13 || that.uniqueItem[0].uom_id_of_delivery_unit == 16 || that.uniqueItem[0].uom_id_of_delivery_unit == 17 || that.uniqueItem[0].uom_id_of_delivery_unit == 18) && (that.inventoryItems[i].uom_id_of_delivery_unit == 10 || that.inventoryItems[i].uom_id_of_delivery_unit == 11 || that.inventoryItems[i].uom_id_of_delivery_unit == 12 || that.inventoryItems[i].uom_id_of_delivery_unit == 13 || that.inventoryItems[i].uom_id_of_delivery_unit == 16 || that.inventoryItems[i].uom_id_of_delivery_unit == 17 || that.inventoryItems[i].uom_id_of_delivery_unit == 18)) || ((that.uniqueItem[0].uom_id_of_delivery_unit == 5 || that.uniqueItem[0].uom_id_of_delivery_unit == 14 || that.uniqueItem[0].uom_id_of_delivery_unit == 15 || that.uniqueItem[0].uom_id_of_delivery_unit == 19) && (that.inventoryItems[i].uom_id_of_delivery_unit == 5 || that.inventoryItems[i].uom_id_of_delivery_unit == 14 || that.inventoryItems[i].uom_id_of_delivery_unit == 15 || that.inventoryItems[i].uom_id_of_delivery_unit == 19)) || ((that.uniqueItem[0].uom_id_of_delivery_unit == 1 || that.uniqueItem[0].uom_id_of_delivery_unit == 2 || that.uniqueItem[0].uom_id_of_delivery_unit == 3 || that.uniqueItem[0].uom_id_of_delivery_unit == 4 || that.uniqueItem[0].uom_id_of_delivery_unit == 5 || that.uniqueItem[0].uom_id_of_delivery_unit == 8) && (that.inventoryItems[i].uom_id_of_delivery_unit == 1 || that.inventoryItems[i].uom_id_of_delivery_unit == 2 || that.inventoryItems[i].uom_id_of_delivery_unit == 3 || that.inventoryItems[i].uom_id_of_delivery_unit == 4 || that.inventoryItems[i].uom_id_of_delivery_unit == 5 || that.inventoryItems[i].uom_id_of_delivery_unit == 8)))
					){
					that.inventoryListSelected.push(that.inventoryItems[i]);
				}
			}
			if(that.inventoryListSelected.length){
				var first = JSON.stringify(that.inventoryListSelected[0]);
				that.inventoryListSelected.unshift(JSON.parse(first));
				that.inventoryListSelected[0]['id'] = null;
				that.inventoryListSelected[0]['vendor_name'] = '--No selection--';
				that.inventoryListSelected[0]['item_name'] = '--No selection--';
			}
        };
		
		that.getInventoriesByVendor = function () {
            that.api.get_active_inventory_by_vendor({
                inventory_type_id: 1,
				caller: 'sub_list'
            }, restaurant_id).then(function (res) {
                that.inventoryItems = res.data.data.sku;
				that.filterItems();
            });
        };
		
		that.addUniqueItem();
		that.getInventoriesByVendor();
		
		that.clear = function () {
			that.src =  '';
			that.uniqueItem = [];
			that.uniqueItem.push({
                vendor_sku: null,
                pack: null,
                uom_id_of_delivery_unit: null,
                item_name: null,
                vendor_cat_id: null,
                vendor_sub_cat_id: null,
                is_active: 1,
                size: null,
                case_cost: null,
                minimum_order_type: 'Case',
                id: null,
				substitute_for: null
            });
		}
		
        that.cancel = function () {
			$uibModalInstance.dismiss('cancel');
        };
    }
	
	function menuSetupController(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert, $rootScope, restaurant) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.core = core;
        that.auth = auth;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
		
		that.status = "active";
		that.has_ig = "all";

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

		that.SetUpStatus=0;
		if(restaurant.data.info){
			that.SetUpStatus = restaurant.data.info.is_setup_completed;
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
		
		that.createMissingMenus = function (){
			that.api.create_missing_menus({inventory_type_id: 1}).then(function (res) {
                SweetAlert.swal({
                    title: "Menus Created Successfully!",
                    text: "Please find the new menus (marked in red) and proceed to add the ingredients in them. Also note these menus are being mapped to POS data as of now. Please allow a few minutes for the mapping to update.",
                    type: "success",
                    confirmButtonText: "OK"
                },
                function (res) {
                    that.getAllMenus();
                });
            });
		}
		
		that.updateMenuPrices = function (){
			SweetAlert.swal({
                    title: "Are you sure?",
                    text: "This will update the prices of all the menus to their latest average sales price.",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ed5565",
                    confirmButtonText: "Confirm"
                },
                function (res) {
                    if (res) {
                        that.getAllMenus(true);
                    }
                });
		}
		
		var generateFile = function(menuList) {
            const menuHeaders = ['id', 'MenuItemName', 'PricingLevel', 'Price', 'CostMargin', 'TotalCost', 'Comments'];
            const recipeHeaders = ['RecipeName', 'ServingType', 'RecipeAmt', 'TotalOz', 'RecipeCost'];
            var csv = '';
			csv += (menuHeaders.join(',') + ',');
			csv += (recipeHeaders.join(',') + '\r\n');
			
            if (menuList && menuList.length) {
                menuList.forEach(function(menu) {
					const m_values = menuHeaders.map(function(header) {
						return menu[header]
					});
					if (menu.recipes && menu.recipes.length) {
                        menu.recipes.forEach(function(recipe) {
                            const r_values = recipeHeaders.map(function(header) {
                                return recipe[header];
                            })
							csv += (m_values.join(',') + ',');
                            csv += (r_values.join(',') + '\r\n');
                        });
                    }
					else{
						csv += (m_values.join(',') + ',');
						csv += recipeHeaders.map(function(header) {
									return ',';
								}).join('')+'\r\n';
					} 
                });
            }

			
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Menu_list(food).csv';
            hiddenElement.click();
			that.export_loading = false;
        }


        this.downloadCSV = function() {
			that.export_loading = true;
            const menuList = [];

            var refRecipes = null;

            var menus = this.filtered_menus;
			var all_menus = [];
			var menus_to_export = [];

            that.api.get_recipes({ inventory_type_id: 1 }).then(function(res) {
                refRecipes = res.data.data.recipes_list;
                return;
            }).then(function() {
                return that.api.get_menus({inventory_type_id: 1, mode: 'export'}).then(function (res) {
					all_menus = res.data.data.menus_list;
					for(var rx in menus){
						for(var ax in all_menus){
							if(menus[rx].id == all_menus[ax].id){
								menus_to_export.push(all_menus[ax]);
								break;
							}
						}
					}
				});
            }).then(function() {
                return new Promise(function(resolve, reject) {
                    var index = 0;
					
                    function next() {
                        var menu = menus_to_export[index];
						
                        if (!menu){
							return resolve(menuList);
						}
						
                        var menuData = new Object({
                            id: menu.id,
                            MenuItemName: menu.menu_item_name.replace(/[,'#]/g, ''),
                            PricingLevel: menu.pricing_level,
                            Price: menu.price,
                            TotalCost: menu.cost,
                            CostMargin: menu.cost_margin,
							Comments: menu.description == null ? menu.description : menu.description.replace(/[,'#\r\n|\n|\r]/g, ' ')+'',
                            recipes: new Array()
                        });

                        //that.api.get_menu_by_id(menu.id).then(function(res) {
						menu.menu_items.forEach(function(recipe, ingredientIndex) {
							for(var vi in refRecipes) {
								var reci = refRecipes[vi];
								if (reci.id === recipe.recipe_id) {
									menuData.recipes.push({
										RecipeName: reci.recipe_name.replace(/[,'#]/g, ''),
										ServingType: reci.serving_type,
										RecipeAmt: recipe.recipes_amount,
										TotalOz: reci.servings,
										RecipeCost: recipe.cost
									});
									break;
								}
							}
						});
						menuList.push(menuData);
						index++;
						next();
                        //});
                    }
                    next();
                });
            }).then(function() {
                generateFile(menuList);
            });
        }
		
        that.edit = function (menu) {
            that.api.get_menu_by_id(menu.id).then(function (res) {
                that.add(res.data.data.menus_list[0]);
            });
        };

		that.deactivate = function (menu_id) {
			that.api.act_deact_menu_item({'item':[{'action': 'deactivate'}], 'id': menu_id}).then(function (res) {
				that.getAllMenus();
            });
        };

		that.activate = function (menu_id) {
			that.api.act_deact_menu_item({'item':[{'action': 'activate'}], 'id': menu_id}).then(function (res) {
				that.getAllMenus();
            });
        };
		
		that.changeList = function () {
			that.getAllMenus();
        };
		
        that.delete = function (menu) {
          if(menu.id)
          {
            //console.log("Got something to delete "+menu.id);
            SweetAlert.swal({
                    title: "Are you sure?",
                    text: "This menu will be deleted",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ed5565",
                    confirmButtonText: "Confirm"
                },
                function (res) {
                    if (res) {
                        that.api.delete_menu(menu.id).then(that.getAllMenus);
                    }
                });
          }
          else{
            //console.log("Got nothing to delete");
          }
        };

		that.apply_filter = function () {
			var pl = that.filter_pl;
			if(pl == null || pl == undefined){
				//that.filtered_menus = JSON.parse(JSON.stringify(that.menus));
				that.filtered_menus = that.menus.filter(function(x){
																	return (that.has_ig == 'yes' ? x.category != 'Other' : that.has_ig == 'no' ? x.category == 'Other' : true)
																	});
			}
			else{
				that.filtered_menus = that.menus.filter(function(x){return x.pricing_level == pl 
																	&& (that.has_ig == 'yes' ? x.category != 'Other' : that.has_ig == 'no' ? x.category == 'Other' : true)
																	});
				/*for (var i=0; i<that.menus.length; i++) {
					if(that.menus[i].pricing_level == pl){
						that.filtered_menus.push(that.menus[i]);
					}
				}*/
			}
			that.export_loading = false;
        }
		
        that.getAllMenus = function (upd_price) {
            that.api.get_menus({inventory_type_id: 1, update_price: upd_price ? upd_price : false, 'menu_item_name': that.search_menu != null ? that.search_menu : ''}).then(function (res) {
                try {
                    that.menus = res.data.data.menus_list;
					
					that.curr_menus = [];
					for(var i=0; i<that.menus.length; i++){
						if(that.status == "active" && that.menus[i].is_active == 1){
							that.curr_menus.push(that.menus[i]);
						}
						else if(that.status == "inactive" && that.menus[i].is_active == 0){
							that.curr_menus.push(that.menus[i]);
						}
					}
					that.menus = that.curr_menus;
					
                    that.apply_filter();
                } catch (e) {

                }
            });
        };

        that.getAllMenus();

        that.add = function (menu) {
            var modalInstance = $uibModal.open({
                templateUrl: 'add_new_menu_item.html',
                controller: modalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                size: 'lg',
                resolve: {
                    menu: function () {
                        return menu;
                    },
					filtered_menus: function () {
                        if(menu) return that.filtered_menus;
                    },
                    get_refbooks: function () {
                        if (that.get_refbooks) return that.get_refbooks;
                        return that.core.getRefbooks().then(function (res) {
                            return that.get_refbooks = res;
                        })
                    },
                    recipes_list: function () {
                        if (that.recipes) return JSON.parse(JSON.stringify(that.recipes));
                        return that.api.get_recipes({inventory_type_id: 1}).then(function (res) {
							res.data.data.recipes_list.unshift({id:-2, recipe_name: ' (+) Add New Recipe'});
							res.data.data.recipes_list.unshift({id:-1, recipe_name: ' (+) Add a new Inventory Item'});
							that.recipes = res.data.data.recipes_list;
                            return JSON.parse(JSON.stringify(res.data.data.recipes_list));
                        })
                    },
					rest_id: function () {
						return that.restaurant_id.restaurant_id;
					}
                }
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllMenus();
            }, function () {
                that.getAllMenus();
            });
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
				that.is_setup_completed = restaurant.data.info.is_setup_completed;
            });
        };

    }

    menuSetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert', '$rootScope', 'restaurant'];

    angular.module('inspinia').component('menuSetupComponent', {
        templateUrl: 'js/components/foodSetup/menuSetup/menuSetup.html',
        controller: menuSetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();