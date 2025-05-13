/**
 * Bull Run Boost - Ranch Functions
 * 
 * This file contains functions related to the ranch gameplay mechanics,
 * including harvesting, planting, and cattle management.
 */

// Ranch grid initialization and management
let ranchGrid = {
    cells: [],
    rows: 5,
    cols: 5,
    initialized: false
};

// Crop types with different properties
const cropTypes = {
    wheat: {
        name: "Wheat",
        growthTime: 120000, // 2 minutes
        waterBoost: 1.5,    // Growth boost from watering
        harvestReward: { hay: 15, cattle: 1 },
        weatherEffects: {
            sunny: 1.2,     // 20% boost in sunny weather
            rainy: 1.3,     // 30% boost in rainy weather
            stormy: 0.8     // 20% penalty in stormy weather
        },
        icon: '🌾'
    },
    corn: {
        name: "Corn",
        growthTime: 180000, // 3 minutes
        waterBoost: 1.4,    // Growth boost from watering
        harvestReward: { hay: 25, cattle: 2 },
        weatherEffects: {
            sunny: 1.4,     // 40% boost in sunny weather
            rainy: 1.1,     // 10% boost in rainy weather
            stormy: 0.6     // 40% penalty in stormy weather
        },
        icon: '🌽'
    },
    cactus: {
        name: "Cactus",
        growthTime: 300000, // 5 minutes
        waterBoost: 1.2,    // Less boost from watering (desert plant)
        harvestReward: { hay: 30, cattle: 3, water: 5 },
        weatherEffects: {
            sunny: 1.5,     // 50% boost in sunny weather
            rainy: 0.9,     // 10% penalty in rainy weather
            stormy: 0.7     // 30% penalty in stormy weather
        },
        icon: '🌵'
    }
};

// Weather system
let weatherSystem = {
    currentWeather: 'sunny', // Default weather
    weatherStartTime: Date.now(),
    weatherDuration: 300000, // 5 minutes per weather cycle
    effects: {
        sunny: {
            name: "Sunny",
            description: "Perfect for sunlight-loving crops",
            icon: '☀️'
        },
        rainy: {
            name: "Rainy",
            description: "Great for water-needing crops",
            icon: '🌧️'
        },
        stormy: {
            name: "Stormy",
            description: "Crops grow slower, be careful!",
            icon: '⛈️'
        }
    }
};

// Initialize the ranch grid
function initRanchGrid() {
    try {
        console.log('Initializing ranch grid...');
        
        // Clear existing grid if any
        ranchGrid.cells = [];
        
        // Create empty cells
        for (let i = 0; i < ranchGrid.rows * ranchGrid.cols; i++) {
            ranchGrid.cells.push({
                id: i,
                state: 'empty',
                crop: null,
                planted: null,
                harvestable: false,
                growthStage: 0
            });
        }
        
        // Set initialization flag
        ranchGrid.initialized = true;
        
        // Setup UI elements
        setupRanchUI();
        
        console.log('Ranch grid initialized with', ranchGrid.cells.length, 'cells');
    } catch (err) {
        console.error('Error in initRanchGrid:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error initializing ranch grid', 'error');
        }
    }
}

// Setup ranch UI elements
function setupRanchUI() {
    try {
        const ranchContainer = document.getElementById('ranch-container');
        if (!ranchContainer) {
            console.error('Ranch container not found');
            return;
        }
        
        // Clear existing content
        ranchContainer.innerHTML = '';
        
        // Create grid cells
        const gridElement = document.createElement('div');
        gridElement.className = 'ranch-grid';
        
        // Set grid template columns based on number of columns
        gridElement.style.gridTemplateColumns = `repeat(${ranchGrid.cols}, 1fr)`;
        
        // Create cells
        for (let i = 0; i < ranchGrid.cells.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'ranch-cell';
            cell.dataset.index = i;
            cell.textContent = ''; // Empty by default
            
            // Add click event listener for interaction
            cell.addEventListener('click', () => {
                interactWithRanchCell(i);
            });
            
            gridElement.appendChild(cell);
        }
        
        ranchContainer.appendChild(gridElement);
        
        // Create resource display
        const resourceDisplay = document.createElement('div');
        resourceDisplay.className = 'resource-display';
        resourceDisplay.innerHTML = `
            <div>Hay: <span id="ranch-hay-amount">0</span></div>
            <div>Water: <span id="ranch-water-amount">0</span></div>
            <div>Cattle: <span id="ranch-cattle-balance">0</span></div>
        `;
        
        ranchContainer.appendChild(resourceDisplay);
        
        // Create action buttons
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';
        actionButtons.innerHTML = `
            <button id="plant-btn">Plant Crops</button>
            <button id="water-btn">Water Crops</button>
            <button id="harvest-btn">Harvest All</button>
            <button id="return-from-ranch-btn">Return to Town</button>
        `;
        
        ranchContainer.appendChild(actionButtons);
        
        // Add event listeners for buttons
        document.getElementById('plant-btn').addEventListener('click', plantAllFields);
        document.getElementById('water-btn').addEventListener('click', waterAllFields);
        document.getElementById('harvest-btn').addEventListener('click', harvestAllFields);
        
        // Update UI with current game state
        updateRanchUI();
        
        console.log('Ranch UI set up');
    } catch (err) {
        console.error('Error in setupRanchUI:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error setting up ranch UI', 'error');
        }
    }
}

// Update ranch UI based on grid state
function updateRanchUI() {
    try {
        if (!ranchGrid.initialized) return;
        
        // Update cell appearances
        const cells = document.querySelectorAll('.ranch-cell');
        
        cells.forEach((cell, index) => {
            const cellData = ranchGrid.cells[index];
            
            // Reset all classes
            cell.className = 'ranch-cell';
            
            // Add state-specific classes
            if (cellData.state === 'planted') {
                cell.classList.add('planted');
                // Add visual indicator for growth stage
                if (cellData.growthStage === 1) {
                    cell.classList.add('growing');
                }
            } else if (cellData.state === 'harvestable') {
                cell.classList.add('harvestable');
            } else {
                cell.classList.add('empty');
            }
        });
        
        // Update resource displays
        if (window.gameState && window.gameState.player) {
            const player = window.gameState.player;
            
            document.getElementById('ranch-hay-amount').textContent = player.hay || 0;
            document.getElementById('ranch-water-amount').textContent = player.water || 0;
            document.getElementById('ranch-cattle-balance').textContent = player.cattleBalance || 0;
        }
        
        console.log('Ranch UI updated');
    } catch (err) {
        console.error('Error in updateRanchUI:', err);
    }
}

// Interact with a specific ranch cell
function interactWithRanchCell(cellIndex) {
    try {
        if (!ranchGrid.initialized) return;
        
        const cell = ranchGrid.cells[cellIndex];
        
        // Different interaction based on cell state
        if (cell.state === 'empty') {
            plantRanchCell(cellIndex);
        } else if (cell.state === 'planted') {
            waterRanchCell(cellIndex);
        } else if (cell.state === 'harvestable') {
            harvestRanchCell(cellIndex);
        }
        
        // Update UI after interaction
        updateRanchUI();
    } catch (err) {
        console.error('Error in interactWithRanchCell:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error interacting with cell', 'error');
        }
    }
}

// Plant crops in a specific cell
function plantRanchCell(cellIndex, cropType = 'wheat') {
    try {
        if (!ranchGrid.initialized) return;
        
        // Validate crop type
        if (!cropTypes[cropType]) {
            console.error('Invalid crop type:', cropType);
            cropType = 'wheat'; // Fallback to wheat
        }
        
        const cell = ranchGrid.cells[cellIndex];
        if (cell.state !== 'empty') return;
        
        // Check if player has resources
        if (!window.gameState || !window.gameState.player) return;
        
        const player = window.gameState.player;
        
        // Different crops have different planting costs
        const plantingCosts = {
            wheat: { hay: 5 },
            corn: { hay: 10 },
            cactus: { hay: 15, water: 5 }
        };
        
        const cost = plantingCosts[cropType];
        
        // Check if player has enough resources
        let missingResource = null;
        if (player.hay < (cost.hay || 0)) missingResource = 'hay';
        if (cost.water && player.water < cost.water) missingResource = 'water';
        
        if (missingResource) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(`Not enough ${missingResource} to plant ${cropTypes[cropType].name}!`, 'error');
            }
            return;
        }
        
        // Deduct resources
        player.hay -= (cost.hay || 0);
        if (cost.water) player.water -= cost.water;
        
        // Update cell state
        cell.state = 'planted';
        cell.crop = cropType;
        cell.planted = Date.now();
        cell.growthStage = 0;
        cell.lastWeather = weatherSystem.currentWeather; // Track weather at planting time
        
        // Track crop planting statistics
        if (!player.stats) player.stats = {};
        if (!player.stats.cropsPlanted) player.stats = {...player.stats, cropsPlanted: {}};
        if (!player.stats.cropsPlanted[cropType]) player.stats.cropsPlanted[cropType] = 0;
        player.stats.cropsPlanted[cropType]++;
        
        // Start growth process
        startGrowthProcess(cellIndex);
        
        // Update UI
        updateRanchUI();
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification(`${cropTypes[cropType].name} planted! ${weatherSystem.effects[weatherSystem.currentWeather].icon}`, 'success');
        }
        
        console.log(`Planted ${cropType} in cell ${cellIndex} during ${weatherSystem.currentWeather} weather`);
        
        // Save game after planting
        if (window.saveGame) {
            window.saveGame();
        }
    } catch (err) {
        console.error('Error in plantRanchCell:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error planting crops', 'error');
        }
    }
}

// Water the crops in a specific cell
function waterRanchCell(cellIndex) {
    try {
        if (!ranchGrid.initialized) return;
        
        const cell = ranchGrid.cells[cellIndex];
        if (cell.state !== 'planted') return;
        
        // Check if player has resources
        if (!window.gameState || !window.gameState.player) return;
        
        const player = window.gameState.player;
        
        // Watering costs 5 water
        if (player.water < 5) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification('Not enough water!', 'error');
            }
            return;
        }
        
        // Deduct resources
        player.water -= 5;
        
        // Update growth stage
        cell.growthStage++;
        
        // If growth stage is 2, make it harvestable
        if (cell.growthStage >= 2) {
            cell.state = 'harvestable';
        }
        
        // Update UI
        updateRanchUI();
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Crops watered!', 'success');
        }
        
        console.log('Watered cell', cellIndex);
    } catch (err) {
        console.error('Error in waterRanchCell:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error watering crops', 'error');
        }
    }
}

// Harvest crops from a specific cell
function harvestRanchCell(cellIndex) {
    try {
        if (!ranchGrid.initialized) return;
        
        const cell = ranchGrid.cells[cellIndex];
        if (cell.state !== 'harvestable') return;
        
        // Check player state
        if (!window.gameState || !window.gameState.player) return;
        
        const player = window.gameState.player;
        
        // Harvesting gives 10 hay
        player.hay += 10;
        
        // If it's wheat, also add some cattle tokens
        if (cell.crop === 'wheat') {
            const cattleReward = 5;
            player.cattleBalance += cattleReward;
            
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(`Harvested! +10 Hay, +${cattleReward} CATTLE`, 'success');
            }
        } else {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification('Harvested! +10 Hay', 'success');
            }
        }
        
        // Reset cell to empty
        cell.state = 'empty';
        cell.crop = null;
        cell.planted = null;
        cell.growthStage = 0;
        
        // Update UI
        updateRanchUI();
        
        // Update main game UI if possible
        if (window.gameManager && window.gameManager.updateUI) {
            window.gameManager.updateUI();
        }
        
        // Save game progress
        if (window.saveGameState) {
            window.saveGameState();
        }
        
        console.log('Harvested cell', cellIndex);
    } catch (err) {
        console.error('Error in harvestRanchCell:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error harvesting crops', 'error');
        }
    }
}

// Start the growth process for a cell
function startGrowthProcess(cellIndex) {
    try {
        const cell = ranchGrid.cells[cellIndex];
        if (!cell || cell.state !== 'planted' || !cell.crop) return;
        
        // Get crop type data
        const cropData = cropTypes[cell.crop];
        if (!cropData) {
            console.error('Unknown crop type:', cell.crop);
            return;
        }
        
        // Calculate growth time based on weather conditions
        let growthTime = cropData.growthTime;
        const weatherEffect = cropData.weatherEffects[weatherSystem.currentWeather] || 1;
        
        // Apply weather effect
        growthTime = growthTime / weatherEffect;
        
        // For demo purposes, speed up growth times by a factor of 4
        const speedUpFactor = 4;
        const actualGrowthTime = growthTime / speedUpFactor;
        
        // Stage 1: Need water warning (20% of growth time)
        const waterWarningTime = actualGrowthTime * 0.2;
        
        // Stage 2: First visible growth (40% of growth time)
        const firstGrowthTime = actualGrowthTime * 0.4;
        
        // Stage 3: Harvestable (100% of growth time)
        const harvestTime = actualGrowthTime;
        
        // Stage 4: Withering if not harvested (150% of growth time)
        const witherTime = actualGrowthTime * 1.5;
        
        console.log(`Growing ${cell.crop} with base time ${cropData.growthTime}ms, weather effect ${weatherEffect}, adjusted time ${actualGrowthTime}ms`);
        console.log(`Weather is ${weatherSystem.currentWeather} (${weatherSystem.effects[weatherSystem.currentWeather].icon})`);
        
        // After waterWarningTime, warn player to water if not already watered
        setTimeout(() => {
            if (cell.state === 'planted' && !cell.watered && cell.growthStage === 0) {
                // Don't increase growth stage yet, just notify
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification(`Your ${cropData.name} needs water! ${weatherSystem.effects[weatherSystem.currentWeather].icon}`, 'info');
                }
            }
        }, waterWarningTime);
        
        // After firstGrowthTime, move to first growth stage
        setTimeout(() => {
            if (cell.state === 'planted') {
                // Apply watering boost if watered
                if (cell.watered) {
                    cell.growthStage = 1;
                    cell.weatherInfluence = weatherSystem.currentWeather;
                    updateRanchUI();
                    
                    console.log(`Cell ${cellIndex} (${cell.crop}) reached growth stage 1`);
                    
                    // Notify player of growth progress
                    if (window.gameManager && window.gameManager.showNotification) {
                        window.gameManager.showNotification(`${cropData.name} sprouting! ${cropData.icon}`, 'info');
                    }
                } else {
                    // Not watered, less progress
                    cell.growthStage = 1;
                    updateRanchUI();
                    
                    if (window.gameManager && window.gameManager.showNotification) {
                        window.gameManager.showNotification(`${cropData.name} growing slowly. Water it! ${cropData.icon}`, 'warning');
                    }
                }
                
                // Update weather effects
                updateWeatherEffects(cellIndex);
            }
        }, firstGrowthTime);
        
        // After harvestTime, make crops harvestable
        setTimeout(() => {
            if (cell.state === 'planted') {
                if (cell.watered || cell.growthStage >= 1) {
                    // Successfully grown
                    cell.state = 'harvestable';
                    cell.harvestable = true;
                    cell.growthStage = 2;
                    updateRanchUI();
                    
                    console.log(`Cell ${cellIndex} (${cell.crop}) is now harvestable`);
                    
                    // Notify player based on crop type
                    if (window.gameManager && window.gameManager.showNotification) {
                        window.gameManager.showNotification(`${cropData.name} ready to harvest! ${cropData.icon}`, 'success');
                    }
                    
                    // Save game when crops are ready
                    if (window.saveGame) {
                        window.saveGame();
                    }
                } else {
                    // Not watered enough, will wither soon
                    if (window.gameManager && window.gameManager.showNotification) {
                        window.gameManager.showNotification(`${cropData.name} struggling without water! ${cropData.icon}`, 'warning');
                    }
                }
            }
        }, harvestTime);
        
        // After witherTime, crops wither if not harvested
        setTimeout(() => {
            // Check if it's still planted and not yet harvested
            if (cell.state === 'planted' || (cell.state === 'harvestable' && !cell.harvested)) {
                cell.state = 'empty';
                cell.crop = null;
                cell.planted = null;
                cell.growthStage = 0;
                cell.watered = false;
                
                updateRanchUI();
                
                // Notify player
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification('Your crops withered!', 'error');
                }
            }
        }, witherTime);
    } catch (err) {
        console.error('Error in startGrowthProcess:', err);
    }
}

// Update crop growth based on changing weather
function updateWeatherEffects(cellIndex) {
    const cell = ranchGrid.cells[cellIndex];
    if (!cell || cell.state !== 'planted' || !cell.crop) return;
    
    // If weather has changed since planting, apply a one-time effect
    const currentWeather = weatherSystem.currentWeather;
    if (cell.lastWeather && cell.lastWeather !== currentWeather) {
        console.log(`Weather changed from ${cell.lastWeather} to ${currentWeather} for ${cell.crop} in cell ${cellIndex}`);
        
        // Special weather change effects
        if (currentWeather === 'stormy' && cell.crop !== 'cactus') {
            // Non-cactus crops have a chance to be damaged in storms
            if (Math.random() < 0.3) { // 30% chance
                cell.damaged = true;
                
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification(`${cropTypes[cell.crop].name} damaged by storm! ${weatherSystem.effects.stormy.icon}`, 'warning');
                }
            }
        } else if (currentWeather === 'rainy' && cell.crop === 'wheat') {
            // Wheat gets an extra boost during rain
            cell.rainBoosted = true;
            
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(`${cropTypes[cell.crop].name} thriving in the rain! ${weatherSystem.effects.rainy.icon}`, 'info');
            }
        }
        
        // Update the last weather
        cell.lastWeather = currentWeather;
    }
}

// Plant all empty cells
function plantAllFields() {
    try {
        if (!ranchGrid.initialized) return;
        
        // Check if player has resources
        if (!window.gameState || !window.gameState.player) return;
        
        const player = window.gameState.player;
        
        // Count empty cells
        const emptyCells = ranchGrid.cells.filter(cell => cell.state === 'empty');
        const totalCost = emptyCells.length * 5; // 5 hay per cell
        
        if (player.hay < totalCost) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(`Not enough hay! Need ${totalCost} hay.`, 'error');
            }
            return;
        }
        
        // Plant all empty cells
        emptyCells.forEach(cell => {
            plantRanchCell(cell.id);
        });
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification(`Planted ${emptyCells.length} fields!`, 'success');
        }
    } catch (err) {
        console.error('Error in plantAllFields:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error planting all fields', 'error');
        }
    }
}

// Water all planted cells
function waterAllFields() {
    try {
        if (!ranchGrid.initialized) return;
        
        // Check if player has resources
        if (!window.gameState || !window.gameState.player) return;
        
        const player = window.gameState.player;
        
        // Count planted cells
        const plantedCells = ranchGrid.cells.filter(cell => cell.state === 'planted');
        const totalCost = plantedCells.length * 5; // 5 water per cell
        
        if (player.water < totalCost) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(`Not enough water! Need ${totalCost} water.`, 'error');
            }
            return;
        }
        
        // Water all planted cells
        plantedCells.forEach(cell => {
            waterRanchCell(cell.id);
        });
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification(`Watered ${plantedCells.length} fields!`, 'success');
        }
    } catch (err) {
        console.error('Error in waterAllFields:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error watering all fields', 'error');
        }
    }
}

// Harvest all harvestable cells
function harvestAllFields() {
    try {
        if (!ranchGrid.initialized) return;
        
        // Count harvestable cells
        const harvestableCells = ranchGrid.cells.filter(cell => cell.state === 'harvestable');
        
        if (harvestableCells.length === 0) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification('No fields ready to harvest!', 'info');
            }
            return;
        }
        
        // Harvest all harvestable cells
        harvestableCells.forEach(cell => {
            harvestRanchCell(cell.id);
        });
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification(`Harvested ${harvestableCells.length} fields!`, 'success');
        }
    } catch (err) {
        console.error('Error in harvestAllFields:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error harvesting all fields', 'error');
        }
    }
}

// Make functions available globally
window.initRanchGrid = initRanchGrid;
window.updateRanchUI = updateRanchUI;