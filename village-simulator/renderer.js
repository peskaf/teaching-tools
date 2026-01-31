import { CONFIG, TERRAIN_TYPES } from './config.js';
import { world } from './world.js';
import { villagers } from './villager.js';

let canvas, ctx;
let gameStateRef = null;

// Rimworld-style muted color palette
const COLORS = {
    // Terrain
    grass: '#4a5d23',
    grassDark: '#3d4d1c',
    grassLight: '#5a6d2a',
    dirt: '#6b5344',
    dirtDark: '#5a4539',
    path: '#7a7a6a',
    pathDark: '#6a6a5a',
    soil: '#4a3d2e',
    soilWet: '#3a3025',

    // Buildings
    wallStone: '#6a6a6a',
    wallWood: '#8a7255',
    floor: '#5a5045',
    floorWood: '#6a5a45',

    // Furniture
    bedFrame: '#5a4a3a',
    bedSheet: '#7a9a7a',
    bedPillow: '#9a9a8a',
    storageZone: '#4a4a3a',
    crateWood: '#7a6a5a',

    // Well
    stoneRim: '#5a5a5a',
    water: '#3a5a7a',
    rope: '#8a7a5a',
    bucket: '#6a5a4a',

    // Characters
    skin: '#d4a574',
    skinDark: '#c49464',
    hair: '#4a3a2a',
};

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

// Seeded random for consistent texture
function seededRandom(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
}

function drawTile(x, y, type) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    // Base colors with variation
    let baseColor;
    switch (type) {
        case TERRAIN_TYPES.GRASS:
            const grassVariant = seededRandom(x, y);
            baseColor = grassVariant > 0.7 ? COLORS.grassLight :
                       grassVariant > 0.3 ? COLORS.grass : COLORS.grassDark;
            break;
        case TERRAIN_TYPES.DIRT:
            baseColor = seededRandom(x, y) > 0.5 ? COLORS.dirt : COLORS.dirtDark;
            break;
        case TERRAIN_TYPES.PATH:
            baseColor = seededRandom(x, y) > 0.5 ? COLORS.path : COLORS.pathDark;
            break;
        case TERRAIN_TYPES.FIELD:
            baseColor = COLORS.soil;
            break;
        case TERRAIN_TYPES.FLOOR:
            baseColor = COLORS.floor;
            break;
        default:
            baseColor = COLORS.grass;
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(px, py, size + 1, size + 1);

    // Add subtle texture (grass tufts, pebbles)
    if (type === TERRAIN_TYPES.GRASS) {
        // Random grass tufts
        for (let i = 0; i < 2; i++) {
            const tx = px + seededRandom(x, y, i * 10) * size;
            const ty = py + seededRandom(x, y, i * 20) * size;
            ctx.fillStyle = 'rgba(90, 110, 42, 0.5)';
            ctx.fillRect(tx, ty, 2 * scale, 3 * scale);
        }
    } else if (type === TERRAIN_TYPES.PATH) {
        // Pebbles on path
        if (seededRandom(x, y, 5) > 0.7) {
            ctx.fillStyle = 'rgba(100, 100, 90, 0.4)';
            ctx.beginPath();
            ctx.arc(px + size * 0.3, py + size * 0.6, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Draw open floorplan building with walls on edges only
function drawBuilding(building) {
    const scale = getScale();
    const offset = getOffset();
    const tileSize = CONFIG.TILE_SIZE * scale;

    const px = offset.x + building.x * tileSize;
    const py = offset.y + building.y * tileSize;
    const w = building.w * tileSize;
    const h = building.h * tileSize;
    const wallThickness = 4 * scale;

    // Draw floor first
    ctx.fillStyle = building.type === 'house' ? COLORS.floorWood : COLORS.floor;
    ctx.fillRect(px, py, w, h);

    // Floor board lines for house
    if (building.type === 'house') {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < building.w; i++) {
            ctx.beginPath();
            ctx.moveTo(px + i * tileSize, py);
            ctx.lineTo(px + i * tileSize, py + h);
            ctx.stroke();
        }
    }

    // Draw interior based on building type
    if (building.type === 'house') {
        drawHouseInterior(px, py, w, h, tileSize, scale);
    } else if (building.type === 'storage') {
        drawStorageInterior(px, py, w, h, tileSize, scale);
    } else if (building.type === 'well') {
        drawWell(px, py, w, h, tileSize, scale);
        return; // Well doesn't have walls
    }

    // Draw walls (only on edges)
    ctx.fillStyle = building.type === 'house' ? COLORS.wallWood : COLORS.wallStone;

    // Top wall
    ctx.fillRect(px, py, w, wallThickness);
    // Bottom wall (with gap for door)
    const doorWidth = tileSize * 0.6;
    const doorX = px + (w - doorWidth) / 2;
    ctx.fillRect(px, py + h - wallThickness, doorX - px, wallThickness);
    ctx.fillRect(doorX + doorWidth, py + h - wallThickness, px + w - doorX - doorWidth, wallThickness);
    // Left wall
    ctx.fillRect(px, py, wallThickness, h);
    // Right wall
    ctx.fillRect(px + w - wallThickness, py, wallThickness, h);

    // Wall shadow/depth
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(px + wallThickness, py + wallThickness, w - wallThickness * 2, 2 * scale);
    ctx.fillRect(px + wallThickness, py + wallThickness, 2 * scale, h - wallThickness * 2);

    // Label
    ctx.fillStyle = '#ddd';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(building.name, px + w / 2, py - 5 * scale);
}

function drawHouseInterior(px, py, w, h, tileSize, scale) {
    // Draw 3 beds (one for each villager)
    const bedWidth = tileSize * 0.7;
    const bedHeight = tileSize * 1.2;
    const bedSpacing = (w - bedWidth * 3) / 4;

    for (let i = 0; i < 3; i++) {
        const bedX = px + bedSpacing + i * (bedWidth + bedSpacing);
        const bedY = py + tileSize * 0.3;

        // Bed frame
        ctx.fillStyle = COLORS.bedFrame;
        ctx.fillRect(bedX, bedY, bedWidth, bedHeight);

        // Mattress/sheet
        ctx.fillStyle = villagers[i] ? villagers[i].color : COLORS.bedSheet;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(bedX + 2 * scale, bedY + 2 * scale, bedWidth - 4 * scale, bedHeight - 4 * scale);
        ctx.globalAlpha = 1;

        // Pillow
        ctx.fillStyle = COLORS.bedPillow;
        ctx.fillRect(bedX + 4 * scale, bedY + 4 * scale, bedWidth - 8 * scale, bedHeight * 0.2);

        // Bed frame border
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bedX, bedY, bedWidth, bedHeight);
    }
}

function drawStorageInterior(px, py, w, h, tileSize, scale) {
    // Draw stockpile zone markings
    ctx.fillStyle = COLORS.storageZone;
    ctx.fillRect(px + 8 * scale, py + 8 * scale, w - 16 * scale, h - 16 * scale);

    // Zone corner markers
    ctx.strokeStyle = '#8a8a6a';
    ctx.lineWidth = 2 * scale;
    const cornerSize = 8 * scale;
    const margin = 12 * scale;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(px + margin, py + margin + cornerSize);
    ctx.lineTo(px + margin, py + margin);
    ctx.lineTo(px + margin + cornerSize, py + margin);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(px + w - margin - cornerSize, py + margin);
    ctx.lineTo(px + w - margin, py + margin);
    ctx.lineTo(px + w - margin, py + margin + cornerSize);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(px + margin, py + h - margin - cornerSize);
    ctx.lineTo(px + margin, py + h - margin);
    ctx.lineTo(px + margin + cornerSize, py + h - margin);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(px + w - margin - cornerSize, py + h - margin);
    ctx.lineTo(px + w - margin, py + h - margin);
    ctx.lineTo(px + w - margin, py + h - margin - cornerSize);
    ctx.stroke();

    // Draw stored crops as stacked crates/piles
    if (gameStateRef && gameStateRef.storedCrops > 0) {
        const maxCrates = 12;
        const cratesPerRow = 4;
        const crateSize = tileSize * 0.5;
        const crateSpacing = 4 * scale;
        const numCrates = Math.min(Math.ceil(gameStateRef.storedCrops / 3), maxCrates);

        for (let i = 0; i < numCrates; i++) {
            const row = Math.floor(i / cratesPerRow);
            const col = i % cratesPerRow;
            const crateX = px + margin + col * (crateSize + crateSpacing);
            const crateY = py + margin + row * (crateSize + crateSpacing);

            // Crate
            ctx.fillStyle = COLORS.crateWood;
            ctx.fillRect(crateX, crateY, crateSize, crateSize);

            // Crate detail lines
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(crateX, crateY + crateSize / 2);
            ctx.lineTo(crateX + crateSize, crateY + crateSize / 2);
            ctx.moveTo(crateX + crateSize / 2, crateY);
            ctx.lineTo(crateX + crateSize / 2, crateY + crateSize);
            ctx.stroke();

            // Wheat visible on top
            ctx.fillStyle = '#c4a030';
            ctx.beginPath();
            ctx.arc(crateX + crateSize * 0.3, crateY + crateSize * 0.3, 3 * scale, 0, Math.PI * 2);
            ctx.arc(crateX + crateSize * 0.6, crateY + crateSize * 0.4, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Count label
        ctx.fillStyle = '#ddd';
        ctx.font = `bold ${10 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`${gameStateRef.storedCrops}`, px + w / 2, py + h - 6 * scale);
    }
}

function drawWell(px, py, w, h, tileSize, scale) {
    const centerX = px + w / 2;
    const centerY = py + h / 2;
    const outerRadius = Math.min(w, h) * 0.4;
    const innerRadius = outerRadius * 0.6;

    // Stone rim (outer)
    ctx.fillStyle = COLORS.stoneRim;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Stone texture on rim
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
        ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
        ctx.stroke();
    }

    // Water inside
    ctx.fillStyle = COLORS.water;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Water reflection
    ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - innerRadius * 0.2, centerY - innerRadius * 0.2, innerRadius * 0.3, innerRadius * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Wooden post
    const postHeight = outerRadius * 1.2;
    const postWidth = 6 * scale;
    ctx.fillStyle = COLORS.bedFrame;
    ctx.fillRect(centerX + outerRadius * 0.3, centerY - postHeight, postWidth, postHeight);

    // Crossbeam
    ctx.fillRect(centerX - outerRadius * 0.5, centerY - postHeight, outerRadius * 1.3, 4 * scale);

    // Rope
    ctx.strokeStyle = COLORS.rope;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - postHeight + 4 * scale);
    ctx.lineTo(centerX, centerY - innerRadius * 0.5);
    ctx.stroke();

    // Bucket
    const bucketY = centerY - innerRadius * 0.5;
    ctx.fillStyle = COLORS.bucket;
    ctx.beginPath();
    ctx.moveTo(centerX - 6 * scale, bucketY);
    ctx.lineTo(centerX - 8 * scale, bucketY + 10 * scale);
    ctx.lineTo(centerX + 8 * scale, bucketY + 10 * scale);
    ctx.lineTo(centerX + 6 * scale, bucketY);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = '#ddd';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Well', centerX, py - 5 * scale);
}

function drawField(field) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + field.x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + field.y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    // Soil base with furrows
    ctx.fillStyle = field.isWatered ? COLORS.soilWet : COLORS.soil;
    ctx.fillRect(px, py, size, size);

    // Furrow lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(px, py + i * size / 4);
        ctx.lineTo(px + size, py + i * size / 4);
        ctx.stroke();
    }

    // Water sheen if watered
    if (field.isWatered && (field.state === 'planted' || field.state === 'growing')) {
        ctx.fillStyle = 'rgba(80, 120, 180, 0.2)';
        ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
    }

    // Crop visualization
    if (field.state === 'planted') {
        // Small seedlings in rows
        ctx.fillStyle = '#4a7a2a';
        for (let i = 0; i < 3; i++) {
            const seedX = px + size * 0.25 + i * size * 0.25;
            const seedY = py + size * 0.7;
            ctx.fillRect(seedX - 1, seedY, 2 * scale, 6 * scale);
            // Tiny leaves
            ctx.beginPath();
            ctx.arc(seedX, seedY, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dry indicator
        if (!field.isWatered) {
            drawNeedsWaterIcon(px, py, size, scale);
        }
    } else if (field.state === 'growing') {
        const progress = 1 - (field.growthTimer / CONFIG.CROP_GROW_TIME);
        const cropHeight = 6 + 14 * progress;

        // Growing wheat stalks
        ctx.fillStyle = '#5a8a3a';
        for (let i = 0; i < 4; i++) {
            const stalkX = px + size * 0.15 + i * size * 0.22;
            const stalkY = py + size * 0.85;
            ctx.fillRect(stalkX, stalkY - cropHeight * scale, 2 * scale, cropHeight * scale);

            // Leaves
            if (progress > 0.3) {
                ctx.beginPath();
                ctx.moveTo(stalkX, stalkY - cropHeight * scale * 0.6);
                ctx.lineTo(stalkX - 4 * scale, stalkY - cropHeight * scale * 0.4);
                ctx.lineTo(stalkX, stalkY - cropHeight * scale * 0.5);
                ctx.fill();
            }
        }

        // Progress bar
        const barWidth = size * 0.6;
        const barHeight = 3 * scale;
        const barX = px + (size - barWidth) / 2;
        const barY = py + 2;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#7aaa4a';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Dry indicator
        if (!field.isWatered) {
            drawNeedsWaterIcon(px, py, size, scale);
        }
    } else if (field.state === 'ready') {
        // Mature wheat
        ctx.fillStyle = '#c4a030';
        for (let i = 0; i < 4; i++) {
            const stalkX = px + size * 0.15 + i * size * 0.22;
            const stalkY = py + size * 0.85;

            // Stalk
            ctx.fillStyle = '#a08020';
            ctx.fillRect(stalkX, stalkY - 20 * scale, 2 * scale, 20 * scale);

            // Wheat head
            ctx.fillStyle = '#d4b040';
            ctx.beginPath();
            ctx.ellipse(stalkX + 1 * scale, stalkY - 22 * scale, 3 * scale, 6 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wheat grain details
            ctx.strokeStyle = '#b09020';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(stalkX - 2 * scale, stalkY - 24 * scale);
            ctx.lineTo(stalkX + 4 * scale, stalkY - 24 * scale);
            ctx.moveTo(stalkX - 2 * scale, stalkY - 21 * scale);
            ctx.lineTo(stalkX + 4 * scale, stalkY - 21 * scale);
            ctx.stroke();
        }
    }
}

function drawNeedsWaterIcon(px, py, size, scale) {
    // Water droplet icon
    const iconX = px + size * 0.8;
    const iconY = py + size * 0.2;

    ctx.fillStyle = 'rgba(60, 100, 160, 0.9)';
    ctx.beginPath();
    ctx.moveTo(iconX, iconY - 4 * scale);
    ctx.quadraticCurveTo(iconX + 5 * scale, iconY + 2 * scale, iconX, iconY + 6 * scale);
    ctx.quadraticCurveTo(iconX - 5 * scale, iconY + 2 * scale, iconX, iconY - 4 * scale);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(150, 200, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(iconX - 1 * scale, iconY, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
}

// Rimworld-style character (capsule/pill shape)
function drawVillager(villager) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + villager.x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + villager.y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    const centerX = px + size / 2;
    const bodyTop = py + size * 0.2;
    const bodyBottom = py + size * 0.85;
    const bodyWidth = size * 0.35;
    const headRadius = size * 0.18;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(centerX, py + size * 0.92, bodyWidth * 0.8, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (behind body)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(centerX - bodyWidth * 0.5, bodyBottom - 4 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(centerX + bodyWidth * 0.1, bodyBottom - 4 * scale, 4 * scale, 8 * scale);

    // Body (capsule/pill shape)
    ctx.fillStyle = villager.color;

    // Body rectangle
    ctx.fillRect(centerX - bodyWidth / 2, bodyTop + headRadius, bodyWidth, bodyBottom - bodyTop - headRadius);

    // Rounded bottom
    ctx.beginPath();
    ctx.arc(centerX, bodyBottom, bodyWidth / 2, 0, Math.PI);
    ctx.fill();

    // Body shading
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(centerX, bodyTop + headRadius, bodyWidth / 2, bodyBottom - bodyTop - headRadius);

    // Arms (simple rectangles on sides)
    if (villager.state === 'planting' || villager.state === 'harvesting' || villager.state === 'watering') {
        // Arms extended down
        ctx.fillStyle = COLORS.skin;
        ctx.fillRect(centerX - bodyWidth / 2 - 3 * scale, bodyTop + headRadius + 5 * scale, 3 * scale, 15 * scale);
        ctx.fillRect(centerX + bodyWidth / 2, bodyTop + headRadius + 5 * scale, 3 * scale, 15 * scale);
    } else {
        // Arms at sides
        ctx.fillStyle = COLORS.skin;
        ctx.fillRect(centerX - bodyWidth / 2 - 3 * scale, bodyTop + headRadius + 2 * scale, 3 * scale, 10 * scale);
        ctx.fillRect(centerX + bodyWidth / 2, bodyTop + headRadius + 2 * scale, 3 * scale, 10 * scale);
    }

    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.beginPath();
    ctx.arc(centerX, bodyTop + headRadius, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Head shading
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(centerX + 2 * scale, bodyTop + headRadius, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Hair (simple cap on top)
    ctx.fillStyle = COLORS.hair;
    ctx.beginPath();
    ctx.arc(centerX, bodyTop + headRadius - 2 * scale, headRadius * 0.9, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes (tiny dots)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(centerX - 4 * scale, bodyTop + headRadius - 1 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(centerX + 2 * scale, bodyTop + headRadius - 1 * scale, 2 * scale, 2 * scale);

    // State indicator (small icon above head)
    let stateEmoji = '';
    switch (villager.state) {
        case 'sleeping': stateEmoji = '💤'; break;
        case 'planting': stateEmoji = '🌱'; break;
        case 'harvesting': stateEmoji = '🌾'; break;
        case 'storing': stateEmoji = '📦'; break;
        case 'walking': stateEmoji = ''; break; // No icon for walking
        case 'watering': stateEmoji = '💧'; break;
        case 'resting': stateEmoji = '☕'; break;
    }

    if (stateEmoji) {
        ctx.font = `${12 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(stateEmoji, centerX, bodyTop - 5 * scale);
    }

    // Name below
    ctx.fillStyle = '#ddd';
    ctx.font = `bold ${9 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(villager.name, centerX, py + size + 10 * scale);

    // Inventory indicator (backpack/sack if carrying items)
    if (villager.inventory > 0) {
        // Small sack on back
        ctx.fillStyle = '#8a7a5a';
        ctx.beginPath();
        ctx.ellipse(centerX + bodyWidth / 2 + 4 * scale, bodyTop + headRadius + 15 * scale, 5 * scale, 7 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Count
        ctx.fillStyle = '#ffc857';
        ctx.font = `bold ${8 * scale}px Arial`;
        ctx.fillText(`${villager.inventory}`, centerX + bodyWidth / 2 + 12 * scale, bodyTop + headRadius + 18 * scale);
    }
}

function drawDayNightOverlay() {
    if (!gameStateRef) return;

    const isNight = gameStateRef.time >= CONFIG.NIGHT_START || gameStateRef.time < CONFIG.NIGHT_END;

    if (isNight) {
        let alpha = 0.35;
        if (gameStateRef.time >= CONFIG.NIGHT_START) {
            alpha = 0.35 * Math.min(1, (gameStateRef.time - CONFIG.NIGHT_START) / 60);
        } else if (gameStateRef.time < CONFIG.NIGHT_END) {
            alpha = 0.35 * (1 - gameStateRef.time / CONFIG.NIGHT_END);
        }

        ctx.fillStyle = `rgba(15, 20, 40, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

export function render() {
    if (!canvas || !ctx) return;

    // Clear with dark background
    ctx.fillStyle = '#1a1a1e';
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
