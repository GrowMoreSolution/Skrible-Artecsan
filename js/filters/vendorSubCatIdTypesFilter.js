(function () {

    "use strict";

    var typesFilter = function () {
        return function (items, prop) {
            var name;
            if (prop) {
                angular.forEach(items, function (value, key) {
                    if (value.id == prop) {
                        name = value.is_indivisible;
                    }
                });
            }

            return name;

        }
    };

    angular.module('inspinia').filter('vendorSubCatIdTypeFilter', typesFilter);

})();