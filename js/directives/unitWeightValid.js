function unitWeightValid(SweetAlert) {
    "ngInject";

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
            $(elem).blur(function (event) {


                if (ngModel.$viewValue) {
                    var unitWeightFormula = ngModel.$viewValue.match(/\d+((,|\.)\d+)?/g);
                    var tareWeight = scope.$parent.i.tare_weight;
                    var ofBottles = scope.$parent.i.nof_bottles;
                    var unitWeight = scope.$parent.i.item_qty;


                    if (unitWeight == 0 && ofBottles == 0) {
                        ngModel.$setValidity('unique', true);
                        ngModel.$setPristine();
                        ngModel.$setUntouched();
                    }

                    angular.forEach(unitWeightFormula, function (unitWeight) {
                        if (ofBottles > 0) {
                            if (unitWeight < tareWeight) {
                                ngModel.$setValidity('unique', false);
                                SweetAlert.swal({
                                    title: 'Error',
                                    text: 'Each term must be greater than the tare weight!',
                                    showConfirmButton: false,
                                    type: "error",
                                    timer: 3000
                                });
                            } else {
                                ngModel.$setValidity('unique', true);
                                ngModel.$setPristine();
                            }
                        }
                    });
                } else {
                    ngModel.$setValidity('unique', true);
                    ngModel.$setPristine();
                    ngModel.$setUntouched();
                }
            })


        },
        scope: {
            model: '='
        }
    };
}

angular
    .module('inspinia')
    .directive('unitWeightValid', ['SweetAlert', unitWeightValid]);