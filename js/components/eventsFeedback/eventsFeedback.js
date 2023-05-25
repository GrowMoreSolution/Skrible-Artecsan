(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {

        $stateProvider
            .state('admin.eventsFeedback', {
                url: "/eventsFeedback",
                template: "<events-feedback-component></events-feedback-component>",
                data: {pageTitle: 'Events Feedback'}
            });
    })

})();
