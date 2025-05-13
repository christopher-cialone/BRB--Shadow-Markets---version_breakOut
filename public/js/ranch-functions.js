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
function plantRanchCell(cellIndex) {
    try {
        if (!ranchGrid.initialized) return;
        
        const cell = ranchGrid.cells[cellIndex];
        if (cell.state !== 'empty') return;
        
        // Check if player has resources
        if (!window.gameState || !window.gameState.player) return;
        
        const player = window.gameState.player;
        
        // Planting costs 5 hay
        if (player.hay < 5) {
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification('Not enough hay to plant!', 'error');
            }
            return;
        }
        
        // Deduct resources
        player.hay -= 5;
        
        // Update cell state
        cell.state = 'planted';
        cell.crop = 'wheat';
        cell.planted = Date.now();
        cell.growthStage = 0;
        
        // Start growth process
        startGrowthProcess(cellIndex);
        
        // Update UI
        updateRanchUI();
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Crops planted!', 'success');
        }
        
        console.log('Planted cell', cellIndex);
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
        
        // After 10 seconds, move to growing stage if it hasn't been watered
        setTimeout(() => {
            if (cell.state === 'planted' && cell.growthStage === 0) {
                cell.growthStage = 1;
                updateRanchUI();
                
                // Notify player
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification('Your crops need water!', 'info');
                }
            }
        }, 10000); // 10 seconds
        
        // After 20 seconds, plants wither if not harvested
        setTimeout(() => {
            // Check if it's still in a growing state
            if (cell.state === 'planted' && cell.growthStage < 2) {
                cell.state = 'empty';
                cell.crop = null;
                cell.planted = null;
                cell.growthStage = 0;
                
                updateRanchUI();
                
                // Notify player
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification('Your crops withered!', 'error');
                }
            }
        }, 30000); // 30 seconds
    } catch (err) {
        console.error('Error in startGrowthProcess:', err);
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