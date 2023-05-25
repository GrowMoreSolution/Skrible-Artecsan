(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.employeelist', {
                url: "/employeelist",
                template: "<employeelist></employeelist>",
                data: {pageTitle: 'Employee List'}
            });
    })

})();


