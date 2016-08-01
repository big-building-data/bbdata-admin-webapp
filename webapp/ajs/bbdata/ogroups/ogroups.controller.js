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
     * @name bbdata.app.TlsOgroupCtontroller
     *
     * @description
     * handles the TLS/Ogroup page.
     */
    angular
        .module( 'bbdata.app' )
        .controller( 'OgroupsController', ctrl )
        .filter( 'ownerFilter', ownerFilter );

    // --------------------------


    function ctrl( RestService, $rootScope, ModalService, OGROUPS_PAGE, toaster, $q, errorParser ){

        var self = this;

        self.ogroups = [];
        self.objects = [];
        self.allUserGroups = [];
        self.adminGroups = [];
        self.currentGroup = null;

        self.dragObjectsConfig = {
            clone    : true,
            itemMoved: function( evt ){
                var ogroup = evt.dest.sortableScope.ogroup;
                var item = evt.dest.sortableScope.modelValue[evt.dest.index];
                addObjectToGroup( item, ogroup, null,
                    function(){
                        // error, go back TODO
                        //ogroup.sensors.splice( evt.dest.index, 1 );
                    } );
                console.log( item.id + " to Ogroup " + ogroup.name );
            }
        };

        self.dragObjectGroupConfig = {
            allowDuplicates: false,
            itemMoved      : function( evt ){
                console.log( "drag Ogroup config" );
                var ogroupFrom = evt.source.sortableScope.ogroup;
                var ogroupTo = evt.dest.sortableScope.ogroup;
                var item = evt.dest.sortableScope.modelValue[evt.dest.index];
                // add and then delete
                addObjectToGroup( item, ogroupTo, function(){
                    removeObjectFromGroup( item, ogroupFrom );
                } );
                console.log( item.id + " : " + ogroupFrom.name + " -> " + ogroupTo.name );
            }
        };

        self.addObjectGroup = addObjectGroup;
        self.editOgroup = editObjectGroup;
        self.deleteOgroup = deleteOgroup;
        self.removeObjectFromGroup = removeObjectFromGroup;
        self.removePermission = removePermission;
        self.addPermission = addPermission;

        _init();

        //##--------------init

        function _init(){
            console.log( "tls ogroup init" );

            RestService.getObjectGroups( {objects: true, writable: true}, function( ogroups ){

                console.log( "object groups", ogroups );
                self.ogroups = ogroups;
                angular.forEach( ogroups, function( ogrp ){
                    RestService.getObjectGroupPermissions( {id: ogrp.id}, function( perms ){
                        ogrp.permissions = perms;
                    }, _handleError );
                } );

            }, _handleError );

            RestService.getObjects( {writable: true}, function( objects ){
                console.log( "objects", objects );
                self.objects = objects;
                _sticky();

                $rootScope.$on( 'bbdata.PageChanged', function( evt, args ){
                    if( args.to == OGROUPS_PAGE ){
                        console.log( "page == Ogroup" );
                        _sticky();
                    }
                } );
            }, _handleError );

            RestService.getMyUserGroups( {admin: true}, function( groups ){
                console.log( "admin groups", groups );
                self.adminGroups = groups;
                if( groups.length > 0 ) self.currentGroup = groups[0];
            }, _handleError );

            RestService.getAllUserGroups( function( groups ){
                console.log( "user groups", groups );
                self.allUserGroups = groups;
            }, _handleError );


        }


        function addObjectGroup(){
            _addEditNameModal( "add object group", "" ).then( function( name ){
                RestService.addObjectGroup( {owner: self.currentGroup.id}, {name: name},
                    function( ogroup ){
                        if( !ogroup.hasOwnProperty( "objects" ) ) ogroup.objects = [];
                        self.ogroups.push( ogroup );
                    }, _handleError );
            } );
        }

        function editObjectGroup( ogroup ){
            _addEditNameModal( "edit object group", ogroup.name ).then(
                function( name ){
                    RestService.editObjectGroup( {id: ogroup.id, name: name}, function( ogroup ){
                        ogroup.name = name;
                    }, _handleError );
                } );
        }

        function deleteOgroup( ogroup, idx ){

            var deleteCallback = function(){
                RestService.deleteObjectGroup( {id: ogroup.id}, function(){
                    self.ogroups.splice( idx, 1 );
                }, _handleError );
            };

            if( ogroup.objects && ogroup.objects.length ){
                // some sensors exist, ask for confirmation
                ModalService.showModal( {
                    title   : "confirm",
                    html    : "are you absolutely sure ?",
                    positive: "proceed",
                    negative: "cancel",
                    icon    : "trash",
                    basic   : true,
                } ).then( function( result ){
                    if( result.status ) deleteCallback();

                }, _handleError );
            }else{
                deleteCallback();
            }
        }


        function addPermission( group, ogroup ){
            if(ogroup.permissions.indexOf(group) >= 0){
                console.log("already here");
                return;
            }
            RestService.addPermission( {id: ogroup.id, groupId: group.id}, {}, function(){
                ogroup.permissions.push( group );
            }, _handleError );
        }

        function removePermission( perm, ogroup ){
            RestService.removePermission( {id: ogroup.id, groupId: perm.id}, function(){
                ogroup.permissions.splice( ogroup.permissions.indexOf( perm ), 1 );
            }, _handleError );
        }

        //##------------utils

        /*
         * @param title the title of the modal
         * @param name the current name to modify
         * @return Promise resolves with the new name, rejects on user cancel or no change.
         */
        function _addEditNameModal( title, name ){
            var deferred = $q.defer();

            ModalService.showModal( {
                title          : title,
                html           : '<div class="ui labeled input"> <div class="ui label">name</div> <input type="text" ng-model="inputs.name"> </div>',
                positive       : "save",
                positiveDisable: '!inputs.name',
                negative       : "cancel",
                inputs         : {
                    name: name
                }
            } ).then( function( result ){
                if( result.status && name !== result.inputs.name ){
                    deferred.resolve( result.inputs.name );
                }else{
                    deferred.reject();
                }

            }, _handleError );

            return deferred.promise;

        }

        function _handleError( error ){
            console.log( error );
            toaster.error( {body: errorParser.parse( error )} );
        }


        function _sticky(){
            // wait a bit to be sure everything is loaded
            setTimeout( function(){
                console.log( "apply sticky" );
                $( '.ui.sticky' ).sticky( {} );
            }, 100 );
        }

        function addObjectToGroup( object, ogroup, resolve, reject ){
            if( !reject ) reject = _handleError;
            RestService.addObjectToGroup( {
                id      : ogroup.id,
                objectId: object.id
            }, resolve, reject );
        }

        function removeObjectFromGroup( object, ogroup, resolve, reject ){
            if( !reject ) reject = _handleError;
            RestService.removeObjectFromGroup( {
                id      : ogroup.id,
                objectId: object.id
            }, function(){
                var idx = ogroup.objects.indexOf( object );
                ogroup.objects.splice( idx, 1 );
                if( resolve ) resolve();
            }, reject );
        }
    }


    function ownerFilter(){

        return function( inputs, group ){

            if( !group ) return [];

            var output = [];
            angular.forEach( inputs, function( input ){
                if( input.owner && group && input.owner.id == group.id ){
                    output.push( input );
                }
            } );
            return output;
        }
    }

})();