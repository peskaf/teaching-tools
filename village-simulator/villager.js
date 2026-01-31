import { CONFIG, LOCATIONS } from './config.js';
import { world, findFieldNeedingAttention, findFieldNeedingWater } from './world.js';
import {
    NodeStatus,
    SelectorNode,
    SequenceNode,
    ConditionNode,
    ActionNode,
    NODE_NAMES
} from './behavior-tree.js';

// Villager definitions
export const villagers = [
    {
        id: 0,
        name: "Karel",
        emoji: "👨‍🌾",
        color: "#e74c3c",
        x: 10,
        y: 8,
        targetX: null,
        targetY: null,
        targetField: null, // Track which field the villager is targeting
        energy: 100,
        inventory: 0,
        state: "idle",
        currentAction: null,
        behaviorTree: null,
        treeState: null
    },
    {
        id: 1,
        name: "Marie",
        emoji: "👩‍🌾",
        color: "#3498db",
        x: 12,
        y: 8,
        targetX: null,
        targetY: null,
        targetField: null,
        energy: 100,
        inventory: 0,
        state: "idle",
        currentAction: null,
        behaviorTree: null,
        treeState: null
    },
    {
        id: 2,
        name: "Tomáš",
        emoji: "👦",
        color: "#27ae60",
        x: 11,
        y: 9,
        targetX: null,
        targetY: null,
        targetField: null,
        energy: 100,
        inventory: 0,
        state: "idle",
        currentAction: null,
        behaviorTree: null,
        treeState: null
    }
];

// Game state reference (will be set from game.js)
let gameStateRef = null;

export function setGameStateRef(gs) {
    gameStateRef = gs;
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
    hasItems: (v) => v.inventory > 0,
    cropsReady: (v) => world.fields.some(f => f.state === 'ready'),
    fieldEmpty: (v) => world.fields.some(f => f.state === 'empty'),
    needsWater: (v) => world.fields.some(f =>
        (f.state === 'planted' || f.state === 'growing') && !f.isWatered
    )
};

// Create a movement action to a target location
function createGoToAction(targetGetter) {
    return (villager) => {
        const target = targetGetter(villager);
        if (!target) {
            villager.targetField = null;
            return NodeStatus.FAILURE;
        }

        const dx = target.x - villager.x;
        const dy = target.y - villager.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.5) {
            villager.state = 'idle';
            return NodeStatus.SUCCESS;
        }

        const speed = 0.08;
        villager.x += (dx / dist) * speed;
        villager.y += (dy / dist) * speed;
        villager.state = 'walking';
        villager.energy -= CONFIG.ENERGY_DRAIN * 0.5;

        return NodeStatus.RUNNING;
    };
}

// Action factory functions
export const ACTIONS = {
    goToField: createGoToAction((villager) => {
        // Find nearest field that needs attention (empty or ready) and not targeted by others
        let field = findFieldNeedingAttention(villager, 'ready', villagers);
        if (!field) {
            field = findFieldNeedingAttention(villager, 'empty', villagers);
        }
        if (field) {
            villager.targetField = field;
            return { x: field.x + 0.5, y: field.y + 0.5 };
        }
        // Fallback: go to any field
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

    goToHouse: createGoToAction(() => ({
        x: LOCATIONS.house.x + LOCATIONS.house.w / 2,
        y: LOCATIONS.house.y + LOCATIONS.house.h
    })),

    goToStorage: createGoToAction(() => ({
        x: LOCATIONS.storage.x + LOCATIONS.storage.w / 2,
        y: LOCATIONS.storage.y + LOCATIONS.storage.h
    })),

    goToWell: createGoToAction(() => ({
        x: LOCATIONS.well.x + LOCATIONS.well.w / 2,
        y: LOCATIONS.well.y + LOCATIONS.well.h
    })),

    plantCrops: (villager) => {
        const nearbyField = world.fields.find(f =>
            f.state === 'empty' &&
            Math.abs(f.x - villager.x) < 2 &&
            Math.abs(f.y - villager.y) < 2
        );

        if (!nearbyField) {
            villager.targetField = null;
            return NodeStatus.FAILURE;
        }

        // Change to planted state (needs watering to grow)
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
        gameStateRef.totalHarvested++;
        villager.state = 'harvesting';
        villager.energy -= CONFIG.ENERGY_DRAIN * 10;
        villager.targetField = null;

        return NodeStatus.SUCCESS;
    },

    waterCrops: (villager) => {
        // Find nearby field that needs water
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

        // Water the field - this starts/continues growth
        nearbyField.isWatered = true;
        nearbyField.waterTimer = CONFIG.WATER_DURATION;

        // If just planted, change to growing
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
        const dist = Math.sqrt(
            Math.pow(villager.x - world.storage.x, 2) +
            Math.pow(villager.y - world.storage.y, 2)
        );

        if (dist > 3) return NodeStatus.FAILURE;
        if (villager.inventory <= 0) return NodeStatus.FAILURE;

        gameStateRef.storedCrops += villager.inventory;
        villager.inventory = 0;
        villager.state = 'storing';

        return NodeStatus.SUCCESS;
    },

    sleep: (villager) => {
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

// Create the default behavior tree for a villager
export function createDefaultTree() {
    return new SelectorNode([
        // Sleep at night
        new SequenceNode([
            new ConditionNode('isNight', '🌙 Is Night?', CONDITIONS.isNight),
            new ActionNode('goToHouse', '🏠 Go to House', ACTIONS.goToHouse),
            new ActionNode('sleep', '😴 Sleep', ACTIONS.sleep)
        ]),
        // Rest if tired
        new SequenceNode([
            new ConditionNode('isTired', '😴 Is Tired?', CONDITIONS.isTired),
            new ActionNode('rest', '☕ Rest', ACTIONS.rest)
        ]),
        // Store items if has any
        new SequenceNode([
            new ConditionNode('hasItems', '🎒 Has Items?', CONDITIONS.hasItems),
            new ActionNode('goToStorage', '📦 Go to Storage', ACTIONS.goToStorage),
            new ActionNode('storeItems', '📥 Store Items', ACTIONS.storeItems)
        ]),
        // Harvest if ready
        new SequenceNode([
            new ConditionNode('cropsReady', '🌾 Crops Ready?', CONDITIONS.cropsReady),
            new ActionNode('goToField', '🚶 Go to Field', ACTIONS.goToField),
            new ActionNode('harvestCrops', '🌾 Harvest', ACTIONS.harvestCrops)
        ]),
        // Water crops that need it
        new SequenceNode([
            new ConditionNode('needsWater', '💧 Needs Water?', CONDITIONS.needsWater),
            new ActionNode('goToWell', '💧 Go to Well', ACTIONS.goToWell),
            new ActionNode('goToFieldForWatering', '🚶 Go to Field', ACTIONS.goToFieldForWatering),
            new ActionNode('waterCrops', '💧 Water Crops', ACTIONS.waterCrops)
        ]),
        // Plant if empty
        new SequenceNode([
            new ConditionNode('fieldEmpty', '🟫 Field Empty?', CONDITIONS.fieldEmpty),
            new ActionNode('goToField', '🚶 Go to Field', ACTIONS.goToField),
            new ActionNode('plantCrops', '🌱 Plant Crops', ACTIONS.plantCrops)
        ])
    ]);
}

// Reset all villagers to initial state
export function resetVillagers() {
    villagers[0].x = 10; villagers[0].y = 8;
    villagers[1].x = 12; villagers[1].y = 8;
    villagers[2].x = 11; villagers[2].y = 9;

    villagers.forEach(v => {
        v.energy = 100;
        v.inventory = 0;
        v.state = 'idle';
        v.targetField = null;
        v.currentAction = null;
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
    });
}
