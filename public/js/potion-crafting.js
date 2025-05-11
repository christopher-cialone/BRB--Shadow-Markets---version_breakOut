// Potion crafting functionality for Shadow Market
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing potion crafting functionality");
    
    // Helper function to generate a random ID
    function generateID() {
        return Math.random().toString(36).substring(2, 15);
    }
    
    // Setup craft potion button functionality
    function setupPotionCraftingUI() {
        const startBrewButton = document.getElementById('start-brew-btn');
        const distillButton = document.getElementById('distill-btn');
        const potionInventory = document.getElementById('potion-inventory');
        
        if (startBrewButton) {
            startBrewButton.addEventListener('click', function() {
                console.log("Start brew button clicked");
                
                // Get selected cell from Shadow Grid
                const selectedCell = getSelectedShadowCell();
                if (!selectedCell) {
                    showNotification("Select a cell in the Shadow Grid first", 'error');
                    return;
                }
                
                // Check if cell is empty
                if (selectedCell.state !== 'empty') {
                    showNotification("Cell already in use", 'error');
                    return;
                }
                
                // Check if player has enough resources
                if (playerData.cattleBalance < 20) {
                    showNotification("Not enough $CATTLE to start brewing. Need 20 $CATTLE.", 'error');
                    return;
                }
                
                // Deduct resources (50% burned)
                const burnAmount = 10; // 50% of 20
                playerData.cattleBalance -= 20;
                
                // Set cell to brewing state
                selectedCell.state = 'brewing';
                selectedCell.brewStage = 0;
                selectedCell.brewMax = 5;
                
                // Update displays
                updateResourceDisplay();
                updateShadowGridDisplay();
                
                // Show notification with burn info
                showNotification(`Started brewing potion. ${burnAmount} $CATTLE burned to Shadow Market.`, 'success');
            });
        }
        
        if (distillButton) {
            distillButton.addEventListener('click', function() {
                console.log("Distill button clicked");
                
                // Get selected cell from Shadow Grid
                const selectedCell = getSelectedShadowCell();
                if (!selectedCell) {
                    showNotification("Select a cell in the Shadow Grid first", 'error');
                    return;
                }
                
                // Check if cell is ready for distilling
                if (selectedCell.state !== 'brewing' || selectedCell.brewStage < selectedCell.brewMax) {
                    showNotification("Potion not ready for distilling", 'error');
                    return;
                }
                
                // Set to distilling state
                selectedCell.state = 'distilling';
                
                // Update displays
                updateShadowGridDisplay();
                
                // Show notification
                showNotification("Potion is now distilling. It will be ready soon.", 'success');
            });
        }
        
        // Setup collect potion button
        const collectPotionBtn = document.getElementById('collect-potion-btn');
        if (collectPotionBtn) {
            collectPotionBtn.addEventListener('click', function() {
                console.log("Collect potion button clicked");
                
                // Get selected cell from Shadow Grid
                const selectedCell = getSelectedShadowCell();
                if (!selectedCell) {
                    showNotification("Select a cell in the Shadow Grid first", 'error');
                    return;
                }
                
                // Check if potion is ready
                if (selectedCell.state !== 'ready') {
                    showNotification("Potion not ready for collection", 'error');
                    return;
                }
                
                // Generate random potency (1-10)
                const potency = Math.floor(Math.random() * 10) + 1;
                
                // Create new potion
                const newPotion = {
                    id: generateID(),
                    name: `Shadow Potion ${playerData.potions.length + 1}`,
                    potency: potency,
                    value: 25 + (potency * 1)
                };
                
                // Add to player's potions
                if (!Array.isArray(playerData.potions)) {
                    playerData.potions = [];
                }
                playerData.potions.push(newPotion);
                
                // Reset cell state
                selectedCell.state = 'empty';
                selectedCell.brewStage = 0;
                selectedCell.potency = 0;
                
                // Update displays
                updatePotionInventory();
                updateShadowGridDisplay();
                
                // Show notification
                showNotification(`Collected ${newPotion.name} with potency ${potency}!`, 'success');
            });
        }
    }
    
    // Function to get the currently selected cell in the shadow grid
    function getSelectedShadowCell() {
        // If there's a selected cell index in the shadow grid, use that
        if (typeof shadowGrid !== 'undefined' && shadowGrid.selectedCell !== undefined) {
            return shadowGrid.cells[shadowGrid.selectedCell];
        }
        
        // Otherwise, return the first brewing/ready cell or null
        if (typeof shadowGrid !== 'undefined' && Array.isArray(shadowGrid.cells)) {
            return shadowGrid.cells.find(cell => cell.state !== 'empty') || null;
        }
        
        return null;
    }
    
    // Function to update the shadow grid display
    function updateShadowGridDisplay() {
        // Use existing update function if available
        if (typeof window.updateShadowCells === 'function') {
            window.updateShadowCells();
        }
    }
    
    // Function to update the potion inventory display
    function updatePotionInventory() {
        const potionInventory = document.getElementById('potion-inventory');
        if (!potionInventory) return;
        
        // Clear existing inventory
        potionInventory.innerHTML = '';
        
        // Check if potions array exists and is an array
        if (!playerData.potions || !Array.isArray(playerData.potions) || playerData.potions.length === 0) {
            potionInventory.innerHTML = '<div class="empty-inventory">No potions yet. Craft some in the Shadow Lab!</div>';
            return;
        }
        
        // Add each potion to the inventory
        playerData.potions.forEach(potion => {
            const potionElement = document.createElement('div');
            potionElement.className = 'potion-item';
            potionElement.dataset.id = potion.id;
            
            // Create potion image
            const potionImg = document.createElement('img');
            potionImg.src = 'img/potion.svg';
            potionImg.alt = potion.name;
            potionImg.className = 'potion-image';
            
            // Add potency indicator
            potionImg.style.filter = `hue-rotate(${potion.potency * 36}deg) brightness(${1 + potion.potency * 0.05})`;
            
            // Create potion info
            const potionInfo = document.createElement('div');
            potionInfo.className = 'potion-info';
            potionInfo.innerHTML = `
                <div class="potion-name">${potion.name}</div>
                <div class="potion-stats">
                    <span>Potency: ⚡${potion.potency}</span>
                    <span>Value: ${potion.value} $CATTLE</span>
                </div>
            `;
            
            // Create sell button
            const sellButton = document.createElement('button');
            sellButton.className = 'sell-potion-btn';
            sellButton.textContent = 'Sell';
            sellButton.addEventListener('click', function(e) {
                e.stopPropagation();
                sellPotion(potion.id);
            });
            
            // Create use button
            const useButton = document.createElement('button');
            useButton.className = 'use-potion-btn';
            useButton.textContent = 'Use';
            useButton.addEventListener('click', function(e) {
                e.stopPropagation();
                usePotion(potion.id);
            });
            
            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'potion-buttons';
            buttonContainer.appendChild(useButton);
            buttonContainer.appendChild(sellButton);
            
            // Assemble potion element
            potionElement.appendChild(potionImg);
            potionElement.appendChild(potionInfo);
            potionElement.appendChild(buttonContainer);
            
            // Add to inventory
            potionInventory.appendChild(potionElement);
        });
    }
    
    // Function to sell a potion
    function sellPotion(potionId) {
        // Find the potion in the player's inventory
        const potionIndex = playerData.potions.findIndex(p => p.id === potionId);
        if (potionIndex === -1) return;
        
        const potion = playerData.potions[potionIndex];
        
        // Calculate market multiplier (1.0-2.0 based on time of day)
        const hourOfDay = new Date().getHours();
        const marketMultiplier = 1 + (Math.sin((hourOfDay / 24) * Math.PI) * 0.5 + 0.5);
        
        // Calculate sell value with market multiplier
        const sellValue = Math.floor(potion.value * marketMultiplier);
        
        // Remove the potion from inventory
        playerData.potions.splice(potionIndex, 1);
        
        // Add potion value to player balance
        playerData.cattleBalance += sellValue;
        
        // Update displays
        updatePotionInventory();
        updateResourceDisplay();
        
        // Show notification
        showNotification(`Sold ${potion.name} for ${sellValue} $CATTLE! (Market: ${marketMultiplier.toFixed(2)}x)`, 'success');
    }
    
    // Function to use a potion
    function usePotion(potionId) {
        // Find the potion in the player's inventory
        const potionIndex = playerData.potions.findIndex(p => p.id === potionId);
        if (potionIndex === -1) return;
        
        const potion = playerData.potions[potionIndex];
        
        // Remove the potion from inventory
        playerData.potions.splice(potionIndex, 1);
        
        // Apply effect based on potency
        // For this demo, let's just increase resources and show a special effect
        playerData.hay += 10 * potion.potency;
        playerData.water += 10 * potion.potency;
        
        // Update displays
        updatePotionInventory();
        updateResourceDisplay();
        
        // Show effect (if in Phaser scene)
        if (typeof addPotionEffect === 'function') {
            addPotionEffect(potion.potency);
        }
        
        // Show notification
        showNotification(`Used ${potion.name}! Gained ${10 * potion.potency} hay and water.`, 'success');
    }
    
    // Function to update resource display
    function updateResourceDisplay() {
        // Update cattle balance
        const cattleBalanceElements = document.querySelectorAll('#cattle-balance, #saloon-cattle-balance');
        cattleBalanceElements.forEach(element => {
            if (element) element.textContent = playerData.cattleBalance;
        });
        
        // Update hay and water
        const hayElement = document.getElementById('hay');
        const waterElement = document.getElementById('water');
        
        if (hayElement) hayElement.textContent = playerData.hay;
        if (waterElement) waterElement.textContent = playerData.water;
    }
    
    // Function to show notification
    function showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        
        // Create a basic notification if none exists
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const notifications = document.getElementById('notifications');
        if (notifications) {
            notifications.appendChild(notification);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                notifications.removeChild(notification);
            }, 5000);
        } else {
            // Just alert if no notification container
            alert(message);
        }
    }
    
    // Initialize potion crafting functionality when we're in Night scene
    function initPotionCraftingWhenInNight() {
        const nightUI = document.getElementById('night-ui');
        if (nightUI && !nightUI.classList.contains('hidden')) {
            console.log("In Night scene, setting up potion crafting UI");
            setupPotionCraftingUI();
            updatePotionInventory();
        }
    }
    
    // Add a listener to night navigation buttons to initialize potion crafting
    const goToNightButtons = [
        document.getElementById('go-to-night')
    ];
    
    goToNightButtons.forEach(button => {
        if (button) {
            const originalClick = button.onclick;
            button.onclick = function(e) {
                if (originalClick) originalClick.call(this, e);
                setTimeout(initPotionCraftingWhenInNight, 100);
            };
        }
    });
    
    // Initialize immediately if we're already on the Night screen
    initPotionCraftingWhenInNight();
    
    // Make functions available globally
    window.updatePotionInventory = updatePotionInventory;
    window.sellPotion = sellPotion;
    window.usePotion = usePotion;
    window.setupPotionCraftingUI = setupPotionCraftingUI;
});