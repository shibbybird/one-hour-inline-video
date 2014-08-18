(function( window , document , InlineVideo ) {


    var inlineVid = new InlineVideo( '#hack-video' , {
        url: (window.location.href + 'big_buck_bunny/manifest.json')
    });
    
    inlineVid.play();


    var statusDiv = document.querySelector( '#status' );
    var start = document.querySelector( '#start' );
    var stop = document.querySelector( '#stop' );


    inlineVid.when( 'readyState' , function( e , status , code ) {
        statusDiv.querySelector( '.text' ).innerHTML = status;
    });


    inlineVid.when( 'buffer' , function( e , percent ) {
        statusDiv.querySelector( '.text' ).innerHTML = (Math.round( percent * 100 ) + '%');
    });


    inlineVid.when( 'tic' , function( e , elapsed , duration ) {
        var elapsedString = formatTime( elapsed );
        var durationString = formatTime( duration );
        statusDiv.querySelector( '.time' ).innerHTML = (elapsedString + ' | ' + durationString);
    });


    console.log(inlineVid);


    start.addEventListener( 'click' , function() {
        inlineVid.play();
    });


    stop.addEventListener( 'click' , function() {
        inlineVid.stop();
    });


    function formatTime( s ) {

        if (isNaN( s / 1 )) {
            return s;
        }

        s = Math.round( s );
        
        var m = Math.floor(s / 60);
        s = s - m * 60;
        s = (s < 10 && s >= 0) ? '0' + s : s;

        var h = Math.floor(m / 60);
        m = m - h * 60;

        return (h > 0 ? ((h) + ':') : '') + ((h > 0 && m < 10) ? (('0' + m)) : m) + ':' + (s);
    }


}( window , document , InlineVideo ));






















