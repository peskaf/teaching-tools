import { CONFIG, LOCATIONS, DOOR_POSITIONS, getBedPosition, HOUSE_POSITIONS } from './config.js';
import { world, findFieldNeedingAttention, findFieldNeedingWater, findTreeToChop, findSheepToShear, isBlockedByWall, hasFireOutbreak, extinguishFire } from './world.js';
import {
    NodeStatus,
    SelectorNode,
    SequenceNode,
    ConditionNode,
    ActionNode,
    NODE_NAMES
} from './behavior-tree.js';

// Villager definitions - 5 villagers with suggested roles
export const villagers = [
    {
        id: 0,
        name: "Karel",
        emoji: "👨‍🌾",
        role: "farmer",
        color: "#e74c3c",
        x: 10,
        y: 9,
        targetX: null,
        targetY: null,
        targetField: null,
        targetTree: null,
        targetSheep: null,
        energy: 100,
        hunger: 100,
        warmth: 70,
        inventory: 0,
        inventoryType: null,
        wearingSweater: false,
        hasWater: false, // For firefighting
        state: "idle",
        currentAction: null,
        actionProgress: 0,
        behaviorTree: null,
        treeState: null
    },
    {
        id: 1,
        name: "Marie",
        emoji: "👩‍🌾",
        role: "miller",
        color: "#3498db",
        x: 11,
        y: 9,
        targetX: null,
        targetY: null,
        targetField: null,
        targetTree: null,
        targetSheep: null,
        energy: 100,
        hunger: 100,
        warmth: 70,
        inventory: 0,
        inventoryType: null,
        wearingSweater: false,
        hasWater: false,
        state: "idle",
        currentAction: null,
        actionProgress: 0,
        behaviorTree: null,
        treeState: null
    },
    {
        id: 2,
        name: "Tomáš",
        emoji: "🪓",
        role: "lumberjack",
        color: "#27ae60",
        x: 10,
        y: 10,
        targetX: null,
        targetY: null,
        targetField: null,
        targetTree: null,
        targetSheep: null,
        energy: 100,
        hunger: 100,
        warmth: 70,
        inventory: 0,
        inventoryType: null,
        wearingSweater: false,
        hasWater: false,
        state: "idle",
        currentAction: null,
        actionProgress: 0,
        behaviorTree: null,
        treeState: null
    },
    {
        id: 3,
        name: "Anna",
        emoji: "🐑",
        role: "shepherd",
        color: "#9b59b6",
        x: 11,
        y: 10,
        targetX: null,
        targetY: null,
        targetField: null,
        targetTree: null,
        targetSheep: null,
        energy: 100,
        hunger: 100,
        warmth: 70,
        inventory: 0,
        inventoryType: null,
        wearingSweater: false,
        hasWater: false,
        state: "idle",
        currentAction: null,
        actionProgress: 0,
        behaviorTree: null,
        treeState: null
    },
    {
        id: 4,
        name: "Petr",
        emoji: "🎣",
        role: "fisher",
        color: "#f39c12",
        x: 12,
        y: 9,
        targetX: null,
        targetY: null,
        targetField: null,
        targetTree: null,
        targetSheep: null,
        energy: 100,
        hunger: 100,
        warmth: 70,
        inventory: 0,
        inventoryType: null,
        wearingSweater: false,
        hasWater: false,
        state: "idle",
        currentAction: null,
        actionProgress: 0,
        behaviorTree: null,
        treeState: null
    }
];

// Game state reference (will be set from game.js)
let gameStateRef = null;

export function setGameStateRef(gs) {
    gameStateRef = gs;
}

// Helper to check if villager is inside a building (within the walls, not on them)
function isInsideBuilding(villager, location) {
    // Interior is 1 tile inside the walls on all sides
    // So interior x: from x+1 to x+w-2 (inclusive)
    // Interior y: from y+1 to y+h-2 (inclusive)
    return villager.x >= location.x + 1 &&
           villager.x <= location.x + location.w - 2 &&
           villager.y >= location.y + 1 &&
           villager.y <= location.y + location.h - 2;
}

// Check if a target is inside a specific building/fenced area
function targetIsInBuilding(target, location) {
    return target.x >= location.x + 1 &&
           target.x <= location.x + location.w - 2 &&
           target.y >= location.y + 1 &&
           target.y <= location.y + location.h - 2;
}

// Find which building/fenced area (if any) contains the target
function findBuildingForTarget(target) {
    const buildings = [
        { loc: LOCATIONS.house, door: DOOR_POSITIONS.house },
        { loc: LOCATIONS.storage, door: DOOR_POSITIONS.storage },
        { loc: LOCATIONS.mill, door: DOOR_POSITIONS.mill },
        { loc: LOCATIONS.pasture, door: DOOR_POSITIONS.pasture }
    ];

    for (const b of buildings) {
        if (targetIsInBuilding(target, b.loc)) {
            return b;
        }
    }
    return null;
}

// Helper to check if villager is near a location
function isNearLocation(villager, location, range = 1.5) {
    const centerX = location.x + location.w / 2;
    const centerY = location.y + location.h / 2;
    const dist = Math.sqrt(Math.pow(villager.x - centerX, 2) + Math.pow(villager.y - centerY, 2));
    return dist < range;
}

// Calculate target warmth based on location, season, and sweater
function getTargetWarmth(villager) {
    const season = gameStateRef?.season || 'summer';
    let targetWarmth = CONFIG.WARMTH_COMFORTABLE;

    // Season modifiers
    switch (season) {
        case 'winter': targetWarmth = 20; break;
        case 'autumn': targetWarmth = 50; break;
        case 'spring': targetWarmth = 60; break;
        case 'summer': targetWarmth = 80; break;
    }

    // Inside house with fire = warm
    if (isInsideBuilding(villager, LOCATIONS.house)) {
        if (gameStateRef?.fireplaceLit) {
            targetWarmth = 90;
        } else {
            targetWarmth = Math.max(targetWarmth, 50); // Inside is warmer than outside
        }
    }

    // Sweater bonus
    if (villager.wearingSweater) {
        targetWarmth = Math.min(100, targetWarmth + 25);
    }

    return targetWarmth;
}

// Condition factory functions
export const CONDITIONS = {
    isNight: (v) => {
        const time = gameStateRef.time;
        return time >= CONFIG.NIGHT_START || time < CONFIG.NIGHT_END;
    },
    isDay: (v) => {
        const time = gameStateRef.time;
        return time >= CONFIG.NIGHT_END && time < CONFIG.NIGHT_START;
    },
    isTired: (v) => v.energy < 30,
    isHungry: (v) => v.hunger < CONFIG.HUNGER_THRESHOLD,
    isCold: (v) => v.warmth < CONFIG.WARMTH_THRESHOLD,
    isWinter: (v) => gameStateRef.season === 'winter',
    hasItems: (v) => v.inventory > 0,
    hasWheat: (v) => v.inventory > 0 && v.inventoryType === 'wheat',
    hasFlour: (v) => v.inventory > 0 && v.inventoryType === 'flour',
    hasWood: (v) => v.inventory > 0 && v.inventoryType === 'wood',
    hasWool: (v) => v.inventory > 0 && v.inventoryType === 'wool',
    hasFish: (v) => v.inventory > 0 && v.inventoryType === 'fish',
    wearingSweater: (v) => v.wearingSweater,
    notWearingSweater: (v) => !v.wearingSweater,
    cropsReady: (v) => world.fields.some(f => f.state === 'ready'),
    fieldEmpty: (v) => world.fields.some(f => f.state === 'empty'),
    needsWater: (v) => world.fields.some(f =>
        (f.state === 'planted' || f.state === 'growing') && !f.isWatered
    ),
    treesAvailable: (v) => world.trees.some(t => t.state === 'grown'),
    sheepHasWool: (v) => world.sheep.some(s => s.hasWool),
    fireNotLit: (v) => !gameStateRef.fireplaceLit,
    fireLit: (v) => gameStateRef.fireplaceLit,
    // Fire outbreak conditions
    fireOutbreak: (v) => hasFireOutbreak(),
    hasWaterBucket: (v) => v.hasWater,
    // Storage checks
    storageHasWheat: (v) => gameStateRef.storedWheat >= CONFIG.WHEAT_PER_FLOUR,
    storageHasFlour: (v) => gameStateRef.storedFlour >= CONFIG.FLOUR_PER_BREAD,
    storageHasBread: (v) => gameStateRef.storedBread > 0,
    storageHasWood: (v) => gameStateRef.storedWood > 0,
    storageHasWool: (v) => gameStateRef.storedWool >= CONFIG.WOOL_PER_SWEATER,
    storageHasSweaters: (v) => gameStateRef.storedSweaters > 0,
    storageHasFish: (v) => gameStateRef.storedFish > 0,
    storageHasCookedFish: (v) => gameStateRef.storedCookedFish > 0
};

// Create a movement action to a target location with simple tile-based pathfinding
function createGoToAction(targetGetter) {
    return (villager) => {
        const finalTarget = targetGetter(villager);
        if (!finalTarget) {
            villager.targetField = null;
            villager.targetTree = null;
            villager.targetSheep = null;
            return NodeStatus.FAILURE;
        }

        // Determine actual target - if target is in a building and we're outside, go to door first
        let target = finalTarget;
        const building = findBuildingForTarget(finalTarget);
        if (building && !isInsideBuilding(villager, building.loc)) {
            // Check if villager is already at the door (close enough to pass through)
            const doorDx = building.door.x - villager.x;
            const doorDy = building.door.y - villager.y;
            const doorDist = Math.sqrt(doorDx * doorDx + doorDy * doorDy);

            if (doorDist >= 0.5) {
                // Target is inside a building, but we're outside and not at door - go to door first
                target = building.door;
            }
            // Otherwise, villager is at/near door, proceed directly to final target
        }

        const dx = target.x - villager.x;
        const dy = target.y - villager.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.3) {
            // If we reached intermediate target (door), continue to final target
            if (target !== finalTarget) {
                return NodeStatus.RUNNING;
            }
            villager.state = 'idle';
            return NodeStatus.SUCCESS;
        }

        // Slower if very hungry or cold
        let speed = 0.08;
        if (villager.hunger < 20 || villager.warmth < 20) {
            speed = 0.04;
        }

        // Calculate next position
        let nextX = villager.x + (dx / dist) * speed;
        let nextY = villager.y + (dy / dist) * speed;

        // Check for wall collision - try to navigate around
        if (isBlockedByWall(nextX, nextY)) {
            // Try moving only along X axis
            const testX = villager.x + (dx > 0 ? speed : (dx < 0 ? -speed : 0));
            if (testX !== villager.x && !isBlockedByWall(testX, villager.y)) {
                nextX = testX;
                nextY = villager.y;
            } else {
                // Try moving only along Y axis
                const testY = villager.y + (dy > 0 ? speed : (dy < 0 ? -speed : 0));
                if (testY !== villager.y && !isBlockedByWall(villager.x, testY)) {
                    nextX = villager.x;
                    nextY = testY;
                } else {
                    // Completely blocked - try perpendicular direction to get around obstacle
                    const perpDirs = [
                        { x: speed, y: 0 },
                        { x: -speed, y: 0 },
                        { x: 0, y: speed },
                        { x: 0, y: -speed }
                    ];
                    let moved = false;
                    for (const dir of perpDirs) {
                        if (!isBlockedByWall(villager.x + dir.x, villager.y + dir.y)) {
                            nextX = villager.x + dir.x;
                            nextY = villager.y + dir.y;
                            moved = true;
                            break;
                        }
                    }
                    if (!moved) {
                        // Completely stuck
                        return NodeStatus.RUNNING;
                    }
                }
            }
        }

        villager.x = nextX;
        villager.y = nextY;
        villager.state = 'walking';
        villager.energy -= CONFIG.ENERGY_DRAIN * 0.5;

        return NodeStatus.RUNNING;
    };
}

// Action factory functions
export const ACTIONS = {
    goToField: createGoToAction((villager) => {
        let field = findFieldNeedingAttention(villager, 'ready', villagers);
        if (!field) {
            field = findFieldNeedingAttention(villager, 'empty', villagers);
        }
        if (field) {
            villager.targetField = field;
            return { x: field.x + 0.5, y: field.y + 0.5 };
        }
        const anyField = world.fields[0];
        return anyField ? { x: anyField.x + 0.5, y: anyField.y + 0.5 } : null;
    }),

    goToFieldForWatering: createGoToAction((villager) => {
        const field = findFieldNeedingWater(villager, villagers);
        if (field) {
            villager.targetField = field;
            villager.currentAction = 'watering';
            return { x: field.x + 0.5, y: field.y + 0.5 };
        }
        return null;
    }),

    goToHouse: createGoToAction((villager) => {
        // Go to bed position (door is on the path, villager will walk through it)
        return getBedPosition(villager.id);
    }),

    goToFireplace: createGoToAction(() => HOUSE_POSITIONS.fireplace),

    goToStove: createGoToAction(() => HOUSE_POSITIONS.stove),

    goToKnittingStation: createGoToAction(() => HOUSE_POSITIONS.knittingStation),

    goToStorage: createGoToAction(() => ({
        x: LOCATIONS.storage.x + LOCATIONS.storage.w / 2,
        y: LOCATIONS.storage.y + LOCATIONS.storage.h / 2
    })),

    goToWell: createGoToAction(() => ({
        x: LOCATIONS.well.x + LOCATIONS.well.w / 2,
        y: LOCATIONS.well.y + LOCATIONS.well.h
    })),

    goToMill: createGoToAction(() => ({
        x: LOCATIONS.mill.x + LOCATIONS.mill.w / 2,
        y: LOCATIONS.mill.y + LOCATIONS.mill.h / 2
    })),

    goToForest: createGoToAction((villager) => {
        const tree = findTreeToChop(villager, villagers);
        if (tree) {
            villager.targetTree = tree;
            return { x: tree.x, y: tree.y };
        }
        return { x: LOCATIONS.forest.x + 1, y: LOCATIONS.forest.y + 1 };
    }),

    goToPasture: createGoToAction((villager) => {
        const sheep = findSheepToShear(villager, villagers);
        if (sheep) {
            villager.targetSheep = sheep;
            return { x: sheep.x, y: sheep.y };
        }
        // Go through gate
        return {
            x: LOCATIONS.pasture.x + 1.5,
            y: LOCATIONS.pasture.y + LOCATIONS.pasture.h
        };
    }),

    goToPond: createGoToAction(() => ({
        x: LOCATIONS.pond.x + LOCATIONS.pond.w / 2,
        y: LOCATIONS.pond.y + LOCATIONS.pond.h
    })),

    // Fire fighting actions
    goToFire: createGoToAction(() => {
        if (world.fireOutbreak) {
            return { x: world.fireOutbreak.x, y: world.fireOutbreak.y + 1 };
        }
        return null;
    }),

    getWater: (villager) => {
        if (!isNearLocation(villager, LOCATIONS.well, 2)) return NodeStatus.FAILURE;

        villager.state = 'gettingWater';
        villager.hasWater = true;
        return NodeStatus.SUCCESS;
    },

    extinguishFire: (villager) => {
        if (!villager.hasWater) return NodeStatus.FAILURE;
        if (!world.fireOutbreak) return NodeStatus.SUCCESS;

        const fire = world.fireOutbreak;
        const dist = Math.sqrt(Math.pow(fire.x - villager.x, 2) + Math.pow(fire.y - villager.y, 2));
        if (dist > 2) return NodeStatus.FAILURE;

        villager.state = 'firefighting';
        villager.hasWater = false;

        if (extinguishFire(10)) {
            return NodeStatus.SUCCESS;
        }
        return NodeStatus.RUNNING;
    },

    plantCrops: (villager) => {
        // Can't plant in winter
        if (gameStateRef.season === 'winter') return NodeStatus.FAILURE;

        const nearbyField = world.fields.find(f =>
            f.state === 'empty' &&
            Math.abs(f.x - villager.x) < 2 &&
            Math.abs(f.y - villager.y) < 2
        );

        if (!nearbyField) {
            villager.targetField = null;
            return NodeStatus.FAILURE;
        }

        nearbyField.state = 'planted';
        nearbyField.growthTimer = CONFIG.CROP_GROW_TIME;
        nearbyField.isWatered = false;
        villager.state = 'planting';
        villager.energy -= CONFIG.ENERGY_DRAIN * 10;
        villager.targetField = null;

        return NodeStatus.SUCCESS;
    },

    harvestCrops: (villager) => {
        const nearbyField = world.fields.find(f =>
            f.state === 'ready' &&
            Math.abs(f.x - villager.x) < 2 &&
            Math.abs(f.y - villager.y) < 2
        );

        if (!nearbyField) {
            villager.targetField = null;
            return NodeStatus.FAILURE;
        }

        nearbyField.state = 'empty';
        nearbyField.isWatered = false;
        nearbyField.waterTimer = 0;
        villager.inventory++;
        villager.inventoryType = 'wheat';
        gameStateRef.totalHarvested++;
        villager.state = 'harvesting';
        villager.energy -= CONFIG.ENERGY_DRAIN * 10;
        villager.targetField = null;

        return NodeStatus.SUCCESS;
    },

    waterCrops: (villager) => {
        const nearbyField = world.fields.find(f =>
            (f.state === 'planted' || f.state === 'growing') &&
            !f.isWatered &&
            Math.abs(f.x - villager.x) < 2 &&
            Math.abs(f.y - villager.y) < 2
        );

        if (!nearbyField) {
            villager.targetField = null;
            villager.currentAction = null;
            return NodeStatus.FAILURE;
        }

        nearbyField.isWatered = true;
        nearbyField.waterTimer = CONFIG.WATER_DURATION;

        if (nearbyField.state === 'planted') {
            nearbyField.state = 'growing';
        }

        villager.state = 'watering';
        villager.energy -= CONFIG.ENERGY_DRAIN * 5;
        villager.targetField = null;
        villager.currentAction = null;

        return NodeStatus.SUCCESS;
    },

    storeItems: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (villager.inventory <= 0) return NodeStatus.FAILURE;

        // Store based on inventory type
        switch (villager.inventoryType) {
            case 'wheat': gameStateRef.storedWheat += villager.inventory; break;
            case 'flour': gameStateRef.storedFlour += villager.inventory; break;
            case 'wood': gameStateRef.storedWood += villager.inventory; break;
            case 'wool': gameStateRef.storedWool += villager.inventory; break;
            case 'fish': gameStateRef.storedFish += villager.inventory; break;
        }

        villager.inventory = 0;
        villager.inventoryType = null;
        villager.state = 'storing';

        return NodeStatus.SUCCESS;
    },

    // Pick up items from storage
    pickupWheat: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedWheat < CONFIG.WHEAT_PER_FLOUR) return NodeStatus.FAILURE;
        if (villager.inventory > 0) return NodeStatus.FAILURE;

        gameStateRef.storedWheat -= CONFIG.WHEAT_PER_FLOUR;
        villager.inventory = CONFIG.WHEAT_PER_FLOUR;
        villager.inventoryType = 'wheat';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupFlour: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedFlour < CONFIG.FLOUR_PER_BREAD) return NodeStatus.FAILURE;
        if (villager.inventory > 0) return NodeStatus.FAILURE;

        gameStateRef.storedFlour -= CONFIG.FLOUR_PER_BREAD;
        villager.inventory = CONFIG.FLOUR_PER_BREAD;
        villager.inventoryType = 'flour';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupWood: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedWood < 1) return NodeStatus.FAILURE;
        if (villager.inventory > 0) return NodeStatus.FAILURE;

        gameStateRef.storedWood--;
        villager.inventory = 1;
        villager.inventoryType = 'wood';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupWool: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedWool < CONFIG.WOOL_PER_SWEATER) return NodeStatus.FAILURE;
        if (villager.inventory > 0) return NodeStatus.FAILURE;

        gameStateRef.storedWool -= CONFIG.WOOL_PER_SWEATER;
        villager.inventory = CONFIG.WOOL_PER_SWEATER;
        villager.inventoryType = 'wool';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupFish: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedFish < 1) return NodeStatus.FAILURE;
        if (villager.inventory > 0) return NodeStatus.FAILURE;

        gameStateRef.storedFish--;
        villager.inventory = 1;
        villager.inventoryType = 'fish';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    // Processing actions
    grindWheat: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.mill)) return NodeStatus.FAILURE;
        if (villager.inventoryType !== 'wheat' || villager.inventory < CONFIG.WHEAT_PER_FLOUR) {
            return NodeStatus.FAILURE;
        }

        villager.state = 'grinding';
        villager.actionProgress++;

        if (villager.actionProgress >= CONFIG.GRIND_TIME) {
            villager.inventory = 1;
            villager.inventoryType = 'flour';
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 15;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    bakeBread: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) return NodeStatus.FAILURE;
        if (!gameStateRef.fireplaceLit) return NodeStatus.FAILURE; // Need fire for stove
        if (villager.inventoryType !== 'flour' || villager.inventory < CONFIG.FLOUR_PER_BREAD) {
            return NodeStatus.FAILURE;
        }

        villager.state = 'baking';
        villager.actionProgress++;

        if (villager.actionProgress >= CONFIG.BAKE_TIME) {
            villager.inventory = 0;
            villager.inventoryType = null;
            gameStateRef.storedBread++;
            gameStateRef.totalBreadBaked++;
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 10;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    // Woodcutting actions
    chopTree: (villager) => {
        const nearbyTree = world.trees.find(t =>
            t.state === 'grown' &&
            Math.abs(t.x - villager.x) < 1.5 &&
            Math.abs(t.y - villager.y) < 1.5
        );

        if (!nearbyTree) {
            villager.targetTree = null;
            return NodeStatus.FAILURE;
        }

        villager.state = 'chopping';
        villager.actionProgress++;

        if (villager.actionProgress >= CONFIG.CHOP_TIME) {
            nearbyTree.state = 'growing';
            nearbyTree.regrowTimer = CONFIG.TREE_REGROW_TIME;
            villager.inventory = CONFIG.WOOD_PER_TREE;
            villager.inventoryType = 'wood';
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 20;
            villager.targetTree = null;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    // Sheep actions
    shearSheep: (villager) => {
        const nearbySheep = world.sheep.find(s =>
            s.hasWool &&
            Math.abs(s.x - villager.x) < 1.5 &&
            Math.abs(s.y - villager.y) < 1.5
        );

        if (!nearbySheep) {
            villager.targetSheep = null;
            return NodeStatus.FAILURE;
        }

        villager.state = 'shearing';
        villager.actionProgress++;

        if (villager.actionProgress >= CONFIG.SHEAR_TIME) {
            nearbySheep.hasWool = false;
            nearbySheep.woolTimer = CONFIG.WOOL_REGROW_TIME;
            villager.inventory = CONFIG.WOOL_PER_SHEEP;
            villager.inventoryType = 'wool';
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 10;
            villager.targetSheep = null;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    knitSweater: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) return NodeStatus.FAILURE;
        if (villager.inventoryType !== 'wool' || villager.inventory < CONFIG.WOOL_PER_SWEATER) {
            return NodeStatus.FAILURE;
        }

        villager.state = 'knitting';
        villager.actionProgress++;

        if (villager.actionProgress >= CONFIG.KNIT_TIME) {
            villager.inventory = 0;
            villager.inventoryType = null;
            gameStateRef.storedSweaters++;
            gameStateRef.totalSweatersKnit++;
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 10;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    // Fishing actions
    catchFish: (villager) => {
        if (!isNearLocation(villager, LOCATIONS.pond, 2)) return NodeStatus.FAILURE;

        villager.state = 'fishing';
        villager.actionProgress++;

        // Random success chance after minimum time
        if (villager.actionProgress >= CONFIG.FISH_TIME) {
            if (Math.random() < 0.3) { // 30% chance per tick after min time
                villager.inventory = 1;
                villager.inventoryType = 'fish';
                villager.actionProgress = 0;
                villager.energy -= CONFIG.ENERGY_DRAIN * 5;
                return NodeStatus.SUCCESS;
            }
        }

        // Fail if taking too long
        if (villager.actionProgress >= CONFIG.FISH_TIME * 3) {
            villager.actionProgress = 0;
            return NodeStatus.FAILURE;
        }

        return NodeStatus.RUNNING;
    },

    cookFish: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) return NodeStatus.FAILURE;
        if (!gameStateRef.fireplaceLit) return NodeStatus.FAILURE;
        if (villager.inventoryType !== 'fish' || villager.inventory < 1) {
            return NodeStatus.FAILURE;
        }

        villager.state = 'cooking';
        villager.actionProgress++;

        if (villager.actionProgress >= CONFIG.COOK_FISH_TIME) {
            villager.inventory = 0;
            villager.inventoryType = null;
            gameStateRef.storedCookedFish++;
            gameStateRef.totalFishCooked++;
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 5;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    // Eating actions
    eatBread: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedBread <= 0) return NodeStatus.FAILURE;

        gameStateRef.storedBread--;
        villager.hunger = Math.min(100, villager.hunger + CONFIG.HUNGER_RESTORE);
        villager.state = 'eating';

        return NodeStatus.SUCCESS;
    },

    eatCookedFish: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedCookedFish <= 0) return NodeStatus.FAILURE;

        gameStateRef.storedCookedFish--;
        villager.hunger = Math.min(100, villager.hunger + CONFIG.FISH_HUNGER_RESTORE);
        villager.state = 'eating';

        return NodeStatus.SUCCESS;
    },

    // Warmth actions
    putOnSweater: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedSweaters <= 0) return NodeStatus.FAILURE;
        if (villager.wearingSweater) return NodeStatus.FAILURE;

        gameStateRef.storedSweaters--;
        villager.wearingSweater = true;
        villager.state = 'dressing';

        return NodeStatus.SUCCESS;
    },

    takeOffSweater: (villager) => {
        if (!villager.wearingSweater) return NodeStatus.FAILURE;

        villager.wearingSweater = false;
        gameStateRef.storedSweaters++;
        villager.state = 'dressing';

        return NodeStatus.SUCCESS;
    },

    addWoodToFire: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) return NodeStatus.FAILURE;
        if (villager.inventoryType !== 'wood' || villager.inventory < 1) {
            return NodeStatus.FAILURE;
        }

        gameStateRef.fireplaceWood += villager.inventory;
        gameStateRef.fireplaceLit = true;
        villager.inventory = 0;
        villager.inventoryType = null;
        villager.state = 'stoking';

        return NodeStatus.SUCCESS;
    },

    warmByFire: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) return NodeStatus.FAILURE;
        if (!gameStateRef.fireplaceLit) return NodeStatus.FAILURE;

        villager.state = 'warming';
        // Warmth will naturally increase due to location-based system

        if (villager.warmth >= 80) {
            return NodeStatus.SUCCESS;
        }
        return NodeStatus.RUNNING;
    },

    sleep: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) return NodeStatus.FAILURE;

        villager.state = 'sleeping';
        villager.energy = Math.min(100, villager.energy + CONFIG.ENERGY_RESTORE);

        if (villager.energy >= 100) {
            return NodeStatus.SUCCESS;
        }
        return NodeStatus.RUNNING;
    },

    rest: (villager) => {
        villager.state = 'resting';
        villager.energy = Math.min(100, villager.energy + CONFIG.ENERGY_RESTORE * 0.3);
        return NodeStatus.SUCCESS;
    }
};

// Create a node from type and subtype
export function createNode(type, subtype) {
    switch (type) {
        case 'selector':
            return new SelectorNode();
        case 'sequence':
            return new SequenceNode();
        case 'condition':
            return new ConditionNode(subtype, NODE_NAMES[subtype], CONDITIONS[subtype]);
        case 'action':
            return new ActionNode(subtype, NODE_NAMES[subtype], ACTIONS[subtype]);
    }
}

// Create a simple default tree (students should customize per villager)
export function createDefaultTree() {
    return new SelectorNode([
        // 0. EMERGENCY: Fight fire!
        new SequenceNode([
            new ConditionNode('fireOutbreak', '🔥 Fire Outbreak?', CONDITIONS.fireOutbreak),
            new ActionNode('goToWell', '💧 Go to Well', ACTIONS.goToWell),
            new ActionNode('getWater', '💧 Get Water', ACTIONS.getWater),
            new ActionNode('goToFire', '🔥 Go to Fire', ACTIONS.goToFire),
            new ActionNode('extinguishFire', '💧 Extinguish', ACTIONS.extinguishFire)
        ]),
        // 1. Sleep at night
        new SequenceNode([
            new ConditionNode('isNight', '🌙 Is Night?', CONDITIONS.isNight),
            new ActionNode('goToHouse', '🏠 Go to House', ACTIONS.goToHouse),
            new ActionNode('sleep', '😴 Sleep', ACTIONS.sleep)
        ]),
        // 2. Warm up if cold
        new SequenceNode([
            new ConditionNode('isCold', '🥶 Is Cold?', CONDITIONS.isCold),
            new ConditionNode('fireLit', '🔥 Fire Lit?', CONDITIONS.fireLit),
            new ActionNode('goToFireplace', '🏠 Go to Fire', ACTIONS.goToFireplace),
            new ActionNode('warmByFire', '🔥 Warm Up', ACTIONS.warmByFire)
        ]),
        // 3. Eat if hungry
        new SequenceNode([
            new ConditionNode('isHungry', '🍽️ Is Hungry?', CONDITIONS.isHungry),
            new ConditionNode('storageHasBread', '🍞 Has Bread?', CONDITIONS.storageHasBread),
            new ActionNode('goToStorage', '📦 Go to Storage', ACTIONS.goToStorage),
            new ActionNode('eatBread', '🍞 Eat Bread', ACTIONS.eatBread)
        ]),
        // 4. Rest if tired
        new SequenceNode([
            new ConditionNode('isTired', '😴 Is Tired?', CONDITIONS.isTired),
            new ActionNode('rest', '☕ Rest', ACTIONS.rest)
        ]),
        // 5. Store items if carrying
        new SequenceNode([
            new ConditionNode('hasItems', '🎒 Has Items?', CONDITIONS.hasItems),
            new ActionNode('goToStorage', '📦 Go to Storage', ACTIONS.goToStorage),
            new ActionNode('storeItems', '📥 Store Items', ACTIONS.storeItems)
        ]),
        // 6. Basic farming loop
        new SequenceNode([
            new ConditionNode('cropsReady', '🌾 Crops Ready?', CONDITIONS.cropsReady),
            new ActionNode('goToField', '🚶 Go to Field', ACTIONS.goToField),
            new ActionNode('harvestCrops', '🌾 Harvest', ACTIONS.harvestCrops)
        ]),
        new SequenceNode([
            new ConditionNode('needsWater', '💧 Needs Water?', CONDITIONS.needsWater),
            new ActionNode('goToWell', '💧 Go to Well', ACTIONS.goToWell),
            new ActionNode('goToFieldForWatering', '🚶 Go to Field', ACTIONS.goToFieldForWatering),
            new ActionNode('waterCrops', '💧 Water Crops', ACTIONS.waterCrops)
        ]),
        new SequenceNode([
            new ConditionNode('fieldEmpty', '🟫 Field Empty?', CONDITIONS.fieldEmpty),
            new ActionNode('goToField', '🚶 Go to Field', ACTIONS.goToField),
            new ActionNode('plantCrops', '🌱 Plant Crops', ACTIONS.plantCrops)
        ])
    ]);
}

// Reset all villagers to initial state
export function resetVillagers() {
    const startPositions = [
        { x: 10, y: 9 },
        { x: 11, y: 9 },
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 12, y: 9 }
    ];

    villagers.forEach((v, i) => {
        v.x = startPositions[i].x;
        v.y = startPositions[i].y;
        v.energy = 100;
        v.hunger = 100;
        v.warmth = 70;
        v.inventory = 0;
        v.inventoryType = null;
        v.wearingSweater = false;
        v.hasWater = false;
        v.state = 'idle';
        v.targetField = null;
        v.targetTree = null;
        v.targetSheep = null;
        v.currentAction = null;
        v.actionProgress = 0;
        if (v.behaviorTree) v.behaviorTree.reset();
    });
}

// Update all villagers (called each tick)
export function updateVillagers() {
    villagers.forEach(villager => {
        if (villager.behaviorTree) {
            villager.behaviorTree.tick(villager);
        }

        // Natural energy drain
        if (villager.state !== 'sleeping' && villager.state !== 'resting') {
            villager.energy = Math.max(0, villager.energy - CONFIG.ENERGY_DRAIN * 0.1);
        }

        // Natural hunger drain
        villager.hunger = Math.max(0, villager.hunger - CONFIG.HUNGER_DRAIN);

        // Location-based warmth system
        const targetWarmth = getTargetWarmth(villager);
        const warmthDiff = targetWarmth - villager.warmth;
        villager.warmth += warmthDiff * CONFIG.WARMTH_CHANGE_RATE * 0.1;
        villager.warmth = Math.max(0, Math.min(100, villager.warmth));
    });
}
