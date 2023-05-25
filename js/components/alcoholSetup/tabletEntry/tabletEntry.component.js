(function() {
  "use strict";

	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Inventory Audit Help';
						
		that.q_texts = '<article style="display: block;"><p><b>Inventory Audit</b> – Please check out our instruction video <a href="https://youtu.be/3M5KkduTc94" target="_blank">here</a>.</li></ul></p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
	function tabletEntryController(api, $state, auth, localStorageService, restaurant, core, alertService, SweetAlert, $uibModal) {
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

		var INVENTORY_MASTER_LIST = [];
		that.currentDrinkIndex = 0;
    
		that.model = {
			categories: []
			, subcategories: []
			, quick_search_keys: []
			, prev_item: null
			, current_item: null
			, next_item: null
			, size_enabled: false
			, weight_enabled: false
			, search_query: null
			, inventory: []
			, full_total: null
			, partial_total: null
			, n_partial_entries: null
			//, partial_input_modes: ['Lbs', 'Oz', 'Pts']
			, global_partial_input_mode: null
		};
		
		that.get_partial_input_modes = function(category) {
			if(category == 'Draft Beer' || category == 'Draft Wine'){
				return ['Lbs', 'Pts'];
			}
			else{
				return ['Oz', 'Pts'];
			}
		}
		
		that.set_gloabl_partial_input_mode = function() {
			that.model.global_partial_input_mode = that.model.current_item.selected_partial_input_mode;
		}
		
		that.changeLocation = function() {
			if(that.selected_location == -1){
				that.selected_location = that.locations[0].sr_no;
				var modalInstance = $uibModal.open({
					templateUrl: "js/components/alcoholSetup/tabletEntry/locationEntry.html",
					controller: "addEditLocationsController",
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
			var headers = {
				is_adjustment: 0,
				inventory_type_id: 2,
				vendor_cat_id: that.selected_category.category == 'Shelf to Sheet' ? that.selected_subcategory.id : that.selected_category.id,
				vendor_sku_id: that.model.current_item.vendor_sku_id
			};
			
			that.api.get_inventory_audit(headers).then(function(res) {
				if(res.data.data.inventory.length){
					that.model.current_item.full_values = res.data.data.inventory[0].full_values;
					that.model.current_item.partial_values = res.data.data.inventory[0].partial_values;
				}
				
				var modalInstance = $uibModal.open({
					templateUrl: "js/components/alcoholSetup/tabletEntry/modalEntry.html",
					controller: "addItemsController",
					windowClass: "animated fadeIn modal-lgg",
					controllerAs: "$ctr",
					size: "md",
					resolve: {
						searchParams: function () {
							return that.model.current_item;
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
						cases_qty: 0,
						nof_bottles: that.model.current_item.n_partial_entries,
						packs_qty: that.model.current_item.full_total,
						total_in_uom_of_delivery: that.calculate_uom_of_delivery(that.model.current_item),
						item_qty_formula: that.model.current_item.partial_values,
						full_values: that.model.current_item.full_values,
						partial_values: that.model.current_item.partial_values
					};
					
					that._submitInventory(item, true);
				});
			});
		};
		
		
		/** Handle submit */
		that.handleSubmitEntries = function() {
			if (that.model.current_item.packs_qty_inp || that.model.current_item.item_qty_inp) {
				var headers = {
					is_adjustment: 0,
					inventory_type_id: 2,
					vendor_cat_id: that.selected_category.category == 'Shelf to Sheet' ? that.selected_subcategory.id : that.selected_category.id,
					vendor_sku_id: that.model.current_item.vendor_sku_id
				};
				
				that.api.get_inventory_audit(headers).then(function(res) {
					if(res.data.data.inventory.length){
						that.model.current_item.full_values = res.data.data.inventory[0].full_values;
						that.model.current_item.partial_values = res.data.data.inventory[0].partial_values;
					}
					
					that.model.current_item.full_values = that.model.current_item.packs_qty_inp != null ? that.model.current_item.full_values != null ? that.model.current_item.full_values + "+" + that.model.current_item.packs_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.packs_qty_inp.toString() + "_" + that.selected_location : that.model.current_item.full_values != null ? that.model.current_item.full_values : null;
				
					that.model.current_item.partial_values = that.model.current_item.item_qty_inp != null ? that.model.current_item.partial_values != null ? that.model.current_item.partial_values + "+" + (that.model.current_item.selected_partial_input_mode == 'Pts' ? (Math.round(((that.model.current_item.item_qty_inp * that.model.current_item.size) + that.model.current_item.tare_weight) * 100) / 100).toString() : that.model.current_item.selected_partial_input_mode == 'Oz' ? (Math.round(that.model.current_item.item_qty_inp * 100) / 100).toString() : (Math.round((that.model.current_item.item_qty_inp * 16) * 100) / 100).toString()) + "_" + that.selected_location : (that.model.current_item.selected_partial_input_mode == 'Pts' ? (Math.round(((that.model.current_item.item_qty_inp * that.model.current_item.size) + that.model.current_item.tare_weight) * 100) / 100).toString() : that.model.current_item.selected_partial_input_mode == 'Oz' ? (Math.round(that.model.current_item.item_qty_inp * 100) / 100).toString() : (Math.round((that.model.current_item.item_qty_inp * 16) * 100) / 100).toString()) + "_" + that.selected_location : that.model.current_item.partial_values != null ? that.model.current_item.partial_values : null;

					that._recalculateTotal();

					var item = {
						id: that.model.current_item.id,
						vendor_sku_id: that.model.current_item.vendor_sku_id,
						item_qty: that.model.current_item.partial_total,
						cases_qty: 0,
						nof_bottles: that.model.current_item.n_partial_entries,
						packs_qty: that.model.current_item.full_total,
						total_in_uom_of_delivery: that.calculate_uom_of_delivery(that.model.current_item),
						item_qty_formula: that.model.current_item.partial_values,
						full_values: that.model.current_item.full_values,
						partial_values: that.model.current_item.partial_values
					};
					that._submitInventory(item, false);
				});				
			}
		};
		
		that.preProcessCOS = function () {
			var dict = {};
			var signs = {};
			
			for(var i = 0; i < that.cos_table_data.length; i++){
				if(that.cos_table_data[i].substitute_for == null){
					if(!dict.hasOwnProperty(that.cos_table_data[i].vendor_sku_id)){
						dict[that.cos_table_data[i].vendor_sku_id] = [that.cos_table_data[i]];
						signs[that.cos_table_data[i].vendor_sku_id] = [0, 0, 0];	//neg, 0, pos
						if(that.cos_table_data[i].theor_sales < 0){
							signs[that.cos_table_data[i].vendor_sku_id][0]++;
						}
						else if (that.cos_table_data[i].theor_sales == 0){
							signs[that.cos_table_data[i].vendor_sku_id][1]++;
						}
						else{
							signs[that.cos_table_data[i].vendor_sku_id][2]++;
						}
					}
					else{
						dict[that.cos_table_data[i].vendor_sku_id].push(that.cos_table_data[i]);
						if(that.cos_table_data[i].theor_sales < 0){
							signs[that.cos_table_data[i].vendor_sku_id][0]++;
						}
						else if (that.cos_table_data[i].theor_sales == 0){
							signs[that.cos_table_data[i].vendor_sku_id][1]++;
						}
						else{
							signs[that.cos_table_data[i].vendor_sku_id][2]++;
						}
					}
				}
				else{
					if(dict.hasOwnProperty(that.cos_table_data[i].substitute_for)){
						dict[that.cos_table_data[i].substitute_for].push(that.cos_table_data[i]);
						if(that.cos_table_data[i].theor_sales < 0){
							signs[that.cos_table_data[i].substitute_for][0]++;
						}
						else if (that.cos_table_data[i].theor_sales == 0){
							signs[that.cos_table_data[i].substitute_for][1]++;
						}
						else{
							signs[that.cos_table_data[i].substitute_for][2]++;
						}
					}
					else{
						dict[that.cos_table_data[i].substitute_for] = [that.cos_table_data[i]];
						signs[that.cos_table_data[i].substitute_for] = [0, 0, 0];	//neg, 0, pos
						if(that.cos_table_data[i].theor_sales < 0){
							signs[that.cos_table_data[i].substitute_for][0]++;
						}
						else if (that.cos_table_data[i].theor_sales == 0){
							signs[that.cos_table_data[i].substitute_for][1]++;
						}
						else{
							signs[that.cos_table_data[i].substitute_for][2]++;
						}
					}
				}
			}
			
			var total = {};
			
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					total[key] = 0;
					if(signs[key][0] != 0 && signs[key][2] == 0){			//all negatives
						for(var i=0; i<dict[key].length; i++){
							if(dict[key][i].theor_sales < 0){
								total[key] += dict[key][i].theor_sales;
							}
						}
					}
					else if(signs[key][0] == 0 && signs[key][2] != 0){		//all positives
						for(var i=0; i<dict[key].length; i++){
							if(dict[key][i].theor_sales > 0){
								total[key] += dict[key][i].theor_sales;
							}
						}
					}
					else if(signs[key][0] != 0  && signs[key][2] != 0){		//mixed
						for(var i=0; i<dict[key].length; i++){
							if(dict[key][i].theor_sales > 0){
								total[key] += dict[key][i].theor_sales;
							}
						}
					}
					else{												//zeroes
						//no action
					}
				}
			}
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					if(signs[key][0] != 0 && signs[key][2] == 0){			//all negatives
						for(var i=0; i<dict[key].length; i++){
							if(dict[key][i].theor_sales < 0){
								dict[key][i].wauc = (dict[key][i].theor_sales / total[key]) * dict[key][i].item_cost;
							}
							else{
								dict[key][i].wauc = 0;
							}
						}
					}
					else if(signs[key][0] == 0 && signs[key][2] != 0){		//all positives
						for(var i=0; i<dict[key].length; i++){
							if(dict[key][i].theor_sales > 0){
								dict[key][i].wauc = (dict[key][i].theor_sales / total[key]) * dict[key][i].item_cost;
							}
							else{
								dict[key][i].wauc = 0;
							}
						}
					}
					else if(signs[key][0] != 0  && signs[key][2] != 0){		//mixed
						for(var i=0; i<dict[key].length; i++){
							if(dict[key][i].theor_sales > 0){
								dict[key][i].wauc = (dict[key][i].theor_sales / total[key]) * dict[key][i].item_cost;
							}
							else{
								dict[key][i].wauc = 0;
							}
						}
					}
					else{												//zeroes
						for(var i=0; i<dict[key].length; i++){
							if(dict[key][i].substitute_for == null){
								dict[key][i].wauc = dict[key][i].item_cost;
							}
							else{
								dict[key][i].wauc = 0;
							}
						}
					}
				}
			}
			var p_indx = {};
			var yo = [];
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					var uc = 0, pur = 0, sales = 0, beg = 0, end = 0, ther = 0, unit = 0, cost = 0;
					for(var i=0; i<dict[key].length; i++){
						if(dict[key][i].substitute_for == null){
							p_indx[key] = i;
						}
						uc += dict[key][i].wauc;
						pur += dict[key][i].purchases;
						sales += dict[key][i].sales;
						beg += dict[key][i].beg_oz;
						end += dict[key][i].end_oz;
						ther += dict[key][i].theor_sales;
						unit += dict[key][i].unit_variance;
						cost += dict[key][i].cost_variance;
					}
					
					//try{
					dict[key][p_indx[key]].wauc = uc;
					//}
					/*catch(err){
						console.log(p_indx);
						console.log(key);
						console.log(dict[key]);
					}*/
					dict[key][p_indx[key]].purchases = pur;
					dict[key][p_indx[key]].sales = sales;
					dict[key][p_indx[key]].beg_oz = beg;
					dict[key][p_indx[key]].end_oz = end;
					dict[key][p_indx[key]].theor_sales = ther;
					dict[key][p_indx[key]].unit_variance = unit;
					dict[key][p_indx[key]].cost_variance = cost;
					yo.push(dict[key][p_indx[key]]);
				}
			}
			
			//use ng-repeat orderby instead...
			//yo.sort(function(a,b) {return (a.item_name > b.item_name) ? 1 : ((b.item_name > a.item_name) ? -1 : 0);} ); 
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
								var pw = (that.model.current_item.partial_total - (item.tare_weight * that.model.current_item.n_partial_entries) ) / item.size;
								that.global_cos_table_data[c].unit_variance = (that.model.current_item.full_total + pw) - that.model.current_item.OH;
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
				that.api.get_audit_dates({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 2}).then(function (res1) {
					that.audit_dates = res1.data.data.Report;
					that.audit_dates_f = res1.data.data.Report.map(function(x) {return x.audit_dates.substring(0, 10)});
					that.audit_dates_t = JSON.parse(JSON.stringify(that.audit_dates_f));
					that.audit_dates_f.splice(0, 1);
					that.start_date = that.audit_dates_f[0];
					that.end_date = that.audit_dates_t[0];
					var params = item ? {"RestaurantId": that.restaurant_id.restaurant_id, "Category": that.selected_category.category == 'Shelf to Sheet' ? that.selected_subcategory.category : that.selected_category.category, 'start_date': that.start_date, 'end_date': that.end_date, 'inventory_type_id': 2, 'vendor_sku_id': that.model.current_item.vendor_sku_id} : {"RestaurantId": that.restaurant_id.restaurant_id, "Category": that.selected_category.category == 'Shelf to Sheet' ? that.selected_subcategory.category : that.selected_category.category, 'start_date': that.start_date, 'end_date': that.end_date, 'inventory_type_id': 2};
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
		
		
		/** recalculate total entries */
		that._recalculateTotal = function() {
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
			that.model.current_item.partial_total = that._computeTotalByString(that.model.current_item.partial_values);
			that.model.current_item.packs_qty_inp = null;
			that.model.current_item.item_qty_inp = null;
			//that.model.current_item.selected_partial_input_mode = that.model.current_item.category == 'Draft Beer' ? 'Lbs' : 'Oz';
			that.model.current_item.selected_partial_input_mode = that.model.current_item.category == 'Draft Beer' || that.model.current_item.category == 'Draft Wine' ? that.model.global_partial_input_mode == 'Oz' ? 'Lbs' : that.model.global_partial_input_mode : that.model.global_partial_input_mode == 'Lbs' ? 'Oz' : that.model.global_partial_input_mode;
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
						that.api.delete_inventory_audit(2, that.is_sug_aud).then(function (res1) {
							if(res) {
								SweetAlert.swal("Deleted!", "Please proceed to startover a new audit.", "success");
								$state.go('alcoholSubCategories');
							}
							
						});
					}
				}
			);
				
		}
		
		
		/** Submit inventory item */
		that._submitInventory = function(item, is_ve) {
			var m = {
			inventory_type_id: 2,
			counting_started_at: new Date(that.pickers.beginDate.date).getTime(),
			counting_ended_at: new Date().getTime(),
			is_final_save: 0,
			is_adjustment: 0,
			inventory_items: [item],
			shelf_to_sheet: true,
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
		
		
		//calc total oz
		that.calculate_uom_of_delivery = function(item) {
			return (
				(item.full_total * item.size) + (item.partial_total - (item.n_partial_entries * item.tare_weight))
			);
		};
		
		that.disableCheckBoxes = function() {
			that.model.subcat_enabled = false;
			that.model.size_enabled = false;
			that.model.weight_enabled = false;
		}
		
		that.viewReport = function() {
			$state.go('reports.alcoholCostOfSummary');
		}
		
		that.finalSaveAudit = function (caller) {
			if(caller == 'suggested'){
				that.api.get_audit_dates({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 2}).then(function (res1) {
					that.audit_dates = res1.data.data.Report;
					that.audit_dates_f = res1.data.data.Report.map(function(x) 
																	{return {aud_title:x.audit_dates.substring(0, 10) + " ("+x.type+" by "+x.audited_by_org+")", audit_dates: x.audit_dates.substring(0, 10), src: x.src, type: x.type, is_suggested: x.is_suggested}});
					var adminFS = function () {
						var m = {
							inventory_type_id: 2,
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
						inventory_type_id: 2,
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
				$state.go('alcoholSubCategories');
			}
		}
		
		
		//navigate to the next/previous item
		that.navigate = function(direction) {
			that.disableCheckBoxes();
			if (direction === "next" && that.currentDrinkIndex < that.model.inventory.length-1) {
				that.currentDrinkIndex++;
				that.model.current_item = that.model.inventory[that.currentDrinkIndex];
			} 
			else if (direction === "previous" && that.currentDrinkIndex > 0) {
				that.currentDrinkIndex--;
				that.model.current_item = that.model.inventory[that.currentDrinkIndex];
			}
			that._recalculateTotal();
			that.setPrevNext(that.currentDrinkIndex);
		};
		
		
		//Set prev-next items
		that.setPrevNext = function(index) {
			if (that.model.inventory) {
				that.model.prev_item = index > 0 ? that.model.inventory[index - 1] : null;
				that.model.next_item = index < that.model.inventory.length - 1 ? that.model.inventory[index + 1] : null;
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
		
		//update size / weight
		that.handleSubmitSize = function() {
			SweetAlert.swal(
				{
				  title: "Are you sure?",
				  text:
					"Are you sure you want to change the item size or weight. This change could affect multiple reports.",
				  type: "warning",
				  showCancelButton: true,
				  confirmButtonColor: "#ed5565",
				  confirmButtonText: "Confirm"
				},
				function(res) {
					if (res) {
						var m = {
						  tare_type_id: that.model.current_item.tare_type_id,
						  full_weight: that.model.current_item.full_weight
						};
						
						that.api
						  .update_sku(that.model.current_item.vendor_sku_id, m)
						  .then(function(res) {
							if(res.status === 200) {
								var sizes = that._getItemSizes(that.model.current_item.vendor_cat_id, that.model.current_item.vendor_sub_cat_id);
								for(var s in sizes){
									if(sizes[s].tare_type_id == that.model.current_item.tare_type_id){
										that.model.current_item.size = sizes[s].content_weight;
										break;
									}
								}
								that.model.current_item.tare_weight = that.model.current_item.full_weight - that.model.current_item.size;
								that.disableCheckBoxes();
								//that.model.current_item.full_values = that.model.current_item.packs_qty_inp != null ? that.model.current_item.full_values != null ? that.model.current_item.full_values + "+" + that.model.current_item.packs_qty_inp.toString() : that.model.current_item.packs_qty_inp.toString() : that.model.current_item.full_values != null ? that.model.current_item.full_values : null;
					
								//that.model.current_item.partial_values = that.model.current_item.item_qty_inp != null ? that.model.current_item.partial_values != null ? that.model.current_item.partial_values + "+" + that.model.current_item.item_qty_inp.toString() : that.model.current_item.item_qty_inp.toString() : that.model.current_item.partial_values != null ? that.model.current_item.partial_values : null;
								that._recalculateTotal();
								var item = {
									id: that.model.current_item.id,
									vendor_sku_id: that.model.current_item.vendor_sku_id,
									item_qty: that.model.current_item.partial_total,
									cases_qty: 0,
									nof_bottles: that.model.current_item.n_partial_entries,
									packs_qty: that.model.current_item.full_total,
									total_in_uom_of_delivery: that.calculate_uom_of_delivery(that.model.current_item),
									item_qty_formula: that.model.current_item.partial_values,
									full_values: that.model.current_item.full_values,
									partial_values: that.model.current_item.partial_values
								};
								
								that._submitInventory(item, true);
							}
						  });
					}
				}
			);
		};
		
		
		//get item sizes (tare types)
		that._getItemSizes = function(cat_id, sub_cat_id) {
			if (!cat_id && !sub_cat_id) return [];
			var _a = [];
			
			for (var i = 0; that.refbooks.default_weights.length > i; i++) {
				if (that.refbooks.default_weights[i].vendor_cat_id === cat_id && that.refbooks.default_weights[i].vendor_sub_cat_id === sub_cat_id) {
					for (var j = 0; that.refbooks.tare_types.length > j; j++) {
						if (that.refbooks.tare_types[j].tare_type_id === that.refbooks.default_weights[i].tare_type_id) {
							if (_a.indexOf(that.refbooks.tare_types[j]) === -1) {
								var tt = that.refbooks.tare_types[j];
								tt.content_weight = that.refbooks.default_weights[i].content_weight;
								_a.push(tt);
								//_a.push(that.refbooks.tare_types[j]);
							}
						}
					}
				}
			}
			return _a;
		};
		
		//hide/show substitutes
		that.hideShowSubstitutes = function(is_manual, inv_list) {
			that.hide_subs = !is_manual ? that.hide_subs : that.hide_subs ? false : true;
			if(!inv_list){
				that.currentDrinkIndex = 0;
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
				that.setPrevNext(that.currentDrinkIndex);
			}
		};
		
		//search
		that.handleSearch = function(query) {
			//need to exit s2s from s2s if searched?
			that.disableCheckBoxes();
			that.currentDrinkIndex = 0;
			if(that.hide_subs){
				//that.hideShowSubstitutes(false, that.model.inventory);
				that.hideShowSubstitutes(false, INVENTORY_MASTER_LIST);
			}
			else{
				that.model.inventory = INVENTORY_MASTER_LIST;
			}
			
			
			if (query && query.length) {
				that.model.inventory = that.model.inventory.filter(function(item) {
				//that.model.inventory = INVENTORY_MASTER_LIST.filter(function(item) {
				  return item.inventory_item
					.toUpperCase()
					.includes(query.toUpperCase());
				});
			}
			else{
				that.model.inventory = INVENTORY_MASTER_LIST;
				if(that.hide_subs){
					that.hideShowSubstitutes(false, that.model.inventory);
				}
			}
			
			that.model.current_item = that.model.inventory[0];
			that.model.quick_search_keys = that._extractKeys();
			that._recalculateTotal();
			that.setPrevNext(that.currentDrinkIndex);
		};
		
		
		//jump to item starting with letter = key
		that.jumpToLetter = function(key) {
			//need to exit s2s from s2s if jumped?
			that.disableCheckBoxes();
			that.currentDrinkIndex = 0;
			
			if(that.selected_subcategory != null){
				that.model.inventory = that._filterBySubCategoryId(that.selected_subcategory);
			}
			
			if(that.hide_subs){
				that.hideShowSubstitutes(false, that.model.inventory);
			}
			
			for(var i = 0; i<that.model.inventory.length; i++){
				if(key == that.model.inventory[i].inventory_item[0].toUpperCase()){
					break;
				}
				else{
					that.currentDrinkIndex++;
				}
			}
			that.model.current_item = that.model.inventory[that.currentDrinkIndex];
			
			that._recalculateTotal();
			that.setPrevNext(that.currentDrinkIndex);
		};
		
		
		//extract letter jump keys
		that._extractKeys = function() {
			var letters = new Set();
			that.model.inventory.forEach(function(item) {
				var letter = item.inventory_item[0].toUpperCase();
				letters.add(letter);
			});
			return Array.from(letters).sort();
		};
		
		
		//generate shelf to sheet ordered item list
		that.generateShelfToSheet = function(data) {
			var sh_sh_list = [];
			if (data.inventory.length) {
				for (var i = 0; i < data.shelf_to_sheet.length; i++) {
					for (var j = 0; j < data.inventory.length; j++) {
						if (data.shelf_to_sheet[i].vendor_sku_id == data.inventory[j].vendor_sku_id) {
							sh_sh_list.push(data.inventory[j]);
							break;
						}
					}
				}
				if (sh_sh_list.length) {
					for (var i = 0; i < data.inventory.length; i++) {
						var exists = false;
						for (var j = 0; j < sh_sh_list.length; j++) {
							if (data.inventory[i].id == sh_sh_list[j].id) {
								exists = true;
								break;
							}
						}
						if(!exists){
							sh_sh_list.push(data.inventory[i]);
						}
					}
				}
				else { // if sh_sh_list is empty (sku_id not found) return the whole list
					sh_sh_list = data.inventory;
				}
			}
			return sh_sh_list;
		};
		
		
		//filter subcat items
		that._filterBySubCategoryId = function(sub_cat) {
			var filtered_items;
			if (sub_cat) {
				//filtered_items = that.model.inventory.filter(function(item) {
				filtered_items = INVENTORY_MASTER_LIST.filter(function(item) {
				  return item.vendor_sub_cat_id === sub_cat.id;
				});
			}
			return filtered_items;
		};
		
		
		//change subcategory
		that.handleSubcatClick = function(sub_cat) {
			that.disableCheckBoxes();
			that.currentDrinkIndex = 0;
			if (that.selected_category.category == 'Shelf to Sheet') {
				that._getInventories(sub_cat, true, sub_cat);
			}
			else {
				that.model.inventory = that._filterBySubCategoryId(sub_cat);
				if(that.hide_subs){
					that.hideShowSubstitutes(false, that.model.inventory);
				}
				that.model.quick_search_keys = that._extractKeys();
				that.model.current_item = that.model.inventory[0];
				that.selected_subcategory = sub_cat;
				that._recalculateTotal();
				that.setPrevNext(that.currentDrinkIndex);
			}
			//that.selected_subcategory = sub_cat;
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
		that._getInventories = function(category, shelf_to_sheet, sub_cat_to) {
			var headers = {
				is_adjustment: 0,
				inventory_type_id: 2,
				vendor_cat_id: category.id,
				inventory_item: null,
				shelf_to_sheet: shelf_to_sheet,
				audit_start_TS: true,
				suggested: that.is_sug_aud
			};
			
			that.api.get_inventory_audit(headers).then(function(res) {
				/** On app initial load, show shelf to sheet inventory */
				that.res_data_audit_start = res.data.data.audit_start;
				that.pickers.beginDate.date = typeof res.data.data.audit_start != 'undefined' && res.data.data.audit_start[0].audit_start != null ? new Date(res.data.data.audit_start[0].audit_start) : new Date();
				that.pickers.beginDateBackup.date = JSON.parse(JSON.stringify(that.pickers.beginDate.date));
				if (shelf_to_sheet) {
					INVENTORY_MASTER_LIST = that.generateShelfToSheet(res.data.data);
					that.hideShowSubstitutes(false);
					that.model.subcategories = JSON.parse(JSON.stringify(that.model.categories));
					that.model.subcategories.shift();
					that.selected_subcategory = sub_cat_to ? sub_cat_to : that.model.subcategories[0];
				}
				else {
					INVENTORY_MASTER_LIST = res.data.data.inventory;
					that.hideShowSubstitutes(false);
					that.model.subcategories = that._getSubcategories();
					that.selected_subcategory = null;
					that.model.quick_search_keys = that._extractKeys();
				}
				
				that.currentDrinkIndex = shelf_to_sheet ? res.data.data.shelf_to_sheet.length < that.model.inventory.length - 1 ? res.data.data.shelf_to_sheet.length: that.model.inventory.length - 1 : 0;
				that.model.current_item = that.model.inventory[that.currentDrinkIndex];
				that._recalculateTotal();
				that.setPrevNext(that.currentDrinkIndex);
				if(that.showCOSDetails){
					that.getCOS();
				}
			});
		};
		
		
		//change category
		that.handleCategoryClick = function(category) {
			that.disableCheckBoxes();
			that.selected_category = category;
			if (category.category == 'Shelf to Sheet') {
				that._getInventories(that.model.categories[1], true, null);
			} 
			else {
				that._getInventories(category, false, null);
			}	
		};
		
		that.checkEmpType = function () {
			that.SetUpStatus = restaurant.data.info.is_setup_completed;
			var emps = restaurant.data.info.employees;
			that.user = {userid: null, user_type_id: null};
			that.user.userid = that.auth.authentication.user.id;
			that.model.global_partial_input_mode = 'Pts';
			if(that.user.userid == 1){
				that.showCOSDetails = true;
				that.model.global_partial_input_mode = 'Oz';
			}
			else{
				that.showCOSDetails = false;
				for (var i = 0; emps.length > i; i++) {
					if(emps[i].id == that.user.userid){
						that.user.user_type_id = emps[i].type_ids;
						if(emps[i].type_ids == 1 || emps[i].type_ids == 2 || emps[i].type_ids == 4){
							that.showCOSDetails = true;
						}
						else if(emps[i].type_ids == 9 || emps[i].type_ids == 10){	//Skrible Auditors
							that.showCOSDetails = true;
							that.model.global_partial_input_mode = 'Oz';
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
				inventory_type_id: 2,
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
								that.api.set_audit_date({inventory_type_id: 2, audit_date: new Date(that.pickers.beginDate.date).getTime()}).then(function (res1) {
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
		
		that.init_tasks = function (response){
			that.refbooks = response[0];
			that.hide_subs = true;
			that.model.categories = response[1].data.data.categories;
			that.model.categories.unshift({id: -1, category: "Shelf to Sheet", inventory_type_id: 2});
			that.handleCategoryClick(that.model.categories[0]);
		}
		
		//init
		Promise.all([core.getRefbooks(), api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 2}), that.checkEmpType(), that.getLocations()]).then(function(response) {
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
						that.init_tasks(response);
					}
				);
			}
			else{
				that.init_tasks(response);
			}
		});
	}

  tabletEntryController.$inject = [
    "api",
    "$state",
    "auth",
    "localStorageService",
    "restaurant",
    "core",
	"alertService",
    "SweetAlert",
    "$uibModal"
  ];

  angular.module("inspinia").component("tabletEntryComponent", {
    templateUrl: "js/components/alcoholSetup/tabletEntry/tabletEntry.html",
    controller: tabletEntryController,
    controllerAs: "$ctr",
    bindings: {}
  });
})();