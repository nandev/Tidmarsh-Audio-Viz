var audioStream = undefined;
var audio_status = 0;
var animation = undefined;

function createAudioElement(id){
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

function createEnterElement(id){
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

let sketch_nayo = function(p) {
    p.setup = function() {
        // create canvas
        let cnv = p.createCanvas(p.windowWidth, 720);
        cnv.style('display', 'block');
        cnv.style('z-index', -1
      );
        cnv.parent('sketchContainer');

        // create Animation
        animation = new NanForest(p.width, p.height, audioStream, p)
    };
    p.draw = function() {
        // draw Animation
        if(this.animation!=undefined) {
            animation.draw()
        }
    };
}

function setup_audio_canvas(){
	// setup audio stream
    try{
        audioElement = createAudioElement("advAudio");
        audio_status = 1; // status: advanced audio
        audioStream = new AudioSource(audioElement);
        audioStream.advanced();
        audioStream.play();
	}
    catch(err) {
        // browser does not support player
        audio_status = 0;
        if(audioStream!=undefined) audioStream.cleanup().then(audio = undefined)
        this.audioElement.play();
        console.log(err)
        console.log("Your browser does't support advanced audio processing. \
        Try again using the latest desktop version of Chrome, Firefox, or Edge.")
    }
    document.getElementById("sketchContainer").className = document.getElementById("sketchContainer").className.replace( /(?:^|\s)lowOpacity(?!\S)/g , '' );
    document.getElementById('playButton').style.backgroundImage = "url('img/volume_up.svg')";
    // invoke p5
    new p5(sketch_nayo);
}

function togglePlay() {
  var aud = document.getElementById("advAudio");
  if(aud){
    if(aud.paused){
      document.getElementById("sketchContainer").className = document.getElementById("sketchContainer").className.replace( /(?:^|\s)lowOpacity(?!\S)/g , '' );
      document.getElementById('playButton').style.backgroundImage = "url('img/volume_up.svg')";
      aud.play();

    }else{
      document.getElementById("sketchContainer").className += "lowOpacity";
      document.getElementById('playButton').style.backgroundImage = "url('img/volume_off.svg')";
      aud.pause();
    }
  }
};

function initApp(){
    // createEnterElement("enterDiv");
    setup_audio_canvas();
}
