// Cattle breeding functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing cattle breeding functionality");
    
    // Helper function to generate a random ID
    function generateID() {
        return Math.random().toString(36).substring(2, 15);
    }
    
    // Setup breed cattle button functionality
    function setupBreedingUI() {
        const breedButton = document.getElementById('breed-cattle-btn');
        const cattleInventory = document.getElementById('cattle-inventory');
        
        if (!breedButton) {
            console.warn("Breed cattle button not found");
            return;
        }
        
        breedButton.addEventListener('click', function() {
            console.log("Breed cattle button clicked");
            
            // Ensure playerData is properly initialized
            if (!window.playerData) {
                window.playerData = {
                    name: 'Cowboy',
                    archetype: 'Entrepreneur',
                    cattleBalance: 100,
                    hay: 100,
                    water: 100,
                    cattle: []
                };
            }
            
            // Ensure cattle array exists
            if (!window.playerData.cattle || !Array.isArray(window.playerData.cattle)) {
                window.playerData.cattle = [];
            }
            
            // Check if player has enough resources
            if (window.playerData.hay < 10 || window.playerData.water < 10) {
                showNotification("Not enough resources to breed cattle. Need 10 hay and 10 water.", 'error');
                return;
            }
            
            // Deduct resources
            window.playerData.hay -= 10;
            window.playerData.water -= 10;
            
            // Create new cattle
            const newCattle = {
                id: generateID(),
                name: `Cattle ${playerData.cattle.length + 1}`,
                milk: 0,
                maxMilk: 20,
                milkRate: 1,
                milkValue: 3
            };
            
            // Add to player's cattle
            if (!Array.isArray(playerData.cattle)) {
                playerData.cattle = [];
            }
            playerData.cattle.push(newCattle);
            
            // Update displays
            updateResourceDisplay();
            updateCattleInventory();
            
            // Show notification
            showNotification(`Successfully bred a new cattle: ${newCattle.name}!`, 'success');
            
            // Try to add to scene if in Ranch scene
            try {
                // First check if we're in the Ranch scene in Phaser
                if (window.game && window.game.scene) {
                    const ranchScene = window.game.scene.getScene('RanchScene');
                    if (ranchScene && ranchScene.sys && ranchScene.sys.settings.active) {
                        // The Ranch scene exists and is active, add cattle there
                        if (typeof ranchScene.addCattleSprite === 'function') {
                            ranchScene.addCattleSprite(newCattle);
                            console.log(`Added cattle directly to active RanchScene: ${newCattle.name}`);
                        }
                    } else {
                        console.log("Ranch scene is not active, skipping visual cattle addition");
                    }
                } 
                // Fall back to using global function
                else if (typeof window.addCattleToScene === 'function') {
                    window.addCattleToScene(newCattle);
                    console.log(`Added cattle using global function: ${newCattle.name}`);
                }
            } catch (e) {
                console.error("Could not add cattle to scene:", e);
                // Don't let this error disrupt the game - the cattle is still added to the data model
            }
        });
    }
    
    // Function to update the cattle inventory display
    function updateCattleInventory() {
        const cattleInventory = document.getElementById('cattle-inventory');
        if (!cattleInventory) return;
        
        // Clear existing inventory
        cattleInventory.innerHTML = '';
        
        // Check if cattle array exists and is an array
        if (!playerData.cattle || !Array.isArray(playerData.cattle) || playerData.cattle.length === 0) {
            cattleInventory.innerHTML = '<div class="empty-inventory">No cattle yet. Breed some!</div>';
            return;
        }
        
        // Add each cattle to the inventory
        playerData.cattle.forEach(cattle => {
            const cattleElement = document.createElement('div');
            cattleElement.className = 'cattle-item';
            cattleElement.dataset.id = cattle.id;
            
            // Create cattle image
            const cattleImg = document.createElement('img');
            cattleImg.src = 'img/cattle.png';  // Use PNG instead of SVG
            cattleImg.alt = cattle.name;
            cattleImg.className = 'cattle-image';
            
            // Add error handling for image loading
            cattleImg.onerror = function() {
                console.warn(`Failed to load cattle image for ${cattle.name}`);
                // Create a simple colored div as fallback
                this.style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'cattle-image cattle-fallback';
                fallbackDiv.style.backgroundColor = '#8b4513'; 
                fallbackDiv.style.borderRadius = '50%';
                fallbackDiv.style.width = '100%';
                fallbackDiv.style.height = '100%';
                fallbackDiv.textContent = '🐄';
                this.parentNode.insertBefore(fallbackDiv, this);
            };
            
            // Create cattle info
            const cattleInfo = document.createElement('div');
            cattleInfo.className = 'cattle-info';
            cattleInfo.innerHTML = `
                <div class="cattle-name">${cattle.name}</div>
                <div class="cattle-milk-bar">
                    <div class="milk-progress" style="width: ${(cattle.milk / cattle.maxMilk) * 100}%"></div>
                </div>
                <div class="cattle-stats">
                    <span>Milk: ${cattle.milk}/${cattle.maxMilk}</span>
                    <span>Value: ${cattle.milkValue} $CATTLE</span>
                </div>
            `;
            
            // Create sell button
            const sellButton = document.createElement('button');
            sellButton.className = 'sell-cattle-btn';
            sellButton.textContent = 'Sell';
            sellButton.addEventListener('click', function(e) {
                e.stopPropagation();
                sellCattle(cattle.id);
            });
            
            // Assemble cattle element
            cattleElement.appendChild(cattleImg);
            cattleElement.appendChild(cattleInfo);
            cattleElement.appendChild(sellButton);
            
            // Add to inventory
            cattleInventory.appendChild(cattleElement);
        });
    }
    
    // Function to sell a cattle
    function sellCattle(cattleId) {
        // Find the cattle in the player's inventory
        const cattleIndex = playerData.cattle.findIndex(c => c.id === cattleId);
        if (cattleIndex === -1) return;
        
        const cattle = playerData.cattle[cattleIndex];
        
        // Calculate sell value (base + milk)
        const sellValue = 10 + (cattle.milk * cattle.milkValue);
        
        // Remove the cattle from inventory
        playerData.cattle.splice(cattleIndex, 1);
        
        // Add cattle value to player balance
        playerData.cattleBalance += sellValue;
        
        // Update displays
        updateCattleInventory();
        updateResourceDisplay();
        
        // Show notification
        showNotification(`Sold ${cattle.name} for ${sellValue} $CATTLE!`, 'success');
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
    
    // Initialize breeding functionality when we're in Ranch scene
    function initBreedingWhenInRanch() {
        const ranchUI = document.getElementById('ranch-ui');
        if (ranchUI && !ranchUI.classList.contains('hidden')) {
            console.log("In Ranch scene, setting up breeding UI");
            setupBreedingUI();
            updateCattleInventory();
        }
    }
    
    // Add a listener to the ranch navigation button to initialize breeding
    const goToRanchButtons = [
        document.getElementById('back-to-ranch-saloon'),
        document.getElementById('back-to-ranch-night'),
        document.getElementById('back-to-ranch-profile')
    ];
    
    goToRanchButtons.forEach(button => {
        if (button) {
            const originalClick = button.onclick;
            button.onclick = function(e) {
                if (originalClick) originalClick.call(this, e);
                setTimeout(initBreedingWhenInRanch, 100);
            };
        }
    });
    
    // Initialize immediately if we're already on the Ranch screen
    initBreedingWhenInRanch();
    
    // Make functions available globally
    window.updateCattleInventory = updateCattleInventory;
    window.sellCattle = sellCattle;
    window.setupBreedingUI = setupBreedingUI;
});