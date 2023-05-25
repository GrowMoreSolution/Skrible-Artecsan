(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.expenseBudget', {
                url: "/expenseBudget",
                template: "<expense-budget-component></expense-budget-component>",
                data: {pageTitle: 'Expense Budget'}
            });
    })

})();
