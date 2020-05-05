/*

    Nan's Forest Animation

*/


class Tree{
	constructor(id, par, i, j, data, p5){
		this.id = id;
		this.par = par;
		this.i = i; //colums
		this.j = j; //rows
		this.data = data;
        this.p5 = p5;
        this.h_grid
		let h = this.par.h; let w = this.par.w;
		let h2 = this.par.h_grid*this.par.h_random_pos; let w2 = this.par.w_grid*this.par.w_random_pos;
		this.x = this.par.w_grid*(1.5+i+this.par.w_random_pos)+Math.floor(this.p5.random(-w2,w2));
		this.y = this.par.h_grid*(2+j+this.par.h_random_pos)+Math.floor(this.p5.random(-h2,h2));
		this.h = Math.floor(h*(1 - this.p5.random(0, 0.5)));
		this.w = Math.floor(w*(0.5 - this.p5.random(0, 0.4)));
		this.y_top = this.y - this.h;
		this.layers = Math.floor(this.p5.random(0.4, 0.8)*this.h*0.3333);
		this.lr_step = 0;
		this.lr_flip = 1;

	}

	draw(wave, p){
		if(this.lr_step!=0){
			this.lr_step = this.lr_step+this.par.lr_speed;
			if(this.lr_step>=this.data.steps) this.lr_step=0;
		}
		else if(NanForestUtils.coin_flip(p)){
			this.lr_step = 1;
			this.lr_flip = -this.lr_flip;
		}
		let curve = this.data.bazier20[this.lr_step];
		this.p5.stroke(this.p5.color('#2ecf00')); this.p5.noFill();
		for (let i = 1; i<this.layers; i++){
			let dy = this.h-i*3
			let y_o_i = this.y_top + i*3 + this.h*wave*0.1;
			let y_i_i = this.y_top + (i-1)*3;
			let x_c = this.x + this.lr_flip*curve[i]*this.w;
			let x_l = x_c + this.w;
			let x_r = x_c - this.w;
			this.p5.line(x_c, y_i_i, x_l, y_o_i);
			this.p5.line(x_c, y_i_i, x_r, y_o_i);
		}
		this.p5.stroke(this.p5.color('#bda2a2'));
		this.p5.bezier(this.x, this.y, this.x, this.y, this.x, this.y_top,
			Math.floor(this.x+this.lr_flip*curve[0]*this.w), this.y_top);
	}
}

class Bird{
	constructor(id, par, data, trees, tree_par, p5){
		this.id = id;
		this.par = par;
		this.data = data;
        this.trees = trees;
        this.tree_par = tree_par;
        this.p5 = p5;
		this.tree = trees[Math.floor(this.p5.random(0,tree_par.n-1))];
		this.next_tree = null;
		this.dx = 0; this.dy = 0; this.next_x = 0; this.next_y = 0;
		this.branch = Math.floor(this.p5.random(0,this.tree.layers));
		this.side = 1;
		this.fly_step = 0;
		this.x = this.tree.x+this.tree.w*0.5;
		this.y = this.tree.y_top+this.branch*3;

	}
	fly(p){
		let c = this.p5.color(this.par.color)
		this.p5.stroke(c); this.p5.fill(c);
		if(this.fly_step!=0){
			let h = this.par.h;
			let curve = this.data.sinsq[this.fly_step]*h*10;
			let x = this.dx*this.fly_step+this.x+curve;
			let y = this.dy*this.fly_step+this.y+curve;
			if(this.fly_step%2){
				this.p5.triangle(x, y, x+h, y-h, x-h, y-h);
			}else{
				this.p5.triangle(x, y-h, x+h, y, x-h, y);
			}
			// next step
			this.fly_step = this.fly_step+this.par.speed;
			if(this.fly_step>=this.data.steps) {
				this.x = this.next_x; this.y = this.next_y;
				this.tree = this.next_tree;
				this.fly_step=0;
			}
		}
		else if(NanForestUtils.coin_flip(p)){
			this.fly_step=1;
			// find random next tree
			let next_id = this.tree.id;
			while(next_id == this.tree.id || next_id < 0 || next_id >=this.tree_par.n){
				let j = Math.floor(this.tree.j+this.p5.random(-2,2));
				j = this.flylimit(j,this.tree_par.n_v);
				let i = Math.floor(this.tree.i+this.p5.random(-2,2));
				i = this.flylimit(i,this.tree_par.n_h);
				next_id = j*this.tree_par.n_h+i;
			}
			this.next_tree = this.trees[next_id];
			this.next_x = this.next_tree.x+this.next_tree.w*0.5;
			this.next_y = this.next_tree.y_top+this.branch*3;
			this.dy = (this.next_y - this.y)/this.data.steps;
			this.dx = (this.next_x - this.x)/this.data.steps;
		}else{
			let curve = this.data.bazier20[this.tree.lr_step];
			let x = this.x + this.tree.lr_flip*curve[this.branch]*this.tree.w;
			let y = this.y;
			let h = this.par.h;
			this.p5.triangle(x, y-h, x+h*0.5, y, x-h*0.5, y);
		}
	}
    flylimit(index, maximum){
        if (index<0) index = index + 4;
        else if (index >= maximum) index = index - 4;
        return index
    }
}

class Bug{
	constructor(id, par, data, trees, tree_par, p5){
		this.id = id;
		this.par = par;
		this.data = data;
        this.p5 = p5;
		this.tree = trees[Math.floor(this.p5.random(0,tree_par.n-1))];
		this.side = 1;
		this.fly_step = 0;
		this.x = this.tree.x+this.tree.w*0.5;
		this.y = this.tree.y_top+this.par.branch*3;
		this.om = 6.28/this.data.steps;
		this.d = 0;
	}
	fly(p){
		let c = this.p5.color(this.par.color)
		this.p5.stroke(c); this.p5.fill(c);
		if(this.fly_step!=0){
			// flying path
			let curve = this.side*this.data.sinsq[this.fly_step]*2;
			let y = Math.floor(this.y+curve*this.p5.random(this.d-2,this.d));
			let x = Math.floor(this.x-Math.sin(this.fly_step*this.om)*this.d);
			let h = this.par.h;
			// draw bug flying
			if(this.fly_step%2){
				this.p5.triangle(x, y, x+h, y-h, x-h, y-h);
			}else{
				this.p5.triangle(x, y-h, x+h, y, x-h, y);
			}
			// draw a halo
			let c = this.p5.color(255,255,255,this.p5.random(0,70))
			this.p5.stroke(c); this.p5.fill(c);
			this.p5.circle(x, y, h*5);
			// next step
			this.fly_step = this.fly_step+this.par.speed;
			if(this.fly_step>=this.data.steps) this.fly_step=0;
		}
		else if(NanForestUtils.coin_flip(p)){
			this.fly_step=1; this.side = -this.side;
			this.d = this.p5.random(this.par.d*0.5, this.par.d);
		}else{
			let x = this.x; let y = this.y; let h = this.par.h;
			this.p5.triangle(x, y-h, x+h*0.5, y, x-h*0.5, y);
		}
	}
}

class NanForest{
    constructor(width, height, audio, p5){
        this.width = width;
        this.height = height;
        this.p5 = p5;
        this.audio = audio; // audio context, audio=undefined if no audio context
        this.showing = false; // is amination tab showing
        // var trees
        this.trees = [];
        this.tree_par = {ud_speed: 1, ud_om: 1, lr_speed: 5, h: 60, w: 20, n: 0, n_h: 0, n_v: 0, h_grid: 60, w_grid: 40, h_random_pos: 0.5, w_random_pos: 1};
        // var for birds
        this.birds = [];
        this.bird_par = {speed: 1, h: 3, n: 0, color: '#cf2900'};
        // var for bugs
        this.bugs =[];
        this.bug_par = {speed: 1, h: 1, n: 0, color: '#fff705', branch: 10, d: 0};
        this.data = {"steps": 30, "sinsq": [0.0, 0.011, 0.043, 0.095, 0.165, 0.25, 0.345, 0.448, 0.552, 0.655, 0.75, 0.835, 0.905, 0.957, 0.989, 1.0, 0.989, 0.957, 0.905, 0.835, 0.75, 0.655, 0.552, 0.448, 0.345, 0.25, 0.165, 0.095, 0.043, 0.011], "bazier20": [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], [0.011, 0.009, 0.008, 0.007, 0.006, 0.005, 0.004, 0.003, 0.002, 0.002, 0.001, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], [0.043, 0.037, 0.031, 0.026, 0.022, 0.018, 0.015, 0.012, 0.009, 0.007, 0.005, 0.004, 0.003, 0.002, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0], [0.095, 0.081, 0.069, 0.058, 0.049, 0.04, 0.033, 0.026, 0.021, 0.016, 0.012, 0.009, 0.006, 0.004, 0.003, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0], [0.165, 0.141, 0.12, 0.101, 0.084, 0.07, 0.057, 0.045, 0.036, 0.027, 0.021, 0.015, 0.011, 0.007, 0.004, 0.003, 0.001, 0.001, 0.0, 0.0, 0.0], [0.25, 0.214, 0.182, 0.154, 0.128, 0.105, 0.086, 0.069, 0.054, 0.042, 0.031, 0.023, 0.016, 0.011, 0.007, 0.004, 0.002, 0.001, 0.0, 0.0, 0.0], [0.345, 0.296, 0.252, 0.212, 0.177, 0.146, 0.118, 0.095, 0.075, 0.057, 0.043, 0.031, 0.022, 0.015, 0.009, 0.005, 0.003, 0.001, 0.0, 0.0, 0.0], [0.448, 0.384, 0.327, 0.275, 0.229, 0.189, 0.154, 0.123, 0.097, 0.075, 0.056, 0.041, 0.029, 0.019, 0.012, 0.007, 0.004, 0.002, 0.0, 0.0, 0.0], [0.552, 0.473, 0.402, 0.339, 0.283, 0.233, 0.189, 0.152, 0.119, 0.092, 0.069, 0.05, 0.035, 0.024, 0.015, 0.009, 0.004, 0.002, 0.001, 0.0, 0.0], [0.655, 0.562, 0.477, 0.402, 0.335, 0.276, 0.225, 0.18, 0.141, 0.109, 0.082, 0.06, 0.042, 0.028, 0.018, 0.01, 0.005, 0.002, 0.001, 0.0, 0.0], [0.75, 0.643, 0.547, 0.461, 0.384, 0.316, 0.257, 0.206, 0.162, 0.125, 0.094, 0.068, 0.048, 0.032, 0.02, 0.012, 0.006, 0.003, 0.001, 0.0, 0.0], [0.835, 0.716, 0.609, 0.513, 0.428, 0.352, 0.286, 0.229, 0.18, 0.139, 0.104, 0.076, 0.053, 0.036, 0.023, 0.013, 0.007, 0.003, 0.001, 0.0, 0.0], [0.905, 0.776, 0.66, 0.556, 0.463, 0.382, 0.31, 0.249, 0.195, 0.151, 0.113, 0.082, 0.058, 0.039, 0.024, 0.014, 0.007, 0.003, 0.001, 0.0, 0.0], [0.957, 0.821, 0.698, 0.588, 0.49, 0.404, 0.328, 0.263, 0.207, 0.159, 0.12, 0.087, 0.061, 0.041, 0.026, 0.015, 0.008, 0.003, 0.001, 0.0, 0.0], [0.989, 0.848, 0.721, 0.607, 0.506, 0.417, 0.339, 0.272, 0.214, 0.165, 0.124, 0.09, 0.063, 0.042, 0.027, 0.015, 0.008, 0.003, 0.001, 0.0, 0.0], [1.0, 0.857, 0.729, 0.614, 0.512, 0.422, 0.343, 0.275, 0.216, 0.166, 0.125, 0.091, 0.064, 0.043, 0.027, 0.016, 0.008, 0.003, 0.001, 0.0, 0.0], [0.989, 0.848, 0.721, 0.607, 0.506, 0.417, 0.339, 0.272, 0.214, 0.165, 0.124, 0.09, 0.063, 0.042, 0.027, 0.015, 0.008, 0.003, 0.001, 0.0, 0.0], [0.957, 0.821, 0.698, 0.588, 0.49, 0.404, 0.328, 0.263, 0.207, 0.159, 0.12, 0.087, 0.061, 0.041, 0.026, 0.015, 0.008, 0.003, 0.001, 0.0, 0.0], [0.905, 0.776, 0.66, 0.556, 0.463, 0.382, 0.31, 0.249, 0.195, 0.151, 0.113, 0.082, 0.058, 0.039, 0.024, 0.014, 0.007, 0.003, 0.001, 0.0, 0.0], [0.835, 0.716, 0.609, 0.513, 0.428, 0.352, 0.286, 0.229, 0.18, 0.139, 0.104, 0.076, 0.053, 0.036, 0.023, 0.013, 0.007, 0.003, 0.001, 0.0, 0.0], [0.75, 0.643, 0.547, 0.461, 0.384, 0.316, 0.257, 0.206, 0.162, 0.125, 0.094, 0.068, 0.048, 0.032, 0.02, 0.012, 0.006, 0.003, 0.001, 0.0, 0.0], [0.655, 0.562, 0.477, 0.402, 0.335, 0.276, 0.225, 0.18, 0.141, 0.109, 0.082, 0.06, 0.042, 0.028, 0.018, 0.01, 0.005, 0.002, 0.001, 0.0, 0.0], [0.552, 0.473, 0.402, 0.339, 0.283, 0.233, 0.189, 0.152, 0.119, 0.092, 0.069, 0.05, 0.035, 0.024, 0.015, 0.009, 0.004, 0.002, 0.001, 0.0, 0.0], [0.448, 0.384, 0.327, 0.275, 0.229, 0.189, 0.154, 0.123, 0.097, 0.075, 0.056, 0.041, 0.029, 0.019, 0.012, 0.007, 0.004, 0.002, 0.0, 0.0, 0.0], [0.345, 0.296, 0.252, 0.212, 0.177, 0.146, 0.118, 0.095, 0.075, 0.057, 0.043, 0.031, 0.022, 0.015, 0.009, 0.005, 0.003, 0.001, 0.0, 0.0, 0.0], [0.25, 0.214, 0.182, 0.154, 0.128, 0.105, 0.086, 0.069, 0.054, 0.042, 0.031, 0.023, 0.016, 0.011, 0.007, 0.004, 0.002, 0.001, 0.0, 0.0, 0.0], [0.165, 0.141, 0.12, 0.101, 0.084, 0.07, 0.057, 0.045, 0.036, 0.027, 0.021, 0.015, 0.011, 0.007, 0.004, 0.003, 0.001, 0.001, 0.0, 0.0, 0.0], [0.095, 0.081, 0.069, 0.058, 0.049, 0.04, 0.033, 0.026, 0.021, 0.016, 0.012, 0.009, 0.006, 0.004, 0.003, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0], [0.043, 0.037, 0.031, 0.026, 0.022, 0.018, 0.015, 0.012, 0.009, 0.007, 0.005, 0.004, 0.003, 0.002, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0], [0.011, 0.009, 0.008, 0.007, 0.006, 0.005, 0.004, 0.003, 0.002, 0.002, 0.001, 0.001, 0.001, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]}
    }
    setup(){
        this.showing = true;
    	// setup framerate
      	this.p5.frameRate(8);

    	// generate population size

    	this.tree_par.n_h = Math.floor((this.width-(2*this.tree_par.w_random_pos+2)*this.tree_par.w_grid)/this.tree_par.w_grid);
    	this.tree_par.n_v = Math.floor((this.height-(2*this.tree_par.h_random_pos+2)*this.tree_par.h_grid)/this.tree_par.h_grid);
    	this.tree_par.n  = this.tree_par.n_h*this.tree_par.n_v;
    	this.bird_par.n  = Math.floor(this.tree_par.n*0.1);
    	this.bug_par.n = this.bird_par.n;
    	this.bug_par.d = this.tree_par.h*0.25;
    	// generate trees
    	for(let id = 0; id<this.tree_par.n; id++){
    		let j = Math.floor(id/this.tree_par.n_h);
    		let i = id%this.tree_par.n_h;
    		this.trees[id] = new Tree(id, this.tree_par, i, j, this.data, this.p5);
    	}
    	// generate birds
    	for(let i = 0; i<this.bird_par.n; i++){
    		this.birds[i]=new Bird(i, this.bird_par, this.data, this.trees, this.tree_par, this.p5);
    	}
    	// generate birds
    	for(let i = 0; i<this.bug_par.n; i++){
    		this.bugs[i]=new Bug(i, this.bug_par, this.data, this.trees, this.tree_par, this.p5);
    	}
    }
    draw(){
        // run setup function when first time drawing
        if(!this.showing) this.setup()

        // default values for movement probabilities
        let p_bug = 0.01;
        let p_bird = 0.01;
        let p_tree = 0.01;

        // get sound analysis
        if(this.audio!=undefined) {
            let dataArray = this.audio.analyse();
						// console.log(dataArray);
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
                p_bug = NanForestUtils.value_limit(p_bug,0,0.01);
            }
        }
        //console.log(p_bug, p_bird, p_tree)

    	// draw background
    	this.p5.clear();
    	// draw trees
    	let ud_step = this.p5.frameCount%(this.data.steps*this.tree_par.ud_om)*this.tree_par.ud_speed;
    	for(let id = 0; id<this.tree_par.n; id++){
    		this.trees[id].draw(this.data.sinsq[ud_step], p_tree);
    	}
    	// draw birds
    	for(let i = 0; i<this.bird_par.n; i++){
    		this.birds[i].fly(p_bird);
    	}
    	//draw bugs
    	for(let i = 0; i<this.bug_par.n; i++){
    		this.bugs[i].fly(p_bug);
    	}
    }
}

// unitility
const NanForestUtils = {
    value_limit: function(val, min, max) {
        return val < min ? min : (val > max ? max : val);
    },

    coin_flip: function(p){
    	let chance = Math.random(0,1);
    	return chance<p;
    }
}
