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
        // Add card table and race track visuals
        const cardTable = this.add.rectangle(400, 300, 500, 300, 0x3a2e1f);
        cardTable.setStrokeStyle(4, 0x654321);
        
        // Add card symbols for each suit
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const positions = [
            { x: 200, y: 200 },
            { x: 400, y: 200 },
            { x: 200, y: 400 },
            { x: 400, y: 400 }
        ];
        
        suits.forEach((suit, index) => {
            const cardImage = this.add.image(positions[index].x, positions[index].y, `card-${suit}`);
            cardImage.setScale(0.5);
            cardImage.setInteractive();
            
            // Add hover effect
            cardImage.on('pointerover', () => {
                cardImage.setScale(0.6);
            });
            
            cardImage.on('pointerout', () => {
                cardImage.setScale(0.5);
            });
            
            // Click to place bet through racing game UI
            cardImage.on('pointerdown', () => {
                if (window.racingGame) {
                    // Quick bet through card clicks (add 5 to selected suit)
                    const currentBet = window.racingGameState?.bets?.[suit] || 0;
                    window.racingGame.placeBet(suit, currentBet + 5);
                }
            });
        });
        
        // Add return to town button
        const returnButton = this.add.text(50, 550, 'Return to Town', { 
            fontSize: '18px',
            fill: '#fff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        });
        returnButton.setInteractive();
        
        returnButton.on('pointerover', () => {
            returnButton.setStyle({ backgroundColor: '#5a5a5a' });
        });
        
        returnButton.on('pointerout', () => {
            returnButton.setStyle({ backgroundColor: '#4a4a4a' });
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