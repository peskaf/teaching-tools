import { world } from './world.js';
import { villagers, createNode } from './villager.js';
import {
    SelectorNode,
    findNodeById,
    findParentNode
} from './behavior-tree.js';

let selectedVillager = 0;
let selectedNodeId = null;
let gameStateRef = null;
let gameControlsRef = null;

// Set game state reference (called from game.js)
export function setUIGameState(gs) {
    gameStateRef = gs;
}

// Set game controls reference (called from game.js)
export function setUIGameControls(controls) {
    gameControlsRef = controls;
}

// Initialize UI event handlers
export function initUI() {
    // Tab switching
    document.querySelectorAll('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + 'Panel').classList.add('active');
        });
    });

    // Speed controls
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (gameControlsRef) {
                gameControlsRef.setSpeed(parseInt(btn.dataset.speed));
            }
        });
    });

    // Villager selection
    document.querySelectorAll('.villager-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.villager-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedVillager = parseInt(btn.dataset.villager);
            selectedNodeId = null;
            renderTree();
        });
    });

    // Node palette
    document.querySelectorAll('.palette-node').forEach(node => {
        node.addEventListener('click', () => {
            addNodeToTree(node.dataset.type, node.dataset.subtype);
        });
    });

    // Make control functions available globally for onclick handlers
    window.toggleSimulation = () => gameControlsRef && gameControlsRef.toggle();
    window.resetSimulation = () => gameControlsRef && gameControlsRef.reset();
    window.selectNode = selectNode;
    window.deleteNode = deleteNode;

    renderTree();
}

// Update time display
export function updateTimeDisplay() {
    if (!gameStateRef) return;

    const hours = Math.floor(gameStateRef.time / 60);
    const minutes = gameStateRef.time % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    document.querySelector('.time-display .day').textContent = `Day ${gameStateRef.day}`;
    document.querySelector('.time-display .time').textContent = timeStr;
}

// Update status panel
export function updateStatusPanel() {
    if (!gameStateRef) return;

    // Villager statuses
    let statusHtml = '';
    villagers.forEach(v => {
        const inventoryIcon = v.inventoryType === 'wheat' ? '🌾' :
                             v.inventoryType === 'flour' ? '🥛' :
                             v.inventoryType === 'bread' ? '🍞' : '📦';
        statusHtml += `
            <div class="villager-status">
                <h4>${v.emoji} ${v.name}</h4>
                <div class="status-row">
                    <span>State:</span>
                    <span>${v.state || 'idle'}</span>
                </div>
                <div class="status-row">
                    <span>Energy:</span>
                    <span>${Math.round(v.energy)}%</span>
                </div>
                <div class="status-bar">
                    <div class="status-bar-fill energy" style="width: ${v.energy}%"></div>
                </div>
                <div class="status-row">
                    <span>Hunger:</span>
                    <span>${Math.round(v.hunger)}%</span>
                </div>
                <div class="status-bar">
                    <div class="status-bar-fill hunger" style="width: ${v.hunger}%"></div>
                </div>
                <div class="inventory-display">
                    ${v.inventory > 0 ? `<span class="inventory-item">${inventoryIcon} ×${v.inventory}</span>` : '<span class="inventory-item">Empty</span>'}
                </div>
            </div>
        `;
    });
    document.getElementById('villagerStatuses').innerHTML = statusHtml;

    // World stats
    document.getElementById('statWheat').textContent = gameStateRef.storedWheat;
    document.getElementById('statFlour').textContent = gameStateRef.storedFlour;
    document.getElementById('statBread').textContent = gameStateRef.storedBread;
    document.getElementById('statPlanted').textContent = world.fields.filter(f => f.state !== 'empty').length;
    document.getElementById('statHarvested').textContent = gameStateRef.totalHarvested;
    document.getElementById('statDays').textContent = gameStateRef.day;
}

// Get icon for node type
function getNodeIcon(type) {
    switch (type) {
        case 'selector': return '❓';
        case 'sequence': return '➡️';
        case 'condition': return '❔';
        case 'action': return '▶️';
        default: return '•';
    }
}

// Render a single tree node
function renderTreeNode(node, depth = 0) {
    const statusClass = node.status || '';
    const isSelected = selectedNodeId === node.id;

    let html = `
        <div class="tree-node ${node.type} ${statusClass}"
             data-id="${node.id}"
             style="${isSelected ? 'outline: 2px solid #ffc857;' : ''}"
             onclick="selectNode('${node.id}')">
            <span class="node-icon">${getNodeIcon(node.type)}</span>
            <span>${node.name}</span>
            <button class="node-delete" onclick="event.stopPropagation(); deleteNode('${node.id}')">✕</button>
        </div>
    `;

    if (node.children && node.children.length > 0) {
        html += '<div class="tree-children">';
        node.children.forEach(child => {
            html += renderTreeNode(child, depth + 1);
        });
        html += '</div>';
    }

    return html;
}

// Render the behavior tree
export function renderTree() {
    const container = document.getElementById('treeContainer');
    const tree = villagers[selectedVillager].behaviorTree;

    if (!tree) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No tree defined. Add nodes from the palette below.</p>';
        return;
    }

    container.innerHTML = renderTreeNode(tree);
}

// Select a node in the tree
function selectNode(nodeId) {
    selectedNodeId = nodeId;
    renderTree();
}

// Delete a node from the tree
function deleteNode(nodeId) {
    const tree = villagers[selectedVillager].behaviorTree;

    if (tree.id === nodeId) {
        villagers[selectedVillager].behaviorTree = null;
        selectedNodeId = null;
        renderTree();
        return;
    }

    const parent = findParentNode(tree, nodeId);
    if (parent && parent.children) {
        parent.children = parent.children.filter(c => c.id !== nodeId);
        if (selectedNodeId === nodeId) selectedNodeId = null;
        renderTree();
    }
}

// Add a new node to the tree
function addNodeToTree(type, subtype) {
    const newNode = createNode(type, subtype);
    const tree = villagers[selectedVillager].behaviorTree;

    if (!tree) {
        // Create root node
        if (type === 'selector' || type === 'sequence') {
            villagers[selectedVillager].behaviorTree = newNode;
        } else {
            // Wrap in selector if first node is not a control node
            villagers[selectedVillager].behaviorTree = new SelectorNode([newNode]);
        }
    } else if (selectedNodeId) {
        // Add to selected node
        const selected = findNodeById(tree, selectedNodeId);
        if (selected && (selected.type === 'selector' || selected.type === 'sequence')) {
            selected.children.push(newNode);
        } else {
            // Add to parent's children
            const parent = findParentNode(tree, selectedNodeId);
            if (parent && parent.children) {
                const idx = parent.children.findIndex(c => c.id === selectedNodeId);
                parent.children.splice(idx + 1, 0, newNode);
            }
        }
    } else {
        // Add to root
        if (tree.children) {
            tree.children.push(newNode);
        }
    }

    selectedNodeId = newNode.id;
    renderTree();
}

// Export selected villager getter for external use
export function getSelectedVillager() {
    return selectedVillager;
}
