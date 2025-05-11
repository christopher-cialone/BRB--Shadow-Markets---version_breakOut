// Simple game start handler to fix the broken UI
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing game button handlers...");
    
    // Helper function to add click listeners
    function addClickListener(elementId, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            // Remove any existing event listeners to prevent duplicates
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // Add the new event listener
            newElement.addEventListener('click', callback);
            console.log(`Added click listener to ${elementId}`);
            return true;
        } else {
            console.error(`Element not found: ${elementId}`);
            return false;
        }
    }
    
    // Function to switch between scenes
    function switchScene(sceneName) {
        console.log(`Switching to scene: ${sceneName}`);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the requested screen
        let screenElement;
        switch(sceneName) {
            case 'main-menu':
                screenElement = document.getElementById('main-menu');
                break;
            case 'ranch':
                screenElement = document.getElementById('ranch-ui');
                break;
            case 'saloon':
                screenElement = document.getElementById('saloon-ui');
                break;
            case 'night':
                screenElement = document.getElementById('night-ui');
                break;
            case 'profile':
                screenElement = document.getElementById('profile-ui');
                break;
            default:
                console.error(`Unknown scene: ${sceneName}`);
                return;
        }
        
        if (screenElement) {
            screenElement.classList.remove('hidden');
            console.log(`UI updated for scene: ${sceneName}`);
        }
    }
    
    // Function to update all displays
    function updateAllDisplays() {
        // Update cattle balance display
        const cattleBalanceElements = document.querySelectorAll('#cattle-balance, #saloon-cattle-balance');
        cattleBalanceElements.forEach(element => {
            if (element) element.textContent = playerData.cattleBalance;
        });
        
        // Update resource displays
        const hayElement = document.getElementById('hay');
        const waterElement = document.getElementById('water');
        
        if (hayElement) hayElement.textContent = playerData.hay;
        if (waterElement) waterElement.textContent = playerData.water;
    }
    
    // Set up archetype selection
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
            console.log(`Selected archetype: ${playerData.archetype}`);
        });
    });
    
    // Start Game button
    addClickListener('start-game', () => {
        console.log("Start Game button clicked");
        
        // Get player name
        const playerNameInput = document.getElementById('player-name');
        if (playerNameInput) {
            playerData.name = playerNameInput.value || 'Cowboy';
        }
        
        // Connect to server (if needed)
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('new-player', {
                name: playerData.name,
                archetype: playerData.archetype
            });
        }
        
        // Switch to ranch scene
        switchScene('ranch');
        updateAllDisplays();
    });
    
    // TRAVEL BUTTONS
    // Go to saloon from ranch
    addClickListener('go-to-saloon', () => {
        switchScene('saloon');
    });
    
    // Go to night scene from ranch
    addClickListener('go-to-night', () => {
        switchScene('night');
    });
    
    // Go back to ranch from night
    addClickListener('back-to-ranch-night', () => {
        switchScene('ranch');
    });
    
    // Go to saloon from night
    addClickListener('go-to-saloon-from-night', () => {
        switchScene('saloon');
    });
    
    // Go to profile from various scenes
    ['go-to-profile-from-ranch', 'go-to-profile-from-saloon', 'go-to-profile-from-night'].forEach(id => {
        addClickListener(id, () => {
            switchScene('profile');
        });
    });
    
    // Go back to ranch from profile
    addClickListener('back-to-ranch-profile', () => {
        switchScene('ranch');
    });
    
    // Go back to ranch from saloon
    addClickListener('back-to-ranch-saloon', () => {
        switchScene('ranch');
    });
    
    console.log("Game button handlers initialized");
});