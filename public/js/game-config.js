/**
 * Game Configuration Module
 * 
 * This module initializes the Phaser game instance with proper configuration
 * and maintains a reference to it for scene switching.
 */

(function() {
    'use strict';
    
    // Wait until scene classes are defined
    document.addEventListener('DOMContentLoaded', () => {
        console.log("Initializing game configuration");
        
        // Verify that scene classes exist
        if (typeof window.MainMenuScene === 'undefined') {
            console.error("MainMenuScene not defined");
            return;
        }
        
        if (typeof window.RanchScene === 'undefined') {
            console.error("RanchScene not defined");
            return;
        }
        
        if (typeof window.SaloonScene === 'undefined') {
            console.error("SaloonScene not defined");
            return;
        }
        
        if (typeof window.NightScene === 'undefined') {
            console.error("NightScene not defined");
            return;
        }
        
        // Create game configuration
        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'game-container',
            scene: [
                window.MainMenuScene, 
                window.RanchScene, 
                window.SaloonScene,
                window.NightScene
            ],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            transparent: true,
            dom: {
                createContainer: true
            }
        };
        
        try {
            // Create game instance
            window.game = new Phaser.Game(config);
            console.log("Phaser game instance created successfully");
            
            // Inform the system that the game is ready
            const gameReadyEvent = new CustomEvent('game-ready');
            document.dispatchEvent(gameReadyEvent);
            
        } catch (error) {
            console.error("Error initializing Phaser game:", error);
        }
    });
    
})();