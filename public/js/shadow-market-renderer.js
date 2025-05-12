/**
 * Shadow Market Cell Renderer
 * This module handles the rendering of Shadow Market cells for the NightScene
 */

// Access or create the shadow grid global state
if (typeof window.shadowGrid === 'undefined') {
    window.shadowGrid = {
        cells: [],
        cycleState: 'stable',
        priceMultiplier: 1.0,
        lastCycleTime: Date.now()
    };
}

// Use a reference for convenience
const shadowGrid = window.shadowGrid;

/**
 * Initialize Shadow Market cells
 */
function initShadowCells() {
    console.log("Initializing shadow grid cells");
    
    // Create cells if they don't exist
    if (shadowGrid.cells.length === 0) {
        for (let i = 0; i < 16; i++) {
            shadowGrid.cells.push({
                index: i,
                state: 'empty', // empty, brewing, distilling, ready
                level: 0,
                progress: 0,
                type: Math.random() > 0.5 ? 'blue' : 'purple',
                startTime: 0,
                resourceYield: Math.floor(Math.random() * 5) + 1
            });
        }
        
        // Add some initial cells with content for visual appeal
        if (Math.random() > 0.3) {
            const randomCells = [
                Math.floor(Math.random() * 16),
                Math.floor(Math.random() * 16),
                Math.floor(Math.random() * 16)
            ];
            
            randomCells.forEach(index => {
                const cell = shadowGrid.cells[index];
                if (cell) {
                    cell.state = 'brewing';
                    cell.progress = Math.floor(Math.random() * 70);
                    cell.startTime = Date.now() - (cell.progress * 1000);
                }
            });
        }
    }
    
    console.log(`Shadow grid initialized with ${shadowGrid.cells.length} cells`);
}

/**
 * Render a shadow cell with the given scene, position, and index
 */
function renderShadowCell(scene, x, y, index) {
    // Get the cell data
    const cell = shadowGrid.cells[index];
    if (!cell) {
        console.error(`Cell ${index} not found in shadowGrid.cells`);
        return null;
    }
    
    // Create a container for this cell
    const container = scene.add.container(x, y);
    
    // Create cell background
    const cellSize = scene.gridConfig.cellSize;
    const bg = scene.add.rectangle(0, 0, cellSize, cellSize, 0x000033);
    bg.setStrokeStyle(1, 0x3333cc);
    
    // Set the cell to be interactive
    bg.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            handleShadowCellClick(index);
            
            // Highlight effect on click
            scene.tweens.add({
                targets: bg,
                alpha: 0.7,
                duration: 100,
                yoyo: true
            });
        });
    
    // Create cell content based on state
    let content;
    let progressBar;
    let progressText;
    
    switch (cell.state) {
        case 'empty':
            // Empty cell with faint glow
            content = scene.add.image(0, 0, 'empty-night');
            if (!content.texture.key) {
                // Create placeholder if texture is missing
                const graphics = scene.add.graphics();
                graphics.fillStyle(0x000055, 0.5);
                graphics.fillRect(-cellSize/2 + 5, -cellSize/2 + 5, cellSize - 10, cellSize - 10);
                graphics.generateTexture('empty-night', cellSize, cellSize);
                graphics.clear();
                
                content = scene.add.image(0, 0, 'empty-night');
            }
            break;
            
        case 'brewing':
        case 'distilling':
            // Create potion graphic
            content = scene.add.image(0, 0, cell.state);
            if (!content.texture.key) {
                // Create placeholder if texture is missing
                const graphics = scene.add.graphics();
                
                // Draw potion
                const color = cell.state === 'brewing' ? 0x3333ff : 0x9933ff;
                graphics.fillStyle(color, 0.7);
                graphics.fillCircle(0, 0, cellSize/3);
                graphics.generateTexture(cell.state, cellSize, cellSize);
                graphics.clear();
                
                content = scene.add.image(0, 0, cell.state);
            }
            
            // Add progress bar
            progressBar = scene.add.rectangle(
                0, 
                cellSize/3, 
                (cell.progress / 100) * (cellSize - 10), 
                8, 
                cell.state === 'brewing' ? 0x3366ff : 0xcc33ff
            );
            progressBar.setOrigin(0.5, 0);
            
            // Add progress text
            progressText = scene.add.text(
                0,
                cellSize/3 + 15,
                `${Math.floor(cell.progress)}%`,
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center'
                }
            );
            progressText.setOrigin(0.5);
            
            // Add bubbling effect for brewing
            if (cell.state === 'brewing') {
                scene.addBubblingAnimation(container, index);
            }
            
            // Add glow for distilling
            if (cell.state === 'distilling') {
                scene.addGlowAnimation(container, index);
            }
            
            break;
            
        case 'ready':
            // Ready potion effect
            content = scene.add.image(0, 0, 'ready');
            if (!content.texture.key) {
                // Create placeholder if texture is missing
                const graphics = scene.add.graphics();
                
                // Draw completed potion
                graphics.fillStyle(0xcc33ff, 0.9);
                graphics.fillCircle(0, 0, cellSize/3);
                graphics.lineStyle(3, 0xffff00, 1);
                graphics.strokeCircle(0, 0, cellSize/3 + 2);
                graphics.generateTexture('ready', cellSize, cellSize);
                graphics.clear();
                
                content = scene.add.image(0, 0, 'ready');
            }
            
            // Add ready indicator text
            const readyText = scene.add.text(
                0, 
                cellSize/3,
                "READY!",
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffff00',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            readyText.setOrigin(0.5);
            
            // Add yield text
            const yieldText = scene.add.text(
                0,
                cellSize/3 + 20,
                `${cell.resourceYield} units`,
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#ffcc00',
                    align: 'center'
                }
            );
            yieldText.setOrigin(0.5);
            
            // Add to container
            container.add([readyText, yieldText]);
            
            // Add glow animation
            scene.addGlowAnimation(container, index);
            
            break;
    }
    
    // Add all components to container
    container.add(bg);
    if (content) container.add(content);
    if (progressBar) container.add(progressBar);
    if (progressText) container.add(progressText);
    
    // Add cell index for debugging
    const debugText = scene.add.text(
        -cellSize/2 + 5,
        -cellSize/2 + 5,
        index.toString(),
        {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#666666'
        }
    );
    container.add(debugText);
    
    return container;
}

/**
 * Update a shadow cell's appearance
 */
function updateShadowCell(scene, container, index) {
    // Get the cell data
    const cell = shadowGrid.cells[index];
    if (!cell || !container) return;
    
    // First, clear the container (keeping only the background rectangle)
    while (container.list.length > 1) {
        const item = container.list[container.list.length - 1];
        container.remove(item, true);
    }
    
    // Get the cell background
    const bg = container.list[0];
    const cellSize = scene.gridConfig.cellSize;
    
    // Create cell content based on state
    let content;
    let progressBar;
    let progressText;
    
    switch (cell.state) {
        case 'empty':
            // Empty cell with faint glow
            content = scene.add.image(0, 0, 'empty-night');
            if (!content.texture.key) {
                // Create placeholder if texture is missing
                const graphics = scene.add.graphics();
                graphics.fillStyle(0x000055, 0.5);
                graphics.fillRect(-cellSize/2 + 5, -cellSize/2 + 5, cellSize - 10, cellSize - 10);
                graphics.generateTexture('empty-night', cellSize, cellSize);
                graphics.clear();
                
                content = scene.add.image(0, 0, 'empty-night');
            }
            break;
            
        case 'brewing':
        case 'distilling':
            // Create potion graphic
            content = scene.add.image(0, 0, cell.state);
            if (!content.texture.key) {
                // Create placeholder if texture is missing
                const graphics = scene.add.graphics();
                
                // Draw potion
                const color = cell.state === 'brewing' ? 0x3333ff : 0x9933ff;
                graphics.fillStyle(color, 0.7);
                graphics.fillCircle(0, 0, cellSize/3);
                graphics.generateTexture(cell.state, cellSize, cellSize);
                graphics.clear();
                
                content = scene.add.image(0, 0, cell.state);
            }
            
            // Add progress bar
            progressBar = scene.add.rectangle(
                0, 
                cellSize/3, 
                (cell.progress / 100) * (cellSize - 10), 
                8, 
                cell.state === 'brewing' ? 0x3366ff : 0xcc33ff
            );
            progressBar.setOrigin(0.5, 0);
            
            // Add progress text
            progressText = scene.add.text(
                0,
                cellSize/3 + 15,
                `${Math.floor(cell.progress)}%`,
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center'
                }
            );
            progressText.setOrigin(0.5);
            
            // Add bubbling effect for brewing
            if (cell.state === 'brewing') {
                scene.addBubblingAnimation(container, index);
            }
            
            // Add glow for distilling
            if (cell.state === 'distilling') {
                scene.addGlowAnimation(container, index);
            }
            
            break;
            
        case 'ready':
            // Ready potion effect
            content = scene.add.image(0, 0, 'ready');
            if (!content.texture.key) {
                // Create placeholder if texture is missing
                const graphics = scene.add.graphics();
                
                // Draw completed potion
                graphics.fillStyle(0xcc33ff, 0.9);
                graphics.fillCircle(0, 0, cellSize/3);
                graphics.lineStyle(3, 0xffff00, 1);
                graphics.strokeCircle(0, 0, cellSize/3 + 2);
                graphics.generateTexture('ready', cellSize, cellSize);
                graphics.clear();
                
                content = scene.add.image(0, 0, 'ready');
            }
            
            // Add ready indicator text
            const readyText = scene.add.text(
                0, 
                cellSize/3,
                "READY!",
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffff00',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            );
            readyText.setOrigin(0.5);
            
            // Add yield text
            const yieldText = scene.add.text(
                0,
                cellSize/3 + 20,
                `${cell.resourceYield} units`,
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#ffcc00',
                    align: 'center'
                }
            );
            yieldText.setOrigin(0.5);
            
            // Add to container
            container.add([readyText, yieldText]);
            
            // Add glow animation
            scene.addGlowAnimation(container, index);
            
            break;
    }
    
    // Add all components to container
    if (content) container.add(content);
    if (progressBar) container.add(progressBar);
    if (progressText) container.add(progressText);
    
    // Add cell index for debugging
    const debugText = scene.add.text(
        -cellSize/2 + 5,
        -cellSize/2 + 5,
        index.toString(),
        {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#666666'
        }
    );
    container.add(debugText);
}

/**
 * Start brewing in a shadow cell
 */
function startBrewing(cellIndex) {
    const cell = shadowGrid.cells[cellIndex];
    if (cell && cell.state === 'empty') {
        cell.state = 'brewing';
        cell.progress = 0;
        cell.startTime = Date.now();
        cell.type = Math.random() > 0.5 ? 'blue' : 'purple';
        cell.resourceYield = Math.floor(Math.random() * 5) + 1;
        
        // Notify the UI
        if (typeof window.updateShadowGridDisplay === 'function') {
            window.updateShadowGridDisplay();
        }
        
        return true;
    }
    return false;
}

/**
 * Advance brewing to distilling
 */
function advanceToDistilling(cellIndex) {
    const cell = shadowGrid.cells[cellIndex];
    if (cell && cell.state === 'brewing' && cell.progress >= 100) {
        cell.state = 'distilling';
        cell.progress = 0;
        cell.startTime = Date.now();
        
        // Notify the UI
        if (typeof window.updateShadowGridDisplay === 'function') {
            window.updateShadowGridDisplay();
        }
        
        return true;
    }
    return false;
}

/**
 * Complete distilling and make cell ready
 */
function completeDistilling(cellIndex) {
    const cell = shadowGrid.cells[cellIndex];
    if (cell && cell.state === 'distilling' && cell.progress >= 100) {
        cell.state = 'ready';
        
        // Notify the UI
        if (typeof window.updateShadowGridDisplay === 'function') {
            window.updateShadowGridDisplay();
        }
        
        return true;
    }
    return false;
}

/**
 * Handle clicking on a shadow cell
 */
function handleShadowCellClick(cellIndex) {
    console.log(`Shadow cell ${cellIndex} clicked`);
    
    const cell = shadowGrid.cells[cellIndex];
    if (!cell) return;
    
    switch (cell.state) {
        case 'empty':
            // Start brewing in this cell
            startBrewing(cellIndex);
            showNotification(`Started brewing in cell ${cellIndex+1}`, 'info');
            break;
            
        case 'brewing':
            if (cell.progress >= 100) {
                // Advance to distilling
                advanceToDistilling(cellIndex);
                showNotification(`Started distilling potion in cell ${cellIndex+1}`, 'info');
            } else {
                showNotification(`This potion is still brewing (${Math.floor(cell.progress)}%)`, 'info');
            }
            break;
            
        case 'distilling':
            if (cell.progress >= 100) {
                // Complete the distilling process
                completeDistilling(cellIndex);
                showNotification(`Potion in cell ${cellIndex+1} is now ready!`, 'success');
            } else {
                showNotification(`This potion is still distilling (${Math.floor(cell.progress)}%)`, 'info');
            }
            break;
            
        case 'ready':
            // Harvest the potion
            distillShadowCell(cellIndex);
            break;
    }
    
    // Update any Phaser scenes that might be showing this cell
    if (window.game && window.game.scene.isActive('NightScene')) {
        const scene = window.game.scene.getScene('NightScene');
        if (scene && typeof scene.updateCellAppearance === 'function') {
            scene.updateCellAppearance(cellIndex);
        }
    }
}

/**
 * Update shadow market cell progress
 */
function updateShadowCellProgress() {
    // Process each cell
    shadowGrid.cells.forEach((cell, index) => {
        if (cell.state === 'brewing' || cell.state === 'distilling') {
            // Calculate progress based on time elapsed
            const elapsed = (Date.now() - cell.startTime) / 1000; // Convert to seconds
            const speed = cell.state === 'brewing' ? 5 : 4; // % per second
            
            // Apply market cycle multiplier if it exists
            const cycleMultiplier = shadowGrid.cycleMultiplier || 1.0;
            
            cell.progress = Math.min(100, elapsed * speed * cycleMultiplier);
            
            // Auto-advance brewing to distilling if it's reached 100%
            if (cell.state === 'brewing' && cell.progress >= 100) {
                // Random chance of auto-advancing based on player's skills
                if (Math.random() > 0.7) {
                    advanceToDistilling(index);
                }
            }
            
            // Auto-complete distilling if it's reached 100%
            if (cell.state === 'distilling' && cell.progress >= 100) {
                // Random chance of auto-completing based on player's skills
                if (Math.random() > 0.9) {
                    completeDistilling(index);
                }
            }
        }
    });
    
    // Update Phaser scene if active
    if (window.game && window.game.scene.isActive('NightScene')) {
        const scene = window.game.scene.getScene('NightScene');
        if (scene && typeof scene.updateAllCells === 'function') {
            scene.updateAllCells();
        }
    }
}

// Expose the functions to the global scope
window.shadowGrid = shadowGrid;
window.initShadowCells = initShadowCells;
window.renderShadowCell = renderShadowCell;
window.updateShadowCell = updateShadowCell;
window.handleShadowCellClick = handleShadowCellClick;
window.updateShadowCellProgress = updateShadowCellProgress;

// Start the update loop
setInterval(updateShadowCellProgress, 1000);

console.log("Shadow Market renderer initialized");