(function () {
    'use strict';

    function foodDetailController(api, $state, $filter, auth, core, localStorageService, restaurant, $rootScope, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.restaurant_id = localStorageService.get('restaurant_id');
        /* Table */
		$scope.spa = 1;
		$scope.seoption = [{id: 1, name: 'Last Week'}, {id: 2, name: 'This Week'}, {id: 3, name: 'Next Week'}]

        $scope.sns_data = {};
        $scope.loadTable = function () {
            that.api.sales_and_spendings({'RestaurantId': that.restaurant_id.restaurant_id}).then(function (res) {
                var qres = res.data.data.MyJson;
                $scope.sns_data = {
                    'Food': {
                        'Last_week': {
                            'actual_sales': 0,
                            'actual_purchases': 0,
                            'predicted_sales': 0,
                            'suggested': 0
                        },
                        'This_week': {
                            'actual_sales': 0,
                            'actual_purchases': 0,
                            'predicted_sales': 0,
                            'suggested': 0
                        },
                        'Next_week': {'predicted_sales': 0, 'suggested': 0}
                    }
                };
                for (var i = 0; i < qres.length; i++) {
					if(qres[i].type == 'Food'){
						$scope.sns_data['Food'][qres[i].week_label]['actual_sales'] = Math.round(qres[i].actual_sales);
						$scope.sns_data['Food'][qres[i].week_label]['actual_purchases'] = Math.round(qres[i].actual_purchases);
						$scope.sns_data['Food'][qres[i].week_label]['predicted_sales'] = Math.round(qres[i].predicted_sales);
						$scope.sns_data['Food'][qres[i].week_label]['suggested'] = Math.round(qres[i].suggested);
					}
                }
            });
        };
        $scope.loadTable();
        /* ---Table--- */

        /* Summary Items  Table */
        $scope.more_loading = true;
        $scope.loadSummaryItemsTable = function () {
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            $scope.show_food_more = true;
            $scope.summary_items_data = [];
            that.api.dashboard_summary_items({'inventory_type_id': 1}).then(function (res) {
                $scope.subscription_type_id = restaurant.data.info.subscription_type_id;
                swal.close()
                //for (var i in res.data.data.dashboardSummaryItems.missing_recipes) {
				for(var i=0; i<5; i++){		//limit is set to 5. coordinate with b/e if the limit changes
                    $scope.summary_items_data.push({
                        //'high_risk': res.data.data.dashboardSummaryItems.high_risk[i],
                        'suggested': res.data.data.dashboardSummaryItems.suggested[i],
                        'missing_recipes': res.data.data.dashboardSummaryItems.missing_recipes[i]
                    });
                }
                $scope.more_loading = false;
            });
        };
        $scope.loadSummaryItemsTable();
        $scope.more_navigation = function (go_to) {
            if (go_to == 'missing_recipes') {
                $state.go('foodSetup.menu');
            } else if (go_to == 'high_risk') {
                $state.go('reports.foodCostOfSummary');
            } else if (go_to == 'suggested') {
                $state.go('food.newFoodOrder');
            }
        }
        /* ---Summary Items Table--- */
    }

    foodDetailController.$inject = ['api', '$state', '$filter', 'auth', 'core', 'localStorageService', 'restaurant', '$rootScope', '$scope'];

    angular.module('inspinia').component('foodDetailComponent', {
        templateUrl: 'js/components/reports/foodDetail/foodDetail.html',
        controller: foodDetailController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
