// NightScene - A Phaser scene for the Ether Range (Night) with character movement
class NightScene extends Phaser.Scene {
    constructor() {
        super('NightScene');
        
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
        
        // Visual effects
        this.glowEffects = [];
        this.shadowParticles = null;
        
        // Grid configuration for interaction points
        this.gridConfig = {
            width: 80,
            height: 80,
            cols: 10,
            rows: 8
        };
    }
    
    preload() {
        // Load assets specific to night scene
        this.load.image('night-background', 'img/ether-bg.jpeg');
        this.load.image('cauldron', 'img/cauldron.png');
        this.load.image('crystal-node', 'img/crystal-node.png');
        this.load.image('shadow-well', 'img/shadow-well.png');
        this.load.image('character', 'img/character.png');
        this.load.image('glow', 'img/glow.png');
        this.load.image('shadow-particle', 'img/shadow-particle.png');
        
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
        
        this.background = this.add.image(width/2, height/2, 'night-background');
        this.background.setDisplaySize(width, height);
        
        // Add purple/blue tint to create night atmosphere
        this.background.setTint(0x3a1c6e);
        
        // Create visual effects layer
        this.createVisualEffects();
        
        // Create physics-enabled interactive objects
        this.createInteractiveObjects();
        
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
        this.physics.add.collider(this.player, this.objects);
        
        // Add camera that follows the player
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.2);
        
        // Listen for resize events
        this.scale.on('resize', this.resize, this);
        
        console.log("Night scene initialized with character movement");
    }
    
    update() {
        // Handle player movement
        this.handlePlayerMovement();
        
        // Check for interactions
        this.checkInteractions();
        
        // Update visual effects
        this.updateVisualEffects();
    }
    
    createVisualEffects() {
        // Add a dark overlay with gradient
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create glowing effects for the scene
        for (let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(100, width - 100);
            const y = Phaser.Math.Between(100, height - 100);
            const scale = Phaser.Math.FloatBetween(0.5, 2);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
            
            const glow = this.add.image(x, y, 'glow');
            glow.setScale(scale);
            glow.setAlpha(alpha);
            glow.setBlendMode(Phaser.BlendModes.ADD);
            glow.setDepth(5);
            
            // Store original properties for animation
            glow.setData('originalScale', scale);
            glow.setData('originalAlpha', alpha);
            
            // Add pulsing animation
            this.tweens.add({
                targets: glow,
                scale: scale * 1.2,
                alpha: alpha * 1.5,
                duration: Phaser.Math.Between(1500, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.glowEffects.push(glow);
        }
        
        // Create shadow particles if texture exists
        if (this.textures.exists('shadow-particle')) {
            this.shadowParticles = this.add.particles('shadow-particle');
            
            this.shadowParticles.createEmitter({
                x: { min: 0, max: width },
                y: { min: 0, max: height },
                lifespan: 4000,
                speedX: { min: -20, max: 20 },
                speedY: { min: -20, max: 20 },
                scale: { start: 0.1, end: 0.05 },
                quantity: 1,
                frequency: 500,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 0.2, end: 0 },
                tint: 0x5522aa
            });
            
            this.shadowParticles.setDepth(3);
        }
    }
    
    createInteractiveObjects() {
        // Create static group for interactive objects
        this.objects = this.physics.add.staticGroup();
        
        // Create Cauldron (for potion brewing)
        const cauldronX = this.gridToX(3);
        const cauldronY = this.gridToY(3);
        const cauldron = this.objects.create(cauldronX, cauldronY, 'cauldron');
        cauldron.setScale(0.7);
        cauldron.setName('cauldron');
        cauldron.body.setSize(cauldron.width * 0.6, cauldron.height * 0.6);
        
        // Add glow effect to cauldron
        const cauldronGlow = this.add.image(cauldronX, cauldronY, 'glow');
        cauldronGlow.setScale(1.5);
        cauldronGlow.setAlpha(0.3);
        cauldronGlow.setBlendMode(Phaser.BlendModes.ADD);
        cauldronGlow.setTint(0x22aaff);
        cauldronGlow.setDepth(8);
        
        // Add pulsing animation to cauldron glow
        this.tweens.add({
            targets: cauldronGlow,
            scale: 1.8,
            alpha: 0.5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create Crystal Nodes (for gathering resources)
        for (let i = 0; i < 3; i++) {
            const x = this.gridToX(Phaser.Math.Between(1, 8));
            const y = this.gridToY(Phaser.Math.Between(1, 6));
            
            const crystal = this.objects.create(x, y, 'crystal-node');
            crystal.setScale(0.6);
            crystal.setName('crystal-' + i);
            crystal.body.setSize(crystal.width * 0.6, crystal.height * 0.6);
            
            // Add glow effect to crystal
            const crystalGlow = this.add.image(x, y, 'glow');
            crystalGlow.setScale(1);
            crystalGlow.setAlpha(0.2);
            crystalGlow.setBlendMode(Phaser.BlendModes.ADD);
            crystalGlow.setTint(0xaa22ff);
            crystalGlow.setDepth(8);
            
            // Link glow to crystal
            crystal.setData('glow', crystalGlow);
            
            // Add crystal-specific animation
            this.tweens.add({
                targets: crystalGlow,
                scale: 1.3,
                alpha: 0.4,
                duration: Phaser.Math.Between(1500, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Create Shadow Well (primary interaction point)
        const wellX = this.gridToX(7);
        const wellY = this.gridToY(5);
        const well = this.objects.create(wellX, wellY, 'shadow-well');
        well.setScale(0.9);
        well.setName('shadow-well');
        well.body.setSize(well.width * 0.7, well.height * 0.7);
        
        // Add intense glow effect to well
        const wellGlow = this.add.image(wellX, wellY, 'glow');
        wellGlow.setScale(2);
        wellGlow.setAlpha(0.5);
        wellGlow.setBlendMode(Phaser.BlendModes.ADD);
        wellGlow.setTint(0xff22aa);
        wellGlow.setDepth(8);
        
        // Add pulsing animation to well glow
        this.tweens.add({
            targets: wellGlow,
            scale: 2.5,
            alpha: 0.7,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create interaction zones
        this.createInteractionZones();
    }
    
    createInteractionZones() {
        // Create interaction zones for all objects
        this.objects.getChildren().forEach(obj => {
            const zone = this.createInteractionZone(
                obj.x, 
                obj.y, 
                obj.width * 1.2, 
                obj.height * 1.2,
                obj.name,
                this.getActionTextForObject(obj.name)
            );
        });
    }
    
    getActionTextForObject(objectName) {
        if (objectName === 'cauldron') {
            return 'Brew Potions';
        } else if (objectName.startsWith('crystal')) {
            return 'Collect Crystals';
        } else if (objectName === 'shadow-well') {
            return 'Access Shadow Market';
        } else {
            return 'Interact';
        }
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
        
        // Add a subtle glow to the player (night light)
        const playerGlow = this.add.image(
            this.player.x,
            this.player.y,
            'glow'
        );
        playerGlow.setScale(1);
        playerGlow.setAlpha(0.3);
        playerGlow.setBlendMode(Phaser.BlendModes.ADD);
        playerGlow.setTint(0x44aaff);
        playerGlow.setDepth(9);
        
        // Store reference to glow
        this.player.setData('glow', playerGlow);
        
        // Set depth to ensure player is above background, below UI
        this.player.setDepth(10);
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
        
        // Update player glow position
        const playerGlow = this.player.getData('glow');
        if (playerGlow) {
            playerGlow.x = this.player.x;
            playerGlow.y = this.player.y;
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
        if (zoneType === 'cauldron') {
            this.showPotionBrewingUI();
        } else if (zoneType.startsWith('crystal')) {
            this.collectCrystals(zoneType);
        } else if (zoneType === 'shadow-well') {
            this.showShadowMarketUI();
        }
    }
    
    updateVisualEffects() {
        // Update visual effects if needed
        const time = this.time.now;
        
        // Update glowing effects positions if needed
        
        // Update shadow particles if active
        if (this.shadowParticles) {
            // Particles update automatically
        }
    }
    
    // UI Management functions
    showPotionBrewingUI() {
        // Hide Phaser scene temporarily (keep running in background)
        this.scene.pause();
        
        // Show the potion brewing UI in the DOM
        if (typeof window.switchToPotionUI === 'function') {
            window.switchToPotionUI();
        } else {
            // Manual switching
            document.getElementById('potion-brewing-ui').classList.remove('hidden');
            document.getElementById('phaser-night-scene').classList.add('blurred');
        }
        
        // Setup a listener to resume the scene when UI is closed
        const resumeScene = () => {
            this.scene.resume();
            document.getElementById('potion-brewing-ui').classList.add('hidden');
            document.getElementById('phaser-night-scene').classList.remove('blurred');
            document.removeEventListener('potionUIclosed', resumeScene);
        };
        
        document.addEventListener('potionUIclosed', resumeScene);
    }
    
    showShadowMarketUI() {
        // Hide Phaser scene temporarily (keep running in background)
        this.scene.pause();
        
        // Show the shadow market UI in the DOM
        if (typeof window.switchToShadowMarketUI === 'function') {
            window.switchToShadowMarketUI();
        } else {
            // Manual switching
            document.getElementById('shadow-market-ui').classList.remove('hidden');
            document.getElementById('phaser-night-scene').classList.add('blurred');
        }
        
        // Setup a listener to resume the scene when UI is closed
        const resumeScene = () => {
            this.scene.resume();
            document.getElementById('shadow-market-ui').classList.add('hidden');
            document.getElementById('phaser-night-scene').classList.remove('blurred');
            document.removeEventListener('shadowMarketUIClosed', resumeScene);
        };
        
        document.addEventListener('shadowMarketUIClosed', resumeScene);
    }
    
    collectCrystals(crystalZoneId) {
        // Find the actual crystal object
        const crystalObjects = this.objects.getChildren().filter(obj => obj.name === crystalZoneId);
        
        if (crystalObjects.length > 0) {
            const crystal = crystalObjects[0];
            
            // Get amount (random between 3-8)
            const amount = Phaser.Math.Between(3, 8);
            
            // Create collection animation
            this.createCollectionAnimation(
                crystal.x, 
                crystal.y, 
                'crystal-node', 
                `+${amount} Crystals`
            );
            
            // Update player data
            if (typeof window.playerData !== 'undefined') {
                window.playerData.crystals = window.playerData.crystals || 0;
                window.playerData.crystals += amount;
                
                // Update UI if display function exists
                if (typeof window.updateResourceDisplays === 'function') {
                    window.updateResourceDisplays();
                }
            }
            
            // Make crystal temporarily unavailable
            crystal.setAlpha(0.3);
            const glow = crystal.getData('glow');
            if (glow) {
                glow.setAlpha(0.1);
            }
            
            // Re-enable after delay
            this.time.delayedCall(30000, () => {
                crystal.setAlpha(1);
                if (glow) {
                    glow.setAlpha(0.2);
                }
            });
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
    console.log("Registering NightScene class globally");
    window.NightScene = NightScene;
}