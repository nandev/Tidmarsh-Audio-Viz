var audio = undefined;
var audio_status = 0;
var animation = undefined;

function creatAudioElement(id){
    // create audio element
    let ae = document.createElement("AUDIO");
    ae.id = id;
    ae.controls = false;
    ae.setAttribute("crossorigin","anonymous");
    if (ae.canPlayType("audio/ogg")) {
        ae.setAttribute("src","https://doppler.media.mit.edu/impoundment.ogg");
    } else {
        ae.setAttribute("src","https://doppler.media.mit.edu/impoundment.mp3");
    }
	document.body.appendChild(ae);
    return ae;
}

function sketch(p5) {
    
    p5.setup = function() {
        // create Cavas
        let cnv = p5.createCanvas(p5.windowWidth, p5.windowHeight);
        cnv.style('z-index', -1);

        // create Animation
        animation = new NanForest(p5.width, p5.height, audio, p5)
    };

    p5.draw = function() {        
        if(this.animation!=undefined) {
            animation.draw()
        }
    };
};

function init(){

	// setup audio stream
    try{
        audioElement = creatAudioElement("advAudio");
        audio_status = 1; // status: advanced audio
		audio = new AudioSource(audioElement);
        audio.advanced();
	}
    catch(err) {
        // browser does not support player
        audio_status = 0;
        if(audio!=undefined) audio.cleanup().then(audio = undefined)
        console.log(err)
        console.log("Your browser does't support advanced audio processing. \
        Try again using the latest desktop version of Chrome, Firefox, or Edge.")
    }

    new p5(sketch); // invoke p5
}
