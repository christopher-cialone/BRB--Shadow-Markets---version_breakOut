/**
 * Fallback Textures Module
 * This module handles missing textures by creating fallbacks
 */

(function() {
    'use strict';
    
    /**
     * Create a fallback texture for missing assets
     * @param {Phaser.Scene} scene - The scene instance
     * @param {string} key - The texture key
     * @param {number} width - Width of the texture
     * @param {number} height - Height of the texture
     * @param {number} color - The fill color (hexadecimal) 
     */
    window.createFallbackTexture = function(scene, key, width = 64, height = 64, color = 0x333333) {
        console.log(`Creating fallback texture for ${key}`);
        
        try {
            // If the texture already exists, don't recreate it
            if (scene.textures.exists(key)) {
                console.log(`Texture ${key} already exists, skipping fallback creation`);
                return;
            }
            
            // Determine color based on texture type
            if (key.includes('empty')) {
                color = 0x333333; // Dark gray for empty cells
            } else if (key.includes('planted') || key.includes('growing')) {
                color = 0x4caf50; // Green for growing plants
            } else if (key.includes('harvest')) {
                color = 0xffc107; // Yellow/gold for harvestable
            } else if (key.includes('brewing')) {
                color = 0x9c27b0; // Purple for brewing
            } else if (key.includes('distill')) {
                color = 0x7c4dff; // Blue-purple for distilling
            } else if (key.includes('ready')) {
                color = 0xff4081; // Pink for ready items
            }
            
            // Create a graphics object
            const graphics = scene.make.graphics();
            
            // Draw a filled rectangle with a border
            graphics.fillStyle(color, 0.8);
            graphics.fillRect(0, 0, width, height);
            graphics.lineStyle(2, 0xffffff, 0.8);
            graphics.strokeRect(0, 0, width, height);
            
            // Add cell identifier text
            let text = key;
            if (text.length > 10) {
                text = text.substring(0, 10) + '...';
            }
            
            // Generate texture from the graphics object
            graphics.generateTexture(key, width, height);
            
            console.log(`Created fallback texture: ${key}`);
        } catch (error) {
            console.error(`Error creating fallback texture for ${key}:`, error);
        }
    };
    
    /**
     * Create all required fallback textures for the ranch grid
     * @param {Phaser.Scene} scene - The scene instance 
     */
    window.createRanchFallbackTextures = function(scene) {
        const ranchTextures = [
            { key: 'cell-empty', color: 0x333333 },
            { key: 'cell-planted', color: 0x5a9e3d },
            { key: 'cell-growing', color: 0x8bc34a },
            { key: 'cell-harvestable', color: 0xffc107 }
        ];
        
        ranchTextures.forEach(texture => {
            window.createFallbackTexture(scene, texture.key, 64, 64, texture.color);
        });
        
        console.log('Ranch fallback textures created');
    };
    
    /**
     * Create all required fallback textures for the shadow grid
     * @param {Phaser.Scene} scene - The scene instance
     */
    window.createShadowFallbackTextures = function(scene) {
        const shadowTextures = [
            { key: 'empty-night', color: 0x212121 },
            { key: 'brewing', color: 0x4a148c },
            { key: 'distilling', color: 0x7c4dff },
            { key: 'ready', color: 0xe040fb }
        ];
        
        shadowTextures.forEach(texture => {
            window.createFallbackTexture(scene, texture.key, 64, 64, texture.color);
        });
        
        console.log('Shadow fallback textures created');
    };
    
    // When Phaser has loaded, check for texture loading errors
    window.addEventListener('DOMContentLoaded', function() {
        // Wait for Phaser to be initialized
        const checkPhaser = setInterval(function() {
            if (window.game && window.game.scene) {
                clearInterval(checkPhaser);
                console.log('Fallback textures module ready');
            }
        }, 100);
    });
    
})();