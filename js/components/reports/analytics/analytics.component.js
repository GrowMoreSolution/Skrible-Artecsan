(function () {
    'use strict';
    function analyticsController(api, $state, auth, localStorageService, restaurant, $rootScope, $scope, $window) {
		if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }
        

        var that = this;
        that.$state = $state;
        that.api = api;
        that.auth = auth;
        that.restaurant_id = localStorageService.get('restaurant_id'); // {restaurant_id : 323}
		that.score_details = [];
		that.score_summary = {};
		that.detail_type = 'alcohol';
		var from_date = new Date();
		from_date = new Date(from_date.getFullYear(), from_date.getMonth(), 1);	// same year, 0 for Jan, 1 for 1st day
        that.start_date = from_date;
        that.end_date = new Date();
        
        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id;
            that.permissions = restaurant.data.permissions;
        });
        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions;
        }

        if (!that.restaurant_id) {
            $state.go('home');
            return;
        }
		
		that.performanceScoreDetail = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.loading = true;
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
            that.api.performance_score_detail({"start_date": that.fd, "end_date": that.td, "RestaurantId": that.restaurant_id.restaurant_id, "Category": that.score_category}).then(function (ret) {
				that.loading = false;
				swal.close()
				if(ret){
					var details = ret.data.data.performanceScoreDetail;
					for(var i=0; i<details.length; i++){
						if(!(angular.isUndefined(that.active_list[details[i].category]) || that.active_list[details[i].category] === null)){
							that.active_list[details[i].category].push(details[i]);
							
							that.summary_list[details[i].category]['purchases'] = !(angular.isUndefined(that.summary_list[details[i].category]['purchases']) || that.summary_list[details[i].category]['purchases'] === null) ? that.summary_list[details[i].category]['purchases'] + details[i].purchases_units : details[i].purchases_units;
							
							that.summary_list[details[i].category]['suggested'] = !(angular.isUndefined(that.summary_list[details[i].category]['suggested']) || that.summary_list[details[i].category]['suggested'] === null) ? that.summary_list[details[i].category]['suggested'] + details[i].suggested_units : details[i].suggested_units;
							
							that.summary_list[details[i].category]['sold'] = !(angular.isUndefined(that.summary_list[details[i].category]['sold']) || that.summary_list[details[i].category]['sold'] === null) ? that.summary_list[details[i].category]['sold'] + details[i].sold_units : details[i].sold_units;
							
							//that.summary_list[details[i].category]['q_var'] = !(angular.isUndefined(that.summary_list[details[i].category]['q_var']) || that.summary_list[details[i].category]['q_var'] === null) ? that.summary_list[details[i].category]['q_var'] + details[i].unit_variance : details[i].unit_variance;
							
							that.summary_list[details[i].category]['oh'] = !(angular.isUndefined(that.summary_list[details[i].category]['oh']) || that.summary_list[details[i].category]['oh'] === null) ? that.summary_list[details[i].category]['oh'] + details[i].oh_units : details[i].oh_units;
							
							that.summary_list[details[i].category]['slow'] = !(angular.isUndefined(that.summary_list[details[i].category]['slow']) || that.summary_list[details[i].category]['slow'] === null) ? that.summary_list[details[i].category]['slow'] + (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0) : (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0);
							
							that.summary_list[details[i].category]['usage'] = !(angular.isUndefined(that.summary_list[details[i].category]['usage']) || that.summary_list[details[i].category]['usage'] === null) ? that.summary_list[details[i].category]['usage'] + (details[i].usage_percent >= 0 && (details[i].sold_units - details[i].suggested_units + details[i].purchases_units) > 0 ? details[i].usage_percent : 0) : (details[i].usage_percent >= 0 && (details[i].sold_units - details[i].suggested_units + details[i].purchases_units) > 0 ? details[i].usage_percent : 0);
							
							that.summary_list[details[i].category]['stale'] = !(angular.isUndefined(that.summary_list[details[i].category]['stale']) || that.summary_list[details[i].category]['stale'] === null) ? that.summary_list[details[i].category]['stale'] + ((details[i].oh_units > 0 && details[i].stale_days == ret.data.data.report_period && details[i].stale_days >= 30) ? 1 : 0) : ((details[i].oh_units > 0 && details[i].stale_days == ret.data.data.report_period && details[i].stale_days >= 30) ? 1 : 0);
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
				}
            });
        };
			
		that.food_performanceScoreDetail = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
			});
			that.loading = true;
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
            that.api.food_performance_score_detail({"start_date": that.fd, "end_date": that.td, "RestaurantId": that.restaurant_id.restaurant_id, "Category": that.score_category}).then(function (ret) {
				that.loading = false;
				if(ret){
					var details = ret.data.data.performanceScoreDetail;
					for(var i=0; i<details.length; i++){
						if(!(angular.isUndefined(that.active_list[details[i].category]) || that.active_list[details[i].category] === null)){
							that.active_list[details[i].category].push(details[i]);
							
							that.summary_list[details[i].category]['purchases'] = !(angular.isUndefined(that.summary_list[details[i].category]['purchases']) || that.summary_list[details[i].category]['purchases'] === null) ? that.summary_list[details[i].category]['purchases'] + details[i].purchases_units : details[i].purchases_units;
							
							that.summary_list[details[i].category]['suggested'] = !(angular.isUndefined(that.summary_list[details[i].category]['suggested']) || that.summary_list[details[i].category]['suggested'] === null) ? that.summary_list[details[i].category]['suggested'] + details[i].suggested_units : details[i].suggested_units;
							
							that.summary_list[details[i].category]['sold'] = !(angular.isUndefined(that.summary_list[details[i].category]['sold']) || that.summary_list[details[i].category]['sold'] === null) ? that.summary_list[details[i].category]['sold'] + details[i].sold_units : details[i].sold_units;
							
							//that.summary_list[details[i].category]['q_var'] = !(angular.isUndefined(that.summary_list[details[i].category]['q_var']) || that.summary_list[details[i].category]['q_var'] === null) ? that.summary_list[details[i].category]['q_var'] + details[i].unit_variance : details[i].unit_variance;
							
							that.summary_list[details[i].category]['oh'] = !(angular.isUndefined(that.summary_list[details[i].category]['oh']) || that.summary_list[details[i].category]['oh'] === null) ? that.summary_list[details[i].category]['oh'] + details[i].oh_units : details[i].oh_units;
							
							that.summary_list[details[i].category]['slow'] = !(angular.isUndefined(that.summary_list[details[i].category]['slow']) || that.summary_list[details[i].category]['slow'] === null) ? that.summary_list[details[i].category]['slow'] + (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0) : (details[i].oh_units > 0 && details[i].usage_percent > 0 && details[i].usage_percent < 8.25 ? 1 : 0);
							
							that.summary_list[details[i].category]['usage'] = !(angular.isUndefined(that.summary_list[details[i].category]['usage']) || that.summary_list[details[i].category]['usage'] === null) ? that.summary_list[details[i].category]['usage'] + (details[i].usage_percent >= 0 ? details[i].usage_percent : 0) : (details[i].usage_percent >= 0 ? details[i].usage_percent : 0);
							
							that.summary_list[details[i].category]['stale'] = !(angular.isUndefined(that.summary_list[details[i].category]['stale']) || that.summary_list[details[i].category]['stale'] === null) ? that.summary_list[details[i].category]['stale'] + (details[i].stale_days == ret.data.data.report_period ? 1 : 0) : (details[i].stale_days == ret.data.data.report_period ? 1 : 0);
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
				}
				swal.close()
            });
        };
		
		this.downloadCSV = function() {
			that.export_loading = true;
			const getData = that.score_details;
			
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
            

			var headers = ['DateFrom', 'DateTo', 'Category', 'Item', 'Size', 'PurchasedUnits', 'SuggestedUnits', 'POSInventoryUnitsSold', /*'QtyVariance',*/ 'TotalOnHandUnits', 'Usage%', 'ZeroSaleDays'];
			
            var csv = (headers.join(',') + '\r\n');
			
            getData.forEach(function(row) {
				var pmix_obj = {};
				pmix_obj['DateFrom'] = fd;
				pmix_obj['DateTo'] = td;
				pmix_obj['Category'] = row['category'];
				pmix_obj['Item'] = row['item_name'].replace(/[,'#]/g, ' ');
				pmix_obj['Size'] = row['size'];
				pmix_obj['PurchasedUnits'] = row['purchases_units'];
				pmix_obj['SuggestedUnits'] = row['suggested_units'];
				pmix_obj['POSInventoryUnitsSold'] = row['sold_units'];
				//pmix_obj['QtyVariance'] = row['unit_variance'];
				pmix_obj['TotalOnHandUnits'] = row['oh_units'];
				pmix_obj['Usage%'] = row['usage_percent'];
				pmix_obj['ZeroSaleDays'] = row['stale_days'];

                const values = headers.map(function(header) {
                    return pmix_obj[header];
                })
                csv += (values.join(',') + '\r\n');
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Analytics Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		that.loadDetails = function () {
			that.active_list = {};
			that.summary_list = {};
			for(var i=0; i<that.categories.length; i++){
				that.active_list[that.categories[i]] = [];
				that.summary_list[that.categories[i]] = {};
			}
			if(that.detail_type == 'alcohol'){
				that.performanceScoreDetail();
			}
			else if(that.detail_type == 'food'){
				that.food_performanceScoreDetail();
			}
		}
		
		that.change_category = function () {
			that.score_details = that.active_list[that.score_category];
			that.score_summary = that.summary_list[that.score_category];
		}
		
        that.$onInit = function () {
			var resId = that.restaurant_id.restaurant_id;
			that.detail_type = $state.params.typeInventory;  // alcohol / food
			var inventory_type_id = that.detail_type == 'alcohol' ? 2 : 1;
			that.export_loading = false;
			
			Promise.all([that.api.get_active_SKU_categories({'inventory_type_id': inventory_type_id})]
			).then(function(response) {
				that.categories = response[0].data.data.categories.filter(function(x) {return x.category != 'Non Alcoholic'}).map(function(x) {return x.category});
				that.score_category = that.categories[0];
			})
			.then(function() {
                that.loadDetails();
            });			
        };
    }

    analyticsController.$inject = ['api', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope', '$scope', '$window'];
    angular.module('inspinia').component('analyticsComponent', {
        templateUrl: 'js/components/reports/analytics/analytics.html',
        controller: analyticsController,
        controllerAs: '$ctr',
        bindings: {}
    });
})();
