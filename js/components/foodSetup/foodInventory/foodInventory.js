(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('foodSetup.foodInventory', {
                url: "/inventory/:is_sug_aud",
                template: "<food-inventory-component></food-inventory-component>",
                data: {pageTitle: ' Food Inventory Audit Pad'},
                resolve: {
                    refbooks: function (core) {
                       return core.getRefbooks().then(function (res) {
                            return res
                        });
                    }
                }
            });
    })

})();