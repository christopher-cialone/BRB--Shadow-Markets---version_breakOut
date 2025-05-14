const express = require('express');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from built React app (when we have it)
app.use(express.static(path.join(__dirname, 'dist')));

// API routes can be added here
app.get('/api/player-data', (req, res) => {
  res.json({
    name: 'Cowboy',
    btBalance: 100,
    bcBalance: 0,
    level: 1
  });
});

// All other GET requests not handled will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});