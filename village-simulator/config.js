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
    house: { x: 3, y: 2, w: 7, h: 5, doorX: 6, doorY: 6 }, // Door at bottom center
    storage: { x: 14, y: 2, w: 4, h: 4, doorX: 16, doorY: 5 }, // Door at bottom center
    well: { x: 11, y: 7, w: 2, h: 2 }, // No walls
    mill: { x: 0, y: 4, w: 4, h: 4, doorX: 2, doorY: 7 }, // Door at bottom center
    // Fields
    field1: { x: 5, y: 11, w: 5, h: 4 },
    field2: { x: 11, y: 11, w: 5, h: 4 },
    // Forest area for trees (top-right, within bounds)
    forest: { x: 20, y: 0, w: 4, h: 4 },
    // Sheep pasture with fence
    pasture: { x: 18, y: 11, w: 5, h: 5, gateX: 20, gateY: 15 },
    // Fishing pond
    pond: { x: 0, y: 0, w: 3, h: 3 }
};

// Door positions for pathfinding (tile coordinates of door - these are walkable tiles)
export const DOOR_POSITIONS = {
    house: { x: LOCATIONS.house.doorX + 0.5, y: LOCATIONS.house.doorY + 0.5 },
    storage: { x: LOCATIONS.storage.doorX + 0.5, y: LOCATIONS.storage.doorY + 0.5 },
    mill: { x: LOCATIONS.mill.doorX + 0.5, y: LOCATIONS.mill.doorY + 0.5 },
    pasture: { x: LOCATIONS.pasture.gateX + 0.5, y: LOCATIONS.pasture.gateY + 0.5 }
};

// Bed positions within house (in tile coordinates)
// House interior starts at x+1, y+1 and is (w-2) x (h-2) = 5x3
export function getBedPosition(villagerIndex) {
    const interiorX = LOCATIONS.house.x + 1; // Skip wall
    const interiorY = LOCATIONS.house.y + 1; // Skip wall
    const interiorW = LOCATIONS.house.w - 2; // Interior width

    // 5 beds spread across the top row of interior
    const numBeds = 5;
    const spacing = interiorW / numBeds;
    const bedX = interiorX + spacing * villagerIndex + spacing / 2;
    const bedY = interiorY + 0.5; // Top row of interior
    return { x: bedX, y: bedY };
}

// Interior positions within house (all inside the walls)
// House interior: x from house.x+1 to house.x+w-2, y from house.y+1 to house.y+h-2
// For house at (3,2) with w=7, h=5: interior x:4-8, interior y:3-5
export const HOUSE_POSITIONS = {
    // Fireplace on right side of interior, middle
    fireplace: { x: LOCATIONS.house.x + LOCATIONS.house.w - 2.5, y: LOCATIONS.house.y + 1.5 },
    // Stove in the middle-right area
    stove: { x: LOCATIONS.house.x + LOCATIONS.house.w - 2.5, y: LOCATIONS.house.y + 2.5 },
    // Knitting station on left side of interior
    knittingStation: { x: LOCATIONS.house.x + 1.5, y: LOCATIONS.house.y + 2.5 }
};

// Villager roles (for educational purposes - students assign different trees to each)
export const VILLAGER_ROLES = {
    FARMER: 'farmer',       // Plants, waters, harvests crops
    MILLER: 'miller',       // Grinds wheat, bakes bread
    LUMBERJACK: 'lumberjack', // Chops and plants trees
    SHEPHERD: 'shepherd',   // Tends sheep, knits sweaters
    FISHER: 'fisher'        // Catches and cooks fish
};
