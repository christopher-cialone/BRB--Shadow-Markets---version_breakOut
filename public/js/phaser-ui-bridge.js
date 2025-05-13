// Phaser UI Bridge: Handles interactions between Phaser scenes and HTML UIs

document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for closing UI panels
    setupCloseButtons();
    
    // Initialize UI grids
    initializeUIGrids();
});

// Set up event listeners for close buttons on UI panels
function setupCloseButtons() {
    // Crop Management UI close button
    const closeCropUI = document.getElementById('close-crop-ui');
    if (closeCropUI) {
        closeCropUI.addEventListener('click', function() {
            // Hide crop management UI
            document.getElementById('crop-management-ui').classList.add('hidden');
            
            // Custom event to notify scene that UI was closed
            const event = new CustomEvent('cropUIclosed');
            document.dispatchEvent(event);
            
            // Resume Phaser scene if available
            resumePhaserScene('RanchScene');
        });
    }
    
    // Cattle Management UI close button
    const closeCattleUI = document.getElementById('close-cattle-ui');
    if (closeCattleUI) {
        closeCattleUI.addEventListener('click', function() {
            // Hide cattle management UI
            document.getElementById('cattle-management-ui').classList.add('hidden');
            
            // Custom event to notify scene that UI was closed
            const event = new CustomEvent('cattleUIclosed');
            document.dispatchEvent(event);
            
            // Resume Phaser scene if available
            resumePhaserScene('RanchScene');
        });
    }
    
    // Potion Brewing UI close button
    const closePotionUI = document.getElementById('close-potion-ui');
    if (closePotionUI) {
        closePotionUI.addEventListener('click', function() {
            // Hide potion brewing UI
            document.getElementById('potion-brewing-ui').classList.add('hidden');
            
            // Custom event to notify scene that UI was closed
            const event = new CustomEvent('potionUIclosed');
            document.dispatchEvent(event);
            
            // Resume Phaser scene if available
            resumePhaserScene('NightScene');
        });
    }
    
    // Shadow Market UI close button
    const closeShadowMarketUI = document.getElementById('close-shadow-market-ui');
    if (closeShadowMarketUI) {
        closeShadowMarketUI.addEventListener('click', function() {
            // Hide shadow market UI
            document.getElementById('shadow-market-ui').classList.add('hidden');
            
            // Custom event to notify scene that UI was closed
            const event = new CustomEvent('shadowMarketUIClosed');
            document.dispatchEvent(event);
            
            // Resume Phaser scene if available
            resumePhaserScene('NightScene');
        });
    }
}

// Resume Phaser scene if available
function resumePhaserScene(sceneName) {
    // Check if Phaser game instance is available
    if (window.phaserGame) {
        // Get the scene
        const scene = window.phaserGame.scene.getScene(sceneName);
        
        // Resume the scene if it exists and is paused
        if (scene && scene.scene.isPaused()) {
            scene.scene.resume();
            console.log(`Resumed Phaser scene: ${sceneName}`);
        }
        
        // Unblur the Phaser container
        const phaserContainer = document.getElementById('phaser-game-container');
        if (phaserContainer) {
            phaserContainer.classList.remove('blurred');
        }
    }
}

// Initialize UI grids for interaction elements
function initializeUIGrids() {
    // Crop Management Grid
    const cropGrid = document.getElementById('crop-grid');
    if (cropGrid) {
        cropGrid.innerHTML = '';
        
        // Create a 5x5 grid for crops
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', function() {
                handleCropCellClick(i);
            });
            cropGrid.appendChild(cell);
        }
    }
    
    // Cattle Management Grid
    const cattleGrid = document.getElementById('cattle-grid');
    if (cattleGrid) {
        cattleGrid.innerHTML = '';
        
        // Create a 4x4 grid for cattle
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', function() {
                handleCattleCellClick(i);
            });
            cattleGrid.appendChild(cell);
        }
    }
    
    // Potion Brewing Grid
    const potionGrid = document.getElementById('potion-grid');
    if (potionGrid) {
        potionGrid.innerHTML = '';
        
        // Create a 3x3 grid for potions
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', function() {
                handlePotionCellClick(i);
            });
            potionGrid.appendChild(cell);
        }
    }
    
    // Shadow Market Grid
    const shadowMarketGrid = document.getElementById('shadow-market-grid');
    if (shadowMarketGrid) {
        shadowMarketGrid.innerHTML = '';
        
        // Create a 3x2
        for (let i = 0; i < 6; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell market-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', function() {
                handleMarketCellClick(i);
            });
            shadowMarketGrid.appendChild(cell);
        }
    }
    
    // Initialize action buttons
    initializeActionButtons();
}

// Initialize action buttons for UI panels
function initializeActionButtons() {
    // Crop Management action buttons
    const plantWheatBtn = document.getElementById('plant-wheat');
    if (plantWheatBtn) {
        plantWheatBtn.addEventListener('click', function() {
            if (typeof window.plantCrop === 'function') {
                window.plantCrop('wheat');
            }
        });
    }
    
    const plantCornBtn = document.getElementById('plant-corn');
    if (plantCornBtn) {
        plantCornBtn.addEventListener('click', function() {
            if (typeof window.plantCrop === 'function') {
                window.plantCrop('corn');
            }
        });
    }
    
    const plantCactusBtn = document.getElementById('plant-cactus');
    if (plantCactusBtn) {
        plantCactusBtn.addEventListener('click', function() {
            if (typeof window.plantCrop === 'function') {
                window.plantCrop('cactus');
            }
        });
    }
    
    const harvestAllBtn = document.getElementById('harvest-all');
    if (harvestAllBtn) {
        harvestAllBtn.addEventListener('click', function() {
            if (typeof window.harvestAllCrops === 'function') {
                window.harvestAllCrops();
            }
        });
    }
    
    // Cattle Management action buttons
    const breedCattleBtn = document.getElementById('breed-cattle-btn');
    if (breedCattleBtn) {
        breedCattleBtn.addEventListener('click', function() {
            if (typeof window.breedCattle === 'function') {
                window.breedCattle();
            }
        });
    }
    
    const milkAllBtn = document.getElementById('milk-all-btn');
    if (milkAllBtn) {
        milkAllBtn.addEventListener('click', function() {
            if (typeof window.milkAllCattle === 'function') {
                window.milkAllCattle();
            }
        });
    }
    
    const feedAllBtn = document.getElementById('feed-all-btn');
    if (feedAllBtn) {
        feedAllBtn.addEventListener('click', function() {
            if (typeof window.feedAllCattle === 'function') {
                window.feedAllCattle();
            }
        });
    }
    
    // Potion Brewing action buttons
    const brewSpeedPotionBtn = document.getElementById('brew-speed-potion');
    if (brewSpeedPotionBtn) {
        brewSpeedPotionBtn.addEventListener('click', function() {
            if (typeof window.brewPotion === 'function') {
                window.brewPotion('speed');
            }
        });
    }
    
    const brewPowerPotionBtn = document.getElementById('brew-power-potion');
    if (brewPowerPotionBtn) {
        brewPowerPotionBtn.addEventListener('click', function() {
            if (typeof window.brewPotion === 'function') {
                window.brewPotion('power');
            }
        });
    }
    
    const brewMysticPotionBtn = document.getElementById('brew-mystic-potion');
    if (brewMysticPotionBtn) {
        brewMysticPotionBtn.addEventListener('click', function() {
            if (typeof window.brewPotion === 'function') {
                window.brewPotion('mystic');
            }
        });
    }
    
    const collectAllPotionsBtn = document.getElementById('collect-all-potions');
    if (collectAllPotionsBtn) {
        collectAllPotionsBtn.addEventListener('click', function() {
            if (typeof window.collectAllPotions === 'function') {
                window.collectAllPotions();
            }
        });
    }
}

// UI Cell Click Handlers
function handleCropCellClick(index) {
    console.log(`Crop cell clicked: ${index}`);
    // Forward to appropriate handler if available
    if (typeof window.handleCropCellClick === 'function') {
        window.handleCropCellClick(index);
    }
}

function handleCattleCellClick(index) {
    console.log(`Cattle cell clicked: ${index}`);
    // Forward to appropriate handler if available
    if (typeof window.handleCattleCellClick === 'function') {
        window.handleCattleCellClick(index);
    }
}

function handlePotionCellClick(index) {
    console.log(`Potion cell clicked: ${index}`);
    // Forward to appropriate handler if available
    if (typeof window.handlePotionCellClick === 'function') {
        window.handlePotionCellClick(index);
    }
}

function handleMarketCellClick(index) {
    console.log(`Market cell clicked: ${index}`);
    // Forward to appropriate handler if available
    if (typeof window.handleMarketCellClick === 'function') {
        window.handleMarketCellClick(index);
    }
}

// Public bridge functions for use by Phaser scenes
// Export these functions to the window object
window.showCropManagementUI = function() {
    const ui = document.getElementById('crop-management-ui');
    if (ui) {
        ui.classList.remove('hidden');
        
        // Blur the Phaser container
        const phaserContainer = document.getElementById('phaser-game-container');
        if (phaserContainer) {
            phaserContainer.classList.add('blurred');
        }
    }
};

window.showCattleManagementUI = function() {
    const ui = document.getElementById('cattle-management-ui');
    if (ui) {
        ui.classList.remove('hidden');
        
        // Blur the Phaser container
        const phaserContainer = document.getElementById('phaser-game-container');
        if (phaserContainer) {
            phaserContainer.classList.add('blurred');
        }
    }
};

window.showPotionBrewingUI = function() {
    const ui = document.getElementById('potion-brewing-ui');
    if (ui) {
        ui.classList.remove('hidden');
        
        // Blur the Phaser container
        const phaserContainer = document.getElementById('phaser-game-container');
        if (phaserContainer) {
            phaserContainer.classList.add('blurred');
        }
    }
};

window.showShadowMarketUI = function() {
    const ui = document.getElementById('shadow-market-ui');
    if (ui) {
        ui.classList.remove('hidden');
        
        // Blur the Phaser container
        const phaserContainer = document.getElementById('phaser-game-container');
        if (phaserContainer) {
            phaserContainer.classList.add('blurred');
        }
    }
};

// Function to update weather status in crop management UI
window.updateWeatherStatus = function(weather) {
    const weatherStatus = document.getElementById('weather-status');
    if (weatherStatus) {
        weatherStatus.textContent = weather;
        
        // Add visual indication based on weather
        weatherStatus.className = ''; // Clear existing classes
        switch (weather.toLowerCase()) {
            case 'sunny':
                weatherStatus.classList.add('weather-sunny');
                break;
            case 'cloudy':
                weatherStatus.classList.add('weather-cloudy');
                break;
            case 'rainy':
                weatherStatus.classList.add('weather-rainy');
                break;
        }
    }
};