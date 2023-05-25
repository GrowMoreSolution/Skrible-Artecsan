(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('alcoholSetup.menu', {
                url: "/menu-setup",
                template: "<alcohol-create-menu-item-component></alcohol-create-menu-item-component>",
                data: {pageTitle: ' Create Menu Item'}
            });
    })

})();