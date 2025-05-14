/**
 * Grid Cell Handlers Module
 * This module handles the interactions with ranch and shadow grid cells
 */

(function() {
    'use strict';
    
    /**
     * Handle a click on a ranch grid cell
     * @param {number} cellIndex - The index of the cell that was clicked
     */
    window.handleRanchCellClick = function(cellIndex) {
        console.log(`Ranch cell ${cellIndex} clicked (global handler)`);
        
        // Make sure the ranch grid is initialized
        if (typeof window.ensureRanchGridInitialized === 'function') {
            window.ensureRanchGridInitialized();
        }
        
        // Make sure we have a valid cell
        if (!window.ranchGrid || !window.ranchGrid.cells || !window.ranchGrid.cells[cellIndex]) {
            console.error(`Ranch cell ${cellIndex} not found or invalid`);
            return;
        }
        
        const cell = window.ranchGrid.cells[cellIndex];
        
        // Handle the cell click based on its current state
        if (cell.state === 'empty') {
            // Plant a new crop (requires hay and water)
            if (playerData.hay >= 5 && playerData.water >= 5) {
                console.log(`Planting crop in cell ${cellIndex}`);
                
                // Update cell state
                cell.state = 'planted';
                cell.growthStage = 1;
                
                // Deduct resources
                playerData.hay -= 5;
                playerData.water -= 5;
                
                // Play sound effect if available
                if (typeof playSoundEffect === 'function') {
                    playSoundEffect('click');
                }
                
                // Update UI
                updateResourceDisplay();
                updateRanchCellAppearance(cellIndex);
            } else {
                console.log('Not enough resources to plant a crop');
                showNotification('Not enough resources. Need 5 hay and 5 water.');
            }
        } else if (cell.state === 'harvestable') {
            // Harvest the crop
            console.log(`Harvesting crop from cell ${cellIndex}`);
            
            // Award resources
            const hayEarned = Math.floor(10 * window.ranchGrid.multiplier);
            const waterEarned = Math.floor(10 * window.ranchGrid.multiplier);
            
            playerData.hay += hayEarned;
            playerData.water += waterEarned;
            playerData.stats.plantsHarvested++;
            
            // Update harvest counter
            const hayEarnedElement = document.getElementById('hay-earned');
            const waterEarnedElement = document.getElementById('water-earned');
            
            if (hayEarnedElement) {
                const currentHayEarned = parseInt(hayEarnedElement.textContent) || 0;
                hayEarnedElement.textContent = currentHayEarned + hayEarned;
            }
            
            if (waterEarnedElement) {
                const currentWaterEarned = parseInt(waterEarnedElement.textContent) || 0;
                waterEarnedElement.textContent = currentWaterEarned + waterEarned;
            }
            
            // Reset cell state
            cell.state = 'empty';
            cell.growthStage = 0;
            
            // Play sound effect if available
            if (typeof playSoundEffect === 'function') {
                playSoundEffect('harvest');
            }
            
            // Show visual feedback
            showFloatingText(`+${hayEarned} hay, +${waterEarned} water`, cellIndex);
            
            // Check for achievement
            checkForAchievement('farmer');
            
            // Update UI
            updateResourceDisplay();
            updateRanchCellAppearance(cellIndex);
        } else {
            // Cell is in a growing state, show growth status
            console.log(`Cell ${cellIndex} is ${cell.state} (${cell.growthStage}/${cell.growthMax})`);
            showNotification(`Growth stage: ${cell.growthStage}/${cell.growthMax}`);
        }
    };
    
    /**
     * Handle a click on a shadow grid cell
     * @param {number} cellIndex - The index of the cell that was clicked
     */
    window.handleShadowCellClick = function(cellIndex) {
        console.log(`Shadow cell ${cellIndex} clicked (global handler)`);
        
        // Make sure the shadow grid is initialized
        if (typeof window.ensureShadowGridInitialized === 'function') {
            window.ensureShadowGridInitialized();
        }
        
        // Make sure we have a valid cell
        if (!window.shadowGrid || !window.shadowGrid.cells || !window.shadowGrid.cells[cellIndex]) {
            console.error(`Shadow cell ${cellIndex} not found or invalid`);
            return;
        }
        
        const cell = window.shadowGrid.cells[cellIndex];
        
        // Handle the cell click based on its current state
        if (cell.state === 'empty') {
            // Start brewing a potion (requires specific resources)
            if (playerData.hay >= 10 && playerData.water >= 10) {
                console.log(`Starting brewing in cell ${cellIndex}`);
                
                // Update cell state
                cell.state = 'brewing';
                cell.stage = 1;
                
                // Deduct resources
                playerData.hay -= 10;
                playerData.water -= 10;
                
                // Play sound effect if available
                if (typeof playSoundEffect === 'function') {
                    playSoundEffect('click');
                }
                
                // Update UI
                updateResourceDisplay();
                updateShadowCellAppearance(cellIndex);
            } else {
                console.log('Not enough resources to start brewing');
                showNotification('Not enough resources. Need 10 hay and 10 water.');
            }
        } else if (cell.state === 'ready') {
            // Collect the potion
            console.log(`Collecting potion from cell ${cellIndex}`);
            
            // Award resources
            const etherEarned = Math.floor(5 * window.shadowGrid.multiplier);
            
            playerData.ether += etherEarned;
            playerData.stats.potionsDistilled++;
            
            // Reset cell state
            cell.state = 'empty';
            cell.stage = 0;
            
            // Play sound effect if available
            if (typeof playSoundEffect === 'function') {
                playSoundEffect('distill');
            }
            
            // Show visual feedback
            showFloatingText(`+${etherEarned} ether`, cellIndex);
            
            // Check for achievement
            checkForAchievement('alchemist');
            
            // Update UI
            updateResourceDisplay();
            updateShadowCellAppearance(cellIndex);
        } else {
            // Cell is in a brewing or distilling state, show status
            console.log(`Cell ${cellIndex} is ${cell.state} (${cell.stage}/${cell.maxStage})`);
            showNotification(`Brewing stage: ${cell.stage}/${cell.maxStage}`);
        }
    };
    
    /**
     * Harvest all harvestable cells in the ranch grid
     */
    window.harvestAllRanchCells = function() {
        console.log('Harvesting all ranch cells');
        
        // Make sure the ranch grid is initialized
        if (typeof window.ensureRanchGridInitialized === 'function') {
            window.ensureRanchGridInitialized();
        }
        
        let totalHayEarned = 0;
        let totalWaterEarned = 0;
        let harvestedCount = 0;
        
        // Process all harvestable cells
        window.ranchGrid.cells.forEach((cell, index) => {
            if (cell.state === 'harvestable') {
                // Award resources
                const hayEarned = Math.floor(10 * window.ranchGrid.multiplier);
                const waterEarned = Math.floor(10 * window.ranchGrid.multiplier);
                
                totalHayEarned += hayEarned;
                totalWaterEarned += waterEarned;
                harvestedCount++;
                
                // Reset cell state
                cell.state = 'empty';
                cell.growthStage = 0;
                
                // Update cell appearance
                if (typeof updateRanchCellAppearance === 'function') {
                    updateRanchCellAppearance(index);
                }
            }
        });
        
        if (harvestedCount > 0) {
            // Award resources
            playerData.hay += totalHayEarned;
            playerData.water += totalWaterEarned;
            playerData.stats.plantsHarvested += harvestedCount;
            
            // Update harvest counter
            const hayEarnedElement = document.getElementById('hay-earned');
            const waterEarnedElement = document.getElementById('water-earned');
            
            if (hayEarnedElement) {
                const currentHayEarned = parseInt(hayEarnedElement.textContent) || 0;
                hayEarnedElement.textContent = currentHayEarned + totalHayEarned;
            }
            
            if (waterEarnedElement) {
                const currentWaterEarned = parseInt(waterEarnedElement.textContent) || 0;
                waterEarnedElement.textContent = currentWaterEarned + totalWaterEarned;
            }
            
            // Play sound effect if available
            if (typeof playSoundEffect === 'function') {
                playSoundEffect('harvest');
            }
            
            // Show notification
            showNotification(`Harvested ${harvestedCount} crops: +${totalHayEarned} hay, +${totalWaterEarned} water`);
            
            // Check for achievement
            checkForAchievement('farmer');
            
            // Update UI
            updateResourceDisplay();
        } else {
            // No harvestable cells
            showNotification('No crops ready to harvest');
        }
    };
    
    /**
     * Distill all ready potions in the shadow grid
     */
    window.distillAllShadowCells = function() {
        console.log('Distilling all shadow cells');
        
        // Make sure the shadow grid is initialized
        if (typeof window.ensureShadowGridInitialized === 'function') {
            window.ensureShadowGridInitialized();
        }
        
        let totalEtherEarned = 0;
        let distilledCount = 0;
        
        // Process all ready cells
        window.shadowGrid.cells.forEach((cell, index) => {
            if (cell.state === 'ready') {
                // Award resources
                const etherEarned = Math.floor(5 * window.shadowGrid.multiplier);
                
                totalEtherEarned += etherEarned;
                distilledCount++;
                
                // Reset cell state
                cell.state = 'empty';
                cell.stage = 0;
                
                // Update cell appearance
                if (typeof updateShadowCellAppearance === 'function') {
                    updateShadowCellAppearance(index);
                }
            }
        });
        
        if (distilledCount > 0) {
            // Award resources
            playerData.ether += totalEtherEarned;
            playerData.stats.potionsDistilled += distilledCount;
            
            // Play sound effect if available
            if (typeof playSoundEffect === 'function') {
                playSoundEffect('distill');
            }
            
            // Show notification
            showNotification(`Distilled ${distilledCount} potions: +${totalEtherEarned} ether`);
            
            // Check for achievement
            checkForAchievement('alchemist');
            
            // Update UI
            updateResourceDisplay();
        } else {
            // No ready cells
            showNotification('No potions ready to distill');
        }
    };
    
    /**
     * Create a floating text effect
     * @param {string} text - The text to display
     * @param {number} cellIndex - The cell index
     */
    function showFloatingText(text, cellIndex) {
        // Try to find the position of the cell
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        
        // Create a floating text element
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.left = `${x}px`;
        floatingText.style.top = `${y}px`;
        
        // Add to the document
        document.body.appendChild(floatingText);
        
        // Animate
        setTimeout(function() {
            floatingText.style.transform = 'translateY(-50px)';
            floatingText.style.opacity = 0;
        }, 100);
        
        // Remove from DOM after animation
        setTimeout(function() {
            document.body.removeChild(floatingText);
        }, 1100);
    }
    
    /**
     * Show a notification message
     * @param {string} message - The message to display
     */
    function showNotification(message) {
        // Check if notification function exists
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
        } else {
            console.log(`Notification: ${message}`);
            
            // Create a simple notification if the function doesn't exist
            const notification = document.createElement('div');
            notification.className = 'simple-notification';
            notification.textContent = message;
            
            // Add to the document
            document.body.appendChild(notification);
            
            // Remove after a delay
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 3000);
        }
    }
    
    /**
     * Check if an achievement has been unlocked
     * @param {string} achievementKey - The key of the achievement to check
     */
    function checkForAchievement(achievementKey) {
        if (playerData && 
            playerData.achievements && 
            playerData.achievements[achievementKey] && 
            !playerData.achievements[achievementKey].unlocked) {
            
            const achievement = playerData.achievements[achievementKey];
            
            // Get the current progress
            let current = 0;
            if (achievementKey === 'farmer') {
                current = playerData.stats.plantsHarvested;
            } else if (achievementKey === 'alchemist') {
                current = playerData.stats.potionsDistilled;
            }
            
            // Update achievement progress
            achievement.current = current;
            
            // Check if completed
            if (current >= achievement.requirement) {
                achievement.unlocked = true;
                
                // Award the reward
                playerData.cattleBalance += achievement.reward;
                
                // Play sound effect if available
                if (typeof playSoundEffect === 'function') {
                    playSoundEffect('achievement');
                }
                
                // Show notification
                showNotification(`Achievement unlocked: ${achievement.name}! +${achievement.reward} $CATTLE`);
                
                // Update UI
                updateResourceDisplay();
            }
        }
    }
    
    /**
     * Update resource display in the UI
     */
    function updateResourceDisplay() {
        // Update cattle balance
        const cattleBalanceElements = document.querySelectorAll('[id$="cattle-balance"]');
        cattleBalanceElements.forEach(element => {
            element.textContent = playerData.cattleBalance;
        });
        
        // Update hay
        const hayElement = document.getElementById('hay');
        if (hayElement) {
            hayElement.textContent = playerData.hay;
        }
        
        // Update water
        const waterElement = document.getElementById('water');
        if (waterElement) {
            waterElement.textContent = playerData.water;
        }
        
        // Update barn capacity
        const barnCapacityElements = document.querySelectorAll('[id^="barn-capacity"]');
        barnCapacityElements.forEach(element => {
            element.textContent = playerData.barnCapacity;
        });
    }
    
    // Initialize the module
    window.addEventListener('DOMContentLoaded', function() {
        console.log('Grid cell handlers initialized');
    });
    
})();