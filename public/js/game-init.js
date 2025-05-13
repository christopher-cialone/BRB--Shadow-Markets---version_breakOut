/**
 * Bull Run Boost - Game Initialization
 * 
 * This file sets up the Phaser game instance and manages scene transitions.
 */

// Game configuration - our scenes are loaded from scene-loader.js
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
        SaloonScene,
        EtherScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Initialize the Phaser game instance
const game = new Phaser.Game(config);

// Global game state
const gameState = {
    player: {
        name: 'Rancher',
        characterType: 'the-kid',
        cattleBalance: 100,
        hay: 50,
        water: 50,
        cattle: 0,
        barnCapacity: 100,
        cattleCollection: [],
        potionCollection: [],
        // Player progression data
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        achievements: {}, // Will be populated by player-progression.js
        stats: {
            cropHarvested: 0,
            potionsDistilled: 0,
            racesWon: 0,
            racesLost: 0,
            totalEarned: 0,
            totalBurned: 0
        },
        field: {
            planted: false,
            growthStage: 0,
            readyToHarvest: false,
            lastUpdate: Date.now()
        },
        pasture: {
            hasCattle: false,
            milkProduction: 0,
            lastMilked: Date.now()
        }
    },
    marketPrice: 1.0,
    lastUpdate: Date.now()
};

// Initialize WebSocket connection
let socket = null;

// Connect to WebSocket server
function connectToWebSocket() {
    // Determine the correct WebSocket protocol based on page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socket = new WebSocket(wsUrl);
    
    // Connection opened
    socket.addEventListener('open', (event) => {
        console.log('Connected to WebSocket server');
        
        // Send initial ping
        sendWebSocketMessage({
            type: 'ping',
            timestamp: Date.now()
        });
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Message from server:', data);
            
            handleWebSocketMessage(data);
        } catch (err) {
            console.error('Error parsing WebSocket message:', err);
        }
    });
    
    // Connection closed
    socket.addEventListener('close', (event) => {
        console.log('Disconnected from WebSocket server');
        
        // Attempt to reconnect after a delay
        setTimeout(connectToWebSocket, 3000);
    });
    
    // Connection error
    socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
    });
}

// Send message through WebSocket
function sendWebSocketMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.warn('WebSocket not connected, cannot send message');
    }
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'connection':
            console.log('WebSocket connection confirmed:', data.message);
            break;
            
        case 'pong':
            // Calculate latency
            const latency = Date.now() - data.timestamp;
            console.log(`WebSocket latency: ${latency}ms`);
            break;
            
        case 'game_update':
            // Update global game state
            if (data.data) {
                Object.assign(gameState, data.data);
                
                // Notify current scene of the update
                const currentScene = game.scene.getScenes(true)[0];
                if (currentScene && currentScene.handleGameStateUpdate) {
                    currentScene.handleGameStateUpdate(gameState);
                }
            }
            break;
            
        default:
            console.log('Unknown message type:', data.type);
    }
}

// Initialize Socket.IO connection separate from WebSockets
function connectToSocketIO() {
    try {
        const socketIO = io();
        
        socketIO.on('connect', () => {
            console.log('Connected to Socket.IO server');
            
            // Initialize player with server
            socketIO.emit('new-player', {
                name: gameState.player.name,
                characterType: gameState.player.characterType
            });
        });
        
        socketIO.on('game-state', (data) => {
            // Update player data from server
            if (data.player) {
                gameState.player = data.player;
            }
            
            // Update market price
            if (data.marketPrice) {
                gameState.marketPrice = data.marketPrice;
            }
            
            // Notify current scene
            const currentScene = game.scene.getScenes(true)[0];
            if (currentScene && currentScene.handleGameStateUpdate) {
                currentScene.handleGameStateUpdate(gameState);
            }
        });
        
        socketIO.on('error-message', (data) => {
            console.error('Server error:', data.message);
            
            // Display error to user in current scene
            const currentScene = game.scene.getScenes(true)[0];
            if (currentScene && currentScene.showNotification) {
                currentScene.showNotification(data.message, 'error');
            }
        });
        
        // Save Socket.IO instance for use in scenes
        gameState.socketIO = socketIO;
        
        // Make socket available globally to fix compatibility with old code
        if (typeof window !== 'undefined') {
            window.socket = socketIO;
            console.log("Socket.IO instance set as global window.socket");
        }
        
        return socketIO;
    } catch (err) {
        console.error("Error initializing Socket.IO:", err);
        return null;
    }
}

// Initialize connections when the page loads
window.addEventListener('load', () => {
    // Connect to WebSocket
    connectToWebSocket();
    
    // Connect to Socket.IO
    connectToSocketIO();
    
    // Initialize player data and progression system
    window.playerData = gameState.player;
    
    // Initialize player progression
    if (typeof initializePlayerProgression === 'function') {
        initializePlayerProgression();
        console.log("Player progression system initialized");
    }
    
    // Initialize sound effects
    if (typeof SoundEffects !== 'undefined' && SoundEffects.init) {
        SoundEffects.init();
        console.log("Sound effects system initialized");
    }
});