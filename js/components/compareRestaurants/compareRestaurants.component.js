(function () {

    'use strict';

    function compareRestaurantsController($state, auth, api, $q, $scope, $filter, $rootScope, alertService, SweetAlert) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

		//temporary access restriction until completion
		/*if (auth.authentication.user.id !== 1 && auth.authentication.user.id !== 161 && auth.authentication.user.id !== 232) {
			alertService.showError('Access denied!');
            $state.go('home');
            return;
        }*/
		
        var that = this;
		
        that.api = api;
						
		that.r_list = [];
		that.m = {
            order_by: "id",
            order_way: "DESC",  //ASC/DESC
        };
		
		that.updmaploading = 0;
		
		//top filter
        that.restaurantsList = [];
		that.selectedRestaurants = [];
		that.multiSelectSettings = {selectionLimit: 7, scrollableHeight: '200px', scrollable: true};
		
        that.inventory_category = 'Total Sales';
		that.prev_cat = null;
		that.period = 'Daily';
		
		var from_date = new Date();
        var days = 21;
        from_date.setDate(from_date.getDate() - days);
        that.begin_date = from_date;
        that.end_date = new Date();
		
        that.is_total_sales = 0;
		//top filter
		
		//bottom filter
		that.restaurantsList_b = [];
		that.selectedRestaurants_b = [];
		that.multiSelectSettings_b = {selectionLimit: 7, scrollableHeight: '200px', scrollable: true};
		
        that.inventory_category_b = null;
		that.prev_cat_b = null;
		
		var from_date_b = new Date();
        var days_b = 21;
        from_date_b.setDate(from_date_b.getDate() - days_b);
        that.begin_date_b = from_date_b;
        that.end_date_b = new Date();
        that.select_report = 'Unit Cost';
		//bottom filter

		
		/////////////////////////////////////////////////////////////////////////////
		that.reset_table = function () {
			that.bottom_table_result = [];
		}
		
		that.loadDetailsTable = function () {
			that.detailsloading = 0;
			var dayfd = that.begin_date_b.getDate();
			var monthfd = that.begin_date_b.getMonth() + 1;
			var fd = that.begin_date_b.getFullYear() + '-' +
				(('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
				(('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
			var daytd = that.end_date_b.getDate();
			var monthtd = that.end_date_b.getMonth() + 1;
			var td = that.end_date_b.getFullYear() + '-' +
				(('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
				(('' + daytd).length < 2 ? '0' : '') + daytd;
				
			if(that.select_report == 'Unit Cost'){
				api.compareRestaurants_unitCost(
				{
					rest_list: that.selectedRestaurants_b.map(function(r) {return r.id}),
					type: that.inventory_category_b == 'Total Alcohol' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine'] : [that.inventory_category_b]
				}
				).then(function (res) {
					that.detailsloading = 1;
					that.columns = JSON.parse(JSON.stringify(that.selectedRestaurants_b));
					that.bottom_table_result = res.data.data.result;
				});
			}
			else if(that.select_report == 'Units Purchased'){
				api.compareRestaurants_unitPurchased(
				{
					rest_list: that.selectedRestaurants_b.map(function(r) {return r.id}),
					type: that.inventory_category_b == 'Total Alcohol' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine'] : [that.inventory_category_b],
					begin_date: fd,
					end_date: td
				}
				).then(function (res) {
					that.detailsloading = 1;
					that.columns = JSON.parse(JSON.stringify(that.selectedRestaurants_b));
					that.bottom_table_result = res.data.data.result;
				});
			}
			else if(that.select_report == 'Total Purchases'){
				api.compareRestaurants_totalPurchase(
				{
					rest_list: that.selectedRestaurants_b.map(function(r) {return r.id}),
					type: that.inventory_category_b == 'Total Alcohol' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine'] : [that.inventory_category_b],
					begin_date: fd,
					end_date: td
				}
				).then(function (res) {
					that.detailsloading = 1;
					that.columns = JSON.parse(JSON.stringify(that.selectedRestaurants_b));
					that.bottom_table_result = res.data.data.result;
				});
			}
			else if(that.select_report == 'Unit Sales'){
				api.compareRestaurants_unitSales(
				{
					rest_list: that.selectedRestaurants_b.map(function(r) {return r.id}),
					type: that.inventory_category_b == 'Total Alcohol' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine'] : [that.inventory_category_b],
					begin_date: fd,
					end_date: td
				}
				).then(function (res) {
					that.detailsloading = 1;
					that.columns = JSON.parse(JSON.stringify(that.selectedRestaurants_b));
					that.bottom_table_result = res.data.data.result;
				});
			}
        }
		
		/////////////////////////////////////////////////////////////////////////////////
		
		/* Table */
        that.loadTable = function () {
            if(that.inventory_category == 'Total Sales') {
                that.is_total_sales = 1;
            } else {
                that.is_total_sales = 0;
            }
			
			var dayfd = that.begin_date.getDate();
            var monthfd = that.begin_date.getMonth() + 1;
            var fd = that.begin_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
                
            var daytd = that.end_date.getDate();
            var monthtd = that.end_date.getMonth() + 1;
            var td = that.end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;
            that.api.compareRestaurants_tableSnS(
			{
				rest_list: that.selectedRestaurants.map(function(r) {return r.id}),
				type: that.inventory_category == 'Total Sales' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine', 'Food'] : that.inventory_category == 'Total Alcohol' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine'] : [that.inventory_category],
				begin_date: fd,
				end_date: td
			}
			).then(function (res) {
				that.loading++;
				that.sns_result_temp = res.data.data.result;
				that.sns_result = [];
				for(var i=0; i<that.selectedRestaurants.length; i++){
					var found = false;
					for(var j=0; j<that.sns_result_temp.length; j++){
						if(that.selectedRestaurants[i].label == that.sns_result_temp[j].restaurant_name){
							that.sns_result.push(that.sns_result_temp[j]);
							found = true;
							break;
						}
					}
					if(!found){
						that.sns_result.push({restaurant_name: that.selectedRestaurants[i].label});
					}
				}
				
				that.salesAndPurchasesDonut(that.sns_result);
				
				for(var i=0; i<7-that.selectedRestaurants.length; i++){
					that.sns_result.push({restaurant_name: 'N/A'});
				}
            });
        };
        /* ---Table--- */

		that.hideShowDonut = function () {
			that.food_exists = false;
			that.alcohol_exists = false;
			for(var i=0; i<that.r_list.length; i++){
				for(var j=0; j<that.selectedRestaurants.length; j++){
					if(that.selectedRestaurants[j].id == that.r_list[i].id){
						if(that.r_list[i].subscription_type_id == 5){
							that.alcohol_exists = true;
						}
						else if(that.r_list[i].subscription_type_id == 6){
							that.food_exists = true;
						}
						else if(that.r_list[i].subscription_type_id == 7){
							that.food_exists = true;
							that.alcohol_exists = true;
						}
						break;
					}
				}
			}
		}
		
		that.loadDonut = function (type, d_data) {
            //var chart_id = type == 1 ? 'food_donut' : 'alcohol_donut';
			var chart_id = type == 'sales' ? 'sales_donut' : type == 'purchases' ? 'purchases_donut' : '';
			
			var empty_data = true;
			
			for(var i=0; i<d_data.length; i++){
				if(!d_data[i].includes(0)){
					empty_data = false;
					break;
				}
			}
			
			if(empty_data){
				d_data = [];
			}
			
			var chart = c3.generate({
				bindto: '#'+chart_id,
				data: {
					columns: d_data,
					type : 'donut',
					empty: { label: { text: "No Data Available" }   }
				},
				donut: {
					label: {
						format: function (value) { return value; }
					}
				},
				tooltip: {      
					contents: function (data) {
						return "<p style='border:1px groove; background-color: white; color: black;'>"+data[0].id+": "+ data[0].value + "</p>";
					}
				}
			});
			
		}
		
        that.foodAndAlcoholDonut = function(type, f, a) {
            if(that.selectedRestaurants.length < 1){
				if(f && a){
					that.loading++;
				}
				else{
					that.loading = that.loading + 2;
				}
                return;
            }
			
            var dayfd = that.begin_date.getDate();
            var monthfd = that.begin_date.getMonth() + 1;
            var fd = that.begin_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
                
            var daytd = that.end_date.getDate();
            var monthtd = that.end_date.getMonth() + 1;
            var td = that.end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;

			function getMonday(d) {
			  d = new Date(d);
			  var day = d.getDay(),
				  diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
			  return new Date(d.setDate(diff));
			}

			var curr_monday = getMonday(new Date());
			curr_monday.setDate(curr_monday.getDate()-14);
			var daymd = curr_monday.getDate();
            var monthmd = curr_monday.getMonth() + 1;
            var md = curr_monday.getFullYear() + '-' +
                (('' + monthmd).length < 2 ? '0' : '') + monthmd + '-' +
                (('' + daymd).length < 2 ? '0' : '') + daymd;
			
			//var add_live_score = (fd <= td) && (md <= td);

            api.compareRestaurants_donutScores(
			{
				rest_list: that.selectedRestaurants.map(function(r) {return r.id}),
				type: type == 1 ? 'Food Cost' : 'Alcohol Cost',
				begin_date: fd,
				end_date: td
			}
			).then(function (res) {		
				
				var promises = [];
				function calc_total_score(r) {
					var a = [];
					a.push(r.label);
					
					var found = false;
					var f_indx = 0;
					for(var f = 0; f < res.data.data.result.length; f++) {
						if (res.data.data.result[f].restaurant_id == r.id) {
							f_indx = f;
							found = true;
							break;
						}
					}
					
					var s_tot = 0;
					var s_count = 1;

					if(found){		//only saved
						if(type == 1){
							s_tot = res.data.data.result[f_indx].score;
						}
						else{
							s_tot = res.data.data.result[f_indx].score;
						}
						s_count = 0;
						s_count += res.data.data.result[f_indx].s_count;
						a.push(Math.round(s_tot/s_count , 2));
					}
					else{		//nothing
						a.push(0);
					}
					
					/*if(found && typeof res1.data.data.scores.rest_id != 'undefined')	//both saved and live
					{
						if(type == 1){
							s_tot = res.data.data.result[f_indx].score + (add_live_score ? res1.data.data.scores.ffs : 0);
						}
						else{
							s_tot = res.data.data.result[f_indx].score + (add_live_score ? res1.data.data.scores.fs : 0);
						}
						s_count += res.data.data.result[f_indx].s_count;
						a.push(Math.round(s_tot/s_count , 2));
						
					}
					else if(!found && typeof res1.data.data.scores.rest_id != 'undefined'){	//only live
						if(type == 1){
							s_tot = add_live_score ? res1.data.data.scores.ffs : 0;
						}
						else{
							s_tot = add_live_score ? res1.data.data.scores.fs : 0;
						}
						a.push(Math.round(s_tot/s_count , 2));
					}
					else if(found && typeof !res1.data.data.scores.rest_id != 'undefined'){		//only saved
						if(type == 1){
							s_tot = res.data.data.result[f_indx].score;
						}
						else{
							s_tot = res.data.data.result[f_indx].score;
						}
						s_count = 0;
						s_count += res.data.data.result[f_indx].s_count;
						a.push(Math.round(s_tot/s_count , 2));
					}
					else if(!found && typeof !res1.data.data.scores.rest_id != 'undefined'){		//nothing
						a.push(0);
					}*/
					
					return a;
				}
					
				that.selectedRestaurants.forEach(function (r, index) {
					//var promise = that.api.calc_scores(r.id).then(function (res1) {
					var promise = calc_total_score(r);
					promises.push(promise);
				});
				
				$q.all(promises).then(function(result) {
					if(f && a){
						that.loading++;
					}
					else{
						that.loading = that.loading + 2;
					}	
					that.loadDonut(type, result);
				}, function(err) {
					  console.log('Failed: ' + err);
				});
			});
        }
		
		that.salesAndPurchasesDonut = function(sp_data) {
			if(that.selectedRestaurants.length < 1){
				that.loading = that.loading + 2;
                return;
            }
			var d_sales_data = [];
			var d_purchases_data = [];
			for(var si in sp_data){
				var st = sp_data[si];
				d_sales_data.push([st.restaurant_name, typeof st.total_sales == 'undefined' ? 0 : st.total_sales]);
				d_purchases_data.push([st.restaurant_name, typeof st.total_purchase == 'undefined' ? 0 : st.total_purchase]);
			}
			that.loadDonut('sales', d_sales_data);
			that.loadDonut('purchases', d_purchases_data);
			that.loading = that.loading + 2;
		}
		
		/* Line Chart */
        that.loadLineGraph = function () {
			var dayfd = that.begin_date.getDate();
			var monthfd = that.begin_date.getMonth() + 1;
            var fd = that.begin_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
			var daytd = that.end_date.getDate();
			var monthtd = that.end_date.getMonth() + 1;
            var td = that.end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;
			
            that.api.compareRestaurants_lineSales(
				{	type: that.inventory_category == 'Total Sales' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine', 'Food'] : that.inventory_category == 'Total Alcohol' ? ['Liquor', 'Bottle Beer', 'Draft Beer', 'Draft Wine', 'Wine'] : [that.inventory_category], 
					rest_list: that.selectedRestaurants.map(function(r) {return r.id}), 
					period: that.period,
					begin_date: fd,
					end_date: td
				}
				).then(function (res) {
                that.loading++;
                var chartData = [];
                if (typeof res.data.data.result != 'undefined' && res.data.data.result.length != 0) {
					var total_sales = res.data.data.result;
					var d = new Set();
					for (var i in total_sales) {
						if(that.period == 'Daily'){
							d.add(total_sales[i].act_date_l.substring(0, 10));
						}
						else if(that.period == 'Monthly'){
							d.add(total_sales[i].act_date_l.substring(5, 7));
						}
						else if(that.period == 'Yearly'){
							d.add(total_sales[i].act_date_l.substring(0, 4));
						}
					}
					
					if(that.period != 'Monthly'){		//adjust sort order
						d = Array.from(d);
						d.sort();
					}
					
					var month_dict = {'01':'January', '02':'February', '03':'March', '04':'April', '05':'May', '06':'June', '07':'July', '08':'August', '09':'September', '10':'October', '11':'November', '12':'December'};
					if(that.period == 'Monthly'){
						d.clear();
						d.add('January').add('February').add('March').add('April').add('May').add('June').add('July').add('August').add('September').add('October').add('November').add('December');
					}
					d.forEach(function(value) {
						var r = {};
						for(var i = 0; i < that.selectedRestaurants.length; i++) {
							r[that.selectedRestaurants[i].id] = 0;
						}
						for (var i in total_sales) {
							if(that.period == 'Daily'){
								if(total_sales[i].act_date_l.substring(0, 10) == value){
									r[total_sales[i].restaurant_id] = total_sales[i].Actual_Total_Sales;
								}
							}
							else if(that.period == 'Monthly'){
								if(month_dict[total_sales[i].act_date_l.substring(5, 7)] == value){
									r[total_sales[i].restaurant_id] = total_sales[i].Actual_Total_Sales;
								}
							}
							else if(that.period == 'Yearly'){
								if(total_sales[i].act_date_l.substring(0, 4) == value){
									r[total_sales[i].restaurant_id] = total_sales[i].Actual_Total_Sales;
								}
							}
						}
						var c_obj = {"_id": value};
						for(var i = 0; i < that.selectedRestaurants.length; i++) {
							c_obj[that.selectedRestaurants[i].label] = r[that.selectedRestaurants[i].id];
						}
						chartData.push(c_obj);
					});
                }
                var chart = c3.generate({
                    bindto: '#compare_chart',
                    data: {
                        json: chartData,
                        keys: {
                            x: '_id',
                            value: that.selectedRestaurants.map(function(r) {return r.label})
                        },
                        empty: {label: {text: 'No data found'}},
						type: 'spline'
                    },
                    axis: {
                        x: {
                            type: 'category',
                            tick: {
                                rotate: 75,
                                multiline: false
                            },
                            height: 60
                        },
                        y: {
                            tick: {
                                format: d3.format("$,")
                            }
                        }
                    },
					legend: {
						position: 'inset'
					}
                });

            });
        };
        /* ---Line Chart--- */
		
        that.loadGraphAndTable = function () {
			that.loading = 0;
            that.loadLineGraph();
			/*that.hideShowDonut();
			if(that.food_exists){
				that.foodAndAlcoholDonut(1, that.food_exists, that.alcohol_exists);
			}
			if(that.alcohol_exists){
				that.foodAndAlcoholDonut(2, that.food_exists, that.alcohol_exists);
			}*/
			
			that.loadTable();
        }
		
		that.getRestuarants = function (mode) {
			if(mode == -1 || mode == 0){
				var ok_to_change = false;
				if(that.prev_cat == null){
					ok_to_change = true;
				}
				else{
					if(that.prev_cat == 'Total Sales'){
						ok_to_change = true;
					}
					else if(that.prev_cat == 'Food'){
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
					that.restaurantsList = [];
					for(var i=0; i<that.r_list.length; i++){
						if(that.inventory_category == 'Total Sales'){	//All
							that.restaurantsList.push({id: that.r_list[i].id, label: that.r_list[i].restaurant_name});
						}
						else if(that.inventory_category == 'Food'){		//Only food and full service
							if(that.r_list[i].subscription_type_id == 6 || that.r_list[i].subscription_type_id == 7){
								that.restaurantsList.push({id: that.r_list[i].id, label: that.r_list[i].restaurant_name});
							}
						}
						else if(that.inventory_category != 'Total Sales' && that.inventory_category != 'Food'){	//Only alcohol and full service
							if(that.r_list[i].subscription_type_id == 5 || that.r_list[i].subscription_type_id == 7){
								that.restaurantsList.push({id: that.r_list[i].id, label: that.r_list[i].restaurant_name});
							}
						}
					}
					
					that.selectedRestaurants = that.restaurantsList.length <= 7 ? that.restaurantsList.length ? that.restaurantsList.map(function(r){return r}) : [] : [that.restaurantsList[0], that.restaurantsList[1], that.restaurantsList[2], that.restaurantsList[3], that.restaurantsList[4], that.restaurantsList[5], that.restaurantsList[6]];
					that.hideShowDonut();
				}
			}
			if(mode == 1 || mode == 0){
				var ok_to_change = false;
				if(that.prev_cat_b == null){
					ok_to_change = true;
				}
				else{
					if(that.prev_cat_b == 'Food'){
						if(that.inventory_category_b != 'Food'){
							ok_to_change = true;
						}
					}
					else{
						if(that.inventory_category_b == 'Food'){
							ok_to_change = true;
						}
					}
				}
				if(ok_to_change){
					that.prev_cat_b = that.inventory_category_b;
					that.restaurantsList_b = [];
					for(var i=0; i<that.r_list.length; i++){
						if(that.inventory_category_b == 'Food'){		//Only food and full service
							if(that.r_list[i].subscription_type_id == 6 || that.r_list[i].subscription_type_id == 7){
								that.restaurantsList_b.push({id: that.r_list[i].id, label: that.r_list[i].restaurant_name});
							}
						}
						else if(that.inventory_category_b != 'Food' && that.inventory_category_b != null){	//Only alcohol and full service
							if(that.r_list[i].subscription_type_id == 5 || that.r_list[i].subscription_type_id == 7){
								that.restaurantsList_b.push({id: that.r_list[i].id, label: that.r_list[i].restaurant_name});
							}
						}
					}
					
					that.selectedRestaurants_b = that.restaurantsList_b.length <= 7 ? that.restaurantsList_b.length ? that.restaurantsList_b.map(function(r){return r}) : [] : [that.restaurantsList_b[0], that.restaurantsList_b[1], that.restaurantsList_b[2], that.restaurantsList_b[3], that.restaurantsList_b[4], that.restaurantsList_b[5], that.restaurantsList_b[6]];
				}
			}
        }
		
		that.updateMapping = function () {
			that.updmaploading = 1;
			
        	that.api.compareRestaurants_getMapping(
			{
				rest_list: that.r_list.map(function(r) {return r.id}),
				type: that.inventory_category_b,
				search: false
			}
			).then(function (res) {
				that.updmaploading = 0;
            });
        }
		
		that.$onInit = function () {
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
						if((that.r_list[i].subscription_type_id == 5 || that.r_list[i].subscription_type_id == 6 || that.r_list[i].subscription_type_id == 7) && that.r_list[i].is_setup_completed == 1 && that.r_list[i].grant_level <= 3){
							paid_rest.push(that.r_list[i]);
						}
					}

					that.r_list = [];
					that.r_list = paid_rest;
					if(that.r_list.length < 2){
						SweetAlert.swal({
							title: "Access Denied!",
							text: "You need to be an Owner/Admin/Manager of at least 2 restaurants with paid subscription.",
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
						
						that.getRestuarants(0);
						
						that.loadGraphAndTable();
						that.loadDetailsTable();
					}
                } catch (e) {
                    console.log(e);
                }
            })
        };

    }

    compareRestaurantsController.$inject = ['$state', 'auth', 'api', '$q', '$scope', '$filter', '$rootScope', 'alertService', 'SweetAlert'];

    angular.module('inspinia').component('comprest', {
        templateUrl: 'js/components/compareRestaurants/compareRestaurants.html',
        controller: compareRestaurantsController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();