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
      characterType: data.characterType || 'the-kid', // Default character
      cattle: 0,
      cattleBalance: 100,
      hay: 100,
      water: 100,
      barnCapacity: 100,
      cattleCollection: [],
      potionCollection: [],
      stats: {
        racesWon: 0,
        racesLost: 0,
        cattleBred: 0,
        potionsCrafted: 0,
        totalEarned: 0,
        totalBurned: 0
      }
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
      
      // Update statistics
      if (player.stats) {
        player.stats.cattleBred++;
      }
      
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
      
      // Update statistics
      if (player.stats) {
        player.stats.potionsCrafted++;
        player.stats.totalBurned += burnAmount;
      }
      
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
  
  // For Horse Race Game
  const raceGames = {};
  
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
  
  function getCardColor(card) {
    return ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
  }
  
  // Initialize a race game
  function initRaceGame(playerId) {
    const deck = createDeck();
    
    raceGames[playerId] = {
      deck,
      progress: {
        'hearts': 0,
        'diamonds': 0,
        'clubs': 0,
        'spades': 0
      },
      remainingCards: {
        'hearts': 13,
        'diamonds': 13,
        'clubs': 13,
        'spades': 13
      },
      bets: {
        'hearts': 0,
        'diamonds': 0,
        'clubs': 0,
        'spades': 0
      },
      status: 'betting', // 'betting', 'racing', 'finished'
      winner: null,
      results: [], // Track race history
      bonusClaimed: false
    };
    
    return calculateOdds(raceGames[playerId]);
  }
  
  // Calculate odds for each suit based on remaining cards
  function calculateOdds(game) {
    const totalCards = game.remainingCards.hearts + game.remainingCards.diamonds + 
                       game.remainingCards.clubs + game.remainingCards.spades;
    
    // Base odds are 4.0x for a completely fair deck
    // As cards are drawn, adjust odds based on remaining cards of each suit
    const odds = {
      'hearts': parseFloat((4.0 * (totalCards / (game.remainingCards.hearts * 4))).toFixed(1)),
      'diamonds': parseFloat((4.0 * (totalCards / (game.remainingCards.diamonds * 4))).toFixed(1)),
      'clubs': parseFloat((4.0 * (totalCards / (game.remainingCards.clubs * 4))).toFixed(1)),
      'spades': parseFloat((4.0 * (totalCards / (game.remainingCards.spades * 4))).toFixed(1))
    };
    
    return odds;
  }
  
  // Get suit name from suit symbol
  function getSuitName(suit) {
    switch(suit) {
      case '♥': return 'hearts';
      case '♦': return 'diamonds';
      case '♣': return 'clubs';
      case '♠': return 'spades';
      default: return null;
    }
  }
  
  // Handle player claiming bonus tokens
  socket.on('claim-bonus', () => {
    const player = gameState.players[socket.id];
    
    if (!player) return;
    
    // Initialize race game if not exists
    if (!raceGames[socket.id]) {
      initRaceGame(socket.id);
    }
    
    const game = raceGames[socket.id];
    
    // Check if bonus already claimed
    if (game.bonusClaimed) {
      socket.emit('error-message', { 
        message: 'You already claimed your bonus for this session!'
      });
      return;
    }
    
    // Add bonus tokens
    const bonusAmount = 50;
    player.cattleBalance += bonusAmount;
    game.bonusClaimed = true;
    
    // Notify player
    socket.emit('bonus-claimed', {
      amount: bonusAmount,
      player: player
    });
  });
  
  // Handle player starting a new race
  socket.on('start-race', (data) => {
    console.log('Start race event received with data:', data);
    
    const player = gameState.players[socket.id];
    
    if (!player) {
      console.error('Player not found for socket ID:', socket.id);
      return;
    }
    
    // Get bets from data - handle both object formats
    let bets = {};
    
    // Check if we received the expected format from the client
    if (typeof data === 'object') {
      if (data.hearts !== undefined) {
        // Format: {hearts: 10, diamonds: 5, ...}
        bets = {
          'hearts': parseInt(data.hearts) || 0,
          'diamonds': parseInt(data.diamonds) || 0,
          'clubs': parseInt(data.clubs) || 0,
          'spades': parseInt(data.spades) || 0
        };
      } else {
        // Format from client might be {hearts: 10, diamonds: 5, ...}
        bets = {
          'hearts': 0,
          'diamonds': 0,
          'clubs': 0,
          'spades': 0
        };
        
        // Try to extract values from the data object
        try {
          Object.keys(data).forEach(key => {
            if (['hearts', 'diamonds', 'clubs', 'spades'].includes(key)) {
              bets[key] = parseInt(data[key]) || 0;
            }
          });
        } catch (err) {
          console.error('Error parsing bet data:', err);
        }
      }
    }
    
    console.log('Parsed bets:', bets);
    
    // Calculate total bet
    const totalBet = bets.hearts + bets.diamonds + bets.clubs + bets.spades;
    console.log('Total bet amount:', totalBet);
    
    // Validate bets
    if (totalBet <= 0) {
      console.log('Invalid bet: Zero or negative total bet');
      socket.emit('error-message', { 
        message: 'You must place at least one bet to start the race!'
      });
      return;
    }
    
    if (totalBet > player.cattleBalance) {
      console.log(`Insufficient balance: Bet ${totalBet}, Balance ${player.cattleBalance}`);
      socket.emit('error-message', { 
        message: 'Not enough $CATTLE for your total bet!'
      });
      return;
    }
    
    // Initialize or reset race game
    const odds = initRaceGame(socket.id);
    const game = raceGames[socket.id];
    
    // Set bets
    game.bets = bets;
    console.log('Game bets set:', game.bets);
    
    // Deduct total bet from balance
    player.cattleBalance -= totalBet;
    console.log(`Player balance updated: ${player.cattleBalance}`);
    
    // Calculate burn amount (10%)
    const burnAmount = totalBet * 0.1;
    
    // Update burn statistics
    if (player.stats) {
      player.stats.totalBurned += burnAmount;
    }
    
    // Change game status to racing
    game.status = 'racing';
    
    // Send race started event
    socket.emit('race-started', {
      bets: game.bets,
      odds: odds,
      progress: game.progress,
      remainingCards: game.remainingCards,
      burnAmount: burnAmount,
      player: player
    });
    console.log('Race started event emitted');
  });
  
  // Handle player drawing a card
  socket.on('draw-card', () => {
    console.log('Draw card event received');
    
    const player = gameState.players[socket.id];
    const game = raceGames[socket.id];
    
    if (!player) {
      console.error('Player not found for socket ID:', socket.id);
      return;
    }
    
    if (!game) {
      console.error('Game not found for socket ID:', socket.id);
      socket.emit('error-message', { 
        message: 'No active race. Please start a new race first!'
      });
      return;
    }
    
    if (game.status !== 'racing') {
      console.error('Game not in racing state. Current state:', game.status);
      socket.emit('error-message', { 
        message: 'Race not active. Please start a new race first!'
      });
      return;
    }
    
    // Check if there are cards left in the deck
    if (game.deck.length === 0) {
      console.log('No cards left in the deck');
      socket.emit('error-message', { 
        message: 'No cards left in the deck!'
      });
      return;
    }
    
    // Draw a card
    const card = game.deck.pop();
    const suitName = getSuitName(card.suit);
    console.log('Card drawn:', card, 'Suit name:', suitName);
    
    // Update remaining cards count
    game.remainingCards[suitName]--;
    
    // Update progress for the corresponding suit
    game.progress[suitName] += 10; // Each card advances the horse by 10%
    console.log(`Progress updated for ${suitName}: ${game.progress[suitName]}%`);
    
    // Check if any horse finished the race
    let winner = null;
    for (const suit in game.progress) {
      if (game.progress[suit] >= 100) {
        winner = suit;
        game.status = 'finished';
        game.winner = winner;
        console.log(`Winner found: ${winner}`);
        break;
      }
    }
    
    // Calculate new odds
    const odds = calculateOdds(game);
    
    // Send card drawn event
    socket.emit('card-drawn', {
      card: {
        rank: card.rank,
        suit: card.suit,
        color: getCardColor(card)
      },
      progress: game.progress,
      remainingCards: game.remainingCards,
      odds: odds
    });
    console.log('Card drawn event emitted');
    
    // If race is finished, calculate winnings and update history
    if (game.status === 'finished') {
      console.log('Race finished, calculating results');
      
      // Calculate winnings
      const bet = game.bets[winner];
      const winningsMultiplier = odds[winner];
      const winnings = bet * winningsMultiplier;
      
      console.log(`Bet on winner: ${bet}, Multiplier: ${winningsMultiplier}, Winnings: ${winnings}`);
      
      // Add winnings to player balance if they bet on the winner
      if (bet > 0) {
        player.cattleBalance += winnings;
        console.log(`Player won ${winnings} $CATTLE, new balance: ${player.cattleBalance}`);
        
        // Update player statistics
        if (player.stats) {
          player.stats.racesWon = (player.stats.racesWon || 0) + 1;
          player.stats.totalEarned = (player.stats.totalEarned || 0) + winnings;
        }
        
        // Send race finished event with win
        socket.emit('race-finished', {
          winner: winner,
          bet: bet,
          odds: winningsMultiplier,
          winnings: winnings,
          message: `${winner.charAt(0).toUpperCase() + winner.slice(1)} won! You win ${winnings.toFixed(2)} $CATTLE!`,
          player: player
        });
      } else {
        console.log('Player did not bet on winner');
        
        // Update player statistics for loss
        if (player.stats) {
          player.stats.racesLost = (player.stats.racesLost || 0) + 1;
        }
        
        // Send race finished event with loss
        socket.emit('race-finished', {
          winner: winner,
          bet: 0,
          odds: winningsMultiplier,
          winnings: 0,
          message: `${winner.charAt(0).toUpperCase() + winner.slice(1)} won! You didn't bet on the winner.`,
          player: player
        });
      }
      
      // Add to race history
      game.results.push({
        winner: winner,
        bet: bet,
        winnings: bet > 0 ? winnings : 0
      });
      
      // Keep only the last 10 results
      if (game.results.length > 10) {
        game.results = game.results.slice(-10);
      }
      
      // Reset game status to betting for next race
      game.status = 'betting';
      console.log('Race finished event emitted, status reset to betting');
    }
  });
  
  // Handle profile updates
  socket.on('update-profile', (data) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    
    // Update player name and character type
    player.name = data.name || player.name;
    player.characterType = data.characterType || player.characterType;
    
    // Send updated player data
    socket.emit('game-state', {
      player: player,
      marketPrice: gameState.marketPrice
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