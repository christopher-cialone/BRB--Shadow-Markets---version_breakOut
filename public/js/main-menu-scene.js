/**
 * Main Menu Scene
 * This module contains the Phaser scene for the main menu
 */

// Define the MainMenuScene class globally
window.MainMenuScene = class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
        this.backgroundImage = null;
        this.logo = null;
        this.startButton = null;
    }
    
    preload() {
        // Preload assets (background, logo, etc.)
        this.load.image('menu-bg', 'img/game-background.jpeg');
        this.load.image('logo', 'img/brb-logo.png');
    }
    
    create() {
        // Create background
        this.backgroundImage = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'menu-bg'
        );
        
        // Scale to fit screen
        const scaleX = this.cameras.main.width / this.backgroundImage.width;
        const scaleY = this.cameras.main.height / this.backgroundImage.height;
        const scale = Math.max(scaleX, scaleY);
        this.backgroundImage.setScale(scale).setScrollFactor(0);
        
        // Add logo
        this.logo = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 4,
            'logo'
        );
        this.logo.setScale(0.2);
        
        // Add title text
        const titleText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2 - 50,
            'Bull Run Boost',
            {
                fontFamily: 'Georgia, "serif"',
                fontSize: '40px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add subtitle
        const subtitleText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2,
            'Shadow Markets of the Cyber-West',
            {
                fontFamily: 'Georgia, "serif"',
                fontSize: '24px',
                color: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create an invisible button that, when clicked, switches to the Ranch scene
        // This will work alongside the UI button, giving us redundancy
        const buttonWidth = 200;
        const buttonHeight = 60;
        const startButtonX = this.cameras.main.width / 2;
        const startButtonY = this.cameras.main.height / 2 + 100;
        
        // Add a visual button (uses Phaser graphics)
        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0x7733bb, 1);
        buttonGraphics.fillRoundedRect(startButtonX - buttonWidth/2, startButtonY - buttonHeight/2, buttonWidth, buttonHeight, 15);
        
        // Add button text
        const buttonText = this.add.text(
            startButtonX, 
            startButtonY,
            'Start Game',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Make button interactive
        const hitArea = new Phaser.Geom.Rectangle(startButtonX - buttonWidth/2, startButtonY - buttonHeight/2, buttonWidth, buttonHeight);
        const hitAreaCallback = Phaser.Geom.Rectangle.Contains;
        
        this.startButton = this.add.zone(
            startButtonX - buttonWidth/2, 
            startButtonY - buttonHeight/2,
            buttonWidth,
            buttonHeight
        ).setInteractive(hitArea, hitAreaCallback);
        
        this.startButton.on('pointerover', () => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(0x9955dd, 1);
            buttonGraphics.fillRoundedRect(startButtonX - buttonWidth/2, startButtonY - buttonHeight/2, buttonWidth, buttonHeight, 15);
            this.input.setDefaultCursor('pointer');
        });
        
        this.startButton.on('pointerout', () => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(0x7733bb, 1);
            buttonGraphics.fillRoundedRect(startButtonX - buttonWidth/2, startButtonY - buttonHeight/2, buttonWidth, buttonHeight, 15);
            this.input.setDefaultCursor('default');
        });
        
        this.startButton.on('pointerdown', () => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(0x552299, 1);
            buttonGraphics.fillRoundedRect(startButtonX - buttonWidth/2, startButtonY - buttonHeight/2, buttonWidth, buttonHeight, 15);
        });
        
        this.startButton.on('pointerup', () => {
            // Call the startGame method
            this.startGame();
        });
        
        // Add pulse animation to the button
        this.tweens.add({
            targets: [buttonGraphics, buttonText],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    startGame() {
        // Switch to Ranch scene
        if (typeof switchScene === 'function') {
            switchScene('ranch');
        } else {
            console.log("switchScene function not found");
            // Fallback to direct scene switching
            this.scene.start('RanchScene');
        }
    }
    
    resize(gameSize) {
        // Handle resize events
        if (!gameSize) return;
        
        if (this.backgroundImage) {
            this.backgroundImage.setPosition(gameSize.width / 2, gameSize.height / 2);
            
            // Scale to fit screen
            const scaleX = gameSize.width / this.backgroundImage.width;
            const scaleY = gameSize.height / this.backgroundImage.height;
            const scale = Math.max(scaleX, scaleY);
            this.backgroundImage.setScale(scale);
        }
        
        if (this.logo) {
            this.logo.setPosition(gameSize.width / 2, gameSize.height / 4);
        }
    }
};

console.log("MainMenuScene initialized");