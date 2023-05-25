(function () {
    'use strict';

    function recipeAuditController(api, $state, auth, $filter, localStorageService, alertService, $rootScope, restaurant, core, $scope, SweetAlert, $q) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.recipes = [];

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
            recipe_category_id: 'all',
            inventory_item: null
        };
		
		that.partial_qty_modes = ['Lbs', 'Oz'];
		that.current_partial_qty_mode = that.partial_qty_modes[0];
		that.current_partial_qty_mode_bu = JSON.parse(JSON.stringify(that.partial_qty_modes[0]));
		
		$scope.$on('$stateChangeStart',
		function (event, toState, toParams, fromState, fromParams, options) {
			var toState = toState.name;
			//if (!_.isEqual(INVENTORIES, that.recipes)) {
			if(JSON.stringify(INVENTORIES) !== JSON.stringify(that.recipes)){
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
						that.saveCount(that.form, true).then(function () {
							INVENTORIES = angular.copy(that.recipes);
							window.onbeforeunload = null;
							$state.go(toState);
						});
					} else {
						INVENTORIES = angular.copy(that.recipes);
						window.onbeforeunload = null;
						$state.go(toState)
					}
				});
			}
		});
		
		that.pushNewInstance = function ($index, parent) {
			var new_instance = JSON.parse(JSON.stringify( that.recipes[$index] ));
			new_instance.is_ref = 0;
			new_instance.recipe_created_on = null;
			that.recipes.splice($index+1, 0, new_instance);
		}
		
		that.deleteInstance = function ($index, item) {
            if (!that.recipes[$index].id) {
                that.recipes.splice($index, 1);
            } 
			else {
                that.api.delete_recipe_audit_item({id: that.recipes[$index].entry_id}).then(function (res) {
					if (res.data.data.code === 1000) {
						that.recipes.splice($index, 1);
						swal({
							title: "Deleted successfully!",
							timer: 1000,
							showConfirmButton: false,
							type: "success"
						  });
					}
					else{
						alertService.showError("Couldn't delete!");
					}
				});
            }
        };
		
		that.checkCreationDate = function ($index) {
			if(that.recipes[$index].recipe_created_on > that.pickers.beginDate.date){
				SweetAlert.swal({
					title: "Invalid Recipe Creation Date",
					text: "Recipe Creation Date cannot be older than Audit Begin Date",
					type: "warning",
					confirmButtonColor: "#337ab7",
					confirmButtonText: "OK"
				},
				function (res) {
					if (res) {
						return;
					}
				});
				that.recipes[$index].recipe_created_on = null;
			}
		}
		
		that.changeMode = function() {
			$state.go('foodSetup.foodInventory');
		};
		
		that.convertPartialToCurrentMode = function (is_manual) {
			var deferred = $q.defer();
			
			const multiplier = that.current_partial_qty_mode == 'Lbs' ? 1/16 : 1;
			var convert = function () {
				for(var i = 0; i < that.recipes.length; i++){
					that.recipes[i].partial_qty_ph = Math.round(((that.recipes[i].partial_qty / 100) * that.recipes[i].servings) * multiplier * 100) / 100;
				}
				that.current_partial_qty_mode_bu = JSON.parse(JSON.stringify(that.current_partial_qty_mode));
				deferred.resolve();
			}
			
			if(is_manual){
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
						that.saveCount(that.form, true).then(function () {
							convert();
						});
					} else {
						convert();
					}
				});
			}
			else{
				convert();
			}
			return deferred.promise;
		}
		
		that.getInventoriesCaller = function (categoryId, categoryOldId) {
			//if (!_.isEqual(INVENTORIES, that.recipes)) {
			if(JSON.stringify(INVENTORIES) !== JSON.stringify(that.recipes)){
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
							that.getInventories(that.model.recipe_category_id);
						});
					} else {
						that.getInventories(that.model.recipe_category_id);
					}
				});
			}
			else{
				that.getInventories(that.model.recipe_category_id);
			}
		}
		
		that.getInventories = function (categoryId, categoryOldId) {
			that.loading = true;
            var m = {
				is_adjustment: 0,
                inventory_type_id: 1,
                recipe_type_id: categoryId == 'all' ? null : categoryId,
                inventory_item: that.model.inventory_item,
				audit_start_TS: true
            };

            that.api.get_recipe_audit(m).then(function (res) {
				that.recipes = res.data.data.inventory;
				that.pickers.beginDate.date = typeof res.data.data.audit_start != 'undefined' && res.data.data.audit_start[0].audit_start != null ? new Date(res.data.data.audit_start[0].audit_start) : new Date();
				that.pickers.beginDateBackup.date = JSON.parse(JSON.stringify(that.pickers.beginDate.date));
				for (var i = 0; that.recipes.length > i; i++) {
					that.recipes[i]['recipe_created_on'] = that.recipes[i]['recipe_created_on'] ? new Date(that.recipes[i]['recipe_created_on']) : that.pickers.beginDate.date;
				}
				//INVENTORIES = angular.copy(res.data.data.inventory);
				that.convertPartialToCurrentMode().then(function(res){
					INVENTORIES = JSON.parse(JSON.stringify(that.recipes));
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
				inventory_items: []
			};
			
			const multiplier = that.current_partial_qty_mode_bu == 'Lbs' ? 16 : 1;
			
			for (var i = 0; that.recipes.length > i; i++) {
				if ((that.recipes[i].full_qty !== null && that.recipes[i].full_qty !== 0) || (that.recipes[i].partial_qty_ph !== null && that.recipes[i].partial_qty_ph !== 0)) {
					that.recipes[i].partial_qty = that.recipes[i].servings == 0 ? 0 : Math.round(((that.recipes[i].partial_qty_ph * multiplier) / that.recipes[i].servings) * 100 * 100) / 100;
					m.inventory_items.push({
						id: that.recipes[i].id,
						recipe_type_id: that.recipes[i].recipe_type_id,
						total_servings: that.recipes[i].total_servings,
						full_qty: that.recipes[i].full_qty ? that.recipes[i].full_qty : 0,
						partial_qty: that.recipes[i].partial_qty ? that.recipes[i].partial_qty : 0,
						is_ref: 0,
						recipe_created_on: that.recipes[i].recipe_created_on ? $filter('date')(that.recipes[i].recipe_created_on, 'yyyy-MM-dd') : null,
						full_values: (that.recipes[i].full_qty ? that.recipes[i].full_qty : 0)+"",
						partial_values: (that.recipes[i].partial_qty ? that.recipes[i].partial_qty : 0)+""
					})
				}
			}

			that.api.update_recipe_audit(m).then(function (res) {
				try {
					if (res.data.data.code === 1000) {
						if(!is_search){
							alertService.showAlertSave();
							that.getInventories(that.model.recipe_category_id);
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
			var deferred = $q.defer();
			if(that.recipes.length < 1){
				deferred.resolve();
			}
			
			//check for any duplicate <recipe_id, recipe_created_on> pairs. If so do not allow to Save
			var hm = {};
			var dup = false;
			for (var i = 0; that.recipes.length > i; i++) {
				var k = that.recipes[i].recipe_id+"_"+$filter('date')(that.recipes[i].recipe_created_on, 'yyyy-MM-dd');
				if (hm[k] !== undefined) {
					dup = true;
					break;
				}
				else{
					hm[that.recipes[i].recipe_id+"_"+$filter('date')(that.recipes[i].recipe_created_on, 'yyyy-MM-dd')] = 1;
				}
			}

			if(dup){
				SweetAlert.swal({
					title: "Duplicate Batch entry",
					text: "Same Batch Recipes cannot have same creation date. Please add together their count.",
					type: "warning",
					confirmButtonColor: "#337ab7",
					confirmButtonText: "OK"
				},
				function (res) {
					if (res) {
						deferred.resolve();
					}
				});
			}
			else{
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
			}
			return deferred.promise;
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
						that.api.delete_inventory_audit(1).then(function (res1) {
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
		
		that.initBatchCats = function() {
			var r_type_list = [];
			for(var ri in that.refbooks.recipe_types){
				var cr = that.refbooks.recipe_types[ri];
				if(cr.id != 1 && cr.id != 4){
					r_type_list.push({category: cr.name, r_type_id: cr.id});
				}
			}
			return {categories: r_type_list};
		}
		
		that.init = function() {
			Promise.all([core.getRefbooks()]).then(function(response) {
				that.refbooks = response[0];
				that.get_recipe_categories = that.initBatchCats().categories;
				that.get_recipe_categories.unshift({r_type_id: 'all', category: 'All Recipes'});
				that.model.recipe_category_id = that.get_recipe_categories[0].r_type_id;
				that.getInventories(that.model.recipe_category_id);
			});
		}
		that.init();

    }

    recipeAuditController.$inject = ['api', '$state', 'auth', '$filter', 'localStorageService', 'alertService', '$rootScope', 'restaurant', 'core', '$scope', 'SweetAlert', '$q'];

    angular.module('inspinia').component('recipeAuditComponent', {
        templateUrl: 'js/components/recipeAudit/recipeAudit.html',
        controller: recipeAuditController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();