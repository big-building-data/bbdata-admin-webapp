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
     * @ngdoc data provider
     * @name bbdata.app.DataProvider
     *
     * @description
     * caches data used by multiple "pages"/controllers
     */
    angular
        .module( 'bbdata.app' )
        .factory( 'DataProvider', provider );

    function provider( RestService ){
        var self = this;

        self.getWritableObjects = function( resolve, reject ){

            if( self.writableObjects ){
                resolve( self.writableObjects );
                return;
            }

            _get( "getObjects", "writableObjects", {writable: true}, resolve, reject );
        };

        self.getWritableObjectGroups = function( resolve, reject ){

            if( self.writableObjectGroups ){
                resolve( self.writableObjectGroups );
                return;
            }

            _get( "getObjectGroups", "writableObjectGroups", {objects: true, writable: true}, resolve, reject );
        };

        self.getAllUserGroups = function( resolve, reject ){

            if( self.allUserGroups ){
                resolve( self.allUserGroups );
                return;
            }
            _get( "getAllUserGroups", "allUserGroups", {}, resolve, reject );
        };


        self.getAdminUserGroups = function( resolve, reject ){

            if( self.adminUserGroups ){
                resolve( self.adminUserGroups );
                return;
            }
            _get( "getMyUserGroups", "adminUserGroups", {admin: true}, resolve, reject );
        };

        self.getUnits = function( resolve, reject ){
            if( self.units ){
                resolve( self.units );
                return;
            }
            _get( "getUnits", "units", {}, resolve, reject );
        };

        self.getUsers = function( resolve, reject ){
            if( self.users ){
                resolve( self.users );
                return;
            }
            _get( "getUsers", "users", {}, resolve, reject );
        };

        // ----------------------------------------------------

        function _get( funcName, propName, urlParams, resolve, reject ){
            console.log( "[DP] fetching " + propName );
            RestService[funcName]( urlParams, function( results ){
                self[propName] = results;
                resolve( results );
            }, function( error ){
                reject( error );
            } );
        }

        return self;
    }
}());