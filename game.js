import Background  from "./assets/js/background.js";
import Player  from "./assets/js/player.js";
import Road  from "./assets/js/road.js";
import Obstacle from "./assets/js/obstacle.js";
import Counter from "./assets/js/counter.js";

class Game {
    constructor (ctx){
        this.ctx = ctx;
        this.intervalId = undefined;
        this.todoRectoSinMiedo = true;

        // Game over / restart UI
        this.restartContainer = document.querySelector('.restart-container');
        this.restartButton = document.getElementById('restart-button');
        this.endScoreElement = document.querySelector('.end-score');
        this.hideRestartContainer();
        this.bindRestartButton();

        //Score
        this.pointsCounter = 0 ;
        this.pointsFrameCounter = 0;

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

        this.setResponsiveSizes();
        window.addEventListener('resize', () => {
            this.setResponsiveSizes();
        });

        this.backSpeed = 7;
        this.background = new Background(this.ctx, this.canvasHeight, 0, this.backSpeed);
        this.background.game = this; // Pass the current Game instance to the Background so I can stop the game        

        this.roadSpeed = 7;
        this.road = new Road(this.ctx, this.roadSpeed, this.canvasHeight);

        this.player = new Player(this.ctx, this.canvasHeight, this.soundJump);

        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = this.getRandomObstacleTime();
        this.hasCollision = false;

        this.counter = new Counter(this.ctx, this.canvasWidth, this.canvasHeight);

    }
    bindRestartButton() {
        if (!this.restartButton) return;

        this.restartButton.addEventListener('click', () => this.restartGame());
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

        this.backSpeed = 1;
        this.background = new Background(this.ctx, this.canvasHeight, 0, this.backSpeed);
        this.background.game = this;

        this.roadSpeed = 7;
        this.road = new Road(this.ctx, this.roadSpeed, this.canvasHeight);

        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = this.getRandomObstacleTime();
        this.hasCollision = false;

        if (this.player && typeof this.player.reset === 'function') {
            this.player.reset(this.canvasHeight);
        }

        this.counter = new Counter(this.ctx, this.canvasWidth, this.canvasHeight);

        this.isThemePlaying = false;
        this.theme.currentTime = 0;
        this.soundCrash.currentTime = 0;
    }
    getRandomObstacleTime() {
      return 60 + Math.random() * 120; // entre 1 y 3 segundos aprox (en frames a 60fps)    
    }
    setResponsiveSizes() {
        const canvasContainer = document.getElementById('canvas-container');
        this.canvasWidth = canvasContainer.offsetWidth;
        this.canvasHeight = canvasContainer.offsetHeight;
        this.ctx.canvas.width = this.canvasWidth;
        this.ctx.canvas.height = this.canvasHeight;
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
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        
        //UNDO THIS COMMENT LATER
        if (!this.isThemePlaying) {
          this.theme.loop = true;
          this.theme.currentTime = 0;
          // this.theme.play();
          this.isThemePlaying = true;
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        //POINTS COUNTER
        this.pointsFrameCounter++;
        if (this.pointsFrameCounter >= 60) {
          this.pointsCounter += 1;
          this.pointsFrameCounter = 0;
        }
        
        this.roadSpeed += 0.005;
        this.road.speed = this.roadSpeed;
        
        this.background.move();
        this.background.draw();
        this.road.move();
        this.road.draw();
        this.player.move();
        this.player.draw();
        this.counter.draw(this.pointsCounter);

        // OBSTACLES
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
          this.obstacles.push(
            new Obstacle(this.ctx, this.canvasWidth, this.canvasHeight, this.road)
          );
          this.obstacleTimer = 0;
          this.obstacleInterval = this.getRandomObstacleTime();
        }

        this.obstacles.forEach(obstacle => {
          obstacle.move();
          obstacle.draw();
        });

        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffscreen);

        if (!this.todoRectoSinMiedo) {
          this.collisions();
        }

      }, 1000 / 60);
    }
    } 
    stopGame(reason) {
      if(reason === "lose"){
        console.log('You lose!');
      } else if (reason === "win"){
        console.log("you win!!");
      }
      clearInterval(this.intervalId);
      this.intervalId = undefined;

      this.theme.pause();
      this.isThemePlaying = false;

      this.updateEndScore();
      this.showRestartContainer();

        
    }
    restartGame() {
        clearInterval(this.intervalId);
        this.intervalId = undefined;

        this.resetGameState();
        this.hideRestartContainer();

        this.gameLoop();
    }
}

export default Game;
