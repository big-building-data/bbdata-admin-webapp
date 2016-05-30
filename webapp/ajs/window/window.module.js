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
     * @name bbdata.window.app
     * @description This module is the one responsible for the popup window with auto updated graph.

     *
     * @author Lucy Linder
     * @date     May 2016
     * @context  BBData
     */
    var webapp = angular.module( 'bbdata.window.app',
        // dependencies
        [
            'bbdata.rest'
        ] );

    webapp.constant( "RFC3339_FORMAT", "YYYY-MM-DDTHH:mm:ssZ" );


}());