/**
 * Standalone Racing Game
 * A simplified, self-contained implementation of the saloon racing game
 * that works independently of other code
 */
(function() {
    // State variables
    let bets = {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0
    };
    
    let totalBet = 0;
    let raceInProgress = false;
    let socketConnected = false;
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initRacing);
    
    // Initialize the racing game
    function initRacing() {
        console.log("Initializing standalone racing game");
        
        // Set up socket connection
        if (window.io) {
            window.socket = io();
            
            window.socket.on('connect', () => {
                console.log('Connected to server');
                socketConnected = true;
                setupSocketListeners();
            });
            
            window.socket.on('disconnect', () => {
                console.log('Disconnected from server');
                socketConnected = false;
            });
        } else {
            console.error("Socket.io not available");
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
        
        // Log initialization
        console.log("Racing game initialized");
    }
    
    // Place a bet on a suit
    function placeBet(suit) {
        if (raceInProgress) {
            alert("Can't change bets during a race!");
            return;
        }
        
        // Cycle through bet values (0, 5, 10, 20, 50)
        const betValues = [0, 5, 10, 20, 50];
        const currentIndex = betValues.indexOf(bets[suit]);
        const nextIndex = (currentIndex + 1) % betValues.length;
        bets[suit] = betValues[nextIndex];
        
        // Update display
        updateBetDisplay(suit, bets[suit]);
        
        // Update total
        calculateTotalBet();
    }
    
    // Update the bet display for a suit
    function updateBetDisplay(suit, amount) {
        const display = document.getElementById(`${suit}-bet-display`);
        if (display) {
            display.textContent = amount;
        }
    }
    
    // Calculate and update total bet
    function calculateTotalBet() {
        totalBet = Object.values(bets).reduce((sum, bet) => sum + bet, 0);
        
        const totalDisplay = document.getElementById('total-bet-amount');
        if (totalDisplay) {
            totalDisplay.textContent = totalBet;
        }
    }
    
    // Start a race
    function startRace() {
        if (!socketConnected) {
            alert("Not connected to server. Please refresh the page.");
            return;
        }
        
        if (raceInProgress) {
            alert("Race already in progress!");
            return;
        }
        
        if (totalBet <= 0) {
            alert("Please place at least one bet to start the race!");
            return;
        }
        
        // Send race start request to server
        window.socket.emit('start-race', bets);
        console.log("Race start requested with bets:", bets);
    }
    
    // Draw a card
    function drawCard() {
        if (!socketConnected) {
            alert("Not connected to server. Please refresh the page.");
            return;
        }
        
        if (!raceInProgress) {
            alert("No race in progress. Start a race first!");
            return;
        }
        
        // Send draw card request
        window.socket.emit('draw-card');
        console.log("Card draw requested");
    }
    
    // Reset race UI
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
    
    // Create a card element
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
    
    // Set up socket listeners
    function setupSocketListeners() {
        // Race started
        window.socket.on('race-started', data => {
            console.log('Race started event received:', data);
            
            // Update game state
            raceInProgress = true;
            
            // Update UI
            resetRaceUI();
            
            // Update player data if available
            if (data.player && window.playerData) {
                window.playerData = data.player;
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
            
            // Update odds display
            for (const suit in data.odds) {
                const oddsDisplay = document.getElementById(`odds-${suit}`);
                if (oddsDisplay) {
                    oddsDisplay.textContent = data.odds[suit].toFixed(1);
                }
            }
            
            // Update buttons
            const startButton = document.getElementById('start-race');
            if (startButton) startButton.disabled = true;
            
            const drawButton = document.getElementById('draw-card');
            if (drawButton) drawButton.disabled = false;
            
            // Show notification
            showMessage(`Race started! 10% (${data.burnAmount.toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`);
        });
        
        // Card drawn
        window.socket.on('card-drawn', data => {
            console.log('Card drawn event received:', data);
            
            // Update card display
            const cardContainer = document.getElementById('drawn-card');
            if (cardContainer && data.card) {
                cardContainer.innerHTML = '';
                const cardElement = createCardElement(data.card);
                cardContainer.appendChild(cardElement);
            }
            
            // Update progress bars
            if (data.progress) {
                for (const suit in data.progress) {
                    const progressBar = document.getElementById(`${suit}-progress`);
                    if (progressBar) {
                        progressBar.style.width = `${data.progress[suit]}%`;
                    }
                }
            }
            
            // Update odds if available
            if (data.odds) {
                for (const suit in data.odds) {
                    const oddsDisplay = document.getElementById(`odds-${suit}`);
                    if (oddsDisplay) {
                        oddsDisplay.textContent = data.odds[suit].toFixed(1);
                    }
                }
            }
        });
        
        // Race finished
        window.socket.on('race-finished', data => {
            console.log('Race finished event received:', data);
            
            // Update game state
            raceInProgress = false;
            
            // Update buttons
            const startButton = document.getElementById('start-race');
            if (startButton) startButton.disabled = false;
            
            const drawButton = document.getElementById('draw-card');
            if (drawButton) drawButton.disabled = true;
            
            // Add to history
            addToHistory(data.winner, data.bet > 0);
            
            // Update player data if available
            if (data.player && window.playerData) {
                window.playerData = data.player;
                if (typeof window.updateUI === 'function') {
                    window.updateUI();
                }
            }
            
            // Show result message
            if (data.bet > 0 && data.winnings > 0) {
                showMessage(`${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won! You win ${data.winnings.toFixed(2)} $CATTLE!`, 'success');
                
                // Show celebration if available
                if (typeof window.showWinCelebration === 'function') {
                    window.showWinCelebration(data.winnings);
                } else if (typeof window.createConfetti === 'function') {
                    window.createConfetti();
                }
            } else {
                showMessage(`${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} won. You didn't bet on the winner.`, 'info');
            }
        });
        
        // Error messages
        window.socket.on('error-message', data => {
            console.error('Error message received:', data.message);
            showMessage(data.message, 'error');
        });
    }
    
    // Show a message (using notification system if available)
    function showMessage(message, type = 'info') {
        console.log(`Racing Game Message (${type}): ${message}`);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Export functions globally for debugging and interaction
    window.standaloneRacing = {
        init: initRacing,
        placeBet: placeBet,
        startRace: startRace,
        drawCard: drawCard,
        resetUI: resetRaceUI
    };
})();