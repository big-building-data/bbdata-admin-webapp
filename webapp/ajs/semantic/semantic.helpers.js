(function(){

    angular
        .module( 'semantic.helpers', [] )
        /**
         * @ngdoc directive
         * @name semanticPopup
         * @restrict A
         * @description initialise a semantic popup.
         * See <a href="http://semantic-ui.com/modules/popup.html">popups</a>.
         * @param "hover|click|focus" when the popup should be shown.
         */
        .directive( 'semanticPopup', semanticPopup )
        /**
         * @ngdoc directive
         * @name semanticSticky
         * @restrict A
         * @description initialise a semantic sticky element.
         * See <a href="http://semantic-ui.com/modules/sticky.html">sticky</a>.
         */
        .directive( 'semanticSticky', semanticSticky )
        /**
         * @ngdoc directive
         * @name semanticToggleButton
         * @restrict E
         * @scope
         * @description create a toggle button. The element is transluded and can possess
         * an ngModel set to a boolean.
         * @attr {string} toggleText the text of the button when inactive and active.
         * Syntax: "inactive text:active text".
         * @attr {string} toggleClass the classes to toggle when inactive and active.
         * Syntax: "inactive class:active class"
         * See <a href="http://semantic-ui.com/modules/sticky.html">sticky</a>.
         */
        .directive( 'semanticToggleButton', toggleButton )

        .directive( 'semanticDropdown', dropdown );


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
            require   : '?ngModel',

            link: function( scope, element, attrs, ngModel ){
                scope.active = ngModel && ngModel.$viewValue === true ? false : true;

                var texts = scope.toggleText.split( ":" );
                var cls = scope.toggleClass ? scope.toggleClass.split( ":" ) : ["", ""];

                var toggleFunc = function(){
                    element.text( scope.active ? texts[0] : texts[1] );
                    element.removeClass( scope.active ? cls[1] : cls[0] );
                    element.addClass( scope.active ? cls[0] : cls[1] );
                    scope.active = !scope.active;
                    if( ngModel ){
                        ngModel.$setViewValue( scope.active );
                    }
                };

                toggleFunc();
                element.on( 'click', toggleFunc );
            }
        };
    }

    function dropdown(){
        return {
            restrict  : 'E',
            replace   : true,
            transclude: true,
            template  : '<select class="ui dropdown" ' +
            'ng-transclude></select>',
            //require   : '?ngModel',

            link: function( scope, element, attrs, ngModel ){
                setTimeout( function(){
                    element.dropdown( {on: 'click'} );
                }, 200 );
            }
        };
    }

})();
