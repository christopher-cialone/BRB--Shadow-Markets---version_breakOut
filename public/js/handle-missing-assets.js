/**
 * Asset Error Handling Utilities
 * 
 * This module provides functions for handling missing assets in the game.
 * It creates fallback graphics and handles error scenarios.
 */

(function() {
    'use strict';
    
    /**
     * Safely loads an image and provides a fallback if it fails
     * @param {Phaser.Scene} scene - The scene context
     * @param {string} key - Texture key for the image
     * @param {string} path - Path to the image file
     */
    function safePhaserImageLoad(scene, key, path) {
        try {
            if (!scene.textures.exists(key)) {
                scene.load.image(key, path);
                
                // Add error handler for this specific texture
                scene.load.once(`fileerror-${key}`, () => {
                    console.warn(`Failed to load image: ${key} from ${path}`);
                    handleMissingTexture(scene, key);
                });
            }
        } catch (error) {
            console.error(`Error loading image ${key}:`, error);
            handleMissingTexture(scene, key);
        }
    }

    /**
     * Creates a fallback texture when an asset fails to load
     * @param {Phaser.Scene} scene - The scene where the texture is needed
     * @param {string} key - The texture key that failed to load
     * @param {number} width - Width of the fallback texture
     * @param {number} height - Height of the fallback texture
     * @param {number} color - Color of the fallback texture
     */
    function handleMissingTexture(scene, key, width = 64, height = 64, color = 0x3a76c4) {
        console.warn(`Creating fallback texture for missing asset: ${key}`);
        
        try {
            // Create a graphics object for the fallback texture
            const graphics = scene.make.graphics({x: 0, y: 0, add: false});
            
            // Draw a colored rectangle with a border
            graphics.fillStyle(color, 0.8);
            graphics.fillRect(0, 0, width, height);
            graphics.lineStyle(2, 0xffffff, 1);
            graphics.strokeRect(0, 0, width, height);
            
            // Add a question mark or appropriate icon for known asset types
            graphics.lineStyle(2, 0xffffff, 1);
            
            if (key.includes('cattle')) {
                // Draw cow-like shape
                graphics.moveTo(width * 0.2, height * 0.3);
                graphics.lineTo(width * 0.8, height * 0.3);
                graphics.lineTo(width * 0.8, height * 0.7);
                graphics.lineTo(width * 0.2, height * 0.7);
                graphics.lineTo(width * 0.2, height * 0.3);
                graphics.fillStyle(0xffffff, 0.5);
                graphics.fillCircle(width * 0.3, height * 0.4, width * 0.1);
            } else if (key.includes('potion')) {
                // Draw potion-like shape
                graphics.moveTo(width * 0.4, height * 0.2);
                graphics.lineTo(width * 0.6, height * 0.2);
                graphics.lineTo(width * 0.7, height * 0.5);
                graphics.lineTo(width * 0.7, height * 0.8);
                graphics.lineTo(width * 0.3, height * 0.8);
                graphics.lineTo(width * 0.3, height * 0.5);
                graphics.lineTo(width * 0.4, height * 0.2);
            } else {
                // Draw a question mark for unknown assets
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(width * 0.5, height * 0.3, width * 0.1);
                graphics.fillRect(width * 0.45, height * 0.4, width * 0.1, height * 0.2);
                graphics.fillCircle(width * 0.5, height * 0.7, width * 0.1);
            }
            
            // Add a label with the texture name if there's enough space
            if (width >= 80 && height >= 80) {
                const label = scene.add.text(width / 2, height * 0.85, key, {
                    font: '10px Arial',
                    fill: '#ffffff',
                    align: 'center'
                });
                label.setOrigin(0.5, 0.5);
                graphics.generateTexture(key, width, height);
                label.destroy();
            } else {
                graphics.generateTexture(key, width, height);
            }
            
            console.log(`Created fallback texture for: ${key}`);
        } catch (error) {
            console.error(`Error creating fallback texture for ${key}:`, error);
        }
    }

    /**
     * Preloads common assets needed across multiple scenes
     * @param {Phaser.Scene} scene - The scene context
     */
    function preloadCommonAssets(scene) {
        try {
            // UI elements
            safePhaserImageLoad(scene, 'button-background', 'assets/ui/button-bg.png');
            safePhaserImageLoad(scene, 'panel-background', 'assets/ui/panel-bg.png');
            
            // Characters
            safePhaserImageLoad(scene, 'player-character', 'assets/characters/player.png');
            safePhaserImageLoad(scene, 'npc-bartender', 'assets/characters/bartender.png');
            
            // Common game objects
            safePhaserImageLoad(scene, 'cattle', 'assets/objects/cattle.png');
            safePhaserImageLoad(scene, 'hay-icon', 'assets/icons/hay.png');
            safePhaserImageLoad(scene, 'water-drop', 'assets/icons/water.png');
            safePhaserImageLoad(scene, 'milk-bottle', 'assets/icons/milk.png');
            
            // Log completion
            scene.load.on('complete', () => {
                console.log("Common assets preloaded successfully");
            });
            
        } catch (error) {
            console.error("Error in preloadCommonAssets:", error);
        }
    }

    // Expose functions to global scope
    window.safePhaserImageLoad = safePhaserImageLoad;
    window.handleMissingTexture = handleMissingTexture;
    window.preloadCommonAssets = preloadCommonAssets;
    
})();