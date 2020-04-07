const tree_h = 60; 
const tree_w = 20;
var n_trees;
var n_tree_h;
var n_tree_v;
var trees = [];
const lr_speed = 5;
const ud_speed = 1;
var birds = [];
var n_birds = 0;
const bird_size = 2;

class Tree{
	constructor(id, i, j, w, h, data){
		let h2 = h/2;
		let w2 = w/2;
		this.id = id;
		this.i = i;
		this.j = j;
		this.x = w+i*w+floor(random(-h2,h2));
		this.y = h+j*h+floor(random(-w2,w2));
		this.h = floor(h*(1 - random(0, 0.5)));
		this.w = floor(w*(0.5 - random(0, 0.4)));
		this.layers = floor(random(0.4, 0.8)*this.h/3);
		this.lr_step = 0;
		this.lr_flip = 1;
		this.data = data;
	}
	
	draw(ud_wave){
		if(this.lr_step!=0){			
			this.lr_step = this.lr_step+lr_speed;
			if(this.lr_step>=data.steps) this.lr_step=0;
		}
		else if(coin_flip(0.01)){
			this.lr_step=1;
			this.lr_flip = -this.lr_flip;
		}
		let y_top = this.y-this.h;
		noFill();
		stroke(color('#2ecf00')); //stroke(color('#1e7d09'));
		for (let i = 1; i<this.layers; i++){
			let dy = this.h-i*3
			let y_o_i = y_top + i*3 + this.h*ud_wave*0.1;
			let y_i_i = y_top + (i-1)*3;
			let x_c = this.x + this.lr_flip*this.data.bazier20[this.lr_step][i]*this.w;
			let x_l = x_c + this.w;
			let x_r = x_c - this.w;
			line(x_c, y_i_i, x_l, y_o_i);
			line(x_c, y_i_i, x_r, y_o_i);
		}
		stroke(color('#bda2a2')); //stroke(color('#300313'));
		bezier(this.x, this.y, this.x, this.y, this.x, y_top, floor(this.x+this.lr_flip*this.data.bazier20[this.lr_step][0]*this.w), y_top);
	}
	
}

function setup() {
  	createCanvas(windowWidth, windowHeight);
  	frameRate(8);
	// generate population size
	n_tree_h = floor(windowWidth/tree_w - 1);
	n_tree_v = floor(windowHeight/tree_h - 1);
	n_trees  = n_tree_h*n_tree_v;
	n_birds  = floor(n_tree_h*n_tree_v/20);
	// generate trees
	for(let id = 0; id<n_trees; id++){
		j = floor(id/n_tree_h);
		i = id%n_tree_h;
		trees[id] = new Tree(id, i, j, tree_w, tree_h, data);
	}
	// generate birds
	for(let i = 0; i<n_birds; i++){
		let bird = {tree: 0, side: 0, branch: 0, step:0, color:'#cf2900'};
		bird.tree = trees[floor(random(0,n_trees-1))];
		bird.side = round(random(0,1));
		bird.branch = floor(random(0,bird.tree.layers));
		birds[i]=bird;
	}
	//noLoop();
}

function draw() {
	background(0);
	// draw trees
	let ud_step = frameCount%(data.steps/ud_speed)*ud_speed;
	for(let id = 0; id<n_trees; id++){
		trees[id].draw(data.sinsq[ud_step]);
	}
	for(let i = 0; i<n_birds; i++){
		draw_bird(birds[i]);
	}
}

function coin_flip(p){
	let chance = random(0,1);
	return chance<p;
}

function draw_bird(bird){
	let t_x = bird.tree.x;
	let t_y = bird.tree.y;
	let x = t_x+bird.tree.w/2;
	let y = t_y-bird.tree.h+bird.branch*3; 
	let c = color(bird.color)
	stroke(c); fill(c);
	triangle(x, y-bird_size, x+bird_size, y, x-bird_size, y);
	
}

