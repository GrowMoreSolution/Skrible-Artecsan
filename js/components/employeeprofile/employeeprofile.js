(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.employeeprofile', {
                url: "/employeeprofile",
                template: "<employeeprofile></employeeprofile>",
                data: {pageTitle: 'Employee Profile'}
            });
    })

})();


