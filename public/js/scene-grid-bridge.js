/**
 * Scene and Grid Bridge Module
 * Handles proper interaction between HTML UI and Phaser scenes for grid visualization.
 */

(function() {
    'use strict';
    
    // Store references to grid scenes
    let ranchSceneInstance = null;
    let nightSceneInstance = null;
    
    /**
     * Initialize the ranch grid in both HTML and Phaser
     */
    window.initRanchGridComplete = function() {
        console.log('Initializing Ranch Grid (Complete)');
        
        // Ensure grid data is initialized
        window.ensureRanchGridInitialized();
        
        // Initialize HTML grid
        initRanchGridHTML();
        
        // Initialize Phaser grid if available
        initRanchGridPhaser();
        
        // Attach event listeners to grid cells
        attachRanchCellListeners();
        
        console.log('Ranch Grid initialization complete');
    };
    
    /**
     * Initialize the shadow grid in both HTML and Phaser
     */
    window.initShadowGridComplete = function() {
        console.log('Initializing Shadow Grid (Complete)');
        
        // Ensure grid data is initialized
        window.ensureShadowGridInitialized();
        
        // Initialize HTML grid
        initShadowGridHTML();
        
        // Initialize Phaser grid if available
        initShadowGridPhaser();
        
        // Attach event listeners to grid cells
        attachShadowCellListeners();
        
        console.log('Shadow Grid initialization complete');
    };
    
    /**
     * Initialize the HTML representation of the ranch grid
     */
    function initRanchGridHTML() {
        console.log('Initializing Ranch Grid HTML');
        const gridContainer = document.getElementById('ranch-grid');
        if (!gridContainer) {
            console.error('Ranch grid container not found in HTML');
            return;
        }
        
        // Clear any existing content
        gridContainer.innerHTML = '';
        
        // Create grid cells
        window.ranchGrid.cells.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = `grid-cell ${cell.state || 'empty'}`;
            cellElement.id = `ranch-cell-${index}`;
            
            // Add growth indicator
            if (cell.state !== 'empty') {
                const growthIndicator = document.createElement('div');
                growthIndicator.className = 'growth-indicator';
                
                // Add growth stages
                for (let i = 0; i < cell.growthMax; i++) {
                    const stageDiv = document.createElement('div');
                    stageDiv.className = `growth-stage ${i < cell.growthStage ? 'filled' : 'empty'}`;
                    growthIndicator.appendChild(stageDiv);
                }
                
                cellElement.appendChild(growthIndicator);
            }
            
            // Add cell to grid
            gridContainer.appendChild(cellElement);
        });
        
        console.log('Ranch Grid HTML initialized with', window.ranchGrid.cells.length, 'cells');
    }
    
    /**
     * Initialize the HTML representation of the shadow grid
     */
    function initShadowGridHTML() {
        console.log('Initializing Shadow Grid HTML');
        const gridContainer = document.getElementById('shadow-grid');
        if (!gridContainer) {
            console.error('Shadow grid container not found in HTML');
            return;
        }
        
        // Clear any existing content
        gridContainer.innerHTML = '';
        
        // Create grid cells
        window.shadowGrid.cells.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = `grid-cell ${cell.state || 'empty'}`;
            cellElement.id = `shadow-cell-${index}`;
            
            // Add brewing indicator if needed
            if (cell.state !== 'empty') {
                const brewingIndicator = document.createElement('div');
                brewingIndicator.className = 'brewing-indicator';
                
                // Add brewing stages
                for (let i = 0; i < cell.maxStage; i++) {
                    const stageDiv = document.createElement('div');
                    stageDiv.className = `brewing-stage ${i < cell.stage ? 'filled' : 'empty'}`;
                    brewingIndicator.appendChild(stageDiv);
                }
                
                cellElement.appendChild(brewingIndicator);
            }
            
            // Add cell to grid
            gridContainer.appendChild(cellElement);
        });
        
        console.log('Shadow Grid HTML initialized with', window.shadowGrid.cells.length, 'cells');
    }
    
    /**
     * Initialize the Phaser representation of the ranch grid
     */
    function initRanchGridPhaser() {
        console.log('Initializing Ranch Grid in Phaser');
        
        // Get the RanchScene instance if available
        if (window.game && window.game.scene) {
            ranchSceneInstance = window.game.scene.getScene('RanchScene');
            
            if (ranchSceneInstance) {
                console.log('RanchScene instance found');
                
                // Initialize grid in Phaser scene
                if (typeof ranchSceneInstance.initPhaserGrid === 'function') {
                    ranchSceneInstance.initPhaserGrid();
                    console.log('Ranch Phaser grid initialized');
                    
                    // Update all cell appearances
                    if (typeof ranchSceneInstance.updateAllCells === 'function') {
                        ranchSceneInstance.updateAllCells();
                        console.log('Ranch Phaser grid cells updated');
                    }
                } else {
                    console.error('initPhaserGrid function not found in RanchScene');
                }
            } else {
                console.error('RanchScene instance not found');
            }
        } else {
            console.error('Phaser game or scene not available');
        }
    }
    
    /**
     * Initialize the Phaser representation of the shadow grid
     */
    function initShadowGridPhaser() {
        console.log('Initializing Shadow Grid in Phaser');
        
        // Get the NightScene instance if available
        if (window.game && window.game.scene) {
            nightSceneInstance = window.game.scene.getScene('NightScene');
            
            if (nightSceneInstance) {
                console.log('NightScene instance found');
                
                // Initialize grid in Phaser scene
                if (typeof nightSceneInstance.initPhaserGrid === 'function') {
                    nightSceneInstance.initPhaserGrid();
                    console.log('Night Phaser grid initialized');
                    
                    // Update all cell appearances
                    if (typeof nightSceneInstance.updateAllCells === 'function') {
                        nightSceneInstance.updateAllCells();
                        console.log('Night Phaser grid cells updated');
                    }
                } else {
                    console.error('initPhaserGrid function not found in NightScene');
                }
            } else {
                console.error('NightScene instance not found');
            }
        } else {
            console.error('Phaser game or scene not available');
        }
    }
    
    /**
     * Attach event listeners to ranch grid cells
     */
    function attachRanchCellListeners() {
        console.log('Attaching Ranch cell listeners');
        
        // Get all ranch cell elements
        const cellElements = document.querySelectorAll('[id^="ranch-cell-"]');
        
        // Attach click event to each cell
        cellElements.forEach(cell => {
            const index = parseInt(cell.id.replace('ranch-cell-', ''));
            
            cell.addEventListener('click', () => {
                console.log(`Ranch cell ${index} clicked`);
                if (typeof handleRanchCellClick === 'function') {
                    handleRanchCellClick(index);
                }
            });
        });
        
        console.log(`Attached listeners to ${cellElements.length} ranch cells`);
    }
    
    /**
     * Attach event listeners to shadow grid cells
     */
    function attachShadowCellListeners() {
        console.log('Attaching Shadow cell listeners');
        
        // Get all shadow cell elements
        const cellElements = document.querySelectorAll('[id^="shadow-cell-"]');
        
        // Attach click event to each cell
        cellElements.forEach(cell => {
            const index = parseInt(cell.id.replace('shadow-cell-', ''));
            
            cell.addEventListener('click', () => {
                console.log(`Shadow cell ${index} clicked`);
                if (typeof handleShadowCellClick === 'function') {
                    handleShadowCellClick(index);
                }
            });
        });
        
        console.log(`Attached listeners to ${cellElements.length} shadow cells`);
    }
    
    /**
     * Update a ranch grid cell appearance in HTML and Phaser
     */
    window.updateRanchCellAppearance = function(cellIndex) {
        console.log(`Updating ranch cell ${cellIndex} appearance`);
        
        // Update HTML cell
        const cellElement = document.getElementById(`ranch-cell-${cellIndex}`);
        if (cellElement) {
            const cell = window.ranchGrid.cells[cellIndex];
            
            // Update class
            cellElement.className = `grid-cell ${cell.state}`;
            
            // Update growth indicator
            let growthIndicator = cellElement.querySelector('.growth-indicator');
            
            if (cell.state !== 'empty') {
                // Create indicator if it doesn't exist
                if (!growthIndicator) {
                    growthIndicator = document.createElement('div');
                    growthIndicator.className = 'growth-indicator';
                    cellElement.appendChild(growthIndicator);
                }
                
                // Update growth stages
                growthIndicator.innerHTML = '';
                for (let i = 0; i < cell.growthMax; i++) {
                    const stageDiv = document.createElement('div');
                    stageDiv.className = `growth-stage ${i < cell.growthStage ? 'filled' : 'empty'}`;
                    growthIndicator.appendChild(stageDiv);
                }
            } else if (growthIndicator) {
                // Remove indicator if cell is empty
                cellElement.removeChild(growthIndicator);
            }
        }
        
        // Update Phaser cell
        if (ranchSceneInstance && typeof ranchSceneInstance.updateCellAppearance === 'function') {
            ranchSceneInstance.updateCellAppearance(cellIndex);
        }
    };
    
    /**
     * Update a shadow grid cell appearance in HTML and Phaser
     */
    window.updateShadowCellAppearance = function(cellIndex) {
        console.log(`Updating shadow cell ${cellIndex} appearance`);
        
        // Update HTML cell
        const cellElement = document.getElementById(`shadow-cell-${cellIndex}`);
        if (cellElement) {
            const cell = window.shadowGrid.cells[cellIndex];
            
            // Update class
            cellElement.className = `grid-cell ${cell.state}`;
            
            // Update brewing indicator
            let brewingIndicator = cellElement.querySelector('.brewing-indicator');
            
            if (cell.state !== 'empty') {
                // Create indicator if it doesn't exist
                if (!brewingIndicator) {
                    brewingIndicator = document.createElement('div');
                    brewingIndicator.className = 'brewing-indicator';
                    cellElement.appendChild(brewingIndicator);
                }
                
                // Update brewing stages
                brewingIndicator.innerHTML = '';
                for (let i = 0; i < cell.maxStage; i++) {
                    const stageDiv = document.createElement('div');
                    stageDiv.className = `brewing-stage ${i < cell.stage ? 'filled' : 'empty'}`;
                    brewingIndicator.appendChild(stageDiv);
                }
            } else if (brewingIndicator) {
                // Remove indicator if cell is empty
                cellElement.removeChild(brewingIndicator);
            }
        }
        
        // Update Phaser cell
        if (nightSceneInstance && typeof nightSceneInstance.updateCellAppearance === 'function') {
            nightSceneInstance.updateCellAppearance(cellIndex);
        }
    };
    
    /**
     * Update all ranch grid cells appearance
     */
    window.updateAllRanchCells = function() {
        window.ranchGrid.cells.forEach((_, index) => {
            window.updateRanchCellAppearance(index);
        });
    };
    
    /**
     * Update all shadow grid cells appearance
     */
    window.updateAllShadowCells = function() {
        window.shadowGrid.cells.forEach((_, index) => {
            window.updateShadowCellAppearance(index);
        });
    };
    
    // Export key functions to window
    window.getRanchSceneInstance = () => ranchSceneInstance;
    window.getNightSceneInstance = () => nightSceneInstance;
    
})();