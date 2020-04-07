function setup() {
  	createCanvas(windowWidth, windowHeight);
  	frameRate(1);
	let h = 50;
	let w = 20;
	let r_v = h/2;
	let r_h = w/2;
	let n = floor(windowWidth*windowHeight/h/w);
	tree_hor = windowWidth/w - 1;
	tree_ver = windowHeight/h - 1;
	for(let j = 0; j<tree_ver; j++){
		for(let i = 0; i<tree_hor; i++ ){
			tree(w+i*w+floor(random(-r_h,r_h)),h+j*h+floor(random(-r_v,r_v)),h,w);
		}
	}
}

function draw() {

}

function tree(x,y,h,w){
	noFill();
	x = floor(x)
	y = floor(y)
	let r_h = floor(h*(1 - random(0, 0.5)));
	let r_w = floor(w*(0.5 - random(0, 0.4)));
	let sides = 2;
	let layers = floor(random(0.4, 0.8)*r_h/3);
	stroke(color('#300313'));
	line(x,y,x,y-r_h);
	stroke(color('#1e7d09'));
	for (let i = 1; i<layers; i++){
		let y_o_i = y - r_h + i*3;
		let y_i_i = y - r_h + (i-1)*3;
		line(x, y_i_i, x + r_w, y_o_i);
		line(x, y_i_i, x - r_w, y_o_i);
	}
}

function tree2(x,y,h,w){
	noFill();
	x = floor(x)
	y = floor(y)
	let r_h = floor(h*(1 - random(0, 0.5)));
	let r_w = floor(w*(0.5 - random(0, 0.1)));
	let sides = 2;
	let layers = 7;
	let r_y = array2d(sides, layers);
	let r_x = array2d(sides, layers);
	r_y[0][0] = r_y[1][0] = y-r_h;
	r_x[0][0] = r_x[1][0] = x;
	let intervals = [0, 0.3, 0.4, 0.6, 0.7, 0.85, 0.9];
	stroke(color('#300313'));
	line(x,y,x,r_y[0][0]);
	for(let j = 0; j<sides; j++){
		for (let i = 1; i<layers; i++){
			r_y[j][i] = floor(y - r_h*(1-intervals[i]+random(-0.1, 0.1)));
			let d = 1;
			if(j==0){ d = -1 }
			r_x[j][i] = floor(x + d*r_w*(1+random(0.2, 0.6)*(i%2)));
		}
	}
	stroke(color('#1e7d09'));
	beginShape();
	for (let i = 0; i<layers; i++){
		vertex(r_x[0][i], r_y[0][i]);
	}
	for (var i = 0; i<layers; i++){
		vertex(r_x[1][layers-1-i], r_y[1][layers-1-i]);
	}
	endShape();
}


function array2d(w,h){
	let a = []
	for (var j = 0; j<w; j++){
		a[j] = new Array(h);
		for(var i = 0; i<h; i++){
			a[j][i] = 0;
		}
	}
	return a;
}