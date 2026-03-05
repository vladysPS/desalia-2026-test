class Counter {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.points = 0;
        this.scale = canvasHeight / 700;
        this.updateDimensions(canvasWidth, canvasHeight, this.scale);

        this.img = new Image();
        this.img.src = "assets/images/Number-sprite.png";
        this.img.isReady = false;
        this.img.onload = () => (this.img.isReady = true);
        this.runningHorizontalFrames = 10;
    }

    updateDimensions(canvasWidth, canvasHeight, scale = this.scale) {
        this.scale = scale;
        this.width = 150 * this.scale;
        this.height = 60 * this.scale;
        this.x = canvasWidth - (this.width + 20 * this.scale);
        this.y = 20 * this.scale;

        this.paddingRight = 10 * this.scale; // space between number and box edge
        this.digitSpacing = 2 * this.scale;  // space between digits when points > 9
    }

    draw(pointsOuter) {
        if (typeof pointsOuter === 'number') this.points = pointsOuter;

        // Counter background
        this.ctx.fillStyle = 'transparent';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // Wait for sprite to be ready
        if (!this.img.isReady) return;

        // Always 5 digits, pad with zeros
        const digit = String(this.points).padStart(5, '0');

        const frameWidth = this.img.width / this.runningHorizontalFrames;
        const frameHeight = this.img.height;

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
