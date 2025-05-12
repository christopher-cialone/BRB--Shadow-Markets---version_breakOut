/**
 * Racing Game Server Module
 * This will be incorporated into server.js
 */

// Racing game state storage
const raceGames = {};

/**
 * Utility functions for cards
 */
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

function getSuitName(suit) {
  switch(suit) {
    case '♥': return 'hearts';
    case '♦': return 'diamonds';
    case '♣': return 'clubs';
    case '♠': return 'spades';
    default: return null;
  }
}

/**
 * Initialize a race game for a player
 */
function initRaceGame(playerId) {
  console.log(`Initializing race game for player ${playerId}`);
  
  // Create and shuffle a fresh deck
  const deck = shuffleDeck(createDeck());
  
  // Initialize race game state
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
    bonusClaimed: false,
    startTime: Date.now(),
    cardsDrawn: 0
  };
  
  console.log(`Race game initialized with ${deck.length} cards`);
  
  // Calculate and return odds
  return calculateOdds(raceGames[playerId]);
}

/**
 * Calculate odds for each suit based on remaining cards
 */
function calculateOdds(game) {
  if (!game) return { hearts: 4.0, diamonds: 4.0, clubs: 4.0, spades: 4.0 };
  
  const totalCards = game.remainingCards.hearts + game.remainingCards.diamonds + 
                     game.remainingCards.clubs + game.remainingCards.spades;
  
  if (totalCards === 0) return { hearts: 4.0, diamonds: 4.0, clubs: 4.0, spades: 4.0 };
  
  // Base odds are 4.0x for a completely fair deck
  // As cards are drawn, adjust odds based on remaining cards of each suit
  const odds = {
    'hearts': parseFloat((4.0 * (totalCards / (Math.max(1, game.remainingCards.hearts) * 4))).toFixed(1)),
    'diamonds': parseFloat((4.0 * (totalCards / (Math.max(1, game.remainingCards.diamonds) * 4))).toFixed(1)),
    'clubs': parseFloat((4.0 * (totalCards / (Math.max(1, game.remainingCards.clubs) * 4))).toFixed(1)),
    'spades': parseFloat((4.0 * (totalCards / (Math.max(1, game.remainingCards.spades) * 4))).toFixed(1))
  };
  
  // Cap odds at reasonable values
  Object.keys(odds).forEach(suit => {
    odds[suit] = Math.min(10.0, Math.max(1.0, odds[suit]));
  });
  
  return odds;
}

/**
 * Process a card draw and update game state
 */
function processCardDraw(game) {
  if (!game || game.status !== 'racing' || game.deck.length === 0) {
    return null;
  }
  
  // Track card draws
  game.cardsDrawn = (game.cardsDrawn || 0) + 1;
  
  // Draw a card from the deck
  const card = game.deck.pop();
  const suitName = getSuitName(card.suit);
  
  console.log(`Card drawn: ${card.rank}${card.suit} (${suitName})`);
  
  if (!suitName) {
    console.error('Invalid suit encountered:', card.suit);
    return null;
  }
  
  // Update remaining cards count
  if (game.remainingCards[suitName] !== undefined) {
    game.remainingCards[suitName] = Math.max(0, game.remainingCards[suitName] - 1);
  }
  
  // Update progress for the corresponding suit
  const progressIncrement = 12; // Each card advances by 12%
  game.progress[suitName] = Math.min(100, (game.progress[suitName] || 0) + progressIncrement);
  
  // Check if any horse finished the race
  let winner = null;
  for (const suit in game.progress) {
    if (game.progress[suit] >= 100) {
      winner = suit;
      game.status = 'finished';
      game.winner = winner;
      
      // Record in results history
      if (!game.results) game.results = [];
      game.results.push({
        winner: winner,
        timestamp: Date.now(),
        cardsDrawn: game.cardsDrawn
      });
      
      console.log(`Race winner: ${winner} after ${game.cardsDrawn} cards`);
      break;
    }
  }
  
  // Return the result of this draw
  return {
    card: {
      rank: card.rank,
      suit: card.suit,
      color: getCardColor(card)
    },
    progress: game.progress,
    remainingCards: game.remainingCards,
    odds: calculateOdds(game),
    winner: winner
  };
}

/**
 * Calculate winnings for a race result
 */
function calculateRaceWinnings(game, player) {
  if (!game || !game.winner || game.status !== 'finished') {
    return {
      bet: 0,
      odds: 0,
      winnings: 0,
      message: 'No race result available'
    };
  }
  
  const winner = game.winner;
  const odds = calculateOdds(game);
  const winnerOdds = odds[winner] || 1;
  const bet = game.bets[winner] || 0;
  const winnings = bet * winnerOdds;
  
  console.log(`Bet on winner: ${bet}, Odds: ${winnerOdds}, Winnings: ${winnings}`);
  
  let message;
  if (bet > 0) {
    message = `${winner.charAt(0).toUpperCase() + winner.slice(1)} won! You win ${winnings.toFixed(2)} $CATTLE!`;
    
    // Update player stats if available
    if (player && player.stats) {
      player.stats.racesWon = (player.stats.racesWon || 0) + 1;
      player.stats.totalEarned = (player.stats.totalEarned || 0) + winnings;
    }
  } else {
    message = `${winner.charAt(0).toUpperCase() + winner.slice(1)} won. You didn't bet on the winner.`;
    
    // Update player stats if available
    if (player && player.stats) {
      player.stats.racesLost = (player.stats.racesLost || 0) + 1;
    }
  }
  
  return {
    bet,
    odds: winnerOdds,
    winnings,
    message
  };
}

// Export the module functions
module.exports = {
  initRaceGame,
  calculateOdds,
  processCardDraw,
  calculateRaceWinnings,
  getSuitName,
  getCardColor,
  createDeck,
  shuffleDeck,
  raceGames
};