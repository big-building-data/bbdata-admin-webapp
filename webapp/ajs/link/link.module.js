(function () {
    angular.module('link', []).
        directive('activeLink', linkDirective);


    function linkDirective($location, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var clazz = attrs.activeLink;
                var path = attrs.href;
                path = path.substring(1); // hack because path does not return including hashbang
                scope.location = $location;
                scope.$watch('location.path()', function (newPath) {
                    $rootScope.path = newPath.substring(1); // remove start slash
                    if (path === newPath) {
                        element.addClass(clazz);
                    } else {
                        element.removeClass(clazz);
                    }
                });
            }
        };
    }
})();