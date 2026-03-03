import Game from './game.js';

let canvas = document.querySelector('canvas');
const startButton = document.getElementById('start-button');
const startBackground = document.getElementById('main-background');

const ctx = canvas.getContext('2d');
const game = new Game(ctx);

startButton.onclick = () => {
    startButton.remove();
    startBackground.remove();
    game.gameLoop();
};

