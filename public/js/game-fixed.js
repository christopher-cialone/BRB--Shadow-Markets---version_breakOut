// Connect to server
const socket = io();

// Game state
let playerData = {
    name: 'Cowboy',
    archetype: 'Entrepreneur',
    characterType: 'the-kid',
    cattleBalance: 100,
    hay: 100,
    water: 100,
    ether: 0,
    barnCapacity: 100,
    cattle: [],
    potionCollection: [],
    stats: {
        racesWon: 0,
        racesLost: 0,
        cattleBred: 0,
        potionsCrafted: 0,
        totalEarned: 0,
        totalBurned: 0,
        plantsHarvested: 0,
        potionsDistilled: 0
    }
};

let marketPrice = 1.0;
let currentScene = 'main-menu';
let wagerAmount = 10;

// Initialize game elements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    // Helper function to safely add click event listeners
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
    
    // Helper function to switch between game screens
    function switchScene(sceneName) {
        console.log(`Switching to scene: ${sceneName}`);
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the target screen
        const targetScreen = document.getElementById(`${sceneName}-ui`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            currentScene = sceneName;
            console.log(`Scene switched to ${sceneName}`);
        } else if (sceneName === 'main-menu') {
            // Special case for main menu which doesn't have the -ui suffix
            const mainMenu = document.getElementById('main-menu');
            if (mainMenu) {
                mainMenu.classList.remove('hidden');
                currentScene = 'main-menu';
                console.log('Scene switched to main-menu');
            } else {
                console.error('Main menu element not found');
            }
        } else {
            console.error(`Target scene element not found: ${sceneName}-ui`);
        }
    }
    
    // Set up archetype selection
    document.querySelectorAll('.archetype-card').forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            document.querySelectorAll('.archetype-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Select clicked card
            card.classList.add('selected');
            
            // Set archetype
            playerData.archetype = card.dataset.archetype;
        });
    });
    
    // Start Game button
    addClickListener('start-game', () => {
        // Get player name
        const playerNameInput = document.getElementById('player-name');
        playerData.name = playerNameInput ? (playerNameInput.value || 'Cowboy') : 'Cowboy';
        
        // Connect to server
        socket.emit('new-player', {
            name: playerData.name,
            archetype: playerData.archetype
        });
        
        // Switch to ranch scene
        switchScene('ranch');
    });
    
    // RANCH UI EVENTS
    addClickListener('breed-cattle', () => {
        console.log("Breed cattle button clicked");
        alert("Breed cattle button works!");
    });
    
    // Initialize display of game state
    updateAllDisplays();
    
    // Function to update all UI displays with current state
    function updateAllDisplays() {
        // Update cattle balance displays
        document.querySelectorAll('#cattle-balance, #saloon-cattle-balance, #night-cattle-balance').forEach(el => {
            if (el) el.textContent = playerData.cattleBalance;
        });
        
        // Update resource displays
        const hayEl = document.getElementById('hay');
        const waterEl = document.getElementById('water');
        if (hayEl) hayEl.textContent = playerData.hay;
        if (waterEl) waterEl.textContent = playerData.water;
        
        // Update barn capacity displays
        document.querySelectorAll('#barn-capacity, #barn-capacity-2').forEach(el => {
            if (el) el.textContent = playerData.barnCapacity;
        });
    }
    
    // Socket event handlers
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
    
    // Log that initialization is complete
    console.log('Game initialization complete');
});