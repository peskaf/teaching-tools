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
    WATER_DURATION: 60, // How long watering lasts (1 hour game time)
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
    field1: { x: 3, y: 11, w: 5, h: 4 },
    field2: { x: 10, y: 11, w: 5, h: 4 },
    field3: { x: 17, y: 11, w: 4, h: 4 }
};
