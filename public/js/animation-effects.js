/**
 * Animation Effects Module
 * 
 * This module implements the neon-themed animations and particle effects for the game.
 */

(function() {
    'use strict';
    
    /**
     * Apply bounce animation to cattle sprites
     * @param {Phaser.Scene} scene - The scene containing the cattle
     * @param {Phaser.GameObjects.Sprite} cattleSprite - The cattle sprite to animate
     */
    function addCattleBounceAnimation(scene, cattleSprite) {
        if (!scene || !cattleSprite) return;
        
        try {
            // Apply a gentle bounce animation
            scene.tweens.add({
                targets: cattleSprite,
                y: '-=10', // Move up by 10 pixels
                duration: 500,
                yoyo: true, // Return to original position
                repeat: -1, // Repeat indefinitely
                ease: 'Sine.easeInOut'
            });
            
            console.log(`Added bounce animation to cattle sprite: ${cattleSprite.name || 'unnamed'}`);
        } catch (error) {
            console.error("Error adding cattle bounce animation:", error);
        }
    }
    
    /**
     * Create a particle effect for harvesting
     * @param {Phaser.Scene} scene - The scene where the effect should appear
     * @param {number} x - X position of the effect
     * @param {number} y - Y position of the effect
     */
    function createHarvestParticleEffect(scene, x, y) {
        if (!scene) return;
        
        try {
            // Create a particle emitter for harvest effect (green particles)
            const particles = scene.add.particles('particle');
            
            // If the particle texture doesn't exist, create it
            if (!scene.textures.exists('particle')) {
                createParticleTexture(scene, 'particle', 0x00ff99); // Mint green
            }
            
            const emitter = particles.createEmitter({
                x: x,
                y: y,
                speed: { min: 100, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0 },
                blendMode: 'ADD',
                lifespan: 800,
                quantity: 20
            });
            
            // Auto-destroy after the effect completes
            scene.time.delayedCall(1000, () => {
                emitter.stop();
                scene.time.delayedCall(800, () => {
                    particles.destroy();
                });
            });
            
            console.log(`Created harvest particle effect at (${x}, ${y})`);
        } catch (error) {
            console.error("Error creating harvest particle effect:", error);
        }
    }
    
    /**
     * Create a particle effect for race win
     * @param {Phaser.Scene} scene - The scene where the effect should appear
     * @param {number} x - X position of the effect
     * @param {number} y - Y position of the effect
     */
    function createRaceWinParticleEffect(scene, x, y) {
        if (!scene) return;
        
        try {
            // Create a particle emitter for win effect (gold particles)
            const particles = scene.add.particles('gold-particle');
            
            // If the particle texture doesn't exist, create it
            if (!scene.textures.exists('gold-particle')) {
                createParticleTexture(scene, 'gold-particle', 0xFFD700); // Gold
            }
            
            const emitter = particles.createEmitter({
                x: x,
                y: y,
                speed: { min: 150, max: 300 },
                angle: { min: 230, max: 310 }, // Mostly upward
                scale: { start: 0.8, end: 0 },
                blendMode: 'ADD',
                lifespan: 1500,
                quantity: 40,
                frequency: 100, // Emit every 100ms
                tint: [0xFFD700, 0xFFA500, 0xFFFF00] // Gold, orange, yellow
            });
            
            // Auto-destroy after the effect completes
            scene.time.delayedCall(2000, () => {
                emitter.stop();
                scene.time.delayedCall(1500, () => {
                    particles.destroy();
                });
            });
            
            console.log(`Created race win particle effect at (${x}, ${y})`);
        } catch (error) {
            console.error("Error creating race win particle effect:", error);
        }
    }
    
    /**
     * Create a particle texture if it doesn't exist
     * @param {Phaser.Scene} scene - The scene where the texture should be created
     * @param {string} key - The texture key
     * @param {number} color - The color of the particle (in hex)
     */
    function createParticleTexture(scene, key, color) {
        try {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            
            // Draw a glowing circle
            graphics.fillStyle(color, 1);
            graphics.fillCircle(8, 8, 8);
            
            // Add a glow
            graphics.fillStyle(color, 0.5);
            graphics.fillCircle(8, 8, 12);
            graphics.fillStyle(color, 0.3);
            graphics.fillCircle(8, 8, 16);
            
            // Generate texture
            graphics.generateTexture(key, 32, 32);
            
            console.log(`Created particle texture: ${key}`);
            return true;
        } catch (error) {
            console.error(`Error creating particle texture ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Add glow effect to Phaser text
     * @param {Phaser.GameObjects.Text} textObject - The text object to enhance
     * @param {string} color - CSS color for the glow
     * @param {number} distance - Glow distance
     */
    function addTextGlow(textObject, color = '#ff44cc', distance = 5) {
        if (!textObject) return;
        
        try {
            textObject.setShadow(0, 0, color, distance);
            console.log(`Added glow effect to text: ${textObject.text}`);
        } catch (error) {
            console.error("Error adding text glow:", error);
        }
    }
    
    // Expose functions to global scope
    window.addCattleBounceAnimation = addCattleBounceAnimation;
    window.createHarvestParticleEffect = createHarvestParticleEffect;
    window.createRaceWinParticleEffect = createRaceWinParticleEffect;
    window.addTextGlow = addTextGlow;
    
})();