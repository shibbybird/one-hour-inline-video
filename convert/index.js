(function() {


    var exec = require( 'child_process' ).exec;
    var Promise = require( 'es6-promise' ).Promise;
    var fs = require( 'fs-extra' );
    var util = require( 'util' );


    var SERVER = 'http://10.10.28.82:8888';
    var PATH = '/live/video/big_buck_bunny/';


    var vidInfo = {
        file: '/Users/bmcmanus/Downloads/big_buck_bunny.mp4',
        dir: '/Users/bmcmanus/one-hour-inline-video/test/video/big_buck_bunny/',
        fps: 20
    };


    (function Create( vidInfo ) {

        var video = vidInfo.file;
        var dir = vidInfo.dir;
        var fps = vidInfo.fps;

        fs.removeSync( dir );
        fs.ensureDirSync( dir );

        var manifest = new Manifest( dir );
        var promises = [];

        promises.push(
            new Promise(function( resolve , reject ) {
                getAudio( video , dir , function( err , stdout , stderr ) {
                    if (err) {
                        reject();
                    }
                    else {
                        resolve();
                    }
                });
            })
        );

        promises.push(
            new Promise(function( resolve , reject ) {
                getFrameset( video , dir , fps , function( err , stdout , stderr ) {
                    if (err) {
                        reject();
                    }
                    else {
                        resolve();
                    }
                });
            })
        );

        Promise.all( promises ).then(function() {
            manifest.frames = getFrameArray( dir , fps );
            fs.writeJSONSync( manifest.destination , manifest );
        });

    }( vidInfo ));


    function getAudio( video , dir , callback ) {

        callback = callback || function() {};

        var template = 'ffmpeg -i [video] [audio]';

        var audio = dir + 'audio.mp3';
        var cmd = template
            .replace( /\[video\]/ , video )
            .replace( /\[audio\]/ , audio );

        exec( cmd , callback );
    }


    function getFrameset( video , dir , fps , callback ) {

        callback = callback || function() {};

        var template = 'ffmpeg -i [video] -r [fps] -f image2 [schema]';

        var schema = dir + 'frame-%d.jpg';
        var cmd = template
            .replace( /\[video\]/ , video )
            .replace( /\[fps\]/ , fps )
            .replace( /\[schema\]/ , schema );

        exec( cmd , callback );
    }


    function getFrameArray( dir , fps , callback ) {

        callback = callback || function() {};

        var index = 1;
        var count = 0;
        var frames = [];
        var schema = 'frame-[index].jpg';
        var frameset;

        while (frameset !== false) {
            frameset = subset( index );
            index += fps;
            if (frameset) {
                frames.push( frameset );
            }
        }

        function subset( index ) {

            var frameset = arrayFill( null , fps )
                .map(function( n , i ) {
                    var name = schema.replace( /\[index\]/ , ( index + i ));
                    var path = dir + name;
                    return fs.existsSync( path ) ? name : n;
                });

            var filtered = frameset.filter(function( name ) {
                return name !== null;
            });

            count += filtered.length;

            return filtered.length > 0 ? frameset : false;
        }

        util.puts( 'sliced video into ' + count + ' frames @ ' + fps + ' fps.' );

        return frames;
    }


    function arrayFill( val , len ) {
        len = len || 0;
        var arr = [];
        var i = 0;
        while (i < len) {
            arr.push( val );
            i++;
        }
        return arr;
    }


    function Manifest( dir ) {

        var that = this;

        that.origin = SERVER;
        that.path = PATH;
        that.audio = 'audio.mp3';
        that.frames = [];

        Object.defineProperties( that , {

            poster: {
                get: function() {
                    return that.frames[0][0];
                },
                enumerable: true
            },

            destination: {
                get: function() {
                    return dir + 'manifest.json';
                }
            }
        });
    }


}());





















