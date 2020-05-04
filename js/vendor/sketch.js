var sketch = function(p) {
  var rings = 35;
  var dim_init = 160;
  var dim_delta = 5;

  var chaos_init = .15;
  var chaos_delta = 0.15;
  var chaos_mag = 40;

  var ox = p.random(10000);
  var oy = p.random(10000);
  var oz = p.random(10000);

  p.setup = function(){
    var mycanvas = p.createCanvas(720, 720);
    mycanvas.parent('sketchContainer');
    p.strokeWeight(.6);
    p.stroke(150, 150, 150);
    p.smooth();
    p.noFill();
    //p.noLoop();
    document.getElementById("myAudio").preload = "auto";
    document.getElementById("myAudio").autoplay = "true";
  }

  p.draw = function() {
    p.clear();
    p.translate(p.width / 2, p.height / 2);
    display();
  }

  function display(){
    if(isPlaying){
      ox-=0.005;
      oy+=0.015;
      oz+=0.005;
    } else {
      ox+=0.002;
      oy-=0.002;
      oz-=0.002;
    }
    for(var i = 0; i < rings; i ++){
    p.beginShape();
      for(var angle = 0; angle < 360; angle++){
        var radian = p.radians(angle);
        var radius =  (chaos_mag * getNoiseWithTime(radian, chaos_delta * i + chaos_init, oz)) + (dim_delta * i + dim_init);
        p.vertex(radius * p.cos(radian), radius * p.sin(radian));
      }
    p.endShape(p.CLOSE);
    }
  }

  function getNoise (radian, dim){
    var r = radian % p.TWO_PI;
    if(r < 0.0){r += p.TWO_PI;}
    return p.noise(ox + p.cos(r) * dim, oy + p.sin(r) * dim);
  }

  function getNoiseWithTime (radian, dim, time){
    var r = radian % p.TWO_PI;
    if(r < 0.0){r += p.TWO_PI;}
    return p.noise(ox + p.cos(r) * dim , oy + p.sin(r) * dim, oz + time);
  }
}

new p5(sketch);
