/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     February 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function(){

    /**
     * @ngdoc overview
     * @name bbdata.app
     * @description This module is the one responsible for the whole BBData App.
     * It is mainly composed of controllers.

     *
     * @author Lucy Linder
     * @date     May 2016
     * @context  BBData
     */
    var webapp = angular.module( 'bbdata.app',
        // dependencies
        [
            'bbdata.rest',
            'ngAnimate',
            'as.sortable',
            'semantic.modals',
            'semantic.sidebar',
            'semantic.helpers',
            'toaster',
            'ngFileSaver',
            'dirPagination'
        ] ).run( run );

    webapp.constant( "RFC3339_FORMAT", "YYYY-MM-DDTHH:mm:ssZ" );
    webapp.constant( "ROOT_URL", "/secured" );

    /*
     * number bound to each page.
     * Useful to watch pages switch inside a controller
     */
    webapp.constant("NUM_PAGES", 4);
    webapp.constant( "OBJECTS_PAGE", 0 );
    webapp.constant( "OGROUPS_PAGE", 1 );
    webapp.constant( "DISPLAY_PAGE", 2 );
    webapp.constant( "PROFILE_PAGE", 3 );


    webapp.factory( 'ErrorHandler', ErrorHandler );
    /*
     * page switch management.
     * the variable $root.page contains the number associated
     * with the page currently shown (see constants + index.html).
     * Upon page switch, an event "bbdata.PageChanged" is fired.
     *
     * Each controller can then watch the page changes and take
     * action when its bound page is shown/hidden.
     *
     * the $root.page_init[<page num>] variable is set to true the
     * first time the page is shown. Useful for lazy loading (see
     * index.html and the ng-if directive)
     */
    function run( $rootScope, $location, NUM_PAGES ){

        $rootScope.page_init = new Array(NUM_PAGES);
        $rootScope.page = 0;

        // try to get the current page from url (#X)
        var n = parseInt( $location.path().substr( 1 ) );
        if( !isNaN( n ) && n > 0 && n < NUM_PAGES ){
            $rootScope.page = n;
        }

        $rootScope.$watch( 'page', function( to, from ){
            // force page load
            $rootScope.page_init[to] = true;
            // fire the event
            $rootScope.$broadcast( 'bbdata.PageChanged', {from: from, to: to} );
        } );
    }

    function ErrorHandler(ErrorParser, toaster){
        return {
            handle: function( error ){
                console.log( error );
                toaster.error( {body: ErrorParser.parse( error )} );
            }
        };
    }


}());