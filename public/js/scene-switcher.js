/**
 * Scene Switcher Module
 * Handles switching between different game scenes, initializing both HTML UI and Phaser components
 */

// Store current scene for state tracking
let currentScene = 'main-menu';

/**
 * Switch to a different game scene
 * @param {string} scene - The scene to switch to ('main-menu', 'ranch', 'saloon', 'night', 'profile')
 */
function switchToScene(scene) {
    console.log(`Switching to scene: ${scene}`);
    
    // Update current scene
    const previousScene = currentScene;
    currentScene = scene;
    
    // Hide all UI scenes
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    
    // Show the target UI element
    const targetUI = document.getElementById(`${scene}-ui`);
    if (targetUI) {
        targetUI.classList.remove('hidden');
    } else {
        console.error(`UI element not found for scene: ${scene}`);
    }
    
    // Initialize HTML UI elements for the scene
    initializeSceneUI(scene);
    
    // Initialize Phaser scenes if needed
    if (window.game && typeof window.initializeScenes === 'function') {
        window.initializeScenes();
    }
    
    console.log(`UI updated for scene: ${scene}`);
}

/**
 * Initialize UI elements specific to each scene
 * @param {string} scene - The scene being initialized
 */
function initializeSceneUI(scene) {
    switch(scene) {
        case 'ranch':
            // Initialize our vanilla JS ranch grid
            if (typeof window.initRanchGrid === 'function') {
                window.initRanchGrid();
                console.log('Ranch grid initialized with vanilla JS implementation');
            }
            
            // Setup harvest all button if exists
            const harvestAllBtn = document.getElementById('harvest-all');
            if (harvestAllBtn) {
                harvestAllBtn.onclick = function() {
                    console.log("Harvest all button clicked");
                    // Trigger function if it exists
                    if (typeof window.harvestAllCrops === 'function') {
                        window.harvestAllCrops();
                    }
                };
            }
            
            // Setup feed all button if exists
            const feedAllBtn = document.getElementById('feed-all');
            if (feedAllBtn) {
                feedAllBtn.onclick = function() {
                    console.log("Feed all button clicked");
                    // Trigger function if it exists
                    if (typeof window.feedAllCattle === 'function') {
                        window.feedAllCattle();
                    }
                };
            }
            break;
            
        case 'night':
            // Initialize shadow grid
            if (typeof window.initShadowGrid === 'function') {
                window.initShadowGrid();
            }
            
            // Setup the distill button if it exists
            const distillAllBtn = document.getElementById('distill-all');
            if (distillAllBtn) {
                distillAllBtn.onclick = function() {
                    console.log("Distill all button clicked");
                    if (typeof window.distillAllShadowCells === 'function') {
                        window.distillAllShadowCells();
                    }
                };
            }
            break;
            
        case 'saloon':
            // Initialize saloon-specific elements
            if (typeof window.initSaloonScene === 'function') {
                window.initSaloonScene();
            }
            break;
            
        case 'profile':
            // Update profile UI
            if (typeof window.updateProfileUI === 'function') {
                window.updateProfileUI();
            }
            break;
    }
    
    // Update UI with current player data
    if (typeof window.updateUI === 'function') {
        window.updateUI();
    }
}

// Add helper functions for scenes if needed
function harvestAllCrops() {
    console.log("Harvesting all ready crops");
    // Find all cells with ready crops
    if (window.ranchGrid && window.ranchGrid.cells) {
        let harvestedCount = 0;
        
        window.ranchGrid.cells.forEach((cell, index) => {
            if (cell.type === 'crop' && cell.state === 'ready') {
                if (typeof window.harvestCrop === 'function') {
                    window.harvestCrop(index);
                    harvestedCount++;
                }
            }
        });
        
        if (harvestedCount > 0) {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Harvested ${harvestedCount} crops!`, 'success');
            }
            
            // Play sound
            if (typeof window.playSoundEffect === 'function') {
                window.playSoundEffect('harvest');
            }
        } else {
            if (typeof window.showNotification === 'function') {
                window.showNotification('No crops ready for harvest', 'info');
            }
        }
    }
}

function feedAllCattle() {
    console.log("Feeding all hungry cattle");
    // Find all cells with hungry cattle
    if (window.ranchGrid && window.ranchGrid.cells) {
        let fedCount = 0;
        
        window.ranchGrid.cells.forEach((cell, index) => {
            if (cell.type === 'cattle' && cell.state === 'hungry') {
                if (typeof window.feedCattle === 'function') {
                    window.feedCattle(index);
                    fedCount++;
                }
            }
        });
        
        if (fedCount > 0) {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`Fed ${fedCount} cattle!`, 'success');
            }
        } else {
            if (typeof window.showNotification === 'function') {
                window.showNotification('No hungry cattle to feed', 'info');
            }
        }
    }
}

// Expose the functions to the global scope
window.switchToScene = switchToScene;
window.harvestAllCrops = harvestAllCrops;
window.feedAllCattle = feedAllCattle;

// Handle the original switchScene function for backward compatibility
window.switchScene = function(scene) {
    console.log("Using enhanced scene switcher");
    switchToScene(scene);
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Scene switcher module loaded");
});