(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.employeeschedulingmodule', {
                url: "/employeeschedulingmodule",
                template: "<employeeschedulingmodule></employeeschedulingmodule>",
                data: {pageTitle: 'Employee Scheduling Module'}
            });
    })

})();


