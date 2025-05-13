/**
 * Socket.io Event Handling
 * 
 * This module provides functions for handling socket events
 * with proper error checking and logging.
 */

(function() {
    'use strict';
    
    // Initialize socket connection
    let socket;
    
    try {
        socket = io();
        console.log("Socket connection initialized");
    } catch (error) {
        console.error("Failed to initialize socket connection:", error);
    }
    
    /**
     * Safely sends a socket event with error handling
     * @param {string} event - The event name
     * @param {object} data - The data to send
     * @returns {boolean} - Success status
     */
    function sendSocketEvent(event, data) {
        if (!socket || socket.disconnected) {
            console.warn(`Cannot send ${event} event: Socket not connected`);
            return false;
        }
        
        try {
            socket.emit(event, data);
            console.log(`Sent ${event} event with data:`, data);
            return true;
        } catch (error) {
            console.error(`Error sending ${event} event:`, error);
            return false;
        }
    }
    
    /**
     * Safely registers a socket event handler with error handling
     * @param {string} event - The event name to listen for
     * @param {function} callback - The handler function
     */
    function registerSocketHandler(event, callback) {
        if (!socket) {
            console.warn(`Cannot register handler for ${event}: Socket not initialized`);
            return;
        }
        
        try {
            socket.on(event, (data) => {
                try {
                    console.log(`Received ${event} event with data:`, data);
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} event handler:`, error);
                }
            });
            console.log(`Registered handler for ${event} event`);
        } catch (error) {
            console.error(`Error registering handler for ${event} event:`, error);
        }
    }
    
    /**
     * Initialize all socket event handlers for the game
     * @param {object} gameState - Reference to the game state
     */
    function initializeSocketHandlers(gameState) {
        if (!socket) {
            console.error("Cannot initialize socket handlers: Socket not initialized");
            return;
        }
        
        // Game state update
        registerSocketHandler('game-state', (data) => {
            if (gameState) {
                gameState.playerData = data.player;
                gameState.marketPrice = data.marketPrice;
                
                // Update UI if the function exists
                if (typeof updateUI === 'function') {
                    updateUI();
                }
            }
        });
        
        // Cattle breeding
        registerSocketHandler('cattle-bred', (data) => {
            if (gameState) {
                // Update player data
                gameState.playerData = data.player;
                
                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification('New cattle bred!', 'success');
                }
                
                // Update UI
                if (typeof updateCattleInventory === 'function') {
                    updateCattleInventory();
                }
            }
        });
        
        // Barn upgrade
        registerSocketHandler('barn-upgraded', (data) => {
            if (gameState) {
                // Update player data
                gameState.playerData = data.player;
                
                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification('Barn upgraded!', 'success');
                }
                
                // Update UI
                if (typeof updateUI === 'function') {
                    updateUI();
                }
            }
        });
        
        // Error handling
        registerSocketHandler('error', (data) => {
            // Show error notification
            if (typeof showNotification === 'function') {
                showNotification(data.message, 'error');
            } else {
                alert(`Error: ${data.message}`);
            }
        });
        
        console.log("Socket event handlers initialized");
    }
    
    // Expose functions and socket to global scope
    window.socket = socket;
    window.sendSocketEvent = sendSocketEvent;
    window.registerSocketHandler = registerSocketHandler;
    window.initializeSocketHandlers = initializeSocketHandlers;
    
})();