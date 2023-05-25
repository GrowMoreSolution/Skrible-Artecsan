(function () {

    "use strict";

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('food.newFoodOrder', {
                url: "/new-food-order",
                template: "<new-order-component></new-order-component>",
                data: {pageTitle: 'New Food Order'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                            },
                            {
                                name: 'ui.footable',
                                files: ['js/plugins/footable/angular-footable.js']
                            }
                        ]);
                    }
                }
            })

    })

})();