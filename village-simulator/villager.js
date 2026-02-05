import { CONFIG, LOCATIONS, getBedPosition, HOUSE_POSITIONS } from './config.js';
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
        treeState: null,
        lastFailureReason: null // Stores why the last action failed (for debugging)
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
        treeState: null,
        lastFailureReason: null
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
        treeState: null,
        lastFailureReason: null
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
        treeState: null,
        lastFailureReason: null
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
        treeState: null,
        lastFailureReason: null
    }
];

// Game state reference (will be set from game.js)
let gameStateRef = null;

export function setGameStateRef(gs) {
    gameStateRef = gs;
}

// Helper to check if villager is truly inside a building's interior (not just at door)
function isInsideBuilding(villager, location) {
    // Interior is 1 tile inside the walls on all sides
    // So interior x: from x+1 to x+w-2 (inclusive)
    // Interior y: from y+1 to y+h-2 (inclusive)
    return villager.x >= location.x + 1 &&
           villager.x <= location.x + location.w - 2 &&
           villager.y >= location.y + 1 &&
           villager.y <= location.y + location.h - 2;
}

// Helper to check if villager is near a location
function isNearLocation(villager, location, range = 1.5) {
    const centerX = location.x + location.w / 2;
    const centerY = location.y + location.h / 2;
    const dist = Math.sqrt(Math.pow(villager.x - centerX, 2) + Math.pow(villager.y - centerY, 2));
    return dist < range;
}

// Helper to fail an action with a clear reason (for debugging/UI)
function failWithReason(villager, reason) {
    villager.lastFailureReason = reason;
    return NodeStatus.FAILURE;
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

// Check if a tile is walkable
function isTileWalkable(tileX, tileY) {
    return !isBlockedByWall(tileX + 0.5, tileY + 0.5);
}

// Get walkable neighbors of a tile (4-directional only to avoid corner-cutting issues)
function getNeighbors(tileX, tileY) {
    const neighbors = [];
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
    ];

    for (const dir of directions) {
        const nx = tileX + dir.dx;
        const ny = tileY + dir.dy;
        if (isTileWalkable(nx, ny)) {
            neighbors.push({ x: nx, y: ny });
        }
    }
    return neighbors;
}

// A* pathfinding - returns array of tile centers [{x, y}, ...] from start to goal
function findPath(startX, startY, goalX, goalY) {
    const startTileX = Math.floor(startX);
    const startTileY = Math.floor(startY);
    const goalTileX = Math.floor(goalX);
    const goalTileY = Math.floor(goalY);

    // If start or goal is blocked, no path
    if (!isTileWalkable(startTileX, startTileY) || !isTileWalkable(goalTileX, goalTileY)) {
        return null;
    }

    // If already at goal tile, return just the goal
    if (startTileX === goalTileX && startTileY === goalTileY) {
        return [{ x: goalX, y: goalY }];
    }

    // A* implementation
    const openSet = new Map(); // key: "x,y", value: {x, y, g, f, parent}
    const closedSet = new Set(); // key: "x,y"

    const heuristic = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by); // Manhattan distance

    const startKey = `${startTileX},${startTileY}`;
    const startNode = {
        x: startTileX,
        y: startTileY,
        g: 0,
        f: heuristic(startTileX, startTileY, goalTileX, goalTileY),
        parent: null
    };
    openSet.set(startKey, startNode);

    while (openSet.size > 0) {
        // Find node with lowest f score
        let current = null;
        let currentKey = null;
        for (const [key, node] of openSet) {
            if (current === null || node.f < current.f) {
                current = node;
                currentKey = key;
            }
        }

        // Reached goal?
        if (current.x === goalTileX && current.y === goalTileY) {
            // Reconstruct path
            const path = [];
            let node = current;
            while (node !== null) {
                // Use tile center, except for last node use exact goal
                if (node.x === goalTileX && node.y === goalTileY) {
                    path.unshift({ x: goalX, y: goalY });
                } else {
                    path.unshift({ x: node.x + 0.5, y: node.y + 0.5 });
                }
                node = node.parent;
            }
            return path;
        }

        // Move current from open to closed
        openSet.delete(currentKey);
        closedSet.add(currentKey);

        // Check neighbors
        for (const neighbor of getNeighbors(current.x, current.y)) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;

            if (closedSet.has(neighborKey)) continue;

            const g = current.g + 1; // Cost is 1 per tile

            const existing = openSet.get(neighborKey);
            if (existing && g >= existing.g) continue; // Not a better path

            const f = g + heuristic(neighbor.x, neighbor.y, goalTileX, goalTileY);
            openSet.set(neighborKey, {
                x: neighbor.x,
                y: neighbor.y,
                g: g,
                f: f,
                parent: current
            });
        }

        // Safety: limit iterations to prevent infinite loops
        if (closedSet.size > 1000) {
            return null; // No path found within reasonable search
        }
    }

    return null; // No path found
}

// Create a movement action using A* pathfinding
// Villagers compute a path once and follow it, recomputing if target changes
function createGoToAction(targetGetter) {
    return (villager) => {
        const target = targetGetter(villager);
        if (!target) {
            villager.targetField = null;
            villager.targetTree = null;
            villager.targetSheep = null;
            villager.currentPath = null;
            return NodeStatus.FAILURE;
        }

        // Check if we've reached the target
        const dx = target.x - villager.x;
        const dy = target.y - villager.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.3) {
            villager.state = 'idle';
            villager.currentPath = null;
            return NodeStatus.SUCCESS;
        }

        // Compute path if we don't have one, or if target changed significantly
        const needNewPath = !villager.currentPath ||
            villager.currentPath.length === 0 ||
            !villager.pathTarget ||
            Math.abs(villager.pathTarget.x - target.x) > 0.5 ||
            Math.abs(villager.pathTarget.y - target.y) > 0.5;

        if (needNewPath) {
            const path = findPath(villager.x, villager.y, target.x, target.y);
            if (!path || path.length === 0) {
                // No path found - fail
                villager.currentPath = null;
                return failWithReason(villager, 'No path to target');
            }
            villager.currentPath = path;
            villager.pathTarget = { x: target.x, y: target.y };
            villager.pathIndex = 0;
        }

        // Get current waypoint
        while (villager.pathIndex < villager.currentPath.length) {
            const waypoint = villager.currentPath[villager.pathIndex];
            const wpDx = waypoint.x - villager.x;
            const wpDy = waypoint.y - villager.y;
            const wpDist = Math.sqrt(wpDx * wpDx + wpDy * wpDy);

            if (wpDist < 0.2) {
                // Reached this waypoint, move to next
                villager.pathIndex++;
                continue;
            }

            // Move toward waypoint
            let speed = 0.08;
            if (villager.hunger < 20 || villager.warmth < 20) {
                speed = 0.04;
            }

            const moveSpeed = Math.min(speed, wpDist);
            villager.x += (wpDx / wpDist) * moveSpeed;
            villager.y += (wpDy / wpDist) * moveSpeed;
            villager.state = 'walking';
            villager.energy -= CONFIG.ENERGY_DRAIN * 0.5;

            return NodeStatus.RUNNING;
        }

        // Path complete but not at target - recompute
        villager.currentPath = null;
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
        // Add +0.5 to convert tile coords to tile center
        const bed = getBedPosition(villager.id);
        return { x: bed.x + 0.5, y: bed.y + 0.5 };
    }),

    goToFireplace: createGoToAction(() => ({
        x: HOUSE_POSITIONS.fireplace.x + 0.5,
        y: HOUSE_POSITIONS.fireplace.y + 0.5
    })),

    goToStove: createGoToAction(() => ({
        x: HOUSE_POSITIONS.stove.x + 0.5,
        y: HOUSE_POSITIONS.stove.y + 0.5
    })),

    goToKnittingStation: createGoToAction(() => ({
        x: HOUSE_POSITIONS.knittingStation.x + 0.5,
        y: HOUSE_POSITIONS.knittingStation.y + 0.5
    })),

    goToStorage: createGoToAction(() => {
        // Target center interior tile - use tile center (tileX + 0.5, tileY + 0.5)
        const interiorTileX = LOCATIONS.storage.x + Math.floor(LOCATIONS.storage.w / 2);
        const interiorTileY = LOCATIONS.storage.y + Math.floor(LOCATIONS.storage.h / 2);
        return { x: interiorTileX + 0.5, y: interiorTileY + 0.5 };
    }),

    goToWell: createGoToAction(() => {
        // Well has no walls, target center tile + 0.5
        const tileX = LOCATIONS.well.x + Math.floor(LOCATIONS.well.w / 2);
        const tileY = LOCATIONS.well.y + LOCATIONS.well.h; // Just below well
        return { x: tileX + 0.5, y: tileY + 0.5 };
    }),

    goToMill: createGoToAction(() => {
        // Target center interior tile - use tile center (tileX + 0.5, tileY + 0.5)
        const interiorTileX = LOCATIONS.mill.x + Math.floor(LOCATIONS.mill.w / 2);
        const interiorTileY = LOCATIONS.mill.y + Math.floor(LOCATIONS.mill.h / 2);
        return { x: interiorTileX + 0.5, y: interiorTileY + 0.5 };
    }),

    goToForest: createGoToAction((villager) => {
        const tree = findTreeToChop(villager, villagers);
        if (tree) {
            villager.targetTree = tree;
            return { x: tree.x, y: tree.y }; // Trees already use tile centers
        }
        // Default: center of first forest tile
        return { x: LOCATIONS.forest.x + 0.5, y: LOCATIONS.forest.y + 0.5 };
    }),

    goToPasture: createGoToAction((villager) => {
        const sheep = findSheepToShear(villager, villagers);
        if (sheep) {
            villager.targetSheep = sheep;
            return { x: sheep.x, y: sheep.y }; // Sheep already use tile centers
        }
        // Go to center of tile just inside gate
        const gateTileX = LOCATIONS.pasture.gateX;
        const gateTileY = LOCATIONS.pasture.gateY - 1; // One tile inside
        return { x: gateTileX + 0.5, y: gateTileY + 0.5 };
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
        if (!isNearLocation(villager, LOCATIONS.well, 2)) {
            return failWithReason(villager, 'getWater: must be near the well');
        }

        villager.state = 'gettingWater';
        villager.hasWater = true;
        return NodeStatus.SUCCESS;
    },

    extinguishFire: (villager) => {
        if (!villager.hasWater) {
            return failWithReason(villager, 'extinguishFire: must have water (use getWater at well first)');
        }
        if (!world.fireOutbreak) return NodeStatus.SUCCESS;

        const fire = world.fireOutbreak;
        const dist = Math.sqrt(Math.pow(fire.x - villager.x, 2) + Math.pow(fire.y - villager.y, 2));
        if (dist > 2) {
            return failWithReason(villager, 'extinguishFire: must be near the fire');
        }

        villager.state = 'firefighting';
        villager.hasWater = false;

        if (extinguishFire(10)) {
            return NodeStatus.SUCCESS;
        }
        return NodeStatus.RUNNING;
    },

    plantCrops: (villager) => {
        // Can't plant in winter
        if (gameStateRef.season === 'winter') {
            return failWithReason(villager, 'plantCrops: cannot plant during winter');
        }

        const nearbyField = world.fields.find(f =>
            f.state === 'empty' &&
            Math.abs(f.x - villager.x) < 2 &&
            Math.abs(f.y - villager.y) < 2
        );

        if (!nearbyField) {
            villager.targetField = null;
            return failWithReason(villager, 'plantCrops: must be near an empty field (use goToField first)');
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
            return failWithReason(villager, 'harvestCrops: must be near a ready field (use goToField first)');
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
            return failWithReason(villager, 'waterCrops: must be near an unwatered planted/growing field (use goToFieldForWatering first)');
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
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'storeItems: must be inside storage building (use goToStorage first)');
        }
        if (villager.inventory <= 0) {
            return failWithReason(villager, 'storeItems: must have items in inventory');
        }

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
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'pickupWheat: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedWheat < CONFIG.WHEAT_PER_FLOUR) {
            return failWithReason(villager, `pickupWheat: storage needs at least ${CONFIG.WHEAT_PER_FLOUR} wheat`);
        }
        if (villager.inventory > 0) {
            return failWithReason(villager, 'pickupWheat: inventory must be empty first');
        }

        gameStateRef.storedWheat -= CONFIG.WHEAT_PER_FLOUR;
        villager.inventory = CONFIG.WHEAT_PER_FLOUR;
        villager.inventoryType = 'wheat';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupFlour: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'pickupFlour: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedFlour < CONFIG.FLOUR_PER_BREAD) {
            return failWithReason(villager, `pickupFlour: storage needs at least ${CONFIG.FLOUR_PER_BREAD} flour`);
        }
        if (villager.inventory > 0) {
            return failWithReason(villager, 'pickupFlour: inventory must be empty first');
        }

        gameStateRef.storedFlour -= CONFIG.FLOUR_PER_BREAD;
        villager.inventory = CONFIG.FLOUR_PER_BREAD;
        villager.inventoryType = 'flour';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupWood: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'pickupWood: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedWood < 1) {
            return failWithReason(villager, 'pickupWood: no wood in storage');
        }
        if (villager.inventory > 0) {
            return failWithReason(villager, 'pickupWood: inventory must be empty first');
        }

        gameStateRef.storedWood--;
        villager.inventory = 1;
        villager.inventoryType = 'wood';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupWool: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'pickupWool: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedWool < CONFIG.WOOL_PER_SWEATER) {
            return failWithReason(villager, `pickupWool: storage needs at least ${CONFIG.WOOL_PER_SWEATER} wool`);
        }
        if (villager.inventory > 0) {
            return failWithReason(villager, 'pickupWool: inventory must be empty first');
        }

        gameStateRef.storedWool -= CONFIG.WOOL_PER_SWEATER;
        villager.inventory = CONFIG.WOOL_PER_SWEATER;
        villager.inventoryType = 'wool';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    pickupFish: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'pickupFish: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedFish < 1) {
            return failWithReason(villager, 'pickupFish: no fish in storage');
        }
        if (villager.inventory > 0) {
            return failWithReason(villager, 'pickupFish: inventory must be empty first');
        }

        gameStateRef.storedFish--;
        villager.inventory = 1;
        villager.inventoryType = 'fish';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    // Processing actions
    grindWheat: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.mill)) {
            return failWithReason(villager, 'grindWheat: must be inside the mill (use goToMill first)');
        }
        if (villager.inventoryType !== 'wheat') {
            return failWithReason(villager, 'grindWheat: must be carrying wheat (use pickupWheat first)');
        }
        if (villager.inventory < CONFIG.WHEAT_PER_FLOUR) {
            return failWithReason(villager, `grindWheat: need at least ${CONFIG.WHEAT_PER_FLOUR} wheat`);
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
        if (!isInsideBuilding(villager, LOCATIONS.house)) {
            return failWithReason(villager, 'bakeBread: must be inside the house (use goToStove first)');
        }
        if (!gameStateRef.fireplaceLit) {
            return failWithReason(villager, 'bakeBread: fireplace must be lit (use addWoodToFire first)');
        }
        if (villager.inventoryType !== 'flour') {
            return failWithReason(villager, 'bakeBread: must be carrying flour (use pickupFlour first)');
        }
        if (villager.inventory < CONFIG.FLOUR_PER_BREAD) {
            return failWithReason(villager, `bakeBread: need at least ${CONFIG.FLOUR_PER_BREAD} flour`);
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
            return failWithReason(villager, 'chopTree: must be near a grown tree (use goToForest first)');
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
            return failWithReason(villager, 'shearSheep: must be near a sheep with wool (use goToPasture first)');
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
        if (!isInsideBuilding(villager, LOCATIONS.house)) {
            return failWithReason(villager, 'knitSweater: must be inside the house (use goToKnittingStation first)');
        }
        if (villager.inventoryType !== 'wool') {
            return failWithReason(villager, 'knitSweater: must be carrying wool (use pickupWool first)');
        }
        if (villager.inventory < CONFIG.WOOL_PER_SWEATER) {
            return failWithReason(villager, `knitSweater: need at least ${CONFIG.WOOL_PER_SWEATER} wool`);
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
        if (!isNearLocation(villager, LOCATIONS.pond, 2)) {
            return failWithReason(villager, 'catchFish: must be near the pond (use goToPond first)');
        }

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
        if (!isInsideBuilding(villager, LOCATIONS.house)) {
            return failWithReason(villager, 'cookFish: must be inside the house (use goToFireplace first)');
        }
        if (!gameStateRef.fireplaceLit) {
            return failWithReason(villager, 'cookFish: fireplace must be lit (use addWoodToFire first)');
        }
        if (villager.inventoryType !== 'fish') {
            return failWithReason(villager, 'cookFish: must be carrying fish (use pickupFish first)');
        }
        if (villager.inventory < 1) {
            return failWithReason(villager, 'cookFish: need at least 1 fish');
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
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'eatBread: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedBread <= 0) {
            return failWithReason(villager, 'eatBread: no bread in storage');
        }

        gameStateRef.storedBread--;
        villager.hunger = Math.min(100, villager.hunger + CONFIG.HUNGER_RESTORE);
        villager.state = 'eating';

        return NodeStatus.SUCCESS;
    },

    eatCookedFish: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'eatCookedFish: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedCookedFish <= 0) {
            return failWithReason(villager, 'eatCookedFish: no cooked fish in storage');
        }

        gameStateRef.storedCookedFish--;
        villager.hunger = Math.min(100, villager.hunger + CONFIG.FISH_HUNGER_RESTORE);
        villager.state = 'eating';

        return NodeStatus.SUCCESS;
    },

    // Warmth actions
    putOnSweater: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) {
            return failWithReason(villager, 'putOnSweater: must be inside storage building (use goToStorage first)');
        }
        if (gameStateRef.storedSweaters <= 0) {
            return failWithReason(villager, 'putOnSweater: no sweaters in storage');
        }
        if (villager.wearingSweater) {
            return failWithReason(villager, 'putOnSweater: already wearing a sweater');
        }

        gameStateRef.storedSweaters--;
        villager.wearingSweater = true;
        villager.state = 'dressing';

        return NodeStatus.SUCCESS;
    },

    takeOffSweater: (villager) => {
        if (!villager.wearingSweater) {
            return failWithReason(villager, 'takeOffSweater: not wearing a sweater');
        }

        villager.wearingSweater = false;
        gameStateRef.storedSweaters++;
        villager.state = 'dressing';

        return NodeStatus.SUCCESS;
    },

    addWoodToFire: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) {
            return failWithReason(villager, 'addWoodToFire: must be inside the house (use goToFireplace first)');
        }
        if (villager.inventoryType !== 'wood') {
            return failWithReason(villager, 'addWoodToFire: must be carrying wood (use pickupWood first)');
        }
        if (villager.inventory < 1) {
            return failWithReason(villager, 'addWoodToFire: need at least 1 wood');
        }

        gameStateRef.fireplaceWood += villager.inventory;
        gameStateRef.fireplaceLit = true;
        villager.inventory = 0;
        villager.inventoryType = null;
        villager.state = 'stoking';

        return NodeStatus.SUCCESS;
    },

    warmByFire: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) {
            return failWithReason(villager, 'warmByFire: must be inside the house (use goToFireplace first)');
        }
        if (!gameStateRef.fireplaceLit) {
            return failWithReason(villager, 'warmByFire: fireplace must be lit (use addWoodToFire first)');
        }

        villager.state = 'warming';
        // Warmth will naturally increase due to location-based system

        if (villager.warmth >= 80) {
            return NodeStatus.SUCCESS;
        }
        return NodeStatus.RUNNING;
    },

    sleep: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.house)) {
            return failWithReason(villager, 'sleep: must be inside the house (use goToHouse first)');
        }

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
        // EMERGENCY: Fight fire!
        new SequenceNode([
            new ConditionNode('fireOutbreak', '🔥 Fire Outbreak?', CONDITIONS.fireOutbreak),
            new ActionNode('goToWell', '💧 Go to Well', ACTIONS.goToWell),
            new ActionNode('getWater', '💧 Get Water', ACTIONS.getWater),
            new ActionNode('goToFire', '🔥 Go to Fire', ACTIONS.goToFire),
            new ActionNode('extinguishFire', '💧 Extinguish', ACTIONS.extinguishFire)
        ])
        // TODO: Add more behaviors here!
        // Students can add sequences for:
        // - Sleeping at night (CONDITIONS.isNight, ACTIONS.goToHouse, ACTIONS.sleep)
        // - Eating when hungry (CONDITIONS.isHungry, ACTIONS.goToStorage, ACTIONS.eatBread)
        // - Farming (CONDITIONS.cropsReady, ACTIONS.goToField, ACTIONS.harvestCrops)
        // - And more! Check CONDITIONS and ACTIONS objects for available options.
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
