/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     May 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function () {

    /**
     * @ngdoc service
     * @name bbdata.rest.RestService
     * @description
     * Service to talk to the backend.
     */
    angular
        .module('bbdata.rest')
        .factory('RestService', RestService);

    // --------------------------

    function RestService($resource, baseUrl) {

        return $resource('', {}, {

            getHierarchy: {method: 'GET', url: baseUrl + 'values/tree', isArray: true},

            getValues: {
                method: 'GET',
                url: baseUrl + 'values/sensors',
                isArray: false
            },

            getSensors: {
                method: 'GET',
                url: baseUrl + 'sensors',
                isArray: true
            },

            addSensor: {
                method: 'POST',
                url: baseUrl + 'sensors',
                isArray: false
            },

            deleteSensor: {
                method: 'DELETE',
                url: baseUrl + 'sensors',
                isArray: false
            },

            getUnits: {
                method: "GET",
                url: baseUrl + "units",
                isArray: true
            },

            getParsers: {
                method: "GET",
                url: baseUrl + "parsers",
                isArray: true
            },

            getTypes: {
                method: "GET",
                url: baseUrl + "types",
                isArray: true
            } ,

            getTokens: {
                method: 'GET',
                url: baseUrl + "sensors/tokens",
                isArray: true
            },

            getSets: {
                method: 'GET',
                url: baseUrl + "sets",
                isArray: true
            }   ,

            addTLS: {
                method: 'POST',
                url: baseUrl + "sets/tls",
                params: {name: '@name', "id": "@id"},
                isArray: false
            },
            editTLS: {
                method: 'PUT',
                url: baseUrl + "sets/tls",
                params: {name: '@name', "id": "@id"},
                isArray: false
            },
            deleteTLS: {
                method: 'DELETE',
                url: baseUrl + "sets/tls",
                params: {"id": "@id"},
                isArray: false
            },

            addSLS: {
                method: 'POST',
                url: baseUrl + "sets/sls",
                params: {name: '@name', "tls-id": "@tls_id"},
                isArray: false
            },
            editSLS: {
                method: 'PUT',
                params: {name: '@name', "id": "@id"},
                url: baseUrl + "sets/sls",
                isArray: false
            },
            deleteSLS: {
                method: 'DELETE',
                params: {"id": "@id"},
                url: baseUrl + "sets/sls",
                isArray: false
            },

            addSensorToSls: {
                method: 'POST',
                url: baseUrl + 'sets/sensors',
                params: {"sls_id": "@sls_id", "sensor-id": "@id", "address": "@address"},
                isArray: false
            },
            
            deleteSensorFromSls: {
                method: 'DELETE',
                url: baseUrl + 'sets/sensors',
                //params: {"sls-id": "sls-id", "sensor-id": "id", "address": "address"},
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

        })
    }

}());