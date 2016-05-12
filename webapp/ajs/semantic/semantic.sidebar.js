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
                closable   : '@'
            },
            link      : function( scope, element, attrs ){
                element.appendTo( $( 'body' ) );
                element.sidebar( 'setting', 'dimPage', false );
                element.sidebar( 'setting', 'closable', scope.closable === true ? true : false );
                element.sidebar( 'setting', 'transition', scope.transition ? scope.transition : 'auto' );
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