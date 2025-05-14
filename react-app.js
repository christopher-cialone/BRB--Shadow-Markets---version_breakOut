const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 5000;

// Enable more detailed logging
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log(new Date().toISOString(), ...args);
  }
}

// Simple HTTP server
const server = http.createServer((req, res) => {
  log(`Received request for: ${req.url}`);
  let filePath;
  
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'public', 'index.html');
    log('Serving index.html');
  } else if (req.url === '/api/player-data') {
    // API endpoint for player data
    log('Serving player data API');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'Cowboy',
      btBalance: 100,
      bcBalance: 0,
      level: 1
    }));
    return;
  } else if (req.url.startsWith('/images/') || req.url.startsWith('/assets/')) {
    // Handle static assets explicitly
    filePath = path.join(__dirname, 'public', req.url);
    log(`Serving static asset: ${filePath}`);
  } else if (req.url === '/favicon.ico') {
    // Handle favicon requests
    filePath = path.join(__dirname, 'public', 'images', 'favicon.png');
    log('Serving favicon.ico');
  } else {
    // Serve files from public directory
    filePath = path.join(__dirname, 'public', req.url);
    log(`Serving file: ${filePath}`);
  }
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    // Read the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      // Set content type based on file extension
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      
      switch (ext) {
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.svg':
          contentType = 'image/svg+xml';
          break;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Set up WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(2, 15);
  log(`WebSocket client connected: ${clientId}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    data: { message: 'Connected to Bull Run Boost game server', clientId }
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      log(`Received message from ${clientId}:`, parsedMessage);
      
      // Echo the message back (for testing)
      ws.send(JSON.stringify({
        type: 'echo',
        data: parsedMessage
      }));
    } catch (error) {
      log('Error parsing message:', error);
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    log(`WebSocket client disconnected: ${clientId}`);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    log(`WebSocket error for client ${clientId}:`, error);
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  log(`HTTP server running on port ${PORT}`);
  log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});