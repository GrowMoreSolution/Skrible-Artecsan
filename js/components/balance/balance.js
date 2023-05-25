(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.balance', {
                url: "/balance",
                template: "<balance></balance>",
                data: {pageTitle: 'Accounting'}
            });
    })

})();


