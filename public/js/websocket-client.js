/**
 * WebSocket Client Module
 * This module handles the WebSocket connection to the server and provides
 * methods for sending and receiving messages.
 */

// WebSocket connection
let ws = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

// Connection status callbacks
const connectionCallbacks = {
    onOpen: [],
    onClose: [],
    onError: [],
    onMessage: [],
    onReconnect: []
};

// Message type handlers
const messageHandlers = {};

/**
 * Initialize the WebSocket connection
 * @returns {Promise} Promise that resolves when connection is established
 */
function initWebSocket() {
    return new Promise((resolve, reject) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            resolve(ws);
            return;
        }
        
        try {
            // Determine the WebSocket URL based on the current protocol and host
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            
            console.log(`Connecting to WebSocket at ${wsUrl}`);
            ws = new WebSocket(wsUrl);
            
            ws.onopen = (event) => {
                console.log('WebSocket connection established');
                isConnected = true;
                reconnectAttempts = 0;
                
                // Call all registered open callbacks
                connectionCallbacks.onOpen.forEach(callback => {
                    try {
                        callback(event);
                    } catch (error) {
                        console.error('Error in onOpen callback:', error);
                    }
                });
                
                resolve(ws);
            };
            
            ws.onclose = (event) => {
                console.log('WebSocket connection closed');
                isConnected = false;
                
                // Call all registered close callbacks
                connectionCallbacks.onClose.forEach(callback => {
                    try {
                        callback(event);
                    } catch (error) {
                        console.error('Error in onClose callback:', error);
                    }
                });
                
                // Attempt to reconnect
                attemptReconnect();
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                
                // Call all registered error callbacks
                connectionCallbacks.onError.forEach(callback => {
                    try {
                        callback(error);
                    } catch (err) {
                        console.error('Error in onError callback:', err);
                    }
                });
                
                reject(error);
            };
            
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);
                    
                    // Handle the message based on its type
                    if (message.type && messageHandlers[message.type]) {
                        messageHandlers[message.type](message);
                    }
                    
                    // Call all registered message callbacks
                    connectionCallbacks.onMessage.forEach(callback => {
                        try {
                            callback(message);
                        } catch (error) {
                            console.error('Error in onMessage callback:', error);
                        }
                    });
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            reject(error);
        }
    });
}

/**
 * Attempt to reconnect the WebSocket
 */
function attemptReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(`Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`);
        return;
    }
    
    reconnectAttempts++;
    console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    
    // Call all registered reconnect callbacks
    connectionCallbacks.onReconnect.forEach(callback => {
        try {
            callback(reconnectAttempts);
        } catch (error) {
            console.error('Error in onReconnect callback:', error);
        }
    });
    
    setTimeout(() => {
        initWebSocket().catch(error => {
            console.error('Error reconnecting:', error);
        });
    }, RECONNECT_DELAY);
}

/**
 * Send a message to the server
 * @param {Object} message - The message to send
 * @returns {boolean} - Whether the message was sent successfully
 */
function sendMessage(message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected');
        return false;
    }
    
    try {
        const messageStr = JSON.stringify(message);
        ws.send(messageStr);
        return true;
    } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
    }
}

/**
 * Register a callback for a specific WebSocket event
 * @param {string} event - The event to register for (open, close, error, message, reconnect)
 * @param {Function} callback - The callback function
 */
function on(event, callback) {
    if (!connectionCallbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`]) {
        console.error(`Unknown event: ${event}`);
        return;
    }
    
    connectionCallbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`].push(callback);
}

/**
 * Register a handler for a specific message type
 * @param {string} type - The message type to handle
 * @param {Function} handler - The handler function
 */
function registerMessageHandler(type, handler) {
    messageHandlers[type] = handler;
}

/**
 * Check if the WebSocket is connected
 * @returns {boolean} - Whether the WebSocket is connected
 */
function isConnected() {
    return ws && ws.readyState === WebSocket.OPEN;
}

/**
 * Close the WebSocket connection
 */
function closeConnection() {
    if (ws) {
        ws.close();
    }
}

/**
 * Send a ping message to the server
 * @returns {boolean} - Whether the ping was sent successfully
 */
function ping() {
    return sendMessage({
        type: 'ping',
        timestamp: Date.now()
    });
}

// Expose the API
window.websocketClient = {
    init: initWebSocket,
    send: sendMessage,
    on: on,
    registerHandler: registerMessageHandler,
    isConnected: isConnected,
    close: closeConnection,
    ping: ping
};