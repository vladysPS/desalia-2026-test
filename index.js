import Game from './game.js';

const canvas = document.querySelector('canvas');
const startButton = document.getElementById('start-button');
const startBackground = document.getElementById('main-background');
 
const ctx = canvas.getContext('2d');
const game = new Game(ctx);

if (startButton) {
    startButton.onclick = () => {
        startButton.remove();
        startBackground?.remove();
        if (typeof game.setInputEnabled === 'function') {
            game.setInputEnabled(true);
        }
        game.gameLoop();
    };
}
