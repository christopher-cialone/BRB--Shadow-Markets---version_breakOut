/**
 * WebSocket Integration
 * 
 * This module integrates the WebSocket client with the game,
 * handling initialization and message processing.
 */

// Initialize the WebSocket when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing WebSocket integration');
    
    // Initialize the WebSocket connection
    websocketClient.init().then(() => {
        console.log('WebSocket connection established');
        
        // Send a ping message to test the connection
        websocketClient.ping();
    }).catch(error => {
        console.error('Failed to initialize WebSocket:', error);
    });
    
    // Register message handlers
    setupMessageHandlers();
    
    // Register connection event handlers
    setupConnectionHandlers();
});

/**
 * Set up handlers for different WebSocket message types
 */
function setupMessageHandlers() {
    // Handle ping response
    websocketClient.registerHandler('pong', (message) => {
        console.log('Received pong from server, latency:', Date.now() - message.timestamp, 'ms');
    });
    
    // Handle game update messages
    websocketClient.registerHandler('game_update', (message) => {
        console.log('Received game update:', message);
        
        // Update the game state based on the message data
        if (message.data) {
            // Handle different types of game updates
            if (message.data.type === 'market_price') {
                updateMarketPrice(message.data.price);
            } else if (message.data.type === 'player_action') {
                handlePlayerAction(message.data.playerId, message.data.action);
            }
        }
    });
    
    // Handle race progress updates
    websocketClient.registerHandler('race_progress', (message) => {
        console.log('Received race progress update:', message);
        
        // Update the race progress display
        if (typeof updateRaceProgress === 'function' && message.progress) {
            updateRaceProgress(message.progress);
        }
    });
    
    // Handle race results
    websocketClient.registerHandler('race_result', (message) => {
        console.log('Received race result:', message);
        
        // Update the UI with race results
        if (typeof showRaceResult === 'function' && message.winner) {
            showRaceResult(message.winner, message.winnings);
        }
    });
    
    // Handle scene initialization confirmation
    websocketClient.registerHandler('scene_ready', (message) => {
        console.log('Scene ready confirmation received:', message);
        
        // The server has confirmed the scene is ready
        if (typeof confirmSceneReady === 'function') {
            confirmSceneReady(message.scene);
        }
    });
}

/**
 * Set up handlers for WebSocket connection events
 */
function setupConnectionHandlers() {
    // Handle connection open event
    websocketClient.on('open', () => {
        console.log('WebSocket connection opened');
        
        // Send player info if available
        if (window.playerData) {
            websocketClient.send({
                type: 'player_info',
                data: {
                    name: playerData.name,
                    archetype: playerData.archetype
                }
            });
        }
    });
    
    // Handle connection close event
    websocketClient.on('close', () => {
        console.log('WebSocket connection closed');
        
        // Show a notification to the user
        if (typeof showNotification === 'function') {
            showNotification('Connection to server lost. Attempting to reconnect...', 'error');
        }
    });
    
    // Handle connection error event
    websocketClient.on('error', (error) => {
        console.error('WebSocket error:', error);
        
        // Show a notification to the user
        if (typeof showNotification === 'function') {
            showNotification('Connection error. Please try again later.', 'error');
        }
    });
    
    // Handle reconnection attempts
    websocketClient.on('reconnect', (attempt) => {
        console.log(`Reconnection attempt ${attempt}`);
        
        // Show a notification to the user
        if (typeof showNotification === 'function') {
            showNotification(`Reconnecting to server (Attempt ${attempt})...`, 'info');
        }
    });
}

/**
 * Update the market price display
 * @param {number} price - The new market price
 */
function updateMarketPrice(price) {
    console.log('Updating market price:', price);
    
    // Update the UI with the new market price
    const priceElements = document.querySelectorAll('.market-price');
    priceElements.forEach(el => {
        el.textContent = price.toFixed(2);
    });
    
    // Also update in game state if available
    if (window.gameState && typeof gameState.updateMarketPrice === 'function') {
        gameState.updateMarketPrice(price);
    }
}

/**
 * Handle player actions from other players
 * @param {string} playerId - The ID of the player who performed the action
 * @param {Object} action - The action data
 */
function handlePlayerAction(playerId, action) {
    console.log(`Player ${playerId} performed action:`, action);
    
    // Handle different types of player actions
    if (action.type === 'race_start') {
        // Another player started a race
        if (typeof showNotification === 'function') {
            showNotification(`${action.playerName || 'Another player'} started a race!`, 'info');
        }
    } else if (action.type === 'race_win') {
        // Another player won a race
        if (typeof showNotification === 'function') {
            showNotification(`${action.playerName || 'Another player'} won ${action.winnings} $CATTLE in a race!`, 'info');
        }
    }
}

/**
 * Send a scene initialization message to the server
 * @param {string} sceneName - The name of the scene being initialized
 */
function notifySceneInit(sceneName) {
    console.log('Notifying server of scene initialization:', sceneName);
    
    websocketClient.send({
        type: 'scene_init',
        scene: sceneName,
        timestamp: Date.now()
    });
}

/**
 * Send race progress update to the server
 * @param {Object} progress - The race progress data
 */
function sendRaceProgress(progress) {
    console.log('Sending race progress update:', progress);
    
    websocketClient.send({
        type: 'race_progress',
        progress: progress,
        timestamp: Date.now()
    });
}

/**
 * Send race result to the server
 * @param {string} winner - The winning suit
 * @param {number} winnings - The amount won
 */
function sendRaceResult(winner, winnings) {
    console.log('Sending race result:', winner, winnings);
    
    websocketClient.send({
        type: 'race_result',
        winner: winner,
        winnings: winnings,
        timestamp: Date.now()
    });
}

// Expose the WebSocket functions to the global scope
window.websocketAPI = {
    notifySceneInit,
    sendRaceProgress,
    sendRaceResult
};