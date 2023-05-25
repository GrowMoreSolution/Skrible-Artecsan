(function () {
    'use strict';

    function compgroupReportsController(api, $state, $filter, auth, core, SweetAlert, localStorageService, restaurant, $rootScope, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;

        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id;
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions;
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return;
        }
		
		that.load_lock = true;
		that.subscription_type_id = restaurant.data.info.subscription_type_id;
		
		that.filters_list = [{"name": "Match"},{"name": "All"}];
		that.location_list = [{"name": "State"},{"name": "Country"}];
		

		var from_date = new Date();
        from_date.setDate(from_date.getDate() - 6);
        that.start_date = from_date;
        that.end_date = new Date();
		that.size = 'All';
		that.geography = 'All';
		that.location = 'Country';
		
		//avg sales r1
		$scope.loadcompsetReport_avg_sales = function () {				
            that.api.compsetReport_avg_sales({'start_date': that.fd, 'end_date': that.td, 'total_size': that.size, 'geography': that.geography, 'location': that.location}).then(function (res) {
				if(res){
					//console.log(res.data.data);
					var result = res.data.data.result;
					var chartData = [];
					if (result.length != 0) {
						var d = new Set();
						for (var i in result) {
							d.add(result[i].sales_date.substring(0, 10));
						}
						
						d.forEach(function(value) {
							var my_sales = 0;
							var compset_sales = 0;
							for (var i in result) {
								if(result[i].sales_date.substring(0, 10) == value){
									my_sales = result[i].my_sales;
									compset_sales = result[i].compset_avg_sales;
									break;
								}
							}
							chartData.push({"_id": value, "My Restaurant": my_sales, "Compgroup": compset_sales});
						});
						
						
					}
					var chart = c3.generate({
						bindto: '#sales_avg_line_graph',
						data: {
							json: chartData,
							keys: {
								x: '_id',
								value: ['My Restaurant', 'Compgroup'],
							},
							empty: {label: {text: 'No data found'}}
						},
						axis: {
							x: {
								type: 'category',
								tick: {
									rotate: 75,
									multiline: false
								},
								height: 130
							},
							y: {
								tick: {
									format: d3.format("$,")
								}
							}
						}
					});
				}});
        };
		//avg sales r1
		
		//daily sales r2
        $scope.loadcompsetReport_daily_sales = function () {				
            that.api.compsetReport_daily_sales({'start_date': that.fd, 'total_size': that.size, 'geography': that.geography, 'location': that.location}).then(function (res) {
				var r2_res = res.data.data.result;
				that.r2_dates = [];
				that.r2_result = [];
				for(var i=0; i<7; i++){
					var from_date = new Date(that.start_date);
					from_date.setDate(from_date.getDate() + i);
					var dayfd = from_date.getDate();
					var monthfd = from_date.getMonth() + 1;
					that.r2_dates.push(from_date.getFullYear() + '-' +
						(('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
						(('' + dayfd).length < 2 ? '0' : '') + dayfd);
						
					var found = false;
					for(var j=0; j<r2_res.length; j++){
						if(that.r2_dates[i] == r2_res[j].sales_date.substring(0,10)){
							that.r2_result[i] = r2_res[j];
							found = true;
							break;
						}
					}
					
					if(!found){
						that.r2_result[i] = {};
					}
				}
            });
        };
		//daily sales r2
		
		//day of week avg sales r3
        $scope.loadcompsetReport_day_of_week_avg_sales = function () {
            that.api.compsetReport_day_of_week_avg_sales({'start_date': that.fd, 'end_date': that.td, 'total_size': that.size, 'geography': that.geography, 'location': that.location}).then(function (res) {
				var r3_res = res.data.data.result;
				that.r3_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
				that.r3_result = [];
				for(var i=0; i<7; i++){						
					var found = false;
					for(var j=0; j<r3_res.length; j++){
						if(that.r3_days[i] == r3_res[j].day){
							that.r3_result[i] = r3_res[j];
							found = true;
							break;
						}
					}
					
					if(!found){
						that.r3_result[i] = {};
					}
				}
            });
        };
		//day of week avg sales r3
		
		//holiday report r4
        $scope.loadcompsetReport_holiday = function (is_init) {
			var holiday_start;
			if(is_init){
				holiday_start = new Date(that.start_date.getFullYear(), 0, 1);	// same year, 0 for Jan, 1 for 1st day
				var dayfd = holiday_start.getDate();
				var monthfd = holiday_start.getMonth() + 1;
				holiday_start = holiday_start.getFullYear() + '-' +
					(('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
					(('' + dayfd).length < 2 ? '0' : '') + dayfd;
			}
			else{
				holiday_start = that.fd;
			}
			
            that.api.compsetReport_holiday({'start_date': holiday_start, 'end_date': that.td, 'total_size': that.size, 'geography': that.geography, 'location': that.location}).then(function (res) {
                that.r4_result = res.data.data.result;

				var categories = [];
                var columns = [['My Restaurant'],['Compgroup Sales Avg']];
                for (var i in that.r4_result) {
					categories.push(that.r4_result[i].name);
                    columns[0].push(that.r4_result[i].my_sales);
					columns[1].push(that.r4_result[i].compset_avg_sales);
                }
                var chart2 = c3.generate({
                    bindto: '#holiday_report',
                    data: {
                        columns: columns,
                        type: 'bar',
                        empty: {label: {text: "No data found."}}
                    }, axis: {
                        x: {
                            type: 'category',
                            categories: categories,
							tick: {
                                rotate: 45,
                                multiline: false
                            }
                        },
                        y: {
                            tick: {
                                format: d3.format("$,")
                            }
                        }
                    }
                });

            });
        };
		//holiday report r4
		
		//projected summary r5
        $scope.loadcompsetReport_projected_summary = function () {
            that.api.compsetReport_projected_summary({'total_size': that.size, 'geography': that.geography, 'location': that.location}).then(function (res) {
				that.r5_result = res.data.data.result;
				if(that.r5_result.length < 2 && that.r5_result.length > 0 && that.r5_result[0].type == 'Last Week'){
					that.r5_result.push({type: 'Current Week'});
				}
            });
        };
		//projected summary r5
		
		// shared budget r6
        $scope.loadcompsetReport_shared_budget = function () {
            that.api.compsetReport_shared_budget({'start_date': that.fd, 'end_date': that.td, 'total_size': that.size, 'geography': that.geography, 'location': that.location}).then(function (res) {
				that.r6_result = res.data.data.result;
				if(that.r6_result.length > 0){
					if(that.r6_result[0].type == 'my_rest'){
						that.r6_my_budget = that.r6_result[0];
						that.r6_compset_budget = that.r6_result[1];
					}
					else if(that.r6_result[0].type == 'comspet'){
						that.r6_my_budget = that.r6_result[1];
						that.r6_compset_budget = that.r6_result[0];
					}
				}
            });
        };
		// shared budget r6
		
        that.loadSalesData = function (is_init) {
			var dayfd = that.start_date.getDate();
			var monthfd = that.start_date.getMonth() + 1;
            that.fd = that.start_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
			var daytd = that.end_date.getDate();
			var monthtd = that.end_date.getMonth() + 1;
            that.td = that.end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;
				
            $scope.loadcompsetReport_avg_sales();		//r1
			$scope.loadcompsetReport_daily_sales();			//r2
			$scope.loadcompsetReport_day_of_week_avg_sales();		//r3
			$scope.loadcompsetReport_holiday(is_init);		//r4
			$scope.loadcompsetReport_projected_summary();		//r5
			$scope.loadcompsetReport_shared_budget();		//r6
        }
		
        that.$onInit = function () {
			
			var sales = false;
			that.api.checkForSummarizedSales().then(function (res) {
				if(res.data.data.categories && Array.isArray(res.data.data.categories)){
					if(res.data.data.categories.length > 0){
						that.load_lock = false;
						that.loadSalesData(true);
					}
					else{
						if(that.subscription_type_id == 4){
							SweetAlert.swal({
								title: "Congratulations your setup is almost complete. It currently takes approximately 1-24 hours to confirm your CSV successfully connected. Once your setup is complete and confirmed you will receive an email notifying you of your updated status.",
								confirmButtonColor: "#337ab7",
								confirmButtonText: "OK"
							},
							function (res) {
								if (res) {
									$state.go('home');
								}
								else{
									$state.go('home');
								}
								return;
							});
						}
						else{
							SweetAlert.swal({
								title: "Congratulations your setup is almost complete. It currently takes approximately 1-24 hours to confirm your CSV successfully connected. Once your setup is complete and confirmed you will receive an email notifying you of your updated status.",
								confirmButtonColor: "#337ab7",
								confirmButtonText: "OK & Continue Setup"
							},
							function (res) {
								if (res) {
									$state.go('setupFirstAudit');
								}
								else{
									$state.go('setupFirstAudit');
								}
								return;
							});
						}
					}
				}
				else{
					$state.go('reports.reportsCategory');
				}
			});
        };
    }

    compgroupReportsController.$inject = ['api', '$state', '$filter', 'auth', 'core', 'SweetAlert', 'localStorageService', 'restaurant', '$rootScope', '$scope'];

    angular.module('inspinia').component('compgroupReportComponent', {
        templateUrl: 'js/components/reports/compgroupReport/compgroupReport.html',
        controller: compgroupReportsController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
