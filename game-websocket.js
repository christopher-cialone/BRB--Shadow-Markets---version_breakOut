const { WebSocketServer } = require('ws');
const WebSocket = require('ws');

/**
 * Set up a WebSocket server that can be attached to an existing HTTP server
 * @param {object} options - Options for setting up the WebSocket server
 * @param {object} options.server - The HTTP server to attach to
 * @param {string} options.path - The WebSocket endpoint path
 * @returns {WebSocketServer} - The configured WebSocket server
 */
function setupWebSocketServer(options) {
  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server: options.server, 
    path: options.path || '/ws'
  });
  
  // Store connected clients
  const clients = new Map();
  
  // Handle new connections
  wss.on('connection', (ws, req) => {
    // Generate a unique client ID
    const clientId = generateClientId();
    
    // Store client information
    const clientInfo = {
      id: clientId,
      ws: ws,
      isAlive: true,
      gameState: {}
    };
    
    // Add client to the map
    clients.set(clientId, clientInfo);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send welcome message to client
    ws.send(JSON.stringify({
      type: 'connection',
      clientId: clientId,
      message: 'Connected to Bull Run Boost WebSocket server'
    }));
    
    // Set up ping interval to check connection
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        // Process message based on its type
        switch (data.type) {
          case 'game_state_update':
            handleGameStateUpdate(clientId, data.payload);
            break;
            
          case 'ranch_action':
            handleRanchAction(clientId, data.payload);
            break;
            
          case 'market_action':
            handleMarketAction(clientId, data.payload);
            break;
            
          case 'race_bet':
            handleRaceBet(clientId, data.payload);
            break;
            
          default:
            console.log(`Received unhandled message type: ${data.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
  });
  
  // Set up ping interval to check for dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  // Clean up interval on server close
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // Broadcast message to all connected clients
  function broadcast(data) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
  
  // Send message to a specific client
  function sendToClient(clientId, data) {
    const client = clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  }
  
  // Handle game state update message
  function handleGameStateUpdate(clientId, payload) {
    const client = clients.get(clientId);
    if (client) {
      client.gameState = payload;
      
      // You could save this state to a database here
      
      // Acknowledge receipt of state update
      sendToClient(clientId, {
        type: 'game_state_updated',
        success: true,
        timestamp: Date.now()
      });
    }
  }
  
  // Handle ranch action message
  function handleRanchAction(clientId, payload) {
    // Process ranch actions (feed cattle, milk, plant, etc.)
    const { action, data } = payload;
    
    // Example implementation
    let result = {
      success: true,
      message: 'Action completed',
      data: null
    };
    
    switch (action) {
      case 'feed_cattle':
        // Implement feed cattle logic
        result.data = { fedCattle: data.cattleId };
        break;
        
      case 'milk_cow':
        // Implement milk cow logic 
        result.data = { 
          milkAmount: Math.floor(Math.random() * 5) + 1,
          rewards: Math.floor(Math.random() * 10) + 5
        };
        break;
        
      default:
        result.success = false;
        result.message = 'Unknown ranch action';
    }
    
    sendToClient(clientId, {
      type: 'ranch_action_result',
      action: action,
      result: result
    });
  }
  
  // Handle market action message
  function handleMarketAction(clientId, payload) {
    // Process market actions (buy/sell, etc.)
    const { action, data } = payload;
    
    // Example implementation
    let result = {
      success: true,
      message: 'Market action completed',
      data: null
    };
    
    switch (action) {
      case 'create_potion':
        // Implement potion creation logic
        result.data = { 
          potionType: data.type,
          completionTime: Date.now() + (20 * 1000) // 20 seconds later
        };
        break;
        
      default:
        result.success = false;
        result.message = 'Unknown market action';
    }
    
    sendToClient(clientId, {
      type: 'market_action_result',
      action: action,
      result: result
    });
  }
  
  // Handle race bet message
  function handleRaceBet(clientId, payload) {
    // Process bet on card race
    const { suit, amount } = payload;
    
    // Example implementation - simplified card race
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const winningSuit = suits[Math.floor(Math.random() * suits.length)];
    
    // Calculate winnings
    let winnings = 0;
    if (suit === winningSuit) {
      // Player won - calculate based on suit odds
      const odds = suit === 'hearts' || suit === 'diamonds' ? 3 : 4;
      winnings = amount * odds;
    }
    
    // Send result to client
    sendToClient(clientId, {
      type: 'race_result',
      bet: {
        suit: suit,
        amount: amount
      },
      result: {
        winningSuit: winningSuit,
        won: suit === winningSuit,
        winnings: winnings
      }
    });
    
    // Broadcast race result to all clients
    broadcast({
      type: 'race_completed',
      winningSuit: winningSuit,
      timestamp: Date.now()
    });
  }
  
  // Generate a unique client ID
  function generateClientId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // Return the WebSocket server and utility functions
  return {
    wss,
    broadcast,
    sendToClient,
    clients,
    close: () => {
      clearInterval(interval);
      wss.close();
    }
  };
}

module.exports = {
  setupWebSocketServer
};