(function () {

    "use strict";

    var restaurant = function (api, auth, $q, $injector, $rootScope, localStorageService) {

        var data = {
            info: null,
            permissions: null
        };

        var set_restaurant = function (id) {

            var deferred = $q.defer();

            if (!id) {
                data.info = null;
                data.permissions = null;
                deferred.resolve();
                $rootScope.restaurant_id = null;
                return deferred.promise;
            }

            api.get_restaurant(id).then(function (res1) {

                api.set_active_restaurant({restaurant_id: id}).then(function (res) {
                    try {
                        data.info = res1.data.data.restaurants_list[0];
                        data.permissions = res.data.data.permissions;
                        deferred.resolve(data.info);
                        $rootScope.$emit('restaurantSelected');
                        localStorageService.set('restaurant_id', {
                            restaurant_id: id
                        });
                    } catch (e) {
                        console.log(e);
                        deferred.reject()
                    }
                }, function (error) {
                    deferred.reject();
                });
            }, function (error) {
                deferred.reject();
            });

            return deferred.promise;
        };


        var set_to_edit = function (id) {

            var deferred = $q.defer();

            var core = $injector.get('core');

            api.get_restaurant(id).then(function (res) {

                var restaurant_to_edit = res.data.data.restaurants_list[0];

                if (restaurant_to_edit) {
                    core.data.new_restaurant = {
                        user_id: auth.authentication.user.id,
                        subscription_type_id: restaurant_to_edit.subscription_type_id,
                        pos_id: restaurant_to_edit.pos_id,
                        user: {
                            first_name: null,
                            last_name: null,
                            email: null,
                            phone_number: null,
                            password: null,
                            password_confirm: null
                        },
                        restaurant: {
                            restaurant_name: restaurant_to_edit.restaurant_name,
                            entity_type_id: restaurant_to_edit.entity_type_id,
                            address: restaurant_to_edit.address,
                            city: null,
                            state: null,
                            zip: restaurant_to_edit.zip,
                            city_geoname_id: restaurant_to_edit.city_geoname_id,
                            state_geoname_id: restaurant_to_edit.state_geoname_id,
                            pos_report_url: restaurant_to_edit.pos_report_url,
                            phone_number: restaurant_to_edit.phone_number
                        },
                        payment: {
                            // TODO fake data need while server api can't give us real data, delete later
                            card_number: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.card_number : '12345678912345',
                            expiration_month: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.expiration_month : 12,
                            expiration_year: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.expiration_year : 19,
                            coupon_code: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.coupon_code : '12345',
                            first_name: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.first_name : 'first name',
                            last_name: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.last_name : 'last name',
                            zip: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.zip : 10001,
                            billing_address: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.billing_address : 'billing address',
                            cv_code: restaurant_to_edit.service_payment ? restaurant_to_edit.service_payment.cv_code : 405
                        }
                    };

                    deferred.resolve(data.info);
                } else {
                    deferred.reject(data.info);
                }
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };


        return {
            data: data,
            set_to_edit: set_to_edit,
            set_restaurant: set_restaurant
        };
    };

    restaurant.$inject = ['api', 'auth', '$q', '$injector', '$rootScope', 'localStorageService'];
    angular.module('inspinia').factory('restaurant', restaurant);

})();