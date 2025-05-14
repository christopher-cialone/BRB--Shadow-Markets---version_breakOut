/**
 * Grid Initialization Module
 * This module ensures proper initialization of the ranch and shadow grids.
 */

(function() {
    'use strict';
    
    // Make sure we have grid objects defined
    if (typeof window.ranchGrid === 'undefined') {
        console.log('Creating ranchGrid object');
        window.ranchGrid = {
            size: 5,
            cells: [],
            growthTimer: 60,
            growthInterval: null,
            multiplier: 1.0
        };
    }
    
    if (typeof window.shadowGrid === 'undefined') {
        console.log('Creating shadowGrid object');
        window.shadowGrid = {
            size: 4,
            cells: [],
            cycleTimer: 30,
            cycleInterval: null,
            marketState: 'stable'
        };
    }
    
    /**
     * Initialize the ranch grid cells if needed
     */
    window.ensureRanchGridInitialized = function() {
        console.log('Ensuring ranch grid is initialized');
        
        // Create cells if they don't exist
        if (!window.ranchGrid.cells || window.ranchGrid.cells.length === 0) {
            console.log('Initializing ranch grid cells');
            window.ranchGrid.cells = [];
            
            for (let i = 0; i < window.ranchGrid.size * window.ranchGrid.size; i++) {
                window.ranchGrid.cells.push({
                    id: i,
                    state: 'empty',
                    growthStage: 0,
                    growthMax: 3
                });
            }
        }
        
        // Make sure the size is correct
        if (window.ranchGrid.cells.length !== window.ranchGrid.size * window.ranchGrid.size) {
            console.warn('Ranch grid cells count mismatch, reinitializing');
            window.ranchGrid.cells = [];
            
            for (let i = 0; i < window.ranchGrid.size * window.ranchGrid.size; i++) {
                window.ranchGrid.cells.push({
                    id: i,
                    state: 'empty',
                    growthStage: 0,
                    growthMax: 3
                });
            }
        }
        
        // Log status
        console.log(`Ranch grid has ${window.ranchGrid.cells.length} cells`);
        return window.ranchGrid;
    };
    
    /**
     * Initialize the shadow grid cells if needed
     */
    window.ensureShadowGridInitialized = function() {
        console.log('Ensuring shadow grid is initialized');
        
        // Create cells if they don't exist
        if (!window.shadowGrid.cells || window.shadowGrid.cells.length === 0) {
            console.log('Initializing shadow grid cells');
            window.shadowGrid.cells = [];
            
            for (let i = 0; i < window.shadowGrid.size * window.shadowGrid.size; i++) {
                window.shadowGrid.cells.push({
                    id: i,
                    state: 'empty',
                    stage: 0,
                    maxStage: 3,
                    supply: Math.floor(Math.random() * 5) + 3,
                    demand: Math.floor(Math.random() * 5) + 3
                });
            }
        }
        
        // Make sure the size is correct
        if (window.shadowGrid.cells.length !== window.shadowGrid.size * window.shadowGrid.size) {
            console.warn('Shadow grid cells count mismatch, reinitializing');
            window.shadowGrid.cells = [];
            
            for (let i = 0; i < window.shadowGrid.size * window.shadowGrid.size; i++) {
                window.shadowGrid.cells.push({
                    id: i,
                    state: 'empty',
                    stage: 0,
                    maxStage: 3,
                    supply: Math.floor(Math.random() * 5) + 3,
                    demand: Math.floor(Math.random() * 5) + 3
                });
            }
        }
        
        // Log status
        console.log(`Shadow grid has ${window.shadowGrid.cells.length} cells`);
        return window.shadowGrid;
    };
    
    // Initialize both grids on load
    window.addEventListener('DOMContentLoaded', function() {
        window.ensureRanchGridInitialized();
        window.ensureShadowGridInitialized();
        console.log('Grid initialization complete');
    });
    
})();