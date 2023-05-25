(function () {
    'use strict';

    function salesReportsController(api, $state, auth, core, localStorageService, restaurant, $rootScope, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;
        that.subcats = [];
        that.temp_subcats = [];
        that.subcategory = null;
        that.start_date = new Date();
        that.start_date.setDate(that.start_date.getDate() - 1);
        that.end_date = new Date();
        that.gross_sales = 0;
        that.discounts = 0;
        that.total_sales = 0;
        that.value_last_period = 0;
        that.purchase_value = 0;
        that.value_this_period = 0;
        that.target_cost = 0;
        that.value_used = 0;
        that.cost_percent = 0;
        that.target_cost_percent = 0;
        that.os_percent_variance = 0;

        that.sales = {'Liquor': 0, 'Bottle_Beer': 0, 'Draft_Beer': 0, 'Wine': 0, 'Total': 0};

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

        var from_date = new Date();
        from_date.setDate(from_date.getDate() - 1);
        that.start_date = from_date;
        that.end_date = new Date();
        that.category = "Liquor";

        that.loadLateralChart = function () {
			var dayfd = that.start_date.getDate();
			var monthfd = that.start_date.getMonth() + 1;
            var fd = that.start_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
			var daytd = that.end_date.getDate();
			var monthtd = that.end_date.getMonth() + 1;
            var td = that.end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;
				
            that.api.lateral_chart_api({'From': fd, 'To': td, 'RestaurantId': that.restaurant_id.restaurant_id, 'Category': that.category, 'inventory_type_id': 2}).then(function (res) {
				that.loading = false;
				swal.close()
                var color = [];
                var getRandomColor = function () {
                    return ('#' + Math.floor(Math.random() * 16777215).toString(16));
                };
                var LateralChart = res.data.data.Lateral;
				that.sales_table_data = [];
				for(var l=1; l<LateralChart[0].length; l++){
					that.sales_table_data.push({item_name: LateralChart[0][l], units_sold: LateralChart[1][l]})
				}
				 
                var chart = c3.generate({
                    bindto: '#sales',
                    size: {
                        height: 500
                    },
                    data: {
                        x: 'x',
                        columns: LateralChart,
                        type: 'bar',
//                        color: function () {
//                            var colors = getRandomColor();
//                            return colors;
//                        },
                        empty: {label: {text: "No data found."}}
                    },
                    zoom: {
                        enabled: true
//                        rescale: true
                    },
                    axis: {
                        rotated: true,
                        x: {
                            type: 'category'
                        },
						y: {
							tick: {
								format: function (d) {
									return parseFloat(Math.round(d * 100)/100);
								}
							}
						}
                    },
                    legend: {
                        show: false
                    }
                });
                chart.zoom([0, 10]);
            });
        };

		that.loadPMIXWeeklyData = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.loading = true;
			that.api.pmix({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 2, 'category': that.category == '-- All --' ? 'All' : that.category == 'Food, Lunch & Dinner' ? 'Food' : that.category, 'mode': 'weekly'}).then(function (res) {
				that.loading = false;
				swal.close()
				that.pmix_data = res.data.data.pMIX;
				that.pmix_weekly_start = that.pmix_data[0].pmix_weekly_start;
				that.pmix_weekly_end = that.pmix_data[0].pmix_weekly_end;
			});
        }
		
		that.loadPMIXTrendData = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.loading = true;			
			that.api.pmix({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 2, 'category': that.category == '-- All --' ? 'All' : that.category == 'Food, Lunch & Dinner' ? 'Food' : that.category, 'mode': 'trend'}).then(function (res) {
				that.loading = false;
				swal.close()
				that.pmix_data = res.data.data.pMIX;
				that.pmix_trend_start = that.pmix_data[0].pmix_trend_start;
				that.pmix_trend_end = that.pmix_data[0].pmix_trend_end;
			});
        }
		
		that.loadDailySalesData = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.loading = true;
			that.daily_sales_data = [];
			that.daily_sales_row_header = that.daily_sales_mode.name;
			that.api.sales_current_to_last_period_report({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 2, 'mode': that.daily_sales_mode.mode}).then(function (res) {
				that.loading = false;
				swal.close()
				that.daily_sales_data = res.data.data.salesCurrentToLastPeriodReport;
				that.previous_year_label = that.daily_sales_data.previous_year;
				that.current_year_label = that.daily_sales_data.current_year;
				delete that.daily_sales_data.previous_year;
				delete that.daily_sales_data.current_year;
				that.daily_sales_data_keys = Object.keys(that.daily_sales_data);
			});
        }
		
        that.SalesSummary = function () {
            var dayfd = that.start_date.getDate();
			var monthfd = that.start_date.getMonth() + 1;
            var fd = that.start_date.getFullYear() + '-' +
                (('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
                (('' + dayfd).length < 2 ? '0' : '') + dayfd;
				
			var daytd = that.end_date.getDate();
			var monthtd = that.end_date.getMonth() + 1;
            var td = that.end_date.getFullYear() + '-' +
                (('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
                (('' + daytd).length < 2 ? '0' : '') + daytd;

            that.api.salesSummary({'From': fd, 'To': td, 'RestaurantId': that.restaurant_id.restaurant_id, 'Category': that.category}).then(function (res) {
                if (res) {
                    that.sales = {'Liquor': 0, 'Bottle_Beer': 0, 'Draft_Beer': 0, 'Draft Wine': 0, 'Wine': 0, 'Total': 0};
                    var sales_total = 0;
                    for (var i = 0; i < res.data.data.salesSummary.length; i++)
                    {
                        if (res.data.data.salesSummary[i].category == 'Liquor') {
                            that.sales['Liquor'] = res.data.data.salesSummary[i].sales;
                            sales_total += res.data.data.salesSummary[i].sales;
                        } else if (res.data.data.salesSummary[i].category == 'Bottle Beer') {
                            that.sales['Bottle_Beer'] = res.data.data.salesSummary[i].sales;
                            sales_total += res.data.data.salesSummary[i].sales;
                        } else if (res.data.data.salesSummary[i].category == 'Draft Beer') {
                            that.sales['Draft_Beer'] = res.data.data.salesSummary[i].sales;
                            sales_total += res.data.data.salesSummary[i].sales;
                        } else if (res.data.data.salesSummary[i].category == 'Draft Wine') {
                            that.sales['Draft_Wine'] = res.data.data.salesSummary[i].sales;
                            sales_total += res.data.data.salesSummary[i].sales;
                        } else if (res.data.data.salesSummary[i].category == 'Wine') {
                            that.sales['Wine'] = res.data.data.salesSummary[i].sales;
                            sales_total += res.data.data.salesSummary[i].sales;
                        }
                    }
                    that.sales['Total'] = sales_total;
                }
            });
        };

		this.exportReport = function(type){
			if(type == 'details'){
				this.downloadDetails();
			}
			else if(type == 'pmix_weekly' || type == 'pmix_trend'){
				this.downloadPMIX();
			}
			else if(type == 'daily'){
				this.downloadDailySales();
			}
		}
		
		this.downloadDetails = function() {
			that.export_loading = true;
            const getData = [];

            this.sales_table_data.forEach(function(data) {
                getData.push({
					Category: that.category,
                    Item: data.item_name.replace(/[,'#]/g, ' '),
                    UnitsSold: data.units_sold
                });
            });


            const headers = ['Category', 'Item', 'UnitsSold'];
            var csv = (headers.join(',') + '\r\n');

            getData.forEach(function(row) {
                const values = headers.map(function(header) {
                    return row[header];
                })
                csv += (values.join(',') + '\r\n');
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Sales Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		this.downloadPMIX = function() {
			that.export_loading = true;
			const getData = that.pmix_data;
			
			var fd, td;
			if(that.mode == 'pmix_weekly'){
				fd = that.pmix_weekly_start.substring(0, 10);
				td = that.pmix_weekly_end.substring(0, 10);
			}
			else if(that.mode == 'pmix_trend'){
				fd = that.pmix_trend_start.substring(0, 10);
				td = that.pmix_trend_end.substring(0, 10);
			}
            

			var headers = [];
			if(that.mode == 'pmix_weekly'){
				headers = ['DateFrom', 'DateTo', 'Category', 'MenuItem', 'PricingLevel', 'TotalWeekly$Sales', 'TotalWeekly$Cost', 'Gross$Profit', 'LastWeekUnitsSold', '13WeekAvgUnitsSold', 'Variance', 'LastWeek%OfSales'];
			}
			else if(that.mode == 'pmix_trend'){
				headers = ['DateFrom', 'DateTo', 'Category', 'MenuItem', 'PricingLevel', 'Week1UnitsSold', 'Week2UnitsSold', 'Week3UnitsSold', 'Week4UnitsSold', 'Week5UnitsSold', 'Week6UnitsSold', 'Week7UnitsSold', 'Week8UnitsSold', 'Week9UnitsSold', 'Trend'];
			}
            var csv = (headers.join(',') + '\r\n');
			
            getData.forEach(function(row) {
				var pmix_obj = {};
				if(that.mode == 'pmix_weekly'){
					pmix_obj['DateFrom'] = fd;
					pmix_obj['DateTo'] = td;
					pmix_obj['Category'] = row['category'];
					pmix_obj['MenuItem'] = row['name'];
					pmix_obj['PricingLevel'] = row['price_number'];
					pmix_obj['TotalWeekly$Sales'] = row['sales'];
					pmix_obj['TotalWeekly$Cost'] = row['cost'];
					pmix_obj['Gross$Profit'] = row['sales'] - row['cost'];
					pmix_obj['LastWeekUnitsSold'] = row['units_sold'];
					pmix_obj['13WeekAvgUnitsSold'] = row['units_sold_avg_13_weeks'];
					pmix_obj['Variance'] = row['units_sold'] - row['units_sold_avg_13_weeks'];
					pmix_obj['LastWeek%OfSales'] = row['percent_of_sales'];
				}
				else if(that.mode == 'pmix_trend'){
					pmix_obj['DateFrom'] = fd;
					pmix_obj['DateTo'] = td;
					pmix_obj['Category'] = row['category'];
					pmix_obj['MenuItem'] = row['name'];
					pmix_obj['PricingLevel'] = row['price_number'];
					pmix_obj['Week1UnitsSold'] = row['week_1'];
					pmix_obj['Week2UnitsSold'] = row['week_2'];
					pmix_obj['Week3UnitsSold'] = row['week_3'];
					pmix_obj['Week4UnitsSold'] = row['week_4'];
					pmix_obj['Week5UnitsSold'] = row['week_5'];
					pmix_obj['Week6UnitsSold'] = row['week_6'];
					pmix_obj['Week7UnitsSold'] = row['week_7'];
					pmix_obj['Week8UnitsSold'] = row['week_8'];
					pmix_obj['Week9UnitsSold'] = row['week_9'];
					pmix_obj['Trend'] = row['trend'];
				}
				
				
                const values = headers.map(function(header) {
                    return pmix_obj[header];
                })
                csv += (values.join(',') + '\r\n');
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'PMIX '+(that.mode == 'pmix_weekly' ? 'Weekly' : 'Trend')+' Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		this.downloadDailySales = function() {
			that.export_loading = true;           

			var headers = ['Period', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Total'];

            var csv = (headers.join(',') + '\r\n');
			var values = [];
            that.daily_sales_data_keys.forEach(function(key) {
				var ds_obj = {};
				
				ds_obj['Period'] = that.previous_year_label+" "+key+" "+that.daily_sales_row_header;
				ds_obj['Monday'] = that.daily_sales_data[key].previous[0];
				ds_obj['Tuesday'] = that.daily_sales_data[key].previous[1];
				ds_obj['Wednesday'] = that.daily_sales_data[key].previous[2];
				ds_obj['Thursday'] = that.daily_sales_data[key].previous[3];
				ds_obj['Friday'] = that.daily_sales_data[key].previous[4];
				ds_obj['Saturday'] = that.daily_sales_data[key].previous[5];
				ds_obj['Sunday'] = that.daily_sales_data[key].previous[6];
				ds_obj['Total'] = that.daily_sales_data[key].previous[7];
				values = headers.map(function(header) {
					return ds_obj[header];
				})
				csv += (values.join(',') + '\r\n');
				
				if(that.daily_sales_mode.mode == 'highest'){
					ds_obj['Period'] = "Date of "+that.daily_sales_row_header;
					ds_obj['Monday'] = that.daily_sales_data[key].previous_highest_date[0];
					ds_obj['Tuesday'] = that.daily_sales_data[key].previous_highest_date[1];
					ds_obj['Wednesday'] = that.daily_sales_data[key].previous_highest_date[2];
					ds_obj['Thursday'] = that.daily_sales_data[key].previous_highest_date[3];
					ds_obj['Friday'] = that.daily_sales_data[key].previous_highest_date[4];
					ds_obj['Saturday'] = that.daily_sales_data[key].previous_highest_date[5];
					ds_obj['Sunday'] = that.daily_sales_data[key].previous_highest_date[6];
					ds_obj['Total'] = that.daily_sales_data[key].previous_highest_date[7];
					values = headers.map(function(header) {
						return ds_obj[header];
					})
					csv += (values.join(',') + '\r\n');
				}
				
				ds_obj['Period'] = that.current_year_label+" "+key+" "+that.daily_sales_row_header;
				ds_obj['Monday'] = that.daily_sales_data[key].current[0];
				ds_obj['Tuesday'] = that.daily_sales_data[key].current[1];
				ds_obj['Wednesday'] = that.daily_sales_data[key].current[2];
				ds_obj['Thursday'] = that.daily_sales_data[key].current[3];
				ds_obj['Friday'] = that.daily_sales_data[key].current[4];
				ds_obj['Saturday'] = that.daily_sales_data[key].current[5];
				ds_obj['Sunday'] = that.daily_sales_data[key].current[6];
				ds_obj['Total'] = that.daily_sales_data[key].current[7];
				values = headers.map(function(header) {
					return ds_obj[header];
				})
				csv += (values.join(',') + '\r\n');
				
				if(that.daily_sales_mode.mode == 'highest'){
					ds_obj['Period'] = "Date of "+that.daily_sales_row_header;
					ds_obj['Monday'] = that.daily_sales_data[key].current_highest_date[0];
					ds_obj['Tuesday'] = that.daily_sales_data[key].current_highest_date[1];
					ds_obj['Wednesday'] = that.daily_sales_data[key].current_highest_date[2];
					ds_obj['Thursday'] = that.daily_sales_data[key].current_highest_date[3];
					ds_obj['Friday'] = that.daily_sales_data[key].current_highest_date[4];
					ds_obj['Saturday'] = that.daily_sales_data[key].current_highest_date[5];
					ds_obj['Sunday'] = that.daily_sales_data[key].current_highest_date[6];
					ds_obj['Total'] = that.daily_sales_data[key].current_highest_date[7];
					values = headers.map(function(header) {
						return ds_obj[header];
					})
					csv += (values.join(',') + '\r\n');
				}
				
				if(that.daily_sales_mode.mode == 'total' || that.daily_sales_mode.mode == 'avg'){
					ds_obj['Period'] = "Difference";
					ds_obj['Monday'] = that.daily_sales_data[key].current[0] - that.daily_sales_data[key].previous[0];
					ds_obj['Tuesday'] = that.daily_sales_data[key].current[1] - that.daily_sales_data[key].previous[1];
					ds_obj['Wednesday'] = that.daily_sales_data[key].current[2] - that.daily_sales_data[key].previous[2];
					ds_obj['Thursday'] = that.daily_sales_data[key].current[3] - that.daily_sales_data[key].previous[3];
					ds_obj['Friday'] = that.daily_sales_data[key].current[4] - that.daily_sales_data[key].previous[4];
					ds_obj['Saturday'] = that.daily_sales_data[key].current[5] - that.daily_sales_data[key].previous[5];
					ds_obj['Sunday'] = that.daily_sales_data[key].current[6] - that.daily_sales_data[key].previous[6];
					ds_obj['Total'] = that.daily_sales_data[key].current[7] - that.daily_sales_data[key].previous[7];
					values = headers.map(function(header) {
						return ds_obj[header];
					})
					csv += (values.join(',') + '\r\n');
					
					ds_obj['Period'] = "Change";
					ds_obj['Monday'] = (Math.round(((that.daily_sales_data[key].current[0] - that.daily_sales_data[key].previous[0]) / that.daily_sales_data[key].previous[0]) * 10000) / 100) + "%";
					ds_obj['Tuesday'] = (Math.round(((that.daily_sales_data[key].current[1] - that.daily_sales_data[key].previous[1]) / that.daily_sales_data[key].previous[1]) * 10000) / 100) + "%";
					ds_obj['Wednesday'] = (Math.round(((that.daily_sales_data[key].current[2] - that.daily_sales_data[key].previous[2]) / that.daily_sales_data[key].previous[2]) * 10000) / 100) + "%";
					ds_obj['Thursday'] = (Math.round(((that.daily_sales_data[key].current[3] - that.daily_sales_data[key].previous[3]) / that.daily_sales_data[key].previous[3]) * 10000) / 100) + "%";
					ds_obj['Friday'] = (Math.round(((that.daily_sales_data[key].current[4] - that.daily_sales_data[key].previous[4]) / that.daily_sales_data[key].previous[4]) * 10000) / 100) + "%";
					ds_obj['Saturday'] = (Math.round(((that.daily_sales_data[key].current[5] - that.daily_sales_data[key].previous[5]) / that.daily_sales_data[key].previous[5]) * 10000) / 100) + "%";
					ds_obj['Sunday'] = (Math.round(((that.daily_sales_data[key].current[6] - that.daily_sales_data[key].previous[6]) / that.daily_sales_data[key].previous[6]) * 10000) / 100) + "%";
					ds_obj['Total'] = (Math.round(((that.daily_sales_data[key].current[7] - that.daily_sales_data[key].previous[7]) / that.daily_sales_data[key].previous[7]) * 10000) / 100) + "%";
					values = headers.map(function(header) {
						return ds_obj[header];
					})
					csv += (values.join(',') + '\r\n');
				}
				
				if(that.daily_sales_mode.mode == 'highest'){
					ds_obj['Period'] = that.previous_year_label+" "+key+" "+" Zero Sales Days";
					ds_obj['Monday'] = that.daily_sales_data[key].previous_zero_days[0];
					ds_obj['Tuesday'] = that.daily_sales_data[key].previous_zero_days[1];
					ds_obj['Wednesday'] = that.daily_sales_data[key].previous_zero_days[2];
					ds_obj['Thursday'] = that.daily_sales_data[key].previous_zero_days[3];
					ds_obj['Friday'] = that.daily_sales_data[key].previous_zero_days[4];
					ds_obj['Saturday'] = that.daily_sales_data[key].previous_zero_days[5];
					ds_obj['Sunday'] = that.daily_sales_data[key].previous_zero_days[6];
					ds_obj['Total'] = that.daily_sales_data[key].previous_zero_days[7];
					values = headers.map(function(header) {
						return ds_obj[header];
					})
					csv += (values.join(',') + '\r\n');
					
					ds_obj['Period'] = that.current_year_label+" "+key+" "+" Zero Sales Days";
					ds_obj['Monday'] = that.daily_sales_data[key].current_zero_days[0];
					ds_obj['Tuesday'] = that.daily_sales_data[key].current_zero_days[1];
					ds_obj['Wednesday'] = that.daily_sales_data[key].current_zero_days[2];
					ds_obj['Thursday'] = that.daily_sales_data[key].current_zero_days[3];
					ds_obj['Friday'] = that.daily_sales_data[key].current_zero_days[4];
					ds_obj['Saturday'] = that.daily_sales_data[key].current_zero_days[5];
					ds_obj['Sunday'] = that.daily_sales_data[key].current_zero_days[6];
					ds_obj['Total'] = that.daily_sales_data[key].current_zero_days[7];
					values = headers.map(function(header) {
						return ds_obj[header];
					})
					csv += (values.join(',') + '\r\n');
				}
				
				ds_obj['Period'] = "";
				ds_obj['Monday'] = "";
				ds_obj['Tuesday'] = "";
				ds_obj['Wednesday'] = "";
				ds_obj['Thursday'] = "";
				ds_obj['Friday'] = "";
				ds_obj['Saturday'] = "";
				ds_obj['Sunday'] = "";
				ds_obj['Total'] = "";
				
                values = headers.map(function(header) {
                    return ds_obj[header];
                })
                csv += (values.join(',') + '\r\n');
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Daily_Sales '+(that.daily_sales_mode.mode == 'total' ? 'Total' : that.daily_sales_mode.mode == 'avg' ? 'Average' : 'Highest Sales')+' Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
        that.loadSalesData = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.loading = true;
            that.SalesSummary();
            that.loadLateralChart();
        }

		that.loadPMIXData = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.loading = true;
			if(that.mode == 'pmix_weekly'){
				that.loadPMIXWeeklyData();
			}
			else if(that.mode == 'pmix_trend'){
				that.loadPMIXTrendData();
			}
		}
		
		that.changeMode = function (mode) {
			if(that.mode != mode){	//avoid unnecessary calls
				that.mode = mode;
				if(that.mode == 'summary'){
					that.categories = JSON.parse(JSON.stringify(that.bu_categories));
					that.category = that.categories[0].category;
					that.loadSalesData();
				}
				else if(that.mode == 'details'){
					that.categories = JSON.parse(JSON.stringify(that.bu_categories));
					that.category = that.categories[0].category;
					that.loadLateralChart();
				}
				else if(that.mode == 'pmix_weekly'){
					that.categories = JSON.parse(JSON.stringify(that.bu_categories));
					that.categories.push({category: 'Other'});
					that.categories.unshift({'category': '-- All --'});
					that.category = that.categories[0].category;
					that.loadPMIXWeeklyData();
				}
				else if(that.mode == 'pmix_trend'){
					that.categories = JSON.parse(JSON.stringify(that.bu_categories));
					that.categories.push({category: 'Other'});
					that.categories.unshift({'category': '-- All --'});
					that.category = that.categories[0].category;
					that.loadPMIXTrendData();
				}
				else if(that.mode == 'daily'){
					that.daily_sales_mode = that.daily_sales_modes_list[0];
					that.loadDailySalesData();
				}
			}
		}
		
        that.$onInit = function () {
			Promise.all([api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 2})]).then(function(response) {
				that.categories = response[0].data.data.categories.filter(function(x) {return x.category != 'Non Alcoholic'});
				that.bu_categories = JSON.parse(JSON.stringify(that.categories));
				that.category = that.categories[0].category;
				that.daily_sales_modes_list = [{mode: 'total', name: '$ Sales'}, {mode: 'avg', name: 'Running Average $ Sales'}, {mode: 'highest', name: 'Highest $ Sales Day'}];
				that.mode = 'summary';
				that.loadSalesData();
				that.export_loading = false;
			});
        };
    }

    salesReportsController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService', 'restaurant', '$rootScope', '$scope'];

    angular.module('inspinia').component('salesReportComponent', {
        templateUrl: 'js/components/reports/salesReport/salesReport.html',
        controller: salesReportsController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
