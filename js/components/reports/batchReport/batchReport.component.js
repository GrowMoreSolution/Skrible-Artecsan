(function () {
    'use strict';
    function batchReportController(api, $state, auth, core, localStorageService, restaurant, $rootScope, $scope) {

       if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        this.mydate = "";
		var from_date = new Date();
		that.start_date = new Date(from_date.getFullYear(), 0, 1);	// same year, 0 for Jan, 1 for 1st day
        that.end_date = new Date();
        that.items = [];
		that.recipe_categories = [{category: "Batch Recipes", r_type_id: 2}, {category: "Pre-prepped Recipes", r_type_id: 3}];
        that.category = that.recipe_categories[0].category;
		that.cat_id = that.recipe_categories[0].r_type_id;
		that.mode = "On Hand";
		
        $rootScope.$on('restaurantSelected', function () {
            that.pos_id = $state.params.pos_id || restaurant.data.info.pos_id;
            that.permissions = restaurant.data.permissions;
        });

        if (restaurant.data.permissions) {
            that.permissions = restaurant.data.permissions
        }

        that.restaurant_id = localStorageService.get('restaurant_id');  // {restaurant_id : 323}

        if (!that.restaurant_id) {
            $state.go('home');
            return
        }
		
		that.loadOH = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
				timer:20000
			});
			that.mode = "On Hand";
            this.mydate = Date.now();
            that.api.batch_OH({'Date': this.mydate, 'RestaurantId': that.restaurant_id.restaurant_id, 'Category': that.cat_id}).then(function (res) {
				if(res){
					that.items = [];
					angular.forEach(res.data.data.Report, function (value, key) {
						var temp_value = value;
						temp_value.date_of_creation = temp_value.date_of_creation.substring(0, 10);
						that.items.push(temp_value);
					}, that.items);
				}
				swal.close()
            });
		}
		
		that.loadWaste = function () {
			that.mode = "Waste Report";
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
				
            that.api.waste_report({'From': fd, 'To': td, 'RestaurantId': that.restaurant_id.restaurant_id, 'Category': that.cat_id}).then(function (res) {
				if(res){
					that.items = [];
					angular.forEach(res.data.data.Report, function (value, key) {
						var temp_value = value;
						temp_value.date_of_creation = temp_value.date_of_creation.substring(0, 10);
						temp_value.date_on_hand = temp_value.date_on_hand.substring(0, 10);
						that.items.push(temp_value);
					}, that.items);
				}
            });
		}
		
		that.changeCat = function () {
			if(that.cat_id === 2){
				that.category = that.recipe_categories[0].category;
				if(that.mode === "On Hand"){
					that.loadOH();
				}
				else if(that.mode == "Waste Report"){
					that.loadWaste();
				}
			}
			else if(that.cat_id === 3){
				that.category = that.recipe_categories[1].category;
				if(that.mode === "On Hand"){
					that.loadOH();
				}
				else if(that.mode == "Waste Report"){
					that.loadWaste();
				}
			}
		}
		
        that.$onInit = function () {
			that.loadOH();
        }
    }

    batchReportController.$inject = ['api', '$state', 'auth', 'core', 'localStorageService', 'restaurant', '$rootScope', '$scope'];
    angular.module('inspinia').component('batchReportComponent', {
        templateUrl: 'js/components/reports/batchReport/batchReport.html',
        controller: batchReportController,
        controllerAs: '$ctr',
        bindings: {}
    });
})();
