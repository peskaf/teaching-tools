import { CONFIG } from './config.js';
import { generateWorld, updateCrops, resetFields } from './world.js';
import { villagers, setGameStateRef, updateVillagers, resetVillagers, createDefaultTree } from './villager.js';
import { initRenderer, setRendererGameState, render } from './renderer.js';
import { initUI, setUIGameState, setUIGameControls, updateTimeDisplay, updateStatusPanel, renderTree } from './ui.js';

// Game state
export const gameState = {
    running: false,
    speed: 1,
    time: 6 * 60, // Start at 6:00 AM
    day: 1,
    totalHarvested: 0,
    storedCrops: 0
};

let lastTick = 0;

// Toggle simulation running state
export function toggleSimulation() {
    gameState.running = !gameState.running;
    const btn = document.getElementById('startBtn');
    btn.textContent = gameState.running ? '⏹ Stop' : '▶ Start';
    btn.classList.toggle('stop', gameState.running);
}

// Reset simulation to initial state
export function resetSimulation() {
    gameState.running = false;
    gameState.time = 6 * 60;
    gameState.day = 1;
    gameState.totalHarvested = 0;
    gameState.storedCrops = 0;

    // Reset villagers
    resetVillagers();

    // Reset fields
    resetFields();

    document.getElementById('startBtn').textContent = '▶ Start';
    document.getElementById('startBtn').classList.remove('stop');

    updateTimeDisplay();
    updateStatusPanel();
    render();
}

// Set simulation speed
export function setSpeed(speed) {
    gameState.speed = speed;
}

// Initialize the game
export function initGame() {
    // Set game state reference for other modules
    setGameStateRef(gameState);
    setRendererGameState(gameState);
    setUIGameState(gameState);

    // Pass control functions to UI
    setUIGameControls({
        toggle: toggleSimulation,
        reset: resetSimulation,
        setSpeed: setSpeed
    });

    // Initialize world
    generateWorld();

    // Give each villager a default tree
    villagers.forEach(v => {
        v.behaviorTree = createDefaultTree();
    });

    // Initialize canvas
    const canvas = document.getElementById('gameCanvas');
    initRenderer(canvas);

    // Initialize UI
    initUI();

    // Initial render
    updateTimeDisplay();
    updateStatusPanel();
    renderTree();
    render();

    // Start game loop
    requestAnimationFrame(update);
}

// Main game loop
function update(timestamp) {
    if (!gameState.running || gameState.speed === 0) {
        requestAnimationFrame(update);
        return;
    }

    const tickInterval = CONFIG.TICK_RATE / gameState.speed;

    if (timestamp - lastTick >= tickInterval) {
        lastTick = timestamp;

        // Update time
        gameState.time++;
        if (gameState.time >= CONFIG.DAY_LENGTH) {
            gameState.time = 0;
            gameState.day++;
        }

        // Update crops
        updateCrops();

        // Update villagers
        updateVillagers();

        // Update UI
        updateTimeDisplay();
        updateStatusPanel();
        renderTree();
    }

    render();
    requestAnimationFrame(update);
}
