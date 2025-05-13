/**
 * Bull Run Boost - Scene Loader
 * 
 * This file handles the loading and initialization of all game scenes.
 * It ensures proper ordering of scene declarations before the game is initialized.
 */

// MainScene - Town map with ranch, field, saloon, and ether portal
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
        // Load town assets (SVG versions)
        this.load.svg('town-bg', 'img/town-bg.svg');
        this.load.svg('character', 'img/character.svg');
        this.load.svg('field-empty', 'img/field-empty.svg');
        this.load.svg('field-growing', 'img/field-growing.svg');
        this.load.svg('field-ready', 'img/field-ready.svg');
        this.load.svg('pasture', 'img/pasture.svg');
        this.load.svg('saloon', 'img/saloon.svg');
        this.load.svg('portal', 'img/portal.svg');
        this.load.svg('cattle', 'img/cattle.svg');
    }

    create() {
        // Add town background
        this.add.image(400, 300, 'town-bg');
        
        // Setup grid system - 10x10 grid with 80x80px cells
        this.grid = {
            width: 80,
            height: 80,
            cols: 10,
            rows: 7.5
        };
        
        // Create groups for buildings and interactive objects
        this.buildings = this.physics.add.staticGroup();
        this.interactiveObjects = this.physics.add.staticGroup();
        
        // Add buildings at grid positions
        this.createBuilding('field-empty', 2, 2, 'field');
        this.createBuilding('pasture', 6, 2, 'pasture');
        this.createBuilding('saloon', 4, 4, 'saloon');
        this.createBuilding('portal', 7, 3, 'portal');
        
        // Add character
        this.character = this.physics.add.sprite(400, 300, 'character');
        this.character.setScale(0.8);
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
        
        // Display instructions
        this.instructionsText = this.add.text(
            400, 550, 
            'Use WASD or Arrow Keys to move. Press SPACE to interact.', 
            { font: '16px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Display initial notification
        this.showNotification('Welcome to Bull Run Boost Town!');
        
        // Connect to WebSocket
        this.connectWebSocket();
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
        return building;
    }
    
    // Setup interaction zones around buildings
    setupInteractionZones() {
        this.saloonZone = this.add.zone(
            this.gridToX(4), 
            this.gridToY(4), 
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
            this.gridToX(6), 
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
        const speed = 160;
        
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
        // Update field state based on current state
        const fieldBuilding = this.buildings.getChildren().find(b => b.name === 'field');
        if (fieldBuilding) {
            if (fieldBuilding.texture.key === 'field-empty') {
                fieldBuilding.setTexture('field-growing');
                this.showNotification('Seeds planted! Growing...');
                
                // Set a timer to make the field ready
                this.time.addEvent({
                    delay: 10000, // 10 seconds for demo
                    callback: () => {
                        fieldBuilding.setTexture('field-ready');
                        this.showNotification('Field is ready to harvest!');
                    },
                    callbackScope: this
                });
            } else if (fieldBuilding.texture.key === 'field-ready') {
                fieldBuilding.setTexture('field-empty');
                this.showNotification('Field harvested! +20 Hay');
                
                // Update game state
                if (window.gameState) {
                    window.gameState.player.hay += 20;
                    
                    // Send update to server via WebSocket
                    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                        this.socket.send(JSON.stringify({
                            type: 'resource_update',
                            resource: 'hay',
                            amount: 20,
                            operation: 'add'
                        }));
                    }
                }
            } else {
                this.showNotification('Field is still growing...');
            }
        }
    }
    
    // Interact with the pasture
    interactWithPasture() {
        this.showNotification('Interacting with the pasture...');
        // Pasture interaction will involve cattle management
        
        // For demo purposes, add a cattle sprite
        const cattleSprite = this.physics.add.sprite(
            this.gridToX(6),
            this.gridToY(2),
            'cattle'
        );
        cattleSprite.setScale(0.8);
        
        // Add grazing animation
        this.tweens.add({
            targets: cattleSprite,
            x: cattleSprite.x + 20,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
        
        this.showNotification('A cow has joined your pasture!');
    }
    
    // Show notification message
    showNotification(message, type = 'info') {
        // Create text notification in-game
        const notification = this.add.text(
            400, 100, 
            message, 
            { 
                font: '18px Arial', 
                fill: type === 'error' ? '#ff0000' : '#ffffff', 
                backgroundColor: type === 'error' ? '#330000' : '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);
        
        // Fade out and destroy after delay
        this.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 3000,
            delay: 2000,
            onComplete: () => {
                notification.destroy();
            }
        });
        
        // Also update UI notification if accessible
        const notificationElement = document.getElementById('notification');
        if (notificationElement) {
            notificationElement.textContent = message;
            notificationElement.className = 'notification active ' + type;
            
            // Hide after delay
            setTimeout(() => {
                notificationElement.className = 'notification';
            }, 5000);
        }
    }
    
    // Connect to WebSocket server
    connectWebSocket() {
        // Determine the correct WebSocket protocol based on page protocol
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.addEventListener('open', (event) => {
            console.log('Connected to WebSocket server from MainScene');
            
            // Send initial scene data
            this.socket.send(JSON.stringify({
                type: 'scene_init',
                scene: 'MainScene',
                timestamp: Date.now()
            }));
        });
        
        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message in MainScene:', data);
                
                // Handle specific scene messages
                if (data.type === 'game_update' && data.scene === 'MainScene') {
                    this.showNotification('Game state updated from server');
                }
            } catch (err) {
                console.error('Error parsing WebSocket message in MainScene:', err);
            }
        });
        
        this.socket.addEventListener('close', (event) => {
            console.log('Disconnected from WebSocket server');
        });
    }
}

// SaloonScene - Card racing mini-game
class SaloonScene extends Phaser.Scene {
    constructor() {
        super('SaloonScene');
    }
    
    preload() {
        // Load saloon assets
        this.load.svg('saloon-bg', 'img/saloon-bg.svg');
        
        // Load card assets
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        suits.forEach(suit => {
            this.load.image(`card-${suit}`, `img/card-${suit}.png`);
        });
    }
    
    create() {
        // Add saloon background
        this.add.image(400, 300, 'saloon-bg');
        
        // Add return button
        const returnButton = this.add.text(
            50, 50, 
            'Return to Town', 
            { 
                font: '16px Arial', 
                fill: '#ffffff',
                backgroundColor: '#aa33aa',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        returnButton.on('pointerdown', () => {
            this.returnToTown();
        });
        
        // Setup card race track
        this.setupRaceTrack();
        
        // Add instructions
        this.instructionsText = this.add.text(
            400, 550, 
            'Place your bets and start the race!', 
            { font: '16px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Connect to WebSocket for saloon-specific updates
        this.connectWebSocket();
    }
    
    setupRaceTrack() {
        // Create race tracks (one for each suit)
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const trackY = [200, 250, 300, 350];
        
        suits.forEach((suit, index) => {
            // Create track line
            this.add.line(0, 0, 100, trackY[index], 700, trackY[index], 0xffffff, 0.5).setOrigin(0);
            
            // Add suit name
            this.add.text(50, trackY[index] - 10, suit.toUpperCase(), { font: '16px Arial', fill: '#ffffff' }).setOrigin(0);
            
            // Add card sprite (starting position)
            const card = this.add.image(100, trackY[index], `card-${suit}`);
            card.setScale(0.5);
            card.name = suit;
        });
        
        // Add race control buttons
        this.startButton = this.add.text(
            400, 450, 
            'Start Race', 
            { 
                font: '18px Arial', 
                fill: '#ffffff',
                backgroundColor: '#006400',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setInteractive();
        
        this.startButton.on('pointerdown', () => {
            this.startRace();
        });
        
        // Add betting UI elements
        this.createBettingUI();
    }
    
    createBettingUI() {
        // For simplicity, this is just a placeholder
        // In the full implementation, this would have betting controls for each suit
        this.add.text(400, 100, "Saloon Racing - Place Your Bets", { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5);
    }
    
    startRace() {
        this.showNotification('Race started!');
        
        // Disable start button during race
        this.startButton.disableInteractive();
        this.startButton.setAlpha(0.5);
        
        // Get all card sprites
        const cards = this.children.list.filter(child => 
            child.type === 'Image' && 
            child.name && 
            ['hearts', 'diamonds', 'clubs', 'spades'].includes(child.name)
        );
        
        // Animate cards along track at random speeds
        cards.forEach(card => {
            const duration = Phaser.Math.Between(3000, 7000);
            this.tweens.add({
                targets: card,
                x: 700,
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    this.finishRace(card.name);
                }
            });
        });
    }
    
    finishRace(winner) {
        this.showNotification(`${winner.toUpperCase()} wins the race!`);
        
        // Re-enable start button for next race
        this.startButton.setInteractive();
        this.startButton.setAlpha(1);
        
        // Reset cards for next race
        const cards = this.children.list.filter(child => 
            child.type === 'Image' && 
            child.name && 
            ['hearts', 'diamonds', 'clubs', 'spades'].includes(child.name)
        );
        
        cards.forEach(card => {
            this.tweens.add({
                targets: card,
                x: 100,
                duration: 1000,
                ease: 'Linear'
            });
        });
    }
    
    returnToTown() {
        this.scene.start('MainScene');
    }
    
    // Show notification message
    showNotification(message, type = 'info') {
        // Create text notification in-game
        const notification = this.add.text(
            400, 150, 
            message, 
            { 
                font: '18px Arial', 
                fill: type === 'error' ? '#ff0000' : '#ffffff', 
                backgroundColor: type === 'error' ? '#330000' : '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);
        
        // Fade out and destroy after delay
        this.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 3000,
            delay: 2000,
            onComplete: () => {
                notification.destroy();
            }
        });
    }
    
    // Connect to WebSocket server
    connectWebSocket() {
        // Determine the correct WebSocket protocol based on page protocol
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.addEventListener('open', (event) => {
            console.log('Connected to WebSocket server from SaloonScene');
            
            // Send initial scene data
            this.socket.send(JSON.stringify({
                type: 'scene_init',
                scene: 'SaloonScene',
                timestamp: Date.now()
            }));
        });
        
        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message in SaloonScene:', data);
                
                // Handle specific scene messages
                if (data.type === 'race_result' && data.winner) {
                    this.showNotification(`Server result: ${data.winner} wins!`);
                }
            } catch (err) {
                console.error('Error parsing WebSocket message in SaloonScene:', err);
            }
        });
    }
}

// EtherScene - Night mode with crystal gathering and potion crafting
class EtherScene extends Phaser.Scene {
    constructor() {
        super('EtherScene');
        this.character = null;
        this.crystalNodes = null;
        this.cauldron = null;
    }
    
    preload() {
        // Load ether range assets
        this.load.svg('ether-bg', 'img/ether-bg.svg');
        this.load.svg('character', 'img/character.svg');
        this.load.svg('crystal-node', 'img/crystal-node.svg');
        this.load.svg('cauldron', 'img/cauldron.svg');
    }
    
    create() {
        // Add ether background
        this.add.image(400, 300, 'ether-bg');
        
        // Add return button
        const returnButton = this.add.text(
            50, 50, 
            'Return to Town', 
            { 
                font: '16px Arial', 
                fill: '#ffffff',
                backgroundColor: '#aa33aa',
                padding: { x: 10, y: 5 }
            }
        ).setInteractive();
        
        returnButton.on('pointerdown', () => {
            this.returnToTown();
        });
        
        // Add character
        this.character = this.physics.add.sprite(400, 300, 'character');
        this.character.setScale(0.8);
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
        
        // Add instructions
        this.instructionsText = this.add.text(
            400, 550, 
            'Collect crystals to brew potions in the cauldron', 
            { font: '16px Arial', fill: '#ffffff' }
        ).setOrigin(0.5);
        
        // Display initial notification
        this.showNotification('Welcome to the Ether Range!');
        
        // Connect to WebSocket
        this.connectWebSocket();
    }
    
    update() {
        // Handle character movement
        this.handleMovement();
    }
    
    setupCrystalNodes() {
        // Create group for crystal nodes
        this.crystalNodes = this.physics.add.group();
        
        // Add crystal nodes at various positions
        this.addCrystalNode(200, 200);
        this.addCrystalNode(600, 200);
        this.addCrystalNode(300, 400);
        this.addCrystalNode(500, 400);
        
        // Set up collision with character
        this.physics.add.overlap(
            this.character,
            this.crystalNodes,
            this.collectCrystal,
            null,
            this
        );
    }
    
    addCrystalNode(x, y) {
        const crystal = this.crystalNodes.create(x, y, 'crystal-node');
        crystal.setScale(0.5);
        
        // Add pulsing effect
        this.tweens.add({
            targets: crystal,
            scale: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        return crystal;
    }
    
    setupCauldron() {
        // Add cauldron for brewing potions
        this.cauldron = this.physics.add.image(400, 300, 'cauldron');
        this.cauldron.setScale(0.8);
        this.cauldron.setImmovable(true);
        
        // Set up collision with character
        this.physics.add.overlap(
            this.character,
            this.cauldron,
            this.interactWithCauldron,
            null,
            this
        );
    }
    
    handleMovement() {
        // Reset velocity
        this.character.setVelocity(0);
        
        // Movement speed
        const speed = 160;
        
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
    
    collectCrystal(character, crystal) {
        // Collect the crystal
        crystal.disableBody(true, true);
        
        // Show notification
        this.showNotification('Crystal collected!');
        
        // Update game state
        if (window.gameState) {
            window.gameState.player.crystals += 1;
            
            // Send update to server via WebSocket
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'resource_update',
                    resource: 'crystals',
                    amount: 1,
                    operation: 'add'
                }));
            }
        }
        
        // Respawn crystal after delay
        this.time.addEvent({
            delay: 10000, // 10 seconds
            callback: () => {
                crystal.enableBody(true, crystal.x, crystal.y, true, true);
            },
            callbackScope: this
        });
    }
    
    interactWithCauldron(character, cauldron) {
        // Only interact if we have crystals
        if (window.gameState && window.gameState.player.crystals > 0) {
            // Show brewing animation
            this.showNotification('Brewing potion...');
            
            // Create brewing effect
            const particles = this.add.particles('crystal-node');
            const emitter = particles.createEmitter({
                speed: 100,
                scale: { start: 0.2, end: 0 },
                blendMode: 'ADD',
                lifespan: 1000
            });
            
            emitter.startFollow(cauldron);
            
            // After delay, complete brewing
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    // Stop particles
                    emitter.stop();
                    
                    // Update game state
                    window.gameState.player.crystals -= 1;
                    window.gameState.player.potions += 1;
                    
                    // Show success notification
                    this.showNotification('Potion brewed successfully!');
                    
                    // Send update to server via WebSocket
                    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                        this.socket.send(JSON.stringify({
                            type: 'brewing_complete',
                            crystals_used: 1,
                            potions_created: 1
                        }));
                    }
                },
                callbackScope: this
            });
        } else {
            this.showNotification('You need crystals to brew potions!', 'error');
        }
    }
    
    returnToTown() {
        this.scene.start('MainScene');
    }
    
    // Show notification message
    showNotification(message, type = 'info') {
        // Create text notification in-game
        const notification = this.add.text(
            400, 100, 
            message, 
            { 
                font: '18px Arial', 
                fill: type === 'error' ? '#ff0000' : '#ffffff', 
                backgroundColor: type === 'error' ? '#330000' : '#333333',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);
        
        // Fade out and destroy after delay
        this.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 3000,
            delay: 2000,
            onComplete: () => {
                notification.destroy();
            }
        });
    }
    
    // Connect to WebSocket server
    connectWebSocket() {
        // Determine the correct WebSocket protocol based on page protocol
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.addEventListener('open', (event) => {
            console.log('Connected to WebSocket server from EtherScene');
            
            // Send initial scene data
            this.socket.send(JSON.stringify({
                type: 'scene_init',
                scene: 'EtherScene',
                timestamp: Date.now()
            }));
        });
        
        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message in EtherScene:', data);
                
                // Handle specific scene messages
                if (data.type === 'resource_update') {
                    this.showNotification(`Resource updated: ${data.resource}`);
                }
            } catch (err) {
                console.error('Error parsing WebSocket message in EtherScene:', err);
            }
        });
    }
}