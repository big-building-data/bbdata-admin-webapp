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
     * @name thymioCaptain.app
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
            'semantic.toggle-button'
        ] ).run( run );

    webapp.constant( "RFC3339_FORMAT", "YYYY-MM-DDTHH:mm:ssZ" );
    webapp.constant( "DISPLAY_PAGE", 0 );
    webapp.constant( "SENSORS_PAGE", 1 );
    webapp.constant( "TLS_SLS_PAGE", 2 );

    function run( $rootScope ){
        $rootScope.page = 0;
        $rootScope.page_init = [false, false, false];
        $rootScope.$watch( 'page', function( to, from ){
            $rootScope.page_init[to] = true;
            $rootScope.$broadcast( 'bbdata.PageChanged', {from: from, to: to} );
        } );
    }

}());