InlineVideo.TimingMOJO = (function( Object , MOJO , requestAnimationFrame ) {


    var TIMING = 'timing';
    var SUBSCRIBERS = 'subscribers';


    function TimingMOJO() {

        var that = this;

        that.shouldLoop = false;

        MOJO.Construct( that );

        Object.defineProperty( that , SUBSCRIBERS , {
            get: function() {
                return (that.handlers[ TIMING ] || []).length;
            }
        });

        that.step = that._step.bind( that );
    }


    TimingMOJO.prototype = MOJO.Create({

        subscribe: function( callback ) {

            var that = this;

            that.when( TIMING , callback );

            if (!that.shouldLoop) {
                that._start();
            }
        },

        unsubscribe: function( callback ) {

            var that = this;
            that.dispel( TIMING , callback );
        },

        _start: function() {

            var that = this;

            that.shouldLoop = true;
            requestAnimationFrame( that.step );
        },

        _step: function( timestamp ) {

            var that = this;

            that.happen( TIMING , timestamp );

            if (that[SUBSCRIBERS] < 1) {
                that.shouldLoop = false;
            }
            else if (that.shouldLoop) {
                requestAnimationFrame( that.step );
            }
        }
    });


    return new TimingMOJO();

    
}( Object , MOJO , requestAnimationFrame ));




























