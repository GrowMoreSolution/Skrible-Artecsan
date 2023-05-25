(function () {
    'use strict';

		var modalController = function ($uibModalInstance, api, alertService) {
        var that = this;
		that.api = api;
		that.q_title = 'Send Report PDF';
		that.q_texts = '<article style="display: block;"><p>Please select a Monday for start date and a Sunday for end date.</p></article>';
		that.start_date = new Date();
		that.end_date = new Date();
		
		that.select_start_date = function () {	
			if(that.start_date.getDay() != 1){
				alertService.showError("Please select a Monday!");
				that.start_date = new Date();
				return;
			}
		}
		
		that.select_end_date = function () {
			if(that.end_date.getDay() != 0){
				alertService.showError("Please select a Sunday!");
				that.end_date = new Date();
				return;
			}
		}
		
		
        that.sendPDF = function() {
			if(that.start_date >= that.end_date){
				alertService.showError("Please select a valid range!");
				that.end_date = new Date();
				return;
			}
			if(that.start_date.getDay() != 1){
				alertService.showError("Please select a Monday!");
				that.start_date = new Date();
				return;
			}
			if(that.end_date.getDay() != 0){
				alertService.showError("Please select a Sunday!");
				that.end_date = new Date();
				return;
			}
			
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
				
			that.api.food_on_hand_email({'start_date': fd, 'end_date': td}).then(function (res) {	
				//let it run
            });
			
			alertService.showSuccessText('Sent!', 'Please check your email');
			$uibModalInstance.close();
		};

		that.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};
    };
	
    function foodUsageVsPurchaseController(api, $state, $filter, auth, core, localStorageService, restaurant, $uibModal, $rootScope, $scope) {

        if (!auth.authentication.isLogged) {
            $state.go('home');
            return;
        }

        var that = this;
        that.api = api;
        that.core = core;
        that.auth = auth;
		that.res_data = [];
		that.temp_cats = [];
        that.subcats = [];
        that.temp_subcats = [];
		that.temp_items = [];
        that.category = null;
        that.subcategory = null;
		that.item = null;
        that.start_date = new Date();
		that.start_date.setMonth(that.start_date.getMonth() - 1);
        that.end_date = new Date();
		that.invoice_data = [];
		that.active_skus = [];
		that.invoice_items = [];
		
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
		
		that.sendWeeklyPDF = function () {
			var modalInstance = $uibModal.open({
				templateUrl: 'send_pdf.html',
				controller: modalController,
				windowClass: "animated fadeIn modal-lgg",
				controllerAs: '$ctr'
				
			});
		};
		
        that.PurchasesVsUsage = function () {
			swal({
				title: "",
				text: "Loading...",
				imageUrl: "img/loading2.gif",
				showConfirmButton: false,
				timer:20000
			});
			that.loading = true;
			//var curr_fd = $filter('date')(that.start_date, 'yyyy-MM-dd');
			//var curr_td = $filter('date')(that.end_date, 'yyyy-MM-dd');
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
			
			that.api.PurchaseVsUsage({'From': fd, 'To': td, 'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 1}).then(function (res) {	
				if(res){
					that.res_data = res.data.data.PurchaseVsUsage;
					that.changeSubCat();
					that.update_bar_chart();
				}
            })
        };
		
		that.changeCat = function () {
			if(that.category.id != -1){
				that.subcategories = that.all_subcategories.filter(function(x){return that.category.id == x.vendor_cat_id});
				that.subcategories.unshift({id: -1, sub_category: '--All Subcategories--'});
				that.subcategory = that.subcategories[0];
			}
			else{
				that.subcategories = JSON.parse(JSON.stringify(that.all_subcategories));
				that.subcategory = {id: -1, sub_category: '--All Subcategories--'};
			}
			that.temp_items = ["--All Items--"];
			that.item = that.temp_items[0];
		}
		
		that.changeSubCat = function () {
			if(that.subcategory.id != -1){
				that.temp_items = that.res_data.filter(function(x){return x.category == that.category.category && x.sub_category == that.subcategory.sub_category}).map(function(x){return x.item_name});
				that.temp_items.sort();
				that.temp_items.unshift("--All Items--");
				if(that.item == "--All Items--" || that.item == null){
					that.item = that.temp_items[0];
				}
			}
			else{
				that.temp_items = that.res_data.map(function(x){return x.item_name});
			}
		}
		
		that.update_bar_chart = function () {
			var columns = [['Usage'],['Purchases']];
			var categories = [];
			that.active_skus = [];
			if(that.category.id != -1){
				that.res_data = that.res_data.filter(function(x){return x.category == that.category.category});
				if(that.subcategory.id != -1){
					that.res_data = that.res_data.filter(function(x){return x.sub_category == that.subcategory.sub_category});
					if(that.item != "--All Items--"){
						that.res_data = that.res_data.filter(function(x){return x.item_name == that.item});
					}
				}
			}
			that.res_data.sort(function(a,b) {return (a.item_name > b.item_name) ? 1 : ((b.item_name > a.item_name) ? -1 : 0);} );
			for(var i = 0; i< that.res_data.length; i++){
				categories.push(that.res_data[i].item_name);
				columns[0].push(that.res_data[i].units_sold);
				columns[1].push(that.res_data[i].units_purchased);
				that.active_skus.push(that.res_data[i].vendor_sku_id);
			}
			var chart = c3.generate({
				bindto: "#PurchasesVsUsage",
				data: {
					columns: columns,
					type: 'bar'
				},
				zoom: {
					enabled: true,
					rescale: true
				},
				axis: {
					x: {
						type: 'category',
						categories: categories
					}
				},
				legend: {
					show: true
				}
			});
			chart.zoom([0, 10]);
			that.VendorTable();
        }
		
		
        that.VendorTable = function () {
			//var curr_fd = $filter('date')(that.start_date, 'yyyy-MM-dd');
			//var curr_td = $filter('date')(that.end_date, 'yyyy-MM-dd');
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
				
            that.api.VendorDetail({'From': fd, 'To': td, 'RestaurantId': that.restaurant_id.restaurant_id, 'inventory_type_id': 1}).then(function (res) {
				if(res){
					that.invoice_data = res.data.data.VendorDetail;
					that.invoice_items = [];
					for(var i = 0; i< that.invoice_data.length; i++){
						for(var j = 0; j< that.active_skus.length; j++){					
							if(that.invoice_data[i].vendor_sku_id == that.active_skus[j] || that.invoice_data[i].substitute_for == that.active_skus[j]){
								that.invoice_items.push(that.invoice_data[i]);	
							}
						}
					}
				}
				that.loading = false;
				swal.close()
            });
        };
		
		that.changeMode = function (mode) {
			if(that.mode != mode){	//avoid unnecessary calls
				that.mode = mode;
				that.PurchasesVsUsage();
				//that.VendorTable();
			}
		}
		
		this.downloadCSV = function() {
			that.export_loading = true;
            const getData = [];

            this.invoice_items.forEach(function(data) {
				var i_date = data.delivery_date.substr(0,10);
				i_date = i_date.split('-')[0]+"-"+i_date.split('-')[1]+"-"+i_date.split('-')[2];
                getData.push({
                    Vendor: data.vendor_name.replace(/[,'#]/g, ' '),
                    SKU: data.vendor_sku.replace(/[,'#]/g, ' '),
                    ItemDescription: data.item_name.replace(/[,'#]/g, ' '),
                    Invoice: data.invoice_number.replace(/[,'#]/g, ' '),
                    DateReceived: i_date,
                    QtyReceived: data.units_purchased,
                    ItemPrice: data.item_cost,
                    TotalCost: data.total_cost
                })
            })

            const headers = ['Vendor', 'SKU', 'ItemDescription', 'Invoice', 'DateReceived', 'QtyReceived', 'ItemPrice', 'TotalCost']
            var csv = (headers.join(',') + '\r\n');

            getData.forEach(function(row) {
                const values = headers.map(function(header) {
                    return row[header]
                })
                csv += (values.join(',') + '\r\n')
            });

            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
            hiddenElement.target = '_blank';
            hiddenElement.download = 'Usage-vs-Purchases Report.csv';
            hiddenElement.click();
			that.export_loading = false;
        }
		
        that.$onInit = function () {
			Promise.all([api.get_vendors_categories({is_restaurant_used_only: 1, inventory_type_id: 1}), core.getRefbooks()]).then(function(response) {
				that.categories = response[0].data.data.categories.filter(function(x) {return x.category != 'Non Alcoholic'});
				that.categories.unshift({id: -1, category: '--All Categories--', inventory_type_id: 1});
				that.category = that.categories[0];
				var cat_ids = that.categories.map(function(x){return x.id});
				that.all_subcategories = response[1].vendor_sub_cat.filter(function(x){return cat_ids.includes(x.vendor_cat_id)});
				that.subcategories = JSON.parse(JSON.stringify(that.all_subcategories));
				that.subcategory = {id: -1, sub_category: '--All Subcategories--'};
				that.mode = 'summary';
				that.PurchasesVsUsage();
				that.export_loading = false;
				//that.VendorTable();
			});
        };
    }

    foodUsageVsPurchaseController.$inject = ['api', '$state', '$filter', 'auth', 'core', 'localStorageService', 'restaurant', '$uibModal', '$rootScope', '$scope'];

    angular.module('inspinia').component('foodUsageVsPurchaseComponent', {
        templateUrl: 'js/components/reports/foodUsageVsPurchase/foodUsageVsPurchase.html',
        controller: foodUsageVsPurchaseController,
        controllerAs: '$ctr',
        bindings: {}
    });

})();
