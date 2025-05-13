// Phaser game configuration
// This file initializes the Phaser game instance with our custom scenes

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Create Phaser game configuration
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'phaser-game-container', // This will mount the game to this HTML element
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }, // No gravity for top-down games
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.RESIZE, // Automatically resize
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [] // We'll add scenes after they're defined
    };
    
    // Function to initialize the Phaser game with scenes
    function initPhaserGame() {
        // Check if Phaser is available
        if (typeof Phaser === 'undefined') {
            console.error('Phaser is not loaded. Cannot initialize game.');
            return;
        }
        
        // Create the Phaser game instance
        const game = new Phaser.Game(config);
        
        // Register scenes
        if (window.RanchScene) {
            game.scene.add('RanchScene', window.RanchScene);
            console.log('Ranch scene registered');
        } else {
            console.error('RanchScene not found or not loaded yet');
        }
        
        if (window.NightScene) {
            game.scene.add('NightScene', window.NightScene);
            console.log('Night scene registered');
        } else {
            console.error('NightScene not found or not loaded yet');
        }
        
        // Set up bridge functions to switch between Phaser scenes and HTML UI
        setupBridgeFunctions(game);
        
        // Make game instance globally available
        window.phaserGame = game;
        
        // Expose a function to start scenes from outside
        window.startPhaserScene = function(sceneName) {
            if (game.scene.getScene(sceneName)) {
                // Stop all currently active scenes
                game.scene.getScenes(true).forEach(scene => {
                    scene.scene.stop();
                });
                
                // Start requested scene
                game.scene.start(sceneName);
                console.log(`Starting Phaser scene: ${sceneName}`);
                
                // Make the container visible
                document.getElementById('phaser-game-container').style.display = 'block';
            } else {
                console.error(`Scene not found: ${sceneName}`);
            }
        };
        
        // Create HTML container if it doesn't exist
        createGameContainer();
        
        console.log('Phaser game initialized successfully');
    }
    
    // Set up bridge functions for communication between Phaser and traditional UI
    function setupBridgeFunctions(game) {
        // Function to switch from Phaser to UI
        window.switchToCropUI = function() {
            // Show the crop management UI
            const cropUI = document.getElementById('crop-management-ui');
            if (cropUI) {
                cropUI.classList.remove('hidden');
            } else {
                console.error('Crop management UI element not found');
            }
            
            // Blur the Phaser game container
            const gameContainer = document.getElementById('phaser-game-container');
            if (gameContainer) {
                gameContainer.classList.add('blurred');
            }
        };
        
        window.switchToCattleUI = function() {
            // Show the cattle management UI
            const cattleUI = document.getElementById('cattle-management-ui');
            if (cattleUI) {
                cattleUI.classList.remove('hidden');
            } else {
                console.error('Cattle management UI element not found');
            }
            
            // Blur the Phaser game container
            const gameContainer = document.getElementById('phaser-game-container');
            if (gameContainer) {
                gameContainer.classList.add('blurred');
            }
        };
        
        window.switchToPotionUI = function() {
            // Show the potion brewing UI
            const potionUI = document.getElementById('potion-brewing-ui');
            if (potionUI) {
                potionUI.classList.remove('hidden');
            } else {
                console.error('Potion brewing UI element not found');
            }
            
            // Blur the Phaser game container
            const gameContainer = document.getElementById('phaser-game-container');
            if (gameContainer) {
                gameContainer.classList.add('blurred');
            }
        };
        
        window.switchToShadowMarketUI = function() {
            // Show the shadow market UI
            const shadowMarketUI = document.getElementById('shadow-market-ui');
            if (shadowMarketUI) {
                shadowMarketUI.classList.remove('hidden');
            } else {
                console.error('Shadow market UI element not found');
            }
            
            // Blur the Phaser game container
            const gameContainer = document.getElementById('phaser-game-container');
            if (gameContainer) {
                gameContainer.classList.add('blurred');
            }
        };
        
        // Function to return from UI to Phaser game
        window.returnToPhaserScene = function(sceneName) {
            // Hide all UI elements
            const uiElements = [
                'crop-management-ui',
                'cattle-management-ui',
                'potion-brewing-ui',
                'shadow-market-ui'
            ];
            
            uiElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.classList.add('hidden');
                }
            });
            
            // Show and unblur the Phaser container
            const gameContainer = document.getElementById('phaser-game-container');
            if (gameContainer) {
                gameContainer.classList.remove('blurred');
                gameContainer.style.display = 'block';
            }
            
            // Resume the specified scene or the current active scene
            if (sceneName) {
                // If a specific scene is requested, start it
                window.startPhaserScene(sceneName);
            } else {
                // Otherwise, resume the current scene
                const currentScene = game.scene.getScenes(true)[0];
                if (currentScene) {
                    currentScene.scene.resume();
                }
            }
        };
        
        // Bridge for updating game state
        window.updatePhaserGameState = function(newState) {
            // Update currently active scenes with new state
            game.scene.getScenes(true).forEach(scene => {
                if (typeof scene.updateGameState === 'function') {
                    scene.updateGameState(newState);
                }
            });
        };
    }
    
    // Create the game container if it doesn't exist
    function createGameContainer() {
        let container = document.getElementById('phaser-game-container');
        
        if (!container) {
            // Create the container element
            container = document.createElement('div');
            container.id = 'phaser-game-container';
            container.style.width = '100%';
            container.style.height = '600px';
            container.style.position = 'relative';
            container.style.margin = '0 auto';
            
            // Initial state - we'll show this when needed
            container.style.display = 'none';
            
            // Insert into document - try to add at a sensible place
            // Find the UI container to insert game container before it
            const uiContainer = document.getElementById('ui-container');
            if (uiContainer) {
                uiContainer.parentNode.insertBefore(container, uiContainer);
            } else {
                // Fallback to appending to body
                document.body.appendChild(container);
            }
        }
        
        // Add necessary CSS for blurring effect if not already defined
        let style = document.getElementById('phaser-blur-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'phaser-blur-style';
            style.textContent = `
                .blurred {
                    filter: blur(5px);
                    opacity: 0.7;
                    transition: all 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Wait for required scripts to load
    function checkPhaserReady() {
        if (typeof Phaser !== 'undefined' && 
            typeof window.RanchScene !== 'undefined' && 
            typeof window.NightScene !== 'undefined') {
            // All required components are loaded
            initPhaserGame();
        } else {
            // Not ready yet, check again in a moment
            console.log("Waiting for Phaser and scene classes to load...");
            setTimeout(checkPhaserReady, 100);
        }
    }
    
    // Start checking if Phaser is ready
    checkPhaserReady();
});