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
     * @name bbdata.rest.ErrorParser
     * @description
     * Service to format errors as string displayable to the client.
     */
    angular
        .module( 'bbdata.rest' )
        .factory( 'ErrorParser', ErrorParser );

    // --------------------------

    function ErrorParser(  ){

        var reRootCause = /root cause<\/b> <pre>(.*)/g;
        var rePythonError = /\n(\s*)at/g;


        function formatBBdataError(error){
            var title = error.data.exception;
            var method = error.config.method + " " + error.config.url;
            var details = error.data.details;

            if( !details)
                return method + ": " + title;

            if(details instanceof Array){
                var keys = [];
                angular.forEach(details, function(d){
                    keys = keys.concat(Object.keys(d));
                });
                details = "validation errors on fields " + keys.join(", ");
            }

            return method +
                " <br/><span style='font-size:.8em;'>" + details + "</span>";
        }


        return {
            parse: function( error ){
                console.log(error);

                if( error.data ){
                    if(error.data instanceof Object && error.data.hasOwnProperty("exception")){
                        return formatBBdataError(error);

                    }else{
                        // not a json, try to find a root cause (often present if default glassfish message)
                        var match = reRootCause.exec( error.data);
                        if( match ) return match[1];

                        // not glassfish either, try python error
                        match = rePythonError.exec(error.data);
                        if(match) return error.data.split("\n")[0];
                    }
                    return error.statusText;

                }else{
                    // TODO
                    return error.status + ": unknown error (" + error.statusText + ")";
                }
            }
        }

    }

}());