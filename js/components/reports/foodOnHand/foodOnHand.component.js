(function () {
    'use strict';

    function foodOnHandController(api, $scope,$state, auth, localStorageService, restaurant, $rootScope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.auth = auth;
        this.mydate = new Date();
        that.items = [];
        that.category = "";
		that.total_OH_value = 0;
		
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
				if (that.oh_table_data[i].total_uod_on_hand < 0)
				{
					that.oh_table_data[i].cases_on_hand = 'UR';
					that.oh_table_data[i].packs_on_hand = 'UR';
					that.oh_table_data[i].units_on_hand = 'UR';
					that.oh_table_data[i].total_uod_on_hand = 'UR';
					that.oh_table_data[i].OH_value = 'UR';
				}
				else{
					if(that.oh_table_data[i].OH_value < 0){
						that.oh_table_data[i].OH_value = that.oh_table_data[i].total_uod_on_hand * that.oh_table_data[i].unit_cost;
					}
					that.oh_table_data[i].cases_on_hand = Math.floor(that.oh_table_data[i].total_uod_on_hand / (that.oh_table_data[i].pack * that.oh_table_data[i].size));
					that.oh_table_data[i].packs_on_hand = Math.floor((that.oh_table_data[i].total_uod_on_hand - (that.oh_table_data[i].cases_on_hand * that.oh_table_data[i].pack * that.oh_table_data[i].size)) / that.oh_table_data[i].size);
					that.oh_table_data[i].units_on_hand = Math.round((that.oh_table_data[i].total_uod_on_hand - (that.oh_table_data[i].cases_on_hand * that.oh_table_data[i].pack * that.oh_table_data[i].size) - (that.oh_table_data[i].packs_on_hand * that.oh_table_data[i].size)) * 100) / 100;
				}
			}
			
			//use ng-repeat orderby instead...
			//yo.sort(function(a,b) {return (a.item_name > b.item_name) ? 1 : ((b.item_name > a.item_name) ? -1 : 0);} ); 
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
                    CasesOnHand: data.cases_on_hand,
					PacksOnHand: data.packs_on_hand,
					UnitsOnHand: data.units_on_hand,
					TotalOnHand: data.total_uod_on_hand,
					DeliveryUnit: data.uod,
                    UnitCost: data.unit_cost,
                    OnHandValue: data.OH_value,
                    UsedInRecipe: data.used_in_recipe
                });
            });


            const headers = ['Category', 'Vendor', 'SKU', 'ItemDescription', 'CasesOnHand', 'PacksOnHand', 'UnitsOnHand', 'TotalOnHand', 'DeliveryUnit', 'UnitCost', 'OnHandValue', 'UsedInRecipe'];
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
			that.loading = true;
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
            that.api.food_OH({'RestaurantId': that.restaurant_id.restaurant_id, 'Category': that.category == '--All--' ? '%' : that.category, 'caller': 'oh_report'}).then(function (res) {
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
            swal({
                title: "",
                text: "Loading...",
                imageUrl: "img/loading2.gif",
                showConfirmButton: false,
            });
			that.api.get_active_SKU_categories({'inventory_type_id': 1}).then(function (res) {
				that.SKU_categories = res.data.data.categories;
				if(that.SKU_categories.length){
					that.SKU_categories.unshift({'category': '--All--'});
					that.category = that.SKU_categories[0].category;
					that.loadOH();
					that.export_loading = false;
				}
			});
        }
    }

    foodOnHandController.$inject = ['api','$scope', '$state', 'auth', 'localStorageService', 'restaurant', '$rootScope'];

    angular.module('inspinia').component('foodOnHandComponent', {
        templateUrl: 'js/components/reports/foodOnHand/foodOnHand.html',
        controller: foodOnHandController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
