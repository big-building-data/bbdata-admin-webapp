(function(){
    angular.module( 'bbdata.app' )
        .directive( 'activeLink', linkDirective )
        .directive( 'hoverClass', hoverClass )
        .directive( 'stopEvent', stopEvent )
        .directive( 'semanticPopup', semanticPopup )
        .directive( 'semanticSticky', semanticSticky )
        .directive('showHide', showHide);


    function linkDirective( $location, $rootScope ){
        return {
            restrict: 'A',
            link    : function( scope, element, attrs ){
                var clazz = attrs.activeLink;
                var path = attrs.href;
                path = path.substring( 1 ); // hack because path does not return including hashbang
                scope.location = $location;
                scope.$watch( 'location.path()', function( newPath ){
                    $rootScope.path = newPath.substring( 1 ); // remove start slash
                    if( path === newPath ){
                        element.addClass( clazz );
                    }else{
                        element.removeClass( clazz );
                    }
                } );
            }
        };
    }


    function hoverClass(){
        return {
            restrict: 'A',
            scope   : {
                hoverClass: '@'
            },
            link    : function( scope, element ){
                var split = scope.hoverClass.split( ":" );

                var clsOut = split[0];
                var clsIn = split[1];

                element.addClass( clsOut );

                element.on( 'mouseenter', function(){
                    element.removeClass( clsOut );
                    element.addClass( clsIn );
                } );
                element.on( 'mouseleave', function(){
                    element.removeClass( clsIn );
                    element.addClass( clsOut );
                } );
            }
        };
    }

    function stopEvent(){
        return {
            restrict: 'A',
            link    : function( scope, element, attr ){
                if( attr && attr.stopEvent )
                    element.bind( attr.stopEvent, function( e ){
                        e.stopPropagation();
                    } );
            }
        }
    }

    function semanticPopup(){
        return {
            restrict: 'A',
            link    : function( scope, element, attr ){
                var on = attr.semanticPopup || 'hover';
                element.popup( {
                    on: on
                } );
            }
        }
    }

    function semanticSticky(){
        return {
            restrict: 'A',
            link    : function( scope, element, attr ){
                element.sticky( {
                    //context: '#stickyContext'
                } );
            }
        }
    }

    function showHide() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div ng-transclude></div>',
            link: function(scope, element, attr) {
                console.log($(attr.target));
                var showing = attr.showing === "true";
                if (!showing) element.hide();

                $(attr.target).on('click', function() {
                    if (showing) {
                        element.hide();
                    } else {
                        element.show();
                    }
                    showing = !showing;
                });

            }
        }
    }

})();