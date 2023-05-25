(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('reports.foodSalesReport', {
                url: "/food-sales-report",
                template: "<food-sales-report-component></food-sales-report-component>",
                data: {pageTitle: 'Sales Report'},
				resolve: {
                        loadPlugin: function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                {
                                    files: ['js/plugins/footable/footable.all.min.js', 'css/plugins/footable/footable.core.css']
                                },
                                {
                                    name: 'ui.footable',
                                    files: ['js/plugins/footable/angular-footable.js']
                                },
                                {
                                    serie: true,
                                    files: ['css/plugins/c3/c3.min.css', 'js/plugins/d3/d3.min.js', 'js/plugins/c3/c3.min.js']
                                },
                                {
                                    serie: true,
                                    name: 'gridshore.c3js.chart',
                                    files: ['js/plugins/c3/c3-angular.min.js']
                                }
                            ]);
                        }
                    }
            });
    })
 
})();
