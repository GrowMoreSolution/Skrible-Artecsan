(function () {
    'use strict';
    var alcoholDetailController = function ($scope, $state, $filter, auth, api, $rootScope, localStorageService, restaurant) {

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
                    'Alcohol': {
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
                    $scope.sns_data['Alcohol'][qres[i].week_label]['actual_sales'] = Math.round(qres[i].actual_sales);
                    $scope.sns_data['Alcohol'][qres[i].week_label]['actual_purchases'] = Math.round(qres[i].actual_purchases);
                    $scope.sns_data['Alcohol'][qres[i].week_label]['predicted_sales'] = Math.round(qres[i].predicted_sales);
                    $scope.sns_data['Alcohol'][qres[i].week_label]['suggested'] = Math.round(qres[i].suggested);
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
            $scope.show_alco_more = true;
            $scope.summary_items_data = [];
            that.api.dashboard_summary_items({'inventory_type_id': 2}).then(function (res) {
                $scope.subscription_type_id = restaurant.data.info.subscription_type_id;
                //for (var i in res.data.data.dashboardSummaryItems.missing_recipes) {
				for(var i=0; i<5; i++){		//limit is set to 5. coordinate with b/e if the limit changes
                    $scope.summary_items_data.push({
                        //'high_risk': res.data.data.dashboardSummaryItems.high_risk[i],
                        'suggested': res.data.data.dashboardSummaryItems.suggested[i],
                        'missing_recipes': res.data.data.dashboardSummaryItems.missing_recipes[i]
                    });
                }
                swal.close()
                $scope.more_loading = false;
            });
        };
        $scope.loadSummaryItemsTable();
        $scope.more_navigation = function (go_to) {
            if (go_to == 'missing_recipes') {
                $state.go('alcoholSetup.menu');
            } else if (go_to == 'high_risk') {
                $state.go('reports.alcoholCostOfSummary');
            } else if (go_to == 'suggested') {
                $state.go('alcohol.newAlcoholOrder');
            }
        }
        /* ---Summary Items Table--- */

    };
    alcoholDetailController.$inject = ['$scope', '$state', '$filter', 'auth', 'api', '$rootScope', 'localStorageService', 'restaurant'];
    angular
        .module('inspinia')
        .controller('alcoholDetailController', alcoholDetailController);
})();
