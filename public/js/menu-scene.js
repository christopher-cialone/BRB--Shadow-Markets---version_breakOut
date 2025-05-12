/**
 * Menu Scene
 * This fixes the main menu scene initialization
 */

// Create a proper class for the MainMenuScene
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }
    
    preload() {
        // Load assets
        this.load.image('menu-bg', 'img/game-background.jpeg');
        this.load.image('game-logo', 'img/brb-logo.png');
    }
    
    create() {
        // Get dimension references
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create background
        this.bg = this.add.image(width/2, height/2, 'menu-bg');
        this.bg.setDisplaySize(width, height);
        
        // Add title text with logo beside it
        const title = this.add.text(width/2, height/2 - 50, 'Bull Run Boost', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 10, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Add subtitle
        this.add.text(width/2, height/2, 'Shadow Markets of the Cyber-West', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ddddff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Create button
        const buttonBg = this.add.rectangle(width/2, height/2 + 100, 200, 60, 0x6622aa)
            .setStrokeStyle(4, 0xaa66ff)
            .setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(width/2, height/2 + 100, 'Start Game', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Add button effects
        buttonBg.on('pointerover', () => {
            buttonBg.fillColor = 0x7733bb;
            buttonText.setScale(1.1);
        });
        
        buttonBg.on('pointerout', () => {
            buttonBg.fillColor = 0x6622aa;
            buttonText.setScale(1.0);
        });
        
        buttonBg.on('pointerdown', () => {
            buttonBg.fillColor = 0x551199;
        });
        
        buttonBg.on('pointerup', () => {
            if (typeof switchScene === 'function') {
                switchScene('ranch');
            } else {
                console.log("Using direct scene switch");
                this.scene.start('RanchScene');
            }
        });
        
        // Add a pulse animation to the button
        this.tweens.add({
            targets: [buttonBg, buttonText],
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut'
        });
    }
}

// Register the class globally to fix errors
if (typeof window !== 'undefined') {
    console.log("Registering MainMenuScene class globally");
    window.MainMenuScene = MainMenuScene;
}

console.log("Menu scene initialized");