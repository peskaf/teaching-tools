// Behavior Tree Node Status
export const NodeStatus = {
    SUCCESS: 'success',
    FAILURE: 'failure',
    RUNNING: 'running'
};

// Base Behavior Node class
export class BehaviorNode {
    constructor(type, subtype, name, children = []) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.subtype = subtype;
        this.name = name;
        this.children = children;
        this.status = null;
    }

    tick(villager) {
        return NodeStatus.FAILURE;
    }

    reset() {
        this.status = null;
        this.children.forEach(c => c.reset());
    }
}

// Selector Node - tries children until one succeeds
export class SelectorNode extends BehaviorNode {
    constructor(children = []) {
        super('selector', 'selector', 'Selector', children);
        this.currentChild = 0;
    }

    tick(villager) {
        for (let i = this.currentChild; i < this.children.length; i++) {
            const status = this.children[i].tick(villager);
            if (status === NodeStatus.RUNNING) {
                this.currentChild = i;
                this.status = NodeStatus.RUNNING;
                return NodeStatus.RUNNING;
            }
            if (status === NodeStatus.SUCCESS) {
                this.currentChild = 0;
                this.status = NodeStatus.SUCCESS;
                return NodeStatus.SUCCESS;
            }
        }
        this.currentChild = 0;
        this.status = NodeStatus.FAILURE;
        return NodeStatus.FAILURE;
    }

    reset() {
        super.reset();
        this.currentChild = 0;
    }
}

// Sequence Node - runs all children in order, stops on failure
export class SequenceNode extends BehaviorNode {
    constructor(children = []) {
        super('sequence', 'sequence', 'Sequence', children);
        this.currentChild = 0;
    }

    tick(villager) {
        for (let i = this.currentChild; i < this.children.length; i++) {
            const status = this.children[i].tick(villager);
            if (status === NodeStatus.RUNNING) {
                this.currentChild = i;
                this.status = NodeStatus.RUNNING;
                return NodeStatus.RUNNING;
            }
            if (status === NodeStatus.FAILURE) {
                this.currentChild = 0;
                this.status = NodeStatus.FAILURE;
                return NodeStatus.FAILURE;
            }
        }
        this.currentChild = 0;
        this.status = NodeStatus.SUCCESS;
        return NodeStatus.SUCCESS;
    }

    reset() {
        super.reset();
        this.currentChild = 0;
    }
}

// Condition Node - checks if something is true
export class ConditionNode extends BehaviorNode {
    constructor(subtype, name, checkFn) {
        super('condition', subtype, name);
        this.checkFn = checkFn;
    }

    tick(villager) {
        const result = this.checkFn(villager);
        this.status = result ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
        return this.status;
    }
}

// Action Node - makes villager do something
export class ActionNode extends BehaviorNode {
    constructor(subtype, name, actionFn) {
        super('action', subtype, name);
        this.actionFn = actionFn;
    }

    tick(villager) {
        this.status = this.actionFn(villager);
        return this.status;
    }
}

// Node names for UI
export const NODE_NAMES = {
    selector: '❓ Selector',
    sequence: '➡️ Sequence',
    // Conditions
    isNight: '🌙 Is Night?',
    isDay: '☀️ Is Day?',
    isTired: '😴 Is Tired?',
    isHungry: '🍽️ Is Hungry?',
    hasItems: '🎒 Has Items?',
    hasWheat: '🌾 Has Wheat?',
    hasFlour: '🥛 Has Flour?',
    cropsReady: '🌾 Crops Ready?',
    fieldEmpty: '🟫 Field Empty?',
    needsWater: '💧 Needs Water?',
    storageHasWheat: '📦🌾 Storage Has Wheat?',
    storageHasFlour: '📦🥛 Storage Has Flour?',
    storageHasBread: '📦🍞 Storage Has Bread?',
    // Movement actions
    goToField: '🚶 Go to Field',
    goToFieldForWatering: '🚶 Go to Field (Water)',
    goToHouse: '🏠 Go to House',
    goToStorage: '📦 Go to Storage',
    goToWell: '💧 Go to Well',
    goToMill: '🏭 Go to Mill',
    goToKitchen: '🍳 Go to Kitchen',
    // Work actions
    plantCrops: '🌱 Plant Crops',
    harvestCrops: '🌾 Harvest',
    waterCrops: '💧 Water Crops',
    storeItems: '📥 Store Items',
    pickupWheat: '📤 Pickup Wheat',
    pickupFlour: '📤 Pickup Flour',
    grindWheat: '⚙️ Grind Wheat',
    bakeBread: '🍞 Bake Bread',
    eatBread: '🍞 Eat Bread',
    sleep: '😴 Sleep',
    rest: '☕ Rest'
};

// Find a node by ID in a tree
export function findNodeById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
        for (let child of node.children) {
            const found = findNodeById(child, id);
            if (found) return found;
        }
    }
    return null;
}

// Find parent of a node by ID
export function findParentNode(root, id, parent = null) {
    if (!root) return null;
    if (root.id === id) return parent;
    if (root.children) {
        for (let child of root.children) {
            const found = findParentNode(child, id, root);
            if (found !== null) return found;
        }
    }
    return null;
}
