(function () {
    'use strict';

    angular.module('inspinia').config(function ($stateProvider) {
        $stateProvider
			.state('alcoholSetup.setPar', {
				url: "/set-par",
				template: "<set-par-component></set-par-component>",
				data: {pageTitle: 'Set Par'}
			});
    });
})();
