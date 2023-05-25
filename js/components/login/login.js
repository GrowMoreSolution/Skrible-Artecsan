(function () {

    "use strict";

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('login', {
                url: "/login",
                template: "<login-component></login-component>",
                data: {pageTitle: 'Login', specialClass: 'login-page'},
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'vcRecaptcha',
                                files: ['js/plugins/angular-recaptcha.min.js']
                            }
                        ]);
                    }
                }
            });

    })

})();