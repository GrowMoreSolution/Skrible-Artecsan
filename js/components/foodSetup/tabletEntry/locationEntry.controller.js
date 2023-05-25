(function() {
  "use strict";

	function addEditFoodLocationsController($uibModalInstance, api, alertService, locations, restaurant_id) {
		
		var that = this;
		that.form = {};
		that.api = api;
		
		that.addLocation = function () {
			//to check make a get call and then check?
			if(that.active_locations_length < that.locations_limit){
				that.active_locations_length++;
				that.locations.push({location_name: null, status: 1, added: true});
			}
			else{
				alertService.showError('Active locations limit reached!');
				return;
			}
		}
		
		that.changeLocationsStatus = function ($index, action) {
			if(action == 'hide'){
				that.active_locations_length--;
				that.locations[$index].status = 0;
			}
			else{
				if(that.active_locations_length < that.locations_limit){
					that.active_locations_length++;
					that.locations[$index].status = 1;
				}
				else{
					alertService.showError('Active locations limit reached!');
					return;
				}
			}
		}
		
		that.remove = function ($index) {
			if(that.locations[$index].status == 1){
				that.active_locations_length--;
			}
			that.locations.splice($index, 1);
		}
		
		that.save = function(form) {
			if (!form.$valid) {
                alertService.showError('Please validate all inputs');
				return;
            }
			else{
				if(that.active_locations_length <= that.locations_limit){
					//go ahead and save
					var headers = {
						restaurant_id: restaurant_id,
						inventory_type_id: 1,
						loc_list: that.locations
					};
					
					that.api.add_edit_locations(headers).then(function(res) {
						try {
							if (res.data.data.code === 1000) {
								alertService.showSuccessText('Saved!');
								that.getLocations();
							}
						} catch (e) {
							console.log(e)
						}
					});
				}
				else{
					alertService.showError('Active locations limit reached!');
					return;
				}
				//$uibModalInstance.close(that.item);
			}
		};

		that.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};
		
		that.getLocations = function () {
			var headers = {
				restaurant_id: restaurant_id,
				inventory_type_id: 1
			};
			
			that.api.get_restaurant_audit_locations(headers).then(function(res) {
				that.locations = res.data.data.Report;
				that.active_locations_length = that.locations.filter(function(x){return x.status == 1}).length;
				if(that.show_status == 'active'){
					that.locations = that.locations.filter(function(x){return x.status == 1});
				}
				else{
					that.locations = that.locations.filter(function(x){return x.status == 0});
				}
			});			
		}
		
		that.locations_limit = 7;
		that.show_status = 'active';
        that.getLocations();
	}

	addEditFoodLocationsController.$inject = ["$uibModalInstance", "api", "alertService", "locations", "restaurant_id"];
  
	angular
    .module("inspinia")
    .controller("addEditFoodLocationsController", addEditFoodLocationsController);
})();