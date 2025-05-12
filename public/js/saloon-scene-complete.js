/**
 * SaloonScene - Complete Phaser Implementation
 * 
 * This implementation follows the same pattern as other scenes,
 * with full Phaser-based rendering and interaction for the racing game.
 */
class SaloonSceneComplete extends Phaser.Scene {
    constructor() {
        super('SaloonScene');
        
        // Track race state
        this.raceState = {
            status: 'betting', // 'betting', 'racing', 'finished'
            bets: {
                hearts: 0,
                diamonds: 0,
                clubs: 0,
                spades: 0
            },
            totalBet: 0,
            progress: {
                hearts: 0,
                diamonds: 0,
                clubs: 0,
                spades: 0
            },
            odds: {
                hearts: 4.0,
                diamonds: 4.0,
                clubs: 4.0,
                spades: 4.0
            },
            currentCard: null,
            winner: null
        };
        
        // Track Phaser objects
        this.uiElements = {
            cardContainer: null,
            betDisplays: {},
            oddsDisplays: {},
            progressBars: {},
            totalBetDisplay: null,
            buttons: {},
            raceResultsContainer: null
        };
        
        // Cached socket reference
        this.socket = null;
    }
    
    preload() {
        console.log('Preloading SaloonScene assets');
        
        // Load the background
        this.load.image('saloon-bg', 'img/game-background.jpeg');
        
        // Create card textures programmatically
        this.createCardTextures();
    }
    
    /**
     * Create card textures programmatically for consistency
     */
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
        
        // Button backgrounds
        graphics.fillStyle(0x222244);
        graphics.fillRoundedRect(0, 0, 100, 50, 10);
        graphics.generateTexture('button-bg', 100, 50);
        graphics.clear();
        
        // Active button
        graphics.fillStyle(0x3a76c4);
        graphics.fillRoundedRect(0, 0, 100, 50, 10);
        graphics.generateTexture('button-active', 100, 50);
        graphics.clear();
        
        console.log('Card textures created successfully');
    }
    
    create() {
        console.log('Creating SaloonScene');
        
        // Cache socket reference
        this.socket = window.socket;
        
        // Ensure we have a socket connection and a player is initialized
        if (this.socket) {
            console.log('Socket connection verified in SaloonScene. Socket ID:', this.socket.id);
            
            // Force immediate player initialization if not already done
            this.socket.emit('new-player', {
                name: 'Cowboy',
                archetype: 'Entrepreneur'
            });
        } else {
            console.error('Socket connection not available in SaloonScene!');
        }
        
        // Get dimensions
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Set up background with warm saloon lighting
        this.bg = this.add.image(width/2, height/2, 'saloon-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setTint(0x996633); // Warm indoor lighting tint
        
        // Create main containers
        this.raceContainer = this.add.container(0, 0);
        this.uiContainer = this.add.container(0, 0);
        
        // Create UI elements
        this.createHeader();
        this.createRaceTrack();
        this.createCardDisplay();
        this.createBettingUI();
        this.createRaceButtons();
        this.createRaceResults();
        
        // Set up socket handlers
        this.setupSocketHandlers();
        
        // Connect UI to DOM elements
        this.syncWithDOM();
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
        
        // Create the claim bonus button
        this.createClaimBonusButton();
        
        console.log('SaloonScene created successfully');
        
        // Update the UI based on DOM state (for when returning to this scene)
        this.events.once('update', () => {
            setTimeout(() => {
                // Signal to the DOM that the scene is ready
                if (typeof window.initSaloonScene === 'function') {
                    window.initSaloonScene();
                }
                
                // Dispatch event for scene change
                const event = new CustomEvent('scene-changed', {
                    detail: { scene: 'saloon' }
                });
                document.dispatchEvent(event);
            }, 100);
        });
    }
    
    /**
     * Create the scene header with title
     */
    createHeader() {
        const width = this.scale.width;
        
        // Add title text
        const title = this.add.text(width/2, 50, 'HORSE RACE', {
            fontFamily: 'Anta, Arial, sans-serif',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5);
        
        // Add decorative underline
        const lineWidth = 200;
        const line = this.add.rectangle(width/2, 70, lineWidth, 2, 0x9966ff);
        
        this.uiContainer.add([title, line]);
    }
    
    /**
     * Create the race track display with progress bars
     */
    createRaceTrack() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Constants for positioning
        const trackWidth = 400;
        const trackHeight = 40;
        const startY = 150;
        const spacing = 60;
        
        // Create track background
        const trackBg = this.add.rectangle(width/2, startY + 120, trackWidth + 40, 300, 0x221133, 0.6)
            .setStrokeStyle(2, 0x9966ff);
        this.raceContainer.add(trackBg);
        
        // Create tracks for each suit
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const colors = [0xff3366, 0xff66aa, 0x5555ff, 0x333355];
        const emptyColors = [0x661122, 0x662233, 0x222266, 0x111122];
        
        suits.forEach((suit, index) => {
            // Track outline
            const trackOutline = this.add.rectangle(
                width/2,
                startY + (index * spacing),
                trackWidth,
                trackHeight,
                0x000000,
                0.5
            ).setStrokeStyle(1, 0x444444);
            
            // Suit icon
            const suitIcon = this.add.image(
                width/2 - trackWidth/2 - 30,
                startY + (index * spacing),
                `${suit.slice(0, -1)}-symbol`
            ).setScale(0.8);
            
            // Background track
            const emptyTrack = this.add.rectangle(
                width/2,
                startY + (index * spacing),
                trackWidth,
                trackHeight - 4,
                emptyColors[index],
                0.7
            );
            
            // Progress bar
            const progressBar = this.add.rectangle(
                width/2 - trackWidth/2 + 2,
                startY + (index * spacing),
                0, // Initial width
                trackHeight - 8,
                colors[index]
            ).setOrigin(0, 0.5);
            
            // Store reference
            this.uiElements.progressBars[suit] = progressBar;
            
            // Add to container
            this.raceContainer.add([trackOutline, suitIcon, emptyTrack, progressBar]);
        });
    }
    
    /**
     * Create the card display area
     */
    createCardDisplay() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create card container
        const cardContainer = this.add.container(width/2, height - 200);
        this.uiElements.cardContainer = cardContainer;
        
        // Add placeholder text
        const placeholder = this.add.text(0, 0, 'Draw a card\nto advance a\nhorse', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        cardContainer.add(placeholder);
        this.raceContainer.add(cardContainer);
    }
    
    /**
     * Create the betting UI with buttons and displays
     */
    createBettingUI() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create main container for betting UI
        const bettingContainer = this.add.container(width - 200, height/2);
        
        // Add title
        const title = this.add.text(0, -300, 'YOUR BETS', {
            fontFamily: 'Anta, Arial, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add decorative underline
        const line = this.add.rectangle(0, -280, 150, 2, 0x9966ff);
        
        bettingContainer.add([title, line]);
        
        // Create bet displays
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const colors = [0xff3366, 0xff66aa, 0x5555ff, 0x333355];
        const symbols = ['♥', '♦', '♣', '♠'];
        
        suits.forEach((suit, index) => {
            // Bet display background
            const betBg = this.add.rectangle(0, -220 + (index * 60), 180, 50, 0x221133, 0.7)
                .setStrokeStyle(1, colors[index]);
            
            // Suit symbol
            const suitText = this.add.text(-70, -220 + (index * 60), symbols[index], {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: index < 2 ? '#ff6699' : '#aaaaff'
            }).setOrigin(0.5);
            
            // Bet amount
            const betAmount = this.add.text(20, -220 + (index * 60), '0$CATTLE', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);
            
            // Store reference
            this.uiElements.betDisplays[suit] = betAmount;
            
            bettingContainer.add([betBg, suitText, betAmount]);
        });
        
        // Add total bet display
        const totalBetBg = this.add.rectangle(0, 40, 180, 40, 0x332244, 0.8)
            .setStrokeStyle(1, 0xaaaaaa);
        
        const totalBetText = this.add.text(-70, 40, 'TOTAL:', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        const totalBetAmount = this.add.text(20, 40, '0$CATTLE', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        
        this.uiElements.totalBetDisplay = totalBetAmount;
        
        bettingContainer.add([totalBetBg, totalBetText, totalBetAmount]);
        
        // Create betting buttons at the bottom
        const buttonContainer = this.add.container(width/2, height - 60);
        
        // Title for betting section
        const betTitle = this.add.text(0, -60, 'PLACE YOUR BETS', {
            fontFamily: 'Anta, Arial, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        buttonContainer.add(betTitle);
        
        // Create bet buttons for each suit
        const buttonWidth = 80;
        const buttonSpacing = 100;
        const startX = -150;
        
        suits.forEach((suit, index) => {
            // Button background
            const buttonBg = this.add.image(
                startX + (index * buttonSpacing),
                0,
                'button-bg'
            ).setInteractive({ useHandCursor: true });
            
            // Button icon (suit symbol)
            const buttonIcon = this.add.image(
                startX + (index * buttonSpacing) - 25,
                -10,
                `${suit.slice(0, -1)}-symbol`
            ).setScale(0.6);
            
            // Odds text
            const oddsText = this.add.text(
                startX + (index * buttonSpacing),
                -10,
                'Odds:', {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    color: '#ffffff'
                }
            ).setOrigin(0, 0.5);
            
            // Odds value
            const oddsValue = this.add.text(
                startX + (index * buttonSpacing) + 25,
                10,
                '4.0x', {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#ffff00',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5);
            
            // Store reference
            this.uiElements.oddsDisplays[suit] = oddsValue;
            
            // Add click handler
            buttonBg.on('pointerdown', () => {
                this.cycleBet(suit);
            });
            
            // Store button reference
            this.uiElements.buttons[`bet-${suit}`] = buttonBg;
            
            // Add to container
            buttonContainer.add([buttonBg, buttonIcon, oddsText, oddsValue]);
        });
        
        this.uiContainer.add([bettingContainer, buttonContainer]);
    }
    
    /**
     * Create race control buttons (Start Race, Draw Card)
     */
    createRaceButtons() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create container in bottom center
        const container = this.add.container(width/2, height - 380);
        
        // Start Race button
        const startButton = this.add.image(80, 0, 'button-bg')
            .setInteractive({ useHandCursor: true })
            .setScale(1.2, 1);
        
        const startIcon = this.add.image(30, 0, 'card-base').setScale(0.2);
        const startText = this.add.text(50, 0, 'START RACE', {
            fontFamily: 'Anta, Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // Draw Card button
        const drawButton = this.add.image(-80, 0, 'button-bg')
            .setInteractive({ useHandCursor: true })
            .setScale(1.2, 1);
        
        const drawIcon = this.add.image(-130, 0, 'card-base').setScale(0.2);
        const drawText = this.add.text(-110, 0, 'DRAW CARD', {
            fontFamily: 'Anta, Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // Disable draw card initially
        drawButton.setTint(0x666666);
        drawButton.disableInteractive();
        
        // Add click handlers
        startButton.on('pointerdown', () => {
            this.startRace();
        });
        
        drawButton.on('pointerdown', () => {
            this.drawCard();
        });
        
        // Store button references
        this.uiElements.buttons['start-race'] = startButton;
        this.uiElements.buttons['draw-card'] = drawButton;
        
        // Add to container
        container.add([startButton, startIcon, startText, drawButton, drawIcon, drawText]);
        this.uiContainer.add(container);
    }
    
    /**
     * Create race results history display
     */
    createRaceResults() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create container for results
        const resultsContainer = this.add.container(width - 200, height/2 + 150);
        this.uiElements.raceResultsContainer = resultsContainer;
        
        // Add title
        const title = this.add.text(0, -50, 'RECENT RESULTS', {
            fontFamily: 'Anta, Arial, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add decorative underline
        const line = this.add.rectangle(0, -30, 150, 2, 0x9966ff);
        
        // Add empty state message
        const emptyState = this.add.text(0, 10, 'No race results\nyet.', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        resultsContainer.add([title, line, emptyState]);
        this.uiContainer.add(resultsContainer);
    }
    
    /**
     * Create the claim bonus button
     */
    createClaimBonusButton() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Create container
        const container = this.add.container(width/2, height - 120);
        
        // Button background
        const buttonBg = this.add.rectangle(0, 0, 240, 60, 0x003366, 0.9)
            .setStrokeStyle(2, 0x00aaff)
            .setInteractive({ useHandCursor: true });
        
        // Button star icon
        const starIcon = this.add.text(-90, 0, '⭐', {
            fontSize: '24px'
        }).setOrigin(0.5);
        
        // Button text
        const buttonText = this.add.text(-50, -10, 'Claim 50 $CATTLE Bonus', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        
        // Button subtext
        const buttonSubtext = this.add.text(-50, 10, '(Once per session)', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aaaaaa'
        }).setOrigin(0, 0.5);
        
        // Add click handler
        buttonBg.on('pointerdown', () => {
            this.claimBonus();
        });
        
        // Store button reference
        this.uiElements.buttons['claim-bonus'] = buttonBg;
        
        // Add to container and scene
        container.add([buttonBg, starIcon, buttonText, buttonSubtext]);
        this.uiContainer.add(container);
    }
    
    /**
     * Set up socket handlers for racing events
     */
    setupSocketHandlers() {
        if (!this.socket) {
            console.error("Socket not available for SaloonScene");
            return;
        }
        
        // Race started event
        this.socket.on('race-started', data => {
            console.log('Race started event received:', data);
            
            // Update race state
            this.raceState.status = 'racing';
            this.raceState.progress = data.progress || {
                hearts: 0,
                diamonds: 0,
                clubs: 0,
                spades: 0
            };
            this.raceState.odds = data.odds || this.raceState.odds;
            
            // Update progress bars
            this.updateProgress(this.raceState.progress);
            
            // Update odds display
            this.updateOddsDisplay(this.raceState.odds);
            
            // Enable draw button, disable start button
            this.setButtonState('draw-card', true);
            this.setButtonState('start-race', false);
            
            // Clear the card display
            this.clearCardDisplay();
            
            // Update player data if available
            if (data.player && window.playerData) {
                window.playerData = data.player;
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Race started! 10% (${data.burnAmount.toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`, 'info');
            }
        });
        
        // Card drawn event
        this.socket.on('card-drawn', data => {
            console.log('Card drawn event received:', data);
            
            // Update race state
            this.raceState.currentCard = data.card;
            this.raceState.progress = data.progress || this.raceState.progress;
            this.raceState.odds = data.odds || this.raceState.odds;
            
            // Show the card
            this.showCard(data.card);
            
            // Update progress bars
            this.updateProgress(this.raceState.progress);
            
            // Update odds display
            this.updateOddsDisplay(this.raceState.odds);
        });
        
        // Race finished event
        this.socket.on('race-finished', data => {
            console.log('Race finished event received:', data);
            
            // Update race state
            this.raceState.status = 'betting';
            this.raceState.winner = data.winner;
            
            // Update buttons
            this.setButtonState('draw-card', false);
            this.setButtonState('start-race', true);
            
            // Add to race history
            this.addRaceResult(data.winner, data.bet > 0);
            
            // Update player data if available
            if (data.player && window.playerData) {
                window.playerData = data.player;
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
            
            // Show winning celebration
            if (data.bet > 0 && data.winnings > 0) {
                // Flash the winner's progress bar
                this.flashProgressBar(data.winner);
                
                // Show celebration effect
                if (typeof window.createConfetti === 'function') {
                    window.createConfetti();
                }
                
                // Show win message
                if (typeof window.showWinCelebration === 'function') {
                    window.showWinCelebration(data.winnings);
                }
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won! You win ${data.winnings.toFixed(2)} $CATTLE!`, 'success');
                }
            } else {
                // Show regular message
                if (typeof window.showNotification === 'function') {
                    window.showNotification(`${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won. You didn't bet on the winner.`, 'info');
                }
            }
        });
        
        // Bonus claimed event
        this.socket.on('bonus-claimed', data => {
            console.log('Bonus claimed event received:', data);
            
            // Update player data
            if (data.player && window.playerData) {
                window.playerData = data.player;
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Bonus claimed! ${data.amount} $CATTLE added to your balance.`, 'success');
            }
        });
        
        // Error message
        this.socket.on('error-message', data => {
            console.error('Error message received:', data.message);
            
            if (typeof window.showNotification === 'function') {
                window.showNotification(data.message, 'error');
            }
        });
    }
    
    /**
     * Synchronize the Phaser UI with DOM elements
     */
    syncWithDOM() {
        // Set up event listener for DOM bet changes
        document.addEventListener('bet-updated', (e) => {
            if (e.detail && e.detail.suit && e.detail.amount !== undefined) {
                this.updateBetDisplay(e.detail.suit, e.detail.amount);
            }
        });
        
        // Find button elements in DOM and connect them
        const betButtons = document.querySelectorAll('[id^="bet-"][id$="-btn"]');
        betButtons.forEach(button => {
            const suit = button.id.replace('bet-', '').replace('-btn', '');
            
            // Replace click handler to use Phaser implementation
            button.onclick = () => {
                console.log(`DOM button clicked for ${suit}, delegating to Phaser`);
                this.cycleBet(suit);
                return false;
            };
        });
        
        // Connect start race button
        const startRaceButton = document.getElementById('start-race');
        if (startRaceButton) {
            startRaceButton.onclick = () => {
                console.log('DOM start race button clicked, delegating to Phaser');
                this.startRace();
                return false;
            };
        }
        
        // Connect draw card button
        const drawCardButton = document.getElementById('draw-card');
        if (drawCardButton) {
            drawCardButton.onclick = () => {
                console.log('DOM draw card button clicked, delegating to Phaser');
                this.drawCard();
                return false;
            };
        }
        
        // Connect claim bonus button
        const claimBonusButton = document.getElementById('claim-bonus');
        if (claimBonusButton) {
            claimBonusButton.onclick = () => {
                console.log('DOM claim bonus button clicked, delegating to Phaser');
                this.claimBonus();
                return false;
            };
        }
    }
    
    /**
     * Cycle through bet amounts for a suit
     */
    cycleBet(suit) {
        if (this.raceState.status !== 'betting') {
            if (typeof window.showNotification === 'function') {
                window.showNotification('Cannot change bets during a race!', 'error');
            }
            return;
        }
        
        console.log(`Cycling bet for ${suit}`);
        
        // Get current bet
        const currentBet = this.raceState.bets[suit] || 0;
        
        // Define bet cycle: 0 -> 5 -> 10 -> 20 -> 50 -> 0
        const betCycle = [0, 5, 10, 20, 50];
        const currentIndex = betCycle.indexOf(currentBet);
        const nextIndex = (currentIndex + 1) % betCycle.length;
        const newBet = betCycle[nextIndex];
        
        // Update state
        this.raceState.bets[suit] = newBet;
        
        // Update displays
        this.updateBetDisplay(suit, newBet);
        this.updateTotalBet();
        
        // Update DOM display if it exists
        const domDisplay = document.getElementById(`${suit}-bet-display`);
        if (domDisplay) {
            domDisplay.textContent = newBet;
        }
        
        // Dispatch event for external handlers
        const event = new CustomEvent('bet-updated', {
            detail: { suit, amount: newBet }
        });
        document.dispatchEvent(event);
        
        console.log(`Bet updated for ${suit}: ${newBet}`);
    }
    
    /**
     * Update the bet display for a suit
     */
    updateBetDisplay(suit, amount) {
        // Update the Phaser text
        const display = this.uiElements.betDisplays[suit];
        if (display) {
            display.setText(`${amount}$CATTLE`);
        }
    }
    
    /**
     * Update the total bet display
     */
    updateTotalBet() {
        // Calculate total
        const total = Object.values(this.raceState.bets).reduce((sum, bet) => sum + bet, 0);
        this.raceState.totalBet = total;
        
        // Update Phaser display
        if (this.uiElements.totalBetDisplay) {
            this.uiElements.totalBetDisplay.setText(`${total}$CATTLE`);
        }
        
        // Update DOM display
        const domTotalDisplay = document.getElementById('total-bet-amount');
        if (domTotalDisplay) {
            domTotalDisplay.textContent = total;
        }
    }
    
    /**
     * Update the odds display
     */
    updateOddsDisplay(odds) {
        for (const suit in odds) {
            const display = this.uiElements.oddsDisplays[suit];
            if (display) {
                display.setText(`${odds[suit].toFixed(1)}x`);
            }
            
            // Update DOM display
            const domDisplay = document.getElementById(`odds-${suit}`);
            if (domDisplay) {
                domDisplay.textContent = odds[suit].toFixed(1);
            }
        }
    }
    
    /**
     * Update progress bars based on race state
     */
    updateProgress(progress) {
        if (!progress) return;
        
        const trackWidth = 400;
        
        for (const suit in progress) {
            const progressBar = this.uiElements.progressBars[suit];
            if (progressBar) {
                const percent = progress[suit];
                const width = (trackWidth * percent) / 100;
                
                // Animate the progress bar
                this.tweens.add({
                    targets: progressBar,
                    width: width,
                    duration: 300,
                    ease: 'Power2'
                });
            }
            
            // Update DOM progress bar if it exists
            const domProgressBar = document.getElementById(`${suit}-progress`);
            if (domProgressBar) {
                domProgressBar.style.width = `${progress[suit]}%`;
            }
        }
    }
    
    /**
     * Flash a progress bar to indicate winning
     */
    flashProgressBar(suit) {
        const progressBar = this.uiElements.progressBars[suit];
        if (!progressBar) return;
        
        this.tweens.add({
            targets: progressBar,
            alpha: { from: 1, to: 0.2 },
            yoyo: true,
            repeat: 5,
            duration: 200
        });
    }
    
    /**
     * Start a race
     */
    startRace() {
        if (!this.socket) {
            console.error("Socket not available");
            return;
        }
        
        if (this.raceState.status !== 'betting') {
            if (typeof window.showNotification === 'function') {
                window.showNotification('Race already in progress!', 'error');
            }
            return;
        }
        
        if (this.raceState.totalBet <= 0) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('Please place at least one bet to start the race!', 'error');
            }
            return;
        }
        
        console.log('Starting race with bets:', this.raceState.bets);
        
        // Send race start event to server
        this.socket.emit('start-race', this.raceState.bets);
    }
    
    /**
     * Draw a card
     */
    drawCard() {
        if (!this.socket) {
            console.error("Socket not available");
            return;
        }
        
        if (this.raceState.status !== 'racing') {
            if (typeof window.showNotification === 'function') {
                window.showNotification('No race in progress. Start a race first!', 'error');
            }
            return;
        }
        
        console.log('Drawing card');
        
        // Send draw card event to server
        this.socket.emit('draw-card');
    }
    
    /**
     * Claim the bonus
     */
    claimBonus() {
        if (!this.socket) {
            console.error("Socket not available");
            return;
        }
        
        console.log('Claiming bonus');
        
        // Send claim bonus event to server
        this.socket.emit('claim-bonus');
    }
    
    /**
     * Show a card in the display area
     */
    showCard(card) {
        if (!card || !card.suit || !card.rank) {
            console.error("Invalid card data:", card);
            return;
        }
        
        // Clear existing card display
        this.clearCardDisplay();
        
        const container = this.uiElements.cardContainer;
        if (!container) return;
        
        console.log('Showing card:', card);
        
        try {
            // Map suit symbols to textures
            const suitMap = {
                '♥': { texture: 'heart-symbol', color: 0xff0000 },
                '♦': { texture: 'diamond-symbol', color: 0xff0000 },
                '♠': { texture: 'spade-symbol', color: 0x000000 },
                '♣': { texture: 'club-symbol', color: 0x000000 }
            };
            
            const suitInfo = suitMap[card.suit] || { texture: 'heart-symbol', color: 0xff0000 };
            
            // Create card components
            const cardBase = this.add.image(0, 0, 'card-base');
            
            const suitSymbol = this.add.image(0, 0, suitInfo.texture);
            suitSymbol.setScale(1.5);
            
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
            
            // Small suit icons
            const topSuit = this.add.image(-45, -40, suitInfo.texture).setOrigin(0, 0).setScale(0.4);
            const bottomSuit = this.add.image(45, 40, suitInfo.texture).setOrigin(1, 1).setScale(0.4);
            bottomSuit.setAngle(180);
            
            // Add all components to the container
            container.add([cardBase, suitSymbol, topRank, bottomRank, topSuit, bottomSuit]);
            
            // Add animation
            this.tweens.add({
                targets: container,
                y: { from: container.y - 30, to: container.y },
                scaleX: { from: 0.8, to: 1 },
                scaleY: { from: 0.8, to: 1 },
                duration: 300,
                ease: 'Bounce.out'
            });
            
            // Update DOM card display if it exists
            const domCardContainer = document.getElementById('drawn-card');
            if (domCardContainer) {
                domCardContainer.innerHTML = '';
                
                if (typeof window.createCardElement === 'function') {
                    const cardElement = window.createCardElement(card);
                    domCardContainer.appendChild(cardElement);
                } else {
                    // Simple fallback
                    const cardElement = document.createElement('div');
                    cardElement.className = `card ${card.color || ''}`;
                    cardElement.innerHTML = `<div class="card-rank">${card.rank}</div><div class="card-suit">${card.suit}</div>`;
                    domCardContainer.appendChild(cardElement);
                }
            }
        } catch (error) {
            console.error("Error showing card:", error);
        }
    }
    
    /**
     * Clear the card display
     */
    clearCardDisplay() {
        const container = this.uiElements.cardContainer;
        if (!container) return;
        
        // Remove all children
        container.removeAll(true);
        
        // Add placeholder text
        const placeholder = this.add.text(0, 0, 'Draw a card\nto advance a\nhorse', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        container.add(placeholder);
    }
    
    /**
     * Add a race result to the history
     */
    addRaceResult(winner, isWin) {
        if (!winner) return;
        
        console.log(`Adding race result: ${winner} (Win: ${isWin})`);
        
        const container = this.uiElements.raceResultsContainer;
        if (!container) return;
        
        // Remove empty state message if present
        const emptyState = container.getAll().find(child => 
            child.type === 'Text' && child.text.includes('No race')
        );
        
        if (emptyState) {
            container.remove(emptyState, true);
        }
        
        // Create result indicator
        const resultIndicator = this.add.text(0, 0, winner.charAt(0).toUpperCase(), {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: isWin ? '#00ff00' : '#ffffff',
            fontStyle: 'bold',
            backgroundColor: isWin ? '#005500' : '#333333',
            padding: { x: 8, y: 5 }
        }).setOrigin(0.5);
        
        // Get existing results
        const results = container.getAll().filter(child => 
            child.type === 'Text' && !child.text.includes('RECENT')
        );
        
        // Reposition existing results
        results.forEach((result, index) => {
            this.tweens.add({
                targets: result,
                x: -40 + (index % 3) * 40,
                y: 10 + Math.floor(index / 3) * 30,
                duration: 300,
                ease: 'Power2'
            });
        });
        
        // Position and add new result
        resultIndicator.setPosition(
            -40 + (results.length % 3) * 40,
            10 + Math.floor(results.length / 3) * 30
        );
        
        container.add(resultIndicator);
        
        // Limit to 9 results
        if (results.length >= 9) {
            const oldestResult = results[0];
            container.remove(oldestResult, true);
        }
        
        // Update DOM results history if it exists
        const domHistoryContainer = document.getElementById('results-history');
        if (domHistoryContainer) {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${winner} ${isWin ? 'win' : 'loss'}`;
            historyItem.textContent = winner.charAt(0).toUpperCase();
            
            domHistoryContainer.appendChild(historyItem);
            
            // Limit history to 10 items
            const historyItems = domHistoryContainer.querySelectorAll('.history-item');
            if (historyItems.length > 10) {
                domHistoryContainer.removeChild(historyItems[0]);
            }
        }
    }
    
    /**
     * Set button state (enabled/disabled)
     */
    setButtonState(buttonId, enabled) {
        const button = this.uiElements.buttons[buttonId];
        if (!button) return;
        
        if (enabled) {
            button.clearTint();
            button.setInteractive({ useHandCursor: true });
        } else {
            button.setTint(0x666666);
            button.disableInteractive();
        }
        
        // Update DOM button if it exists
        const domButton = document.getElementById(buttonId);
        if (domButton) {
            domButton.disabled = !enabled;
        }
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
        
        // Reposition elements - in a real implementation we would
        // update each container's position individually
    }
}

// Register the scene class globally for access in other files
window.SaloonSceneComplete = SaloonSceneComplete;