(function () {

    "use strict";

    var common = function ($uibModal, $interval) {

        var that = {};

        that.full_Audit = function () {
            return $uibModal.open({
                templateUrl: 'views/modal/full_Audit.html',
                controller: function ($uibModalInstance, $scope) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                size: 'lg',
                controllerAs: '$ctr'
            })
        };
		
		that.adjustment_Audit = function () {
            return $uibModal.open({
                templateUrl: 'views/modal/adjustment_Audit.html',
                controller: function ($uibModalInstance, $scope) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                size: 'lg',
                controllerAs: '$ctr'
            })
        };
		
		that.beginFoodFullCount = function () {
            return $uibModal.open({
                templateUrl: 'views/modal/begin_food_full_count.html',
                controller: function ($uibModalInstance, $scope) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                size: 'lg',
                controllerAs: '$ctr'
            })
        };
		
		that.beginFoodAdjustmentCount = function () {
            return $uibModal.open({
                templateUrl: 'views/modal/begin_food_adjustment_count.html',
                controller: function ($uibModalInstance, $scope) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                size: 'lg',
                controllerAs: '$ctr'
            })
        };

        that.beginAlcoholInventoryCount = function () {
            return $uibModal.open({
                templateUrl: 'views/modal/begin_alcohol_inventory_count.html',
                controller: function ($uibModalInstance, $scope) {
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                windowClass: "animated fadeIn",
                size: 'lg',
                controllerAs: '$ctr'
            })
        };

        return that;
    };

    common.$inject = ['$uibModal', '$interval'];
    angular.module('inspinia').factory('common', common);

})();