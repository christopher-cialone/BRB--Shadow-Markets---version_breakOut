/**
 * Enhanced Racing Game with WebSocket Implementation
 * Uses the dedicated WebSocket client for improved real-time communication
 */
(function() {
    'use strict';
    
    // State variables
    let bets = {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0
    };
    
    let totalBet = 0;
    let raceInProgress = false;
    let wsConnected = false;
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initRacing);
    
    /**
     * Initialize the racing game
     */
    function initRacing() {
        console.log("Initializing WebSocket-enhanced racing game");
        
        // Set up WebSocket connection if available
        if (window.websocketClient) {
            // Initialize WebSocket when needed
            window.websocketClient.init().then(() => {
                console.log('WebSocket racing connection established');
                wsConnected = true;
                setupWebSocketHandlers();
            }).catch(error => {
                console.error('Failed to initialize WebSocket for racing:', error);
                wsConnected = false;
            });
            
            // Add connection handlers
            window.websocketClient.on('open', () => {
                console.log('WebSocket racing connection opened');
                wsConnected = true;
            });
            
            window.websocketClient.on('close', () => {
                console.log('WebSocket racing connection closed');
                wsConnected = false;
            });
        } else {
            console.error("WebSocket client not available");
        }
        
        // Set up event listeners
        const betButtons = document.querySelectorAll('[id$="-btn"]');
        betButtons.forEach(button => {
            if (button.id.includes('bet-')) {
                const suit = button.id.replace('bet-', '').replace('-btn', '');
                button.addEventListener('click', () => placeBet(suit));
            }
        });
        
        const startRaceButton = document.getElementById('start-race');
        if (startRaceButton) {
            startRaceButton.addEventListener('click', startRace);
        }
        
        const drawCardButton = document.getElementById('draw-card');
        if (drawCardButton) {
            drawCardButton.addEventListener('click', drawCard);
            drawCardButton.disabled = true; // Initially disabled
        }
        
        // Set up bet slider
        setupBettingSliders();
        
        // Log initialization
        console.log("WebSocket racing game initialized");
    }
    
    /**
     * Place a bet on a suit
     * @param {string} suit - The suit to bet on
     */
    function placeBet(suit) {
        if (raceInProgress) {
            showMessage("Can't change bets during a race!", 'warning');
            return;
        }
        
        // Show bet slider for this suit
        showBetSlider(suit);
    }
    
    /**
     * Show bet slider for a specific suit
     * @param {string} suit - The suit to bet on
     */
    function showBetSlider(suit) {
        const betSliderOverlay = document.getElementById('bet-slider-overlay');
        const betSliderTitle = document.getElementById('bet-slider-title');
        const betSlider = document.getElementById('bet-slider');
        const betSliderValue = document.getElementById('bet-slider-value');
        
        if (!betSliderOverlay || !betSliderTitle || !betSlider || !betSliderValue) {
            console.error("Bet slider elements not found");
            return;
        }
        
        // Set current bet value and title
        betSliderTitle.textContent = `Place Bet on ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
        
        // Store the suit being bet on
        betSliderOverlay.dataset.currentSuit = suit;
        
        // Set current bet value
        betSlider.value = bets[suit];
        betSliderValue.textContent = bets[suit];
        
        // Set max value based on player balance
        const playerBalance = getPlayerBalance();
        betSlider.max = Math.min(50, Math.floor(playerBalance));
        
        // Show the slider overlay
        betSliderOverlay.classList.remove('hidden');
    }
    
    /**
     * Set up betting sliders
     */
    function setupBettingSliders() {
        const betSlider = document.getElementById('bet-slider');
        const betSliderValue = document.getElementById('bet-slider-value');
        const confirmBetBtn = document.getElementById('confirm-bet');
        const cancelBetBtn = document.getElementById('cancel-bet');
        const betSliderOverlay = document.getElementById('bet-slider-overlay');
        
        if (!betSlider || !betSliderValue || !confirmBetBtn || !cancelBetBtn || !betSliderOverlay) {
            console.error("Betting slider elements not found");
            return;
        }
        
        // Update value as slider changes
        betSlider.addEventListener('input', function() {
            betSliderValue.textContent = this.value;
        });
        
        // Handle confirm bet
        confirmBetBtn.addEventListener('click', function() {
            const suit = betSliderOverlay.dataset.currentSuit;
            if (suit) {
                const betAmount = parseInt(betSlider.value);
                bets[suit] = betAmount;
                
                // Update bet display
                updateBetDisplay(suit, betAmount);
                
                // Update total bet
                calculateTotalBet();
                
                // Hide the slider overlay
                betSliderOverlay.classList.add('hidden');
                
                console.log(`Confirmed bet of ${betAmount} on ${suit}`);
            }
        });
        
        // Handle cancel bet
        cancelBetBtn.addEventListener('click', function() {
            console.log("Canceling bet");
            betSliderOverlay.classList.add('hidden');
        });
    }
    
    /**
     * Get player balance
     * @returns {number} - Player balance
     */
    function getPlayerBalance() {
        // Get balance from playerData if available, otherwise default to 100
        if (window.playerData && typeof window.playerData.cattleBalance === 'number') {
            return window.playerData.cattleBalance;
        }
        return 100;
    }
    
    /**
     * Update the bet display for a suit
     * @param {string} suit - The suit
     * @param {number} amount - Bet amount
     */
    function updateBetDisplay(suit, amount) {
        const display = document.getElementById(`${suit}-bet-display`);
        if (display) {
            display.textContent = amount;
        }
    }
    
    /**
     * Calculate and update total bet
     */
    function calculateTotalBet() {
        totalBet = Object.values(bets).reduce((sum, bet) => sum + bet, 0);
        
        const totalDisplay = document.getElementById('total-bet-amount');
        if (totalDisplay) {
            totalDisplay.textContent = totalBet;
        }
        
        // Update burn amount (10%)
        const burnDisplay = document.getElementById('burn-amount');
        if (burnDisplay) {
            burnDisplay.textContent = (totalBet * 0.1).toFixed(1);
        }
    }
    
    /**
     * Start a race
     */
    function startRace() {
        if (!wsConnected) {
            showMessage("Not connected to server. Please wait for connection to be established.", 'error');
            return;
        }
        
        if (raceInProgress) {
            showMessage("Race already in progress!", 'warning');
            return;
        }
        
        if (totalBet <= 0) {
            showMessage("Please place at least one bet to start the race!", 'warning');
            return;
        }
        
        // Send race start event using socket.io for compatibility
        if (window.socket) {
            window.socket.emit('start-race', bets);
        }
        
        // Also send via WebSocket for future migration
        if (window.websocketClient) {
            window.websocketClient.send({
                type: 'start_race',
                bets: bets,
                timestamp: Date.now()
            });
        }
        
        console.log("Race start requested with bets:", bets);
    }
    
    /**
     * Draw a card
     */
    function drawCard() {
        if (!wsConnected) {
            showMessage("Not connected to server. Please wait for connection to be established.", 'error');
            return;
        }
        
        if (!raceInProgress) {
            showMessage("No race in progress. Start a race first!", 'warning');
            return;
        }
        
        // Send draw card event using socket.io for compatibility
        if (window.socket) {
            window.socket.emit('draw-card');
        }
        
        // Also send via WebSocket for future migration
        if (window.websocketClient) {
            window.websocketClient.send({
                type: 'draw_card',
                timestamp: Date.now()
            });
            
            // Notify WebSocket system of race progress for multiplayer awareness
            if (window.websocketAPI && window.websocketAPI.sendRaceProgress) {
                // Get current progress values
                const progress = {
                    hearts: parseInt(document.getElementById('hearts-progress').style.width) || 0,
                    diamonds: parseInt(document.getElementById('diamonds-progress').style.width) || 0,
                    clubs: parseInt(document.getElementById('clubs-progress').style.width) || 0,
                    spades: parseInt(document.getElementById('spades-progress').style.width) || 0
                };
                
                window.websocketAPI.sendRaceProgress(progress);
            }
        }
        
        console.log("Card draw requested");
    }
    
    /**
     * Reset race UI
     */
    function resetRaceUI() {
        // Reset progress bars
        ['hearts', 'diamonds', 'clubs', 'spades'].forEach(suit => {
            const bar = document.getElementById(`${suit}-progress`);
            if (bar) {
                bar.style.width = '0%';
            }
        });
        
        // Reset drawn card
        const cardContainer = document.getElementById('drawn-card');
        if (cardContainer) {
            cardContainer.innerHTML = '<div class="card-placeholder">Draw a card to advance a horse</div>';
        }
    }
    
    /**
     * Create a card element
     * @param {Object} card - Card data
     * @returns {HTMLElement} - Card element
     */
    function createCardElement(card) {
        if (!card || !card.suit || !card.rank) {
            console.error("Invalid card data:", card);
            return document.createElement('div');
        }
        
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color || ''}`;
        
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        
        // Card rank (top)
        const topRank = document.createElement('div');
        topRank.className = 'card-rank top';
        topRank.textContent = card.rank;
        
        // Card suit (middle)
        const suitElement = document.createElement('div');
        suitElement.className = 'card-suit';
        suitElement.textContent = card.suit;
        
        // Card rank (bottom)
        const bottomRank = document.createElement('div');
        bottomRank.className = 'card-rank bottom';
        bottomRank.textContent = card.rank;
        
        // Assemble card
        cardContent.appendChild(topRank);
        cardContent.appendChild(suitElement);
        cardContent.appendChild(bottomRank);
        cardElement.appendChild(cardContent);
        
        return cardElement;
    }
    
    /**
     * Add race result to history
     * @param {string} winner - The winning suit
     * @param {boolean} isWin - Whether the player won
     */
    function addToHistory(winner, isWin) {
        const historyContainer = document.getElementById('results-history');
        if (!historyContainer) return;
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${winner} ${isWin ? 'win' : 'loss'}`;
        historyItem.textContent = winner.charAt(0).toUpperCase();
        
        historyContainer.appendChild(historyItem);
        
        // Limit history to 10 items
        const historyItems = historyContainer.querySelectorAll('.history-item');
        if (historyItems.length > 10) {
            historyContainer.removeChild(historyItems[0]);
        }
    }
    
    /**
     * Set up WebSocket handlers for race events
     */
    function setupWebSocketHandlers() {
        // Register handlers for WebSocket events
        if (window.websocketClient) {
            // Race Start Handler
            window.websocketClient.registerHandler('race_start', (message) => {
                console.log('WebSocket race_start event received:', message);
                
                // Update game state
                raceInProgress = true;
                
                // Reset UI
                resetRaceUI();
                
                // Update odds display
                if (message.odds) {
                    for (const suit in message.odds) {
                        const oddsDisplay = document.getElementById(`odds-${suit}`);
                        if (oddsDisplay) {
                            oddsDisplay.textContent = message.odds[suit].toFixed(1);
                        }
                    }
                }
                
                // Update buttons
                const startButton = document.getElementById('start-race');
                if (startButton) startButton.disabled = true;
                
                const drawButton = document.getElementById('draw-card');
                if (drawButton) drawButton.disabled = false;
                
                // Calculate burn amount
                const burnAmount = totalBet * 0.1;
                
                // Show notification
                showMessage(`Race started! 10% (${burnAmount.toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`);
            });
            
            // Card Drawn Handler
            window.websocketClient.registerHandler('card_drawn', (message) => {
                console.log('WebSocket card_drawn event received:', message);
                
                // Update card display
                const cardContainer = document.getElementById('drawn-card');
                if (cardContainer && message.card) {
                    cardContainer.innerHTML = '';
                    const cardElement = createCardElement(message.card);
                    cardContainer.appendChild(cardElement);
                }
                
                // Update progress bars
                if (message.progress) {
                    for (const suit in message.progress) {
                        const progressBar = document.getElementById(`${suit}-progress`);
                        if (progressBar) {
                            progressBar.style.width = `${message.progress[suit]}%`;
                        }
                    }
                }
                
                // Update odds if available
                if (message.odds) {
                    for (const suit in message.odds) {
                        const oddsDisplay = document.getElementById(`odds-${suit}`);
                        if (oddsDisplay) {
                            oddsDisplay.textContent = message.odds[suit].toFixed(1);
                        }
                    }
                }
            });
            
            // Race Finished Handler
            window.websocketClient.registerHandler('race_result', (message) => {
                console.log('WebSocket race_result event received:', message);
                
                // Update game state
                raceInProgress = false;
                
                // Update buttons
                const startButton = document.getElementById('start-race');
                if (startButton) startButton.disabled = false;
                
                const drawButton = document.getElementById('draw-card');
                if (drawButton) drawButton.disabled = true;
                
                // Add to history
                if (message.winner) {
                    // Determine if player bet on the winner
                    const playerBet = bets[message.winner] || 0;
                    addToHistory(message.winner, playerBet > 0);
                    
                    // Process win
                    if (playerBet > 0 && message.winnings > 0) {
                        showMessage(`${message.winner.charAt(0).toUpperCase() + message.winner.slice(1)} won! You win ${message.winnings.toFixed(2)} $CATTLE!`, 'success');
                        
                        // Show celebration if available
                        if (typeof window.showWinCelebration === 'function') {
                            window.showWinCelebration(message.winnings);
                        } else if (typeof window.createConfetti === 'function') {
                            window.createConfetti();
                        }
                        
                        // Notify via WebSocket API of the race result
                        if (window.websocketAPI && window.websocketAPI.sendRaceResult) {
                            window.websocketAPI.sendRaceResult(message.winner, message.winnings);
                        }
                    } else {
                        showMessage(`${message.winner.charAt(0).toUpperCase() + message.winner.slice(1)} won. You didn't bet on the winner.`, 'info');
                    }
                }
            });
            
            // Error Message Handler
            window.websocketClient.registerHandler('error', (message) => {
                console.error('WebSocket error event received:', message);
                showMessage(message.message || 'An error occurred', 'error');
            });
        }
    }
    
    /**
     * Show a message (using notification system if available)
     * @param {string} message - The message to show
     * @param {string} type - Message type
     */
    function showMessage(message, type = 'info') {
        console.log(`Racing Game Message (${type}): ${message}`);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Export functions globally for debugging and interaction
    window.racingGameWS = {
        init: initRacing,
        placeBet: placeBet,
        startRace: startRace,
        drawCard: drawCard,
        resetUI: resetRaceUI
    };
})();