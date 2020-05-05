class LivingRings{
  constructor(width, height, audio, p5){
    this.width = width;
    this.height = height;
    this.p5 = p5;
    this.audio = audio; // audio context, audio=undefined if no audio context
    this.showing = false; // is animation tab showing
    this.rings = 35;
    this.dim_init = 160;
    this.dim_delta = 5;
    this.chaos_init = .15;
    this.chaos_delta = 0.15;
    this.chaos_mag = 40;
    this.ox = this.p5.random(10000);
    this.oy = this.p5.random(10000);
    this.oz = this.p5.random(10000);
    this.utils = new OrcunRingsUtils(p5);
  }

  setup(){
    this.showing = true;
    // this.p5.frameRate(60);
    this.p5.strokeWeight(0.6);
    this.p5.stroke(150, 150, 150);
    this.p5.smooth();
    this.p5.noFill();
  }
  draw(){
    this.p5.clear();
    this.p5.translate(this.p5.width / 2, this.p5.height / 2);
    this.p5.strokeWeight(0.6);
    this.p5.stroke(150, 150, 150);
    this.p5.smooth();
    this.p5.noFill();

    if(isPlaying){
      this.ox-=0.005;
      this.oy+=0.015;
      this.oz+=0.005;
    } else {
      this.ox+=0.002;
      this.oy-=0.002;
      this.oz-=0.002;
    }
    for(var i = 0; i < this.rings; i++){
      this.p5.beginShape();
      for(var angle = 0; angle < 360; angle++){
        var radian = this.p5.radians(angle);
        var radius =  (this.chaos_mag * this.utils.getNoiseWithTime(radian, this.chaos_delta * i + this.chaos_init, this.oz, this.ox, this.oy, this.oz)) + (this.dim_delta * i + this.dim_init);
        this.p5.vertex(radius * this.p5.cos(radian), radius * this.p5.sin(radian));
      }
      this.p5.endShape(this.p5.CLOSE);
    }
  }
}

class OrcunRingsUtils{
  constructor(p5){
    this.p5 = p5;
  }
  getNoise(radian, dim, ox, oy){
    var r = radian % this.p5.TWO_PI;
    if(r < 0.0){
      r += this.p5.TWO_PI;
    }
    return this.p5.noise(ox + this.p5.cos(r) * dim, oy + this.p5.sin(r) * dim);
  }
  getNoiseWithTime(radian, dim, time, ox, oy, oz){
    var r = radian % this.p5.TWO_PI;
    if(r < 0.0){
      r += this.p5.TWO_PI;
    }
    return this.p5.noise(ox + this.p5.cos(r) * dim , oy + this.p5.sin(r) * dim, oz + time);
  }
}
