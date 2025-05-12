// Game initialization script
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing game...");
    
    // Initialize core game data
    if (!window.playerData) {
        window.playerData = {
            name: 'Cowboy',
            archetype: 'entrepreneur',
            cattleBalance: 100,
            hay: 50,
            water: 50,
            cattle: [],
            potions: []
        };
    } else {
        // Ensure cattle is an array (this fixes "playerData.cattle is not an array: 0" error)
        if (!Array.isArray(window.playerData.cattle)) {
            console.warn("Fixing playerData.cattle which is not an array:", window.playerData.cattle);
            window.playerData.cattle = [];
        }
        
        // Ensure potions is an array
        if (!Array.isArray(window.playerData.potions)) {
            console.warn("Fixing playerData.potions which is not an array:", window.playerData.potions);
            window.playerData.potions = [];
        }
    }
    
    // Initialize ranch grid if needed
    window.ranchGrid = window.ranchGrid || {
        cells: [],
        selectedCell: null
    };
    
    // Initialize shadow grid if needed
    window.shadowGrid = window.shadowGrid || {
        cells: [],
        selectedCell: null,
        marketState: 'neutral',
        marketMultiplier: 1.0
    };
    
    // Set up game configuration for Phaser
    const initPhaser = () => {
        if (typeof Phaser === 'undefined') {
            console.warn("Phaser not loaded yet, will retry...");
            setTimeout(initPhaser, 500);
            return;
        }
        
        try {
            console.log("Setting up Phaser game...");
            const config = {
                type: Phaser.AUTO,
                width: window.innerWidth,
                height: window.innerHeight,
                transparent: true,
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    width: '100%',
                    height: '100%'
                },
                parent: 'game-container',
                scene: [MainMenuScene, RanchScene, SaloonScene, NightScene],
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                        debug: false
                    }
                }
            };
            
            // Initialize the Phaser game
            window.game = new Phaser.Game(config);
            console.log("Phaser game initialized");
        } catch (error) {
            console.error("Error initializing Phaser:", error);
            showNotification("Game engine initialization failed. Using fallback UI.", "error");
        }
    };
    
    // Initialize game components
    initPhaser();
    
    // Set up global event listeners for the window
    window.addEventListener('resize', () => {
        if (window.game && window.game.scale) {
            window.game.scale.resize(window.innerWidth, window.innerHeight);
        }
    });
    
    // Create a convenient way to check if a scene is active
    window.isSceneActive = function(sceneName) {
        if (!window.game || !window.game.scene) return false;
        
        switch(sceneName) {
            case 'main-menu':
                return window.game.scene.isActive('MainMenuScene');
            case 'ranch':
                return window.game.scene.isActive('RanchScene');
            case 'saloon':
                return window.game.scene.isActive('SaloonScene');
            case 'night':
                return window.game.scene.isActive('NightScene');
            default:
                return false;
        }
    };
    
    // Make sure to start on the main menu
    if (document.getElementById('main-menu')) {
        // Show the main menu screen (will be handled by switchScene)
        if (typeof switchScene === 'function') {
            switchScene('main-menu');
        } else {
            // Fallback if switchScene is not available yet
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            document.getElementById('main-menu').classList.remove('hidden');
        }
    }
    
    // Show welcome notification
    setTimeout(() => {
        if (typeof showNotification === 'function') {
            showNotification("Welcome to Bull Run Boost: Shadow Markets of the Cyber-West!", "info");
        }
    }, 1000);
    
    console.log("Game initialization complete");
});