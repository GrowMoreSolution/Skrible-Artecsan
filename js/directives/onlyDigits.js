function onlyDigits () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue == undefined) return null;
                if (inputValue == null) return null;
                if (inputValue == "") return null;
                if (typeof inputValue === "number") return inputValue;

                var intValue = parseInt(inputValue, 10);

                if (!Number.isFinite(intValue)) {
                    modelCtrl.$setViewValue('');
                    modelCtrl.$render();
                    return null;
                }

                if (intValue.toString() !== inputValue) {
                    modelCtrl.$setViewValue(intValue.toString());
                    modelCtrl.$render();
                }

                return intValue;
            });
        }
    };
}

angular
    .module('inspinia')
    .directive('onlyDigits', onlyDigits);