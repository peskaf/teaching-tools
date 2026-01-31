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
    storage: { x: 0, y: 0, crops: 0 }
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
        world.terrain[y][9] = TERRAIN_TYPES.PATH;
        world.terrain[y][15] = TERRAIN_TYPES.PATH;
    }

    // Add pond terrain
    for (let dy = 0; dy < LOCATIONS.pond.h; dy++) {
        for (let dx = 0; dx < LOCATIONS.pond.w; dx++) {
            world.terrain[LOCATIONS.pond.y + dy][LOCATIONS.pond.x + dx] = TERRAIN_TYPES.POND;
        }
    }

    // Add forest terrain
    for (let dy = 0; dy < LOCATIONS.forest.h; dy++) {
        for (let dx = 0; dx < LOCATIONS.forest.w; dx++) {
            world.terrain[LOCATIONS.forest.y + dy][LOCATIONS.forest.x + dx] = TERRAIN_TYPES.FOREST;
        }
    }

    // Add buildings (house now includes fireplace/kitchen)
    world.buildings = [
        { ...LOCATIONS.house, type: 'house', name: 'House' },
        { ...LOCATIONS.storage, type: 'storage', name: 'Storage' },
        { ...LOCATIONS.well, type: 'well', name: 'Well' },
        { ...LOCATIONS.mill, type: 'mill', name: 'Mill' }
    ];

    // Initialize fields with crops
    world.fields = [];
    const fieldDefs = [LOCATIONS.field1, LOCATIONS.field2, LOCATIONS.field3];
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

    // Initialize sheep in pasture area
    world.sheep = [
        {
            id: 0,
            x: LOCATIONS.pasture.x + 0.5,
            y: LOCATIONS.pasture.y + 0.5,
            hasWool: true,
            woolTimer: 0
        },
        {
            id: 1,
            x: LOCATIONS.pasture.x + 1.5,
            y: LOCATIONS.pasture.y + 1.5,
            hasWool: true,
            woolTimer: 0
        }
    ];

    // Storage location
    world.storage = { x: LOCATIONS.storage.x + 1, y: LOCATIONS.storage.y + 2, crops: 0 };
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

// Update trees (regrowth)
export function updateTrees() {
    world.trees.forEach(tree => {
        if (tree.state === 'growing') {
            tree.regrowTimer--;
            if (tree.regrowTimer <= 0) {
                tree.state = 'grown';
            }
        }
    });

    // Update sheep wool regrowth
    world.sheep.forEach(sheep => {
        if (!sheep.hasWool) {
            sheep.woolTimer--;
            if (sheep.woolTimer <= 0) {
                sheep.hasWool = true;
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
    world.sheep.forEach(s => {
        s.hasWool = true;
        s.woolTimer = 0;
    });
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
