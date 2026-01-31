import { CONFIG, TERRAIN_TYPES, LOCATIONS } from './config.js';

// World state
export const world = {
    width: 24,
    height: 18,
    terrain: [],
    buildings: [],
    fields: [],
    trees: [],
    sheep: [],
    storage: { x: 0, y: 0, crops: 0 },
    fireOutbreak: null // { x, y, building, progress } - active fire location
};

// Generate the world
export function generateWorld() {
    // Initialize terrain
    world.terrain = [];
    for (let y = 0; y < world.height; y++) {
        world.terrain[y] = [];
        for (let x = 0; x < world.width; x++) {
            world.terrain[y][x] = TERRAIN_TYPES.GRASS;
        }
    }

    // Add paths
    for (let x = 0; x < world.width; x++) {
        world.terrain[8][x] = TERRAIN_TYPES.PATH;
        world.terrain[9][x] = TERRAIN_TYPES.PATH;
    }
    for (let y = 3; y < 15; y++) {
        world.terrain[y][10] = TERRAIN_TYPES.PATH;
        world.terrain[y][16] = TERRAIN_TYPES.PATH;
    }

    // Add pond terrain (larger, more natural shape)
    for (let dy = 0; dy < LOCATIONS.pond.h; dy++) {
        for (let dx = 0; dx < LOCATIONS.pond.w; dx++) {
            // Create more natural pond shape
            const centerX = LOCATIONS.pond.w / 2;
            const centerY = LOCATIONS.pond.h / 2;
            const distX = Math.abs(dx - centerX + 0.5) / centerX;
            const distY = Math.abs(dy - centerY + 0.5) / centerY;
            if (distX * distX + distY * distY < 1.2) {
                world.terrain[LOCATIONS.pond.y + dy][LOCATIONS.pond.x + dx] = TERRAIN_TYPES.POND;
            }
        }
    }

    // Add forest terrain
    for (let dy = 0; dy < LOCATIONS.forest.h; dy++) {
        for (let dx = 0; dx < LOCATIONS.forest.w; dx++) {
            world.terrain[LOCATIONS.forest.y + dy][LOCATIONS.forest.x + dx] = TERRAIN_TYPES.FOREST;
        }
    }

    // Add pasture fence terrain
    for (let dy = 0; dy < LOCATIONS.pasture.h; dy++) {
        for (let dx = 0; dx < LOCATIONS.pasture.w; dx++) {
            const x = LOCATIONS.pasture.x + dx;
            const y = LOCATIONS.pasture.y + dy;
            // Mark fence edges
            if (dy === 0 || dy === LOCATIONS.pasture.h - 1 || dx === 0 || dx === LOCATIONS.pasture.w - 1) {
                // Gate at bottom center
                if (dy === LOCATIONS.pasture.h - 1 && dx >= 1 && dx <= 2) {
                    world.terrain[y][x] = TERRAIN_TYPES.GRASS;
                } else {
                    world.terrain[y][x] = TERRAIN_TYPES.FENCE;
                }
            }
        }
    }

    // Add buildings
    world.buildings = [
        { ...LOCATIONS.house, type: 'house', name: 'House' },
        { ...LOCATIONS.storage, type: 'storage', name: 'Storage' },
        { ...LOCATIONS.well, type: 'well', name: 'Well' },
        { ...LOCATIONS.mill, type: 'mill', name: 'Mill' }
    ];

    // Initialize fields with crops (only 2 fields now)
    world.fields = [];
    const fieldDefs = [LOCATIONS.field1, LOCATIONS.field2];
    fieldDefs.forEach((fd, fi) => {
        for (let dy = 0; dy < fd.h; dy++) {
            for (let dx = 0; dx < fd.w; dx++) {
                world.terrain[fd.y + dy][fd.x + dx] = TERRAIN_TYPES.FIELD;
                world.fields.push({
                    x: fd.x + dx,
                    y: fd.y + dy,
                    state: 'empty', // empty, planted, growing, ready
                    growthTimer: 0,
                    waterTimer: 0,
                    isWatered: false,
                    fieldIndex: fi
                });
            }
        }
    });

    // Initialize trees in forest area
    world.trees = [];
    for (let dy = 0; dy < LOCATIONS.forest.h; dy++) {
        for (let dx = 0; dx < LOCATIONS.forest.w; dx++) {
            // Add trees with some spacing
            if ((dx + dy) % 2 === 0) {
                world.trees.push({
                    x: LOCATIONS.forest.x + dx + 0.5,
                    y: LOCATIONS.forest.y + dy + 0.5,
                    state: 'grown', // grown, chopped, growing
                    regrowTimer: 0
                });
            }
        }
    }

    // Initialize sheep in pasture area (inside fence)
    world.sheep = [
        {
            id: 0,
            x: LOCATIONS.pasture.x + 1.5,
            y: LOCATIONS.pasture.y + 1.5,
            hasWool: true,
            woolTimer: 0,
            moveTimer: 0,
            targetX: null,
            targetY: null
        },
        {
            id: 1,
            x: LOCATIONS.pasture.x + 2.5,
            y: LOCATIONS.pasture.y + 2,
            hasWool: true,
            woolTimer: 0,
            moveTimer: 0,
            targetX: null,
            targetY: null
        },
        {
            id: 2,
            x: LOCATIONS.pasture.x + 1.5,
            y: LOCATIONS.pasture.y + 2.5,
            hasWool: true,
            woolTimer: 0,
            moveTimer: 0,
            targetX: null,
            targetY: null
        }
    ];

    // Storage location
    world.storage = { x: LOCATIONS.storage.x + 1, y: LOCATIONS.storage.y + 2, crops: 0 };

    // No active fire
    world.fireOutbreak = null;
}

// Check if a point is inside a building (excluding door)
export function isInsideBuilding(x, y, building) {
    return x >= building.x && x < building.x + building.w &&
           y >= building.y && y < building.y + building.h;
}

// Check if position is blocked by walls (for pathfinding)
export function isBlockedByWall(x, y) {
    for (const building of world.buildings) {
        if (building.type === 'well') continue; // Well has no walls

        const bx = building.x;
        const by = building.y;
        const bw = building.w;
        const bh = building.h;

        // Check if inside building bounds
        if (x >= bx && x < bx + bw && y >= by && y < by + bh) {
            // Inside building - that's OK
            continue;
        }

        // Check if trying to cross walls (not through door)
        const wallThickness = 0.15;

        // Door position (bottom center)
        const doorX = bx + bw / 2;
        const doorWidth = 0.6;

        // Top wall
        if (y >= by - wallThickness && y < by + wallThickness &&
            x >= bx && x < bx + bw) {
            return true;
        }
        // Bottom wall (with door gap)
        if (y >= by + bh - wallThickness && y < by + bh + wallThickness &&
            x >= bx && x < bx + bw) {
            if (Math.abs(x - doorX) > doorWidth / 2) {
                return true;
            }
        }
        // Left wall
        if (x >= bx - wallThickness && x < bx + wallThickness &&
            y >= by && y < by + bh) {
            return true;
        }
        // Right wall
        if (x >= bx + bw - wallThickness && x < bx + bw + wallThickness &&
            y >= by && y < by + bh) {
            return true;
        }
    }

    // Check fence
    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    if (tileY >= 0 && tileY < world.height && tileX >= 0 && tileX < world.width) {
        if (world.terrain[tileY][tileX] === TERRAIN_TYPES.FENCE) {
            return true;
        }
    }

    return false;
}

// Update crops growth (called each tick)
export function updateCrops(canGrow = true) {
    world.fields.forEach(field => {
        // Handle watering timer
        if (field.waterTimer > 0) {
            field.waterTimer--;
            if (field.waterTimer <= 0) {
                field.isWatered = false;
            }
        }

        // Crops only grow when watered AND not winter
        if (field.state === 'growing' && field.isWatered && canGrow) {
            field.growthTimer--;
            if (field.growthTimer <= 0) {
                field.state = 'ready';
            }
        }
    });
}

// Update trees (regrowth) and sheep movement
export function updateTrees() {
    world.trees.forEach(tree => {
        if (tree.state === 'growing') {
            tree.regrowTimer--;
            if (tree.regrowTimer <= 0) {
                tree.state = 'grown';
            }
        }
    });

    // Update sheep wool regrowth and movement
    world.sheep.forEach(sheep => {
        if (!sheep.hasWool) {
            sheep.woolTimer--;
            if (sheep.woolTimer <= 0) {
                sheep.hasWool = true;
            }
        }

        // Random sheep movement within pasture
        sheep.moveTimer--;
        if (sheep.moveTimer <= 0) {
            // Set new random target within pasture bounds
            sheep.targetX = LOCATIONS.pasture.x + 1 + Math.random() * (LOCATIONS.pasture.w - 2);
            sheep.targetY = LOCATIONS.pasture.y + 1 + Math.random() * (LOCATIONS.pasture.h - 2);
            sheep.moveTimer = 60 + Math.random() * 120; // Wait 1-3 seconds before next move
        }

        // Move toward target
        if (sheep.targetX !== null && sheep.targetY !== null) {
            const dx = sheep.targetX - sheep.x;
            const dy = sheep.targetY - sheep.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0.1) {
                const speed = 0.02;
                sheep.x += (dx / dist) * speed;
                sheep.y += (dy / dist) * speed;
            } else {
                sheep.targetX = null;
                sheep.targetY = null;
            }
        }
    });
}

// Update fireplace (consume wood)
export function updateFire(gameState) {
    if (gameState.fireplaceLit) {
        gameState.fireplaceWood -= CONFIG.FIRE_WOOD_CONSUMPTION;
        if (gameState.fireplaceWood <= 0) {
            gameState.fireplaceLit = false;
            gameState.fireplaceWood = 0;
        }
    }

    // Random fire outbreak chance
    if (!world.fireOutbreak && Math.random() < CONFIG.FIRE_SPREAD_CHANCE) {
        // Fire breaks out in a random building
        const flammableBuildings = world.buildings.filter(b => b.type !== 'well');
        if (flammableBuildings.length > 0) {
            const building = flammableBuildings[Math.floor(Math.random() * flammableBuildings.length)];
            world.fireOutbreak = {
                x: building.x + building.w / 2,
                y: building.y + building.h / 2,
                building: building,
                progress: 0, // How much water has been applied
                intensity: 100 // Fire intensity
            };
        }
    }
}

// Apply water to fire outbreak
export function extinguishFire(amount) {
    if (world.fireOutbreak) {
        world.fireOutbreak.progress += amount;
        world.fireOutbreak.intensity -= amount * 2;
        if (world.fireOutbreak.progress >= CONFIG.FIRE_EXTINGUISH_TIME || world.fireOutbreak.intensity <= 0) {
            world.fireOutbreak = null;
            return true; // Fire extinguished
        }
    }
    return false;
}

// Check if there's an active fire
export function hasFireOutbreak() {
    return world.fireOutbreak !== null;
}

// Reset world to initial state
export function resetWorld() {
    // Reset fields
    world.fields.forEach(f => {
        f.state = 'empty';
        f.growthTimer = 0;
        f.waterTimer = 0;
        f.isWatered = false;
    });

    // Reset trees
    world.trees.forEach(t => {
        t.state = 'grown';
        t.regrowTimer = 0;
    });

    // Reset sheep
    world.sheep.forEach((s, i) => {
        s.hasWool = true;
        s.woolTimer = 0;
        s.x = LOCATIONS.pasture.x + 1.5 + (i % 2);
        s.y = LOCATIONS.pasture.y + 1.5 + Math.floor(i / 2);
        s.moveTimer = 0;
        s.targetX = null;
        s.targetY = null;
    });

    // Reset fire
    world.fireOutbreak = null;
}

// Legacy export for compatibility
export function resetFields() {
    world.fields.forEach(f => {
        f.state = 'empty';
        f.growthTimer = 0;
        f.waterTimer = 0;
        f.isWatered = false;
    });
}

// Find fields that need attention for a specific villager
export function findFieldNeedingAttention(villager, state, allVillagers) {
    const candidates = world.fields.filter(f => f.state === state);
    if (candidates.length === 0) return null;

    const targetedFields = new Set();
    allVillagers.forEach(v => {
        if (v.id !== villager.id && v.targetField) {
            targetedFields.add(`${v.targetField.x},${v.targetField.y}`);
        }
    });

    const sorted = candidates
        .map(f => ({
            field: f,
            dist: Math.sqrt(Math.pow(f.x - villager.x, 2) + Math.pow(f.y - villager.y, 2)),
            targeted: targetedFields.has(`${f.x},${f.y}`)
        }))
        .sort((a, b) => {
            if (a.targeted !== b.targeted) return a.targeted ? 1 : -1;
            return a.dist - b.dist;
        });

    return sorted.length > 0 ? sorted[0].field : null;
}

// Find field needing water
export function findFieldNeedingWater(villager, allVillagers) {
    const candidates = world.fields.filter(f =>
        (f.state === 'planted' || f.state === 'growing') && !f.isWatered
    );
    if (candidates.length === 0) return null;

    const targetedFields = new Set();
    allVillagers.forEach(v => {
        if (v.id !== villager.id && v.targetField && v.currentAction === 'watering') {
            targetedFields.add(`${v.targetField.x},${v.targetField.y}`);
        }
    });

    const sorted = candidates
        .map(f => ({
            field: f,
            dist: Math.sqrt(Math.pow(f.x - villager.x, 2) + Math.pow(f.y - villager.y, 2)),
            targeted: targetedFields.has(`${f.x},${f.y}`)
        }))
        .sort((a, b) => {
            if (a.targeted !== b.targeted) return a.targeted ? 1 : -1;
            return a.dist - b.dist;
        });

    return sorted.length > 0 ? sorted[0].field : null;
}

// Find a tree to chop
export function findTreeToChop(villager, allVillagers) {
    const candidates = world.trees.filter(t => t.state === 'grown');
    if (candidates.length === 0) return null;

    const targetedTrees = new Set();
    allVillagers.forEach(v => {
        if (v.id !== villager.id && v.targetTree) {
            targetedTrees.add(`${v.targetTree.x},${v.targetTree.y}`);
        }
    });

    const sorted = candidates
        .map(t => ({
            tree: t,
            dist: Math.sqrt(Math.pow(t.x - villager.x, 2) + Math.pow(t.y - villager.y, 2)),
            targeted: targetedTrees.has(`${t.x},${t.y}`)
        }))
        .sort((a, b) => {
            if (a.targeted !== b.targeted) return a.targeted ? 1 : -1;
            return a.dist - b.dist;
        });

    return sorted.length > 0 ? sorted[0].tree : null;
}

// Find sheep to shear
export function findSheepToShear(villager, allVillagers) {
    const candidates = world.sheep.filter(s => s.hasWool);
    if (candidates.length === 0) return null;

    const targetedSheep = new Set();
    allVillagers.forEach(v => {
        if (v.id !== villager.id && v.targetSheep) {
            targetedSheep.add(v.targetSheep.id);
        }
    });

    const sorted = candidates
        .map(s => ({
            sheep: s,
            dist: Math.sqrt(Math.pow(s.x - villager.x, 2) + Math.pow(s.y - villager.y, 2)),
            targeted: targetedSheep.has(s.id)
        }))
        .sort((a, b) => {
            if (a.targeted !== b.targeted) return a.targeted ? 1 : -1;
            return a.dist - b.dist;
        });

    return sorted.length > 0 ? sorted[0].sheep : null;
}
