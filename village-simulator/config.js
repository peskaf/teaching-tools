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
    FENCE: 8
};

export const LOCATIONS = {
    // House with fireplace, stove, and knitting area
    house: { x: 4, y: 3, w: 6, h: 4, doorSide: 'bottom' },
    storage: { x: 17, y: 4, w: 3, h: 3, doorSide: 'bottom' },
    well: { x: 11, y: 5, w: 2, h: 2 },
    mill: { x: 1, y: 5, w: 3, h: 3, doorSide: 'bottom' },
    // Fields (only 2 now, pasture replaces one)
    field1: { x: 5, y: 11, w: 5, h: 4 },
    field2: { x: 12, y: 11, w: 5, h: 4 },
    // Forest area for trees
    forest: { x: 19, y: 1, w: 4, h: 5 },
    // Sheep pasture with fence (replaces field3)
    pasture: { x: 19, y: 11, w: 4, h: 4 },
    // Fishing pond - larger and better positioned
    pond: { x: 12, y: 1, w: 4, h: 3 }
};

// Door positions for pathfinding (tile coordinates of door entrance)
export const DOOR_POSITIONS = {
    house: { x: LOCATIONS.house.x + LOCATIONS.house.w / 2, y: LOCATIONS.house.y + LOCATIONS.house.h },
    storage: { x: LOCATIONS.storage.x + LOCATIONS.storage.w / 2, y: LOCATIONS.storage.y + LOCATIONS.storage.h },
    mill: { x: LOCATIONS.mill.x + LOCATIONS.mill.w / 2, y: LOCATIONS.mill.y + LOCATIONS.mill.h }
};

// Bed positions within house (in tile coordinates relative to house origin)
export function getBedPosition(villagerIndex) {
    const numBeds = 5;
    const bedWidth = 0.7;
    const totalBedsWidth = numBeds * bedWidth;
    const spacing = (LOCATIONS.house.w - totalBedsWidth - 0.5) / (numBeds + 1); // -0.5 for wall margin
    const bedX = LOCATIONS.house.x + 0.3 + spacing + villagerIndex * (bedWidth + spacing) + bedWidth / 2;
    const bedY = LOCATIONS.house.y + 1.0; // Second row in house
    return { x: bedX, y: bedY };
}

// Interior positions within house
export const HOUSE_POSITIONS = {
    fireplace: { x: LOCATIONS.house.x + LOCATIONS.house.w - 1.2, y: LOCATIONS.house.y + 1.5 },
    stove: { x: LOCATIONS.house.x + LOCATIONS.house.w - 1.2, y: LOCATIONS.house.y + 2.8 },
    knittingStation: { x: LOCATIONS.house.x + 1, y: LOCATIONS.house.y + 2.8 }
};

// Villager roles (for educational purposes - students assign different trees to each)
export const VILLAGER_ROLES = {
    FARMER: 'farmer',       // Plants, waters, harvests crops
    MILLER: 'miller',       // Grinds wheat, bakes bread
    LUMBERJACK: 'lumberjack', // Chops and plants trees
    SHEPHERD: 'shepherd',   // Tends sheep, knits sweaters
    FISHER: 'fisher'        // Catches and cooks fish
};
