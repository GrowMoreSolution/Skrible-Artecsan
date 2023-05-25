function acPhone ($filter, $parse) {
    "ngInject";

    return {
        require: '^ngModel',
        scope: true,
        link: function link(scope, el, attrs, ngModelCtrl) {

            function getValue(value) {
                if (!value) return null;

                if (typeof value == 'number') value = value.toString();

                if (typeof value != 'string') return null;

                var phone = '';
                for (var i = 0; i < value.length; i++) {
                    var c = value[i];

                    if (c == '(' || c == ')' || c == ' ') {
                        continue;
                    }

                    if (c == '+') {
                        if (phone != '') {
                            return null;
                        }
                    }

                    if (c >= '0' && c <= '9') {
                        phone += c;
                    }
                }

                if (phone.length == 10) {
                    phone = '1' + phone;
                }

                return phone;
            }

            function isValid(value) {
                if (!value) return false;
                if (typeof value != 'string') return false;
                if (value[0] !== '1')return false;
                return value.length == 11;
            }

            function isEmpty(value) {
                return (value === undefined || value === null || value === "");
            }

            function getViewValue(p) {
                // +1 (000) 000 0000

                return p[1]+p[2]+p[3]+p[4]+p[5]+p[6]+p[7]+p[8]+p[9]+p[10];
            }

            function formatter(input) {

                if (isEmpty(input)) {
                    ngModelCtrl.$setValidity('phone', true);
                    return input;
                }

                const phoneValue = getValue(input);

                const isValidPhone = isValid(phoneValue);

                const formattedValue = isValidPhone ? getViewValue(phoneValue) : input;

                el.val(formattedValue);

                ngModelCtrl.$setViewValue(formattedValue);

                ngModelCtrl.$setValidity('phone', isValidPhone);

                return formattedValue;
            }

            ngModelCtrl.$formatters.push(formatter);

            ngModelCtrl.$parsers.push(function (input) {

                if (isEmpty(input)) {
                    ngModelCtrl.$setValidity('phone', true);
                    return input;
                }

                const phoneValue = getValue(input);

                const isValidPhone = isValid(phoneValue);

                ngModelCtrl.$setValidity('phone', isValidPhone);

                return isValidPhone ? phoneValue : input;
            });

            el.bind('focus', function () {
                var modelGetter = $parse(attrs.ngModel);
                var initialValue = modelGetter(scope);
                el.val(initialValue);
            });

            el.bind('blur', function () {
                formatter(el.val());
                scope.$apply();
            });
        }
    };
}

angular
    .module('inspinia')
    .directive('acPhone', acPhone);