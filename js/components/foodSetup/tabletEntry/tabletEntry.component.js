(function() {
  "use strict";
	
	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Inventory Audit Help';
						
		that.q_texts = '<article style="display: block;"><p><b>Inventory Audit</b> – Please check out our instruction video <a href="https://youtu.be/GZ2GagdCvzg" target="_blank">here</a>.</li></ul></p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
	function tabletEntryController(api, $state, auth, $filter, localStorageService, restaurant, core, alertService, SweetAlert, $uibModal) {
		if (!auth.authentication.isLogged) {
			$state.go("home");
			return;
		}

		var that = this;

		that.api = api;
		that.auth = auth;
		//that.typeInventory = $state.params.typeInventory; // full, adjustment
		that.is_sug_aud = typeof $state.params.is_sug_aud != 'undefined' && $state.params.is_sug_aud != '' ? $state.params.is_sug_aud : 'false'; // true/false to call suggested or regular
		if (restaurant.data.permissions) {
			that.permissions = restaurant.data.permissions;
		}

		that.restaurant_id = localStorageService.get("restaurant_id"); // {restaurant_id : 323}

		if (!that.restaurant_id) {
			$state.go("home");
			return;
		}		
		
		
		that.pickers = {
		  beginDate: {
			open: false,
			date: new Date()
		  },
		  endDate: {
			open: false,
			date: new Date()
		  },
		  beginDateBackup: {
			open: false,
			date: new Date()
		  }
		};
		
		var date = new Date();
		var d = date;
		var month = d.getMonth()+1;
		var day = d.getDate();
		that.maxBatchCreationDate = d.getFullYear() + '-' +
			 ((''+month).length<2 ? '0' : '') + month + '-' +
			 ((''+day).length<2 ? '0' : '') + day;

		var INVENTORY_MASTER_LIST = [];
		that.currentFoodIndex = 0;
    
		that.model = {
			categories: [],
			subcategories: [],
			quick_search_keys: [],
			prev_item: null,
			current_item: null,
			next_item: null,
			search_query: null,
			inventory: [],
			full_total: null,
			pack_total: null,
			partial_total: null,
			n_partial_entries: null,
			batch_input_modes: ['Oz', 'Lbs', 'Batches'],
			selected_batch_input_mode: null
		};
		
		that.changeLocation = function() {
			if(that.selected_location == -1){
				that.selected_location = that.locations[0].sr_no;
				var modalInstance = $uibModal.open({
					templateUrl: "js/components/foodSetup/tabletEntry/locationEntry.html",
					controller: "addEditFoodLocationsController",
					windowClass: "animated fadeIn",
					controllerAs: "$ctr",
					size: "md",
					resolve: {
						locations: function () {
							return that.locations.filter(function(x){return x.sr_no != -1});
						},
						restaurant_id: function () {
							return that.restaurant_id.restaurant_id;
						},
					}
				});
				
				modalInstance.closed.then(function() {
					that.getLocations();
				});
			}
		}
		
		/** Add unique items */
		that.addUniqueItems = function() {
			if(that.mode == 'inv'){
				var headers = {
					is_adjustment: 0,
					inventory_type_id: 1,
					vendor_cat_id: that.selected_category.id == 'all' ? null : that.selected_category.id,
					vendor_sku_id: that.model.current_item.vendor_sku_id
				};
					
				that.api.get_inventory_audit(headers).then(function(res) {
					if(res.data.data.inventory.length){
						that.model.current_item.full_values = res.data.data.inventory[0].full_values;
						that.model.current_item.pack_values = res.data.data.inventory[0].pack_values;
						that.model.current_item.partial_values = res.data.data.inventory[0].partial_values;
					}
				
					var modalInstance = $uibModal.open({
						templateUrl: "js/components/foodSetup/tabletEntry/modalEntry.html",
						controller: "addFoodItemsController",
						windowClass: "animated fadeIn modal-lgg",
						controllerAs: "$ctr",
						size: "lg",
						resolve: {
							searchParams: function () {
								return {item: that.model.current_item, mode: that.mode};
							},
							locations: function () {
								return that.locations.filter(function(x){return x.sr_no != -1});
							},
							selected_location: function () {
								return that.selected_location;
							}
						}
					});
				
					modalInstance.result.then(function() {
						//that.model.current_item.full_values = that.model.current_item.packs_qty_inp != null ? that.model.current_item.full_values != null ? that.model.current_item.full_values + "+" + that.model.current_item.packs_qty_inp.toString() : that.model.current_item.packs_qty_inp.toString() : that.model.current_item.full_values != null ? that.model.current_item.full_values : null;
						
						//that.model.current_item.partial_values = that.model.current_item.item_qty_inp != null ? that.model.current_item.partial_values != null ? that.model.current_item.partial_values + "+" + that.model.current_item.item_qty_inp.toString() : that.model.current_item.item_qty_inp.toString() : that.model.current_item.partial_values != null ? that.model.current_item.partial_values : null;
						that._recalculateTotal();
						var item = {
							id: that.model.current_item.id,
							vendor_sku_id: that.model.current_item.vendor_sku_id,
							item_qty: that.model.current_item.partial_total,
							cases_qty: that.model.current_item.full_total,
							nof_bottles: 0,
							packs_qty: that.model.current_item.pack_total,
							total_in_uom_of_delivery: that.calculate_uom_of_delivery(that.model.current_item),
							item_qty_formula: null,
							full_values: that.model.current_item.full_values,
							pack_values: that.model.current_item.pack_values,
							partial_values: that.model.current_item.partial_values
						};
						
						that._submitInventory(item, true);
					});
				});
			}
			else{
				var headers = {
					is_adjustment: 0,
					inventory_type_id: 1,
					recipe_type_id: that.selected_category.r_type_id,
					recipe_id: that.model.current_item.recipe_id
				};
					
				that.api.get_recipe_audit(headers).then(function (res) {
					if(res.data.data.inventory.length){
						//group batches with same recipe_id
						var dict = {};
						for(var i = 0; i< res.data.data.inventory.length; i++){
							if(!dict.hasOwnProperty(res.data.data.inventory[i].recipe_id)){
								dict[res.data.data.inventory[i].recipe_id] = [res.data.data.inventory[i]];
							}
							else{
								dict[res.data.data.inventory[i].recipe_id].push(res.data.data.inventory[i]);
							}
						}
						
						for(var b in dict){
							that.model.current_item.items = dict[b];
						}
					}
					
					var modalInstance = $uibModal.open({
						templateUrl: "js/components/foodSetup/tabletEntry/modalEntry.html",
						controller: "addFoodItemsController",
						windowClass: "animated fadeIn modal-lgg",
						controllerAs: "$ctr",
						size: "md",
						resolve: {
							searchParams: function () {
								return {item: that.model.current_item, mode: that.mode};
							},
							locations: function () {
								return that.locations.filter(function(x){return x.sr_no != -1});
							},
							selected_location: function () {
								return that.selected_location;
							}
						}
					});
				
					modalInstance.result.then(function() {
						that._recalculateTotal();
						var items = [];
						for(var i = 0; i< that.model.current_item.items.length; i++){
							items.push({
								id: that.model.current_item.items[i].id,
								recipe_type_id: that.model.current_item.items[i].recipe_type_id,
								total_servings: that.model.current_item.items[i].total_servings,
								full_qty: that.model.current_item.items[i].full_total,
								partial_qty: that.model.current_item.items[i].partial_total,
								is_ref: 0,
								recipe_created_on: that.model.current_item.items[i].recipe_created_on,
								full_values: that.model.current_item.items[i].full_values,
								partial_values: that.model.current_item.items[i].partial_values
							});
						}
						
						that._submitBatches(items);
					});
				});
			}
		};
		
		that.prepBatchObjAndSave = function() {
			var no_date = true;
			var indx = 0;
			// convert inp to full if Oz, Lbs
			if(that.model.selected_batch_input_mode == 'Oz'){				
				that.model.current_item.packs_qty_inp = (that.model.current_item.packs_qty_inp / that.model.current_item.total_servings).toFixed(2);
			}
			else if(that.model.selected_batch_input_mode == 'Lbs'){
				that.model.current_item.packs_qty_inp = ((that.model.current_item.packs_qty_inp * 16) / that.model.current_item.total_servings).toFixed(2);
			}
			
			for(var i = 0; i< that.model.current_item.items.length; i++){
				if($filter('date')(that.model.current_item.items[i].recipe_created_on, 'yyyy-MM-dd') == $filter('date')(that.model.current_item.created_on_inp, 'yyyy-MM-dd')){
					no_date = false;
					indx = i;
					
					
					that.model.current_item.items[i].full_values = that.model.current_item.packs_qty_inp != null ? that.model.current_item.items[i].full_values != null ? that.model.current_item.items[i].full_values + "+" + that.model.current_item.packs_qty_inp.toString() : that.model.current_item.packs_qty_inp.toString() : that.model.current_item.items[i].full_values != null ? that.model.current_item.items[i].full_values + "+0" : "0";
					
					that.model.current_item.items[i].partial_values = that.model.current_item.item_qty_inp != null ? that.model.current_item.items[i].partial_values != null ? that.model.current_item.items[i].partial_values + "+" + that.model.current_item.item_qty_inp.toString() : that.model.current_item.item_qty_inp.toString() : that.model.current_item.items[i].partial_values != null ? that.model.current_item.items[i].partial_values + "+0" : "0";
					break;
				}
			}
			
			
			if(no_date){
				
				that.model.current_item.items.push(JSON.parse(JSON.stringify(that.model.current_item.items[0])));
				var nd = that.model.current_item.items.length - 1;
				that.model.current_item.items[nd].recipe_created_on = $filter('date')(that.model.current_item.created_on_inp, 'yyyy-MM-dd');
				that.model.current_item.items[nd].full_values = that.model.current_item.packs_qty_inp != null ? that.model.current_item.packs_qty_inp.toString() : "0";
					
				that.model.current_item.items[nd].partial_values = that.model.current_item.item_qty_inp != null ? that.model.current_item.item_qty_inp.toString() : "0";
				indx = nd;
			}
			
			
			that._recalculateTotal(indx, that.model.current_item.created_on_inp);
			var items = [{
				id: that.model.current_item.items[indx].id,
				recipe_type_id: that.model.current_item.items[indx].recipe_type_id,
				total_servings: that.model.current_item.items[indx].total_servings,
				full_qty: that.model.current_item.items[indx].full_total,
				partial_qty: that.model.current_item.items[indx].partial_total,
				is_ref: 0,
				recipe_created_on: that.model.current_item.created_on_inp ? $filter('date')(that.model.current_item.created_on_inp, 'yyyy-MM-dd') : null,
				full_values: that.model.current_item.items[indx].full_values,
				partial_values: that.model.current_item.items[indx].partial_values
			}];
			
			that._submitBatches(items);
		}
		
		/** Submit batch item */
		that.handleSubmitBatches = function() {
			if(that.model.current_item.created_on_inp > new Date()){
				alertService.showError("Invalid date!");
				return;
			}
			else{
				if (that.model.current_item.packs_qty_inp || that.model.current_item.item_qty_inp) {
					var headers = {
						is_adjustment: 0,
						inventory_type_id: 1,
						recipe_type_id: that.selected_category.r_type_id,
						recipe_id: that.model.current_item.recipe_id
					};
					
					that.api.get_recipe_audit(headers).then(function (res) {
						if(res.data.data.inventory.length){
							//group batches with same recipe_id
							var dict = {};
							for(var i = 0; i< res.data.data.inventory.length; i++){
								if(!dict.hasOwnProperty(res.data.data.inventory[i].recipe_id)){
									dict[res.data.data.inventory[i].recipe_id] = [res.data.data.inventory[i]];
								}
								else{
									dict[res.data.data.inventory[i].recipe_id].push(res.data.data.inventory[i]);
								}
							}
							
							for(var b in dict){
								that.model.current_item.items = dict[b];
							}
						}
						
						//chk shelf life and show warning else save directly
						var temp_date = new Date(that.model.current_item.created_on_inp);
						var expiry = new Date(temp_date.setDate(temp_date.getDate() + that.model.current_item.shelf_life));
						if(that.pickers.beginDate.date >= expiry){
							SweetAlert.swal({
										title: "Batch Expired?",
										text: "This batch seems to have expired! Verify the batch creation date before you Save.",
										type: "warning",
										showCancelButton: true,
										confirmButtonColor: "#337ab7",
										confirmButtonText: "Save"
									},
									function (res) {
										if (res) {
											that.prepBatchObjAndSave();
										}
									});
						}
						else{
							that.prepBatchObjAndSave();
						}
					});
				}
			}
		};
		
		//update subcategory of an item
		that.handleSubmitSubcategory = function() {
			if(that.model.current_item.vendor_sub_cat_id == null){
				alertService.showError("Please select a subcategory.");
				return;
			}
			SweetAlert.swal(
				{
				  title: "Are you sure?",
				  text:
					"Are you sure you want to change the subcategory of the item. This change could affect multiple reports.",
				  type: "warning",
				  showCancelButton: true,
				  confirmButtonColor: "#ed5565",
				  confirmButtonText: "Confirm"
				},
				function(res) {
					if (res) {
						var m = {
						  vendor_sub_cat_id: that.model.current_item.vendor_sub_cat_id
						};
						
						that.api
						  .update_sku(that.model.current_item.vendor_sku_id, m)
						  .then(function(res) {
							if(res.status === 200) {
								that.disableCheckBoxes();
								SweetAlert.swal("Saved!", "Your changes has been saved!", "success");
							}
						  });
					}
				}
			);
		};
		
		/** Handle submit */
		that.handleSubmitEntries = function() {
			if (that.model.current_item.cases_qty_inp || that.model.current_item.packs_qty_inp || that.model.current_item.item_qty_inp) {
				var headers = {
					is_adjustment: 0,
					inventory_type_id: 1,
					vendor_cat_id: that.selected_category.id == 'all' ? null : that.selected_category.id,
					vendor_sku_id: that.model.current_item.vendor_sku_id
				};
				
				that.api.get_inventory_audit(headers).then(function(res) {
					if(res.data.data.inventory.length){
						that.model.current_item.full_values = res.data.data.inventory[0].full_values;
						that.model.current_item.pack_values = res.data.data.inventory[0].pack_values;
						that.model.current_item.partial_values = res.data.data.inventory[0].partial_values;
					}
					that.model.current_item.full_values = that.model.current_item.cases_qty_inp != null ? that.model.current_item.full_values != null ? that.model.current_item.full_values + "+" + that.model.current_item.cases_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.cases_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.full_values != null ? that.model.current_item.full_values : null;
					
					that.model.current_item.pack_values = that.model.current_item.packs_qty_inp != null ? that.model.current_item.pack_values != null ? that.model.current_item.pack_values + "+" + that.model.current_item.packs_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.packs_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.pack_values != null ? that.model.current_item.pack_values : null;
					
					that.model.current_item.partial_values = that.model.current_item.item_qty_inp != null ? that.model.current_item.partial_values != null ? that.model.current_item.partial_values + "+" + that.model.current_item.item_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.item_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.partial_values != null ? that.model.current_item.partial_values : null;

					that._recalculateTotal();

					var item = {
						id: that.model.current_item.id,
						vendor_sku_id: that.model.current_item.vendor_sku_id,
						item_qty: that.model.current_item.partial_total,
						cases_qty: that.model.current_item.full_total,
						nof_bottles: 0,
						packs_qty: that.model.current_item.pack_total,
						total_in_uom_of_delivery: that.calculate_uom_of_delivery(that.model.current_item),
						item_qty_formula: null,
						full_values: that.model.current_item.full_values,
						pack_values: that.model.current_item.pack_values,
						partial_values: that.model.current_item.partial_values
					};
					that._submitInventory(item, false);
				});
			}
		};
		
		that.createConversionTable = function () {
			if(that.mode == 'inv'){
				that.conversion_table = [];
				//dry: 5 Oz, 14 Lbs, 15 Grams, 19 Kg
				that.conversion_table.push({from: 5, to: 14, value: 0.0625});
				that.conversion_table.push({from: 5, to: 15, value: 28.3495});
				that.conversion_table.push({from: 5, to: 19, value: 0.0283});
				
				that.conversion_table.push({from: 14, to: 5, value: 16});
				that.conversion_table.push({from: 14, to: 15, value: 453.5920});
				that.conversion_table.push({from: 14, to: 19, value: 0.4536});
				
				that.conversion_table.push({from: 15, to: 5, value: 0.0353});
				that.conversion_table.push({from: 15, to: 14, value: 0.0022});
				that.conversion_table.push({from: 15, to: 19, value: 0.0010});
				
				that.conversion_table.push({from: 19, to: 5, value: 35.2740});
				that.conversion_table.push({from: 19, to: 14, value: 2.2046});
				that.conversion_table.push({from: 19, to: 15, value: 1000});
				
				//liquid: 1 Gal, 2 Liter, 3 Qt, 4 Pint, 5 Oz, 8 ML
				that.conversion_table.push({from: 1, to: 2, value: 3.7854});
				that.conversion_table.push({from: 1, to: 3, value: 4});
				that.conversion_table.push({from: 1, to: 4, value: 8});
				that.conversion_table.push({from: 1, to: 5, value: 128});
				that.conversion_table.push({from: 1, to: 8, value: 3785.4});
				
				that.conversion_table.push({from: 2, to: 1, value: 0.2642});
				that.conversion_table.push({from: 2, to: 3, value: 1.0567});
				that.conversion_table.push({from: 2, to: 4, value: 2.1134});
				that.conversion_table.push({from: 2, to: 5, value: 33.814});
				that.conversion_table.push({from: 2, to: 8, value: 1000});
				
				that.conversion_table.push({from: 3, to: 1, value: 0.25});
				that.conversion_table.push({from: 3, to: 2, value: 0.9464});
				that.conversion_table.push({from: 3, to: 4, value: 2});
				that.conversion_table.push({from: 3, to: 5, value: 32});
				that.conversion_table.push({from: 3, to: 8, value: 946.353});
				
				that.conversion_table.push({from: 4, to: 1, value: 0.125});
				that.conversion_table.push({from: 4, to: 2, value: 0.4732});
				that.conversion_table.push({from: 4, to: 3, value: 0.5});
				that.conversion_table.push({from: 4, to: 5, value: 16});
				that.conversion_table.push({from: 4, to: 8, value: 473.176});
				
				that.conversion_table.push({from: 5, to: 1, value: 0.0078});
				that.conversion_table.push({from: 5, to: 2, value: 0.0296});
				that.conversion_table.push({from: 5, to: 3, value: 0.0313});
				that.conversion_table.push({from: 5, to: 4, value: 0.0625});
				that.conversion_table.push({from: 5, to: 8, value: 29.5735});
				
				that.conversion_table.push({from: 8, to: 1, value: 0.0003});
				that.conversion_table.push({from: 8, to: 2, value: 0.001});
				that.conversion_table.push({from: 8, to: 3, value: 0.0011});
				that.conversion_table.push({from: 8, to: 4, value: 0.0021});
				that.conversion_table.push({from: 8, to: 5, value: 0.0338});
			}
		}
		
		that.convert = function (from, to){
			if(from == to){
				return 1;
			}
			else{
				for(var i=0; i<that.conversion_table.length; i++){
					if(that.conversion_table[i].from == from && that.conversion_table[i].to == to){
						return that.conversion_table[i].value;
					}
				}
			}
		}
		
		that.preProcessCOS = function () {
			var dict = {};
			var signs = {};
			var primary_uod = {};
			
			for(var i = 0; i < that.cos_table_data.length; i++){
				if(that.cos_table_data[i].substitute_for == null){
					primary_uod[that.cos_table_data[i].vendor_sku_id] = that.cos_table_data[i].uod_id;
					if(!dict.hasOwnProperty(that.cos_table_data[i].vendor_sku_id)){
						dict[that.cos_table_data[i].vendor_sku_id] = [that.cos_table_data[i]];
						signs[that.cos_table_data[i].vendor_sku_id] = [0, 0];	//0, pos/neg
						if(that.cos_table_data[i].purchases == 0){
							signs[that.cos_table_data[i].vendor_sku_id][0]++;
						}
						else {
							signs[that.cos_table_data[i].vendor_sku_id][1]++;
						}
					}
					else{
						dict[that.cos_table_data[i].vendor_sku_id].push(that.cos_table_data[i]);
						if(that.cos_table_data[i].purchases == 0){
							signs[that.cos_table_data[i].vendor_sku_id][0]++;
						}
						else {
							signs[that.cos_table_data[i].vendor_sku_id][1]++;
						}
					}
				}
				else{
					if(dict.hasOwnProperty(that.cos_table_data[i].substitute_for)){
						dict[that.cos_table_data[i].substitute_for].push(that.cos_table_data[i]);
						if(that.cos_table_data[i].purchases == 0){
							signs[that.cos_table_data[i].substitute_for][0]++;
						}
						else {
							signs[that.cos_table_data[i].substitute_for][1]++;
						}
					}
					else{
						dict[that.cos_table_data[i].substitute_for] = [that.cos_table_data[i]];
						signs[that.cos_table_data[i].substitute_for] = [0, 0];	//0, pos/neg
						if(that.cos_table_data[i].purchases == 0){
							signs[that.cos_table_data[i].substitute_for][0]++;
						}
						else {
							signs[that.cos_table_data[i].substitute_for][1]++;
						}
					}
				}
			}
			
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					for(var i=0; i<dict[key].length; i++){
						var conv_val = that.convert(dict[key][i].uod_id, primary_uod[key]);
						dict[key][i].item_cost = dict[key][i].item_cost / conv_val;
						dict[key][i].purchases = dict[key][i].purchases * conv_val;
						dict[key][i].sales = dict[key][i].sales * conv_val;
						dict[key][i].beg_oz = dict[key][i].beg_oz * conv_val;
						dict[key][i].awc = dict[key][i].awc * conv_val;
						dict[key][i].end_oz = dict[key][i].end_oz * conv_val;
						dict[key][i].theor_sales = dict[key][i].theor_sales * conv_val;
						dict[key][i].unit_variance = dict[key][i].unit_variance * conv_val;
					}
				}
			}
			
			var total = {};
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					total[key] = 0;
					for(var i=0; i<dict[key].length; i++){
						total[key] += Math.abs(dict[key][i].purchases);
					}
				}
			}
			
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					if(signs[key][0] == 0 && signs[key][1] != 0){		//all positives
						for(var i=0; i<dict[key].length; i++){
							dict[key][i].wauc = (Math.abs(dict[key][i].purchases) / total[key]) * dict[key][i].item_cost;
						}
					}
					else if(signs[key][0] != 0  && signs[key][1] != 0){		//mixed
						for(var i=0; i<dict[key].length; i++){
							dict[key][i].wauc = (Math.abs(dict[key][i].purchases) / total[key]) * dict[key][i].item_cost;
						}
					}
					else if(signs[key][0] != 0  && signs[key][1] == 0){		//all zeroes
						for(var i=0; i<dict[key].length; i++){
							dict[key][i].wauc = (1 / signs[key][0]) * dict[key][i].item_cost;
						}
					}
				}
			}
			
			var p_indx = {};
			var yo = [];
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					var uc = 0, pur = 0, sales = 0, beg = 0, awc = 0, end = 0, ther = 0, unit = 0, cost = 0;
					for(var i=0; i<dict[key].length; i++){
						if(dict[key][i].substitute_for == null){
							p_indx[key] = i;
						}
						uc += dict[key][i].wauc;
						pur += dict[key][i].purchases;
						sales += dict[key][i].sales;
						beg += dict[key][i].beg_oz;
						awc += dict[key][i].awc;
						end += dict[key][i].end_oz;
						ther += dict[key][i].theor_sales;
						unit += dict[key][i].unit_variance;
						//cost += dict[key][i].cost_variance;
					}
					dict[key][p_indx[key]].wauc = uc;
					dict[key][p_indx[key]].purchases = pur;
					dict[key][p_indx[key]].sales = sales;
					dict[key][p_indx[key]].beg_oz = beg;
					dict[key][p_indx[key]].awc = awc;
					dict[key][p_indx[key]].end_oz = end;
					dict[key][p_indx[key]].theor_sales = ther;
					dict[key][p_indx[key]].unit_variance = unit;
					dict[key][p_indx[key]].cost_variance = unit * uc;
					yo.push(dict[key][p_indx[key]]);
				}
			}
			
			that.cos_table_data = yo;
		}
		
		
		//get COS
		that.getCOS = function(item, is_ve) {
			that.loadingCOS = true;
			if(typeof item != 'undefined' && !is_ve){
				if(typeof that.global_cos_table_data != 'undefined'){
					for(var c=0; c<that.global_cos_table_data.length; c++){
						if(item.substitute_for == null){
							if(item.vendor_sku_id == that.global_cos_table_data[c].vendor_sku_id){
								that.global_cos_table_data[c].unit_variance = that.calculate_uom_of_delivery(that.model.current_item) - that.model.current_item.OH;
								that.global_cos_table_data[c].end_oz = that.calculate_uom_of_delivery(that.model.current_item);
								for(var i=0; i< that.model.inventory.length; i++){
									if(that.model.inventory[i].vendor_sku_id == that.global_cos_table_data[c].vendor_sku_id){
										that.model.inventory[i].unit_variance = that.global_cos_table_data[c].unit_variance;
										break;
									}
								}
								break;
							}	
						}	
					}
				}
				that.loadingCOS = false;
			}
			else{
				that.api.get_audit_dates({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 1}).then(function (res1) {
					that.audit_dates = res1.data.data.Report;
					that.audit_dates_f = res1.data.data.Report.map(function(x) {return x.audit_dates.substring(0, 10)});
					that.audit_dates_t = JSON.parse(JSON.stringify(that.audit_dates_f));
					that.audit_dates_f.splice(0, 1);
					that.start_date = that.audit_dates_f[0];
					that.end_date = that.audit_dates_t[0];
					var params = item ? {"RestaurantId": that.restaurant_id.restaurant_id, "Category": that.selected_category.id == 'all' ? '%' : that.selected_category.category, 'start_date': that.start_date, 'end_date': that.end_date, 'inventory_type_id': 1, 'vendor_sku_id': item.vendor_sku_id} : {"RestaurantId": that.restaurant_id.restaurant_id, "Category": that.selected_category.id == 'all' ? '%' : that.selected_category.category, 'start_date': that.start_date, 'end_date': that.end_date, 'inventory_type_id': 1};
					that.api.sku_table(params).then(function (res) {
						that.loadingCOS = false;
						if(res){
							that.cos_table_data = res.data.data.sku_table;
							if(typeof that.cos_table_data != 'undefined' && that.cos_table_data != null && that.cos_table_data.length){
								that.global_cos_table_data = JSON.parse(JSON.stringify(that.cos_table_data));
								//that.preProcessCOS();
								for(var i=0; i< that.model.inventory.length; i++){
									for(var c=0; c<that.cos_table_data.length; c++){
										if(that.model.inventory[i].vendor_sku_id == that.cos_table_data[c].vendor_sku_id){
											that.model.inventory[i].unit_variance = that.cos_table_data[c].unit_variance;
											that.model.inventory[i].OH = that.cos_table_data[c].beg_oz + that.cos_table_data[c].purchases - that.cos_table_data[c].sales;
											break;
										}
									}
								}
							}
						}
					});
				});
			}
		}
		
		that.setCOS = function() {
			that.cos_table_data = JSON.parse(JSON.stringify(that.global_cos_table_data));
			//that.preProcessCOS();
			for(var i=0; i< that.model.inventory.length; i++){
				for(var c=0; c<that.cos_table_data.length; c++){
					if(that.model.inventory[i].vendor_sku_id == that.cos_table_data[c].vendor_sku_id){
						that.model.inventory[i].unit_variance = that.cos_table_data[c].unit_variance;
						that.model.inventory[i].OH = that.cos_table_data[c].beg_oz + that.cos_table_data[c].purchases - that.cos_table_data[c].sales;
						break;
					}
				}
			}
		}
		
		/** recalculate total entries */
		that._recalculateTotal = function(indx, date_inp) {	
			if(that.mode == 'inv'){
				if(that.model.current_item.partial_values != null){
					that.model.current_item.n_partial_entries = that.model.current_item.partial_values
					  .split("+")
					  .filter(function(item) {
						item = item.split("_")[0];
						return item !== "" && item != "0";
					  }).length;
				}
				else{
					that.model.current_item.n_partial_entries = 0;
				}
			
				that.model.current_item.full_total = that._computeTotalByString(that.model.current_item.full_values);
				that.model.current_item.pack_total = that._computeTotalByString(that.model.current_item.pack_values);
				that.model.current_item.partial_total = that._computeTotalByString(that.model.current_item.partial_values);
				that.model.current_item.cases_qty_inp = null;
				that.model.current_item.packs_qty_inp = null;
				that.model.current_item.item_qty_inp = null;
			}
			else{
				//main item object
				that.model.current_item.n_partial_entries = 0;
				that.model.current_item.full_total = 0;
				that.model.current_item.partial_total = 0;
				for(var i = 0; i< that.model.current_item.items.length; i++){
					if(that.model.current_item.items[i].partial_values != null){
						that.model.current_item.n_partial_entries += that.model.current_item.items[i].partial_values
						  .split("+")
						  .filter(function(item) {
							return item !== "" && item != "0";
						  }).length;
					}
					that.model.current_item.full_total += that._computeTotalByString(that.model.current_item.items[i].full_values);
					that.model.current_item.partial_total += that._computeTotalByString(that.model.current_item.items[i].partial_values);
				}
				//console.log(that.model.current_item, that.model.current_item.full_total, that.model.current_item.partial_total);
				that.model.current_item.packs_qty_inp = null;	//full	//reused names to minimalize code change
				that.model.current_item.item_qty_inp = null;	//partial
				var temp_date = new Date();
				//that.model.current_item.created_on_inp = date_inp == null ? new Date(temp_date.setDate(temp_date.getDate() - 14)) : new Date(date_inp);
				that.model.current_item.created_on_inp = date_inp == null ? that.pickers.beginDate.date : new Date(date_inp);
				//main item object
				
				if(indx != null){
				//changed item object
					that.model.current_item.items[indx].n_partial_entries = 0;
					if(that.model.current_item.items[indx].partial_values != null){
						that.model.current_item.items[indx].n_partial_entries = that.model.current_item.items[indx].partial_values
						  .split("+")
						  .filter(function(item) {
							return item !== "" && item != "0";
						  }).length;
					}
					that.model.current_item.items[indx].full_total = that._computeTotalByString(that.model.current_item.items[indx].full_values);
					that.model.current_item.items[indx].partial_total = that._computeTotalByString(that.model.current_item.items[indx].partial_values);
					//changed item object
				}
			}
		};
		
		
		/** Compute strings and assign total */
		that._computeTotalByString = function(st) {
			if (st) {
				var nums = st
				  .split("+")
				  .filter(function(item) {
					item = item.split("_")[0];
					return item !== "";
				  })
				  .map(function(entry) {
					return parseFloat(entry);
				  });
				return nums.reduce(function(pV, cV) {
				  return pV + cV;
				});
			}
			return 0;
		};
		
		
		that.deleteCurrentInventoryAudit = function() {
			SweetAlert.swal(
				{
				  title: "Are you sure?",
				  text:
					"This will completely delete the saved Audit for this restaurant and you will have to startover!",
				  type: "warning",
				  showCancelButton: true,
				  confirmButtonColor: "#ed5565",
				  confirmButtonText: "Confirm"
				},
				function(res) {
					if (res) {
						that.api.delete_inventory_audit(1, that.is_sug_aud).then(function (res1) {
							if(res) {
								SweetAlert.swal("Deleted!", "Please proceed to startover a new audit.", "success");
								$state.go('foodSubCategories');
							}
							
						});
					}
				}
			);
				
		}
		
		
		/** Submit inventory item */
		that._submitBatches = function(items) {
			var m = {
				inventory_type_id: 1,
				counting_started_at: new Date(that.pickers.beginDate.date).getTime(),
				counting_ended_at: new Date().getTime(),
				is_final_save: 0,
				is_adjustment: 0,
				inventory_items: items
			};

			that.api.update_recipe_audit(m).then(function(res) {
				SweetAlert.swal("Saved!", "Your changes has been saved!", "success");
			});
		};
		
		
		/** Submit inventory item */
		that._submitInventory = function(item, is_ve) {
			var m = {
			inventory_type_id: 1,
			counting_started_at: new Date(that.pickers.beginDate.date).getTime(),
			counting_ended_at: new Date().getTime(),
			is_final_save: 0,
			is_adjustment: 0,
			inventory_items: [item],
			tablet_mode: true,
			is_suggested: that.is_sug_aud == 'true' ? 1 : 0
			};

			that.api.update_inventory_audit(m).then(function(res) {
				SweetAlert.swal("Saved!", "Your changes has been saved!", "success");
				if(!(typeof that.res_data_audit_start != 'undefined' && that.res_data_audit_start[0].audit_start != null)){
					that.res_data_audit_start = [{audit_start: new Date()}];
				}
				if(that.model.current_item.substitute_for == null && that.showCOSDetails){
					that.getCOS(that.model.current_item, is_ve);
				}
			});
		};
		
		
		//calc total uod
		that.calculate_uom_of_delivery = function(item) {
			return (
				(item.full_total * item.total_unit_size) + (item.pack_total * item.size) + item.partial_total
			);
		};
		
		that.disableCheckBoxes = function() {
			that.model.subcat_enabled = false;
		}
		
		that.viewReport = function() {
			$state.go('reports.foodCostOfSummary');
		}
		
		that.finalSaveAudit = function (caller) {
			if(caller == 'suggested'){
				that.api.get_audit_dates({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 1}).then(function (res1) {
					that.audit_dates = res1.data.data.Report;
					that.audit_dates_f = res1.data.data.Report.map(function(x) 
																	{return {aud_title:x.audit_dates.substring(0, 10) + " ("+x.type+" by "+x.audited_by_org+")", audit_dates: x.audit_dates.substring(0, 10), src: x.src, type: x.type, is_suggested: x.is_suggested}});
					var adminFS = function () {
						var m = {
							inventory_type_id: 1,
							counting_started_at: new Date().getTime(),
							counting_ended_at: new Date().getTime(),
							is_final_save: 1,
							is_adjustment: caller == 'suggested' ? 1 : 0,
							send_email: caller == 'suggested' ? true : false,
							additional_notes: that.additional_notes,
							inventory_items: [],
							is_suggested: that.is_sug_aud == 'true' ? 1 : 0
						};
						if(typeof that.prev_audit_date != 'undefined' && that.prev_audit_date != null){
							m['prev_audit_date'] = that.prev_audit_date;
						}
						if(m.additional_notes == null){
							delete m.additional_notes;
						}
						
						that.api.update_inventory_audit(m).then(function (res) {
							try {
								if (res.data.data.code === 1000) {
									alertService.showAlertSave();
									$state.go('alcoholSubCategories');
								}
							} catch (e) {
								console.log(e);
							}
						}, function () {
						});
					}
					
					if(that.is_sug_aud == 'true'){
						var conf = {
							title: "Are you sure?",
							text: "This will permanently update your on-hand count as of today. You will shortly receive a report on your email.",
							type: "warning",
							showCancelButton: true,
							confirmButtonColor: "#ed5565",
							confirmButtonText: "Confirm"
						};
						swal(conf, function (res) {
							if (res) {
								that.is_send_email = true;
								that.audit_type = 'adjustment';
								that.additional_notes = null;					
								that.prev_audit_date = that.audit_dates_f[1];
								adminFS();
							}
						});
					}
				});
			}
			else if(caller == 'first_audit'){
				var adminFS = function () {
					var m = {
						inventory_type_id: 1,
						counting_started_at: new Date().getTime(),
						counting_ended_at: new Date().getTime(),
						is_final_save: 1,
						is_adjustment: 0,
						send_email: false,
						additional_notes: that.additional_notes,
						inventory_items: [],
						is_suggested: 0
					};
					if(m.additional_notes == null){
						delete m.additional_notes;
					}
					
					that.api.update_inventory_audit(m).then(function (res) {
						try {
							if (res.data.data.code === 1000) {
								alertService.showAlertSave();
								$state.go('alcoholSubCategories');
							}
						} catch (e) {
							console.log(e);
						}
					}, function () {
					});
				}
				
				var conf = {
					title: "Are you sure?",
					text: "This will permanently update your on-hand count as of today. You will shortly receive a report on your email.",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#ed5565",
					confirmButtonText: "Confirm"
				};
				swal(conf, function (res) {
					if (res) {
						that.additional_notes = null;
						adminFS();
					}
				});
			}
		}
		
		that.back = function() {
			if(that.SetUpStatus == 0){
				$state.go('setupFirstAudit');
			}
			else{
				$state.go('foodSubCategories');
			}
		}
		
		
		//navigate to the next/previous item
		that.navigate = function(direction) {
			if (direction === "next" && that.currentFoodIndex < that.model.inventory.length-1) {
				that.currentFoodIndex++;
				that.model.current_item = that.model.inventory[that.currentFoodIndex];
			} 
			else if (direction === "previous" && that.currentFoodIndex > 0) {
				that.currentFoodIndex--;
				that.model.current_item = that.model.inventory[that.currentFoodIndex];
			}
			that._recalculateTotal();
			that.setPrevNext(that.currentFoodIndex);
		};
		
		
		//Set prev-next items
		that.setPrevNext = function(index) {
			if (that.model.inventory) {
				that.model.prev_item = index > 0 ? that.model.inventory[index - 1] : null;
				that.model.next_item = index < that.model.inventory.length - 1 ? that.model.inventory[index + 1] : null;
			}
		};
		
		//hide/show substitutes
		that.hideShowSubstitutes = function(is_manual, inv_list) {
			that.hide_subs = !is_manual ? that.hide_subs : that.hide_subs ? false : true;
			if(!inv_list){
				that.currentFoodIndex = 0;
			}
			
			var fl = inv_list ? inv_list : INVENTORY_MASTER_LIST;
			if (that.hide_subs) {
				that.model.inventory = fl.filter(function(item) {
					return item.substitute_for == null;
				});
				if(!inv_list){
					that.model.current_item = that.model.inventory[0];
				}
			} else {
				that.model.inventory = fl;
				if(!inv_list){
					that.model.current_item = that.model.inventory[0];
				}
			}
			
			if(is_manual){
				that.model.quick_search_keys = that._extractKeys();
				that._recalculateTotal();
			}
			if(!inv_list){
				that.setPrevNext(that.currentFoodIndex);
			}
		};
		
		//search
		that.handleSearch = function(query) {
			that.currentFoodIndex = 0;
			if(that.hide_subs && that.mode == 'inv'){
				//that.hideShowSubstitutes(false, that.model.inventory);
				that.hideShowSubstitutes(false, INVENTORY_MASTER_LIST);
			}
			else{
				that.model.inventory = INVENTORY_MASTER_LIST;
			}
			
			if (query && query.length) {
				that.model.inventory = that.model.inventory.filter(function(item) {
				//that.model.inventory = INVENTORY_MASTER_LIST.filter(function(item) {
				  return (that.mode == 'inv' ? item.inventory_item : item.recipe_name)
					.toUpperCase()
					.includes(query.toUpperCase());
				});
			} 
			else{
				if(that.mode == 'inv'){
					that.model.inventory = INVENTORY_MASTER_LIST;
					if(that.hide_subs){
						that.hideShowSubstitutes(false, that.model.inventory);
					}
				}
				else if(that.mode == 'batches'){
					that.model.inventory = INVENTORY_MASTER_LIST;
				}
			}
			that.model.current_item = that.model.inventory[0];
			that.model.quick_search_keys = that._extractKeys();
			that._recalculateTotal();
			that.setPrevNext(that.currentFoodIndex);
		};
		
		
		//jump to item starting with letter = key
		that.jumpToLetter = function(key) {	
			that.currentFoodIndex = 0;
			if(that.selected_subcategory != null){
				that.model.inventory = that._filterBySubCategoryId(that.selected_subcategory);
			}
			
			if(that.hide_subs && that.mode == 'inv'){
				that.hideShowSubstitutes(false, that.model.inventory);
			}
			else if(that.mode == 'batches'){
				that.model.inventory = INVENTORY_MASTER_LIST;
			}
			
			for(var i = 0; i<that.model.inventory.length; i++){
				if(key == (that.mode == 'inv' ? that.model.inventory[i].inventory_item[0].toUpperCase() : that.model.inventory[i].recipe_name[0].toUpperCase())){
					break;
				}
				else{
					that.currentFoodIndex++;
				}
			}
			that.model.current_item = that.model.inventory[that.currentFoodIndex];
			
			that._recalculateTotal();
			that.setPrevNext(that.currentFoodIndex);
		};
		
		
		//extract letter jump keys
		that._extractKeys = function() {
			var letters = new Set();
			that.model.inventory.forEach(function(item) {
				var letter = that.mode == 'inv' ? item.inventory_item[0].toUpperCase() : item.recipe_name[0].toUpperCase();
				letters.add(letter);
			});
			return Array.from(letters).sort();
		};
		
		
		//filter subcat items
		that._filterBySubCategoryId = function(sub_cat) {
			var filtered_items;
			if (sub_cat) {
				filtered_items = INVENTORY_MASTER_LIST.filter(function(item) {
				  return item.vendor_sub_cat_id === sub_cat.id;
				});
			}
			return filtered_items;
		};
		
		
		//change subcategory
		that.handleSubcatClick = function(sub_cat) {
			that.model.inventory = that._filterBySubCategoryId(sub_cat);
			if(that.hide_subs){
				that.hideShowSubstitutes(false, that.model.inventory);
			}
			that.model.quick_search_keys = that._extractKeys();
			that.model.current_item = that.model.inventory[0];
			that.selected_subcategory = sub_cat;
			that._recalculateTotal();
			that.setPrevNext(that.currentFoodIndex);
		};
		
		
		//get subcategories of current items
		that._getSubcategories = function() {
			var subcats = new Set();
			that.model.inventory.forEach(function(item) {
				for (var i = 0; i < that.refbooks.vendor_sub_cat.length; i++) {
					if (item.vendor_cat_id == that.refbooks.vendor_sub_cat[i].vendor_cat_id && item.vendor_sub_cat_id == that.refbooks.vendor_sub_cat[i].id) {
						subcats.add(that.refbooks.vendor_sub_cat[i]);
						break;
					}
				}
			});
			function compare(a, b){
				if (a.sub_category > b.sub_category) return 1;
				if (b.sub_category > a.sub_category) return -1;
				return 0;
			}
			return Array.from(subcats).sort(compare);
		};
		
		
		//get inventory items
		that._getInventories = function(category, is_init) {
			var headers = {
				is_adjustment: 0,
				inventory_type_id: 1,
				vendor_cat_id: category.id == 'all' ? null : category.id,
				inventory_item: null,
				audit_start_TS: true,
				suggested: that.is_sug_aud
			};
			
			that.api.get_inventory_audit(headers).then(function(res) {
				that.res_data_audit_start = res.data.data.audit_start;
				that.pickers.beginDate.date = typeof res.data.data.audit_start != 'undefined' && res.data.data.audit_start[0].audit_start != null ? new Date(res.data.data.audit_start[0].audit_start) : new Date();
				that.pickers.beginDateBackup.date = JSON.parse(JSON.stringify(that.pickers.beginDate.date));
				function compare(a, b){
					if (a.inventory_item.toLowerCase() > b.inventory_item.toLowerCase()) return 1;
					if (b.inventory_item.toLowerCase() > a.inventory_item.toLowerCase()) return -1;
					return 0;
				}
				res.data.data.inventory.sort(compare);
				INVENTORY_MASTER_LIST = res.data.data.inventory;
				that.hideShowSubstitutes(false);
				//that.model.inventory = INVENTORY_MASTER_LIST;
				that.model.subcategories = that._getSubcategories();
				that.selected_subcategory = null;
				that.model.quick_search_keys = that._extractKeys();
				
				that.currentFoodIndex = 0;
				that.model.current_item = that.model.inventory[that.currentFoodIndex];
				that._recalculateTotal();
				that.setPrevNext(that.currentFoodIndex);
				if(is_init){
					if(that.showCOSDetails){
						that.getCOS();
					}
				}
				else{
					if(that.showCOSDetails){
						that.setCOS();
					}
				}
			});
		};
		
		//get batch items
		that._getBatches = function(category) {
			var headers = {
				is_adjustment: 0,
                inventory_type_id: 1,
                recipe_type_id: category.r_type_id,
                inventory_item: null,
				audit_start_TS: true
            };
			
			that.api.get_recipe_audit(headers).then(function (res) {
				that.res_data_audit_start = res.data.data.audit_start;
				that.pickers.beginDate.date = typeof res.data.data.audit_start != 'undefined' && res.data.data.audit_start[0].audit_start != null ? new Date(res.data.data.audit_start[0].audit_start) : new Date();
				INVENTORY_MASTER_LIST = res.data.data.inventory;
				//group batches with same recipe_id
				var dict = {};
				for(var i = 0; i< INVENTORY_MASTER_LIST.length; i++){
					if(!dict.hasOwnProperty(INVENTORY_MASTER_LIST[i].recipe_id)){
						dict[INVENTORY_MASTER_LIST[i].recipe_id] = [INVENTORY_MASTER_LIST[i]];
					}
					else{
						dict[INVENTORY_MASTER_LIST[i].recipe_id].push(INVENTORY_MASTER_LIST[i]);
					}
				}
				
				INVENTORY_MASTER_LIST = [];
				for(var b in dict){
					INVENTORY_MASTER_LIST.push({recipe_id: dict[b][0].recipe_id, recipe_name: dict[b][0].recipe_name, total_servings: dict[b][0].servings, shelf_life: dict[b][0].shelf_life, items: dict[b]});
				}
				
				function compare(a, b){
					if (a.recipe_name.toLowerCase() > b.recipe_name.toLowerCase()) return 1;
					if (b.recipe_name.toLowerCase() > a.recipe_name.toLowerCase()) return -1;
					return 0;
				}
				INVENTORY_MASTER_LIST.sort(compare);
				
				that.model.inventory = INVENTORY_MASTER_LIST;
				that.model.quick_search_keys = that._extractKeys();
				
				that.currentFoodIndex = 0;
				that.model.current_item = that.model.inventory[that.currentFoodIndex];
				that._recalculateTotal();
				that.setPrevNext(that.currentFoodIndex);
				
			});
		};
		
		
		//change category
		that.handleCategoryClick = function(category, is_init) {
			that.selected_category = category;
			if(that.mode == 'inv'){
				that._getInventories(category, is_init);
			}
			else{
				that._getBatches(category);
			}
			
		};
		
		that.initBatchCats = function() {
			var r_type_list = [];
			for(var ri in that.refbooks.recipe_types){
				var cr = that.refbooks.recipe_types[ri];
				if(cr.id != 1){
					r_type_list.push({category: cr.name, r_type_id: cr.id});
				}
			}
			//return {categories: [{category: 'Batch Recipes', r_type_id: 2}, {category: 'Pre-prepped Recipes', r_type_id: 3}]};
			return {categories: r_type_list};
		}
		
		
		that.changeMode = function() {
			if(that.mode == 'inv'){
				that.mode = 'batches';
				that.model.selected_batch_input_mode = that.model.batch_input_modes[0];
			}
			else{
				that.mode = 'inv';
			}
			that.init();
		};
		
		that.checkEmpType = function () {
			that.SetUpStatus = restaurant.data.info.is_setup_completed;
			var emps = restaurant.data.info.employees;
			that.user = {userid: null, user_type_id: null};
			that.user.userid = that.auth.authentication.user.id;
			if(that.user.userid == 1){
				that.showCOSDetails = true;
			}
			else{
				that.showCOSDetails = false;
				for (var i = 0; emps.length > i; i++) {
					if(emps[i].id == that.user.userid){
						that.user.user_type_id = emps[i].type_ids;
						if(emps[i].type_ids == 1 || emps[i].type_ids == 2 || emps[i].type_ids == 3){
							that.showCOSDetails = true;
						}
						else if(emps[i].type_ids == 9 || emps[i].type_ids == 10){	//Skrible Auditors
							that.showCOSDetails = true;
						}
						break;
					}
				}
			}
		}
		
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
		
		that.getLocations = function () {
			var headers = {
				restaurant_id: that.restaurant_id.restaurant_id,
				inventory_type_id: 1,
				active_only: 1
			};
			
			that.api.get_restaurant_audit_locations(headers).then(function(res) {
				that.locations = res.data.data.Report;
				that.locations.push({sr_no: -1, location_name: '-- Add/Edit Locations --'});
				that.selected_location = that.locations[0].sr_no;
			});
		}
		
		that.changeAuditDate = function () {
			if(typeof that.res_data_audit_start != 'undefined' && that.res_data_audit_start[0].audit_start != null){
				var valid_date = true;
				if(that.pickers.beginDate.date > new Date())
				{
					SweetAlert.swal(
					{
						  title: "Error!",
						  text:
							"Audit date cannot be greater than now!",
						  type: "error",
						  confirmButtonColor: "#ed5565",
						  confirmButtonText: "OK"
						},
						function(res) {
							
						}
					);
					that.pickers.beginDate.date = new Date(that.pickers.beginDateBackup.date);
					valid_date = false;
				}
				else{
					/*var td = new Date();
					td = td.getDate()+"-"+td.getMonth()+"-"+td.getFullYear();
					var sd = that.pickers.beginDate.date.getDate()+"-"+that.pickers.beginDate.date.getMonth()+"-"+that.pickers.beginDate.date.getFullYear();
					if(sd == td){
						SweetAlert.swal(
						{
							  title: "Error!",
							  text:
								"It appears that you started an audit. To start a new audit please Final Save the previous count or clear it.",
							  type: "error",
							  confirmButtonColor: "#ed5565",
							  confirmButtonText: "OK"
							},
							function(res) {
								
							}
						);
						that.pickers.beginDate.date = new Date(that.pickers.beginDateBackup.date);
						valid_date = false;
					}*/
					//else{
						if(that.audit_dates.length > 1){
							var prev_aud = null;
							if(that.audit_dates[0].src == 'history'){
								prev_aud = that.audit_dates[0].audit_dates;
							}
							else{
								prev_aud = that.audit_dates[1].audit_dates;
							}
							if(that.pickers.beginDate.date <= new Date(prev_aud))
							{
								SweetAlert.swal(
								{
									  title: "Error!",
									  text:
										"Audit date cannot be less than or equal to the previous audit!",
									  type: "error",
									  confirmButtonColor: "#ed5565",
									  confirmButtonText: "OK"
									},
									function(res) {
										
									}
								);
								that.pickers.beginDate.date = new Date(that.pickers.beginDateBackup.date);
								valid_date = false;
							}
						}
					//}
				}
				
				if(!valid_date){
					return;
				}
				else{
					
					SweetAlert.swal(
						{
						  title: "Are you sure?",
						  text:
							"Are you sure you want to change the audit date? This change could affect multiple reports.",
						  type: "warning",
						  showCancelButton: true,
						  confirmButtonColor: "#ed5565",
						  confirmButtonText: "Confirm"
						},
						function(res) {
							if (res) {
								that.api.set_audit_date({inventory_type_id: 1, audit_date: new Date(that.pickers.beginDate.date).getTime()}).then(function (res1) {
									SweetAlert.swal("Audit Date Updated!", "", "success");
									that.handleCategoryClick(that.selected_category);
								});
							}
						}
					);
				}
			}
			else{
				SweetAlert.swal(
				{
					  title: "Alert!",
					  text:
						"You need to count at least one item before changing the Audit date!",
					  type: "error",
					  confirmButtonColor: "#ed5565",
					  confirmButtonText: "OK"
					},
					function(res) {
						
					}
				);
				that.pickers.beginDate.date = new Date(that.pickers.beginDateBackup.date);
				return;
			}
		}
		
		that.openCalendar = function (e, picker) {
            that.pickers[picker].open = true;
        };
		
		//init
		that.init = function() {
			Promise.all([core.getRefbooks(), that.mode == 'inv' ? api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 1}) : that.initBatchCats(), that.createConversionTable(), that.getLocations()]).then(function(response) {
				that.refbooks = response[0];
				that.hide_subs = true;
				that.model.categories = that.mode == 'inv' ? response[1].data.data.categories : response[1].categories;
				if(that.mode == 'inv'){
					that.model.categories.unshift({id: 'all', category: 'All Items'});
				}
				that.handleCategoryClick(that.model.categories[0], true);
			});
		}
		
		that.checkEmpType();
		that.mode = 'inv';
		if(that.is_sug_aud == 'false'){
			SweetAlert.swal(
				{
				  title: "Note",
				  text:
					"Here you may do a full audit or mini-audit (adjustment). A full audit saves everything, including items you do not count, while a mini-audit or adjustment will only affect the items you count. Once your count is complete, select 'View Report'. From the reports page, you may choose your audit type (full audit or mini-audit) after you select 'Final Save'.",
				  type: "info",
				  showCancelButton: false,
				  confirmButtonColor: "#ed5565",
				  confirmButtonText: "OK"
				},
				function(res) {
					that.init();
				}
			);
		}
		else{
			that.init();
		}
	}

  tabletEntryController.$inject = [
    "api",
    "$state",
    "auth",
	"$filter",
    "localStorageService",
    "restaurant",
    "core",
	"alertService",
    "SweetAlert",
    "$uibModal"
  ];

  angular.module("inspinia").component("tabletEntryComponentFood", {
    templateUrl: "js/components/foodSetup/tabletEntry/tabletEntry.html",
    controller: tabletEntryController,
    controllerAs: "$ctr",
    bindings: {}
  });
})();