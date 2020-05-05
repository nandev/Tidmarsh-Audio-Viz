var audioStream = undefined;
var audio_status = 0;
var animation = undefined;
var isPlaying = false;
var p5_main = undefined;
var currentSketch = 0;

var streamURL_ogg = "https://doppler.media.mit.edu/impoundment.ogg";
var streamURL_mp3 = "https://doppler.media.mit.edu/impoundment.mp3";


function createAudioElement(id){
    // create audio element
    let ae = document.createElement("AUDIO");
    ae.id = id;
    ae.controls = false;
    ae.setAttribute("crossorigin","anonymous");
    if (ae.canPlayType("audio/ogg")) {
        ae.setAttribute("src", streamURL_ogg);
    } else {
        ae.setAttribute("src", streamURL_mp3);
    }
	document.body.appendChild(ae);
    return ae;
}

// creates a click through to enter
function createEnterElement(id){
    let div = document.createElement("DIV");
    var para = document.createElement("p");
    let text = document.createTextNode("Click to Enter");
    div.id = id;
    para.appendChild(text);
    div.appendChild(para);
	document.body.appendChild(div);
    div.onclick = function(){
        setup_audio_canvas();
        this.style.display = "none"
    };
    return div;
}

function nextSketch(){
  if( currentSketch < sketches.length-1 ){
    p5_main.remove();
    currentSketch++;
    p5_main = new p5(sketches[currentSketch]);
  }
  if(currentSketch == sketches.length-1){
    document.getElementById('nextButton').style.display = "none";
  }
  if(currentSketch > 0){
    document.getElementById('lastButton').style.display = "block";
  }
}

function lastSketch(){
  if( currentSketch > 0 ){
    p5_main.remove();
    currentSketch--;
    p5_main = new p5(sketches[currentSketch]);
  }
  if(currentSketch==0){
    document.getElementById('lastButton').style.display = "none";
  }
  if(currentSketch < sketches.length-1){
    document.getElementById('nextButton').style.display = "block";
  }
}

function setup_audio_canvas(){
	// setup audio stream
    try{
        audioElement = createAudioElement("advAudio");
        audio_status = 1; // status: advanced audio
        audioStream = new AudioSource(audioElement);
        audioStream.advanced();
        // audioStream.play();
        // if(!audioStream.paused){isPlaying = true;};
	}
    catch(err) {
        // browser does not support player
        audio_status = 0;
        if(audioStream!=undefined) audioStream.cleanup().then(audio = undefined)
        // this.audioElement.play();
        // if(!this.audioElement.paused){isPlaying = true;};
        console.log(err)
        console.log("Your browser does't support advanced audio processing. \
        Try again using the latest desktop version of Chrome, Firefox, or Edge.")
    }
    document.getElementById("sketchContainer").className = document.getElementById("sketchContainer").className.replace( /(?:^|\s)lowOpacity(?!\S)/g , '' );
    document.getElementById('playButton').style.backgroundImage = "url('img/volume_off.svg')";
    // invoke p5
    currentSketch = 0;
    p5_main = new p5(sketches[currentSketch]);
}

function togglePlay() {
  var aud = document.getElementById("advAudio");
  if(aud){
    if(aud.paused){
      document.getElementById("sketchContainer").className = document.getElementById("sketchContainer").className.replace( /(?:^|\s)lowOpacity(?!\S)/g , '' );
      document.getElementById('playButton').style.backgroundImage = "url('img/volume_up.svg')";
      aud.play();
      isPlaying = true;

    }else{
      document.getElementById("sketchContainer").className += "lowOpacity";
      document.getElementById('playButton').style.backgroundImage = "url('img/volume_off.svg')";
      aud.pause();
      isPlaying = false;
    }
  }
};

function initApp(){
  // createEnterElement("enterDiv");
  // loadScript("js/sketches/LivingRings.js");
  // loadScript("js/sketches/drawing.js");
  setup_audio_canvas();
  if(currentSketch==0){
    document.getElementById('lastButton').style.display = "none";
  }
}

function loadScript(url) {
    var script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
}

/******************************************************************************/
/*****************************sketch definitions*******************************/
/******************************************************************************/

// Tidmarsh Forest Bath, by Nan Zhao (NAYO)
let TidmarshForestBath_setup = function(p) {
  document.getElementById('homeBodyApp').style.backgroundImage = "url('../img/TidmarshForestBath/bg.jpg')";
  document.getElementById('homeBodyApp').style.backgroundColor = "#000000";
  document.getElementById('logoContainer').style.display = "none";
  document.getElementById('designCredit').innerHTML = "\"Tidmarsh Sound Bath\" by " + "<a href='https://nayo.info/tidmarsh' target='_blank'>Nan Zhao</a>";
  p.setup = function() {
    cnv = p.createCanvas(p.windowWidth, 720);
    cnv.style('display', 'block');
    cnv.parent('sketchContainer');
    animation = new NanForest(p.width, p.height, audioStream, p)
  };
  p.draw = function() {
    if(this.animation!=undefined) {
        animation.draw()
    }
  };
}

// Living Sounds, by Orcun Gogus
let LivingRings_setup = function(p) {
  document.getElementById('homeBodyApp').style.backgroundImage = "url('../img/background2x.jpg')";
  document.getElementById('homeBodyApp').style.backgroundColor = "#141414";
  document.getElementById('logoContainer').style.display = "block";
  document.getElementById('designCredit').innerHTML = "\"Living Sounds\" by " + "<a href='https://orcungogus.com' target='_blank'>Orcun Gogus</a>, based on a sketch by <a href='https://generated.space/' target='_blank'>Kjetil Golid</a>";
  p.setup = function() {
    cnv = p.createCanvas(p.windowWidth, 720);
    cnv.style('display', 'block');
    cnv.parent('sketchContainer');
    animation = new LivingRings(p.width, p.height, audioStream, p)
  };
  p.draw = function() {
    if(this.animation!=undefined) {
      animation.draw()
    }
  };
}

var sketches = [TidmarshForestBath_setup, LivingRings_setup];
