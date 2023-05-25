(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('administrator.invite', {
                url: "/invite",
                template: "<admin-invite-component></admin-invite-component>",
                data: {pageTitle: 'Invite Users'}
            });

    })

})();