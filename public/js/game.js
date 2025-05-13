// Connect to server
const socket = io();

// Game state
let playerData = {
    name: 'Cowboy',
    archetype: 'Entrepreneur',
    characterType: 'the-kid',
    cattleBalance: 100,
    hay: 100,
    water: 100,
    ether: 0,
    barnCapacity: 100,
    cattle: [],
    potionCollection: [],
    // Added progression system - Level and XP
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    stats: {
        racesWon: 0,
        racesLost: 0,
        cattleBred: 0,
        potionsCrafted: 0,
        totalEarned: 0,
        totalBurned: 0,
        plantsHarvested: 0,
        potionsDistilled: 0
    },
    // Added achievements system
    achievements: {
        farmer: { 
            name: "Farmer", 
            description: "Harvest 10 crops", 
            requirement: 10, 
            current: 0, 
            reward: 100, 
            unlocked: false 
        },
        alchemist: { 
            name: "Alchemist", 
            description: "Distill 5 potions", 
            requirement: 5, 
            current: 0, 
            reward: 100, 
            unlocked: false 
        },
        gambler: { 
            name: "Gambler", 
            description: "Win 3 races", 
            requirement: 3, 
            current: 0, 
            reward: 100, 
            unlocked: false 
        }
    }
};

let marketPrice = 1.0;
let currentScene = 'main-menu';
let wagerAmount = 10;

// Function to add XP and handle level-ups
function addPlayerXP(amount) {
    if (!amount || amount <= 0) return;
    
    // Add XP
    playerData.xp += amount;
    console.log(`Added ${amount} XP! Total: ${playerData.xp}`);
    
    // Check for level up
    if (playerData.xp >= playerData.xpToNextLevel) {
        levelUpPlayer();
    }
    
    // Update UI if available
    updateXPDisplay();
}

// Function to handle player level up
function levelUpPlayer() {
    // Level up!
    playerData.level += 1;
    
    // Calculate excess XP for next level
    const excessXP = playerData.xp - playerData.xpToNextLevel;
    playerData.xp = excessXP;
    
    // Increase XP required for next level
    playerData.xpToNextLevel = playerData.level * 100;
    
    // Reward for leveling up
    playerData.cattleBalance += 50;
    
    // Increase multipliers
    if (window.ranchGrid && typeof ranchGrid.multiplier !== 'undefined') {
        ranchGrid.multiplier += 0.1;
    }
    
    if (window.shadowGrid && typeof shadowGrid.multiplier !== 'undefined') {
        shadowGrid.multiplier += 0.1;
    }
    
    // Show notification
    showNotification(`Level Up! You reached level ${playerData.level}! +50 $CATTLE`, 'success');
    
    // Play level up sound if available
    playSoundEffect('levelup');
    
    // Update UI
    updateAllDisplays();
}

// Function to update XP display
function updateXPDisplay() {
    const xpValue = document.getElementById('xp-value');
    const xpProgress = document.getElementById('xp-progress-bar');
    const levelValue = document.getElementById('level-value');
    
    if (xpValue) {
        xpValue.textContent = `${playerData.xp} / ${playerData.xpToNextLevel}`;
    }
    
    if (xpProgress) {
        const progressPercent = (playerData.xp / playerData.xpToNextLevel) * 100;
        xpProgress.style.width = `${progressPercent}%`;
    }
    
    if (levelValue) {
        levelValue.textContent = playerData.level;
    }
}

// Function to check and update achievements
function checkAchievements() {
    // Check Farmer Achievement
    if (!playerData.achievements.farmer.unlocked && 
        playerData.stats.plantsHarvested >= playerData.achievements.farmer.requirement) {
        unlockAchievement('farmer');
    }
    
    // Check Alchemist Achievement
    if (!playerData.achievements.alchemist.unlocked && 
        playerData.stats.potionsDistilled >= playerData.achievements.alchemist.requirement) {
        unlockAchievement('alchemist');
    }
    
    // Check Gambler Achievement
    if (!playerData.achievements.gambler.unlocked && 
        playerData.stats.racesWon >= playerData.achievements.gambler.requirement) {
        unlockAchievement('gambler');
    }
}

// Function to unlock achievement and give rewards
function unlockAchievement(achievementId) {
    if (!playerData.achievements[achievementId]) {
        console.error(`Achievement ${achievementId} does not exist`);
        return;
    }
    
    const achievement = playerData.achievements[achievementId];
    
    // Already unlocked
    if (achievement.unlocked) return;
    
    // Unlock the achievement
    achievement.unlocked = true;
    
    // Give reward
    playerData.cattleBalance += achievement.reward;
    
    // Show notification
    showNotification(`Achievement Unlocked: ${achievement.name}! +${achievement.reward} $CATTLE`, 'achievement');
    
    // Play achievement sound
    playSoundEffect('achievement');
    
    // Update UI
    updateAchievementsDisplay();
    updateAllDisplays();
}

// Function to update achievements display
function updateAchievementsDisplay() {
    const achievementsContainer = document.getElementById('achievements-container');
    
    if (!achievementsContainer) return;
    
    // Clear existing achievements
    achievementsContainer.innerHTML = '';
    
    // Add each achievement
    for (const id in playerData.achievements) {
        const achievement = playerData.achievements[id];
        
        // Create achievement element
        const element = document.createElement('div');
        element.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        // Create title
        const title = document.createElement('div');
        title.className = 'achievement-title';
        title.textContent = achievement.name;
        
        // Create description
        const description = document.createElement('div');
        description.className = 'achievement-description';
        description.textContent = achievement.description;
        
        // Create progress
        const progress = document.createElement('div');
        progress.className = 'achievement-progress';
        progress.textContent = `${achievement.current}/${achievement.requirement}`;
        
        // Create reward
        const reward = document.createElement('div');
        reward.className = 'achievement-reward';
        reward.textContent = `Reward: ${achievement.reward} $CATTLE`;
        
        // Append children
        element.appendChild(title);
        element.appendChild(description);
        element.appendChild(progress);
        element.appendChild(reward);
        
        // Add to container
        achievementsContainer.appendChild(element);
    }
}

// Function to play sound effects
function playSoundEffect(soundName) {
    // Check if we're in a Phaser scene
    const currentPhaserScene = window.phaserGame && window.phaserGame.scene.getScenes(true)[0];
    
    if (currentPhaserScene && currentPhaserScene.sound && currentPhaserScene.sound.play) {
        // Use Phaser's sound system
        try {
            currentPhaserScene.sound.play(soundName);
            console.log(`Playing sound: ${soundName} via Phaser`);
        } catch (err) {
            console.error(`Error playing sound ${soundName} via Phaser:`, err);
        }
    } else {
        // Use HTML5 Audio as fallback
        try {
            const audio = new Audio(`img/${soundName}.mp3`);
            audio.volume = 0.5; // 50% volume
            audio.play().catch(err => console.error('Audio play error:', err));
            console.log(`Playing sound: ${soundName} via HTML Audio`);
        } catch (err) {
            console.error(`Error playing sound ${soundName} via HTML Audio:`, err);
        }
    }
}

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
            startX: 0, // Will be calculated in create
            startY: 0  // Will be calculated in create
        };
    }
    
    preload() {
        try {
            // Use the asset preloader to safely load assets if available
            if (typeof preloadCommonAssets === 'function') {
                preloadCommonAssets(this);
            }
            
            // Always load the barn (special asset not in common set)
            if (typeof safePhaserImageLoad === 'function') {
                safePhaserImageLoad(this, 'barn', 'https://i.imgur.com/t32QEZB.png');
            } else {
                this.load.image('barn', 'https://i.imgur.com/t32QEZB.png');
            }
            
            // Create fallback graphics for any missing textures when load completes
            this.load.on('complete', () => {
                console.log("RanchScene assets loaded");
                
                // Ensure essential textures have fallbacks
                const essentialTextures = [
                    'cell-empty', 'cell-planted', 'cell-growing', 'cell-harvestable', 
                    'cattle', 'water-drop', 'hay-icon', 'milk-bottle'
                ];
                
                essentialTextures.forEach(key => {
                    if (!this.textures.exists(key) && typeof handleMissingTexture === 'function') {
                        handleMissingTexture(this, key);
                    }
                });
            });
        } catch (error) {
            console.error("Error in RanchScene preload:", error);
        }
    }
    
    create() {
        // Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Set up background
        this.bg = this.add.image(width/2, height/2, 'game-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0xffeedd); // Warm daylight tint
        
        // Create a container for our ranch elements
        this.ranchContainer = this.add.container(0, 0);
        
        // Add barn to ranch scene - with error handling
        try {
            // Create a default barn graphic if texture isn't available
            if (!this.textures.exists('barn')) {
                console.log("Creating barn placeholder graphic");
                const barnGraphics = this.add.graphics();
                barnGraphics.fillStyle(0x8b4513, 1); // Brown
                barnGraphics.fillRect(-100, -75, 200, 150);
                barnGraphics.fillStyle(0xff0000, 1); // Red roof
                barnGraphics.fillTriangle(-110, -75, 110, -75, 0, -150);
                barnGraphics.generateTexture('barn-placeholder', 220, 200);
                barnGraphics.destroy();
                
                this.barn = this.add.image(width * 0.7, height * 0.4, 'barn-placeholder');
            } else {
                this.barn = this.add.image(width * 0.7, height * 0.4, 'barn');
            }
            
            this.barn.setScale(0.5);
            this.ranchContainer.add(this.barn);
            console.log("Barn successfully added to scene");
        } catch (error) {
            console.error("Error adding barn:", error);
            // Create a simple barn as a graphics object as fallback
            const fallbackBarn = this.add.graphics();
            fallbackBarn.fillStyle(0x8b4513, 1); // Brown
            fallbackBarn.fillRect(width * 0.7 - 50, height * 0.4 - 40, 100, 80);
            fallbackBarn.fillStyle(0xff0000, 1); // Red roof
            fallbackBarn.fillTriangle(width * 0.7 - 60, height * 0.4 - 40, width * 0.7 + 60, height * 0.4 - 40, width * 0.7, height * 0.4 - 80);
            
            // Add to container
            this.ranchContainer.add(fallbackBarn);
            
            // Create a reference to it as this.barn for later code
            this.barn = {
                x: width * 0.7,
                y: height * 0.4,
                // Add minimal methods to avoid null ref errors
                setScale: function() {},
                setPosition: function(x, y) { this.x = x; this.y = y; }
            };
            console.log("Created fallback barn graphics object");
        }
        
        // Initialize the Phaser grid
        this.initPhaserGrid();
        
        // Set up cattle milking timer
        this.milkTimer = this.time.addEvent({
            delay: 30000, // 30 seconds
            callback: this.milkAllCattle,
            callbackScope: this,
            loop: true
        });
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }
    
    // Initialize the Phaser-based ranch grid
    initPhaserGrid() {
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
            fontFamily: 'Anta',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { color: '#000000', fill: true, offsetX: 1, offsetY: 1, blur: 2 }
        }).setOrigin(0.5);
        this.ranchContainer.add(gridHeader);
        
        // Create the grid cells
        this.createGridCells();
        
        // Add harvest all button
        const harvestAllBtn = this.add.text(gridX, gridY + totalHeight/2 + 40, '🌾 Harvest All', {
            fontFamily: 'Anta',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#3a7d44',
            padding: { x: 10, y: 5 },
            shadow: { color: '#000000', fill: true, offsetX: 1, offsetY: 1, blur: 2 }
        }).setOrigin(0.5);
        
        harvestAllBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => harvestAllRanchCells());
            
        this.ranchContainer.add(harvestAllBtn);
    }
    
    // Create individual grid cells
    createGridCells() {
        const { size, cellSize, padding, startX, startY } = this.gridConfig;
        
        // Initialize the cells array if it's empty
        if (ranchGrid.cells.length === 0) {
            for (let i = 0; i < size * size; i++) {
                ranchGrid.cells.push({
                    id: i,
                    state: 'empty',
                    growthStage: 0,
                    growthMax: 3
                });
            }
        }
        
        // Clear existing cells if any
        this.gridCells.forEach(cell => {
            if (cell.sprite) cell.sprite.destroy();
            if (cell.text) cell.text.destroy();
        });
        this.gridCells = [];
        
        // Create the grid cells
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cellIndex = row * size + col;
                const cell = ranchGrid.cells[cellIndex];
                
                // Calculate position
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Determine which sprite to use based on state
                let spriteName = 'cell-empty';
                if (cell.state === 'planted') spriteName = 'cell-planted';
                if (cell.state === 'growing') spriteName = 'cell-growing';
                if (cell.state === 'harvestable') spriteName = 'cell-harvestable';
                
                // Add the cell sprite
                const cellSprite = this.add.image(x, y, spriteName);
                cellSprite.setDisplaySize(cellSize, cellSize);
                cellSprite.setScale(0.8); // Start small for animation
                
                // Add an animation for appearance
                this.tweens.add({
                    targets: cellSprite,
                    scale: 1,
                    duration: 500,
                    ease: 'Bounce.easeOut'
                });
                
                // Add interactivity
                cellSprite.setInteractive({ useHandCursor: true });
                cellSprite.on('pointerdown', () => this.handleGridCellClick(cellIndex));
                
                // Add growth stage indicator for non-empty cells
                let growthText = null;
                if (cell.state !== 'empty') {
                    growthText = this.add.text(x, y, `${cell.growthStage}/${cell.growthMax}`, {
                        fontFamily: 'Anta',
                        fontSize: '16px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5);
                }
                
                // Store the cell reference
                this.gridCells.push({
                    sprite: cellSprite,
                    text: growthText,
                    index: cellIndex
                });
                
                // Add to container
                this.gridContainer.add(cellSprite);
                if (growthText) this.gridContainer.add(growthText);
            }
        }
    }
    
    // Handle grid cell clicks
    handleGridCellClick(cellIndex) {
        // Call the existing handler function
        handleRanchCellClick(cellIndex);
        
        // Update cell appearance after click
        this.updateCellAppearance(cellIndex);
    }
    
    // Update the appearance of a specific cell
    updateCellAppearance(cellIndex) {
        const cell = ranchGrid.cells[cellIndex];
        const cellObj = this.gridCells[cellIndex];
        
        if (!cellObj || !cellObj.sprite) return;
        
        // Determine which sprite to use based on state
        let spriteName = 'cell-empty';
        if (cell.state === 'planted') spriteName = 'cell-planted';
        if (cell.state === 'growing') spriteName = 'cell-growing';
        if (cell.state === 'harvestable') spriteName = 'cell-harvestable';
        
        // Update the sprite with animation
        cellObj.sprite.setTexture(spriteName);
        
        // Add scale animation for state change
        this.tweens.add({
            targets: cellObj.sprite,
            scale: { from: 0.8, to: 1 },
            duration: 500,
            ease: 'Bounce.easeOut'
        });
        
        // Update growth text
        if (cellObj.text) {
            if (cell.state === 'empty') {
                cellObj.text.setVisible(false);
            } else {
                cellObj.text.setVisible(true);
                cellObj.text.setText(`${cell.growthStage}/${cell.growthMax}`);
            }
        } else if (cell.state !== 'empty') {
            // Create text if it doesn't exist
            const { startX, startY, cellSize, padding, size } = this.gridConfig;
            const row = Math.floor(cellIndex / size);
            const col = cellIndex % size;
            const x = startX + col * (cellSize + padding);
            const y = startY + row * (cellSize + padding);
            
            cellObj.text = this.add.text(x, y, `${cell.growthStage}/${cell.growthMax}`, {
                fontFamily: 'Anta',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.gridContainer.add(cellObj.text);
        }
    }
    
    // Update all cells with current data
    updateAllCells() {
        ranchGrid.cells.forEach((cell, index) => {
            this.updateCellAppearance(index);
        });
    }
    
    // Add a cattle sprite to the scene with animation
    addCattleSprite(cattle) {
        // Check if barn exists
        if (!this.barn) {
            console.warn("Barn not initialized, cannot place cattle");
            return null;
        }
        
        // Random position near the barn
        const x = this.barn.x + (Math.random() * 200 - 100);
        const y = this.barn.y + (Math.random() * 200 - 50);
        
        // Initialize cattle arrays if needed
        if (!this.cattle) this.cattle = [];
        if (!this.cattleMilkTimers) this.cattleMilkTimers = [];
        
        try {
            // Create the cattle sprite
            const cattleSprite = this.add.image(x, y, 'cattle');
            cattleSprite.setScale(0.2);
            cattleSprite.setData('cattle', cattle);
            
            // Add to scene and store reference
            if (this.ranchContainer) {
                this.ranchContainer.add(cattleSprite);
            }
            this.cattle.push(cattleSprite);
            
            // Add bouncing animation
            this.tweens.add({
                targets: cattleSprite,
                y: y - 10,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Set up milk production timer for this cattle
            this.cattleMilkTimers.push({
                cattleId: cattle.id,
                lastMilked: Date.now()
            });
            
            console.log(`Added cattle #cattle-${cattle.id} to scene with milk production`);
            return cattleSprite;
        } catch (error) {
            console.error("Error adding cattle sprite:", error);
            return null;
        }
    }
    
    // Milk all cattle
    milkAllCattle() {
        try {
            // Check if this is being called from an inactive scene
            if (!this.scene || !this.scene.isActive()) {
                console.log("milkAllCattle called from inactive scene, skipping");
                return;
            }
            
            // Check if playerData exists
            if (!window.playerData) {
                console.log("Player data not initialized, skipping milk production");
                return;
            }
            
            // Initialize if needed - defensive programming
            if (typeof window.playerData.cattle === 'undefined') {
                console.log("Initializing empty cattle array");
                window.playerData.cattle = [];
                return;
            }
            
            // Ensure cattle is an array
            if (!Array.isArray(window.playerData.cattle)) {
                console.warn("playerData.cattle is not an array:", window.playerData.cattle);
                // Convert to array if possible, or initialize empty array
                if (typeof window.playerData.cattle === 'object') {
                    window.playerData.cattle = Object.values(window.playerData.cattle);
                } else {
                    window.playerData.cattle = [];
                }
                return; // Skip this cycle as we've just fixed the data structure
            }
            
            // Skip if no cattle
            if (window.playerData.cattle.length === 0) {
                return;
            }
            
            let totalMilk = 0;
            
            // Now safely use forEach since we've verified it's an array
            window.playerData.cattle.forEach(cattle => {
                if (!cattle || typeof cattle !== 'object') return;
                
                // Default to 1 if milk property isn't set
                const milkAmount = typeof cattle.milk === 'number' ? cattle.milk : 1;
                const milkProduced = milkAmount * 2;
                totalMilk += milkProduced;
                
                try {
                    // Create milk animation only if we're in the proper scene
                    this.createMilkAnimation(cattle.id, milkProduced);
                } catch (animError) {
                    console.warn("Could not create milk animation:", animError);
                }
            });
            
            if (totalMilk > 0) {
                // Update player balance
                window.playerData.cattleBalance += totalMilk;
                
                // Show notification
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`Your cattle produced ${totalMilk} $CATTLE!`, 'success');
                }
                
                // Update UI
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
        } catch (error) {
            console.error("Error in milkAllCattle:", error);
        }
    }
    
    // Create milk animation for a specific cattle
    createMilkAnimation(cattleId, amount) {
        try {
            // Safety check for scene
            if (!this.scene || !this.scene.isActive()) {
                console.log("createMilkAnimation called from inactive scene, skipping");
                return;
            }
            
            // Safety check for cattle array
            if (!this.cattle || !Array.isArray(this.cattle) || this.cattle.length === 0) {
                console.log("No cattle sprites in scene, skipping milk animation");
                return;
            }
            
            // Find the cattle sprite
            const cattleSprite = this.cattle.find(sprite => 
                sprite && sprite.getData && typeof sprite.getData === 'function' && 
                sprite.getData('cattle') && sprite.getData('cattle').id === cattleId
            );
            
            if (!cattleSprite) {
                console.log(`No cattle sprite found with ID ${cattleId}`);
                return;
            }
            
            // Check if container exists
            if (!this.ranchContainer) {
                console.warn("Ranch container not found, creating fallback container");
                this.ranchContainer = this.add.container(0, 0);
            }
            
            let milkIcon, milkText;
            
            try {
                // Create milk bottle icon - with fallback
                if (this.textures.exists('milk-bottle')) {
                    milkIcon = this.add.image(cattleSprite.x, cattleSprite.y - 30, 'milk-bottle');
                    milkIcon.setScale(0.15);
                } else {
                    // Create a simple milk icon as fallback
                    const graphics = this.add.graphics();
                    graphics.fillStyle(0xffffff, 1);
                    graphics.fillRect(-5, -10, 10, 15);
                    graphics.generateTexture('milk-bottle-fallback', 20, 30);
                    graphics.destroy();
                    
                    milkIcon = this.add.image(cattleSprite.x, cattleSprite.y - 30, 'milk-bottle-fallback');
                }
                
                this.ranchContainer.add(milkIcon);
                
                // Create milk amount text
                milkText = this.add.text(cattleSprite.x + 20, cattleSprite.y - 30, `+${amount}`, {
                    fontFamily: '"Anta", "Arial", sans-serif',
                    fontSize: '16px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 2
                }).setOrigin(0, 0.5);
                this.ranchContainer.add(milkText);
                
                // Animate milk icon and text
                this.tweens.add({
                    targets: [milkIcon, milkText],
                    y: '-=50',
                    alpha: { from: 1, to: 0 },
                    duration: 2000,
                    onComplete: () => {
                        if (milkIcon && milkIcon.destroy) milkIcon.destroy();
                        if (milkText && milkText.destroy) milkText.destroy();
                    }
                });
            } catch (error) {
                console.error("Error creating milk animation:", error);
                // Clean up if error occurs
                if (milkIcon && milkIcon.destroy) milkIcon.destroy();
                if (milkText && milkText.destroy) milkText.destroy();
            }
        } catch (outerError) {
            console.error("Fatal error in createMilkAnimation:", outerError);
        }
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
        
        // Recalculate grid position
        if (this.gridContainer) {
            const { size, cellSize, padding } = this.gridConfig;
            const totalWidth = (cellSize + padding) * size;
            const totalHeight = (cellSize + padding) * size;
            
            // Update grid position
            const gridX = width * 0.25;
            const gridY = height * 0.5;
            
            // Recalculate starting position
            this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
            this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
            
            // Update cell positions
            this.updateGridCellPositions();
        }
    }
    
    // Update the positions of all grid cells after resize
    updateGridCellPositions() {
        const { size, cellSize, padding, startX, startY } = this.gridConfig;
        
        // Update position of each cell
        this.gridCells.forEach((cellObj, index) => {
            if (!cellObj.sprite) return;
            
            const row = Math.floor(index / size);
            const col = index % size;
            const x = startX + col * (cellSize + padding);
            const y = startY + row * (cellSize + padding);
            
            // Update sprite position
            cellObj.sprite.setPosition(x, y);
            
            // Update text position if it exists
            if (cellObj.text) {
                cellObj.text.setPosition(x, y);
            }
        });
        
        // Update grid header and harvest button positions
        const children = this.ranchContainer.getAll();
        children.forEach(child => {
            if (child.type === 'Text' && child.text === 'Ranch Pasture') {
                const gridX = this.scale.width * 0.25;
                const totalHeight = (cellSize + padding) * size;
                const gridY = this.scale.height * 0.5;
                
                child.setPosition(gridX, gridY - totalHeight/2 - 40);
            }
            
            if (child.type === 'Text' && child.text === '🌾 Harvest All') {
                const gridX = this.scale.width * 0.25;
                const totalHeight = (cellSize + padding) * size;
                const gridY = this.scale.height * 0.5;
                
                child.setPosition(gridX, gridY + totalHeight/2 + 40);
            }
        });
    }
}

// Define the SaloonScene class - simplified for stability
class SaloonScene extends Phaser.Scene {
    constructor() {
        super('SaloonScene');
        this.raceCardImages = {};
        this.raceData = {
            status: 'betting', // 'betting', 'racing', or 'finished'
            currentCard: null,
            progress: {
                hearts: 0,
                diamonds: 0,
                clubs: 0,
                spades: 0
            }
        };
    }
    
    preload() {
        // Load the background and card assets
        this.load.image('game-bg', 'img/game-background.jpeg');
        
        // Load card images if they don't already exist - with fallback detection
        try {
            // Create placeholder card textures
            const suits = ['♥', '♦', '♠', '♣'];
            const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            
            this.graphics = this.add.graphics();
            
            // Create card base
            this.graphics.fillStyle(0xffffff);
            this.graphics.fillRoundedRect(0, 0, 120, 168, 10);
            this.graphics.generateTexture('card-base', 120, 168);
            
            // Create heart symbol
            this.graphics.clear();
            this.graphics.fillStyle(0xff0000);
            this.graphics.fillCircle(15, 15, 10);
            this.graphics.fillCircle(35, 15, 10);
            this.graphics.fillTriangle(5, 20, 45, 20, 25, 40);
            this.graphics.generateTexture('heart-symbol', 50, 50);
            
            // Create diamond symbol
            this.graphics.clear();
            this.graphics.fillStyle(0xff0000);
            this.graphics.fillTriangle(25, 5, 5, 25, 25, 45, 45, 25);
            this.graphics.generateTexture('diamond-symbol', 50, 50);
            
            // Create spade symbol
            this.graphics.clear();
            this.graphics.fillStyle(0x000000);
            this.graphics.fillCircle(15, 25, 10);
            this.graphics.fillCircle(35, 25, 10);
            this.graphics.fillTriangle(5, 20, 45, 20, 25, 0);
            this.graphics.fillRect(20, 35, 10, 15);
            this.graphics.generateTexture('spade-symbol', 50, 50);
            
            // Create club symbol
            this.graphics.clear();
            this.graphics.fillStyle(0x000000);
            this.graphics.fillCircle(15, 15, 10);
            this.graphics.fillCircle(35, 15, 10);
            this.graphics.fillCircle(25, 30, 10);
            this.graphics.fillRect(20, 35, 10, 15);
            this.graphics.generateTexture('club-symbol', 50, 50);
        } catch (error) {
            console.error("Error creating card textures:", error);
        }
    }
    
    create() {
        // Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Set up background
        this.bg = this.add.image(width/2, height/2, 'game-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0xddbb88); // Warm indoor lighting tint
        
        // Create container for racing elements
        this.raceContainer = this.add.container(0, 0);
        
        // Add table display (background for cards)
        const tableGraphics = this.add.graphics();
        tableGraphics.fillStyle(0x331100, 0.6);
        tableGraphics.fillRoundedRect(width/2 - 200, height/2 - 120, 400, 240, 20);
        this.raceContainer.add(tableGraphics);
        
        // Add a callback to initialize racing game in the DOM
        if (window.racingGame && typeof window.racingGame.init === 'function') {
            setTimeout(() => {
                console.log("Triggering racing game initialization from SaloonScene");
                window.racingGame.init();
                
                // Dispatch a scene change event
                const event = new CustomEvent('scene-changed', {
                    detail: { scene: 'saloon' }
                });
                document.dispatchEvent(event);
            }, 100);
        }
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }
    
    // Update the card display with a new card
    updateCardDisplay(card) {
        if (!card) return;
        
        this.raceData.currentCard = card;
        
        // Clear existing card sprite
        if (this.currentCardSprite) {
            this.currentCardSprite.destroy();
        }
        
        // Create new card sprite
        const width = this.scale.width;
        const height = this.scale.height;
        
        try {
            // Create a card from scratch using generated textures
            const cardGroup = this.add.container(width/2, height/2 - 40);
            
            const cardBase = this.add.image(0, 0, 'card-base');
            cardGroup.add(cardBase);
            
            const suitMap = {
                '♥': { texture: 'heart-symbol', color: 0xff0000 },
                '♦': { texture: 'diamond-symbol', color: 0xff0000 },
                '♠': { texture: 'spade-symbol', color: 0x000000 },
                '♣': { texture: 'club-symbol', color: 0x000000 }
            };
            
            const suitInfo = suitMap[card.suit] || { texture: 'heart-symbol', color: 0xff0000 };
            
            // Add suit symbol in center
            const suitSymbol = this.add.image(0, 0, suitInfo.texture);
            suitSymbol.setScale(1.5);
            cardGroup.add(suitSymbol);
            
            // Add rank text
            const rankStyle = {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: suitInfo.color === 0xff0000 ? '#ff0000' : '#000000',
                fontStyle: 'bold'
            };
            
            const topRank = this.add.text(-45, -65, card.rank, rankStyle).setOrigin(0, 0);
            const bottomRank = this.add.text(45, 65, card.rank, rankStyle).setOrigin(1, 1);
            bottomRank.setAngle(180);
            
            cardGroup.add(topRank);
            cardGroup.add(bottomRank);
            
            // Add small suit icons by the rank
            const topSuit = this.add.image(-45, -40, suitInfo.texture).setOrigin(0, 0);
            const bottomSuit = this.add.image(45, 40, suitInfo.texture).setOrigin(1, 1);
            topSuit.setScale(0.4);
            bottomSuit.setScale(0.4);
            bottomSuit.setAngle(180);
            
            cardGroup.add(topSuit);
            cardGroup.add(bottomSuit);
            
            // Add card to scene
            this.currentCardSprite = cardGroup;
            this.raceContainer.add(cardGroup);
            
            // Animation effect
            this.tweens.add({
                targets: cardGroup,
                y: { from: height/2 - 100, to: height/2 - 40 },
                scaleX: { from: 0.8, to: 1 },
                scaleY: { from: 0.8, to: 1 },
                duration: 300,
                ease: 'Bounce.out'
            });
            
        } catch (error) {
            console.error("Error creating card display:", error);
        }
    }
    
    // Update race progress
    updateRaceProgress(progress) {
        if (!progress) return;
        
        this.raceData.progress = progress;
        
        // Update the DOM progress bars through the racing-game.js helper
        try {
            if (window.racingGame && typeof window.racingGame.updateProgress === 'function') {
                window.racingGame.updateProgress(progress);
            }
        } catch (error) {
            console.error("Error updating race progress:", error);
        }
    }
    
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Resize background
        if (this.bg) {
            this.bg.setPosition(width/2, height/2);
            this.bg.setDisplaySize(width, height);
        }
        
        // Reposition card if it exists
        if (this.currentCardSprite) {
            this.currentCardSprite.setPosition(width/2, height/2 - 40);
        }
    }
}

// Define the NightScene class - simplified to just provide the background
class NightScene extends Phaser.Scene {
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
        try {
            // Use the asset preloader if available
            if (typeof preloadCommonAssets === 'function') {
                preloadCommonAssets(this);
            } else {
                // Fallback loading
                this.load.image('shadow-bg', 'img/game-background.jpeg');
                this.load.image('bubble', 'img/bubble.png');
                this.load.image('glow', 'img/glow.png');
                
                // PNG versions of the grid cell states
                this.load.image('empty-night', 'img/empty-night.png');
                this.load.image('brewing', 'img/brewing.png');
                this.load.image('distilling', 'img/distilling.png'); 
                this.load.image('ready', 'img/ready.png');
            }
            
            // Create fallback graphics for any missing textures
            this.load.on('complete', () => {
                console.log("NightScene assets loaded");
                
                // Check and create placeholders for essential textures
                const essentialTextures = [
                    'empty-night', 'brewing', 'distilling', 'ready', 
                    'bubble', 'glow'
                ];
                
                essentialTextures.forEach(key => {
                    if (!this.textures.exists(key) && typeof handleMissingTexture === 'function') {
                        // Create colored placeholders based on the key
                        let color = 0x000000;
                        if (key === 'empty-night') color = 0x212121;
                        if (key === 'brewing') color = 0x4a148c;
                        if (key === 'distilling') color = 0x7c4dff;
                        if (key === 'ready') color = 0xe040fb;
                        if (key === 'bubble') color = 0x42a5f5;
                        if (key === 'glow') color = 0xffeb3b;
                        
                        handleMissingTexture(this, key, 64, 64, color);
                    }
                });
            });
            
            console.log("Night scene preload started");
        } catch (error) {
            console.error("Error in NightScene preload:", error);
        }
    }
    
    create() {
        // Create background for night scene
        this.bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'shadow-bg'
        );
        
        // Set the background to fill the screen with dark tint for night feel
        this.bg.setDisplaySize(
            this.cameras.main.width,
            this.cameras.main.height
        );
        this.bg.setTint(0x1a0f33); // Deep purple/blue tint for night scene
        
        // Initialize shadow grid using our potion-crafting functions if available
        if (typeof window.initShadowGrid === 'function') {
            window.initShadowGrid();
        } else {
            // Fallback initialization for backward compatibility
            if (!window.shadowGrid || shadowGrid.cells.length === 0) {
                console.log("Initializing Shadow Grid cells (fallback method)");
                for (let i = 0; i < shadowGrid.size * shadowGrid.size; i++) {
                    shadowGrid.cells.push({
                        state: 'empty-night',
                        stage: 0,
                        maxStage: 3
                    });
                }
            }
        }
        
        // Add a darker overlay for better text readability
        this.overlay = this.add.rectangle(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 
            0.6
        );
        
        // Create a background panel for the entire screen
        const screenBg = this.add.graphics();
        screenBg.fillStyle(0x1a0833, 0.7);
        screenBg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add a title with glow effect
        const titleText = this.add.text(
            this.cameras.main.width / 2,
            120,
            "SHADOW MARKET GRID",
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '32px',
                color: '#cc33ff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        titleText.setOrigin(0.5);
        
        // Add pulsing animation to title
        this.tweens.add({
            targets: titleText,
            scale: { from: 1, to: 1.05 },
            alpha: { from: 0.9, to: 1 },
            duration: 1200,
            yoyo: true,
            repeat: -1
        });
        
        // Calculate grid dimensions for optimal display
        const totalWidth = 400;
        const totalHeight = 400;
        const gridX = this.cameras.main.width / 2 - totalWidth / 2;
        const gridY = 180;
        
        // Create a visible grid panel
        const gridPanel = this.add.graphics();
        gridPanel.fillStyle(0x220a33, 0.8);
        gridPanel.fillRoundedRect(gridX, gridY, totalWidth, totalHeight, 12);
        gridPanel.lineStyle(3, 0xaa33cc, 0.9);
        gridPanel.strokeRoundedRect(gridX, gridY, totalWidth, totalHeight, 12);
        
        // Add a subtle grid pattern
        const gridLines = this.add.graphics();
        gridLines.lineStyle(1, 0x6633aa, 0.5);
        
        // Draw horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = gridY + i * (totalHeight / 4);
            gridLines.beginPath();
            gridLines.moveTo(gridX, y);
            gridLines.lineTo(gridX + totalWidth, y);
            gridLines.closePath();
            gridLines.strokePath();
        }
        
        // Draw vertical grid lines
        for (let i = 0; i <= 4; i++) {
            const x = gridX + i * (totalWidth / 4);
            gridLines.beginPath();
            gridLines.moveTo(x, gridY);
            gridLines.lineTo(x, gridY + totalHeight);
            gridLines.closePath();
            gridLines.strokePath();
        }
        
        // Position grid cells within the panel
        this.gridConfig = {
            size: 4,
            cellSize: 80,
            padding: 15,
            startX: gridX + 50,
            startY: gridY + 50
        };
        
        // Initialize the grid cells
        this.initPhaserGrid();
        
        // Add a "Distill All" button with glow effect
        const distillBtn = this.add.text(
            this.cameras.main.width / 2,
            gridY + totalHeight + 40,
            "💧 DISTILL ALL POTIONS",
            {
                fontFamily: 'Share Tech Mono', 
                fontSize: '22px',
                color: '#ffffff',
                backgroundColor: '#6a2ca0',
                padding: { x: 15, y: 10 },
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        distillBtn.setOrigin(0.5);
        distillBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => distillAllShadowCells());
        
        // Add button glow effect
        this.tweens.add({
            targets: distillBtn,
            alpha: { from: 0.9, to: 1 },
            scale: { from: 0.98, to: 1.02 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Add instructions below button
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            gridY + totalHeight + 90,
            "Click on grid cells to brew potions (costs 20 $CATTLE)",
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        instructions.setOrigin(0.5);
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
        
        // Add shutdown handler
        this.events.on('shutdown', this.shutdown, this);
        
        // Initialize the Phaser grid
        this.initPhaserGrid();
        
        // Add method to update the potion grid visuals
        this.updatePotionGrid = function() {
            // Make sure we have cell sprites already created
            if (!this.cellSprites || this.cellSprites.length === 0) return;
            
            // Update each cell based on its state in the shadowGrid
            if (window.shadowGrid && window.shadowGrid.cells) {
                window.shadowGrid.cells.forEach((cell, index) => {
                    if (index < this.cellSprites.length) {
                        const sprite = this.cellSprites[index];
                        
                        // Update cell texture based on state
                        let textureKey = 'empty-night';
                        
                        if (cell.state === 'brewing') {
                            textureKey = 'brewing';
                            
                            // Add brewing animation if not already present
                            if (!this.bubblingTimers[index]) {
                                this.addBrewingAnimation(index);
                            }
                        } else if (cell.state === 'ready') {
                            textureKey = 'ready';
                            
                            // Add glow animation for ready potions
                            if (!this.glowTimers[index]) {
                                this.addGlowEffect(index);
                            }
                        } else {
                            // For empty cells, clear any animations
                            if (this.bubblingTimers[index]) {
                                clearInterval(this.bubblingTimers[index]);
                                this.bubblingTimers[index] = null;
                            }
                            if (this.glowTimers[index]) {
                                clearInterval(this.glowTimers[index]);
                                this.glowTimers[index] = null;
                            }
                        }
                        
                        // Update the cell's texture
                        if (sprite.texture.key !== textureKey) {
                            sprite.setTexture(textureKey);
                        }
                        
                        // If brewing, update the cell indicator with potion color
                        if (cell.state === 'brewing' || cell.state === 'ready') {
                            const indicator = this.cellIndicators[index];
                            if (indicator && cell.potion && window.potionTypes) {
                                const potionColor = window.potionTypes[cell.potion]?.color || 0xffffff;
                                indicator.setFillStyle(potionColor, 0.7);
                                indicator.setVisible(true);
                                
                                // If overbrewed, add a pulsing effect
                                if (cell.state === 'ready' && cell.overbrewed) {
                                    if (!indicator.overbrewTween) {
                                        indicator.overbrewTween = this.tweens.add({
                                            targets: indicator,
                                            alpha: { from: 0.7, to: 1 },
                                            duration: 500,
                                            yoyo: true,
                                            repeat: -1
                                        });
                                    }
                                }
                            }
                        } else {
                            // Hide indicator for empty cells
                            const indicator = this.cellIndicators[index];
                            if (indicator) {
                                indicator.setVisible(false);
                                if (indicator.overbrewTween) {
                                    indicator.overbrewTween.stop();
                                    indicator.overbrewTween = null;
                                }
                            }
                        }
                    }
                });
            }
        };
        
        // Initial update of the grid
        this.updatePotionGrid();
        
        console.log("NightScene created with potion crafting functionality");
    }
    
    // Add brewing animation to a cell
    addBrewingAnimation(cellIndex) {
        if (!this.cellSprites[cellIndex]) return;
        
        // Clear any existing animation
        if (this.bubblingTimers[cellIndex]) {
            clearInterval(this.bubblingTimers[cellIndex]);
        }
        
        const sprite = this.cellSprites[cellIndex];
        const indicator = this.cellIndicators[cellIndex];
        
        // Get cell position
        const x = sprite.x;
        const y = sprite.y;
        
        // Create bubble effect
        this.bubblingTimers[cellIndex] = setInterval(() => {
            try {
                // Don't add bubbles if scene is not active
                if (!this.scene.isActive()) {
                    clearInterval(this.bubblingTimers[cellIndex]);
                    this.bubblingTimers[cellIndex] = null;
                    return;
                }
                
                // Create bubble particle
                const size = Phaser.Math.Between(8, 16);
                const bubble = this.add.image(
                    x + Phaser.Math.Between(-20, 20),
                    y + Phaser.Math.Between(-20, 20),
                    'bubble'
                );
                
                bubble.setDisplaySize(size, size);
                bubble.setAlpha(0.7);
                
                // If we have cell data with potion type, use that color
                if (window.shadowGrid?.cells[cellIndex]?.potion && window.potionTypes) {
                    const potionType = window.shadowGrid.cells[cellIndex].potion;
                    const potionColor = window.potionTypes[potionType]?.color || 0xffffff;
                    bubble.setTint(potionColor);
                }
                
                // Animate bubble rising and fading
                this.tweens.add({
                    targets: bubble,
                    y: y - Phaser.Math.Between(30, 60),
                    alpha: 0,
                    scale: { from: 1, to: 0.5 },
                    duration: Phaser.Math.Between(800, 1500),
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        bubble.destroy();
                    }
                });
            } catch (err) {
                console.error('Error in brewing animation:', err);
            }
        }, Phaser.Math.Between(300, 700));
    }
    
    // Add glow effect to a ready potion
    addGlowEffect(cellIndex) {
        if (!this.cellSprites[cellIndex]) return;
        
        // Clear any existing glow effect
        if (this.glowTimers[cellIndex]) {
            clearInterval(this.glowTimers[cellIndex]);
        }
        
        const sprite = this.cellSprites[cellIndex];
        const x = sprite.x;
        const y = sprite.y;
        
        // Create initial glow
        const glow = this.add.image(x, y, 'glow');
        glow.setDisplaySize(100, 100);
        glow.setAlpha(0.5);
        
        // Set color based on potion type
        if (window.shadowGrid?.cells[cellIndex]?.potion && window.potionTypes) {
            const potionType = window.shadowGrid.cells[cellIndex].potion;
            const potionColor = window.potionTypes[potionType]?.color || 0xffffff;
            glow.setTint(potionColor);
        }
        
        // Pulsing animation
        this.tweens.add({
            targets: glow,
            scale: { from: 1, to: 1.2 },
            alpha: { from: 0.5, to: 0.8 },
            duration: 1200,
            yoyo: true,
            repeat: -1
        });
        // Store reference to glow image
        this.glowTimers[cellIndex] = setInterval(() => {
            try {
                // If the cell is no longer ready or scene is inactive, remove glow
                if (!this.scene.isActive() || 
                    !window.shadowGrid?.cells[cellIndex] || 
                    window.shadowGrid.cells[cellIndex].state !== 'ready') {
                    clearInterval(this.glowTimers[cellIndex]);
                    this.glowTimers[cellIndex] = null;
                    glow.destroy();
                }
            } catch (err) {
                console.error('Error in glow effect:', err);
            }
        }, 500);
    }
    
    // Clean up all animations when leaving the scene
    shutdown() {
        // Clear all brewing animations
        this.bubblingTimers.forEach(timer => {
            if (timer) clearInterval(timer);
        });
        this.bubblingTimers = [];
        
        // Clear all glow effects
        this.glowTimers.forEach(timer => {
            if (timer) clearInterval(timer);
        });
        this.glowTimers = [];
        
        // Call potion crafting cleanup if available
        if (typeof window.cleanupPotionProcesses === 'function') {
            window.cleanupPotionProcesses();
        }
    }
    
    initPhaserGrid() {
        // Store references to cell sprites
        this.cellSprites = [];
        this.cellIndicators = [];
        
        // Calculate grid dimensions based on screen size
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const { cellSize, padding, size } = this.gridConfig;
        
        // Calculate total grid dimensions
        const totalGridWidth = (cellSize + padding) * size;
        const totalGridHeight = (cellSize + padding) * size;
        
        // Position grid in center of screen
        this.gridConfig.startX = width / 2 - totalGridWidth / 2 + cellSize / 2;
        this.gridConfig.startY = height / 2 - totalGridHeight / 2 + cellSize / 2;
        
        // Create grid container
        this.gridContainer = this.add.container(0, 0);
        
        // Add grid header text
        const gridHeader = this.add.text(
            width / 2, 
            this.gridConfig.startY - 60,
            'Ether Range Grid', 
            {
                fontFamily: 'Anta',
                fontSize: '28px',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 4,
                shadow: { 
                    color: '#6a2ca0', 
                    fill: true, 
                    offsetX: 2, 
                    offsetY: 2, 
                    blur: 8 
                }
            }
        ).setOrigin(0.5);
        this.gridContainer.add(gridHeader);
        
        // Create all cells
        this.createGridCells();
        
        // Set the grid as interactive
        this.input.on('gameobjectdown', (pointer, gameObject) => {
            // Find index of clicked cell
            const index = this.cellSprites.indexOf(gameObject);
            if (index !== -1) {
                if (typeof window.interactWithShadowCell === 'function') {
                    // Use the modern potion crafting system
                    window.interactWithShadowCell(index);
                } else {
                    // Fallback to legacy handler
                    if (typeof handleShadowCellClick === 'function') {
                        handleShadowCellClick(index);
                    } else {
                        console.log(`Cell ${index} clicked, but no handler available`);
                    }
                }
            }
        });
        
        // Add "Distill All" button below grid
        const distillAllBtnX = width / 2;
        const distillAllBtnY = this.gridConfig.startY + totalGridHeight + 40;
        
        const distillAllBtn = this.add.text(
            distillAllBtnX, 
            distillAllBtnY, 
            '⚗️ Distill All', 
            {
                fontFamily: 'Anta',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#6a2ca0',
                padding: { x: 15, y: 8 },
                shadow: { 
                    color: '#000000', 
                    fill: true, 
                    offsetX: 2, 
                    offsetY: 2, 
                    blur: 4 
                }
            }
        ).setOrigin(0.5);
        
        distillAllBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Use new potion crafting system if available
                if (window.shadowGrid && window.shadowGrid.cells) {
                    let collectedCount = 0;
                    
                    // Collect all ready potions
                    window.shadowGrid.cells.forEach((cell, index) => {
                        if (cell.state === 'ready') {
                            if (typeof window.collectPotion === 'function') {
                                window.collectPotion(index);
                                collectedCount++;
                            }
                        }
                    });
                    
                    // Show notification based on results
                    if (collectedCount > 0) {
                        if (window.gameManager && window.gameManager.showNotification) {
                            window.gameManager.showNotification(`Collected ${collectedCount} potions!`, 'success');
                        }
                        
                        // Update the grid visuals
                        this.updatePotionGrid();
                    } else {
                        if (window.gameManager && window.gameManager.showNotification) {
                            window.gameManager.showNotification('No potions ready to collect', 'info');
                        }
                    }
                } else {
                    // Fallback to legacy function if available
                    if (typeof distillAllShadowCells === 'function') {
                        distillAllShadowCells();
                    } else {
                        console.log('No potion system available');
                    }
                }
            });
            
        this.gridContainer.add(distillAllBtn);
        
        // Mark night UI as using Phaser
        const nightUI = document.getElementById('night-screen');
        if (nightUI) nightUI.classList.add('phaser-active');
        
        // Hide the original HTML grid
        const htmlGrid = document.getElementById('shadow-grid');
        if (htmlGrid) {
            htmlGrid.style.visibility = 'hidden';
            htmlGrid.style.height = '0';
        }
    }
    
    createGridCells() {
        const { startX, startY, cellSize, padding, size } = this.gridConfig;
        
        // Initialize shadow grid cells
        initShadowCells();
        
        // Clear existing cell sprites if any
        if (this.cellSprites.length > 0) {
            this.cellSprites.forEach(sprite => sprite.destroy());
            this.cellSprites = [];
        }
        
        // Clear existing text indicators
        if (this.cellIndicators.length > 0) {
            this.cellIndicators.forEach(text => text.destroy());
            this.cellIndicators = [];
        }
        
        // Create cells based on shadowGrid data
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const index = row * size + col;
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Create cell using our new utility function
                const cellContainer = renderShadowCell(this, x, y, index);
                this.cellSprites[index] = cellContainer;
            }
        }
    }
    
    createCell(x, y, index) {
        const cell = shadowGrid.cells[index];
        const state = cell ? cell.state : 'empty-night';
        
        // Create simplified cell display using graphics instead of sprites
        // Create a container for this cell and all its elements
        const cellContainer = this.add.container(x, y);
        
        // Create background rectangle with border
        let fillColor, strokeColor;
        
        // Determine colors based on state
        switch(cell.state) {
            case 'brewing':
                fillColor = 0x442288;
                strokeColor = 0xbb44ff;
                break;
            case 'distilling':
                fillColor = 0x553399;
                strokeColor = 0xcc66ff;
                break;
            case 'ready':
                fillColor = 0x664488;
                strokeColor = 0xff88ff;
                break;
            default: // empty-night
                fillColor = 0x2a1155;
                strokeColor = 0x6622aa;
        }
        
        // Create the cell background
        const cellBg = this.add.graphics();
        cellBg.fillStyle(fillColor, 1);
        cellBg.fillRect(-this.gridConfig.cellSize/2, -this.gridConfig.cellSize/2, 
                       this.gridConfig.cellSize, this.gridConfig.cellSize);
        
        // Add glow effect for visibility
        const glow = this.add.graphics();
        glow.lineStyle(3, strokeColor, 0.8);
        glow.strokeRect(-this.gridConfig.cellSize/2, -this.gridConfig.cellSize/2, 
                       this.gridConfig.cellSize, this.gridConfig.cellSize);
        
        // Add text label based on state
        let stateText = "";
        switch(cell.state) {
            case 'brewing': stateText = "BREWING"; break;
            case 'distilling': stateText = "DISTILLING"; break;
            case 'ready': stateText = "READY!"; break;
            default: stateText = "EMPTY";
        }
        
        // Create state text with drop shadow
        const text = this.add.text(0, 0, stateText, {
            fontFamily: 'Share Tech Mono',
            fontSize: '14px',
            align: 'center',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        text.setOrigin(0.5);
        
        // Add a potion icon if not empty
        if (cell.state !== 'empty-night') {
            const potionIcon = this.add.text(0, -10, '🧪', { fontSize: '20px' });
            potionIcon.setOrigin(0.5);
            cellContainer.add(potionIcon);
            
            // Add growth stage indicator
            const indicator = this.add.text(
                0, 
                this.gridConfig.cellSize/2 - 15, 
                `${cell.stage || 0}/${cell.maxStage || 3}`,
                { 
                    fontFamily: 'Share Tech Mono', 
                    fontSize: '14px',
                    fill: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            );
            indicator.setOrigin(0.5);
            cellContainer.add(indicator);
            this.cellIndicators[index] = indicator;
        }
        
        // Add all elements to the container
        cellContainer.add(cellBg);
        cellContainer.add(glow);
        cellContainer.add(text);
        
        // Make container interactive
        cellContainer.setSize(this.gridConfig.cellSize, this.gridConfig.cellSize);
        cellContainer.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                handleShadowCellClick(index);
            });
        
        // Add entrance animation
        cellContainer.alpha = 0;
        cellContainer.scale = 0.7;
        
        this.tweens.add({
            targets: cellContainer,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut',
            delay: index * 50 // Staggered appearance
        });
        
        // Add flashing effect to ready cells
        if (cell.state === 'ready') {
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.4, to: 1 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Add bubbling effect to brewing cells
        if (cell.state === 'brewing') {
            this.tweens.add({
                targets: cellContainer,
                scaleX: { from: 0.98, to: 1.02 },
                scaleY: { from: 0.98, to: 1.02 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Store reference
        this.cellSprites[index] = cellContainer;
        
        // Add to scene
        this.gridContainer.add(cellContainer);
    }
    
    updateCellAppearance(cellIndex) {
        const cell = shadowGrid.cells[cellIndex];
        if (!cell) return;
        
        // Get the cell container
        const cellContainer = this.cellSprites[cellIndex];
        if (!cellContainer) return;
        
        // Use our utility function to update the cell appearance
        if (typeof updateShadowCell === 'function') {
            updateShadowCell(this, cellContainer, cellIndex);
        }
        
        // Clean up any existing timers
        if (this.glowTimers && this.glowTimers[cellIndex]) {
            this.glowTimers[cellIndex].remove();
            this.glowTimers[cellIndex] = null;
        }
    }
    
    updateAllCells() {
        if (this.updateCellAppearance) {
            shadowGrid.cells.forEach((cell, index) => {
                this.updateCellAppearance(index);
            });
        }
    }
    
    addBubblingAnimation(cellSprite, cellIndex) {
        // Bubbling animation (scale 0.9-1.1, 800ms repeat)
        this.bubblingTimers[cellIndex] = this.tweens.add({
            targets: cellSprite,
            scaleX: { from: 0.9, to: 1.1 },
            scaleY: { from: 0.9, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    addGlowAnimation(cellSprite, cellIndex) {
        // Glow animation (alpha 0.8-1, 1000ms repeat)
        this.glowTimers[cellIndex] = this.tweens.add({
            targets: cellSprite,
            alpha: { from: 0.8, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Also add a subtle scale pulse
        this.tweens.add({
            targets: cellSprite,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Resize and reposition background
        if (this.bg) {
            this.bg.setPosition(width/2, height/2);
            this.bg.setDisplaySize(width, height);
        }
        
        // Resize overlay
        if (this.overlay) {
            this.overlay.setPosition(width/2, height/2);
            this.overlay.width = width;
            this.overlay.height = height;
        }
        
        // Recenter the grid
        this.updateGridCellPositions();
    }
    
    updateGridCellPositions() {
        const { size, cellSize, padding } = this.gridConfig;
        
        // New center position
        this.gridConfig.startX = this.cameras.main.width / 2 - ((cellSize + padding) * size) / 2 + cellSize / 2;
        this.gridConfig.startY = this.cameras.main.height / 2 - ((cellSize + padding) * size) / 2 + cellSize / 2;
        
        // Update cell positions
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const index = row * size + col;
                const x = this.gridConfig.startX + col * (cellSize + padding);
                const y = this.gridConfig.startY + row * (cellSize + padding);
                
                // Update sprite position
                if (this.cellSprites[index]) {
                    this.cellSprites[index].setPosition(x, y);
                }
                
                // Update indicator position
                if (this.cellIndicators[index]) {
                    this.cellIndicators[index].setPosition(
                        x, 
                        y + (cellSize / 2) - 15
                    );
                }
            }
        }
    }
}

// Initialize Phaser game with scene management
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scene: [MainMenuScene, RanchScene, SaloonScene],
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
        console.log("Start Game button clicked");
        
        // Get player name
        const playerNameInput = document.getElementById('player-name');
        playerData.name = playerNameInput ? (playerNameInput.value || 'Cowboy') : 'Cowboy';
        
        // Connect to server using the available socket connection
        try {
            // Try the Socket.IO connection from this file first
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('new-player', {
                    name: playerData.name,
                    archetype: playerData.archetype
                });
                console.log("Using direct socket variable");
            } 
            // Try window.io as fallback
            else if (window.io && typeof io !== 'undefined') {
                // Use existing socketIO connection from game-init.js if available
                if (window.gameState && window.gameState.socketIO) {
                    window.gameState.socketIO.emit('new-player', {
                        name: playerData.name,
                        archetype: playerData.archetype
                    });
                    console.log("Using existing Socket.IO connection");
                } else {
                    // Create a new Socket.IO connection if needed
                    const socketIO = io();
                    socketIO.emit('new-player', {
                        name: playerData.name,
                        archetype: playerData.archetype
                    });
                    console.log("Created new Socket.IO connection");
                    
                    // Store for future use
                    if (window.gameState) {
                        window.gameState.socketIO = socketIO;
                    }
                }
            }
        } catch (err) {
            console.error("Error with socket connection:", err);
        }
        
        // Switch to ranch scene regardless of socket status
        switchScene('ranch');
    });
    
    // RANCH UI EVENTS
    addClickListener('breed-cattle', () => {
        // Check if player has enough resources
        if (playerData.hay >= 10 && playerData.water >= 10) {
            // Decrease resources
            playerData.hay -= 10;
            playerData.water -= 10;
            
            // Show breeding animation immediately before server response
            if (game && game.scene) {
                const ranchScene = game.scene.getScene('RanchScene');
                if (ranchScene) {
                    // Create a temporary cattle object
                    const tempCattle = {
                        id: 'temp-' + Date.now(),
                        speed: Math.floor(Math.random() * 5) + 1,
                        milk: Math.floor(Math.random() * 5) + 1
                    };
                    
                    // Add a visual cattle sprite immediately
                    const cattleSprite = ranchScene.addCattleSprite(tempCattle);
                    
                    // Add a breeding effect
                    ranchScene.tweens.add({
                        targets: cattleSprite,
                        scale: { from: 0, to: 0.2 },
                        alpha: { from: 0, to: 1 },
                        duration: 800,
                        ease: 'Back.easeOut'
                    });
                    
                    // Create a better, more reliable animation with multiple particles
                    // Add a sparkle effect around the new cattle
                    for (let i = 0; i < 10; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * 30;
                        const x = cattleSprite.x + Math.cos(angle) * distance;
                        const y = cattleSprite.y + Math.sin(angle) * distance;
                        
                        // Create sparkle particle
                        const sparkle = ranchScene.add.image(x, y, 'hay-icon');
                        sparkle.setScale(0.1);
                        sparkle.setTint(0xFFFF00); // Yellow tint
                        
                        // Animate the sparkle
                        ranchScene.tweens.add({
                            targets: sparkle,
                            scale: { from: 0.1, to: 0.2 },
                            alpha: { from: 1, to: 0 },
                            x: x + Math.cos(angle) * 20,
                            y: y + Math.sin(angle) * 20,
                            duration: 800,
                            ease: 'Sine.easeOut',
                            onComplete: () => sparkle.destroy()
                        });
                    }
                    
                    // Also add a cattle icon in the "Your Cattle" section
                    const cattleInventory = document.getElementById('cattle-inventory');
                    if (cattleInventory) {
                        // Create a temporary element
                        const tempCattleEl = document.createElement('div');
                        tempCattleEl.className = 'cattle-card';
                        tempCattleEl.innerHTML = `
                            <img src="img/cattle.png" alt="Cattle">
                            <div class="cattle-stats">
                                <div>Speed: ${tempCattle.speed}</div>
                                <div>Milk: ${tempCattle.milk}</div>
                            </div>
                        `;
                        
                        // Add animation class
                        tempCattleEl.classList.add('cattle-appear');
                        
                        // Add to inventory
                        cattleInventory.appendChild(tempCattleEl);
                        
                        // Remove "no cattle" message if it exists
                        const emptyMessage = cattleInventory.querySelector('.empty-message');
                        if (emptyMessage) {
                            emptyMessage.remove();
                        }
                    }
                }
            }
            
            // Send actual breeding request to server
            socket.emit('breed-cattle');
            
            // Update UI to reflect resource changes
            updateRanchResourceDisplay();
            
            // Show immediate feedback to user
            showNotification('Breeding cattle... -10 Hay, -10 Water', 'info');
        } else {
            // Not enough resources
            showNotification('Not enough resources! Breeding requires 10 Hay and 10 Water.', 'error');
        }
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
    
    // Reset progress display
    if (data.progress) {
        try {
            // Update using racing game module if available
            if (window.racingGame && typeof window.racingGame.updateProgress === 'function') {
                window.racingGame.updateProgress(data.progress);
            } else {
                // Direct DOM manipulation
                for (const suit in data.progress) {
                    const progressBar = document.getElementById(`${suit}-progress`);
                    if (progressBar) {
                        progressBar.style.width = `${data.progress[suit]}%`;
                    }
                }
            }
            
            // Update in Phaser scene if available
            if (window.game && window.game.scene) {
                const saloonScene = window.game.scene.getScene('SaloonScene');
                if (saloonScene && typeof saloonScene.updateRaceProgress === 'function') {
                    saloonScene.updateRaceProgress(data.progress);
                }
            }
        } catch (error) {
            console.error("Error updating race progress:", error);
        }
    }
    
    // Clear drawn card
    const drawnCardContainer = document.getElementById('drawn-card');
    if (drawnCardContainer) {
        drawnCardContainer.innerHTML = '<div class="card-placeholder">Race is starting! Draw a card</div>';
    }
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`Race started! 10% (${(data.burnAmount || 0).toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`, 'info');
    }
    
    // Update UI
    if (typeof updateUI === 'function') {
        updateUI();
    }
});

socket.on('card-drawn', data => {
    console.log('Card drawn event received:', data);
    
    // Get the card and progress data
    const card = data.card;
    const progress = data.progress;
    
    // Use the dedicated racing game module if it exists
    if (window.racingGame && typeof window.racingGame.updateCardDisplay === 'function') {
        window.racingGame.updateCardDisplay(card);
    } else {
        // Fallback to direct DOM manipulation
        const drawnCardContainer = document.getElementById('drawn-card');
        if (drawnCardContainer) {
            drawnCardContainer.innerHTML = '';
            
            const cardElement = createCardElement(card);
            drawnCardContainer.appendChild(cardElement);
            console.log('Card displayed:', card);
        } else {
            console.error('Drawn card container not found');
        }
    }
    
    // Update progress either through racing game or directly
    if (window.racingGame && typeof window.racingGame.updateProgress === 'function') {
        window.racingGame.updateProgress(progress);
    } else {
        // Fallback to direct DOM manipulation
        for (const suit in progress) {
            const progressBar = document.getElementById(`${suit}-progress`);
            if (progressBar) {
                progressBar.style.width = `${progress[suit]}%`;
                console.log(`${suit} progress updated to ${progress[suit]}%`);
            } else {
                console.error(`Progress bar for ${suit} not found`);
            }
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
    
    // Update in Phaser scene if available
    try {
        if (window.game && window.game.scene) {
            const saloonScene = window.game.scene.getScene('SaloonScene');
            if (saloonScene && typeof saloonScene.updateCardDisplay === 'function') {
                saloonScene.updateCardDisplay(card);
            }
            if (saloonScene && typeof saloonScene.updateRaceProgress === 'function') {
                saloonScene.updateRaceProgress(progress);
            }
        }
    } catch (error) {
        console.error("Error updating Phaser scene:", error);
    }
});

// Process race win, handle XP and achievements
function processRaceWin(winnings) {
    // Only process if player actually won
    if (winnings <= 0) return;
    
    // Use the new tracking function if available
    if (typeof trackRaceWin === 'function') {
        trackRaceWin();
    } else {
        // Fallback to direct XP addition and stat tracking
        if (typeof addPlayerXP === 'function') {
            addPlayerXP(30);
        }
        
        // Update player stats
        if (playerData.stats) {
            playerData.stats.racesWon = (playerData.stats.racesWon || 0) + 1;
        }
        
        // Check achievements if the function exists
        if (typeof checkAchievements === 'function') {
            checkAchievements();
        }
    }
    
    // Play win sound if available
    if (window.SoundEffects && SoundEffects.play) {
        SoundEffects.play('win');
    } else if (typeof playSoundEffect === 'function') {
        // Fallback to original sound function
        playSoundEffect('win');
    }
}

socket.on('race-finished', data => {
    console.log('Race finished event received:', data);
    
    // Update player data if present
    if (data.player) {
        playerData = data.player;
    }
    
    // Process race win if player won
    if (data.winnings > 0) {
        processRaceWin(data.winnings);
    }
    
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
    
    // Add to history - try racing game module first, then fallback to direct DOM manipulation
    try {
        if (window.racingGame && typeof window.racingGame.addToHistory === 'function') {
            window.racingGame.addToHistory(data.winner, data.bet > 0);
            console.log('Added race result to history using racing game module');
        } else {
            const historyContainer = document.getElementById('results-history');
            if (historyContainer) {
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${data.winner} ${data.bet > 0 ? 'win' : 'loss'}`;
                historyItem.textContent = data.winner.charAt(0).toUpperCase();
                historyContainer.appendChild(historyItem);
                
                // Limit history to 10 items
                const historyItems = historyContainer.querySelectorAll('.history-item');
                if (historyItems.length > 10) {
                    historyContainer.removeChild(historyItems[0]);
                }
                
                console.log('Added history item for race result:', data.winner);
            } else {
                console.error('History container not found');
            }
        }
    } catch (error) {
        console.error("Error adding race to history:", error);
    }
    
    // Update the scene status if using Phaser
    try {
        if (window.game && window.game.scene) {
            const saloonScene = window.game.scene.getScene('SaloonScene');
            if (saloonScene) {
                // Update race status in the scene
                if (saloonScene.raceData) {
                    saloonScene.raceData.status = 'finished';
                    saloonScene.raceData.winner = data.winner;
                }
            }
        }
    } catch (error) {
        console.error("Error updating Phaser scene race status:", error);
    }
    
    // Celebration effect for winners
    if (data.bet > 0 && data.winnings > 0) {
        console.log('Player won! Showing celebration for winning bet:', data.bet);
        
        // Create confetti animation
        try {
            if (typeof createConfetti === 'function') {
                createConfetti();
            }
        } catch (err) {
            console.error('Error creating confetti:', err);
        }
        
        // Show celebration overlay
        const celebration = document.getElementById('win-celebration');
        const winAmount = document.getElementById('win-amount');
        if (celebration && winAmount) {
            winAmount.textContent = `+${(data.winnings || data.bet).toFixed(2)} $CATTLE`;
            celebration.classList.remove('hidden');
            
            // Hide celebration after 3.5 seconds
            setTimeout(() => {
                celebration.classList.add('hidden');
            }, 3500);
        } else {
            console.error('Celebration elements not found');
        }
        
        // Display result with auto-close
        if (typeof showResult === 'function') {
            showResult('Winner!', `${data.message || 'You won the race!'}`, 'success', true);
        }
    } else {
        console.log('Player did not win. Showing regular result message');
        // Display result with auto-close
        if (typeof showResult === 'function') {
            showResult('Race Finished', `${data.message || 'The race has finished.'}`, 'info', true);
        }
    }
    
    // Update UI
    if (typeof updateUI === 'function') {
        updateUI();
    }
    
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
    console.log(`Switching to scene: ${scene}`);
    
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
        try {
            console.log(`Stopping all scenes except ${scene}`);
            
            // Stop all running scenes
            if (scene !== 'main-menu') game.scene.stop('MainMenuScene');
            if (scene !== 'ranch') game.scene.stop('RanchScene');
            if (scene !== 'saloon') game.scene.stop('SaloonScene');
            if (scene !== 'night') game.scene.stop('NightScene');
            
            // Start the new scene
            const targetScene = phaser_scenes[scene];
            if (!game.scene.isActive(targetScene)) {
                console.log(`Starting Phaser scene: ${targetScene}`);
                game.scene.start(targetScene);
            } else {
                console.log(`Scene ${targetScene} is already active`);
                // Resume if it was paused
                if (game.scene.isPaused(targetScene)) {
                    console.log(`Resuming paused scene: ${targetScene}`);
                    game.scene.resume(targetScene);
                }
            }
        } catch (error) {
            console.error(`Error switching to Phaser scene ${phaser_scenes[scene]}:`, error);
        }
    } else {
        console.log(`No Phaser scene to start for ${scene} or game instance not available`);
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
    
    // Initialize racing game functionality if available
    if (window.racingGame && typeof window.racingGame.init === 'function') {
        console.log("Initializing racing game from specialized module");
        window.racingGame.init();
    }
    
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
    
    // Check if cattle is defined and has forEach method (it should be an array)
    if (!playerData.cattle || !Array.isArray(playerData.cattle) || playerData.cattle.length === 0) {
        cattleInventory.innerHTML = '<div class="empty-message">No cattle yet. Start breeding!</div>';
        return;
    }
    
    // Add all cattle
    playerData.cattle.forEach(cattle => {
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
                <div class="milk-production">
                    <span class="production-rate">Produces ${cattle.milk * 2} $CATTLE every 30s</span>
                </div>
            </div>
            <div class="cattle-actions">
                <button class="sell-cattle-btn" data-cattle-id="${cattle.id}">
                    Sell for ${cattle.speed * 10} $CATTLE
                </button>
            </div>
        `;
        cattleInventory.appendChild(cattleElement);
        
        // Add event listener for sell button
        const sellBtn = cattleElement.querySelector('.sell-cattle-btn');
        sellBtn.addEventListener('click', () => sellCattle(cattle.id));
    });
}

// Function to sell a cattle
function sellCattle(cattleId) {
    // Find the cattle in the player's collection
    const cattleIndex = playerData.cattle.findIndex(c => c.id === cattleId);
    
    if (cattleIndex === -1) {
        showNotification('Cattle not found!', 'error');
        return;
    }
    
    const cattle = playerData.cattle[cattleIndex];
    const sellPrice = cattle.speed * 10;
    
    // Remove from player's collection
    playerData.cattle.splice(cattleIndex, 1);
    
    // Add money to player's balance
    playerData.cattleBalance += sellPrice;
    
    // Show notification
    showNotification(`Sold cattle for ${sellPrice} $CATTLE!`, 'success');
    
    // Remove sprite from scene if the RanchScene is active
    if (game && game.scene) {
        const ranchScene = game.scene.getScene('RanchScene');
        if (ranchScene) {
            // Find and remove the cattle sprite
            const cattleSprite = ranchScene.cattle.find(sprite => 
                sprite.getData('cattle') && sprite.getData('cattle').id === cattleId
            );
            
            if (cattleSprite) {
                // Add selling animation
                ranchScene.tweens.add({
                    targets: cattleSprite,
                    alpha: 0,
                    y: '-=50',
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        // Remove from ranchScene.cattle array
                        const spriteIndex = ranchScene.cattle.indexOf(cattleSprite);
                        if (spriteIndex !== -1) {
                            ranchScene.cattle.splice(spriteIndex, 1);
                        }
                        
                        // Remove milk timer for this cattle
                        const timerIndex = ranchScene.cattleMilkTimers.findIndex(t => t.cattleId === cattleId);
                        if (timerIndex !== -1) {
                            ranchScene.cattleMilkTimers.splice(timerIndex, 1);
                        }
                        
                        // Destroy the sprite
                        cattleSprite.destroy();
                        
                        // Create money animation
                        const moneyText = ranchScene.add.text(cattleSprite.x, cattleSprite.y, `+${sellPrice}`, {
                            fontFamily: 'Anta',
                            fontSize: '24px',
                            color: '#00ff00',
                            stroke: '#000000',
                            strokeThickness: 4
                        }).setOrigin(0.5);
                        
                        ranchScene.tweens.add({
                            targets: moneyText,
                            y: '-=100',
                            alpha: { from: 1, to: 0 },
                            duration: 1500,
                            ease: 'Power2',
                            onComplete: () => {
                                moneyText.destroy();
                            }
                        });
                    }
                });
            }
        }
    }
    
    // Update UI
    updateCattleInventory();
    updateUI();
}

function updatePotionInventory() {
    const potionInventory = document.getElementById('potion-inventory');
    if (!potionInventory) return; // Skip if element doesn't exist
    
    // Clear inventory
    potionInventory.innerHTML = '';
    
    // Check if potion collection exists and is not empty
    if (!playerData.potionCollection || playerData.potionCollection.length === 0) {
        potionInventory.innerHTML = '<div class="empty-message">No potions yet. Start crafting!</div>';
        return;
    }
    
    // Add all potions
    playerData.potionCollection.forEach(potion => {
        // Create potion element with cyberpunk styling
        const potionElement = document.createElement('div');
        potionElement.className = 'inventory-item potion';
        
        // Calculate value based on potion properties and market conditions
        const baseValue = potion.value || (25 + potion.potency * 1);
        const marketMultiplier = shadowGrid.multiplier || 1.0;
        const currentValue = Math.floor(baseValue * marketMultiplier);
        
        // Format unique ID for display
        const shortId = typeof potion.id === 'number' 
            ? potion.id.toString().slice(-4) 
            : (potion.id.split('-').pop() || '').substr(0, 4);
        
        // Get creation date
        const creationDate = potion.created ? new Date(potion.created).toLocaleDateString() : 'Unknown';
        
        // Create HTML with glow effects for higher potency potions
        const glowClass = potion.potency > 7 ? 'high-potency' : 
                         potion.potency > 4 ? 'medium-potency' : '';
        
        potionElement.innerHTML = `
            <div class="title ${glowClass}">
                <span class="icon">⚗️</span>
                <span>Shadow Elixir #${shortId}</span>
            </div>
            <div class="stats">
                <div class="potency-meter">
                    <span>Potency: ${potion.potency}/10</span>
                    <div class="meter-bar">
                        <div class="meter-fill" style="width: ${potion.potency * 10}%"></div>
                    </div>
                </div>
                <div class="market-value">
                    <span>Market Value: ${currentValue} $CATTLE</span>
                    <span class="multiplier">(${marketMultiplier.toFixed(1)}x Market Multiplier)</span>
                </div>
                <div class="created">Crafted: ${creationDate}</div>
            </div>
            <button class="sell-button">
                <span class="icon">💰</span>
                <span>Sell for ${currentValue} $CATTLE</span>
            </button>
        `;
        
        // Add sell event listener
        const sellButton = potionElement.querySelector('.sell-button');
        sellButton.addEventListener('click', () => {
            // Add to player's cattle balance
            playerData.cattleBalance += currentValue;
            
            // Record sale in stats
            playerData.stats.potionsSold = (playerData.stats.potionsSold || 0) + 1;
            playerData.stats.potionEarnings = (playerData.stats.potionEarnings || 0) + currentValue;
            
            // Remove from collection
            playerData.potionCollection = playerData.potionCollection.filter(p => p.id !== potion.id);
            
            // Update UI
            updatePotionInventory();
            updateUI();
            
            // Show notification
            showNotification(`Sold potion for ${currentValue} $CATTLE!`, 'success');
            
            // Show celebration if it's a high value potion
            if (currentValue > 30) {
                showWinCelebration(currentValue);
            }
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
    // Get the grid container (for showing it's hidden when using Phaser)
    const gridContainer = document.getElementById('shadow-grid');
    if (!gridContainer) {
        console.error('Shadow grid container not found');
        return;
    }
    
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
    
    // Set up potion crafting button
    const craftPotionButton = document.getElementById('craft-potion');
    if (craftPotionButton) {
        // Remove any existing event listeners
        const newButton = craftPotionButton.cloneNode(true);
        craftPotionButton.parentNode.replaceChild(newButton, craftPotionButton);
        
        // Add new event listener to craft potions
        newButton.addEventListener('click', () => {
            // Check if player has enough $CATTLE
            if (playerData.cattleBalance >= 20) {
                // Deduct 20 $CATTLE (50% burned)
                playerData.cattleBalance -= 20;
                playerData.stats.cattleBurned = (playerData.stats.cattleBurned || 0) + 10; // 50% burn
                
                // Generate random potency between 1-10
                const potency = Math.floor(Math.random() * 10) + 1;
                
                // Add potion to collection
                if (!playerData.potionCollection) {
                    playerData.potionCollection = [];
                }
                
                const potionId = Date.now();
                playerData.potionCollection.push({
                    id: potionId,
                    potency: potency,
                    created: Date.now()
                });
                
                // Update UI
                updatePotionInventory();
                updateUI();
                
                // Show notification
                showNotification(`Crafted a potion with potency ${potency}! 50% (10 $CATTLE) burned.`, 'success');
            } else {
                showNotification('Not enough $CATTLE! Need 20 $CATTLE to craft a potion.', 'error');
            }
        });
    }
    
    // Update resources and button states
    updateShadowResourceDisplay();
    updateButtonStates();
    
    // Start the Phaser scene for the night market grid
    if (game && game.scene) {
        // Stop other scenes first
        game.scene.stop('RanchScene');
        game.scene.stop('SaloonScene');
        
        // Check if the scene is already running
        const nightScene = game.scene.getScene('NightScene');
        if (nightScene && game.scene.isActive('NightScene')) {
            // Update the cells if it's already running
            nightScene.updateAllCells();
        } else {
            // Start the scene if it's not running
            game.scene.start('NightScene');
        }
    }
    
    // Log initialization
    console.log("Shadow Market Grid initialized with Phaser implementation");
}

// Handle clicking on a ranch grid cell
function handleRanchCellClick(cellIndex) {
    const cell = ranchGrid.cells[cellIndex];
    
    switch (cell.state) {
        case 'empty':
            // Plant a new crop
            if (playerData.hay >= 10) {
                playerData.hay -= 10;
                // IMPORTANT: Changed growth stage to show crops immediately by setting to growing (skip "planted" state)
                cell.state = 'growing';  // Changed from 'planted' to 'growing' for immediate visibility
                cell.growthStage = 1;   // Set to 1 not 0 to ensure visibility
                
                // IMMEDIATE VISUAL FEEDBACK: Update the Phaser cell appearance with high priority
                if (game && game.scene) {
                    const ranchScene = game.scene.getScene('RanchScene');
                    if (ranchScene) {
                        // Force immediate visual update with animation
                        ranchScene.updateCellAppearance(cellIndex);
                        
                        // Add extra emphasis/scale animation to draw attention to planted crop
                        const cellObj = ranchScene.gridCells[cellIndex];
                        if (cellObj && cellObj.sprite) {
                            ranchScene.tweens.add({
                                targets: cellObj.sprite,
                                scale: { from: 0.7, to: 1.1 },
                                duration: 500,
                                yoyo: true,
                                ease: 'Back.easeOut',
                                onComplete: () => {
                                    cellObj.sprite.setScale(1);
                                }
                            });
                        }
                        
                        // Add a planting animation effect
                        const { startX, startY, cellSize, padding, size } = ranchScene.gridConfig;
                        const row = Math.floor(cellIndex / size);
                        const col = cellIndex % size;
                        const x = startX + col * (cellSize + padding);
                        const y = startY + row * (cellSize + padding);
                        
                        // Add particle effect for planting
                        try {
                            // Create a dirt animation effect
                        // Add central dirt puff
                        const dirtPuff = ranchScene.add.image(x, y, 'hay-icon');
                        dirtPuff.setScale(0.4);
                        dirtPuff.setTint(0x8B4513); // Brown tint for dirt
                        
                        // Create dirt animation
                        ranchScene.tweens.add({
                            targets: dirtPuff,
                            alpha: { from: 1, to: 0 },
                            scale: { from: 0.4, to: 0.8 },
                            duration: 600,
                            ease: 'Power2',
                            onComplete: () => dirtPuff.destroy()
                        });
                        
                        // Add multiple dirt particles
                        for (let i = 0; i < 8; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const distance = Math.random() * 20 + 10;
                            const particleX = x + Math.cos(angle) * distance;
                            const particleY = y + Math.sin(angle) * distance;
                            
                            const particle = ranchScene.add.image(particleX, particleY, 'hay-icon');
                            particle.setScale(0.2);
                            particle.setTint(0x8B4513); // Brown tint for dirt
                            
                            ranchScene.tweens.add({
                                targets: particle,
                                x: particleX + Math.cos(angle) * 20,
                                y: particleY + Math.sin(angle) * 20,
                                alpha: 0,
                                scale: 0,
                                duration: 800,
                                ease: 'Power2',
                                onComplete: () => particle.destroy()
                            });
                        }
                        } catch (err) {
                            console.error('Particle effect error:', err);
                        }
                    }
                }
                
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
    
    // Get the NightScene if available
    let nightScene = null;
    if (game && game.scene) {
        nightScene = game.scene.getScene('NightScene');
    }
    
    switch (cell.state) {
        case 'empty':
            // Start brewing a potion
            if (playerData.water >= 15) {
                playerData.water -= 15;
                cell.state = 'brewing';
                cell.stage = 0;
                
                // Update Phaser UI via the scene
                if (nightScene) {
                    nightScene.updateCellAppearance(cellIndex);
                    
                    // Add particle effect for starting a brew
                    const { startX, startY, cellSize, padding, size } = nightScene.gridConfig;
                    const row = Math.floor(cellIndex / size);
                    const col = cellIndex % size;
                    const x = startX + col * (cellSize + padding);
                    const y = startY + row * (cellSize + padding);
                    
                    // Create a sparkle effect for brewing start
                    const particles = nightScene.add.particles(x, y, 'bubble', {
                        scale: { start: 0.1, end: 0.5 },
                        speed: { min: 30, max: 80 },
                        quantity: 10,
                        lifespan: 800,
                        alpha: { start: 0.8, end: 0 },
                        blendMode: 'ADD'
                    });
                    
                    // Auto-destroy particles after animation
                    nightScene.time.delayedCall(1000, () => {
                        particles.destroy();
                    });
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
    
    if (cell.state !== 'harvestable') return;
    
    // Calculate harvest rewards
    const hayReward = Math.floor(15 + Math.random() * 10) * ranchGrid.multiplier;
    const waterReward = Math.floor(5 + Math.random() * 10) * ranchGrid.multiplier;
    
    // Add resources to player
    playerData.hay += hayReward;
    playerData.water += waterReward;
    playerData.stats.plantsHarvested = (playerData.stats.plantsHarvested || 0) + 1;
    
    // Track harvest for progression using new system if available
    if (typeof trackCropHarvest === 'function') {
        trackCropHarvest();
    } else {
        // Fallback to original implementation
        if (typeof addPlayerXP === 'function') {
            // Add XP for harvesting (10 XP per crop harvested)
            addPlayerXP(10);
        }
        
        // Update achievement progress
        if (playerData.achievements && playerData.achievements.farmer) {
            playerData.achievements.farmer.current = playerData.stats.plantsHarvested;
        }
        
        // Check if any achievements were unlocked
        if (typeof checkAchievements === 'function') {
            checkAchievements();
        }
    }
    
    // Play harvest sound effect
    if (window.SoundEffects && SoundEffects.play) {
        SoundEffects.play('harvest');
    } else if (typeof playSoundEffect === 'function') {
        playSoundEffect('harvest');
    }
    
    // Reset cell
    cell.state = 'empty';
    cell.growthStage = 0;
    
    // Update the Phaser cell appearance with animation
    if (game && game.scene) {
        const ranchScene = game.scene.getScene('RanchScene');
        if (ranchScene) {
            // Update cell appearance in Phaser
            ranchScene.updateCellAppearance(cellIndex);
            
            // Create harvest animation
            const { startX, startY, cellSize, padding, size } = ranchScene.gridConfig;
            const row = Math.floor(cellIndex / size);
            const col = cellIndex % size;
            const x = startX + col * (cellSize + padding);
            const y = startY + row * (cellSize + padding);
            
            // Create hay icon animation
            const hayIcon = ranchScene.add.image(x, y, 'hay-icon');
            hayIcon.setScale(0.4);
            ranchScene.ranchContainer.add(hayIcon);
            
            // Create water icon animation
            const waterIcon = ranchScene.add.image(x + 20, y, 'water-drop');
            waterIcon.setScale(0.4);
            ranchScene.ranchContainer.add(waterIcon);
            
            // Create reward text
            const hayText = ranchScene.add.text(x, y - 15, `+${hayReward.toFixed(0)}`, {
                fontFamily: 'Anta',
                fontSize: '16px',
                color: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            const waterText = ranchScene.add.text(x + 20, y - 15, `+${waterReward.toFixed(0)}`, {
                fontFamily: 'Anta',
                fontSize: '16px',
                color: '#00ccff',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            ranchScene.ranchContainer.add(hayText);
            ranchScene.ranchContainer.add(waterText);
            
            // Animate the rewards floating up and fading
            ranchScene.tweens.add({
                targets: [hayIcon, hayText, waterIcon, waterText],
                y: '-=50',
                alpha: { from: 1, to: 0 },
                duration: 1500,
                ease: 'Power2',
                onComplete: () => {
                    hayIcon.destroy();
                    hayText.destroy();
                    waterIcon.destroy();
                    waterText.destroy();
                }
            });
        }
    }
    
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
    
    // Get the NightScene if available
    let nightScene = null;
    if (game && game.scene) {
        nightScene = game.scene.getScene('NightScene');
    }
    
    // Calculate distill rewards based on supply/demand
    let rewardMultiplier = 1.0;
    
    // If demand is higher than supply, increase reward
    if (cell.demand > cell.supply) {
        rewardMultiplier = 1.0 + ((cell.demand - cell.supply) / 10);
    }
    
    // Apply market multiplier
    rewardMultiplier *= shadowGrid.multiplier;
    
    // Calculate final rewards based on market conditions
    const baseReward = 25 + Math.floor(Math.random() * 10); // 25-35 base value
    const cattleReward = Math.floor(baseReward * rewardMultiplier);
    const etherReward = Math.floor((10 + Math.random() * 15) * rewardMultiplier);
    
    // Add resources to player
    playerData.ether = (playerData.ether || 0) + etherReward;
    playerData.cattleBalance += cattleReward;
    playerData.stats.potionsDistilled = (playerData.stats.potionsDistilled || 0) + 1;
    
    // Track potion distilling for progression using new system if available
    if (typeof trackPotionDistill === 'function') {
        trackPotionDistill();
    } else {
        // Fallback to original implementation
        if (typeof addPlayerXP === 'function') {
            // Add XP for distilling (20 XP per potion distilled)
            addPlayerXP(20);
        }
        
        // Update achievement progress
        if (playerData.achievements && playerData.achievements.alchemist) {
            playerData.achievements.alchemist.current = playerData.stats.potionsDistilled;
        }
        
        // Check if any achievements were unlocked
        if (typeof checkAchievements === 'function') {
            checkAchievements();
        }
    }
    
    // Play distill sound effect
    if (window.SoundEffects && SoundEffects.play) {
        SoundEffects.play('distill');
    } else if (typeof playSoundEffect === 'function') {
        playSoundEffect('distill');
    }
    
    // Create a distilled potion in the inventory with potency
    if (!playerData.potionCollection) {
        playerData.potionCollection = [];
    }
    
    // Add to potion inventory with value based on market conditions
    const potionId = Date.now();
    const potency = Math.floor(Math.random() * 10) + 1; // 1-10 potency
    
    playerData.potionCollection.push({
        id: potionId,
        potency: potency,
        value: cattleReward,
        created: Date.now()
    });
    
    // Reset cell
    cell.state = 'empty';
    cell.stage = 0;
    
    // Update Phaser UI
    if (nightScene) {
        nightScene.updateCellAppearance(cellIndex);
        
        // Add particle effect for distillation
        const { startX, startY, cellSize, padding, size } = nightScene.gridConfig;
        const row = Math.floor(cellIndex / size);
        const col = cellIndex % size;
        const x = startX + col * (cellSize + padding);
        const y = startY + row * (cellSize + padding);
        
        // Create a sparkle/explosion effect for distillation
        const particles = nightScene.add.particles(x, y, 'glow', {
            scale: { start: 0.8, end: 0.1 },
            speed: { min: 50, max: 200 },
            quantity: 20,
            lifespan: 1000,
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            angle: { min: 0, max: 360 }
        });
        
        // Add floating text for rewards
        const rewardText = nightScene.add.text(
            x, 
            y - 30, 
            `+${cattleReward} $CATTLE`, 
            { 
                font: 'bold 16px Arial',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        rewardText.setOrigin(0.5);
        
        // Animate the text floating up and fading
        nightScene.tweens.add({
            targets: rewardText,
            y: y - 80,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                rewardText.destroy();
            }
        });
        
        // Auto-destroy particles after animation completes
        nightScene.time.delayedCall(1500, () => {
            particles.destroy();
        });
    }
    
    // Play distillation sound
    if (typeof playSoundEffect === 'function') {
        playSoundEffect('bubbling');
    }
    
    // Show notification
    showNotification(`Distilled potion! +${etherReward.toFixed(0)} Ether, +${cattleReward.toFixed(0)} $CATTLE`, 'success');
    
    // Update UI
    updatePotionInventory();
    updateShadowResourceDisplay();
    updateUI();
    
    // Show win celebration for bigger rewards
    if (cattleReward > 20) {
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
    
    // Get the NightScene if available
    let nightScene = null;
    if (game && game.scene) {
        nightScene = game.scene.getScene('NightScene');
    }
    
    // Get all ready cells first (because distilling modifies the array)
    const readyCells = [];
    shadowGrid.cells.forEach((cell, index) => {
        if (cell.state === 'ready') {
            readyCells.push(index);
        }
    });
    
    // Add a small delay between each distillation for visual effect
    readyCells.forEach((cellIndex, i) => {
        // Add a slight delay between each distillation (150ms) for better visualization
        setTimeout(() => {
            distillShadowCell(cellIndex);
            distilledCount++;
            
            // Show final notification after all are processed
            if (i === readyCells.length - 1) {
                if (distilledCount === 0) {
                    showNotification('No potions ready to distill yet!', 'info');
                } else {
                    showNotification(`Distilled ${distilledCount} potions!`, 'success');
                    
                    // Add a celebratory effect if multiple potions were distilled
                    if (distilledCount > 1 && nightScene) {
                        // Add confetti effect at center of screen
                        const centerX = nightScene.cameras.main.width / 2;
                        const centerY = nightScene.cameras.main.height / 2;
                        
                        // Create a burst of particles
                        const particles = nightScene.add.particles(centerX, centerY, 'glow', {
                            scale: { start: 0.4, end: 0.1 },
                            speed: { min: 100, max: 300 },
                            quantity: distilledCount * 10, // More particles for more potions
                            lifespan: 2000,
                            alpha: { start: 1, end: 0 },
                            blendMode: 'ADD',
                            angle: { min: 0, max: 360 },
                            rotate: { min: 0, max: 360 },
                            tint: [0xff00ff, 0x00ffff, 0xffff00]
                        });
                        
                        // Auto-destroy particles after animation completes
                        nightScene.time.delayedCall(2000, () => {
                            particles.destroy();
                        });
                    }
                }
            }
        }, i * 150);
    });
    
    // If no potions were ready, show notification immediately
    if (readyCells.length === 0) {
        showNotification('No potions ready to distill yet!', 'info');
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
    
    // Update the market state display
    updateShadowMarketStateDisplay();
    
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
            }
        }
    }, 1000);
}

// Grow all plants in the ranch
function growRanchPlants() {
    let anyGrown = false;
    
    // Get RanchScene for visual updates
    let ranchScene = null;
    if (game && game.scene) {
        ranchScene = game.scene.getScene('RanchScene');
    }
    
    ranchGrid.cells.forEach((cell, index) => {
        // Only process cells that are planted or growing
        if (cell.state === 'planted' || cell.state === 'growing') {
            // Increment growth stage
            cell.growthStage++;
            anyGrown = true;
            
            // Check if fully grown
            if (cell.growthStage >= cell.growthMax) {
                cell.state = 'harvestable';
            } else if (cell.state === 'planted' && cell.growthStage >= 1) {
                cell.state = 'growing';
            }
            
            // Update the cell appearance in Phaser
            if (ranchScene) {
                ranchScene.updateCellAppearance(index);
                
                // Add growing particle effect
                const { startX, startY, cellSize, padding, size } = ranchScene.gridConfig;
                const row = Math.floor(index / size);
                const col = index % size;
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Create a sparkle effect for growing
                const particles = ranchScene.add.particles(x, y, 'water-drop', {
                    scale: { start: 0.1, end: 0 },
                    speed: { min: 20, max: 50 },
                    quantity: 5,
                    lifespan: 500,
                    alpha: { start: 0.6, end: 0 },
                    blendMode: 'ADD'
                });
                
                // Auto-destroy particles after 1 second
                ranchScene.time.delayedCall(1000, () => {
                    particles.destroy();
                });
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
    
    // Get the NightScene if available
    let nightScene = null;
    if (game && game.scene) {
        nightScene = game.scene.getScene('NightScene');
    }
    
    shadowGrid.cells.forEach((cell, index) => {
        // Only process cells that are brewing or distilling
        if (cell.state === 'brewing' || cell.state === 'distilling') {
            // Increment stage
            cell.stage++;
            anyProgressed = true;
            
            // Store previous state
            const prevState = cell.state;
            
            // Check if fully ready
            if (cell.stage >= cell.maxStage) {
                cell.state = 'ready';
            } else if (cell.state === 'brewing' && cell.stage >= 1) {
                cell.state = 'distilling';
            }
            
            // Update Phaser UI
            if (nightScene) {
                nightScene.updateCellAppearance(index);
                
                // Add particle effect for state transitions
                if (prevState !== cell.state) {
                    const { startX, startY, cellSize, padding, size } = nightScene.gridConfig;
                    const row = Math.floor(index / size);
                    const col = index % size;
                    const x = startX + col * (cellSize + padding);
                    const y = startY + row * (cellSize + padding);
                    
                    if (cell.state === 'distilling') {
                        // Transition from brewing to distilling
                        const particles = nightScene.add.particles(x, y, 'bubble', {
                            scale: { start: 0.2, end: 0 },
                            speed: { min: 30, max: 70 },
                            quantity: 15,
                            lifespan: 800,
                            alpha: { start: 0.8, end: 0 },
                            blendMode: 'ADD'
                        });
                        
                        // Auto-destroy particles after animation
                        nightScene.time.delayedCall(1000, () => {
                            particles.destroy();
                        });
                    } else if (cell.state === 'ready') {
                        // Transition to ready state
                        const particles = nightScene.add.particles(x, y, 'glow', {
                            scale: { start: 0.5, end: 0.1 },
                            speed: { min: 40, max: 100 },
                            quantity: 10,
                            lifespan: 1200,
                            alpha: { start: 1, end: 0 },
                            blendMode: 'ADD',
                            angle: { min: 0, max: 360 }
                        });
                        
                        // Auto-destroy particles after animation
                        nightScene.time.delayedCall(1500, () => {
                            particles.destroy();
                        });
                    }
                }
            }
        }
    });
    
    // Update button states
    updateButtonStates();
    
    // Notify only if something actually progressed
    if (anyProgressed) {
        showNotification('Your potions are progressing!', 'info');
    }
}

// Function to update market state display
function updateShadowMarketStateDisplay() {
    // Get the status elements
    const marketStateElement = document.getElementById('market-state');
    const marketTipElement = document.getElementById('market-tip');
    
    if (marketStateElement && marketTipElement) {
        // Update text and styling based on current state
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
        
        marketStateElement.textContent = stateText;
        marketStateElement.style.color = stateColor;
        marketTipElement.textContent = tipText;
    }
    
    // Also update the cycle display
    const cycleDisplay = document.getElementById('market-cycle');
    if (cycleDisplay) {
        cycleDisplay.textContent = shadowGrid.marketState;
    }
    
    // Update multiplier display
    const multiplierDisplay = document.getElementById('market-multiplier-value');
    if (multiplierDisplay) {
        multiplierDisplay.textContent = `x${shadowGrid.multiplier.toFixed(1)}`;
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
    
    // Update the display
    updateShadowMarketStateDisplay();
    
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
        if (!game || !game.scene) {
            console.log('Cannot add cattle - game scene not initialized');
            return null;
        }
        
        // Get the RanchScene instance
        const ranchScene = game.scene.getScene('RanchScene');
        if (!ranchScene) {
            console.log('Cannot add cattle - RanchScene not active');
            return null;
        }
        
        // Use the dedicated method in RanchScene to add the cattle sprite
        const cattleSprite = ranchScene.addCattleSprite(cattle);
        console.log(`Added cattle #${cattle.id} to scene with milk production`);
        
        return cattleSprite;
    } catch (err) {
        console.error('Error in addCattleToScene:', err);
        return null;
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
    
    // Update level and XP display
    if (typeof updateXPDisplay === 'function') {
        updateXPDisplay();
    } else {
        // Fallback implementation
        const levelValueElement = document.getElementById('level-value');
        if (levelValueElement && playerData.level) {
            levelValueElement.textContent = playerData.level;
        }
        
        const xpValueElement = document.getElementById('xp-value');
        if (xpValueElement && playerData.xp !== undefined && playerData.xpToNextLevel) {
            xpValueElement.textContent = `${playerData.xp} / ${playerData.xpToNextLevel}`;
        }
        
        const xpProgressBar = document.getElementById('xp-progress-bar');
        if (xpProgressBar && playerData.xp !== undefined && playerData.xpToNextLevel) {
            const progressPercentage = (playerData.xp / playerData.xpToNextLevel) * 100;
            xpProgressBar.style.width = `${progressPercentage}%`;
        }
    }
    
    // Update achievements display
    if (typeof updateAchievementsDisplay === 'function') {
        updateAchievementsDisplay();
    }
    
    // Update player statistics
    if (playerData.stats) {
        // Update races won/lost
        const racesWonEl = document.getElementById('races-won');
        if (racesWonEl) {
            racesWonEl.textContent = playerData.stats.racesWon || 0;
        }
        
        const racesLostEl = document.getElementById('races-lost');
        if (racesLostEl) {
            racesLostEl.textContent = playerData.stats.racesLost || 0;
        }
        
        // Update cattle bred
        const cattleBredEl = document.getElementById('cattle-bred');
        if (cattleBredEl) {
            cattleBredEl.textContent = playerData.cattleCollection ? playerData.cattleCollection.length : 0;
        }
        
        // Update potions crafted
        const potionsCraftedEl = document.getElementById('potions-crafted');
        if (potionsCraftedEl) {
            potionsCraftedEl.textContent = playerData.stats.potionsDistilled || 0;
        }
        
        // Update total earned/burned
        const totalEarnedEl = document.getElementById('total-earned');
        if (totalEarnedEl) {
            totalEarnedEl.textContent = playerData.stats.totalEarned || 0;
        }
        
        const totalBurnedEl = document.getElementById('total-burned');
        if (totalBurnedEl) {
            totalBurnedEl.textContent = playerData.stats.totalBurned || 0;
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