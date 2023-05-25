(function () {
  'use strict';

  angular.module('inspinia').config(function ($stateProvider) {

      $stateProvider
          .state('alcoholSetup.tabletEntry', {
              url: "/tablet-entry/:is_sug_aud",
              template: "<tablet-entry-component></tablet-entry-component>"
          });
  })

})();