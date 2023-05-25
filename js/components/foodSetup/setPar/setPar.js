(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {
        $stateProvider
			.state('foodSetup.setPar', {
				url: "/set-par",
				template: "<set-food-par-component></set-food-par-component>",
				data: {pageTitle: 'Set Par'}
			});
    });
})();
