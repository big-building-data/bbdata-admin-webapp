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
     * @ngdoc service
     * @name bbdata.rest.RestService
     * @description
     * Service to talk to the backend.
     */
    angular
        .module( 'bbdata.rest' )
        .factory( 'RestService', RestService );

    // --------------------------

    function RestService( $resource, baseUrl ){

        return $resource( '', {}, {

            getInfo: {
                method : 'GET',
                url    : baseUrl + 'info',
                isArray: false
            },

            // ---------------------------------------------------- objects

            getObjects: {
                method : 'GET',
                url    : baseUrl + 'objects',
                isArray: true
            },

            addObject: {
                method : 'PUT',
                url    : baseUrl + 'objects',
                isArray: false
            },

            editObject: {
                method : 'POST',
                url    : baseUrl + 'objects/:id',
                params : {id: '@id'},
                isArray: false
            },

            deleteObject: { // TODO: not implemented in the API
                method : 'DELETE',
                url    : baseUrl + 'objects/:id',
                params : {id: '@id'},
                isArray: false
            },

            // ---------------------------------------------------- tokens

            getTokens: {
                method : 'GET',
                url    : baseUrl + "objects/:id/tokens",
                params : {id: '@id'},
                isArray: true
            },

            createToken: {
                method : 'PUT',
                url    : baseUrl + "objects/:id/tokens",
                params : {id: '@id'},
                isArray: false
            },

            editToken: {
                method : 'POST',
                url    : baseUrl + "objects/:id/tokens/:tokenId",
                params : {id: '@id', tokenId: '@tokenId'},
                isArray: false
            },

            deleteToken: {
                method : 'DELETE',
                url    : baseUrl + "objects/:id/tokens/:tokenId",
                params : {id: '@id', tokenId: '@tokenId'},
                isArray: false
            },

            // ---------------------------------------------------- tags

            addTags: {
                method : 'PUT',
                url    : baseUrl + "objects/:id/tags",
                params : {id: '@id'},
                isArray: false
            },

            removeTags: {
                method : 'DELETE',
                url    : baseUrl + "objects/:id/tags",
                params : {id: '@id'},
                isArray: false
            },

            // ---------------------------------------------------- units and types

            getUnits: {
                method : "GET",
                url    : baseUrl + "units",
                isArray: true
            },

            getTypes: {
                method : "GET",
                url    : baseUrl + "types",
                isArray: true
            },

            // ----------------------------------------------------  object groups

            getObjectGroups: {
                method : 'GET',
                url    : baseUrl + 'objectGroups',
                isArray: true
            },

            addObjectGroup: {
                method : 'PUT',
                url    : baseUrl + 'objectGroups',
                isArray: false
            },

            editObjectGroup: {
               method: 'POST',
                url    : baseUrl + 'objectGroups/:id',
                params : {id: '@id'},
                isArray: false
            },

            deleteObjectGroup: {
                method : 'DELETE',
                url    : baseUrl + 'objectGroups/:id',
                params : {id: '@id'},
                isArray: false
            },

            addObjectToGroup: {
                method : 'PUT',
                url    : baseUrl + 'objectGroups/:id/objects/:objectId',
                params : {id: '@id', objectId: '@objectId'},
                isArray: false
            },

            removeObjectFromGroup: {
                method : 'DELETE',
                url    : baseUrl + 'objectGroups/:id/objects/:objectId',
                params : {id: '@id', objectId: '@objectId'},
                isArray: false
            },

            getObjectGroupPermissions: {
                method : 'GET',
                url    : baseUrl + 'objectGroups/:id/userGroups',
                params : {id: '@id'},
                isArray: true
            },

            // ---------------------------------------------------- permissions

            addPermission: {
                method : 'PUT',
                url    : baseUrl + 'objectGroups/:id/userGroups/:groupId',
                params : {id: '@id', groupId: '@groupId'},
                isArray: false
            },

            removePermission: {
                method : 'DELETE',
                url    : baseUrl + 'objectGroups/:id/userGroups/:groupId',
                params : {id: '@id', groupId: '@groupId'},
                isArray: false
            },


            // ---------------------------------------------------- user groups

            getMyUserGroups: {
                method: 'GET',
                url: baseUrl + 'me/userGroups' ,
                isArray: true
            },

            getAllUserGroups: {
                method : 'GET',
                url    : baseUrl + 'userGroups',
                isArray: true
            },

            getUserGroup: {
                method : 'GET',
                url    : baseUrl + 'userGroups/:id',
                params : {id: "@id"},
                isArray: false
            },

            getUsersInGroup: { // TODO
                method : 'GET',
                url    : baseUrl + 'userGroups/:id/users',
                params : {id: "@id"},
                isArray: true
            },

            addUserGroup: {
                method: 'PUT',
                url    : baseUrl + 'userGroups/:id',
                params : {id: "@id"},
                isArray: false
            },

            deleteUserGroup: {
                method: 'DELETE',
                url    : baseUrl + 'userGroups/:id',
                params : {id: "@id"},
                isArray: false
            },

            addUserToGroup: { // query params: user=<userid>&admin=<true|false>
                method: 'PUT',
                url: baseUrl + 'userGroups/:id/users/:userId',
                params: {id: '@id', userId: '@userId'},
                isArray: false
            },

            removeUserFromGroup: {
                method: 'DELETE',
                url: baseUrl + 'userGroups/:id/users/:userId',
                params: {id: '@id', userId: '@userId'},
                isArray: false
            },

            createUser: {
                method: 'PUT',
                url: baseUrl + 'users',
                params: {id: '@id'},
                isArray: false
            },

            changeUserStatus: {
                method: 'PUT',
                url: baseUrl + 'userGroups/:id/users/:userId',
                params: {id: '@id', userId: '@userId'}
            },

            // ---------------------------------------------------- ids

            getUsers: {
                method : 'GET',
                url    : baseUrl + 'users',
                isArray: true
            },

            getMyProfile: {
                method: 'GET',
                url: baseUrl + 'me',
                isArray: false
            },

            getApikeys: {
                method: 'GET',
                url: baseUrl + 'apikeys',
                isArray: true
            },

            createApikey: {
                method: 'PUT',
                url: baseUrl + 'apikeys',
                isArray: false
            },

            editApikey: {
                method: 'POST',
                url: baseUrl + 'apikeys/:id',
                params: {id: '@id'},
                isArray: false
            },

            deleteApikey: {
                method: 'DELETE',
                url: baseUrl + 'apikeys/:id',
                params: {id: '@id'},
                isArray: false
            },

            currentApikey: {
                method: 'POST',
                url: '/logid',
                isArray: false
            },

            // ---------------------------------------------------- values

            getValues: {
                method: 'GET',
                url: baseUrl + 'objects/:id/values',
                params: {id: '@id'},
                headers: {
                    'Accept': 'application/json'
                },
                isArray: true
            }

        } )
    }

}());
