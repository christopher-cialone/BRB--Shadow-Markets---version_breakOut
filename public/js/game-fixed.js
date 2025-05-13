// Simple game start handler to fix the broken UI
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing game button handlers...");
    
    // Initialize player data if needed
    if (typeof playerData === 'undefined') {
        window.playerData = {
            name: 'Cowboy',
            archetype: 'entrepreneur',
            cattleBalance: 100,
            hay: 50,
            water: 50,
            cattle: [],
            potions: []
        };
    }
    
    // Helper function to add click listeners
    function addClickListener(elementId, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            // Remove any existing event listeners to prevent duplicates
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // Add the new event listener
            newElement.addEventListener('click', callback);
            console.log(`Added click listener to ${elementId}`);
            return true;
        } else {
            console.error(`Element not found: ${elementId}`);
            return false;
        }
    }
    
    // Function to switch between scenes
    function switchScene(sceneName) {
        console.log(`Switching to scene: ${sceneName}`);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the requested screen
        let screenElement;
        switch(sceneName) {
            case 'main-menu':
                screenElement = document.getElementById('main-menu');
                break;
            case 'ranch':
                screenElement = document.getElementById('ranch-ui');
                break;
            case 'saloon':
                screenElement = document.getElementById('saloon-ui');
                break;
            case 'night':
                screenElement = document.getElementById('night-ui');
                break;
            case 'profile':
                screenElement = document.getElementById('profile-ui');
                break;
            default:
                console.error(`Unknown scene: ${sceneName}`);
                return;
        }
        
        if (screenElement) {
            screenElement.classList.remove('hidden');
            console.log(`UI updated for scene: ${sceneName}`);
        }
    }
    
    // Function to update all displays
    function updateAllDisplays() {
        // Update cattle balance display
        const cattleBalanceElements = document.querySelectorAll('#cattle-balance, #saloon-cattle-balance');
        cattleBalanceElements.forEach(element => {
            if (element) element.textContent = playerData.cattleBalance;
        });
        
        // Update resource displays
        const hayElement = document.getElementById('hay');
        const waterElement = document.getElementById('water');
        
        if (hayElement) hayElement.textContent = playerData.hay;
        if (waterElement) waterElement.textContent = playerData.water;
    }
    
    // Set up archetype selection
    document.querySelectorAll('.archetype-card').forEach(card => {
        card.addEventListener('click', () => {
            // Deselect all cards
            document.querySelectorAll('.archetype-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Select clicked card
            card.classList.add('selected');
            
            // Set archetype
            playerData.archetype = card.dataset.archetype;
            console.log(`Selected archetype: ${playerData.archetype}`);
        });
    });
    
    // Setup betting sliders functionality
    function setupBettingUI() {
        console.log("Setting up betting UI");
        // Get elements
        const betButtons = document.querySelectorAll('.bet-button');
        const betSliderOverlay = document.getElementById('bet-slider-overlay');
        
        if (!betButtons.length || !betSliderOverlay) {
            console.warn("Betting UI elements not found");
            return;
        }
        
        const betSlider = document.getElementById('bet-slider');
        const betSliderValue = document.getElementById('bet-slider-value');
        const confirmBetBtn = document.getElementById('confirm-bet');
        const cancelBetBtn = document.getElementById('cancel-bet');
        let currentSuit = '';
        
        console.log(`Setting up ${betButtons.length} bet buttons`);
        
        // Set up bet button clicks
        betButtons.forEach(button => {
            button.addEventListener('click', function() {
                const suit = this.getAttribute('data-suit');
                currentSuit = suit;
                console.log(`Bet button clicked for suit: ${suit}`);
                
                // Set slider title with capitalized suit name
                const capitalizedSuit = suit.charAt(0).toUpperCase() + suit.slice(1);
                document.getElementById('bet-slider-title').textContent = `Place Bet on ${capitalizedSuit}`;
                
                // Get current bet value for this suit
                const betDisplay = document.getElementById(`${suit}-bet-display`);
                const currentBet = betDisplay ? parseInt(betDisplay.textContent) || 0 : 0;
                
                betSlider.value = currentBet;
                betSliderValue.textContent = currentBet;
                
                // Set max value based on player balance
                betSlider.max = Math.min(50, Math.floor(playerData.cattleBalance));
                
                // Show the slider overlay
                betSliderOverlay.classList.remove('hidden');
            });
        });
        
        // Update slider value display as it changes
        if (betSlider) {
            betSlider.addEventListener('input', function() {
                betSliderValue.textContent = this.value;
            });
        }
        
        // Handle confirm bet
        if (confirmBetBtn) {
            confirmBetBtn.addEventListener('click', function() {
                if (currentSuit) {
                    console.log(`Confirming bet of ${betSlider.value} on ${currentSuit}`);
                    
                    // Update bet display
                    const betDisplay = document.getElementById(`${currentSuit}-bet-display`);
                    if (betDisplay) {
                        betDisplay.textContent = betSlider.value;
                    }
                    
                    // Update total bet
                    updateTotalBet();
                    
                    // Hide the slider overlay
                    betSliderOverlay.classList.add('hidden');
                }
            });
        }
        
        // Handle cancel bet
        if (cancelBetBtn) {
            cancelBetBtn.addEventListener('click', function() {
                console.log("Canceling bet");
                betSliderOverlay.classList.add('hidden');
            });
        }
    }
    
    // Function to update total bet
    function updateTotalBet() {
        let total = 0;
        
        // Get all bet values
        const suitsList = ['hearts', 'diamonds', 'clubs', 'spades'];
        suitsList.forEach(suit => {
            const betDisplay = document.getElementById(`${suit}-bet-display`);
            if (betDisplay) {
                total += parseInt(betDisplay.textContent) || 0;
            }
        });
        
        // Update total display
        const totalDisplay = document.getElementById('total-bet-amount');
        if (totalDisplay) {
            totalDisplay.textContent = total;
        }
        
        // Update burn amount (10%)
        const burnDisplay = document.getElementById('burn-amount');
        if (burnDisplay) {
            burnDisplay.textContent = Math.floor(total * 0.1);
        }
    }
    
    // Start Game button
    addClickListener('start-game', () => {
        console.log("Start Game button clicked");
        
        // Get player name
        const playerNameInput = document.getElementById('player-name');
        if (playerNameInput) {
            playerData.name = playerNameInput.value || 'Cowboy';
        }
        
        // Connect to server using the available socket connection
        // Try the Socket.IO connection first
        if (window.io && typeof io !== 'undefined') {
            try {
                // Use existing socketIO connection from game-init.js if available
                if (window.gameState && window.gameState.socketIO) {
                    window.gameState.socketIO.emit('new-player', {
                        name: playerData.name,
                        archetype: playerData.archetype
                    });
                    console.log("Using existing Socket.IO connection");
                } else {
                    // Create a new Socket.IO connection if needed
                    const socketIO = io();
                    socketIO.emit('new-player', {
                        name: playerData.name,
                        archetype: playerData.archetype
                    });
                    console.log("Created new Socket.IO connection");
                    
                    // Store for future use
                    if (window.gameState) {
                        window.gameState.socketIO = socketIO;
                    }
                }
            } catch (err) {
                console.error("Error with Socket.IO connection:", err);
            }
        } 
        
        // Switch to ranch scene
        switchScene('ranch');
        updateAllDisplays();
    });
    
    // TRAVEL BUTTONS
    // Go to saloon from ranch
    addClickListener('go-to-saloon', () => {
        switchScene('saloon');
        // Initialize betting UI after switching to saloon
        setTimeout(() => setupBettingUI(), 100);
    });
    
    // Go to night scene from ranch
    addClickListener('go-to-night', () => {
        switchScene('night');
    });
    
    // Go back to ranch from night
    addClickListener('back-to-ranch-night', () => {
        switchScene('ranch');
    });
    
    // Go to saloon from night
    addClickListener('go-to-saloon-from-night', () => {
        switchScene('saloon');
        // Initialize betting UI after switching to saloon
        setTimeout(() => setupBettingUI(), 100);
    });
    
    // Go to profile from various scenes
    ['go-to-profile-from-ranch', 'go-to-profile', 'go-to-profile-from-night'].forEach(id => {
        addClickListener(id, () => {
            switchScene('profile');
        });
    });
    
    // Go back to ranch from profile
    addClickListener('back-to-ranch-from-profile', () => {
        switchScene('ranch');
    });
    
    // Go back to ranch from saloon
    addClickListener('back-to-ranch', () => {
        switchScene('ranch');
    });
    
    console.log("Game button handlers initialized");
});