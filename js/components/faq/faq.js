(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.faq', {
                url: "/faq",
                template: "<faq></faq>",
                data: {pageTitle: 'FAQs'}
            });
    })

})();
