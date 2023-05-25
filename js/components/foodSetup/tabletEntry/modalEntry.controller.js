(function() {
  "use strict";

	function addFoodItemsController($uibModalInstance, alertService, $filter, searchParams, locations, selected_location) {
		
		var that = this;
		
		if (searchParams) {
		  that.item = searchParams.item;
		  that.mode = searchParams.mode;
		  that.locations = locations;
		  that.selected_location = selected_location;
		}
		
		var parseStringToNum = function(st) {
			if(that.mode == 'inv'){
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
			}
			else{
				return st
				.split("+")
				.filter(function(item) {
					return item !== "";
				})
				.map(function(item, i) {
					return {
						id: i,
						value: parseFloat(item)
					};
				});
			}
		};
		
		var parseNumToString = function(array) {
			if(that.mode == 'inv'){
				return array
				.map(function(item) {
					return item.value+"_"+item.locn_id;
				})
				.join("+");
			}
			else{
				return array
				.map(function(item) {
					return item.value;
				})
				.join("+");
			}
		};
		
		if(that.mode == 'inv'){
			that.entries = {
				full: that.item.full_values != null ? parseStringToNum(that.item.full_values) : [],
				pack: that.item.pack_values != null ? parseStringToNum(that.item.pack_values) : [],
				partial: that.item.partial_values != null ? parseStringToNum(that.item.partial_values) : []
			};
		}
		else{
			that.entries = {
				full: [],
				partial: []
			};
			that.entries = [];
			for(var i=0; i< that.item.items.length; i++){
				var full = that.item.items[i].full_values != null ? parseStringToNum(that.item.items[i].full_values) : [];
				var partial = that.item.items[i].partial_values != null ? parseStringToNum(that.item.items[i].partial_values) : [];
				
				//full and partial will have same lengths guaranteed
				for(var j=0; j<full.length; j++){
					that.entries.push({recipe_created_on: new Date(that.item.items[i].recipe_created_on.substring(0,10).replace(/-/g, '\/')), full: full[j].value, partial: partial[j].value, visible: true});
				}
			}
		}
		
		that.addField = function() {
			if(that.mode == 'inv'){
				var fid = that.entries.full.length ? that.entries.full.length + 1 : 0;
				that.entries.full.push({
					id: fid,
					value: 0,
					locn_id: selected_location
				});
				
				var pkid = that.entries.pack.length ? that.entries.pack.length + 1 : 0;
				that.entries.pack.push({
					id: pkid,
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
			}
			else{
				that.entries.push({recipe_created_on: new Date(), full: 0, partial: 0, visible: true});
			}
		};
		
		that.removeField = function(index, type) {
			if(that.mode == 'inv'){
				if(type == 'full'){
					that.entries.full.splice(index, 1);
				}
				else if (type == 'pack'){
					that.entries.pack.splice(index, 1);
				}
				else if (type == 'partial'){
					that.entries.partial.splice(index, 1);
				}
			}
			else{
				that.entries[index].full = 0;
				that.entries[index].partial = 0;
				that.entries[index].visible = false;
			}
		};
		
		that._computeTotalByString = function(st) {
			if (st) {
				var nums = st
				  .split("+")
				  .filter(function(item) {
					item = item.split("_")[0];
					return item !== "";
				  })
				  .map(function(entry) {
					return parseFloat(entry);
				  });
				return nums.reduce(function(pV, cV) {
				  return pV + cV;
				});
			}
			return 0;
		};
		
		that._recalculateTotal = function(indx) {
			that.item.items[indx].n_partial_entries = 0;
			if(that.item.items[indx].partial_values != null){
				that.item.items[indx].n_partial_entries = that.item.items[indx].partial_values
				  .split("+")
				  .filter(function(item) {
					item = item.split("_")[0];
					return item !== "" && item != "0";
				  }).length;
			}
			that.item.items[indx].full_total = that._computeTotalByString(that.item.items[indx].full_values);
			that.item.items[indx].pack_total = that._computeTotalByString(that.item.items[indx].pack_values);
			that.item.items[indx].partial_total = that._computeTotalByString(that.item.items[indx].partial_values);
		}
		
		
		that.save = function() {
			if(that.mode == 'inv'){
				that.item.full_values = that.entries.full != null ? parseNumToString(that.entries.full) : null;
				that.item.pack_values = that.entries.pack != null ? parseNumToString(that.entries.pack) : null;
				that.item.partial_values = that.entries.partial != null ? parseNumToString(that.entries.partial) : null;
				$uibModalInstance.close(that.item);
			}
			else{
				for(var i = 0; i< that.item.items.length; i++){
					that.item.items[i].full_qty = 0;
					that.item.items[i].full_values = null;
					that.item.items[i].partial_qty = 0;
					that.item.items[i].partial_values = null;
					
				}
				
				for(var j = 0; j< that.entries.length; j++){
					var no_date = true;
					for(var i = 0; i< that.item.items.length; i++){
						if($filter('date')(that.item.items[i].recipe_created_on, 'yyyy-MM-dd') == $filter('date')(that.entries[j].recipe_created_on, 'yyyy-MM-dd')){
							no_date = false;
							
							that.item.items[i].full_values = that.entries[j].full != null ? that.item.items[i].full_values != null ? that.item.items[i].full_values + "+" + that.entries[j].full.toString() : that.entries[j].full.toString() : that.item.items[i].full_values != null ? that.item.items[i].full_values + "+0" : "0";
						
							that.item.items[i].partial_values = that.entries[j].partial != null ? that.item.items[i].partial_values != null ? that.item.items[i].partial_values + "+" + that.entries[j].partial.toString() : that.entries[j].partial.toString() : that.item.items[i].partial_values != null ? that.item.items[i].partial_values + "+0" : "0";
						}
					}
					
					if(no_date){
						that.item.items.push(JSON.parse(JSON.stringify(that.item.items[0])));
						var nd = that.item.items.length - 1;
						that.item.items[nd].recipe_created_on = $filter('date')(that.entries[j].recipe_created_on, 'yyyy-MM-dd');
						that.item.items[nd].full_values = that.entries[j].full != null ? that.entries[j].full.toString() : "0";
							
						that.item.items[nd].partial_values = that.entries[j].partial != null ? that.entries[j].partial.toString() : "0";
					}
				}
				
				for(var i = 0; i< that.item.items.length; i++){
					that._recalculateTotal(i);
				}
				
				$uibModalInstance.close(that.item);
			}
		};

		that.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};
	}

	addFoodItemsController.$inject = ["$uibModalInstance", "alertService", "$filter", "searchParams", "locations", "selected_location"];
  
	angular
    .module("inspinia")
    .controller("addFoodItemsController", addFoodItemsController);
})();