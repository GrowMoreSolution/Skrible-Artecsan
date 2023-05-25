(function () {
    'use strict';

    var addUserInviteController = function (user, refbooks, $uibModalInstance, restaurant, modules) {

        var that = this;

        that.form = {};

        that.userTypes = refbooks.user_types;

        that.modules = modules;

        that.myGrantLevel = restaurant.data.info.grant_level;
        that.restaurantSubscriptionTypeId = restaurant.data.info.subscription_type_id;

        if (user) {
            if (user.permissions) {
                that.modules = user.permissions
            }
        }

        that.m = {
            email: user ? user.email : null,
            first_name: user ? user.first_name : null,
            last_name: user ? user.last_name : null,
            type_ids: user ? user.type_ids : null,
            is_disabled: user ? user.is_disabled : 1
        };

        that.roleFilter = function (user) {
			//console.log(user);
			if(user.id == 7 || user.id == 8 || user.id == 9 || user.id == 10){
				return false;
			}
            if (that.restaurantSubscriptionTypeId == 2 || that.restaurantSubscriptionTypeId == 6) {
                return user.subscription_type_id == 2 || user.subscription_type_id == 3 || that.restaurantSubscriptionTypeId == 6 || that.restaurantSubscriptionTypeId == 7
            }
            if (that.restaurantSubscriptionTypeId == 1 || that.restaurantSubscriptionTypeId == 5) {
                return user.subscription_type_id == 1 || user.subscription_type_id == 3 || that.restaurantSubscriptionTypeId == 5 || that.restaurantSubscriptionTypeId == 7
            }
            if (that.restaurantSubscriptionTypeId == 3 || that.restaurantSubscriptionTypeId == 7) {
                return user.subscription_type_id == 1 || user.subscription_type_id == 2 || user.subscription_type_id == 3 || user.subscription_type_id == 5 || user.subscription_type_id == 6 || user.subscription_type_id == 7
            }
            // return user.grant_level >= that.myGrantLevel;
        };

        that.grantLevelFilter = function (user) {
            return user.grant_level >= that.myGrantLevel;
        };

        that.add = function (form) {

            if (!form.$valid) {
                return
            }

            if (that.m.type_ids === 7) {
                that.m.permissions = that.modules
            }


            $uibModalInstance.close(that.m);

        };

        that.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

    };
	
	var qt = function ($uibModalInstance) {
        var that = this;
		that.pg_no = 1;
		
		that.q_title = ['Quick Tutorial #1 of 11',
						'Quick Tutorial #2 of 11',
						'Quick Tutorial #3 of 11',
						'Quick Tutorial #4 of 11',
						'Quick Tutorial #5 of 11',
						'Quick Tutorial #6 of 11',
						'Quick Tutorial #7 of 11',
						'Quick Tutorial #8 of 11',
						'Quick Tutorial #9 of 11',
						'Quick Tutorial #10 of 11',
						'Quick Tutorial #11 of 11'];
						
		that.q_texts = [
						"Thank you for signing up and giving Artecsan a try. The next few steps will provide you with tips and advice on what to expect throughout the setup process. Please note that you will be joining Artecsan through its open beta therefore you can expect to see constant changes, updates and upgrades.",
		
						"Artecsan free features allows your restaurant to cost out your menu, cost out recipes, track inventory usage, track purchases, item cost and more. With the click of a button, customers who use our system to order their inventory are able to track daily inventory usage, know exactly what they have on-hand, easily view purchase details and more",
						
						"Artecsan also includes a free inventory auditing platform that requires the use of a scale for improved accuracy. Artecsan helps restaurants to produce a highly accurate cost of goods sold percentage, easily identify which items you're losing money on and create your true budget based on cost and usage.",
						
						"There is only one requirement for Artecsan to work, it must receive data from your POS which it uses to make all its calculations. Most modern day POS systems are able to distribute itemized sales reports on a nightly basis via email. In the setup process we will provide you basic instruction on how to add Artecsan to your email distribution list in CSV format.",
						
						"Once connected, you will be able to see your data visually on Artecsan's free dashboard which lets you easily track sales, cost and more. Artecsan even allows you to create and send your inventory orders directly to your vendors so you only have to create your orders once.",
						
						"With Artecsan's FREE setup process you will have the option to self serve setup using our wizardry process that will take you from step by step or you may opt for our paid setup services. [Optional one-time setup fee of $499 liquor only, $699 food only or $999 both liquor and food].",
						
						"After completing the tutorial you will be taken to the user page where you will have the option to add additional users. From there you may begin the setup process. For food subscriptions you will begin by adding your food vendors, attaching each vendors inventory items that you use, applying the inventory items to recipes and attaching the recipes as menu items. Finally you will receive instructions on how to attach your POS followed by a questionnaire and then the final step of doing a full inventory audit.... setup complete!",
						
						"The same setup procedure will followed for alcohol. First add your vendor, then the items purchased from each vendor and use the items to create your recipes and bar menu. Next is a POS connection, a questionaire so we learn about your restaurant and finally a full inventory audit... Setup Complete!",
						
						"To make your setup as simple as possible we suggest assigning task. Kitchen manager should be given access to food setup and bar manager should be given access to bar setup. Because sales are automatically connected, Artecsan's day to day activity is low mainteanace and only requires that purchases be processed thru Artecsan",
						
						"Quick Notes: Multiple users can access and use Artecsan at once, there is no limit and we do not charge for more users. Artecsan is webbased so users can gain access from anywhere. A user may also have access to more than one restaurant, therefore if you own a small restaurant group, you may host all your restaurants with us for FREE!",

						"Note: Artecsan is new and we're always working to improve it. Over time you will see upgrades and improvement to all features. However, if you have any issues with the program or notice any problems, please contact us at admin@artecsan.com"
						];
		
        that.next = function () {
            that.pg_no = that.pg_no + 1;
			if(that.pg_no > 11){
				$uibModalInstance.dismiss('cancel');
			}
        };

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };

    function inviteController(api, $state, auth, core, $uibModal, alertService, restaurant, SweetAlert, $rootScope) {

        if (!auth.authentication.isLogged || !parseInt($state.params.id)) {
            $state.go('registration');
            return;
        }
		
        var that = this;
        that.form = {};
        that.api = api;
        that.usersList = [];
        that.typeIdSubscription = null;
        that.get_refbooks = [];

        that.api.get_modules({
            is_tree_mode: 1,
            subscription_type_id: $rootScope.subscription_type_id
        }).then(function (res) {
            that.modules_tree = res.data.data.modules_tree;
        });


        $rootScope.$on('restaurantSelected', function () {
            that.api.get_modules({
                is_tree_mode: 1,
                subscription_type_id: $rootScope.subscription_type_id
            }).then(function (res) {
                that.modules_tree = res.data.data.modules_tree;
            });
        });

        api.get_restaurant($state.params.id).then(function (res) {
            try {
                var restaurant_to_edit = res.data.data.restaurants_list[0];
                that.usersList = restaurant_to_edit.employees;
                that.typeIdSubscription = restaurant_to_edit.subscription_type_id;
				if(that.typeIdSubscription == null || that.typeIdSubscription == 4){
					$state.go('home');
				}
            } catch (e) {
                $state.go('home');
            }
        });


		
        that.$onInit = function () {
            core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
            });
        };

        that.userTypesFilter = function (type_id) {
            if (that.get_refbooks.user_types) {
                for (var i = 0; that.get_refbooks.user_types.length > i; i++) {
                    if (that.get_refbooks.user_types[i].id === type_id) {
                        return that.get_refbooks.user_types[i].name
                    }
                }
            }

        };

        that.delete = function ($index) {
            if (that.usersList[$index].id) {

                var m = {
                    user_type_id: that.usersList[$index].type_ids,
                    ids: [that.usersList[$index].id]
                };

                that.api.delete_invite(m).then(function (res) {
                    if (res.data.data.code === 1000) {
                        that.usersList.splice($index, 1)
                    }
                });

            } else {
                that.usersList.splice($index, 1)
            }
        };

		//Quick tutorial
		var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'quick_tutorial.html',
                controller: qt,
				controllerAs: 'qt',
				backdrop: 'static',
				keyboard: false
        });
		//Quick tutorial
		
		
        that.addUser = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'add-user-for-invite.html',
                controller: addUserInviteController,
                controllerAs: 'vm',
                resolve: {
                    user: function () {
                        return null
                    },
                    refbooks: that.get_refbooks,
                    modules: angular.copy(that.modules_tree)
                }
            });

            modalInstance.result.then(function (user) {
                if (user) {
                    that.usersList.push(user)
                }
            }, function () {

            });
        };

        that.editUser = function (user, $index) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'add-user-for-invite.html',
                controller: addUserInviteController,
                controllerAs: 'vm',
                resolve: {
                    user: function () {
                        return user
                    },
                    refbooks: that.get_refbooks,
                    modules: angular.copy(that.modules_tree)
                }
            });

            modalInstance.result.then(function (user) {
                if (user) {
                    that.usersList[$index] = user
                }
            }, function () {

            });
        };

        that.changeUserStatus = function (user, $index) {
            if (user.id) {
                SweetAlert.swal({
                        title: "Are you sure?",
                        text: "This user will be blocked and wouldn't be able work with this restaurant",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ed5565",
                        confirmButtonText: "Confirm"
                    },
                    function (res) {
                        if (res) {
                            var id = $state.params.id;
                            var m = {
                                employees: [{
                                    user_id: user.id,
                                    user_type_id: user.type_ids,
                                    is_disabled: user.is_disabled
                                }]
                            };

                            that.api.change_restaurant_employee_status(id, m).then(function (res) {

                            }, function (error) {
                                that.usersList[$index].is_disabled = user.is_disabled === 1 ? 0 : 1;
                            });
                        } else {
                            that.usersList[$index].is_disabled = user.is_disabled === 1 ? 0 : 1;
                        }
                    });
            }

        };

        that.sentInvitations = function (isExit) {
			if(that.typeIdSubscription == null || that.typeIdSubscription == 4){
				$state.go('home');
			}
			
            if (!that.usersList.length) {
				if(isExit){
					if (that.typeIdSubscription == 1 || that.typeIdSubscription == 5) {
						if(restaurant.data.info.grant_level == 4){
							$state.go('alcoholSetup.foodInventory');
						}
						else if(restaurant.data.info.grant_level < 4){
							$state.go('alcoholSetup.vendor');
						}
					} else {
						if(restaurant.data.info.grant_level == 4){
							$state.go('foodSetup.inventory');
						}
						else if(restaurant.data.info.grant_level < 4){
							$state.go('foodSetup.vendor');
						}
					}
				}
				else{
					alert('Please add users before sending invitations!');
					return;
				}
            }
			else{
				if(isExit){
					if (that.typeIdSubscription == 1 || that.typeIdSubscription == 5) {
						if(restaurant.data.info.grant_level == 4){
							$state.go('alcoholSetup.foodInventory');
						}
						else if(restaurant.data.info.grant_level < 4){
							$state.go('alcoholSetup.vendor');
						}
					} else {
						if(restaurant.data.info.grant_level == 4){
							$state.go('foodSetup.inventory');
						}
						else if(restaurant.data.info.grant_level < 4){
							$state.go('foodSetup.vendor');
						}
					}
				}
				else{
					var sentList = [];

					for (var i = 0; that.usersList.length > i; i++) {
						var u = {
							email: that.usersList[i].email,
							first_name: that.usersList[i].first_name,
							last_name: that.usersList[i].last_name,
							type_ids: [that.usersList[i].type_ids],
							is_disabled: that.usersList[i].is_disabled // confuse
						};

						if (that.usersList[i].permissions) {
							u.permissions = that.usersList[i].permissions
						}

						sentList.push(u)
					}

					var model = {
						users: sentList,
						restaurant_id: $state.params.id
					};

					that.api.users_invite(model).then(function (res) {
						if (res.data.data.code === 1000) {
							alertService.showSuccessText('Invitations were sent')
						}
						
						if (that.typeIdSubscription == 1 || that.typeIdSubscription == 5) {
							if(restaurant.data.info.grant_level == 4){
								$state.go('alcoholSetup.foodInventory');
							}
							else if(restaurant.data.info.grant_level < 4){
								$state.go('alcoholSetup.vendor');
							}
						} else {
							if(restaurant.data.info.grant_level == 4){
								$state.go('foodSetup.inventory');
							}
							else if(restaurant.data.info.grant_level < 4){
								$state.go('foodSetup.vendor');
							}
						}
					});
				}
			}
        };

        that.back = function () {
            $state.go('home');
        }

    }

    inviteController.$inject = ['api', '$state', 'auth', 'core', '$uibModal', 'alertService', 'restaurant', 'SweetAlert', '$rootScope'];

    angular.module('inspinia').component('inviteComponent', {
        templateUrl: 'js/components/registration/invite/invite.html',
        controller: inviteController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();