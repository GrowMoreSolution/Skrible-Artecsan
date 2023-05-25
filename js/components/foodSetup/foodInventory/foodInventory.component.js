(function () {
    'use strict';

	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Food Inventory Audit Pad Instructions';
						
		that.q_texts = '<article style="display: block;"><p><b>Audit</b> - This is the final step in your setup process. In order to start your reporting we must first know exactly how much inventory you have on-hand. For food inventory counts all items are weighed or counted based on unit of delivery which is noted next to each item. For example – steaks are typically delivered in lbs therefore you weigh any unpackaged steaks in lbs. Vegetables might be delivered in ounces therefore you would weigh any unpackaged vegetables in ounces. Watermelons might be delivered in units therefore you would count the units.<br/><br/>The save button on Full Audit pad allows you to save your work and complete it later.<br/><br/>Final Save is final and cannot be changed<br/><br/>Note: BE SURE THAT THE BEGINNING DATE IS THE ACTUAL DATE YOU COUNTED. IF THE BEGINNING DATE IS ENTERED INCORRECTLY THEN ALL OF YOUR RESULTS WILL BE INCORRECT.</p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
    function foodInventoryController(api, $state, auth, localStorageService, $uibModal, alertService, $rootScope, restaurant, core, $scope, SweetAlert, $q, $timeout) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.get_vendors_categories = [];
        that.inventories = [];
        //that.typeInventory = $state.params.typeInventory ? $state.params.typeInventory : 'full';  // full, adjustment
		that.is_sug_aud = typeof $state.params.is_sug_aud != 'undefined' && $state.params.is_sug_aud != '' ? $state.params.is_sug_aud : 'false'; // true/false to call suggested or regular

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

        var INVENTORIES = []; // const for compare, to change model

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        that.model = {
            vendor_category_id: null,
            measurement_units_of_delivery: function (id) {
                for (var i = 0; that.refbooks.measurement_units_of_delivery.length > i; i++) {
                    if (that.refbooks.measurement_units_of_delivery[i].id === id) {
                        return that.refbooks.measurement_units_of_delivery[i].name;
                    }
                }
            },
            inventory_item: null
        };

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
		
		$scope.$on('$stateChangeStart',
		function (event, toState, toParams, fromState, fromParams, options) {
			var toState = toState.name;
			if (!_.isEqual(INVENTORIES, that.inventories)) {
				event.preventDefault();
				SweetAlert.swal({
					title: "Save changes?",
					text: "Changes not been saved yet!",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#337ab7",
					confirmButtonText: "Save"
				},
				function (res) {
					if (res) {
						that.saveAll(that.form, true).then(function () {
							INVENTORIES = angular.copy(that.inventories);
							window.onbeforeunload = null;
							$state.go(toState);
						});
					} else {
						INVENTORIES = angular.copy(that.inventories);
						window.onbeforeunload = null;
						$state.go(toState)
					}
				});
			}
		});

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
		
        that.calculateTotalUOD = function (item) {
            var totalUnits = item.total_unit_size || 0;

            return (item.cases_qty * totalUnits) + (item.item_qty);
        };
		
		//////////////////////////////
		that.calculatePartialOnChange = function (item, $index, form) {
            $timeout(function () {
                return item.item_qty_ph = item.item_qty_ph ? item.item_qty_ph.replace(/[^\+^\d((,|\.)\d)?]+/g, "") : null;
            }, 500);

            var item_qty = item.item_qty_ph ? item.item_qty_ph : 0;

            if (item_qty) {
                that.inventories[$index].item_qty_formula = item.item_qty_ph.replace(/[^\d((,|\.)\d)?]+/g, "+").replace(/^\D*|\D*$/g, "");
                that.itemQtyStr = item_qty.match(/\d+((,|\.)\d+)?/g).reduce(function (previousValue, currentValue, index, array) {
                    return (previousValue * 1) + (currentValue * 1);
                });
            }
            item.itemQtyStrlabel = that.itemQtyStr ? that.itemQtyStr : item.item_qty_ph;
        };

        that.calculatePartialTotal = function (item, $index) {
            var item_qty = item.item_qty_ph ? item.item_qty_ph : null;

            if (item_qty) {
                that.itemQtyStr = item_qty.match(/\d+((,|\.)\d+)?/g).reduce(function (previousValue, currentValue, index, array) {
                    return (previousValue * 1) + (currentValue * 1);
                });
            } else {
                that.itemQtyStr = null;
                return
            }

            that.inventories[$index].item_qty_ph = that.itemQtyStr;
        };

        that.calculatePartialOnFocus = function (item, $index) {
            that.inventories[$index].item_qty_ph = that.inventories[$index].item_qty_formula ? that.inventories[$index].item_qty_formula : that.inventories[$index].item_qty_ph;
        };
		/////////////////////////////////
		
		that.mergeItems = function () {				
			for(var i = 0; i < that.inventories.length; i++){
				if(that.inventories[i].substitute_for == null){
					that.inventories[i].show = 1;
				}
			}
		}
		
		that.getCombinedStringForLocation = function(item, key) {
			var ph_key = key == 'full_values' ? 'cases_qty_ph' : 'item_qty_ph';
			if(item[ph_key] == null || item[key] == ''){
				return '';
			}
			else{
				var x = item[key] == null ? "" : item[key].split("+")
						.filter(function(xi) {
							return xi.split("_")[1] != that.selected_location_bu;
						})
						.join("+");
				if(item[ph_key]!= null && item[ph_key] != ''){
					x += (x == "" ? "" : "+")+item[ph_key]+"_"+that.selected_location_bu;
				}
				return x;
			}
		}
		
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
				}, 0);
			}
			return 0;
		};
		
		that.filterLocationData = function () {
			var deferred = $q.defer();
			for(var i = 0; i < that.inventories.length; i++){
				if (that.inventories[i].full_values != null) {
					var st = that.inventories[i].full_values;
					var nums = st
						.split("+")
						.filter(function(item) {
							if(item.split("_")[1] == that.selected_location){
								item = item.split("_")[0];
								return item !== "";
							}
							else{
								return false;
							}
						})
						.map(function(entry) {
							return parseFloat(entry);
						});
					nums = nums.reduce(function(pV, cV) {
								return pV + cV;
							}, 0);
					
					that.inventories[i].full_values = that.inventories[i].full_values.split("+")
						.filter(function(item) {
							return item.split("_")[1] != that.selected_location;
						})
						.join("+");
					that.inventories[i].full_values += "+"+nums+"_"+that.selected_location;
					that.inventories[i].cases_qty_ph = nums;
				}
				else{
					that.inventories[i].cases_qty_ph = 0;
				}
				
				if (that.inventories[i].partial_values != null) {
					var st = that.inventories[i].partial_values;
					var nums = st
						.split("+")
						.filter(function(item) {
							if(item.split("_")[1] == that.selected_location){
								item = item.split("_")[0];
								return item !== "";
							}
							else{
								return false;
							}
						})
						.map(function(entry) {
							return parseFloat(entry);
						});
					nums = nums.reduce(function(pV, cV) {
								return pV + cV;
							}, 0);
					
					that.inventories[i].partial_values = that.inventories[i].partial_values.split("+")
						.filter(function(item) {
							return item.split("_")[1] != that.selected_location;
						})
						.join("+");
					that.inventories[i].partial_values += "+"+nums+"_"+that.selected_location;
					that.inventories[i].item_qty_ph = nums;
				}
				else{
					that.inventories[i].item_qty_ph = 0;
				}
			}
			deferred.resolve();
			return deferred.promise;
		}

		that.changeMode = function() {
			$state.go('recipeAudit');
		};
		
		that.getInventoriesCaller = function (categoryId, categoryOldId) {
			if (!_.isEqual(INVENTORIES, that.inventories)) {
				SweetAlert.swal({
					title: "Save progress?",
					text: "You may lose any unsaved changes!",
					type: "warning",
					showCancelButton: true,
					cancelButtonText: "Disard and Continue",
					confirmButtonColor: "#337ab7",
					confirmButtonText: "Save"
				},
				function (res) {
					if (res) {
						that.saveAll(that.form, true).then(function () {
							that.getInventories(that.model.vendor_category_id);
						});
					} else {
						that.getInventories(that.model.vendor_category_id);
					}
				});
			}
			else{
				that.getInventories(that.model.vendor_category_id);
			}
		}
		
        that.getInventories = function (categoryId, categoryOldId) {
			that.loading = true;
            var m = {
				is_adjustment: 0,
                inventory_type_id: 1,
                vendor_cat_id: categoryId.id == 'all' ? null : categoryId.id,
                inventory_item: that.model.inventory_item,
				audit_start_TS: true,
				suggested: that.is_sug_aud
            };
			
			that.api.get_inventory_audit(m).then(function (res) {
				that.inventories = JSON.parse(JSON.stringify(res.data.data.inventory));
				that.pickers.beginDate.date = typeof res.data.data.audit_start != 'undefined' && res.data.data.audit_start[0].audit_start != null ? new Date(res.data.data.audit_start[0].audit_start) : new Date();
				that.pickers.beginDateBackup.date = JSON.parse(JSON.stringify(that.pickers.beginDate.date));
				that.mergeItems();
				that.selected_location_bu = JSON.parse(JSON.stringify(that.selected_location));
				that.filterLocationData().then(function(res){
					INVENTORIES = JSON.parse(JSON.stringify(that.inventories));
					that.loading = false;
				});
				
			});
        };

		that.saveCount = function (form, is_search) {
			var deferred = $q.defer();
			
			if (!form.inventory.$valid) return;
			
			if (!that.pickers.beginDate.date || !that.pickers.endDate.date) {
				return
			}
			
			var m = {
				inventory_type_id: 1,
				counting_started_at: new Date(that.pickers.beginDate.date).getTime(),
				counting_ended_at: new Date().getTime(),
				is_final_save: 0,
				is_adjustment: 0,
				inventory_items: [],
				is_suggested: that.is_sug_aud == 'true' ? 1 : 0
			};

			for (var i = 0; that.inventories.length > i; i++) {
				if (that.inventories[i].item_qty_ph !== null || that.inventories[i].cases_qty_ph !== null) {
					that.inventories[i].full_values = that.getCombinedStringForLocation(that.inventories[i], 'full_values');
					that.inventories[i].partial_values = that.getCombinedStringForLocation(that.inventories[i], 'partial_values');
					that.inventories[i].cases_qty = that._computeTotalByString(that.inventories[i].full_values) || 0;
					that.inventories[i].item_qty = that._computeTotalByString(that.inventories[i].partial_values) || 0;
					m.inventory_items.push({
						id: that.inventories[i].id,
						vendor_sku_id: that.inventories[i].vendor_sku_id,
						item_qty: that.inventories[i].item_qty,
						cases_qty: that.inventories[i].cases_qty,
						nof_bottles: 0,
						packs_qty: 0,
						total_in_uom_of_delivery: that.calculateTotalUOD(that.inventories[i]),
						item_qty_formula: null,
						full_values: that.inventories[i].full_values,
						partial_values: that.inventories[i].partial_values
					})
				}
			}
			
			that.api.update_inventory_audit(m).then(function (res) {
				try {
					if (res.data.data.code === 1000) {
						if(!is_search){
							alertService.showAlertSave();
						}
						deferred.resolve()
					}
				} catch (e) {
					console.log(e);
					deferred.reject()
				}
			}, function () {
				deferred.reject()
			});

			return deferred.promise;
		}
		
        that.saveAll = function (form, is_search) {
			if(that.inventories.length < 1){
				return;
			}
			
			if(!is_search){
				var popup_text = "This will save this as a draft.";
				var title = "Save?";
				
				SweetAlert.swal({
						title: title,
						text: popup_text,
						type: "warning",
						showCancelButton: true,
						confirmButtonColor: "#337ab7",
						confirmButtonText: "OK"
					},
					function (res) {
						if (res) {
							return that.saveCount(form, is_search);
						}
					});
			}
			else{
				return that.saveCount(form, is_search);
			}
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
		
		that.changeAuditDate = function () {
			that.api.get_audit_dates({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 1}).then(function (res1) {
				that.audit_dates = res1.data.data.Report;
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
								});
							}
						}
					);
				}
			});
		}
		
        that.openCalendar = function (e, picker) {
            that.pickers[picker].open = true;
        };
		
		that.getBatches = function () {
			var deferred = $q.defer();
			
			if(that.model.vendor_category_id.id == 'all'){
				//get batches as well
				var m = {
					is_adjustment: 0,
					inventory_type_id: 1,
					recipe_type_id: null,
					inventory_item: null
				};
				that.api.get_recipe_audit(m).then(function (res) {
					if(res){
						that.batches = res.data.data.inventory;
					}
					deferred.resolve();
				});
			}
			else{
				deferred.resolve();
			}
			return deferred.promise;
		}
		
		that.generatePDFCall = function () {
			that.batches = [];
			that.getBatches().then(function (res) {that.generatePDF()});
		}
		
		that.generatePDF = function () {
			$scope.print_loading = true;
			
            swal({
                title: "",
                text: "Printing...",
                imageUrl: "https://www.boasnotas.com/img/loading2.gif",
                showConfirmButton: false,
            });
			
			//
			
			var r_type = 'Food';
			var content_data = [{text: restaurant.data.info.restaurant_name, style: 'title'},
								{text: r_type+' Audit Sheet', style: 'subheader'}];
			
			content_data.push({text: 'Audit Date: ____/____/____', style: 'audit_date'});
			content_data.push({text: ' ', style: 'audit_date'});
			content_data.push({text: 'Audited By: ______________', style: 'audit_date'});
			
			//horizontal line
			content_data.push({
				table: {
						widths: ['*'],
						body: [[" "], [" "]]
				},
				layout: {
					hLineWidth: function(i, node) {
						return (i === 0 || i === node.table.body.length) ? 0 : 2;
					},
					vLineWidth: function(i, node) {
						return 0;
					},
				}
			});
			content_data.push({text: 'Category: '+that.model.vendor_category_id.category+'', style: 'category'});
			
			//audit items
			var table_body_data = [];
			//for(var i=0; i< 100; i++){
			table_body_data.push([
						  {text: 'Vendor', style: 'tableHeader', fillColor: '#eeeeee'}
						, {text: 'Category', style: 'tableHeader', fillColor: '#eeeeee'}
						, {text: 'Inventory Item', style: 'tableHeader', fillColor: '#eeeeee'}
						, {text: 'Cases', style: 'tableHeader', fillColor: '#eeeeee'}
						, {text: 'Partial', style: 'tableHeader', fillColor: '#eeeeee'}
						, {text: 'Partial', style: 'tableHeader', fillColor: '#eeeeee'}
						, {text: 'Partial', style: 'tableHeader', fillColor: '#eeeeee'}
						, {text: 'Unit of Delivery', style: 'tableHeader', fillColor: '#eeeeee'}]);
			//}
			for(var i=0; i<that.inventories.length; i++){
				if(that.inventories[i].show == 1){
				table_body_data.push([
							{text: that.inventories[i].vendor_name, style: 'tableContentNoCenter'}
						  , {text: that.inventories[i].category, style: 'tableContent'}
						  , {text: that.inventories[i].inventory_item+' (Case size: '+that.inventories[i].total_unit_size+' '+that.model.measurement_units_of_delivery(that.inventories[i].uom_id_of_delivery_unit)+')', style: 'tableContent'}
						  , {text: ' ', style: 'tableContent'}
						  , {text: ' ', style: 'tableContent'}
						  , {text: ' ', style: 'tableContent'}
						  , {text: ' ', style: 'tableContent'}
						  , {text: that.model.measurement_units_of_delivery(that.inventories[i].uom_id_of_delivery_unit), style: 'tableContent'}]);
				}
			}

			
			content_data.push({
					style: 'tableExample',
					table: {
						heights: 25,
						widths: [95, 45, '*', 40, 40, 40, 40, 32],
						headerRows: 1,
						dontBreakRows: true,
						body: table_body_data
					},
					layout: {
						hLineWidth: function (i, node) {
							return 1;
						},
						vLineWidth: function (i, node) {
							return 1;
						},
						hLineColor: function (i, node) {
							return 'gray';
						},
						vLineColor: function (i, node) {
							return 'gray';
						}
					}
				}
			);
			//audit items
			
			if(that.batches.length){
				content_data.push({text: 'Category: Batches', style: 'category'});
				
				//audit items
				var b_table_body_data = [];
				//for(var i=0; i< 100; i++){
				b_table_body_data.push([
							  {text: 'Batch Description', style: 'tableHeader', fillColor: '#eeeeee'}
							, {text: 'Full', style: 'tableHeader', fillColor: '#eeeeee'}
							, {text: 'Partial', style: 'tableHeader', fillColor: '#eeeeee'}
							, {text: 'Partial', style: 'tableHeader', fillColor: '#eeeeee'}
							, {text: 'Partial', style: 'tableHeader', fillColor: '#eeeeee'}
							, {text: 'Total Servings (Oz)', style: 'tableHeader', fillColor: '#eeeeee'}]);
				//}
				for(var i=0; i<that.batches.length; i++){
					b_table_body_data.push([
								{text: that.batches[i].recipe_name, style: 'tableContent'}
							  , {text: ' ', style: 'tableContent'}
							  , {text: ' ', style: 'tableContent'}
							  , {text: ' ', style: 'tableContent'}
							  , {text: ' ', style: 'tableContent'}
							  , {text: that.batches[i].servings, style: 'tableContent'}]);
				}

				
				content_data.push({
						style: 'tableExample',
						table: {
							heights: 25,
							widths: ['*', 40, 40, 40, 40, 32],
							headerRows: 1,
							dontBreakRows: true,
							body: b_table_body_data
						},
						layout: {
							hLineWidth: function (i, node) {
								return 1;
							},
							vLineWidth: function (i, node) {
								return 1;
							},
							hLineColor: function (i, node) {
								return 'gray';
							},
							vLineColor: function (i, node) {
								return 'gray';
							}
						}
					}
				);
				//audit items
			}
		
			content_data.push({text: '----- End of '+r_type+' Audit Sheet -----', style: 'end_of_report'});
			
			var docDefinition = {
				pageSize: 'A4',
				//pageOrientation: 'landscape',
				header: 
					function(currentPage, pageCount) {
						return [
							{text: currentPage.toString() + ' of ' + pageCount, style: ['header', 'pg_no']}
						]
					},
				
				footer: {
					text: 'Powered by Skrible - www.getskrible.com', style: 'footer'
				},
				
				content: content_data,
				
				styles: {
					pg_no: {
						fontSize: 8,
					},
					header: {
						margin: [0, 10, 10, 0],
						alignment: 'right'
					},
					title: {
						fontSize: 14,
						bold: true,
						margin: [0, 0, 0, 0],
						alignment: 'center'
					},
					subheader: {
						fontSize: 12,
						bold: true,
						margin: [0, 0, 0, 0],
						alignment: 'center'
					},
					audit_date: {
						fontSize: 11,
						bold: true,
						margin: [0, 0, 0, 0],
						alignment: 'right'
					},
					summaryTableHeader: {
						bold: false,
						fontSize: 10,
						color: 'black',
						alignment: 'center'
					},
					summaryTableContentNoCenter: {
						bold: false,
						fontSize: 9,
						color: 'black'
					},
					summaryTableContent: {
						bold: false,
						fontSize: 9,
						color: 'black',
						alignment: 'center'
					},
					category: {
						fontSize: 11,
						bold: true,
						margin: [-10, 0, 0, 0]
					},
					tableExample: {
						margin: [-10, 5, -10, 15]
					},
					tableHeader: {
						bold: false,
						fontSize: 9,
						color: 'black',
						alignment: 'center'
					},
					tableContentNoCenter: {
						bold: false,
						fontSize: 9,
						color: 'black'
					},
					tableContent: {
						bold: false,
						fontSize: 9,
						color: 'black',
						alignment: 'center'
					},
					end_of_report: {
						fontSize: 12,
						bold: false,
						margin: [0, 30, 0, 0],
						alignment: 'center'
					},
					footer: {
						fontSize: 8,
						margin: [0, 5, 0, 0],
						alignment: 'center'
					}
				},
				
				defaultStyle: {
					font: 'Roboto',
					bold: 'Roboto-Bold'
				}		
			};
			//
			pdfMake.fonts = {
			   // download default Roboto font from cdnjs.com
			   Roboto: {
				 normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
				 bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
				 italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
				 bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
			   }
			}
			
			
			pdfMake.createPdf(docDefinition).download('Audit_Sheet.pdf');
			$scope.print_loading = false;
			swal.close();
        }
		
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
					that.getInventories(that.model.vendor_category_id);
				});
			}
			else{
				that.getInventoriesCaller(that.model.vendor_category_id);
			}
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
		
		that.init = function() {
			Promise.all([core.getRefbooks(), api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 1}), that.getLocations()]).then(function(response) {
				that.SetUpStatus = restaurant.data.info.is_setup_completed;
				that.refbooks = response[0];
				that.get_vendors_categories = response[1].data.data.categories;
				that.get_vendors_categories.unshift({id: 'all', category: 'All Items'});
				that.model.vendor_category_id = that.get_vendors_categories[0];
				that.getInventories(that.model.vendor_category_id);
			});
		}
		that.init();
    }

    foodInventoryController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'alertService', '$rootScope', 'restaurant', 'core', '$scope', 'SweetAlert', '$q', '$timeout'];

    angular.module('inspinia').component('foodInventoryComponent', {
        templateUrl: 'js/components/foodSetup/foodInventory/foodInventory.html',
        controller: foodInventoryController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();