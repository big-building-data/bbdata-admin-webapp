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
        // delete header from client:
        // cf: http://stackoverflow.com/questions/17289195/angularjs-post-data-to-external-rest-api
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.headers.common['bbuser'] = 1;
        $httpProvider.defaults.headers.common['bbtoken'] = 'lala';
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // handle the from/to base64 (program argument only)
        // $httpProvider.defaults.transformRequest.unshift( function( data, headerGetter ){
        //    console.log("data ", data);
        //    return data;
        // } );

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
