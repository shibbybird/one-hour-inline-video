window.InlineVideo = (function( Object , document , MOJO ) {


    var STATEMAP = [ 'not ready' , 'buffering' , 'ready' , 'loaded' ];
    var CORE_PROGRESS = 'coreProgress';
    var READYSTATE = 'readyState';
    var VIDEO_END = 'videoEnd';
    var BUFFER = 'buffer';
    var SET = 'set';
    var TIC = 'tic';


    function PRIVATE_EVENTS() {
        return [ SET , VIDEO_END , CORE_PROGRESS ];
    }


    var TimingMOJO;
    var Buffer;
    var Audio;


    /**
     *
     * @param selector
     * "#hack-video"
     *
     * @param options
     * {
     *  url: "http://video.com/video.mp4",
     *  width: "600",
     *  height: "400"
     * }
     * @constructor
     */

    
    function InlineVideo( selector , options ) {

        options = options || {};

        var that = this;

        that.index = 0;
        that.frameProgress = 0;
        that.queue = [];
        that.duration = null;
        that.playing = false;
        that[READYSTATE] = 0;

        var bufferOptions = {
            min: 2
        };

        MOJO.Construct( that );

        Object.defineProperties( that , {

            queueLength: {
                get: function() {
                    return Object.keys( that.queue ).length;
                }
            },

            elapsed: {
                get: function() {
                    return Math.round(( that.index + that.frameProgress ) * 1000 );
                }
            }
        });

        that.load( options.url , bufferOptions );
        that._init( selector , options );
    }


    InlineVideo.Init = function() {
        TimingMOJO = InlineVideo.TimingMOJO;
        Buffer = InlineVideo.Buffer;
        Audio = InlineVideo.Audio;
    };


    InlineVideo.prototype = MOJO.Create({

        _init: function( selector , options ) {

            var that = this;
            var videoContainer = document.querySelector( selector );
            var bcr = videoContainer.getBoundingClientRect();

            var width = options.width || bcr.width;
            var height = options.height || bcr.height;

            var canvas = createCanvas( width , height );
            var context = canvas.getContext( '2d' );

            // this should decrease the system load a bit
            context.webkitImageSmoothingEnabled = false;

            videoContainer.appendChild( canvas );

            that.width = width;
            that.height = height;
            that.canvas = canvas;
            that.context = context;
            that.videoContainer = videoContainer;
        },

        load: function( url , bufferOptions ) {

            var that = this;

            that.url = url || that.url;
            that.bufferOptions = that.bufferOptions || bufferOptions;

            if (!that.url) {
                return;
            }

            var buffer = new InlineVideo.Buffer( that.url , that.bufferOptions )
                .once( 'JSONResponse videoLoaded' , that )
                .when( 'framesetLoaded framesetComplete bufferProgress bufferReady' , that );

            that
                .when([ SET , VIDEO_END ] , that )
                .when( CORE_PROGRESS , buffer )
                .once( 'abort' , buffer );

            that.set( READYSTATE , 1 );
        },

        handleMOJO: function( e ) {

            var that = this;
            var args = arguments;
            var queue = that.queue;
            var key, state, frameset, coreindex, frameindex, duration, progress;

            switch (e.type) {

                case 'set':

                    key = args[1];

                    if (key === READYSTATE) {
                        state = STATEMAP[that[key]];
                        that.happen( key , [ state , that[key] ]);
                    }
                break;

                case 'timing':
                    that._timing.apply( that , args );
                break;

                case 'videoLoaded':
                    that.set( READYSTATE , 3 );
                break;

                case VIDEO_END:
                    that.stop();
                break;

                case 'JSONResponse':
                    duration = args[1];
                    that.duration = duration;
                    that.set( READYSTATE , 1 );
                break;

                case 'bufferProgress':
                    progress = args[1];
                    that.happen( BUFFER , progress );
                break;

                case 'bufferReady':
                    if (that.readyState < 2) {
                        that.set( READYSTATE , 2 );
                    }
                break;

                case 'framesetLoaded':
                    frameset = args[1];
                    frameindex = args[2];
                    queue[frameindex] = frameset;
                break;

                case 'framesetComplete':
                    frameset = args[1];
                    coreindex = that.index;
                    if (frameset === queue[coreindex]) {
                        queue[coreindex] = null;
                        coreindex++;
                        that.happen( CORE_PROGRESS , frameset );
                        var seconds = Math.round( that.elapsed / 1000 );
                        that.happen( TIC , [ seconds , that.duration ]);
                    }
                    that.index = coreindex;
                break;
            }
        },

        _timing: function( e , timestamp ) {

            var that = this;

            if (!that.playing) {
                return;
            }

            var index = that.index;
            var queue = that.queue;
            var current = that.queue[index];

            if (!current) {
                if (queue.length === that.duration) {
                    that.happen( VIDEO_END );
                }
                else if (that.readyState > 1) {
                    that.set( READYSTATE , 1 );
                }
                return;
            }

            var frame = current.requestFrame( timestamp );

            if (frame) {
                that.frameProgress = current.percent;
                that._paint( frame );
            }
        },

        play: function() {
            
            var that = this;

            if (!that[READYSTATE]) {
                that.load();
            }

            if (!that.playing) {
                that.playing = true;
                TimingMOJO.subscribe( that );
            }
        },

        stop: function() {

            var that = this;

            that.index = 0;
            that.frameProgress = 0;
            that.playing = false;
            
            that.destroy();

            TimingMOJO.unsubscribe( that );
        },

        _paint: function( img ) {

            var that = this;
            var context = that.context;
            var width = that.width;
            var height = that.height;

            context.clearRect( 0 , 0 , width , height );
            context.drawImage( img , 0 , 0 , width , height );
        },

        destroy: function() {
            var that = this;
            that.queue = [];
            that.duration = null;
            that.happen( 'abort' );
            that.set( READYSTATE , 0 );
            that.dispel(
                PRIVATE_EVENTS()
            );
        }
    });


    function createCanvas( width , height ) {
        var canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }


    return InlineVideo;


}( Object , document , MOJO ));



























