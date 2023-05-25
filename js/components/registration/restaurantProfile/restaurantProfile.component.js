(function () {
    'use strict';

    function restaurantProfileController(api, $state, $timeout, core, utils, restaurant, auth, SweetAlert, localStorageService) {

        var that = this;
        that.$state = $state;
        that.isAdministratorEdit = ($state.includes('administrator.restaurantProfile') && (typeof localStorageService.get('restaurant_id') === 'object'));
        that.form = {};
        that.api = api;
        that.auth = auth;
        that.$timeout = $timeout;
        that.restaurant = core.data.new_restaurant;
        that.get_refbooks = [];
        that.utils = utils;

        that.model = {};

        var initModel = function () {
            that.model = {
                restaurant_name: core.data.new_restaurant ? core.data.new_restaurant.restaurant.restaurant_name : null,
                entity_type_id: core.data.new_restaurant ? core.data.new_restaurant.restaurant.entity_type_id : null,
                address: core.data.new_restaurant ? core.data.new_restaurant.restaurant.address : null,
                city: core.data.new_restaurant ? core.data.new_restaurant.restaurant.city : null,
                state: core.data.new_restaurant ? core.data.new_restaurant.restaurant.state : null,
                zip: core.data.new_restaurant ? core.data.new_restaurant.restaurant.zip : null,
                // pos_report_url: core.data.new_restaurant ? core.data.new_restaurant.restaurant.pos_report_url : null,
                phone_number: core.data.new_restaurant ? core.data.new_restaurant.restaurant.phone_number : null
            };
        };

        var restaurant_id = $state.params.id;

        if (that.isAdministratorEdit) {
            restaurant_id = localStorageService.get('restaurant_id').restaurant_id;
        }

        if (!core.data.new_restaurant && !restaurant_id && !that.isAdministratorEdit) {
            $state.go('subscription');
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

		that.subscription_type_id = null;
		if(!that.isAdministratorEdit){
			that.subscription_type_id = core.data.new_restaurant.subscription_type_id;
			//core.data.new_restaurant.restaurant.card_ok = false;
		}
		
        that.submit = function (form) {
            if (!form.$valid) {
                return
            }

            if (!core.data.new_restaurant.restaurant.city_geoname_id || !core.data.new_restaurant.restaurant.state_geoname_id) {

                SweetAlert.swal({
                    title: 'Please select City or State from autocomplete menu'
                });
                return
            }

            core.data.new_restaurant.restaurant.restaurant_name = that.model.restaurant_name;
            core.data.new_restaurant.restaurant.entity_type_id = that.model.entity_type_id;
            core.data.new_restaurant.restaurant.address = that.model.address;
            core.data.new_restaurant.restaurant.city = that.model.city;
            core.data.new_restaurant.restaurant.state = that.model.state;
            core.data.new_restaurant.restaurant.zip = that.model.zip;
            core.data.new_restaurant.restaurant.phone_number = that.model.phone_number;
            // core.data.new_restaurant.restaurant.pos_report_url = that.model.pos_report_url;
            //console.log("this is registration model",that.model);
            if (!that.isAdministratorEdit) {
				if(that.subscription_type_id == 1 || that.subscription_type_id == 2 || that.subscription_type_id == 3 || that.subscription_type_id == 4){
					$state.go('terms');
				}
				else{
					$state.go('payment');
				}
            } else {
                $state.go('administrator.restaurantPayment');
            }
        };

        that.back = function () {

            if (!that.isAdministratorEdit) {
                core.data.new_restaurant.restaurant.restaurant_name = that.model.restaurant_name;
                core.data.new_restaurant.restaurant.entity_type_id = that.model.entity_type_id;
                core.data.new_restaurant.restaurant.address = that.model.address;
                core.data.new_restaurant.restaurant.city = that.model.city;
                core.data.new_restaurant.restaurant.state = that.model.state;
                core.data.new_restaurant.restaurant.zip = that.model.zip;
                core.data.new_restaurant.restaurant.phone_number = that.model.phone_number;
                // core.data.new_restaurant.restaurant.pos_report_url = that.model.pos_report_url;

                $state.go('registration');
            } else {
                $state.go('administrator.menu')
            }
        };

        that.$onInit = function () {
            core.getRefbooks().then(function (res) {
                that.get_refbooks = res;
                // get restaurant for edit, run if we can direct going to this step or just after reloading page
                if (restaurant_id && auth.authentication.isLogged && !core.data.new_restaurant) {
                    restaurant.set_to_edit(restaurant_id).then(function () {
                        initModel();
                        that.onZipChanged();
                    })
                } else {
                    initModel();
                    if (core.data.new_restaurant) {
                        that.onZipChanged();
                    }
                }
            });
        };

        that.get_location = function (val, type) {
            if (val.length < 3)
                return;
            return that.api.locations_lookup({search_for: val}).then(function (response) {
                return response.data.data.locations.filter(function (currentValue, index) {
                    return currentValue.type_id === parseInt(type)
                })
            });
        };

        that.selectCity = function (item) {
            core.data.new_restaurant.restaurant.city_geoname_id = item.geoname_id
        };

        that.selectState = function (item) {
            core.data.new_restaurant.restaurant.state_geoname_id = item.geoname_id
        };

        that.onZipChanged = function () {

            if (that.timer) {
                that.$timeout.cancel(that.timer);
            }

            that.timer = that.$timeout(function () {
                var zip = that.model.zip;

                if (zip) {
                    that.api.locations_lookup({search_for: zip.toString()}).then(function (response) {

                        if (response.data.data.locations.length) {
                            that.model.city = response.data.data.locations[0].clear_name;
                            core.data.new_restaurant.restaurant.city_geoname_id = response.data.data.locations[0].geoname_id;
                            core.data.new_restaurant.restaurant.state_geoname_id = response.data.data.locations[0].state_geoname_id;

                            for (var i = 0; that.get_refbooks.country_states.length > i; i++) {
                                if (response.data.data.locations[0].state_geoname_id === that.get_refbooks.country_states[i].geoname_id) {
                                    that.model.state = that.get_refbooks.country_states[i].state;
                                    that.form.zip.$setValidity('zip', true);
                                    break
                                }
                            }
                        } else {
                            that.form.zip.$setValidity('zip', false);
                            that.model.city = '';
                            that.model.state = '';
                            core.data.new_restaurant.restaurant.city_geoname_id = null;
                            core.data.new_restaurant.restaurant.state_geoname_id = null;
                        }


                    },
                            function (error) {
                                console.log('error');
                            });
                } else {
                    that.form.zip.$setValidity('zip', false);
                    that.model.city = '';
                    that.model.state = '';
                    core.data.new_restaurant.restaurant.city_geoname_id = null;
                    core.data.new_restaurant.restaurant.state_geoname_id = null;
                }
            }, 300);
        };

        // TODO still unused
        that.saveProfile = function (form) {


            if (!form.$valid || !parseInt(restaurant_id)) {
                return
            }

            var m = {
                // subscription_type_id: core.data.new_restaurant.subscription_type_id,
                pos_id: core.data.new_restaurant.pos_id,
                restaurant: {
                    restaurant_name: core.data.new_restaurant.restaurant.restaurant_name,
                    entity_type_id: core.data.new_restaurant.restaurant.entity_type_id,
                    address: core.data.new_restaurant.restaurant.address,
                    city_geoname_id: core.data.new_restaurant.restaurant.city_geoname_id,
                    logo_content_item_id: core.data.new_restaurant.restaurant.logo_content_item_id,
                    state_geoname_id: core.data.new_restaurant.restaurant.state_geoname_id,
                    zip: core.data.new_restaurant.restaurant.zip ? core.data.new_restaurant.restaurant.zip.toString() : null,
                    phone_number: core.data.new_restaurant.restaurant.phone_number
                            // pos_report_url: core.data.new_restaurant.restaurant.pos_report_url,
                },
                // payment: {
                //     card_number: core.data.new_restaurant.payment.card_number,
                //     expiration_month: core.data.new_restaurant.payment.expiration_month,
                //     expiration_year: core.data.new_restaurant.payment.expiration_year,
                //     coupon_code: core.data.new_restaurant.payment.coupon_code ? core.data.new_restaurant.payment.coupon_code.toString() : core.data.new_restaurant.payment.coupon_code,
                //     first_name: core.data.new_restaurant.payment.first_name,
                //     last_name: core.data.new_restaurant.payment.last_name,
                //     zip: core.data.new_restaurant.payment.zip ? core.data.new_restaurant.payment.zip.toString() : null,
                //     billing_address: core.data.new_restaurant.payment.billing_address,
                //     cv_code: core.data.new_restaurant.payment.cv_code
                // }
            };
            that.api.update_restaurant(m, restaurant_id).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        alertService.showAlertSave();
                        if (!that.isAdministratorEdit) {
                            setTimeout(function () {
                                $state.go('invite', {id: restaurant_id});
                            }, 1000);
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            });
        };
    }

    restaurantProfileController.$inject = ['api', '$state', '$timeout', 'core', 'utils', 'restaurant', 'auth', 'SweetAlert', 'localStorageService'];

    angular.module('inspinia').component('restaurantProfileComponent', {
        templateUrl: 'js/components/registration/restaurantProfile/restaurantProfile.html',
        controller: restaurantProfileController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();