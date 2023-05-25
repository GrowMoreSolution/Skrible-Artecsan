 function acPassword ($filter, $parse) {
    "ngInject";

    return {
        require: '^ngModel',
        //scope: true,
        link: function link(scope, el, attrs, modelCtrl) {

            function isValid(value) {
                if (value.length < 8) return false;

                var hasDigit = false;
                var hasUpperCaseLetter = false;
                for (var i = 0; i < value.length; i++) {
                    var c = value[i];
                    if (c >= '0' && c <= '9') {
                        hasDigit = true;
                    }
                    if (c >= 'A' && c <= 'Z') {
                        hasUpperCaseLetter = true;
                    }
                }

                return hasUpperCaseLetter && hasDigit;
            }

            function isEmpty(value) {
                return (value === undefined || value === null || value === "");
            }

            function formatter(value) {

                if (isEmpty(value)) return value;

                var valid = isValid(value);

                modelCtrl.$setValidity('password', valid);

                return value;
            }

            modelCtrl.$formatters.push(formatter);

            modelCtrl.$parsers.push(function (value) {

                if (isEmpty(value)) return value;

                var valid = isValid(value);

                modelCtrl.$setValidity('password', valid);

                return value;
            });
        }
    };
}

angular
    .module('inspinia')
    .directive('acPassword', acPassword);