// RanchScene - A Phaser scene for walking around the Ranch
class RanchScene extends Phaser.Scene {
    constructor() {
        super('RanchScene');
        
        // Player character
        this.player = null;
        this.playerSpeed = 160;
        
        // Input
        this.cursors = null;
        this.spaceKey = null;
        
        // Interaction zones
        this.interactionZones = [];
        this.activeZone = null;
        
        // UI elements
        this.interactionPrompt = null;
        
        // Grid configuration for interaction points
        this.gridConfig = {
            width: 80,
            height: 80,
            cols: 10,
            rows: 8
        };
    }
    
    preload() {
        // Load assets specific to ranch scene
        this.load.image('ranch-background', 'img/game-background.jpeg');
        this.load.image('barn', 'img/barn.png');
        this.load.image('crop-field', 'img/field-empty.png');
        this.load.image('water-trough', 'img/water-trough.png');
        this.load.image('hay-storage', 'img/hay-storage.png');
        this.load.image('character', 'img/character.png');
        
        // Fallback handler for missing assets
        this.load.on('filecomplete', (key) => {
            console.log(`Successfully loaded: ${key}`);
        });
        
        this.load.on('loaderror', (file) => {
            console.error(`Failed to load: ${file.key}`);
            this.createPlaceholderAsset(file.key);
        });
    }
    
    create() {
        // Set up background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.background = this.add.image(width/2, height/2, 'ranch-background');
        this.background.setDisplaySize(width, height);
        
        // Create physics-enabled buildings and interaction points
        this.createBuildingsAndInteractionPoints();
        
        // Create player character
        this.createPlayer();
        
        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Interaction prompt (hidden by default)
        this.interactionPrompt = this.add.text(
            width/2, 
            height - 50,
            'Press SPACE to interact',
            { 
                fontFamily: 'Anta', 
                fontSize: '18px', 
                backgroundColor: '#00000088',
                padding: { x: 10, y: 5 }
            }
        );
        this.interactionPrompt.setOrigin(0.5);
        this.interactionPrompt.setDepth(1000);
        this.interactionPrompt.setVisible(false);
        
        // Set up physics collisions
        this.physics.add.collider(this.player, this.buildings);
        
        // Add camera that follows the player
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.2);
        
        // Listen for resize events
        this.scale.on('resize', this.resize, this);
        
        // Weather system with clouds
        this.createWeatherSystem();
        
        console.log("Ranch scene initialized with character movement");
    }
    
    update() {
        // Handle player movement
        this.handlePlayerMovement();
        
        // Check for interactions
        this.checkInteractions();
        
        // Update weather effects
        this.updateWeather();
    }
    
    createBuildingsAndInteractionPoints() {
        // Create static group for buildings/obstacles
        this.buildings = this.physics.add.staticGroup();
        
        // Create Barn (main building)
        const barnX = this.gridToX(7);
        const barnY = this.gridToY(2);
        const barn = this.buildings.create(barnX, barnY, 'barn');
        barn.setScale(0.8);
        barn.body.setSize(barn.width * 0.6, barn.height * 0.6);
        
        // Create Crop Field (for crop management)
        const cropFieldX = this.gridToX(3);
        const cropFieldY = this.gridToY(4);
        const cropField = this.buildings.create(cropFieldX, cropFieldY, 'crop-field');
        cropField.setScale(1.2);
        
        // Create Water Trough
        const waterTroughX = this.gridToX(8);
        const waterTroughY = this.gridToY(5);
        const waterTrough = this.buildings.create(waterTroughX, waterTroughY, 'water-trough');
        waterTrough.setScale(0.7);
        
        // Create Hay Storage
        const hayStorageX = this.gridToX(2);
        const hayStorageY = this.gridToY(6);
        const hayStorage = this.buildings.create(hayStorageX, hayStorageY, 'hay-storage');
        hayStorage.setScale(0.7);
        
        // Create interaction zones around key points
        this.createInteractionZones();
    }
    
    createInteractionZones() {
        // Define interaction zones - these don't block movement but detect overlaps
        
        // Crop field interaction zone
        const cropZone = this.createInteractionZone(
            this.gridToX(3), 
            this.gridToY(4), 
            160, 
            160, 
            'crop-management',
            'Manage Crops'
        );
        
        // Barn interaction zone
        const barnZone = this.createInteractionZone(
            this.gridToX(7), 
            this.gridToY(2.5), 
            200, 
            200, 
            'cattle-management',
            'Manage Cattle'
        );
        
        // Water interaction zone
        const waterZone = this.createInteractionZone(
            this.gridToX(8), 
            this.gridToY(5), 
            130, 
            130, 
            'water-collection',
            'Collect Water'
        );
        
        // Hay interaction zone
        const hayZone = this.createInteractionZone(
            this.gridToX(2), 
            this.gridToY(6), 
            130, 
            130, 
            'hay-collection',
            'Collect Hay'
        );
    }
    
    createInteractionZone(x, y, width, height, key, actionText) {
        // Create zone
        const zone = this.add.zone(x, y, width, height);
        
        // Add to physics system
        this.physics.world.enable(zone);
        zone.body.setAllowGravity(false);
        zone.body.moves = false;
        
        // Store additional data
        zone.setName(key);
        zone.setData('actionText', actionText);
        
        // Add overlap detection
        this.physics.add.overlap(
            this.player, 
            zone, 
            this.handleZoneOverlap, 
            null, 
            this
        );
        
        // Add to interaction zones array
        this.interactionZones.push(zone);
        
        // Add visual indicator (debug only)
        if (this.game.config.physics.arcade.debug) {
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0x00ff00, 0.5);
            graphics.strokeRect(
                x - width/2,
                y - height/2,
                width,
                height
            );
            zone.setData('debugGraphics', graphics);
        }
        
        return zone;
    }
    
    createPlayer() {
        // Create player at starting position
        this.player = this.physics.add.sprite(
            this.gridToX(5), 
            this.gridToY(5), 
            'character'
        );
        
        // Set up physics body
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(this.player.width * 0.7, this.player.height * 0.7);
        this.player.setScale(0.6);
        
        // Set depth to ensure player is above background, below UI
        this.player.setDepth(10);
    }
    
    createWeatherSystem() {
        // Create cloud sprites
        this.clouds = [];
        
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(50, 200);
            const size = Phaser.Math.Between(0.5, 1.5);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.7);
            const speed = Phaser.Math.FloatBetween(0.2, 0.8);
            
            // Use graphics for clouds if no texture available
            let cloud;
            if (this.textures.exists('cloud')) {
                cloud = this.add.image(x, y, 'cloud');
                cloud.setScale(size);
            } else {
                // Create a cloud shape with graphics
                const graphics = this.add.graphics();
                graphics.fillStyle(0xFFFFFF, alpha);
                
                // Draw a cloud shape
                graphics.fillCircle(0, 0, 30);
                graphics.fillCircle(-25, 10, 25);
                graphics.fillCircle(25, 10, 25);
                graphics.fillCircle(-10, -15, 20);
                graphics.fillCircle(15, -12, 22);
                
                // Generate a texture
                graphics.generateTexture('cloud-' + i, 100, 60);
                graphics.destroy();
                
                // Create cloud sprite with the new texture
                cloud = this.add.image(x, y, 'cloud-' + i);
                cloud.setScale(size);
            }
            
            // Set properties
            cloud.setAlpha(alpha);
            cloud.setData('speed', speed);
            cloud.setScrollFactor(0.2); // Parallax effect
            cloud.setDepth(5);
            
            this.clouds.push(cloud);
        }
        
        // Weather state (changes over time)
        this.weatherState = {
            current: 'sunny', // sunny, cloudy, rainy
            transitionTimer: null,
            rainParticles: null
        };
        
        // Schedule first weather change
        this.weatherState.transitionTimer = this.time.addEvent({
            delay: Phaser.Math.Between(30000, 60000), // 30-60 seconds
            callback: this.changeWeather,
            callbackScope: this
        });
    }
    
    updateWeather() {
        // Move clouds
        for (const cloud of this.clouds) {
            cloud.x += cloud.getData('speed');
            
            // Wrap clouds around the screen
            if (cloud.x > this.cameras.main.width + 100) {
                cloud.x = -100;
                cloud.y = Phaser.Math.Between(50, 200);
            }
        }
        
        // Update rain if active
        if (this.weatherState.current === 'rainy' && this.weatherState.rainParticles) {
            // The particle system handles updates automatically
        }
    }
    
    changeWeather() {
        // Change weather state
        const weathers = ['sunny', 'cloudy', 'rainy'];
        let newWeather;
        
        do {
            newWeather = Phaser.Utils.Array.GetRandom(weathers);
        } while (newWeather === this.weatherState.current);
        
        this.weatherState.current = newWeather;
        console.log(`Weather changed to: ${this.weatherState.current}`);
        
        // Update visuals based on weather
        switch (this.weatherState.current) {
            case 'sunny':
                // Clear sky, bright lighting
                this.tweens.add({
                    targets: this.clouds,
                    alpha: 0.4,
                    duration: 2000
                });
                
                // Stop rain if it exists
                if (this.weatherState.rainParticles) {
                    this.weatherState.rainParticles.stop();
                }
                break;
                
            case 'cloudy':
                // More visible clouds
                this.tweens.add({
                    targets: this.clouds,
                    alpha: 0.8,
                    duration: 2000
                });
                
                // Stop rain if it exists
                if (this.weatherState.rainParticles) {
                    this.weatherState.rainParticles.stop();
                }
                break;
                
            case 'rainy':
                // Dark clouds and rain
                this.tweens.add({
                    targets: this.clouds,
                    alpha: 0.9,
                    duration: 1000
                });
                
                // Create rain particles if they don't exist
                if (!this.weatherState.rainParticles) {
                    this.weatherState.rainParticles = this.add.particles('water-drop');
                    
                    this.weatherState.rainParticles.createEmitter({
                        x: { min: 0, max: this.cameras.main.width },
                        y: -50,
                        lifespan: 2000,
                        speedY: { min: 200, max: 400 },
                        scale: { start: 0.1, end: 0.2 },
                        quantity: 2,
                        blendMode: 'ADD',
                        frequency: 50,
                        alpha: { start: 0.5, end: 0 }
                    });
                    
                    this.weatherState.rainParticles.setDepth(20);
                    this.weatherState.rainParticles.setScrollFactor(0.3);
                } else {
                    // Resume existing particles
                    this.weatherState.rainParticles.resume();
                }
                break;
        }
        
        // Update global game state with current weather
        if (typeof window.playerData !== 'undefined') {
            window.playerData.weather = this.weatherState.current;
        }
        
        // Schedule next weather change
        this.weatherState.transitionTimer = this.time.addEvent({
            delay: Phaser.Math.Between(45000, 90000), // 45-90 seconds
            callback: this.changeWeather,
            callbackScope: this
        });
    }
    
    handlePlayerMovement() {
        // Reset velocity
        this.player.setVelocity(0);
        
        // Handle keyboard input
        const speed = this.playerSpeed;
        
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.flipX = false;
        }
        
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
        
        // Diagonal movement should not be faster
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            const factor = 1 / Math.sqrt(2);
            this.player.body.velocity.x *= factor;
            this.player.body.velocity.y *= factor;
        }
    }
    
    handleZoneOverlap(player, zone) {
        // Set the active zone
        this.activeZone = zone;
        
        // Show interaction prompt with specific text
        this.interactionPrompt.setText(`Press SPACE to ${zone.getData('actionText')}`);
        this.interactionPrompt.setVisible(true);
        
        // Position the prompt above the player
        this.interactionPrompt.x = player.x;
        this.interactionPrompt.y = player.y - 50;
    }
    
    checkInteractions() {
        // Hide interaction prompt by default
        this.interactionPrompt.setVisible(false);
        
        // Check for space key press when in an active zone
        if (this.activeZone && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.handleInteraction(this.activeZone.name);
        }
        
        // Reset active zone
        this.activeZone = null;
    }
    
    handleInteraction(zoneType) {
        console.log(`Interacting with: ${zoneType}`);
        
        // Handle different interaction types
        switch (zoneType) {
            case 'crop-management':
                // Switch to crop management UI
                this.showCropManagementUI();
                break;
                
            case 'cattle-management':
                // Switch to cattle management UI
                this.showCattleManagementUI();
                break;
                
            case 'water-collection':
                // Collect water
                this.collectWater();
                break;
                
            case 'hay-collection':
                // Collect hay
                this.collectHay();
                break;
        }
    }
    
    // UI Management functions
    showCropManagementUI() {
        // Hide Phaser scene temporarily (keep running in background)
        this.scene.pause();
        
        // Show the crop management UI in the DOM
        if (typeof window.switchToCropUI === 'function') {
            window.switchToCropUI();
        } else {
            // Manual switching
            document.getElementById('crop-management-ui').classList.remove('hidden');
            document.getElementById('phaser-ranch-scene').classList.add('blurred');
        }
        
        // Setup a listener to resume the scene when UI is closed
        const resumeScene = () => {
            this.scene.resume();
            document.getElementById('crop-management-ui').classList.add('hidden');
            document.getElementById('phaser-ranch-scene').classList.remove('blurred');
            document.removeEventListener('cropUIclosed', resumeScene);
        };
        
        document.addEventListener('cropUIclosed', resumeScene);
    }
    
    showCattleManagementUI() {
        // Hide Phaser scene temporarily (keep running in background)
        this.scene.pause();
        
        // Show the cattle management UI in the DOM
        if (typeof window.switchToCattleUI === 'function') {
            window.switchToCattleUI();
        } else {
            // Manual switching
            document.getElementById('cattle-management-ui').classList.remove('hidden');
            document.getElementById('phaser-ranch-scene').classList.add('blurred');
        }
        
        // Setup a listener to resume the scene when UI is closed
        const resumeScene = () => {
            this.scene.resume();
            document.getElementById('cattle-management-ui').classList.add('hidden');
            document.getElementById('phaser-ranch-scene').classList.remove('blurred');
            document.removeEventListener('cattleUIclosed', resumeScene);
        };
        
        document.addEventListener('cattleUIclosed', resumeScene);
    }
    
    collectWater() {
        // Animation for collecting water
        this.createCollectionAnimation(
            this.player.x, 
            this.player.y - 50, 
            'water-drop',
            '+10 Water'
        );
        
        // Update player data
        if (typeof window.playerData !== 'undefined') {
            window.playerData.water += 10;
            
            // Update UI if display function exists
            if (typeof window.updateResourceDisplays === 'function') {
                window.updateResourceDisplays();
            }
        }
    }
    
    collectHay() {
        // Animation for collecting hay
        this.createCollectionAnimation(
            this.player.x, 
            this.player.y - 50, 
            'hay-icon', 
            '+10 Hay'
        );
        
        // Update player data
        if (typeof window.playerData !== 'undefined') {
            window.playerData.hay += 10;
            
            // Update UI if display function exists
            if (typeof window.updateResourceDisplays === 'function') {
                window.updateResourceDisplays();
            }
        }
    }
    
    createCollectionAnimation(x, y, iconKey, text) {
        // Create a container for the animation elements
        const container = this.add.container(x, y);
        container.setDepth(100);
        
        // Add icon and text
        const icon = this.add.image(0, 0, iconKey);
        icon.setScale(0.5);
        
        const label = this.add.text(20, 0, text, {
            fontFamily: 'Anta',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        label.setOrigin(0, 0.5);
        
        container.add([icon, label]);
        
        // Animate
        this.tweens.add({
            targets: container,
            y: y - 80,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            ease: 'Cubic.Out',
            onComplete: () => {
                container.destroy();
            }
        });
    }
    
    // Helper functions
    gridToX(col) {
        return col * this.gridConfig.width;
    }
    
    gridToY(row) {
        return row * this.gridConfig.height;
    }
    
    resize(gameSize) {
        // Resize background to fit new dimensions
        const width = gameSize.width;
        const height = gameSize.height;
        
        if (this.background) {
            this.background.setDisplaySize(width, height);
            this.background.setPosition(width/2, height/2);
        }
        
        // Adjust camera bounds
        this.physics.world.setBounds(0, 0, width, height);
        
        // Reposition prompt if needed
        if (this.interactionPrompt && this.player) {
            this.interactionPrompt.x = this.player.x;
            this.interactionPrompt.y = this.player.y - 50;
        }
    }
    
    createPlaceholderAsset(key) {
        // Create placeholder graphics for missing assets
        const graphics = this.add.graphics();
        graphics.fillStyle(0x3a76c4, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(0, 0, 64, 64);
        graphics.lineBetween(0, 0, 64, 64);
        graphics.lineBetween(64, 0, 0, 64);
        
        // Generate texture from the graphics
        try {
            graphics.generateTexture(key, 64, 64);
            graphics.destroy();
            console.log(`Created placeholder for missing texture: ${key}`);
        } catch (e) {
            console.error(`Failed to create placeholder texture for ${key}:`, e);
        }
    }
}

// Register the scene if Phaser is available
if (typeof Phaser !== 'undefined') {
    console.log("Registering RanchScene class globally");
    window.RanchScene = RanchScene;
}