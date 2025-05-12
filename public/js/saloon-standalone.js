/**
 * Standalone Saloon Scene
 * A minimal Phaser scene for the saloon that works independently
 */
class SaloonStandalone extends Phaser.Scene {
    constructor() {
        super({ key: 'SaloonStandalone' });
        
        // Scene state
        this.cardSprite = null;
        this.raceTable = null;
        this.progressBars = {
            hearts: null,
            diamonds: null,
            clubs: null,
            spades: null
        };
    }
    
    preload() {
        // Create simple card textures if they don't exist
        this.createCardTextures();
    }
    
    create() {
        // Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create simple background
        this.add.rectangle(width/2, height/2, width, height, 0x331100);
        
        // Add table for cards
        this.raceTable = this.add.rectangle(width/2, height/2, 400, 240, 0x553311).setStrokeStyle(2, 0x221100);
        
        // Add title
        this.add.text(width/2, height/2 - 160, 'BULL RUN RACES', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Create progress bars
        this.createProgressBars();
        
        // Register for socket events
        if (window.socket) {
            // Card drawn event
            window.socket.on('card-drawn', data => {
                if (data && data.card) {
                    this.showCard(data.card);
                }
                
                if (data && data.progress) {
                    this.updateProgress(data.progress);
                }
            });
            
            // Race started event
            window.socket.on('race-started', data => {
                this.clearCard();
                if (data && data.progress) {
                    this.updateProgress(data.progress);
                }
            });
            
            // Race finished event
            window.socket.on('race-finished', data => {
                if (data && data.winner) {
                    this.highlightWinner(data.winner);
                }
            });
        } else {
            console.error("Socket not available in Phaser scene");
        }
        
        // Add resize handler
        this.scale.on('resize', this.resize, this);
    }
    
    // Create card textures programmatically
    createCardTextures() {
        // Create a graphics object for drawing
        const graphics = this.add.graphics();
        
        // Card base (white rectangle with rounded corners)
        graphics.fillStyle(0xffffff);
        graphics.fillRoundedRect(0, 0, 120, 168, 10);
        graphics.lineStyle(2, 0x000000);
        graphics.strokeRoundedRect(0, 0, 120, 168, 10);
        graphics.generateTexture('card-base', 120, 168);
        graphics.clear();
        
        // Hearts symbol (red)
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(15, 15, 10);
        graphics.fillCircle(35, 15, 10);
        graphics.fillTriangle(5, 20, 45, 20, 25, 40);
        graphics.generateTexture('heart-symbol', 50, 50);
        graphics.clear();
        
        // Diamonds symbol (red)
        graphics.fillStyle(0xff0000);
        graphics.fillTriangle(25, 5, 5, 25, 25, 45, 45, 25);
        graphics.generateTexture('diamond-symbol', 50, 50);
        graphics.clear();
        
        // Spades symbol (black)
        graphics.fillStyle(0x000000);
        graphics.fillCircle(15, 25, 10);
        graphics.fillCircle(35, 25, 10);
        graphics.fillTriangle(5, 20, 45, 20, 25, 0);
        graphics.fillRect(20, 35, 10, 15);
        graphics.generateTexture('spade-symbol', 50, 50);
        graphics.clear();
        
        // Clubs symbol (black)
        graphics.fillStyle(0x000000);
        graphics.fillCircle(15, 15, 10);
        graphics.fillCircle(35, 15, 10);
        graphics.fillCircle(25, 30, 10);
        graphics.fillRect(20, 35, 10, 15);
        graphics.generateTexture('club-symbol', 50, 50);
        graphics.clear();
    }
    
    // Create progress bars for each suit
    createProgressBars() {
        const width = this.scale.width;
        const height = this.scale.height;
        const barWidth = 300;
        const barHeight = 30;
        const startY = height/2 + 60;
        const spacing = 40;
        
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const colors = [0xff0000, 0xff6666, 0x444444, 0x000000];
        
        suits.forEach((suit, index) => {
            // Background (empty bar)
            const bgBar = this.add.rectangle(
                width/2, 
                startY + (index * spacing), 
                barWidth, 
                barHeight, 
                0x333333
            ).setOrigin(0.5);
            
            // Label
            this.add.text(
                width/2 - barWidth/2 - 10, 
                startY + (index * spacing),
                suit.charAt(0).toUpperCase() + suit.slice(1),
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: index < 2 ? '#ff0000' : '#000000' // Red for hearts/diamonds, black for clubs/spades
                }
            ).setOrigin(1, 0.5);
            
            // Progress bar (filled portion)
            this.progressBars[suit] = this.add.rectangle(
                width/2 - barWidth/2, 
                startY + (index * spacing), 
                0, // Initial width is 0
                barHeight, 
                colors[index]
            ).setOrigin(0, 0.5);
        });
    }
    
    // Update progress bars based on race progress
    updateProgress(progress) {
        if (!progress) return;
        
        const barWidth = 300;
        
        for (const suit in progress) {
            if (this.progressBars[suit]) {
                const percent = progress[suit];
                const width = (barWidth * percent) / 100;
                
                // Animate the progress bar
                this.tweens.add({
                    targets: this.progressBars[suit],
                    width: width,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        }
    }
    
    // Show a card in the center of the table
    showCard(card) {
        // Clear any existing card
        this.clearCard();
        
        if (!card || !card.suit) return;
        
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create a container for the card
        const cardContainer = this.add.container(width/2, height/2 - 40);
        
        // Card background
        const cardBase = this.add.image(0, 0, 'card-base');
        cardContainer.add(cardBase);
        
        // Get suit info
        const suitMap = {
            '♥': { texture: 'heart-symbol', color: 0xff0000 },
            '♦': { texture: 'diamond-symbol', color: 0xff0000 },
            '♠': { texture: 'spade-symbol', color: 0x000000 },
            '♣': { texture: 'club-symbol', color: 0x000000 }
        };
        
        const suitInfo = suitMap[card.suit] || { texture: 'heart-symbol', color: 0xff0000 };
        
        // Add suit symbol
        const suitSymbol = this.add.image(0, 0, suitInfo.texture);
        suitSymbol.setScale(1.5);
        cardContainer.add(suitSymbol);
        
        // Add rank text
        const textColor = suitInfo.color === 0xff0000 ? '#ff0000' : '#000000';
        
        const topRank = this.add.text(-45, -65, card.rank, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: textColor,
            fontStyle: 'bold'
        }).setOrigin(0, 0);
        
        const bottomRank = this.add.text(45, 65, card.rank, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: textColor,
            fontStyle: 'bold'
        }).setOrigin(1, 1);
        
        bottomRank.setAngle(180);
        
        cardContainer.add(topRank);
        cardContainer.add(bottomRank);
        
        // Small suit icons
        const topSuit = this.add.image(-45, -40, suitInfo.texture).setOrigin(0, 0).setScale(0.4);
        const bottomSuit = this.add.image(45, 40, suitInfo.texture).setOrigin(1, 1).setScale(0.4);
        bottomSuit.setAngle(180);
        
        cardContainer.add(topSuit);
        cardContainer.add(bottomSuit);
        
        // Store reference and add animation
        this.cardSprite = cardContainer;
        
        // Add animation
        this.tweens.add({
            targets: cardContainer,
            y: { from: height/2 - 100, to: height/2 - 40 },
            scaleX: { from: 0.8, to: 1 },
            scaleY: { from: 0.8, to: 1 },
            duration: 300,
            ease: 'Bounce.out'
        });
    }
    
    // Clear the current card
    clearCard() {
        if (this.cardSprite) {
            this.cardSprite.destroy();
            this.cardSprite = null;
        }
    }
    
    // Highlight the winning suit
    highlightWinner(winner) {
        if (!winner || !this.progressBars[winner]) return;
        
        // Flash animation for winner
        this.tweens.add({
            targets: this.progressBars[winner],
            alpha: { from: 1, to: 0.2 },
            yoyo: true,
            repeat: 5,
            duration: 200
        });
    }
    
    // Handle resize
    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Resize and reposition elements
        if (this.raceTable) {
            this.raceTable.setPosition(width/2, height/2);
        }
        
        if (this.cardSprite) {
            this.cardSprite.setPosition(width/2, height/2 - 40);
        }
        
        // Recreate progress bars in new position
        // (In a real implementation, we would update their positions instead)
        Object.values(this.progressBars).forEach(bar => {
            if (bar) bar.destroy();
        });
        
        this.createProgressBars();
    }
}

// Register the scene class globally
window.SaloonStandalone = SaloonStandalone;