(function(){

    angular
        .module( 'semantic.toggle-button', [] )
        .directive( 'semanticToggleButton', toggleButton );


    function toggleButton(){
        return {
            restrict  : 'E',
            replace   : true,
            transclude: true,
            template  : '<button class="ui button" ' +
            'ng-transclude></button>',
            scope     : {
                toggleText : '@',
                toggleClass: '@'
            },
            require: '?ngModel',

            link      : function( scope, element, attrs, ngModel ){
                scope.active = ngModel && ngModel.$viewValue  === true ? false : true;

                var texts = scope.toggleText.split( ":" );
                var cls = scope.toggleClass ? scope.toggleClass.split( ":" ) : ["",""];

                var toggleFunc = function(){
                    element.text( scope.active ? texts[0] : texts[1] );
                    element.removeClass( scope.active ? cls[1] : cls[0] );
                    element.addClass( scope.active ? cls[0] : cls[1] );
                    scope.active = !scope.active;
                    if(ngModel){
                        ngModel.$setViewValue(scope.active);
                    }
                };

                element.on( 'click', toggleFunc );
                toggleFunc();
            }
        };
    }

})();
