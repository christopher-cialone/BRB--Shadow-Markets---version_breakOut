const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Game state
const gameState = {
  players: {},
  cattle: {},
  potions: {},
  marketPrice: 1.0
};

// Socket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Create new player
  socket.on('new-player', (data) => {
    console.log('New player:', data);
    
    // Initialize player data
    gameState.players[socket.id] = {
      id: socket.id,
      name: data.name || 'Cowboy',
      archetype: data.archetype || 'Entrepreneur',
      cattle: 0,
      cattleBalance: 100,
      hay: 100,
      water: 100,
      barnCapacity: 100,
      cattleCollection: [],
      potionCollection: []
    };
    
    // Send current game state to the new player
    socket.emit('game-state', {
      player: gameState.players[socket.id],
      marketPrice: gameState.marketPrice
    });
  });
  
  // Handle breeding cattle
  socket.on('breed-cattle', () => {
    const player = gameState.players[socket.id];
    if (!player) return;
    
    // Check resources
    if (player.hay >= 10 && player.water >= 10) {
      // Deduct resources
      player.hay -= 10;
      player.water -= 10;
      
      // Generate cattle traits
      const speed = Math.floor(Math.random() * 9) + 1;
      const milk = Math.floor(Math.random() * 9) + 1;
      
      // Create new cattle
      const cattleId = `cattle-${socket.id}-${Date.now()}`;
      const newCattle = {
        id: cattleId,
        speed: speed,
        milk: milk
      };
      
      // Add to player's collection
      player.cattleCollection.push(newCattle);
      player.cattle++;
      
      // Notify player
      socket.emit('cattle-bred', { 
        cattle: newCattle,
        player: player
      });
    } else {
      // Not enough resources
      socket.emit('error-message', { 
        message: 'Not enough resources! Breeding requires 10 Hay and 10 Water.'
      });
    }
  });
  
  // Handle upgrading barn
  socket.on('upgrade-barn', () => {
    const player = gameState.players[socket.id];
    if (!player) return;
    
    // Check balance
    if (player.cattleBalance >= 50) {
      // Deduct balance
      player.cattleBalance -= 50;
      
      // Increase capacity
      player.barnCapacity += 50;
      
      // Notify player
      socket.emit('barn-upgraded', { 
        player: player
      });
    } else {
      // Not enough balance
      socket.emit('error-message', { 
        message: 'Not enough $CATTLE! Upgrading costs 50 $CATTLE.'
      });
    }
  });
  
  // Handle craft potion
  socket.on('craft-potion', () => {
    const player = gameState.players[socket.id];
    if (!player) return;
    
    // Check balance
    if (player.cattleBalance >= 20) {
      // Deduct balance with 50% burn
      const cost = 20;
      const burnAmount = cost * 0.5;
      player.cattleBalance -= cost;
      
      // Generate potion potency
      const potency = Math.floor(Math.random() * 9) + 1;
      
      // Create new potion
      const potionId = `potion-${socket.id}-${Date.now()}`;
      const newPotion = {
        id: potionId,
        potency: potency
      };
      
      // Add to player's collection
      player.potionCollection.push(newPotion);
      
      // Notify player
      socket.emit('potion-crafted', { 
        potion: newPotion,
        player: player
      });
    } else {
      // Not enough balance
      socket.emit('error-message', { 
        message: 'Not enough $CATTLE! Crafting requires 20 $CATTLE.'
      });
    }
  });
  
  // Handle sell potion
  socket.on('sell-potion', (data) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    
    // Find potion in player's collection
    const potionIndex = player.potionCollection.findIndex(p => p.id === data.potionId);
    
    if (potionIndex >= 0) {
      const potion = player.potionCollection[potionIndex];
      
      // Calculate price based on potency and market price
      let basePrice = 25 + (potion.potency * 1.5);
      basePrice = Math.min(basePrice, 35); // Cap at 35
      
      // Apply market price multiplier
      let finalPrice = basePrice * gameState.marketPrice;
      
      // Apply entrepreneur bonus if applicable
      if (player.archetype === 'Entrepreneur') {
        finalPrice *= 1.1; // 10% bonus
      }
      
      // Remove from collection
      player.potionCollection.splice(potionIndex, 1);
      
      // Add balance
      player.cattleBalance += finalPrice;
      
      // Notify player
      socket.emit('potion-sold', {
        price: finalPrice,
        player: player
      });
    } else {
      // Potion not found
      socket.emit('error-message', { 
        message: 'Potion not found!'
      });
    }
  });
  
  // For Blackjack game
  const gameRooms = {};

  // Utility functions for cards
  function createDeck() {
    const suits = ['♥', '♦', '♠', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ rank, suit });
      }
    }
    
    return shuffleDeck(deck);
  }
  
  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  
  function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    if (card.rank === 'A') return 11;
    return parseInt(card.rank);
  }
  
  function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    
    for (const card of hand) {
      value += getCardValue(card);
      if (card.rank === 'A') {
        aces++;
      }
    }
    
    // Adjust for aces if needed
    while (value > 21 && aces > 0) {
      value -= 10; // Convert an Ace from 11 to 1
      aces--;
    }
    
    return value;
  }
  
  function getCardColor(card) {
    return ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
  }

  // Initialize game for a player
  function initGame(playerId, wager) {
    const deck = createDeck();
    
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    
    gameRooms[playerId] = {
      deck,
      playerHand,
      dealerHand,
      wager,
      gameState: 'active', // 'active', 'playerBust', 'dealerBust', 'playerWin', 'dealerWin', 'push'
      results: [] // Track game history
    };
    
    return {
      playerHand,
      dealerHand: [dealerHand[0], { hidden: true }], // Only show one dealer card
      playerValue: calculateHandValue(playerHand),
      dealerValue: getCardValue(dealerHand[0]) // Only count visible card
    };
  }
  
  // Handle starting a new poker (blackjack) game
  socket.on('play-poker', (data) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    
    const wager = parseFloat(data.wager);
    
    // Validate wager
    if (isNaN(wager) || wager <= 0 || wager > player.cattleBalance) {
      socket.emit('error-message', { 
        message: 'Invalid wager amount!'
      });
      return;
    }
    
    // Deduct wager
    player.cattleBalance -= wager;
    
    // Calculate burn amount (10%)
    const burnAmount = wager * 0.1;
    const playableAmount = wager - burnAmount;
    
    // Initialize a new game
    const gameData = initGame(socket.id, playableAmount);
    
    // Send initial game state
    socket.emit('poker-game-started', {
      playerHand: gameData.playerHand.map(card => ({ 
        rank: card.rank, 
        suit: card.suit,
        color: getCardColor(card)
      })),
      dealerHand: [
        { 
          rank: gameData.dealerHand[0].rank, 
          suit: gameData.dealerHand[0].suit,
          color: getCardColor(gameData.dealerHand[0]) 
        }, 
        { hidden: true }
      ],
      playerValue: gameData.playerValue,
      dealerValue: gameData.dealerValue,
      wager: playableAmount
    });
    
    // Check for natural blackjack
    if (gameData.playerValue === 21) {
      // Player has blackjack
      const dealerValue = calculateHandValue(gameRooms[socket.id].dealerHand);
      
      if (dealerValue === 21) {
        // Push - both have blackjack
        gameRooms[socket.id].gameState = 'push';
        player.cattleBalance += playableAmount; // Return wager
        
        // Add to game history
        gameRooms[socket.id].results.push({
          result: 'push',
          playerHand: gameRooms[socket.id].playerHand,
          dealerHand: gameRooms[socket.id].dealerHand
        });
        
        socket.emit('poker-game-result', {
          result: 'push',
          message: 'Push! Both have Blackjack.',
          playerHand: gameRooms[socket.id].playerHand.map(card => ({ 
            rank: card.rank, 
            suit: card.suit,
            color: getCardColor(card)
          })),
          dealerHand: gameRooms[socket.id].dealerHand.map(card => ({ 
            rank: card.rank, 
            suit: card.suit,
            color: getCardColor(card)
          })),
          playerValue: 21,
          dealerValue: 21,
          amount: playableAmount,
          player: player
        });
      } else {
        // Player wins with blackjack (pays 3:2)
        gameRooms[socket.id].gameState = 'playerWin';
        const winnings = playableAmount * 2.5; // 3:2 payout for blackjack
        player.cattleBalance += winnings;
        
        // Add to game history
        gameRooms[socket.id].results.push({
          result: 'win',
          playerHand: gameRooms[socket.id].playerHand,
          dealerHand: gameRooms[socket.id].dealerHand
        });
        
        socket.emit('poker-game-result', {
          result: 'win',
          message: 'Blackjack! You win 3:2 payout!',
          playerHand: gameRooms[socket.id].playerHand.map(card => ({ 
            rank: card.rank, 
            suit: card.suit,
            color: getCardColor(card)
          })),
          dealerHand: gameRooms[socket.id].dealerHand.map(card => ({ 
            rank: card.rank, 
            suit: card.suit,
            color: getCardColor(card)
          })),
          playerValue: 21,
          dealerValue: dealerValue,
          amount: winnings,
          player: player
        });
      }
    }
  });
  
  // Handle player hitting (taking another card)
  socket.on('poker-hit', () => {
    const player = gameState.players[socket.id];
    const game = gameRooms[socket.id];
    
    if (!player || !game || game.gameState !== 'active') return;
    
    // Draw a card from the deck
    const newCard = game.deck.pop();
    game.playerHand.push(newCard);
    
    const playerValue = calculateHandValue(game.playerHand);
    
    if (playerValue > 21) {
      // Player busts
      game.gameState = 'playerBust';
      
      // Add to game history
      game.results.push({
        result: 'loss',
        playerHand: game.playerHand,
        dealerHand: game.dealerHand
      });
      
      socket.emit('poker-game-result', {
        result: 'loss',
        message: 'Bust! You went over 21.',
        playerHand: game.playerHand.map(card => ({ 
          rank: card.rank, 
          suit: card.suit,
          color: getCardColor(card)
        })),
        dealerHand: game.dealerHand.map(card => ({ 
          rank: card.rank, 
          suit: card.suit,
          color: getCardColor(card)
        })),
        playerValue: playerValue,
        dealerValue: calculateHandValue(game.dealerHand),
        amount: game.wager,
        player: player
      });
    } else {
      // Continue the game
      socket.emit('poker-card-dealt', {
        target: 'player',
        card: {
          rank: newCard.rank,
          suit: newCard.suit,
          color: getCardColor(newCard)
        },
        playerValue: playerValue
      });
    }
  });
  
  // Handle player standing (ending their turn)
  socket.on('poker-stand', () => {
    const player = gameState.players[socket.id];
    const game = gameRooms[socket.id];
    
    if (!player || !game || game.gameState !== 'active') return;
    
    const playerValue = calculateHandValue(game.playerHand);
    let dealerValue = calculateHandValue(game.dealerHand);
    
    // Dealer hits until 17 or higher
    while (dealerValue < 17) {
      const newCard = game.deck.pop();
      game.dealerHand.push(newCard);
      dealerValue = calculateHandValue(game.dealerHand);
    }
    
    let result;
    let message;
    let winnings = 0;
    
    if (dealerValue > 21) {
      // Dealer busts
      result = 'win';
      message = 'Dealer busts! You win!';
      winnings = game.wager * 2; // Double the wager
      player.cattleBalance += winnings;
      game.gameState = 'dealerBust';
    } else if (dealerValue > playerValue) {
      // Dealer wins
      result = 'loss';
      message = 'Dealer wins!';
      game.gameState = 'dealerWin';
    } else if (playerValue > dealerValue) {
      // Player wins
      result = 'win';
      message = 'You win!';
      winnings = game.wager * 2; // Double the wager
      player.cattleBalance += winnings;
      game.gameState = 'playerWin';
    } else {
      // Push (tie)
      result = 'push';
      message = 'Push! It\'s a tie.';
      player.cattleBalance += game.wager; // Return the wager
      game.gameState = 'push';
    }
    
    // Add to game history
    game.results.push({
      result: result === 'win' ? 'win' : (result === 'loss' ? 'loss' : 'push'),
      playerHand: game.playerHand,
      dealerHand: game.dealerHand
    });
    
    // Keep only the last 10 results
    if (game.results.length > 10) {
      game.results = game.results.slice(-10);
    }
    
    socket.emit('poker-game-result', {
      result,
      message,
      playerHand: game.playerHand.map(card => ({ 
        rank: card.rank, 
        suit: card.suit,
        color: getCardColor(card)
      })),
      dealerHand: game.dealerHand.map(card => ({ 
        rank: card.rank, 
        suit: card.suit,
        color: getCardColor(card)
      })),
      playerValue,
      dealerValue,
      amount: result === 'win' ? winnings : game.wager,
      player: player,
      history: game.results.map(item => ({ result: item.result }))
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from game state
    delete gameState.players[socket.id];
  });
});

// Update market price periodically
setInterval(() => {
  // Random fluctuation between 0.8 and 1.2
  const fluctuation = 0.8 + (Math.random() * 0.4);
  gameState.marketPrice = fluctuation;
  
  // Broadcast new market price to all clients
  io.emit('market-update', { marketPrice: gameState.marketPrice });
}, 60000); // Update every minute

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});