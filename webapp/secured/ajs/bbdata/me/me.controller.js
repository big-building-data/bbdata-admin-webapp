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
     * @ngdoc tls ogroup controller
     * @name bbdata.app.OgroupsController
     *
     * @description
     * handles the Object groups page.
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'MeController', ctrl );

// --------------------------

    function ctrl( RestService, ErrorHandler, ModalService, ROOT_URL ){
        var self = this;

        self.init = _init;

        self.deleteApikey = deleteApikey;
        self.createApikey = createApikey;
        self.isObsolete = isApikeyObsolete;
        self.isCurrentApikey = isCurrentApikey;

        //##--------------init

        function _init(){
            RestService.getMyProfile( function( me ){
                console.log( "my profile", me );
                self.profile = me;
            }, ErrorHandler.handle );

            RestService.getApikeys( function( apikeys ){
                console.log( "my apikeys", apikeys );
                self.apikeys = apikeys;
            }, ErrorHandler.handle );

            RestService.currentApikey( function( ak ){
                console.log( "current apikey", ak );
                self.currentApikey = ak.id;
            }, ErrorHandler.handle );

        }

        //##-------------- apikeys

        function isCurrentApikey(ak){
            return ak.id == self.currentApikey;
        }

        function isApikeyObsolete(ak) {
            return ak.expirationdate &&
                new Date(ak.expirationdate) <= new Date();
        }

        function createApikey(  ){
            ModalService.showModal( {
                title      : "Create a user",
                htmlInclude: ROOT_URL + "/ajs/bbdata/me/partials/_createApikeyModalContent.html",
                positive   : "create",
                negative   : "cancel",
                inputs     : {
                    readOnly: true,
                    expire  : ""
                },
                cancelable : false
            } ).then( function( results ){
                if( results.status ){

                    RestService.createApikey( {
                        writable: !results.inputs.readOnly,
                        expire  : results.inputs.expire
                    }, function( apikey ){
                        console.log( "new apikey", apikey );
                        self.apikeys.push( apikey );
                    }, ErrorHandler.handle );

                }
            }, ErrorHandler.handle );
        }

        function deleteApikey( apikey, idx ){


            ModalService.showModal( {
                title      : "Confirm",
                text       : "Are you sure you want to delete apikey '" + apikey.id + "' ?",
                positive   : "yes",
                negative   : "cancel",
                basic     : true,
                cancelable : true
            } ).then( function( results ){
                if( results.status ){
                    RestService.deleteApikey( {apikeyId: apikey.id}, function(){
                        self.apikeys.splice(idx, 1);
                    }, ErrorHandler.handle );
                }
            }, ErrorHandler.handle );
        }

    }

}());