import Background  from "./assets/js/background.js";
import Player  from "./assets/js/player.js";
import Road  from "./assets/js/road.js";
import Obstacle from "./assets/js/obstacle.js";
import Counter from "./assets/js/counter.js";

class Game {
    constructor (ctx){
        this.ctx = ctx;
        this.animationId = undefined;
        this.lastTimestamp = null;
        this.todoRectoSinMiedo = false;
        this.pausedForResize = false;
      
        // sounds
        this.isThemePlaying = false;
        this.soundCrash = new Audio("./assets/sounds/flappyhit.mp3");
        this.soundCrash.volume = 0.5;
        this.soundJump = new Audio("./assets/sounds/flappyflap.mp3");
        this.soundJump.volume = 0.5;
        this.theme = new Audio('./assets/sounds/samba.mp3');
        this.theme.volume = 0.5;
        this.countDownSound = new Audio('./assets/sounds/countdown.mp3');
        this.countDownSound.volume = 0.5;                
        //Score
        this.pointsCounter = 0 ;
        this.pointsFrameCounter = 0; // accumulates elapsed ms

        this.presentLevel = 1;
        this.levelSegment = undefined ;  
        this.totalLevels = 4;

        // Level banner UI
        this.bannerText = '';
        this.bannerTimer = 0;
        this.bannerDuration = 120; // frames (~2s at 60fps)

        // GAME OVER / restart UI
        this.restartContainer = document.querySelector('.restart-container');
        this.restartButton = document.getElementById('restart-button');
        this.endScoreElement = document.querySelector('.end-score');
        this.hideRestartContainer();
        this.bindRestartButton();

        this.setResponsiveSizes();
        window.addEventListener('resize', () => {
            this.setResponsiveSizes();
        });

        //BASE SETUP
        this.backSpeed = 1;
        this.background = new Background(this.ctx, this.canvasHeight, 0, this.backSpeed);
        this.background.game = this; // Pass the current Game instance to the Background so I can stop the game        

        this.roadSpeed = 8;
        this.road = new Road(this.ctx, this.roadSpeed, this.canvasHeight);

        this.player = new Player(this.ctx, this.canvasHeight, this.soundJump);
        this.setInputEnabled(false);

        this.obstacles = [];
        this.obstacleTimer = 0; // accumulates elapsed ms
        this.obstacleIntervalMs = this.getRandomObstacleTimeMs();
        this.hasCollision = false;

        this.counter = new Counter(this.ctx, this.canvasWidth, this.canvasHeight);

        // Show initial level banner
        this.showLevelBanner(this.presentLevel);

    }
    bindRestartButton() {
        if (!this.restartButton) return;

        this.restartButton.addEventListener('click', () => this.restartGame());
    }
    setInputEnabled(enabled) {
        if (this.player && typeof this.player.setInputEnabled === 'function') {
            this.player.setInputEnabled(enabled);
        }
    }
    hideRestartContainer() {
        if (this.restartContainer) {
            this.restartContainer.classList.add('hidden');
        }
    }
    showRestartContainer() {
        if (this.restartContainer) {
            this.restartContainer.classList.remove('hidden');
        }
    }
    updateEndScore() {
        if (this.endScoreElement) {
            this.endScoreElement.textContent = `SCORE: ${this.pointsCounter}`;
        }
    }
    resetGameState() {
        this.pointsCounter = 0;
        this.pointsFrameCounter = 0;
        this.lastTimestamp = null;
        this.pausedForResize = false;

        this.backSpeed = 1;
        this.background = new Background(this.ctx, this.canvasHeight, 0, this.backSpeed);
        this.background.game = this;

        this.roadSpeed = 8;
        this.road = new Road(this.ctx, this.roadSpeed, this.canvasHeight);

        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleIntervalMs = this.getRandomObstacleTimeMs();
        this.hasCollision = false;

        this.presentLevel = 1;
        this.showLevelBanner(this.presentLevel);

        if (this.player && typeof this.player.reset === 'function') {
            this.player.reset(this.canvasHeight);
        }

        this.counter = new Counter(this.ctx, this.canvasWidth, this.canvasHeight);

        this.isThemePlaying = false;
        this.theme.currentTime = 0;
        this.soundCrash.currentTime = 0;
        this.setInputEnabled(false);
    }

    showLevelBanner(levelNumber) {
        this.bannerText = `LEVEL ${levelNumber}`;
        this.bannerTimer = this.bannerDuration;
    }

    drawLevelBanner() {
        if (this.bannerTimer <= 0) return;

        const fadeFrames = 20;
        const alpha = this.bannerTimer > fadeFrames
            ? 1
            : this.bannerTimer / fadeFrames;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 32px sans-serif';

        const x = this.ctx.canvas.width / 2;
        const y = 50;
        this.ctx.strokeText(this.bannerText, x, y);
        this.ctx.fillText(this.bannerText, x, y);
        this.ctx.restore();

        this.bannerTimer--;
    }
    getRandomObstacleTime() { 
      //return 60 + Math.random() * 120; entre 1 y 3 segundos aprox (en frames a 60fps)       
      // Spawn spacing shrinks as level rises but keeps a safe floor for jumpable gaps.
      const levelConfigs = [
        { min: 80, max: 130 },  // level 1: ~1.3s - 2.1s
        { min: 60, max: 110 },  // level 2: ~1.0s - 1.8s
        { min: 45, max: 90 },   // level 3+: ~0.75s - 1.5s
      ];

      const idx = Math.min((this.presentLevel || 1) - 1, levelConfigs.length - 1);
      const { min, max } = levelConfigs[idx];

      const safeMin = 35; // ~0.58s at 60fps — still jumpable but tighter
      const spanMin = Math.max(min, safeMin);
      const spanMax = Math.max(spanMin + 10, max); // keep some spread even at high levels

      return spanMin + Math.random() * (spanMax - spanMin);      
    }
    getRandomObstacleTimeMs() {
      // Convert the frame-based spawn time to milliseconds assuming 60fps baseline
      return this.getRandomObstacleTime() * (1000 / 60);
    }
    setResponsiveSizes() {
        const canvasContainer = document.getElementById('canvas-container');
        this.canvasWidth = canvasContainer.offsetWidth;
        this.canvasHeight = canvasContainer.offsetHeight;
        this.ctx.canvas.width = this.canvasWidth;
        this.ctx.canvas.height = this.canvasHeight;
    }
    pauseForResize() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = undefined;
        }
        this.lastTimestamp = null;
        this.theme.pause();
        this.isThemePlaying = false;
        this.pausedForResize = true;
        this.setInputEnabled(false);
    }
    resumeAfterResize() {
        const hasEnded = this.restartContainer && !this.restartContainer.classList.contains('hidden');
        if (!this.pausedForResize || this.hasCollision || hasEnded) return;
        this.pausedForResize = false;
        this.setInputEnabled(true);
        this.gameLoop();
    }
    checkCollision(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    }
    collisions() {
    if (this.hasCollision) return;

      for (let obstacle of this.obstacles) {
        const rects = obstacle.getCollisionRects(); // get all rectangles
        for (let rect of rects) {
          if (this.checkCollision(this.player, rect)) {
            this.hasCollision = true;

            this.stopGame("lose");
            this.soundCrash.currentTime = 0;
            this.soundCrash.play();
            return;
          }
        }
      }
    }
    gameLoop() {
      // Prevent multiple loops from stacking
      if (this.animationId) return;

      const step = (ts) => {
        // Keep audio in loop once started
        if (!this.isThemePlaying) {
          this.theme.loop = true;
          this.theme.currentTime = 0;
          // this.theme.play();
          this.isThemePlaying = true;
        }

        if (this.lastTimestamp === null) this.lastTimestamp = ts;
        const delta = ts - this.lastTimestamp; // ms since last frame
        const deltaFactor = delta / (1000 / 60); // normalize against 60fps frame
        this.lastTimestamp = ts;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        //POINTS COUNTER (1 point per second)
        this.pointsFrameCounter += delta;
        if (this.pointsFrameCounter >= 1000) {
          this.pointsCounter += 1;
          this.pointsFrameCounter -= 1000;
        }

        //INCREASE LEVEL (only once background size is known)
        if (this.background.img.isReady && this.background.width) {
          this.levelSegment = this.background.img.width / this.totalLevels;
          
          const traveled = -this.background.x; // positive distance moved
          if (this.presentLevel < this.totalLevels && traveled >= this.levelSegment * this.presentLevel) {
            console.log("we're on level", this.presentLevel);
            this.presentLevel++;
            this.roadSpeed += 0.1;
            this.showLevelBanner(this.presentLevel);
          }
        }
        
        // Gentle acceleration over time, scaled to real time
        this.roadSpeed += 0.003 * deltaFactor;
        this.road.speed = this.roadSpeed;
        
        this.background.move(deltaFactor);
        this.background.draw();
        this.road.move(deltaFactor);
        this.road.draw();
        this.player.move(deltaFactor);
        this.player.draw();
        this.counter.draw(this.pointsCounter);
        this.drawLevelBanner();

        // OBSTACLES
        this.obstacleTimer += delta;
        if (this.obstacleTimer >= this.obstacleIntervalMs) {
          this.obstacles.push(
            new Obstacle(this.ctx, this.canvasWidth, this.canvasHeight, this.road)
          );
          this.obstacleTimer = 0;
          this.obstacleIntervalMs = this.getRandomObstacleTimeMs();
        }

        this.obstacles.forEach(obstacle => {
          obstacle.move(deltaFactor);
          obstacle.draw();
        });

        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffscreen);

        if (!this.todoRectoSinMiedo) {
          this.collisions();
        }

        this.animationId = requestAnimationFrame(step);
      };

      this.animationId = requestAnimationFrame(step);
    } 
    stopGame(reason) {
      if(reason === "lose"){
        console.log('You lose!');
      } else if (reason === "win"){
        console.log("you win!!");
      }
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = undefined;
      }
      this.lastTimestamp = null;

      this.theme.pause();
      this.isThemePlaying = false;
      this.pausedForResize = false;
      this.setInputEnabled(false);

      this.updateEndScore();
      this.showRestartContainer();

        
    }
    restartGame() {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = undefined;
        }

        this.resetGameState();
        this.hideRestartContainer();

        this.setInputEnabled(true);
        this.gameLoop();
    }
}

export default Game;
