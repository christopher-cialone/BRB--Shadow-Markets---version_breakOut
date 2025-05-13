/**
 * Bull Run Boost: Shadow Markets - Refactored Phaser Implementation
 * A simulation game where a character navigates a map, interacts with farming, 
 * ranching, a Saloon mini-game, and an Ether Range for nighttime activities.
 */

// Global game state
const gameState = {
    player: {
        cattleBalance: 100,
        hay: 50,
        wheat: 0,
        crystals: 0,
        potions: 0
    },
    quests: [
        { id: 'plant-wheat', description: 'Plant 2 Wheat', completed: false, reward: 10 },
        { id: 'sell-potion', description: 'Sell 1 Potion', completed: false, reward: 15 }
    ],
    cattle: [],
    crops: [],
    crystalNodes: [],
    effects: []
};

// Main configuration for Phaser will be set after scene classes are defined

/**
 * Main Scene - Town map with ranch, field, saloon, and ether portal
 */
class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.character = null;
        this.buildings = null;
        this.interactiveObjects = null;
        this.cursors = null;
        this.spaceKey = null;
    }

    preload() {
        // Load town assets
        this.load.image('town-bg', 'img/town-bg.png');
        this.load.image('character', 'img/character.png');
        this.load.image('field-empty', 'img/field-empty.png');
        this.load.image('field-growing', 'img/field-growing.png');
        this.load.image('field-ready', 'img/field-ready.png');
        this.load.image('pasture', 'img/pasture.png');
        this.load.image('saloon', 'img/saloon.png');
        this.load.image('portal', 'img/portal.png');
        this.load.image('cattle', 'img/cattle.png');
    }

    create() {
        // Add town background
        this.add.image(400, 300, 'town-bg');
        
        // Setup grid system - 10x10 grid with 80x80px cells
        // This will help with positioning buildings and objects
        this.grid = {
            width: 80,
            height: 80,
            cols: 10,
            rows: 10
        };
        
        // Create groups for buildings and interactive objects
        this.buildings = this.physics.add.staticGroup();
        this.interactiveObjects = this.physics.add.staticGroup();
        
        // Add buildings at grid positions
        this.createBuilding('field-empty', 2, 2, 'field');
        this.createBuilding('pasture', 3, 2, 'pasture');
        this.createBuilding('saloon', 5, 5, 'saloon');
        this.createBuilding('portal', 7, 3, 'portal');
        
        // Add character
        this.character = this.physics.add.sprite(
            this.gridToX(1), 
            this.gridToY(1), 
            'character'
        );
        this.character.setScale(0.5);
        this.character.setCollideWorldBounds(true);
        
        // Setup collision between character and buildings
        this.physics.add.collider(this.character, this.buildings);
        
        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Setup interaction zones
        this.setupInteractionZones();
        
        // UI Setup
        this.setupUI();
        
        // Display initial notification
        this.showNotification('Welcome to Bull Run Boost Town!');
        
        // Update UI to show initial resources
        this.updateResourceDisplay();
        
        // Connect to server
        this.connectSocket();
    }
    
    update() {
        // Handle character movement
        this.handleMovement();
        
        // Check for interactions with buildings
        this.checkInteractions();
    }
    
    // Helper to convert grid X position to world X coordinate
    gridToX(gridX) {
        return gridX * this.grid.width + this.grid.width / 2;
    }
    
    // Helper to convert grid Y position to world Y coordinate
    gridToY(gridY) {
        return gridY * this.grid.height + this.grid.height / 2;
    }
    
    // Create a building at a grid position
    createBuilding(key, gridX, gridY, name) {
        const building = this.buildings.create(
            this.gridToX(gridX),
            this.gridToY(gridY),
            key
        );
        building.name = name;
        building.setSize(this.grid.width, this.grid.height);
        return building;
    }
    
    // Setup interaction zones around buildings
    setupInteractionZones() {
        this.saloonZone = this.add.zone(
            this.gridToX(5), 
            this.gridToY(5), 
            this.grid.width * 1.5, 
            this.grid.height * 1.5
        );
        this.physics.world.enable(this.saloonZone);
        this.saloonZone.body.setAllowGravity(false);
        this.saloonZone.body.moves = false;
        
        this.portalZone = this.add.zone(
            this.gridToX(7), 
            this.gridToY(3), 
            this.grid.width * 1.5, 
            this.grid.height * 1.5
        );
        this.physics.world.enable(this.portalZone);
        this.portalZone.body.setAllowGravity(false);
        this.portalZone.body.moves = false;
        
        this.fieldZone = this.add.zone(
            this.gridToX(2), 
            this.gridToY(2), 
            this.grid.width * 1.5, 
            this.grid.height * 1.5
        );
        this.physics.world.enable(this.fieldZone);
        this.fieldZone.body.setAllowGravity(false);
        this.fieldZone.body.moves = false;
        
        this.pastureZone = this.add.zone(
            this.gridToX(3), 
            this.gridToY(2), 
            this.grid.width * 1.5, 
            this.grid.height * 1.5
        );
        this.physics.world.enable(this.pastureZone);
        this.pastureZone.body.setAllowGravity(false);
        this.pastureZone.body.moves = false;
    }
    
    // Handle character movement
    handleMovement() {
        // Reset velocity
        this.character.setVelocity(0);
        
        // Movement speed
        const speed = 100;
        
        // Check WASD or arrow keys for movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.character.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.character.setVelocityX(speed);
        }
        
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.character.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.character.setVelocityY(speed);
        }
    }
    
    // Check for interactions with buildings
    checkInteractions() {
        const character = this.character;
        
        // Check overlaps with interaction zones
        const inSaloonZone = Phaser.Geom.Rectangle.Overlaps(
            character.getBounds(),
            this.saloonZone.getBounds()
        );
        
        const inPortalZone = Phaser.Geom.Rectangle.Overlaps(
            character.getBounds(),
            this.portalZone.getBounds()
        );
        
        const inFieldZone = Phaser.Geom.Rectangle.Overlaps(
            character.getBounds(),
            this.fieldZone.getBounds()
        );
        
        const inPastureZone = Phaser.Geom.Rectangle.Overlaps(
            character.getBounds(),
            this.pastureZone.getBounds()
        );
        
        // Handle space key press for interactions
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (inSaloonZone) {
                this.enterSaloon();
            } else if (inPortalZone) {
                this.enterEtherRange();
            } else if (inFieldZone) {
                this.interactWithField();
            } else if (inPastureZone) {
                this.interactWithPasture();
            }
        }
    }
    
    // Enter the saloon
    enterSaloon() {
        this.showNotification('Entering the Saloon...');
        this.scene.start('SaloonScene');
    }
    
    // Enter the ether range
    enterEtherRange() {
        this.showNotification('Entering the Ether Range...');
        this.scene.start('EtherScene');
    }
    
    // Interact with the field
    interactWithField() {
        this.showNotification('Interacting with the field...');
        // Field interaction logic will be implemented here
    }
    
    // Interact with the pasture
    interactWithPasture() {
        this.showNotification('Interacting with the pasture...');
        // Pasture interaction logic will be implemented here
    }
    
    // Setup the UI
    setupUI() {
        // Create UI elements if needed
        // Buttons will be added to the DOM for buying seeds, cattle, etc.
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer) {
            // Update the UI container with the appropriate controls
            this.updateUIControls();
        }
    }
    
    // Update UI controls based on the current scene
    updateUIControls() {
        const uiContainer = document.getElementById('ui-container');
        if (!uiContainer) return;
        
        // Create UI for main scene
        uiContainer.innerHTML = `
            <div class="main-scene-ui">
                <div class="resource-display">
                    <div>$CATTLE: <span id="cattle-balance">${gameState.player.cattleBalance}</span></div>
                    <div>Hay: <span id="hay-amount">${gameState.player.hay}</span></div>
                    <div>Wheat: <span id="wheat-amount">${gameState.player.wheat}</span></div>
                    <div>Crystals: <span id="crystal-amount">${gameState.player.crystals}</span></div>
                    <div>Potions: <span id="potion-amount">${gameState.player.potions}</span></div>
                </div>
                <div class="action-buttons">
                    <button id="buy-seeds-btn">Buy Seeds (10 $CATTLE)</button>
                    <button id="buy-cattle-btn">Buy Cattle (20 $CATTLE)</button>
                </div>
                <div id="quest-log" class="quest-log">
                    <h3>Quests</h3>
                    <ul>
                        ${gameState.quests.map(quest => `
                            <li class="${quest.completed ? 'completed' : ''}">
                                ${quest.description} - Reward: ${quest.reward} $CATTLE
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div id="notification" class="notification"></div>
            </div>
        `;
        
        // Add event listeners for buttons
        document.getElementById('buy-seeds-btn').addEventListener('click', () => {
            this.buySeedsClicked();
        });
        
        document.getElementById('buy-cattle-btn').addEventListener('click', () => {
            this.buyCattleClicked();
        });
    }
    
    // Handle buying seeds
    buySeedsClicked() {
        if (gameState.player.cattleBalance >= 10) {
            gameState.player.cattleBalance -= 10;
            this.showNotification('Seeds purchased! Click on the field to plant.');
            this.updateResourceDisplay();
            
            // Enable planting mode
            this.plantingMode = true;
        } else {
            this.showNotification('Not enough $CATTLE to buy seeds!', 'error');
        }
    }
    
    // Handle buying cattle
    buyCattleClicked() {
        if (gameState.player.cattleBalance >= 20) {
            // Show cattle type selection
            const cattleTypeSelection = `
                <div class="cattle-selection">
                    <h3>Choose Cattle Type:</h3>
                    <button id="milk-cow-btn">Milk Cow</button>
                    <button id="rodeo-bull-btn">Rodeo Bull</button>
                    <button id="cancel-cattle-btn">Cancel</button>
                </div>
            `;
            
            const notification = document.getElementById('notification');
            notification.innerHTML = cattleTypeSelection;
            notification.classList.add('active');
            
            // Add event listeners
            document.getElementById('milk-cow-btn').addEventListener('click', () => {
                this.buyCattle('milk-cow');
                notification.classList.remove('active');
            });
            
            document.getElementById('rodeo-bull-btn').addEventListener('click', () => {
                this.buyCattle('rodeo-bull');
                notification.classList.remove('active');
            });
            
            document.getElementById('cancel-cattle-btn').addEventListener('click', () => {
                notification.classList.remove('active');
            });
        } else {
            this.showNotification('Not enough $CATTLE to buy cattle!', 'error');
        }
    }
    
    // Buy a specific type of cattle
    buyCattle(type) {
        gameState.player.cattleBalance -= 20;
        
        // Add cattle to game state
        const newCattle = {
            id: 'cattle-' + Date.now(),
            type: type,
            position: { x: this.gridToX(3), y: this.gridToY(2) },
            lastFed: Date.now(),
            lastProduced: Date.now()
        };
        
        gameState.cattle.push(newCattle);
        
        // Add cattle sprite to pasture
        const cattleSprite = this.physics.add.sprite(
            newCattle.position.x,
            newCattle.position.y,
            'cattle'
        );
        
        // Add grazing animation
        this.tweens.add({
            targets: cattleSprite,
            x: newCattle.position.x + 20,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        this.showNotification(`${type === 'milk-cow' ? 'Milk Cow' : 'Rodeo Bull'} purchased!`);
        this.updateResourceDisplay();
        
        // Start production timer
        this.startCattleProduction(newCattle, cattleSprite);
    }
    
    // Start cattle production cycle
    startCattleProduction(cattle, sprite) {
        // Set up timer for cattle production
        this.time.addEvent({
            delay: cattle.type === 'milk-cow' ? 30000 : 60000, // 30s for milk cows, 60s for rodeo bulls
            callback: () => {
                // Check if we have hay to feed the cattle
                if (gameState.player.hay >= 5) {
                    gameState.player.hay -= 5;
                    
                    // Production based on cattle type
                    if (cattle.type === 'milk-cow') {
                        gameState.player.cattleBalance += 10;
                        this.showNotification('Milk Cow produced 10 $CATTLE worth of milk!');
                        
                        // Create milk animation
                        this.createMilkAnimation(sprite.x, sprite.y);
                    } else {
                        gameState.player.cattleBalance += 20;
                        this.showNotification('Rodeo Bull earned 20 $CATTLE from training!');
                        
                        // Create training animation
                        this.createTrainingAnimation(sprite.x, sprite.y);
                    }
                    
                    // Update the UI
                    this.updateResourceDisplay();
                    
                    // Emit event to server
                    if (this.socket) {
                        this.socket.emit('cattle-earned', {
                            type: cattle.type,
                            amount: cattle.type === 'milk-cow' ? 10 : 20
                        });
                    }
                } else {
                    this.showNotification('No hay to feed cattle! Production stopped.', 'error');
                }
                
                // Update last produced time
                cattle.lastProduced = Date.now();
            },
            callbackScope: this,
            loop: true
        });
    }
    
    // Create milk animation
    createMilkAnimation(x, y) {
        const milkText = this.add.text(x, y - 30, '+10 $CATTLE', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });
        
        this.tweens.add({
            targets: milkText,
            y: y - 60,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                milkText.destroy();
            }
        });
    }
    
    // Create training animation
    createTrainingAnimation(x, y) {
        const trainingText = this.add.text(x, y - 30, '+20 $CATTLE', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });
        
        this.tweens.add({
            targets: trainingText,
            y: y - 60,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                trainingText.destroy();
            }
        });
    }
    
    // Update the resource display
    updateResourceDisplay() {
        document.getElementById('cattle-balance').textContent = gameState.player.cattleBalance;
        document.getElementById('hay-amount').textContent = gameState.player.hay;
        document.getElementById('wheat-amount').textContent = gameState.player.wheat;
        document.getElementById('crystal-amount').textContent = gameState.player.crystals;
        document.getElementById('potion-amount').textContent = gameState.player.potions;
    }
    
    // Show a notification
    showNotification(message, type = 'info') {
        console.log(`Notification: ${message} (${type})`);
        
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification';
            notification.classList.add(type);
            notification.classList.add('active');
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.classList.remove('active');
            }, 3000);
        }
    }
    
    // Connect to the socket.io server
    connectSocket() {
        if (window.io) {
            this.socket = window.io();
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
            });
            
            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
            });
        } else {
            console.error('Socket.io not available');
        }
    }
}

/**
 * Saloon Scene - Card racing mini-game
 */
class SaloonScene extends Phaser.Scene {
    constructor() {
        super('SaloonScene');
        this.raceInProgress = false;
        this.wagerAmount = 10;
    }
    
    preload() {
        // Load saloon assets
        this.load.image('saloon-bg', 'img/saloon-bg.png');
        this.load.image('horse-hearts', 'img/horse-hearts.png');
        this.load.image('horse-diamonds', 'img/horse-diamonds.png');
        this.load.image('horse-clubs', 'img/horse-clubs.png');
        this.load.image('horse-spades', 'img/horse-spades.png');
    }
    
    create() {
        // Add saloon background
        this.add.image(400, 300, 'saloon-bg');
        
        // Setup race UI
        this.setupRaceUI();
        
        // Setup escape key to return to main scene
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Setup UI
        this.updateUIControls();
        
        // Show welcome message
        this.showNotification('Welcome to the Saloon! Place your bets and start the race.');
    }
    
    update() {
        // Check for escape key to return to main scene
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.returnToTown();
        }
    }
    
    // Setup the race UI
    setupRaceUI() {
        // Race track
        this.add.rectangle(400, 200, 700, 200, 0x333333);
        this.add.rectangle(400, 200, 690, 190, 0x666666);
        
        // Finish line
        this.add.rectangle(700, 200, 10, 200, 0xffffff);
        
        // Starting positions
        const startX = 100;
        const lane1Y = 130;
        const lane2Y = 170;
        const lane3Y = 210;
        const lane4Y = 250;
        
        // Add horses in each lane
        this.horseHearts = this.add.image(startX, lane1Y, 'horse-hearts');
        this.horseDiamonds = this.add.image(startX, lane2Y, 'horse-diamonds');
        this.horseClubs = this.add.image(startX, lane3Y, 'horse-clubs');
        this.horseSpades = this.add.image(startX, lane4Y, 'horse-spades');
        
        // Scale horses
        this.horseHearts.setScale(0.5);
        this.horseDiamonds.setScale(0.5);
        this.horseClubs.setScale(0.5);
        this.horseSpades.setScale(0.5);
        
        // Lane labels
        this.add.text(50, lane1Y, 'Hearts', { fontSize: '16px', fill: '#ff0000' });
        this.add.text(50, lane2Y, 'Diamonds', { fontSize: '16px', fill: '#ff0000' });
        this.add.text(50, lane3Y, 'Clubs', { fontSize: '16px', fill: '#ffffff' });
        this.add.text(50, lane4Y, 'Spades', { fontSize: '16px', fill: '#ffffff' });
    }
    
    // Update UI controls for saloon scene
    updateUIControls() {
        const uiContainer = document.getElementById('ui-container');
        if (!uiContainer) return;
        
        // Create UI for saloon scene
        uiContainer.innerHTML = `
            <div class="saloon-scene-ui">
                <div class="resource-display">
                    <div>$CATTLE: <span id="cattle-balance">${gameState.player.cattleBalance}</span></div>
                </div>
                <div class="betting-controls">
                    <div>Wager Amount: 10 $CATTLE</div>
                    <button id="hearts-bet-btn">Bet on Hearts</button>
                    <button id="diamonds-bet-btn">Bet on Diamonds</button>
                    <button id="clubs-bet-btn">Bet on Clubs</button>
                    <button id="spades-bet-btn">Bet on Spades</button>
                    <button id="start-race-btn">Start Race</button>
                    <button id="exit-saloon-btn">Exit Saloon</button>
                </div>
                <div id="notification" class="notification"></div>
            </div>
        `;
        
        // Add event listeners for buttons
        document.getElementById('hearts-bet-btn').addEventListener('click', () => {
            this.placeBet('hearts');
        });
        
        document.getElementById('diamonds-bet-btn').addEventListener('click', () => {
            this.placeBet('diamonds');
        });
        
        document.getElementById('clubs-bet-btn').addEventListener('click', () => {
            this.placeBet('clubs');
        });
        
        document.getElementById('spades-bet-btn').addEventListener('click', () => {
            this.placeBet('spades');
        });
        
        document.getElementById('start-race-btn').addEventListener('click', () => {
            this.startRace();
        });
        
        document.getElementById('exit-saloon-btn').addEventListener('click', () => {
            this.returnToTown();
        });
    }
    
    // Place a bet on a horse
    placeBet(suit) {
        if (this.raceInProgress) {
            this.showNotification('Cannot place bets during a race!', 'error');
            return;
        }
        
        if (gameState.player.cattleBalance < this.wagerAmount) {
            this.showNotification('Not enough $CATTLE to place a bet!', 'error');
            return;
        }
        
        this.selectedHorse = suit;
        this.showNotification(`Bet placed on ${suit}!`);
        
        // Disable all bet buttons
        document.getElementById('hearts-bet-btn').classList.add('disabled');
        document.getElementById('diamonds-bet-btn').classList.add('disabled');
        document.getElementById('clubs-bet-btn').classList.add('disabled');
        document.getElementById('spades-bet-btn').classList.add('disabled');
        
        // Highlight selected bet
        document.getElementById(`${suit}-bet-btn`).classList.add('selected');
    }
    
    // Start the race
    startRace() {
        if (this.raceInProgress) {
            this.showNotification('Race already in progress!', 'error');
            return;
        }
        
        if (!this.selectedHorse) {
            this.showNotification('Place a bet before starting the race!', 'error');
            return;
        }
        
        // Deduct wager amount
        gameState.player.cattleBalance -= this.wagerAmount;
        document.getElementById('cattle-balance').textContent = gameState.player.cattleBalance;
        
        this.raceInProgress = true;
        this.showNotification('The race has begun!');
        
        // Disable start race button
        document.getElementById('start-race-btn').classList.add('disabled');
        
        // Random winner
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.winnerSuit = suits[Math.floor(Math.random() * suits.length)];
        
        // Get horses and create dictionary
        const horses = {
            hearts: this.horseHearts,
            diamonds: this.horseDiamonds,
            clubs: this.horseClubs,
            spades: this.horseSpades
        };
        
        // Animate all horses, but make the winner reach the finish line first
        Object.entries(horses).forEach(([suit, horse]) => {
            // Random speed for each horse
            const speed = suit === this.winnerSuit ? 
                2000 + Math.random() * 500 : // Winner is faster
                2500 + Math.random() * 1000;  // Others are slower
            
            this.tweens.add({
                targets: horse,
                x: 700, // Finish line
                duration: speed,
                ease: 'Linear',
                onComplete: () => {
                    if (suit === this.winnerSuit) {
                        this.endRace(suit);
                    }
                }
            });
        });
    }
    
    // End the race and calculate winnings
    endRace(winner) {
        if (!this.raceInProgress) return;
        
        this.raceInProgress = false;
        
        // Calculate winnings
        let winnings = 0;
        if (winner === this.selectedHorse) {
            winnings = this.wagerAmount * 2; // Double your money
            gameState.player.cattleBalance += winnings;
            this.showNotification(`${winner} won! You earned ${winnings} $CATTLE!`, 'success');
        } else {
            this.showNotification(`${winner} won! Better luck next time.`, 'info');
        }
        
        // Update balance display
        document.getElementById('cattle-balance').textContent = gameState.player.cattleBalance;
        
        // Send result to server
        if (window.socket) {
            window.socket.emit('race-finished', {
                winner: winner,
                bet: this.selectedHorse,
                winnings: winnings
            });
        }
        
        // Reset for next race after a delay
        this.time.delayedCall(2000, this.resetRace, [], this);
    }
    
    // Reset the race
    resetRace() {
        // Reset horse positions
        const startX = 100;
        this.horseHearts.x = startX;
        this.horseDiamonds.x = startX;
        this.horseClubs.x = startX;
        this.horseSpades.x = startX;
        
        // Reset selected horse
        this.selectedHorse = null;
        
        // Re-enable buttons
        document.getElementById('hearts-bet-btn').classList.remove('disabled', 'selected');
        document.getElementById('diamonds-bet-btn').classList.remove('disabled', 'selected');
        document.getElementById('clubs-bet-btn').classList.remove('disabled', 'selected');
        document.getElementById('spades-bet-btn').classList.remove('disabled', 'selected');
        document.getElementById('start-race-btn').classList.remove('disabled');
        
        this.showNotification('Ready for a new race!');
    }
    
    // Return to the town
    returnToTown() {
        this.scene.start('MainScene');
    }
    
    // Show a notification
    showNotification(message, type = 'info') {
        console.log(`Notification: ${message} (${type})`);
        
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification';
            notification.classList.add(type);
            notification.classList.add('active');
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.classList.remove('active');
            }, 3000);
        }
    }
}

/**
 * Ether Scene - Night mode with crystal gathering and potion crafting
 */
class EtherScene extends Phaser.Scene {
    constructor() {
        super('EtherScene');
        this.character = null;
        this.crystalNodes = [];
        this.cauldron = null;
        this.escKey = null;
    }
    
    preload() {
        // Load ether range assets
        this.load.image('ether-bg', 'img/ether-bg.png');
        this.load.image('character', 'img/character.png');
        this.load.image('crystal', 'img/crystal.png');
        this.load.image('cauldron', 'img/cauldron.png');
    }
    
    create() {
        // Add ether background
        this.add.image(400, 300, 'ether-bg');
        
        // Add character
        this.character = this.physics.add.sprite(400, 300, 'character');
        this.character.setScale(0.5);
        this.character.setCollideWorldBounds(true);
        
        // Setup crystal nodes
        this.setupCrystalNodes();
        
        // Setup cauldron
        this.setupCauldron();
        
        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Setup UI
        this.updateUIControls();
        
        // Show welcome message
        this.showNotification('Welcome to the Ether Range! Gather crystals and craft potions.');
    }
    
    update() {
        // Handle character movement
        this.handleMovement();
        
        // Check for interactions with crystal nodes and cauldron
        this.checkInteractions();
        
        // Check for escape key to return to main scene
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.returnToTown();
        }
    }
    
    // Setup crystal nodes
    setupCrystalNodes() {
        // Group for crystal nodes
        this.crystalGroup = this.physics.add.staticGroup();
        
        // Add crystal nodes at specific positions
        this.addCrystalNode(160, 160); // gridToX(2), gridToY(2)
        this.addCrystalNode(240, 240); // gridToX(3), gridToY(3)
        this.addCrystalNode(320, 160); // gridToX(4), gridToY(2)
        
        // Enable overlap with character
        this.physics.add.overlap(
            this.character,
            this.crystalGroup,
            this.handleCrystalCollision,
            null,
            this
        );
    }
    
    // Add a crystal node
    addCrystalNode(x, y) {
        const crystal = this.crystalGroup.create(x, y, 'crystal');
        crystal.setScale(0.7);
        crystal.setInteractive({ useHandCursor: true });
        crystal.available = true;
        
        // Add glow effect
        this.tweens.add({
            targets: crystal,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        return crystal;
    }
    
    // Setup cauldron
    setupCauldron() {
        this.cauldron = this.physics.add.image(400, 400, 'cauldron');
        this.cauldron.setScale(0.8);
        this.cauldron.setImmovable(true);
        this.cauldron.setInteractive({ useHandCursor: true });
        
        // Add brewing animation
        this.tweens.add({
            targets: this.cauldron,
            y: this.cauldron.y - 5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // Enable overlap with character
        this.physics.add.overlap(
            this.character,
            this.cauldron,
            this.handleCauldronCollision,
            null,
            this
        );
    }
    
    // Handle character movement
    handleMovement() {
        // Reset velocity
        this.character.setVelocity(0);
        
        // Movement speed
        const speed = 100;
        
        // Check WASD or arrow keys for movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.character.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.character.setVelocityX(speed);
        }
        
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.character.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.character.setVelocityY(speed);
        }
    }
    
    // Check for interactions
    checkInteractions() {
        // Interactions are handled via Phaser physics overlap
    }
    
    // Handle collision with crystal node
    handleCrystalCollision(character, crystal) {
        if (!crystal.available) return;
        
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 250)) {
            // Collect crystals
            gameState.player.crystals += 5;
            
            // Update display
            document.getElementById('crystal-amount').textContent = gameState.player.crystals;
            
            // Show notification
            this.showNotification('Collected 5 crystals!');
            
            // Make crystal unavailable for 60 seconds
            crystal.available = false;
            crystal.alpha = 0.3;
            
            // Create collection animation
            this.createCrystalCollectionAnimation(crystal.x, crystal.y);
            
            // Respawn crystal after 60 seconds
            this.time.delayedCall(60000, () => {
                crystal.available = true;
                crystal.alpha = 1;
            });
        }
    }
    
    // Handle collision with cauldron
    handleCauldronCollision(character, cauldron) {
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 250)) {
            // Open potion crafting UI
            this.openPotionCraftingUI();
        }
    }
    
    // Open potion crafting UI
    openPotionCraftingUI() {
        const notification = document.getElementById('notification');
        
        // Check if player has enough resources
        if (gameState.player.crystals < 10 || gameState.player.cattleBalance < 5) {
            this.showNotification('Not enough resources! Need 10 crystals and 5 $CATTLE.', 'error');
            return;
        }
        
        // Create potion crafting UI
        const craftingUI = `
            <div class="crafting-ui">
                <h3>Potion Crafting</h3>
                <p>Cost: 10 Crystals + 5 $CATTLE</p>
                <div class="crafting-options">
                    <button id="craft-potion-btn">Craft Potion</button>
                    <button id="cancel-crafting-btn">Cancel</button>
                </div>
            </div>
        `;
        
        notification.innerHTML = craftingUI;
        notification.classList.add('active');
        
        // Add event listeners
        document.getElementById('craft-potion-btn').addEventListener('click', () => {
            this.craftPotion();
            notification.classList.remove('active');
        });
        
        document.getElementById('cancel-crafting-btn').addEventListener('click', () => {
            notification.classList.remove('active');
        });
    }
    
    // Craft a potion
    craftPotion() {
        // Deduct resources
        gameState.player.crystals -= 10;
        gameState.player.cattleBalance -= 5;
        
        // Add potion to inventory
        gameState.player.potions += 1;
        
        // Update displays
        document.getElementById('crystal-amount').textContent = gameState.player.crystals;
        document.getElementById('cattle-balance').textContent = gameState.player.cattleBalance;
        document.getElementById('potion-amount').textContent = gameState.player.potions;
        
        // Show notification
        this.showNotification('Potion crafted successfully!', 'success');
        
        // Create brewing animation
        this.createBrewingAnimation();
        
        // Emit event to server
        if (window.socket) {
            window.socket.emit('potion-crafted', {
                crystals: 10,
                cattle: 5
            });
        }
        
        // Check for quest completion
        this.checkQuestCompletion();
    }
    
    // Create crystal collection animation
    createCrystalCollectionAnimation(x, y) {
        const text = this.add.text(x, y - 20, '+5 Crystals', {
            fontSize: '16px',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 2
        });
        
        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    // Create brewing animation
    createBrewingAnimation() {
        const particles = this.add.particles('crystal');
        
        const emitter = particles.createEmitter({
            x: this.cauldron.x,
            y: this.cauldron.y - 20,
            speed: { min: 50, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: 100
        });
        
        // Stop emitter after 1 second
        this.time.delayedCall(1000, () => {
            emitter.stop();
            
            // Destroy particles after they've all disappeared
            this.time.delayedCall(1000, () => {
                particles.destroy();
            });
        });
    }
    
    // Check for quest completion
    checkQuestCompletion() {
        // Check 'sell-potion' quest
        const potionQuest = gameState.quests.find(q => q.id === 'sell-potion');
        if (potionQuest && !potionQuest.completed) {
            // Ask if player wants to sell the potion
            const notification = document.getElementById('notification');
            
            const sellPrompt = `
                <div class="sell-prompt">
                    <h3>Sell Potion?</h3>
                    <p>Complete quest: ${potionQuest.description}</p>
                    <p>Reward: ${potionQuest.reward} $CATTLE</p>
                    <div class="prompt-options">
                        <button id="sell-potion-btn">Sell Potion</button>
                        <button id="keep-potion-btn">Keep Potion</button>
                    </div>
                </div>
            `;
            
            notification.innerHTML = sellPrompt;
            notification.classList.add('active');
            
            // Add event listeners
            document.getElementById('sell-potion-btn').addEventListener('click', () => {
                this.sellPotion(potionQuest);
                notification.classList.remove('active');
            });
            
            document.getElementById('keep-potion-btn').addEventListener('click', () => {
                notification.classList.remove('active');
            });
        }
    }
    
    // Sell a potion
    sellPotion(quest) {
        // Deduct potion
        gameState.player.potions -= 1;
        
        // Add reward
        gameState.player.cattleBalance += quest.reward;
        
        // Mark quest as completed
        quest.completed = true;
        
        // Update displays
        document.getElementById('potion-amount').textContent = gameState.player.potions;
        document.getElementById('cattle-balance').textContent = gameState.player.cattleBalance;
        
        // Update quest log
        this.updateQuestLog();
        
        // Show notification
        this.showNotification(`Quest completed! Earned ${quest.reward} $CATTLE.`, 'success');
        
        // Emit event to server
        if (window.socket) {
            window.socket.emit('potion-sold', {
                reward: quest.reward
            });
        }
    }
    
    // Update quest log
    updateQuestLog() {
        const questLog = document.getElementById('quest-log');
        if (!questLog) return;
        
        const questList = questLog.querySelector('ul');
        if (!questList) return;
        
        questList.innerHTML = gameState.quests.map(quest => `
            <li class="${quest.completed ? 'completed' : ''}">
                ${quest.description} - Reward: ${quest.reward} $CATTLE
            </li>
        `).join('');
    }
    
    // Update UI controls for ether scene
    updateUIControls() {
        const uiContainer = document.getElementById('ui-container');
        if (!uiContainer) return;
        
        // Create UI for ether scene
        uiContainer.innerHTML = `
            <div class="ether-scene-ui">
                <div class="resource-display">
                    <div>$CATTLE: <span id="cattle-balance">${gameState.player.cattleBalance}</span></div>
                    <div>Crystals: <span id="crystal-amount">${gameState.player.crystals}</span></div>
                    <div>Potions: <span id="potion-amount">${gameState.player.potions}</span></div>
                </div>
                <div class="action-buttons">
                    <button id="use-potion-btn" ${gameState.player.potions <= 0 ? 'disabled' : ''}>Use Potion</button>
                    <button id="exit-ether-btn">Exit Ether Range</button>
                </div>
                <div id="quest-log" class="quest-log">
                    <h3>Quests</h3>
                    <ul>
                        ${gameState.quests.map(quest => `
                            <li class="${quest.completed ? 'completed' : ''}">
                                ${quest.description} - Reward: ${quest.reward} $CATTLE
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div id="notification" class="notification"></div>
            </div>
        `;
        
        // Add event listeners for buttons
        document.getElementById('use-potion-btn').addEventListener('click', () => {
            this.usePotion();
        });
        
        document.getElementById('exit-ether-btn').addEventListener('click', () => {
            this.returnToTown();
        });
    }
    
    // Use a potion
    usePotion() {
        if (gameState.player.potions <= 0) {
            this.showNotification('No potions available!', 'error');
            return;
        }
        
        // Deduct potion
        gameState.player.potions -= 1;
        
        // Add effect to game state
        const effect = {
            id: 'milk-boost',
            multiplier: 1.1,
            duration: 60000, // 60 seconds
            startTime: Date.now()
        };
        
        gameState.effects.push(effect);
        
        // Update display
        document.getElementById('potion-amount').textContent = gameState.player.potions;
        
        // Show notification
        this.showNotification('Potion used! +10% Milk earnings for 60s', 'success');
        
        // Create potion use animation
        this.createPotionUseAnimation();
        
        // Set timeout to remove effect
        this.time.delayedCall(effect.duration, () => {
            // Remove effect from game state
            const index = gameState.effects.findIndex(e => e.id === effect.id);
            if (index !== -1) {
                gameState.effects.splice(index, 1);
                this.showNotification('Potion effect has worn off.', 'info');
            }
        });
    }
    
    // Create potion use animation
    createPotionUseAnimation() {
        const particles = this.add.particles('crystal');
        
        const emitter = particles.createEmitter({
            x: this.character.x,
            y: this.character.y,
            speed: { min: 50, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: 100
        });
        
        // Make emitter follow character
        emitter.startFollow(this.character);
        
        // Stop emitter after 2 seconds
        this.time.delayedCall(2000, () => {
            emitter.stop();
            
            // Destroy particles after they've all disappeared
            this.time.delayedCall(1000, () => {
                particles.destroy();
            });
        });
    }
    
    // Return to the town
    returnToTown() {
        this.scene.start('MainScene');
    }
    
    // Show a notification
    showNotification(message, type = 'info') {
        console.log(`Notification: ${message} (${type})`);
        
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification';
            notification.classList.add(type);
            notification.classList.add('active');
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.classList.remove('active');
            }, 3000);
        }
    }
}

// Now that all scenes are defined, we can create the Phaser configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        MainScene,
        SaloonScene,
        EtherScene
    ]
};

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing refactored game...");
    
    // Create the Phaser game
    const game = new Phaser.Game(config);
});