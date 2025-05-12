/**
 * Fixed Racing Game Implementation
 * This module fixes both the claim bonus functionality and race reset issues
 */

(function() {
    // Racing game state
    let gameState = {
        status: 'betting',  // 'betting', 'racing', 'finished'
        bets: {
            hearts: 0,
            diamonds: 0,
            clubs: 0,
            spades: 0
        },
        totalBet: 0,
        bonusClaimed: false
    };

    // When document is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Initializing fixed racing game module");
        initRacingGame();
    });

    // Initialize the racing game
    function initRacingGame() {
        // Setup button event listeners
        setupButtons();
        
        // Setup bet sliders
        setupBetSliders();
        
        // Connect to socket.io
        setupSocketConnection();
    }
    
    // Setup socket.io connection and event listeners
    function setupSocketConnection() {
        if (!window.socket) {
            console.log("No socket found, creating new connection");
            window.socket = io();
        }
        
        const socket = window.socket;
        
        // Race started event
        socket.on('race-started', function(data) {
            console.log("Race started event received", data);
            
            // Update game state
            gameState.status = 'racing';
            
            // Update UI
            updateUI();
            
            // Show notification
            showNotification("Race started! Draw cards to advance the race.", 'info');
        });
        
        // Card drawn event
        socket.on('card-drawn', function(data) {
            console.log("Card drawn event received", data);
            
            // Update progress bars
            updateProgressBars(data.progress);
            
            // Update card display
            updateCardDisplay(data.card);
        });
        
        // Race finished event
        socket.on('race-finished', function(data) {
            console.log("Race finished event received", data);
            
            // Update game state
            gameState.status = 'finished';
            
            let message;
            if (data.winnings > 0) {
                message = `Race finished! ${data.winner} won! You won ${data.winnings} $CATTLE!`;
                showWinCelebration(data.winnings);
            } else {
                message = `Race finished! ${data.winner} won! Better luck next time.`;
            }
            
            showNotification(message, data.winnings > 0 ? 'success' : 'info');
            
            // Add result to history
            addResultToHistory(data.winner, data.winnings > 0);
            
            // Update player balance if provided
            if (data.player && typeof data.player.cattleBalance !== 'undefined') {
                updateBalanceDisplay(data.player.cattleBalance);
            }
            
            // Reset game state after a delay
            setTimeout(function() {
                resetGameState();
            }, 3000);
        });
        
        // Bonus claimed event
        socket.on('bonus-claimed', function(data) {
            console.log("Bonus claimed event received", data);
            
            // Update game state
            gameState.bonusClaimed = true;
            
            // Update player balance if provided
            if (data.player && typeof data.player.cattleBalance !== 'undefined') {
                updateBalanceDisplay(data.player.cattleBalance);
            }
            
            // Show notification
            showNotification(`Bonus claimed! +${data.amount} $CATTLE added to your balance.`, 'success');
            
            // Update UI
            updateUI();
            
            // Show confetti animation if available
            if (typeof window.createConfetti === 'function') {
                window.createConfetti();
            }
        });
        
        // Error message event
        socket.on('error-message', function(data) {
            console.log("Error message received", data);
            
            // Show notification
            showNotification(data.message, 'error');
        });
    }
    
    // Setup all button event listeners
    function setupButtons() {
        // Start race button
        const startRaceBtn = document.getElementById('start-race-btn');
        if (startRaceBtn) {
            startRaceBtn.addEventListener('click', function() {
                startRace();
            });
        }
        
        // Draw card button
        const drawCardBtn = document.getElementById('draw-card-btn');
        if (drawCardBtn) {
            drawCardBtn.addEventListener('click', function() {
                drawCard();
            });
        }
        
        // Claim bonus button
        const claimBonusBtn = document.getElementById('claim-bonus');
        if (claimBonusBtn) {
            claimBonusBtn.addEventListener('click', function() {
                if (gameState.bonusClaimed) {
                    showNotification("You've already claimed your bonus!", 'warning');
                    return;
                }
                
                console.log("Claim bonus button clicked");
                if (window.socket) {
                    window.socket.emit('claim-bonus');
                } else {
                    console.error("Socket not available");
                }
            });
        }
        
        // Bet buttons
        const betButtons = document.querySelectorAll('.bet-button');
        betButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                if (gameState.status !== 'betting') {
                    showNotification("Can't place bets during a race", 'warning');
                    return;
                }
                
                const suit = this.dataset.suit;
                showBetSlider(suit);
            });
        });
    }
    
    // Setup bet sliders functionality
    function setupBetSliders() {
        const betSlider = document.getElementById('bet-slider');
        const betSliderValue = document.getElementById('bet-slider-value');
        const confirmBetBtn = document.getElementById('confirm-bet');
        const cancelBetBtn = document.getElementById('cancel-bet');
        const betSliderOverlay = document.getElementById('bet-slider-overlay');
        
        if (!betSlider || !betSliderValue || !confirmBetBtn || !cancelBetBtn || !betSliderOverlay) {
            return;
        }
        
        // Update value as slider moves
        betSlider.addEventListener('input', function() {
            betSliderValue.textContent = this.value;
        });
        
        // Confirm bet button
        confirmBetBtn.addEventListener('click', function() {
            const suit = document.getElementById('bet-slider-title').dataset.suit;
            const amount = parseInt(betSlider.value);
            
            if (isNaN(amount)) return;
            
            // Update bets
            gameState.bets[suit] = amount;
            gameState.totalBet = calculateTotalBet();
            
            // Update UI
            document.getElementById(`${suit}-bet-amount`).textContent = amount;
            document.getElementById('total-bet-amount').textContent = gameState.totalBet;
            document.getElementById('burn-amount').textContent = Math.floor(gameState.totalBet * 0.1);
            
            // Hide overlay
            betSliderOverlay.classList.add('hidden');
        });
        
        // Cancel bet button
        cancelBetBtn.addEventListener('click', function() {
            betSliderOverlay.classList.add('hidden');
        });
    }
    
    // Start a race
    function startRace() {
        if (gameState.status !== 'betting') {
            showNotification("Race already in progress", 'warning');
            return;
        }
        
        if (gameState.totalBet <= 0) {
            showNotification("Place your bets first!", 'warning');
            return;
        }
        
        console.log("Starting race with bets:", gameState.bets);
        
        // Set game state
        gameState.status = 'racing';
        
        // Update UI
        updateUI();
        
        // Reset progress bars
        resetProgressBars();
        
        // Send event to server
        if (window.socket) {
            window.socket.emit('start-race', gameState.bets);
        } else {
            console.error("Socket not available");
        }
    }
    
    // Draw a card to advance the race
    function drawCard() {
        if (gameState.status !== 'racing') {
            showNotification("Start a race first!", 'warning');
            return;
        }
        
        console.log("Drawing a card");
        
        // Send event to server
        if (window.socket) {
            window.socket.emit('draw-card');
        } else {
            console.error("Socket not available");
        }
    }
    
    // Show the bet slider for a particular suit
    function showBetSlider(suit) {
        const betSliderOverlay = document.getElementById('bet-slider-overlay');
        const betSliderTitle = document.getElementById('bet-slider-title');
        const betSlider = document.getElementById('bet-slider');
        const betSliderValue = document.getElementById('bet-slider-value');
        
        if (!betSliderOverlay || !betSliderTitle || !betSlider || !betSliderValue) {
            return;
        }
        
        // Set title and current value
        betSliderTitle.textContent = `Place Bet on ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
        betSliderTitle.dataset.suit = suit;
        
        // Set current value
        const currentBet = gameState.bets[suit] || 0;
        betSlider.value = currentBet;
        betSliderValue.textContent = currentBet;
        
        // Show overlay
        betSliderOverlay.classList.remove('hidden');
    }
    
    // Calculate total bet
    function calculateTotalBet() {
        return gameState.bets.hearts + gameState.bets.diamonds + gameState.bets.clubs + gameState.bets.spades;
    }
    
    // Update UI based on game state
    function updateUI() {
        // Update button states
        const startRaceBtn = document.getElementById('start-race-btn');
        const drawCardBtn = document.getElementById('draw-card-btn');
        const claimBonusBtn = document.getElementById('claim-bonus');
        
        if (startRaceBtn) {
            startRaceBtn.disabled = gameState.status !== 'betting';
            startRaceBtn.classList.toggle('disabled', gameState.status !== 'betting');
        }
        
        if (drawCardBtn) {
            drawCardBtn.disabled = gameState.status !== 'racing';
            drawCardBtn.classList.toggle('disabled', gameState.status !== 'racing');
        }
        
        if (claimBonusBtn) {
            claimBonusBtn.disabled = gameState.bonusClaimed;
            claimBonusBtn.classList.toggle('disabled', gameState.bonusClaimed);
            
            if (gameState.bonusClaimed) {
                claimBonusBtn.innerHTML = '<span class="icon">✓</span><span class="label">Bonus Claimed</span>';
            }
        }
    }
    
    // Reset game state after a race
    function resetGameState() {
        gameState.status = 'betting';
        gameState.bets = {
            hearts: 0,
            diamonds: 0,
            clubs: 0,
            spades: 0
        };
        gameState.totalBet = 0;
        
        // Update UI
        updateUI();
        
        // Clear bet displays
        document.getElementById('hearts-bet-amount').textContent = '0';
        document.getElementById('diamonds-bet-amount').textContent = '0';
        document.getElementById('clubs-bet-amount').textContent = '0';
        document.getElementById('spades-bet-amount').textContent = '0';
        document.getElementById('total-bet-amount').textContent = '0';
        document.getElementById('burn-amount').textContent = '0';
        
        // Clear card display
        const cardDisplay = document.getElementById('drawn-card');
        if (cardDisplay) {
            cardDisplay.innerHTML = '';
        }
        
        // Reset progress bars
        resetProgressBars();
        
        // Show notification
        showNotification("Ready for a new race! Place your bets.", 'info');
    }
    
    // Reset progress bars
    function resetProgressBars() {
        const heartProgress = document.getElementById('hearts-progress');
        const diamondProgress = document.getElementById('diamonds-progress');
        const clubProgress = document.getElementById('clubs-progress');
        const spadeProgress = document.getElementById('spades-progress');
        
        if (heartProgress) heartProgress.style.width = '0%';
        if (diamondProgress) diamondProgress.style.width = '0%';
        if (clubProgress) clubProgress.style.width = '0%';
        if (spadeProgress) spadeProgress.style.width = '0%';
    }
    
    // Update progress bars with new progress
    function updateProgressBars(progress) {
        if (!progress) return;
        
        const heartProgress = document.getElementById('hearts-progress');
        const diamondProgress = document.getElementById('diamonds-progress');
        const clubProgress = document.getElementById('clubs-progress');
        const spadeProgress = document.getElementById('spades-progress');
        
        if (heartProgress && typeof progress.hearts !== 'undefined') {
            heartProgress.style.width = `${progress.hearts}%`;
        }
        
        if (diamondProgress && typeof progress.diamonds !== 'undefined') {
            diamondProgress.style.width = `${progress.diamonds}%`;
        }
        
        if (clubProgress && typeof progress.clubs !== 'undefined') {
            clubProgress.style.width = `${progress.clubs}%`;
        }
        
        if (spadeProgress && typeof progress.spades !== 'undefined') {
            spadeProgress.style.width = `${progress.spades}%`;
        }
    }
    
    // Update the card display
    function updateCardDisplay(card) {
        if (!card) return;
        
        const cardDisplay = document.getElementById('drawn-card');
        if (!cardDisplay) return;
        
        // Clear display
        cardDisplay.innerHTML = '';
        
        // Create card element
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
        
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        const cardTop = document.createElement('div');
        cardTop.className = 'card-top';
        cardTop.innerHTML = `${card.rank}<br>${card.suit}`;
        
        const cardCenter = document.createElement('div');
        cardCenter.className = 'card-center';
        cardCenter.textContent = card.suit;
        
        const cardBottom = document.createElement('div');
        cardBottom.className = 'card-bottom';
        cardBottom.innerHTML = `${card.rank}<br>${card.suit}`;
        
        cardInner.appendChild(cardTop);
        cardInner.appendChild(cardCenter);
        cardInner.appendChild(cardBottom);
        cardEl.appendChild(cardInner);
        
        cardDisplay.appendChild(cardEl);
    }
    
    // Add a result to the history
    function addResultToHistory(winner, isWin) {
        const historyContainer = document.getElementById('results-history');
        if (!historyContainer) return;
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${winner} ${isWin ? 'win' : 'loss'}`;
        historyItem.textContent = winner.charAt(0).toUpperCase();
        
        historyContainer.appendChild(historyItem);
        
        // Limit history to 10 items
        const items = historyContainer.querySelectorAll('.history-item');
        if (items.length > 10) {
            historyContainer.removeChild(items[0]);
        }
    }
    
    // Update balance display
    function updateBalanceDisplay(balance) {
        const balanceElements = document.querySelectorAll('.cattle-balance');
        balanceElements.forEach(function(element) {
            if (element) {
                element.textContent = balance;
            }
        });
    }
    
    // Show a notification
    function showNotification(message, type = 'info') {
        console.log(`Notification: ${message} (${type})`);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    // Show win celebration
    function showWinCelebration(amount) {
        if (typeof window.showWinCelebration === 'function') {
            window.showWinCelebration(amount);
        } else if (typeof window.createConfetti === 'function') {
            window.createConfetti();
        }
    }
    
    // Expose some functions for external use
    window.racingGameFixes = {
        init: initRacingGame,
        startRace: startRace,
        drawCard: drawCard,
        claimBonus: function() {
            const claimBonusBtn = document.getElementById('claim-bonus');
            if (claimBonusBtn) {
                claimBonusBtn.click();
            }
        }
    };
    
    // Initialize when in racing view
    if (document.getElementById('saloon-ui') && 
        !document.getElementById('saloon-ui').classList.contains('hidden')) {
        console.log("Already in saloon scene, initializing racing game");
        initRacingGame();
    }
    
    // Also initialize when scene changes
    document.addEventListener('scene-changed', function(e) {
        if (e.detail && e.detail.scene === 'saloon') {
            console.log("Scene changed to saloon, initializing racing game");
            initRacingGame();
        }
    });
    
    console.log("Fixed racing game module loaded");
})();