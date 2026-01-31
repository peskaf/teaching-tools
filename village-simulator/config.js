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

    // Processing
    WHEAT_PER_FLOUR: 2, // wheat needed to make 1 flour
    FLOUR_PER_BREAD: 1, // flour needed to make 1 bread
    GRIND_TIME: 30, // ticks to grind wheat
    BAKE_TIME: 60, // ticks to bake bread
};

export const TERRAIN_TYPES = {
    GRASS: 0,
    DIRT: 1,
    WATER: 2,
    FIELD: 3,
    PATH: 4,
    FLOOR: 5
};

export const LOCATIONS = {
    house: { x: 4, y: 4, w: 4, h: 3 },
    storage: { x: 16, y: 4, w: 3, h: 3 },
    well: { x: 11, y: 6, w: 2, h: 2 },
    mill: { x: 1, y: 7, w: 3, h: 3 },
    kitchen: { x: 20, y: 7, w: 3, h: 3 },
    field1: { x: 3, y: 11, w: 5, h: 4 },
    field2: { x: 10, y: 11, w: 5, h: 4 },
    field3: { x: 17, y: 11, w: 4, h: 4 }
};
