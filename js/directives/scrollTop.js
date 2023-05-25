function scrollTop () {
    return {
        restrict: 'A',
        link: function(scope, $elm) {
            $elm.on('click', function() {
                $("body").animate({scrollTop: $elm.scrollTop()}, "slow");
            });
        }
    };
}

angular
    .module('inspinia')
    .directive('scrollTop', scrollTop);