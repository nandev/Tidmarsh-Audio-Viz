const h = 60;
const w = 20;
var pos_x = [];
var pos_y = [];
var n_hor = 0;
var n_ver = 0;
var r_h = [];
var r_w = [];
var layers = [];
var lr_flip = [];
var lr_steps = [];
const lr_speed = 5;
const ud_speed = 1;

function setup() {
  	createCanvas(windowWidth, windowHeight);
  	frameRate(8);
	
	let h2 = h/2;
	let w2 = w/2;
	n_hor = windowWidth/w - 1;
	n_ver = windowHeight/h - 1;
	for(let j = 0; j<n_ver; j++){
		pos_x[j] = []; pos_y[j] = []; r_h[j] = []; r_w[j] = []; layers[j] = []; 
		lr_steps[j] = []; lr_flip[j] = []
		for(let i = 0; i<n_hor; i++ ){
			pos_x[j][i] = w+i*w+floor(random(-h2,h2));
			pos_y[j][i] = h+j*h+floor(random(-w2,w2));
			r_h[j][i] = floor(h*(1 - random(0, 0.5)));
			r_w[j][i] = floor(w*(0.5 - random(0, 0.4)));
			layers[j][i] = floor(random(0.4, 0.8)*r_h[j][i]/3);
			lr_steps[j][i] = 0;
			lr_flip[j][i] = 1;
		}
	}
}

function draw() {
	let ud_step = frameCount%(data.steps/ud_speed)*ud_speed;
	background(0);
	for(let j = 0; j<n_ver; j++){
		for(let i = 0; i<n_hor; i++ ){
			if(lr_steps[j][i]!=0){			
				lr_steps[j][i] = lr_steps[j][i]+lr_speed;
				if(lr_steps[j][i]>=data.steps) lr_steps[j][i]=0;
			}
			else if(coin_flip(0.01)){
				lr_steps[j][i]=1;
				lr_flip[j][i] = -lr_flip[j][i];
			}
			tree(pos_x[j][i], pos_y[j][i], r_h[j][i], r_w[j][i], layers[j][i], ud_step, lr_steps[j][i], lr_flip[j][i]);
		}
	}
}

function tree(x,y,h,w,l,ud_step,step,flip){
	let y_h = y-h;
	noFill();
	stroke(color('#2ecf00'))
	//stroke(color('#1e7d09'));
	for (let i = 1; i<l; i++){
		let dy = h-i*3
		let y_o_i = y_h + i*3 + h*data.sinsq[ud_step]*0.1;
		let y_i_i = y_h + (i-1)*3;
		let x_c = floor(x + flip*data.bazier20[step][i]*w);
		let x_l = x_c + w;
		let x_r = x_c - w;
		line(x_c, y_i_i, x_l, y_o_i);
		line(x_c, y_i_i, x_r, y_o_i);
	}
	stroke(color('#bda2a2'))
	//stroke(color('#300313'));
	bezier(x, y, x, y, x, y_h, x+flip*data.bazier20[step][0]*w, y_h);
}

function coin_flip(p){
	let chance = random(0,1);
	return chance<p;
}

