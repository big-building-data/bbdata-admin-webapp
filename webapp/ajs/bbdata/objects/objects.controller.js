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

    function ctrl( RestService, ModalService, toaster, errorParser, $filter ){
        var self = this;

        self.objects = []; // all the objects
        self.tokens = {};   // map object.id - tokens

        self.addInfosLoading = 2;  // decremented (units,types), so ok when 0 (false)
        self.units = [];    // all the available units (add modal)
        self.parsers = [];  // all the available parsers (add modal)
        self.adminGroups = [];   // all the groups where user is admin (add modal)

        // manage objects
        self.add = addObject;
        self.remove = removeObject;
        self.edit = editObject;

        // manage tags
        self.addTags  = addTags;
        self.removeTag  = removeTag;

        // manage tokens
        self.loadTokens = loadTokens; // lazy loading
        self.addToken = addToken;
        self.removeToken = removeToken;
        self.editToken = editToken;

        // called on first page load
        self.init = _init;


        // ==================== init


        //##--------------init

        function _init(){
            // get the objects list
            RestService.getObjects( function( objects ){
                console.log( "objects received" );
                self.objects = objects;
                $( '.ui.accordion' ).accordion();  // initialise semantic-ui accordion plugin
            }, _handleError );

            // get units, parsers and types
            RestService.getUnits( function( response ){
                self.units = response;
                self.addInfosLoading--;
            }, _handleError );

            RestService.getMyUserGroups( {admin: true}, function( groups ){
                console.log( "admin groups", groups );
                self.adminGroups = groups;
                self.addInfosLoading--;
            }, _handleError );
        }

        // ==================== objects

        function removeObject( object ){
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
                        self.objects.splice(self.objects.indexOf(object),1);
                    }, _handleError );
                }
            }, _handleError );
        }

        //TODO parser with value " " == no parser
        function editObject( object ){
            ModalService.showModal( {
                title          : "edit " + object.name,
                htmlInclude    : "/ajs/bbdata/objects/partials/_editModalContent.html",
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
                        function(  ){
                            object.name = obj.name;
                            object.description = obj.description;
                        }, _handleError );
                }
            }, _handleError );
        }

        function addObject(){
            ModalService.showModal( {
                htmlInclude    : '/ajs/bbdata/objects/partials/_addModalContent.html',
                positive       : "add",
                positiveDisable: "form.addform.$invalid",
                negative       : "cancel",
                cancelable     : false,
                inputs         : {
                    object: {},
                    adminGroups : self.adminGroups,
                    units : self.units,
                    init  : function(){
                        setTimeout( function(){
                            $( 'select.dropdown' ).dropdown();
                        }, 500 );

                    }
                }
            } ).then( function( results ){
                if( results.status ){
                    RestService.addObject({owner: results.inputs.adminGroup}, results.inputs.object, function(object){
                        self.objects.push(object);
                    }, _handleError);
                    // TODO add object
                }
            }, _handleError );
        }



        // ==================== tags

        function addTags(object, tag){
            console.log("tag = " + tag);
            RestService.addTags({id: object.id, tags: tag}, {}, function(obj){
                object.tags = obj.tags;
            }, _handleError);
        }

        function removeTag(object, idx){
            RestService.removeTags({id: object.id, tags: object.tags[idx].tag}, {}, function(obj){
                console.log(obj);
                object.tags.splice(idx, 1);
            }, _handleError);
        }

        // ==================== tokens


        function loadTokens( sid ){
            if( self.tokens[sid] )  return;
            RestService.getTokens( {id: sid}, function( tokens ){
                console.log( tokens );
                self.tokens[sid] = tokens;
            } );
        }

        function removeToken( object, index ){
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
                    // TODO delete token
                    var tokens = self.tokens[object.id];
                    tokens.splice( index, 1 );
                }
            }, _handleError );
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
                        // TODO put token
                        self.tokens[object.id].push( {
                            id         : object.id,
                            secret     : "saldkfjasédlkfja",
                            description: result.inputs.description
                        } );
                    }else{
                        // TODO update +
                        token.description = result.inputs.description;
                    }
                }

            }, _handleError );
        }


        // ==================== other

        //##------------utils

        function _handleError( error ){
            console.log( error );
            toaster.error( {body: errorParser.parse( error )} );
        }
    }

})();