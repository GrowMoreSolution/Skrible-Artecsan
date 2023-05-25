(function () {

    "use strict";

    var authService = function (api, $q, localStorageService, $rootScope, appConfig, $injector, $state, $timeout) {

        var that = this;
        that.userData = {
            showPopup: false, // "Session expired"
            isLogged: false,
            user: null
        };

        $rootScope.userData = that.userData;

        var setUser = function (user) {
            that.userData.isLogged = true;
            that.userData.user = user;
            appConfig.token = 'Bearer ' + that.userData.user.access_token;
            $rootScope.userData = that.userData;
            $timeout(function () {
                that.userData.showPopup = true
            }, 10 * 1000);
            return that.userData;
        };

        var updateMyInfo = function (user) {
            that.userData.user = user;
            localStorageService.set('adminAuthorizationData', {
                authenticationInfo: setUser(user)
            });
        };

        var clearUserData = function () {
            that.userData = {
                isLogged: false,
                user: null,
                showPopup: false // "Session expired"
            };
            appConfig.token = null;
            $rootScope.userData = that.userData;
            // Clear all static data and User info
            localStorageService.clearAll();
            var auth = $injector.get('auth');
            var restaurant = $injector.get('restaurant');

            restaurant.set_restaurant(0);

            auth.authentication = that.userData;
        };

        var login = function (model) {
            var deferred = $q.defer();
            api.auth_login(model).then(function (success) {
                if (success.data.data) {
                    if (success.data.data.message === 'OK') {
                        localStorageService.set('adminAuthorizationData', {
                            authenticationInfo: setUser(success.data.data.user)
                        });
                    }
                    deferred.resolve(success);
                } else {
                    deferred.reject(success);
                }
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        var logOut = function () {
            clearUserData();
            $state.go('login');
        };

        var fillAuthData = function () {

            var authData = localStorageService.get('adminAuthorizationData');
            if (authData) {
                if (authData.authenticationInfo) {
                    setUser(authData.authenticationInfo.user);
                }
            }

        };

        return {
            login: login,
            logOut: logOut,
            fillAuthData: fillAuthData,
            setUser: setUser,
            updateMyInfo: updateMyInfo,
            authentication: that.userData
        };
    };

    authService.$inject = ['api', '$q', 'localStorageService', '$rootScope', 'appConfig', '$injector', '$state', '$timeout'];
    angular.module('inspinia').factory('auth', authService);

})();