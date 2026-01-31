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

    // Temperature/Warmth system
    WARMTH_DRAIN_BASE: 0.01, // per tick base drain
    WARMTH_DRAIN_WINTER: 0.05, // extra drain in winter
    WARMTH_RESTORE_FIRE: 0.2, // restored per tick near fire
    WARMTH_RESTORE_SWEATER: 0.5, // reduced drain when wearing sweater
    WARMTH_THRESHOLD: 40, // below this, villager is cold
    FIRE_WOOD_CONSUMPTION: 0.1, // wood consumed per tick when fire is lit

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
};

export const TERRAIN_TYPES = {
    GRASS: 0,
    DIRT: 1,
    WATER: 2,
    FIELD: 3,
    PATH: 4,
    FLOOR: 5,
    FOREST: 6,
    POND: 7
};

export const LOCATIONS = {
    // House now includes kitchen/fireplace inside
    house: { x: 4, y: 3, w: 5, h: 4 },
    storage: { x: 16, y: 4, w: 3, h: 3 },
    well: { x: 11, y: 6, w: 2, h: 2 },
    mill: { x: 1, y: 7, w: 3, h: 3 },
    // Fields
    field1: { x: 3, y: 11, w: 5, h: 4 },
    field2: { x: 10, y: 11, w: 5, h: 4 },
    field3: { x: 17, y: 11, w: 4, h: 4 },
    // Forest area for trees
    forest: { x: 19, y: 1, w: 4, h: 5 },
    // Sheep pasture
    pasture: { x: 1, y: 12, w: 2, h: 3 },
    // Fishing pond
    pond: { x: 13, y: 1, w: 3, h: 3 }
};

// Villager roles (for educational purposes - students assign different trees to each)
export const VILLAGER_ROLES = {
    FARMER: 'farmer',       // Plants, waters, harvests crops
    MILLER: 'miller',       // Grinds wheat, bakes bread
    LUMBERJACK: 'lumberjack', // Chops and plants trees
    SHEPHERD: 'shepherd',   // Tends sheep, knits sweaters
    FISHER: 'fisher'        // Catches and cooks fish
};
