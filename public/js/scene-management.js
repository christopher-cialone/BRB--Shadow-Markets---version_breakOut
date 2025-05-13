/**
 * Scene Management Utilities
 * 
 * This module provides functions for managing scene transitions and setup
 * to ensure smooth scene switching and prevent errors.
 */

(function() {
    'use strict';
    
    /**
     * Safely switches between Phaser scenes with proper cleanup
     * @param {string} sceneName - The name of the scene to switch to
     */
    function switchScene(sceneName) {
        console.log(`Switching to scene: ${sceneName}`);
        
        try {
            // Get the current active scene
            const game = window.game;
            if (!game) {
                console.error("Game instance not found");
                return;
            }
            
            // Get current active scene
            const activeScene = game.scene.getScenes(true)[0];
            if (activeScene) {
                const activeSceneName = activeScene.scene.key;
                console.log(`Current active scene: ${activeSceneName}`);
                
                // Make sure we're not already in the target scene
                if (activeSceneName === sceneName) {
                    console.log(`Already in ${sceneName} scene`);
                    return;
                }
                
                // Properly shutdown the current scene
                activeScene.scene.stop();
                console.log(`Stopped scene: ${activeSceneName}`);
            }
            
            // Start the new scene
            game.scene.start(sceneName);
            console.log(`Started scene: ${sceneName}`);
            
            // Update UI visibility based on scene
            updateUIForScene(sceneName);
            
        } catch (error) {
            console.error(`Error switching to scene ${sceneName}:`, error);
            showErrorNotification(`Failed to switch to ${sceneName} scene`);
        }
    }
    
    /**
     * Updates UI element visibility based on the current scene
     * @param {string} sceneName - The name of the current scene
     */
    function updateUIForScene(sceneName) {
        try {
            // Map HTML UI elements
            const mainMenu = document.getElementById('main-menu');
            const ranchUI = document.getElementById('ranch-ui');
            const saloonUI = document.getElementById('saloon-ui');
            const nightUI = document.getElementById('night-ui');
            const profileUI = document.getElementById('profile-ui');
            
            // Hide all UIs first
            const allUIs = [mainMenu, ranchUI, saloonUI, nightUI, profileUI];
            allUIs.forEach(ui => {
                if (ui) ui.classList.add('hidden');
            });
            
            // Show specific UI based on scene
            switch (sceneName) {
                case 'MainMenuScene':
                    if (mainMenu) mainMenu.classList.remove('hidden');
                    break;
                case 'RanchScene':
                    if (ranchUI) ranchUI.classList.remove('hidden');
                    break;
                case 'SaloonScene':
                    if (saloonUI) saloonUI.classList.remove('hidden');
                    break;
                case 'NightScene':
                    if (nightUI) nightUI.classList.remove('hidden');
                    break;
                case 'ProfileScene':
                    if (profileUI) profileUI.classList.remove('hidden');
                    break;
                default:
                    console.warn(`Unknown scene: ${sceneName}`);
            }
            
            console.log(`UI updated for scene: ${sceneName}`);
        } catch (error) {
            console.error(`Error updating UI for scene ${sceneName}:`, error);
        }
    }
    
    /**
     * Shows an error notification to the user
     * @param {string} message - The error message to display
     */
    function showErrorNotification(message) {
        console.error(message);
        
        try {
            // Create notification if the function exists
            if (typeof showNotification === 'function') {
                showNotification(message, 'error');
            } else {
                // Fallback if the notification system isn't loaded
                alert(`Error: ${message}`);
            }
        } catch (error) {
            console.error("Failed to show notification:", error);
        }
    }
    
    // Expose functions to global scope
    window.switchScene = switchScene;
    window.updateUIForScene = updateUIForScene;
    window.showErrorNotification = showErrorNotification;
    
})();