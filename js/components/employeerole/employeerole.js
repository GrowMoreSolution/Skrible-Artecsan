(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.employeerole', {
                url: "/employeerole",
                template: "<employeerole></employeerole>",
                data: {pageTitle: 'Employee Role'}
            });
    })

})();


