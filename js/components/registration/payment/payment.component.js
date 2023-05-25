(function () {
    'use strict';

    function paymentController(api, $scope, $state, auth, core, restaurant, alertService, localStorageService, $rootScope) {

		if (!core.data.new_restaurant) {
            $state.go('subscription');
            return;
        }
		
        var that = this;
        that.isAdministratorEdit = ($state.includes('administrator.restaurantPayment') && (typeof localStorageService.get('restaurant_id') === 'object'));
        that.form = {};
        that.api = api;
        that.restaurant = core.data.new_restaurant;
        that.model = {};
        that.currYear = new Date().getFullYear().toString().slice(-2);

        $rootScope.card_number = "";
        $rootScope.exp_month = "";
        $rootScope.exp_year = "";
        $rootScope.cvc = "";
        $rootScope.first_name = "";
        $rootScope.last_name = "";
        $rootScope.billing_address = "";
        $rootScope.StripePaymentId = "";

        var restaurant_id = $state.params.id;
        //console.log("this is restaurantId", restaurant_id);
        if (that.isAdministratorEdit) {
            restaurant_id = localStorageService.get('restaurant_id').restaurant_id;
        }

        if (!core.data.new_restaurant && !restaurant_id && !that.isAdministratorEdit) {
            $state.go('registration');
            return;
        }

        if (!restaurant_id && that.isAdministratorEdit) {
            $state.go('administrator.menu');
            return;
        }
		
		if (!auth.authentication.isLogged) {
            $state.go('subscription');
            return;
        }

        var initModel = function () {
            that.model = {
//                number: core.data.new_restaurant ? core.data.new_restaurant.payment.number : null,
//                expiry: core.data.new_restaurant ? core.data.new_restaurant.payment.expiry : null,
////                expiration_year: core.data.new_restaurant ? core.data.new_restaurant.payment.expiration_year : null,
//                coupon_code: core.data.new_restaurant ? core.data.new_restaurant.payment.coupon_code : null,
//                first_name: core.data.new_restaurant ? core.data.new_restaurant.payment.first_name : null,
//                last_name: core.data.new_restaurant ? core.data.new_restaurant.payment.last_name : null,
//                zip: core.data.new_restaurant ? core.data.new_restaurant.payment.zip : null,
//                billing_address: core.data.new_restaurant ? core.data.new_restaurant.payment.billing_address : null,
//                cvc: core.data.new_restaurant ? core.data.new_restaurant.payment.cvc : null
            };
        };


        // get restaurant for edit, run if we direct going to this step or just after reloading page
        if (restaurant_id && auth.authentication.isLogged && !core.data.new_restaurant) {
            restaurant.set_to_edit(restaurant_id).then(function () {
                initModel();
            })
        } else {
            initModel();
        }

        that.submit = function (form) {
			if (!form.$valid) {
               alert("not valid");
                return
            }

            if (parseInt(restaurant_id)) {
                var m = {
                    subscription_type_id: core.data.new_restaurant.subscription_type_id,
                    pos_id: core.data.new_restaurant.pos_id,
                    // user_id: core.data.new_restaurant.user_id,
                    restaurant: {
                        restaurant_name: core.data.new_restaurant.restaurant.restaurant_name,
                        entity_type_id: core.data.new_restaurant.restaurant.entity_type_id,
                        address: core.data.new_restaurant.restaurant.address,
                        city_geoname_id: core.data.new_restaurant.restaurant.city_geoname_id,
                        logo_content_item_id: core.data.new_restaurant.restaurant.logo_content_item_id,
                        state_geoname_id: core.data.new_restaurant.restaurant.state_geoname_id,
                        zip: core.data.new_restaurant.restaurant.zip ? core.data.new_restaurant.restaurant.zip.toString() : null,
                        phone_number: core.data.new_restaurant.restaurant.phone_number
                                // pos_report_url: core.data.new_restaurant.restaurant.pos_report_url
                    },
                    payment: {
                        card_number: core.data.new_restaurant.payment.number,
                        expiration_month: $rootScope.exp_month,
                        expiration_year: $rootScope.exp_year,
                        coupon_code: core.data.new_restaurant.payment.coupon_code ? core.data.new_restaurant.payment.coupon_code.toString() : core.data.new_restaurant.payment.coupon_code,
                        first_name: core.data.new_restaurant.payment.first_name,
                        last_name: core.data.new_restaurant.payment.last_name,
                        zip: core.data.new_restaurant.payment.zip ? core.data.new_restaurant.payment.zip.toString() : null,
                        billing_address: core.data.new_restaurant.payment.billing_address,
                        cv_code: core.data.new_restaurant.payment.cvc
                    }
                };
                that.api.update_restaurant(m, restaurant_id).then(function (res) {
                    try {
                        if (res.data.data.code === 1000) {
                            alertService.showAlertSave();
                            console.log("this restaurant save response", res);
                            if (!that.isAdministratorEdit) {
                                setTimeout(function () {
                                    $state.go('invite', {id: restaurant_id});
                                }, 1000);
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            } 
			else {
				$scope.handleStripe = function (status, response) {
					if (response.error) {
						// Invalid card
						swal({
							title: "Invalid Card Details!",
							showConfirmButton: true,
							type: "warning"
						});
					} else {
						// got stripe token, now charge it
						that.api.payment_call({"response": response, 
												"type": core.data.new_restaurant.subscription_type_id, 
												"mode": 'live', 
												"pay_for": 'registration', 
												"cust_info": {restaurant_name: core.data.new_restaurant.restaurant.restaurant_name,
																subscription_type_id: core.data.new_restaurant.subscription_type_id}}).then(function (res) {
							if (res.data.data.payment == "done") {
								core.data.new_restaurant.restaurant.card_ok = true;
								$state.go('terms');
							}
							else if(res.data.data.payment == "error"){
								swal({
									title: "Check Card Details!",
									showConfirmButton: true,
									type: "warning"
								});
							}
							else{
								swal({
									title: "Oops! Something went wrong, please try again.",
									showConfirmButton: true,
									type: "warning"
								});
							}
						});
					}
				};
            }
        };

        that.back = function () {

            if (!that.isAdministratorEdit) {
                core.data.new_restaurant.payment.card_number = that.model.card_number;
                core.data.new_restaurant.payment.expiration_month = that.model.expiration_month;
                core.data.new_restaurant.payment.expiration_year = that.model.expiration_year;
                core.data.new_restaurant.payment.coupon_code = that.model.coupon_code;
                core.data.new_restaurant.payment.first_name = that.model.first_name;
                core.data.new_restaurant.payment.last_name = that.model.last_name;
                core.data.new_restaurant.payment.zip = that.model.zip;
                core.data.new_restaurant.payment.billing_address = that.model.billing_address;
                core.data.new_restaurant.payment.cv_code = that.model.cv_code;

                $state.go('restaurantProfile');

            } else {
                $state.go('administrator.restaurantProfile')
            }
        };
		
		

    }

    paymentController.$inject = ['api', '$scope', '$state', 'auth', 'core', 'restaurant', 'alertService', 'localStorageService', '$rootScope'];

    angular.module('inspinia').component('paymentComponent', {
        templateUrl: 'js/components/registration/payment/payment.html',
        controller: paymentController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();