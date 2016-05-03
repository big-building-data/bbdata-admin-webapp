/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     May 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function(){

    /**
     * @ngdoc overview
     * @name bbdata.rest
     * @requires $resource
     * @description
     * This module handles the interaction with the server and the app front end.
     */
    angular
        .module( 'bbdata.rest', ['ngResource'] )
        .config( configure );

    // ----------------------------------------------------

    function configure( $httpProvider ){

        // handle the from/to base64 (program argument only)
        //$httpProvider.defaults.transformRequest.unshift( function( data, headerGetter ){
        //    if( data && data.program ){
        //        data.program = $base64.encode( JSON.stringify( data.program ) );
        //    }
        //    return data;
        //} );
        //
        //$httpProvider.defaults.transformResponse.push( function( data, headerGetter ){
        //    if( data && data.hasOwnProperty("program") ){
        //        if(data.program) {
        //            data.program = JSON.parse($base64.decode(data.program));
        //        }else{
        //            data.program = [];
        //        }
        //    }
        //    return data;
        //} );

    }


}());
