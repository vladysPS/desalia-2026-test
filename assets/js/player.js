class Player {
    constructor (ctx,canvasHeight,soundJump){
        this.ctx = ctx;
        this.baseWidth = 127;
        this.baseHeight = 197;
        this.baseX = 100;
        this.baseGroundOffsetRatio = 1 / 8;
        this.updateDimensions(canvasHeight, canvasHeight / 700, true);

        this.img = new Image();
        this.img.src = "assets/images/skater-sprite-1.png";
        this.img.isReady = false;
        this.img.onload = () => (this.img.isReady = true);
        this.runningHorizontalFrames = 12;

        this.imgJump = new Image();
        this.imgJump.src = "assets/images/jump-sprint.png";
        this.imgJump.isReady = false;
        this.imgJump.onload = () => (this.imgJump.isReady = true);
        this.jumpingHorizontalFrames = 17;

        this.verticalFrames = 1;

        this.xFrame = 0;
        this.yFrame = 0;
        this.spriteFrameCounter = 0;

        this.vy = 0;
        this.gravity = 0.5 * this.scale;
        this.jumpStrength = -15 * this.scale;

        this.soundJump = soundJump;
        this.canJump = false;

        document.addEventListener("click", () => this.jump());
        document.addEventListener("keydown", (event) => {
            if (event.code === "Space" || event.code === "ArrowUp") {
            this.jump(); 
            event.preventDefault();
            }
        });        
    }

    setInputEnabled(enabled) {
        this.canJump = Boolean(enabled);
    }

    jump() {
        if (!this.canJump) return;
        if (this.y === this.playerGroundposition) {
            this.vy = this.jumpStrength;
            this.xFrame = 0;
            this.spriteFrameCounter = 0;
            this.soundJump.play();
        }
    }

  draw() {
    const inAir = this.y < this.playerGroundposition;
    const img = inAir ? this.imgJump : this.img;
    const hFrames = inAir ? this.jumpingHorizontalFrames : this.runningHorizontalFrames;
    const endX = hFrames;

    if (!img.isReady) return;

    this.ctx.save();
    this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    this.ctx.drawImage(
      img,
      (img.width * this.xFrame) / hFrames,
      (img.height * this.yFrame) / this.verticalFrames,
      img.width / hFrames,
      img.height / this.verticalFrames,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    this.ctx.restore();

    this.spriteFrameCounter++;
 
    if (this.spriteFrameCounter % 8 === 0) {
      this.xFrame += 1;
      if (this.xFrame >= endX) this.xFrame = 0;
    }
  }

    reset(canvasHeight) {
    this.updateDimensions(canvasHeight, canvasHeight / 700);
    this.vy = 0;
    this.xFrame = 0;
    this.yFrame = 0;
    this.spriteFrameCounter = 0;
  }

  move(deltaFactor = 1) {
    // deltaFactor keeps physics consistent across variable frame times
    this.y += this.vy * deltaFactor;

    if (this.y < this.playerGroundposition) {
      this.vy += this.gravity * deltaFactor;
    }

    if (this.y >= this.playerGroundposition) {
      this.y = this.playerGroundposition;
      this.vy = 0;
    }
  }

  updateDimensions(canvasHeight, scale = this.scale, initializing = false) {
    this.scale = scale;
    this.canvasHeight = canvasHeight;
    this.width = this.baseWidth * this.scale;
    this.height = this.baseHeight * this.scale;
    this.x = this.baseX * this.scale;
    this.playerGroundposition = this.canvasHeight - this.height - (this.canvasHeight * this.baseGroundOffsetRatio);

    const nextY = initializing && typeof this.y === 'undefined'
      ? this.playerGroundposition
      : Math.min(this.y ?? this.playerGroundposition, this.playerGroundposition);

    this.y = nextY;
    this.gravity = 0.5 * this.scale;
    this.jumpStrength = -15 * this.scale;
  }
}

export default Player;
