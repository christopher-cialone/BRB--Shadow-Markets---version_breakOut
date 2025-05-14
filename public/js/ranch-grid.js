/**
 * Ranch Grid System - Vanilla JavaScript Implementation
 * Handles crop and cattle management in the ranch scene
 */

// Ranch grid configuration
const ranchGridConfig = {
    rows: 5,
    cols: 5,
    cellSize: 100,
    gridId: 'ranch-grid-container',
    actionMenuId: 'ranch-action-menu'
};

// Cell types and states
const CELL_TYPES = {
    EMPTY: 'empty',
    CROP: 'crop',
    CATTLE: 'cattle'
};

// Crop types and states
const CROP_STATES = {
    SEED: 'seed',
    GROWING: 'growing',
    READY: 'ready'
};

// Cattle types
const CATTLE_TYPES = {
    COW: 'cow',
    BULL: 'bull'
};

// Cattle states
const CATTLE_STATES = {
    HUNGRY: 'hungry',
    FED: 'fed',
    PRODUCING: 'producing' // For cows producing milk
};

// Initialize ranch grid data if not exists
if (!window.ranchGrid) {
    window.ranchGrid = {
        cells: []
    };

    // Create 5x5 grid of empty cells
    for (let i = 0; i < ranchGridConfig.rows * ranchGridConfig.cols; i++) {
        window.ranchGrid.cells.push({
            id: i,
            type: CELL_TYPES.EMPTY,
            state: null,
            data: {}
        });
    }
}

// Cell prices and configurations
const PRICES = {
    SEEDS: 5,
    COW: 50,
    BULL: 100,
    FEED: 2,
    MILK_SELL_PRICE: 10,
    RODEO_ENTRY_FEE: 20
};

// Time in milliseconds for crop growth and milk production
const TIMERS = {
    CROP_GROWING: 30000, // 30 seconds for crops to grow
    COW_MILK_PRODUCTION: 60000 // 60 seconds for milk production
};

/**
 * Initialize the ranch grid UI
 */
function initRanchGrid() {
    createRanchGridUI();
    createActionMenu();
    renderRanchGrid();
    console.log("Ranch grid initialized with vanilla JS");
}

/**
 * Create the HTML grid container
 */
function createRanchGridUI() {
    // Check if grid already exists
    if (document.getElementById(ranchGridConfig.gridId)) {
        return;
    }

    // Calculate grid dimensions
    const gridWidth = ranchGridConfig.cols * ranchGridConfig.cellSize;
    const gridHeight = ranchGridConfig.rows * ranchGridConfig.cellSize;

    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.id = ranchGridConfig.gridId;
    gridContainer.className = 'ranch-grid';
    gridContainer.style.width = gridWidth + 'px';
    gridContainer.style.height = gridHeight + 'px';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${ranchGridConfig.cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${ranchGridConfig.rows}, 1fr)`;
    gridContainer.style.gap = '2px';
    gridContainer.style.background = '#3a2c1f';
    gridContainer.style.padding = '10px';
    gridContainer.style.borderRadius = '5px';
    gridContainer.style.boxShadow = '0 0 15px rgba(255, 68, 204, 0.4)';
    gridContainer.style.position = 'relative';
    gridContainer.style.zIndex = '10';
    gridContainer.style.margin = '0 auto';
    
    // Create grid cells
    for (let i = 0; i < ranchGridConfig.rows * ranchGridConfig.cols; i++) {
        const cell = document.createElement('div');
        cell.className = 'ranch-cell';
        cell.dataset.cellId = i;
        cell.style.background = '#5c4a36';
        cell.style.borderRadius = '3px';
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.justifyContent = 'center';
        cell.style.alignItems = 'center';
        cell.style.cursor = 'pointer';
        cell.style.transition = 'all 0.2s ease';
        cell.style.position = 'relative';
        cell.style.overflow = 'hidden';
        cell.style.border = '1px solid #7d6346';
        
        // Add hover effect
        cell.addEventListener('mouseenter', () => {
            cell.style.transform = 'scale(1.05)';
            cell.style.boxShadow = '0 0 10px rgba(255, 68, 204, 0.7)';
            
            // Play hover sound
            if (typeof window.playSoundEffect === 'function') {
                window.playSoundEffect('hover');
            }
        });
        
        cell.addEventListener('mouseleave', () => {
            cell.style.transform = 'scale(1)';
            cell.style.boxShadow = 'none';
        });
        
        // Add click event to open action menu
        cell.addEventListener('click', (e) => handleCellClick(e, i));
        
        gridContainer.appendChild(cell);
    }
    
    // Add grid to the ranch UI
    const ranchUI = document.getElementById('ranch-ui');
    const ranchContent = ranchUI.querySelector('.ranch-content') || ranchUI;
    ranchContent.appendChild(gridContainer);
}

/**
 * Create the action menu for grid interactions
 */
function createActionMenu() {
    // Check if menu already exists
    if (document.getElementById(ranchGridConfig.actionMenuId)) {
        return;
    }
    
    // Create menu container
    const actionMenu = document.createElement('div');
    actionMenu.id = ranchGridConfig.actionMenuId;
    actionMenu.className = 'ranch-action-menu';
    actionMenu.style.position = 'absolute';
    actionMenu.style.zIndex = '100';
    actionMenu.style.background = '#1e1a2e';
    actionMenu.style.border = '2px solid #ff44cc';
    actionMenu.style.borderRadius = '10px';
    actionMenu.style.padding = '15px';
    actionMenu.style.boxShadow = '0 0 20px rgba(255, 68, 204, 0.8)';
    actionMenu.style.display = 'none';
    actionMenu.style.flexDirection = 'column';
    actionMenu.style.gap = '10px';
    actionMenu.style.minWidth = '200px';
    actionMenu.style.color = '#ffffff';
    actionMenu.style.fontFamily = 'Anta, sans-serif';
    
    // Create menu title
    const menuTitle = document.createElement('div');
    menuTitle.className = 'menu-title';
    menuTitle.textContent = 'Cell Actions';
    menuTitle.style.fontSize = '18px';
    menuTitle.style.fontWeight = 'bold';
    menuTitle.style.borderBottom = '1px solid #ff44cc';
    menuTitle.style.paddingBottom = '8px';
    menuTitle.style.marginBottom = '8px';
    actionMenu.appendChild(menuTitle);
    
    // Create menu content container (will be filled dynamically)
    const menuContent = document.createElement('div');
    menuContent.className = 'menu-content';
    actionMenu.appendChild(menuContent);
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-menu-btn';
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '10px';
    closeBtn.style.backgroundColor = '#3a2c1f';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '8px 15px';
    closeBtn.style.borderRadius = '5px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.alignSelf = 'center';
    closeBtn.style.transition = 'all 0.2s ease';
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = '#5c4a36';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = '#3a2c1f';
    });
    
    closeBtn.addEventListener('click', () => {
        hideActionMenu();
        
        // Play click sound
        if (typeof window.playSoundEffect === 'function') {
            window.playSoundEffect('click');
        }
    });
    
    actionMenu.appendChild(closeBtn);
    
    // Add menu to the document body
    document.body.appendChild(actionMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!actionMenu.contains(e.target) && 
            !e.target.classList.contains('ranch-cell') && 
            actionMenu.style.display === 'flex') {
            hideActionMenu();
        }
    });
}

/**
 * Handle cell click event
 */
function handleCellClick(event, cellIndex) {
    // Play click sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('click');
    }
    
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Get cell position
    const cellElement = event.currentTarget;
    const rect = cellElement.getBoundingClientRect();
    
    // Show action menu at cell position
    showActionMenu(cellIndex, rect);
}

/**
 * Show action menu with appropriate options based on cell state
 */
function showActionMenu(cellIndex, position) {
    const actionMenu = document.getElementById(ranchGridConfig.actionMenuId);
    const menuContent = actionMenu.querySelector('.menu-content');
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Clear previous menu content
    menuContent.innerHTML = '';
    
    // Update menu title
    const menuTitle = actionMenu.querySelector('.menu-title');
    menuTitle.textContent = `Cell ${cellIndex + 1}`;
    
    // Create different options based on cell type and state
    if (cell.type === CELL_TYPES.EMPTY) {
        // Empty cell options
        createMenuOption(menuContent, 'Purchase Seeds', `Buy seeds ($${PRICES.SEEDS})`, () => {
            purchaseSeeds(cellIndex);
        });
        
        createMenuOption(menuContent, 'Purchase Cow', `Buy cow ($${PRICES.COW})`, () => {
            purchaseCattle(cellIndex, CATTLE_TYPES.COW);
        });
        
        createMenuOption(menuContent, 'Purchase Bull', `Buy bull ($${PRICES.BULL})`, () => {
            purchaseCattle(cellIndex, CATTLE_TYPES.BULL);
        });
    } 
    else if (cell.type === CELL_TYPES.CROP) {
        // Crop options based on state
        if (cell.state === CROP_STATES.SEED) {
            createMenuOption(menuContent, 'Plant Seeds', 'Plant your seeds', () => {
                plantSeeds(cellIndex);
            });
        } 
        else if (cell.state === CROP_STATES.GROWING) {
            const growthProgress = calculateGrowthProgress(cell);
            createMenuOption(menuContent, 'Growing', `Progress: ${growthProgress}%`, null, true);
        } 
        else if (cell.state === CROP_STATES.READY) {
            createMenuOption(menuContent, 'Harvest Crop', 'Collect your crops', () => {
                harvestCrop(cellIndex);
            });
        }
    } 
    else if (cell.type === CELL_TYPES.CATTLE) {
        // Cattle options based on type and state
        if (cell.data.cattleType === CATTLE_TYPES.COW) {
            if (cell.state === CATTLE_STATES.HUNGRY) {
                createMenuOption(menuContent, 'Feed Cow', `Feed your cow ($${PRICES.FEED})`, () => {
                    feedCattle(cellIndex);
                });
            } 
            else if (cell.state === CATTLE_STATES.PRODUCING) {
                createMenuOption(menuContent, 'Collect Milk', 'Milk your cow', () => {
                    collectMilk(cellIndex);
                });
            }
            else if (cell.state === CATTLE_STATES.FED) {
                const productionProgress = calculateMilkProductionProgress(cell);
                createMenuOption(menuContent, 'Producing Milk', `Progress: ${productionProgress}%`, null, true);
            }
            
            createMenuOption(menuContent, 'Sell Cow', 'Sell your cow', () => {
                sellCattle(cellIndex);
            });
        } 
        else if (cell.data.cattleType === CATTLE_TYPES.BULL) {
            if (cell.state === CATTLE_STATES.HUNGRY) {
                createMenuOption(menuContent, 'Feed Bull', `Feed your bull ($${PRICES.FEED})`, () => {
                    feedCattle(cellIndex);
                });
            }
            
            createMenuOption(menuContent, 'Enter Rodeo', `Enter bull in rodeo ($${PRICES.RODEO_ENTRY_FEE})`, () => {
                enterRodeo(cellIndex);
            });
            
            createMenuOption(menuContent, 'Sell Bull', 'Sell your bull', () => {
                sellCattle(cellIndex);
            });
        }
    }
    
    // Position and show menu
    actionMenu.style.top = `${position.top + window.scrollY}px`;
    actionMenu.style.left = `${position.right + 10 + window.scrollX}px`;
    actionMenu.style.display = 'flex';
}

/**
 * Hide the action menu
 */
function hideActionMenu() {
    const actionMenu = document.getElementById(ranchGridConfig.actionMenuId);
    actionMenu.style.display = 'none';
}

/**
 * Create a menu option button
 */
function createMenuOption(container, title, description, onClick, disabled = false) {
    const option = document.createElement('div');
    option.className = 'menu-option';
    option.style.padding = '10px';
    option.style.borderRadius = '5px';
    option.style.cursor = disabled ? 'default' : 'pointer';
    option.style.background = disabled ? '#333333' : '#3a2c1f';
    option.style.transition = 'all 0.2s ease';
    option.style.opacity = disabled ? '0.6' : '1';
    
    if (!disabled) {
        option.addEventListener('mouseenter', () => {
            option.style.background = '#5c4a36';
            
            // Play hover sound
            if (typeof window.playSoundEffect === 'function') {
                window.playSoundEffect('hover');
            }
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.background = '#3a2c1f';
        });
        
        if (onClick) {
            option.addEventListener('click', () => {
                onClick();
                hideActionMenu();
            });
        }
    }
    
    const titleEl = document.createElement('div');
    titleEl.className = 'option-title';
    titleEl.textContent = title;
    titleEl.style.fontWeight = 'bold';
    titleEl.style.fontSize = '16px';
    titleEl.style.color = '#00ffff';
    option.appendChild(titleEl);
    
    const descEl = document.createElement('div');
    descEl.className = 'option-description';
    descEl.textContent = description;
    descEl.style.fontSize = '14px';
    descEl.style.color = '#ffffff';
    descEl.style.opacity = '0.8';
    option.appendChild(descEl);
    
    container.appendChild(option);
    return option;
}

/**
 * Calculate growth progress percentage for crops
 */
function calculateGrowthProgress(cell) {
    const now = Date.now();
    const startTime = cell.data.plantedTime;
    const endTime = startTime + TIMERS.CROP_GROWING;
    
    if (now >= endTime) return 100;
    
    const elapsed = now - startTime;
    const progress = Math.floor((elapsed / TIMERS.CROP_GROWING) * 100);
    return Math.min(progress, 100);
}

/**
 * Calculate milk production progress
 */
function calculateMilkProductionProgress(cell) {
    const now = Date.now();
    const startTime = cell.data.fedTime;
    const endTime = startTime + TIMERS.COW_MILK_PRODUCTION;
    
    if (now >= endTime) return 100;
    
    const elapsed = now - startTime;
    const progress = Math.floor((elapsed / TIMERS.COW_MILK_PRODUCTION) * 100);
    return Math.min(progress, 100);
}

/**
 * Purchase seeds for a cell
 */
function purchaseSeeds(cellIndex) {
    // Check if player has enough money
    if (playerData.cattleBalance < PRICES.SEEDS) {
        showNotification(`Not enough $CATTLE. Need ${PRICES.SEEDS} $CATTLE to buy seeds.`, 'error');
        return;
    }
    
    // Deduct money
    playerData.cattleBalance -= PRICES.SEEDS;
    
    // Update cell
    window.ranchGrid.cells[cellIndex] = {
        id: cellIndex,
        type: CELL_TYPES.CROP,
        state: CROP_STATES.SEED,
        data: {
            purchasedTime: Date.now()
        }
    };
    
    // Update UI
    updateUI();
    renderRanchGrid();
    showNotification(`Seeds purchased for ${PRICES.SEEDS} $CATTLE!`, 'success');
    
    // Play purchase sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('click');
    }
}

/**
 * Plant seeds in a cell
 */
function plantSeeds(cellIndex) {
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Check if cell has seeds
    if (cell.type !== CELL_TYPES.CROP || cell.state !== CROP_STATES.SEED) {
        showNotification('No seeds to plant!', 'error');
        return;
    }
    
    // Update cell
    cell.state = CROP_STATES.GROWING;
    cell.data.plantedTime = Date.now();
    
    // Set timer for growth
    setTimeout(() => {
        if (window.ranchGrid.cells[cellIndex].type === CELL_TYPES.CROP && 
            window.ranchGrid.cells[cellIndex].state === CROP_STATES.GROWING) {
            window.ranchGrid.cells[cellIndex].state = CROP_STATES.READY;
            renderRanchGrid();
            showNotification('Crops ready for harvest!', 'success');
        }
    }, TIMERS.CROP_GROWING);
    
    // Update UI
    renderRanchGrid();
    showNotification('Seeds planted! Check back later for harvest.', 'success');
    
    // Play planting sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('hover');
    }
}

/**
 * Harvest crops from a cell
 */
function harvestCrop(cellIndex) {
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Check if crops are ready
    if (cell.type !== CELL_TYPES.CROP || cell.state !== CROP_STATES.READY) {
        showNotification('Crops not ready for harvest!', 'error');
        return;
    }
    
    // Calculate harvest reward (random between 15-30)
    const reward = Math.floor(Math.random() * 16) + 15;
    
    // Add reward to player balance
    playerData.cattleBalance += reward;
    
    // Reset cell
    window.ranchGrid.cells[cellIndex] = {
        id: cellIndex,
        type: CELL_TYPES.EMPTY,
        state: null,
        data: {}
    };
    
    // Update stats
    playerData.stats = playerData.stats || {};
    playerData.stats.cropsHarvested = (playerData.stats.cropsHarvested || 0) + 1;
    
    // Update UI
    updateUI();
    renderRanchGrid();
    showNotification(`Harvested crops for ${reward} $CATTLE!`, 'success');
    
    // Play harvest sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('harvest');
    }
}

/**
 * Purchase cattle (cow or bull) for a cell
 */
function purchaseCattle(cellIndex, cattleType) {
    // Check price based on type
    const price = cattleType === CATTLE_TYPES.COW ? PRICES.COW : PRICES.BULL;
    
    // Check if player has enough money
    if (playerData.cattleBalance < price) {
        showNotification(`Not enough $CATTLE. Need ${price} $CATTLE to buy ${cattleType}.`, 'error');
        return;
    }
    
    // Deduct money
    playerData.cattleBalance -= price;
    
    // Update cell
    window.ranchGrid.cells[cellIndex] = {
        id: cellIndex,
        type: CELL_TYPES.CATTLE,
        state: CATTLE_STATES.HUNGRY,
        data: {
            cattleType: cattleType,
            purchasedTime: Date.now(),
            quality: Math.floor(Math.random() * 10) + 1 // Quality rating 1-10
        }
    };
    
    // Update stats
    playerData.stats = playerData.stats || {};
    if (cattleType === CATTLE_TYPES.COW) {
        playerData.stats.cowsPurchased = (playerData.stats.cowsPurchased || 0) + 1;
    } else {
        playerData.stats.bullsPurchased = (playerData.stats.bullsPurchased || 0) + 1;
    }
    
    // Update UI
    updateUI();
    renderRanchGrid();
    showNotification(`Purchased ${cattleType} for ${price} $CATTLE!`, 'success');
    
    // Play purchase sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('click');
    }
}

/**
 * Feed cattle in a cell
 */
function feedCattle(cellIndex) {
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Check if cell has hungry cattle
    if (cell.type !== CELL_TYPES.CATTLE || cell.state !== CATTLE_STATES.HUNGRY) {
        showNotification('No hungry cattle to feed!', 'error');
        return;
    }
    
    // Check if player has enough money
    if (playerData.cattleBalance < PRICES.FEED) {
        showNotification(`Not enough $CATTLE. Need ${PRICES.FEED} $CATTLE for feed.`, 'error');
        return;
    }
    
    // Deduct money
    playerData.cattleBalance -= PRICES.FEED;
    
    // Update cell
    cell.state = cell.data.cattleType === CATTLE_TYPES.COW ? CATTLE_STATES.FED : CATTLE_STATES.FED;
    cell.data.fedTime = Date.now();
    
    // For cows, set timer for milk production
    if (cell.data.cattleType === CATTLE_TYPES.COW) {
        setTimeout(() => {
            if (window.ranchGrid.cells[cellIndex].type === CELL_TYPES.CATTLE && 
                window.ranchGrid.cells[cellIndex].state === CATTLE_STATES.FED &&
                window.ranchGrid.cells[cellIndex].data.cattleType === CATTLE_TYPES.COW) {
                window.ranchGrid.cells[cellIndex].state = CATTLE_STATES.PRODUCING;
                renderRanchGrid();
                showNotification('Cow is ready for milking!', 'success');
            }
        }, TIMERS.COW_MILK_PRODUCTION);
    }
    
    // Update UI
    renderRanchGrid();
    updateUI();
    
    if (cell.data.cattleType === CATTLE_TYPES.COW) {
        showNotification('Cow fed! Will produce milk soon.', 'success');
    } else {
        showNotification('Bull fed! Now in better condition.', 'success');
    }
    
    // Play feeding sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('hover');
    }
}

/**
 * Collect milk from a cow
 */
function collectMilk(cellIndex) {
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Check if cow is producing milk
    if (cell.type !== CELL_TYPES.CATTLE || 
        cell.state !== CATTLE_STATES.PRODUCING || 
        cell.data.cattleType !== CATTLE_TYPES.COW) {
        showNotification('No milk to collect!', 'error');
        return;
    }
    
    // Calculate milk value (based on cow quality)
    const cowQuality = cell.data.quality || 5;
    const milkValue = PRICES.MILK_SELL_PRICE + Math.floor(cowQuality * 0.5);
    
    // Add value to player balance
    playerData.cattleBalance += milkValue;
    
    // Reset cow state to hungry
    cell.state = CATTLE_STATES.HUNGRY;
    delete cell.data.fedTime;
    
    // Update stats
    playerData.stats = playerData.stats || {};
    playerData.stats.milkCollected = (playerData.stats.milkCollected || 0) + 1;
    
    // Update UI
    updateUI();
    renderRanchGrid();
    showNotification(`Collected milk for ${milkValue} $CATTLE!`, 'success');
    
    // Play milk collection sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('harvest');
    }
}

/**
 * Enter a bull in a rodeo competition
 */
function enterRodeo(cellIndex) {
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Check if cell has a bull
    if (cell.type !== CELL_TYPES.CATTLE || 
        cell.data.cattleType !== CATTLE_TYPES.BULL) {
        showNotification('No bull to enter in rodeo!', 'error');
        return;
    }
    
    // Check if player has enough money for entry fee
    if (playerData.cattleBalance < PRICES.RODEO_ENTRY_FEE) {
        showNotification(`Not enough $CATTLE. Need ${PRICES.RODEO_ENTRY_FEE} $CATTLE for rodeo entry.`, 'error');
        return;
    }
    
    // Deduct entry fee
    playerData.cattleBalance -= PRICES.RODEO_ENTRY_FEE;
    
    // Calculate success chance based on bull quality and fed state
    const bullQuality = cell.data.quality || 5;
    let successChance = bullQuality * 5; // 5-50% base chance
    
    // Bonus for fed bulls
    if (cell.state === CATTLE_STATES.FED) {
        successChance += 20; // +20% if fed
    }
    
    // Random outcome
    const isSuccess = Math.random() * 100 < successChance;
    
    // Calculate reward (or additional loss)
    let reward = 0;
    let message = '';
    
    if (isSuccess) {
        // Win - reward based on bull quality
        reward = PRICES.RODEO_ENTRY_FEE * 2 + (bullQuality * 5);
        message = `Your bull won the rodeo! Earned ${reward} $CATTLE!`;
        
        // Play win sound
        if (typeof window.playSoundEffect === 'function') {
            window.playSoundEffect('win');
        }
    } else {
        // Loss - just lose entry fee
        message = `Your bull lost at the rodeo. Better luck next time!`;
        
        // Play loss sound
        if (typeof window.playSoundEffect === 'function') {
            window.playSoundEffect('lose');
        }
    }
    
    // Set bull to hungry state after rodeo
    cell.state = CATTLE_STATES.HUNGRY;
    
    // Add reward if won
    if (reward > 0) {
        playerData.cattleBalance += reward;
    }
    
    // Update stats
    playerData.stats = playerData.stats || {};
    playerData.stats.rodeoEntered = (playerData.stats.rodeoEntered || 0) + 1;
    if (isSuccess) {
        playerData.stats.rodeoWins = (playerData.stats.rodeoWins || 0) + 1;
    }
    
    // Update UI
    updateUI();
    renderRanchGrid();
    showNotification(message, isSuccess ? 'success' : 'info');
}

/**
 * Sell cattle from a cell
 */
function sellCattle(cellIndex) {
    const cell = window.ranchGrid.cells[cellIndex];
    
    // Check if cell has cattle
    if (cell.type !== CELL_TYPES.CATTLE) {
        showNotification('No cattle to sell!', 'error');
        return;
    }
    
    // Calculate sell price based on type and quality
    const baseSellPrice = cell.data.cattleType === CATTLE_TYPES.COW ? PRICES.COW : PRICES.BULL;
    const cattleQuality = cell.data.quality || 5;
    
    // Cattle value decreases over time (from 100% to 60%)
    const ageInDays = (Date.now() - (cell.data.purchasedTime || Date.now())) / (1000 * 60 * 60 * 24);
    const ageFactor = Math.max(0.6, 1 - (ageInDays * 0.05)); // 5% decrease per day, minimum 60%
    
    let sellPrice = Math.floor(baseSellPrice * ageFactor * 0.8); // 80% of purchase price adjusted for age
    
    // Quality bonus
    sellPrice += Math.floor(cattleQuality * (cell.data.cattleType === CATTLE_TYPES.COW ? 1 : 2));
    
    // Add value to player balance
    playerData.cattleBalance += sellPrice;
    
    // Reset cell
    window.ranchGrid.cells[cellIndex] = {
        id: cellIndex,
        type: CELL_TYPES.EMPTY,
        state: null,
        data: {}
    };
    
    // Update stats
    playerData.stats = playerData.stats || {};
    playerData.stats.cattleSold = (playerData.stats.cattleSold || 0) + 1;
    
    // Update UI
    updateUI();
    renderRanchGrid();
    showNotification(`Sold ${cell.data.cattleType} for ${sellPrice} $CATTLE!`, 'success');
    
    // Play sell sound
    if (typeof window.playSoundEffect === 'function') {
        window.playSoundEffect('click');
    }
}

/**
 * Render the ranch grid cells
 */
function renderRanchGrid() {
    const gridContainer = document.getElementById(ranchGridConfig.gridId);
    if (!gridContainer) return;
    
    // Update each cell
    window.ranchGrid.cells.forEach((cell, index) => {
        const cellElement = gridContainer.querySelector(`[data-cell-id="${index}"]`);
        if (!cellElement) return;
        
        // Clear previous content
        cellElement.innerHTML = '';
        
        // Add cell content based on type and state
        if (cell.type === CELL_TYPES.EMPTY) {
            // Empty cell
            cellElement.style.background = '#5c4a36';
            
            // Add empty cell icon
            const emptyIcon = document.createElement('div');
            emptyIcon.textContent = '➕';
            emptyIcon.style.fontSize = '24px';
            emptyIcon.style.color = 'rgba(255, 255, 255, 0.3)';
            cellElement.appendChild(emptyIcon);
        } 
        else if (cell.type === CELL_TYPES.CROP) {
            // Set background based on crop state
            if (cell.state === CROP_STATES.SEED) {
                cellElement.style.background = '#483c28';
                
                // Add seed icon
                const seedIcon = document.createElement('div');
                seedIcon.textContent = '🌱';
                seedIcon.style.fontSize = '30px';
                cellElement.appendChild(seedIcon);
            } 
            else if (cell.state === CROP_STATES.GROWING) {
                cellElement.style.background = '#5e5030';
                
                // Add growing crop icon
                const growingIcon = document.createElement('div');
                growingIcon.textContent = '🌿';
                growingIcon.style.fontSize = '30px';
                cellElement.appendChild(growingIcon);
                
                // Add progress bar
                const progress = calculateGrowthProgress(cell);
                addProgressBar(cellElement, progress);
            } 
            else if (cell.state === CROP_STATES.READY) {
                cellElement.style.background = '#6a9932';
                
                // Add ready crop icon
                const readyIcon = document.createElement('div');
                readyIcon.textContent = '🌾';
                readyIcon.style.fontSize = '30px';
                cellElement.appendChild(readyIcon);
                
                // Add glow effect
                cellElement.style.boxShadow = '0 0 15px rgba(106, 153, 50, 0.6)';
            }
        } 
        else if (cell.type === CELL_TYPES.CATTLE) {
            // Set background based on cattle type and state
            if (cell.data.cattleType === CATTLE_TYPES.COW) {
                // Cow
                if (cell.state === CATTLE_STATES.HUNGRY) {
                    cellElement.style.background = '#7d5a44';
                    
                    // Add hungry cow icon
                    const cowIcon = document.createElement('div');
                    cowIcon.textContent = '🐄';
                    cowIcon.style.fontSize = '30px';
                    cellElement.appendChild(cowIcon);
                    
                    // Add hungry indicator
                    const hungryText = document.createElement('div');
                    hungryText.textContent = 'Hungry';
                    hungryText.style.fontSize = '12px';
                    hungryText.style.marginTop = '5px';
                    hungryText.style.color = '#ff9900';
                    cellElement.appendChild(hungryText);
                } 
                else if (cell.state === CATTLE_STATES.FED) {
                    cellElement.style.background = '#8d7a64';
                    
                    // Add fed cow icon
                    const cowIcon = document.createElement('div');
                    cowIcon.textContent = '🐄';
                    cowIcon.style.fontSize = '30px';
                    cellElement.appendChild(cowIcon);
                    
                    // Add progress bar for milk production
                    const progress = calculateMilkProductionProgress(cell);
                    addProgressBar(cellElement, progress, '#66ccff');
                } 
                else if (cell.state === CATTLE_STATES.PRODUCING) {
                    cellElement.style.background = '#9d8a74';
                    
                    // Add milk cow icon
                    const cowIcon = document.createElement('div');
                    cowIcon.textContent = '🐄';
                    cowIcon.style.fontSize = '30px';
                    cellElement.appendChild(cowIcon);
                    
                    // Add milk indicator
                    const milkIcon = document.createElement('div');
                    milkIcon.textContent = '🥛';
                    milkIcon.style.fontSize = '16px';
                    milkIcon.style.marginTop = '5px';
                    cellElement.appendChild(milkIcon);
                    
                    // Add glow effect
                    cellElement.style.boxShadow = '0 0 15px rgba(102, 204, 255, 0.6)';
                }
            } 
            else {
                // Bull
                if (cell.state === CATTLE_STATES.HUNGRY) {
                    cellElement.style.background = '#7d5a44';
                    
                    // Add hungry bull icon
                    const bullIcon = document.createElement('div');
                    bullIcon.textContent = '🐂';
                    bullIcon.style.fontSize = '30px';
                    cellElement.appendChild(bullIcon);
                    
                    // Add hungry indicator
                    const hungryText = document.createElement('div');
                    hungryText.textContent = 'Hungry';
                    hungryText.style.fontSize = '12px';
                    hungryText.style.marginTop = '5px';
                    hungryText.style.color = '#ff9900';
                    cellElement.appendChild(hungryText);
                } 
                else if (cell.state === CATTLE_STATES.FED) {
                    cellElement.style.background = '#8d7a64';
                    
                    // Add fed bull icon
                    const bullIcon = document.createElement('div');
                    bullIcon.textContent = '🐂';
                    bullIcon.style.fontSize = '30px';
                    cellElement.appendChild(bullIcon);
                    
                    // Add fed indicator
                    const fedText = document.createElement('div');
                    fedText.textContent = 'Fed';
                    fedText.style.fontSize = '12px';
                    fedText.style.marginTop = '5px';
                    fedText.style.color = '#66ff66';
                    cellElement.appendChild(fedText);
                }
            }
            
            // Add quality stars
            const quality = cell.data.quality || 5;
            const qualityText = document.createElement('div');
            qualityText.style.position = 'absolute';
            qualityText.style.top = '5px';
            qualityText.style.right = '5px';
            qualityText.style.fontSize = '10px';
            qualityText.style.color = '#ffcc00';
            qualityText.textContent = '★'.repeat(Math.min(5, Math.ceil(quality/2)));
            cellElement.appendChild(qualityText);
        }
    });
}

/**
 * Add a progress bar to a cell element
 */
function addProgressBar(cellElement, progress, color = '#66ff66') {
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '80%';
    progressContainer.style.height = '10px';
    progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    progressContainer.style.borderRadius = '5px';
    progressContainer.style.marginTop = '5px';
    progressContainer.style.overflow = 'hidden';
    
    const progressBar = document.createElement('div');
    progressBar.style.width = `${progress}%`;
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = color;
    progressBar.style.transition = 'width 0.5s ease';
    
    progressContainer.appendChild(progressBar);
    cellElement.appendChild(progressContainer);
}

/**
 * Show a notification
 */
function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}

/**
 * Update UI elements like player balance
 */
function updateUI() {
    // Update cattle balance display
    const balanceDisplay = document.getElementById('cattle-balance');
    if (balanceDisplay) {
        balanceDisplay.textContent = playerData.cattleBalance;
    }
    
    // Update hay display
    const hayDisplay = document.getElementById('hay-amount');
    if (hayDisplay) {
        hayDisplay.textContent = playerData.hay;
    }
    
    // Update water display
    const waterDisplay = document.getElementById('water-amount');
    if (waterDisplay) {
        waterDisplay.textContent = playerData.water;
    }
}

/**
 * Create initial required assets if needed
 */
function createRanchAssets() {
    // Create cell textures (empty, planted, etc.)
    // This would create dynamic SVG or canvas textures if needed
}

// Export functions for external use
window.initRanchGrid = initRanchGrid;
window.renderRanchGrid = renderRanchGrid;
window.showNotification = showNotification;

// Add ranch grid to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Ranch grid module loaded');
});