(function () {
    'use strict';

    function pmixController(api, $state, auth, core, localStorageService, restaurant, $rootScope, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;

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
		
        that.loadPMIXDailyData = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
				timer:20000
			});
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
				
			that.api.pmix({'start_date': fd, 'end_date': td, 'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': that.inventory_type_id, 'category': that.category == '-- All --' ? 'All' : that.category == 'Food, Lunch & Dinner' ? 'Food' : that.category, 'mode': 'daily'}).then(function (res) {
				that.loading = false;
				that.pmix_data = res.data.data.pMIX;
				that.ttl_units_sold = 0;
				that.ttl_sales = 0;
				that.ttl_discounts = 0;
				that.ttl_total_cost = 0;
				that.ttl_gross_profit = 0;
				for(var pi in that.pmix_data){
					var pt = that.pmix_data[pi];
					that.ttl_units_sold += pt.units_sold;
					that.ttl_sales += pt.sales;
					that.ttl_discounts += pt.discounts;
					that.ttl_total_cost += pt.total_cost;
					that.ttl_gross_profit += pt.gross_profit;
				}
				swal.close()
			});
        }
		
		/*that.loadPMIXWeeklyData = function () {				
			that.api.pmix({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': that.inventory_type_id, 'category': that.category == '-- All --' ? 'All' : that.category == 'Food, Lunch & Dinner' ? 'Food' : that.category, 'mode': 'weekly'}).then(function (res) {
				that.loading = false;
				that.pmix_data = res.data.data.pMIX;
				that.pmix_weekly_start = that.pmix_data[0].pmix_weekly_start;
				that.pmix_weekly_end = that.pmix_data[0].pmix_weekly_end;
			});
        }
		
		that.loadPMIXTrendData = function () {				
			that.api.pmix({'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': that.inventory_type_id, 'category': that.category == '-- All --' ? 'All' : that.category == 'Food, Lunch & Dinner' ? 'Food' : that.category, 'mode': 'trend'}).then(function (res) {
				that.loading = false;
				that.pmix_data = res.data.data.pMIX;
				that.pmix_trend_start = that.pmix_data[0].pmix_trend_start;
				that.pmix_trend_end = that.pmix_data[0].pmix_trend_end;
			});
        }*/
		
		this.downloadCSV = function() {
			that.export_loading = true;
			const getData = that.pmix_data;
			
			var fd, td;
			if(that.mode == 'daily'){
				var dayfd = that.start_date.getDate();
				var monthfd = that.start_date.getMonth() + 1;
				fd = that.start_date.getFullYear() + '-' +
					(('' + monthfd).length < 2 ? '0' : '') + monthfd + '-' +
					(('' + dayfd).length < 2 ? '0' : '') + dayfd;
					
				var daytd = that.end_date.getDate();
				var monthtd = that.end_date.getMonth() + 1;
				td = that.end_date.getFullYear() + '-' +
					(('' + monthtd).length < 2 ? '0' : '') + monthtd + '-' +
					(('' + daytd).length < 2 ? '0' : '') + daytd;
			}
			/*else if(that.mode == 'weekly'){
				fd = that.pmix_weekly_start.substring(0, 10);
				td = that.pmix_weekly_end.substring(0, 10);
			}
			else if(that.mode == 'trend'){
				fd = that.pmix_trend_start.substring(0, 10);
				td = that.pmix_trend_end.substring(0, 10);
			}*/
            

			var headers = [];
			if(that.mode == 'daily'){
				headers = ['DateFrom', 'DateTo', 'Category', 'MenuItem', 'PricingLevel', 'Price', 'UnitCost', 'Cost%', 'UnitsSold', '$Sold', 'Discounts', 'TotalCost', 'GrossProfit', '%OfUnitsSold', '%Of$Sold'];
			}
			/*else if(that.mode == 'weekly'){
				headers = ['DateFrom', 'DateTo', 'Category', 'MenuItem', 'PricingLevel', 'TotalWeekly$Sales', 'TotalWeekly$Cost', 'Gross$Profit', 'LastWeekUnitsSold', '13WeekAvgUnitsSold', 'Variance', 'LastWeek%OfSales'];
			}
			else if(that.mode == 'trend'){
				headers = ['DateFrom', 'DateTo', 'Category', 'MenuItem', 'PricingLevel', 'Week1UnitsSold', 'Week2UnitsSold', 'Week3UnitsSold', 'Week4UnitsSold', 'Week5UnitsSold', 'Week6UnitsSold', 'Week7UnitsSold', 'Week8UnitsSold', 'Week9UnitsSold', 'Trend'];
			}*/
            var csv = (headers.join(',') + '\r\n');
			
            getData.forEach(function(row) {
				var pmix_obj = {};
				if(that.mode == 'daily'){
					pmix_obj['DateFrom'] = fd;
					pmix_obj['DateTo'] = td;
					pmix_obj['Category'] = row['category'];
					pmix_obj['MenuItem'] = row['name'].replace(/,/g, "");
					pmix_obj['PricingLevel'] = row['price_number'];
					pmix_obj['Price'] = row['price'];
					pmix_obj['UnitCost'] = row['cost'];
					pmix_obj['Cost%'] = row['cost_margin'];
					pmix_obj['UnitsSold'] = row['units_sold'];
					pmix_obj['$Sold'] = row['sales'];
					pmix_obj['Discounts'] = row['discounts'];
					pmix_obj['TotalCost'] = row['total_cost'];
					pmix_obj['GrossProfit'] = row['gross_profit'];
					pmix_obj['%OfUnitsSold'] = row['percent_of_units_sold'];
					pmix_obj['%Of$Sold'] = row['percent_of_sales'];
				}
				/*else if(that.mode == 'weekly'){
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
				else if(that.mode == 'trend'){
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
				}*/
				
				
                const values = headers.map(function(header) {
                    return pmix_obj[header];
                })
                csv += (values.join(',') + '\r\n');
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'PMIX '+(that.mode == 'daily' ? 'Daily' : that.mode == 'weekly' ? 'Weekly' : 'Trend')+' Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		that.loadData = function () {
			that.loading = true;
			if(that.mode == 'daily'){
				that.loadPMIXDailyData();
			}
			/*else if(that.mode == 'weekly'){
				that.loadPMIXWeeklyData();
			}
			else if(that.mode == 'trend'){
				that.loadPMIXTrendData();
			}*/
		}
		
		that.changeMode = function (mode) {
			if(that.mode != mode){	//avoid unnecessary calls
				that.mode = mode;
				that.loadData();
			}
		}
		
        that.$onInit = function () {
			that.detail_type = $state.params.typeInventory;  // alcohol / food
			that.inventory_type_id = that.detail_type == 'alcohol' ? 2 : 1;
			that.mode = 'daily';
			that.export_loading = false;
			if(that.inventory_type_id == 2){
				that.api.get_active_SKU_categories({'inventory_type_id': that.inventory_type_id}).then(function (res) {
					that.SKU_categories = res.data.data.categories;
					that.SKU_categories.unshift({'category': '-- All --'});
					that.category = that.SKU_categories[0].category;
					that.SKU_categories.push({'category': 'Other'});
					that.loadPMIXDailyData();
				});
			}
			else{
				that.SKU_categories = [];
				that.SKU_categories.unshift({'category': '-- All --'});
				that.category = that.SKU_categories[0].category;
				that.SKU_categories.push({'category': 'Food, Lunch & Dinner'});
				that.SKU_categories.push({'category': 'Other'});
				that.loadPMIXDailyData();
			}
        };
    }

    pmixController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService', 'restaurant', '$rootScope', '$scope'];

    angular.module('inspinia').component('pmixComponent', {
        templateUrl: 'js/components/reports/pmix/pmix.html',
        controller: pmixController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
