(function() {
  "use strict";

	function addItemsController($uibModalInstance, alertService, searchParams, locations, selected_location) {
		
		var that = this;
		var parseStringToNum = function(st) {
			return st
			.split("+")
			.filter(function(item) {
				return item.split("_")[0] !== "";
			})
			.map(function(item, i) {
				return {
					id: i,
					value: parseFloat(item.split("_")[0]),
					locn_id: parseInt(item.split("_")[1])
				};
			});
		};
		
		var parseNumToString = function(array) {
			return array
			.map(function(item) {
				return item.value+"_"+item.locn_id;
			})
			.join("+");
		};

		if (searchParams) {
		  that.item = searchParams;
		  that.locations = locations;
		  that.selected_location = selected_location;
		}

		that.entries = {
			full: that.item.full_values != null ? parseStringToNum(that.item.full_values) : [],
			partial: that.item.partial_values != null ? parseStringToNum(that.item.partial_values) : []
		};
		
		that.checkPartial = function($index, value) {
			if(!(value >= that.item.tare_weight && value <= that.item.full_weight)){	//incorrect value
				alertService.showError("Incorrect partial weight! Try again");
				that.entries.partial.splice($index, 1);
			}
		}
		
		that.addField = function() {
			var fid = that.entries.full.length ? that.entries.full.length + 1 : 0;
	        that.entries.full.push({
				id: fid,
				value: 0,
				locn_id: selected_location
			});
	  
			if(that.item.category != 'Bottle Beer'){
				var pid = that.entries.partial.length ? that.entries.partial.length + 1 : 0;
				that.entries.partial.push({
					id: pid,
					value: 0,
					locn_id: selected_location
				});
			}
		};
		
		that.removeField = function(type, index) {
			if(type == 'full'){
				that.entries.full.splice(index, 1);
			}
			else if (type == 'partial'){
				that.entries.partial.splice(index, 1);
			}
		};
    
		that.save = function() {
			that.item.full_values = that.entries.full != null ? parseNumToString(that.entries.full) : null;
			that.item.partial_values = that.entries.partial != null ? parseNumToString(that.entries.partial) : null;
			$uibModalInstance.close(that.item);
		};

		that.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};
	}

	addItemsController.$inject = ["$uibModalInstance", "alertService", "searchParams", "locations", "selected_location"];
  
	angular
    .module("inspinia")
    .controller("addItemsController", addItemsController);
})();