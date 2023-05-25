(function () {

    "use strict";

    var tareTypeFilter = function () {
        return function (items, prop) {
            var name;
            if (prop) {
                angular.forEach(items, function (value, key) {
                    if (value.tare_type_id == prop) {
                        name = value.name;
                    }
                });
            }

            return name;

        }
    };

    angular.module('inspinia').filter('tareTypeFilter', tareTypeFilter);

})();