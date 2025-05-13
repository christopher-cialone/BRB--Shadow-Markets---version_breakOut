/**
 * Bull Run Boost - Racing Game
 * 
 * This file contains the racing game logic for the Saloon scene.
 * It manages betting, race simulation, and winnings calculations.
 */

// Racing game state
const racingGameState = {
    bets: {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0
    },
    progress: {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0
    },
    raceActive: false,
    raceInterval: null,
    winner: null,
    odds: {
        hearts: 4.0,
        diamonds: 4.0,
        clubs: 4.0,
        spades: 4.0
    }
};

// Racing game controller
window.racingGame = {
    init: function() {
        this.resetRace();
        this.setupBettingSliders();
        this.updateTotalBet();
        
        // Set up event listeners
        const startRaceBtn = document.getElementById('start-race-btn');
        if (startRaceBtn) {
            startRaceBtn.addEventListener('click', () => this.startRace());
        }
        
        const resetRaceBtn = document.getElementById('reset-race-btn');
        if (resetRaceBtn) {
            resetRaceBtn.addEventListener('click', () => this.resetRace());
        }
        
        console.log('Racing game initialized');
    },
    
    setupBettingSliders: function() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        
        suits.forEach(suit => {
            const slider = document.querySelector(`.bet-slider[data-suit="${suit}"]`);
            const amount = document.querySelector(`.bet-amount[data-suit="${suit}"]`);
            const btn = document.querySelector(`.bet-btn[data-suit="${suit}"]`);
            
            if (slider && amount) {
                // Update amount display when slider changes
                slider.addEventListener('input', () => {
                    const value = parseInt(slider.value);
                    racingGameState.bets[suit] = value;
                    amount.textContent = value;
                    this.updateTotalBet();
                });
                
                // Reset display
                amount.textContent = '0';
                slider.value = 0;
            }
            
            if (btn) {
                // Quick bet buttons
                btn.addEventListener('click', () => {
                    if (!window.gameState || !window.gameState.player) return;
                    
                    // Add 10 to bet (up to player's balance)
                    const currentBet = racingGameState.bets[suit] || 0;
                    const playerBalance = window.gameState.player.cattleBalance || 0;
                    const maxBet = Math.min(currentBet + 10, playerBalance);
                    
                    if (slider && amount) {
                        slider.value = maxBet;
                        racingGameState.bets[suit] = maxBet;
                        amount.textContent = maxBet;
                        this.updateTotalBet();
                    }
                });
            }
        });
    },
    
    updateTotalBet: function() {
        // Calculate total bet
        const totalBet = Object.values(racingGameState.bets).reduce((sum, val) => sum + val, 0);
        
        // Update total bet display
        const totalBetDisplay = document.getElementById('current-bet');
        if (totalBetDisplay) {
            totalBetDisplay.textContent = totalBet;
        }
        
        // Enable/disable start race button based on bet
        const startRaceBtn = document.getElementById('start-race-btn');
        if (startRaceBtn) {
            startRaceBtn.disabled = totalBet <= 0;
        }
        
        return totalBet;
    },
    
    placeBet: function(suit, amount) {
        if (!window.gameState || !window.gameState.player) return false;
        
        const playerBalance = window.gameState.player.cattleBalance || 0;
        const currentBet = racingGameState.bets[suit] || 0;
        const totalCurrentBet = this.updateTotalBet();
        
        // Check if player has enough balance
        if (totalCurrentBet - currentBet + amount > playerBalance) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification('Not enough $CATTLE to place this bet!', 'error');
            }
            return false;
        }
        
        // Update bet
        racingGameState.bets[suit] = amount;
        
        // Update UI
        const slider = document.querySelector(`.bet-slider[data-suit="${suit}"]`);
        const amountDisplay = document.querySelector(`.bet-amount[data-suit="${suit}"]`);
        
        if (slider) slider.value = amount;
        if (amountDisplay) amountDisplay.textContent = amount;
        
        this.updateTotalBet();
        return true;
    },
    
    startRace: function() {
        if (racingGameState.raceActive) return;
        
        // Get total bet
        const totalBet = this.updateTotalBet();
        
        // Check if player has enough balance
        if (!window.gameState || !window.gameState.player) return;
        const playerBalance = window.gameState.player.cattleBalance || 0;
        
        if (totalBet <= 0) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification('Place a bet before starting the race!', 'error');
            }
            return;
        }
        
        if (totalBet > playerBalance) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification('Not enough $CATTLE to place this bet!', 'error');
            }
            return;
        }
        
        // Deduct bet from player's balance
        window.gameState.player.cattleBalance -= totalBet;
        
        // Apply 10% burn
        const burnAmount = totalBet * 0.1;
        if (window.gameState.player.stats) {
            window.gameState.player.stats.totalBurned = (window.gameState.player.stats.totalBurned || 0) + burnAmount;
        }
        
        // Update UI
        if (window.gameManager && window.gameManager.updateUI) {
            window.gameManager.updateUI();
        }
        
        // Start race
        racingGameState.raceActive = true;
        racingGameState.progress = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
        racingGameState.winner = null;
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('The race has begun!', 'info');
        }
        
        // Disable start button during race
        const startRaceBtn = document.getElementById('start-race-btn');
        if (startRaceBtn) startRaceBtn.disabled = true;
        
        // Simulate race
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        racingGameState.raceInterval = setInterval(() => {
            // Random progress for each horse
            const activeSuit = suits[Math.floor(Math.random() * suits.length)];
            racingGameState.progress[activeSuit] += Math.floor(Math.random() * 10) + 5;
            
            // Update progress display
            this.updateProgress(racingGameState.progress);
            
            // Check for winner
            const winner = Object.entries(racingGameState.progress).find(([suit, progress]) => progress >= 100);
            
            if (winner) {
                clearInterval(racingGameState.raceInterval);
                this.endRace(winner[0]);
            }
        }, 250);
    },
    
    updateProgress: function(progress) {
        // Update visual progress bars
        Object.entries(progress).forEach(([suit, value]) => {
            const progressBar = document.querySelector(`.race-progress[data-suit="${suit}"]`);
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, value)}%`;
            }
        });
        
        // Send progress update to server via WebSocket
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({
                type: 'race_progress',
                progress: progress
            }));
        }
    },
    
    endRace: function(winner) {
        // Stop race
        racingGameState.raceActive = false;
        racingGameState.winner = winner;
        
        // Calculate winnings
        const winningBet = racingGameState.bets[winner] || 0;
        const odds = racingGameState.odds[winner] || 4.0;
        const winnings = Math.floor(winningBet * odds);
        
        // Add winnings to player's balance if they bet on the winner
        if (winningBet > 0 && window.gameState && window.gameState.player) {
            window.gameState.player.cattleBalance += winnings;
            
            // Update stats
            if (window.gameState.player.stats) {
                window.gameState.player.stats.racesWon = (window.gameState.player.stats.racesWon || 0) + 1;
                window.gameState.player.stats.totalEarned = (window.gameState.player.stats.totalEarned || 0) + winnings;
            }
            
            // Notify player
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(`${winner} won! You earned ${winnings} $CATTLE!`, 'success');
            }
        } else {
            // Player didn't win
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(`${winner} won! Better luck next time.`, 'info');
            }
            
            // Update stats
            if (window.gameState && window.gameState.player && window.gameState.player.stats) {
                window.gameState.player.stats.racesLost = (window.gameState.player.stats.racesLost || 0) + 1;
            }
        }
        
        // Update UI
        if (window.gameManager && window.gameManager.updateUI) {
            window.gameManager.updateUI();
        }
        
        // Enable reset button
        const resetRaceBtn = document.getElementById('reset-race-btn');
        if (resetRaceBtn) resetRaceBtn.disabled = false;
        
        // Send race result to server via WebSocket
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({
                type: 'race_result',
                winner: winner,
                winnings: winnings,
                bets: racingGameState.bets
            }));
        }
        
        // Auto reset after a delay
        setTimeout(() => this.resetRace(), 3000);
    },
    
    resetRace: function() {
        // Reset race state
        racingGameState.progress = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
        racingGameState.raceActive = false;
        racingGameState.winner = null;
        
        // Reset UI
        this.updateProgress(racingGameState.progress);
        
        // Enable start button
        const startRaceBtn = document.getElementById('start-race-btn');
        if (startRaceBtn) startRaceBtn.disabled = this.updateTotalBet() <= 0;
        
        // Disable reset button
        const resetRaceBtn = document.getElementById('reset-race-btn');
        if (resetRaceBtn) resetRaceBtn.disabled = true;
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Ready for a new race!', 'info');
        }
    }
};

/**
 * Initialize the saloon scene UI and racing game
 */
function initSaloonScene() {
    console.log('Initializing saloon scene');
    
    // Create saloon UI if it doesn't exist
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;
    
    // Check if racing UI already exists
    let saloonUI = document.getElementById('saloon-ui');
    if (!saloonUI) {
        saloonUI = document.createElement('div');
        saloonUI.id = 'saloon-ui';
        saloonUI.className = 'ui-section';
        
        // Create racing UI
        saloonUI.innerHTML = `
            <div class="resource-display">
                <div>$CATTLE: <span id="saloon-cattle-balance">0</span></div>
                <div>Total Bet: <span id="current-bet">0</span></div>
            </div>
            
            <div class="race-tracks">
                <div class="race-track">
                    <div class="race-lane" data-suit="hearts">
                        <span class="race-label">♥</span>
                        <div class="race-track-bg">
                            <div class="race-progress" data-suit="hearts" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="race-lane" data-suit="diamonds">
                        <span class="race-label">♦</span>
                        <div class="race-track-bg">
                            <div class="race-progress" data-suit="diamonds" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="race-lane" data-suit="clubs">
                        <span class="race-label">♣</span>
                        <div class="race-track-bg">
                            <div class="race-progress" data-suit="clubs" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="race-lane" data-suit="spades">
                        <span class="race-label">♠</span>
                        <div class="race-track-bg">
                            <div class="race-progress" data-suit="spades" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="betting-controls">
                <div class="bet-option">
                    <button class="bet-btn" data-suit="hearts">♥</button>
                    <input type="range" min="0" max="50" value="0" class="bet-slider" data-suit="hearts">
                    <span class="bet-amount" data-suit="hearts">0</span>
                </div>
                <div class="bet-option">
                    <button class="bet-btn" data-suit="diamonds">♦</button>
                    <input type="range" min="0" max="50" value="0" class="bet-slider" data-suit="diamonds">
                    <span class="bet-amount" data-suit="diamonds">0</span>
                </div>
                <div class="bet-option">
                    <button class="bet-btn" data-suit="clubs">♣</button>
                    <input type="range" min="0" max="50" value="0" class="bet-slider" data-suit="clubs">
                    <span class="bet-amount" data-suit="clubs">0</span>
                </div>
                <div class="bet-option">
                    <button class="bet-btn" data-suit="spades">♠</button>
                    <input type="range" min="0" max="50" value="0" class="bet-slider" data-suit="spades">
                    <span class="bet-amount" data-suit="spades">0</span>
                </div>
            </div>
            
            <div class="action-buttons">
                <button id="start-race-btn" disabled>Start Race</button>
                <button id="reset-race-btn" disabled>Reset Race</button>
                <button id="return-from-saloon-btn">Return to Town</button>
            </div>
            
            <div class="notification"></div>
        `;
        
        uiContainer.appendChild(saloonUI);
    }
    
    // Initialize racing game
    if (window.racingGame) {
        window.racingGame.init();
    }
    
    // Add additional styles for racing game
    addRacingStyles();
}

/**
 * Add CSS styles for the racing game
 */
function addRacingStyles() {
    // Check if styles already exist
    if (document.getElementById('racing-styles')) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'racing-styles';
    style.textContent = `
        .race-tracks {
            margin: 20px 0;
        }
        
        .race-lane {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .race-label {
            font-size: 24px;
            width: 30px;
            text-align: center;
        }
        
        .race-track-bg {
            flex: 1;
            height: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            overflow: hidden;
        }
        
        .race-progress {
            height: 100%;
            width: 0%;
            transition: width 0.2s ease;
        }
        
        /* Suit colors */
        .race-lane[data-suit="hearts"] .race-label,
        .bet-btn[data-suit="hearts"] {
            color: #ff3399;
        }
        
        .race-lane[data-suit="diamonds"] .race-label,
        .bet-btn[data-suit="diamonds"] {
            color: #ff3333;
        }
        
        .race-lane[data-suit="clubs"] .race-label,
        .bet-btn[data-suit="clubs"] {
            color: #333333;
        }
        
        .race-lane[data-suit="spades"] .race-label,
        .bet-btn[data-suit="spades"] {
            color: #333333;
        }
        
        .race-progress[data-suit="hearts"] {
            background: linear-gradient(90deg, #ff3399, #ff66cc);
        }
        
        .race-progress[data-suit="diamonds"] {
            background: linear-gradient(90deg, #ff3333, #ff6666);
        }
        
        .race-progress[data-suit="clubs"] {
            background: linear-gradient(90deg, #333333, #666666);
        }
        
        .race-progress[data-suit="spades"] {
            background: linear-gradient(90deg, #333333, #666666);
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
}

// Make functions available globally
window.initSaloonScene = initSaloonScene;