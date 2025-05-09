// Connect to server
const socket = io();

// Game state
let playerData = {
    name: 'Cowboy',
    archetype: 'Entrepreneur',
    characterType: 'the-kid',
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

let marketPrice = 1.0;
let currentScene = 'main-menu';
let wagerAmount = 10;

// DOM elements
const mainMenu = document.getElementById('main-menu');
const ranchUI = document.getElementById('ranch-ui');
const saloonUI = document.getElementById('saloon-ui');
const nightUI = document.getElementById('night-ui');
const profileUI = document.getElementById('profile-ui');
const notification = document.getElementById('notification');
const resultModal = document.getElementById('result-modal');

// Initialize Phaser game
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create game instance
const game = new Phaser.Game(config);

// Preload game assets
function preload() {
    // Load background images
    this.load.image('ranch-bg', 'https://i.imgur.com/Rgd25q1.jpg'); // Western ranch background
    this.load.image('saloon-bg', 'https://i.imgur.com/qSIOjeL.jpg'); // Western saloon background  
    this.load.image('night-bg', 'https://i.imgur.com/n0fEUjJ.jpg'); // Night market background
    
    // Load sprites
    this.load.image('character', 'https://i.imgur.com/h5Yxbqk.png'); // Character sprite
    this.load.image('cattle', 'https://i.imgur.com/PCh2a3k.png'); // Cattle sprite
    this.load.image('potion', 'https://i.imgur.com/BWZHIOJ.png'); // Potion sprite
    this.load.image('barn', 'https://i.imgur.com/t32QEZB.png'); // Barn sprite
}

// Create game objects
function create() {
    // Create scenes
    this.ranchScene = this.add.container();
    this.saloonScene = this.add.container();
    this.nightScene = this.add.container();
    
    // Set up Ranch scene
    this.ranchBg = this.add.image(0, 0, 'ranch-bg').setOrigin(0, 0);
    this.ranchBg.displayWidth = window.innerWidth;
    this.ranchBg.displayHeight = window.innerHeight;
    this.ranchScene.add(this.ranchBg);
    
    // Add barn to ranch scene
    this.barn = this.add.image(window.innerWidth * 0.7, window.innerHeight * 0.4, 'barn');
    this.barn.setScale(0.5);
    this.ranchScene.add(this.barn);
    
    // Add character to ranch scene
    this.character = this.add.image(window.innerWidth * 0.3, window.innerHeight * 0.6, 'character');
    this.character.setScale(0.15);
    this.ranchScene.add(this.character);
    
    // Set up Saloon scene
    this.saloonBg = this.add.image(0, 0, 'saloon-bg').setOrigin(0, 0);
    this.saloonBg.displayWidth = window.innerWidth;
    this.saloonBg.displayHeight = window.innerHeight;
    this.saloonScene.add(this.saloonBg);
    
    // Add character to saloon scene
    this.saloonCharacter = this.add.image(window.innerWidth * 0.3, window.innerHeight * 0.6, 'character');
    this.saloonCharacter.setScale(0.15);
    this.saloonScene.add(this.saloonCharacter);
    
    // Set up Night scene
    this.nightBg = this.add.image(0, 0, 'night-bg').setOrigin(0, 0);
    this.nightBg.displayWidth = window.innerWidth;
    this.nightBg.displayHeight = window.innerHeight;
    this.nightScene.add(this.nightBg);
    
    // Add character to night scene
    this.nightCharacter = this.add.image(window.innerWidth * 0.3, window.innerHeight * 0.6, 'character');
    this.nightCharacter.setScale(0.15);
    this.nightScene.add(this.nightCharacter);
    
    // Hide all scenes initially
    this.ranchScene.visible = false;
    this.saloonScene.visible = false;
    this.nightScene.visible = false;
    
    // Make character slightly animated
    this.tweens.add({
        targets: [this.character, this.saloonCharacter, this.nightCharacter],
        y: '+=10',
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Add resize listener
    window.addEventListener('resize', () => {
        this.resize();
    });
}

// Update game state
function update() {
    // Update game based on current scene
}

// Resize handler
Phaser.Scene.prototype.resize = function() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Resize background images
    if (this.ranchBg) {
        this.ranchBg.displayWidth = w;
        this.ranchBg.displayHeight = h;
    }
    
    if (this.saloonBg) {
        this.saloonBg.displayWidth = w;
        this.saloonBg.displayHeight = h;
    }
    
    if (this.nightBg) {
        this.nightBg.displayWidth = w;
        this.nightBg.displayHeight = h;
    }
    
    // Reposition elements
    if (this.barn) {
        this.barn.x = w * 0.7;
        this.barn.y = h * 0.4;
    }
    
    if (this.character) {
        this.character.x = w * 0.3;
        this.character.y = h * 0.6;
    }
    
    if (this.saloonCharacter) {
        this.saloonCharacter.x = w * 0.3;
        this.saloonCharacter.y = h * 0.6;
    }
    
    if (this.nightCharacter) {
        this.nightCharacter.x = w * 0.3;
        this.nightCharacter.y = h * 0.6;
    }
};

// Initialize UI event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Main Menu Events
    document.querySelectorAll('.archetype-card').forEach(card => {
        card.addEventListener('click', () => {
            // Deselect all cards
            document.querySelectorAll('.archetype-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Select clicked card
            card.classList.add('selected');
            
            // Set archetype
            playerData.archetype = card.dataset.archetype;
        });
    });
    
    // Start Game button
    document.getElementById('start-game').addEventListener('click', () => {
        // Get player name
        playerData.name = document.getElementById('player-name').value || 'Cowboy';
        
        // Connect to server
        socket.emit('new-player', {
            name: playerData.name,
            archetype: playerData.archetype
        });
        
        // Switch to ranch scene
        switchScene('ranch');
    });
    
    // Ranch UI Events
    document.getElementById('breed-cattle').addEventListener('click', () => {
        socket.emit('breed-cattle');
    });
    
    document.getElementById('upgrade-barn').addEventListener('click', () => {
        socket.emit('upgrade-barn');
    });
    
    document.getElementById('go-to-saloon').addEventListener('click', () => {
        switchScene('saloon');
    });
    
    document.getElementById('go-to-night').addEventListener('click', () => {
        switchScene('night');
    });
    
    // Saloon UI Events
    const wagerSlider = document.getElementById('wager-slider');
    const wagerDisplay = document.getElementById('wager-amount');
    const burnAmountDisplay = document.getElementById('burn-amount');
    
    wagerSlider.addEventListener('input', () => {
        wagerAmount = parseInt(wagerSlider.value);
        wagerDisplay.textContent = wagerAmount;
        
        // Update burn amount (10%)
        const burnAmount = Math.round(wagerAmount * 0.1 * 10) / 10;
        burnAmountDisplay.textContent = burnAmount;
    });
    
    // All event listeners for horse race game are now handled in the initSaloonScene() function
    // This prevents duplicate event listeners and ensures everything is properly initialized
    
    document.getElementById('back-to-ranch').addEventListener('click', () => {
        switchScene('ranch');
    });
    
    // Night UI Events
    document.getElementById('craft-potion').addEventListener('click', () => {
        socket.emit('craft-potion');
    });
    
    document.getElementById('back-to-ranch-night').addEventListener('click', () => {
        switchScene('ranch');
    });
    
    // Modal Events
    document.getElementById('close-result').addEventListener('click', () => {
        resultModal.classList.add('hidden');
        
        // If in the saloon, reset for a new race
        if (currentScene === 'saloon') {
            initSaloonScene();
        }
    });
});

// Socket event handlers
socket.on('game-state', data => {
    // Update player data
    playerData = data.player;
    marketPrice = data.marketPrice;
    
    // Update UI
    updateUI();
});

socket.on('cattle-bred', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification(`New cattle bred! Cattle #${data.cattle.id} with Speed: ${data.cattle.speed}, Milk: ${data.cattle.milk}`, 'success');
    
    // Update UI
    updateUI();
    
    // Add cattle to game scene
    addCattleToScene(data.cattle);
});

socket.on('barn-upgraded', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification('Barn upgraded! Capacity increased by 50.', 'success');
    
    // Update UI
    updateUI();
    
    // Animate barn growth
    if (game.scene.scenes[0].barn) {
        game.scene.scenes[0].tweens.add({
            targets: game.scene.scenes[0].barn,
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 500,
            yoyo: true,
            repeat: 0,
            ease: 'Bounce.easeOut'
        });
    }
});

socket.on('potion-crafted', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification(`New shadow potion crafted! Potion #${data.potion.id} with Potency: ${data.potion.potency}`, 'success');
    
    // Update UI
    updateUI();
    
    // Add visual effect for potion
    addPotionEffect();
});

socket.on('potion-sold', data => {
    // Update player data
    playerData = data.player;
    
    // Show notification
    showNotification(`Potion sold for ${data.price.toFixed(2)} $CATTLE!`, 'success');
    
    // Update UI
    updateUI();
});

// Add the blackjack-specific event handlers
socket.on('poker-game-started', data => {
    // Update UI
    const playerCardsContainer = document.getElementById('player-cards');
    const dealerCardsContainer = document.getElementById('dealer-cards');
    const playerScoreDisplay = document.getElementById('player-score');
    const dealerScoreDisplay = document.getElementById('dealer-score');
    
    // Clear previous cards
    playerCardsContainer.innerHTML = '';
    dealerCardsContainer.innerHTML = '';
    
    // Add player cards
    data.playerHand.forEach(card => {
        const cardElement = createCardElement(card);
        playerCardsContainer.appendChild(cardElement);
    });
    
    // Add dealer cards (one face up, one face down)
    data.dealerHand.forEach(card => {
        if (card.hidden) {
            const cardElement = createCardElement({ hidden: true });
            dealerCardsContainer.appendChild(cardElement);
        } else {
            const cardElement = createCardElement(card);
            dealerCardsContainer.appendChild(cardElement);
        }
    });
    
    // Update scores
    playerScoreDisplay.textContent = `Score: ${data.playerValue}`;
    dealerScoreDisplay.textContent = `Score: ${data.dealerValue}`;
    
    // Enable game controls if not a blackjack
    if (data.playerValue < 21) {
        document.getElementById('hit-button').disabled = false;
        document.getElementById('stand-button').disabled = false;
        document.getElementById('play-poker').disabled = true;
    }
});

socket.on('poker-card-dealt', data => {
    // Add new card to the appropriate container
    const cardsContainer = document.getElementById(`${data.target}-cards`);
    const scoreDisplay = document.getElementById(`${data.target}-score`);
    
    // Create card element
    const cardElement = createCardElement(data.card);
    cardsContainer.appendChild(cardElement);
    
    // Update score
    scoreDisplay.textContent = `Score: ${data.target === 'player' ? data.playerValue : data.dealerValue}`;
});

socket.on('poker-game-result', data => {
    // Update player data
    playerData = data.player;
    
    // Reveal all dealer cards
    const dealerCardsContainer = document.getElementById('dealer-cards');
    dealerCardsContainer.innerHTML = '';
    
    data.dealerHand.forEach(card => {
        const cardElement = createCardElement(card);
        dealerCardsContainer.appendChild(cardElement);
    });
    
    // Update scores
    document.getElementById('player-score').textContent = `Score: ${data.playerValue}`;
    document.getElementById('dealer-score').textContent = `Score: ${data.dealerValue}`;
    
    // Disable game controls
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
    document.getElementById('play-poker').disabled = false;
    
    // Show result
    let resultClass;
    if (data.result === 'win') {
        resultClass = 'win';
        showResult('You Won!', `${data.message} You won ${data.amount.toFixed(2)} $CATTLE!`, 'success');
    } else if (data.result === 'loss') {
        resultClass = 'loss';
        showResult('You Lost', `${data.message} You lost ${data.amount.toFixed(2)} $CATTLE.`, 'error');
    } else { // push
        resultClass = '';
        showResult('Push', `${data.message}`, 'info');
    }
    
    // Update game history if provided
    if (data.history) {
        const historyContainer = document.getElementById('results-history');
        data.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${item.result === 'win' ? 'win' : (item.result === 'loss' ? 'loss' : '')}`;
            historyItem.textContent = item.result === 'win' ? 'W' : (item.result === 'loss' ? 'L' : 'P');
            historyContainer.appendChild(historyItem);
        });
    }
    
    // Update UI
    updateUI();
});

// Original poker-result handler for backwards compatibility
socket.on('poker-result', data => {
    // Update player data
    playerData = data.player;
    
    // Show result modal
    if (data.win) {
        showResult('You Won!', `You won ${data.amount.toFixed(2)} $CATTLE!`, 'success');
    } else {
        showResult('You Lost', `You lost ${data.amount.toFixed(2)} $CATTLE.`, 'error');
    }
    
    // Update UI
    updateUI();
});

socket.on('market-update', data => {
    // Update market price
    marketPrice = data.marketPrice;
    
    // Show notification
    const trend = marketPrice > 1.0 ? 'up' : 'down';
    showNotification(`Market prices are trending ${trend}! Current multiplier: ${marketPrice.toFixed(2)}x`, 'info');
    
    // Update UI
    updateUI();
});

// Horse Race Game Event Handlers
socket.on('bonus-claimed', data => {
    // Update player data
    playerData = data.player;
    
    // Show bonus notification
    showNotification(`Bonus claimed! You received ${data.amount} $CATTLE!`, 'success');
    
    // Display bonus animation
    document.getElementById('bonus-amount').textContent = `+${data.amount}`;
    document.querySelector('.bonus-display').classList.remove('hidden');
    
    // Hide bonus after 5 seconds
    setTimeout(() => {
        document.querySelector('.bonus-display').classList.add('hidden');
    }, 5000);
    
    // Disable claim button
    document.getElementById('claim-bonus').disabled = true;
    
    // Update UI
    updateUI();
});

socket.on('race-started', data => {
    // Update player data
    playerData = data.player;
    
    // Enable draw card button
    document.getElementById('draw-card').disabled = false;
    
    // Disable start race button
    document.getElementById('start-race').disabled = true;
    
    // Update odds display
    for (const suit in data.odds) {
        document.getElementById(`odds-${suit}`).textContent = data.odds[suit].toFixed(1);
    }
    
    // Show notification
    showNotification(`Race started! 10% (${data.burnAmount.toFixed(1)} $CATTLE) burned. Draw cards to advance horses.`, 'info');
    
    // Update UI
    updateUI();
});

socket.on('card-drawn', data => {
    // Get the card and progress data
    const card = data.card;
    const progress = data.progress;
    
    // Create and display the card
    const drawnCardContainer = document.getElementById('drawn-card');
    drawnCardContainer.innerHTML = '';
    
    const cardElement = createCardElement(card);
    drawnCardContainer.appendChild(cardElement);
    
    // Update progress bars
    for (const suit in progress) {
        document.getElementById(`${suit}-progress`).style.width = `${progress[suit]}%`;
    }
    
    // Update odds
    for (const suit in data.odds) {
        document.getElementById(`odds-${suit}`).textContent = data.odds[suit].toFixed(1);
    }
});

socket.on('race-finished', data => {
    // Update player data
    playerData = data.player;
    
    // Disable draw card button
    document.getElementById('draw-card').disabled = true;
    
    // Enable start race button
    document.getElementById('start-race').disabled = false;
    
    // Add to history
    const historyContainer = document.getElementById('results-history');
    const historyItem = document.createElement('div');
    historyItem.className = `history-item ${data.winner} ${data.bet > 0 ? 'win' : 'loss'}`;
    historyItem.textContent = data.winner.charAt(0).toUpperCase();
    historyContainer.appendChild(historyItem);
    
    // Celebration effect for winners
    if (data.bet > 0) {
        // Create confetti animation
        createConfetti();
        
        // Show celebration overlay
        const celebration = document.getElementById('win-celebration');
        const winAmount = document.getElementById('win-amount');
        winAmount.textContent = `+${data.bet.toFixed(2)} $CATTLE`;
        celebration.classList.remove('hidden');
        
        // Hide celebration after 3.5 seconds
        setTimeout(() => {
            celebration.classList.add('hidden');
        }, 3500);
        
        // Display result with auto-close
        showResult('Winner!', `${data.message}`, 'success', true);
    } else {
        // Display result with auto-close
        showResult('Race Finished', `${data.message}`, 'error', true);
    }
    
    // Update UI
    updateUI();
    
    // Prepare for next race automatically after 4 seconds
    setTimeout(() => {
        // Reset the race UI
        initSaloonScene();
    }, 4000);
});

socket.on('error-message', data => {
    // Show error notification
    showNotification(data.message, 'error');
});

// Helper Functions
function switchScene(scene) {
    // Hide all UI screens
    mainMenu.classList.add('hidden');
    ranchUI.classList.add('hidden');
    saloonUI.classList.add('hidden');
    nightUI.classList.add('hidden');
    profileUI.classList.add('hidden');
    
    // Hide all game scenes
    game.scene.scenes[0].ranchScene.visible = false;
    game.scene.scenes[0].saloonScene.visible = false;
    game.scene.scenes[0].nightScene.visible = false;
    
    // Show selected scene
    switch (scene) {
        case 'main-menu':
            mainMenu.classList.remove('hidden');
            break;
        case 'ranch':
            ranchUI.classList.remove('hidden');
            game.scene.scenes[0].ranchScene.visible = true;
            break;
        case 'saloon':
            saloonUI.classList.remove('hidden');
            game.scene.scenes[0].saloonScene.visible = true;
            
            // Initialize saloon-specific elements
            initSaloonScene();
            break;
        case 'profile':
            profileUI.classList.remove('hidden');
            updateProfileUI();
            break;
        case 'night':
            nightUI.classList.remove('hidden');
            game.scene.scenes[0].nightScene.visible = true;
            break;
    }
    
    // Update current scene
    currentScene = scene;
    
    // Update UI for new scene
    updateUI();
}

// Initialize the saloon scene when it becomes visible
function initSaloonScene() {
    // Clear drawn card
    document.getElementById('drawn-card').innerHTML = '<div class="card-placeholder">Draw a card to advance a horse</div>';
    
    // Reset progress bars
    document.getElementById('hearts-progress').style.width = '0%';
    document.getElementById('diamonds-progress').style.width = '0%';
    document.getElementById('clubs-progress').style.width = '0%';
    document.getElementById('spades-progress').style.width = '0%';
    
    // Get references to race game controls
    const startRaceButton = document.getElementById('start-race');
    const drawCardButton = document.getElementById('draw-card');
    const claimBonusButton = document.getElementById('claim-bonus');
    
    // Get references to bet inputs
    const betInputs = {
        hearts: document.getElementById('bet-hearts'),
        diamonds: document.getElementById('bet-diamonds'),
        clubs: document.getElementById('bet-clubs'),
        spades: document.getElementById('bet-spades')
    };
    
    // Make sure all inputs are properly initialized
    Object.values(betInputs).forEach(input => {
        if (input) {
            input.value = 0;
            
            // Add event listener but first remove any existing ones to avoid duplicates
            input.removeEventListener('input', updateTotalBet);
            input.addEventListener('input', updateTotalBet);
        }
    });
    
    // Reset total bet display
    document.getElementById('total-bet-amount').textContent = '0';
    document.getElementById('burn-amount').textContent = '0';
    
    // Initialize button states
    if (startRaceButton) {
        startRaceButton.disabled = false;
        
        // Remove any existing event listeners to avoid duplicates
        startRaceButton.replaceWith(startRaceButton.cloneNode(true));
        
        // Re-get the button after replacing it
        document.getElementById('start-race').addEventListener('click', () => {
            // Get bets from inputs
            const bets = {
                hearts: parseInt(betInputs.hearts.value) || 0,
                diamonds: parseInt(betInputs.diamonds.value) || 0,
                clubs: parseInt(betInputs.clubs.value) || 0,
                spades: parseInt(betInputs.spades.value) || 0
            };
            
            // Calculate total bet
            const totalBet = bets.hearts + bets.diamonds + bets.clubs + bets.spades;
            
            if (totalBet <= 0) {
                showNotification('Please place at least one bet to start the race!', 'error');
                return;
            }
            
            if (totalBet > playerData.cattleBalance) {
                showNotification('Not enough $CATTLE for your total bet!', 'error');
                return;
            }
            
            // Clear drawn card
            document.getElementById('drawn-card').innerHTML = '<div class="card-placeholder">Race starting...</div>';
            
            // Reset progress bars
            document.getElementById('hearts-progress').style.width = '0%';
            document.getElementById('diamonds-progress').style.width = '0%';
            document.getElementById('clubs-progress').style.width = '0%';
            document.getElementById('spades-progress').style.width = '0%';
            
            // Start the race
            socket.emit('start-race', bets);
        });
    }
    
    if (drawCardButton) {
        drawCardButton.disabled = true;
        
        // Remove any existing event listeners to avoid duplicates
        drawCardButton.replaceWith(drawCardButton.cloneNode(true));
        
        // Re-get the button after replacing it
        document.getElementById('draw-card').addEventListener('click', () => {
            socket.emit('draw-card');
        });
    }
    
    if (claimBonusButton) {
        // Remove any existing event listeners to avoid duplicates
        claimBonusButton.replaceWith(claimBonusButton.cloneNode(true));
        
        // Re-get the button after replacing it
        document.getElementById('claim-bonus').addEventListener('click', () => {
            socket.emit('claim-bonus');
        });
    }
}

function updateUI() {
    // Update resources in Ranch UI
    document.getElementById('cattle-balance').textContent = playerData.cattleBalance.toFixed(2);
    document.getElementById('hay').textContent = playerData.hay;
    document.getElementById('water').textContent = playerData.water;
    document.getElementById('barn-capacity').textContent = playerData.barnCapacity;
    document.getElementById('barn-capacity-2').textContent = playerData.barnCapacity;
    
    // Update resources in Saloon UI
    document.getElementById('saloon-cattle-balance').textContent = playerData.cattleBalance.toFixed(2);
    
    // Update resources in Night UI
    document.getElementById('night-cattle-balance').textContent = playerData.cattleBalance.toFixed(2);
    document.getElementById('market-multiplier').textContent = marketPrice.toFixed(2);
    
    // Update wager slider max value
    const wagerSlider = document.getElementById('wager-slider');
    wagerSlider.max = Math.min(50, Math.floor(playerData.cattleBalance));
    
    if (wagerAmount > playerData.cattleBalance) {
        wagerAmount = Math.floor(playerData.cattleBalance);
        document.getElementById('wager-amount').textContent = wagerAmount;
        wagerSlider.value = wagerAmount;
    }
    
    // Update cattle inventory
    updateCattleInventory();
    
    // Update potion inventory
    updatePotionInventory();
    
    // Update button states
    updateButtonStates();
}

function updateCattleInventory() {
    const cattleInventory = document.getElementById('cattle-inventory');
    
    // Clear inventory
    cattleInventory.innerHTML = '';
    
    // Check if empty
    if (playerData.cattleCollection.length === 0) {
        cattleInventory.innerHTML = '<div class="empty-message">No cattle yet. Start breeding!</div>';
        return;
    }
    
    // Add all cattle
    playerData.cattleCollection.forEach(cattle => {
        const cattleElement = document.createElement('div');
        cattleElement.className = 'inventory-item cattle';
        cattleElement.innerHTML = `
            <div class="title">
                <span class="icon">🐄</span>
                <span>Cattle #${cattle.id.split('-').pop().substr(0, 4)}</span>
            </div>
            <div class="stats">
                <div>Speed: ${cattle.speed}</div>
                <div>Milk: ${cattle.milk}</div>
            </div>
        `;
        cattleInventory.appendChild(cattleElement);
    });
}

function updatePotionInventory() {
    const potionInventory = document.getElementById('potion-inventory');
    
    // Clear inventory
    potionInventory.innerHTML = '';
    
    // Check if empty
    if (playerData.potionCollection.length === 0) {
        potionInventory.innerHTML = '<div class="empty-message">No potions yet. Start crafting!</div>';
        return;
    }
    
    // Add all potions
    playerData.potionCollection.forEach(potion => {
        const potionElement = document.createElement('div');
        potionElement.className = 'inventory-item potion';
        potionElement.innerHTML = `
            <div class="title">
                <span class="icon">🧪</span>
                <span>Potion #${potion.id.split('-').pop().substr(0, 4)}</span>
            </div>
            <div class="stats">
                <div>Potency: ${potion.potency}</div>
                <div>Market Value: ${((25 + potion.potency * 1.5) * marketPrice).toFixed(2)} $CATTLE</div>
            </div>
            <button class="sell">Sell Potion</button>
        `;
        
        // Add sell event listener
        const sellButton = potionElement.querySelector('.sell');
        sellButton.addEventListener('click', () => {
            socket.emit('sell-potion', { potionId: potion.id });
        });
        
        potionInventory.appendChild(potionElement);
    });
}

function updateButtonStates() {
    // Breed Cattle button
    const breedButton = document.getElementById('breed-cattle');
    if (breedButton) {
        breedButton.disabled = playerData.hay < 10 || playerData.water < 10;
    }
    
    // Upgrade Barn button
    const upgradeButton = document.getElementById('upgrade-barn');
    if (upgradeButton) {
        upgradeButton.disabled = playerData.cattleBalance < 50;
    }
    
    // Craft Potion button
    const craftButton = document.getElementById('craft-potion');
    if (craftButton) {
        craftButton.disabled = playerData.cattleBalance < 20;
    }
    
    // Race game controls - only update if we're in the saloon
    if (currentScene === 'saloon') {
        // Start Race button - enable if any bet is placed
        const startRaceButton = document.getElementById('start-race');
        if (startRaceButton) {
            let totalBet = 0;
            const betInputs = {
                hearts: document.getElementById('bet-hearts').value || 0,
                diamonds: document.getElementById('bet-diamonds').value || 0,
                clubs: document.getElementById('bet-clubs').value || 0,
                spades: document.getElementById('bet-spades').value || 0
            };
            
            Object.values(betInputs).forEach(value => {
                totalBet += parseInt(value);
            });
            
            startRaceButton.disabled = totalBet <= 0 || totalBet > playerData.cattleBalance;
        }
    }
}

function showNotification(message, type = 'info') {
    // Set notification content
    notification.querySelector('.content').textContent = message;
    
    // Set notification type
    notification.className = type;
    notification.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function showResult(title, message, type = 'info', autoClose = false) {
    // Set result content
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-message').textContent = message;
    
    // Set result type
    resultModal.className = 'modal ' + type;
    resultModal.classList.remove('hidden');
    
    // Auto-close after 3 seconds if requested
    if (autoClose) {
        setTimeout(() => {
            resultModal.classList.add('hidden');
            
            // If we're in the saloon, reset for a new race
            if (currentScene === 'saloon') {
                initSaloonScene();
            }
        }, 3000);
    }
}

function addCattleToScene(cattle) {
    // Add a cattle sprite to the ranch scene
    const scene = game.scene.scenes[0];
    
    // Random position near the barn
    const x = scene.barn.x + (Math.random() * 200 - 100);
    const y = scene.barn.y + (Math.random() * 200);
    
    const cattleSprite = scene.add.image(x, y, 'cattle');
    cattleSprite.setScale(0.1);
    scene.ranchScene.add(cattleSprite);
    
    // Simple animation
    scene.tweens.add({
        targets: cattleSprite,
        y: '+=20',
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function updateProfileUI() {
    // Update profile information
    document.getElementById('profile-cattle-balance').textContent = playerData.cattleBalance.toFixed(2);
    document.getElementById('character-name').value = playerData.name;
    
    // Update character image
    document.getElementById('character-image').src = `img/characters/${playerData.characterType}.jpeg`;
    if (playerData.characterType === 'the-scientist') {
        document.getElementById('character-image').src = 'img/characters/the-scientist.jpg';
    }
    
    // Update character selection
    document.querySelectorAll('.character-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.character === playerData.characterType) {
            option.classList.add('selected');
        }
    });
    
    // Update statistics
    if (playerData.stats) {
        document.getElementById('races-won').textContent = playerData.stats.racesWon;
        document.getElementById('races-lost').textContent = playerData.stats.racesLost;
        document.getElementById('cattle-bred').textContent = playerData.stats.cattleBred;
        document.getElementById('potions-crafted').textContent = playerData.stats.potionsCrafted;
        document.getElementById('total-earned').textContent = playerData.stats.totalEarned.toFixed(2);
        document.getElementById('total-burned').textContent = playerData.stats.totalBurned.toFixed(2);
    }
}

function addPotionEffect() {
    // Add a potion visual effect to the night scene
    const scene = game.scene.scenes[0];
    
    const potion = scene.add.image(scene.nightCharacter.x + 50, scene.nightCharacter.y - 50, 'potion');
    potion.setScale(0.05);
    scene.nightScene.add(potion);
    
    // Potion animation
    scene.tweens.add({
        targets: potion,
        alpha: { from: 1, to: 0 },
        y: '-=100',
        duration: 2000,
        ease: 'Power1',
        onComplete: () => {
            potion.destroy();
        }
    });
}

// Update total bet display - global function used by event listeners
function updateTotalBet() {
    let total = 0;
    const betHearts = parseInt(document.getElementById('bet-hearts').value) || 0;
    const betDiamonds = parseInt(document.getElementById('bet-diamonds').value) || 0;
    const betClubs = parseInt(document.getElementById('bet-clubs').value) || 0;
    const betSpades = parseInt(document.getElementById('bet-spades').value) || 0;
    
    total = betHearts + betDiamonds + betClubs + betSpades;
    
    // Update total bet display
    document.getElementById('total-bet-amount').textContent = total;
    document.getElementById('burn-amount').textContent = (total * 0.1).toFixed(1);
    
    // Update Start Race button state
    const startRaceButton = document.getElementById('start-race');
    if (startRaceButton) {
        startRaceButton.disabled = total <= 0 || total > playerData.cattleBalance;
    }
}

// Card rendering function for blackjack game
function createCardElement(card) {
    const cardElement = document.createElement('div');
    
    if (card.hidden) {
        // Face down card
        cardElement.className = 'card face-down';
        return cardElement;
    }
    
    // Face up card
    cardElement.className = `card ${card.color}`;
    
    // Create card content
    const suitTop = document.createElement('div');
    suitTop.className = 'suit top';
    suitTop.textContent = card.suit;
    
    const rank = document.createElement('div');
    rank.className = 'rank';
    rank.textContent = card.rank;
    
    const suitBottom = document.createElement('div');
    suitBottom.className = 'suit bottom';
    suitBottom.textContent = card.suit;
    
    // Append content to card
    cardElement.appendChild(suitTop);
    cardElement.appendChild(rank);
    cardElement.appendChild(suitBottom);
    
    return cardElement;
}