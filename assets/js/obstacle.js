// Preload one image per size; draw falls back to rectangles if a file is missing.
const obstacleSprites = {
    small: new Image(),
    medium: new Image(),
    large: new Image()
};

obstacleSprites.small.src = 'assets/images/botellas/botella-peque.png';
obstacleSprites.medium.src = 'assets/images/botellas/botella-mediana.png';
obstacleSprites.large.src = 'assets/images/botellas/botella-grande.png';

class Obstacle {
    constructor(ctx, canvasWidth, canvasHeight, road) {
        this.ctx = ctx;
        this.road = road;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Size presets
        this.sizes = [
            { bottomHeight: 70, topHeight: 40, bottomWidth: 30, topWidth: 15 }, // small
            { bottomHeight: 80, topHeight: 50, bottomWidth: 40, topWidth: 20 }, // medium
            { bottomHeight: 100, topHeight: 60, bottomWidth: 50, topWidth: 25 } // large
        ];

        // Pick random size
        const sizeIndex = Math.floor(Math.random() * this.sizes.length);
        const size = this.sizes[sizeIndex];
        const sizeNames = ['small', 'medium', 'large'];
        this.sizeName = sizeNames[sizeIndex];

        this.bottomHeight = size.bottomHeight;
        this.topHeight = size.topHeight;
        this.bottomWidth = size.bottomWidth;
        this.topWidth = size.topWidth;
        this.sprite = obstacleSprites[this.sizeName];

        this.x = canvasWidth + this.bottomWidth;
        this.bottomY = 500; // ground level
        this.topY = this.bottomY - this.topHeight;

        // If it's small, choose randomly 2 or 3 bottles
        if (sizeIndex === 0) {
            this.count = Math.random() < 0.5 ? 2 : 3; // 50% chance 2, 50% chance 3
            this.spacing = 10; // space between small bottles
        } else {
            this.count = 1; // medium and large are single
        }

        this.isOffscreen = false;
    }

    getCollisionRects() {
            const rects = [];

            for (let i = 0; i < this.count; i++) {
            const offsetX = i * (this.bottomWidth + (this.spacing || 0));

            // Bottom rectangle
            rects.push({
                x: this.x + offsetX,
                y: this.bottomY,
                width: this.bottomWidth,
                height: this.bottomHeight
            });

            // Top rectangle
            rects.push({
                x: this.x + offsetX + (this.bottomWidth - this.topWidth) / 2,
                y: this.topY,
                width: this.topWidth,
                height: this.topHeight
            });
            }

            return rects;
    }


    move() {
        this.x -= this.road.speed;

        // Check the far right edge based on number of bottles
        const farRight = this.x + this.count * this.bottomWidth + (this.count - 1) * (this.spacing || 0);

        if (farRight < 0) {
            this.isOffscreen = true;
        }
    }

    draw() {
        const totalHeight = this.bottomHeight + this.topHeight;
        const drawBottle = (offsetX) => {
            const x = this.x + offsetX;
            const y = this.topY;

            // Use sprite if it is loaded; otherwise keep the old rectangle fallback
            if (this.sprite && this.sprite.complete && this.sprite.naturalWidth) {
                this.ctx.drawImage(this.sprite, x, y, this.bottomWidth, totalHeight);
                return;
            }

            // Fallback: simple rectangles
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(x, this.bottomY, this.bottomWidth, this.bottomHeight);

            const topX = x + (this.bottomWidth - this.topWidth) / 2;
            this.ctx.fillStyle = 'darkred';
            this.ctx.fillRect(topX, this.topY, this.topWidth, this.topHeight);
        };

        for (let i = 0; i < this.count; i++) {
            const offsetX = i * (this.bottomWidth + (this.spacing || 0));
            drawBottle(offsetX);
        }
    }
}

export default Obstacle;
