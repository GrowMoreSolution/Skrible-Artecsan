(function () {
    'use strict';

    function costChangeReportsController(api, $state, auth, core, localStorageService, restaurant, $rootScope, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;

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

        that.start_date = new Date();
        that.start_date.setMonth(that.start_date.getMonth() - 1);
        that.end_date = new Date();
		that.details_start_date = new Date();
		that.multiSelectSettings = {selectionLimit: 3, scrollableHeight: '200px', scrollable: true};
		that.vendor_dict = {};
		that.vendorsList = [];
		that.selectedVendors = [];
		that.currentCategories = ['Select Vendor(s) First'];
		that.category = that.currentCategories[0];
		that.itemsList = [];
		that.currentItems = [];
		that.selectedItems = [];
		that.details_modes_list = [{type:'most_recent', name:'Show Most Recent'}, {type:'last_year', name:'Show Last Year'}];

        that.costChangeGraph = function () {
			var dayfd = that.start_date.getDate();
			var monthfd = that.start_date.getMonth() + 1;
            var fd = that.start_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
			var daytd = that.end_date.getDate();
			var monthtd = that.end_date.getMonth() + 1;
            var td = that.end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;
				
            that.api.costChangeCostCompare({'start_date': fd, 'end_date': td, 'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 2, 'items': that.selectedItems.map(function (x){return x.id})}).then(function (res) {
				var total_sales = res.data.data.costChangeCostCompare;
				var xs_obj = {};
				var cols_arr = [];
                var chartData = [];
				var d = new Set();
				d.add(fd);
				d.add(td);
				var cc_data_obj = {};
				for (var i in total_sales) {
					d.add(total_sales[i].delivery_date.substring(0, 10));
					if(!cc_data_obj.hasOwnProperty(total_sales[i].delivery_date.substring(0, 10))){
						cc_data_obj[total_sales[i].delivery_date.substring(0, 10)] = {};
						cc_data_obj[total_sales[i].delivery_date.substring(0, 10)][total_sales[i].vendor_sku_id] = total_sales[i].item_cost;
					}
					else{
						cc_data_obj[total_sales[i].delivery_date.substring(0, 10)][total_sales[i].vendor_sku_id] = total_sales[i].item_cost;
					}
				}
				
				d = Array.from(d);
				d.sort();
				var item_trans = {};
				//push the selected sku items below
				for(var si in that.selectedItems){
					item_trans[that.selectedItems[si].id] = {'dates': [that.selectedItems[si].id+''], 'costs': [that.selectedItems[si].label], 'dates_to_fix': []};
					xs_obj[that.selectedItems[si].label] = that.selectedItems[si].id+'';
					d.forEach(function(value) {
						item_trans[that.selectedItems[si].id]['dates'].push(value);
						if(typeof cc_data_obj[value] != 'undefined'){
							if(typeof cc_data_obj[value][that.selectedItems[si].id] != 'undefined'){
								item_trans[that.selectedItems[si].id]['costs'].push(cc_data_obj[value][that.selectedItems[si].id]);
							}
							else{
								if(value == fd){
									if(item_trans[that.selectedItems[si].id]['costs'].length < 2){
										for(var dxx in d){
											var value_d = d[dxx];
											if(value_d != value){
												if(typeof cc_data_obj[value_d] != 'undefined'){
													if(typeof cc_data_obj[value_d][that.selectedItems[si].id] != 'undefined'){
														item_trans[that.selectedItems[si].id]['costs'].push(cc_data_obj[value_d][that.selectedItems[si].id]);
														break;
													}
												}
											}
										}
									}
									else{
										item_trans[that.selectedItems[si].id]['costs'].push(item_trans[that.selectedItems[si].id]['costs'][item_trans[that.selectedItems[si].id]['costs'].length-1]);
									}
								}
								else{
									item_trans[that.selectedItems[si].id]['costs'].push(item_trans[that.selectedItems[si].id]['costs'][item_trans[that.selectedItems[si].id]['costs'].length-1]);
								}
							}
						}
						else{
							if(!item_trans[that.selectedItems[si].id]['costs'].length){
								for(var dxx in d){
									var value_d = d[dxx];
									if(value_d != value){
										if(typeof cc_data_obj[value_d][that.selectedItems[si].id] != 'undefined'){
											item_trans[that.selectedItems[si].id]['costs'].push(cc_data_obj[value_d][that.selectedItems[si].id]);
											break;
										}
									}
								}
							}
							else{
								item_trans[that.selectedItems[si].id]['costs'].push(item_trans[that.selectedItems[si].id]['costs'][item_trans[that.selectedItems[si].id]['costs'].length-1]);
							}
						}
					});
					cols_arr.push(item_trans[that.selectedItems[si].id]['dates']);
					cols_arr.push(item_trans[that.selectedItems[si].id]['costs']);
				}
				
				that.loading = false;
				swal.close();
				
                var chart = c3.generate({
                    bindto: '#cc_graph',
					data: {
						xs: xs_obj,
						columns: cols_arr,
						empty: {label: {text: 'No data found'}}
						//type: 'spline'
					},
                    axis: {
                        x: {
                            type: 'category',
                            tick: {
                                rotate: 75,
                                multiline: false
                            },
                            height: 100	//130
                        },
                        y: {
                            tick: {
                                format: d3.format("$,")
                            }
                        }
                    },
					legend: {
						position: 'bottom'
					},
					tooltip: {
						show: true
					}
                });
            });
        };
		
        that.loadCostChangeData = function () {
			that.loading = true;
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			if(that.mode == 'summary'){
				that.costChangeGraph();
			}
			else if(that.mode == 'details'){
				that.costChangeDetails();
			}
        }

		that.costChangeDetails = function () {
			var params = {'inventory_type_id': 2, 'category': that.details_category.id == -1 ? '%' : that.details_category.category, 'sub_category': that.subcategory.id == -1 ? '%' : that.subcategory.sub_category, 'item': that.item.id == -1 ? '%' : that.item.id, 'mode': that.details_mode.type};
			if(that.details_mode.type == 'most_recent'){
				var daytd = that.details_start_date.getDate();
				var monthtd = that.details_start_date.getMonth() + 1;
				var td = that.details_start_date.getFullYear() + '-' +
					(('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
					(('' + daytd).length < 2 ? '0' : '') + daytd;
				params['start_date'] = td;
			}
			that.api.costChangeDetails(params).then(function (res) {
				that.cc_details_items = [];
				that.cc_details_menus = [];
				if(res.data.data.costChangeDetails.sku_items.length){
					that.cc_details_items = res.data.data.costChangeDetails.sku_items;
					for(var ci in that.cc_details_items){
						var ct = that.cc_details_items[ci];
						if(ct.prior_purchase_date != null){
							ct.prior_purchase_date = ct.prior_purchase_date.substring(0, 10);
						}
						ct.current_purchase_date = ct.current_purchase_date.substring(0, 10);
						
						if(ct.prior_purchase_cost != null){
							ct.cost_change = ct.current_purchase_cost - ct.prior_purchase_cost;
							ct.cost_change_percent = ct.cost_change == 0 ? 0 : ct.prior_purchase_cost == 0 ? '-' : ((ct.cost_change / ct.prior_purchase_cost)*100);
						}
						else{
							ct.cost_change = '-';
							ct.cost_change_percent = '-';
						}
					}
				}
				if(res.data.data.costChangeDetails.menus.length){
					that.cc_details_menus = res.data.data.costChangeDetails.menus;
				}
				that.loading = false;
				swal.close()
            });
		}
		
		that.changeMode = function (mode) {
			if(that.mode != mode){	//avoid unnecessary calls
				that.mode = mode;
				if(that.mode == 'summary'){
					that.costChangeGraph();
				}
				else{
					that.costChangeDetails();
				}
			}
		}
		
		that.selectCategory = function (is_init) {
			that.currentItems = that.itemsList.filter(function(x){return x.category == that.category});
			that.selectedItems = [];
			if(is_init){
				if(that.currentItems.length){
					if(that.currentItems.length <= 3){
						for(var ci in that.currentItems){
							that.selectedItems.push(that.currentItems[ci]);
						}
					}
					else{
						for(var ci =0; ci<3; ci++){
							that.selectedItems.push(that.currentItems[ci]);
						}
					}
					//that.loadCostChangeData();	//og init call
				}
			}
		}
		
		that.addVendor = function (v, is_init){
			if(!that.vendor_dict.hasOwnProperty(v.id)){
				that.api.get_active_inventory_by_vendor({
					vendor_id: v.id,
					inventory_type_id: 2
				}, that.restaurant_id.restaurant_id).then(function (res) {
					that.vendor_dict[v.id] = [];
					for(var vx in res.data.data.sku){
						that.itemsList.push({
							'id': res.data.data.sku[vx].id,
							'label': res.data.data.sku[vx].item_name+' ('+v.label+')',
							'category': res.data.data.sku[vx].category,
							'vendor_id': v.id
						});
						that.vendor_dict[v.id].push(that.itemsList[that.itemsList.length-1]);
					}
					that.currentCategories = Array.from(new Set(that.itemsList.map(function(x){return x.category;})));
					that.category = that.currentCategories[0];
					that.selectCategory(is_init);
					that.itemsList.sort(function(a,b) {return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);} );
				});
			}
			else{	//save the API call by using the cached items
				for(var vx in that.vendor_dict[v.id]){
					that.itemsList.push({
						'id': that.vendor_dict[v.id][vx].id,
						'label': that.vendor_dict[v.id][vx].label+' ('+v.label+')',
						'category': that.vendor_dict[v.id][vx].category,
						'vendor_id': v.id
					});
				}
				that.currentCategories = Array.from(new Set(that.itemsList.map(function(x){return x.category;})));
				that.category = that.currentCategories[0];
				that.selectCategory();
				that.itemsList.sort(function(a,b) {return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);} );
			}
		}
		
		that.removeVendor = function (v){
			if(!v){
				that.currentCategories = ['Select Vendor(s) First'];
				that.category = that.currentCategories[0];
				that.itemsList = [];
				that.currentItems = [];
				that.selectedItems = [];
			}
			else{
				var temp_il = that.itemsList.filter(function(x){return x.vendor_id != v.id});
				that.itemsList = [];
				that.itemsList = temp_il;
				that.currentCategories = Array.from(new Set(that.itemsList.map(function(x){return x.category;})));
				that.itemsList.sort(function(a,b) {return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);} );
				if(!that.selectedVendors.length){
					that.currentCategories = ['Select Vendor(s) First'];
					that.category = that.currentCategories[0];
					that.itemsList = [];
					that.currentItems = [];
					that.selectedItems = [];
				}
			}
		}
		
		that.vmsEvents = {
			onDeselectAll: function() {
			  that.removeVendor();
			},
			onItemSelect: function(item) 
			{
				that.addVendor(item);
			},
			
			onItemDeselect: function(item) 
			{
				that.removeVendor(item);
			}
		};
		
		that.changeCat = function () {
			if(that.details_category.id != -1){
				that.subcategories = that.all_subcategories.filter(function(x){return that.details_category.id == x.vendor_cat_id});
				that.subcategories.unshift({id: -1, sub_category: '--All Subcategories--'});
				that.subcategory = that.subcategories[0];
				that.temp_items = that.inventoryListSelected.filter(function(x){return x.vendor_cat_id == that.details_category.id});
				that.temp_items.unshift({id: -1, item_name: '--All Items--'});
				that.item = that.temp_items[0];
			}
			else{
				that.subcategories = JSON.parse(JSON.stringify(that.all_subcategories));
				that.subcategory = {id: -1, sub_category: '--All Subcategories--'};
				that.temp_items = JSON.parse(JSON.stringify(that.inventoryListSelected));
				that.item = {id: -1, item_name: '--All Items--'};
			}
		}
		
		that.changeSubCat = function () {
			if(that.subcategory.id != -1){
				that.temp_items = that.inventoryListSelected.filter(function(x){return x.vendor_cat_id == that.details_category.id && x.vendor_sub_cat_id == that.subcategory.id});
				that.temp_items.unshift({id: -1, item_name: '--All Items--'});
				that.item = that.temp_items[0];
			}
			else{
				that.temp_items = JSON.parse(JSON.stringify(that.inventoryListSelected));
				that.item = {id: -1, item_name: '--All Items--'};
			}
		}
		
		that.getInventoriesByVendor = function () {
            that.api.get_active_inventory_by_vendor({
                inventory_type_id: 2
            }, that.restaurant_id.restaurant_id).then(function (res) {
                that.inventoryListSelected = res.data.data.sku;
				that.temp_items = JSON.parse(JSON.stringify(that.inventoryListSelected));
            });
        };
		
		that.getChosenVendors = function () {
			api.get_chosen_vendors(that.restaurant_id.restaurant_id, {vendor_type_id: 2}).then(function (res) {
                that.vendors = res.data.data.vendors;
				
				for(var vx in res.data.data.vendors){
					that.vendorsList.push({
						'id': res.data.data.vendors[vx].id,
						'label': res.data.data.vendors[vx].vendor_name
					});
				}
				if(that.vendorsList.length){
					that.selectedVendors.push(that.vendorsList[0]);
					that.addVendor(that.vendorsList[0], true);
				}
            });
        };
		
		this.downloadCSV = function() {
			that.export_loading = true;
			const getData = that.cc_details_items;

			var headers = [];
			if(that.mode == 'details'){
				headers = ['Vendor', 'ItemName', 'DeliveryUnit', 'LastPurchaseDate', 'LastPurchaseCost', 'CurrentPurchaseDate', 'CurrentPurchaseCost', 'CostChange', 'PercentChange'];
			}
            var csv = (headers.join(',') + '\r\n');
			
            getData.forEach(function(row) {
				var cc_obj = {};
				if(that.mode == 'details'){
					cc_obj['Vendor'] = row['vendor_name'].replace(/[,'#]/g, ' ');
					cc_obj['ItemName'] = row['item_name'].replace(/[,'#]/g, ' ');
					cc_obj['DeliveryUnit'] = row['uod'];
					cc_obj['LastPurchaseDate'] = row['prior_purchase_date'] == null ? '-' : row['prior_purchase_date'];
					cc_obj['LastPurchaseCost'] = row['prior_purchase_cost'] == null ? '-' : Math.round(row['prior_purchase_cost'] * 100) / 100;
					cc_obj['CurrentPurchaseDate'] = row['current_purchase_date'] == null ? '-' : row['current_purchase_date'];
					cc_obj['CurrentPurchaseCost'] = row['current_purchase_cost'] == null ? '-' : Math.round(row['current_purchase_cost'] * 100) / 100;
					cc_obj['CostChange'] = row['cost_change'] == '-' ? '-' : Math.round(row['cost_change'] * 100) / 100;
					cc_obj['PercentChange'] = row['cost_change_percent'] == '-' ? '-' : Math.round(row['cost_change_percent'] * 100) / 100;
				}
				
                const values = headers.map(function(header) {
                    return cc_obj[header];
                })
                csv += (values.join(',') + '\r\n');
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'CostChange '+(that.mode == 'details' ? 'details' : '')+' Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
        that.$onInit = function () {
			that.mode = 'details';
			that.export_loading = false;
			Promise.all([api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 2}), core.getRefbooks(), that.getChosenVendors(), that.getInventoriesByVendor()]).then(function(response) {
				that.categories = response[0].data.data.categories.filter(function(x) {return x.category != 'Non Alcoholic'});
				that.categories.unshift({id: -1, category: '--All Categories--', inventory_type_id: 2});
				that.details_category = that.categories[0];
				var cat_ids = that.categories.map(function(x){return x.id});
				that.all_subcategories = response[1].vendor_sub_cat.filter(function(x){return cat_ids.includes(x.vendor_cat_id)});
				that.subcategories = JSON.parse(JSON.stringify(that.all_subcategories));
				that.subcategory = {id: -1, sub_category: '--All Subcategories--'};
				that.item = {id: -1, item_name: '--All Items--'};
				that.details_mode = that.details_modes_list[0];
				that.loadCostChangeData();
			});
        };
    }

    costChangeReportsController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService', 'restaurant', '$rootScope', '$scope'];

    angular.module('inspinia').component('costChangeReportComponent', {
        templateUrl: 'js/components/reports/costChangeReport/costChangeReport.html',
        controller: costChangeReportsController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
