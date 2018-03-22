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

            deleteObject: {
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
                url    : baseUrl + "objects/:id/tokens",
                params : {id: '@id'},
                isArray: false
            },

            deleteToken: {
                method : 'DELETE',
                url    : baseUrl + "objects/:id/tokens",
                params : {id: '@id'},
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
                url    : baseUrl + 'objectGroups/:id/objects',
                params : {id: '@id'},
                isArray: false
            },

            removeObjectFromGroup: {
                method : 'DELETE',
                url    : baseUrl + 'objectGroups/:id/objects',
                params : {id: '@id'},
                isArray: false
            },

            getObjectGroupPermissions: {
                method : 'GET',
                url    : baseUrl + 'objectGroups/:id/permissions',
                params : {id: '@id'},
                isArray: true
            },

            // ---------------------------------------------------- permissions

            addPermission: {
                method : 'PUT',
                url    : baseUrl + 'objectGroups/:id/permissions',
                params : {id: '@id'},
                isArray: false
            },

            removePermission: {
                method : 'DELETE',
                url    : baseUrl + 'objectGroups/:id/permissions',
                params : {id: '@id'},
                isArray: false
            },


            // ---------------------------------------------------- user groups

            getMyUserGroups: {
                method: 'GET',
                url: baseUrl + 'me/groups' ,
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

            addUserToGroup: {
                method: 'PUT',
                url: baseUrl + 'userGroups/:id/users',
                params: {id: '@id'},
                isArray: false
            },

            removeUserFromGroup: {
                method: 'DELETE',
                url: baseUrl + 'userGroups/:id/users',
                params: {id: '@id'},
                isArray: false
            },

            createUser: {
                method: 'PUT',
                url: baseUrl + 'userGroups/:id/users/new',
                params: {id: '@id'},
                isArray: false
            },

            changeUserStatus: { // quey params: user=<userid>&isAdmin=<true|false>
                method: 'PUT',
                url: baseUrl + 'userGroups/:id/users',
                params: {id: '@id'}
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
                url: baseUrl + 'me/apikeys',
                isArray: true
            },

            createApikey: {
                method: 'PUT',
                url: baseUrl + 'me/apikeys',
                isArray: false
            },

            editApikey: {
                method: 'POST',
                url: baseUrl + 'me/apikeys',
                isArray: false
            },

            deleteApikey: {
                method: 'DELETE',
                url: baseUrl + 'me/apikeys',
                params: {apikeyId: '@apikeyId'},
                isArray: false
            },

            currentApikey: {
                method: 'POST',
                url: '/logid',
                isArray: false
            }

            ///**
            // * @ngdoc
            // * @name infos
            // * @methodOf thymioCaptain.rest.RestService
            // *
            // * @description
            // * Returns information based on the cookie.
            // *
            // * @returns {httpPromise} resolves with the object {cardId: "", isadmin: bool}, or fails with error
            // * description.
            // */
            //infos: {method: 'GET', url: baseUrl + 'info'},

        } )
    }

}());