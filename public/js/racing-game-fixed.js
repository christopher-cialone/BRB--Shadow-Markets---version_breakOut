/**
 * Racing Game Module
 * Handles the saloon racing game with proper integration between server, DOM, and Phaser
 */
(function() {
    // Game state
    const raceState = {
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
        winner: null,
        history: []
    };

    // DOM elements cache
    let elements = {};
    
    // Socket reference
    let socket;
    
    // Reference to Phaser scene for cards
    let phaserScene;
    
    /**
     * Initialize the racing game
     */
    function initRacingGame() {
        console.log("Initializing racing game module");
        
        // Get socket reference
        socket = window.socket;
        if (!socket) {
            console.error("Socket connection not available!");
            return;
        }
        
        // Cache DOM elements
        cacheElements();
        
        // Setup event listeners
        setupBetButtons();
        setupRaceButtons();
        setupSocketListeners();
        
        // Reset display
        resetProgressBars();
        
        console.log("Racing game initialized successfully");
    }
    
    /**
     * Cache all required DOM elements
     */
    function cacheElements() {
        elements = {
            // Progress bars
            progressBars: {
                hearts: document.getElementById('hearts-progress'),
                diamonds: document.getElementById('diamonds-progress'),
                clubs: document.getElementById('clubs-progress'),
                spades: document.getElementById('spades-progress')
            },
            // Betting display
            betDisplays: {
                hearts: document.getElementById('hearts-bet-display'),
                diamonds: document.getElementById('diamonds-bet-display'),
                clubs: document.getElementById('clubs-bet-display'),
                spades: document.getElementById('spades-bet-display')
            },
            // Odds display
            oddsDisplays: {
                hearts: document.getElementById('odds-hearts'),
                diamonds: document.getElementById('odds-diamonds'),
                clubs: document.getElementById('odds-clubs'),
                spades: document.getElementById('odds-spades')
            },
            // Buttons
            buttons: {
                betHearts: document.getElementById('bet-hearts-btn'),
                betDiamonds: document.getElementById('bet-diamonds-btn'),
                betClubs: document.getElementById('bet-clubs-btn'),
                betSpades: document.getElementById('bet-spades-btn'),
                startRace: document.getElementById('start-race'),
                drawCard: document.getElementById('draw-card')
            },
            // Other elements
            totalBetAmount: document.getElementById('total-bet-amount'),
            drawnCard: document.getElementById('drawn-card'),
            resultsHistory: document.getElementById('results-history')
        };
        
        console.log("DOM elements cached");
    }
    
    /**
     * Set up bet buttons with proper event listeners
     */
    function setupBetButtons() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const betAmounts = [5, 10, 20, 50];
        
        suits.forEach(suit => {
            const btnElement = elements.buttons[`bet${suit.charAt(0).toUpperCase() + suit.slice(1)}`];
            if (!btnElement) return;
            
            let currentBetIndex = 0;
            
            btnElement.addEventListener('click', function() {
                console.log(`Bet button clicked for suit: ${suit}`);
                
                if (raceState.status !== 'betting') {
                    showNotification('Cannot change bets during a race!', 'error');
                    return;
                }
                
                // Cycle through bet amounts: 0, 5, 10, 20, 50, 0, ...
                currentBetIndex = (currentBetIndex + 1) % (betAmounts.length + 1);
                const betAmount = currentBetIndex === 0 ? 0 : betAmounts[currentBetIndex - 1];
                
                // Update bet display
                if (elements.betDisplays[suit]) {
                    elements.betDisplays[suit].textContent = betAmount;
                }
                
                // Update race state
                raceState.bets[suit] = betAmount;
                
                // Calculate and update total bet
                updateTotalBet();
                
                console.log(`Confirming bet of ${betAmount} on ${suit}`);
            });
        });
        
        console.log("Setting up bet buttons completed");
    }
    
    /**
     * Set up race control buttons
     */
    function setupRaceButtons() {
        // Set up start race button
        if (elements.buttons.startRace) {
            elements.buttons.startRace.addEventListener('click', function() {
                console.log("Start race button clicked");
                startRace();
            });
        }
        
        // Set up draw card button
        if (elements.buttons.drawCard) {
            elements.buttons.drawCard.disabled = true; // Initially disabled
            
            elements.buttons.drawCard.addEventListener('click', function() {
                console.log("Draw card button clicked");
                drawCard();
            });
        }
    }
    
    /**
     * Start a new race by sending the bets to the server
     */
    function startRace() {
        // Get bets from state
        const bets = raceState.bets;
        const totalBet = raceState.totalBet;
        
        console.log("Starting race with bets:", bets, "Total:", totalBet);
        
        // Validate bets
        if (totalBet <= 0) {
            showNotification('Place at least one bet to start the race!', 'error');
            return;
        }
        
        if (window.playerData && totalBet > window.playerData.cattleBalance) {
            showNotification('Not enough $CATTLE for your total bet!', 'error');
            return;
        }
        
        // Reset race state
        raceState.status = 'betting';
        raceState.progress = {
            hearts: 0,
            diamonds: 0,
            clubs: 0,
            spades: 0
        };
        raceState.winner = null;
        
        // Reset progress bars
        resetProgressBars();
        
        // Reset drawn card
        if (elements.drawnCard) {
            elements.drawnCard.innerHTML = '<div class="card-placeholder">Race is starting...</div>';
        }
        
        // Send start race event to server
        socket.emit('start-race', bets);
        console.log("Race start event emitted with bets:", bets);
    }
    
    /**
     * Draw a card to advance horses
     */
    function drawCard() {
        if (raceState.status !== 'racing') {
            console.warn("Cannot draw card - race is not in progress");
            return;
        }
        
        console.log("Drawing card...");
        
        // Send draw card event to server
        socket.emit('draw-card');
    }
    
    /**
     * Reset progress bars to zero
     */
    function resetProgressBars() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        suits.forEach(suit => {
            const progressBar = elements.progressBars[suit];
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        });
    }
    
    /**
     * Update the total bet display
     */
    function updateTotalBet() {
        // Calculate total bet
        const total = Object.values(raceState.bets).reduce((sum, bet) => sum + bet, 0);
        raceState.totalBet = total;
        
        // Update display
        if (elements.totalBetAmount) {
            elements.totalBetAmount.textContent = total;
        }
    }
    
    /**
     * Create a card element based on a card object
     */
    function createCardElement(card) {
        if (!card || !card.suit || !card.rank) {
            console.error("Invalid card data:", card);
            return document.createElement('div');
        }
        
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        
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
     * Update card display in both DOM and Phaser (if available)
     */
    function updateCardDisplay(card) {
        if (!card) return;
        
        console.log("Updating card display with card:", card);
        
        // Update DOM display
        const drawnCardContainer = elements.drawnCard;
        if (drawnCardContainer) {
            drawnCardContainer.innerHTML = '';
            const cardElement = createCardElement(card);
            drawnCardContainer.appendChild(cardElement);
        }
        
        // Update Phaser display (if available)
        if (phaserScene && typeof phaserScene.updateCardDisplay === 'function') {
            phaserScene.updateCardDisplay(card);
        }
    }
    
    /**
     * Update race progress in both DOM and Phaser (if available)
     */
    function updateProgress(progress) {
        if (!progress) return;
        
        console.log("Updating race progress:", progress);
        
        // Update state
        raceState.progress = progress;
        
        // Update DOM progress bars
        for (const suit in progress) {
            const progressBar = elements.progressBars[suit];
            if (progressBar) {
                progressBar.style.width = `${progress[suit]}%`;
            }
        }
        
        // Update Phaser display (if available)
        if (phaserScene && typeof phaserScene.updateRaceProgress === 'function') {
            phaserScene.updateRaceProgress(progress);
        }
    }
    
    /**
     * Add race result to history
     */
    function addToHistory(winner, isWin) {
        console.log(`Adding race result to history: ${winner} (Win: ${isWin})`);
        
        // Add to state history
        raceState.history.push({
            winner,
            isWin,
            timestamp: Date.now()
        });
        
        // Add to DOM
        const historyContainer = elements.resultsHistory;
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
     * Setup socket event listeners for race events
     */
    function setupSocketListeners() {
        console.log("Setting up socket listeners for racing game");
        
        if (!socket) {
            console.error("Socket connection not available!");
            return;
        }
        
        // Handle race started event
        socket.on('race-started', data => {
            console.log('Race started event received:', data);
            
            // Update player data if available
            if (data.player && window.playerData) {
                window.playerData = data.player;
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
            
            // Update race state
            raceState.status = 'racing';
            raceState.odds = data.odds || raceState.odds;
            raceState.progress = data.progress || raceState.progress;
            
            // Update UI elements
            resetProgressBars();
            updateProgress(raceState.progress);
            
            // Update odds display
            for (const suit in raceState.odds) {
                const oddsDisplay = elements.oddsDisplays[suit];
                if (oddsDisplay) {
                    oddsDisplay.textContent = raceState.odds[suit].toFixed(1);
                }
            }
            
            // Enable draw button, disable start button
            if (elements.buttons.drawCard) {
                elements.buttons.drawCard.disabled = false;
            }
            if (elements.buttons.startRace) {
                elements.buttons.startRace.disabled = true;
            }
            
            // Show notification
            const burnAmount = data.burnAmount || 0;
            showNotification(`Race started! 10% (${burnAmount.toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`, 'info');
        });
        
        // Handle card drawn event
        socket.on('card-drawn', data => {
            console.log('Card drawn event received:', data);
            
            // Get card and progress data
            const card = data.card;
            const progress = data.progress;
            
            // Update card display
            updateCardDisplay(card);
            
            // Update progress
            updateProgress(progress);
            
            // Update odds if available
            if (data.odds) {
                raceState.odds = data.odds;
                for (const suit in data.odds) {
                    const oddsDisplay = elements.oddsDisplays[suit];
                    if (oddsDisplay) {
                        oddsDisplay.textContent = data.odds[suit].toFixed(1);
                    }
                }
            }
        });
        
        // Handle race finished event
        socket.on('race-finished', data => {
            console.log('Race finished event received:', data);
            
            // Update player data if available
            if (data.player && window.playerData) {
                window.playerData = data.player;
            }
            
            // Update race state
            raceState.status = 'finished';
            raceState.winner = data.winner;
            
            // Disable draw button, enable start button
            if (elements.buttons.drawCard) {
                elements.buttons.drawCard.disabled = true;
            }
            if (elements.buttons.startRace) {
                elements.buttons.startRace.disabled = false;
            }
            
            // Add to history
            addToHistory(data.winner, data.bet > 0);
            
            // Show notification with result
            if (data.bet > 0 && data.winnings > 0) {
                // Show win celebration
                if (typeof window.createConfetti === 'function') {
                    window.createConfetti();
                }
                
                const winCelebration = document.getElementById('win-celebration');
                const winAmount = document.getElementById('win-amount');
                if (winCelebration && winAmount) {
                    winAmount.textContent = `+${data.winnings.toFixed(2)} $CATTLE`;
                    winCelebration.classList.remove('hidden');
                    
                    setTimeout(() => {
                        winCelebration.classList.add('hidden');
                    }, 3500);
                }
                
                // Show success notification
                showNotification(data.message || `${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won! You win ${data.winnings.toFixed(2)} $CATTLE!`, 'success');
            } else {
                // Show regular notification
                showNotification(data.message || `${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won the race.`, 'info');
            }
            
            // Update UI
            if (typeof window.updateUI === 'function') {
                window.updateUI();
            }
        });
        
        // Handle error messages
        socket.on('error-message', data => {
            console.error('Error message received:', data.message);
            showNotification(data.message, 'error');
        });
        
        console.log("Socket listeners setup complete");
    }
    
    /**
     * Show a notification if the function is available
     */
    function showNotification(message, type = 'info') {
        console.log(`Notification: ${message} (${type})`);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            if (type === 'error') {
                alert(message);
            } else {
                console.log(message);
            }
        }
    }
    
    /**
     * Set the Phaser scene reference for card rendering
     */
    function setPhaserScene(scene) {
        phaserScene = scene;
    }
    
    /**
     * Auto-initialize when in saloon
     */
    function initWhenReady() {
        if (document.getElementById('saloon-ui') && 
            document.getElementById('saloon-ui').classList.contains('active-ui')) {
            console.log("In saloon scene, auto-initializing racing game");
            initRacingGame();
        }
    }
    
    // Listen for scene changes
    document.addEventListener('scene-changed', function(e) {
        if (e.detail && e.detail.scene === 'saloon') {
            console.log("Scene changed to saloon, initializing racing game");
            initRacingGame();
        }
    });
    
    // Export the racing game API
    window.racingGame = {
        init: initRacingGame,
        setPhaserScene: setPhaserScene,
        startRace: startRace,
        drawCard: drawCard,
        updateCardDisplay: updateCardDisplay,
        updateProgress: updateProgress,
        addToHistory: addToHistory,
        initWhenReady: initWhenReady
    };
    
    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initWhenReady);
    
    // Also try to initialize immediately if the page is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initWhenReady, 100);
    }
})();