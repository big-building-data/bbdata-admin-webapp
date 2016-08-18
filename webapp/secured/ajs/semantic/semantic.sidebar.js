(function(){

    angular
        .module( 'semantic.sidebar', [] )
        .directive( 'sidebar', sidebar )
        .directive( 'sidebarTitle', sidebarTitle )
        .directive( 'sidebarItem', sidebarItem )
        .directive( 'sidebarItemGroup', sidebarItemGroup );

    function sidebar(){
        return {
            restrict  : 'E',
            replace   : true,
            transclude: true,
            template  : '<div class="ui left vertical sidebar menu" ' +
            'ng-transclude></div>',
            scope     : {
                buttonClass: '@',
                transition : '@',
                closable   : '@',
                afterToggle: '&'
            },

            link: function( scope, element, attrs ){
                element.appendTo( $( 'body' ) );

                var transition = scope.transition ? scope.transition : 'auto';

                if( scope.transition == "marginate" ){
                    transition = "overlay";
                    element.sidebar( 'setting', 'onHide', function(){
                        $( '.sidebar ~ .pusher' ).animate( {'margin-left': '0'}, 270 );
                    } );
                    element.sidebar( 'setting', 'onVisible', function(){
                        $( '.sidebar ~ .pusher' ).animate( {'margin-left': '265px'}, 440 );
                    } );
                }

                if( scope.afterToggle ){
                    element.sidebar( 'setting', 'onHidden', function(){
                        scope.afterToggle()( 'hide' );
                    } );
                    element.sidebar( 'setting', 'onShow', function(){
                        scope.afterToggle()( 'show' );
                    } );
                }

                element.sidebar( 'setting', {
                    dimPage         : false,
                    closable        : scope.closable === true ? true : false,
                    transition      : transition,
                    mobileTransition: transition
                } );
                element.sidebar( 'attach events', scope.buttonClass, 'toggle' );
            }
        };
    }

    function sidebarItemGroup(){
        return {
            restrict  : 'E',
            replace   : true,
            transclude: true,
            template  : '<div class="item">' +
            '<div class="ui small inverted header">{{ title }}</div>' +
            '<div class="menu" ng-transclude></div>' +
            '</div>',
            scope     : {
                title: '@'
            }
        };
    }

    function sidebarItem(){
        return {
            restrict  : 'E',
            replace   : true,
            transclude: true,
            template  : '<div class="item" ng-transclude></div>'
        };
    }

    function sidebarTitle(){
        return {
            restrict: 'E',
            replace : true,
            template: '<div class="item">' +
            '<i class="{{ icon }} icon"></i>' +
            '{{ title }}' +
            '</div>',
            scope   : {
                title: '@',
                icon : '@',
                href : '@'
            }
        };
    }

})();