(function () {

    "use strict";

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcohol.editAlcoholOrder', {
                url: "/edit-alcohol-order/:id",
                template: "<new-order-component></new-order-component>",
                data: {pageTitle: 'Edit Alcohol Order'}
            })

    })

})();