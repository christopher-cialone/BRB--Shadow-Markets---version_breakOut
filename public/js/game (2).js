/**
 * Bull Run Boost - Shadow Markets of the Cyber-West
 * Game Implementation with Grid Fixes
 */

(function() {
    'use strict';

    // Define global Phaser game instance
    window.game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: [MainMenuScene, RanchScene, SaloonScene, NightScene],
        parent: 'game-container',
        backgroundColor: '#000000',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    });

    console.log('Phaser game initialized globally at window.game');

    // Track current scene for scene switching
    let currentScene = 'MainMenuScene';

    // Function to switch between scenes
    window.switchScene = function(newScene) {
        console.log('Switching to', newScene);
        
        // Stop current scene and start new one
        if (window.game && window.game.scene) {
            window.game.scene.stop(currentScene);
            window.game.scene.start(newScene);
            currentScene = newScene;
            
            // Update UI elements for the scene
            console.log('UI updated for scene:', newScene);
            
            // Toggle UI visibility based on scene
            document.querySelectorAll('.scene-ui').forEach(ui => {
                ui.style.display = 'none';
            });
            
            const sceneUI = document.getElementById(`${newScene.toLowerCase()}-ui`);
            if (sceneUI) {
                sceneUI.style.display = 'block';
            }
            
            // Dispatch scene change event
            document.dispatchEvent(new CustomEvent('scene-changed', {
                detail: { scene: newScene.toLowerCase() }
            }));
        } else {
            console.error('Game or scene manager not available');
        }
    };

    // Define the MainMenuScene class
    window.MainMenuScene = class MainMenuScene extends Phaser.Scene {
        constructor() {
            super('MainMenuScene');
        }
        
        preload() {
            // Load essential assets
            this.load.image('menu-bg', 'img/menu-background.jpg');
            this.load.image('logo', 'img/bull-run-logo.png');
            
            console.log('MainMenuScene assets loaded');
        }
        
        create() {
            console.log('MainMenuScene created');
            
            const width = this.scale.width;
            const height = this.scale.height;
            
            // Background
            this.add.image(width/2, height/2, 'menu-bg')
                .setDisplaySize(width, height);
            
            // Logo
            this.add.image(width/2, height * 0.3, 'logo')
                .setScale(0.8);
            
            // Start button
            const startBtn = this.add.rectangle(width/2, height * 0.8, 200, 60, 0x6a2ca0);
            startBtn.setStrokeStyle(2, 0xff44cc);
            
            const startText = this.add.text(width/2, height * 0.8, 'START GAME', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            // Make button interactive
            startBtn.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.startGame());
        }
        
        startGame() {
            console.log('Start Game button clicked');
            
            // Hide main menu HTML elements if they exist
            const menuElement = document.getElementById('main-menu');
            if (menuElement) {
                menuElement.style.display = 'none';
            }
            
            // Check if game.scene is available
            if (window.game && window.game.scene) {
                // Start the Ranch scene
                this.scene.start('RanchScene');
                console.log('Switching to scene: ranch');
                
                // Dispatch scene change event
                document.dispatchEvent(new CustomEvent('scene-changed', {
                    detail: { scene: 'ranch' }
                }));
            } else {
                console.error('Game scene manager not available');
            }
        }
    };

    // Define the RanchScene class
    window.RanchScene = class RanchScene extends Phaser.Scene {
        constructor() {
            super('RanchScene');
            
            // Store grid cell sprites and data
            this.gridCells = [];
            this.gridTexts = [];
            this.cattle = [];
            this.cattleMilkTimers = [];
            
            // Grid configuration
            this.gridConfig = {
                size: 5,
                cellSize: 80,
                padding: 10,
                startX: 0,
                startY: 0
            };
        }
        
        preload() {
            console.log('RanchScene preload started');
            
            // Load essential assets with error handling
            this.load.image('game-bg', 'img/game-background.jpg');
            this.load.image('cell-empty', 'img/cell-empty.png');
            this.load.image('cell-planted', 'img/cell-planted.png');
            this.load.image('cell-growing', 'img/cell-growing.png');
            this.load.image('cell-harvestable', 'img/cell-harvestable.png');
            this.load.image('cattle', 'img/cattle.png');
            
            // Create fallback graphics for any missing textures when load completes
            this.load.on('complete', () => {
                console.log('RanchScene assets loaded');
                
                // Ensure essential textures have fallbacks
                const essentialTextures = [
                    'cell-empty', 'cell-planted', 'cell-growing', 'cell-harvestable', 
                    'cattle', 'water-drop', 'hay-icon', 'milk-bottle'
                ];
                
                essentialTextures.forEach(key => {
                    if (!this.textures.exists(key)) {
                        this.createFallbackTexture(key);
                    }
                });
            });
        }
        
        create() {
            console.log('RanchScene create method started');
            
            // Get dimensions
            const width = this.scale.width;
            const height = this.scale.height;
            
            // Set up background
            this.bg = this.add.image(width/2, height/2, 'game-bg');
            this.bg.setDisplaySize(width, height);
            
            // Create a container for our ranch elements
            this.ranchContainer = this.add.container(0, 0);
            
            // Initialize the Phaser grid
            this.initPhaserGrid();
            
            // Add resize listener
            this.scale.on('resize', this.resize, this);
            
            console.log('RanchScene created successfully');
        }
        
        // Initialize the Phaser-based ranch grid
        initPhaserGrid() {
            console.log('Initializing Ranch Phaser grid');
            
            // Calculate grid dimensions
            const { size, cellSize, padding } = this.gridConfig;
            const totalWidth = (cellSize + padding) * size;
            const totalHeight = (cellSize + padding) * size;
            
            // Position grid on left side of screen
            const gridX = this.scale.width * 0.25;
            const gridY = this.scale.height * 0.5;
            
            // Calculate starting position (top-left of grid)
            this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
            this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
            
            // Create grid container
            this.gridContainer = this.add.container(0, 0);
            this.ranchContainer.add(this.gridContainer);
            
            // Create grid header
            const gridHeader = this.add.text(gridX, gridY - totalHeight/2 - 40, 'Ranch Pasture', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.ranchContainer.add(gridHeader);
            
            // Create the grid cells
            this.createGridCells();
            
            // Add harvest all button
            const harvestAllBtn = this.add.text(gridX - 100, gridY + totalHeight/2 + 40, '🌾 Harvest All', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#3a7d44',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            
            harvestAllBtn.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    console.log('Harvest All button clicked');
                    this.harvestAllRanchCells();
                });
            
            // Add sell cattle button
            const sellCattleBtn = this.add.text(gridX + 100, gridY + totalHeight/2 + 40, '💰 Sell Cattle', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#6a2ca0',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            
            sellCattleBtn.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    console.log('Sell Cattle button clicked');
                    this.sellAllCattle();
                });
            
            this.ranchContainer.add(harvestAllBtn);
            this.ranchContainer.add(sellCattleBtn);
            
            console.log('Ranch Phaser grid initialized');
        }
        
        // Create individual grid cells
        createGridCells() {
            // Initialize ranch grid if not already initialized
            if (!window.ranchGrid) {
                window.ranchGrid = {
                    cells: []
                };
            }
            
            // Fallback if cells array is undefined
            if (!window.ranchGrid.cells) {
                window.ranchGrid.cells = [];
            }
            
            // Generate default cells if none exist
            if (window.ranchGrid.cells.length === 0) {
                for (let i = 0; i < this.gridConfig.size * this.gridConfig.size; i++) {
                    window.ranchGrid.cells.push({
                        id: i,
                        state: 'empty',
                        growthStage: 0,
                        plantType: null
                    });
                }
            }
            
            console.log('Creating', window.ranchGrid.cells.length, 'grid cells for Ranch scene');
            
            const { startX, startY, size, cellSize, padding } = this.gridConfig;
            
            // Create cells based on the data
            window.ranchGrid.cells.forEach((cell, index) => {
                // Calculate position
                const col = index % size;
                const row = Math.floor(index / size);
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Determine texture based on state
                let texture = 'cell-empty';
                if (cell.state === 'planted') texture = 'cell-planted';
                if (cell.state === 'growing') texture = 'cell-growing';
                if (cell.state === 'harvestable') texture = 'cell-harvestable';
                
                // Create cell sprite
                const cellSprite = this.add.sprite(x, y, texture).setOrigin(0.5);
                cellSprite.displayWidth = cellSprite.displayHeight = cellSize;
                
                // Store reference to cell data
                cellSprite.setData('cellIndex', index);
                cellSprite.setData('cellData', cell);
                
                // Make cells interactive
                cellSprite.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        console.log('Cell clicked:', index);
                        this.handleCellClick(index);
                    });
                
                // Add to container
                this.gridContainer.add(cellSprite);
                
                // Save reference
                this.gridCells[index] = cellSprite;
            });
            
            console.log('Ranch grid cells created');
        }
        
        // Handle cell click
        handleCellClick(cellIndex) {
            const cell = window.ranchGrid.cells[cellIndex];
            if (!cell) return;
            
            console.log('Cell clicked:', cellIndex, 'State:', cell.state);
            
            // Handle based on state
            if (cell.state === 'empty') {
                // Plant
                cell.state = 'planted';
                cell.growthStage = 0;
                
                // Update sprite
                if (this.gridCells[cellIndex]) {
                    this.gridCells[cellIndex].setTexture('cell-planted');
                }
                
                console.log('Cell planted:', cellIndex);
            } else if (cell.state === 'harvestable') {
                // Harvest
                this.harvestCell(cellIndex);
            }
        }
        
        // Harvest a single cell
        harvestCell(cellIndex) {
            const cell = window.ranchGrid.cells[cellIndex];
            if (!cell || cell.state !== 'harvestable') return;
            
            // Reset cell
            cell.state = 'empty';
            
            // Update sprite
            if (this.gridCells[cellIndex]) {
                this.gridCells[cellIndex].setTexture('cell-empty');
            }
            
            // Reward player
            if (window.playerData) {
                window.playerData.cattleBalance = (window.playerData.cattleBalance || 0) + 10;
                
                // Add XP
                if (typeof window.addPlayerXP === 'function') {
                    window.addPlayerXP(10);
                }
            }
            
            console.log('Cell harvested:', cellIndex);
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Harvested crop! +10 $CATTLE', 'success');
            }
        }
        
        // Harvest all harvestable cells
        harvestAllRanchCells() {
            console.log('Harvest All triggered');
            
            // Fallback if ranchGrid or cells array is undefined
            if (!window.ranchGrid || !window.ranchGrid.cells) {
                window.ranchGrid = { cells: [] };
                console.log('Created empty ranch grid');
                return;
            }
            
            let harvestedCount = 0;
            
            // Find all harvestable cells and harvest them
            window.ranchGrid.cells.forEach((cell, index) => {
                if (cell.state === 'harvestable') {
                    this.harvestCell(index);
                    harvestedCount++;
                }
            });
            
            // Show result notification
            if (harvestedCount === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No crops ready to harvest yet!', 'info');
                }
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Harvested ${harvestedCount} crops!`, 'success');
                }
            }
        }
        
        // Sell all cattle
        sellAllCattle() {
            console.log('Sell All Cattle triggered');
            
            // Fallback if playerData is undefined
            if (!window.playerData) {
                window.playerData = {
                    cattle: [],
                    cattleBalance: 0
                };
            }
            
            // Fallback if cattle array is undefined
            if (!window.playerData.cattle) {
                window.playerData.cattle = [];
            }
            
            if (window.playerData.cattle.length === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No cattle to sell!', 'error');
                }
                return;
            }
            
            // Calculate value based on market conditions
            const marketPrice = window.playerData.resources && window.playerData.resources.cattlePrice 
                ? window.playerData.resources.cattlePrice 
                : 50; // Default price
            
            let totalValue = 0;
            const cattleCount = window.playerData.cattle.length;
            
            // Calculate total value
            window.playerData.cattle.forEach(cattle => {
                const baseValue = cattle.speed * 10;
                totalValue += baseValue;
            });
            
            // Apply market multiplier
            const finalAmount = Math.floor(totalValue * (marketPrice / 50));
            
            // Add to balance
            window.playerData.cattleBalance += finalAmount;
            
            // Clear cattle array
            window.playerData.cattle = [];
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Sold ${cattleCount} cattle for ${finalAmount} $CATTLE!`, 'success');
            }
            
            // Update UI
            if (typeof window.updateCattleInventory === 'function') {
                window.updateCattleInventory();
            }
            
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }
        }
        
        // Create a fallback texture if asset is missing
        createFallbackTexture(key) {
            console.log('Creating fallback texture for:', key);
            
            const graphics = this.make.graphics();
            
            // Set color based on key
            let color = 0x3a76c4; // Default blue
            
            if (key === 'cell-empty') color = 0x666666;
            if (key === 'cell-planted') color = 0x336633;
            if (key === 'cell-growing') color = 0x44aa44;
            if (key === 'cell-harvestable') color = 0x66ff66;
            if (key === 'cattle') color = 0x8b4513;
            
            // Draw shape
            graphics.fillStyle(color);
            graphics.fillRect(0, 0, 64, 64);
            graphics.lineStyle(2, 0xffffff);
            graphics.strokeRect(0, 0, 64, 64);
            
            // Add label
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(32, 32, 24);
            
            // Generate texture
            graphics.generateTexture(key, 64, 64);
            graphics.clear();
            
            console.log('Fallback texture created for:', key);
        }
        
        // Resize handler
        resize() {
            // Update background to fill screen
            const width = this.scale.width;
            const height = this.scale.height;
            
            if (this.bg) {
                this.bg.setDisplaySize(width, height);
            }
            
            // Reposition grid elements
            this.repositionGridElements();
        }
        
        // Reposition grid elements on resize
        repositionGridElements() {
            // Only if grid is initialized
            if (!this.gridConfig || !this.gridCells.length) return;
            
            const { size, cellSize, padding } = this.gridConfig;
            const totalWidth = (cellSize + padding) * size;
            const totalHeight = (cellSize + padding) * size;
            
            // New position
            const gridX = this.scale.width * 0.25;
            const gridY = this.scale.height * 0.5;
            
            // Update config
            this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
            this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
            
            // Reposition each cell
            this.gridCells.forEach((cellSprite, index) => {
                if (!cellSprite) return;
                
                const col = index % size;
                const row = Math.floor(index / size);
                const x = this.gridConfig.startX + col * (cellSize + padding);
                const y = this.gridConfig.startY + row * (cellSize + padding);
                
                cellSprite.setPosition(x, y);
            });
        }
    };

    // Define the NightScene class
    window.NightScene = class NightScene extends Phaser.Scene {
        constructor() {
            super('NightScene');
            
            // Grid configuration for this scene
            this.gridConfig = {
                size: 4, // 4x4 grid
                cellSize: 90,
                padding: 10,
                startX: 0,
                startY: 0
            };
            
            // Animation timers and cell references
            this.cellSprites = [];
            this.cellIndicators = [];
        }
        
        preload() {
            console.log('NightScene preload started');
            
            // Load essential assets
            this.load.image('shadow-bg', 'img/night-background.jpg');
            this.load.image('shadow-cell-empty', 'img/shadow-cell-empty.png');
            this.load.image('shadow-cell-active', 'img/shadow-cell-active.png');
            this.load.image('shadow-cell-ready', 'img/shadow-cell-ready.png');
            
            // Create fallback graphics for any missing textures when load completes
            this.load.on('complete', () => {
                console.log('NightScene assets loaded');
                
                // Ensure essential textures have fallbacks
                const essentialTextures = [
                    'shadow-bg', 'shadow-cell-empty', 'shadow-cell-active', 'shadow-cell-ready'
                ];
                
                essentialTextures.forEach(key => {
                    if (!this.textures.exists(key)) {
                        this.createFallbackTexture(key);
                    }
                });
            });
        }
        
        create() {
            console.log('NightScene create method started');
            
            // Get dimensions
            const width = this.scale.width;
            const height = this.scale.height;
            
            // Set up dark background
            this.bg = this.add.image(width/2, height/2, 'shadow-bg');
            this.bg.setDisplaySize(width, height);
            this.bg.setTint(0x220022); // Dark purple tint
            
            // Create a container for our shadow grid elements
            this.shadowContainer = this.add.container(0, 0);
            
            // Initialize the shadow grid
            this.initPhaserGrid();
            
            // Initialize shadow market data if not already set
            if (!window.shadowGrid) {
                window.shadowGrid = {
                    cells: [],
                    size: 4,
                    multiplier: 1.0,
                    cycleInterval: null
                };
                
                // Generate cells
                for (let i = 0; i < 16; i++) {
                    window.shadowGrid.cells.push({
                        id: i,
                        state: 'empty',
                        stage: 0,
                        maxStage: 3,
                        supply: Math.floor(Math.random() * 5) + 3,
                        demand: Math.floor(Math.random() * 5) + 3
                    });
                }
                
                console.log('Shadow grid initialized with', window.shadowGrid.cells.length, 'cells');
            }
            
            // Add resize listener
            this.scale.on('resize', this.resize, this);
            
            console.log('NightScene created successfully');
        }
        
        // Initialize the Phaser-based shadow grid
        initPhaserGrid() {
            console.log('Initializing Night scene Phaser grid');
            
            // Calculate grid dimensions
            const { size, cellSize, padding } = this.gridConfig;
            const totalWidth = (cellSize + padding) * size;
            const totalHeight = (cellSize + padding) * size;
            
            // Position grid on right side of screen
            const gridX = this.scale.width * 0.25;
            const gridY = this.scale.height * 0.5;
            
            // Calculate starting position (top-left of grid)
            this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
            this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
            
            // Create grid container
            this.gridContainer = this.add.container(0, 0);
            this.shadowContainer.add(this.gridContainer);
            
            // Create grid header
            const gridHeader = this.add.text(gridX, gridY - totalHeight/2 - 40, 'Ether Range', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.shadowContainer.add(gridHeader);
            
            // Create the grid cells
            this.createGridCells();
            
            // Add distill all button
            const distillAllBtn = this.add.text(gridX - 100, gridY + totalHeight/2 + 40, '🧪 Distill All', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#3a0066',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            
            distillAllBtn.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    console.log('Distill All button clicked');
                    this.distillAllShadowCells();
                });
            
            // Add sell potions button
            const sellPotionsBtn = this.add.text(gridX + 100, gridY + totalHeight/2 + 40, '💰 Sell Potions', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#6a2ca0',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5);
            
            sellPotionsBtn.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    console.log('Sell Potions button clicked');
                    this.sellAllPotions();
                });
            
            this.shadowContainer.add(distillAllBtn);
            this.shadowContainer.add(sellPotionsBtn);
            
            console.log('Night scene Phaser grid initialized');
        }
        
        // Create shadow grid cells
        createGridCells() {
            // Fallback if shadowGrid or cells array is undefined
            if (!window.shadowGrid || !window.shadowGrid.cells) {
                window.shadowGrid = {
                    cells: [],
                    size: 4,
                    multiplier: 1.0
                };
                
                // Generate cells
                for (let i = 0; i < 16; i++) {
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
            
            console.log('Creating', window.shadowGrid.cells.length, 'grid cells for Night scene');
            
            const { startX, startY, size, cellSize, padding } = this.gridConfig;
            
            // Create cells based on the data
            window.shadowGrid.cells.forEach((cell, index) => {
                // Calculate position
                const col = index % size;
                const row = Math.floor(index / size);
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Determine texture based on state
                let texture = 'shadow-cell-empty';
                if (cell.state === 'active') texture = 'shadow-cell-active';
                if (cell.state === 'ready') texture = 'shadow-cell-ready';
                
                // Create cell sprite
                const cellSprite = this.add.sprite(x, y, texture).setOrigin(0.5);
                cellSprite.displayWidth = cellSprite.displayHeight = cellSize;
                
                // Store reference to cell data
                cellSprite.setData('cellIndex', index);
                cellSprite.setData('cellData', cell);
                
                // Make cells interactive
                cellSprite.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        console.log('Shadow cell clicked:', index);
                        this.handleCellClick(index);
                    });
                
                // Add to container
                this.gridContainer.add(cellSprite);
                
                // Save reference
                this.cellSprites[index] = cellSprite;
                
                // Add indicator for stage
                const indicator = this.add.text(x, y, cell.stage + '/' + cell.maxStage, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 1
                }).setOrigin(0.5);
                
                this.gridContainer.add(indicator);
                this.cellIndicators[index] = indicator;
            });
            
            console.log('Night scene grid cells created');
        }
        
        // Handle shadow cell click
        handleCellClick(cellIndex) {
            const cell = window.shadowGrid.cells[cellIndex];
            if (!cell) return;
            
            console.log('Shadow cell clicked:', cellIndex, 'State:', cell.state);
            
            // Handle based on state
            if (cell.state === 'empty') {
                // Activate cell
                cell.state = 'active';
                cell.stage = 0;
                
                // Update sprite
                if (this.cellSprites[cellIndex]) {
                    this.cellSprites[cellIndex].setTexture('shadow-cell-active');
                }
                
                console.log('Shadow cell activated:', cellIndex);
            } else if (cell.state === 'ready') {
                // Distill
                this.distillCell(cellIndex);
            }
        }
        
        // Distill a single shadow cell
        distillCell(cellIndex) {
            const cell = window.shadowGrid.cells[cellIndex];
            if (!cell || cell.state !== 'ready') return;
            
            // Reset cell
            cell.state = 'empty';
            cell.stage = 0;
            
            // Update sprite
            if (this.cellSprites[cellIndex]) {
                this.cellSprites[cellIndex].setTexture('shadow-cell-empty');
            }
            
            // Update indicator
            if (this.cellIndicators[cellIndex]) {
                this.cellIndicators[cellIndex].setText(cell.stage + '/' + cell.maxStage);
            }
            
            // Craft a potion
            if (typeof window.craftPotion === 'function') {
                window.craftPotion();
            } else {
                // Fallback if function doesn't exist
                this.craftPotion();
            }
            
            console.log('Shadow cell distilled:', cellIndex);
        }
        
        // Fallback potion crafting function
        craftPotion() {
            console.log('Crafting potion (fallback)');
            
            // Initialize playerData if not exists
            if (!window.playerData) {
                window.playerData = {
                    cattleBalance: 100,
                    potionCollection: []
                };
            }
            
            // Initialize potion collection if not exists
            if (!window.playerData.potionCollection) {
                window.playerData.potionCollection = [];
            }
            
            // Craft a new potion with random potency
            const potency = Math.floor(Math.random() * 10) + 1;
            const potion = {
                id: Date.now(),
                potency: potency,
                created: new Date().toISOString(),
                value: 25 + (potency * 5)
            };
            
            // Add to collection
            window.playerData.potionCollection.push(potion);
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Crafted a potion with potency ${potency}/10!`, 'success');
            }
            
            // Update UI
            if (typeof window.updatePotionInventory === 'function') {
                window.updatePotionInventory();
            }
        }
        
        // Distill all ready shadow cells
        distillAllShadowCells() {
            console.log('Distill All triggered');
            
            // Fallback if shadowGrid or cells array is undefined
            if (!window.shadowGrid || !window.shadowGrid.cells) {
                window.shadowGrid = {
                    cells: [],
                    size: 4,
                    multiplier: 1.0
                };
                
                console.log('Created empty shadow grid');
                return;
            }
            
            let distilledCount = 0;
            
            // Find all ready cells and distill them
            window.shadowGrid.cells.forEach((cell, index) => {
                if (cell.state === 'ready') {
                    this.distillCell(index);
                    distilledCount++;
                }
            });
            
            // Show result notification
            if (distilledCount === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No cells ready for distillation', 'info');
                }
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Distilled ${distilledCount} cells!`, 'success');
                }
            }
        }
        
        // Sell all potions
        sellAllPotions() {
            console.log('Sell All Potions triggered');
            
            // Fallback if playerData is undefined
            if (!window.playerData) {
                window.playerData = {
                    potionCollection: [],
                    cattleBalance: 0
                };
            }
            
            // Fallback if potion collection is undefined
            if (!window.playerData.potionCollection) {
                window.playerData.potionCollection = [];
            }
            
            if (window.playerData.potionCollection.length === 0) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('No potions to sell!', 'error');
                }
                return;
            }
            
            // Calculate value based on market conditions
            const marketMultiplier = window.shadowGrid && window.shadowGrid.multiplier 
                ? window.shadowGrid.multiplier 
                : 1.0;
            
            let totalValue = 0;
            const potionCount = window.playerData.potionCollection.length;
            
            // Calculate total value
            window.playerData.potionCollection.forEach(potion => {
                const baseValue = potion.value || (25 + potion.potency * 5);
                const potionValue = Math.floor(baseValue * marketMultiplier);
                totalValue += potionValue;
            });
            
            // Add to balance
            window.playerData.cattleBalance += totalValue;
            
            // Clear potions array
            window.playerData.potionCollection = [];
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Sold ${potionCount} potions for ${totalValue} $CATTLE!`, 'success');
            }
            
            // Update UI
            if (typeof window.updatePotionInventory === 'function') {
                window.updatePotionInventory();
            }
            
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }
        }
        
        // Create a fallback texture if asset is missing
        createFallbackTexture(key) {
            console.log('Creating fallback texture for:', key);
            
            const graphics = this.make.graphics();
            
            // Set color based on key
            let color = 0x330066; // Default purple
            
            if (key === 'shadow-bg') color = 0x220022;
            if (key === 'shadow-cell-empty') color = 0x330044;
            if (key === 'shadow-cell-active') color = 0x6600aa;
            if (key === 'shadow-cell-ready') color = 0xaa00ff;
            
            // Draw shape
            graphics.fillStyle(color);
            graphics.fillRect(0, 0, 64, 64);
            graphics.lineStyle(2, 0xaa66ff);
            graphics.strokeRect(0, 0, 64, 64);
            
            // Add label
            if (key !== 'shadow-bg') {
                graphics.fillStyle(0xccaaff);
                graphics.fillCircle(32, 32, 16);
            }
            
            // Generate texture
            graphics.generateTexture(key, 64, 64);
            graphics.clear();
            
            console.log('Fallback texture created for:', key);
        }
        
        // Resize handler
        resize() {
            // Update background to fill screen
            const width = this.scale.width;
            const height = this.scale.height;
            
            if (this.bg) {
                this.bg.setDisplaySize(width, height);
            }
            
            // Reposition grid elements
            this.repositionGridElements();
        }
        
        // Reposition grid elements on resize
        repositionGridElements() {
            // Only if grid is initialized
            if (!this.gridConfig || !this.cellSprites.length) return;
            
            const { size, cellSize, padding } = this.gridConfig;
            const totalWidth = (cellSize + padding) * size;
            const totalHeight = (cellSize + padding) * size;
            
            // New position
            const gridX = this.scale.width * 0.25;
            const gridY = this.scale.height * 0.5;
            
            // Update config
            this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
            this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
            
            // Reposition each cell and its indicator
            this.cellSprites.forEach((cellSprite, index) => {
                if (!cellSprite) return;
                
                const col = index % size;
                const row = Math.floor(index / size);
                const x = this.gridConfig.startX + col * (cellSize + padding);
                const y = this.gridConfig.startY + row * (cellSize + padding);
                
                cellSprite.setPosition(x, y);
                
                // Also reposition the indicator
                if (this.cellIndicators[index]) {
                    this.cellIndicators[index].setPosition(x, y);
                }
            });
        }
    };

    // Simple fallback function for notifications if not already defined
    if (typeof window.showNotification !== 'function') {
        window.showNotification = function(message, type = 'info') {
            console.log(`Notification (${type}):`, message);
            
            // Create a simple notification element if doesn't exist
            let notificationElement = document.getElementById('notification');
            
            if (!notificationElement) {
                notificationElement = document.createElement('div');
                notificationElement.id = 'notification';
                notificationElement.style.position = 'fixed';
                notificationElement.style.top = '20px';
                notificationElement.style.right = '20px';
                notificationElement.style.padding = '10px 15px';
                notificationElement.style.borderRadius = '5px';
                notificationElement.style.color = '#fff';
                notificationElement.style.fontFamily = 'Arial';
                notificationElement.style.zIndex = '1000';
                notificationElement.style.opacity = '0';
                notificationElement.style.transition = 'opacity 0.3s';
                
                document.body.appendChild(notificationElement);
            }
            
            // Set color based on type
            let bgColor = '#3a76c4'; // Default blue for info
            if (type === 'success') bgColor = '#3a9c4c';
            if (type === 'error') bgColor = '#c43a3a';
            if (type === 'warning') bgColor = '#c4a03a';
            
            notificationElement.style.backgroundColor = bgColor;
            notificationElement.textContent = message;
            
            // Show notification
            notificationElement.style.opacity = '1';
            
            // Hide after 3 seconds
            setTimeout(() => {
                notificationElement.style.opacity = '0';
            }, 3000);
        };
    }
    
    console.log('Game (2).js initialization complete');

})();