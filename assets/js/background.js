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
   if (this.img.isReady) {
      this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  updateDimensions(canvasHeight) {
    this.height = canvasHeight;
    this.canvasWidth = this.ctx.canvas.width;
    if (this.img.isReady) {
      this.width = (this.img.naturalWidth / this.img.naturalHeight) * this.height;
    }
  }

  // Move the background left by xx pixels per frame
  move(deltaFactor = 1) {
    if (!this.game) {
      console.warn('Background has no game reference');
      return;
    }
    // Bail out until the image dimensions are known; prevents NaN stop positions
    if (!this.img.isReady || !this.width) return;
    this.xWhereStop = -this.width + this.canvasWidth;
    if (this.x > this.xWhereStop) {
      this.x -= this.speed * deltaFactor;
    } else {
      this.game.stopGame("win");
    }
  }   
}

export default Background;
