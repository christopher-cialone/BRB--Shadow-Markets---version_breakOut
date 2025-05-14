/**
 * Ranch Data Module
 * Handles data storage and management for the ranch grid
 */

// Shared configuration for ranch grid
const RANCH_CONFIG = {
    // Cell types
    CELL_TYPES: {
        EMPTY: 'empty',
        CROP: 'crop',
        CATTLE: 'cattle'
    },
    
    // Crop states
    CROP_STATES: {
        SEED: 'seed',
        GROWING: 'growing',
        READY: 'ready'
    },
    
    // Cattle types
    CATTLE_TYPES: {
        COW: 'cow',
        BULL: 'bull'
    },
    
    // Cattle states
    CATTLE_STATES: {
        HUNGRY: 'hungry',
        FED: 'fed',
        PRODUCING: 'producing'
    },
    
    // Prices
    PRICES: {
        SEEDS: 5,
        COW: 50,
        BULL: 100,
        FEED: 2,
        MILK_SELL_PRICE: 10,
        RODEO_ENTRY_FEE: 20
    },
    
    // Timers (in milliseconds)
    TIMERS: {
        CROP_GROWING: 30000, // 30 seconds for crops to grow
        COW_MILK_PRODUCTION: 60000 // 60 seconds for milk production
    }
};

// Initialize ranch grid data if not exists
function initRanchData() {
    if (!window.ranchGrid) {
        window.ranchGrid = {
            cells: [],
            cellCount: 25, // 5x5 grid
            rows: 5,
            cols: 5
        };

        // Create empty cells
        for (let i = 0; i < window.ranchGrid.cellCount; i++) {
            window.ranchGrid.cells.push({
                id: i,
                type: RANCH_CONFIG.CELL_TYPES.EMPTY,
                state: null,
                data: {}
            });
        }
        
        console.log("Ranch grid data initialized with empty cells");
    }
    
    // Make sure player data exists with required fields
    if (!window.playerData) {
        window.playerData = {};
    }
    
    // Ensure cattle balance exists
    if (typeof window.playerData.cattleBalance === 'undefined') {
        window.playerData.cattleBalance = 100;
    }
    
    // Ensure hay and water resources exist
    if (typeof window.playerData.hay === 'undefined') {
        window.playerData.hay = 10;
    }
    
    if (typeof window.playerData.water === 'undefined') {
        window.playerData.water = 10;
    }
    
    // Ensure stats tracking exists
    if (!window.playerData.stats) {
        window.playerData.stats = {
            cropsHarvested: 0,
            cattlePurchased: 0,
            milkCollected: 0,
            rodeoWins: 0
        };
    }
    
    console.log("Player data initialized for ranch operations");
    return window.ranchGrid;
}

/**
 * Save ranch grid data to localStorage
 */
function saveRanchData() {
    try {
        if (window.ranchGrid) {
            localStorage.setItem('brb_ranch_grid', JSON.stringify(window.ranchGrid));
        }
        
        console.log("Ranch grid data saved");
    } catch (error) {
        console.error("Error saving ranch grid data:", error);
    }
}

/**
 * Load ranch grid data from localStorage
 */
function loadRanchData() {
    try {
        const savedData = localStorage.getItem('brb_ranch_grid');
        if (savedData) {
            window.ranchGrid = JSON.parse(savedData);
            console.log("Ranch grid data loaded from storage");
            return true;
        }
    } catch (error) {
        console.error("Error loading ranch grid data:", error);
    }
    
    return false;
}

/**
 * Reset all ranch grid cells to empty
 */
function resetRanchGrid() {
    if (window.ranchGrid && window.ranchGrid.cells) {
        window.ranchGrid.cells.forEach((cell, index) => {
            window.ranchGrid.cells[index] = {
                id: index,
                type: RANCH_CONFIG.CELL_TYPES.EMPTY,
                state: null,
                data: {}
            };
        });
        
        console.log("Ranch grid reset to empty cells");
        
        // Save the reset state
        saveRanchData();
        
        return true;
    }
    
    return false;
}

/**
 * Update a specific cell in the ranch grid
 * @param {number} cellIndex - The index of the cell to update
 * @param {object} cellData - New cell data to apply
 */
function updateRanchCell(cellIndex, cellData) {
    if (window.ranchGrid && window.ranchGrid.cells && cellIndex >= 0 && cellIndex < window.ranchGrid.cells.length) {
        // Merge existing data with new data
        window.ranchGrid.cells[cellIndex] = {
            ...window.ranchGrid.cells[cellIndex],
            ...cellData
        };
        
        // Ensure data property exists
        if (!window.ranchGrid.cells[cellIndex].data) {
            window.ranchGrid.cells[cellIndex].data = {};
        }
        
        // If type is changing to empty, reset data
        if (cellData.type === RANCH_CONFIG.CELL_TYPES.EMPTY) {
            window.ranchGrid.cells[cellIndex].state = null;
            window.ranchGrid.cells[cellIndex].data = {};
        }
        
        console.log(`Updated ranch cell ${cellIndex} to type: ${window.ranchGrid.cells[cellIndex].type}`);
        
        // Auto-save after cell update
        saveRanchData();
        
        return true;
    }
    
    console.error(`Failed to update ranch cell ${cellIndex} - invalid index or grid not initialized`);
    return false;
}

// Expose shared configuration
window.RANCH_CONFIG = RANCH_CONFIG;

// Expose ranch data functions
window.initRanchData = initRanchData;
window.saveRanchData = saveRanchData;
window.loadRanchData = loadRanchData;
window.resetRanchGrid = resetRanchGrid;
window.updateRanchCell = updateRanchCell;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Ranch data module loaded");
    
    // Initialize ranch data
    initRanchData();
    
    // Try to load saved data
    if (!loadRanchData()) {
        console.log("No saved ranch data found, using default empty grid");
    }
});