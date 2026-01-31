import { CONFIG, TERRAIN_TYPES, LOCATIONS, getBedPosition, HOUSE_POSITIONS } from './config.js';
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
    forest: '#2a3d1a',
    pond: '#3a5a7a',
    pondDeep: '#2a4a6a',
    pondEdge: '#5a7a9a',

    // Fence
    fence: '#6a5030',
    fencePost: '#5a4025',

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

    // Fire
    fireOrange: '#ff6030',
    fireYellow: '#ffa030',
    fireRed: '#ff3020',
    ember: '#aa3020',

    // Kitchen
    stoveMetal: '#4a4a4a',
    stoveTop: '#3a3a3a',
    potMetal: '#5a5a5a',

    // Knitting
    yarn: '#c45070',
    needles: '#8a8a8a',

    // Well
    stoneRim: '#5a5a5a',
    water: '#3a5a7a',
    rope: '#8a7a5a',
    bucket: '#6a5a4a',

    // Characters
    skin: '#d4a574',
    skinDark: '#c49464',
    hair: '#4a3a2a',

    // Nature
    treeTrunk: '#5a4030',
    treeLeaves: '#3a5a2a',
    treeLeavesLight: '#4a6a3a',
    sheepBody: '#e8e8e0',
    sheepFace: '#3a3a3a',
};

// Season color modifiers
const SEASON_COLORS = {
    spring: { grass: '#4a6d23', leaves: '#4a7a3a' },
    summer: { grass: '#5a7d23', leaves: '#3a6a2a' },
    autumn: { grass: '#6a5d23', leaves: '#8a5a2a' },
    winter: { grass: '#6a7a7a', leaves: '#5a6a6a' }
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

function getSeasonGrassColor() {
    if (!gameStateRef) return COLORS.grass;
    const season = gameStateRef.season || 'summer';
    return SEASON_COLORS[season]?.grass || COLORS.grass;
}

function drawTile(x, y, type) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    let baseColor;
    switch (type) {
        case TERRAIN_TYPES.GRASS:
            const grassBase = getSeasonGrassColor();
            const grassVariant = seededRandom(x, y);
            baseColor = grassVariant > 0.7 ? grassBase :
                       grassVariant > 0.3 ? grassBase : COLORS.grassDark;
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
        case TERRAIN_TYPES.FOREST:
            baseColor = COLORS.forest;
            break;
        case TERRAIN_TYPES.POND:
            baseColor = seededRandom(x, y) > 0.5 ? COLORS.pond : COLORS.pondDeep;
            break;
        case TERRAIN_TYPES.FENCE:
            baseColor = getSeasonGrassColor(); // Draw grass underneath
            break;
        case TERRAIN_TYPES.WALL:
            baseColor = COLORS.wallStone;
            break;
        case TERRAIN_TYPES.DOOR:
            baseColor = COLORS.floorWood;
            break;
        default:
            baseColor = COLORS.grass;
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(px, py, size + 1, size + 1);

    // Add subtle texture
    if (type === TERRAIN_TYPES.GRASS) {
        for (let i = 0; i < 2; i++) {
            const tx = px + seededRandom(x, y, i * 10) * size;
            const ty = py + seededRandom(x, y, i * 20) * size;
            ctx.fillStyle = 'rgba(90, 110, 42, 0.5)';
            ctx.fillRect(tx, ty, 2 * scale, 3 * scale);
        }
    } else if (type === TERRAIN_TYPES.PATH) {
        if (seededRandom(x, y, 5) > 0.7) {
            ctx.fillStyle = 'rgba(100, 100, 90, 0.4)';
            ctx.beginPath();
            ctx.arc(px + size * 0.3, py + size * 0.6, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === TERRAIN_TYPES.POND) {
        // Water ripple
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px + size * 0.5, py + size * 0.5, size * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        // Add occasional reeds at pond edges
        if (seededRandom(x, y, 7) > 0.7) {
            ctx.fillStyle = '#3a5a2a';
            ctx.fillRect(px + size * 0.2, py + size * 0.1, 2 * scale, 10 * scale);
            ctx.fillRect(px + size * 0.3, py + size * 0.15, 2 * scale, 8 * scale);
        }
    } else if (type === TERRAIN_TYPES.FENCE) {
        // Draw fence posts and rails
        ctx.fillStyle = COLORS.fencePost;

        // Corner posts
        ctx.fillRect(px + 2 * scale, py + 2 * scale, 4 * scale, size - 4 * scale);
        ctx.fillRect(px + size - 6 * scale, py + 2 * scale, 4 * scale, size - 4 * scale);

        // Horizontal rails
        ctx.fillStyle = COLORS.fence;
        ctx.fillRect(px, py + size * 0.25, size, 3 * scale);
        ctx.fillRect(px, py + size * 0.6, size, 3 * scale);

        // Post caps
        ctx.fillStyle = COLORS.fencePost;
        ctx.beginPath();
        ctx.arc(px + 4 * scale, py + 2 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.arc(px + size - 4 * scale, py + 2 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === TERRAIN_TYPES.WALL) {
        // Stone/brick texture for walls
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        // Horizontal mortar lines
        ctx.fillRect(px, py + size * 0.33, size, 1);
        ctx.fillRect(px, py + size * 0.66, size, 1);
        // Vertical mortar lines (offset)
        ctx.fillRect(px + size * 0.5, py, 1, size * 0.33);
        ctx.fillRect(px + size * 0.25, py + size * 0.33, 1, size * 0.33);
        ctx.fillRect(px + size * 0.75, py + size * 0.33, 1, size * 0.33);
        ctx.fillRect(px + size * 0.5, py + size * 0.66, 1, size * 0.34);
    } else if (type === TERRAIN_TYPES.DOOR) {
        // Door frame
        ctx.fillStyle = COLORS.bedFrame;
        ctx.fillRect(px + 2 * scale, py, size - 4 * scale, size);
        // Door panel
        ctx.fillStyle = '#5a4535';
        ctx.fillRect(px + 4 * scale, py + 2 * scale, size - 8 * scale, size - 4 * scale);
        // Door handle
        ctx.fillStyle = '#8a7a60';
        ctx.beginPath();
        ctx.arc(px + size * 0.7, py + size * 0.5, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === TERRAIN_TYPES.GATE) {
        // Fence gate - grass base with open gate
        const grassBase = getSeasonGrassColor();
        ctx.fillStyle = grassBase;
        ctx.fillRect(px, py, size, size);

        // Gate frame (open gate swung to side)
        ctx.fillStyle = COLORS.fence;
        // Left post
        ctx.fillRect(px + 1 * scale, py + 2 * scale, 3 * scale, size - 4 * scale);
        // Right post
        ctx.fillRect(px + size - 4 * scale, py + 2 * scale, 3 * scale, size - 4 * scale);

        // Gate slats (angled to show it's open)
        ctx.fillStyle = COLORS.fencePost;
        ctx.save();
        ctx.translate(px + 4 * scale, py + size / 2);
        ctx.rotate(-0.3); // Slightly open
        ctx.fillRect(0, -size * 0.35, 2 * scale, size * 0.7);
        ctx.fillRect(4 * scale, -size * 0.35, 2 * scale, size * 0.7);
        ctx.restore();

        // Horizontal rails on gate
        ctx.fillStyle = COLORS.fence;
        ctx.fillRect(px + 4 * scale, py + size * 0.3, size * 0.4, 2 * scale);
        ctx.fillRect(px + 4 * scale, py + size * 0.6, size * 0.4, 2 * scale);
    }
}

// Draw building interior elements (walls are now tile-based)
function drawBuilding(building) {
    const scale = getScale();
    const offset = getOffset();
    const tileSize = CONFIG.TILE_SIZE * scale;

    const px = offset.x + building.x * tileSize;
    const py = offset.y + building.y * tileSize;
    const w = building.w * tileSize;
    const h = building.h * tileSize;

    // Draw interior based on building type
    if (building.type === 'house') {
        drawHouseInterior(px, py, w, h, tileSize, scale, building);
    } else if (building.type === 'storage') {
        drawStorageInterior(px, py, w, h, tileSize, scale, building);
    } else if (building.type === 'well') {
        drawWell(px, py, w, h, tileSize, scale);
        return;
    } else if (building.type === 'mill') {
        drawMillInterior(px, py, w, h, tileSize, scale, building);
    }

    // Label above building
    ctx.fillStyle = '#ddd';
    ctx.font = `bold ${10 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(building.name, px + w / 2, py - 5 * scale);
}

function drawHouseInterior(px, py, w, h, tileSize, scale, building) {
    const offset = getOffset();

    // Interior starts 1 tile in from walls
    const interiorX = px + tileSize;
    const interiorY = py + tileSize;
    const interiorW = w - 2 * tileSize;
    const interiorH = h - 2 * tileSize;

    // Floor board lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i < building.w - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(px + i * tileSize, interiorY);
        ctx.lineTo(px + i * tileSize, interiorY + interiorH);
        ctx.stroke();
    }

    // Draw beds using getBedPosition() for accurate placement
    const numBeds = Math.min(villagers.length, 5);
    const bedWidth = tileSize * 0.8;
    const bedHeight = tileSize * 0.7;

    for (let i = 0; i < numBeds; i++) {
        const bedPos = getBedPosition(i);
        const bedCenterX = offset.x + bedPos.x * tileSize;
        const bedCenterY = offset.y + bedPos.y * tileSize;
        const bedX = bedCenterX - bedWidth / 2;
        const bedY = bedCenterY - bedHeight / 2;

        // Bed frame
        ctx.fillStyle = COLORS.bedFrame;
        ctx.fillRect(bedX, bedY, bedWidth, bedHeight);

        // Mattress
        ctx.fillStyle = villagers[i] ? villagers[i].color : COLORS.bedSheet;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(bedX + 2 * scale, bedY + 2 * scale, bedWidth - 4 * scale, bedHeight - 4 * scale);
        ctx.globalAlpha = 1;

        // Pillow
        ctx.fillStyle = COLORS.bedPillow;
        ctx.fillRect(bedX + 3 * scale, bedY + 3 * scale, bedWidth - 6 * scale, bedHeight * 0.2);
    }

    // Draw fireplace on right side, middle row
    const fireplacePos = HOUSE_POSITIONS.fireplace;
    const fireplaceX = offset.x + fireplacePos.x * tileSize - tileSize * 0.4;
    const fireplaceY = offset.y + fireplacePos.y * tileSize - tileSize * 0.4;
    const fireplaceW = tileSize * 0.8;
    const fireplaceH = tileSize * 0.8;

    // Stone fireplace base
    ctx.fillStyle = COLORS.stoneRim;
    ctx.fillRect(fireplaceX, fireplaceY, fireplaceW, fireplaceH);

    // Fire opening
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(fireplaceX + 4 * scale, fireplaceY + 4 * scale, fireplaceW - 8 * scale, fireplaceH - 8 * scale);

    // Fire if lit
    if (gameStateRef && gameStateRef.fireplaceLit) {
        ctx.fillStyle = 'rgba(255, 150, 50, 0.4)';
        ctx.fillRect(fireplaceX + 6 * scale, fireplaceY + 8 * scale, fireplaceW - 12 * scale, fireplaceH - 12 * scale);

        ctx.fillStyle = COLORS.fireOrange;
        for (let i = 0; i < 3; i++) {
            const flameX = fireplaceX + fireplaceW * 0.25 + i * fireplaceW * 0.25;
            const flameY = fireplaceY + fireplaceH - 6 * scale;
            ctx.beginPath();
            ctx.moveTo(flameX, flameY);
            ctx.quadraticCurveTo(flameX - 2 * scale, flameY - 8 * scale, flameX, flameY - 12 * scale);
            ctx.quadraticCurveTo(flameX + 2 * scale, flameY - 8 * scale, flameX, flameY);
            ctx.fill();
        }

        ctx.fillStyle = COLORS.ember;
        ctx.fillRect(fireplaceX + 8 * scale, fireplaceY + fireplaceH - 10 * scale, fireplaceW - 16 * scale, 4 * scale);
    }

    // Wood pile indicator
    if (gameStateRef && gameStateRef.fireplaceWood > 0) {
        ctx.fillStyle = COLORS.treeTrunk;
        const logs = Math.min(Math.ceil(gameStateRef.fireplaceWood / 2), 3);
        for (let i = 0; i < logs; i++) {
            ctx.fillRect(fireplaceX - 12 * scale, fireplaceY + fireplaceH - 8 * scale - i * 5 * scale, 10 * scale, 4 * scale);
        }
    }

    // Draw stove - bottom row, right side
    const stovePos = HOUSE_POSITIONS.stove;
    const stoveX = offset.x + stovePos.x * tileSize - tileSize * 0.35;
    const stoveY = offset.y + stovePos.y * tileSize - tileSize * 0.35;
    const stoveW = tileSize * 0.7;
    const stoveH = tileSize * 0.7;

    ctx.fillStyle = COLORS.stoveMetal;
    ctx.fillRect(stoveX, stoveY, stoveW, stoveH);

    ctx.fillStyle = COLORS.stoveTop;
    ctx.fillRect(stoveX + 2 * scale, stoveY + 2 * scale, stoveW - 4 * scale, stoveH * 0.4);

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(stoveX + stoveW * 0.3, stoveY + stoveH * 0.25, 4 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(stoveX + stoveW * 0.7, stoveY + stoveH * 0.25, 4 * scale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(stoveX + 4 * scale, stoveY + stoveH * 0.5, stoveW - 8 * scale, stoveH * 0.4);
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(stoveX + stoveW * 0.3, stoveY + stoveH * 0.55, stoveW * 0.4, 2 * scale);

    // Draw knitting station - bottom row, left side
    const knittingPos = HOUSE_POSITIONS.knittingStation;
    const knittingX = offset.x + knittingPos.x * tileSize - tileSize * 0.3;
    const knittingY = offset.y + knittingPos.y * tileSize - tileSize * 0.35;
    const knittingW = tileSize * 0.6;
    const knittingH = tileSize * 0.7;

    // Chair/stool
    ctx.fillStyle = COLORS.bedFrame;
    ctx.fillRect(knittingX, knittingY + knittingH * 0.4, knittingW, knittingH * 0.5);

    // Yarn basket
    ctx.fillStyle = '#7a6a50';
    ctx.beginPath();
    ctx.ellipse(knittingX + knittingW * 0.5, knittingY + knittingH * 0.2, knittingW * 0.4, knittingH * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yarn balls
    ctx.fillStyle = COLORS.yarn;
    ctx.beginPath();
    ctx.arc(knittingX + knittingW * 0.35, knittingY + knittingH * 0.15, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5070c4';
    ctx.beginPath();
    ctx.arc(knittingX + knittingW * 0.6, knittingY + knittingH * 0.18, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Needles
    ctx.strokeStyle = COLORS.needles;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(knittingX + knittingW * 0.2, knittingY);
    ctx.lineTo(knittingX + knittingW * 0.5, knittingY + knittingH * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(knittingX + knittingW * 0.8, knittingY);
    ctx.lineTo(knittingX + knittingW * 0.5, knittingY + knittingH * 0.3);
    ctx.stroke();
}

function drawStorageInterior(px, py, w, h, tileSize, scale, building) {
    // Interior area (inside walls)
    const interiorX = px + tileSize;
    const interiorY = py + tileSize;
    const interiorW = w - 2 * tileSize;
    const interiorH = h - 2 * tileSize;

    // Zone markings
    ctx.fillStyle = COLORS.storageZone;
    ctx.fillRect(interiorX + 4 * scale, interiorY + 4 * scale, interiorW - 8 * scale, interiorH - 8 * scale);

    // Corner markers (relative to interior)
    ctx.strokeStyle = '#8a8a6a';
    ctx.lineWidth = 2 * scale;
    const cornerSize = 5 * scale;
    const margin = 6 * scale;

    // Draw corners in interior
    [[margin, margin], [interiorW - margin, margin], [margin, interiorH - margin], [interiorW - margin, interiorH - margin]].forEach(([cx, cy], i) => {
        ctx.beginPath();
        const xDir = i % 2 === 0 ? 1 : -1;
        const yDir = i < 2 ? 1 : -1;
        ctx.moveTo(interiorX + cx, interiorY + cy + yDir * cornerSize);
        ctx.lineTo(interiorX + cx, interiorY + cy);
        ctx.lineTo(interiorX + cx + xDir * cornerSize, interiorY + cy);
        ctx.stroke();
    });

    // Draw stored items as organized piles (inside interior)
    let itemY = interiorY + margin + 3 * scale;
    const itemSize = 10 * scale;
    const itemSpacing = 2 * scale;

    // Wheat (yellow sacks)
    if (gameStateRef && gameStateRef.storedWheat > 0) {
        const numSacks = Math.min(Math.ceil(gameStateRef.storedWheat / 3), 3);
        for (let i = 0; i < numSacks; i++) {
            ctx.fillStyle = '#c4a030';
            ctx.beginPath();
            ctx.ellipse(interiorX + margin + 8 * scale + i * (itemSize + itemSpacing), itemY + itemSize / 2, itemSize / 2, itemSize / 2 * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        itemY += itemSize + itemSpacing;
    }

    // Flour (white sacks)
    if (gameStateRef && gameStateRef.storedFlour > 0) {
        const numSacks = Math.min(gameStateRef.storedFlour, 3);
        for (let i = 0; i < numSacks; i++) {
            ctx.fillStyle = '#e8e0d0';
            ctx.beginPath();
            ctx.ellipse(interiorX + margin + 8 * scale + i * (itemSize + itemSpacing), itemY + itemSize / 2, itemSize / 2, itemSize / 2 * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        itemY += itemSize + itemSpacing;
    }

    // Bread (brown loaves)
    if (gameStateRef && gameStateRef.storedBread > 0) {
        const numLoaves = Math.min(gameStateRef.storedBread, 3);
        for (let i = 0; i < numLoaves; i++) {
            ctx.fillStyle = '#a08040';
            ctx.beginPath();
            ctx.ellipse(interiorX + margin + 8 * scale + i * (itemSize + itemSpacing), itemY + itemSize / 3, itemSize / 2, itemSize / 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        itemY += itemSize + itemSpacing;
    }

    // Wood (brown logs) - right side
    if (gameStateRef && gameStateRef.storedWood > 0) {
        const numLogs = Math.min(gameStateRef.storedWood, 4);
        ctx.fillStyle = COLORS.treeTrunk;
        for (let i = 0; i < numLogs; i++) {
            ctx.fillRect(interiorX + interiorW - 18 * scale, interiorY + margin + i * 6 * scale, 12 * scale, 5 * scale);
        }
    }

    // Wool (fluffy white) - right side bottom
    if (gameStateRef && gameStateRef.storedWool > 0) {
        const numWool = Math.min(gameStateRef.storedWool, 3);
        ctx.fillStyle = COLORS.sheepBody;
        for (let i = 0; i < numWool; i++) {
            ctx.beginPath();
            ctx.arc(interiorX + interiorW - 10 * scale, interiorY + interiorH - 10 * scale - i * 10 * scale, 5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Sweaters (colored rectangles) - center bottom
    if (gameStateRef && gameStateRef.storedSweaters > 0) {
        const numSweaters = Math.min(gameStateRef.storedSweaters, 3);
        for (let i = 0; i < numSweaters; i++) {
            ctx.fillStyle = ['#8a4a4a', '#4a8a4a', '#4a4a8a'][i % 3];
            ctx.fillRect(interiorX + interiorW / 2 - 6 * scale + i * 4 * scale, interiorY + interiorH - 16 * scale, 8 * scale, 10 * scale);
        }
    }

    // Fish (blue-ish) - left side bottom
    if (gameStateRef && (gameStateRef.storedFish > 0 || gameStateRef.storedCookedFish > 0)) {
        const totalFish = (gameStateRef.storedFish || 0) + (gameStateRef.storedCookedFish || 0);
        ctx.fillStyle = gameStateRef.storedCookedFish > 0 ? '#a08060' : '#6a8aaa';
        const numFish = Math.min(totalFish, 3);
        for (let i = 0; i < numFish; i++) {
            ctx.beginPath();
            ctx.ellipse(interiorX + margin + 8 * scale, interiorY + interiorH - 8 * scale - i * 8 * scale, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawWell(px, py, w, h, tileSize, scale) {
    const centerX = px + w / 2;
    const centerY = py + h / 2;
    const outerRadius = Math.min(w, h) * 0.4;
    const innerRadius = outerRadius * 0.6;

    // Stone rim
    ctx.fillStyle = COLORS.stoneRim;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Stone texture
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerRadius, centerY + Math.sin(angle) * innerRadius);
        ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
        ctx.stroke();
    }

    // Water
    ctx.fillStyle = COLORS.water;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Reflection
    ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - innerRadius * 0.2, centerY - innerRadius * 0.2, innerRadius * 0.3, innerRadius * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Wooden post and bucket
    const postHeight = outerRadius * 1.2;
    ctx.fillStyle = COLORS.bedFrame;
    ctx.fillRect(centerX + outerRadius * 0.3, centerY - postHeight, 6 * scale, postHeight);
    ctx.fillRect(centerX - outerRadius * 0.5, centerY - postHeight, outerRadius * 1.3, 4 * scale);

    // Rope and bucket
    ctx.strokeStyle = COLORS.rope;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - postHeight + 4 * scale);
    ctx.lineTo(centerX, centerY - innerRadius * 0.5);
    ctx.stroke();

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

function drawMillInterior(px, py, w, h, tileSize, scale, building) {
    // Interior center (inside walls)
    const interiorX = px + tileSize;
    const interiorY = py + tileSize;
    const interiorW = w - 2 * tileSize;
    const interiorH = h - 2 * tileSize;
    const centerX = interiorX + interiorW / 2;
    const centerY = interiorY + interiorH / 2;

    // Millstone base
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileSize * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Grooves
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2 * scale;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * tileSize * 0.15, centerY + Math.sin(angle) * tileSize * 0.15);
        ctx.lineTo(centerX + Math.cos(angle) * tileSize * 0.65, centerY + Math.sin(angle) * tileSize * 0.65);
        ctx.stroke();
    }

    // Upper stone
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 3 * scale, tileSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Pivot
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 3 * scale, tileSize * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Handle
    ctx.fillStyle = COLORS.bedFrame;
    ctx.fillRect(centerX + tileSize * 0.3, centerY - 8 * scale, tileSize * 0.5, 6 * scale);
}

function drawTree(tree) {
    const scale = getScale();
    const offset = getOffset();
    const tileSize = CONFIG.TILE_SIZE * scale;

    const px = offset.x + tree.x * tileSize;
    const py = offset.y + tree.y * tileSize;

    if (tree.state === 'grown') {
        // Trunk
        ctx.fillStyle = COLORS.treeTrunk;
        ctx.fillRect(px - 4 * scale, py - 10 * scale, 8 * scale, 20 * scale);

        // Leaves (season-dependent)
        const season = gameStateRef?.season || 'summer';
        ctx.fillStyle = SEASON_COLORS[season]?.leaves || COLORS.treeLeaves;

        // Foliage circles
        ctx.beginPath();
        ctx.arc(px, py - 20 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.arc(px - 8 * scale, py - 15 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.arc(px + 8 * scale, py - 15 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Snow in winter
        if (season === 'winter') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(px, py - 22 * scale, 8 * scale, Math.PI, Math.PI * 2);
            ctx.fill();
        }
    } else if (tree.state === 'growing') {
        // Stump
        ctx.fillStyle = COLORS.treeTrunk;
        ctx.fillRect(px - 5 * scale, py - 3 * scale, 10 * scale, 8 * scale);

        // Small sprout
        const progress = 1 - (tree.regrowTimer / CONFIG.TREE_REGROW_TIME);
        if (progress > 0.3) {
            ctx.fillStyle = COLORS.treeLeaves;
            ctx.beginPath();
            ctx.arc(px, py - 5 * scale, 4 * scale * progress, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawSheep(sheep) {
    const scale = getScale();
    const offset = getOffset();
    const tileSize = CONFIG.TILE_SIZE * scale;

    const px = offset.x + sheep.x * tileSize;
    const py = offset.y + sheep.y * tileSize;

    if (sheep.hasWool) {
        // Fluffy woolly sheep - full body with wool
        ctx.fillStyle = COLORS.sheepBody;
        ctx.beginPath();
        ctx.ellipse(px, py, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wool texture - fluffy puffs
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let i = 0; i < 6; i++) {
            const wx = px - 8 * scale + seededRandom(sheep.id, i, 0) * 16 * scale;
            const wy = py - 4 * scale + seededRandom(sheep.id, i, 1) * 8 * scale;
            ctx.beginPath();
            ctx.arc(wx, wy, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Extra fluffy outline
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.ellipse(px, py, 13 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Sheared sheep - smaller, pink/tan body visible
        // Pink skin body (smaller without wool)
        ctx.fillStyle = '#e8c8b8'; // Pink/tan skin color
        ctx.beginPath();
        ctx.ellipse(px, py, 9 * scale, 6 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subtle skin texture/shading
        ctx.fillStyle = 'rgba(200, 150, 130, 0.3)';
        ctx.beginPath();
        ctx.ellipse(px + 2 * scale, py + 1 * scale, 7 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Very short stubble (tiny dots)
        ctx.fillStyle = 'rgba(230, 230, 220, 0.5)';
        for (let i = 0; i < 8; i++) {
            const sx = px - 6 * scale + seededRandom(sheep.id, i, 10) * 12 * scale;
            const sy = py - 4 * scale + seededRandom(sheep.id, i, 11) * 8 * scale;
            ctx.beginPath();
            ctx.arc(sx, sy, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Head (same for both)
    ctx.fillStyle = COLORS.sheepFace;
    ctx.beginPath();
    ctx.ellipse(px + 10 * scale, py, 5 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.ellipse(px + 8 * scale, py - 5 * scale, 3 * scale, 2 * scale, -0.5, 0, Math.PI * 2);
    ctx.ellipse(px + 8 * scale, py + 5 * scale, 3 * scale, 2 * scale, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Legs (thinner for sheared sheep)
    ctx.fillStyle = COLORS.sheepFace;
    const legWidth = sheep.hasWool ? 3 * scale : 2.5 * scale;
    ctx.fillRect(px - 8 * scale, py + 6 * scale, legWidth, 6 * scale);
    ctx.fillRect(px - 2 * scale, py + 6 * scale, legWidth, 6 * scale);
    ctx.fillRect(px + 4 * scale, py + 6 * scale, legWidth, 6 * scale);
}

function drawField(field) {
    const scale = getScale();
    const offset = getOffset();

    const px = offset.x + field.x * CONFIG.TILE_SIZE * scale;
    const py = offset.y + field.y * CONFIG.TILE_SIZE * scale;
    const size = CONFIG.TILE_SIZE * scale;

    // Soil
    ctx.fillStyle = field.isWatered ? COLORS.soilWet : COLORS.soil;
    ctx.fillRect(px, py, size, size);

    // Furrows
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(px, py + i * size / 4);
        ctx.lineTo(px + size, py + i * size / 4);
        ctx.stroke();
    }

    // Water sheen
    if (field.isWatered && (field.state === 'planted' || field.state === 'growing')) {
        ctx.fillStyle = 'rgba(80, 120, 180, 0.2)';
        ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
    }

    // Crop visualization
    if (field.state === 'planted') {
        ctx.fillStyle = '#4a7a2a';
        for (let i = 0; i < 3; i++) {
            const seedX = px + size * 0.25 + i * size * 0.25;
            const seedY = py + size * 0.7;
            ctx.fillRect(seedX - 1, seedY, 2 * scale, 6 * scale);
            ctx.beginPath();
            ctx.arc(seedX, seedY, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        if (!field.isWatered) {
            drawNeedsWaterIcon(px, py, size, scale);
        }
    } else if (field.state === 'growing') {
        const progress = 1 - (field.growthTimer / CONFIG.CROP_GROW_TIME);
        const cropHeight = 6 + 14 * progress;

        ctx.fillStyle = '#5a8a3a';
        for (let i = 0; i < 4; i++) {
            const stalkX = px + size * 0.15 + i * size * 0.22;
            const stalkY = py + size * 0.85;
            ctx.fillRect(stalkX, stalkY - cropHeight * scale, 2 * scale, cropHeight * scale);
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
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(px + (size - barWidth) / 2, py + 2, barWidth, 3 * scale);
        ctx.fillStyle = '#7aaa4a';
        ctx.fillRect(px + (size - barWidth) / 2, py + 2, barWidth * progress, 3 * scale);

        if (!field.isWatered) {
            drawNeedsWaterIcon(px, py, size, scale);
        }
    } else if (field.state === 'ready') {
        ctx.fillStyle = '#c4a030';
        for (let i = 0; i < 4; i++) {
            const stalkX = px + size * 0.15 + i * size * 0.22;
            const stalkY = py + size * 0.85;

            ctx.fillStyle = '#a08020';
            ctx.fillRect(stalkX, stalkY - 20 * scale, 2 * scale, 20 * scale);

            ctx.fillStyle = '#d4b040';
            ctx.beginPath();
            ctx.ellipse(stalkX + 1 * scale, stalkY - 22 * scale, 3 * scale, 6 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawNeedsWaterIcon(px, py, size, scale) {
    const iconX = px + size * 0.8;
    const iconY = py + size * 0.2;

    ctx.fillStyle = 'rgba(60, 100, 160, 0.9)';
    ctx.beginPath();
    ctx.moveTo(iconX, iconY - 4 * scale);
    ctx.quadraticCurveTo(iconX + 5 * scale, iconY + 2 * scale, iconX, iconY + 6 * scale);
    ctx.quadraticCurveTo(iconX - 5 * scale, iconY + 2 * scale, iconX, iconY - 4 * scale);
    ctx.fill();

    ctx.fillStyle = 'rgba(150, 200, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(iconX - 1 * scale, iconY, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
}

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

    // Legs
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(centerX - bodyWidth * 0.5, bodyBottom - 4 * scale, 4 * scale, 8 * scale);
    ctx.fillRect(centerX + bodyWidth * 0.1, bodyBottom - 4 * scale, 4 * scale, 8 * scale);

    // Body
    ctx.fillStyle = villager.color;
    ctx.fillRect(centerX - bodyWidth / 2, bodyTop + headRadius, bodyWidth, bodyBottom - bodyTop - headRadius);
    ctx.beginPath();
    ctx.arc(centerX, bodyBottom, bodyWidth / 2, 0, Math.PI);
    ctx.fill();

    // Sweater indicator
    if (villager.wearingSweater) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(centerX - bodyWidth / 2 - 1 * scale, bodyTop + headRadius, bodyWidth + 2 * scale, bodyBottom - bodyTop - headRadius);
    }

    // Body shading
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(centerX, bodyTop + headRadius, bodyWidth / 2, bodyBottom - bodyTop - headRadius);

    // Arms
    const armExtended = ['planting', 'harvesting', 'watering', 'chopping', 'shearing', 'fishing'].includes(villager.state);
    ctx.fillStyle = COLORS.skin;
    if (armExtended) {
        ctx.fillRect(centerX - bodyWidth / 2 - 3 * scale, bodyTop + headRadius + 5 * scale, 3 * scale, 15 * scale);
        ctx.fillRect(centerX + bodyWidth / 2, bodyTop + headRadius + 5 * scale, 3 * scale, 15 * scale);
    } else {
        ctx.fillRect(centerX - bodyWidth / 2 - 3 * scale, bodyTop + headRadius + 2 * scale, 3 * scale, 10 * scale);
        ctx.fillRect(centerX + bodyWidth / 2, bodyTop + headRadius + 2 * scale, 3 * scale, 10 * scale);
    }

    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.beginPath();
    ctx.arc(centerX, bodyTop + headRadius, headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(centerX + 2 * scale, bodyTop + headRadius, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = COLORS.hair;
    ctx.beginPath();
    ctx.arc(centerX, bodyTop + headRadius - 2 * scale, headRadius * 0.9, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(centerX - 4 * scale, bodyTop + headRadius - 1 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(centerX + 2 * scale, bodyTop + headRadius - 1 * scale, 2 * scale, 2 * scale);

    // State indicator
    let stateEmoji = '';
    switch (villager.state) {
        case 'sleeping': stateEmoji = '💤'; break;
        case 'planting': stateEmoji = '🌱'; break;
        case 'harvesting': stateEmoji = '🌾'; break;
        case 'storing': stateEmoji = '📦'; break;
        case 'watering': stateEmoji = '💧'; break;
        case 'resting': stateEmoji = '☕'; break;
        case 'grinding': stateEmoji = '⚙️'; break;
        case 'baking': stateEmoji = '🍞'; break;
        case 'eating': stateEmoji = '😋'; break;
        case 'chopping': stateEmoji = '🪓'; break;
        case 'shearing': stateEmoji = '✂️'; break;
        case 'knitting': stateEmoji = '🧶'; break;
        case 'fishing': stateEmoji = '🎣'; break;
        case 'cooking': stateEmoji = '🍳'; break;
        case 'warming': stateEmoji = '🔥'; break;
        case 'dressing': stateEmoji = '🧥'; break;
        case 'stoking': stateEmoji = '🔥'; break;
        case 'firefighting': stateEmoji = '🧯'; break;
    }

    if (stateEmoji) {
        ctx.font = `${12 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(stateEmoji, centerX, bodyTop - 5 * scale);
    }

    // Cold indicator
    if (villager.warmth < 30) {
        ctx.font = `${10 * scale}px Arial`;
        ctx.fillText('🥶', centerX + 15 * scale, bodyTop);
    }

    // Water bucket indicator (for firefighting)
    if (villager.hasWater) {
        ctx.fillStyle = COLORS.bucket;
        const bucketX = centerX - bodyWidth / 2 - 8 * scale;
        const bucketY = bodyTop + headRadius + 12 * scale;
        ctx.beginPath();
        ctx.moveTo(bucketX - 4 * scale, bucketY);
        ctx.lineTo(bucketX - 5 * scale, bucketY + 8 * scale);
        ctx.lineTo(bucketX + 5 * scale, bucketY + 8 * scale);
        ctx.lineTo(bucketX + 4 * scale, bucketY);
        ctx.closePath();
        ctx.fill();
        // Water in bucket
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(bucketX - 3 * scale, bucketY + 2 * scale, 6 * scale, 4 * scale);
    }

    // Name
    ctx.fillStyle = '#ddd';
    ctx.font = `bold ${9 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(villager.name, centerX, py + size + 10 * scale);

    // Inventory indicator
    if (villager.inventory > 0) {
        ctx.fillStyle = '#8a7a5a';
        ctx.beginPath();
        ctx.ellipse(centerX + bodyWidth / 2 + 4 * scale, bodyTop + headRadius + 15 * scale, 5 * scale, 7 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        const invIcon = {
            'wheat': '🌾',
            'flour': '🥛',
            'wood': '🪵',
            'wool': '🧶',
            'fish': '🐟'
        }[villager.inventoryType] || '📦';

        ctx.font = `${8 * scale}px Arial`;
        ctx.fillText(invIcon, centerX + bodyWidth / 2 + 12 * scale, bodyTop + headRadius + 18 * scale);
    }
}

function drawFireOutbreak() {
    if (!world.fireOutbreak) return;

    const scale = getScale();
    const offset = getOffset();
    const tileSize = CONFIG.TILE_SIZE * scale;

    const fire = world.fireOutbreak;
    const building = fire.building;

    // Calculate building center
    const px = offset.x + (building.x + building.w / 2) * tileSize;
    const py = offset.y + (building.y + building.h / 2) * tileSize;

    // Fire intensity affects size
    const intensity = fire.intensity / 100;

    // Draw fire glow
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, tileSize * 2 * intensity);
    gradient.addColorStop(0, 'rgba(255, 100, 30, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 50, 20, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 30, 10, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(px - tileSize * 2, py - tileSize * 2, tileSize * 4, tileSize * 4);

    // Draw animated flames
    const time = Date.now() / 100;
    ctx.fillStyle = COLORS.fireRed;
    for (let i = 0; i < 8 * intensity; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.1;
        const dist = tileSize * 0.5 * intensity;
        const flameX = px + Math.cos(angle) * dist;
        const flameY = py + Math.sin(angle) * dist;
        const flameHeight = (15 + Math.sin(time + i) * 5) * scale * intensity;

        ctx.beginPath();
        ctx.moveTo(flameX - 5 * scale, flameY);
        ctx.quadraticCurveTo(flameX - 3 * scale, flameY - flameHeight * 0.5, flameX, flameY - flameHeight);
        ctx.quadraticCurveTo(flameX + 3 * scale, flameY - flameHeight * 0.5, flameX + 5 * scale, flameY);
        ctx.closePath();
        ctx.fill();
    }

    // Inner orange flames
    ctx.fillStyle = COLORS.fireOrange;
    for (let i = 0; i < 5 * intensity; i++) {
        const angle = (i / 5) * Math.PI * 2 + time * 0.15;
        const dist = tileSize * 0.3 * intensity;
        const flameX = px + Math.cos(angle) * dist;
        const flameY = py + Math.sin(angle) * dist;
        const flameHeight = (12 + Math.sin(time + i * 2) * 4) * scale * intensity;

        ctx.beginPath();
        ctx.moveTo(flameX - 4 * scale, flameY);
        ctx.quadraticCurveTo(flameX - 2 * scale, flameY - flameHeight * 0.5, flameX, flameY - flameHeight);
        ctx.quadraticCurveTo(flameX + 2 * scale, flameY - flameHeight * 0.5, flameX + 4 * scale, flameY);
        ctx.closePath();
        ctx.fill();
    }

    // Yellow/white core
    ctx.fillStyle = COLORS.fireYellow;
    for (let i = 0; i < 3; i++) {
        const flameX = px + (Math.sin(time + i) * 8 * scale);
        const flameY = py;
        const flameHeight = (10 + Math.sin(time * 2 + i) * 3) * scale * intensity;

        ctx.beginPath();
        ctx.moveTo(flameX - 3 * scale, flameY);
        ctx.quadraticCurveTo(flameX, flameY - flameHeight * 0.7, flameX, flameY - flameHeight);
        ctx.quadraticCurveTo(flameX, flameY - flameHeight * 0.7, flameX + 3 * scale, flameY);
        ctx.closePath();
        ctx.fill();
    }

    // Smoke particles
    ctx.fillStyle = 'rgba(50, 50, 50, 0.4)';
    for (let i = 0; i < 5; i++) {
        const smokeX = px + Math.sin(time * 0.5 + i * 2) * 20 * scale;
        const smokeY = py - tileSize * (0.8 + i * 0.3) - Math.sin(time + i) * 10 * scale;
        const smokeSize = (8 + i * 3) * scale * intensity;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Fire warning icon
    ctx.font = `bold ${20 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff3030';
    ctx.fillText('🔥', px, py - tileSize * 1.5);

    // Progress bar showing extinguish progress
    if (fire.progress > 0) {
        const barWidth = tileSize * 1.5;
        const barHeight = 6 * scale;
        const barX = px - barWidth / 2;
        const barY = py + tileSize;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#4a9aff';
        const progress = fire.progress / CONFIG.FIRE_EXTINGUISH_TIME;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }
}

function drawSeasonOverlay() {
    if (!gameStateRef) return;

    const season = gameStateRef.season;

    // Winter snow effect
    if (season === 'winter') {
        ctx.fillStyle = 'rgba(200, 220, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    // Clear
    ctx.fillStyle = '#1a1a1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Terrain
    for (let y = 0; y < world.height; y++) {
        for (let x = 0; x < world.width; x++) {
            drawTile(x, y, world.terrain[y][x]);
        }
    }

    // Fields
    world.fields.forEach(drawField);

    // Trees
    world.trees.forEach(drawTree);

    // Sheep
    world.sheep.forEach(drawSheep);

    // Buildings
    world.buildings.forEach(drawBuilding);

    // Fire outbreak (draw before villagers so they appear on top)
    drawFireOutbreak();

    // Villagers
    villagers.forEach(drawVillager);

    // Overlays
    drawSeasonOverlay();
    drawDayNightOverlay();
}
