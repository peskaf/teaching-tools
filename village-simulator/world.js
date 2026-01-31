import { CONFIG, TERRAIN_TYPES, LOCATIONS } from './config.js';

// World state
export const world = {
    width: 24,
    height: 18,
    terrain: [],
    buildings: [],
    fields: [],
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
    for (let y = 4; y < 15; y++) {
        world.terrain[y][8] = TERRAIN_TYPES.PATH;
        world.terrain[y][15] = TERRAIN_TYPES.PATH;
    }

    // Add buildings
    world.buildings = [
        { ...LOCATIONS.house, type: 'house', name: 'House' },
        { ...LOCATIONS.storage, type: 'storage', name: 'Storage' },
        { ...LOCATIONS.well, type: 'well', name: 'Well' }
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
                    waterTimer: 0, // How long until water runs out
                    isWatered: false,
                    fieldIndex: fi
                });
            }
        }
    });

    // Storage location
    world.storage = { x: LOCATIONS.storage.x + 1, y: LOCATIONS.storage.y + 2, crops: 0 };
}

// Update crops growth (called each tick)
export function updateCrops() {
    world.fields.forEach(field => {
        // Handle watering timer
        if (field.waterTimer > 0) {
            field.waterTimer--;
            if (field.waterTimer <= 0) {
                field.isWatered = false;
            }
        }

        // Crops only grow when watered
        if (field.state === 'growing' && field.isWatered) {
            field.growthTimer--;
            if (field.growthTimer <= 0) {
                field.state = 'ready';
            }
        }
    });
}

// Reset fields to initial state
export function resetFields() {
    world.fields.forEach(f => {
        f.state = 'empty';
        f.growthTimer = 0;
        f.waterTimer = 0;
        f.isWatered = false;
    });
}

// Find fields that need attention for a specific villager
// Uses villager position to find nearest field, avoiding conflicts
export function findFieldNeedingAttention(villager, state, allVillagers) {
    // Filter fields by state
    const candidates = world.fields.filter(f => f.state === state);
    if (candidates.length === 0) return null;

    // Get fields that other villagers are currently targeting
    const targetedFields = new Set();
    allVillagers.forEach(v => {
        if (v.id !== villager.id && v.targetField) {
            targetedFields.add(`${v.targetField.x},${v.targetField.y}`);
        }
    });

    // Sort by distance to villager, preferring untargeted fields
    const sorted = candidates
        .map(f => ({
            field: f,
            dist: Math.sqrt(Math.pow(f.x - villager.x, 2) + Math.pow(f.y - villager.y, 2)),
            targeted: targetedFields.has(`${f.x},${f.y}`)
        }))
        .sort((a, b) => {
            // Prefer untargeted fields
            if (a.targeted !== b.targeted) return a.targeted ? 1 : -1;
            // Then sort by distance
            return a.dist - b.dist;
        });

    return sorted.length > 0 ? sorted[0].field : null;
}

// Find field needing water (planted but not watered, or growing but running out of water)
export function findFieldNeedingWater(villager, allVillagers) {
    // Filter fields that need watering
    const candidates = world.fields.filter(f =>
        (f.state === 'planted' || f.state === 'growing') && !f.isWatered
    );
    if (candidates.length === 0) return null;

    // Get fields that other villagers are currently targeting for watering
    const targetedFields = new Set();
    allVillagers.forEach(v => {
        if (v.id !== villager.id && v.targetField && v.currentAction === 'watering') {
            targetedFields.add(`${v.targetField.x},${v.targetField.y}`);
        }
    });

    // Sort by distance, preferring untargeted fields
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
