(function () {
    'use strict';
	
	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Order Schedule Instructions';
						
		that.q_texts = '<article style="display: block;"><p><b>Order schedule</b> – For users who upgrade to our Machine Learning you can tell Artecsan what days you like to order and which category of items. On those designated days Artecsan will make a suggestion of what items to order and how much. Just select the vendor name, category and the days you prefer to generate your orders for each category.</p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };

    function deliverySetupController(api, $state, auth, localStorageService, $uibModal, core, alertService, SweetAlert, $rootScope, restaurant) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.core = core;
        that.auth = auth;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        if (restaurant.data.info) {
            that.isCompleted = restaurant.data.info.is_setup_completed;
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
            that.isCompleted = restaurant.data.info.is_setup_completed;
        });
		
		that.sub_type = restaurant.data.info.subscription_type_id;
		for (var i in restaurant.data.info.employees) {
			if(restaurant.data.info.employees[i].id == auth.authentication.user.id){
				that.emp_id = restaurant.data.info.employees[i].type_ids;
			}
		}
		
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

        that.getAllDeliveries = function () {
            that.api.delivery_schedules({inventory_type_id: 1}).then(function (res) {
                try {
                    that.deliveries = res.data.data.delivery_schedules_list;
					
					for(var c in that.categories){
						if(that.categories[c].category != 'Non Alcoholic'){
							var found_d = false;
							for(var d in that.deliveries){
								if(that.deliveries[d].vendor_category_id == that.categories[c].id){
									found_d = true;
									break;
								}							
							}
							if(!found_d){
								that.deliveries.push({
									category: that.categories[c].category,
									vendor_category_id: that.categories[c].id,
									is_on_sunday: 0,
									is_on_monday: 0,
									is_on_tuesday: 0,
									is_on_wednesday: 0,
									is_on_thursday: 0,
									is_on_friday: 0,
									is_on_saturday: 0
								});
							}
						}
					}
                } catch (e) {

                }
            });
        };

		that.saveAllDeliveries = function (form) {
			if (!form.$valid) {
				return
			}

			var m = {
				inventory_type_id: 1,
				deliveries: []
			};
	
			for(var d in that.deliveries){
				m.deliveries.push(that.deliveries[d]);						
			}
						
			that.api.save_delivery(m).then(function (res) {
				try {
					if (res.data.data.code === 1000) {
						alertService.showAlertSave();
						that.getAllDeliveries();
					}
				} catch (e) {
					alertService.showError('Something went wrong!');
					console.log(e)
				}
			});
		}
		
		that.$onInit = function () {
			Promise.all([api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 1})]).then(function(response) {
				that.categories = response[0].data.data.categories;
				that.getAllDeliveries();
			});
        };
    }

    deliverySetupController.$inject = ['api', '$state', 'auth', 'localStorageService', '$uibModal', 'core', 'alertService', 'SweetAlert', '$rootScope', 'restaurant'];

    angular.module('inspinia').component('deliverySetupComponent', {
        templateUrl: 'js/components/foodSetup/deliverySetup/deliverySetup.html',
        controller: deliverySetupController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();