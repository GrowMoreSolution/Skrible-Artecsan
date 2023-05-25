(function () {
    'use strict';

    var addUserInviteController = function (api, localStorageService, who, user, refbooks, modules, $uibModalInstance, alertService, restaurant) {

        var that = this;

        that.form = {};

        that.userTypes = refbooks.user_types;

        that.modules = modules;
        that.myGrantLevel = restaurant.data.info.grant_level;
        that.restaurantSubscriptionTypeId = restaurant.data.info.subscription_type_id;
        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

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
			if(who.userid !== 1){
				if(who.user_type_id == 10){
					if(user.id == 7 || user.id == 8){
						return false;
					}
				}
				else{
					if(user.id == 7 || user.id == 8 || user.id == 9 || user.id == 10){
						return false;
					}
				}
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

            api.check_if_employee_exists(that.restaurant_id.restaurant_id+'&'+that.m.email).then(function (res) {
                try {
                  if(res.data.data.does_exist.does_exist[0].emp_exists == 'true'){
                      alertService.showError('User already exists');
                      return;
                  }
                  else {
                    if (that.m.type_ids === 7) {
                        that.m.permissions = that.modules
                    }

                    $uibModalInstance.close(that.m);
                  }
                } catch (e) {
                    console.log("error");
                }
            });

        };

        that.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

    };

    function inviteController(api, $state, auth, core, $uibModal, alertService, SweetAlert, localStorageService, restaurant, $rootScope) {

        if (!auth.authentication.isLogged) {
            $state.go('login');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.usersList = [];
        that.typeIdSubscription = null;
        that.get_refbooks = [];
        that.authenticationUserId = auth.authentication.user.id;

        that.api.get_modules({
            is_tree_mode: 1,
            subscription_type_id: $rootScope.subscription_type_id
        }).then(function (res) {
            that.modules_tree = res.data.data.modules_tree;
        });

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }
        $rootScope.$on('restaurantSelected', function () {
            that.api.get_modules({
                is_tree_mode: 1,
                subscription_type_id: $rootScope.subscription_type_id
            }).then(function (res) {
                that.modules_tree = res.data.data.modules_tree;
            });
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        api.get_restaurant(that.restaurant_id.restaurant_id).then(function (res) {
            try {
                var restaurant_to_edit = res.data.data.restaurants_list[0];
                that.usersList = restaurant_to_edit.employees || [];
				that.checkEmpType();
                that.typeIdSubscription = restaurant_to_edit.subscription_type_id;
            } catch (e) {
                $state.go('home');
            }
        });
		
		that.checkEmpType = function () {
			var emps = that.usersList;
			that.user = {userid: null, user_type_id: null};
			that.user.userid = that.authenticationUserId;
			if(that.user.userid != 1){
				for (var i = 0; emps.length > i; i++) {
					if(emps[i].id == that.user.userid){
						that.user.user_type_id = emps[i].type_ids;
						break;
					}
				}
			}
		}
		
		
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

        that.delete = function ($index, user) {
            if (that.usersList[$index].id) {

                SweetAlert.swal({
                        title: "Are you sure?",
                        text: "This user will be deleted from this restaurant",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ed5565",
                        confirmButtonText: "Confirm"
                    },
                    function (res) {
                        if (res) {
                            var m = {
                                user_type_id: user.type_ids,
                                user_id: user.id
                            };

                            that.api.delete_invite(that.restaurant_id.restaurant_id, m).then(function (res) {
                                if (res.data.data.code === 1000) {
                                    that.usersList.splice($index, 1)
                                }
                            });
                        }
                    });

            } else {
                that.usersList.splice($index, 1)
            }
        };

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
					who: that.user,
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
                            var id = that.restaurant_id.restaurant_id;
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

            if (!that.usersList.length) {
                alert('Please add users before sending');
                return
            }

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
                restaurant_id: that.restaurant_id.restaurant_id
            };

            that.api.users_invite(model).then(function (res) {
                if (res.data.data.code === 1000) {
                    alertService.showSuccessText('Invitations were sent')
                }
                if (!isExit) {
					$state.go('admin.homeMenu');
                } else {
                    $state.go('home');
                }
            })

        };

    }

    inviteController.$inject = ['api', '$state', 'auth', 'core', '$uibModal', 'alertService', 'SweetAlert', 'localStorageService', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('adminInviteComponent', {
        templateUrl: 'js/components/administrator/invite/invite.html',
        controller: inviteController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
