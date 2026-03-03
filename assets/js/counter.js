class Counter{
    constructor(ctx,canvasWidth,canvasHeight){
        this.ctx = ctx;
        this.points = 0;
        this.width = 150;
        this.height = 60;
        this.x = canvasWidth - (this.width + 20);
        this.y = canvasHeight - (canvasHeight-20);

        this.img = new Image();
        this.img.src = "assets/images/Number-sprite.png";
        this.img.isReady = false;
        this.img.onload = () => (this.img.isReady = true);
        this.runningHorizontalFrames = 10;

        this.paddingRight = 10; // space between number and box edge
        this.digitSpacing = 2;  // space between digits when points > 9
    }

    draw(pointsOuter) {
        if (typeof pointsOuter === 'number') this.points = pointsOuter;

        // Counter background
        this.ctx.fillStyle = 'transparent';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // Wait for sprite to be ready
        if (!this.img.isReady) return;

        const digit = String(this.points);
        const frameWidth = this.img.width / this.runningHorizontalFrames;
        const frameHeight = this.img.height;

        // Scale digits so they fit nicely inside the box height
        const targetHeight = this.height * 0.7;
        const scale = targetHeight / frameHeight;
        const renderWidth = frameWidth * scale;
        const renderHeight = frameHeight * scale;

        const totalDigitsWidth = digit.length * renderWidth + Math.max(0, (digit.length - 1)) * this.digitSpacing;
        const startX = this.x + this.width - this.paddingRight - totalDigitsWidth;
        const startY = this.y + (this.height - renderHeight) / 2;

        for (let i = 0; i < digit.length; i++) {
            const value = Number(digit[i]);
            const sx = value * frameWidth;
            const dx = startX + i * (renderWidth + this.digitSpacing);

            this.ctx.drawImage(
                this.img,
                sx,
                0,
                frameWidth,
                frameHeight,
                dx,
                startY,
                renderWidth,
                renderHeight
            );
        }
    }
}



export default Counter;
