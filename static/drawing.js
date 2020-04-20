// global var trees
const trees = []; 
const tree_par = {ud_speed: 1, ud_om: 1, lr_speed: 5, h: 60, w: 20, n: 0, n_h: 0, n_v: 0};
// global var for birds
const birds = [];
const bird_par = {speed: 1, h: 3, n: 0, color: '#cf2900'};
// global var for bugs
const bugs =[];
const bug_par = {speed: 1, h: 1, n: 0, color: '#fff705', branch: 10, d: 0};

var audio = null;
var audio_status = 0;

class Tree{
	constructor(id, par, i, j, data){
		this.id = id;
		this.par = par;
		this.i = i; //colums
		this.j = j; //rows
		let h = this.par.h; let w = this.par.w;
		let h2 = h*0.5; let w2 = w*0.3;
		this.x = w*(0.5+i)+floor(random(-h2,h2))+5;
		this.y = h*(1+j)+floor(random(-w2,w2))+5;
		this.h = floor(h*(1 - random(0, 0.5)));
		this.w = floor(w*(0.5 - random(0, 0.4)));
		this.y_top = this.y - this.h;
		this.layers = floor(random(0.4, 0.8)*this.h*0.3333);
		this.lr_step = 0;
		this.lr_flip = 1;
		this.data = data;
	}
	
	draw(wave, p){
		if(this.lr_step!=0){			
			this.lr_step = this.lr_step+this.par.lr_speed;
			if(this.lr_step>=this.data.steps) this.lr_step=0;
		}
		else if(coin_flip(p)){
			this.lr_step=1;
			this.lr_flip = -this.lr_flip;
		}
		let curve = this.data.bazier20[this.lr_step];
		stroke(color('#2ecf00')); noFill(); 
		for (let i = 1; i<this.layers; i++){
			let dy = this.h-i*3
			let y_o_i = this.y_top + i*3 + this.h*wave*0.1;
			let y_i_i = this.y_top + (i-1)*3;
			let x_c = this.x + this.lr_flip*curve[i]*this.w;
			let x_l = x_c + this.w;
			let x_r = x_c - this.w;
			line(x_c, y_i_i, x_l, y_o_i);
			line(x_c, y_i_i, x_r, y_o_i);
		}
		stroke(color('#bda2a2'));
		bezier(this.x, this.y, this.x, this.y, this.x, this.y_top, 
			floor(this.x+this.lr_flip*curve[0]*this.w), this.y_top);
	}
}

class Bird{
	constructor(id, par, data){
		this.id = id;
		this.par = par;
		this.data = data;
		this.tree = trees[floor(random(0,tree_par.n-1))];
		this.next_tree = null;
		this.dx = 0; this.dy = 0; this.next_x = 0; this.next_y = 0;
		this.branch = floor(random(0,this.tree.layers));
		this.side = 1;
		this.fly_step = 0;
		this.x = this.tree.x+this.tree.w*0.5;
		this.y = this.tree.y_top+this.branch*3; 
	}
	draw(){
		let x = this.x;
		let y = this.y; 
		let h = this.par.h;
		let c = color(this.par.color)
		stroke(c); fill(c);
		triangle(x, y-h, x+h, y, x-h, y);
	}
	fly(p){
		let c = color(this.par.color)
		stroke(c); fill(c);
		if(this.fly_step!=0){	
			let h = this.par.h;	
			let curve = this.data.sinsq[this.fly_step]*h*10;
			let x = this.dx*this.fly_step+this.x+curve;
			let y = this.dy*this.fly_step+this.y+curve;
			if(this.fly_step%2){
				triangle(x, y, x+h, y-h, x-h, y-h);
			}else{
				triangle(x, y-h, x+h, y, x-h, y);
			}
			// next step	
			this.fly_step = this.fly_step+this.par.speed;
			if(this.fly_step>=this.data.steps) {
				this.x = this.next_x; this.y = this.next_y;
				this.tree = this.next_tree;
				this.fly_step=0;
			}
		}
		else if(coin_flip(p)){
			this.fly_step=1;
			// find random next tree
			let next_id = this.tree.id;
			while(next_id == this.tree.id || next_id < 0 || next_id >=tree_par.n){
				let j = floor(this.tree.j+random(-2,2));
				j = this.flylimit(j,tree_par.n_v);
				let i = floor(this.tree.i+random(-2,2));
				i = this.flylimit(i,tree_par.n_h);
				next_id = j*tree_par.n_h+i;
			}	
			this.next_tree = trees[next_id];
			this.next_x = this.next_tree.x+this.next_tree.w*0.5;
			this.next_y = this.next_tree.y_top+this.branch*3;
			this.dy = (this.next_y - this.y)/this.data.steps;
			this.dx = (this.next_x - this.x)/this.data.steps;
		}else{
			let curve = this.data.bazier20[this.tree.lr_step];
			let x = this.x + this.tree.lr_flip*curve[this.branch]*this.tree.w;
			let y = this.y; 
			let h = this.par.h;
			triangle(x, y-h, x+h*0.5, y, x-h*0.5, y);
		}
	}
    flylimit(index, maximum){
        if (index<0) index = index + 4;
        else if (index >= maximum) index = index - 4;
        return index
    }
}

class Bug{
	constructor(id, par, data){
		this.id = id;
		this.par = par;
		this.data = data;
		this.tree = trees[floor(random(0,tree_par.n-1))];
		this.side = 1;
		this.fly_step = 0;
		this.x = this.tree.x+this.tree.w*0.5;
		this.y = this.tree.y_top+this.par.branch*3;
		this.om = 6.28/this.data.steps; 
		this.d = 0;
	}
	fly(p){
		let c = color(this.par.color)
		stroke(c); fill(c);
		if(this.fly_step!=0){
			// flying path		
			let curve = this.side*this.data.sinsq[this.fly_step]*2;
			let y = floor(this.y+curve*random(this.d-2,this.d));
			let x = floor(this.x-Math.sin(this.fly_step*this.om)*this.d);
			let h = this.par.h;
			// draw bug flying
			if(this.fly_step%2){
				triangle(x, y, x+h, y-h, x-h, y-h);
			}else{
				triangle(x, y-h, x+h, y, x-h, y);
			}
			// draw a halo
			let c = color(255,255,255,random(0,70))
			stroke(c); fill(c);
			circle(x, y, h*5);	
			// next step
			this.fly_step = this.fly_step+this.par.speed;
			if(this.fly_step>=this.data.steps) this.fly_step=0;
		}
		else if(coin_flip(p)){
			this.fly_step=1; this.side = -this.side;
			this.d = random(this.par.d*0.5, this.par.d);
		}else{
			let x = this.x; let y = this.y; let h = this.par.h;
			triangle(x, y-h, x+h*0.5, y, x-h*0.5, y);
		}
	}
}

function windowResized(){
	//resizeCanvas(windowWidth, windowHeight);
}

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
	panel = document.querySelector('#control');
	panel.appendChild(ae); 
    
    // behavior
	ae.addEventListener('ended', () => {
        if(audio_status == 1){
    		document.querySelector('#control').dataset.playing = 'false';
    		document.querySelector('#play_img').style.visibility = "visible";
    		document.querySelector('#pause_img').style.visibility = "hidden";
            audio.pause();
        }
	}, false);
    
    return ae;
}
	
function creatErrMsgDom(){
	let p = document.createElement("P");
	p.id = "err_msg"
	p.style.visibility = "hidden";
	document.body.appendChild(p); 
	return p;
}

function createControlPanel(){
	let a = document.createElement("DIV");
	a.id = "control";
	document.body.appendChild(a); 
    return a;
}

function creatTitleDom(text){
	let p = document.createElement("P");
	p.id = "title"
	p.innerHTML = text;
	panel = document.querySelector('#control');
	panel.appendChild(p); 
	return p;
}

function createPlayerControl(){
	// create play pause button
	let a = document.createElement("DIV");
	a.id = "play";
	a.role = "button";
	a.dataset.playing = false;
	let pause = document.createElement("IMG");
	pause.id = "pause_img";
	pause.style.visibility = "hidden";
	pause.src = "/static/pause.png";
	let play = document.createElement("IMG");
	play.id = "play_img";
	play.src = "/static/play.png";
	panel = document.querySelector('#control');
	panel.appendChild(a); 
	a.appendChild(pause);
	a.appendChild(play);
	
	// behavior
	a.addEventListener('click', function() {
		if (this.dataset.playing === 'false') {
			audio.play();
        	this.setAttribute('data-playing', 'true');
			this.setAttribute('aria-pressed', 'true');
			document.querySelector('#play_img').style.visibility = "hidden";
			document.querySelector('#pause_img').style.visibility = "visible";
		} else {
			audio.pause();
			this.setAttribute('data-playing', 'false');
			this.setAttribute('aria-pressed', 'false');
			document.querySelector('#pause_img').style.visibility = "hidden";
			document.querySelector('#play_img').style.visibility = "visible";
		}
	}, false);
	
	return a;
}

function createVolSlider(){
	let a = document.createElement("DIV");
	a.id = "volume_div";
	let img = document.createElement("IMG");
	img.id = "volume_img";
	img.src = "/static/volume.png";
	let v = document.createElement("INPUT");
	v.id = "volume";
	v.type = "range";
	v.in= 0; v.max=2; v.value=1; v.step=0.01;
	panel = document.querySelector('#control');
	panel.appendChild(a);
	a.appendChild(img); 
	a.appendChild(v); 
	
	// behavior
	v.addEventListener('input', function() {
		audio.gainNode.gain.value = this.value;
	}, false);
	
	return v 
}

function setup() {
    // error msg display
    let msgElement = creatErrMsgDom();
    let ctlElement = createControlPanel();
	
	// setup audio stream  
	try{
        audio_status = 1; // status: advanced audio
		audio = new AudioSource();
        audio.advanced(); 
	}
    catch(err) {
        // browser does not support player
        audio_status = 0;
        audio = null;
        msgElement.innerHTML = "Your browser does't support advanced audio processing. Try again using the latest desktop version of Chrome, Firefox, or Edge."
        // msgElement.innerHTML = err.message;
        msgElement.style.visibility = "visible"; 
    }
    
    //UI
    if(audio_status==1){
        creatTitleDom("Live Audio Tidmarsh Wildlife");
        createVolSlider();
        createPlayerControl();
    }else{
        //let audioElement = creatAudioElement("simpleAudio");
        //audioElement.controls = true;
        ctlElement.style.backgroundColor = "rgba(0,0,0,0)";
    }
    
	// setup canvas
  	let cnv = createCanvas(windowWidth, windowHeight-100);
	//cnv.position(0, 0);
	cnv.style('z-index', -1);
	// setup framerate
  	frameRate(8);
	
	// generate population size
	tree_par.n_h = floor((width-40)/tree_par.w);
	tree_par.n_v = floor((height-10)/tree_par.h);
	tree_par.n  = tree_par.n_h*tree_par.n_v;
	bird_par.n  = floor(tree_par.n*0.1);
	bug_par.n = bird_par.n;
	bug_par.d = tree_par.h*0.25;
	// generate trees
	for(let id = 0; id<tree_par.n; id++){
		let j = floor(id/tree_par.n_h);
		let i = id%tree_par.n_h;
		trees[id] = new Tree(id, tree_par, i, j, data);
	}
	// generate birds
	for(let i = 0; i<bird_par.n; i++){
		birds[i]=new Bird(i, bird_par, data);
	}
	// generate birds
	for(let i = 0; i<bug_par.n; i++){
		bugs[i]=new Bug(i, bug_par, data);
	}
}

function draw() {	
    let p_bug = 0.01;
    let p_bird = 0.01;
    let p_tree = 0.01;
    
    // get sound analysis
    if(audio_status>0) {
        let dataArray = audio.analyse();
        let strArray = [];
        /*
        for (let i=0; i<32;i++){
            let x = dataArray[i]/100;
            strArray.push(Number.parseFloat(x).toFixed(4))
        }
    	console.log(strArray)
        */
    	// update probabilities
        let td = new Date();
        let t = td.getHours;
        let ws = (dataArray[0] + 0.5*(dataArray[1] + dataArray[2]))*0.01;
        let bs = (dataArray[1])*0.01 + (dataArray[4] + dataArray[5] + dataArray[6] + dataArray[7])*0.006;
        let bus = (dataArray[2] + dataArray[3])*0.01;
        p_tree = Math.pow(ws,2)*0.01;
        
        // night
        if (t>19 && t<5){
        	p_bug = Math.pow(Math.max(bus-0.5*ws,0),2)*0.001; //high
        	p_bird = Math.pow(Math.max(bs-0.5*ws,0),6)*0.0001; //low
        }else{
        	p_bird = Math.pow(Math.max(bs-0.5*ws,0),2)*0.001; 
        	p_bug = Math.pow(Math.max(bus-0.5*ws,0),4)*0.01; 
            p_bug = value_limit(p_bug,0,0.01);
        }
    	
    } 
	
    //console.log(p_bug, p_bird, p_tree)
    
	// draw background
	background(0);
	// draw trees
	let ud_step = frameCount%(data.steps*tree_par.ud_om)*tree_par.ud_speed;
	for(let id = 0; id<tree_par.n; id++){
		trees[id].draw(data.sinsq[ud_step], p_tree);
	}
	// draw birds
	for(let i = 0; i<bird_par.n; i++){
		birds[i].fly(p_bird);
	}
	//draw bugs
	for(let i = 0; i<bug_par.n; i++){
		bugs[i].fly(p_bug);
	}
}

// unitility
function coin_flip(p){
	let chance = random(0,1);
	return chance<p;
}

// unitility
function value_limit(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}


