/**
 * Saloon Scene Fixed
 * Improved implementation of the SaloonScene class in Phaser
 */

class SaloonSceneFixed extends Phaser.Scene {
    constructor() {
        super('SaloonScene');
        
        // Racing game data
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
        
        // Track card textures
        this.cardTextures = {};
    }
    
    preload() {
        console.log('Preloading SaloonScene assets');
        
        // Load background and card assets
        this.load.image('saloon-bg', 'img/game-background.jpeg');
        
        // Load card images or create them dynamically if they don't exist
        try {
            this.createCardTextures();
        } catch (error) {
            console.error("Error creating card textures:", error);
        }
    }
    
    /**
     * Create card textures programmatically for fallback
     */
    createCardTextures() {
        console.log('Creating card textures programmatically');
        
        // Create a graphics object for drawing
        this.graphics = this.add.graphics();
        
        // Create card base texture (white rectangle with rounded corners)
        this.graphics.fillStyle(0xffffff);
        this.graphics.fillRoundedRect(0, 0, 120, 168, 10);
        this.graphics.lineStyle(2, 0x000000);
        this.graphics.strokeRoundedRect(0, 0, 120, 168, 10);
        this.graphics.generateTexture('card-base', 120, 168);
        this.graphics.clear();
        
        // Create heart symbol
        this.graphics.fillStyle(0xff0000);
        this.graphics.fillCircle(15, 15, 10);
        this.graphics.fillCircle(35, 15, 10);
        this.graphics.fillTriangle(5, 20, 45, 20, 25, 40);
        this.graphics.generateTexture('heart-symbol', 50, 50);
        this.graphics.clear();
        
        // Create diamond symbol
        this.graphics.fillStyle(0xff0000);
        this.graphics.fillTriangle(25, 5, 5, 25, 25, 45, 45, 25);
        this.graphics.generateTexture('diamond-symbol', 50, 50);
        this.graphics.clear();
        
        // Create spade symbol
        this.graphics.fillStyle(0x000000);
        this.graphics.fillCircle(15, 25, 10);
        this.graphics.fillCircle(35, 25, 10);
        this.graphics.fillTriangle(5, 20, 45, 20, 25, 0);
        this.graphics.fillRect(20, 35, 10, 15);
        this.graphics.generateTexture('spade-symbol', 50, 50);
        this.graphics.clear();
        
        // Create club symbol
        this.graphics.fillStyle(0x000000);
        this.graphics.fillCircle(15, 15, 10);
        this.graphics.fillCircle(35, 15, 10);
        this.graphics.fillCircle(25, 30, 10);
        this.graphics.fillRect(20, 35, 10, 15);
        this.graphics.generateTexture('club-symbol', 50, 50);
        this.graphics.clear();
        
        console.log('Card textures created successfully');
    }
    
    create() {
        console.log('Creating SaloonScene');
        
        // Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Set up background with warm saloon lighting
        this.bg = this.add.image(width/2, height/2, 'saloon-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0xddbb88); // Warm indoor lighting tint
        
        // Create container for racing elements
        this.raceContainer = this.add.container(0, 0);
        
        // Add poker table background (for cards)
        const tableGraphics = this.add.graphics();
        tableGraphics.fillStyle(0x331100, 0.6);
        tableGraphics.fillRoundedRect(width/2 - 200, height/2 - 120, 400, 240, 20);
        this.raceContainer.add(tableGraphics);
        
        // Add a title for the table
        const tableTitle = this.add.text(width/2, height/2 - 160, 'BULL RUN RACES', {
            fontFamily: 'Anta, Arial',
            fontSize: '24px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            shadow: { blur: 5, color: '#000', fill: true }
        }).setOrigin(0.5);
        this.raceContainer.add(tableTitle);
        
        // Register this scene with the racing game module
        if (window.racingGame && typeof window.racingGame.setPhaserScene === 'function') {
            window.racingGame.setPhaserScene(this);
            
            // Initialize the racing game if needed
            if (typeof window.racingGame.init === 'function') {
                setTimeout(() => {
                    console.log("Initializing racing game from SaloonScene");
                    window.racingGame.init();
                    
                    // Dispatch scene change event
                    const event = new CustomEvent('scene-changed', {
                        detail: { scene: 'saloon' }
                    });
                    document.dispatchEvent(event);
                }, 100);
            }
        }
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
        
        console.log('SaloonScene created successfully');
    }
    
    /**
     * Update the card display with a new card
     * This is called by the racing game module
     */
    updateCardDisplay(card) {
        if (!card) return;
        
        console.log('Updating card display in Phaser:', card);
        this.raceData.currentCard = card;
        
        // Clear existing card sprite
        if (this.currentCardSprite) {
            this.currentCardSprite.destroy();
        }
        
        // Create new card sprite
        const width = this.scale.width;
        const height = this.scale.height;
        
        try {
            // Create a container for the card
            const cardGroup = this.add.container(width/2, height/2 - 40);
            
            // Add card base
            const cardBase = this.add.image(0, 0, 'card-base');
            cardGroup.add(cardBase);
            
            // Map suit symbols to textures and colors
            const suitMap = {
                '♥': { texture: 'heart-symbol', color: 0xff0000 },
                '♦': { texture: 'diamond-symbol', color: 0xff0000 },
                '♠': { texture: 'spade-symbol', color: 0x000000 },
                '♣': { texture: 'club-symbol', color: 0x000000 }
            };
            
            // Get suit info with fallback
            const suitInfo = suitMap[card.suit] || { texture: 'heart-symbol', color: 0xff0000 };
            
            // Add central suit symbol
            const suitSymbol = this.add.image(0, 0, suitInfo.texture);
            suitSymbol.setScale(1.5);
            cardGroup.add(suitSymbol);
            
            // Add rank text with proper color
            const rankStyle = {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: suitInfo.color === 0xff0000 ? '#ff0000' : '#000000',
                fontStyle: 'bold'
            };
            
            // Add rank at top-left and bottom-right (inverted)
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
            
            // Animation effect - card appears with a bounce
            this.tweens.add({
                targets: cardGroup,
                y: { from: height/2 - 100, to: height/2 - 40 },
                scaleX: { from: 0.8, to: 1 },
                scaleY: { from: 0.8, to: 1 },
                duration: 300,
                ease: 'Bounce.out'
            });
            
            console.log('Card created and animated in Phaser');
            
        } catch (error) {
            console.error("Error creating card display in Phaser:", error);
        }
    }
    
    /**
     * Update race progress bars
     * This is called by the racing game module
     */
    updateRaceProgress(progress) {
        if (!progress) return;
        
        console.log('Updating race progress in Phaser:', progress);
        this.raceData.progress = progress;
        
        // We could add visual race progress here in Phaser
        // For now, we'll rely on the DOM progress bars
    }
    
    /**
     * Handle resize events
     */
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        console.log(`Resizing SaloonScene to ${width}x${height}`);
        
        // Resize background
        if (this.bg) {
            this.bg.setPosition(width/2, height/2);
            this.bg.setDisplaySize(width, height);
        }
        
        // Reposition table
        if (this.raceContainer) {
            // Currently not needed as the container is at 0,0
            // and child positions are relative to the scene dimensions
        }
        
        // Reposition card if it exists
        if (this.currentCardSprite) {
            this.currentCardSprite.setPosition(width/2, height/2 - 40);
        }
    }
}

// Register the scene class globally for access in other files
window.SaloonSceneFixed = SaloonSceneFixed;