(function () {
    'use strict';
	
	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Alcohol Inventory Audit Pad Instructions';
						
		that.q_texts = '<article style="display: block;"><p><b>Audit</b> - This is the final step in your setup process. In order to start your reporting we must first know exactly how much inventory you have on-hand. Your alcohol audit will cover all your alcohol and is broken up between cases, full bottles and open bottles.<br/><br/>All open bottles of alcohol and tapped kegs are both weighed and recorded in ounces.<br/><br/>Full bottles are counted as full bottles<br/><br/>Cases are counted as full cases<br/><br/>The save button on Full Audit pad allows you to save your work and complete it later.<br/><br/>Final Save is final and cannot be changed<br/><br/>Note: BE SURE THAT THE BEGINNING DATE IS THE ACTUAL DATE YOU COUNTED. IF THE BEGINNING DATE IS ENTERED INCORRECTLY THEN ALL OF YOUR RESULTS WILL BE INCORRECT.</p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
    function controller(api, $state, auth, localStorageService, $uibModal, alertService, $rootScope, restaurant, core, $scope, SweetAlert, $q, $interval, $timeout) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.get_vendors_categories = [];
        that.selectedRow = null;
        that.inventories = [];
        that.save_type = null;
        that.typeInventory = $state.params.typeInventory;  // full, adjustment

        that.pickers = {
            beginDate: {
                open: false,
                date: new Date()
            },
            endDate: {
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

		that.isAdmin = auth.authentication.user.id == 1 ? true : false;

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

        core.getRefbooks().then(function (res) {
            that.refbooks = res;
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
		
        that.calculateCount = function (item, $index) {

            var totalUnits = item.total_unit_size || 0;

            if (that.inventories[$index].case_or_qty == 'Case') {
                that.inventories[$index].item_qty = (that.inventories[$index].item_qty / totalUnits)
            } else {
                that.inventories[$index].item_qty = (totalUnits * that.inventories[$index].item_qty)
            }
        };

        that.calculateUnitWeight = function (item, $index) {
            that.total_in_uom_of_delivery = 0;
            var totalUnits = item.total_unit_size || 0;
            var size = item.size;

            if (item.inventory_type_id == 2) {
                var tareWeight = that.inventories[$index].nof_bottles * item.tare_weight;
            } else {
                tareWeight = 0;
            }
            that.inventories[$index].total_in_uom_of_delivery = that.inventories[$index].cases_qty * totalUnits + that.inventories[$index].packs_qty * size + (that.inventories[$index].item_qty - tareWeight);
            // console.log(that.inventories[$index].item_qty)
        };

        that.calculateUW = function (item, $index, form) {


            $timeout(function () {
                return item.item_qty = item.item_qty ? item.item_qty.replace(/[^\+^\d((,|\.)\d)?]+/g, "") : null;
            }, 500);

            var item_qty = item.item_qty ? item.item_qty : 0;

            // if (item_qty) {
            //     var unitWeightFormula = item_qty.match(/\d+((,|\.)\d+)?/g);
            //     var tareWeight = item.tare_weight;
            //     // var formUnitW = form
            //
            //     angular.forEach(unitWeightFormula, function (unitWeight) {
            //
            //         if (unitWeight < tareWeight) {
            //             console.log('invalid')
            //             console.log(form.unitweight)
            //             form.unitweight.$setValidity(form.unitweight, false);
            //         } else {
            //             form.unitweight.$setValidity(form.unitweight, true);
            //         }
            //
            //         // console.log('unitWeight - '+ unitWeight);
            //         // console.log('tareWeight - '+ tareWeight);
            //
            //
            //     });
            //     // console.log(tareWeight);
            // }


            if (item_qty) {
                that.inventories[$index].item_qty_formula = item.item_qty.replace(/[^\d((,|\.)\d)?]+/g, "+").replace(/^\D*|\D*$/g, "");
                that.itemQtyStr = item_qty.match(/\d+((,|\.)\d+)?/g).reduce(function (previousValue, currentValue, index, array) {
                    return (previousValue * 1) + (currentValue * 1);
                });
            }
            item.itemQtyStrlabel = that.itemQtyStr ? that.itemQtyStr : item.item_qty;
        };

        that.calculateUWSum = function (item, $index) {
            var item_qty = item.item_qty ? item.item_qty : null;

            if (item_qty) {
                that.itemQtyStr = item_qty.match(/\d+((,|\.)\d+)?/g).reduce(function (previousValue, currentValue, index, array) {
                    return (previousValue * 1) + (currentValue * 1);
                });
            } else {
                that.itemQtyStr = null;
                return
            }

            that.inventories[$index].item_qty = that.itemQtyStr;
            if (that.itemQtyStr > 0 && (item.nof_bottles == 0 || item.nof_bottles == null)) {
                that.inventories[$index].nof_bottles = 1;
            }
        };

        that.calculateUWFormula = function (item, $index) {
            that.inventories[$index].item_qty = that.inventories[$index].item_qty_formula ? that.inventories[$index].item_qty_formula : null
        };

        that.initOfBottle = function (item, $index) {
            if (item.item_qty > 0 && (item.nof_bottles == 0 || item.nof_bottles == null)) {
                that.inventories[$index].nof_bottles = 1;
            }

            if (item.item_qty == 0) {
                that.inventories[$index].nof_bottles = 0;
            }
        };


        api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 2}).then(function (res) {
            try {
                that.get_vendors_categories = res.data.data.categories;
                that.get_vendors_categories.unshift({id: 'all', category: 'All Items'});
                that.model.vendor_category_id = res.data.data.categories[0].id;
                that.getInventories(that.model.vendor_category_id);
				//console.log(res);
            } catch (e) {
                console.log(e);
            }
        });

		that.mergeItems = function () {
			for(var i = 0; i < that.inventories.length; i++){
				if(that.inventories[i].substitute_for == null){
					that.inventories[i].show = 1;
				}
				else{
					for(var j = 0; j < that.inventories.length; j++){
						if(that.inventories[i].substitute_for == that.inventories[j].vendor_sku_id
							&& that.inventories[i].tare_type != that.inventories[j].tare_type){
							that.inventories[i].show = 1;
							break;
						}
					}
				}
			}
		}
		
        that.getInventories = function (categoryId, categoryOldId) {

            var _setToZero = function (data) {
                if (!data.length) return;

                for (var i = 0; data.length > i; i++) {
					if(that.typeInventory == 'adjustment'){
						data[i].cases_qty = null;
						data[i].packs_qty = null;
						data[i].nof_bottles = null;
						data[i].item_qty = null;
					}
					else{
						data[i].cases_qty = 0;
						data[i].packs_qty = 0;
						data[i].nof_bottles = 0;
						data[i].item_qty = 0;
					}
                }

                return data;
            };

            var m = {
                is_adjustment: that.typeInventory == 'adjustment' ? 1 : 0,
                inventory_type_id: 2,
                vendor_cat_id: categoryId == 'all' ? null : categoryId,
                inventory_item: that.model.inventory_item
            };

            if (!_.isEqual(INVENTORIES, that.inventories)) {
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
                                that.api.get_inventory_audit(m).then(function (res) {
                                    that.inventories = res.data.data.inventory;
									//console.log(res);
                                    if (that.typeInventory == 'adjustment') {
                                        that.inventories = _setToZero(that.inventories)
                                    }
									that.mergeItems();
                                    INVENTORIES = angular.copy(that.inventories);
                                })
                            });
                        } else {
                            that.model.vendor_category_id = categoryOldId;
                        }
                    });
            } else {
                that.api.get_inventory_audit(m).then(function (res) {
					//console.log(res);
					var filter_visible = [];
					for(var fv=0; fv<res.data.data.inventory.length; fv++){
						if(res.data.data.inventory[fv].visible == 1){
							filter_visible.push(res.data.data.inventory[fv]);
						}
					}
					if (that.typeInventory == 'adjustment') {
                        that.inventories = _setToZero(filter_visible);
						that.mergeItems();
                        INVENTORIES = angular.copy(that.inventories);
                    } else {
                        that.inventories = filter_visible;
						that.mergeItems();
                        INVENTORIES = angular.copy(filter_visible);
                    }
					
                    /*if (that.typeInventory == 'adjustment') {
                        that.inventories = _setToZero(res.data.data.inventory);
                        INVENTORIES = angular.copy(that.inventories);
                    } else {
                        that.inventories = res.data.data.inventory;
                        INVENTORIES = angular.copy(res.data.data.inventory);
                    }*/
                })
            }

        };

        that.saveAll = function (form, is_search, is_final_save) {
            var deferred = $q.defer();

            if (!form.$valid) return;

            if (is_final_save && (!that.pickers.beginDate.date || !that.pickers.endDate.date)) {
                return
            }

            if (that.typeInventory == 'adjustment') {
                var is_adjustment = 1;
                is_final_save = 1;
            }
			
			if(!is_search){
				
				var popup_text = restaurant.data.info.is_setup_completed == 0 ? is_final_save == 1 ? "This will permanently update your on-hand count as of today. Also access to other features of the system will be restricted until Artecsan has successfully connected to your POS." : "This will save this as a draft." : is_final_save == 1 ? "This will permanently update your on-hand count as of today." : "This will save this as a draft.";

				var title = is_final_save == 1 ? "Final Save?" : "Save?";
				SweetAlert.swal({
					title: title,
					text: popup_text,
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#337ab7",
					confirmButtonText: "Save"
				},
				function (res) {
					if (res) {
						var m = {
							inventory_type_id: 2,
							counting_started_at: new Date(that.pickers.beginDate.date).getTime(),
							counting_ended_at: new Date(that.pickers.endDate.date).getTime(),
							is_final_save: is_final_save || 0,
							is_adjustment: is_adjustment || 0,
							inventory_items: []
						};

						for (var i = 0; that.inventories.length > i; i++) {
							if (that.inventories[i].item_qty !== null || that.inventories[i].cases_qty !== null || that.inventories[i].packs_qty !== null || that.inventories[i].nof_bottles !== null) {
								m.inventory_items.push({
									id: that.inventories[i].id,
									item_qty: that.inventories[i].item_qty ? that.inventories[i].item_qty : 0,
									cases_qty: that.inventories[i].cases_qty ? that.inventories[i].cases_qty : 0,
									nof_bottles: that.inventories[i].nof_bottles ? that.inventories[i].nof_bottles : 0,
									packs_qty: that.inventories[i].packs_qty ? that.inventories[i].packs_qty : 0,
									total_in_uom_of_delivery: that.inventories[i].total_in_uom_of_delivery,
									item_qty_formula: that.inventories[i].item_qty_formula
								})
							}
						}

						if (!m.inventory_items.length) return;

						that.api.update_inventory_audit(m).then(function (res) {
							try {
								if (res.data.data.code === 1000) {
									INVENTORIES = angular.copy(that.inventories);
									if (that.save_type == 'final') {
										if(restaurant.data.info.is_setup_completed == 0){
											$state.go('home');
										}
										else{
											$state.go('admin.homeMenu');
										}
									}
									else if (that.save_type == 'review'){
										$state.go('reports.alcoholCostOfSummary');
									}
									else if (that.save_type == 'save'){
										that.getInventories(that.model.vendor_category_id);
									}
									alertService.showAlertSave();

									deferred.resolve()
								}
							} catch (e) {
								console.log(e);
								deferred.reject()
							}
						}, function () {
							deferred.reject()
						});
					} else {
						return;
					}
				});
			}
			else{
				var m = {
					inventory_type_id: 2,
					counting_started_at: new Date(that.pickers.beginDate.date).getTime(),
					counting_ended_at: new Date(that.pickers.endDate.date).getTime(),
					is_final_save: is_final_save || 0,
					is_adjustment: is_adjustment || 0,
					inventory_items: []
				};

				for (var i = 0; that.inventories.length > i; i++) {
					if (that.inventories[i].item_qty !== null || that.inventories[i].cases_qty !== null || that.inventories[i].packs_qty !== null || that.inventories[i].nof_bottles !== null) {
						m.inventory_items.push({
							id: that.inventories[i].id,
							item_qty: that.inventories[i].item_qty ? that.inventories[i].item_qty : 0,
							cases_qty: that.inventories[i].cases_qty ? that.inventories[i].cases_qty : 0,
							nof_bottles: that.inventories[i].nof_bottles ? that.inventories[i].nof_bottles : 0,
							packs_qty: that.inventories[i].packs_qty ? that.inventories[i].packs_qty : 0,
							total_in_uom_of_delivery: that.inventories[i].total_in_uom_of_delivery,
							item_qty_formula: that.inventories[i].item_qty_formula
						})
					}
				}

				if (!m.inventory_items.length) return;

				that.api.update_inventory_audit(m).then(function (res) {
					try {
						if (res.data.data.code === 1000) {
							deferred.resolve()
						}
					} catch (e) {
						console.log(e);
						deferred.reject()
					}
				}, function () {
					deferred.reject()
				});
			}
            return deferred.promise;

        };

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


        that.openCalendar = function (e, picker) {
            that.pickers[picker].open = true;
        };


        // TODO
        // window.onbeforeunload = function() {
        //     return 'You have not yet saved' ;
        // }
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'alertService', '$rootScope', 'restaurant', 'core', '$scope', 'SweetAlert', '$q', '$interval', '$timeout'];

    angular.module('inspinia').component('alcoholInventoryComponent', {
        templateUrl: 'js/components/alcoholSetup/foodInventory/foodInventory.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();