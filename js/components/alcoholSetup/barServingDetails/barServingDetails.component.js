(function () {

    'use strict';

	var qt = function ($uibModalInstance) {
        var that = this;
		
		that.q_title = 'Bar Serving Details Instructions';
						
		that.q_texts = '<article style="display: block;"><p><b>Bar Serving Details</b> – Having a standard serving amount is extremely important. By knowing this data we Artecsan can help make your setup easier and analyze budgets with more insight</p></article>';

        that.skip = function () {
            $uibModalInstance.dismiss('cancel');
        }
    };
	
    function controller(api, $state, auth, localStorageService, $rootScope, restaurant, core,$scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;

        that.form = {};
        that.$state = $state;
        that.core = core;
        that.api = api;
        that.auth = auth;

        that.m = {};


        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        $rootScope.$on('restaurantSelected', function () {
            that.permissions = restaurant.data.permissions;
        });
		
		$scope.SetUpStatus=0;
		if(restaurant.data.info){
			$scope.SetUpStatus = restaurant.data.info.is_setup_completed;
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
		
        that.next = function (form) {

            if (!form.$valid) return;

            var m = {
                restaurant_id: that.restaurant_id.restaurant_id,
                serving_details: []
            };

            for (var key in that.m) {
                m.serving_details.push({
                    serving_type_id: key,
                    quantity: that.m[key]
                })
            }

            that.api.save_bar_serving_details(m).then(function (res) {
                try {
                    if (res.data.data.code === 1000) {
                        that.$state.go('alcoholSetup.menu')
                    }
                } catch (e) {
                    console.log(e)
                }
            });

        };

        that.$onInit = function () {
            var resId = that.restaurant_id.restaurant_id;
            that.api.bar_serving_details(resId).then(function (res) {

                try {
                    var db = res.data.data.bar_servings.serving_details;
                    angular.forEach(db, function (v, k) {
                        that.m[v.serving_type_id.toString()] = v.quantity
                    });
                } catch (e) {
                    console.log(e);
                }

            });
            that.core.getRefbooks().then(function (res) {
                that.bar_serving_details_types = res.bar_serving_details_types;
            });
        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', 'restaurant', 'core','$scope'];

    angular.module('inspinia').component('barServingDetails', {
        templateUrl: 'js/components/alcoholSetup/barServingDetails/barServingDetails.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();