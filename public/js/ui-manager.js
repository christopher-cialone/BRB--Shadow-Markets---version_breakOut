/**
 * Bull Run Boost - UI Manager
 * 
 * This file handles the management of the UI elements and their interaction with Phaser scenes.
 * It provides functions to switch between different UI states and update the display.
 */

// Track current scene
let currentScene = 'main-scene';

// Cache DOM elements
let mainMenu = null;
let ranchUI = null;
let saloonUI = null;
let etherUI = null;
let profileUI = null;

// Initialize UI elements after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Try to get UI elements
    mainMenu = document.getElementById('main-menu');
    ranchUI = document.getElementById('ranch-ui');
    saloonUI = document.getElementById('saloon-ui');
    etherUI = document.getElementById('ether-ui');
    profileUI = document.getElementById('profile-ui');
    
    // Create UI elements if they don't exist
    createUIElements();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Log initialization
    console.log('UI Manager initialized');
});

// Create UI elements if they don't exist
function createUIElements() {
    const uiContainer = document.getElementById('ui-container');
    if (!uiContainer) return;
    
    // Create main menu if it doesn't exist
    if (!mainMenu) {
        mainMenu = document.createElement('div');
        mainMenu.id = 'main-menu';
        mainMenu.className = 'ui-section';
        mainMenu.innerHTML = `
            <div class="resource-display">
                <div>$CATTLE: <span id="cattle-balance">0</span></div>
                <div>Hay: <span id="hay-amount">0</span></div>
                <div>Wheat: <span id="wheat-amount">0</span></div>
            </div>
            <div class="action-buttons">
                <button id="claim-bonus-btn">Claim 50 $CATTLE Bonus</button>
            </div>
            <div class="notification"></div>
        `;
        uiContainer.appendChild(mainMenu);
    }
    
    // Create ranch UI if it doesn't exist
    if (!ranchUI) {
        ranchUI = document.createElement('div');
        ranchUI.id = 'ranch-ui';
        ranchUI.className = 'ui-section hidden';
        ranchUI.innerHTML = `
            <div class="resource-display">
                <div>$CATTLE: <span id="ranch-cattle-balance">0</span></div>
                <div>Hay: <span id="ranch-hay-amount">0</span></div>
                <div>Wheat: <span id="ranch-wheat-amount">0</span></div>
            </div>
            <div class="action-buttons">
                <button id="buy-seeds-btn">Buy Seeds (10 $CATTLE)</button>
                <button id="harvest-all-btn">Harvest All</button>
                <button id="return-from-ranch-btn">Return to Town</button>
            </div>
            <div class="notification"></div>
        `;
        uiContainer.appendChild(ranchUI);
    }
    
    // Create saloon UI if it doesn't exist
    if (!saloonUI) {
        saloonUI = document.createElement('div');
        saloonUI.id = 'saloon-ui';
        saloonUI.className = 'ui-section hidden';
        saloonUI.innerHTML = `
            <div class="resource-display">
                <div>$CATTLE: <span id="saloon-cattle-balance">0</span></div>
                <div>Current Bet: <span id="current-bet">0</span></div>
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
                <button id="start-race-btn">Start Race</button>
                <button id="return-from-saloon-btn">Return to Town</button>
            </div>
            <div class="notification"></div>
        `;
        uiContainer.appendChild(saloonUI);
    }
    
    // Create ether UI if it doesn't exist
    if (!etherUI) {
        etherUI = document.createElement('div');
        etherUI.id = 'ether-ui';
        etherUI.className = 'ui-section hidden';
        etherUI.innerHTML = `
            <div class="resource-display">
                <div>$CATTLE: <span id="ether-cattle-balance">0</span></div>
                <div>Crystals: <span id="crystal-amount">0</span></div>
                <div>Potions: <span id="potion-amount">0</span></div>
            </div>
            <div class="action-buttons">
                <button id="craft-potion-btn">Craft Potion</button>
                <button id="return-from-ether-btn">Return to Town</button>
            </div>
            <div class="notification"></div>
        `;
        uiContainer.appendChild(etherUI);
    }
    
    // Create profile UI if it doesn't exist
    if (!profileUI) {
        profileUI = document.createElement('div');
        profileUI.id = 'profile-ui';
        profileUI.className = 'ui-section hidden';
        profileUI.innerHTML = `
            <div class="profile-stats">
                <h3>Player Profile</h3>
                <div>Name: <span id="player-name">Rancher</span></div>
                <div>Type: <span id="player-type">The Kid</span></div>
                <div>Races Won: <span id="races-won">0</span></div>
                <div>Cattle Bred: <span id="cattle-bred">0</span></div>
                <div>Potions Crafted: <span id="potions-crafted">0</span></div>
            </div>
            <div class="action-buttons">
                <button id="return-from-profile-btn">Return to Town</button>
            </div>
        `;
        uiContainer.appendChild(profileUI);
    }
}

// Initialize event listeners for UI elements
function initializeEventListeners() {
    // Main menu buttons
    const claimBonusBtn = document.getElementById('claim-bonus-btn');
    if (claimBonusBtn) {
        claimBonusBtn.addEventListener('click', () => {
            if (window.gameState && window.gameState.socketIO) {
                window.gameState.socketIO.emit('claim-bonus');
            }
        });
    }
    
    // Ranch UI buttons
    const buySeeds = document.getElementById('buy-seeds-btn');
    const harvestAll = document.getElementById('harvest-all-btn');
    const returnFromRanch = document.getElementById('return-from-ranch-btn');
    
    if (buySeeds) {
        buySeeds.addEventListener('click', () => {
            // Trigger the buy seeds action in the current Phaser scene
            const currentScene = window.game.scene.getScenes(true)[0];
            if (currentScene && currentScene.buySeedsClicked) {
                currentScene.buySeedsClicked();
            }
        });
    }
    
    if (harvestAll) {
        harvestAll.addEventListener('click', () => {
            // Trigger harvest all in current scene
            const currentScene = window.game.scene.getScenes(true)[0];
            if (currentScene && currentScene.harvestAll) {
                currentScene.harvestAll();
            }
        });
    }
    
    if (returnFromRanch) {
        returnFromRanch.addEventListener('click', () => {
            // Return to main scene
            switchScene('main-scene');
        });
    }
    
    // Saloon UI buttons
    const startRace = document.getElementById('start-race-btn');
    const returnFromSaloon = document.getElementById('return-from-saloon-btn');
    
    if (startRace) {
        startRace.addEventListener('click', () => {
            // Trigger race start in current scene
            const currentScene = window.game.scene.getScenes(true)[0];
            if (currentScene && currentScene.startRace) {
                currentScene.startRace();
            }
        });
    }
    
    if (returnFromSaloon) {
        returnFromSaloon.addEventListener('click', () => {
            // Return to main scene
            switchScene('main-scene');
        });
    }
    
    // Ether UI buttons
    const craftPotion = document.getElementById('craft-potion-btn');
    const returnFromEther = document.getElementById('return-from-ether-btn');
    
    if (craftPotion) {
        craftPotion.addEventListener('click', () => {
            // Trigger potion crafting in current scene
            const currentScene = window.game.scene.getScenes(true)[0];
            if (currentScene && currentScene.craftPotion) {
                currentScene.craftPotion();
            }
        });
    }
    
    if (returnFromEther) {
        returnFromEther.addEventListener('click', () => {
            // Return to main scene
            switchScene('main-scene');
        });
    }
    
    // Profile UI buttons
    const returnFromProfile = document.getElementById('return-from-profile-btn');
    if (returnFromProfile) {
        returnFromProfile.addEventListener('click', () => {
            // Return to main scene
            switchScene('main-scene');
        });
    }
}

// Function to switch between scenes and update UI
function switchScene(sceneName) {
    console.log(`Switching to scene: ${sceneName}`);
    
    // Update current scene tracker
    currentScene = sceneName;
    
    // Hide all UI elements
    [mainMenu, ranchUI, saloonUI, etherUI, profileUI].forEach(ui => {
        if (ui) ui.classList.add('hidden');
    });
    
    // Show the relevant UI based on scene
    const uiMap = {
        'main-scene': mainMenu,
        'ranch-scene': ranchUI,
        'saloon-scene': saloonUI,
        'ether-scene': etherUI,
        'profile-scene': profileUI
    };
    
    const targetUI = uiMap[sceneName];
    if (targetUI) {
        targetUI.classList.remove('hidden');
    }
    
    // Start the corresponding Phaser scene if the game exists
    if (window.game && window.game.scene) {
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
    }
    
    // Update UI with current state
    updateUI();
}

// Update UI elements with current game state
function updateUI() {
    if (!window.gameState || !window.gameState.player) return;
    
    const player = window.gameState.player;
    
    // Update main menu
    const cattleBalance = document.getElementById('cattle-balance');
    const hayAmount = document.getElementById('hay-amount');
    const wheatAmount = document.getElementById('wheat-amount');
    
    if (cattleBalance) cattleBalance.textContent = player.cattleBalance || 0;
    if (hayAmount) hayAmount.textContent = player.hay || 0;
    if (wheatAmount) wheatAmount.textContent = player.wheat || 0;
    
    // Update ranch UI
    const ranchCattleBalance = document.getElementById('ranch-cattle-balance');
    const ranchHayAmount = document.getElementById('ranch-hay-amount');
    const ranchWheatAmount = document.getElementById('ranch-wheat-amount');
    
    if (ranchCattleBalance) ranchCattleBalance.textContent = player.cattleBalance || 0;
    if (ranchHayAmount) ranchHayAmount.textContent = player.hay || 0;
    if (ranchWheatAmount) ranchWheatAmount.textContent = player.wheat || 0;
    
    // Update saloon UI
    const saloonCattleBalance = document.getElementById('saloon-cattle-balance');
    if (saloonCattleBalance) saloonCattleBalance.textContent = player.cattleBalance || 0;
    
    // Update ether UI
    const etherCattleBalance = document.getElementById('ether-cattle-balance');
    const crystalAmount = document.getElementById('crystal-amount');
    const potionAmount = document.getElementById('potion-amount');
    
    if (etherCattleBalance) etherCattleBalance.textContent = player.cattleBalance || 0;
    if (crystalAmount) crystalAmount.textContent = player.crystals || 0;
    if (potionAmount) potionAmount.textContent = player.potions || 0;
    
    // Update profile UI
    const playerName = document.getElementById('player-name');
    const playerType = document.getElementById('player-type');
    const racesWon = document.getElementById('races-won');
    const cattleBred = document.getElementById('cattle-bred');
    const potionsCrafted = document.getElementById('potions-crafted');
    
    if (playerName) playerName.textContent = player.name || 'Rancher';
    if (playerType) playerType.textContent = player.characterType || 'The Kid';
    
    if (player.stats) {
        if (racesWon) racesWon.textContent = player.stats.racesWon || 0;
        if (cattleBred) cattleBred.textContent = player.stats.cattleBred || 0;
        if (potionsCrafted) potionsCrafted.textContent = player.stats.potionsCrafted || 0;
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.textContent = message;
        notification.className = 'notification active ' + type;
        
        // Auto-hide after delay
        setTimeout(() => {
            notification.className = 'notification';
        }, 5000);
    });
    
    // Also log to console
    console.log(`Notification: ${message} (${type})`);
}

// Export functions for use in other modules
window.uiManager = {
    switchScene,
    updateUI,
    showNotification
};