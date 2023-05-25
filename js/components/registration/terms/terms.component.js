(function () {
    'use strict';

    function termsController(api, $state, core, alertService, SweetAlert, restaurant, localStorageService, $rootScope) {

        if (!core.data.new_restaurant) {
            $state.go('subscription');
            return;
        }

        var that = this;
        that.form = {};
        that.api = api;
        that.agree = false;
        that.restaurant = core.data.new_restaurant;
        that.inRequest = false;

		that.subscription_type_id = core.data.new_restaurant.subscription_type_id;
		
		if(that.subscription_type_id == 5 || that.subscription_type_id == 6 || that.subscription_type_id == 7){
			if(!core.data.new_restaurant.restaurant.card_ok){
				$state.go('subscription');
				return;
			}
		}
		
        that.submit = function (form) {

            if (!form.$valid) {
                return
            }

            that.inRequest = true;

            var m = {
                subscription_type_id: core.data.new_restaurant.subscription_type_id,
                pos_id: core.data.new_restaurant.pos_id,
                user_id: core.data.new_restaurant.user_id,
                restaurant: {
                    restaurant_name: core.data.new_restaurant.restaurant.restaurant_name,
                    entity_type_id: core.data.new_restaurant.restaurant.entity_type_id,
                    address: core.data.new_restaurant.restaurant.address,
                    city_geoname_id: core.data.new_restaurant.restaurant.city_geoname_id,
                    logo_content_item_id: core.data.new_restaurant.restaurant.logo_content_item_id,
                    state_geoname_id: core.data.new_restaurant.restaurant.state_geoname_id,
                    zip: core.data.new_restaurant.restaurant.zip,
                    phone_number: core.data.new_restaurant.restaurant.phone_number
                            // pos_report_url: core.data.new_restaurant.restaurant.pos_report_url
                },
                payment: {
                    card_number: $rootScope.card_number,
                    expiration_month: $rootScope.exp_month,
                    expiration_year: $rootScope.exp_year,
                    coupon_code: core.data.new_restaurant.payment.coupon_code,
                    first_name: $rootScope.first_name,
                    last_name: $rootScope.last_name,
                    zip: core.data.new_restaurant.payment.zip,
                    billing_address: $rootScope.billing_address,
                    cv_code: $rootScope.cvc
                }
            };
            
            that.api.create_restaurant(m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        // set current restaurant
						SweetAlert.swal({
							title: "",
							type: "success",
							text: "Congratulations your restaurant was created!.",
							confirmButtonColor: "#337ab7",
							confirmButtonText: "OK"
						},
						function (res1) {
							if (res1) {
								restaurant.set_restaurant(res.data.data.id).then(function () {
									if(that.subscription_type_id == 4){
										$state.go('administrator.posSync');
									}
									else{
										$state.go('invite', {id: res.data.data.id});
									}
								});
							}
							else{
								restaurant.set_restaurant(res.data.data.id).then(function () {
									if(that.subscription_type_id == 4){
										$state.go('administrator.posSync');
									}
									else{
										$state.go('invite', {id: res.data.data.id});
									}
								});
							}
							return;
						});
                    }
                    that.inRequest = false;
                } catch (e) {
                    console.log(e);
                    that.inRequest = false;
                }
            }, function (error) {
                that.inRequest = false;
            });

        };


        that.back = function () {
			if(that.subscription_type_id == 5 || that.subscription_type_id == 6 || that.subscription_type_id == 7){
				$state.go('payment');
			}
			else {
				$state.go('restaurantProfile');
			}
        };

        that.$onInit = function () {
			SweetAlert.swal({
				title: "",
				text: "Please note that Skrible’s Compset report recently launched in December 2018. For this reason, your restaurant may be the first within its compset to sign up. In order to provide you with data, we must have at least 2 restaurants within the same category. We ask that you continue with your setup and if you are the first restaurant within your compset, we will immediately notify you once a second restaurant in your category has joined. In order to proceed simply scroll down, check the accept button then start your services.",
				confirmButtonColor: "#337ab7",
				confirmButtonText: "OK"
			},
			function (res) {
				if (res) {
					core.getSettings().then(function (res) {
						that.settings = res;
					});
				}
				else{
					core.getSettings().then(function (res) {
						that.settings = res;
					});
				}
				return;
			});
        }

    }

    termsController.$inject = ['api', '$state', 'core', 'alertService', 'SweetAlert', 'restaurant', 'localStorageService', '$rootScope'];

    angular.module('inspinia').component('termsComponent', {
        templateUrl: 'js/components/registration/terms/terms.html',
        controller: termsController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();