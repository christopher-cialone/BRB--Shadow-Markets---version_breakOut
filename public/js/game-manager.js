/**
 * Bull Run Boost - Game Manager
 * 
 * This file orchestrates the game flow between scenes and UI elements.
 * It follows the switchScene function approach you suggested for handling
 * both Phaser scene transitions and DOM UI visibility.
 */

// Game state tracking
let currentScene = 'main-menu';
let gameInitialized = false;

// Initialize game state
window.gameState = {
    player: {
        cattleBalance: 100,
        hay: 50,
        water: 50,
        wheat: 5,
        crystals: 0,
        potions: 0,
        stats: {
            racesWon: 0,
            racesLost: 0,
            totalEarned: 0,
            totalBurned: 0,
            fieldsHarvested: 0,
            cattleBred: 0
        }
    },
    cattle: [],
    fields: [],
    lastLogin: Date.now()
};

// Reference to UI elements
const uiElements = {
    mainMenu: null,
    ranchUI: null,
    saloonUI: null,
    nightUI: null,
    profileUI: null
};

// Initialize game scenes and UI
function initializeGame() {
    if (gameInitialized) return;
    
    try {
        // Load saved game data if available
        if (window.loadGameState) {
            window.loadGameState();
        }
        
        // Create Phaser game configuration
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'game-container',
            pixelArt: true,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [
                MainScene,
                // SaloonScene is defined in its own file
                EtherScene
            ],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };
        
        // Initialize Phaser game
        window.game = new Phaser.Game(config);
        
        // Store references to UI elements
        uiElements.mainMenu = document.getElementById('main-menu');
        uiElements.ranchUI = document.getElementById('ranch-ui');
        uiElements.saloonUI = document.getElementById('saloon-ui');
        uiElements.nightUI = document.getElementById('ether-ui');
        uiElements.profileUI = document.getElementById('profile-ui');
        
        // Initialize UI event listeners
        initializeUIListeners();
        
        // Setup auto-save functionality
        if (window.setupAutoSave) {
            window.setupAutoSave(2); // Auto-save every 2 minutes
        }
        
        // Mark as initialized
        gameInitialized = true;
        
        console.log('Game Manager initialized');
    } catch (err) {
        console.error('Error initializing game:', err);
        alert('There was a problem initializing the game. Please try refreshing the page.');
    }
}

// Initialize UI event listeners
function initializeUIListeners() {
    // Setup listeners for UI buttons that trigger scene transitions
    const sceneButtons = {
        'return-from-ranch-btn': 'main-scene',
        'return-from-saloon-btn': 'main-scene',
        'return-from-ether-btn': 'main-scene',
        'return-from-profile-btn': 'main-scene'
    };
    
    // Add event listeners to buttons
    Object.entries(sceneButtons).forEach(([btnId, targetScene]) => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', () => switchScene(targetScene));
        }
    });
}

// Switch between scenes and update UI visibility
function switchScene(sceneName) {
    try {
        console.log(`Switching to scene: ${sceneName}`);
        
        // Update current scene tracker
        currentScene = sceneName;
        
        // Hide all UI elements
        Object.values(uiElements).forEach(element => {
            if (element) element.classList.add('hidden');
        });
        
        // Show the relevant UI based on scene
        const uiMap = {
            'main-scene': uiElements.mainMenu,
            'ranch-scene': uiElements.ranchUI,
            'saloon-scene': uiElements.saloonUI,
            'ether-scene': uiElements.nightUI,
            'profile-scene': uiElements.profileUI
        };
        
        const targetUI = uiMap[sceneName];
        if (targetUI) {
            targetUI.classList.remove('hidden');
        }
        
        // Start the corresponding Phaser scene if the game exists
        if (window.game && window.game.scene) {
            try {
                // Stop all running scenes first
                window.game.scene.getScenes(true).forEach(scene => {
                    window.game.scene.sleep(scene.scene.key);
                });
                
                // Map sceneName to Phaser scene key
                const sceneMap = {
                    'main-scene': 'MainScene',
                    'ranch-scene': 'RanchScene',
                    'saloon-scene': 'SaloonScene',
                    'ether-scene': 'EtherScene'
                };
                
                const phaserScene = sceneMap[sceneName];
                if (phaserScene) {
                    // Check if scene exists and start it
                    if (window.game.scene.getScene(phaserScene)) {
                        window.game.scene.wake(phaserScene);
                    } else {
                        window.game.scene.start(phaserScene);
                    }
                }
            } catch (err) {
                console.error('Error switching Phaser scene:', err);
                showNotification('Error switching scenes. Please refresh the page.', 'error');
            }
        }
        
        // Initialize scene-specific logic based on your original switchScene implementation
        try {
            if (sceneName === 'ranch-scene' && window.initRanchGrid) {
                window.initRanchGrid();
            }
            if (sceneName === 'ether-scene' && window.initShadowGrid) {
                window.initShadowGrid();
            }
            if (sceneName === 'saloon-scene' && window.initSaloonScene) {
                window.initSaloonScene();
            }
            if (sceneName === 'profile-scene' && window.updateProfileUI) {
                window.updateProfileUI();
            }
        } catch (err) {
            console.error('Error initializing scene-specific logic:', err);
            showNotification('Error initializing scene. Please try again.', 'error');
        }
        
        // Update UI with current state
        updateUI();
    } catch (err) {
        console.error('Error in switchScene:', err);
        showNotification('An error occurred while changing scenes.', 'error');
    }
}

// Update UI elements with current game state
function updateUI() {
    try {
        if (!window.gameState || !window.gameState.player) return;
        
        const player = window.gameState.player;
        
        // Update resource displays across all UI sections
        updateResourceDisplays(player);
        
        // Update betting sliders if in saloon
        if (currentScene === 'saloon-scene') {
            updateBettingControls(player);
        }
        
        // Update breeding UI if in ranch
        if (currentScene === 'ranch-scene' && window.updateBreedingControls) {
            window.updateBreedingControls(player);
        }
        
        // Update ether UI if in night scene
        if (currentScene === 'ether-scene' && window.updateEtherControls) {
            window.updateEtherControls(player);
        }
        
        console.log('UI updated with current game state');
    } catch (err) {
        console.error('Error in updateUI:', err);
    }
}

// Update resource displays across all UI sections
function updateResourceDisplays(player) {
    try {
        // Update cattle balance displays
        ['cattle-balance', 'ranch-cattle-balance', 'saloon-cattle-balance', 'ether-cattle-balance'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = player.cattleBalance || 0;
        });
        
        // Update hay amount displays
        ['hay-amount', 'ranch-hay-amount'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = player.hay || 0;
        });
        
        // Update water amount displays
        ['water-amount', 'ranch-water-amount'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = player.water || 0;
        });
        
        // Update wheat amount displays
        ['wheat-amount', 'ranch-wheat-amount'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = player.wheat || 0;
        });
        
        // Update crystal and potion displays
        const crystalElement = document.getElementById('crystal-amount');
        const potionElement = document.getElementById('potion-amount');
        
        if (crystalElement) crystalElement.textContent = player.crystals || 0;
        if (potionElement) potionElement.textContent = player.potions || 0;
    } catch (err) {
        console.error('Error in updateResourceDisplays:', err);
    }
}

// Update betting controls in the saloon
function updateBettingControls(player) {
    try {
        // Enable/disable bet buttons based on player's balance
        const betButtons = document.querySelectorAll('.bet-btn');
        const startRaceBtn = document.getElementById('start-race-btn');
        
        betButtons.forEach(btn => {
            try {
                btn.disabled = player.cattleBalance <= 0;
            } catch (err) {
                console.error('Error updating bet button:', err);
            }
        });
        
        if (startRaceBtn) {
            startRaceBtn.disabled = player.cattleBalance <= 0;
        }
    } catch (err) {
        console.error('Error in updateBettingControls:', err);
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    try {
        const notifications = document.querySelectorAll('.notification');
        
        if (notifications.length === 0) {
            // Create a notification element if none exists
            const notificationDiv = document.createElement('div');
            notificationDiv.className = 'notification';
            document.body.appendChild(notificationDiv);
            
            // Call function again now that we have a notification element
            setTimeout(() => showNotification(message, type), 100);
            return;
        }
        
        notifications.forEach(notification => {
            notification.textContent = message;
            notification.className = 'notification active ' + type;
            
            // Auto-hide after delay
            setTimeout(() => {
                try {
                    notification.className = 'notification';
                } catch (err) {
                    console.error('Error hiding notification:', err);
                }
            }, 5000);
        });
        
        // Also log to console
        console.log(`Notification: ${message} (${type})`);
    } catch (err) {
        // Fallback to console only if display fails
        console.error('Error showing notification:', err);
        console.log(`Notification: ${message} (${type})`);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Export functions for use in Phaser scenes
window.gameManager = {
    switchScene,
    updateUI,
    showNotification
};

// Also expose switchScene directly as a global function
window.switchScene = switchScene;