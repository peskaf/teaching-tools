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
        targetField: null,
        energy: 100,
        hunger: 100, // New: hunger level (100 = full, 0 = starving)
        inventory: 0,
        inventoryType: null, // 'wheat', 'flour', or null
        state: "idle",
        currentAction: null,
        actionProgress: 0, // For timed actions like grinding/baking
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
        hunger: 100,
        inventory: 0,
        inventoryType: null,
        state: "idle",
        currentAction: null,
        actionProgress: 0,
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
        hunger: 100,
        inventory: 0,
        inventoryType: null,
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

// Helper to check if villager is inside a building
function isInsideBuilding(villager, location) {
    return villager.x >= location.x &&
           villager.x <= location.x + location.w &&
           villager.y >= location.y &&
           villager.y <= location.y + location.h;
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
    hasItems: (v) => v.inventory > 0,
    hasWheat: (v) => v.inventory > 0 && v.inventoryType === 'wheat',
    hasFlour: (v) => v.inventory > 0 && v.inventoryType === 'flour',
    cropsReady: (v) => world.fields.some(f => f.state === 'ready'),
    fieldEmpty: (v) => world.fields.some(f => f.state === 'empty'),
    needsWater: (v) => world.fields.some(f =>
        (f.state === 'planted' || f.state === 'growing') && !f.isWatered
    ),
    // Storage checks
    storageHasWheat: (v) => gameStateRef.storedWheat >= CONFIG.WHEAT_PER_FLOUR,
    storageHasFlour: (v) => gameStateRef.storedFlour >= CONFIG.FLOUR_PER_BREAD,
    storageHasBread: (v) => gameStateRef.storedBread > 0
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

        // Slower if very hungry
        let speed = 0.08;
        if (villager.hunger < 20) {
            speed = 0.04;
        }

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
        const bedSpacing = LOCATIONS.house.w / 4;
        const bedX = LOCATIONS.house.x + bedSpacing * (villager.id + 1);
        const bedY = LOCATIONS.house.y + LOCATIONS.house.h * 0.5;
        return { x: bedX, y: bedY };
    }),

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

    goToKitchen: createGoToAction(() => ({
        x: LOCATIONS.kitchen.x + LOCATIONS.kitchen.w / 2,
        y: LOCATIONS.kitchen.y + LOCATIONS.kitchen.h / 2
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
        if (villager.inventoryType === 'wheat') {
            gameStateRef.storedWheat += villager.inventory;
        } else if (villager.inventoryType === 'flour') {
            gameStateRef.storedFlour += villager.inventory;
        }

        villager.inventory = 0;
        villager.inventoryType = null;
        villager.state = 'storing';

        return NodeStatus.SUCCESS;
    },

    // Pick up wheat from storage to take to mill
    pickupWheat: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedWheat < CONFIG.WHEAT_PER_FLOUR) return NodeStatus.FAILURE;
        if (villager.inventory > 0) return NodeStatus.FAILURE; // Already carrying something

        gameStateRef.storedWheat -= CONFIG.WHEAT_PER_FLOUR;
        villager.inventory = CONFIG.WHEAT_PER_FLOUR;
        villager.inventoryType = 'wheat';
        villager.state = 'pickup';

        return NodeStatus.SUCCESS;
    },

    // Pick up flour from storage to take to kitchen
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

    // Grind wheat into flour at the mill
    grindWheat: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.mill)) return NodeStatus.FAILURE;
        if (villager.inventoryType !== 'wheat' || villager.inventory < CONFIG.WHEAT_PER_FLOUR) {
            return NodeStatus.FAILURE;
        }

        villager.state = 'grinding';

        // Timed action
        villager.actionProgress++;
        if (villager.actionProgress >= CONFIG.GRIND_TIME) {
            villager.inventory = 1; // Produces 1 flour
            villager.inventoryType = 'flour';
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 15;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    // Bake flour into bread at the kitchen
    bakeBread: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.kitchen)) return NodeStatus.FAILURE;
        if (villager.inventoryType !== 'flour' || villager.inventory < CONFIG.FLOUR_PER_BREAD) {
            return NodeStatus.FAILURE;
        }

        villager.state = 'baking';

        // Timed action
        villager.actionProgress++;
        if (villager.actionProgress >= CONFIG.BAKE_TIME) {
            villager.inventory = 0;
            villager.inventoryType = null;
            gameStateRef.storedBread++; // Bread goes directly to storage count
            villager.actionProgress = 0;
            villager.energy -= CONFIG.ENERGY_DRAIN * 10;
            return NodeStatus.SUCCESS;
        }

        return NodeStatus.RUNNING;
    },

    // Eat bread to restore hunger
    eatBread: (villager) => {
        if (!isInsideBuilding(villager, LOCATIONS.storage)) return NodeStatus.FAILURE;
        if (gameStateRef.storedBread <= 0) return NodeStatus.FAILURE;

        gameStateRef.storedBread--;
        villager.hunger = Math.min(100, villager.hunger + CONFIG.HUNGER_RESTORE);
        villager.state = 'eating';

        return NodeStatus.SUCCESS;
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

// Create the default behavior tree for a villager
export function createDefaultTree() {
    return new SelectorNode([
        // 1. Sleep at night
        new SequenceNode([
            new ConditionNode('isNight', '🌙 Is Night?', CONDITIONS.isNight),
            new ActionNode('goToHouse', '🏠 Go to House', ACTIONS.goToHouse),
            new ActionNode('sleep', '😴 Sleep', ACTIONS.sleep)
        ]),
        // 2. Eat if hungry (highest day priority)
        new SequenceNode([
            new ConditionNode('isHungry', '🍽️ Is Hungry?', CONDITIONS.isHungry),
            new ConditionNode('storageHasBread', '🍞 Has Bread?', CONDITIONS.storageHasBread),
            new ActionNode('goToStorage', '📦 Go to Storage', ACTIONS.goToStorage),
            new ActionNode('eatBread', '🍞 Eat Bread', ACTIONS.eatBread)
        ]),
        // 3. Rest if tired
        new SequenceNode([
            new ConditionNode('isTired', '😴 Is Tired?', CONDITIONS.isTired),
            new ActionNode('rest', '☕ Rest', ACTIONS.rest)
        ]),
        // 4. Store items if carrying any
        new SequenceNode([
            new ConditionNode('hasItems', '🎒 Has Items?', CONDITIONS.hasItems),
            new ActionNode('goToStorage', '📦 Go to Storage', ACTIONS.goToStorage),
            new ActionNode('storeItems', '📥 Store Items', ACTIONS.storeItems)
        ]),
        // 5. Bake bread if we have flour
        new SequenceNode([
            new ConditionNode('storageHasFlour', '🌾 Has Flour?', CONDITIONS.storageHasFlour),
            new ActionNode('goToStorage', '📦 Go to Storage', ACTIONS.goToStorage),
            new ActionNode('pickupFlour', '📤 Pickup Flour', ACTIONS.pickupFlour),
            new ActionNode('goToKitchen', '🍳 Go to Kitchen', ACTIONS.goToKitchen),
            new ActionNode('bakeBread', '🍞 Bake Bread', ACTIONS.bakeBread)
        ]),
        // 6. Grind wheat if we have wheat
        new SequenceNode([
            new ConditionNode('storageHasWheat', '🌾 Has Wheat?', CONDITIONS.storageHasWheat),
            new ActionNode('goToStorage', '📦 Go to Storage', ACTIONS.goToStorage),
            new ActionNode('pickupWheat', '📤 Pickup Wheat', ACTIONS.pickupWheat),
            new ActionNode('goToMill', '🏭 Go to Mill', ACTIONS.goToMill),
            new ActionNode('grindWheat', '⚙️ Grind Wheat', ACTIONS.grindWheat)
        ]),
        // 7. Harvest if ready
        new SequenceNode([
            new ConditionNode('cropsReady', '🌾 Crops Ready?', CONDITIONS.cropsReady),
            new ActionNode('goToField', '🚶 Go to Field', ACTIONS.goToField),
            new ActionNode('harvestCrops', '🌾 Harvest', ACTIONS.harvestCrops)
        ]),
        // 8. Water crops that need it
        new SequenceNode([
            new ConditionNode('needsWater', '💧 Needs Water?', CONDITIONS.needsWater),
            new ActionNode('goToWell', '💧 Go to Well', ACTIONS.goToWell),
            new ActionNode('goToFieldForWatering', '🚶 Go to Field', ACTIONS.goToFieldForWatering),
            new ActionNode('waterCrops', '💧 Water Crops', ACTIONS.waterCrops)
        ]),
        // 9. Plant if empty
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
        v.hunger = 100;
        v.inventory = 0;
        v.inventoryType = null;
        v.state = 'idle';
        v.targetField = null;
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

        // Natural hunger drain (always, even when sleeping)
        villager.hunger = Math.max(0, villager.hunger - CONFIG.HUNGER_DRAIN);
    });
}
