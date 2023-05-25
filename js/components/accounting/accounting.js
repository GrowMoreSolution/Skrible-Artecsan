(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.accounting', {
                url: "/accounting",
                template: "<accounting></accounting>",
                data: {pageTitle: 'Accounting'}
            });
    })

})();


