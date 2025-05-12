/**
 * Scene Initializer
 * This module ensures proper initialization of game scenes and data flow
 */

// Make sure the playerData object exists
if (typeof window.playerData === 'undefined') {
    window.playerData = {
        name: 'Cowboy',
        archetype: 'Entrepreneur',
        characterType: 'the-kid',
        cattleBalance: 100,
        hay: 100,
        water: 100,
        cattle: [],
        potions: []
    };
}

// Initialize scene classes if needed
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing scene classes for proper visibility");
    
    // Define RanchScene if not defined
    if (typeof window.RanchScene === 'undefined') {
        window.RanchScene = class RanchScene extends Phaser.Scene {
            constructor() {
                super('RanchScene');
                this.gridConfig = {
                    size: 5,
                    cellSize: 80, 
                    padding: 10,
                    startX: 0,
                    startY: 0
                };
            }
            
            preload() {
                // Load assets
                this.load.image('ranch-bg', 'img/game-background.jpeg');
                this.load.image('cattle', 'img/cattle.png');
                this.load.image('milk-bottle', 'img/milk-bottle.png');
            }
            
            create() {
                console.log("RanchScene created");
                
                // Create background
                this.bg = this.add.image(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    'ranch-bg'
                );
                this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
                
                // Initialize cattle sprites
                this.cattleContainer = this.add.container(0, 0);
                
                // Render existing cattle
                if (window.playerData && Array.isArray(window.playerData.cattle)) {
                    window.playerData.cattle.forEach(cattle => {
                        this.addCattleSprite(cattle);
                    });
                }
            }
            
            addCattleSprite(cattle) {
                if (!cattle || !cattle.id) return;
                
                console.log(`Adding cattle #${cattle.id} to scene with milk production`);
                
                // Create a container for this cattle
                const x = 100 + Math.random() * (this.cameras.main.width - 200);
                const y = 100 + Math.random() * (this.cameras.main.height - 200);
                
                const container = this.add.container(x, y);
                container.name = `cattle-${cattle.id}`;
                
                // Create the cattle sprite
                const sprite = this.add.image(0, 0, 'cattle');
                if (!sprite.texture.key) {
                    // Create placeholder if texture is missing
                    const graphics = this.add.graphics();
                    graphics.fillStyle(0x8b4513, 1);
                    graphics.fillCircle(0, 0, 30);
                    graphics.generateTexture('cattle', 60, 60);
                    graphics.clear();
                    
                    sprite = this.add.image(0, 0, 'cattle');
                }
                
                sprite.setScale(0.5);
                
                // Add milk indicator text
                const milkText = this.add.text(
                    0, 
                    -40,
                    `${cattle.milk || 0}/${cattle.maxMilk || 20}`,
                    {
                        fontFamily: 'Arial',
                        fontSize: '14px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                );
                milkText.setOrigin(0.5);
                
                // Add everything to container
                container.add([sprite, milkText]);
                this.cattleContainer.add(container);
                
                // Add simple animation
                this.tweens.add({
                    targets: container,
                    y: container.y + 10,
                    duration: 1000 + Math.random() * 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                return container;
            }
        };
        
        console.log("RanchScene class initialized");
    }
    
    // Define NightScene if not defined
    if (typeof window.NightScene === 'undefined') {
        window.NightScene = class NightScene extends Phaser.Scene {
            constructor() {
                super('NightScene');
                
                // Grid configuration for this scene
                this.gridConfig = {
                    size: 4, // 4x4 grid
                    cellSize: 90,
                    padding: 10,
                    startX: 0, // Will be calculated in create based on screen size
                    startY: 0  // Will be calculated in create based on screen size
                };
                
                // Animation timers and cell references
                this.bubblingTimers = [];
                this.glowTimers = [];
                this.cellSprites = [];
                this.cellIndicators = [];
            }
            
            preload() {
                // Load background 
                this.load.image('shadow-bg', 'img/game-background.jpeg');
                
                // Load particle textures for effects
                this.load.image('bubble', 'img/bubble.png');
                this.load.image('glow', 'img/glow.png');
            }
            
            create() {
                console.log("NightScene created");
                
                // Create background
                this.bg = this.add.image(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    'shadow-bg'
                );
                this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
                this.bg.setTint(0x000022); // Dark blue tint for night
                
                // Initialize the grid cells
                if (typeof window.renderShadowCell === 'function') {
                    this.initPhaserGrid();
                } else {
                    console.error("renderShadowCell function not available - cannot render shadow grid");
                }
            }
            
            initPhaserGrid() {
                // Set up grid config
                const gridX = this.cameras.main.width / 2;
                const gridY = this.cameras.main.height / 2 + 20;
                
                // Calculate grid dimensions
                const { size, cellSize, padding } = this.gridConfig;
                const totalWidth = (cellSize + padding) * size;
                const totalHeight = (cellSize + padding) * size;
                
                // Store grid position for cell creation
                this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
                this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
                
                // Create cells
                this.createGridCells();
            }
            
            createGridCells() {
                const { size, cellSize, padding, startX, startY } = this.gridConfig;
                
                // Create cells based on shadow grid data
                if (typeof window.initShadowCells === 'function') {
                    window.initShadowCells();
                }
                
                // Clear existing cell sprites if any
                if (this.cellSprites.length > 0) {
                    this.cellSprites.forEach(sprite => sprite.destroy());
                    this.cellSprites = [];
                }
                
                // Create cells
                for (let row = 0; row < size; row++) {
                    for (let col = 0; col < size; col++) {
                        const index = row * size + col;
                        const x = startX + col * (cellSize + padding);
                        const y = startY + row * (cellSize + padding);
                        
                        // Create cell
                        if (typeof window.renderShadowCell === 'function') {
                            const cellContainer = window.renderShadowCell(this, x, y, index);
                            if (cellContainer) {
                                this.cellSprites[index] = cellContainer;
                            } else {
                                console.error(`Failed to render shadow cell ${index}`);
                            }
                        } else {
                            console.error("renderShadowCell function not available");
                        }
                    }
                }
            }
            
            updateCellAppearance(cellIndex) {
                if (!window.shadowGrid || !window.shadowGrid.cells || !window.shadowGrid.cells[cellIndex]) {
                    console.error(`Cell ${cellIndex} not found in shadowGrid.cells`);
                    return;
                }
                
                // Get the cell container
                const cellContainer = this.cellSprites[cellIndex];
                if (!cellContainer) return;
                
                // Use utility function to update
                if (typeof window.updateShadowCell === 'function') {
                    window.updateShadowCell(this, cellContainer, cellIndex);
                }
            }
            
            updateAllCells() {
                if (!window.shadowGrid || !window.shadowGrid.cells) return;
                
                // Update all cells
                for (let i = 0; i < window.shadowGrid.cells.length; i++) {
                    this.updateCellAppearance(i);
                }
            }
            
            addBubblingAnimation(container, cellIndex) {
                // Implement a simple bubbling animation
                // We'll use a timer to add bubbles periodically
                if (this.bubblingTimers[cellIndex]) {
                    clearInterval(this.bubblingTimers[cellIndex]);
                }
                
                this.bubblingTimers[cellIndex] = setInterval(() => {
                    if (this.scene.isActive()) {
                        const bubble = this.add.image(
                            container.x + (Math.random() * 20 - 10),
                            container.y + (Math.random() * 20 - 10),
                            'bubble'
                        );
                        
                        if (!bubble.texture.key) {
                            // Create placeholder
                            const graphics = this.add.graphics();
                            graphics.fillStyle(0x3333ff, 0.7);
                            graphics.fillCircle(0, 0, 5);
                            graphics.generateTexture('bubble', 10, 10);
                            graphics.clear();
                            
                            bubble.setTexture('bubble');
                        }
                        
                        bubble.setScale(0.2);
                        bubble.setAlpha(0.7);
                        
                        this.tweens.add({
                            targets: bubble,
                            y: bubble.y - 30,
                            alpha: 0,
                            scale: 0.1,
                            duration: 1500,
                            onComplete: () => bubble.destroy()
                        });
                    } else {
                        clearInterval(this.bubblingTimers[cellIndex]);
                    }
                }, 500);
            }
            
            addGlowAnimation(container, cellIndex) {
                // Implement a glow animation
                // We'll use a timer to pulse the glow
                if (this.glowTimers[cellIndex]) {
                    clearInterval(this.glowTimers[cellIndex]);
                }
                
                const glow = this.add.image(container.x, container.y, 'glow');
                if (!glow.texture.key) {
                    // Create placeholder
                    const graphics = this.add.graphics();
                    graphics.fillStyle(0xcc33ff, 0.3);
                    graphics.fillCircle(0, 0, 40);
                    graphics.generateTexture('glow', 80, 80);
                    graphics.clear();
                    
                    glow.setTexture('glow');
                }
                
                glow.setScale(1.2);
                glow.setAlpha(0.5);
                glow.setBlendMode(Phaser.BlendModes.ADD);
                
                this.tweens.add({
                    targets: glow,
                    scale: 1.5,
                    alpha: 0.3,
                    duration: 1500,
                    yoyo: true,
                    repeat: -1
                });
                
                this.glowTimers[cellIndex] = setInterval(() => {
                    if (!this.scene.isActive()) {
                        glow.destroy();
                        clearInterval(this.glowTimers[cellIndex]);
                    }
                }, 1000);
            }
        };
        
        console.log("NightScene class initialized");
    }
    
    // Override initShadowGrid to make it more robust
    if (typeof window.initShadowGrid === 'function') {
        const originalInitShadowGrid = window.initShadowGrid;
        window.initShadowGrid = function() {
            // Ensure shadowGrid exists
            if (!window.shadowGrid) {
                window.shadowGrid = {
                    cells: [],
                    cycleState: 'stable',
                    priceMultiplier: 1.0
                };
            }
            
            // Call original init function
            originalInitShadowGrid();
            
            console.log("Shadow grid initialized with enhanced visibility");
        };
    }
    
    // Make cattle and potions visible by ensuring proper data structure
    function ensureProperDataStructures() {
        // Ensure cattle array exists
        if (!window.playerData.cattle || !Array.isArray(window.playerData.cattle)) {
            window.playerData.cattle = [];
        }
        
        // Add a starter cattle if none exist
        if (window.playerData.cattle.length === 0) {
            window.playerData.cattle.push({
                id: "starter-cattle-" + Date.now(),
                name: "Starter Cattle",
                milk: 5,
                maxMilk: 20,
                milkRate: 1,
                milkValue: 3
            });
            
            console.log("Added starter cattle to player data");
        }
        
        // Ensure potions array exists
        if (!window.playerData.potions || !Array.isArray(window.playerData.potions)) {
            window.playerData.potions = [];
        }
        
        // Force UI updates
        if (typeof window.updateCattleInventory === 'function') {
            window.updateCattleInventory();
        }
        
        if (typeof window.updatePotionInventory === 'function') {
            window.updatePotionInventory();
        }
    }
    
    // Run immediately and then after a short delay to ensure DOM is ready
    ensureProperDataStructures();
    setTimeout(ensureProperDataStructures, 500);
    
    // Also run when scene changes
    document.addEventListener('scene-changed', function(e) {
        console.log("Scene changed to: " + e.detail.scene);
        setTimeout(ensureProperDataStructures, 200);
    });
});

console.log("Scene initializer loaded");