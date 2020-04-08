const tree_h = 60; 
const tree_w = 20;
var n_trees;
var n_tree_h;
var n_tree_v;
var trees = [];
const lr_speed = 5;
const ud_speed = 1;
var n_birds;
const bird_h = 3;
var fly_speed = 1;
var birds = [];

class Tree{
	constructor(id, i, j, w, h, data){
		let h2 = h/2;
		let w2 = w/2;
		this.id = id;
		this.i = i; //colums
		this.j = j; //rows
		this.x = w+i*w+floor(random(-h2,h2));
		this.y = h+j*h+floor(random(-w2,w2));
		this.h = floor(h*(1 - random(0, 0.5)));
		this.w = floor(w*(0.5 - random(0, 0.4)));
		this.y_top = this.y - this.h;
		this.layers = floor(random(0.4, 0.8)*this.h/3);
		this.lr_step = 0;
		this.lr_flip = 1;
		this.data = data;
	}
	
	draw(wave, p){
		if(this.lr_step!=0){			
			this.lr_step = this.lr_step+lr_speed;
			if(this.lr_step>=this.data.steps) this.lr_step=0;
		}
		else if(coin_flip(p)){
			this.lr_step=1;
			this.lr_flip = -this.lr_flip;
		}
		let curve = this.data.bazier20[this.lr_step];
		noFill();
		stroke(color('#2ecf00')); //stroke(color('#1e7d09'));
		
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
		stroke(color('#bda2a2')); //stroke(color('#300313'));
		bezier(this.x, this.y, this.x, this.y, this.x, this.y_top, 
			floor(this.x+this.lr_flip*curve[0]*this.w), this.y_top);
	}
}

class Bird{
	constructor(id, h, color, data){
		this.id = id;
		this.h = h;
		this.data = data;
		this.tree = trees[floor(random(0,n_trees-1))];
		this.next_tree = null;
		this.dx = 0; this.dy = 0; this.next_x = 0; this.next_y = 0;
		this.branch = floor(random(0,this.tree.layers));
		this.side = round(random(0,1));
		this.color = color;
		this.fly_step = 0;
		this.x = this.tree.x+this.tree.w/2;
		this.y = this.tree.y_top+this.branch*3; 
	}
	draw(){
		let x = this.x;
		let y = this.y; 
		let c = color(this.color)
		stroke(c); fill(c);
		triangle(x, y-this.h, x+this.h, y, x-this.h, y);
	}
	fly(p){
		let c = color(this.color)
		stroke(c); fill(c);
		if(this.fly_step!=0){		
			let curve = this.data.sinsq[this.fly_step];
			let x = this.dx*this.fly_step+this.x+curve*this.h*10;
			let y = this.dy*this.fly_step+this.y+curve*this.h*10;
			if(this.fly_step%2){
				triangle(x, y, x+this.h, y-this.h, x-this.h, y-this.h);
			}else{
				triangle(x, y-this.h, x+this.h, y, x-this.h, y);
			}
				
			this.fly_step = this.fly_step+fly_speed;
			if(this.fly_step>=this.data.steps) {
				this.x = this.next_x; this.y = this.next_y;
				this.tree = this.next_tree;
				this.fly_step=0;
			}
		}
		else if(coin_flip(p)){
			this.fly_step=1;
			let next_id = this.tree.id;
			while(next_id == this.tree.id){
				let j = floor(this.tree.j+random(-2,2));
				j = value_limit(j,0,n_tree_v-1);
				let i = floor(this.tree.i+random(-2,2));
				i = value_limit(i,0,n_tree_h-1);
				next_id = j*n_tree_h+i;
			}	
			this.next_tree = trees[next_id];
			this.next_x = this.next_tree.x+this.next_tree.w/2;
			this.next_y = this.next_tree.y_top+this.branch*3;
			this.dy = (this.next_y - this.y)/this.data.steps;
			this.dx = (this.next_x - this.x)/this.data.steps;
		}else{
			let curve = this.data.bazier20[this.tree.lr_step];
			let x = this.x + this.tree.lr_flip*curve[this.branch]*this.tree.w;
			let y = this.y; 
			triangle(x, y-this.h, x+this.h/2, y, x-this.h/2, y);
		}
	}
}

function setup() {
	initAudio();
	let banner = 100;
  	let cnv = createCanvas(windowWidth, windowHeight-banner);
	cnv.position(0, banner);
  	frameRate(8);
	// generate population size
	n_tree_h = floor(windowWidth/tree_w - 1);
	n_tree_v = floor(windowHeight/tree_h - 1);
	n_trees  = n_tree_h*n_tree_v;
	n_birds  = floor(n_tree_h*n_tree_v/5);
	// generate trees
	for(let id = 0; id<n_trees; id++){
		let j = floor(id/n_tree_h);
		let i = id%n_tree_h;
		trees[id] = new Tree(id, i, j, tree_w, tree_h, data);
	}
	// generate birds
	for(let i = 0; i<n_birds; i++){
		birds[i]=new Bird(i, bird_h, '#cf2900', data);
	}
}

function draw() {
	analyser.getByteFrequencyData(dataArray);
	console.log(dataArray)
	//let p_bird = Math.pow((dataArray[3] + dataArray[6])/50,2)*0.001; //day
	let p_bird = Math.pow((dataArray[3] + dataArray[6])/150,6)*0.0001; //night
	let p_tree = Math.pow((dataArray[0] + dataArray[0])/100,2)*0.01;
	background(0);
	// draw trees
	let ud_step = frameCount%(data.steps/ud_speed)*ud_speed;
	for(let id = 0; id<n_trees; id++){
		trees[id].draw(data.sinsq[ud_step], p_tree);
	}
	for(let i = 0; i<n_birds; i++){
		birds[i].fly(p_bird);
	}
}

function coin_flip(p){
	let chance = random(0,1);
	return chance<p;
}

function value_limit(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}


