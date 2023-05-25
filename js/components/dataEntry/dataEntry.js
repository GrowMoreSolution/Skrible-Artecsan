(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.dataEntry', {
                url: "/dataEntry",
                template: "<dataentry></dataentry>",
                data: {pageTitle: 'Data Entry'}
            });
    })

})();
