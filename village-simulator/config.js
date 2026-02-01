// Version for cache-busting verification
export const VERSION = "1.0.8";

// Game Configuration
export const CONFIG = {
    TILE_SIZE: 32,
    DAY_LENGTH: 24 * 60, // 24 hours in game minutes
    TICK_RATE: 60, // ms per tick at 1x speed
    CROP_GROW_TIME: 4 * 60, // 4 hours to grow (only when watered)
    ENERGY_DRAIN: 0.05, // per tick
    ENERGY_RESTORE: 0.3, // per tick while sleeping
    NIGHT_START: 20 * 60, // 20:00
    NIGHT_END: 6 * 60, // 06:00
    WATER_DURATION: 3 * 60, // How long watering lasts (3 hours game time)

    // Hunger system
    HUNGER_DRAIN: 0.02, // per tick (slower than energy)
    HUNGER_RESTORE: 40, // restored per bread eaten
    HUNGER_THRESHOLD: 40, // below this, villager is hungry

    // Temperature/Warmth system - now location-based, not time-based
    WARMTH_COMFORTABLE: 70, // Target warmth when comfortable
    WARMTH_THRESHOLD: 40, // below this, villager is cold
    WARMTH_CHANGE_RATE: 0.3, // How fast warmth changes toward target
    FIRE_WOOD_CONSUMPTION: 0.05, // wood consumed per tick when fire is lit

    // Seasons
    SEASON_LENGTH: 7, // days per season
    SEASONS: ['spring', 'summer', 'autumn', 'winter'],

    // Processing
    WHEAT_PER_FLOUR: 2, // wheat needed to make 1 flour
    FLOUR_PER_BREAD: 1, // flour needed to make 1 bread
    GRIND_TIME: 30, // ticks to grind wheat
    BAKE_TIME: 60, // ticks to bake bread

    // Woodcutting
    CHOP_TIME: 45, // ticks to chop a tree
    TREE_REGROW_TIME: 10 * 60, // 10 hours for tree to regrow
    WOOD_PER_TREE: 3, // wood from one tree

    // Sheep/Wool
    SHEAR_TIME: 30, // ticks to shear sheep
    WOOL_REGROW_TIME: 8 * 60, // 8 hours for wool to regrow
    WOOL_PER_SHEEP: 2, // wool from one shearing
    WOOL_PER_SWEATER: 3, // wool needed for sweater
    KNIT_TIME: 90, // ticks to knit sweater

    // Fishing
    FISH_TIME: 60, // ticks to catch a fish (variable with luck)
    COOK_FISH_TIME: 40, // ticks to cook fish
    FISH_HUNGER_RESTORE: 30, // hunger restored by cooked fish

    // Fire outbreak
    FIRE_SPREAD_CHANCE: 0.0005, // Chance per tick for fire to break out
    FIRE_EXTINGUISH_TIME: 30, // Ticks to extinguish fire with water
};

export const TERRAIN_TYPES = {
    GRASS: 0,
    DIRT: 1,
    WATER: 2,
    FIELD: 3,
    PATH: 4,
    FLOOR: 5,
    FOREST: 6,
    POND: 7,
    FENCE: 8,
    WALL: 9,
    DOOR: 10,
    GATE: 11  // Fence gate (walkable)
};

export const LOCATIONS = {
    // House with fireplace, stove, and knitting area
    // Outer dimensions include walls. Interior is (w-2) x (h-2)
    // World is 24 wide x 18 tall (tiles 0-23 x 0-17)
    // Door positions: doorX/doorY is the tile coordinate of the door on the wall
    house: { x: 3, y: 2, w: 7, h: 5, doorX: 6, doorY: 6 }, // Bottom wall at y=6, door at x=6
    storage: { x: 14, y: 2, w: 5, h: 5, doorX: 16, doorY: 6 }, // Bottom wall at y=6, door at x=16 (center)
    well: { x: 11, y: 8, w: 2, h: 2 }, // No walls
    mill: { x: 0, y: 4, w: 4, h: 4, doorX: 2, doorY: 7 }, // Bottom wall at y=7, door at x=2
    // Fields
    field1: { x: 5, y: 12, w: 5, h: 4 },
    field2: { x: 11, y: 12, w: 5, h: 4 },
    // Forest area for trees (top-right, within bounds)
    forest: { x: 20, y: 0, w: 4, h: 4 },
    // Sheep pasture with fence
    pasture: { x: 17, y: 12, w: 5, h: 5, gateX: 19, gateY: 16 },
    // Fishing pond
    pond: { x: 0, y: 0, w: 3, h: 3 }
};

// Door positions for pathfinding - INTEGER tile coordinates (add +0.5 for center when navigating)
export const DOOR_POSITIONS = {
    house: { x: LOCATIONS.house.doorX, y: LOCATIONS.house.doorY },
    storage: { x: LOCATIONS.storage.doorX, y: LOCATIONS.storage.doorY },
    mill: { x: LOCATIONS.mill.doorX, y: LOCATIONS.mill.doorY },
    pasture: { x: LOCATIONS.pasture.gateX, y: LOCATIONS.pasture.gateY }
};

// Bed positions within house - INTEGER tile coordinates (add +0.5 for center when navigating)
// House at (3,2) w=7, h=5: interior tiles x:4,5,6,7,8 y:3,4,5
export function getBedPosition(villagerIndex) {
    // Beds on bottom interior row (tile y=5), spread across tiles x=4,5,6,7,8
    const bedTileX = LOCATIONS.house.x + 1 + villagerIndex; // tiles 4,5,6,7,8
    const bedTileY = LOCATIONS.house.y + LOCATIONS.house.h - 2; // tile 5
    return { x: bedTileX, y: bedTileY }; // Integer coordinates
}

// Interior positions within house - INTEGER tile coordinates (add +0.5 for center when navigating)
// House at (3,2) w=7, h=5: interior tiles x:4,5,6,7,8 y:3,4,5
export const HOUSE_POSITIONS = {
    // Fireplace on tile (8, 3) - right side, top row
    fireplace: { x: LOCATIONS.house.x + LOCATIONS.house.w - 2, y: LOCATIONS.house.y + 1 },
    // Stove on tile (7, 3) - center-right, top row
    stove: { x: LOCATIONS.house.x + LOCATIONS.house.w - 3, y: LOCATIONS.house.y + 1 },
    // Knitting station on tile (4, 3) - left side, top row
    knittingStation: { x: LOCATIONS.house.x + 1, y: LOCATIONS.house.y + 1 }
};

// Villager roles (for educational purposes - students assign different trees to each)
export const VILLAGER_ROLES = {
    FARMER: 'farmer',       // Plants, waters, harvests crops
    MILLER: 'miller',       // Grinds wheat, bakes bread
    LUMBERJACK: 'lumberjack', // Chops and plants trees
    SHEPHERD: 'shepherd',   // Tends sheep, knits sweaters
    FISHER: 'fisher'        // Catches and cooks fish
};
