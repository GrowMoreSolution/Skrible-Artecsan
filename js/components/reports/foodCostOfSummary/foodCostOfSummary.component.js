(function () {
    'use strict';

	var modalController = function ($uibModalInstance, alertService, SweetAlert, is_send_email, start_dates) {
        var that = this;
		that.pg_no = 1;
		that.user_response = {};
		that.audit_type = '';
		that.is_send_email = is_send_email;
		that.audit_dates_f = start_dates;
		that.start_date_compare = null;
		that.additional_notes = null;
		that.q_title = 'Select Type';
		that.q_texts = '<article style="display: block;"><p>How do you want to save this audit?</p></article>';
		that.q_additional_texts = '';

		that.set_page_no = function(dir){
			that.start_date_compare = null;
			if(dir == 'back'){
				that.pg_no--;
			}
			if(that.pg_no == 1){
				that.q_title = 'Select Type';
				that.q_texts = '<article style="display: block;"><p>How do you want to save this audit?</p></article>';
			}
			else if(that.pg_no == 2){
				that.set_audit_type(that.audit_type);
			}
		}
		
		that.set_audit_type = function(a_type){
			that.audit_type = a_type;
			that.pg_no = 2;
			that.q_title = 'Final Save '+that.audit_type+'?';
			if(that.audit_type == 'full'){
				that.q_texts = '<article style="display: block;"><p>This will permanently update your on-hand count as of today. <b>Any items that were not counted will be saved as 0.</b> You can choose either to only Save the audit but not send the email report or do both.</p></article>';
			}
			else if(that.audit_type == 'adjustment'){
				that.q_texts = '<article style="display: block;"><p>This will permanently update your on-hand count as of today. <b>Any items that were not counted will not be saved.</b> You can choose either to only Save the audit but not send the email report or do both.</p></article>';
			}
			else if(that.audit_type == 'purchase audit'){
				that.q_texts = '<article style="display: block;"><p>This will permanently update your on-hand count as of today. <b>Any items that were not counted will not be saved.</b> A purchase audit report will be emailed to you soon.</p></article>';
			}
		}

		that.set_email_value = function(val) {
			if(val == false){
				that.is_send_email = val;
				that.save();
			}
			else{
				if(that.pg_no == 2){
					that.pg_no = 3;
					if(that.audit_type == 'full'){
						that.q_texts = '<article style="display: block;"><p>Please select the date of the previous audit to generate the Cost of Sales report.</p></article>';
					}
					if(that.pg_no == 3){
						that.q_additional_texts = '<article style="display: block;"><br\><p>Enter any additional notes you would like to be included in the report.</p></article>';
					}
				}
				else{
					if(that.audit_type == 'full' && that.start_date_compare == null){
						alertService.showError("Please select a date!");
						return;
					}
					else{
						if(that.audit_type == 'full' && that.start_date_compare.type != 'full'){
							SweetAlert.swal({
								title: "Error!",
								text: "The previous count needs to be a full audit.",
								type: "warning",
								confirmButtonColor: "#ed5565",
								confirmButtonText: "OK"
							},
							function (res) {
								that.start_date_compare = null;
								return;
							});
						}
						else{
							that.is_send_email = val;
							if(that.start_date_compare == null){
								that.start_date_compare = that.audit_dates_f[0];
							}
							that.save();
						}
					}
				}
			}
		}
		
        that.save = function() {
			$uibModalInstance.close({'audit_type': that.audit_type, 'is_send_email': that.is_send_email, 'prev_audit_date': that.start_date_compare, 'additional_notes': that.additional_notes});
		};

		that.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};
    };
	
    function foodCostOfSummaryController(api, $state, auth, core, alertService, SweetAlert, $q, localStorageService, $uibModal, restaurant, $rootScope, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }
		
        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;
        that.subcats = [];
        that.temp_subcats = [];
        that.category = '';
        that.subcategory = null;
        that.gross_sales = 0;
        that.discounts = 0;
        that.total_sales = 0;
        that.value_last_period = 0;
        that.purchase_value = 0;
        that.value_this_period = 0;
        that.target_cost = 0;
        that.value_used = 0;
        that.cost_percent = 0;
        that.target_cost_percent = 0;
        that.os_percent_variance = 0;
		that.cos_table_data = [];
		that.var_total_cost = null;
		that.end_date_is_suggested = false;

        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id;
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

		that.checkEmpType = function () {
			var emps = restaurant.data.info.employees;
			that.user = {userid: null, user_type_id: null};
			that.user.userid = that.auth.authentication.user.id;
			if(that.user.userid == 1){
				that.showFinalSaveButton = true;
			}
			else{
				for (var i = 0; emps.length > i; i++) {
					if(emps[i].id == that.user.userid){
						that.user.user_type_id = emps[i].type_ids;
						if(emps[i].type_ids == 2 || emps[i].type_ids == 3 || emps[i].type_ids == 5 || emps[i].type_ids == 9 || emps[i].type_ids == 10){
							that.showFinalSaveButton = true;
						}
						else{
							that.showFinalSaveButton = false;
						}
						break;
					}
				}
			}
		}
		
		that.finalSaveAudit = function () {
			var deferred = $q.defer();
			/*that.api.get_suggested_audit({inventory_type_id: 1}).then(function (res) {
				var is_suggested = false;
				if (res.data.data.code === 1000) {
					is_suggested = res.data.data.inventory.length ? true : false;
				}*/
				
				var adminFS = function () {
					var m = {
						inventory_type_id: 1,
						counting_started_at: new Date().getTime(),
						counting_ended_at: new Date().getTime(),
						is_final_save: 1,
						is_adjustment: that.audit_type == 'full' ? 0 : 1,
						send_email: that.is_send_email == false ? false : true,
						additional_notes: that.additional_notes,
						inventory_items: []
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
								that.$onInit();
								alertService.showAlertSave();
								deferred.resolve()
							}
							that.loading = false;
						} catch (e) {
							console.log(e);
							that.loading = false;
							deferred.reject()
						}
					}, function () {
						deferred.reject()
					});
				}
				
				/*if(is_suggested){
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
							that.prev_audit_date = that.audit_dates_f[0];
							adminFS();
						}
					});
				}
				else{*/
					that.is_send_email = false;
					that.audit_type = 'full';
					that.additional_notes = null;
					var modalInstance = $uibModal.open({
						templateUrl: 'admin_final_save.html',
						controller: modalController,
						windowClass: "animated fadeIn modal-lgg",
						controllerAs: '$ctr',
						resolve: {
							is_send_email: function () {
								return that.is_send_email;
							},
							start_dates: function () {
								return that.audit_dates_f;
							}
						}
					});

					
					
					modalInstance.result.then(function (res) {
						that.loading = true;
						that.is_send_email = res.is_send_email;
						that.audit_type = res.audit_type;
						that.prev_audit_date = res.prev_audit_date;
						that.additional_notes = res.additional_notes;
						adminFS();
					});
				/*}
			});*/
		}
		
		that.createConversionTable = function () {
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
		
		that.convert = function (from, to){
			if(from == to){
				return 1;
			}
			else if(to == 10 || to == 11 || to == 12 || to == 13 || to == 16 || to == 17 || to == 18){
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
				/*if(that.cos_table_data[i].vendor_sku_id == 34130){
					console.log("here", dict[key]);
				}*/
			}
			
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					/*if(key == 38305){
						console.log("here2", dict[key], primary_uod[key]);
					}*/
					for(var i=0; i<dict[key].length; i++){
						var conv_val = typeof primary_uod[key] == 'undefined' ? 1 : that.convert(dict[key][i].uod_id, primary_uod[key]);
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
			var deviation_percent = 10;
			for (var key in dict) {
				if (dict.hasOwnProperty(key)) {
					var uc = 0, pur = 0, sales = 0, beg = 0, awc = 0, end = 0, ther = 0, unit = 0, cost = 0;
					//console.log(key, dict[key]);
					for(var i=0; i<dict[key].length; i++){
						if(dict[key][i].substitute_for == null){
							p_indx[key] = i;
							break;
						}
					}
					
					if(typeof p_indx[key] == 'undefined'){
						//do not merge
						for(var i=0; i<dict[key].length; i++){
							// highlight any anomalies as red text
							var inv_units_sold = dict[key][i].beg_oz + dict[key][i].purchases - dict[key][i].awc - dict[key][i].end_oz;
							var uv_deviation = (dict[key][i].unit_variance * deviation_percent) / 100;
							
							dict[key][i].red_alert = dict[key][i].unit_variance > inv_units_sold * (100 + deviation_percent) / 100 ? true : dict[key][i].unit_variance < inv_units_sold * (100 - deviation_percent) / 100 ? true : false;
							// highlight any anomalies as red text
							yo.push(dict[key][i]);
						}
						//console.log("not merging", dict[key]);
					}
					else{
						for(var i=0; i<dict[key].length; i++){
							uc += dict[key][i].wauc;
							pur += dict[key][i].purchases;
							sales += dict[key][i].sales;
							beg += dict[key][i].beg_oz;
							awc += dict[key][i].awc;
							end += dict[key][i].end_oz;
							ther += dict[key][i].theor_sales;
							unit += dict[key][i].unit_variance;
							//cost += dict[key][i].cost_variance;
							//console.log("inside ", key, dict[key][i], uc, pur, sales, beg, awc, end, ther, unit);
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
						
						// highlight any anomalies as red text
						var inv_units_sold = dict[key][p_indx[key]].beg_oz + dict[key][p_indx[key]].purchases - dict[key][p_indx[key]].awc - dict[key][p_indx[key]].end_oz;
						var uv_deviation = (dict[key][p_indx[key]].unit_variance * deviation_percent) / 100;
						
						dict[key][p_indx[key]].red_alert = dict[key][p_indx[key]].unit_variance > inv_units_sold * (100 + deviation_percent) / 100 ? true : dict[key][p_indx[key]].unit_variance < inv_units_sold * (100 - deviation_percent) / 100 ? true : false;
						// highlight any anomalies as red text
						yo.push(dict[key][p_indx[key]]);
					}
				}
			}
			
			//use ng-repeat orderby instead...
			//yo.sort(function(a,b) {return (a.item_name > b.item_name) ? 1 : ((b.item_name > a.item_name) ? -1 : 0);} );		
			that.cos_table_data = yo;
		}
			
			
        that.loadCOS = function () {
			that.disable_final_save = that.end_date.src == 'history' ? true : false;
			if(that.start_date.audit_dates > that.end_date.audit_dates){
				alertService.showError("Invalid date range!");
				return;
			}
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			if(that.audit_dates_t.length < 2){
				swal.close();
				return;
			}
			that.loading = true;
			that.blindMode = that.end_date.src == 'history' ? false : (that.user.user_type_id == 5) ? true : false;

            that.api.alcoholCostSummary({'RestaurantId': that.restaurant_id.restaurant_id, 'start_date': that.start_date.audit_dates, 'end_date': that.end_date.audit_dates, 'category': 'Food', 'inventory_type_id': 1}).then(function (sum_res) {
                if (!sum_res) {
                    console.log("error getting the COS results");
                }
				swal({
					title: "",
					text: "Loading...",
					imageUrl: "img/loading2.gif",
					showConfirmButton: false,
				});

				that.api.sku_table({"RestaurantId": that.restaurant_id.restaurant_id, "Category": that.category == '-- All --' ? '%' : that.category, "start_date": that.start_date.audit_dates, "end_date": that.end_date.audit_dates, 'inventory_type_id': 1, 'sub_category': that.subcategory == '-- All --' ? '%' : that.subcategory}).then(function (res) {
					if(res){
						that.loading = false;
						that.var_total_cost = null;
						that.cos_table_data = res.data.data.sku_table;
						that.begin_date_available = false;
						if(that.cos_table_data.length){
							if(typeof that.cos_table_data[0].begin_date != 'undefined'){
								that.begin_date_available = true;
							}
						}
						that.preProcessCOS();
		
						var Variance = [['x'],['variance']];
						
						if(that.category == '-- All --'){
							that.value_last_period = 0;
							that.purchase_value = 0;
							that.awc = 0;
							that.value_this_period = 0;
							that.target_cost = 0;
						}
						
						for(var i = 0; i < that.cos_table_data.length; i++){
							if(that.category == '-- All --'){
								//console.log(that.cos_table_data[i]);
								that.value_last_period += that.cos_table_data[i].wauc * that.cos_table_data[i].beg_oz;
								that.purchase_value += that.cos_table_data[i].wauc * that.cos_table_data[i].purchases;
								that.awc += that.cos_table_data[i].wauc * that.cos_table_data[i].awc;
								that.value_this_period += that.cos_table_data[i].wauc * that.cos_table_data[i].end_oz;
								that.target_cost += that.cos_table_data[i].wauc * that.cos_table_data[i].sales;
								//console.log(that.cos_table_data[i].item_name, that.value_last_period, that.awc, that.var_total_cost);
							}
							if(that.cos_table_data[i].unit_variance != 0){
								Variance[0].push(that.cos_table_data[i].item_name);
								Variance[1].push(that.cos_table_data[i].unit_variance);
							}
							that.var_total_cost += that.cos_table_data[i].cost_variance;
						}
						that.var_total_cost = Math.round(that.var_total_cost);
						
						if(that.category == '-- All --'){
							var cos_res = sum_res.data.data.cos[0];
							that.gross_sales = Math.round(cos_res.Gross_Sales, 2);
							that.discounts = Math.round(cos_res.Discounts, 2);
							that.total_sales = that.gross_sales + that.discounts;
							
							that.value_last_period = Math.round(that.value_last_period, 2); //Math.round(cos_res.Value_Last_Period, 2);
							that.last_type = 'Actual'; //cos_res.Last_type;
							that.purchase_value = Math.round(that.purchase_value, 2); //Math.round(cos_res.Purchase_Value, 2);
							that.awc = Math.round(that.awc, 2); //Math.round(cos_res.Purchase_Value, 2);
							that.value_this_period = Math.round(that.value_this_period, 2); //Math.round(cos_res.Value_This_Period, 2);
							that.this_type = 'Actual'; //cos_res.This_type;
							that.target_cost = Math.round(that.target_cost, 2); //Math.round(cos_res.Target_Cost, 2);
							
							that.value_used = that.value_last_period + that.purchase_value - that.awc - that.value_this_period;
							that.cost_percent = Math.round(((that.value_used / that.total_sales) * 10000)) / 100;
							that.target_cost_percent = Math.round(((that.target_cost / that.total_sales) * 10000)) / 100;
							that.os_percent_variance = Math.round(((that.cost_percent - that.target_cost_percent) * 100)) / 100;
							//console.log(that.value_last_period, that.awc, that.var_total_cost);
						}
				
						if(Variance[0].length == 1){
							var Variance = [];
						}
						var chart = c3.generate({
							bindto: '#uv-div1',
							size: {
								height: 450
							},
							data: {
								x: 'x',
								columns: Variance,
								type: 'bar',
								empty: {label: {text: "No data found."}}
							},
							zoom: {
								enabled: true,
								rescale: true
							},
							axis: {
								rotated: true,
								x: {
									type: 'category'
								},
								y: {
									tick: {
										format: function (d) {
											return parseFloat(Math.round(d * 100)/100);
										}
									}
								}
							},
							legend: {
								show: false
							}
						});
						chart.zoom([0, 10]);
						
					}
					swal.close()
				});

            });
        };
		
		that.loadLocationsReport = function () {
			that.loading = true;
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.api.locations_report({"RestaurantId": that.restaurant_id.restaurant_id, "Category": that.category == '-- All --' ? '%' : that.category, 'start_date': that.start_date.audit_dates, 'end_date': that.end_date.audit_dates, 'inventory_type_id': 1, 'sub_category': that.subcategory == '-- All --' ? '%' : that.subcategory}).then(function (res) {
				if(typeof res.data.data.locationsReport.cos_data != 'undefined' && res.data.data.locationsReport.locations != 'undefined'){
					that.l_start_date = that.start_date.audit_dates;
					that.l_end_date = that.end_date.audit_dates;
					that.l_cos_data = res.data.data.locationsReport.cos_data;
					that.locations = res.data.data.locationsReport.locations;
				}
				that.loading = false;
				swal.close()
			});
        };
		
		that.loadTrendReport = function () {
			that.loading = true;
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.api.audit_trend_report({"RestaurantId": that.restaurant_id.restaurant_id, "Category": that.category == '-- All --' ? '%' : that.category, "sub_category": that.subcategory == '-- All --' ? '%' : that.subcategory, 'inventory_type_id': 1}).then(function (res) {
				if(res){
					that.trend_data = res.data.data.auditTrendReport.trend_data;
					that.trend_dates = res.data.data.auditTrendReport.audit_dates.reverse();
				}
				that.loading = false;
				swal.close()
			});
        };
		
        that.getsubcats = function () {
            that.temp_subcats = [];
			if(that.category != '-- All --'){
				for (var i = 0; i < that.subcats.length; i++)
				{
					if (that.subcats[i].parent_cat == that.category)
					{
						that.temp_subcats.push({'name': that.subcats[i].sub_category});
					}
				}
			}
			that.temp_subcats.unshift({'name': '-- All --'});
            if (that.temp_subcats.length > 0)
            {
                that.subcategory = that.temp_subcats[0].name;
            }
        }
		
		that.changeMode = function (mode) {
			if(that.mode != mode){	//avoid unnecessary calls
				that.mode = mode;
				if(that.mode != 'review'){
					if(that.mode == 'trend'){
						that.loadTrendReport();
					}
					else{
						that.loadCOS();
					}
				}
				else{
					that.loadLocationsReport();
				}
			}
		}
		
		this.exportReport = function(type){
			if(type == 'details'){
				this.downloadDetails();
			}
			else if(type == 'review'){
				this.downloadReview();
			}
			else if(type == 'trend'){
				this.downloadTrend();
			}
		}
		
		this.downloadDetails = function() {
			that.export_loading = true;
            const getData = [];

            this.cos_table_data.forEach(function(data) {
                getData.push({
					Category: data.category,
                    SKU: data.vendor_sku.replace(/[,'#]/g, ' '),
                    Item: data.item_name.replace(/[,'#]/g, ' '),
                    UnitCost: data.wauc,
                    BeginningInv: data.beg_oz,
                    Purchases: data.purchases,
					PrepdItemsAdj: data.awc,
                    EndingInv: data.end_oz,
                    InvUnitsSold: data.theor_sales,
                    POSUnitsSold: data.sales,
                    UnitVariance: data.unit_variance,
                    CostVariance: data.cost_variance,
                });
            });


            const headers = ['Category', 'SKU', 'Item', 'UnitCost', 'BeginningInv', 'Purchases', 'PrepdItemsAdj', 'EndingInv', 'InvUnitsSold', 'POSUnitsSold', 'UnitVariance', 'CostVariance'];
            var csv = (headers.join(',') + '\r\n');

            getData.forEach(function(row) {
                const values = headers.map(function(header) {
                    return row[header];
                })
                csv += (values.join(',') + '\r\n')
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Cost of Sales Summary.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		this.downloadReview = function() {
			that.export_loading = true;
            const getData = [];

			
            that.l_cos_data.forEach(function(data) {
				var l_obj = {};
				l_obj['Item'] = data.item_name;
				l_obj['Variance'] = data.unit_variance;
				
				that.locations.forEach(function(ldata) {
					l_obj[ldata.location_name+'_'+that.l_start_date] = data[ldata.sr_no]['beg'];
					l_obj[ldata.location_name+'_'+that.l_end_date] = data[ldata.sr_no]['end'];
				});
				l_obj['Unassigned'+'_'+that.l_start_date] = data['-1']['beg'];
				l_obj['Unassigned'+'_'+that.l_end_date] = data['-1']['end'];
				getData.push(l_obj);
            });


            const headers = ['Item'];
			that.locations.forEach(function(data) {
                headers.push(data.location_name+'_'+that.l_start_date);
				headers.push(data.location_name+'_'+that.l_end_date);
            });
			headers.push('Unassigned'+'_'+that.l_start_date);
			headers.push('Unassigned'+'_'+that.l_end_date);
			headers.push('Variance');
			
            var csv = (headers.join(',') + '\r\n');

            getData.forEach(function(row) {
                const values = headers.map(function(header) {
                    return row[header];
                })
                csv += (values.join(',') + '\r\n')
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Cost of Sales Review.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		this.downloadTrend = function() {
			that.export_loading = true;
            const getData = [];
	
			that.trend_data.sort(function(a,b) {return (a.item_name > b.item_name) ? 1 : ((b.item_name > a.item_name) ? -1 : 0);} );
            that.trend_data.forEach(function(data) {
				var d_obj = {SKU: data.vendor_sku.replace(/[,'#]/g, ' '),
                    ItemName: data.item_name.replace(/[,'#]/g, ' ')};
				var indx = 0;
				for(var td in that.trend_dates){
					d_obj[that.trend_dates[td].audit_dates.substring(0,10)] = data.variances[indx++];
				}
                getData.push(d_obj);
            });


            var headers = ['SKU', 'ItemName'];
			headers = headers.concat(that.trend_dates.map(function(x){return x.audit_dates.substring(0,10)}));
            var csv = (headers.join(',') + '\r\n');

            getData.forEach(function(row) {
                const values = headers.map(function(header) {
                    return row[header];
                })
                csv += (values.join(',') + '\r\n')
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Cost of Sales Trend.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		this.checkEndDate = function() {
			if(that.end_date.is_suggested == 1){
				that.end_date_is_suggested = true;
			}
			else{
				that.end_date_is_suggested = false;
			}
		}
		
        that.$onInit = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.checkEmpType();
            that.core.getRefbooks().then(function (res) {
                that.subcats = res.vendor_sub_cat;
				that.api.get_active_SKU_categories({'inventory_type_id': 1}).then(function (res) {
					that.SKU_categories = res.data.data.categories;
					if(that.SKU_categories.length){
						that.SKU_categories.unshift({'category': '-- All --'});
						that.category = that.SKU_categories[0].category;
						that.mode = 'summary';
						that.getsubcats();
						that.createConversionTable();

						that.api.get_audit_dates({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 1}).then(function (res1) {
							that.audit_dates_f = res1.data.data.Report.map(function(x) {return {aud_title:x.audit_dates.substring(0, 10) + " ("+x.type+" by "+x.audited_by_org+")", audit_dates: x.audit_dates.substring(0, 10), src: x.src, type: x.type, is_suggested: x.is_suggested}});
							var draft_present = false;
							var draft_indx = null;
							for(var af in that.audit_dates_f){
								if(that.audit_dates_f[af].src == 'draft'){
									draft_present = true;
									draft_indx = af;
									break;
								}
							} 
							if(draft_present && draft_indx != null){
								for(var af in that.audit_dates_f){
									if(af != draft_indx){
										if(that.audit_dates_f[af].audit_dates == that.audit_dates_f[draft_indx].audit_dates){
											that.audit_dates_f.splice(af, 1);
											break;
										}
									}
								}
							}
					
							that.audit_dates_t = JSON.parse(JSON.stringify(that.audit_dates_f));
							that.audit_dates_f.splice(0, 1);
							if(!that.audit_dates_f.length){
								that.audit_dates_f = that.audit_dates_t;
							}
							that.start_date = that.audit_dates_f[0];
							that.end_date = that.audit_dates_t[0];
							that.checkEndDate();
							that.loadCOS();
							that.export_loading = false;
						});
					}
				});
                
            });

        };
    }

    foodCostOfSummaryController.$inject = ['api', '$state', 'auth', 'core', 'alertService', 'SweetAlert', '$q', 'localStorageService', '$uibModal', 'restaurant', '$rootScope', '$scope'];

    angular.module('inspinia').component('foodCostOfSummaryComponent', {
        templateUrl: 'js/components/reports/foodCostOfSummary/foodCostOfSummary.html',
        controller: foodCostOfSummaryController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
