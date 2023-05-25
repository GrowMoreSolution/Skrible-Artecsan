function partialWeightValidator(SweetAlert) {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, elem, attr, ngModel) {
      ngModel.$validators.partialWeightValidator = function(
        modelValue,
        viewValue
      ) {
        var item = scope.$eval(attr["currentItem"]);
        var partialEntry = modelValue || viewValue;
        if (item) {
			if(item.selected_partial_input_mode == 'Pts'){
				if(partialEntry > 0 && partialEntry < 1){
					return true;
				}
			}
			else{
				if((item.category != 'Draft Beer' && item.category != 'Draft Wine') || ((item.category == 'Draft Beer' || item.category == 'Draft Wine') && item.selected_partial_input_mode == 'Oz')){
					if (partialEntry >= item.tare_weight && partialEntry <= item.full_weight) {
						return true;
					}
				}
				else{
					if (partialEntry * 16 >= item.tare_weight && partialEntry * 16 <= item.full_weight) {	//Draft Beer/Draft Wine and Lbs
						return true;
					}
				}
			}
        }
        return false;
      };
    }
  };
}

angular
  .module("inspinia")
  .directive("partialWeightValidator", ["SweetAlert", partialWeightValidator]);