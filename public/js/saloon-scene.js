/**
 * Bull Run Boost - Saloon Scene
 * 
 * This file contains the Phaser scene for the saloon where
 * players can place bets on races and earn CATTLE tokens.
 */

class SaloonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SaloonScene' });
        this.socket = null;
        this.player = null;
    }

    init(data) {
        // Store any data passed from previous scene
        this.player = data.player || null;
        
        // Connect to WebSocket if not already connected
        this.initWebSocket();
    }

    preload() {
        // Use asset handler to preload common assets
        if (window.assetHandler && window.assetHandler.preloadCommonAssets) {
            window.assetHandler.preloadCommonAssets(this);
        } else {
            console.warn('Asset handler not found, falling back to direct loading');
            // Fallback to direct loading
            this.load.svg('saloon-bg', 'img/saloon-bg.svg');
            this.load.svg('card-hearts', 'img/card-hearts.svg');
            this.load.svg('card-diamonds', 'img/card-diamonds.svg');
            this.load.svg('card-clubs', 'img/card-clubs.svg');
            this.load.svg('card-spades', 'img/card-spades.svg');
        }
    }

    create() {
        // Add background
        this.add.image(400, 300, 'saloon-bg');
        
        // Add interactive elements
        this.createSaloonElements();
        
        // Notify server about scene initialization
        this.sendWebSocketMessage({
            type: 'scene_init',
            scene: 'SaloonScene',
            timestamp: Date.now()
        });
        
        // Initialize racing game
        this.initializeRacingGame();
    }

    createSaloonElements() {
        // Add cyberpunk/western styled card table and race track visuals
        // Desert brown background with neon border
        const cardTable = this.add.rectangle(400, 300, 500, 300, 0x3a1f2e);
        cardTable.setStrokeStyle(4, 0x8B4513);
        
        // Add neon border with pulsing animation
        const neonBorder = this.add.rectangle(400, 300, 510, 310, 0x00FFFF, 0);
        neonBorder.setStrokeStyle(2, 0x00FFFF, 0.7);
        
        // Create pulsing animation for the neon border
        this.tweens.add({
            targets: neonBorder,
            alpha: { from: 0.7, to: 0.3 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add dust particle effect for western atmosphere
        const particles = this.add.particles('bubble');
        const emitter = particles.createEmitter({
            x: { min: 200, max: 600 },
            y: { min: 150, max: 450 },
            scale: { start: 0.05, end: 0 },
            speed: { min: 5, max: 15 },
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            alpha: { start: 0.3, end: 0 },
            lifespan: 2000,
            quantity: 1,
            frequency: 500,
            tint: [0xFFDAB9, 0x8B4513]
        });
        
        // Add card symbols for each suit with cyberpunk effect
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const positions = [
            { x: 200, y: 200 },
            { x: 400, y: 200 },
            { x: 200, y: 400 },
            { x: 400, y: 400 }
        ];
        
        // Create neon glow effect
        const suitColors = {
            hearts: 0xff2f5f,     // Neon red
            diamonds: 0xffaf2f,    // Neon orange
            clubs: 0x2fff7f,       // Neon green
            spades: 0x2f9fff       // Neon blue
        };
        
        suits.forEach((suit, index) => {
            // Create border behind the card for glow effect
            const glowBorder = this.add.rectangle(
                positions[index].x, 
                positions[index].y, 
                100, 
                100, 
                suitColors[suit], 
                0.3
            );
            glowBorder.setStrokeStyle(2, suitColors[suit], 0.8);
            
            // Create flickering animation for the border
            this.tweens.add({
                targets: glowBorder,
                alpha: { from: 0.3, to: 0.7 },
                duration: 1500 + Math.random() * 1000, // Random duration for more natural effect
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Add the main card image
            const cardImage = this.add.image(positions[index].x, positions[index].y, `card-${suit}`);
            cardImage.setScale(0.5);
            cardImage.setInteractive();
            cardImage.setData('suit', suit); // Store suit for reference
            
            // Add cyberpunk hover effect
            cardImage.on('pointerover', () => {
                cardImage.setScale(0.6);
                glowBorder.setAlpha(0.8);
                glowBorder.setStrokeStyle(3, suitColors[suit], 1);
                
                // Create a pulsing effect
                this.tweens.add({
                    targets: glowBorder,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 300,
                    yoyo: true,
                    repeat: 0
                });
            });
            
            cardImage.on('pointerout', () => {
                cardImage.setScale(0.5);
                glowBorder.setAlpha(0.3);
                glowBorder.setStrokeStyle(2, suitColors[suit], 0.8);
                glowBorder.setScale(1, 1);
            });
            
            // Click to place bet through racing game UI
            cardImage.on('pointerdown', () => {
                if (window.racingGame) {
                    // Quick bet through card clicks (add 5 to selected suit)
                    const currentBet = window.racingGameState?.bets?.[suit] || 0;
                    window.racingGame.placeBet(suit, currentBet + 5);
                    
                    // Add visual feedback for clicking
                    this.tweens.add({
                        targets: cardImage,
                        scaleX: 0.45,
                        scaleY: 0.45,
                        duration: 100,
                        yoyo: true,
                        ease: 'Bounce.easeOut'
                    });
                }
            });
        });
        
        // Add cyberpunk-styled return to town button with neon effect
        const returnBg = this.add.rectangle(120, 550, 150, 40, 0x3a1f2e);
        returnBg.setStrokeStyle(2, 0x8B4513, 1);
        
        const returnGlow = this.add.rectangle(120, 550, 155, 45, 0x00FFFF, 0);
        returnGlow.setStrokeStyle(1.5, 0x00FFFF, 0.7);
        
        // Create flickering animation for the button glow
        this.tweens.add({
            targets: returnGlow,
            alpha: { from: 0.7, to: 0.3 },
            duration: 1200 + Math.random() * 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        const returnButton = this.add.text(50, 550, 'Return to Town', { 
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '18px',
            fill: '#00FFFF',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000',
                blur: 2,
                stroke: true,
                fill: true
            }
        });
        returnButton.setInteractive();
        
        returnButton.on('pointerover', () => {
            returnButton.setStyle({ 
                fill: '#FFFFFF',
                fontSize: '19px',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#00FFFF',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            });
            
            // Pulse the glow on hover
            this.tweens.add({
                targets: returnGlow,
                scaleX: 1.1,
                scaleY: 1.1,
                alpha: 0.9,
                duration: 300,
                yoyo: false
            });
        });
        
        returnButton.on('pointerout', () => {
            returnButton.setStyle({ 
                fill: '#00FFFF',
                fontSize: '18px',
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: '#000',
                    blur: 2,
                    stroke: true,
                    fill: true
                }
            });
            
            // Reset the glow on pointer out
            this.tweens.add({
                targets: returnGlow,
                scaleX: 1,
                scaleY: 1,
                alpha: 0.7,
                duration: a few hundred,
                yoyo: false
            });
        });
        
        returnButton.on('pointerdown', () => {
            // Switch back to town scene
            if (window.gameManager && window.gameManager.switchScene) {
                window.gameManager.switchScene('main-scene');
            } else if (window.switchScene) {
                // Direct call to global switchScene function
                window.switchScene('main-scene');
            } else {
                console.error('Cannot find switchScene function');
                // Fallback to direct scene transition
                this.scene.start('MainScene');
            }
        });
    }

    initWebSocket() {
        // Only create a new connection if one doesn't already exist
        if (!window.socket || window.socket.readyState !== WebSocket.OPEN) {
            // Create WebSocket connection
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            
            window.socket = new WebSocket(wsUrl);
            
            window.socket.onopen = () => {
                console.log('Connected to WebSocket server from SaloonScene');
                this.sendWebSocketMessage({
                    type: 'scene_init',
                    scene: 'SaloonScene',
                    timestamp: Date.now()
                });
            };
            
            window.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message in SaloonScene:', message);
                    
                    // Handle different message types
                    switch (message.type) {
                        case 'race_progress':
                            // Update race progress visuals
                            if (window.racingGame) {
                                window.racingGame.updateProgress(message.progress);
                            }
                            break;
                            
                        case 'race_result':
                            // Handle race results
                            if (window.racingGame) {
                                // Note: we don't call endRace directly as the client who started the race handles it
                                // This just shows a notification to other players
                                if (window.gameManager) {
                                    window.gameManager.showNotification(`Race finished! ${message.winner.toUpperCase()} won!`, 'info');
                                }
                            }
                            break;
                    }
                    
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            
            window.socket.onclose = () => {
                console.log('Disconnected from WebSocket server');
            };
            
            window.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }
    }

    sendWebSocketMessage(message) {
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
    }

    initializeRacingGame() {
        // Initialize DOM elements for racing game
        if (window.initSaloonScene) {
            window.initSaloonScene();
        }
    }

    update() {
        // Run game logic
    }
}