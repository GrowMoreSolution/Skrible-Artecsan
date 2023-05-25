(function () {
  'use strict';

  angular.module('inspinia').config(function ($stateProvider) {

      $stateProvider
          .state('foodSetup.tabletEntry', {
              url: "/tablet-entry/:is_sug_aud",
              template: "<tablet-entry-component-food></tablet-entry-component-food>"
          });
  })

})();