(function () {
    'use strict';


    var homeMenuController = function ($state, $scope, auth, $filter, api, $rootScope, localStorageService, restaurant) {
        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }
        var that = this;
        that.api = api;
		that.is_su = auth.authentication.user.id == 1 ? true : false;
		
        var swalCount = 1;
		const SWAL_LIMIT = 4;

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}
		that.Summary_category = {id: -1, category: "--All Items--", inventory_type_id: 2};
		
		/* ---Net Profit Report--- */
        that.np_start_date = new Date();
		that.np_start_date.setDate(that.np_start_date.getDate() - ((that.np_start_date. getDay() || 7) + 7) + 1);

        that.np_end_date = new Date();
		that.np_end_date.setDate(that.np_end_date.getDate() - ((that.np_end_date. getDay() || 7) + 1) + 1);

		that.np_obj = {};
		
        $scope.loadNetProfit = function () {
			if (typeof that.np_start_date == 'undefined' || typeof that.np_end_date == 'undefined' || that.np_start_date == null || that.np_end_date == null){
                return;
			}
			
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });  
			
			var npfd = new Date(that.np_start_date);
			var dayfd = npfd.getDate();
			var monthfd = npfd.getMonth() + 1;
			npfd = npfd.getFullYear() + '-' +
				(('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
				(('' + dayfd).length < 2 ? '0' : '') + dayfd;
			
			var nptd = new Date(that.np_end_date);
			var daytd = nptd.getDate();
			var monthtd = nptd.getMonth() + 1;
			nptd = nptd.getFullYear() + '-' +
				(('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
				(('' + daytd).length < 2 ? '0' : '') + daytd;
				
            that.api.get_net_profit({
                start_date: npfd,
                end_date: nptd
            }).then(function (res) {
				if(typeof res.data.data.net_profit_data != 'undefined'){
					that.np_obj = res.data.data.net_profit_data;
					that.np_obj['labor_percent'] = that.np_obj.sales == 0 ? 0 : Math.round((that.np_obj.labor / that.np_obj.sales) * 100);
					that.np_obj['inv_percent'] = that.np_obj.sales == 0 ? 0 : Math.round((that.np_obj.inv / that.np_obj.sales) * 100);
				}
				if (swalCount >= SWAL_LIMIT) {
                    swal.close()
                } else {
                    swalCount++
                }
            });
        };
        /* ---Net Profit Report--- */
		
        /* Line Chart */
        var from_date = new Date();
        var days = 20;
        from_date.setDate(from_date.getDate() - days);
        $scope.start_date = from_date;

        var to_date = new Date();
        to_date.setDate(to_date.getDate() + days);
        $scope.end_date = to_date;

        var yest_d = new Date();
        var tdayfd = yest_d.getDate() - 1;
        var tmonthfd = yest_d.getMonth() + 1;
        yest_d = yest_d.getFullYear() + '-' +
            (('' + tmonthfd).length < 2 ? '0' : '') + tmonthfd + '-' +
            (('' + tdayfd).length < 2 ? '0' : '') + tdayfd;

        $scope.loadLineGraph = function () {
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            if ($scope.start_date == null)
                $scope.start_date = from_date;
            if ($scope.end_date == null)
                $scope.end_date = to_date;

            that.api.sales_data({
                start_date: $scope.start_date,
                end_date: $scope.end_date,
                restaurant_id: that.restaurant_id.restaurant_id
            }).then(function (res) {
				if (swalCount >= SWAL_LIMIT) {
                    swal.close()
                } else {
                    swalCount++
                }
                var total_sales = res.data.data.total_sales;
                var chartData = [];
                var v_arr = [];
                if (total_sales.length != 0) {
                    var fs = [];
                    var as = [];
                    var d = new Set();
                    for (var i in total_sales) {
                        d.add(total_sales[i].Pre_Date_l == null ? total_sales[i].Act_Date_l.substring(0, 10) : total_sales[i].Pre_Date_l.substring(0, 10));
                    }

                    if ($scope.subscription_type_id == 1 || $scope.subscription_type_id == 5) {
                        v_arr = ['Alcohol Sales'
						//, 'Predicted Alcohol Sales'
						];
                    } else if ($scope.subscription_type_id == 2 || $scope.subscription_type_id == 6) {
                        v_arr = ['Food Sales'
						//, 'Predicted Food Sales'
						];
                    } else if ($scope.subscription_type_id == 3 || $scope.subscription_type_id == 7) {
                        v_arr = ['Food Sales', 'Alcohol Sales'
						//, 'Predicted Alcohol Sales', 'Predicted Food Sales'
						];
                    }

                    d.forEach(function (value) {
                        var fs = 0;
                        var as = 0;
                        var ps = 0;
                        var pfs = 0;

                        var vtoday_d = new Date(value);
                        var vdayfd = vtoday_d.getDate();
                        var vmonthfd = vtoday_d.getMonth() + 1;
                        vtoday_d = vtoday_d.getFullYear() + '-' +
                            (('' + vmonthfd).length < 2 ? '0' : '') + vmonthfd + '-' +
                            (('' + vdayfd).length < 2 ? '0' : '') + vdayfd;

                        var is_future = vtoday_d >= yest_d ? true : false;

                        for (var i in total_sales) {
                            if ((total_sales[i].Act_Date_l.substring(0, 10) == value || total_sales[i].Pre_Date_l.substring(0, 10) == value) && total_sales[i].category == 'Food') {
                                if (!is_future) {
                                    total_sales[i].actual_total_sales = total_sales[i].actual_total_sales == null ? 0 : total_sales[i].actual_total_sales;
                                    total_sales[i].predicted_total_sales = total_sales[i].predicted_total_sales == null ? 0 : total_sales[i].predicted_total_sales;
                                }
                                fs = total_sales[i].actual_total_sales;
                                pfs = total_sales[i].predicted_total_sales;
                            }
                            if ((total_sales[i].Act_Date_l.substring(0, 10) == value || total_sales[i].Pre_Date_l.substring(0, 10) == value) && total_sales[i].category == 'Alcohol') {
                                if (!is_future) {
                                    total_sales[i].actual_total_sales = total_sales[i].actual_total_sales == null ? 0 : total_sales[i].actual_total_sales;
                                    total_sales[i].predicted_total_sales = total_sales[i].predicted_total_sales == null ? 0 : total_sales[i].predicted_total_sales;
                                }
                                as = total_sales[i].actual_total_sales;
                                ps = total_sales[i].predicted_total_sales;
                            }
                        }
                        if ($scope.subscription_type_id == 1 || $scope.subscription_type_id == 5) {
                            chartData.push({"_id": value, "Alcohol Sales": as
							//,"Predicted Alcohol Sales": ps
							});
                        } else if ($scope.subscription_type_id == 2 || $scope.subscription_type_id == 6) {
                            chartData.push({"_id": value, "Food Sales": fs
							//, "Predicted Food Sales": pfs
							});
                        } else if ($scope.subscription_type_id == 3 || $scope.subscription_type_id == 7) {
                            chartData.push({
                                "_id": value,
                                "Food Sales": fs,
                                "Alcohol Sales": as
                                //,"Predicted Alcohol Sales": ps
                                //,"Predicted Food Sales": pfs
                            });
                        }
                    });


                }
                var chart = c3.generate({
                    bindto: '#chart',
                    data: {
                        json: chartData,
                        keys: {
                            x: '_id',
                            value: v_arr,
                        },
                        empty: {label: {text: 'No data found'}},
                        type: 'spline'
                    },
                    axis: {
                        x: {
                            type: 'category',
                            tick: {
                                rotate: 75,
                                multiline: false,
                                culling: {
                                    max: 10
                                }
                            },
                            // height: 100	//130
                        },
                        y: {
                            tick: {
                                format: d3.format("$,")
                            }
                        }
                    },
					point: {
						show: false
					}
                    // ,legend: {
                    //     position: 'inset'
                    // }
                });

            });
        };
        /* ---Line Chart--- */


        /* Bar Chart */
        $scope.Bar_From_date = new Date(new Date().getFullYear(), 0, 1);
        $scope.Bar_To_date = new Date();

        $scope.loadBarGraph = function () {
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            var dayfd = $scope.Bar_From_date.getDate();
            var monthfd = $scope.Bar_From_date.getMonth() + 1;
            var fd = $scope.Bar_From_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;

            var daytd = $scope.Bar_To_date.getDate();
            var monthtd = $scope.Bar_To_date.getMonth() + 1;
            var td = $scope.Bar_To_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;

            that.api.bar_chart_api({
                "From": fd,
                'To': td,
                'RestaurantId': that.restaurant_id.restaurant_id
            }).then(function (res) {
                if (swalCount >= SWAL_LIMIT) {
                    swal.close()
                } else {
                    swalCount++
                }
                var BarChart = res.data.data.MyJson;
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var groups = [];
                var categories = [];
                for (var i in BarChart) {
                    groups = groups.concat(BarChart[i][0]);
                }
                for (var i = 0; i < BarChart[0].length - 1; i++) {
                    categories = categories.concat(months[i]);
                }
                var chart2 = c3.generate({
                    bindto: '#bar',
                    data: {
                        columns: BarChart,
                        type: 'bar',
                        groups: [
                            groups
                        ],
                        empty: {label: {text: "No data found."}}
                    }, axis: {
                        x: {
                            type: 'category',
                            categories: categories
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
        /* ---Bar Chart--- */

        /* ---Alcohol Graph--- */
        var from_date1 = new Date();
        $scope.Monthly_From_date = new Date(from_date1.getFullYear(), 0, 1);	// same year, 0 for Jan, 1 for 1st day
        $scope.Monthly_To_date = new Date();

        $scope.Summary_From_date = new Date();	// same year, 0 for Jan, 1 for 1st day
        $scope.Summary_From_date.setMonth($scope.Summary_From_date.getMonth() - 1);
        $scope.Summary_To_date = new Date();
		
        $scope.MonthlySalesPriorYearComparison = function (fd, td) {
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            $scope.Monthly_prior_From_date = new Date(fd);
            $scope.Monthly_prior_From_date.setYear($scope.Monthly_prior_From_date.getFullYear() - 1);
            $scope.Monthly_prior_To_date = new Date(td);
            $scope.Monthly_prior_To_date.setYear($scope.Monthly_prior_To_date.getFullYear() - 1);

            var prior_fd = $filter('date')($scope.Monthly_prior_From_date, 'yyyy-MM-dd');
            var prior_td = $filter('date')($scope.Monthly_prior_To_date, 'yyyy-MM-dd');
            var curr_fd = $filter('date')(fd, 'yyyy-MM-dd');
            var curr_td = $filter('date')(td, 'yyyy-MM-dd');

            that.api.MonthlySales({
                'prior_from': prior_fd,
                'prior_to': prior_td,
                'curr_from': curr_fd,
                'curr_to': curr_td,
                "RestaurantId": that.restaurant_id.restaurant_id,
                "Category": that.Monthly_category.id == -1 ? '%' : that.Monthly_category.id == -2 ? 'Food' : that.Monthly_category.category,
                'inventory_type_id': that.Monthly_category.inventory_type_id
            }).then(function (res) {
                if (swalCount >= SWAL_LIMIT) {
                    swal.close()
                } else {
                    swalCount++
                }
                if (res) {
                    var month = [];
                    var columns = [];
                    var mode = -1;

                    if ($scope.Monthly_From_date.getFullYear() == $scope.Monthly_To_date.getFullYear()) {
                        columns.push([$scope.Monthly_From_date.getFullYear() - 1], [$scope.Monthly_From_date.getFullYear()]);
                        mode = 2;
                    } else {
                        if ($scope.Monthly_To_date.getFullYear() - 1 == $scope.Monthly_From_date.getFullYear()) {
                            columns.push([$scope.Monthly_From_date.getFullYear() - 1], [$scope.Monthly_From_date.getFullYear()], [$scope.Monthly_To_date.getFullYear()]);
                            mode = 3;
                        }
                    }

                    for (var ix = 0; ix < res.data.data.MonthlySales.length; ix++) {
                        month.push(res.data.data.MonthlySales[ix].current_month);

                        if (mode == 2) {
                            columns[0].push(res.data.data.MonthlySales[ix].prev_sales);
                            columns[1].push(res.data.data.MonthlySales[ix].current_sales);
                        }
                        if (mode == 3) {
                            if (res.data.data.MonthlySales[ix].prev_yr == columns[0][0]) {
                                columns[0].push(res.data.data.MonthlySales[ix].prev_sales);
                                columns[1].push(res.data.data.MonthlySales[ix].current_sales);
                                columns[2].push(0);
                            } else if (res.data.data.MonthlySales[ix].prev_yr == columns[1][0]) {
                                columns[0].push(0);
                                columns[1].push(res.data.data.MonthlySales[ix].prev_sales);
                                columns[2].push(res.data.data.MonthlySales[ix].current_sales);
                            }
                        }
                    }
                    var chart = c3.generate({
                        bindto: '#monthly',
                        data: {
                            columns: columns,
                            type: 'bar',
                            empty: {label: {text: 'No data found'}},
                        },
                        bar: {
                            width: {
                                ratio: 0.5 // this makes bar width 50% of length between ticks
                            }
                            // or
                            //width: 100 // this makes bar width 100px
                        },
                        axis: {
                            x: {
                                type: 'category',
                                categories: month

                            }
                        }
                    });
                }
            });
        };

        $scope.Summary = function (fd, td) {
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            var curr_fd = $filter('date')(fd, 'yyyy-MM-dd');
            var curr_td = $filter('date')(td, 'yyyy-MM-dd');
            that.api.summary_api({
                "From": curr_fd,
                "To": curr_td,
                "RestaurantId": that.restaurant_id.restaurant_id,
                "Category": that.Summary_category.category == '--All Items--' ? '%' : that.Summary_category.category,
                'inventory_type_id': 2
            }).then(function (res) {
                if (swalCount >= SWAL_LIMIT) {
                    swal.close()
                } else {
                    swalCount++
                }
                if (res) {
                    var categories = [];
                    var columns = [];
                    columns.push(['Sales'], ['Cost'], ['Purchases']);

                    for (var ix = 0; ix < res.data.data.summary_api.length; ix++) {
                        if (res.data.data.summary_api[ix].date != null) {
                            categories.push(res.data.data.summary_api[ix].date.substring(0, 10));
                            columns[0].push(res.data.data.summary_api[ix].sales);
                            columns[1].push(res.data.data.summary_api[ix].cost);
                            columns[2].push(res.data.data.summary_api[ix].purchases);
                        }
                    }

                    var chart = c3.generate({
                        bindto: '#summaryGraph',
                        data: {
                            columns: columns,
                            types: {
                                Sales: 'bar',
                                Cost: 'line',
                                Purchases: 'line'
                            },
                            empty: {label: {text: 'No data found'}},
							colors: {
								Purchases: '#1b4332'
							},
                        },
                        bar: {
                            width: {
                                ratio: 0.5 // this makes bar width 50% of length between ticks
                            }
                            // or
                            //width: 100 // this makes bar width 100px
                        },
                        axis: {
                            x: {
                                type: 'category',
                                categories: categories

                            }
                        },
                    });
                }
            });
        };

        /* ---End Alcohol Graph--- */


        /* Food Graph */
        $scope.Summary_food_From_date = new Date();	// same year, 0 for Jan, 1 for 1st day
        $scope.Summary_food_From_date.setMonth($scope.Summary_food_From_date.getMonth() - 1);
        $scope.Summary_food_To_date = new Date();
        $scope.SummaryFood = function (fd, td) {
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            var curr_fd1 = $filter('date')(fd, 'yyyy-MM-dd');
            var curr_td1 = $filter('date')(td, 'yyyy-MM-dd');
            that.api.summary_api({
                "From": curr_fd1,
                "To": curr_td1,
                "RestaurantId": that.restaurant_id.restaurant_id,
                "Category": 'Food',
                'inventory_type_id': 1
            }).then(function (res) {
                if (swalCount >= SWAL_LIMIT) {
                    swal.close()
                } else {
                    swalCount++
                }
                if (res) {
                    var categories = [];
                    var columns = [];
                    columns.push(['Sales'], ['Cost'], ['Purchases']);

                    for (var ix = 0; ix < res.data.data.summary_api.length; ix++) {
                        if (res.data.data.summary_api[ix].date != null) {
                            categories.push(res.data.data.summary_api[ix].date.substring(0, 10));
                            columns[0].push(res.data.data.summary_api[ix].sales);
                            columns[1].push(res.data.data.summary_api[ix].cost);
                            columns[2].push(res.data.data.summary_api[ix].purchases);
                        }
                    }

                    var chart = c3.generate({
                        bindto: '#summaryGraphFood',
                        data: {
                            columns: columns,
                            types: {
                                Sales: 'bar',
                                Cost: 'line',
                                Purchases: 'line'
                            },
                            empty: {label: {text: 'No data found'}},
							colors: {
								Sales: '#335C67',
								Purchases: '#9E2A2B',
								Cost: '#FF9E00'
							},
                        },
                        bar: {
                            width: {
                                ratio: 0.5 // this makes bar width 50% of length between ticks
                            }
                            // or
                            //width: 100 // this makes bar width 100px
                        },
                        axis: {
                            x: {
                                type: 'category',
                                categories: categories

                            }
                        }
                    });
                }
            });
        };
        /*End Food Graph*/
		Promise.all([api.get_vendors_categories({
            is_restaurant_used_only: 1,
            inventory_type_id: 2
		})]).then(function (response) {
			$scope.subscription_type_id = restaurant.data.info.subscription_type_id;
			that.get_refbooks = response[1];
			$scope.loadNetProfit();
			that.categories = response[0].data.data.categories.filter(function (x) {
				return x.category != 'Non Alcoholic'
			});
			that.mspy_categories = JSON.parse(JSON.stringify(that.categories));
			that.categories.unshift({id: -1, category: "--All Items--", inventory_type_id: 2});
			$scope.loadLineGraph();
			
			if($scope.subscription_type_id == 1 || $scope.subscription_type_id == 5){
				that.mspy_categories.unshift({id: -1, category: "--All Alcohol--", inventory_type_id: 2});
			}
			if($scope.subscription_type_id == 2 || $scope.subscription_type_id == 6){
				that.mspy_categories = [];
				that.mspy_categories.push({id: -2, category: "--All Food--", inventory_type_id: 1});
			}
			if($scope.subscription_type_id == 3 || $scope.subscription_type_id == 7){
				that.mspy_categories.unshift({id: -2, category: "--All Food--", inventory_type_id: 1});
				that.mspy_categories.unshift({id: -1, category: "--All Alcohol--", inventory_type_id: 2});
			}
			
			that.Monthly_category = that.mspy_categories[0];
			$scope.MonthlySalesPriorYearComparison($scope.Monthly_From_date, $scope.Monthly_To_date);
			
			if(!($scope.subscription_type_id == 3 || $scope.subscription_type_id == 7)){
				$scope.loadBarGraph();
			}
			
			that.Summary_category = that.categories[0];
			if($scope.subscription_type_id == 1 || $scope.subscription_type_id == 3 || $scope.subscription_type_id == 5 || $scope.subscription_type_id == 7){
				$scope.Summary($scope.Summary_From_date, $scope.Summary_To_date);
			}
			if($scope.subscription_type_id == 2 || $scope.subscription_type_id == 3 || $scope.subscription_type_id == 6 || $scope.subscription_type_id == 7){
				$scope.SummaryFood($scope.Summary_food_From_date, $scope.Summary_food_To_date);
			}
		});

    };

    homeMenuController.$inject = ['$state', '$scope', 'auth', '$filter', 'api', '$rootScope', 'localStorageService', 'restaurant'];


    angular
        .module('inspinia')
        .controller('homeMenuController', homeMenuController);

})();
