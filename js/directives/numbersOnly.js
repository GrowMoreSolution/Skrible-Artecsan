function numbersOnly () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {

            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);

        }
    };
}

angular
    .module('inspinia')
    .directive('numbersOnly', numbersOnly);