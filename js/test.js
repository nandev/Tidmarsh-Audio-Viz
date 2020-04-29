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

function creatEnterElement(id){
    // create audio element
    let div = document.createElement("DIV");
    var para = document.createElement("p");
    let text = document.createTextNode("Click to Enter"); 
    div.id = id;
    para.appendChild(text);
    div.appendChild(para);
	document.body.appendChild(div);
    // behavior
    div.onclick = function(){ 
        setup_audio_canvas(); 
        this.style.display = "none"
    };
    return div;
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
    creatEnterElement("enterDiv");
}

function setup_audio_canvas(){

	// setup audio stream
    try{
        audioElement = creatAudioElement("advAudio");
        audio_status = 1; // status: advanced audio
		audio = new AudioSource(audioElement);
        audio.advanced();
        audio.play();
	}
    catch(err) {
        // browser does not support player
        audio_status = 0;
        if(audio!=undefined) audio.cleanup().then(audio = undefined)
        this.audioElement.play();
        console.log(err)
        console.log("Your browser does't support advanced audio processing. \
        Try again using the latest desktop version of Chrome, Firefox, or Edge.")
    }
    
    // invoke p5
    new p5(sketch); 
}
