/*
 * @author   Lucy Linder <lucy.derlin@gmail.com>
 * @date     February 2016
 * @context  BBData
 *
 * Copyright 2016 HEIAFR. All rights reserved.
 * Use of this source code is governed by an Apache 2 license
 * that can be found in the LICENSE file.
 */
(function () {

    /**
     * @ngdoc tls ogroup controller
     * @name bbdata.app.OgroupsController
     *
     * @description
     * handles the Object groups page.
     */
    angular
        .module('bbdata.app')
        .controller('MeController', ctrl);

// --------------------------

    function ctrl(RestService, ErrorHandler, ModalService, ROOT_URL, $filter) {
        var self = this;

        self.profile = {};
        self.apikeys = [];
        self.currentApikey = {};
        self.myUserGroups = {};

        self.init = _init;

        self.editApikey = editApikey;
        self.deleteApikey = deleteApikey;
        self.createApikey = createApikey;
        self.isObsolete = isApikeyObsolete;
        self.isCurrentApikey = isCurrentApikey;

        //##--------------init

        function _init() {
            RestService.getMyProfile(function (me) {
                console.log("my profile", me);
                self.profile = me;
            }, ErrorHandler.handle);

            RestService.getApikeys(function (apikeys) {
                console.log("my apikeys", apikeys);
                self.apikeys = apikeys;
            }, ErrorHandler.handle);

            RestService.currentApikey(function (ak) {
                console.log("current apikey", ak);
                self.currentApikey = ak.id;
            }, ErrorHandler.handle);

            RestService.getMyUserGroups(function (ugrps) {
                console.log("usergroups", ugrps);
                self.myUserGroups = ugrps;
            }, ErrorHandler.handle);

        }

        //##-------------- apikeys


        function isCurrentApikey(ak) {
            return ak.id === self.currentApikey;
        }

        function isApikeyObsolete(ak) {
            return ak.expirationdate &&
                new Date(ak.expirationDate) <= new Date();
        }

        function createApikey() {
            _addEditApikey({
                readOnly: true
            }, false);
        }

        function editApikey(apikey) {
            _addEditApikey(apikey, true);
        }

        function _addEditApikey(apikey, editMode) {
            ModalService.showModal({
                title: editMode ? "Edit apikey " + apikey.id : "Create apikey",
                htmlInclude: ROOT_URL + "/ajs/bbdata/me/partials/_createApikeyModalContent.html",
                positive: "save",
                negative: "cancel",
                inputs: {
                    apikey: apikey,
                    editMode: editMode,
                    checkDate: function (dt) {
                        if (!dt) return "";
                        var dateStr = $filter('date')(dt + (dt.endsWith('Z') ? '' : 'Z'), 'dd/MM/yyyy HH:mm:ss');
                        if (dateStr.indexOf('Z') >= 0) return "ERROR";
                        return dateStr;
                    }
                },
                positiveDisable: "inputs.checkDate(inputs.apikey.expirationDate) == 'ERROR'",
                cancelable: false
            }).then(function (results) {
                if (results.status) {
                    if (editMode) {
                        RestService.editApikey(
                            {id: apikey.id }, {
                                readOnly: apikey.readOnly,
                                description: apikey.description,
                                expirationDate: apikey.expirationDate || "null"
                            }, function (newApikey) {
                                apikey.description = newApikey.description;
                                apikey.readOnly = newApikey.readOnly;
                                apikey.expirationDate = newApikey.expirationDate;
                                console.log("edited apikey", apikey, '=>', newApikey);
                            }, ErrorHandler.handle);
                    } else {
                        // create mode
                        RestService.createApikey({
                            writable: !results.inputs.apikey.readOnly,
                            expirationDate: results.inputs.apikey.expirationDate
                        }, {description: results.inputs.apikey.description}, function (apikey) {
                            console.log("new apikey", apikey);
                            self.apikeys.push(apikey);
                        }, ErrorHandler.handle);
                    }

                }
            }, ErrorHandler.handle);
        }

        function deleteApikey(apikey, idx) {


            ModalService.showModal({
                title: "Confirm",
                text: "Are you sure you want to delete apikey '" + apikey.id + "' ?",
                positive: "yes",
                negative: "cancel",
                basic: true,
                cancelable: true
            }).then(function (results) {
                if (results.status) {
                    RestService.deleteApikey({id: apikey.id}, function () {
                        self.apikeys.splice(idx, 1);
                    }, ErrorHandler.handle);
                }
            }, ErrorHandler.handle);
        }

    }

}());
