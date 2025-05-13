/**
 * Bull Run Boost - Potion Crafting System
 * 
 * This file contains functions for the potion crafting gameplay in the Night scene.
 * Players can create different potions with various effects and risk/reward mechanics.
 */

// Potion types with different properties and requirements
const potionTypes = {
    speed: {
        name: "Speed Potion",
        description: "Speeds up crop growth and cattle production",
        color: 0x00ffff, // Cyan
        ingredients: {
            hay: 15,
            water: 10
        },
        brewTime: 60000, // 1 minute
        effects: {
            cropGrowthBoost: 1.5, // 50% faster growth
            cattleProductionBoost: 1.2 // 20% more production
        },
        overbrewRisk: 0.3, // 30% chance of overbrewing
        overbrewFactor: 2.5, // 2.5x better when overbrewed, but...
        overbrewFailChance: 0.4, // 40% chance to fail if overbrewed
        icon: '⚡'
    },
    power: {
        name: "Power Potion",
        description: "Increases rewards from harvesting and betting",
        color: 0xff3366, // Red-Pink
        ingredients: {
            hay: 20,
            water: 15,
            cattleBalance: 2
        },
        brewTime: 120000, // 2 minutes
        effects: {
            harvestRewardBoost: 2.0, // Double harvest rewards
            bettingMultiplier: 1.5 // 50% higher betting rewards
        },
        overbrewRisk: 0.25, // 25% chance of overbrewing
        overbrewFactor: 3.0, // 3x better when overbrewed, but...
        overbrewFailChance: 0.6, // 60% chance to fail if overbrewed
        icon: '💪'
    },
    mystic: {
        name: "Mystic Potion",
        description: "Gives a chance for rare rewards during gameplay",
        color: 0x9933ff, // Purple
        ingredients: {
            hay: 25,
            water: 20,
            cattleBalance: 5
        },
        brewTime: 180000, // 3 minutes
        effects: {
            rareRewardChance: 0.15, // 15% chance for rare rewards
            weatherControl: true // Can control weather (future feature)
        },
        overbrewRisk: 0.2, // 20% chance of overbrewing
        overbrewFactor: 4.0, // 4x better when overbrewed, but...
        overbrewFailChance: 0.8, // 80% chance to fail if overbrewed
        icon: '✨'
    }
};

// Shadow grid for potion crafting
let shadowGrid = {
    size: 4, // 4x4 grid
    cells: [], // Will be filled with potion brewing cells
    initialized: false
};

// Active brewing processes
let activeBrewingProcesses = {};

// Initialize the shadow grid
function initShadowGrid() {
    try {
        console.log('Initializing shadow grid...');
        
        // Clear existing grid if any
        shadowGrid.cells = [];
        
        // Create empty cells
        for (let i = 0; i < shadowGrid.size * shadowGrid.size; i++) {
            shadowGrid.cells.push({
                id: i,
                state: 'empty-night',
                potion: null,
                brewStarted: null,
                stage: 0,
                overbrewed: false,
                quality: 1.0,
                result: null
            });
        }
        
        // Set initialization flag
        shadowGrid.initialized = true;
        
        // Setup UI elements
        setupShadowUI();
        
        console.log('Shadow grid initialized with', shadowGrid.cells.length, 'cells');
    } catch (err) {
        console.error('Error in initShadowGrid:', err);
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification('Error initializing shadow grid', 'error');
        }
    }
}

// Set up UI for shadow market
function setupShadowUI() {
    try {
        console.log('Setting up Shadow Market UI...');
        
        // Add potion recipes information panel
        const infoPanel = document.createElement('div');
        infoPanel.id = 'potion-recipes-panel';
        infoPanel.className = 'potion-recipes-panel';
        
        // Style the panel
        Object.assign(infoPanel.style, {
            position: 'fixed',
            right: '20px',
            top: '100px',
            width: '300px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '15px',
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(153, 51, 255, 0.7)',
            fontFamily: "'Share Tech Mono', monospace",
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: '100'
        });
        
        // Add title
        infoPanel.innerHTML = `
            <h3 style="
                color: #cc33ff;
                text-align: center;
                margin-top: 0;
                text-shadow: 0 0 5px rgba(204, 51, 255, 0.7);
                border-bottom: 1px solid rgba(204, 51, 255, 0.5);
                padding-bottom: 10px;
            ">POTION RECIPES</h3>
        `;
        
        // Add recipe details for each potion
        Object.keys(potionTypes).forEach(potionKey => {
            const potion = potionTypes[potionKey];
            
            // Create recipe section
            const recipeSection = document.createElement('div');
            recipeSection.className = 'potion-recipe';
            
            // Style the recipe section
            Object.assign(recipeSection.style, {
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: `rgba(${hexToRgb(potion.color)}, 0.2)`,
                borderRadius: '5px',
                borderLeft: `3px solid rgba(${hexToRgb(potion.color)}, 0.7)`
            });
            
            // Format ingredients list
            let ingredientsList = '';
            Object.entries(potion.ingredients).forEach(([resource, amount]) => {
                ingredientsList += `<li>${resource}: ${amount}</li>`;
            });
            
            // Format effects list
            let effectsList = '';
            Object.entries(potion.effects).forEach(([effect, value]) => {
                // Format effect name nicely
                const effectName = effect
                    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                    .replace('Boost', '')
                    .replace('Chance', ' Chance')
                    .replace('Control', ' Control');
                
                // Format value
                let valueFormatted = value;
                if (typeof value === 'number' && value > 1) {
                    valueFormatted = `${Math.round((value - 1) * 100)}%`;
                } else if (typeof value === 'number' && value < 1) {
                    valueFormatted = `${Math.round(value * 100)}%`;
                } else if (value === true) {
                    valueFormatted = 'Yes';
                }
                
                effectsList += `<li>${effectName}: ${valueFormatted}</li>`;
            });
            
            // Add content
            recipeSection.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 18px; color: rgba(${hexToRgb(potion.color)}, 1);">
                        ${potion.icon} ${potion.name}
                    </span>
                    <span style="font-size: 12px; color: #999;">
                        ${Math.round(potion.brewTime/60000)} min
                    </span>
                </div>
                <div style="font-size: 12px; margin: 5px 0 10px;">
                    ${potion.description}
                </div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    margin-top: 8px;
                ">
                    <div>
                        <div style="color: #aaa;">Ingredients:</div>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            ${ingredientsList}
                        </ul>
                    </div>
                    <div>
                        <div style="color: #aaa;">Effects:</div>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            ${effectsList}
                        </ul>
                    </div>
                </div>
                <div style="
                    font-size: 11px;
                    margin-top: 8px;
                    color: ${potion.overbrewRisk > 0.25 ? '#ff5555' : '#aaaaaa'};
                    font-style: italic;
                ">
                    Overbrew Risk: ${Math.round(potion.overbrewRisk * 100)}% 
                    (${Math.round(potion.overbrewFactor * 100 - 100)}% better, 
                    ${Math.round(potion.overbrewFailChance * 100)}% fail chance)
                </div>
            `;
            
            infoPanel.appendChild(recipeSection);
        });
        
        // Add to the night UI
        const nightUI = document.getElementById('night-ui');
        if (nightUI) {
            nightUI.appendChild(infoPanel);
        } else {
            console.error('Night UI element not found');
            document.body.appendChild(infoPanel);
        }
        
    } catch (err) {
        console.error('Error in setupShadowUI:', err);
    }
}

// Show potion selection menu for brewing
function showPotionSelectionMenu(cellIndex, x, y) {
    try {
        // Remove any existing potion selection menu
        const existingMenu = document.getElementById('potion-selection-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create menu container
        const menu = document.createElement('div');
        menu.id = 'potion-selection-menu';
        menu.className = 'potion-selection-menu';
        
        // Style the menu
        Object.assign(menu.style, {
            position: 'fixed',
            left: (x - 100) + 'px',
            top: (y - 50) + 'px',
            width: '200px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid rgba(153, 51, 255, 0.7)',
            borderRadius: '10px',
            padding: '10px',
            boxShadow: '0 0 20px rgba(153, 51, 255, 0.5)',
            zIndex: '1000',
            color: 'white',
            fontFamily: "'Share Tech Mono', monospace"
        });
        
        // Add title
        const title = document.createElement('div');
        title.textContent = 'Select Potion';
        title.style.textAlign = 'center';
        title.style.marginBottom = '10px';
        title.style.fontSize = '16px';
        title.style.borderBottom = '1px solid rgba(153, 51, 255, 0.5)';
        title.style.paddingBottom = '5px';
        title.style.textShadow = '0 0 5px rgba(153, 51, 255, 0.7)';
        menu.appendChild(title);
        
        // Get player state
        const player = window.gameState?.player || {};
        
        // Create potion options
        Object.keys(potionTypes).forEach(potionType => {
            const option = document.createElement('div');
            option.className = 'potion-option';
            
            const potion = potionTypes[potionType];
            
            // Check if player has enough resources
            let canBrew = true;
            let missingResources = [];
            
            Object.entries(potion.ingredients).forEach(([resource, amount]) => {
                const playerResource = player[resource] || 0;
                if (playerResource < amount) {
                    canBrew = false;
                    missingResources.push(`${resource}: ${playerResource}/${amount}`);
                }
            });
            
            // Style the option
            Object.assign(option.style, {
                padding: '8px',
                margin: '5px 0',
                cursor: canBrew ? 'pointer' : 'not-allowed',
                borderRadius: '5px',
                backgroundColor: canBrew ? 'rgba(0, 0, 0, 0.5)' : 'rgba(50, 50, 50, 0.5)',
                opacity: canBrew ? '1' : '0.6',
                transition: 'all 0.3s ease'
            });
            
            // Add hover effect if brewable
            if (canBrew) {
                option.addEventListener('mouseover', () => {
                    option.style.backgroundColor = `rgba(${hexToRgb(potion.color)}, 0.3)`;
                    option.style.transform = 'translateX(5px)';
                });
                
                option.addEventListener('mouseout', () => {
                    option.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    option.style.transform = 'translateX(0)';
                });
            }
            
            // Set content
            option.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 20px; margin-right: 10px;">${potion.icon}</span>
                    <span style="color: rgba(${hexToRgb(potion.color)}, 1);">${potion.name}</span>
                </div>
                <div style="font-size: 11px; color: #aaa; margin-top: 3px;">
                    Time: ${(potion.brewTime/60000).toFixed(1)}m
                </div>
                ${!canBrew ? `<div style="font-size: 10px; color: #ff5555; margin-top: 3px;">
                    Missing: ${missingResources.join(', ')}
                </div>` : ''}
            `;
            
            // Add click handler if brewable
            if (canBrew) {
                option.addEventListener('click', () => {
                    startPotionBrewing(cellIndex, potionType);
                    menu.remove(); // Close menu after selection
                });
            }
            
            menu.appendChild(option);
        });
        
        // Add close button
        const closeButton = document.createElement('div');
        closeButton.textContent = '✖ Cancel';
        closeButton.style.textAlign = 'center';
        closeButton.style.marginTop = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '14px';
        closeButton.style.opacity = '0.7';
        
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.opacity = '1';
        });
        
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.opacity = '0.7';
        });
        
        closeButton.addEventListener('click', () => {
            menu.remove();
        });
        
        menu.appendChild(closeButton);
        
        // Add menu to body
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        const closeMenuOnOutsideClick = (event) => {
            if (!menu.contains(event.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenuOnOutsideClick);
            }
        };
        
        // Delay adding the event listener to prevent immediate closure
        setTimeout(() => {
            document.addEventListener('click', closeMenuOnOutsideClick);
        }, 100);
        
    } catch (err) {
        console.error('Error in showPotionSelectionMenu:', err);
    }
}

// Start brewing a potion
function startPotionBrewing(cellIndex, potionType) {
    try {
        if (!shadowGrid.initialized) return;
        
        const cell = shadowGrid.cells[cellIndex];
        if (cell.state !== 'empty-night') return;
        
        // Validate potion type
        if (!potionTypes[potionType]) {
            console.error('Invalid potion type:', potionType);
            return;
        }
        
        // Get player resources
        if (!window.gameState || !window.gameState.player) return;
        const player = window.gameState.player;
        
        // Check if player has enough resources
        const potion = potionTypes[potionType];
        let canBrew = true;
        
        Object.entries(potion.ingredients).forEach(([resource, amount]) => {
            const playerResource = player[resource] || 0;
            if (playerResource < amount) {
                canBrew = false;
                
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification(
                        `Not enough ${resource} to brew ${potion.name}!`, 
                        'error'
                    );
                }
            }
        });
        
        if (!canBrew) return;
        
        // Deduct resources
        Object.entries(potion.ingredients).forEach(([resource, amount]) => {
            player[resource] -= amount;
        });
        
        // Update cell state
        cell.state = 'brewing';
        cell.potion = potionType;
        cell.brewStarted = Date.now();
        cell.stage = 0;
        cell.overbrewed = false;
        cell.quality = 1.0;
        
        // Start brewing process
        processPotion(cellIndex);
        
        // Update UI
        updateShadowUI();
        
        // Notify player
        if (window.gameManager && window.gameManager.showNotification) {
            window.gameManager.showNotification(
                `Started brewing ${potion.name}! ${potion.icon}`, 
                'success'
            );
        }
        
        console.log(`Started brewing ${potionType} in cell ${cellIndex}`);
        
        // Track statistics
        if (!player.stats) player.stats = {};
        if (!player.stats.potionsBrewed) player.stats = {...player.stats, potionsBrewed: {}};
        if (!player.stats.potionsBrewed[potionType]) player.stats.potionsBrewed[potionType] = 0;
        player.stats.potionsBrewed[potionType]++;
        
        // Save game after starting brewing
        if (window.saveGame) {
            window.saveGame();
        }
        
    } catch (err) {
        console.error('Error in startPotionBrewing:', err);
    }
}

// Process the potion brewing
function processPotion(cellIndex) {
    try {
        const cell = shadowGrid.cells[cellIndex];
        if (!cell || cell.state !== 'brewing' || !cell.potion) return;
        
        // Get potion data
        const potionData = potionTypes[cell.potion];
        if (!potionData) {
            console.error('Unknown potion type:', cell.potion);
            return;
        }
        
        // For demo purposes, speed up brewing time by a factor of 4
        const speedUpFactor = 4;
        const actualBrewTime = potionData.brewTime / speedUpFactor;
        
        // Calculate transition points
        const stage1Time = actualBrewTime * 0.33; // First third
        const stage2Time = actualBrewTime * 0.66; // Second third
        const finishTime = actualBrewTime;
        const overbrewTime = actualBrewTime * 1.2; // 20% extra time for potential overbrew
        
        // Stage 1: Brewing started
        setTimeout(() => {
            if (shadowGrid.cells[cellIndex].state === 'brewing') {
                shadowGrid.cells[cellIndex].stage = 1;
                updateShadowUI();
                
                console.log(`Cell ${cellIndex} (${cell.potion}) reached brewing stage 1`);
            }
        }, stage1Time);
        
        // Stage 2: Intermediate brewing
        setTimeout(() => {
            if (shadowGrid.cells[cellIndex].state === 'brewing') {
                shadowGrid.cells[cellIndex].stage = 2;
                updateShadowUI();
                
                console.log(`Cell ${cellIndex} (${cell.potion}) reached brewing stage 2`);
                
                // Notify player
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification(
                        `${potionData.name} is brewing nicely! ${potionData.icon}`, 
                        'info'
                    );
                }
            }
        }, stage2Time);
        
        // Stage 3: Ready to collect
        setTimeout(() => {
            if (shadowGrid.cells[cellIndex].state === 'brewing') {
                shadowGrid.cells[cellIndex].state = 'ready';
                shadowGrid.cells[cellIndex].stage = 3;
                updateShadowUI();
                
                console.log(`Cell ${cellIndex} (${cell.potion}) is now ready to collect`);
                
                // Notify player
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification(
                        `${potionData.name} is ready to collect! ${potionData.icon}`, 
                        'success'
                    );
                }
                
                // Save game state
                if (window.saveGame) {
                    window.saveGame();
                }
            }
        }, finishTime);
        
        // Track this timer for the overbrew mechanic
        activeBrewingProcesses[cellIndex] = {
            overbrewTimer: setTimeout(() => {
                // Check if the potion is still ready and not collected
                if (shadowGrid.cells[cellIndex].state === 'ready') {
                    // Random chance to trigger overbrew based on potion type
                    if (Math.random() < potionData.overbrewRisk) {
                        console.log(`Cell ${cellIndex} (${cell.potion}) triggered overbrew event`);
                        
                        shadowGrid.cells[cellIndex].overbrewed = true;
                        updateShadowUI();
                        
                        // Notify player
                        if (window.gameManager && window.gameManager.showNotification) {
                            window.gameManager.showNotification(
                                `${potionData.name} is overbrewing! Collect quickly for a chance at greater power! ${potionData.icon}`, 
                                'warning'
                            );
                        }
                    }
                }
            }, overbrewTime)
        };
        
    } catch (err) {
        console.error('Error in processPotion:', err);
    }
}

// Collect a finished potion
function collectPotion(cellIndex) {
    try {
        if (!shadowGrid.initialized) return;
        
        const cell = shadowGrid.cells[cellIndex];
        if (cell.state !== 'ready' || !cell.potion) return;
        
        // Get player data
        if (!window.gameState || !window.gameState.player) return;
        const player = window.gameState.player;
        
        // Get potion data
        const potionData = potionTypes[cell.potion];
        if (!potionData) {
            console.error('Unknown potion type:', cell.potion);
            return;
        }
        
        // Handle overbrew mechanic
        let potionQuality = 1.0;
        let failedBrew = false;
        let potionResult = 'standard';
        
        if (cell.overbrewed) {
            // Overbrewed potions have a chance to be more powerful or fail
            if (Math.random() < potionData.overbrewFailChance) {
                // Failed overbrew
                failedBrew = true;
                potionResult = 'failed';
                
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification(
                        `The ${potionData.name} bubbled over and was ruined! ☠️`, 
                        'error'
                    );
                }
            } else {
                // Successful overbrew - higher quality
                potionQuality = potionData.overbrewFactor;
                potionResult = 'enhanced';
                
                if (window.gameManager && window.gameManager.showNotification) {
                    window.gameManager.showNotification(
                        `Enhanced ${potionData.name} collected! Power: ${Math.round(potionQuality * 100)}% ${potionData.icon}✨`, 
                        'success'
                    );
                }
            }
        } else {
            // Standard potion collection
            if (window.gameManager && window.gameManager.showNotification) {
                window.gameManager.showNotification(
                    `${potionData.name} collected! ${potionData.icon}`, 
                    'success'
                );
            }
        }
        
        // If potion brewing didn't fail, add it to inventory
        if (!failedBrew) {
            // Initialize or update player potions inventory
            if (!player.potions) player.potions = {};
            if (!player.potions[cell.potion]) player.potions[cell.potion] = 0;
            
            player.potions[cell.potion]++;
            
            // Store the most recent potion's quality (for effect calculations)
            player.potionQualities = player.potionQualities || {};
            player.potionQualities[cell.potion] = potionQuality;
            
            // Store active effects
            player.activeEffects = player.activeEffects || {};
            
            // Calculate effect duration based on quality
            const baseDuration = 600000; // 10 minutes
            const effectDuration = baseDuration * potionQuality;
            
            // Apply potion effects
            Object.entries(potionData.effects).forEach(([effect, value]) => {
                player.activeEffects[effect] = {
                    value: value * potionQuality,
                    expiresAt: Date.now() + effectDuration
                };
            });
            
            console.log(`Player collected ${cell.potion} potion with quality ${potionQuality}`);
            
            // Track statistics
            if (!player.stats) player.stats = {};
            if (!player.stats.potionsCollected) player.stats = {...player.stats, potionsCollected: {}};
            if (!player.stats.potionsCollected[cell.potion]) player.stats.potionsCollected[cell.potion] = 0;
            player.stats.potionsCollected[cell.potion]++;
            
            // Track enhanced potions separately
            if (potionResult === 'enhanced') {
                if (!player.stats.enhancedPotions) player.stats.enhancedPotions = 0;
                player.stats.enhancedPotions++;
            }
        } else {
            // Track failed brews
            if (!player.stats) player.stats = {};
            if (!player.stats.failedBrews) player.stats.failedBrews = 0;
            player.stats.failedBrews++;
        }
        
        // Reset cell
        cell.state = 'empty-night';
        cell.potion = null;
        cell.brewStarted = null;
        cell.stage = 0;
        cell.overbrewed = false;
        cell.quality = 1.0;
        cell.result = null;
        
        // Clear any active timers for this cell
        if (activeBrewingProcesses[cellIndex]) {
            if (activeBrewingProcesses[cellIndex].overbrewTimer) {
                clearTimeout(activeBrewingProcesses[cellIndex].overbrewTimer);
            }
            delete activeBrewingProcesses[cellIndex];
        }
        
        // Update UI
        updateShadowUI();
        
        // Update main game UI if available
        if (window.gameManager && window.gameManager.updateUI) {
            window.gameManager.updateUI();
        }
        
        // Save game state
        if (window.saveGame) {
            window.saveGame();
        }
        
    } catch (err) {
        console.error('Error in collectPotion:', err);
    }
}

// Update shadow grid UI
function updateShadowUI() {
    try {
        // This function will be called to update visuals
        // Most of the real-time visual updates will be handled by Phaser
        console.log('Shadow UI updated');
        
        // If there's a Phaser scene running, update its visuals
        if (window.game && window.game.scene.isActive('NightScene')) {
            const nightScene = window.game.scene.getScene('NightScene');
            if (nightScene && nightScene.updatePotionGrid) {
                nightScene.updatePotionGrid();
            }
        }
    } catch (err) {
        console.error('Error in updateShadowUI:', err);
    }
}

// Interact with a shadow grid cell
function interactWithShadowCell(cellIndex) {
    try {
        if (!shadowGrid.initialized) return;
        
        const cell = shadowGrid.cells[cellIndex];
        
        // Different interaction based on cell state
        if (cell.state === 'empty-night') {
            // Show potion selection menu
            showPotionSelectionMenu(cellIndex, window.innerWidth/2, window.innerHeight/2);
        } else if (cell.state === 'brewing') {
            // Show brewing progress
            if (window.gameManager && window.gameManager.showNotification) {
                const potion = potionTypes[cell.potion];
                const elapsedTime = Date.now() - cell.brewStarted;
                const totalTime = potion.brewTime / 4; // Apply speed up factor
                const progressPercent = Math.min(Math.round((elapsedTime / totalTime) * 100), 99);
                
                window.gameManager.showNotification(
                    `${potion.name} brewing: ${progressPercent}% complete ${potion.icon}`, 
                    'info'
                );
            }
        } else if (cell.state === 'ready') {
            // Collect finished potion
            collectPotion(cellIndex);
        }
        
    } catch (err) {
        console.error('Error in interactWithShadowCell:', err);
    }
}

// Utility - Convert hex color to RGB string
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.toString().replace(/^#/, '');
    
    // Parse r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
}

// Clean up any running processes when leaving the scene
function cleanupPotionProcesses() {
    try {
        // Clear all active brewing timers
        Object.values(activeBrewingProcesses).forEach(process => {
            if (process.overbrewTimer) {
                clearTimeout(process.overbrewTimer);
            }
        });
        
        // Reset the processes object
        activeBrewingProcesses = {};
        
        console.log('Potion brewing processes cleaned up');
    } catch (err) {
        console.error('Error in cleanupPotionProcesses:', err);
    }
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
    window.initShadowGrid = initShadowGrid;
    window.interactWithShadowCell = interactWithShadowCell;
    window.cleanupPotionProcesses = cleanupPotionProcesses;
    window.collectPotion = collectPotion;
    window.shadowGrid = shadowGrid;
    window.potionTypes = potionTypes;
}