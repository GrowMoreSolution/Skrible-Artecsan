(function () {
    'use strict';

    function modalController($uibModal, $uibModalInstance, menu, filtered_menus, rest_id, get_refbooks, ingredients, alertService, SweetAlert, api) {


        var that = this;

        that.form = {};
        that.ingredients = ingredients;
		for(var i in that.ingredients){
			that.ingredients[i].item_name = that.ingredients[i].item_name + " (" + that.ingredients[i].vendor_name + ")";
		}
		that.ingredients.unshift({'id': -1, 'item_name': '(+) Add a new Inventory Item'});
        that.menus = [];
        that.filter_pl = 0;
        that.get_refbooks = get_refbooks;
        that.menu = menu;
		that.filtered_menus = filtered_menus;
		that.rest_id = rest_id;
		that.mindex = 0;
        that.stdisable = menu;
        that.api = api;
        that.savename = null;
        that.savelevel = null;
        that.savePL1 = null;
        that.default_note = " Hover the mouse pointer over the form field headings to display their purpose.";
        that.current_note = that.default_note;
        that.notes = {
          min: "Please enter the menu item name EXACTLY as it appears in your POS. To add your ingredients please select the plus symbol below the Ingredients header below.",
          pl: "Your P.O.S. normally has pricing levels for each Menu Item which can be used for discounts and drink special. Your default pricing level is usually pricing level 1 however if your restaurant uses multiple pricing level please select the level to match your POS. If you do not use pricing levels please select a 0.",
		  category: "The first ingredient of the menu item dictates its sales category.",
          price: "Please enter the correct retail price that matches the menu item name and price level in your POS.",
          cp: "Represents your cost percentage for this menu item.",
          tc: "Represents your total dollar cost for this menu item.",
          st: "There are three options for serving type. Basic is your standard serving which is usually an amount poured from a bottle (example 1.5oz, 2oz, etc). A Batch is considered a large container meant to service multiple customers in multiple seating (example Margarita Mix). A Full Bottle/Beer – accounts for the serving of a full bottle of beer, wine, liquor or keg.",
          ss: "This represents the total alcohol ounces to be served to a customer. For a batch you must assign a serving size which is usually represented by the glass size which you will serve to the customer.",
          tro: "This represents total alcohol and non-alcoholic content in your recipe",
          ts: "Represents how many customers can be served based on the serving size and recipe ounces for the menu item.",
          i: "Please select the plus symbol below and to the right. Here you will add your ingredients for the menu item. The ingredients will include the item, recipe amount and unit of measure.",
          iname: "The items you selected in the previous steps are populated here and can be used as ingredients in your recipe. Please select the desired ingredient. If you do not see your desired ingredient please return to the previous step, select your item and return here to use your item.",
          iuom: "Please select the appropriate unit of measure. Alcohol is most frequently measured in ounces or full bottles, cans or kegs.",
          ira: "Please select how many ounces or bottles you will use for this ingredient. For example–the standard recipe amount for alcohol is 1.25 ounces so you would enter 1.25.The best method is to measure your pour, set a standard and train your bartenders.",
          iops: "This is usually relevant when creating a Batch. For each specific item, ounces per serving tells you how many ounces of liquid each customer will receive when served.",
          iupr: "This is more relevant when creating a Batch. Usage per Recipe tells you how many total ounces of liquid you will be using in your recipe for each individual item.",
          icost: "Ingredient cost based on total price and serving size.",
          c: "You may also add comment to each menu item."
        };

        that.all_pricing_levels = [{"name": 0,"level": "0"}, {"name": 1,"level": "1"},{"name": 2,"level": "2"},{"name": 3,"level": "3"},{"name": 4,"level": "4"},{"name": 5,"level": "5"},{"name": 6,"level": "6"},{"name": 7,"level": "7"},{"name": 8,"level": "8"},{"name": 9,"level": "9"},{"name": 10,"level": "10"}];

        that.selected_pricing_level = that.all_pricing_levels[0].name;
        that.model = {
            menu_item_name: menu ? menu.menu_item_name : null,
            pricing_level: menu ? menu.pricing_level : 1,
			category: menu ? menu.category : null,
            price: menu ? menu.price : null,
            cost_margin: menu ? menu.cost_margin : 0,
            total_cost: menu ? menu.cost : 0,
            serving_type: menu ? menu.serving_type : null,
            serving_size: menu ? menu.serving_size : null,
            total_recipe_oz: menu ? menu.oz_total : 0,
            total_servings: menu ? menu.total_servings : 0,
            description: menu ? menu.description : null,
            ingredients: menu ? menu.menu_items : []
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
		  that.model.category = null;
          that.model.price = null;
          that.model.cost_margin = 0;
          that.model.total_cost = 0;
          that.model.serving_type = null;
          that.model.serving_size = null;
          that.model.total_recipe_oz = 0;
          that.model.total_servings = 0;
          that.model.description = null;
          that.model.ingredients = [];
          that.selected_pricing_level = 1;
          that.savePL1 = null;
        };
		
        that.savePL1 = that.model.menu_item_name;
        that.selected_pricing_level = that.model.pricing_level;
        that.checkServingType = function () {
            if (that.model.serving_type === 3) {
                // that.model.serving_size = that.model.total_recipe_oz;
				that.model.ingredients = [{
                    recipe_id: null,
                    vendor_sku_id: null,
                    bar_recipe_uom_id: 1,
                    recipes_amount: 1,
                    oz_per_serving: 0,
                    usage_in_units: 0,
                    cost: 0,
                    content_weight: 0,
                    unit_cost: 0,
                    full_weight: 0,
                    time: new Date().getTime()
                }];
            }

            if (that.model.serving_type === 1 || that.model.serving_type === 2) {
                // that.model.serving_size = that.model.total_recipe_oz;
                // that.model.total_recipe_oz = 1;
				if (that.model.serving_type === 1){
					that.model.total_servings = 1;
				}
				if(that.model.ingredients.length == 0){
					that.model.ingredients = [{
						recipe_id: null,
						vendor_sku_id: null,
						bar_recipe_uom_id: 2,
						recipes_amount: 0,
						oz_per_serving: 0,
						usage_in_units: 0,
						cost: 0,
						content_weight: 0,
						unit_cost: 0,
						full_weight: 0,
						time: new Date().getTime()
					}];
				}
                return
            }

        };

        that.setAdditionalFields = function ($index) {
			var is_insert_new_inv = that.model.ingredients[$index].vendor_sku_id == -1 ? true : false;
			if(that.model.ingredients[$index].vendor_sku_id == -1){
				that.model.ingredients[$index].vendor_sku_id = that.model.ingredients[$index].bu_vendor_sku_id ? that.model.ingredients[$index].bu_vendor_sku_id : null;
			}
			that.model.ingredients[$index].bu_vendor_sku_id = that.model.ingredients[$index].vendor_sku_id;
			if(!angular.isUndefined(that.model.ingredients[$index].vendor_sku_id) && (that.model.ingredients[$index].vendor_sku_id != null) && ($index == 0))
			{
				that.api.get_menu_category(that.model.ingredients[$index].vendor_sku_id).then(function (res) {
					that.model.category = res.data.data.category[0].category;
				});
			}

			for (var i = 0; that.ingredients.length > i; i++) {
				if (that.model.ingredients[$index].vendor_sku_id === that.ingredients[i].id) {
					that.model.ingredients[$index].full_weight = that.ingredients[i].full_weight;
					that.model.ingredients[$index].unit_cost = that.ingredients[i].unit_cost;
					that.model.ingredients[$index].content_weight = that.ingredients[i].content_weight || (that.ingredients[i].full_weight - that.ingredients[i].tare_weight);
					that.model.ingredients[$index].tare_weight = that.ingredients[i].tare_weight;
					break
				}
			}
			
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
							templateUrl: 'add_new_alcohol_inventory_item.html',
							controller: newAlcoholItem_modalController,
							windowClass: "animated fadeIn modal-lgg",
							controllerAs: '$ctr',
							size: 'lg2x',
							resolve: {
								vendor_list: function () {
									if (that.vendors) return that.vendors;
									return that.api.get_chosen_vendors(that.rest_id, {vendor_type_id: 2}).then(function (res) {
										return that.vendors = res.data.data.vendors;
									})
								},
								inventory_type_id: function () {
									return 2;
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
						total_cost: that.menu ? that.menu.cost : 0,
						serving_type: that.menu ? that.menu.serving_type : null,
						serving_size: that.menu ? that.menu.serving_size : null,
						total_recipe_oz: that.menu ? that.menu.oz_total : 0,
						total_servings: that.menu ? that.menu.total_servings : 0,
						description: that.menu ? that.menu.description : null,
						ingredients: that.menu ? that.menu.menu_items : []
					};
					that.savePL1 = that.model.menu_item_name;
					that.selected_pricing_level = that.model.pricing_level;
					for (var i = 0; that.model.ingredients.length > i; i++) {
						that.setAdditionalFields(i);
					}
					/*if(!angular.isUndefined(that.model.ingredients[0].vendor_sku_id) && (that.model.ingredients[0].vendor_sku_id != null))
					{
						that.api.get_menu_category(that.model.ingredients[0].vendor_sku_id).then(function (res) {
							that.model.category = res.data.data.category[0].category;
						});
					}*/
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
						total_cost: that.menu ? that.menu.cost : 0,
						serving_type: that.menu ? that.menu.serving_type : null,
						serving_size: that.menu ? that.menu.serving_size : null,
						total_recipe_oz: that.menu ? that.menu.oz_total : 0,
						total_servings: that.menu ? that.menu.total_servings : 0,
						description: that.menu ? that.menu.description : null,
						ingredients: that.menu ? that.menu.menu_items : []
					};
					that.savePL1 = that.model.menu_item_name;
					that.selected_pricing_level = that.model.pricing_level;
					for (var i = 0; that.model.ingredients.length > i; i++) {
						that.setAdditionalFields(i);
					}
					/*if(!angular.isUndefined(that.model.ingredients[0].vendor_sku_id) && (that.model.ingredients[0].vendor_sku_id != null))
					{
						that.api.get_menu_category(that.model.ingredients[0].vendor_sku_id).then(function (res) {
							that.model.category = res.data.data.category[0].category;
						});
					}*/
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
                    that.model.total_cost = edit_item.cost;
                    that.model.serving_type = edit_item.serving_type;
                    that.model.serving_size = edit_item.serving_size;
                    that.model.total_recipe_oz = edit_item.oz_total;
                    that.model.ingredients = edit_item.menu_items;
                    //BRING BACK INGREDIENTS TOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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

        that.calculate = function ($index) {
			if($index){
				if(that.model.ingredients[$index].recipes_amount == 0){
					that.model.ingredients[$index].recipes_amount = null;
					return;
				}
			}
			
            var _p = function (v) {
                if (!v) return;
                return parseFloat(v.toFixed(3));
            };

            var price = that.model.price || 0;
            var total_cost = 0;

            var serving_type = that.model.serving_type;  // ID refbooks['bar_serving_types']
            var isButch = serving_type === 2;            // Batch  == 2
            var serving_size = that.model.serving_size || 0;
            var total_recipe_oz = 0;
            var total_servings = 1;
            var cost_margin = 0;

            if (isButch && (!serving_size || !serving_type || !price)) return;

            angular.forEach(that.model.ingredients, function (v, k) {
                if (v.recipes_amount === undefined || v.recipes_amount === null) return;
                var content_weight = v.content_weight || (v.full_weight - v.tare_weight);
                // Usage Per Recipe
                v.usage_in_units = _p(v.bar_recipe_uom_id === 1 ? content_weight * v.recipes_amount : v.recipes_amount);
                total_recipe_oz += (v.usage_in_units || 0);
            });


            angular.forEach(that.model.ingredients, function (v, k) {
                var content_weight = v.content_weight || (v.full_weight - v.tare_weight);
                v.cost = _p(v.usage_in_units * v.unit_cost);
                total_cost += v.cost;
            });


            if (!isButch) {
                serving_size = total_recipe_oz;
                cost_margin = price ? total_cost / price * 100 : 0;
            }

            if (isButch) {
                total_servings = total_recipe_oz / serving_size;
                cost_margin = price ? total_cost / (price * total_servings) * 100 : 0;
            }

            angular.forEach(that.model.ingredients, function (v, k) {
                v.oz_per_serving = _p(isButch ? v.usage_in_units / total_servings : v.usage_in_units)
            });


            that.model.total_recipe_oz = _p(total_recipe_oz);
            that.model.total_servings = _p(total_servings);
            that.model.serving_size = _p(serving_size);
            that.model.total_cost = _p(total_cost);
            that.model.cost_margin = _p(cost_margin);

        };

        // that.calculate = function ($index) {
        //
        //     var _p = function (v) {
        //         if (!v) return;
        //         return parseFloat(v.toFixed(3));
        //     };
        //
        //     var price = that.model.price;
        //     var total_cost = 0;
        //
        //     var serving_type = that.model.serving_type; // ID refbooks['bar_serving_types']
        //     var serving_size = that.model.serving_size;
        //     var total_recipe_oz = 0;
        //     var total_servings = 0;
        //
        //     angular.forEach(that.model.ingredients, function (v, k) {
        //         var content_weight = v.content_weight || (v.full_weight - v.tare_weight);
        //
        //         // Full Btl or Oz
        //         var oz = v.bar_recipe_uom_id === 1 ? (content_weight * v.recipes_amount) : v.recipes_amount;
        //         total_recipe_oz += oz || 0;
        //     });
        //
        //     total_servings = (total_recipe_oz / serving_size) || 0;
        //
        //     // count - Ounces per Serving
        //     angular.forEach(that.model.ingredients, function (v, k) {
        //         if (v.recipes_amount === undefined || v.recipes_amount === null) return;
        //         var oz = v.bar_recipe_uom_id === 1 ? (v.content_weight * v.recipes_amount) : v.recipes_amount;
        //
        //         if (serving_type === 1) {
        //             v.oz_per_serving = _p(v.recipes_amount / total_servings)
        //         } else {
        //             v.oz_per_serving = _p(oz / total_servings)
        //         }
        //     });
        //
        //     angular.forEach(that.model.ingredients, function (v, k) {
        //
        //         if (v.recipes_amount === undefined || v.recipes_amount === null) return;
        //
        //         var content_weight = v.content_weight || (v.full_weight - v.tare_weight);
        //
        //         // Full Btl == 1
        //         // Oz == 2
        //         if (v.bar_recipe_uom_id === 1) {
        //             v.usage_in_units = content_weight * v.recipes_amount;
        //         } else {
        //             v.usage_in_units = v.recipes_amount;
        //         }
        //
        //         v.cost = _p(v.usage_in_units / content_weight * v.unit_cost);
        //
        //
        //         total_cost += v.cost;
        //     });
        //
        //
        //     that.model.total_recipe_oz = _p(total_recipe_oz);
        //     that.model.total_servings = _p(total_servings);
        //     that.model.total_cost = _p(total_cost);
        //     that.model.cost_margin = price ? _p((total_cost / ((price * (total_servings || 1)) || 1)) * 100) : 0;
        //
        //     if (that.model.serving_type !== 2) {
        //         that.model.serving_size = that.model.total_recipe_oz;
        //     }
        // };


        that.addIngredient = function () {
            that.model.ingredients.push(angular.copy({
                recipe_id: null,
                vendor_sku_id: null,
                bar_recipe_uom_id: null,
                recipes_amount: null,
                oz_per_serving: 0,
                usage_in_units: 0,
                cost: 0,

                full_weight: 0,
                time: new Date().getTime()
            }));
        };

        that.removeIngredient = function ($index) {
            that.model.ingredients.splice($index, 1);
            that.calculate();
			if(that.model.ingredients.length > 0)
			{
				if(!angular.isUndefined(that.model.ingredients[0].vendor_sku_id) && (that.model.ingredients[0].vendor_sku_id != null))
				{
						that.api.get_menu_category(that.model.ingredients[0].vendor_sku_id).then(function (res) {
						that.model.category = res.data.data.category[0].category;
					});
				}
				else{
					that.model.category = null;
				}
			}
			else{
				that.model.category = null;
			}
			
        };

        that.submit = function (form) {

            if (!that.model.ingredients.length) {
                alertService.showError('Please add at least one ingredient');
                return
            }

            if (!form.$valid) {
                return
            }


            var m = {
                inventory_type_id: 2,
                bar_serving_type_id: that.model.serving_type,
                menu_item_name: that.model.menu_item_name,
                pricing_level: that.selected_pricing_level,
				category: that.model.category,
                description: that.model.description,
                serving_size: that.model.serving_size,             //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                oz_total: that.model.total_recipe_oz,                     //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                total_servings: that.model.total_servings,          //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                price: that.model.price,
                cost_margin: that.model.cost_margin,
                cost: that.model.total_cost,
                menu_items: []
            };

            for (var i = 0; that.model.ingredients.length > i; i++) {
                m.menu_items.push({
                    recipe_id: that.model.ingredients[i].recipe_id,
                    vendor_sku_id: that.model.ingredients[i].vendor_sku_id,             //-- use for bar only (inventory_type_id = 2), otherwise set as null or not include in the body
                    bar_recipe_uom_id: that.model.ingredients[i].bar_recipe_uom_id,     //-- use for bar only (inventory_type_id = 2), ids of "bar_recipe_measurement_types" refbook
                    recipes_amount: that.model.ingredients[i].recipes_amount,
                    oz_per_serving: that.model.ingredients[i].oz_per_serving,
                    usage_in_units: that.model.ingredients[i].usage_in_units,
                    cost: that.model.ingredients[i].cost
                });
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

                //DOESNT WORK RIGHT NOW
                // update others to new name
                that.api.update_menu(that.model.menu_item_name+"&"+that.savePL1).then(function (res) {
                    try {

                        if (res.data.data.code === 1000) {
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
						
		that.q_texts = '<article style="display: block;"><p><b>Alcohol Menu Setup</b> – This is where you will use your alcohol inventory items to duplicate the menu items in your POS.<br/><br/>Please check out our instruction video on setup <a href="https://youtu.be/DrzHflG3qP8" target="_blank">here</a>. In this section you may easily view your recipe cost and percentage. To begin please select “New Menu Item”. A new instruction popup screen should appear with the following fields:<br/><br/><b>Menu Item Name</b> – This is the name that should match the recipe name in your POS<br/><br/><b>Pricing Level</b> – This is the pricing level that should match the pricing level in your POS. Pricing levels are typically used to represent changes in prices such as happy hour or as a different serving size for the same item. For example, pricing level zero can be a price of Greygoose for regular hours, while pricing level 2 can be the Greygoose price during happy hour and pricing level 3 can be the pricing for a full bottle. Note: the pricing level should match your POS<br/><br/><b>Price$</b> - is the retail price for that item and pricing level.<br/><br/><b>Serving Type</b> – there are three serving type options which include basic, batch and full bottle. Basic is the standard pour such as 1.5oz or 2oz. Batch is for large pre-prep’d mixes meant to server multiple people. Margarita’s are a good. Full bottles are full bottles.<br/><br/><b>Serving Size</b> – this field will open up if you select Batch as your serving type. In this field you will need to tell us your glass sizes in ounces or the number of ounces you serve per customer. For example: you may have a 8oz glass but only serve 5oz because of the ice. Note: this will only appear if you select a batch as the serving type.<br/><br/><b>+ symbol</b> – will open lines so you can select your ingredients.<ul><li><b>Ingredient Name</b> is a dropdown list of all the items you added to your inventory.</li><li><b>Unit of Measure</b> is either ounces or bottle</li><li><b>Recipe amount</b> is the number of ounces or bottles. The standard unit for a single pour is 1.5oz but for many restaurants the serving size can be higher. If the serving size is a full bottle then select full bottle.</li><li>You may add <b>comments</b> to any recipe section</li></ul></p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
	function newAlcoholItem_modalController($uibModalInstance, alertService, api, core, restaurant_id, vendor_list, inventory_type_id, SweetAlert, $q) {
        var that = this;

        that.form = {};
        that.uniqueItem = [];

        that.categories = [];
        that.sub_categories = [];


        core.getRefbooks().then(function (res) {
            that.refbooks = res;
            that.categories = res.vendor_cat;
            that.sub_categories = res.vendor_sub_cat;
        });

        that.api = api;

        that.model = {};
		that.src = '';
		that.vendor_list = vendor_list;
		that.selected_vendor = null;
		
		that.sku_lookup = function (search_for) {
            return that.api.sku_lookup({search_for: search_for, vendor_id: that.selected_vendor}).then(function (res) {
                return res.data.data.sku.slice(0, 10);
            })

        };
		
		that.item_name_lookup = function (search_for) {
            return that.api.item_name_lookup({search_for: search_for, vendor_id: that.selected_vendor}).then(function (res) {
                return res.data.data.name;
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
							inventory_type_id: 2,
							sku_items: []
						};

						for (var i = 0; that.uniqueItem.length > i; i++) {

							m.sku_items.push({
								substitute_for: that.uniqueItem[i].substitute_for ? that.uniqueItem[i].substitute_for : null,
								item_name: that.uniqueItem[i].item_name,
								tare_type_id: that.uniqueItem[i].tare_type_id,  //tare_type_id, refbooks
								size: that.uniqueItem[i].content_weight || that.uniqueItem[i].size || 1,
								content_weight: that.uniqueItem[i].content_weight || that.uniqueItem[i].size || 1,
								full_weight: that.uniqueItem[i].full_weight,
								tare_weight: that.uniqueItem[i].tare_weight,
								total_unit_size: that.uniqueItem[i].case_qty * that.uniqueItem[i].pack * (that.uniqueItem[i].content_weight || that.uniqueItem[i].size || 1),
								manufacturer: that.uniqueItem[i].manufacturer,
								vendor_sku: that.uniqueItem[i].vendor_sku,
								case_qty: that.uniqueItem[i].case_qty,
								pack: that.uniqueItem[i].pack,
								price: that.uniqueItem[i].minimum_order_type == 'Case' ? that.uniqueItem[i].case_cost : that.uniqueItem[i].pack_cost,
								vendor_cat_id: that.uniqueItem[i].vendor_cat_id,
								uom_id_of_delivery_unit: 5,
								vendor_sub_cat_id: that.uniqueItem[i].vendor_sub_cat_id,
								is_active: that.uniqueItem[i].is_active,
								minimum_order_type: that.uniqueItem[i].minimum_order_type,
								id: that.uniqueItem[i].id
							});


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
			that.changeMOT(0);
			that.uniqueItem[0].vendor_sub_cat_id = $item.vendor_sub_cat_id;
			that.uniqueItem[0].tare_type_id = $item.tare_type_id;
			that.uniqueItem[0].full_weight = $item.full_weight;
			that.uniqueItem[0].pack = $item.pack;
			that.uniqueItem[0].case_cost = $item.case_cost;
			that.uniqueItem[0].pack_cost = $item.pack_cost;
			that.setWeights(0, $item.vendor_cat_id, $item.vendor_sub_cat_id, $item.tare_type_id);
			that.calculate(0);
			that.uniqueItem[0].substitute_for = $item.substitute_for;
		}
		
        that.getSizes = function (cat_id, sub_cat_id) {
            if (!cat_id && !sub_cat_id) return [];
            var _a = [];

            for (var i = 0; that.refbooks.default_weights.length > i; i++) {

                if (that.refbooks.default_weights[i].vendor_cat_id === cat_id && that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id) {
                    for (var j = 0; that.refbooks.tare_types.length > j; j++) {
                        if (that.refbooks.tare_types[j].tare_type_id === that.refbooks.default_weights[i].tare_type_id) {

                            if (_a.indexOf(that.refbooks.tare_types[j]) === -1) {
                                _a.push(that.refbooks.tare_types[j])
                            }
                        }
                    }
                }
            }

            return _a;
        };

        that.calculate = function ($index) {
            var t = that.uniqueItem[$index].pack || 1;
            var u = that.uniqueItem[$index].pack_cost || 1;
            var s = 1;
            var c = that.uniqueItem[$index].case_qty || 1;
            that.uniqueItem[$index].case_cost = parseFloat((t * u * s * c).toFixed(2));
        };

        that.setWeights = function ($index, cat_id, sub_cat_id, tare_type_id) {
			//that.uniqueItem[$index].full_weight = null;

            for (var i = 0; that.refbooks.default_weights.length > i; i++) {

                if (that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id
                    && that.refbooks.default_weights[i].vendor_cat_id === cat_id
                    && that.refbooks.default_weights[i].tare_type_id === tare_type_id) {

                    var f = (that.uniqueItem[$index].vendor_cat_id === 71) ? that.refbooks.default_weights[i].full_weight : that.uniqueItem[$index].full_weight;
                    var c = that.refbooks.default_weights[i].content_weight;

                    that.uniqueItem[$index].tare_weight = (f - c) || 0;
                    that.uniqueItem[$index].content_weight = c;
					
					// for Non Alcoholic only, do an additional conversion to Oz
					if(that.uniqueItem[$index].vendor_cat_id === 76){
						that.uniqueItem[$index].tare_weight = 0;
						that.uniqueItem[$index].content_weight = f * c;
					}
                }
            }
			
			if ((cat_id && sub_cat_id) && (cat_id == 74 || cat_id == 75 || cat_id == 99))
			{
				for (var i = 0; that.refbooks.default_weights.length > i; i++) {
					if (that.refbooks.default_weights[i].vendor_cat_id === cat_id && that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id && that.refbooks.default_weights[i].tare_type_id === tare_type_id) {
						that.uniqueItem[$index].full_weight = that.refbooks.default_weights[i].full_weight;
						that.uniqueItem[$index].tare_weight = that.refbooks.default_weights[i].tare_weight;
						that.uniqueItem[$index].content_weight = that.refbooks.default_weights[i].content_weight;
						break;
					}
				}
			}
        };

        that.addUniqueItem = function () {

            that.uniqueItem.push({
                item_name: null,
                size: null,
                full_weight: null,
                content_weight: null,
                tare_weight: null,
                manufacturer: null,
                vendor_sku: null,
                case_qty: 1,
                total_unit_size: null,
                price: null,
                pack_cost: null,
                vendor_cat_id: that.categories.length ? that.categories[0].id : null,
                uom_id_of_delivery_unit: 5,
                vendor_sub_cat_id: that.sub_categories.length ? that.sub_categories[0].id : null,
                is_active: 1,
                minimum_order_type: 'Pack',
                id: null,
				substitute_for: null
            })
        };
		
		that.filterItems = function () {
			that.inventoryListSelected = [];
			for(var i =0; i< that.inventoryItems.length; i++){
				if(that.inventoryItems[i].vendor_cat_id == that.uniqueItem[0].vendor_cat_id){
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
                inventory_type_id: 2,
				caller: 'sub_list'
            }, restaurant_id).then(function (res) {
                that.inventoryItems = res.data.data.sku;
				that.filterItems();
            });
        };
		
		that.changeMOT = function ($index) {
			that.uniqueItem[$index].full_weight = null;
			if(that.uniqueItem[$index].vendor_cat_id == 74){
				that.uniqueItem[$index].minimum_order_type = 'Case';
			}
			else{
				that.uniqueItem[$index].minimum_order_type = 'Pack';
			}
			that.filterItems();
		}

        that.addUniqueItem();
		that.getInventoriesByVendor();
		
		that.clear = function () {
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
			that.src =  '';
		}
		
        that.cancel = function () {
			$uibModalInstance.dismiss('cancel');
        };
    }
	
    function controller(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert, $rootScope, restaurant, $scope) {

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
		
		$scope.SetUpStatus=0;
		if(restaurant.data.info){
			$scope.SetUpStatus = restaurant.data.info.is_setup_completed;
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
			that.api.create_missing_menus({inventory_type_id: 2}).then(function (res) {
                SweetAlert.swal({
                    title: "Menus Created Successfully!",
                    text: "Please find the new menus (marked in red) and proceed to add the ingredients in them. Also note these menus are being mapped to POS data as of now. Please allow a few minutes for the mapping to update.",
                    type: "success",
                    confirmButtonText: "OK"
                },
                function (res) {
                    that.getAllMenu();
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
                        that.getAllMenu(true);
                    }
                });
		}
		
		var generateFile = function(menuList) {
            const menuHeaders = ['id', 'MenuItemName', 'PricingLevel', 'Category', 'Price', 'CostMargin', 'TotalCost', 'ServingType', 'ServingSize', 'TotalRecipeOz', 'TotalServings', 'Comments'];
            const recipeHeaders = ['IngredientItemName', 'UnitOfMeasure', 'RecipeAmt', 'OuncesPerServing', 'UsagePerRecipe', 'Cost']
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
            hiddenElement.download = 'Menu_list(alcohol).csv';
            hiddenElement.click();
			that.export_loading = false;
        }


        this.downloadCSV = function() {
			that.export_loading = true;
            const menuList = [];

            var refBooks = null;
            var vendor = null;

            var menus = this.filtered_menus;
			var all_menus = [];
			var menus_to_export = [];

            that.core.getRefbooks().then(function(res) {
                refBooks = res;
                return;
            }).then(function() {
                return that.api.get_menus({inventory_type_id: 2, mode: 'export'}).then(function (res) {
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
                return that.api.get_active_inventory_by_vendor({ inventory_type_id: 2 }, that.restaurant_id.restaurant_id).then(function(response) {
                    vendor = response;
                    return;
                });
            }).then(function() {
                return new Promise(function(resolve, reject) {
                    var index = 0;
					function getServingType (st_id) {
						for(var ri in refBooks.bar_serving_types){
							if(refBooks.bar_serving_types[ri].id == st_id){
								return refBooks.bar_serving_types[ri].name;
							}
						}
						return '';
					}
											
                    function next() {
                        var menu = menus_to_export[index];
                        if (!menu){
							return resolve(menuList);
						}
						
                        var menuData = new Object({
                            id: menu.id,
                            MenuItemName: menu.menu_item_name.replace(/[,'#]/g, ''),
                            PricingLevel: menu.pricing_level,
                            Category: menu.category,
                            Price: menu.price,
                            TotalCost: menu.cost,
                            CostMargin: menu.cost_margin,
							ServingType: getServingType(menu.serving_type),
							ServingSize: menu.serving_size,
							TotalRecipeOz: menu.oz_total,
							TotalServings: menu.total_servings,
							Comments: menu.description == null ? menu.description : menu.description.replace(/[,'#\r\n|\n|\r]/g, ' ')+'',
                            recipes: new Array()
                        });
						
						menu.menu_items.forEach(function(recipe, ingredientIndex) {
							for(var vi in vendor.data.data.sku) {
								var sku = vendor.data.data.sku[vi];
								if (sku.id === recipe.vendor_sku_id) {
									menuData.recipes.push({
										IngredientItemName: sku.item_name.replace(/[,'#]/g, '') + ' (' + sku.vendor_name.replace(/[,'#]/g, '') + ')',
										UnitOfMeasure: sku.unit_of_delivery,
										RecipeAmt: recipe.recipes_amount,
										OuncesPerServing: recipe.oz_per_serving,
										UsagePerRecipe: recipe.usage_in_units,
										Cost: recipe.cost
									});
									break;
								}
							}
						});
						menuList.push(menuData);
						index++;
						next();
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
				that.getAllMenu();
            });
        };

		that.activate = function (menu_id) {
			that.api.act_deact_menu_item({'item':[{'action': 'activate'}], 'id': menu_id}).then(function (res) {
				that.getAllMenu();
            });
        };
		
		that.changeList = function () {
			that.getAllMenu();
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
                        that.api.delete_menu(menu.id).then(that.getAllMenu);
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
				that.filtered_menus = that.menus.filter(function(x){
																	return (that.has_ig == 'yes' ? x.category != 'Other' : that.has_ig == 'no' ? x.category == 'Other' : true)
																	});
			}
			else{
				that.filtered_menus = that.menus.filter(function(x){return x.pricing_level == pl 
																	&& (that.has_ig == 'yes' ? x.category != 'Other' : that.has_ig == 'no' ? x.category == 'Other' : true)
																	});
			}
			that.export_loading = false;
        }

        that.getAllMenu = function (upd_price) {
            that.api.get_menus({inventory_type_id: 2, update_price: upd_price ? upd_price : false, 'menu_item_name': that.search_menu != null ? that.search_menu : '', 'recipe_item_name': that.search_ingredient != null ? that.search_ingredient : ''}).then(function (res) {
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

        that.getAllMenu();

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
                    ingredients: function () {
                        if (that.ingredients) return JSON.parse(JSON.stringify(that.ingredients));
                        return that.api.get_active_inventory_by_vendor({inventory_type_id: 2, caller: 'recipe_edit'}, that.restaurant_id.restaurant_id).then(function (res) {
							that.ingredients = res.data.data.sku;
                            return JSON.parse(JSON.stringify(res.data.data.sku));
                        })
                    },
					rest_id: function () {
						return that.restaurant_id.restaurant_id;
					}
                }
            });

            modalInstance.result.then(function () {
                alertService.showAlertSave();
                that.getAllMenu();
            }, function () {
                that.getAllMenu();
            });
        };

        that.$onInit = function () {
            that.core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
				that.is_setup_completed = restaurant.data.info.is_setup_completed;
            });
        };

    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert', '$rootScope', 'restaurant', '$scope'];

    angular.module('inspinia').component('alcoholCreateMenuItemComponent', {
        templateUrl: 'js/components/alcoholSetup/createMenuItem/createMenuItem.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
