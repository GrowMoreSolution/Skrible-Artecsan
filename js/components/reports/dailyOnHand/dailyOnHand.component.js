(function () {
    'use strict';

    function dailyOnHandController(api, $scope,$state, auth, localStorageService, restaurant, $rootScope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.auth = auth;
        this.mydate = new Date();
        that.items = [];
		
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
		
		that.preProcessOH = function () {
			that.total_OH_value = 0;
			
			for(var i = 0; i < that.oh_table_data.length; i++){
				//if (that.oh_table_data[i].OH_value > 0)
				//{
					that.total_OH_value += that.oh_table_data[i].OH_value;
				//}
				if (that.oh_table_data[i].units_on_hand < 0)
				{
					that.oh_table_data[i].units_on_hand = 'UR';
					that.oh_table_data[i].OH_value = 'UR';
				}
				else{
					if(that.oh_table_data[i].OH_value < 0){
						that.oh_table_data[i].OH_value = that.oh_table_data[i].units_on_hand * that.oh_table_data[i].pack_cost;
					}
				}				
			}
			that.items = that.oh_table_data;
		}
			
		this.downloadCSV = function() {
            const getData = [];
			that.export_loading = true;
			
            this.oh_table_data.forEach(function(data) {
                getData.push({
					Category: data.category,
                    Vendor: data.vendor_name.replace(/[,'#]/g, ' '),
                    SKU: data.vendor_sku.replace(/[,'#]/g, ' '),
                    ItemDescription: data.item_name.replace(/[,'#]/g, ' '),
                    CurrentOnHand: data.units_on_hand,
                    ItemCost: data.pack_cost,
                    OnHandValue: data.OH_value,
                    UsedInRecipe: data.used_in_recipe
                });
            });


            const headers = ['Category', 'Vendor', 'SKU', 'ItemDescription', 'CurrentOnHand', 'ItemCost', 'OnHandValue', 'UsedInRecipe'];
            var csv = (headers.join(',') + '\r\n');

            getData.forEach(function(row) {
                const values = headers.map(function(header) {
                    return row[header];
                });
                csv += (values.join(',') + '\r\n');
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'On-Hand Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
		that.loadOH = function () {
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
			that.loading = true;
            that.api.alcohol({'RestaurantId': that.restaurant_id.restaurant_id, 'Category': that.category == '--All--' ? '%' : that.category, 'caller': 'oh_report'}).then(function (res) {
				if(res){
					that.category_label = that.category;
					that.oh_table_data = res.data.data.Report;
					that.preProcessOH();
				}
				that.loading = false;
                swal.close()
            });
		}
		
		
        that.$onInit = function () {
			Promise.all([api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 2})]).then(function(response) {
				that.categories = response[0].data.data.categories.filter(function(x) {return x.category != 'Non Alcoholic'});
				that.categories.unshift({id: -1, category: '--All--', inventory_type_id: 2});
				that.category = that.categories[0].category;
				that.loadOH();
				that.export_loading = false;
			});
        }
    }

    dailyOnHandController.$inject = ['api','$scope', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('dailyOnHandComponent', {
        templateUrl: 'js/components/reports/dailyOnHand/dailyOnHand.html',
        controller: dailyOnHandController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
