import Game from './game.js';

const canvas = document.querySelector('canvas');
const startButton = document.getElementById('start-button');
const startBackground = document.getElementById('main-background');
const overlay = document.getElementById('orientation-overlay');
const overlayText = overlay?.querySelector('.overlay-text');
const overlaySubtext = overlay?.querySelector('.overlay-subtext');

const MIN_PLAY_WIDTH = 600;

const ctx = canvas.getContext('2d');
const game = new Game(ctx);

const isMobile = (() => {
    const ua = navigator.userAgent || '';
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        navigator.maxTouchPoints > 1 ||
        coarsePointer;
})();

let gameStarted = false;
let pausedByOverlay = false;

function isWideEnough() {
    return window.innerWidth >= MIN_PLAY_WIDTH;
}

function showOverlay() {
    if (!overlay) return;
    overlay.classList.remove('hidden');
    if (overlayText) {
        overlayText.textContent = 'Please rotate your device!';
    }
    if (overlaySubtext) {
        const helper = isMobile ? 'Try landscape mode.' : 'Enlarge your window.';
        overlaySubtext.textContent = `Minimum width: ${MIN_PLAY_WIDTH}px · ${helper}`;
    }
}

function hideOverlay() {
    if (!overlay) return;
    overlay.classList.add('hidden');
}

function handleViewportChange() {
    const wideEnough = isWideEnough();

    if (!wideEnough) {
        showOverlay();
        if (gameStarted && !pausedByOverlay && typeof game.pauseForResize === 'function') {
            game.pauseForResize();
            pausedByOverlay = true;
        }
        return;
    }

    hideOverlay();

    if (pausedByOverlay && typeof game.resumeAfterResize === 'function') {
        game.resumeAfterResize();
    }
    pausedByOverlay = false;
}

if (startButton) {
    startButton.onclick = () => {
        if (!isWideEnough()) {
            showOverlay();
            return;
        }
        hideOverlay();
        startButton.remove();
        startBackground?.remove();
        gameStarted = true;
        if (typeof game.setInputEnabled === 'function') {
            game.setInputEnabled(true);
        }
        game.gameLoop();
    };
}

window.addEventListener('resize', handleViewportChange);
window.addEventListener('orientationchange', handleViewportChange);
handleViewportChange();
