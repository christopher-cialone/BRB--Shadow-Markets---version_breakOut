/**
 * Bull Run Boost - Persistent Storage
 * 
 * This file handles saving and loading game state to/from localStorage
 * to persist player progress between sessions.
 */

// Save game state to localStorage
function saveGameState() {
    try {
        if (!window.gameState) {
            console.warn('Cannot save: game state not initialized');
            return false;
        }
        
        // Add timestamp for when the save occurred
        window.gameState.lastSaved = Date.now();
        
        // Stringify and save to localStorage
        localStorage.setItem('bullRunBoostData', JSON.stringify(window.gameState));
        
        console.log('Game saved successfully at', new Date(window.gameState.lastSaved).toLocaleString());
        return true;
    } catch (err) {
        console.error('Error saving game:', err);
        
        // Show notification if available
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Failed to save game data', 'error');
        }
        return false;
    }
}

// Load game state from localStorage
function loadGameState() {
    try {
        const savedData = localStorage.getItem('bullRunBoostData');
        
        if (!savedData) {
            console.log('No saved game data found. Starting new game.');
            return false;
        }
        
        // Parse saved data
        const parsedData = JSON.parse(savedData);
        
        if (!parsedData) {
            console.warn('Could not parse saved game data');
            return false;
        }
        
        // Check for data format version in the future
        // if (parsedData.version !== CURRENT_VERSION) { ... }
        
        // Merge with current game state, preserving any new properties that might exist in the default state
        if (!window.gameState) {
            window.gameState = parsedData;
        } else {
            // Deep merge player data
            if (parsedData.player) {
                window.gameState.player = {
                    ...window.gameState.player,
                    ...parsedData.player
                };
                
                // Make sure stats object is properly merged
                if (parsedData.player.stats) {
                    window.gameState.player.stats = {
                        ...window.gameState.player.stats,
                        ...parsedData.player.stats
                    };
                }
            }
            
            // Merge other game data
            window.gameState.cattle = parsedData.cattle || [];
            window.gameState.fields = parsedData.fields || [];
            window.gameState.lastLogin = parsedData.lastLogin || Date.now();
        }
        
        console.log('Game loaded successfully from', new Date(parsedData.lastSaved || parsedData.lastLogin).toLocaleString());
        
        // Show notification if available
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Game progress loaded successfully', 'success');
        }
        
        // Update UI if game manager is available
        if (window.gameManager && window.gameManager.updateUI) {
            window.gameManager.updateUI();
        }
        
        return true;
    } catch (err) {
        console.error('Error loading saved game:', err);
        
        // Show notification if available
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Failed to load saved game data', 'error');
        }
        return false;
    }
}

// Automatically save the game periodically
function setupAutoSave(intervalMinutes = 1) {
    // Convert minutes to milliseconds
    const interval = intervalMinutes * 60 * 1000;
    
    // Set up interval for autosave
    setInterval(() => {
        if (saveGameState()) {
            console.log('Auto-saved game data');
        }
    }, interval);
    
    console.log(`Auto-save configured for every ${intervalMinutes} minute(s)`);
}

// Save on page unload
window.addEventListener('beforeunload', () => {
    saveGameState();
});

// Export functions globally
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.setupAutoSave = setupAutoSave;