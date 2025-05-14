// Scene Management Module

// Function to switch scenes (enhanced version)
window.switchScene = function(scene) {
    console.log(`Switching to scene: ${scene}`);
    
    // Set current scene
    window.currentScene = scene;
    
    // Hide all scenes
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    
    // Show the appropriate UI element
    const sceneElement = document.getElementById(`${scene}-ui`);
    if (sceneElement) {
        sceneElement.classList.remove('hidden');
        console.log(`UI updated for scene: ${scene}`);
    } else {
        console.warn(`Scene element not found: ${scene}-ui`);
    }
    
    // Initialize Phaser scenes
    initializeScenes();
}

// Function to initialize or restart scenes
function initializeScenes() {
    if (window.game && window.game.scene) {
        // Stop all scenes to avoid duplicates
        window.game.scene.stop('MainMenuScene');
        window.game.scene.stop('RanchScene');
        window.game.scene.stop('SaloonScene');
        window.game.scene.stop('NightScene');

        // Start the appropriate scene based on currentScene
        switch (window.currentScene) {
            case 'ranch':
                window.game.scene.start('RanchScene');
                initRanchGrid();
                break;
            case 'night':
                window.game.scene.start('NightScene');
                initNightGrid();
                break;
            case 'saloon':
                window.game.scene.start('SaloonScene');
                break;
            default:
                window.game.scene.start('MainMenuScene');
        }

        // Reattach event listeners
        attachButtonListeners();
    }
}

// Initialize Ranch Grid
function initRanchGrid() {
    const ranchScene = window.game.scene.getScene('RanchScene');
    if (ranchScene && ranchScene.initPhaserGrid) {
        ranchScene.initPhaserGrid();
        ranchScene.updateAllCells(); // Force grid render
    }
}

// Initialize Night Grid (Ether Range)
function initNightGrid() {
    const nightScene = window.game.scene.getScene('NightScene');
    if (nightScene && nightScene.initPhaserGrid) {
        nightScene.initPhaserGrid();
        nightScene.updateAllCells(); // Force grid render
    }
}

// Attach button listeners
function attachButtonListeners() {
    // Ranch buttons
    const harvestAllBtn = document.getElementById('harvest-all');
    if (harvestAllBtn) {
        harvestAllBtn.onclick = () => {
            if (typeof window.harvestAllRanchCells === 'function') {
                window.harvestAllRanchCells();
            }
        };
    }

    // Night buttons
    const distillAllBtn = document.getElementById('distill-all');
    if (distillAllBtn) {
        distillAllBtn.onclick = () => {
            if (typeof window.distillAllShadowCells === 'function') {
                window.distillAllShadowCells();
            }
        };
    }

    // Travel buttons
    document.querySelectorAll('.travel-button').forEach(btn => {
        btn.onclick = () => {
            window.currentScene = btn.dataset.scene;
            initializeScenes();
            window.switchScene(window.currentScene);
        };
    });
}

// Make sure scene management functions are available globally
window.initializeScenes = initializeScenes;
window.initRanchGrid = initRanchGrid;
window.initNightGrid = initNightGrid;
window.attachButtonListeners = attachButtonListeners;

console.log("Scene management module loaded");