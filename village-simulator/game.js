import { CONFIG, VERSION } from './config.js';
import { generateWorld, updateCrops, updateTrees, updateFire, resetWorld } from './world.js';
import { villagers, setGameStateRef, updateVillagers, resetVillagers, createDefaultTree } from './villager.js';
import { initRenderer, setRendererGameState, render } from './renderer.js';
import { initUI, setUIGameState, setUIGameControls, updateTimeDisplay, updateStatusPanel, updateObjectives, renderTree } from './ui.js';

// Game state
export const gameState = {
    running: false,
    speed: 1,
    time: 6 * 60, // Start at 6:00 AM
    day: 1,
    season: 'spring', // Current season
    seasonDay: 1, // Day within current season
    totalHarvested: 0,

    // Resources
    storedWheat: 0,   // Raw wheat from harvest
    storedFlour: 0,   // Processed from wheat at mill
    storedBread: 0,   // Baked from flour at kitchen
    storedWood: 5,    // Wood for fireplace (start with some)
    storedWool: 0,    // Raw wool from sheep
    storedSweaters: 0, // Knitted sweaters
    storedFish: 0,    // Raw fish
    storedCookedFish: 0, // Cooked fish

    // House state
    fireplaceLit: false, // Is the fireplace burning?
    fireplaceWood: 0,    // Wood currently in fireplace

    // Objectives tracking
    objectives: {
        survive7: false,        // Survive 7 days
        bread5: false,          // Bake 5 bread
        sweater3: false,        // Knit 3 sweaters
        fish5: false,           // Cook 5 fish
        surviveWinter: false,   // Survive through winter
        allFed: false           // Keep all villagers fed for a full day
    },
    totalBreadBaked: 0,
    totalSweatersKnit: 0,
    totalFishCooked: 0,
    allFedDayStart: null,       // Day when all-fed tracking started
    passedThroughWinter: false, // Did we complete winter?

    // Legacy alias for compatibility
    get storedCrops() { return this.storedWheat; },
    set storedCrops(v) { this.storedWheat = v; }
};

let lastTick = 0;

// Get current season based on day
export function getCurrentSeason() {
    const seasonIndex = Math.floor((gameState.day - 1) / CONFIG.SEASON_LENGTH) % 4;
    return CONFIG.SEASONS[seasonIndex];
}

// Get temperature modifier based on season
export function getTemperatureModifier() {
    switch (gameState.season) {
        case 'winter': return -0.5;
        case 'autumn': return -0.2;
        case 'spring': return 0;
        case 'summer': return 0.2;
        default: return 0;
    }
}

// Check if crops can grow (not winter)
export function canCropsGrow() {
    return gameState.season !== 'winter';
}

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
    gameState.season = 'spring';
    gameState.seasonDay = 1;
    gameState.totalHarvested = 0;
    gameState.storedWheat = 0;
    gameState.storedFlour = 0;
    gameState.storedBread = 0;
    gameState.storedWood = 5;
    gameState.storedWool = 0;
    gameState.storedSweaters = 0;
    gameState.storedFish = 0;
    gameState.storedCookedFish = 0;
    gameState.fireplaceLit = false;
    gameState.fireplaceWood = 0;

    // Reset objectives
    gameState.objectives = {
        survive7: false,
        bread5: false,
        sweater3: false,
        fish5: false,
        surviveWinter: false,
        allFed: false
    };
    gameState.totalBreadBaked = 0;
    gameState.totalSweatersKnit = 0;
    gameState.totalFishCooked = 0;
    gameState.allFedDayStart = null;
    gameState.passedThroughWinter = false;

    // Reset villagers
    resetVillagers();

    // Reset world (fields, trees, sheep)
    resetWorld();

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
    // Display version
    const versionEl = document.getElementById('versionDisplay');
    if (versionEl) {
        versionEl.textContent = `v${VERSION}`;
    }
    console.log(`Village AI Simulator v${VERSION}`);

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

            // Update season
            gameState.season = getCurrentSeason();
            gameState.seasonDay = ((gameState.day - 1) % CONFIG.SEASON_LENGTH) + 1;
        }

        // Update crops (only grow if not winter)
        updateCrops(canCropsGrow());

        // Update trees (regrow)
        updateTrees();

        // Update fireplace
        updateFire(gameState);

        // Update villagers
        updateVillagers();

        // Check objectives
        checkObjectives();

        // Update UI
        updateTimeDisplay();
        updateStatusPanel();
        updateObjectives();
        renderTree();
    }

    render();
    requestAnimationFrame(update);
}

// Check and update objectives
function checkObjectives() {
    // Survive 7 days
    if (gameState.day >= 7 && !gameState.objectives.survive7) {
        gameState.objectives.survive7 = true;
    }

    // Bake 5 bread
    if (gameState.totalBreadBaked >= 5 && !gameState.objectives.bread5) {
        gameState.objectives.bread5 = true;
    }

    // Knit 3 sweaters
    if (gameState.totalSweatersKnit >= 3 && !gameState.objectives.sweater3) {
        gameState.objectives.sweater3 = true;
    }

    // Cook 5 fish
    if (gameState.totalFishCooked >= 5 && !gameState.objectives.fish5) {
        gameState.objectives.fish5 = true;
    }

    // Track winter passage
    if (gameState.season === 'winter') {
        gameState.passedThroughWinter = true;
    }
    // Survived winter (season changed from winter to spring AND we went through winter)
    if (gameState.passedThroughWinter && gameState.season === 'spring' && gameState.day > 21 && !gameState.objectives.surviveWinter) {
        gameState.objectives.surviveWinter = true;
    }

    // All villagers fed for a full day
    const allFed = villagers.every(v => v.hunger >= CONFIG.HUNGER_THRESHOLD);
    if (allFed) {
        if (gameState.allFedDayStart === null) {
            gameState.allFedDayStart = gameState.day;
        } else if (gameState.day > gameState.allFedDayStart && !gameState.objectives.allFed) {
            gameState.objectives.allFed = true;
        }
    } else {
        gameState.allFedDayStart = null;
    }
}
