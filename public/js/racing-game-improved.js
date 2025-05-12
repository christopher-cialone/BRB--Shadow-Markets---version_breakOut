/**
 * Improved Racing Game Module
 * Handles the saloon racing game with proper integration between server, DOM, and Phaser
 * Includes fixes for bonus button and race reset functionality
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
        history: [],
        bonusClaimed: false
    };
    
    // References
    let socket = null;
    let phaserScene = null;
    let elements = {};
    
    /**
     * Initialize the racing game with all event listeners and UI
     */
    function initRacingGame() {
        console.log("Initializing standalone racing game");
        
        // Get socket from window
        if (window.socket) {
            socket = window.socket;
        } else {
            socket = io();
            window.socket = socket;
        }
        
        // Get DOM elements
        elements = {
            startRaceButton: document.getElementById('start-race-btn'),
            drawCardButton: document.getElementById('draw-card-btn'),
            claimBonusButton: document.getElementById('claim-bonus'),
            bettingForm: document.getElementById('betting-form'),
            heartsBet: document.getElementById('hearts-bet'),
            diamondsBet: document.getElementById('diamonds-bet'),
            clubsBet: document.getElementById('clubs-bet'),
            spadesBet: document.getElementById('spades-bet'),
            totalBetDisplay: document.getElementById('total-bet'),
            burnAmountDisplay: document.getElementById('burn-amount'),
            heartsProgress: document.getElementById('hearts-progress'),
            diamondsProgress: document.getElementById('diamonds-progress'),
            clubsProgress: document.getElementById('clubs-progress'),
            spadesProgress: document.getElementById('spades-progress'),
            cardDisplay: document.getElementById('drawn-card'),
            resultsContainer: document.getElementById('results-history')
        };
        
        // Setup betting sliders if they exist
        setupBettingUI();
        
        // Setup socket event listeners
        setupSocketListeners();
        
        // Reset the UI to initial state
        resetUI();
        
        // Setup action buttons
        setupActionButtons();
        
        console.log("Racing game initialized");
    }
    
    /**
     * Set up the betting UI
     */
    function setupBettingUI() {
        // For each betting input, add listeners to update the total
        const bettingInputs = [
            elements.heartsBet,
            elements.diamondsBet,
            elements.clubsBet,
            elements.spadesBet
        ];
        
        bettingInputs.forEach(input => {
            if (!input) return;
            
            // Use input event for real-time updates
            input.addEventListener('input', updateTotalBet);
            
            // Ensure no negative values
            input.addEventListener('blur', function() {
                if (this.value < 0) this.value = 0;
                updateTotalBet();
            });
            
            // Start with value of 0
            input.value = 0;
        });
        
        updateTotalBet();
    }
    
    /**
     * Update total bet display
     */
    function updateTotalBet() {
        // Calculate total bet
        let total = 0;
        
        if (elements.heartsBet) total += parseInt(elements.heartsBet.value) || 0;
        if (elements.diamondsBet) total += parseInt(elements.diamondsBet.value) || 0;
        if (elements.clubsBet) total += parseInt(elements.clubsBet.value) || 0;
        if (elements.spadesBet) total += parseInt(elements.spadesBet.value) || 0;
        
        raceState.totalBet = total;
        
        // Update UI
        if (elements.totalBetDisplay) {
            elements.totalBetDisplay.textContent = total;
        }
        
        // Calculate burn amount (10% of total bet)
        const burnAmount = Math.floor(total * 0.1);
        if (elements.burnAmountDisplay) {
            elements.burnAmountDisplay.textContent = burnAmount;
        }
    }
    
    /**
     * Set up event listeners for the action buttons
     */
    function setupActionButtons() {
        // Clone and replace to remove any existing event listeners
        if (elements.startRaceButton) {
            const newStartRaceButton = elements.startRaceButton.cloneNode(true);
            elements.startRaceButton.parentNode.replaceChild(newStartRaceButton, elements.startRaceButton);
            elements.startRaceButton = newStartRaceButton;
            
            elements.startRaceButton.addEventListener('click', function() {
                console.log("Start race button clicked");
                startRace();
            });
        }
        
        if (elements.drawCardButton) {
            const newDrawCardButton = elements.drawCardButton.cloneNode(true);
            elements.drawCardButton.parentNode.replaceChild(newDrawCardButton, elements.drawCardButton);
            elements.drawCardButton = newDrawCardButton;
            
            elements.drawCardButton.addEventListener('click', function() {
                console.log("Draw card button clicked");
                drawCard();
            });
        }
        
        if (elements.claimBonusButton) {
            const newClaimBonusButton = elements.claimBonusButton.cloneNode(true);
            elements.claimBonusButton.parentNode.replaceChild(newClaimBonusButton, elements.claimBonusButton);
            elements.claimBonusButton = newClaimBonusButton;
            
            elements.claimBonusButton.addEventListener('click', function() {
                console.log("Claim bonus button clicked");
                claimBonus();
            });
        }
        
        // Disable appropriate buttons based on game state
        updateButtonStates();
    }
    
    /**
     * Claim bonus from server
     */
    function claimBonus() {
        if (!socket) {
            console.error("Socket not available");
            return;
        }
        
        if (raceState.bonusClaimed) {
            showNotification("You've already claimed your bonus!", 'error');
            return;
        }
        
        // Emit claim bonus event
        socket.emit('claim-bonus');
    }
    
    /**
     * Start a new race
     */
    function startRace() {
        if (raceState.status !== 'betting') {
            showNotification("Race already in progress!", 'error');
            return;
        }
        
        if (raceState.totalBet <= 0) {
            showNotification("Place your bet first!", 'error');
            return;
        }
        
        // Gather bets data
        const bets = {
            hearts: parseInt(elements.heartsBet?.value) || 0,
            diamonds: parseInt(elements.diamondsBet?.value) || 0,
            clubs: parseInt(elements.clubsBet?.value) || 0,
            spades: parseInt(elements.spadesBet?.value) || 0
        };
        
        console.log("Starting race with bets:", bets);
        
        // Update game state
        raceState.bets = bets;
        raceState.status = 'racing';
        
        // Reset progress
        raceState.progress = {
            hearts: 0,
            diamonds: 0,
            clubs: 0,
            spades: 0
        };
        
        // Update race UI
        updateProgressBars();
        updateButtonStates();
        
        // Emit start-race event to server
        if (socket) {
            socket.emit('start-race', bets);
        }
    }
    
    /**
     * Draw a card to advance the race
     */
    function drawCard() {
        if (raceState.status !== 'racing') {
            showNotification("Start a race first!", 'error');
            return;
        }
        
        // Emit draw-card event to server
        if (socket) {
            socket.emit('draw-card');
        }
    }
    
    /**
     * Reset UI for a new round
     */
    function resetUI() {
        // Reset progress bars
        if (elements.heartsProgress) elements.heartsProgress.style.width = '0%';
        if (elements.diamondsProgress) elements.diamondsProgress.style.width = '0%';
        if (elements.clubsProgress) elements.clubsProgress.style.width = '0%';
        if (elements.spadesProgress) elements.spadesProgress.style.width = '0%';
        
        // Reset card display
        if (elements.cardDisplay) elements.cardDisplay.innerHTML = '';
        
        // Update button states
        updateButtonStates();
    }
    
    /**
     * Update button states based on game status
     */
    function updateButtonStates() {
        if (!elements.startRaceButton || !elements.drawCardButton) return;
        
        // Start Race Button
        if (raceState.status === 'betting') {
            elements.startRaceButton.disabled = false;
            elements.startRaceButton.classList.remove('disabled');
        } else {
            elements.startRaceButton.disabled = true;
            elements.startRaceButton.classList.add('disabled');
        }
        
        // Draw Card Button
        if (raceState.status === 'racing') {
            elements.drawCardButton.disabled = false;
            elements.drawCardButton.classList.remove('disabled');
        } else {
            elements.drawCardButton.disabled = true;
            elements.drawCardButton.classList.add('disabled');
        }
        
        // Betting Inputs
        const bettingInputs = [
            elements.heartsBet,
            elements.diamondsBet,
            elements.clubsBet,
            elements.spadesBet
        ];
        
        bettingInputs.forEach(input => {
            if (!input) return;
            
            if (raceState.status === 'betting') {
                input.disabled = false;
            } else {
                input.disabled = true;
            }
        });
        
        // Claim Bonus Button
        if (elements.claimBonusButton) {
            if (raceState.bonusClaimed) {
                elements.claimBonusButton.disabled = true;
                elements.claimBonusButton.classList.add('disabled');
                elements.claimBonusButton.innerHTML = 'Bonus Claimed <span style="font-size:0.8em">(+50 $CATTLE)</span>';
            }
        }
    }
    
    /**
     * Update progress bars with current race progress
     */
    function updateProgressBars() {
        if (elements.heartsProgress) elements.heartsProgress.style.width = `${raceState.progress.hearts}%`;
        if (elements.diamondsProgress) elements.diamondsProgress.style.width = `${raceState.progress.diamonds}%`;
        if (elements.clubsProgress) elements.clubsProgress.style.width = `${raceState.progress.clubs}%`;
        if (elements.spadesProgress) elements.spadesProgress.style.width = `${raceState.progress.spades}%`;
    }
    
    /**
     * Set up socket event listeners
     */
    function setupSocketListeners() {
        if (!socket) {
            console.error("Socket not initialized!");
            return;
        }
        
        // Race started event
        socket.on('race-started', (data) => {
            console.log("Race started event received:", data);
            
            // Update odds
            if (data.odds) {
                raceState.odds = data.odds;
                updateOddsDisplay(data.odds);
            }
            
            // Update player balance if provided
            if (data.player && data.player.cattleBalance !== undefined) {
                updatePlayerBalance(data.player.cattleBalance);
            }
            
            showNotification("Race started! Draw cards to see which horse will win!", 'success');
        });
        
        // Card drawn event
        socket.on('card-drawn', (data) => {
            console.log("Card drawn event received:", data);
            
            // Update progress
            if (data.progress) {
                raceState.progress = data.progress;
                updateProgressBars();
            }
            
            // Update card display
            if (data.card) {
                updateCardDisplay(data.card);
                
                // Also update the card in Phaser scene if available
                if (phaserScene && typeof phaserScene.updateCardDisplay === 'function') {
                    phaserScene.updateCardDisplay(data.card);
                }
            }
        });
        
        // Race finished event
        socket.on('race-finished', (data) => {
            console.log("Race finished event received:", data);
            
            raceState.status = 'finished';
            raceState.winner = data.winner;
            
            // Show winner notification
            let message = `Race finished! Winner: ${data.winner}`;
            let type = 'info';
            
            // Display winnings if any
            if (data.winnings && data.winnings > 0) {
                message += ` - You won ${data.winnings} $CATTLE!`;
                type = 'success';
                
                // Trigger confetti if available
                if (typeof window.createConfetti === 'function') {
                    window.createConfetti();
                }
                
                // Show win celebration if available
                if (typeof window.showWinCelebration === 'function') {
                    window.showWinCelebration(data.winnings);
                }
            } else {
                message += " - Better luck next time!";
                type = 'warning';
            }
            
            showNotification(message, type);
            
            // Add to history
            addToHistory(data.winner, data.winnings > 0);
            
            // Update player balance if provided
            if (data.player && data.player.cattleBalance !== undefined) {
                updatePlayerBalance(data.player.cattleBalance);
            }
            
            // After a short delay, reset back to betting state to allow a new round
            setTimeout(() => {
                raceState.status = 'betting';
                resetUI();
                updateButtonStates();
                
                // Reset betting inputs
                if (elements.heartsBet) elements.heartsBet.value = 0;
                if (elements.diamondsBet) elements.diamondsBet.value = 0;
                if (elements.clubsBet) elements.clubsBet.value = 0;
                if (elements.spadesBet) elements.spadesBet.value = 0;
                
                updateTotalBet();
            }, 3000);
        });
        
        // Bonus claimed event
        socket.on('bonus-claimed', (data) => {
            console.log("Bonus claimed event received:", data);
            
            if (data.amount) {
                showNotification(`Bonus claimed! +${data.amount} $CATTLE added to your balance.`, 'success');
                
                // Update state
                raceState.bonusClaimed = true;
                
                // Update player balance if provided
                if (data.player && data.player.cattleBalance !== undefined) {
                    updatePlayerBalance(data.player.cattleBalance);
                }
                
                // Update button state
                updateButtonStates();
                
                // Trigger confetti if available
                if (typeof window.createConfetti === 'function') {
                    window.createConfetti();
                }
            }
        });
        
        // Error message event
        socket.on('error-message', (data) => {
            console.log("Error message received:", data);
            showNotification(data.message, 'error');
        });
    }
    
    /**
     * Update odds display in UI
     */
    function updateOddsDisplay(odds) {
        // Update odds displays if they exist
        const oddsDisplays = {
            hearts: document.getElementById('hearts-odds'),
            diamonds: document.getElementById('diamonds-odds'),
            clubs: document.getElementById('clubs-odds'),
            spades: document.getElementById('spades-odds')
        };
        
        for (const suit in oddsDisplays) {
            if (oddsDisplays[suit] && odds[suit]) {
                oddsDisplays[suit].textContent = `${odds[suit].toFixed(1)}x`;
            }
        }
    }
    
    /**
     * Update player balance display
     */
    function updatePlayerBalance(balance) {
        const balanceDisplays = document.querySelectorAll('.cattle-balance');
        balanceDisplays.forEach(display => {
            display.textContent = balance;
        });
    }
    
    /**
     * Add race result to history
     */
    function addToHistory(winner, isWin) {
        if (!elements.resultsContainer) return;
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${winner} ${isWin ? 'win' : 'loss'}`;
        historyItem.textContent = winner.charAt(0).toUpperCase();
        
        elements.resultsContainer.appendChild(historyItem);
        
        // Limit history to 10 items
        const historyItems = elements.resultsContainer.querySelectorAll('.history-item');
        if (historyItems.length > 10) {
            elements.resultsContainer.removeChild(historyItems[0]);
        }
    }
    
    /**
     * Update the card display
     */
    function updateCardDisplay(card) {
        if (!card || !elements.cardDisplay) return;
        
        elements.cardDisplay.innerHTML = '';
        
        // Create card element
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
        
        // Create card content
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        cardContent.innerHTML = `
            <div class="card-corner top-left">
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit">${card.suit}</div>
            </div>
            <div class="card-center">${card.suit}</div>
            <div class="card-corner bottom-right">
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit">${card.suit}</div>
            </div>
        `;
        
        cardElement.appendChild(cardContent);
        elements.cardDisplay.appendChild(cardElement);
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
            setTimeout(initRacingGame, 100); // Add a slight delay for DOM to be ready
        }
    });
    
    // Go ahead and initialize immediately if we're on saloon
    initWhenReady();
    
    // Export the racing game API
    window.racingGame = {
        init: initRacingGame,
        setPhaserScene: setPhaserScene,
        drawCard: drawCard,
        startRace: startRace,
        claimBonus: claimBonus,
        updateProgress: function(progress) {
            raceState.progress = progress;
            updateProgressBars();
        },
        updateButtonStates: updateButtonStates,
        resetUI: resetUI,
        updateCardDisplay: updateCardDisplay,
        state: raceState  // Expose state for debugging
    };
    
    console.log("Racing game module loaded");
})();