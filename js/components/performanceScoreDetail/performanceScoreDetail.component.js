(function () {

    'use strict';

    function controller(api, $state, auth, localStorageService, $rootScope, restaurant, core, $scope) {
        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }
        $scope.Date = $rootScope.performanceDate;

        var that = this;
		that.detail_type = $rootScope.detail_type;

        that.form = {};
        that.$state = $state;
        that.core = core;
        that.api = api;
        that.auth = auth;
        that.restaurant_id = localStorageService.get('restaurant_id'); // {restaurant_id : 323}
		that.score_details = [];
		that.score_summary = {};
		
        $scope.performanceScoreDetail = function () {
            that.api.performance_score_detail({"Date": $scope.Date, "RestaurantId": that.restaurant_id.restaurant_id, "Category": that.score_category}).then(function (ret) {
				if(ret){
					var details = ret.data.data.performanceScoreDetail;
					//console.log(that.score_details);
					for(var i=0; i<details.length; i++){
						if(!(angular.isUndefined(that.active_list[details[i].category]) || that.active_list[details[i].category] === null)){
							that.active_list[details[i].category].push(details[i]);
							
							that.summary_list[details[i].category]['purchases'] = !(angular.isUndefined(that.summary_list[details[i].category]['purchases']) || that.summary_list[details[i].category]['purchases'] === null) ? that.summary_list[details[i].category]['purchases'] + details[i].purchases_units : details[i].purchases_units;
							
							/*that.summary_list[details[i].category]['suggested'] = !(angular.isUndefined(that.summary_list[details[i].category]['suggested']) || that.summary_list[details[i].category]['suggested'] === null) ? that.summary_list[details[i].category]['suggested'] + details[i].suggested_units : 0;*/
							
							that.summary_list[details[i].category]['sold'] = !(angular.isUndefined(that.summary_list[details[i].category]['sold']) || that.summary_list[details[i].category]['sold'] === null) ? that.summary_list[details[i].category]['sold'] + details[i].sold_units : details[i].sold_units;
							
							that.summary_list[details[i].category]['q_var'] = !(angular.isUndefined(that.summary_list[details[i].category]['q_var']) || that.summary_list[details[i].category]['q_var'] === null) ? that.summary_list[details[i].category]['q_var'] + details[i].unit_variance : details[i].unit_variance;
							
							that.summary_list[details[i].category]['oh'] = !(angular.isUndefined(that.summary_list[details[i].category]['oh']) || that.summary_list[details[i].category]['oh'] === null) ? that.summary_list[details[i].category]['oh'] + details[i].oh_units : details[i].oh_units;
							
							that.summary_list[details[i].category]['slow'] = !(angular.isUndefined(that.summary_list[details[i].category]['slow']) || that.summary_list[details[i].category]['slow'] === null) ? that.summary_list[details[i].category]['slow'] + (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0) : (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0);
							
							that.summary_list[details[i].category]['usage'] = !(angular.isUndefined(that.summary_list[details[i].category]['usage']) || that.summary_list[details[i].category]['usage'] === null) ? that.summary_list[details[i].category]['usage'] + (details[i].usage_percent >= 0 ? details[i].usage_percent : 0) : (details[i].usage_percent >= 0 ? details[i].usage_percent : 0);
							
							that.summary_list[details[i].category]['stale'] = !(angular.isUndefined(that.summary_list[details[i].category]['stale']) || that.summary_list[details[i].category]['stale'] === null) ? that.summary_list[details[i].category]['stale'] + (details[i].stale_days > 7 ? 1 : 0) : (details[i].stale_days > 7 ? 1 : 0);
						}
					}
					
					for(var category in that.categories){
						that.summary_list[that.categories[category]]['pvs'] = (that.summary_list[that.categories[category]]['sold'] / that.summary_list[that.categories[category]]['purchases']) * 100;
						
						that.summary_list[that.categories[category]]['slow'] = (that.summary_list[that.categories[category]]['slow'] / that.active_list[that.categories[category]].length) * 100;
						
						that.summary_list[that.categories[category]]['usage'] = (that.summary_list[that.categories[category]]['usage'] / that.active_list[that.categories[category]].length);
						
						that.summary_list[that.categories[category]]['stale'] = (that.summary_list[that.categories[category]]['stale'] / that.active_list[that.categories[category]].length) * 100;
					}
					
					
					
					that.score_details = that.active_list[that.score_category];
					that.score_summary = that.summary_list[that.score_category];
					//console.log(that.active_list);
				}
            });
        };
		
		
		$scope.food_performanceScoreDetail = function () {
            that.api.food_performance_score_detail({"Date": $scope.Date, "RestaurantId": that.restaurant_id.restaurant_id, "Category": that.score_category}).then(function (ret) {
				if(ret){
					var details = ret.data.data.performanceScoreDetail;
					//console.log(that.score_details);
					for(var i=0; i<details.length; i++){
						if(!(angular.isUndefined(that.active_list[details[i].category]) || that.active_list[details[i].category] === null)){
							that.active_list[details[i].category].push(details[i]);
							
							that.summary_list[details[i].category]['purchases'] = !(angular.isUndefined(that.summary_list[details[i].category]['purchases']) || that.summary_list[details[i].category]['purchases'] === null) ? that.summary_list[details[i].category]['purchases'] + details[i].purchases_units : details[i].purchases_units;
							
							/*that.summary_list[details[i].category]['suggested'] = !(angular.isUndefined(that.summary_list[details[i].category]['suggested']) || that.summary_list[details[i].category]['suggested'] === null) ? that.summary_list[details[i].category]['suggested'] + details[i].suggested_units : 0;*/
							
							that.summary_list[details[i].category]['sold'] = !(angular.isUndefined(that.summary_list[details[i].category]['sold']) || that.summary_list[details[i].category]['sold'] === null) ? that.summary_list[details[i].category]['sold'] + details[i].sold_units : details[i].sold_units;
							
							that.summary_list[details[i].category]['q_var'] = !(angular.isUndefined(that.summary_list[details[i].category]['q_var']) || that.summary_list[details[i].category]['q_var'] === null) ? that.summary_list[details[i].category]['q_var'] + details[i].unit_variance : details[i].unit_variance;
							
							that.summary_list[details[i].category]['oh'] = !(angular.isUndefined(that.summary_list[details[i].category]['oh']) || that.summary_list[details[i].category]['oh'] === null) ? that.summary_list[details[i].category]['oh'] + details[i].oh_units : details[i].oh_units;
							
							that.summary_list[details[i].category]['slow'] = !(angular.isUndefined(that.summary_list[details[i].category]['slow']) || that.summary_list[details[i].category]['slow'] === null) ? that.summary_list[details[i].category]['slow'] + (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0) : (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0);
							
							that.summary_list[details[i].category]['usage'] = !(angular.isUndefined(that.summary_list[details[i].category]['usage']) || that.summary_list[details[i].category]['usage'] === null) ? that.summary_list[details[i].category]['usage'] + (details[i].usage_percent >= 0 ? details[i].usage_percent : 0) : (details[i].usage_percent >= 0 ? details[i].usage_percent : 0);
							
							that.summary_list[details[i].category]['stale'] = !(angular.isUndefined(that.summary_list[details[i].category]['stale']) || that.summary_list[details[i].category]['stale'] === null) ? that.summary_list[details[i].category]['stale'] + (details[i].stale_days > 7 ? 1 : 0) : (details[i].stale_days > 7 ? 1 : 0);
						}
					}
					
					for(var category in that.categories){
						that.summary_list[that.categories[category]]['pvs'] = (that.summary_list[that.categories[category]]['sold'] / that.summary_list[that.categories[category]]['purchases']) * 100;
						
						that.summary_list[that.categories[category]]['slow'] = (that.summary_list[that.categories[category]]['slow'] / that.active_list[that.categories[category]].length) * 100;
						
						that.summary_list[that.categories[category]]['usage'] = (that.summary_list[that.categories[category]]['usage'] / that.active_list[that.categories[category]].length);
						
						that.summary_list[that.categories[category]]['stale'] = (that.summary_list[that.categories[category]]['stale'] / that.active_list[that.categories[category]].length) * 100;
					}
					
					
					
					that.score_details = that.active_list[that.score_category];
					that.score_summary = that.summary_list[that.score_category];
					//console.log(that.active_list);
				}
            });
        };
		
		that.change_category = function () {
			//console.log("change cat", that.score_category);
			that.score_details = that.active_list[that.score_category];
			that.score_summary = that.summary_list[that.score_category];
		}

        that.$onInit = function () {
            var resId = that.restaurant_id.restaurant_id;
			var inventory_type_id = that.detail_type == 'alcohol' ? 2 : 1;
			
			Promise.all([api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: inventory_type_id})]).then(function(response) {
				that.categories = response[0].data.data.categories.filter(function(x) {return x.category != 'Non Alcoholic'}).map(function(x) {return x.category});
				that.score_category = that.categories[0];
				that.active_list = {};
				that.summary_list = {};
				for(var i=0; i<that.categories.length; i++){
					that.active_list[that.categories[i]] = [];
					that.summary_list[that.categories[i]] = {};
				}
				if(that.detail_type == 'alcohol'){
					$scope.performanceScoreDetail();
				}
				else if(that.detail_type == 'food'){
					$scope.food_performanceScoreDetail();
				}
			});
        };
    }

    controller.$inject = ['api', '$state', 'auth', 'localStorageService', '$rootScope', 'restaurant', 'core', '$scope'];

    angular.module('inspinia').component('performanceScoreDetailComponent', {
        templateUrl: 'js/components/performanceScoreDetail/performanceScoreDetail.html',
        controller: controller,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
