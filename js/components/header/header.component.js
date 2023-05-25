(function () {

    'use strict';

    function headerController(api, core, auth, $q, $state, restaurant, $rootScope) {

        var that = this;
        that.isAuth = auth.authentication.isLogged;
		that.restaurantService = restaurant;
		that.state = $state;
		that.m = {
            order_by: "name",
            order_way: "ASC",  //ASC/DESC
            paginationOffset: 0, // 0 by default
            search_by: null
        };

		that.get_restaurants_list = function () {
			var deferred = $q.defer();
			if(that.isAuth){
				var m = {
					order_by: that.m.order_by,
					order_way: that.m.order_way,
					paginationOffset: that.m.paginationOffset
				};

				api.get_restaurants(m).then(function (res) {
					try {
						that.rest_list = res.data.data.restaurants_list;
						that.rest_list.unshift({id: -1, restaurant_name: '--Compare Restaurants--'});
					} catch (e) {
						console.log(e);
					}
					deferred.resolve();
				}, function (e) {
					console.log(e);
					deferred.resolve();
				});
			}
			else{
				deferred.resolve();
			}
            
			return deferred.promise;
        };
		
		that.selectRestaurant = function (go_to_restaurant) {
			try{
				if(go_to_restaurant == restaurant.data.info.id){
					return;
				}
				else{
					if(go_to_restaurant == -1){
						restaurant.data.info.id = -1;
						$state.go('compareRestaurants');
						return;
					}
					else{
						go_to_restaurant = that.rest_list.filter(function(x){return x.id == go_to_restaurant})[0];
						that.restaurantService.set_restaurant(go_to_restaurant.id).then(function (res) {
							$rootScope.restaurant_id = go_to_restaurant.id;
							$rootScope.subscription_type_id = go_to_restaurant.subscription_type_id;
							$state.go('admin.homeMenu', {}, {reload: true});
							
							if(restaurant.subscription_type_id != 4){					
								for (var i in res.employees) {
									if(res.employees[i].id == auth.authentication.user.id){
										if(res.employees[i].type_ids === 8)	{	//data entry
											$state.go('admin.dataEntry');
											return;
										}
										else if (res.employees[i].type_ids === 5) {
											$state.go('foodSubCategories');
											return;
										}
										else if (res.employees[i].type_ids === 6) {
											$state.go('alcoholSubCategories');
											return;
										}
										else if (res.employees[i].type_ids === 9 || res.employees[i].type_ids === 10) {	//Skrible Auditor
											if(restaurant.subscription_type_id == 5){
												$state.go('alcoholSubCategories');
												return;
											}
											else if (restaurant.subscription_type_id == 6){
												$state.go('foodSubCategories');
												return;
											}
											else if (restaurant.subscription_type_id == 7){
												$state.go('admin.inventoryCategories');
												return;
											}
										}
									}
								}
								$state.go('admin.homeMenu', {}, {reload: true});
							}
							else{
								$state.go('reports.compgroupReport');
							}
						});
					}
				}
			}catch (e) {
				$state.go('home', {}, {reload: true});
            }
			
        };
		
        that.$onInit = function () {
            core.getSettings()
			.then(that.get_restaurants_list())
            .then(function (res) {
                that.settings = res;
            });
			
            try {
                if (restaurant.data.info) {
					if($state.current.name != "home"){
						if($state.current.name == "compareRestaurants"){
							that.restaurantName = 'Compare Restaurants';
						}
						else{
							that.restaurantName = restaurant.data.info.restaurant_name;
						}
					}
					that.current_rest = restaurant.data.info.id;
                }
				else{
					if($state.current.name == "compareRestaurants" || $state.current.name == "compareRestaurantsMapping"){
						that.current_rest = -1;
						that.restaurantName = 'Compare Restaurants';
					}
				}

            } catch (e) {
                console.log(e)
            }
        };

        $rootScope.$on('restaurantSelected', function () {
            that.restaurantName = restaurant.data.info.restaurant_name
        });

        that.logout = function () {
            auth.logOut();
            $state.go('login')
        }
    }

    headerController.$inject = ['api', 'core', 'auth', '$q', '$state', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('headerComponent', {
        templateUrl: 'js/components/header/header.html',
        controller: headerController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();