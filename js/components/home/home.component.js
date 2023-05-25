(function () {

    'use strict';

    function homeController(appConfig, $state, auth, api, alertService, core, restaurant, localStorageService, $scope, $rootScope, $interval) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        var that = this;

        that.restaurantService = restaurant;
        that.restaurantsList = [];
        that.employees_list = [];
        that.api = api;
        that.inventoryTypeId = null;
		that.sub_types = ["Active", "Inactive"];

        core.data.new_restaurant = null; // reset recently editable or added restaurant

        that.m = {
            order_by: "name",
            order_way: "ASC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            paginationCount: 10, //25 by default,
            inRequest: false,
            search_by: null,
			sub_type: "Active",
            paginationTotal: 0
        };

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });

		that.is_su = auth.authentication.user.id == 1 ? true : false;
        that.$onInit = function () {
            that.permissions = restaurant.data.permissions;
        };

        that.selectRestaurant = function (restaurant) {
            that.restaurantService.set_restaurant(restaurant.id).then(function (res) {
                that.api.report_items_match(restaurant.id).then(function (res) {
                    $rootScope.report_items_match_to_show = res.data.data.items_to_match;
                    $rootScope.restaurant_id = restaurant.id;
                    $rootScope.subscription_type_id = restaurant.subscription_type_id;
					
                });

				if(restaurant.subscription_type_id != 4){
					for (var i in res.employees) {
						if(res.employees[i].id == auth.authentication.user.id){
							if(res.employees[i].type_ids === 8)	{	//data entry
								$state.go('admin.dataEntry');
								return;
							}
							else if (res.employees[i].type_ids === 11 || res.employees[i].type_ids === 12) {
								alertService.showError('You do not have access here. Please login using the mobile app.');
								return;
							}
							else if (res.employees[i].type_ids === 5) {
								$state.go('foodSubCategories');
								return;
							}
							else if (res.employees[i].type_ids === 6) {
								$state.go('alcoholSubCategories');
								return;
							}
							else if (res.employees[i].type_ids === 9 || res.employees[i].type_ids === 10) {	//Skrible Auditor
								if(restaurant.subscription_type_id == 5){
									$state.go('alcoholSubCategories');
									return;
								}
								else if (restaurant.subscription_type_id == 6){
									$state.go('foodSubCategories');
									return;
								}
								else if (restaurant.subscription_type_id == 7){
									$state.go('admin.inventoryCategories');
									return;
								}
							}
						}
					}
					$state.go('admin.homeMenu');
				}
				else{
					$state.go('reports.compgroupReport');
				}
            });
        };

        that.search = function (keyword) {

            that.inRequest = true;

            var m = {
                order_by: that.m.order_by,
                order_way: that.m.order_way,
                paginationOffset: that.m.paginationOffset,
                paginationCount: that.m.paginationCount,
                search_by: that.m.search_by
            };
			
			if(that.is_su){
				m.sub_type = that.m.sub_type == 'Active' ? 'Paid' : 'Free';
			}
			
            for (var i in m) {
                if (!m[i]) {
                    delete  m[i]
                }
            }

            if (keyword) {
                m.paginationOffset = 0;
                if (that.m.order_by == keyword) {
                    that.m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC';
                    m.order_way = m.order_way == 'ASC' ? 'DESC' : 'ASC'
                } else {
                    that.m.order_by = keyword;
                    m.order_by = keyword;
                }
            }
            if (m.paginationOffset > 0 && !keyword) {
                m.paginationOffset = (m.paginationOffset - 1) * m.paginationCount;
            }


            api.get_restaurants(m).then(function (res) {
                try {
                    that.restaurantsList = res.data.data.restaurants_list;
                    that.m.paginationTotal = res.data.data.total;
                } catch (e) {
                    console.log(e);
                }
                that.m.inRequest = false;
            }, function (e) {
                console.log(e);
                that.m.inRequest = false;
            })
        };

        that.search();

        that.editRestaurant = function (e_restaurant) {			
            that.restaurantService.set_restaurant(e_restaurant.id).then(function () {

				that.restaurantService.set_to_edit(e_restaurant.id).then(function () {

					api.get_restaurant(e_restaurant.id).then(function (res) {
						that.typeIdSubscription = res.data.data.restaurants_list[0].subscription_type_id;
						if(that.typeIdSubscription != 4){
							/*that.employees_list = res.data.data.restaurants_list[0].employees;
							//console.log('employees -', that.employees_list.length);

							if (that.employees_list.length) {

								for (var i = 0; that.employees_list.length > i; i++) {
									//console.log('type_ids- ', that.employees_list[i].type_ids);
									if (that.employees_list[i].type_ids === 4) {
										that.inventoryTypeId = 2;
									}
									if (that.employees_list[i].type_ids === 3) {
										that.inventoryTypeId = 1;
									}
								}

								api.get_chosen_vendors(restaurant.id, {vendor_type_id: that.inventoryTypeId}).then(function (res) {
									that.vendorsSelected = res.data.data.vendors;
									//console.log('vendors -', that.vendorsSelected.length);

									if (that.vendorsSelected.length) {

										api.get_active_inventory_by_vendor({inventory_type_id: that.inventoryTypeId}, restaurant.id).then(function (res) {
											that.inventoryListSelected = res.data.data.sku;
											//console.log('inventories -', that.inventoryListSelected.length);

											if (that.inventoryListSelected.length) {

												api.get_recipes().then(function (res) {
													that.recipes = res.data.data.recipes_list;
													//console.log('recipes -', that.recipes.length);

													if (that.recipes.length) {

														api.get_menus({item_type_id: that.inventoryTypeId}).then(function (res) {
															that.menus = res.data.data.menus_list;
															//console.log('menus -', that.menus.length);

															if (that.menus.length) {

																that.api.delivery_schedules({inventory_type_id: that.inventoryTypeId}).then(function (res) {
																	that.deliveries = res.data.data.delivery_schedules_list;
																	//console.log('deliveries -', that.deliveries.length);

																	if (that.deliveries.length) {
																		$state.go('foodSetup.posSync');
																	} else {
																		if (that.inventoryTypeId == 2) {
																			$state.go('alcoholSetup.delivery');
																		} else {
																			$state.go('foodSetup.delivery');
																		}
																	}
																});
															} else {
																if (that.inventoryTypeId == 2) {
																	$state.go('alcoholSetup.menu');
																} else {
																	$state.go('foodSetup.menu');
																}
															}
														});
													} else {
														if (that.inventoryTypeId == 2) {
															$state.go('alcoholSetup.menu');
														} else {
															$state.go('foodSetup.recipe');
														}
													}
												});
											} else {
												if (that.inventoryTypeId == 2) {
													$state.go('alcoholSetup.inventory');
												} else {
													$state.go('foodSetup.inventory');
												}
											}
										});
									} else {
										if (that.inventoryTypeId == 2) {
											$state.go('alcoholSetup.vendor');
										} else {
											$state.go('foodSetup.vendor');
										}
									}
								});
							} else {*/
							
							that.employees_list = res.data.data.restaurants_list[0].employees;
							
							for (var i = 0; that.employees_list.length > i; i++) {
								if(that.employees_list[i].id == auth.authentication.user.id){
									if (that.employees_list[i].type_ids > 1) {		//non-admins
										if (that.typeIdSubscription == 1 || that.typeIdSubscription == 5) {
											if(that.employees_list[i].type_ids == 6 || that.employees_list[i].type_ids == 9 || that.employees_list[i].type_ids == 10){
												$state.go('setupFirstAudit');
											}
											else {
												$state.go('alcoholSetup.vendor');
											}
										} else if(that.typeIdSubscription == 2 || that.typeIdSubscription == 6) {
											if(that.employees_list[i].type_ids == 5 || that.employees_list[i].type_ids == 9 || that.employees_list[i].type_ids == 10){
												$state.go('setupFirstAudit');
											}
											else {
												$state.go('foodSetup.vendor');
											}
										}
										else if(that.typeIdSubscription == 3 || that.typeIdSubscription == 7) {
											if(that.employees_list[i].type_ids == 5 || that.employees_list[i].type_ids == 6 || that.employees_list[i].type_ids == 9 || that.employees_list[i].type_ids == 10){
												$state.go('setupFirstAudit');
											}
											else if (that.employees_list[i].type_ids == 4){
												$state.go('alcoholSetup.vendor');
											}
											else if (that.employees_list[i].type_ids == 3){
												$state.go('foodSetup.vendor');
											}
											else {
												$state.go('foodSetup.vendor');
											}
										}
									}
									else{	//admin
										$state.go('invite', {id: e_restaurant.id});
									}
								}
							}
							
							if(auth.authentication.user.id === 1){		//SU
								if (that.typeIdSubscription == 1 || that.typeIdSubscription == 5) {
										$state.go('alcoholSetup.vendor');
								} else if(that.typeIdSubscription == 2 || that.typeIdSubscription == 3 || that.typeIdSubscription == 6 || that.typeIdSubscription == 7) {
										$state.go('foodSetup.vendor');
								}
							}
							/*}*/
						}
						else{
							that.api.get_analytics_answers({rest_id: e_restaurant.id, pg_no: 1}).then(function (res) {
								if(res.data.data.analytics_answers.analytics_answers.length == 0){
									$state.go('administrator.posSync');
								}
								else{
									$state.go('admin.analytics');
								}
							});
						}
					});

				});
			});
        };


    }

    homeController.$inject = ['appConfig', '$state', 'auth', 'api', 'alertService', 'core', 'restaurant', 'localStorageService', '$scope', '$rootScope', '$interval'];

    angular.module('inspinia').component('homeComponent', {
        templateUrl: 'js/components/home/home.html',
        controller: homeController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();