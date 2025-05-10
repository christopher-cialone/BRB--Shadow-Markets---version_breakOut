// Connect to server
const socket = io();

// Game state
let playerData = {
    name: 'Cowboy',
    archetype: 'Entrepreneur',
    characterType: 'the-kid',
    cattle: 0,
    cattleBalance: 100,
    hay: 100,
    water: 100,
    ether: 0,
    barnCapacity: 100,
    cattleCollection: [],
    potionCollection: [],
    stats: {
        racesWon: 0,
        racesLost: 0,
        cattleBred: 0,
        potionsCrafted: 0,
        totalEarned: 0,
        totalBurned: 0,
        plantsHarvested: 0,
        potionsDistilled: 0
    }
};

let marketPrice = 1.0;
let currentScene = 'main-menu';
let wagerAmount = 10;

// Grid state for ranch and shadow market
const ranchGrid = {
    size: 5,
    cells: [],
    growthTimer: 60,
    growthInterval: null,
    multiplier: 1.0,
    // Growth states: empty, planted, growing, harvestable
};

const shadowGrid = {
    size: 4,
    cells: [],
    cycleTimer: 30,
    cycleInterval: null,
    marketState: 'stable', // can be stable, volatile, booming
    multiplier: 1.0,
    // Potion states: empty, brewing, distilling, ready
};

// DOM elements
const mainMenu = document.getElementById('main-menu');
const ranchUI = document.getElementById('ranch-ui');
const saloonUI = document.getElementById('saloon-ui');
const nightUI = document.getElementById('night-ui');
const profileUI = document.getElementById('profile-ui');
const notification = document.getElementById('notification');
const resultModal = document.getElementById('result-modal');

// Define the MainMenuScene class - simplified for stability
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }
    
    preload() {
        // Load the background
        this.load.image('menu-bg', 'img/game-background.jpeg');
    }
    
    create() {
        // Get the canvas dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Set up background with desert tint
        this.bg = this.add.image(width/2, height/2, 'menu-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0xf5deb3); // Warm desert tint
        
        // Add a semi-transparent overlay to make UI more readable
        this.overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.3);
        
        // Title text - "Bull Run Boost"
        this.titleText = this.add.text(width / 2, height * 0.15, 'Bull Run Boost', {
            fontFamily: 'Anta',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#6a2ca0',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtitle - "Shadow Markets"
        this.subtitleText = this.add.text(width / 2, this.titleText.y + 80, 'Shadow Markets', {
            fontFamily: 'Anta',
            fontSize: '36px',
            color: '#00ccff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Player name input field hint
        this.nameText = this.add.text(width / 2, height * 0.35, 'Enter your name in the field below:', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Archetype selection title
        this.archetypeTitle = this.add.text(width / 2, height * 0.5, 'Choose Your Archetype:', {
            fontFamily: 'Roboto',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Entrepreneur card background
        this.entrepreneurCardBg = this.add.rectangle(width * 0.35, height * 0.65, 250, 200, 0x222222, 0.7);
        this.entrepreneurCardBg.setStrokeStyle(3, 0x00ffff);
        
        // Entrepreneur card title
        this.entrepreneurTitle = this.add.text(width * 0.35, height * 0.65 - 70, 'Entrepreneur', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Entrepreneur card description
        this.entrepreneurDesc = this.add.text(width * 0.35, height * 0.65 + 20, '+10% $CATTLE\nearning rate', {
            fontFamily: 'Roboto',
            fontSize: '18px',
            color: '#00ffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Make entrepreneur card interactive
        this.entrepreneurCardBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Set selected
                this.entrepreneurCardBg.setStrokeStyle(3, 0x00ff00);
                playerData.archetype = 'Entrepreneur';
                
                // Update HTML selection too
                const htmlCards = document.querySelectorAll('.archetype-card');
                htmlCards.forEach(card => {
                    if (card.dataset.archetype === 'Entrepreneur') {
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                });
            });
        
        // Adventurer card background - disabled
        this.adventurerCardBg = this.add.rectangle(width * 0.65, height * 0.65, 250, 200, 0x222222, 0.7);
        this.adventurerCardBg.setStrokeStyle(3, 0x555555);
        
        // Adventurer card title
        this.adventurerTitle = this.add.text(width * 0.65, height * 0.65 - 70, 'Adventurer', {
            fontFamily: 'Roboto',
            fontSize: '24px',
            color: '#888888',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Adventurer card description
        this.adventurerDesc = this.add.text(width * 0.65, height * 0.65 + 20, '+10% heist\nsuccess rate', {
            fontFamily: 'Roboto',
            fontSize: '18px',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);
        
        // Disabled overlay
        this.disabledText = this.add.text(width * 0.65, height * 0.65, 'Coming Soon', {
            fontFamily: 'Roboto',
            fontSize: '20px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setAngle(-15);
        
        // Start button
        this.startBtnBg = this.add.rectangle(width / 2, height * 0.85, 200, 60, 0x6a2ca0);
        this.startBtnBg.setStrokeStyle(2, 0xff44cc);
        
        // Button text
        this.startBtnText = this.add.text(width / 2, height * 0.85, 'Start Game', {
            fontFamily: 'Anta',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Make start button interactive
        this.startBtnBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.startGame();
            });
            
        // Set initial selection based on playerData
        if (playerData.archetype === 'Entrepreneur') {
            this.entrepreneurCardBg.setStrokeStyle(3, 0x00ff00);
        }
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }
    
    startGame() {
        // Get player name from HTML input
        const nameInput = document.getElementById('player-name');
        if (nameInput) {
            playerData.name = nameInput.value || 'Cowboy';
        }
        
        // Send to server
        socket.emit('new-player', {
            name: playerData.name,
            archetype: playerData.archetype
        });
        
        // Hide the main menu HTML element
        const mainMenuElement = document.getElementById('main-menu');
        if (mainMenuElement) {
            mainMenuElement.classList.add('hidden');
        }
        
        // Switch to ranch scene
        switchScene('ranch');
        
        // Start RanchScene in Phaser too
        this.scene.start('RanchScene');
    }
    
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Resize and reposition background
        if (this.bg) {
            this.bg.setPosition(width/2, height/2);
            this.bg.setDisplaySize(width, height);
        }
        
        if (this.overlay) {
            this.overlay.setPosition(width/2, height/2);
            this.overlay.width = width;
            this.overlay.height = height;
        }
        
        // Reposition elements
        if (this.titleText) this.titleText.setPosition(width / 2, height * 0.15);
        if (this.subtitleText) this.subtitleText.setPosition(width / 2, this.titleText.y + 80);
        if (this.nameText) this.nameText.setPosition(width / 2, height * 0.35);
        if (this.archetypeTitle) this.archetypeTitle.setPosition(width / 2, height * 0.5);
        
        // Reposition entrepreneur card
        if (this.entrepreneurCardBg) this.entrepreneurCardBg.setPosition(width * 0.35, height * 0.65);
        if (this.entrepreneurTitle) this.entrepreneurTitle.setPosition(width * 0.35, height * 0.65 - 70);
        if (this.entrepreneurDesc) this.entrepreneurDesc.setPosition(width * 0.35, height * 0.65 + 20);
        
        // Reposition adventurer card
        if (this.adventurerCardBg) this.adventurerCardBg.setPosition(width * 0.65, height * 0.65);
        if (this.adventurerTitle) this.adventurerTitle.setPosition(width * 0.65, height * 0.65 - 70);
        if (this.adventurerDesc) this.adventurerDesc.setPosition(width * 0.65, height * 0.65 + 20);
        if (this.disabledText) this.disabledText.setPosition(width * 0.65, height * 0.65);
        
        // Reposition start button
        if (this.startBtnBg) this.startBtnBg.setPosition(width / 2, height * 0.85);
        if (this.startBtnText) this.startBtnText.setPosition(width / 2, height * 0.85);
    }
}

// Define the RanchScene class - simplified for stability
class RanchScene extends Phaser.Scene {
    constructor() {
        super('RanchScene');
    }
    
    preload() {
        // Load the background
        this.load.image('game-bg', 'img/game-background.jpeg');
        this.load.image('barn', 'https://i.imgur.com/t32QEZB.png');
    }
    
    create() {
        // Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Set up background
        this.bg = this.add.image(width/2, height/2, 'game-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0xffeedd); // Warm daylight tint
        
        // Add barn to ranch scene
        this.barn = this.add.image(width * 0.7, height * 0.4, 'barn');
        this.barn.setScale(0.5);
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }
    
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Resize background
        if (this.bg) {
            this.bg.setPosition(width/2, height/2);
            this.bg.setDisplaySize(width, height);
        }
        
        // Reposition elements
        if (this.barn) {
            this.barn.x = width * 0.7;
            this.barn.y = height * 0.4;
        }
    }
}

// Define the SaloonScene class - simplified for stability
class SaloonScene extends Phaser.Scene {
    constructor() {
        super('SaloonScene');
    }
    
    preload() {
        // Load the background
        this.load.image('game-bg', 'img/game-background.jpeg');
    }
    
    create() {
        // Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Set up background
        this.bg = this.add.image(width/2, height/2, 'game-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0xddbb88); // Warm indoor lighting tint
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }
    
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Resize background
        if (this.bg) {
            this.bg.setPosition(width/2, height/2);
            this.bg.setDisplaySize(width, height);
        }
    }
}

// Define the NightScene class with shadow grid integration
class NightScene extends Phaser.Scene {
    constructor() {
        super('NightScene');
        
        // Store grid cell sprites and text objects
        this.gridCells = [];
        this.gridTexts = [];
        this.tooltips = [];
    }
    
    preload() {
        // Load background and grid assets
        this.load.image('game-bg', 'img/game-background.jpeg');
        
        // Load shadow grid assets (using PNG format for better compatibility)
        this.load.image('cell-empty', 'img/png/shadow-cell-empty.png');
        this.load.image('cell-brewing', 'img/png/shadow-cell-brewing.png');
        this.load.image('cell-distilling', 'img/shadow-cell-distilling.svg');
        this.load.image('cell-ready', 'img/shadow-cell-ready.svg');
        this.load.image('potion', 'img/potion.svg');
        this.load.image('bubble', 'img/bubble.svg');
        this.load.image('tooltip-bg', 'img/tooltip-bg.svg');
        
        console.log("Night scene preloaded assets");
    }
    
    create() {
        // Get dimensions - use fixed dimensions for the shadow grid container
        const containerWidth = 450;
        const containerHeight = 450;
        
        // Set up simple background with gradient that matches the grid cells style
        this.bg = this.add.rectangle(containerWidth/2, containerHeight/2, containerWidth, containerHeight, 0x1a0f33);
        
        // Add a grid pattern background instead of image
        const gridPattern = this.add.grid(
            containerWidth/2, 
            containerHeight/2,
            containerWidth, 
            containerHeight, 
            20, 
            20, 
            0, 
            0, 
            0x3a2066, 
            0.2
        );
        
        // Create shadow market title at the top of the container
        this.marketTitle = this.add.text(containerWidth/2, 40, 'Intelligence Network', {
            fontFamily: 'Anta',
            fontSize: '28px',
            color: '#cc00ff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { color: '#aa00ff', fill: true, offsetX: 1, offsetY: 1, blur: 4 }
        }).setOrigin(0.5);
        
        // Create an instruction text
        this.instructionText = this.add.text(containerWidth/2, 80, 'Gather data crystals to craft potions', {
            fontFamily: 'Roboto',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Create a container for our Shadow Grid in the center
        this.gridContainer = this.add.container(containerWidth/2, containerHeight/2);
        
        // Create market state indicator
        this.marketStateText = this.add.text(containerWidth/2, containerHeight - 60, 'Network: Stable', {
            fontFamily: 'Roboto',
            fontSize: '18px',
            color: '#00ffff'
        }).setOrigin(0.5);
        
        // Add helpful tip text
        this.tipText = this.add.text(containerWidth/2, containerHeight - 30, 'Click empty cells to start crystal formation', {
            fontFamily: 'Roboto',
            fontSize: '14px',
            color: '#aaaaff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Initialize the shadow grid
        this.initShadowGridPhaser();
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
        
        console.log("NightScene created with container dimensions:", containerWidth, containerHeight);
    }
    
    // Initialize the Phaser version of shadow grid
    initShadowGridPhaser() {
        // Clear previous grid if it exists
        this.gridCells.forEach(sprite => sprite.destroy());
        this.gridTexts.forEach(text => text.destroy());
        this.tooltips.forEach(tooltip => tooltip.destroy());
        this.gridCells = [];
        this.gridTexts = [];
        this.tooltips = [];
        
        // Initialize cells if needed
        if (shadowGrid.cells.length === 0) {
            for (let i = 0; i < shadowGrid.size * shadowGrid.size; i++) {
                shadowGrid.cells.push({
                    id: i,
                    state: 'empty',
                    stage: 0,
                    maxStage: 3,
                    supply: Math.floor(Math.random() * 5) + 3,  // Random supply value between 3-7
                    demand: Math.floor(Math.random() * 5) + 3   // Random demand value between 3-7
                });
            }
        }
        
        // Grid configuration for container
        const gridSize = shadowGrid.size;
        const cellSize = 70; // Smaller cell size to fit in container
        const padding = 8;  // Slightly smaller padding
        const totalWidth = (cellSize + padding) * gridSize;
        
        // Calculate the starting position (top-left of the grid)
        const startX = -totalWidth / 2 + cellSize / 2;
        const startY = -totalWidth / 2 + cellSize / 2;
        
        // Create the grid cells
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cellIndex = row * gridSize + col;
                const cell = shadowGrid.cells[cellIndex];
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Determine which sprite to use based on state
                let spriteName = 'cell-empty';
                if (cell.state === 'brewing') spriteName = 'cell-brewing';
                if (cell.state === 'distilling') spriteName = 'cell-distilling';
                if (cell.state === 'ready') spriteName = 'cell-ready';
                
                // Instead of loading sprites, create grid cells similar to ranch cells
                // Create a rectangle for the cell background
                const cellBg = this.add.rectangle(x, y, cellSize, cellSize, 0x1a0f33);
                cellBg.setStrokeStyle(2, 0x8a2be2);
                cellBg.setInteractive({ useHandCursor: true });
                
                // Add different visual indicators based on state
                let cellContent;
                let cellLabel = '';
                
                if (cell.state === 'empty') {
                    cellContent = this.add.text(x, y, '📊', {
                        fontSize: '24px'
                    }).setOrigin(0.5);
                    cellLabel = 'Data Node';
                } else if (cell.state === 'brewing') {
                    cellContent = this.add.text(x, y, '💾', {
                        fontSize: '24px'
                    }).setOrigin(0.5);
                    cellLabel = 'Collecting';
                } else if (cell.state === 'distilling') {
                    cellContent = this.add.text(x, y, '🔮', {
                        fontSize: '24px'
                    }).setOrigin(0.5);
                    cellLabel = 'Processing';
                } else if (cell.state === 'ready') {
                    cellContent = this.add.text(x, y, '💎', {
                        fontSize: '24px'
                    }).setOrigin(0.5);
                    cellLabel = 'Crystal Ready';
                }
                
                // Add a label below the icon
                const label = this.add.text(x, y + cellSize/2 - 12, cellLabel, {
                    fontFamily: 'Roboto',
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
                
                // Group cell elements
                const cellGroup = this.add.container(0, 0, [cellBg, cellContent, label]);
                
                // Add cell to our container
                this.gridContainer.add(cellGroup);
                this.gridCells.push({ bg: cellBg, content: cellContent, label: label, container: cellGroup });
                
                // Add stage indicator text for non-empty cells
                if (cell.state !== 'empty') {
                    const stageText = this.add.text(x, y, `${cell.stage}/${cell.maxStage}`, {
                        fontFamily: 'Roboto',
                        fontSize: '14px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setOrigin(0.5);
                    
                    this.gridContainer.add(stageText);
                    this.gridTexts.push(stageText);
                } else {
                    // Add empty text to keep the arrays aligned
                    const emptyText = this.add.text(x, y, '', {
                        fontFamily: 'Roboto',
                        fontSize: '14px'
                    }).setOrigin(0.5);
                    this.gridContainer.add(emptyText);
                    this.gridTexts.push(emptyText);
                }
                
                // Create tooltip as a rectangle with text
                const tooltipBg = this.add.rectangle(x, y - 60, 140, 80, 0x1a0f33, 0.9);
                tooltipBg.setStrokeStyle(1, 0x8a2be2);
                tooltipBg.visible = false;
                
                const supplyDemandText = this.add.text(x, y - 60, 
                    `Intel: ${cell.supply}\nDemand: ${cell.demand}`, {
                    fontFamily: 'Roboto',
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
                supplyDemandText.visible = false;
                
                // Group tooltip elements
                const tooltip = { bg: tooltipBg, text: supplyDemandText };
                this.tooltips.push(tooltip);
                this.gridContainer.add([tooltipBg, supplyDemandText]);
                
                // Hover events for tooltip
                cellBg.on('pointerover', () => {
                    tooltipBg.visible = true;
                    supplyDemandText.visible = true;
                    
                    // Update tooltip text with current values and tip
                    let tipText = '';
                    
                    if (cell.state === 'empty') {
                        tipText = 'Click to start collection';
                    } else if (cell.state === 'brewing') {
                        tipText = `Collecting: ${cell.stage}/${cell.maxStage}`;
                    } else if (cell.state === 'distilling') {
                        tipText = `Processing: ${cell.stage}/${cell.maxStage}`;
                    } else if (cell.state === 'ready') {
                        tipText = 'Click to extract crystal';
                    }
                    
                    const marketTip = this.getMarketTip(cell);
                    supplyDemandText.setText(
                        `Intel: ${cell.supply}\nDemand: ${cell.demand}\n${marketTip}\n${tipText}`
                    );
                });
                
                cellBg.on('pointerout', () => {
                    tooltipBg.visible = false;
                    supplyDemandText.visible = false;
                });
                
                // Click event for cell interaction
                cellBg.on('pointerdown', () => {
                    handleShadowCellClick(cellIndex);
                    
                    // Update cell appearance after click
                    this.updateCellAppearance(cellIndex);
                });
                
                // Set initial animations based on state
                if (cell.state === 'brewing') {
                    this.tweens.add({
                        targets: cellContent,
                        scale: { from: 1, to: 1.2 },
                        duration: 800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                } else if (cell.state === 'distilling') {
                    this.tweens.add({
                        targets: cellContent,
                        angle: 360,
                        duration: 3000,
                        repeat: -1,
                        ease: 'Linear'
                    });
                } else if (cell.state === 'ready') {
                    this.addReadyGlow(cellBg);
                    
                    this.tweens.add({
                        targets: cellContent,
                        y: '-=10',
                        duration: 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        }
        
        // Update market state display
        this.updateMarketStateDisplay();
        
        // Ensure grid cycle is running
        if (!shadowGrid.cycleInterval) {
            startShadowMarketCycle();
        }
    }
    
    // Helper to get market tip based on supply and demand
    getMarketTip(cell) {
        if (cell.supply > cell.demand) {
            return "Low value, wait";
        } else if (cell.supply < cell.demand) {
            return "High value, sell!";
        } else {
            return "Balanced market";
        }
    }
    
    // Add bubbling animation to brewing cells
    addBrewingAnimation(cellSprite, x, y) {
        // Create bubbles that rise up
        const bubble1 = this.add.image(x - 15, y + 10, 'bubble');
        const bubble2 = this.add.image(x + 10, y + 20, 'bubble');
        bubble1.setDisplaySize(12, 12);
        bubble2.setDisplaySize(8, 8);
        this.gridContainer.add([bubble1, bubble2]);
        
        // Animate the bubbles rising
        this.tweens.add({
            targets: bubble1,
            y: y - 30,
            alpha: { from: 0.7, to: 0 },
            duration: 2000,
            repeat: -1,
            ease: 'Sine.easeOut'
        });
        
        this.tweens.add({
            targets: bubble2,
            y: y - 30,
            alpha: { from: 0.7, to: 0 },
            duration: 2500,
            delay: 500,
            repeat: -1,
            ease: 'Sine.easeOut'
        });
    }
    
    // Add glow effect to ready cells
    addReadyGlow(cellElement) {
        // Add a subtle pulsing glow effect to background
        this.tweens.add({
            targets: cellElement,
            strokeThickness: { from: 3, to: 5 },
            duration: 800,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
    
    // Update the appearance of a specific cell
    updateCellAppearance(cellIndex) {
        const cell = shadowGrid.cells[cellIndex];
        const cellElements = this.gridCells[cellIndex];
        const stageText = this.gridTexts[cellIndex];
        
        if (!cellElements) return;
        
        // Update cell content based on state
        if (cell.state === 'empty') {
            cellElements.content.setText('📊');
            cellElements.label.setText('Data Node');
            if (stageText) stageText.setText('');
            
            // Remove any animations
            this.tweens.killTweensOf(cellElements.bg);
            this.tweens.killTweensOf(cellElements.content);
            
            // Reset stroke color
            cellElements.bg.setStrokeStyle(2, 0x8a2be2);
        } 
        else if (cell.state === 'brewing') {
            cellElements.content.setText('💾');
            cellElements.label.setText('Collecting');
            if (stageText) stageText.setText(`${cell.stage}/${cell.maxStage}`);
            
            // Add brewing animation - pulse for data collection
            this.tweens.add({
                targets: cellElements.content,
                scale: { from: 1, to: 1.2 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Change stroke color
            cellElements.bg.setStrokeStyle(2, 0x00ffff);
        } 
        else if (cell.state === 'distilling') {
            cellElements.content.setText('🔮');
            cellElements.label.setText('Processing');
            if (stageText) stageText.setText(`${cell.stage}/${cell.maxStage}`);
            
            // Remove any animations and add processing animation
            this.tweens.killTweensOf(cellElements.bg);
            this.tweens.killTweensOf(cellElements.content);
            
            // Add rotation animation for processing
            this.tweens.add({
                targets: cellElements.content,
                angle: 360,
                duration: 3000,
                repeat: -1,
                ease: 'Linear'
            });
            
            // Change stroke color
            cellElements.bg.setStrokeStyle(2, 0xff00ff);
        } 
        else if (cell.state === 'ready') {
            cellElements.content.setText('💎');
            cellElements.label.setText('Crystal Ready');
            if (stageText) stageText.setText(`${cell.stage}/${cell.maxStage}`);
            
            // Remove any animations
            this.tweens.killTweensOf(cellElements.bg);
            this.tweens.killTweensOf(cellElements.content);
            
            // Add ready glow animation
            this.addReadyGlow(cellElements.bg);
            
            // Add upward bounce animation for crystal ready
            this.tweens.add({
                targets: cellElements.content,
                y: '-=10',
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Change stroke color
            cellElements.bg.setStrokeStyle(3, 0x00ff00);
        }
    }
    
    // Update market state display based on current state
    updateMarketStateDisplay() {
        let stateText = '';
        let stateColor = '';
        let tipText = '';
        
        switch (shadowGrid.marketState) {
            case 'stable':
                stateText = 'Network: Stable';
                stateColor = '#00ffff';
                tipText = 'Normal crystal yield';
                break;
            case 'volatile':
                stateText = 'Network: Volatile';
                stateColor = '#ffaa00';
                tipText = 'Unpredictable yields (+50%)';
                break;
            case 'booming':
                stateText = 'Network: Surging';
                stateColor = '#00ff00';
                tipText = 'High crystal yield (2x)';
                break;
        }
        
        this.marketStateText.setText(stateText);
        this.marketStateText.setColor(stateColor);
        
        // Update tip text
        if (this.tipText) {
            this.tipText.setText(tipText);
        }
    }
    
    // Update all cells with current data
    updateAllCells() {
        shadowGrid.cells.forEach((cell, index) => {
            this.updateCellAppearance(index);
        });
        
        this.updateMarketStateDisplay();
    }
    
    resize(gameSize) {
        // Use fixed dimensions for container instead of full screen
        const containerWidth = 450;
        const containerHeight = 450;
        
        // No need to resize the background as it stays fixed within the container
        if (this.bg) {
            this.bg.setPosition(containerWidth/2, containerHeight/2);
            this.bg.setDisplaySize(containerWidth, containerHeight);
        }
        
        if (this.overlay) {
            this.overlay.setPosition(containerWidth/2, containerHeight/2);
            this.overlay.width = containerWidth;
            this.overlay.height = containerHeight;
        }
        
        // Keep elements at fixed positions within the container
        if (this.marketTitle) this.marketTitle.setPosition(containerWidth/2, 40);
        if (this.marketStateText) this.marketStateText.setPosition(containerWidth/2, 80);
        if (this.gridContainer) this.gridContainer.setPosition(containerWidth/2, containerHeight/2);
        
        console.log("NightScene resized to container dimensions:", containerWidth, containerHeight);
    }
}

// Initialize Phaser game with scene management
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scene: [MainMenuScene, RanchScene, SaloonScene, NightScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    transparent: true,
    dom: {
        createContainer: true
    }
};

// Create game instance
const game = new Phaser.Game(config);

// Initialize UI event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Setting up event listeners");
    
    // Set up inventory panel toggle
    const toggleButtons = document.querySelectorAll('.toggle-panel');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const panel = this.closest('.inventory-panel');
            panel.classList.toggle('collapsed');
            
            // Change the toggle icon based on panel state
            const icon = this.querySelector('.toggle-icon');
            if (panel.classList.contains('collapsed')) {
                icon.textContent = '▶';
            } else {
                icon.textContent = '◀';
            }
        });
    });
    
    // Helper function to safely add click event listeners
    function addClickListener(elementId, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            // Remove any existing event listeners to prevent duplicates
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // Add the new event listener
            newElement.addEventListener('click', callback);
            console.log(`Added click listener to ${elementId}`);
            return true;
        } else {
            console.error(`Element not found: ${elementId}`);
            return false;
        }
    }
    
    // MAIN MENU EVENTS
    document.querySelectorAll('.archetype-card').forEach(card => {
        card.addEventListener('click', () => {
            // Deselect all cards
            document.querySelectorAll('.archetype-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Select clicked card
            card.classList.add('selected');
            
            // Set archetype
            playerData.archetype = card.dataset.archetype;
        });
    });
    
    // Start Game button
    addClickListener('start-game', () => {
        // Get player name
        const playerNameInput = document.getElementById('player-name');
        playerData.name = playerNameInput ? (playerNameInput.value || 'Cowboy') : 'Cowboy';
        
        // Connect to server
        socket.emit('new-player', {
            name: playerData.name,
            archetype: playerData.archetype
        });
        
        // Switch to ranch scene
        switchScene('ranch');
    });
    
    // RANCH UI EVENTS
    addClickListener('breed-cattle', () => {
        socket.emit('breed-cattle');
    });
    
    addClickListener('upgrade-barn', () => {
        socket.emit('upgrade-barn');
    });
    
    addClickListener('go-to-saloon', () => {
        console.log("Clicked go to saloon button");
        switchScene('saloon');
    });
    
    addClickListener('go-to-night', () => {
        console.log("Clicked go to night button");
        switchScene('night');
    });
    
    addClickListener('go-to-profile-from-ranch', () => {
        console.log("Clicked go to profile from ranch button");
        switchScene('profile');
    });
    
    // SALOON UI EVENTS
    const wagerSlider = document.getElementById('wager-slider');
    const wagerDisplay = document.getElementById('wager-amount');
    
    if (wagerSlider && wagerDisplay) {
        wagerSlider.addEventListener('input', () => {
            wagerAmount = parseInt(wagerSlider.value);
            wagerDisplay.textContent = wagerAmount;
            
            // Update burn amount (10%)
            const burnAmount = Math.round(wagerAmount * 0.1 * 10) / 10;
            const burnAmountDisplay = document.getElementById('burn-amount');
            if (burnAmountDisplay) {
                burnAmountDisplay.textContent = burnAmount;
            }
        });
    }
    
    // Saloon navigation buttons
    addClickListener('back-to-ranch', () => {
        console.log("Clicked back to ranch button");
        switchScene('ranch');
    });
    
    addClickListener('go-to-night-from-saloon', () => {
        console.log("Clicked go to night from saloon button");
        switchScene('night');
    });
    
    addClickListener('go-to-profile', () => {
        console.log("Clicked go to profile button");
        switchScene('profile');
    });
    
    // NIGHT UI EVENTS
    addClickListener('craft-potion', () => {
        socket.emit('craft-potion');
    });
    
    addClickListener('back-to-ranch-night', () => {
        console.log("Clicked back to ranch from night button");
        switchScene('ranch');
    });
    
    addClickListener('go-to-saloon-from-night', () => {
        console.log("Clicked go to saloon from night button");
        switchScene('saloon');
    });
    
    addClickListener('go-to-profile-from-night', () => {
        console.log("Clicked go to profile from night button");
        switchScene('profile');
    });
    
    // PROFILE UI EVENTS
    document.querySelectorAll('.character-option').forEach(option => {
        option.addEventListener('click', () => {
            // Deselect all options
            document.querySelectorAll('.character-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Select clicked option
            option.classList.add('selected');
            
            // Update selected character image
            const characterType = option.dataset.character;
            const imgPath = characterType === 'the-scientist' ? 
                'img/characters/the-scientist.jpg' : 
                `img/characters/${characterType}.jpeg`;
            const characterImage = document.getElementById('character-image');
            if (characterImage) {
                characterImage.src = imgPath;
            }
            
            // Update player data
            playerData.characterType = characterType;
        });
    });
    
    addClickListener('save-profile', () => {
        // Update player name
        const characterNameInput = document.getElementById('character-name');
        playerData.name = characterNameInput ? (characterNameInput.value || 'Cowboy') : 'Cowboy';
        
        // Show notification
        showNotification('Profile updated successfully!', 'success');
        
        // Emit update to server
        socket.emit('update-profile', {
            name: playerData.name,
            characterType: playerData.characterType
        });
    });
    
    addClickListener('back-to-ranch-from-profile', () => {
        console.log("Clicked back to ranch from profile button");
        switchScene('ranch');
    });
    
    addClickListener('go-to-saloon-from-profile', () => {
        console.log("Clicked go to saloon from profile button");
        switchScene('saloon');
    });
    
    addClickListener('go-to-night-from-profile', () => {
        console.log("Clicked go to night from profile button");
        switchScene('night');
    });
    
    // MODAL EVENTS
    addClickListener('close-result', () => {
        if (resultModal) {
            resultModal.classList.add('hidden');
            
            // If in the saloon, reset for a new race
            if (currentScene === 'saloon') {
                initSaloonScene();
            }
        }
    });
    
    console.log("Finished setting up all event listeners");
});

// Socket event handlers
socket.on('game-state', data => {
    // Update player data
    playerData = data.player;
    marketPrice = data.marketPrice;
    
    // Update UI
    updateUI();
});

socket.on('cattle-bred', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification(`New cattle bred! Cattle #${data.cattle.id} with Speed: ${data.cattle.speed}, Milk Production: ${data.cattle.milk}`, 'success');
    
    // Update UI
    updateUI();
    
    // Add cattle to game scene
    addCattleToScene(data.cattle);
});

socket.on('barn-upgraded', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification('Barn upgraded! Capacity increased by 50.', 'success');
    
    // Update UI
    updateUI();
    
    // Animate barn growth
    if (game.scene.scenes[0].barn) {
        game.scene.scenes[0].tweens.add({
            targets: game.scene.scenes[0].barn,
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 500,
            yoyo: true,
            repeat: 0,
            ease: 'Bounce.easeOut'
        });
    }
});

socket.on('potion-crafted', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification(`New shadow potion crafted! Potion #${data.potion.id} with Potency: ${data.potion.potency}`, 'success');
    
    // Update UI
    updateUI();
    
    // Add visual effect for potion
    addPotionEffect();
});

socket.on('potion-sold', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification(`Potion sold for ${data.price.toFixed(2)} $CATTLE!`, 'success');
    
    // Update UI
    updateUI();
});

// Add the blackjack-specific event handlers
socket.on('poker-game-started', data => {
    // Update UI
    const playerCardsContainer = document.getElementById('player-cards');
    const dealerCardsContainer = document.getElementById('dealer-cards');
    const playerScoreDisplay = document.getElementById('player-score');
    const dealerScoreDisplay = document.getElementById('dealer-score');
    
    // Clear previous cards
    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';
    
    // Add player cards
    data.playerHand.forEach(card => {
        const cardElement = createCardElement(card);
        playerCardsContainer.appendChild(cardElement);
    });
    
    // Add dealer cards (one face up, one face down)
    data.dealerHand.forEach(card => {
        if (card.hidden) {
            const cardElement = createCardElement({ hidden: true });
            dealerCardsContainer.appendChild(cardElement);
        } else {
            const cardElement = createCardElement(card);
            dealerCardsContainer.appendChild(cardElement);
        }
    });
    
    // Update scores
    playerScoreDisplay.textContent = `Score: ${data.playerValue}`;
    dealerScoreDisplay.textContent = `Score: ${data.dealerValue}`;
    
    // Enable game controls if not a blackjack
    if (data.playerValue < 21) {
        document.getElementById('hit-button').disabled = false;
        document.getElementById('stand-button').disabled = false;
        document.getElementById('play-poker').disabled = true;
    }
});

socket.on('poker-card-dealt', data => {
    // Add new card to the appropriate container
    const cardsContainer = document.getElementById(`${data.target}-cards`);
    const scoreDisplay = document.getElementById(`${data.target}-score`);
    
    // Create card element
    const cardElement = createCardElement(data.card);
    cardsContainer.appendChild(cardElement);
    
    // Update score
    scoreDisplay.textContent = `Score: ${data.target === 'player' ? data.playerValue : data.dealerValue}`;
});

socket.on('poker-game-result', data => {
    // Update player data
    playerData = data.player;
    
    // Reveal all dealer cards
    const dealerCardsContainer = document.getElementById('dealer-cards');
    dealerCardsContainer.innerHTML = '';
    
    data.dealerHand.forEach(card => {
        const cardElement = createCardElement(card);
        dealerCardsContainer.appendChild(cardElement);
    });
    
    // Update scores
    document.getElementById('player-score').textContent = `Score: ${data.playerValue}`;
    document.getElementById('dealer-score').textContent = `Score: ${data.dealerValue}`;
    
    // Disable game controls
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    document.getElementById('play-poker').disabled = false;
    
    // Show result
    let resultClass;
    if (data.result === 'win') {
        resultClass = 'win';
        showResult('You Won!', `${data.message} You won ${data.amount.toFixed(2)} $CATTLE!`, 'success');
    } else if (data.result === 'loss') {
        resultClass = 'loss';
        showResult('You Lost', `${data.message} You lost ${data.amount.toFixed(2)} $CATTLE.`, 'error');
    } else { // push
        resultClass = '';
        showResult('Push', `${data.message}`, 'info');
    }
    
    // Update game history if provided
    if (data.history) {
        const historyContainer = document.getElementById('results-history');
        data.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${item.result === 'win' ? 'win' : (item.result === 'loss' ? 'loss' : '')}`;
            historyItem.textContent = item.result === 'win' ? 'W' : (item.result === 'loss' ? 'L' : 'P');
            historyContainer.appendChild(historyItem);
        });
    }
    
    // Update UI
    updateUI();
});

// Original poker-result handler for backwards compatibility
socket.on('poker-result', data => {
    // Update player data
    playerData = data.player;
    
    // Show result modal
    if (data.win) {
        showResult('You Won!', `You won ${data.amount.toFixed(2)} $CATTLE!`, 'success');
    } else {
        showResult('You Lost', `You lost ${data.amount.toFixed(2)} $CATTLE.`, 'error');
    }
    
    // Update UI
    updateUI();
});

socket.on('market-update', data => {
    // Update market price
    marketPrice = data.marketPrice;
    
    // Show notification
    const trend = marketPrice > 1.0 ? 'up' : 'down';
    showNotification(`Market prices are trending ${trend}! Current multiplier: ${marketPrice.toFixed(2)}x`, 'info');
    
    // Update UI
    updateUI();
});

// Horse Race Game Event Handlers
socket.on('bonus-claimed', data => {
    // Update player data
    playerData = data.player;
    
    // Show bonus notification
    showNotification(`Bonus claimed! You received ${data.amount} $CATTLE!`, 'success');
    
    // Display bonus animation
    document.getElementById('bonus-amount').textContent = `+${data.amount}`;
    document.querySelector('.bonus-display').classList.remove('hidden');
    
    // Hide bonus after 5 seconds
    setTimeout(() => {
        document.querySelector('.bonus-display').classList.add('hidden');
    }, 5000);
    
    // Disable claim button
    document.getElementById('claim-bonus').disabled = true;
    
    // Update UI
    updateUI();
});

socket.on('race-started', data => {
    console.log('Race started event received:', data);
    
    // Update player data
    playerData = data.player;
    
    // Enable draw card button
    const drawCardButton = document.getElementById('draw-card');
    if (drawCardButton) {
        drawCardButton.disabled = false;
        console.log('Draw card button enabled');
    } else {
        console.error('Draw card button not found');
    }
    
    // Disable start race button
    const startRaceButton = document.getElementById('start-race');
    if (startRaceButton) {
        startRaceButton.disabled = true;
        console.log('Start race button disabled');
    } else {
        console.error('Start race button not found');
    }
    
    // Update odds display
    for (const suit in data.odds) {
        const oddsElement = document.getElementById(`odds-${suit}`);
        if (oddsElement) {
            oddsElement.textContent = data.odds[suit].toFixed(1);
        } else {
            console.error(`Odds element for ${suit} not found`);
        }
    }
    
    // Show notification
    showNotification(`Race started! 10% (${data.burnAmount.toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`, 'info');
    
    // Update UI
    updateUI();
});

socket.on('card-drawn', data => {
    console.log('Card drawn event received:', data);
    
    // Get the card and progress data
    const card = data.card;
    const progress = data.progress;
    
    // Create and display the card
    const drawnCardContainer = document.getElementById('drawn-card');
    if (drawnCardContainer) {
        drawnCardContainer.innerHTML = '';
        
        const cardElement = createCardElement(card);
        drawnCardContainer.appendChild(cardElement);
        console.log('Card displayed:', card);
    } else {
        console.error('Drawn card container not found');
    }
    
    // Update progress bars
    for (const suit in progress) {
        const progressBar = document.getElementById(`${suit}-progress`);
        if (progressBar) {
            progressBar.style.width = `${progress[suit]}%`;
            console.log(`${suit} progress updated to ${progress[suit]}%`);
        } else {
            console.error(`Progress bar for ${suit} not found`);
        }
    }
    
    // Update odds if available
    if (data.odds) {
        for (const suit in data.odds) {
            const oddsElement = document.getElementById(`odds-${suit}`);
            if (oddsElement) {
                oddsElement.textContent = data.odds[suit].toFixed(1);
            } else {
                console.error(`Odds element for ${suit} not found`);
            }
        }
    }
});

socket.on('race-finished', data => {
    console.log('Race finished event received:', data);
    
    // Update player data
    playerData = data.player;
    
    // Disable draw card button
    const drawCardButton = document.getElementById('draw-card');
    if (drawCardButton) {
        drawCardButton.disabled = true;
        console.log('Draw card button disabled');
    } else {
        console.error('Draw card button not found in race-finished handler');
    }
    
    // Enable start race button
    const startRaceButton = document.getElementById('start-race');
    if (startRaceButton) {
        startRaceButton.disabled = false;
        console.log('Start race button enabled');
    } else {
        console.error('Start race button not found in race-finished handler');
    }
    
    // Add to history
    const historyContainer = document.getElementById('results-history');
    if (historyContainer) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${data.winner} ${data.bet > 0 ? 'win' : 'loss'}`;
        historyItem.textContent = data.winner.charAt(0).toUpperCase();
        historyContainer.appendChild(historyItem);
        console.log('Added history item for race result:', data.winner);
    } else {
        console.error('History container not found');
    }
    
    // Celebration effect for winners
    if (data.bet > 0) {
        console.log('Player won! Showing celebration for winning bet:', data.bet);
        // Create confetti animation
        try {
            createConfetti();
        } catch (err) {
            console.error('Error creating confetti:', err);
        }
        
        // Show celebration overlay
        const celebration = document.getElementById('win-celebration');
        const winAmount = document.getElementById('win-amount');
        if (celebration && winAmount) {
            winAmount.textContent = `+${data.bet.toFixed(2)} $CATTLE`;
            celebration.classList.remove('hidden');
            
            // Hide celebration after 3.5 seconds
            setTimeout(() => {
                celebration.classList.add('hidden');
            }, 3500);
        } else {
            console.error('Celebration elements not found');
        }
        
        // Display result with auto-close
        showResult('Winner!', `${data.message}`, 'success', true);
    } else {
        console.log('Player did not win. Showing regular result message');
        // Display result with auto-close
        showResult('Race Finished', `${data.message}`, 'error', true);
    }
    
    // Update UI
    updateUI();
    
    // Prepare for next race automatically after 4 seconds
    console.log('Scheduling saloon scene reset in 4 seconds');
    setTimeout(() => {
        // Reset the race UI
        initSaloonScene();
    }, 4000);
});

socket.on('error-message', data => {
    // Show error notification
    showNotification(data.message, 'error');
});

// Helper Functions
function switchScene(scene) {
    // Map HTML UI elements
    const mainMenu = document.getElementById('main-menu');
    const ranchUI = document.getElementById('ranch-ui');
    const saloonUI = document.getElementById('saloon-ui');
    const nightUI = document.getElementById('night-ui');
    const profileUI = document.getElementById('profile-ui');
    const phaserCanvas = document.getElementById('game-container');
    
    const screens = {
        'main-menu': mainMenu,
        'ranch': ranchUI,
        'saloon': saloonUI,
        'night': nightUI,
        'profile': profileUI
    };
    
    // Hide all HTML UI screens
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.add('hidden');
    });
    
    // Map scene types to Phaser scene keys
    const phaser_scenes = {
        'main-menu': 'MainMenuScene',
        'ranch': 'RanchScene',
        'saloon': 'SaloonScene',
        'night': 'NightScene'
    };
    
    // Store current scene
    currentScene = scene;
    
    // Handle Phaser canvas visibility and positioning
    if (scene === 'profile') {
        // Hide Phaser canvas for profile scene (HTML only)
        if (phaserCanvas) phaserCanvas.style.display = 'none';
    } else {
        // Show Phaser canvas for other scenes
        if (phaserCanvas) phaserCanvas.style.display = 'block';
    }
    
    // Special handling for night scene
    if (scene === 'night') {
        // Add phaser-active class to night UI to hide HTML grid
        if (nightUI) nightUI.classList.add('phaser-active');
        
        // Move the Phaser canvas into the shadow grid container for proper positioning
        const shadowGridContainer = document.getElementById('phaser-shadow-grid');
        if (shadowGridContainer && phaserCanvas) {
            // Position the Phaser canvas within the container
            shadowGridContainer.appendChild(phaserCanvas);
            phaserCanvas.style.position = 'relative';
            phaserCanvas.style.width = '100%';
            phaserCanvas.style.height = '100%';
            phaserCanvas.style.zIndex = '5'; // Make sure it's above HTML elements
        }
    } else {
        // For other scenes, restore canvas to the body
        if (phaserCanvas) {
            document.body.appendChild(phaserCanvas);
            phaserCanvas.style.position = 'absolute';
            phaserCanvas.style.top = '0';
            phaserCanvas.style.left = '0';
            phaserCanvas.style.width = '100%';
            phaserCanvas.style.height = '100%';
            phaserCanvas.style.zIndex = '1';
        }
        
        // Remove phaser-active class from night UI
        if (nightUI) nightUI.classList.remove('phaser-active');
    }
    
    // Update the HTML UI
    if (screens[scene]) {
        screens[scene].classList.remove('hidden');
    }
    
    console.log("Switched to scene: " + scene);
    
    // Start the corresponding Phaser scene if available
    if (phaser_scenes[scene] && game && game.scene) {
        // Stop all running scenes
        if (scene !== 'main-menu') game.scene.stop('MainMenuScene');
        if (scene !== 'ranch') game.scene.stop('RanchScene');
        if (scene !== 'saloon') game.scene.stop('SaloonScene');
        if (scene !== 'night') game.scene.stop('NightScene');
        
        // Start the new scene
        if (!game.scene.isActive(phaser_scenes[scene])) {
            game.scene.start(phaser_scenes[scene]);
        }
    }
    
    // Initialize scene-specific logic
    switch (scene) {
        case 'ranch':
            initRanchGrid(); // Initialize or update ranch grid
            break;
        case 'saloon':
            initSaloonScene(); // Initialize saloon-specific elements
            break;
        case 'profile':
            updateProfileUI();
            break;
        case 'night':
            initShadowGrid(); // Initialize or update shadow market grid
            break;
    }
    
    // Update UI with current player data
    updateUI();
    
    console.log(`Switched to scene: ${scene}`);
}

// Initialize the saloon scene when it becomes visible
function initSaloonScene() {
    console.log('Initializing saloon scene');
    
    // Safely get elements with null checks
    const elements = {
        drawnCard: document.getElementById('drawn-card'),
        heartsProgress: document.getElementById('hearts-progress'),
        diamondsProgress: document.getElementById('diamonds-progress'),
        clubsProgress: document.getElementById('clubs-progress'),
        spadesProgress: document.getElementById('spades-progress'),
        totalBetAmount: document.getElementById('total-bet-amount'),
        burnAmount: document.getElementById('burn-amount'),
        startRaceButton: document.getElementById('start-race'),
        drawCardButton: document.getElementById('draw-card'),
        claimBonusButton: document.getElementById('claim-bonus')
    };
    
    // Get references to bet inputs with null checks
    const betInputs = {
        hearts: document.getElementById('bet-hearts'),
        diamonds: document.getElementById('bet-diamonds'),
        clubs: document.getElementById('bet-clubs'),
        spades: document.getElementById('bet-spades')
    };
    
    // Clear drawn card
    if (elements.drawnCard) {
        elements.drawnCard.innerHTML = '<div class="card-placeholder">Draw a card to advance a horse</div>';
    }
    
    // Reset progress bars
    if (elements.heartsProgress) elements.heartsProgress.style.width = '0%';
    if (elements.diamondsProgress) elements.diamondsProgress.style.width = '0%';
    if (elements.clubsProgress) elements.clubsProgress.style.width = '0%';
    if (elements.spadesProgress) elements.spadesProgress.style.width = '0%';
    
    // Make sure all inputs are properly initialized
    Object.values(betInputs).forEach(input => {
        if (input) {
            input.value = 0;
            
            // Add event listener but first remove any existing ones to avoid duplicates
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            newInput.addEventListener('input', updateTotalBet);
        }
    });
    
    // Reset total bet display
    if (elements.totalBetAmount) elements.totalBetAmount.textContent = '0';
    if (elements.burnAmount) elements.burnAmount.textContent = '0';
    
    // Initialize bet display values
    ['hearts', 'diamonds', 'clubs', 'spades'].forEach(suit => {
        const betDisplay = document.getElementById(`${suit}-bet-display`);
        if (betDisplay) {
            betDisplay.textContent = '0';
        }
    });
    
    // Set up betting slider functionality
    setupBettingSliders();
    
    // Initialize button states and confirm buttons exist
    if (elements.startRaceButton) {
        elements.startRaceButton.disabled = false;
        
        // Remove any existing event listeners to avoid duplicates
        const newStartRaceButton = elements.startRaceButton.cloneNode(true);
        elements.startRaceButton.parentNode.replaceChild(newStartRaceButton, elements.startRaceButton);
        
        // Attach event listener to the new button
        newStartRaceButton.addEventListener('click', function() {
            console.log("Start race button clicked");
            // Get bets from bet display elements
            const bets = {
                hearts: parseInt(document.getElementById('hearts-bet-display').textContent) || 0,
                diamonds: parseInt(document.getElementById('diamonds-bet-display').textContent) || 0,
                clubs: parseInt(document.getElementById('clubs-bet-display').textContent) || 0,
                spades: parseInt(document.getElementById('spades-bet-display').textContent) || 0
            };
            
            console.log("Bets:", bets);
            
            // Calculate total bet
            const totalBet = bets.hearts + bets.diamonds + bets.clubs + bets.spades;
            console.log("Total bet:", totalBet);
            
            if (totalBet <= 0) {
                showNotification('Please place at least one bet to start the race!', 'error');
                return;
            }
            
            if (totalBet > playerData.cattleBalance) {
                showNotification('Not enough $CATTLE for your total bet!', 'error');
                return;
            }
            
            // Clear drawn card with null check
            const drawnCard = document.getElementById('drawn-card');
            if (drawnCard) {
                drawnCard.innerHTML = '<div class="card-placeholder">Race starting...</div>';
            }
            
            // Reset progress bars with null checks
            const progressBars = {
                hearts: document.getElementById('hearts-progress'),
                diamonds: document.getElementById('diamonds-progress'),
                clubs: document.getElementById('clubs-progress'),
                spades: document.getElementById('spades-progress')
            };
            
            if (progressBars.hearts) progressBars.hearts.style.width = '0%';
            if (progressBars.diamonds) progressBars.diamonds.style.width = '0%';
            if (progressBars.clubs) progressBars.clubs.style.width = '0%';
            if (progressBars.spades) progressBars.spades.style.width = '0%';
            
            // Start the race
            socket.emit('start-race', bets);
        });
    }
    
    if (elements.drawCardButton) {
        elements.drawCardButton.disabled = true;
        
        // Remove any existing event listeners to avoid duplicates
        const newDrawCardButton = elements.drawCardButton.cloneNode(true);
        elements.drawCardButton.parentNode.replaceChild(newDrawCardButton, elements.drawCardButton);
        
        // Attach event listener to the new button
        newDrawCardButton.addEventListener('click', function() {
            console.log("Draw card button clicked");
            socket.emit('draw-card');
        });
    }
    
    if (elements.claimBonusButton) {
        // Remove any existing event listeners to avoid duplicates
        const newClaimBonusButton = elements.claimBonusButton.cloneNode(true);
        elements.claimBonusButton.parentNode.replaceChild(newClaimBonusButton, elements.claimBonusButton);
        
        // Attach event listener to the new button
        newClaimBonusButton.addEventListener('click', function() {
            console.log("Claim bonus button clicked");
            socket.emit('claim-bonus');
        });
    }
}

function updateUI() {
    // Get resource elements with null checks
    const ranchElements = {
        cattleBalance: document.getElementById('cattle-balance'),
        hay: document.getElementById('hay'),
        water: document.getElementById('water'),
        barnCapacity: document.getElementById('barn-capacity'),
        barnCapacity2: document.getElementById('barn-capacity-2')
    };
    
    const saloonElements = {
        cattleBalance: document.getElementById('saloon-cattle-balance')
    };
    
    const nightElements = {
        cattleBalance: document.getElementById('night-cattle-balance'),
        marketMultiplier: document.getElementById('market-multiplier')
    };
    
    // Update Ranch UI elements if they exist
    if (ranchElements.cattleBalance) ranchElements.cattleBalance.textContent = playerData.cattleBalance.toFixed(2);
    if (ranchElements.hay) ranchElements.hay.textContent = playerData.hay;
    if (ranchElements.water) ranchElements.water.textContent = playerData.water;
    if (ranchElements.barnCapacity) ranchElements.barnCapacity.textContent = playerData.barnCapacity;
    if (ranchElements.barnCapacity2) ranchElements.barnCapacity2.textContent = playerData.barnCapacity;
    
    // Update Saloon UI elements if they exist
    if (saloonElements.cattleBalance) saloonElements.cattleBalance.textContent = playerData.cattleBalance.toFixed(2);
    
    // Update Night UI elements if they exist
    if (nightElements.cattleBalance) nightElements.cattleBalance.textContent = playerData.cattleBalance.toFixed(2);
    if (nightElements.marketMultiplier) nightElements.marketMultiplier.textContent = marketPrice.toFixed(2);
    
    // Update profile UI (only if profile scene is visible)
    if (currentScene === 'profile') {
        updateProfileUI();
    }
    
    console.log("UI updated for scene: " + currentScene);
    
    // Update wager slider max value (only if in saloon)
    const wagerSlider = document.getElementById('wager-slider');
    if (wagerSlider) {
        wagerSlider.max = Math.min(50, Math.floor(playerData.cattleBalance));
        
        if (wagerAmount > playerData.cattleBalance) {
            wagerAmount = Math.floor(playerData.cattleBalance);
            const wagerAmountEl = document.getElementById('wager-amount');
            if (wagerAmountEl) {
                wagerAmountEl.textContent = wagerAmount;
            }
            wagerSlider.value = wagerAmount;
        }
    }
    
    // Update cattle inventory
    updateCattleInventory();
    
    // Update potion inventory
    updatePotionInventory();
    
    // Update button states
    updateButtonStates();
}

function updateCattleInventory() {
    const cattleInventory = document.getElementById('cattle-inventory');
    if (!cattleInventory) return; // Skip if element doesn't exist
    
    // Clear inventory
    cattleInventory.innerHTML = '';
    
    // Check if empty
    if (playerData.cattleCollection.length === 0) {
        cattleInventory.innerHTML = '<div class="empty-message">No cattle yet. Start breeding!</div>';
        return;
    }
    
    // Add all cattle
    playerData.cattleCollection.forEach(cattle => {
        const cattleElement = document.createElement('div');
        cattleElement.className = 'inventory-item cattle';
        cattleElement.innerHTML = `
            <div class="title">
                <img src="/img/cattle.png" alt="Cattle" class="item-icon" width="40" height="40">
                <span>Cattle #${cattle.id.split('-').pop().substr(0, 4)}</span>
            </div>
            <div class="stats">
                <div>Speed: ${cattle.speed}</div>
                <div class="milk-stat">
                    <img src="/img/milk-bottle.png" alt="Milk" class="stat-icon" width="20" height="20">
                    Milk: ${cattle.milk}
                </div>
            </div>
        `;
        cattleInventory.appendChild(cattleElement);
    });
}

function updatePotionInventory() {
    const potionInventory = document.getElementById('potion-inventory');
    if (!potionInventory) return; // Skip if element doesn't exist
    
    // Clear inventory
    potionInventory.innerHTML = '';
    
    // Check if empty
    if (playerData.potionCollection.length === 0) {
        potionInventory.innerHTML = '<div class="empty-message">No potions yet. Start crafting!</div>';
        return;
    }
    
    // Add all potions
    playerData.potionCollection.forEach(potion => {
        const potionElement = document.createElement('div');
        potionElement.className = 'inventory-item potion';
        potionElement.innerHTML = `
            <div class="title">
                <span class="icon">🧪</span>
                <span>Potion #${potion.id.split('-').pop().substr(0, 4)}</span>
            </div>
            <div class="stats">
                <div>Potency: ${potion.potency}</div>
                <div>Market Value: ${((25 + potion.potency * 1.5) * marketPrice).toFixed(2)} $CATTLE</div>
            </div>
            <button class="sell">Sell Potion</button>
        `;
        
        // Add sell event listener
        const sellButton = potionElement.querySelector('.sell');
        sellButton.addEventListener('click', () => {
            socket.emit('sell-potion', { potionId: potion.id });
        });
        
        potionInventory.appendChild(potionElement);
    });
}

// Initialize the ranch grid
function initRanchGrid() {
    // Get the grid container
    const gridContainer = document.getElementById('ranch-grid');
    if (!gridContainer) {
        console.error('Ranch grid container not found');
        return;
    }
    
    // Clear any existing content
    gridContainer.innerHTML = '';
    
    // Initialize the cells array if it's empty
    if (ranchGrid.cells.length === 0) {
        for (let i = 0; i < ranchGrid.size * ranchGrid.size; i++) {
            ranchGrid.cells.push({
                id: i,
                state: 'empty',
                growthStage: 0,
                growthMax: 3
            });
        }
    }
    
    // Create the grid cells
    ranchGrid.cells.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.className = `grid-cell ${cell.state}`;
        cellElement.id = `ranch-cell-${index}`;
        
        // Add growth indicator for non-empty cells
        if (cell.state !== 'empty') {
            const indicator = document.createElement('div');
            indicator.className = 'growth-indicator';
            indicator.textContent = `${cell.growthStage}/${cell.growthMax}`;
            cellElement.appendChild(indicator);
        }
        
        // Add click handler for cell interactions
        cellElement.addEventListener('click', () => handleRanchCellClick(index));
        
        // Add to grid
        gridContainer.appendChild(cellElement);
    });
    
    // Update the resources display
    updateRanchResourceDisplay();
    
    // Start growth timer if not already running
    if (!ranchGrid.growthInterval) {
        startRanchGrowthCycle();
    }
    
    // Set up the harvest all button
    const harvestAllButton = document.getElementById('harvest-all');
    if (harvestAllButton) {
        // Remove any existing event listeners
        const newButton = harvestAllButton.cloneNode(true);
        harvestAllButton.parentNode.replaceChild(newButton, harvestAllButton);
        
        // Add new event listener
        newButton.addEventListener('click', harvestAllRanchCells);
    }
    
    // Update button states
    updateButtonStates();
}

// Initialize the shadow market grid - HTML/CSS based
function initShadowGrid() {
    // Get the grid container
    const gridContainer = document.getElementById('shadow-grid');
    if (!gridContainer) {
        console.error('Shadow grid container not found');
        return;
    }
    
    // Clear any existing content
    gridContainer.innerHTML = '';
    
    // Initialize the cells array if it's empty
    if (shadowGrid.cells.length === 0) {
        for (let i = 0; i < shadowGrid.size * shadowGrid.size; i++) {
            shadowGrid.cells.push({
                id: i,
                state: 'empty',
                stage: 0,
                maxStage: 3,
                supply: Math.floor(Math.random() * 5) + 3,  // Random supply value between 3-7
                demand: Math.floor(Math.random() * 5) + 3   // Random demand value between 3-7
            });
        }
    }
    
    // Create the grid cells
    shadowGrid.cells.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.className = `grid-cell ${cell.state}`;
        cellElement.id = `shadow-cell-${index}`;
        
        // Add stage indicator for non-empty cells
        if (cell.state !== 'empty') {
            const indicator = document.createElement('div');
            indicator.className = 'growth-indicator';
            indicator.textContent = `${cell.stage}/${cell.maxStage}`;
            cellElement.appendChild(indicator);
        }
        
        // Add click handler for cell interactions
        cellElement.addEventListener('click', () => handleShadowCellClick(index));
        
        // Add to grid
        gridContainer.appendChild(cellElement);
    });
    
    // Update the network status display
    updateShadowMarketStateDisplay();
    
    // Start market cycle if not already running
    if (!shadowGrid.cycleInterval) {
        startShadowMarketCycle();
    }
    
    // Set up the distill all button
    const distillAllButton = document.getElementById('distill-all');
    if (distillAllButton) {
        // Remove any existing event listeners
        const newButton = distillAllButton.cloneNode(true);
        distillAllButton.parentNode.replaceChild(newButton, distillAllButton);
        
        // Add new event listener
        newButton.addEventListener('click', distillAllShadowCells);
    }
    
    // Update resources and button states
    updateShadowResourceDisplay();
    updateButtonStates();
    
    // Make night scene visible and start the Phaser scene for background only
    if (game && game.scene) {
        game.scene.stop('RanchScene');
        game.scene.stop('SaloonScene');
        game.scene.start('NightScene');
    }
    
    // Log initialization
    console.log("Shadow Market Grid initialized with HTML/CSS implementation");
}

// Handle clicking on a ranch grid cell
function handleRanchCellClick(cellIndex) {
    const cell = ranchGrid.cells[cellIndex];
    const cellElement = document.getElementById(`ranch-cell-${cellIndex}`);
    
    if (!cellElement) return;
    
    switch (cell.state) {
        case 'empty':
            // Plant a new crop
            if (playerData.hay >= 10) {
                playerData.hay -= 10;
                cell.state = 'planted';
                cell.growthStage = 0;
                cellElement.className = 'grid-cell planted';
                
                // Add growth indicator
                const indicator = document.createElement('div');
                indicator.className = 'growth-indicator';
                indicator.textContent = `${cell.growthStage}/${cell.growthMax}`;
                cellElement.appendChild(indicator);
                
                showNotification('Planted a new crop! -10 Hay', 'success');
                updateRanchResourceDisplay();
            } else {
                showNotification('Not enough hay! Need 10 hay to plant.', 'error');
            }
            break;
            
        case 'harvestable':
            // Harvest the crop
            harvestRanchCell(cellIndex);
            break;
            
        default:
            // Show growth info for growing crops
            showNotification(`Crop is growing: Stage ${cell.growthStage}/${cell.growthMax}`, 'info');
            break;
    }
}

// Handle clicking on a shadow market cell
function handleShadowCellClick(cellIndex) {
    const cell = shadowGrid.cells[cellIndex];
    
    switch (cell.state) {
        case 'empty':
            // Start brewing a potion
            if (playerData.water >= 15) {
                playerData.water -= 15;
                cell.state = 'brewing';
                cell.stage = 0;
                
                // Update HTML UI
                const cellElement = document.getElementById(`shadow-cell-${cellIndex}`);
                if (cellElement) {
                    cellElement.className = 'grid-cell brewing';
                    
                    // Add stage indicator
                    const indicator = document.createElement('div');
                    indicator.className = 'growth-indicator';
                    indicator.textContent = `${cell.stage}/${cell.maxStage}`;
                    cellElement.appendChild(indicator);
                }
                
                showNotification('Started brewing a potion! -15 Water', 'success');
                updateShadowResourceDisplay();
            } else {
                showNotification('Not enough water! Need 15 water to brew.', 'error');
            }
            break;
            
        case 'ready':
            // Distill the potion
            distillShadowCell(cellIndex);
            break;
            
        default:
            // Show brewing info
            showNotification(`Potion is brewing: Stage ${cell.stage}/${cell.maxStage}`, 'info');
            break;
    }
}

// Harvest a single ranch cell
function harvestRanchCell(cellIndex) {
    const cell = ranchGrid.cells[cellIndex];
    const cellElement = document.getElementById(`ranch-cell-${cellIndex}`);
    
    if (!cellElement || cell.state !== 'harvestable') return;
    
    // Calculate harvest rewards
    const hayReward = Math.floor(15 + Math.random() * 10) * ranchGrid.multiplier;
    const waterReward = Math.floor(5 + Math.random() * 10) * ranchGrid.multiplier;
    
    // Add resources to player
    playerData.hay += hayReward;
    playerData.water += waterReward;
    playerData.stats.plantsHarvested = (playerData.stats.plantsHarvested || 0) + 1;
    
    // Reset cell
    cell.state = 'empty';
    cell.growthStage = 0;
    cellElement.className = 'grid-cell empty';
    cellElement.innerHTML = '';
    
    // Show notification
    showNotification(`Harvested crop! +${hayReward.toFixed(0)} Hay, +${waterReward.toFixed(0)} Water`, 'success');
    
    // Update UI
    updateRanchResourceDisplay();
    updateUI();
}

// Distill a single shadow market cell
function distillShadowCell(cellIndex) {
    const cell = shadowGrid.cells[cellIndex];
    
    if (cell.state !== 'ready') return;
    
    // Calculate distill rewards based on supply/demand
    let rewardMultiplier = 1.0;
    
    // If demand is higher than supply, increase reward
    if (cell.demand > cell.supply) {
        rewardMultiplier = 1.0 + ((cell.demand - cell.supply) / 10);
    }
    
    // Apply market multiplier
    rewardMultiplier *= shadowGrid.multiplier;
    
    // Calculate final rewards
    const etherReward = Math.floor(10 + Math.random() * 15) * rewardMultiplier;
    const cattleReward = Math.floor(5 + Math.random() * 10) * rewardMultiplier;
    
    // Add resources to player
    playerData.ether = (playerData.ether || 0) + etherReward;
    playerData.cattleBalance += cattleReward;
    playerData.stats.potionsDistilled = (playerData.stats.potionsDistilled || 0) + 1;
    
    // Reset cell
    cell.state = 'empty';
    cell.stage = 0;
    
    // Update HTML UI if it exists
    const cellElement = document.getElementById(`shadow-cell-${cellIndex}`);
    if (cellElement) {
        cellElement.className = 'grid-cell empty';
        cellElement.innerHTML = '';
    }
    
    // Update Phaser scene if active
    if (game && game.scene && game.scene.isActive('NightScene')) {
        const nightScene = game.scene.getScene('NightScene');
        if (nightScene && nightScene.updateCellAppearance) {
            nightScene.updateCellAppearance(cellIndex);
        }
    }
    
    // Play distillation sound
    playSoundEffect('bubbling');
    
    // Show notification
    showNotification(`Distilled potion! +${etherReward.toFixed(0)} Ether, +${cattleReward.toFixed(2)} $CATTLE`, 'success');
    
    // Update UI
    updateShadowResourceDisplay();
    updateUI();
    
    // Show win celebration for bigger rewards
    if (cattleReward > 10) {
        showWinCelebration(cattleReward);
    }
}

// Harvest all ready ranch cells
function harvestAllRanchCells() {
    let harvestedCount = 0;
    
    ranchGrid.cells.forEach((cell, index) => {
        if (cell.state === 'harvestable') {
            harvestRanchCell(index);
            harvestedCount++;
        }
    });
    
    if (harvestedCount === 0) {
        showNotification('No crops ready to harvest yet!', 'info');
    } else {
        showNotification(`Harvested ${harvestedCount} crops!`, 'success');
    }
}

// Distill all ready shadow market cells
function distillAllShadowCells() {
    let distilledCount = 0;
    
    shadowGrid.cells.forEach((cell, index) => {
        if (cell.state === 'ready') {
            distillShadowCell(index);
            distilledCount++;
        }
    });
    
    if (distilledCount === 0) {
        showNotification('No potions ready to distill yet!', 'info');
    } else {
        showNotification(`Distilled ${distilledCount} potions!`, 'success');
    }
}

// Start the growth cycle for ranch
function startRanchGrowthCycle() {
    // Update the growth timer display
    const timerDisplay = document.getElementById('growth-timer');
    if (timerDisplay) {
        timerDisplay.textContent = ranchGrid.growthTimer;
    }
    
    // Start the interval
    ranchGrid.growthInterval = setInterval(() => {
        // Only process if we're in the ranch scene
        if (currentScene === 'ranch') {
            // Decrease timer
            ranchGrid.growthTimer--;
            
            // Update display
            if (timerDisplay) {
                timerDisplay.textContent = ranchGrid.growthTimer;
            }
            
            // If timer reaches zero, grow plants and reset
            if (ranchGrid.growthTimer <= 0) {
                growRanchPlants();
                ranchGrid.growthTimer = 60; // Reset to 60 seconds
            }
        }
    }, 1000);
}

// Start the market cycle for shadow market
function startShadowMarketCycle() {
    // Initialize cycleTimer if not set
    if (!shadowGrid.cycleTimer) {
        shadowGrid.cycleTimer = 30;
    }
    
    // Update the HTML market state display if it exists
    const cycleDisplay = document.getElementById('market-cycle');
    if (cycleDisplay) {
        cycleDisplay.textContent = shadowGrid.marketState;
    }
    
    // Update Phaser scene if active
    if (game && game.scene && game.scene.isActive('NightScene')) {
        const nightScene = game.scene.getScene('NightScene');
        if (nightScene && nightScene.updateMarketStateDisplay) {
            nightScene.updateMarketStateDisplay();
        }
    }
    
    // Clear existing interval if it exists
    if (shadowGrid.cycleInterval) {
        clearInterval(shadowGrid.cycleInterval);
    }
    
    // Start the interval
    shadowGrid.cycleInterval = setInterval(() => {
        // Only process if we're in the night scene
        if (currentScene === 'night') {
            // Decrease timer
            shadowGrid.cycleTimer--;
            
            // If timer reaches zero, change market state and process brewing
            if (shadowGrid.cycleTimer <= 0) {
                updateShadowMarketState();
                processShadowBrewing();
                shadowGrid.cycleTimer = 30; // Reset to 30 seconds
                
                // Update timer display in Phaser scene
                if (game && game.scene && game.scene.isActive('NightScene')) {
                    const nightScene = game.scene.getScene('NightScene');
                    if (nightScene && nightScene.updateMarketStateDisplay) {
                        nightScene.updateMarketStateDisplay();
                    }
                }
            }
        }
    }, 1000);
}

// Grow all plants in the ranch
function growRanchPlants() {
    let anyGrown = false;
    
    ranchGrid.cells.forEach((cell, index) => {
        const cellElement = document.getElementById(`ranch-cell-${index}`);
        if (!cellElement) return;
        
        // Only process cells that are planted or growing
        if (cell.state === 'planted' || cell.state === 'growing') {
            // Increment growth stage
            cell.growthStage++;
            anyGrown = true;
            
            // Update growth indicator
            const indicator = cellElement.querySelector('.growth-indicator');
            if (indicator) {
                indicator.textContent = `${cell.growthStage}/${cell.growthMax}`;
            }
            
            // Check if fully grown
            if (cell.growthStage >= cell.growthMax) {
                cell.state = 'harvestable';
                cellElement.className = 'grid-cell harvestable';
            } else if (cell.state === 'planted' && cell.growthStage >= 1) {
                cell.state = 'growing';
                cellElement.className = 'grid-cell growing';
            }
        }
    });
    
    // Update button states
    updateButtonStates();
    
    // Notify only if something actually grew
    if (anyGrown) {
        showNotification('Your crops have grown!', 'info');
    }
}

// Process brewing in the shadow market
function processShadowBrewing() {
    let anyProgressed = false;
    
    shadowGrid.cells.forEach((cell, index) => {
        // Only process cells that are brewing or distilling
        if (cell.state === 'brewing' || cell.state === 'distilling') {
            // Increment stage
            cell.stage++;
            anyProgressed = true;
            
            // Check if fully ready
            if (cell.stage >= cell.maxStage) {
                cell.state = 'ready';
            } else if (cell.state === 'brewing' && cell.stage >= 1) {
                cell.state = 'distilling';
            }
            
            // Update HTML UI if it exists
            const cellElement = document.getElementById(`shadow-cell-${index}`);
            if (cellElement) {
                cellElement.className = `grid-cell ${cell.state}`;
                
                // Update stage indicator
                const indicator = cellElement.querySelector('.growth-indicator');
                if (indicator) {
                    indicator.textContent = `${cell.stage}/${cell.maxStage}`;
                }
            }
        }
    });
    
    // Update button states
    updateButtonStates();
    
    // Update Phaser scene if active
    if (anyProgressed && game && game.scene && game.scene.isActive('NightScene')) {
        const nightScene = game.scene.getScene('NightScene');
        if (nightScene && nightScene.updateAllCells) {
            nightScene.updateAllCells();
        }
    }
    
    // Notify only if something actually progressed
    if (anyProgressed) {
        showNotification('Your potions are progressing!', 'info');
    }
}

// Update the shadow market state
function updateShadowMarketState() {
    // Random market state change
    const states = ['stable', 'volatile', 'booming'];
    const newIndex = Math.floor(Math.random() * states.length);
    const oldState = shadowGrid.marketState;
    shadowGrid.marketState = states[newIndex];
    
    // Update multiplier based on state
    switch (shadowGrid.marketState) {
        case 'stable':
            shadowGrid.multiplier = 1.0;
            break;
        case 'volatile':
            shadowGrid.multiplier = 1.5;
            break;
        case 'booming':
            shadowGrid.multiplier = 2.0;
            break;
    }
    
    // Update HTML UI display
    const cycleDisplay = document.getElementById('market-cycle');
    if (cycleDisplay) {
        cycleDisplay.textContent = shadowGrid.marketState;
    }
    
    const multiplierDisplay = document.getElementById('market-multiplier-value');
    if (multiplierDisplay) {
        multiplierDisplay.textContent = `x${shadowGrid.multiplier.toFixed(1)}`;
    }
    
    // Update Phaser scene if active
    if (game && game.scene && game.scene.isActive('NightScene')) {
        const nightScene = game.scene.getScene('NightScene');
        if (nightScene && nightScene.updateMarketStateDisplay) {
            nightScene.updateMarketStateDisplay();
        }
    }
    
    // Update supply/demand values for each cell
    shadowGrid.cells.forEach((cell, index) => {
        // Adjust supply/demand values based on market state
        if (shadowGrid.marketState === 'volatile') {
            // In volatile markets, create more variance
            cell.supply = Math.max(1, Math.floor(cell.supply + (Math.random() * 6 - 3)));
            cell.demand = Math.max(1, Math.floor(cell.demand + (Math.random() * 6 - 3)));
        } else if (shadowGrid.marketState === 'booming') {
            // In booming markets, increase demand
            cell.demand = Math.min(10, Math.floor(cell.demand + (Math.random() * 3)));
        }
    });
    
    // Notify of change if different from before
    if (oldState !== shadowGrid.marketState) {
        showNotification(`Shadow market state changed to ${shadowGrid.marketState.toUpperCase()}!`, 'info');
    }
}

// Update resource display for ranch
function updateRanchResourceDisplay() {
    const hayDisplay = document.getElementById('hay-earned');
    const waterDisplay = document.getElementById('water-earned');
    
    if (hayDisplay) hayDisplay.textContent = playerData.hay;
    if (waterDisplay) waterDisplay.textContent = playerData.water;
}

// Update resource display for shadow market
function updateShadowResourceDisplay() {
    const etherDisplay = document.getElementById('ether-earned');
    const multiplierDisplay = document.getElementById('market-multiplier-value');
    
    if (etherDisplay) etherDisplay.textContent = playerData.ether || 0;
    if (multiplierDisplay) multiplierDisplay.textContent = `x${shadowGrid.multiplier.toFixed(1)}`;
}

function updateButtonStates() {
    // Breed Cattle button
    const breedButton = document.getElementById('breed-cattle');
    if (breedButton) {
        breedButton.disabled = playerData.hay < 10 || playerData.water < 10;
    }
    
    // Upgrade Barn button
    const upgradeButton = document.getElementById('upgrade-barn');
    if (upgradeButton) {
        upgradeButton.disabled = playerData.cattleBalance < 50;
    }
    
    // Craft Potion button
    const craftButton = document.getElementById('craft-potion');
    if (craftButton) {
        craftButton.disabled = playerData.cattleBalance < 20;
    }
    
    // Race game controls - only update if we're in the saloon
    if (currentScene === 'saloon') {
        // Start Race button - enable if any bet is placed
        const startRaceButton = document.getElementById('start-race');
        if (startRaceButton) {
            let totalBet = 0;
            const betInputs = {
                hearts: document.getElementById('bet-hearts').value || 0,
                diamonds: document.getElementById('bet-diamonds').value || 0,
                clubs: document.getElementById('bet-clubs').value || 0,
                spades: document.getElementById('bet-spades').value || 0
            };
            
            Object.values(betInputs).forEach(value => {
                totalBet += parseInt(value);
            });
            
            startRaceButton.disabled = totalBet <= 0 || totalBet > playerData.cattleBalance;
        }
    }
}

function showNotification(message, type = 'info') {
    if (!notification) return; // Skip if notification element doesn't exist
    
    // Set notification content
    const contentEl = notification.querySelector('.content');
    if (contentEl) {
        contentEl.textContent = message;
    }
    
    // Set notification type
    notification.className = type;
    notification.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function showResult(title, message, type = 'info', autoClose = false) {
    if (!resultModal) return; // Skip if modal doesn't exist
    
    // Set result content
    const titleEl = document.getElementById('result-title');
    const messageEl = document.getElementById('result-message');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    
    // Set result type
    resultModal.className = 'modal ' + type;
    resultModal.classList.remove('hidden');
    
    // Auto-close after 3 seconds if requested
    if (autoClose) {
        setTimeout(() => {
            resultModal.classList.add('hidden');
            
            // If we're in the saloon, reset for a new race
            if (currentScene === 'saloon') {
                initSaloonScene();
            }
        }, 3000);
    }
}

// Show a win celebration animation
function showWinCelebration(amount) {
    const winCelebration = document.getElementById('win-celebration');
    const winAmount = document.getElementById('win-amount');
    
    if (!winCelebration || !winAmount) return;
    
    // Set win amount
    winAmount.textContent = `+${amount.toFixed(2)} $CATTLE`;
    
    // Show celebration
    winCelebration.classList.remove('hidden');
    
    // Create confetti effect if function exists
    if (typeof createConfetti === 'function') {
        createConfetti();
    }
    
    // Hide after 3 seconds
    setTimeout(() => {
        winCelebration.classList.add('hidden');
    }, 3000);
}

function addCattleToScene(cattle) {
    try {
        // Check if game is initialized
        if (!game || !game.scene || !game.scene.scenes || !game.scene.scenes[0]) {
            console.log('Cannot add cattle - game scene not initialized');
            return;
        }
        
        const scene = game.scene.scenes[0];
        
        // Check if barn exists
        if (!scene.barn) {
            console.log('Cannot add cattle - barn not found in scene');
            return;
        }
        
        // Check if ranchScene exists
        if (!scene.ranchScene) {
            console.log('Cannot add cattle - ranch scene not found');
            return;
        }
        
        // Random position near the barn
        const x = scene.barn.x + (Math.random() * 200 - 100);
        const y = scene.barn.y + (Math.random() * 200);
        
        // Add cattle sprite with error handling
        try {
            const cattleSprite = scene.add.image(x, y, 'cattle');
            cattleSprite.setScale(0.1);
            scene.ranchScene.add(cattleSprite);
            
            // Simple animation
            scene.tweens.add({
                targets: cattleSprite,
                y: '+=20',
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            console.log(`Added cattle #${cattle.id} to scene`);
        } catch (err) {
            console.error('Error adding cattle sprite:', err);
        }
    } catch (err) {
        console.error('Error in addCattleToScene:', err);
    }
}

function updateProfileUI() {
    // Update profile information
    const cattleBalanceEl = document.getElementById('profile-cattle-balance');
    if (cattleBalanceEl) {
        cattleBalanceEl.textContent = playerData.cattleBalance.toFixed(2);
    }
    
    const characterNameEl = document.getElementById('character-name');
    if (characterNameEl) {
        characterNameEl.value = playerData.name;
    }
    
    // Update character image
    const characterImageEl = document.getElementById('character-image');
    if (characterImageEl) {
        characterImageEl.src = `img/characters/${playerData.characterType}.jpeg`;
        if (playerData.characterType === 'the-scientist') {
            characterImageEl.src = 'img/characters/the-scientist.jpg';
        }
    }
    
    // Update character selection
    document.querySelectorAll('.character-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.character === playerData.characterType) {
            option.classList.add('selected');
        }
    });
    
    // Update statistics
    if (playerData.stats) {
        const statsElements = {
            racesWon: document.getElementById('races-won'),
            racesLost: document.getElementById('races-lost'),
            cattleBred: document.getElementById('cattle-bred'),
            potionsCrafted: document.getElementById('potions-crafted'),
            totalEarned: document.getElementById('total-earned'),
            totalBurned: document.getElementById('total-burned')
        };
        
        if (statsElements.racesWon) statsElements.racesWon.textContent = playerData.stats.racesWon;
        if (statsElements.racesLost) statsElements.racesLost.textContent = playerData.stats.racesLost;
        if (statsElements.cattleBred) statsElements.cattleBred.textContent = playerData.stats.cattleBred;
        if (statsElements.potionsCrafted) statsElements.potionsCrafted.textContent = playerData.stats.potionsCrafted;
        if (statsElements.totalEarned) statsElements.totalEarned.textContent = playerData.stats.totalEarned.toFixed(2);
        if (statsElements.totalBurned) statsElements.totalBurned.textContent = playerData.stats.totalBurned.toFixed(2);
    }
}

function addPotionEffect() {
    try {
        // Check if game is initialized
        if (!game || !game.scene || !game.scene.scenes || !game.scene.scenes[0]) {
            console.log('Cannot add potion effect - game scene not initialized');
            return;
        }
        
        const scene = game.scene.scenes[0];
        
        // Check if night character exists
        if (!scene.nightCharacter) {
            console.log('Cannot add potion effect - night character not found in scene');
            return;
        }
        
        // Check if night scene exists
        if (!scene.nightScene) {
            console.log('Cannot add potion effect - night scene not found');
            return;
        }
        
        // Add potion effect with error handling
        try {
            const potion = scene.add.image(scene.nightCharacter.x + 50, scene.nightCharacter.y - 50, 'potion');
            potion.setScale(0.05);
            scene.nightScene.add(potion);
            
            // Potion animation
            scene.tweens.add({
                targets: potion,
                alpha: { from: 1, to: 0 },
                y: '-=100',
                duration: 2000,
                ease: 'Power1',
                onComplete: () => {
                    potion.destroy();
                }
            });
            
            console.log('Added potion effect to night scene');
        } catch (err) {
            console.error('Error adding potion effect:', err);
        }
    } catch (err) {
        console.error('Error in addPotionEffect:', err);
    }
}

// Update total bet display - global function used by event listeners
function updateTotalBet() {
    let total = 0;
    
    // Get bet values from display spans
    const betValues = {
        hearts: parseInt(document.getElementById('hearts-bet-display').textContent) || 0,
        diamonds: parseInt(document.getElementById('diamonds-bet-display').textContent) || 0,
        clubs: parseInt(document.getElementById('clubs-bet-display').textContent) || 0,
        spades: parseInt(document.getElementById('spades-bet-display').textContent) || 0
    };
    
    // Log values for debugging
    console.log("Bet values:", betValues);
    
    // Log the parsed values
    console.log("Bet values:", betValues);
    
    total = betValues.hearts + betValues.diamonds + betValues.clubs + betValues.spades;
    console.log("Total bet:", total);
    
    // Update total bet display with null checks
    const totalBetEl = document.getElementById('total-bet-amount');
    if (totalBetEl) {
        totalBetEl.textContent = total;
    } else {
        console.error("Total bet element not found");
    }
    
    const burnAmountEl = document.getElementById('burn-amount');
    if (burnAmountEl) {
        burnAmountEl.textContent = (total * 0.1).toFixed(1);
    } else {
        console.error("Burn amount element not found");
    }
    
    // Update Start Race button state
    const startRaceButton = document.getElementById('start-race');
    if (startRaceButton) {
        const isDisabled = total <= 0 || total > playerData.cattleBalance;
        startRaceButton.disabled = isDisabled;
        console.log("Start race button state updated. Disabled:", isDisabled);
    } else {
        console.error("Start race button not found");
    }
}

// Card rendering function for blackjack game
function createCardElement(card) {
    const cardElement = document.createElement('div');
    
    if (card.hidden) {
        // Face down card
        cardElement.className = 'card face-down';
        return cardElement;
    }
    
    // Face up card
    cardElement.className = `card ${card.color}`;
    
    // Create card content
    const suitTop = document.createElement('div');
    suitTop.className = 'suit top';
    suitTop.textContent = card.suit;
    
    const rank = document.createElement('div');
    rank.className = 'rank';
    rank.textContent = card.rank;
    
    const suitBottom = document.createElement('div');
    suitBottom.className = 'suit bottom';
    suitBottom.textContent = card.suit;
    
    // Append content to card
    cardElement.appendChild(suitTop);
    cardElement.appendChild(rank);
    cardElement.appendChild(suitBottom);
    
    return cardElement;
}

// Setup betting sliders functionality
function setupBettingSliders() {
    // Get elements
    const betButtons = document.querySelectorAll('.bet-button');
    const betSliderOverlay = document.getElementById('bet-slider-overlay');
    if (!betButtons.length || !betSliderOverlay) return; // Skip if elements not found
    
    const betSlider = document.getElementById('bet-slider');
    const betSliderValue = document.getElementById('bet-slider-value');
    const confirmBetBtn = document.getElementById('confirm-bet');
    const cancelBetBtn = document.getElementById('cancel-bet');
    let currentSuit = '';
    
    console.log("Setting up betting sliders for " + betButtons.length + " bet buttons");
    
    // Set up bet button clicks
    betButtons.forEach(button => {
        // Remove any existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function() {
            const suit = this.getAttribute('data-suit');
            currentSuit = suit;
            console.log("Bet button clicked for suit:", suit);
            
            // Set slider title with capitalized suit name
            const capitalizedSuit = suit.charAt(0).toUpperCase() + suit.slice(1);
            document.getElementById('bet-slider-title').textContent = `Place Bet on ${capitalizedSuit}`;
            
            // Get current bet value for this suit
            const currentBet = parseInt(document.getElementById(`${suit}-bet-display`).textContent) || 0;
            betSlider.value = currentBet;
            betSliderValue.textContent = currentBet;
            
            // Set max value based on player balance
            betSlider.max = Math.min(50, Math.floor(playerData.cattleBalance));
            
            // Show the slider overlay
            betSliderOverlay.classList.remove('hidden');
        });
    });
    
    // Update slider value display as it changes
    if (betSlider) {
        betSlider.addEventListener('input', function() {
            betSliderValue.textContent = this.value;
        });
    }
    
    // Handle confirm bet
    if (confirmBetBtn) {
        confirmBetBtn.addEventListener('click', function() {
            if (currentSuit) {
                console.log(`Confirming bet of ${betSlider.value} on ${currentSuit}`);
                
                // Update bet display
                document.getElementById(`${currentSuit}-bet-display`).textContent = betSlider.value;
                
                // Update total bet
                updateTotalBet();
                
                // Hide the slider overlay
                betSliderOverlay.classList.add('hidden');
            }
        });
    }
    
    // Handle cancel bet
    if (cancelBetBtn) {
        cancelBetBtn.addEventListener('click', function() {
            console.log("Canceling bet");
            betSliderOverlay.classList.add('hidden');
        });
    }
}