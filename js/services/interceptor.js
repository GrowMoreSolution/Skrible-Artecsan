(function () {

    "use strict";

    var interceptorService = function (appConfig, $injector, $q, $location, $rootScope) {

        var serviceBase = appConfig.apiDomain;

        var request = function (config) {
            if (config.url.indexOf(serviceBase) === 0) {
                config.headers = config.headers || {};
                if ($rootScope.userData.isLogged) {
                    config.headers.Authorization = appConfig.token;
                }
            }
            return config;
        };

        var responseError = function (rejection) {
            if (rejection.status === 401) {
                //var authService = $injector.get('auth');
                //authService.clear();
                //$location.path('/login');
            }
            return $q.reject(rejection);
        };

        var response = function (response) {
            if (typeof response.data == 'object') {
                if (typeof response.data.error == 'object') {
                    var alertService = $injector.get('alertService');
                    if (response.data.error.code === 2043) {
                        alert(response.data.error.message);
                        return;
                    }
                    if (response.data.error.code != 2001 && response.data.error.code != 1000) {
                        alertService.showAPIError(response.data.error, response.data.validation_Error);
                    }
                    if (response.data.error.code == 2001) {
                        var authService = $injector.get('auth');
                        if (authService.authentication.showPopup) {
                            alertService.showAlertTimeout();
                        }
                        authService.logOut();
                    } else if (response.data.error.code != 2017) {
                        alertService.showAPIError(response.data.error, response.data.validation_Error);
                    }
                }
            }
            return response;
        };

        return {
            response: response,
            request: request,
            responseError: responseError
        };
    };

    interceptorService.$inject = ['appConfig', '$injector', '$q', '$location', '$rootScope'];
    angular.module('inspinia').factory('interceptorService', interceptorService);

})();