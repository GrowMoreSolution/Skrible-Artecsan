(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.foodInventory', {
                url: "/inventory/:typeInventory",
                template: "<alcohol-inventory-component></alcohol-inventory-component>",
                data: {pageTitle: ' Alcohol Inventory Audit Pad'},
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