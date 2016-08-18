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
     * @name bbdata.login
     * @description This module is responsible for the login page

     *
     * @author Lucy Linder
     * @date     May 2016
     * @context  BBData
     */
    angular.module( 'bbdata.login',
        // dependencies
        [
            'ngAnimate'

        ] ).controller( 'LoginController', controller );


    function controller( $http, $window ){
        var self = this;

        self.login = function( auth ){
            console.log( "LOGIN", auth );
            $http.post( '/api/login', auth, {headers: {'Content-Type': 'application/json'}} ).then( function(){
                $window.location.href = "/";
            }, function( error ){
                console.log( "ERROR", error );
                formatError( error.data );
            } );
        };

        function formatError( error ){
            if( error.details ){
                self.errors = error.details;
            }else{
                self.errors = "Could not login. Check your information and try again.";
            }
            console.log( self.errors );
        }
    }


})();