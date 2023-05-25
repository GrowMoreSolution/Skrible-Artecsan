(function () {

    "use strict";

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('food.editFoodOrder', {
                url: "/edit-food-order/:id",
                template: "<new-order-component></new-order-component>",
                data: {pageTitle: 'Edit Food Order'}
            })

    })

})();