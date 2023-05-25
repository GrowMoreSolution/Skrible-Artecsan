/**
 * MainCtrl - controller
 * Contains several global data used in different view
 *
 */
function MainCtrl($http, $uibModal, $scope, $location, api, auth, $state, restaurant, $rootScope, $uibModalStack, $interval, localStorageService, common) {

    var that = this;
    that.api = api;

    that.inviteForm = {};

    that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

    $rootScope.$on('restaurantSelected', function () {
        $rootScope.restaurant_id = restaurant.data.info.id;
        that.permissions = restaurant.data.permissions;
        $rootScope.subscription_type_id = restaurant.data.info.subscription_type_id;
        that.subscription_type_id = restaurant.data.info.subscription_type_id;
    });

    $rootScope.$on('$stateChangeStart', function (event) {
        var top = $uibModalStack.getTop();
        $("html, body").animate({scrollTop: 0}, 20);
        if (top) {
            $uibModalStack.dismissAll();
        }
    });


    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
        window.onbeforeunload = null;
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
    });


    var _report_items_match = function () {
        if (!$rootScope.restaurant_id || !auth.authentication.isLogged)
            return;
        that.api.report_items_match($rootScope.restaurant_id).then(function (res) {
            $rootScope.report_items_match_to_show = res.data.data.items_to_match;
        })
    };

    _report_items_match();

    that.$onInit = function () {
        that.permissions = restaurant.data.permissions;

        if ($rootScope.report_items_match_interval) {
            $interval.cancel($rootScope.report_items_match_interval);
        }

        $rootScope.report_items_match_interval = $interval(_report_items_match, 1000 * 60)

    };

    var invite_key = $location.search()['invite_key'];

    var inviteKeyPopup = function (invite_key) {
        that.api.get_invite_info({invite_key: invite_key}).then(function (res) {

            var user = res.data.data.invite_info;

            if (user) {
                $uibModal.open({
                    templateUrl: 'views/modal/invite_key_popup.html',

                    controller: function ($uibModalInstance, alertService) {

                        var self = this;

                        self.user = user;

                        self.decline = function () {
                            var m = {
                                invite_key: invite_key,
                                status_id: 2,
                                is_new_user: self.user.is_new_user
                            };

                            that.api.redeem_invitation(m).then(function (res) {
                                if (res.data.data.code === 1000 || res.data.data.code === 1022) {
									$uibModalInstance.close();
                                    alertService.showSuccessText('Invitation was declined');
                                    if (!auth.authentication.isLogged) {
                                        $state.go('login', {});
                                    }
                                }
                            });
                        };

                        self.submit = function (form) {
                            if (form.$valid !== true) {

                                if (form.$error && form.$error.password) {
                                    alertService.showErrorInvitation('', 'Password should be minimum 8 characters and contain at least 1 uppercase letter and 1 digit');
                                    return;
                                }
                                return;
                            }


                            var m = {
                                invite_key: invite_key,
                                status_id: 1,
                                is_new_user: self.user.is_new_user
                            };

                            if (self.user.is_new_user) {
                                m.password = self.user.password
                            }

                            that.api.redeem_invitation(m).then(function (res) {
                                if (res.data.data.code === 1000 || res.data.data.code === 1022) {
                                    $uibModalInstance.close();
                                    alertService.showSuccessText('Invitation was confirmed');
                                    if (!auth.authentication.isLogged) {
                                        $state.go('login', {});
                                    }
                                }

                            });
                        }
                    },
                    windowClass: "animated fadeIn",
                    controllerAs: '$ctr'
                });
            }

        });

    };

    if (invite_key) {
        inviteKeyPopup(invite_key);
    }

    that.full_Audit = function () {
        common.full_Audit();
    };

    that.adjustment_Audit = function () {
        common.adjustment_Audit();
    };

	that.showAuditOptions = function (inventory_type_id, caller) {
		that.api.get_suggested_audit({inventory_type_id: inventory_type_id}).then(function (res) {
			if (res.data.data.code === 1000) {
				var sug_aud_exists = res.data.data.inventory.length ? true : false;
				//
				return $uibModal.open({
					templateUrl: 'views/modal/show_audit_options.html',
					controller: function ($uibModalInstance, $scope, alertService) {
						$scope.sug_aud_exists = sug_aud_exists;
						$scope.startCount = function (mode) {
							if(!sug_aud_exists){
								if(mode == 'reg'){
									if(inventory_type_id == 2){
										if(caller == 'tablet'){
											that.beginAlcoholInventoryCountTablet();
										}
										else{
											that.beginAlcoholInventoryCount();
										}
									}
									else if(inventory_type_id == 1){
										if(caller == 'tablet'){
											that.beginFoodInventoryCountTablet();
										}
										else{
											$state.go("foodSetup.foodInventory");
										}
									}
								}
							}
							else{
								var ongoing_exists = false;
								var ongoing_suggested_exists = false;
								that.api.get_audit_dates({'RestaurantId': $rootScope.restaurant_id, 'inventory_type_id': inventory_type_id}).then(function (res1) {
									if(res1.data.data.Report.length){
										if(res1.data.data.Report[0].src == 'draft'){
											ongoing_exists = true;
											if(res1.data.data.Report[0].is_suggested == 1){
												ongoing_suggested_exists = true;
											}
										}
									}
									
									
									if(ongoing_exists){
										if(ongoing_suggested_exists){
											if(mode == 'reg'){
												//show popup and block.
												//popup offers to clear suggested audit...
												var conf = {
													title: "You have an ongoing suggested audit.",
													text: "Please complete the suggested audit or clear it to access the Full Count.",
													type: "warning",
													showCancelButton: true,
													confirmButtonColor: "#ed5565",
													cancelButtonText: "Clear Suggested Audit",
													confirmButtonText: "OK"
												};
												swal(conf, function (res) {
													if (!res) {
														//clear sug aud
														that.api.delete_inventory_audit(inventory_type_id, 'true').then(function (res1) {
															alertService.showSuccessText("Deleted!, Please proceed to startover a new audit.");
															$uibModalInstance.dismiss('cancel');
														});
													}
												});
											}
											else if(mode == 'sug'){
												if(inventory_type_id == 2){
													if(caller == 'tablet'){
														$state.go('alcoholSetup.tabletEntry', {is_sug_aud: true});
													}
													else{
														that.beginAlcoholInventoryCount();
													}
												}
												else if(inventory_type_id == 1){
													if(caller == 'tablet'){
														$state.go('foodSetup.tabletEntry', {is_sug_aud: true});
													}
													else{
														$state.go("foodSetup.foodInventory", {is_sug_aud: true});
													}
												}
											}
										}
										else{
											if(mode == 'reg'){
												if(inventory_type_id == 2){
													if(caller == 'tablet'){
														that.beginAlcoholInventoryCountTablet();
													}
													else{
														that.beginAlcoholInventoryCount();
													}
												}
												else if(inventory_type_id == 1){
													if(caller == 'tablet'){
														that.beginFoodInventoryCountTablet();
													}
													else{
														$state.go("foodSetup.foodInventory");
													}
												}
											}
											else{
												//show popup and block.
												//alertService.showErrorInvitation('You have an ongoing audit!', 'Please complete the ongoing audit or clear it to access the Suggested Audit');
												var conf = {
													title: "You have an ongoing audit!",
													text: "Please complete the ongoing audit or clear it to access the Suggested Audit.",
													type: "warning",
													//showCancelButton: true,
													confirmButtonColor: "#ed5565",
													confirmButtonText: "OK"
												};
												swal(conf, function (res) {
													if (res) {
													}
												});
											}
										}
									}
									else{
										if(mode == 'reg'){
											//show popup and block.
											//popup offers to clear suggested audit...
											var conf = {
												title: "You have a suggested audit.",
												text: "Please complete the suggested audit or clear it to access the Full Count.",
												type: "warning",
												showCancelButton: true,
												confirmButtonColor: "#ed5565",
												cancelButtonText: "Clear Suggested Audit",
												confirmButtonText: "OK"
											};
											swal(conf, function (res) {
												if (!res) {
													//clear sug aud
													that.api.delete_suggested_audit({'inventory_type_id': inventory_type_id}).then(function (res1) {
														alertService.showSuccessText("Deleted!, Please proceed to startover a new audit.");
														$uibModalInstance.dismiss('cancel');
													});
												}
											});
										}
										else if(mode == 'sug'){
											if(inventory_type_id == 2){
												if(caller == 'tablet'){
													$state.go('alcoholSetup.tabletEntry', {is_sug_aud: true});
												}
												else{
													that.beginAlcoholInventoryCount();
												}
											}
											else if(inventory_type_id == 1){
												if(caller == 'tablet'){
													$state.go('foodSetup.tabletEntry', {is_sug_aud: true});
												}
												else{
													$state.go("foodSetup.foodInventory", {is_sug_aud: true});
												}
											}
										}
									}
								});
							}
						};
						
						$scope.cancel = function () {
							$uibModalInstance.dismiss('cancel');
						};
					},
					windowClass: "animated fadeIn",
					size: 'lg',
					controllerAs: '$ctr'
				});
				//
			}
		});
    };
	
    that.beginAlcoholInventoryCount = function () {
        common.beginAlcoholInventoryCount();
    };

    that.beginAlcoholInventoryCountTablet = function () {
        $state.go('alcoholSetup.tabletEntry');
    };

    that.beginFoodInventoryCountTablet = function () {
        $state.go('foodSetup.tabletEntry');
    };

    // that.passwordConfirm = function (form) {
    //     if (!form.$valid) {
    //         return
    //     }
    // };


    this.posIndex = 2;
    this.isRegistration = false;
    this.isFoodSetup = false;
    this.isTrue = true;
    this.type = {
        value: 1,
        name: 'MEAT & POULTRY'
    };

    this.types = [
        {
            value: 1,
            name: 'MEAT & POULTRY'
        }, {
            value: 2,
            name: 'SEAFOOD'
        },
        {
            value: 3,
            name: 'PRODUCE'
        },
        {
            value: 4,
            name: 'VEGETABLES'
        },
        {
            value: 5,
            name: 'BREAD'
        },
        {
            value: 6,
            name: 'FRUIT'
        }

    ]

    this.usersList = [
        {
            firstName: 'firstName',
            lastName: 'lastName',
            email: 'test123@ttts.rt',
            userType: 'Admin',
            selected: false
        },
        {
            firstName: 'firstName2',
            lastName: 'lastName',
            email: 'test123@ttts.rt',
            userType: 'Admin',
            selected: false
        },
        {
            firstName: 'firstName3',
            lastName: 'lastName',
            email: 'test123@ttts.rt',
            userType: 'Admin',
            selected: false
        }];
    this.vendorsList = [
        {
            id: 121,
            name: 'test',
            city: 'City',
            date: '12/12/12',
            zip: '123',
            selected: false
        },
        {
            id: 122,
            name: 'test6',
            city: 'City6',
            date: '12/12/16',
            zip: '1236',
            selected: false
        },
        {
            id: 1241,
            name: 'test3',
            city: 'City3',
            date: '12/15/12',
            zip: '1523',
            selected: false
        },
        {
            id: 1621,
            name: 'test8',
            city: 'City8',
            date: '12/12/13',
            zip: '1239',
            selected: false
        },
        {
            id: 1821,
            name: 'test3',
            city: 'City3',
            date: '12/12/18',
            zip: '1235',
            selected: false
        },
        {
            id: 18621,
            name: 'test3',
            city: 'City3',
            date: '12/12/18',
            zip: '1235',
            selected: false
        }];

    this.selectedVendors = [
        {
            id: 121,
            name: 'test',
            city: 'City',
            date: '12/12/12',
            zip: '123',
            selected: false
        },
        {
            id: 122,
            name: 'test',
            city: 'City',
            date: '12/12/12',
            zip: '123',
            selected: false
        }];

    this.selectedInventoryList = [];
    this.inventoryList = [
        {
            id: 18321,
            name: 'test',
            desc: 'description',
            selected: false
        },
        {
            id: 14821,
            name: 'test',
            desc: 'description',
            selected: false
        },
        {
            id: 15821,
            name: 'test',
            desc: 'description',
            selected: false
        },
        {
            id: 17821,
            name: 'test',
            desc: 'description',
            selected: false
        },
        {
            id: 18821,
            name: 'test',
            desc: 'description',
            selected: false
        }]

    this.selectInventory = function (ind) {
        this.inventoryList[ind].selected = !this.inventoryList[ind].selected;
    }

    this.selectVendor = function (ind) {
        this.vendorsList[ind].selected = !this.vendorsList[ind].selected;
    }

    this.recipeList = [
        {
            name: 'recipe1',
            type: 'type1',
            cnt: 123
        },
        {
            name: 'recipe19',
            type: 'type19',
            cnt: 1923
        },
        {
            name: 'recipe1',
            type: 'type1',
            cnt: 123
        },
        {
            name: 'recipe18',
            type: 'type18',
            cnt: 1283
        },
        {
            name: 'recipe16',
            type: 'type16',
            cnt: 1623
        },
        {
            name: 'recipe41',
            type: 'type41',
            cnt: 1523
        }];
    this.menuList = [
        {
            id: 1,
            name: 'menu item',
            price: 23,
            cost: 123
        },
        {
            id: 41,
            name: 'menu item',
            price: 243,
            cost: 123
        }, {
            id: 15,
            name: 'menu item',
            price: 23,
            cost: 123
        }, {
            id: 16,
            name: 'menu item',
            price: 23,
            cost: 123
        }, {
            id: 71,
            name: 'menu item',
            price: 23,
            cost: 123
        }, {
            id: 18,
            name: 'menu item',
            price: 23,
            cost: 123
        }, {
            id: 19,
            name: 'menu item',
            price: 23,
            cost: 123
        }, {
            id: 231,
            name: 'menu item',
            price: 23,
            cost: 123
        }];

    this.deliveryList = [
        {
            c: 'Category',
            d: '	Mon,Tue,Wed'
        },
        {
            c: 'Category',
            d: '	Mon,Tue,Wed'
        },
        {
            c: 'Category',
            d: '	Mon,Tue,Wed'
        },
        {
            c: 'Category',
            d: '	Mon,Tue,Wed'
        }]

    this.selectBlock = function (val) {
        this.posIndex = val;
    };

    this.selectRestaurant = function () {
        this.isRestaurantSelected = true;
    };

    this.logout = function () {
        this.posIndex = 2;
        this.isRegistration = false;
        this.isFoodSetup = false;
        auth.logOut();
    };

    this.reset = function () {
        this.posIndex = 2;
        this.isRestaurantSelected = false;
        this.changeFirstDashboaed = false;
    }


    this.open2 = function (self) {
        if (!self.usersList)
            self.usersList = [];

        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/add_new_user_item.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn",
            controllerAs: 'vm',
            resolve: {
                user: function () {
                    return null;
                }
            }
        });

        modalInstance.result.then(function (result) {
            self.usersList.push(result);
        }, function (reason) {

        });
    };


    this.open3 = function (self) {
        if (!self.usersList)
            self.usersList = [];

        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/invite_new_user_item.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn",
            controllerAs: 'vm',
            resolve: {
                user: function () {
                    return null;
                }
            }
        });

        modalInstance.result.then(function (result) {
            self.usersList.push(result);
        }, function (reason) {

        });
    };

    this.open4 = function (self) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/add_new_recipe_item.html',
            controller: ModalInstanceRecipeCtrl,
            windowClass: "animated fadeIn modal-lgg",
            controllerAs: 'vm',
            size: 'lg',
            resolve: {
                recipe: function () {
                    return null;
                }
            }
        });

        modalInstance.result.then(function (result) {

        }, function (reason) {

        });
    };

    this.open6 = function (self) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/add_new_menu_item.html',
            controller: ModalInstanceMenuCtrl,
            windowClass: "animated fadeIn",
            size: 'lg',
            controllerAs: 'vm',
            resolve: {
                menu: function () {
                    return null;
                }
            }
        });

        modalInstance.result.then(function (result) {

        }, function (reason) {

        });
    };
    this.open7 = function (self) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/add_new_menu_item.html',
            controller: ModalInstanceMenuCtrl,
            windowClass: "animated fadeIn",
            controllerAs: 'vm',
            resolve: {
                menu: function () {
                    return self.menuList[0];
                }
            }
        });

        modalInstance.result.then(function (result) {

        }, function (reason) {

        });
    };


    this.open8 = function (self) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/add_new_delivery_item.html',
            controller: ModalInstanceDeliveryCtrl,
            windowClass: "animated fadeIn",
            controllerAs: 'vm'
        });

        modalInstance.result.then(function (result) {

        }, function (reason) {

        });
    };

    this.editUser = function (self, user, index) {
        self.usersList.splice(index, 1);
        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal/add_new_user_item.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn",
            controllerAs: 'vm',
            resolve: {
                user: function () {
                    return user;
                }
            }
        });

        modalInstance.result.then(function (result) {
            self.usersList.push(result);
        }, function (reason) {

        });
    };

    this.deleteUser = function (self, index) {
        self.usersList.splice(index, 1);
    }

    this.where = function () {
        alert('Under construction');
    }

    this.willBe = function () {
        alert('It will work if number of vendors > 1');
    }
}


function notifyCtrl($scope, notify, $state) {
    $scope.inspiniaTemplate = 'views/common/notify.html';
    $scope.inspiniaDemo1 = function () {
        notify({
            message: 'Thank you! We will contact you soon',
            classes: 'alert-info',
            templateUrl: $scope.inspiniaTemplate
        });
        $state.go('home.home');
    }

}

function ModalInstanceCtrl($scope, $uibModalInstance, user) {

    this.isEdit = false;
    this.user = user;
    if (user)
        this.isEdit = true;
    $scope.ok = function (user) {
        $uibModalInstance.close(user);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}


function ModalInstanceDeliveryCtrl($scope, $uibModalInstance) {


    $scope.ok = function (user) {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}


function ModalInstanceRecipeCtrl($scope, $uibModalInstance, recipe) {

    this.isEdit = false;
    this.recipe = recipe;
    if (recipe)
        this.isEdit = true;
    $scope.ok = function (recipe) {
        $uibModalInstance.close(recipe);
    };

    this.ingredients = [{
        amount: 122,
        cost: 300
    },
        {
            amount: 1242,
            cost: 3060
        }]

    this.addIngredient = function () {
        this.ingredients.push({
            amount: 1622,
            cost: 3070
        });
    }

    this.removeIngredient = function (ind) {
        this.ingredients.splice(ind, 1);
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}


function ModalInstanceMenuCtrl($scope, $uibModalInstance, menu) {

    this.isEdit = false;
    this.menu = menu;
    if (menu)
        this.isEdit = true;

    $scope.recipeInventories = [];
    $scope.ok = function (menu) {
        $uibModalInstance.close(menu);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    this.addRecipeInventory = function () {
        $scope.recipeInventories.push({
            name: 'recipe'
        });
    }
    this.remove = function (ind) {
        $scope.recipeInventories.splice(ind, 1);
    }
}


/**
 *
 * Pass all functions into module
 */
angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .controller('notifyCtrl', notifyCtrl)
    .controller('ModalInstanceRecipeCtrl', ModalInstanceRecipeCtrl)
    .controller('ModalInstanceMenuCtrl', ModalInstanceMenuCtrl)
    .controller('ModalInstanceDeliveryCtrl', ModalInstanceDeliveryCtrl);

