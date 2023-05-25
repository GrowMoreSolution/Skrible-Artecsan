(function () {

    'use strict';

	function modalController($uibModal, $uibModalInstance, recipe, all_recipes, rest_id, get_refbooks, ingredients, prepped_recipes, alertService, SweetAlert, api, $q, $filter) {


        var that = this;
		
		
        that.form = {};
        that.ingredients = ingredients;
		for(var i in that.ingredients){
			that.ingredients[i].item_name = that.ingredients[i].item_name + " (" + that.ingredients[i].vendor_name + ")";
		}
		that.ingredients.unshift({'id': -1, 'item_name': '(+) Add a new Inventory Item'});
		that.prepped_recipes = prepped_recipes;
		for(var i in that.prepped_recipes){
			that.prepped_recipes[i].item_name = that.prepped_recipes[i].item_name + " (" + that.prepped_recipes[i].vendor_name + ")";
		}
        that.recipes = [];
        that.get_refbooks = get_refbooks;
		that.mtypes_bu = {};
		that.showMCP = false;
		that.showUsedIn = false;
		
		for(var i=0; i<that.get_refbooks.measurement_types.length; i++){
			if(that.get_refbooks.measurement_types[i].name == 'Percentage'){
				that.mtypes_bu = that.get_refbooks.measurement_types[i];
				break;
			}
		}
		
        that.recipe = recipe;
		that.all_recipes = all_recipes;
		that.rest_id = rest_id;
		that.mindex = 0;
        that.showCategory = false;
        that.api = api;
        that.measurement_units = []; // dynamic array for select menu
		that.default_note = " Hover the mouse pointer over the form field headings to display their purpose.";
        that.current_note = that.default_note;
        that.notes = {
          rname: "Name your recipe here. Make sure you use the same recipe names for what you use while cooking for faster setups.",
          yield: "Yield (%) in culinary terms refers to how much of a product you will have available after trim loss of a finished or processed product. This usually refers to items such as fruits & vegetables. For example, after trimming of Romaine Lettuce you may be only left with a 70% yield (available portion for your recipe).",
          cost: "Cost ($) Is the actual dollar cost of the recipe based on the used ingredients and their cost.",
          rtype: "Here you have two choices which includes Single Serving and Batch. A single serving is a recipe created which is meant to one person. A Batch is meant to serve two or more people. You will be able to create the batch serving when you create your Menu in the next step.",
		  serv: "Total ounces in this batch.",
		  slife: "Enter the maximum number of days this batch is fit for consumption or use.",
		  i: "Please select the plus symbol below and to the right. Here you will add ingredients for the recipe.",
		  iname: "From the drop down list you can select the ingredients that are included in the named recipe. If you can’t locate the correct item you will need to return to the inventory setup page, add the item to your inventory list then return here in order to add the item to your Recipe.",
		  mtype: "Measure Type is how you measure your ingredients in either the form of a liquid or a dry.",
		  mlike: "Using the measure like feature considers the fact that there can be dozens of types of the same product and one dry item doesn’t produce the same content as another. For example, there are 25 different types of apples and a cup of salt does not yield the same as a cup of sugar. Use the measure like feature to identify your ingredient as closely as possible so that we can make the most accurate cost calculation.",
		  uom: "Select how you measure your ingredient.",
		  opu: "Enter the weight of one unit of the item in Ounces.",
		  amt: "Enter the amount used based on the selected unit of measure.",
		  icost: "This is the individual cost of the ingredient based on Measure Like, Unit of Measure and Amount.",
          c: "You may also add comment to each menu item."
        };
		that.menus_using_this_recipe_fetched = false;

		that.updateIngredients = function () {
			if((that.model.recipe_type  == 1 || that.model.recipe_type  == 2) && that.prepped_recipes){
			that.ingredients = ingredients.concat(that.prepped_recipes);
			}
			else if(that.model.recipe_type  == 3 || that.model.recipe_type  == 4){
				that.ingredients = ingredients;
			}
		}
		
		that.getUsedIn = function () {
			that.recipes_using_subrecipe_list = [];
			that.api.get_recipes_using_this_sub_recipe(that.recipe.id).then(function (res) {
				that.menus_using_this_recipe_fetched = true;
				if(typeof res.data.data.recipes_using_subrecipe_list != 'undefined' && res.data.data.recipes_using_subrecipe_list.length){
					that.recipes_using_subrecipe_list = res.data.data.recipes_using_subrecipe_list;
					for(var rs in that.recipes_using_subrecipe_list){
						that.recipes_using_subrecipe_list[rs].recipe_type = $filter('recipeTypeFilter')(that.get_refbooks.recipe_types, that.recipes_using_subrecipe_list[rs].recipe_type_id);
					}
				}
			});
		}
		
		that.revealUsedIn = function (state) {
			that.showUsedIn = state;
			if(that.showUsedIn && !that.recipes_using_subrecipe_list){
				that.getUsedIn();
			}
		}
		
		that.getMCP = function () {
			that.menus_using_this_recipe = [];
			that.api.get_menus_using_this_recipe(that.recipe.id).then(function (res) {
				that.menus_using_this_recipe_fetched = true;
				if(typeof res.data.data.menus_using_recipe_list != 'undefined' && res.data.data.menus_using_recipe_list.length){
					that.menus_using_this_recipe = res.data.data.menus_using_recipe_list;
					that.updateMCP();
				}
			});
		}
		
		that.revealMCP = function (state) {
			that.showMCP = state;
			if(that.showMCP && !that.menus_using_this_recipe_fetched){
				that.getMCP();
			}
		}
		
		that.updateMCP = function () {
			for(var i=0; i<that.menus_using_this_recipe.length; i++){
				var new_recipe_cost = (that.menus_using_this_recipe[i].recipes_amount / that.model.servings) * that.model.cost;
				var new_menu_cost = that.menus_using_this_recipe[i].cost + (new_recipe_cost - ((that.menus_using_this_recipe[i].recipes_amount / (that.recipe ? that.recipe.servings : 1)) * (that.recipe ? that.recipe.cost : 0)));
				that.menus_using_this_recipe[i].calc_cost = Math.round(new_menu_cost * 100) / 100;
				that.menus_using_this_recipe[i].calc_cost_percent = Math.round(((new_menu_cost / that.menus_using_this_recipe[i].price) * 100) * 100) / 100;
				/*console.log(that.menus_using_this_recipe[i].menu_item_name, 
							new_recipe_cost, 
							that.model.servings, 
							that.model.cost, 
							new_menu_cost, 
							(that.recipe ? that.recipe.servings : 1), 
							(that.recipe ? that.recipe.cost : 0), 
							that.menus_using_this_recipe[i].calc_cost_percent);*/
			}
		}
		
		
        function get_recipe_items(recipe) {

            var deferred = $q.defer();

            if (!recipe) {
                deferred.resolve([]);
                return deferred.promise;
            }

            var resArr = [];

            var m = {
                uom_conf: []
            };


            if (recipe.recipe_items) {
				
				if((recipe.recipe_type_id == 1 || recipe.recipe_type_id == 2) && that.prepped_recipes){
					that.ingredients = ingredients.concat(that.prepped_recipes);
				}
				else if(recipe.recipe_type_id == 3 || recipe.recipe_type_id == 4){
					that.ingredients = ingredients;
				}

                for (var i = 0; recipe.recipe_items.length > i; i++) {
                    resArr.push({
                        model: null,
                        measurement_like: recipe.recipe_items[i].measurement_like_type_id,
                        uom_id: recipe.recipe_items[i].uom_id,
						prepped_recipe_id: recipe.recipe_items[i].prepped_recipe_id,
                        measurement_type: recipe.recipe_items[i].measurement_type_id,
                        ingredient_id: recipe.recipe_items[i].vendor_sku_id,
						itype: (angular.isUndefined(recipe.recipe_items[i].vendor_sku_id) || recipe.recipe_items[i].vendor_sku_id === null) ? 'PP' : 'Regular',
						oz_per_unit: recipe.recipe_items[i].uom_id == 11 ? recipe.recipe_items[i].total_ounces / recipe.recipe_items[i].amount : 1,
                        amount: recipe.recipe_items[i].amount,
                        cost: recipe.recipe_items[i].cost,
						total_ounces: recipe.recipe_items[i].total_ounces,
                        time: new Date().getTime() + i, // fix ng-repeat,
						mtypes: []
                    });

                    for (var j = 0; that.ingredients.length > j; j++) {
						if(angular.isUndefined(resArr[i].ingredient_id) || resArr[i].ingredient_id === null){
							//pre-prepped_recipes
							if (that.ingredients[j].ppid === resArr[i].prepped_recipe_id) {
								resArr[i].model = that.ingredients[j];
								resArr[i].bu_model = that.ingredients[j];
								break
							}
						}
						else{
							if (that.ingredients[j].id === resArr[i].ingredient_id) {
								resArr[i].model = that.ingredients[j];
								resArr[i].bu_model = that.ingredients[j];
								if(resArr[i].model.category != 'Ready Made'){
									if(resArr[i].model.uom_id_of_delivery_unit == 10 || resArr[i].model.uom_id_of_delivery_unit == 11 || resArr[i].model.uom_id_of_delivery_unit == 12 || resArr[i].model.uom_id_of_delivery_unit == 13 || resArr[i].model.uom_id_of_delivery_unit == 16 || resArr[i].model.uom_id_of_delivery_unit == 17 || resArr[i].model.uom_id_of_delivery_unit == 18){
										for(var x=0; x<that.get_refbooks.measurement_types.length; x++){
											if(that.get_refbooks.measurement_types[x].name != 'Percentage' && that.get_refbooks.measurement_types[x].name != 'Volume'){
												resArr[i].mtypes.push(that.get_refbooks.measurement_types[x]);
											}
										}
									}
									else{
										for(var x=0; x<that.get_refbooks.measurement_types.length; x++){
											if(that.get_refbooks.measurement_types[x].name != 'Percentage'){
												resArr[i].mtypes.push(that.get_refbooks.measurement_types[x]);
											}
										}
									}
								}
								else{
									for(var x=0; x<that.get_refbooks.measurement_types.length; x++){
										resArr[i].mtypes.push(that.get_refbooks.measurement_types[x]);
									}
								}
								break
							}
						}
                    }
					
                    // find Measure Like
                    for (var l = 0; that.get_refbooks.measurement_likes.length > l; l++) {
                        if (that.get_refbooks.measurement_likes[l].id === resArr[i].measurement_like) {
                            resArr[i].measurement_like = that.get_refbooks.measurement_likes[l];
							
							//resArr[i].oz_per_unit = (resArr[i].measurement_type == 1) ? Math.round((resArr[i].oz_per_unit * resArr[i].measurement_like.yield), 2) : resArr[i].oz_per_unit;
							resArr[i].oz_per_unit = (resArr[i].measurement_type == 1) ? Math.round((resArr[i].oz_per_unit), 2) : resArr[i].oz_per_unit;	//removed yield
							//console.log(resArr[i].measurement_type, resArr[i].oz_per_unit,  resArr[i].measurement_like);
                            break
                        }
                    }

                    m.uom_conf.push({
                        measurement_type_id: recipe.recipe_items[i].measurement_type_id,
                        vendor_sku_id: recipe.recipe_items[i].vendor_sku_id
                    });
                }
		
                that.api.get_measure_units(m).then(function (res) {

                    var uomConformity = res.data.data.uomConformity;

                    for (var i = 0; recipe.recipe_items.length > i; i++) {
                        var a = [];

                        for (var j = 0; uomConformity.length > j; j++) {
                            if (uomConformity[j].vendor_sku_id === recipe.recipe_items[i].vendor_sku_id &&
                                (recipe.recipe_items[i].measurement_type_id === uomConformity[j].measurement_type_id)) {

                                // delete duplicates from "a" array
                                for (var l = 0; a.length > l; l++) {

                                    if (a[l].name === uomConformity[j].name
                                        && a[l].measurement_type_id === uomConformity[j].measurement_type_id
                                        && a[l].vendor_sku_id === uomConformity[j].vendor_sku_id) {
                                        a.splice(l, 1)
                                    }

                                }

                                a.push(uomConformity[j]);
                            }
                        }
						
						//Do not give unit/each mtype if the ingredient isnt delivered in the following countable units
						if(recipe.recipe_items[i].uom_id_of_delivery_unit != 10 && recipe.recipe_items[i].uom_id_of_delivery_unit != 11 && recipe.recipe_items[i].uom_id_of_delivery_unit != 12 && recipe.recipe_items[i].uom_id_of_delivery_unit != 13 && recipe.recipe_items[i].uom_id_of_delivery_unit != 16 && recipe.recipe_items[i].uom_id_of_delivery_unit != 17 && recipe.recipe_items[i].uom_id_of_delivery_unit != 18){
							for(var mu=0; mu<a.length; mu++){
								if(a[mu].measure_unit_id == 11){
									a.splice(mu, 1);
									break;
								}
							}
						}

                        that.measurement_units[i] = a;
                    }

                    deferred.resolve(resArr);
                });
            } else {
                deferred.resolve([]);
            }

            return deferred.promise;
        }

        that.model = {
            recipe_name: recipe ? recipe.recipe_name : null,
            servings: recipe ? recipe.servings : 1,
            recipe_type: recipe ? recipe.recipe_type_id : 1,
            shelf_life: recipe ? recipe.shelf_life : 1,
            yield: recipe ? recipe.yield : 100,
            cost: recipe ? recipe.cost : 0,
            ingredients: get_recipe_items(recipe).then(function (res) {
                that.model.ingredients = res
            }),
			description: recipe ? recipe.description : null,
			prep_time: recipe ? recipe.prep_time : 0,
			cook_time: recipe ? recipe.cook_time : 0,
			cook_method: recipe ? recipe.cook_method : null
        };
		
		if((that.model.recipe_type == 1 || that.model.recipe_type == 2) && that.prepped_recipes){
			that.ingredients = ingredients.concat(that.prepped_recipes);
		}
		else if(that.model.recipe_type == 3 || that.model.recipe_type == 4){
			that.ingredients = ingredients;
		}

		that.reset_mindex = function () {
			if(recipe){
				for(var i=0;i<that.all_recipes.length;i++){
					if(that.recipe.id == that.all_recipes[i].id){
						that.mindex = i;
						break;
					}
				}
			}
		}
		that.reset_mindex();
		
		that.resetMCP = function () {
			that.showMCP = false;
			that.menus_using_this_recipe_fetched = false;
			that.menus_using_this_recipe = [];
		}
		
		that.reset_model = function () {
			that.model.recipe_name = null;
            that.model.servings = 1;
            that.model.recipe_type = 1;
            that.model.shelf_life = 1;
            that.model.yield = 100;
            that.model.cost = 0;
            that.model.ingredients = [];
			that.model.description = null;
			that.model.prep_time = 0;
			that.model.cook_time = 0;
			that.model.cook_method = null;
			that.resetMCP();
        };
		
        that.calculateCostYield = function () {

            that.model.cost = 0;
            that.model.yield = 0;
			if(that.model.recipe_type != 1){
				that.model.servings = 0;
			}
            var totalAmount = 0;
            var yieldValue = 0;
            var yieldTotal = [];

            for (var i = 0; that.model.ingredients.length > i; i++) {

                that.model.cost += that.model.ingredients[i].cost;
				if(that.model.recipe_type != 1){
					that.model.servings += that.model.ingredients[i].total_ounces;
				}
				
                // for weight & volume
                if (that.model.ingredients[i].measurement_like && (that.model.ingredients[i].measurement_type === 1 || that.model.ingredients[i].measurement_type === 4)) {

                    if (that.model.ingredients[i].measurement_like.yield && that.model.ingredients[i].amount) {

                        yieldTotal.push(that.model.ingredients[i].measurement_like.yield * that.model.ingredients[i].amount);
                        totalAmount += that.model.ingredients[i].amount;

                    }
                }

                // for liquid
                if (that.model.ingredients[i].measurement_type === 2) {
                    yieldTotal.push(1 * that.model.ingredients[i].amount);
                    totalAmount += that.model.ingredients[i].amount;
                }
            }

            for (i = 0; yieldTotal.length > i; i++) {
                yieldValue += yieldTotal[i];
            }


            that.model.cost = parseFloat(that.model.cost.toFixed(2));
			that.model.servings = parseFloat(that.model.servings.toFixed(2));
            that.model.yield = parseFloat(((yieldValue / totalAmount) * 100).toFixed(2));

            if (isNaN(that.model.yield)) {
                that.model.yield = 100;
            }


        };
		
		that.update_note = function (key) {
          that.current_note = " "+that.notes[key];
        }

        that.reset_note = function () {
          that.current_note = that.default_note;
        }

		that.prev_recipe = function () {
			if(that.mindex != 0){
				that.mindex--;
				that.api.get_recipe(that.all_recipes[that.mindex].id).then(function (res) {
					that.reset_model();
					that.recipe = res.data.data.recipes_list[0];
					that.model = {
						recipe_name: that.recipe ? that.recipe.recipe_name : null,
						servings: that.recipe ? that.recipe.servings : 1,
						recipe_type: that.recipe ? that.recipe.recipe_type_id : 1,
						shelf_life: that.recipe ? that.recipe.shelf_life : 1,
						yield: that.recipe ? that.recipe.yield : 100,
						cost: that.recipe ? that.recipe.cost : 0,
						ingredients: get_recipe_items(that.recipe).then(function (res) {
							that.model.ingredients = res
						}),
						description: that.recipe ? that.recipe.description : null,
						prep_time: that.recipe ? that.recipe.prep_time : 0,
						cook_time: that.recipe ? that.recipe.cook_time : 0,
						cook_method: that.recipe ? that.recipe.cook_method : null
						
					};
					
					if((that.model.recipe_type == 1 || that.model.recipe_type == 2) && that.prepped_recipes){
						that.ingredients = ingredients.concat(that.prepped_recipes);
					}
					else if(that.model.recipe_type == 3 || that.model.recipe_type == 4){
						that.ingredients = ingredients;
					}
				});
			}
			
        }

		that.next_recipe = function () {
			if(that.mindex != that.all_recipes.length-1){
				that.mindex++;
				that.api.get_recipe(that.all_recipes[that.mindex].id).then(function (res) {
					that.reset_model();
					that.recipe = res.data.data.recipes_list[0];
					that.model = {
						recipe_name: that.recipe ? that.recipe.recipe_name : null,
						servings: that.recipe ? that.recipe.servings : 1,
						recipe_type: that.recipe ? that.recipe.recipe_type_id : 1,
						shelf_life: that.recipe ? that.recipe.shelf_life : 1,
						yield: that.recipe ? that.recipe.yield : 100,
						cost: that.recipe ? that.recipe.cost : 0,
						ingredients: get_recipe_items(that.recipe).then(function (res) {
							that.model.ingredients = res
						}),
						description: that.recipe ? that.recipe.description : null,
						prep_time: that.recipe ? that.recipe.prep_time : 0,
						cook_time: that.recipe ? that.recipe.cook_time : 0,
						cook_method: that.recipe ? that.recipe.cook_method : null
					};
					
					if((that.model.recipe_type == 1 || that.model.recipe_type == 2) && that.prepped_recipes){
						that.ingredients = ingredients.concat(that.prepped_recipes);
					}
					else if(that.model.recipe_type == 3 || that.model.recipe_type == 4){
						that.ingredients = ingredients;
					}
				});
			}
		}
		
        that.calculate = function ($index) {

            var m = that.model.ingredients[$index];

            if (!m) return;

			var cost = 0;
			if(m.itype == 'Regular'){
				if(m.measurement_type == 3){	//ready made items
					var caseCost = m.model.case_cost;
					var total_unit = m.model.total_unit_size;
					var amount = m.amount || 0;
					var pack_cost = m.model.pack_cost / m.model.total_unit_size || (m.model.case_cost / m.model.pack / m.model.total_unit_size);

					// 11 - it is ID of unit measure called "Each ..."
					var unit_cost = m.uom_id !== 11 ? caseCost / total_unit : pack_cost;
					
					cost = (amount / 100) * unit_cost;
				}
				else{	//non-ready made items
					if (!m.model || (((m.measurement_type === 1 && (m.model.uom_id_of_delivery_unit != 10 && m.model.uom_id_of_delivery_unit != 11 && m.model.uom_id_of_delivery_unit != 12 && m.model.uom_id_of_delivery_unit != 13 && m.model.uom_id_of_delivery_unit != 16 && m.model.uom_id_of_delivery_unit != 17 && m.model.uom_id_of_delivery_unit != 18)) || m.measurement_type === 4) && !m.measurement_like) || !m.uom_id || !m.measurement_type) {
					return
					}

					var findMetricLiqDry = function (deliveryIn, measureIn, measurement_type_id) {
						//console.log(deliveryIn, measureIn, measurement_type_id);
						for (var i = 0; that.get_refbooks.liquid_dry_conversion.length > i; i++) {
							if (that.get_refbooks.liquid_dry_conversion[i].measurement_type_id === measurement_type_id
								&& that.get_refbooks.liquid_dry_conversion[i].uom_id_of_delivery_unit == deliveryIn
								&& that.get_refbooks.liquid_dry_conversion[i].uom_id == measureIn) {
								return that.get_refbooks.liquid_dry_conversion[i].metric_conv_liq_dry || 1
							}
						}
						return 1
					};

					var caseCost = m.model.case_cost;
					var total_unit = m.model.total_unit_size;

					var metric_counter_liq_dry = findMetricLiqDry(m.model.uom_id_of_delivery_unit, m.uom_id, m.measurement_type);
					var oz_per_unit = m.oz_per_unit || 1;
					var amount = m.amount || 0;
					var yeld = m.measurement_like ? m.measurement_like.yield : null;
					var measure_like;
					//var pack_cost = m.model.pack_cost / m.model.total_unit_size || (m.model.case_cost / m.model.pack / m.model.total_unit_size);
					var pack_cost = m.model.pack_cost;

					// 11 - it is ID of unit measure called "Each ..."
					//var unit_cost = m.uom_id !== 11 ? caseCost / total_unit : pack_cost;
					var unit_cost = m.model.unit_cost
					
					if (m.measurement_like) {
						measure_like = m.measurement_like.converter_value || 1
					}

					//new start if-else
					if(m.model.uom_id_of_delivery_unit == 10 || m.model.uom_id_of_delivery_unit == 11 || m.model.uom_id_of_delivery_unit == 12 || m.model.uom_id_of_delivery_unit == 13 || m.model.uom_id_of_delivery_unit == 16 || m.model.uom_id_of_delivery_unit == 17 || m.model.uom_id_of_delivery_unit == 18){
						cost = unit_cost * amount;
						
						if (yeld !== null) {
							cost = cost / yeld
						}
					}
					//new end
					else{
						
						cost = unit_cost * metric_counter_liq_dry * amount;
						if((m.model.uom_id_of_delivery_unit == 1 && m.uom_id == 4) || (m.model.uom_id_of_delivery_unit == 2 && m.uom_id == 5) || (m.model.uom_id_of_delivery_unit == 3 && m.uom_id == 8) || (m.model.uom_id_of_delivery_unit == 4 && m.uom_id == 7) || (m.model.uom_id_of_delivery_unit == 5 && m.uom_id == 3) || (m.model.uom_id_of_delivery_unit == 5 && m.uom_id == 13) || (m.model.uom_id_of_delivery_unit == 6 && m.uom_id == 9) || (m.model.uom_id_of_delivery_unit == 6 && m.uom_id == 16) || (m.model.uom_id_of_delivery_unit == 7 && m.uom_id == 10) || (m.model.uom_id_of_delivery_unit == 7 && m.uom_id == 17) || (m.model.uom_id_of_delivery_unit == 8 && m.uom_id == 6) || (m.model.uom_id_of_delivery_unit == 9 && m.uom_id == 2) || (m.model.uom_id_of_delivery_unit == 14 && m.uom_id == 19) || (m.model.uom_id_of_delivery_unit == 20 && m.uom_id == 1) || (m.model.uom_id_of_delivery_unit == 20 && m.uom_id == 12)){
							//do nothing for measure like calculation step
						}
						else{
							if (m.measurement_type === 4) {
								cost = cost * measure_like;
							}
						}
						
						if (yeld !== null) {
							cost = cost / yeld
						}
					}
				}

				var uod_to_oz = findMetricLiqDry(m.model.uom_id_of_delivery_unit, (m.measurement_type == 1 ? 13 : m.measurement_type == 2 ? 3 : m.measurement_type == 4 ? 21 : m.uom_id), m.measurement_type);
				//that.model.ingredients[$index].total_ounces = m.measurement_type == 1 || m.measurement_type == 4 ? (((oz_per_unit * amount * metric_counter_liq_dry * (m.measurement_type == 1 ? 1 : measure_like)) / (yeld == null ? 1 : yeld)) / uod_to_oz) : ((oz_per_unit * amount * metric_counter_liq_dry) / uod_to_oz);
				that.model.ingredients[$index].total_ounces = m.measurement_type == 1 || m.measurement_type == 4 ? (((oz_per_unit * amount * metric_counter_liq_dry * (m.measurement_type == 1 ? 1 : measure_like)) ) / uod_to_oz) : ((oz_per_unit * amount * metric_counter_liq_dry) / uod_to_oz);	//removed yield so that total oz doesnt consider it
			}
			else if(m.itype == 'PP'){
				var amount = m.amount || 0;
				cost = amount * (m.model.cost / m.model.servings);
				that.model.ingredients[$index].total_ounces = amount;
			}

			cost = Math.round(cost * 1000) / 1000;
			that.model.ingredients[$index].cost = cost;

			that.calculateCostYield();
        };

        that.ingredientSelected = function (item, $index) {
			var is_insert_new_inv = false;
			if(item.id == -1){
				is_insert_new_inv = true;
				item = that.model.ingredients[$index].bu_model ? that.model.ingredients[$index].bu_model : null;
			}
			
			if(item != null){
				that.model.ingredients[$index].model = item;
				that.model.ingredients[$index].cost = 0;

				//start new code
				that.model.ingredients[$index].mtypes = [];
				if(item.category != 'Ready Made'){
					if(that.model.ingredients[$index].model.uom_id_of_delivery_unit == 10 || that.model.ingredients[$index].model.uom_id_of_delivery_unit == 11 || that.model.ingredients[$index].model.uom_id_of_delivery_unit == 12 || that.model.ingredients[$index].model.uom_id_of_delivery_unit == 13 || that.model.ingredients[$index].model.uom_id_of_delivery_unit == 16 || that.model.ingredients[$index].model.uom_id_of_delivery_unit == 17 || that.model.ingredients[$index].model.uom_id_of_delivery_unit == 18){
						for(var i=0; i<that.get_refbooks.measurement_types.length; i++){
							if(that.get_refbooks.measurement_types[i].name != 'Percentage' && that.get_refbooks.measurement_types[i].name != 'Volume'){
								that.model.ingredients[$index].mtypes.push(that.get_refbooks.measurement_types[i]);
							}
						}
					}
					else{
						for(var i=0; i<that.get_refbooks.measurement_types.length; i++){
							if(that.get_refbooks.measurement_types[i].name != 'Percentage'){
								that.model.ingredients[$index].mtypes.push(that.get_refbooks.measurement_types[i]);
							}
						}
					}
				}
				else{
					for(var i=0; i<that.get_refbooks.measurement_types.length; i++){
						that.model.ingredients[$index].mtypes.push(that.get_refbooks.measurement_types[i]);
					}
				}
				//end new code
				
				if(angular.isUndefined(item.ppid) || item.ppid === null){
					that.model.ingredients[$index].ingredient_id = item.id;
					that.model.ingredients[$index].itype = 'Regular';
					that.model.ingredients[$index].measurement_type = null;
					that.model.ingredients[$index].measurement_like = null;
					that.model.ingredients[$index].uom_id = null;
					that.model.ingredients[$index].prepped_recipe_id = null;
				}
				else{
					that.model.ingredients[$index].prepped_recipe_id = item.ppid;
					that.model.ingredients[$index].itype = 'PP';
					that.model.ingredients[$index].measurement_type = null;
					that.model.ingredients[$index].measurement_like = null;
					that.model.ingredients[$index].uom_id = null;
					that.model.ingredients[$index].ingredient_id = null;
				}
				
				if(that.model.ingredients[$index].itype == 'PP'){
					if(that.model.ingredients[$index].model.recipe_type_id == 4){
						that.model.ingredients[$index].amount = that.model.ingredients[$index].model.servings;
					}
				}
			}
			else{
				that.model.ingredients[$index].model = null;
			}
			
			that.model.ingredients[$index].bu_model = that.model.ingredients[$index].model;
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

		/*that.editSKUItem = function () {
			var modalInstance = $uibModal.open({
                templateUrl: 'edit_SKU_item.html',
                controller: editSKUmodalController,
                windowClass: "animated fadeIn modal-lgg",
                controllerAs: '$ctr',
                size: 'lg',
                resolve: {
                    recipe: function () {
                        return recipe;
                    }
                }
            });
		}*/

        that.addIngredient = function () {
            that.model.ingredients.push({
                ingredient_id: null,
                measurement_type: null,
                measurement_like: null,
				oz_per_unit: 1,
                amount: null,
                cost: 0,
                uom_id: null,
                time: new Date().getTime() // fix ng-repeat
            });
            that.measurement_units.push({});
        };

        that.removeIngredient = function ($index) {
            that.measurement_units.splice($index, 1);
            that.model.ingredients.splice($index, 1);
            that.calculateCostYield()

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
                inventory_type_id: 1,
                recipe_name: that.model.recipe_name,
                recipe_type_id: that.model.recipe_type,
                servings: that.model.recipe_type !== 1 ? that.model.servings : 1,
                shelf_life: that.model.recipe_type !== 1 ? that.model.shelf_life : 1,
                yield: that.model.yield,
                cost: that.model.cost,
                recipe_items: [],
				description: that.model.description,
				prep_time: that.model.prep_time,
				cook_time: that.model.cook_time,
				cook_method: that.model.cook_method
            };
            for (var i = 0; that.model.ingredients.length > i; i++) {
                m.recipe_items.push({
                    vendor_sku_id: that.model.ingredients[i].ingredient_id,
					prepped_recipe_id: (angular.isUndefined(that.model.ingredients[i].prepped_recipe_id)) ? null : that.model.ingredients[i].prepped_recipe_id,
                    measurement_type_id: that.model.ingredients[i].measurement_type,
                    uom_id: that.model.ingredients[i].uom_id, // unit of measure
                    amount: that.model.ingredients[i].amount,
                    cost: that.model.ingredients[i].cost,
                    yield: that.model.ingredients[i].yield,
					total_ounces: that.model.ingredients[i].total_ounces
                });

				//console.log(that.model.ingredients[i]);
                if ((that.model.ingredients[i].measurement_type === 1 && (that.model.ingredients[i].model.uom_id_of_delivery_unit != 10 && that.model.ingredients[i].model.uom_id_of_delivery_unit != 11 && that.model.ingredients[i].model.uom_id_of_delivery_unit != 12 && that.model.ingredients[i].model.uom_id_of_delivery_unit != 13 && that.model.ingredients[i].model.uom_id_of_delivery_unit != 16 && that.model.ingredients[i].model.uom_id_of_delivery_unit != 17 && that.model.ingredients[i].model.uom_id_of_delivery_unit != 18)) || that.model.ingredients[i].measurement_type === 4) {
                    m.recipe_items[m.recipe_items.length - 1].measurement_like_type_id = that.model.ingredients[i].measurement_like.id
                }
            }

			//console.log(m);
            // create
            if (!that.recipe) {
                that.api.save_recipe(m).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
							swal({
								title: "Recipe updated successfully!",
								timer: 1500,
								showConfirmButton: false,
								type: "success"
							  });
                            //$uibModalInstance.close();
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            } else {
                // update
                that.api.update_recipe(that.recipe.id, m).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
							swal({
								title: "Recipe updated successfully!",
								timer: 1500,
								showConfirmButton: false,
								type: "success"
							  });
							//that.recipe.servings = that.model.servings;
							//that.recipe.cost = that.model.cost;
							that.resetMCP();
                            //$uibModalInstance.close();
                        }
                    } catch (e) {
                        console.log(e)
                    }
                });
            }

        };

        that.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        that.get_measure_units = function (item, $index) {

            if (!item.measurement_type || !item.ingredient_id) return;
			
            var m = {
                uom_conf: [{
                    measurement_type_id: item.measurement_type,
                    vendor_sku_id: item.ingredient_id
                }]
            };

            that.api.get_measure_units(m).then(function (res) {
                that.measurement_units[$index] = res.data.data.uomConformity

				//Do not give unit/each mtype if the ingredient isnt delivered in the following countable units
				if(item.model.uom_id_of_delivery_unit != 10 && item.model.uom_id_of_delivery_unit != 11 && item.model.uom_id_of_delivery_unit != 12 && item.model.uom_id_of_delivery_unit != 13 && item.model.uom_id_of_delivery_unit != 16 && item.model.uom_id_of_delivery_unit != 17 && item.model.uom_id_of_delivery_unit != 18){
					for(var mu=0; mu<that.measurement_units[$index].length; mu++){
						if(that.measurement_units[$index][mu].measure_unit_id == 11){
							that.measurement_units[$index].splice(mu, 1);
							break;
						}
					}
				}
            });
        };
    }
	
    function controller($scope, $state, localStorageService, auth, api, core, $filter, $uibModal, $q) {

        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
		
        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        that.recipes = [];

        that.searchModel = {
            order_by: 'item_name', // id, name, city, date, zip
            order_way: "ASC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 10, //25 by default,
            inRequest: false,
            paginationTotal: 0,
			recipe_name: null,
            inventory_type_id: 1,
            mode: 'training',
            recipe_type: null,
        };

        $scope.tfile = function (index) {
            $('#image-' + index).click();
        }
        $scope.cancelUpload = function (index) {
            that.recipes[index].recipe_image_url = $scope.tempImageUrl;
            $('#fileBtn-' + index).show();
            $('#uploadBtn-' + index).hide();
            $('#cancelBtn-' + index).hide();
        }
        $scope.tempImageUrl = "";

        $scope.uploadFile = function (index) {
            that.api.upload_recipe_image({
				inventory_type_id: 1,
                recipe_id: that.recipes[index].id,
                image: that.recipes[index].recipe_image_url
            }).then(function (res) {
                $('#fileBtn-' + index).show();
                $('#uploadBtn-' + index).hide();
                $('#cancelBtn-' + index).hide();
            });
        }

        $scope.getFile = function (file, index) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                $scope.$apply(function () {
                    $scope.tempImageUrl = that.recipes[index].recipe_image_url;
                    that.recipes[index].recipe_image_url = fileReader.result;
                    // console.log(that.recipes[index].recipe_image_url);
                });
            };
            fileReader.readAsDataURL(file)

            $('#fileBtn-' + index).hide()
            $('#uploadBtn-' + index).show();
            $('#cancelBtn-' + index).show();
        };

        $scope.print_loading = false;
        $scope.generatePDF = function () {
            $scope.print_loading = true;
            that.getAllRecipes(1, 1);
        }
		
        that.generatePDFCall = function () {
            swal({
                title: "",
                text: "Printing...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
			var element = $("#recipes-wrapper");
			var buttonsToHide = element.find("button:visible").hide();
            kendo.drawing.drawDOM($("#recipes-wrapper"), {
                paperSize: "A4",
                forcePageBreak: ".page-break",
                landscape: true,
                scale: 0.9
            }).then(function (group) {
                $scope.print_loading = false;
                    if (that.browserType() == "safari") {
                        kendo.drawing.pdf.saveAs(group, "recipe-review.pdf");
                    } else {
                        var windowReference = window.open();
                        kendo.drawing.pdf.toBlob(group, function (blob) {
                            // window.open(url, '_blank');
                            windowReference.location = window.URL.createObjectURL(blob);
                        });
                    }
                    that.getAllRecipes(0);
                    swal.close()
            }).done(function(){
				buttonsToHide.show();
			});
        }
		
		that.browserType = function () {
            var userAgent = navigator.userAgent;
            var browserName;

            if(userAgent.match(/chrome|chromium|crios/i)){
                browserName = "chrome";
            }else if(userAgent.match(/firefox|fxios/i)){
                browserName = "firefox";
            }  else if(userAgent.match(/safari/i)){
                browserName = "safari";
            }else if(userAgent.match(/opr\//i)){
                browserName = "opera";
            } else if(userAgent.match(/edg/i)){
                browserName = "edge";
            }else{
                browserName="No browser detection";
            }
            return browserName;
        }
		
        that.changeList = function (caller) {
            that.getAllRecipes(1);
        };

        that.getAllRecipes = function (keyword, print) {
            that.recipes = [];
            document.body.scrollTop = 0;
            var m = {
                mode: 'training',
                inventory_type_id: that.searchModel.inventory_type_id,
                recipe_type: that.searchModel.recipe_type,
                // order_by: that.searchModel.order_by,
                // order_way: that.searchModel.order_way,
				recipe_name: that.searchModel.recipe_name,
                paginationOffset: that.searchModel.paginationOffset,
                paginationCount: that.searchModel.paginationCount,
            };
            if (that.searchModel.recipe_type) {
                m.recipe_type = that.searchModel.recipe_type
            }

            for (var i in m) {
                //if (!m[i]) {
                if (m[i] == null || m[i] == "") {
                    delete m[i]
                }
            }
            if (keyword) {
                that.searchModel.paginationOffset = 0
                m.paginationOffset = 0;
            } else {
                if (m.paginationOffset > 0) {
                    m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
                }
            }
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            if (print) {
                m = {
                    recipe_type: that.searchModel.recipe_type,
                    inventory_type_id: that.searchModel.inventory_type_id,
                    mode: 'training',
                }
            }
            that.api.get_recipes(m).then(function (res) {
				try {
					that.searchModel.paginationTotal = res.data.data.total;
					that.recipes = res.data.data.recipes_list;
					swal.close()
				} catch (e) {
					console.log(e)
					swal.close()
				}
				setTimeout(function () {
					$('.recipe_image').each(function () {
						var oneTime = 1;
						this.onload = function () {
							if (oneTime === 1) {
								var bData = $scope.getBase64Image($(this)[0]);
								this.setAttribute('src', bData)
								oneTime++
							}
						}
					})
					if (print) {
						that.generatePDFCall()
					}
				}, 1000)
            });
        };
        $scope.getBase64Image = function (img) {
            // img.setAttribute('crossOrigin', 'anonymous');
            var canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            return canvas.toDataURL("image/png");
        }

		that.edit = function (recipe) {
			that.api.get_recipe(recipe.id).then(function (res) {
				that.add(res.data.data.recipes_list[0]);
			});
		};
		
		that.add = function (recipe) {
			var modalInstance = $uibModal.open({
				templateUrl: 'add_new_recipe_item.html',
				controller: modalController,
				windowClass: "animated fadeIn modal-lgg",
				controllerAs: '$ctr',
				size: 'lg',
				resolve: {
					recipe: function () {
						return recipe;
					},
					get_refbooks: function () {
						if (that.get_refbooks) return that.get_refbooks;
						return that.core.getRefbooks().then(function (res) {
							return that.get_refbooks = res;
						})
					},
					all_recipes: function () {
						if(recipe) return that.all_recipes_bu;
					},
					ingredients: function () {
						if (that.ingredients) return that.ingredients;
						return that.api.get_active_inventory_by_vendor({inventory_type_id: 1, caller: 'recipe_edit'}, that.restaurant_id.restaurant_id).then(function (res) {
							return res.data.data.sku
						})
					},
					prepped_recipes: function () {
						if (that.all_recipes_bu) {
							return that.getPPR();
						}
						return that.processPPR();
					},
					rest_id: function () {
						return that.restaurant_id.restaurant_id;
					}
				}
			});

			modalInstance.result.then(function () {
				alertService.showAlertSave();
				that.getAllRecipes();
			}, function () {
				that.getAllRecipes();
			});
		};
		
		that.getPPR = function () {
			var ppr = [];
			for(var i=0; i<that.all_recipes_bu.length; i++){
				if(that.all_recipes_bu[i].recipe_type_id === 3 || that.all_recipes_bu[i].recipe_type_id === 4){
					var ppr_name = $filter('recipeTypeFilter')(that.get_refbooks.recipe_types, that.all_recipes_bu[i].recipe_type_id);
					var ri = that.all_recipes_bu[i];
					ri.ppid = ri.id;
					ri.item_name = ri.recipe_name;
					ri.category = ppr_name;
					ri.vendor_name = ppr_name;
					ppr.push(ri);
				}
			}
			return ppr;
		}
		
		that.processPPR = function () {
			that.getRecipesBu().then(function (res) {
				return that.getPPR();
			});
		}
		
		that.getRecipesBu = function () {
			var deferred = $q.defer();
			var m = {
				inventory_type_id: 1
			}
            that.api.get_recipes(m).then(function (res) {
				try {
					that.all_recipes_bu = JSON.parse(JSON.stringify(res.data.data.recipes_list));
				} catch (e) {
					console.log(e)
				}
				deferred.resolve();
            });
			return deferred.promise;
		}
		
        that.$onInit = function () {
			Promise.all([that.getRecipesBu()]).then(function(response) {
				that.core.getRefbooks().then(function (res) {
					that.get_refbooks = res;
					that.get_refbooks.dd_recipe_types = JSON.parse(JSON.stringify(that.get_refbooks.recipe_types));
					that.get_refbooks.dd_recipe_types_filter = JSON.parse(JSON.stringify(that.get_refbooks.recipe_types));
					for(var rt in that.get_refbooks.dd_recipe_types){
						var rtt = that.get_refbooks.dd_recipe_types[rt];
						if(rtt.id == 1){
							rtt.name += " (cannot be added to another recipe)";
						}
						else if(rtt.id == 2){
							rtt.name += " (cannot be added to another recipe)";
						}
						else if(rtt.id == 3){
							rtt.name += " (can be added to a Batch Recipe or Basic Recipe)";
						}
						else if(rtt.id == 4){
							rtt.name += " (can be added to a Batch Recipe or Basic Recipe)";
						}
					}
					that.get_refbooks.dd_recipe_types_filter.splice(3, 1)
					that.get_refbooks.dd_recipe_types_filter.unshift({id: null, name: 'All'});
					that.getAllRecipes(1);
					that.export_loading = false;
				});
			});
        };

    }
	
    var ngFileSelect = function () {
        return {
            scope: {someCtrlFn: '&callbackFn'},
            link: function ($scope, el) {
                el.bind("change", function (e) {
                    $scope.file = (e.srcElement || e.target).files[0];
                    $scope.someCtrlFn({file: $scope.file});
                })
            }
        }
    }

    controller.$inject = ['$scope', '$state', 'localStorageService', 'auth', 'api', 'core', '$filter', '$uibModal', '$q',];

    angular.module('inspinia')
        .component('recipeReviewComponent', {
            templateUrl: 'js/components/foodSetup/recipeReview/recipeReview.html',
            controller: controller,
            controllerAs: '$ctr',
            bindings: {}
        }).directive('ngFileSelect', ngFileSelect);

})();
