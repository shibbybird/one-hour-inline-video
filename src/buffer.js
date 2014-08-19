InlineVideo.Buffer = (function( Object , MOJO , InlineVideo ) {


    var PROTOTYPE = 'prototype';


    var Frameset = InlineVideo.Frameset;


    function Buffer( url , options ) {

        var that = this;

        that.min = 1;
        that.range = 2;
        that.queue = [];
        that.loading = [];
        that.count = 0;
        that.loadCount = 0;

        MOJO.Each( options , function( val , key ) {
            that[key] = val;
        });

        // set max buffer
        that.max = that.min + that.range;

        MOJO.Construct( that );

        Object.defineProperties( that , {

            percent: {
                get: function() {
                    return (that.loadCount / that.count);
                }
            },

            ready: {
                get: function() {
                    return that.loadCount >= that.min;
                }
            },

            loaded: {
                get: function() {
                    return that.loadCount === that.count;
                }
            }
        });

        that._getManifest( url , function( duration ) {

            var min = that.min;

            that.count = duration;
            that.min = duration < min ? duration : min;
            that.happen( 'JSONResponse' , duration );
            that.load();
        });
    }


    Buffer[PROTOTYPE] = MOJO.Create({

        _getManifest: function( url , callback ) {

            var that = this;

            getJSON( url , function( response ) {
                
                var origin = response.origin;
                var path = response.path;
                var frames = response.frames;
                var duration = frames.length;

                that.queue = frames.map(function( srcArray , i ) {
                    var frameset = new Frameset( i , origin , path , srcArray );
                    return frameset
                        .when( 'framesetComplete' , frameset , that )
                        .once( 'framesetLoaded' , [ frameset , i ] , that );
                });

                callback( duration );
            });
        },

        load: function() {

            var that = this;
            var max = that.max;
            var queue = that.queue;
            var loading = that.loading;
            var frameset;

            while (loading.length < max && queue.length > 0) {
                frameset = queue.shift();
                loading.push( frameset );
                frameset.load();
            }
        },

        handleMOJO: function( e ) {

            var that = this;
            var args = arguments;
            var frameset, index, loading;

            switch (e.type) {

                case 'abort':
                    that.happen( 'bufferProgress' , 0 );
                    that.dispel();
                    that.queue.forEach(function( frameset ) {
                        frameset.destroy();
                    });
                break;

                case 'coreProgress':
                    loading = that.loading;
                    frameset = args[1];
                    index = loading.indexOf( frameset );
                    loading.splice( index , 1 );
                    if (!that.loaded) {
                        that.load();
                    }
                break;

                case 'framesetLoaded':
                    
                    frameset = args[1];
                    index = args[2];

                    that.loadCount++;

                    that.happen( 'framesetLoaded' , [ frameset , index ]);
                    that.happen( 'bufferProgress' , that.percent );

                    if (that.ready) {
                        that.happen( 'bufferReady' );
                    }

                    if (that.loaded) {
                        that.happen( 'videoLoaded' );
                    }
                break;

                case 'framesetComplete':
                    frameset = args[1];
                    that.happen( 'framesetComplete' , frameset );
                break;
            }
        }
    });


    function getJSON( url , callback ) {

        callback = callback || function() {};
        
        var request = new XMLHttpRequest();
        
        addEventListener( request , 'load' , function( e ) {
            var response = JSON.parse( request.response );
            callback( response );
        });

        request.open( 'get' , url , true );
        request.send();
    }


    function addEventListener( subject , event , callback ) {
        subject.addEventListener( event , callback );
    }


    return Buffer;

    
}( Object , MOJO , InlineVideo ));




























