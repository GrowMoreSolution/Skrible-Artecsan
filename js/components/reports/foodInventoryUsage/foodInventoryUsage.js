(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.food.inventoryUsage', {
                url: "/inventory-usage",
                template: "<inventory-usage></inventory-usage>",
                data: {pageTitle: 'Inventory Usage'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                files: ['js/plugins/moment/moment.min.js']
                            },
                            {
                                name: 'datePicker',
                                files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                            }

                        ]);
                    }
                }
            });
    })

})();