(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.schedulingsetupandbudget', {
                url: "/schedulingsetupandbudget",
                template: "<schedulingsetupandbudget></schedulingsetupandbudget>",
                data: {pageTitle: 'Scheduling Setup and Budget'}
            });
    })

})();


