(function () {
    'use strict';

    var subscriptionContactUs = function ($uibModalInstance, api, alertService) {

        var that = this;

        that.form = {};

        that.m = {
            email: null,
            first_name: null,
            last_name: null,
            phone_number: null,
            message: null
        };

        that.contactUs = function (form) {

            if (!form.$valid) {
                return
            }

            var m = {
                first_name: that.m.first_name,
                last_name: that.m.last_name,
                phone_number: that.m.phone_number,
                email: that.m.email,
                message: that.m.message
            };

            api.contact_us(m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        alertService.successfullySent('Successfully sent');
                        that.close();
                    }
                } catch (e) {
                    console.log(e);
                }
            }, function (e) {
                console.log(e);
            })

        };

        that.close = function () {
            $uibModalInstance.dismiss('cancel');
        }

    };

	var qt = function ($uibModalInstance, promo_URL, promo_URL_alt) {
        var that = this;
		that.promo_URL = promo_URL;
		that.promo_URL_alt = promo_URL_alt;
		
		//that.q_title = 'Title';
		//that.q_texts = that.promo_URL + " " + that.promo_URL_alt;
        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
    function subscriptionController(api, $state, auth, core, $uibModal, restaurant, appConfig) {

        var that = this;
        that.auth = auth;

        /*if (!core.data.new_restaurant && !$state.params.id) {
            $state.go('registration');
        }*/
		
		that.model = {};

        var initModel = function () {
            that.model = {
                user_id: auth.authentication.isLogged ? auth.authentication.user.id : null,
                subscription_type_id: core.data.new_restaurant ? core.data.new_restaurant.subscription_type_id : null,
                pos_id: core.data.new_restaurant ? core.data.new_restaurant.pos_id : null,
                user: {
                    first_name: core.data.new_restaurant ? core.data.new_restaurant.user.first_name : null,
                    last_name: core.data.new_restaurant ? core.data.new_restaurant.user.last_name : null,
                    email: core.data.new_restaurant ? core.data.new_restaurant.user.email : null,
                    phone_number: core.data.new_restaurant ? core.data.new_restaurant.user.phone_number : null,
                    password: core.data.new_restaurant ? core.data.new_restaurant.user.password : null,
                    password_confirm: core.data.new_restaurant ? core.data.new_restaurant.user.password_confirm : null
                },
                restaurant: {
                    restaurant_name: core.data.new_restaurant ? core.data.new_restaurant.restaurant.restaurant_name : null,
                    entity_type_id: core.data.new_restaurant ? core.data.new_restaurant.restaurant.entity_type_id : null,
                    address: core.data.new_restaurant ? core.data.new_restaurant.restaurant.address : null,
                    city: core.data.new_restaurant ? core.data.new_restaurant.restaurant.city : null,
                    state: core.data.new_restaurant ? core.data.new_restaurant.restaurant.state : null,
                    zip: core.data.new_restaurant ? core.data.new_restaurant.restaurant.zip : null,
                    city_geoname_id: core.data.new_restaurant ? core.data.new_restaurant.restaurant.city_geoname_id : null,
                    state_geoname_id: core.data.new_restaurant ? core.data.new_restaurant.restaurant.state_geoname_id : null,
                    phone_number: core.data.new_restaurant ? core.data.new_restaurant.restaurant.phone_number : null
                },
                payment: {
                    card_number: core.data.new_restaurant ? core.data.new_restaurant.payment.card_number : null,
                    expiration_month: core.data.new_restaurant ? core.data.new_restaurant.payment.expiration_month : null,
                    expiration_year: core.data.new_restaurant ? core.data.new_restaurant.payment.expiration_year : null,
                    coupon_code: core.data.new_restaurant ? core.data.new_restaurant.payment.coupon_code : null,
                    first_name: core.data.new_restaurant ? core.data.new_restaurant.payment.first_name : null,
                    last_name: core.data.new_restaurant ? core.data.new_restaurant.payment.last_name : null,
                    zip: core.data.new_restaurant ? core.data.new_restaurant.payment.zip : null,
                    billing_address: core.data.new_restaurant ? core.data.new_restaurant.payment.billing_address : null,
                    cv_code: core.data.new_restaurant ? core.data.new_restaurant.payment.cv_code : null
                }
            };
        };

        // get restaurant for edit, run if we can direct going to this step or just after reloading page
        if ($state.params.id && auth.authentication.isLogged && !core.data.new_restaurant) {
            restaurant.set_to_edit($state.params.id).then(function () {
                initModel()
            }, function () {
                $state.go('home');
            })
        } else {
            // Just create model, with empty values, for not logged users or
            initModel();
        }

        that.subscriptions = [];
		
		core.data.new_restaurant = that.model;
        that.restaurant = core.data.new_restaurant;
		
        //var isEdit = core.data.new_restaurant ? true : false;
		var isEdit = false;
		
        // get restaurant for edit, run if we can direct going to this step or just after reloading page
        if ($state.params.id && auth.authentication.isLogged && !core.data.new_restaurant) {
            restaurant.set_to_edit($state.params.id).then(function () {
                that.restaurant = core.data.new_restaurant;
                isEdit = true;
            })
        }

        core.getSettings().then(function (res) {
            that.settings = core.data.settings;
        });

        /*if (!core.data.new_restaurant && !that.auth.authentication.isLogged) {
            $state.go('registration');
            return;
        }*/

		that.moreDetails = function () {
			alert("details");

		}
		
        that.contactUsPopup = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'contact_us.html',
                controller: subscriptionContactUs,
                controllerAs: 'vm'
            });

            modalInstance.result.then(function () {
                if (that.auth.authentication.isLogged) {
                    $state.go('home');
                }
            }, function () {

            });
        };

        that.$onInit = function () {
            api.rb_subscriptions().then(function (res) {
                that.subscriptions = res.data.data.subscriptions;
				//that.subscriptions.unshift(that.subscriptions.pop());
  
                // if user is not logged, then set him default subscription_type_id (price plan)
                if (!that.auth.authentication.isLogged) {
                    that.restaurant.subscription_type_id = that.restaurant.subscription_type_id ? that.restaurant.subscription_type_id : that.subscriptions[4].subscription_id;
                }
				
				//check has promo flag to display custom promo popups
				//for now just check for presence of has_promo; but later can check for specific sub types
				var show_setup_promo = false;
				for(var s in that.subscriptions){
					if(that.subscriptions[s].has_promo == 1){
						show_setup_promo = true;
						break;
					}
				}
				
				//promo popup
				if(show_setup_promo){
					api.get_promo_ref().then(function (res) {
						that.pr_ref = res.data.data.promo_ref;
						that.base_api_url = appConfig.apiDomain;
						that.promo_ref_url = that.base_api_url + that.pr_ref.setup_promo;
						var modalInstance = $uibModal.open({
							animation: true,
							templateUrl: 'promo_container.html',
							controller: qt,
							controllerAs: 'qt',
							windowClass: "animated fadeIn modal-lgg",
							size: 'md',
							resolve: {
								promo_URL: function () {
									return that.promo_ref_url;
								},
								promo_URL_alt: function () {
									return 'For Setup Promo, email sales@skrible.co';
								}
							}
						});
					});
				}
				//
            });
        };

        that.back = function () {
			$state.go('login');
        };

        that.select = function (subscription, is_sign_up) {
            if (subscription) {
                that.restaurant.subscription_type_id = subscription.subscription_id;
            } else {
                that.restaurant.subscription_type_id = 0;
            }

            if (is_sign_up && that.restaurant.subscription_type_id !== 0) {
                core.data.new_restaurant.subscription_type_id = that.restaurant.subscription_type_id;
                if (auth.authentication.isLogged) {
                    if (isEdit) {
                        $state.go('restaurantProfile', {id: $state.params.id});
                    } else {
                        $state.go('registration');
                    }
                } else {
                    $state.go('registration');
                }
            }
        };
    }

    subscriptionController.$inject = ['api', '$state', 'auth', 'core', '$uibModal', 'restaurant', 'appConfig'];

    angular.module('inspinia').component('subscriptionComponent', {
        templateUrl: 'js/components/registration/subscription/subscription.html',
        controller: subscriptionController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();