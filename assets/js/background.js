class Background {
    constructor (ctx, imgHeight, initialX, speed){
    this.imgSrc = "assets/images/background/zm1-peq.png";
    this.speed = speed;

    this.ctx = ctx;
    this.x = initialX;
    this.y = 0;
    this.height = imgHeight;
    this.canvasWidth = this.ctx.canvas.width;
    this.img = new Image();
    this.img.src = this.imgSrc;
    this.img.isReady = false;
    this.img.onload = () => {
      this.img.isReady = true;
      this.width =
        (this.img.naturalWidth / this.img.naturalHeight) * this.height;
    };        
    }

  draw() {
    if (!this.img.isReady) return;

    // Draw two tiles so the background can loop seamlessly
    this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    this.ctx.drawImage(this.img, this.x + this.width, this.y, this.width, this.height);
  }

  // Move the background left by xx pixels per frame
  move() {
    if (!this.img.isReady) return;

    this.x -= this.speed;

    // Wrap when the first tile scrolls completely off screen
    if (this.x <= -this.width) {
      this.x = 0;
    }
  }    
}

export default Background;
