InlineVideo.Audio = (function( Object , MOJO ) {


    var PROTOTYPE = 'prototype';


    function Audio( url ) {

        var that = this;

        that.url = url;
    }


    Audio[PROTOTYPE] = MOJO.Create({

        handleMOJO: function( e ) {

            var that = this;

            switch (e.type) {

                
            }
        }
    });


    function addEventListener( subject , event , callback ) {
        subject.addEventListener( event , callback );
    }


    return Audio;

    
}( Object , MOJO ));




























