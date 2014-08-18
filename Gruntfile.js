module.exports = function( grunt ) {


    var httpd = require( 'httpd-node' );
    var fs = require( 'fs-extra' );


    httpd.environ( 'root' , __dirname );


    var Script = [
        'src/core.js',
        'src/timingMOJO.js',
        'src/audio.js',
        'src/frameset.js',
        'src/buffer.js',
        'src/init.js'
    ];


    var Lib = [
        'src/lib/mojo-0.1.5.min.js',
        'src/lib/promise-1.0.0.min.js',
        'src/lib/requestAnimationFrame-pollyfill-0.1.0.js'
    ];


    var All = Lib.concat( Script );


    grunt.initConfig({

        pkg: grunt.file.readJSON( 'package.json' ),

        'git-describe': {
            'options': {
                prop: 'git-version'
            },
            dist : {}
        },

        jshint: {
            all: [ 'Gruntfile.js' ].concat( Script )
        },

        clean: {
            all: [ 'inlineVideo-*.js' , 'live' ]
        },

        replace: [{
            options: {
                patterns: [{
                    match: /<\!(\-){2}\s\[scripts\]\s(\-){2}>/,
                    replacement: '<script src=\"../inlineVideo-<%= pkg.version %>.js\"></script>'
                }]
            },
            files: [{
                src: 'live/index.html',
                dest: 'live/index.html'
            }]
        }],

        watch: {
            files: ([ 'Gruntfile.js' , 'package.json' , 'test/*' ]).concat( All ),
            tasks: [ '_debug' ]
        },

        concat: {
            options: {
                banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: All,
                dest: 'inlineVideo-<%= pkg.version %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - <%= pkg.version %> - <%= grunt.config.get( \'git-hash\' ) %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            release: {
                files: {
                    'inlineVideo-<%= pkg.version %>.min.js' : All
                }
            }
        }
    });


    [
        'grunt-contrib-jshint',
        'grunt-contrib-clean',
        'grunt-git-describe',
        'grunt-replace',
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-watch'
    ]
    .forEach( grunt.loadNpmTasks );


    grunt.registerTask( 'startServer' , function() {
        var server = new httpd();
        server.setHttpDir( 'default' , '/' );
        server.start();
    });


    grunt.registerTask( 'createLive' , function() {
        var src = __dirname + '/test';
        var dest = __dirname + '/live';
        fs.copySync( src , dest );
    });


    grunt.registerTask( 'createHash' , function() {

        grunt.task.requires( 'git-describe' );

        var rev = grunt.config.get( 'git-version' );
        var matches = rev.match( /(\-{0,1})+([A-Za-z0-9]{7})+(\-{0,1})/ );

        var hash = matches
            .filter(function( match ) {
                return match.length === 7;
            })
            .pop();

        if (matches && matches.length > 1) {
            grunt.config.set( 'git-hash' , hash );
        }
        else{
            grunt.config.set( 'git-hash' , rev );
        }
    });


    grunt.registerTask( 'always' , [
        'jshint',
        'git-describe',
        'createHash',
        'clean'
    ]);


    grunt.registerTask( 'default' , [
        'always',
        'uglify'
    ]);


    grunt.registerTask( 'dev' , [
        'always',
        'concat'
    ]);


    grunt.registerTask( '_debug' , [
        'dev',
        'createLive',
        'replace',
    ]);


    grunt.registerTask( 'debug' , [
        '_debug',
        'startServer',
        'watch'
    ]);
};


















