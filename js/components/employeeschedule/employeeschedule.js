(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.employeeschedule', {
                url: "/employeeschedule",
                template: "<employeeschedule></employeeschedule>",
                data: {pageTitle: 'Employee Schedule'}
            });
    })

})();


