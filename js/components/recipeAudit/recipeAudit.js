(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('recipeAudit', {
                url: "/recipeAudit/:typeInventory",
                template: "<recipe-audit-component></recipe-audit-component>",
                data: {pageTitle: 'Recipe Audit Pad'},
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