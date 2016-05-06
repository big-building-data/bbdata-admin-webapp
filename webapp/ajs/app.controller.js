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
     * @ngdoc controller
     * @name bbdata.app.MainCtrl
     *
     * @description
     * Main controller
     */
    angular
        .module('bbdata.app')
        .controller('MainCtrl', MainCtrl);

    // --------------------------

    function MainCtrl(RestService, $scope) {

        var self = this;

        self.test = "it works!";
        self.captorsHierarchy = [];
        self.chkChanged = checkboxChanged;
        _init();


        self.date = {
            from: moment().floor(1, 'hour').subtract(1, 'hour' ).toDate(),
            to: moment().floor(1, 'hour' ).toDate()
        };

        self.applyDate = applyDate;

        /* *****************************************************************
         * implementation
         * ****************************************************************/

        //##------------scope power

        $scope.copy = angular.copy;
        $scope.equals = angular.equals;

        //##------------init

        function _init() {
            RestService.getHierarchy(function (result) {
                self.captorsHierarchy = result;
            }, _handleError);
        }


        //##------------available methods

        function checkboxChanged(item){
             console.log(item);
        }

        //##------------utils

        function _handleError(error) {
            console.log(error);
        }

        function applyDate(d){
            self.date = d;
            console.log(d);
        }


    }
}());