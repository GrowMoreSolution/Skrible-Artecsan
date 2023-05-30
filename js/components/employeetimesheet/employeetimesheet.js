(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.employeetimesheet', {
                url: "/employeetimesheet",
                template: "<employeetimesheet></employeetimesheet>",
                data: {pageTitle: 'Employee Time Sheet'}
            });
    })

})();


