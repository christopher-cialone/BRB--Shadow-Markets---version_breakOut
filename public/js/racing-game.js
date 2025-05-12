// Racing game functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing racing game functionality");
    
    // Socket connection - reusing the existing socket from game.js
    const socket = window.socket || io();
    if (!window.socket) window.socket = socket;
    
    // Race state
    const raceState = {
        status: 'betting', // 'betting', 'racing', 'finished'
        bets: {
            hearts: 0,
            diamonds: 0,
            clubs: 0,
            spades: 0
        },
        totalBet: 0,
        odds: {
            hearts: 4.0,
            diamonds: 4.0,
            clubs: 4.0,
            spades: 4.0
        },
        progress: {
            hearts: 0,
            diamonds: 0,
            clubs: 0,
            spades: 0
        },
        winner: null,
        currentCard: null
    };
    
    // Initialize the racing game
    function initRacingGame() {
        console.log("Initializing race UI");
        setupBetButtons();
        setupRaceButtons();
        setupSocketListeners();
    }
    
    // Setup bet buttons with sliding bet UI
    function setupBetButtons() {
        const betButtons = document.querySelectorAll('.bet-button');
        const betSliderOverlay = document.getElementById('bet-slider-overlay');
        const betSlider = document.getElementById('bet-slider');
        const betSliderValue = document.getElementById('bet-slider-value');
        const confirmBetBtn = document.getElementById('confirm-bet');
        const cancelBetBtn = document.getElementById('cancel-bet');
        let currentSuit = '';
        
        console.log(`Setting up ${betButtons.length} bet buttons`);
        
        // Handle bet button clicks to show slider
        betButtons.forEach(button => {
            button.addEventListener('click', function() {
                const suit = this.getAttribute('data-suit');
                currentSuit = suit;
                console.log(`Bet button clicked for suit: ${suit}`);
                
                // Set slider title with capitalized suit name
                const capitalizedSuit = suit.charAt(0).toUpperCase() + suit.slice(1);
                const sliderTitle = document.getElementById('bet-slider-title');
                if (sliderTitle) sliderTitle.textContent = `Place Bet on ${capitalizedSuit}`;
                
                // Get current bet value for this suit
                const betDisplay = document.getElementById(`${suit}-bet-display`);
                const currentBet = betDisplay ? parseInt(betDisplay.textContent) || 0 : 0;
                
                if (betSlider) {
                    betSlider.value = currentBet;
                    // Set max value based on player balance
                    if (window.playerData) {
                        betSlider.max = Math.min(50, Math.floor(window.playerData.cattleBalance || 100));
                    }
                }
                
                if (betSliderValue) betSliderValue.textContent = currentBet;
                
                // Show the slider overlay
                if (betSliderOverlay) betSliderOverlay.classList.remove('hidden');
            });
        });
        
        // Update slider value display as it changes
        if (betSlider) {
            betSlider.addEventListener('input', function() {
                if (betSliderValue) betSliderValue.textContent = this.value;
            });
        }
        
        // Handle confirm bet
        if (confirmBetBtn) {
            confirmBetBtn.addEventListener('click', function() {
                if (currentSuit && betSlider) {
                    const betValue = parseInt(betSlider.value) || 0;
                    console.log(`Confirming bet of ${betValue} on ${currentSuit}`);
                    
                    // Update bet display
                    const betDisplay = document.getElementById(`${currentSuit}-bet-display`);
                    if (betDisplay) {
                        betDisplay.textContent = betValue;
                    }
                    
                    // Update race state
                    raceState.bets[currentSuit] = betValue;
                    updateTotalBet();
                }
                
                // Hide the slider overlay
                if (betSliderOverlay) betSliderOverlay.classList.add('hidden');
            });
        }
        
        // Handle cancel bet
        if (cancelBetBtn) {
            cancelBetBtn.addEventListener('click', function() {
                // Hide the slider overlay without changing the bet
                if (betSliderOverlay) betSliderOverlay.classList.add('hidden');
            });
        }
    }
    
    // Setup race control buttons
    function setupRaceButtons() {
        const startRaceBtn = document.getElementById('start-race');
        const drawCardBtn = document.getElementById('draw-card');
        
        // Start race button
        if (startRaceBtn) {
            startRaceBtn.addEventListener('click', function() {
                console.log("Start race button clicked");
                startRace();
            });
        }
        
        // Draw card button
        if (drawCardBtn) {
            drawCardBtn.disabled = true; // Disabled until race starts
            
            drawCardBtn.addEventListener('click', function() {
                console.log("Draw card button clicked");
                drawCard();
            });
        }
    }
    
    // Start a new race
    function startRace() {
        // Get bets from UI
        const bets = {
            hearts: parseInt(document.getElementById('hearts-bet-display')?.textContent) || 0,
            diamonds: parseInt(document.getElementById('diamonds-bet-display')?.textContent) || 0,
            clubs: parseInt(document.getElementById('clubs-bet-display')?.textContent) || 0,
            spades: parseInt(document.getElementById('spades-bet-display')?.textContent) || 0
        };
        
        console.log("Bets:", bets);
        
        // Calculate total bet
        const totalBet = bets.hearts + bets.diamonds + bets.clubs + bets.spades;
        console.log("Total bet:", totalBet);
        
        // Validate bets
        if (totalBet <= 0) {
            if (window.showNotification) {
                window.showNotification('Please place at least one bet to start the race!', 'error');
            } else {
                alert('Please place at least one bet to start the race!');
            }
            return;
        }
        
        if (window.playerData && totalBet > window.playerData.cattleBalance) {
            if (window.showNotification) {
                window.showNotification('Not enough $CATTLE for your total bet!', 'error');
            } else {
                alert('Not enough $CATTLE for your total bet!');
            }
            return;
        }
        
        // Reset race state
        raceState.status = 'betting';
        raceState.bets = bets;
        raceState.totalBet = totalBet;
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
        const drawnCardContainer = document.getElementById('drawn-card');
        if (drawnCardContainer) {
            drawnCardContainer.innerHTML = '<div class="card-placeholder">Race is starting...</div>';
        }
        
        // Send start race event to server
        socket.emit('start-race', bets);
        console.log("Race start event emitted with bets:", bets);
    }
    
    // Draw a card to advance horses
    function drawCard() {
        if (raceState.status !== 'racing') {
            console.warn("Cannot draw card - race is not in progress");
            return;
        }
        
        // Send draw card event to server
        socket.emit('draw-card');
        console.log("Draw card event emitted");
    }
    
    // Reset progress bars to zero
    function resetProgressBars() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        suits.forEach(suit => {
            const progressBar = document.getElementById(`${suit}-progress`);
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        });
    }
    
    // Update race display based on current state
    function updateRaceDisplay() {
        // Update progress bars
        for (const suit in raceState.progress) {
            const progressBar = document.getElementById(`${suit}-progress`);
            if (progressBar) {
                progressBar.style.width = `${raceState.progress[suit]}%`;
            }
        }
        
        // Update odds display
        for (const suit in raceState.odds) {
            const oddsElement = document.getElementById(`odds-${suit}`);
            if (oddsElement) {
                oddsElement.textContent = raceState.odds[suit].toFixed(1);
            }
        }
        
        // Update button states
        const startRaceBtn = document.getElementById('start-race');
        const drawCardBtn = document.getElementById('draw-card');
        
        if (startRaceBtn) {
            startRaceBtn.disabled = (raceState.status === 'racing');
        }
        
        if (drawCardBtn) {
            drawCardBtn.disabled = (raceState.status !== 'racing');
        }
    }
    
    // Update total bet display
    function updateTotalBet() {
        // Recalculate total from individual bets
        raceState.totalBet = Object.values(raceState.bets).reduce((sum, bet) => sum + bet, 0);
        
        // Update display if it exists
        const totalBetDisplay = document.getElementById('total-bet-display');
        if (totalBetDisplay) {
            totalBetDisplay.textContent = raceState.totalBet;
        }
        
        console.log("Total bet updated:", raceState.totalBet);
    }
    
    // Create a card element
    function createCardElement(card) {
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
    
    // Setup socket event listeners
    function setupSocketListeners() {
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
            
            // Update race display
            updateRaceDisplay();
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Race started! 10% (${(data.burnAmount || 0).toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`, 'info');
            }
        });
        
        // Handle card drawn event
        socket.on('card-drawn', data => {
            console.log('Card drawn event received:', data);
            
            // Update race state
            raceState.currentCard = data.card;
            raceState.progress = data.progress || raceState.progress;
            raceState.odds = data.odds || raceState.odds;
            
            // Create and display the card
            const drawnCardContainer = document.getElementById('drawn-card');
            if (drawnCardContainer && data.card) {
                drawnCardContainer.innerHTML = '';
                const cardElement = createCardElement(data.card);
                drawnCardContainer.appendChild(cardElement);
            }
            
            // Update race display
            updateRaceDisplay();
        });
        
        // Handle race finished event
        socket.on('race-finished', data => {
            console.log('Race finished event received:', data);
            
            // Update player data if available
            if (data.player && window.playerData) {
                window.playerData = data.player;
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
            
            // Update race state
            raceState.status = 'finished';
            raceState.winner = data.winner;
            
            // Add to race history
            addToHistory(data.winner, data.bet > 0);
            
            // Update race display
            updateRaceDisplay();
            
            // Show celebration for winners
            if (data.bet > 0 && data.winnings > 0) {
                if (typeof window.showWinCelebration === 'function') {
                    window.showWinCelebration(data.winnings);
                }
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification(data.message || `${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won! You win ${data.winnings.toFixed(1)} $CATTLE!`, 'success');
                }
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification(data.message || `${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won! You didn't bet on the winner.`, 'info');
                }
            }
        });
        
        // Handle error messages
        socket.on('error-message', data => {
            console.error('Error message received:', data.message);
            
            if (typeof window.showNotification === 'function') {
                window.showNotification(data.message, 'error');
            } else {
                alert(data.message);
            }
        });
    }
    
    // Add race result to history
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
    
    // Initialize racing game when in saloon
    function initRacingWhenInSaloon() {
        if (document.getElementById('saloon-ui') && 
            document.getElementById('saloon-ui').classList.contains('active-ui')) {
            console.log("In saloon scene, initializing racing game");
            initRacingGame();
        }
    }
    
    // Initialize on saloon UI activation
    document.addEventListener('scene-changed', function(e) {
        if (e.detail && e.detail.scene === 'saloon') {
            console.log("Scene changed to saloon, initializing racing game");
            initRacingGame();
        }
    });
    
    // Update the progress bars directly from Phaser
    function updateProgress(progress) {
        if (!progress) return;
        
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        suits.forEach(suit => {
            const progressBar = document.getElementById(`${suit}-progress`);
            if (progressBar) {
                progressBar.style.width = `${progress[suit]}%`;
                console.log(`${suit} progress updated to ${progress[suit]}%`);
            }
        });
    }
    
    // Function to handle updating the card display from DOM
    function updateCardDisplay(card) {
        if (!card) return;
        
        const drawnCardContainer = document.getElementById('drawn-card');
        if (drawnCardContainer) {
            drawnCardContainer.innerHTML = '';
            const cardElement = createCardElement(card);
            drawnCardContainer.appendChild(cardElement);
            console.log('Card displayed in DOM:', card);
        }
    }
    
    // Custom event for initialization
    function triggerInitialization() {
        // If the saloon UI is active or we're on a specific scene, initialize
        if (document.getElementById('saloon-ui') && 
            (window.currentScene === 'saloon' || 
             document.getElementById('saloon-ui').classList.contains('active-ui'))) {
            console.log("Saloon detected on initialization, setting up racing");
            initRacingGame();
        }
    }
    
    // Export functions to window for access from other scripts
    window.racingGame = {
        init: initRacingGame,
        startRace: startRace,
        drawCard: drawCard,
        updateTotalBet: updateTotalBet,
        updateProgress: updateProgress,
        updateCardDisplay: updateCardDisplay,
        triggerInitialization: triggerInitialization
    };
    
    // Initialize if necessary
    setTimeout(triggerInitialization, 500);
});