/**
 * Created by lwilson on 8/8/14.
 */

window.OneHourInlineVideo = (function(){

    /**
     *
     * @param options
     * {
     *  url: "http://video.com/video.mp4",
     *  videoContainerId: "hack-video",
     *  width: "600",
     *  height: "400",
     *  timingCallback: "function(){}"
     * }
     * @constructor
     */

    var InlineVideo = function(options){

        this._buildVideo(options);

    }

    InlineVideo.prototype = {

        _buildVideo: function(options){
            var canvas, context, videoElement, video, videoContainer, self = this;

            if ( typeof options.videoContainerId != "undefined") {
                videoContainer = document.getElementById(options.videoContainerId);
            } else {
                console.log("videoContainerId not defined or found")
                throw "AHHH!";
            }



            canvas = document.createElement("canvas");
            canvas.height = options.height;
            canvas.width = options.width;
            context = canvas.getContext("2d");

            video = document.createElement('video');
            video.src = options.url;
            video.width = options.width;
            video.height = options.height;


            videoContainer.appendChild(canvas);

            video.addEventListener('play', function(){
                self.__canvasDraw();
            }, false);

            this.video = video;
            this.canvas = canvas;
            this.context = context;
            this.videoContainer = videoContainer;


        },

        play: function(){

            this.video.play();

        },

        __canvasDraw: function(){

            var video = this.video;
            var self = this;

            if(video.paused || video.ended){
                return false;
            }

            this.context.drawImage( video, 0, 0, video.width, video.height );

            setTimeout(function(){
                self.__canvasDraw();
            })

        },

        stop: function(){
            this.video.pause();
        },

        destroy: function(){

        }

    }


    return InlineVideo;

})()
