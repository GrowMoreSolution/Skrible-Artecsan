(function () {

    "use strict";

    var utils = function () {

        var tackDictionary = function (input, dictionary, key, value) {
            if (input === undefined) return null;
            if (input === null) return null;
            if (input === "") return null;
            var d = dictionary;
            if (d) {
                for (var i = 0; i < d.length; i++) {
                    if (d[i][key] == input) {
                        return d[i][value];
                    }
                }
            }
            return input;
        };

        return {
            tackDictionary: tackDictionary
        };
    };

    utils.$inject = [];
    angular.module('inspinia').factory('utils', utils);

})();