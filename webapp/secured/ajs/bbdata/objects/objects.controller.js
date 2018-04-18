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
     * @ngdoc objects controller
     * @name bbdata.app.objectController
     *
     * @description
     * handles the objects page: add, edit, remove, manage tokens.
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'ObjectsController', ctrl );

    // --------------------------

    function ctrl( RestService, ModalService, ErrorHandler, DataProvider, ROOT_URL ){
        var self = this;

        self.objects = [];  // all the objects
        self.tokens = {};   // map object.id - tokens

        self.units = [];            // all the available units (add modal)
        self.adminGroups = [];      // all the groups where user is admin (add modal)

        // manage objects
        self.add = addObject;
        self.remove = removeObject;
        self.edit = editObject;

        // manage tags
        self.addTags = addTags;
        self.removeTag = removeTag;

        // manage tokens
        self.loadTokens = loadTokens; // lazy loading
        self.addToken = addToken;
        self.removeToken = removeToken;
        self.editToken = editToken;

        // called on first page load
        self.init = _init;


        //##--------------init

        function _init(){

            DataProvider.getWritableObjects( function( objects ){
                console.log( "objects", objects );
                self.objects = objects;
            }, ErrorHandler.handle );

            DataProvider.getUnits( function( units ){
                console.log( "units", units );
                self.units = units;
            }, ErrorHandler.handle );

            DataProvider.getAdminUserGroups( function( groups ){
                console.log( "admin groups", groups );
                self.adminGroups = groups;
            }, ErrorHandler.handle );
        }

        //##-------------- object management

        function removeObject( object ){
            // always ask confirmation
            ModalService.showModal( {
                title     : "confirm",
                html      : "are you sure you want to delete object <strong>" + object.name + "</strong> (" + object.id + ") ?<br />The" +
                " action cannot be undone",
                positive  : "proceed",
                negative  : "cancel",
                basic     : true,
                cancelable: true
            } ).then( function( results ){
                if( results.status ){
                    RestService.deleteObject( {id: object.id}, function(){
                        self.objects.splice( self.objects.indexOf( object ), 1 );
                    }, ErrorHandler.handle );
                }
            }, ErrorHandler.handle );
        }

        function editObject( object ){
            ModalService.showModal( {
                title          : "edit " + object.name,
                htmlInclude    : ROOT_URL + "/ajs/bbdata/objects/partials/_editModalContent.html",
                positive       : "save",
                positiveDisable: 'form.editform.$invalid',
                negative       : "cancel",
                inputs         : {
                    object: angular.copy( object )
                },
                cancelable     : false
            } ).then( function( results ){
                if( results.status ){
                    var obj = results.inputs.object;
                    RestService.editObject( {id: object.id}, {name: obj.name, description: obj.description},
                        function(){
                            object.name = obj.name;
                            object.description = obj.description;
                        }, ErrorHandler.handle );
                }
            }, ErrorHandler.handle );
        }

        function addObject(){
            ModalService.showModal( {
                htmlInclude    : ROOT_URL + '/ajs/bbdata/objects/partials/_addModalContent.html',
                positive       : "add",
                positiveDisable: "form.addform.$invalid",
                negative       : "cancel",
                cancelable     : false,
                inputs         : {
                    object     : {},
                    adminGroups: self.adminGroups,
                    units      : self.units,
                    init       : function(){
                        setTimeout( function(){
                            $( 'select.dropdown' ).dropdown();
                        }, 500 );

                    }
                }
            } ).then( function( results ){
                if( results.status ){
                    RestService.addObject( results.inputs.object, function( object ){
                        self.objects.push( object );
                    }, ErrorHandler.handle );
                }
            }, ErrorHandler.handle );
        }


        //##-------------- tags management

        function addTags( object, tag ){
            console.log( "tag = " + tag );
            RestService.addTags( {id: object.id, tags: tag}, {}, function( obj ){
                object.tags.push( {tag: tag }); // add the tag manually
            }, ErrorHandler.handle );
        }

        function removeTag( object, idx ){
            RestService.removeTags( {id: object.id, tags: object.tags[idx].tag}, {}, function( obj ){
                console.log( obj );
                object.tags.splice( idx, 1 );
            }, ErrorHandler.handle );
        }

        //##-------------- tokens management


        function loadTokens( sid ){
            if( self.tokens[sid] )  return;
            RestService.getTokens( {id: sid}, function( tokens ){
                console.log( tokens );
                self.tokens[sid] = tokens;
            } );
        }

        function removeToken( object, index ){
            // always ask for confirmation
            ModalService.showModal( {
                title     : "confirm",
                icon      : "warning sign orange",
                html      : "are you sure you want to delete this token ?<br />" +
                "Rights associated with it will all be revoqued.",
                positive  : "proceed",
                negative  : "cancel",
                basic     : true,
                cancelable: true
            } ).then( function( results ){
                if( results.status ){
                    var tokens = self.tokens[object.id];
                    RestService.deleteToken({id: object.id, tokenId: tokens[index].id}, {}, function(){
                        tokens.splice( index, 1 );
                    }, ErrorHandler.handle);
                }
            }, ErrorHandler.handle );
        }

        function editToken( object, token ){
            _addEditToken( object, token );
        }

        function addToken( object ){
            _addEditToken( object, null );
        }

        function _addEditToken( object, token ){
            ModalService.showModal( {
                title   : (token ? "edit " : "add") + " token",
                html    : '<div class="ui form"><div class="field"> <label>Description</label> <textarea ng-model="inputs.description" rows="2"></textarea></div></div>',
                positive: "save",
                negative: "cancel",
                inputs  : {
                    description: token ? token.description : ""
                }
            } ).then( function( result ){
                if( result.status ){
                    if( token == null ){
                        // TODO: name and description
                        // create token
                        RestService.createToken({id: object.id}, {description: result.inputs.description}, function(t){
                            self.tokens[object.id].push(t);
                        }, ErrorHandler.handle);
                    }else{
                        // TODO update +
                        RestService.editToken({id: object.id, tokenId: token.id}, {description: result.inputs.description}, function(t){
                            token.description = t.description;
                        }, ErrorHandler.handle);
                    }
                }

            }, ErrorHandler.handle );
        }


    }

})();