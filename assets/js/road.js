class Road {
    constructor (ctx, speed, canvasHeight){
        this.speed = speed;
        this.canvasHeight = canvasHeight;
        this.ctx = ctx;
        this.x = 0;
        this.height = canvasHeight /4;
        this.y = this.canvasHeight - this.height;

        this.img = new Image();
        this.img.src = "assets/images/road.png";
        this.img.isReady = false;

        this.img.onload = () => {
        this.img.isReady = true;
        this.width = this.img.naturalWidth;
        };
    }

    draw() {
        if (this.img.isReady) {
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        this.ctx.drawImage(this.img, this.x + this.width, this.y, this.width, this.height);
        }
    }

    move(deltaFactor = 1) {
        // deltaFactor normalizes motion when frame time varies (1 = 60fps frame)
        this.x -= this.speed * deltaFactor;

        if (this.x <= -this.width) {
        this.x = 0;
        }
    }
}

export default Road;
