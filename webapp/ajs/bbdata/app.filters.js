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

    angular
        .module( 'bbdata.app' )
        /**
         * @ngdoc filter
         * @name bbdata.app.selected
         *
         * @description
         * Filters the sensors hierarchy and returns the
         * only the selected items.
         *
         * Used by the display controller to handle the
         * sensors hierarchy and redraw the graph.
         */
        .filter( 'selected', filterSelected );


    // recursively filter the sensorsHierarchy
    function filterSelected( $filter ){
        return function( input ){
            var results = [];

            angular.forEach( input, function( i ){
                var localResults = [];

                if( i.children ) localResults = $filter( 'selected' )( i.children ) || [];
                if( i.selected ) localResults.push( i );


                if( localResults.length )
                    results = results.concat( localResults );

            } );

            return results;
        };
    }
})();
