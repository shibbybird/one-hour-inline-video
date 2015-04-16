InlineVideo.Frameset = (function( Object , Promise , MOJO ) {


    function Frameset( index , origin , path , srcArray ) {

        var that = this;

        that.fps = srcArray.length;
        that.mspf = (1000 / that.fps);
        that.frames = [];

        MOJO.Construct( that );

        Object.defineProperties( that , {

            count: {
                get: function() {
                    return that.frames.length;
                }
            },

            elapsed: {
                get: function() {
                    return that.time - that.startTime;
                }
            },

            frame: {
                get: function() {
                    return Math.ceil( that.elapsed / that.mspf );
                }
            },

            percent: {
                get: function() {
                    return (that.elapsed / 1000);
                }
            },

            complete: {
                get: function() {
                    return that.frame === that.count;
                }
            }
        });

        that.load = that.load.bind( that , ( origin + path ) , srcArray , index );
        that.reset();
    }


    Frameset.prototype = MOJO.Create({

        load: function( path , srcArray , index ) {

            var that = this;
            var frames = that.frames;
            var promises = [];

            srcArray.forEach(function( src , i ) {
                
                if (!src) {
                    return;
                }

                src = path + src;
                promises.push(
                    loadImage( src , function( img ) {
                        frames[i] = img;
                    })
                );
            });

            Promise.all( promises ).then(function() {
                that.happen( 'framesetLoaded' );
            });
        },

        destroy: function() {
            var that = this;
            that.dispel();
            that.frames = [];
            return that;
        },

        reset: function() {
            var that = this;
            that.time = 0;
            that.startTime = 0;
            that.lastFrame = null;
            return that;
        },

        requestFrame: function( timestamp ) {

            var that = this;

            that.startTime = that.startTime || timestamp;
            that.time = timestamp;

            var frame = that.frame;

            if (frame > that.lastFrame) {
                that.lastFrame = frame;
                return that.frames[frame];
            }
            else if (that.complete) {
                that.happen( 'framesetComplete' );
            }

            return false;
        }
    });


    function loadImage( src , callback ) {
        return new Promise(function( resolve ) {
            var img = new Image();
            img.onload = function() {
                callback( img );
                resolve();
            };
            img.src = src + '?r=' + Date.now();
        });
    }


    return Frameset;

    
}( Object , Promise , MOJO ));




























