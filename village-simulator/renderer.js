import { CONFIG, TERRAIN_TYPES } from './config.js';
import { world } from './world.js';
import { villagers } from './villager.js';

let canvas, ctx;
let gameStateRef = null;

export function initRenderer(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

export function setRendererGameState(gs) {
    gameStateRef = gs;
}

export function resizeCanvas() {
    if (!canvas) return;
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function getScale() {
    return Math.min(
        canvas.width / (world.width * CONFIG.TILE_SIZE),
        canvas.height / (world.height * CONFIG.TILE_SIZE)
    );
}

function getOffset() {
    const scale = getScale();
    return {
        x: (canvas.width - world.width * CONFIG.TILE_SIZE * scale) / 2,
        y: (canvas.height - world.height * CONFIG.TILE_SIZE * scale) / 2
    };
}

function drawTile(x, y, type) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    // Base colors
    const colors = {
        [TERRAIN_TYPES.GRASS]: '#3d5c3d',
        [TERRAIN_TYPES.DIRT]: '#8b7355',
        [TERRAIN_TYPES.WATER]: '#4a6fa5',
        [TERRAIN_TYPES.FIELD]: '#5c4033',
        [TERRAIN_TYPES.PATH]: '#8b8b6e',
        [TERRAIN_TYPES.FLOOR]: '#a08060'
    };

    ctx.fillStyle = colors[type] || colors[TERRAIN_TYPES.GRASS];
    ctx.fillRect(px, py, size + 1, size + 1);

    // Add texture
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 3; i++) {
        const tx = px + Math.random() * size;
        const ty = py + Math.random() * size;
        ctx.fillRect(tx, ty, 2, 2);
    }
}

function drawBuilding(building) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + building.x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + building.y * CONFIG.TILE_SIZE * scale;
    const w = building.w * CONFIG.TILE_SIZE * scale;
    const h = building.h * CONFIG.TILE_SIZE * scale;

    // Building colors
    const buildingColors = {
        house: { wall: '#8b6914', roof: '#6b4423', door: '#4a3520' },
        storage: { wall: '#696969', roof: '#4a4a4a', door: '#3a3a3a' },
        well: { wall: '#5a5a5a', roof: '#3a3a3a', door: '#2a2a2a' }
    };

    const colors = buildingColors[building.type] || buildingColors.house;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 4, py + 4, w, h);

    // Walls
    ctx.fillStyle = colors.wall;
    ctx.fillRect(px, py, w, h);

    // Roof
    ctx.fillStyle = colors.roof;
    ctx.fillRect(px, py, w, h * 0.3);

    // Door
    ctx.fillStyle = colors.door;
    ctx.fillRect(px + w * 0.4, py + h * 0.5, w * 0.2, h * 0.5);

    // Windows
    if (building.type === 'house' && gameStateRef) {
        const isNight = gameStateRef.time >= CONFIG.NIGHT_START || gameStateRef.time < CONFIG.NIGHT_END;
        ctx.fillStyle = isNight ? '#ffd700' : '#87ceeb';
        ctx.fillRect(px + w * 0.1, py + h * 0.4, w * 0.15, h * 0.2);
        ctx.fillRect(px + w * 0.75, py + h * 0.4, w * 0.15, h * 0.2);
    }

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = `${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(building.name, px + w / 2, py - 5);
}

function drawField(field) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + field.x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + field.y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    // Draw water indicator if watered
    if (field.isWatered && (field.state === 'planted' || field.state === 'growing')) {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
    }

    // Crop visualization
    if (field.state === 'planted') {
        // Just planted - small seedling
        ctx.fillStyle = '#228b22';
        const seedHeight = size * 0.15;
        ctx.fillRect(px + size * 0.4, py + size - seedHeight, size * 0.2, seedHeight);

        // Dry indicator if not watered
        if (!field.isWatered) {
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.arc(px + size * 0.7, py + size * 0.3, size * 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = `${8 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('?', px + size * 0.7, py + size * 0.35);
        }
    } else if (field.state === 'growing') {
        const progress = 1 - (field.growthTimer / CONFIG.CROP_GROW_TIME);
        const height = size * 0.2 + size * 0.5 * progress;
        ctx.fillStyle = '#228b22';
        ctx.fillRect(px + size * 0.3, py + size - height, size * 0.4, height);

        // Growth indicator
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(px + size * 0.35, py + size - height, size * 0.3, 3);

        // Dry indicator if not watered (growth paused)
        if (!field.isWatered) {
            ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
            ctx.beginPath();
            ctx.arc(px + size * 0.7, py + size * 0.3, size * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = `${10 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('💧', px + size * 0.7, py + size * 0.35);
        }
    } else if (field.state === 'ready') {
        ctx.fillStyle = '#daa520';
        ctx.fillRect(px + size * 0.2, py + size * 0.3, size * 0.6, size * 0.7);
        // Wheat tops
        ctx.fillStyle = '#f4a460';
        ctx.beginPath();
        ctx.arc(px + size * 0.35, py + size * 0.3, size * 0.15, 0, Math.PI * 2);
        ctx.arc(px + size * 0.5, py + size * 0.25, size * 0.15, 0, Math.PI * 2);
        ctx.arc(px + size * 0.65, py + size * 0.3, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawVillager(villager) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + villager.x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + villager.y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + size / 2, py + size * 0.9, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = villager.color;
    ctx.beginPath();
    ctx.arc(px + size / 2, py + size * 0.5, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffd5b5';
    ctx.beginPath();
    ctx.arc(px + size / 2, py + size * 0.25, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // State indicator
    let stateEmoji = '';
    switch (villager.state) {
        case 'sleeping': stateEmoji = '💤'; break;
        case 'planting': stateEmoji = '🌱'; break;
        case 'harvesting': stateEmoji = '🌾'; break;
        case 'storing': stateEmoji = '📦'; break;
        case 'walking': stateEmoji = '🚶'; break;
        case 'watering': stateEmoji = '💧'; break;
        case 'resting': stateEmoji = '☕'; break;
    }

    if (stateEmoji) {
        ctx.font = `${14 * scale}px Arial`;
        ctx.fillText(stateEmoji, px + size / 2 - 7, py - 5);
    }

    // Name
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(villager.name, px + size / 2, py + size + 12);

    // Inventory indicator
    if (villager.inventory > 0) {
        ctx.fillStyle = '#ffc857';
        ctx.font = `${12 * scale}px Arial`;
        ctx.fillText(`🎒${villager.inventory}`, px + size + 5, py + size / 2);
    }
}

function drawDayNightOverlay() {
    if (!gameStateRef) return;

    const isNight = gameStateRef.time >= CONFIG.NIGHT_START || gameStateRef.time < CONFIG.NIGHT_END;

    if (isNight) {
        let alpha = 0.4;
        if (gameStateRef.time >= CONFIG.NIGHT_START) {
            alpha = 0.4 * Math.min(1, (gameStateRef.time - CONFIG.NIGHT_START) / 60);
        } else if (gameStateRef.time < CONFIG.NIGHT_END) {
            alpha = 0.4 * (1 - gameStateRef.time / CONFIG.NIGHT_END);
        }

        ctx.fillStyle = `rgba(20, 20, 50, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

export function render() {
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw terrain
    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            drawTile(x, y, world.terrain[y][x]);
        }
    }

    // Draw fields
    world.fields.forEach(drawField);

    // Draw buildings
    world.buildings.forEach(drawBuilding);

    // Draw villagers
    villagers.forEach(drawVillager);

    // Day/night overlay
    drawDayNightOverlay();
}
