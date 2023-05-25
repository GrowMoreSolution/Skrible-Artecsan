(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
                .state('administrator.auditControlCenter', {
                    url: "/audit-control-center",
                    template: "<audit-control-center-component></audit-control-center-component>",
                    data: {pageTitle: 'Audit Control Center'},
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
                });
    });

})();
