/**
 * Game Enhancements Module
 * 
 * This module connects the animation and sound enhancements to the game.
 */

(function() {
    'use strict';
    
    // Wait for DOM and game to be ready
    document.addEventListener('DOMContentLoaded', () => {
        console.log("Initializing game enhancements");
        
        // Wait for Phaser game instance to be created
        document.addEventListener('game-ready', enhanceGame);
        
        // If game instance already exists, enhance it now
        if (window.game) {
            enhanceGame();
        }
    });
    
    /**
     * Apply enhancements to the game
     */
    function enhanceGame() {
        try {
            console.log("Applying neon theme and animation enhancements");
            
            // Enhanced Ranch Scene
            enhanceRanchScene();
            
            // Enhanced Saloon Scene
            enhanceSaloonScene();
            
            // Enhanced Night Scene
            enhanceNightScene();
            
            // Enhanced player progression
            enhancePlayerProgression();
            
            console.log("Game enhancements applied successfully");
        } catch (error) {
            console.error("Error applying game enhancements:", error);
        }
    }
    
    /**
     * Enhance the Ranch scene with neon effects and animations
     */
    function enhanceRanchScene() {
        try {
            // Get the Ranch scene if it exists
            const ranchScene = getSceneInstance('RanchScene');
            
            if (ranchScene) {
                // Store original methods to extend their functionality
                const originalAddCattleSprite = ranchScene.addCattleSprite;
                const originalMilkAllCattle = ranchScene.milkAllCattle;
                const originalCreateMilkAnimation = ranchScene.createMilkAnimation;
                
                // Enhance addCattleSprite to add bounce animation
                if (typeof originalAddCattleSprite === 'function') {
                    ranchScene.addCattleSprite = function(cattle) {
                        const cattleSprite = originalAddCattleSprite.call(this, cattle);
                        
                        // Add bounce animation to the newly created sprite
                        if (cattleSprite && typeof window.addCattleBounceAnimation === 'function') {
                            window.addCattleBounceAnimation(this, cattleSprite);
                        }
                        
                        return cattleSprite;
                    };
                    
                    console.log("Enhanced Ranch scene addCattleSprite with bounce animation");
                }
                
                // Enhance milkAllCattle to add particle effects
                if (typeof originalMilkAllCattle === 'function') {
                    ranchScene.milkAllCattle = function() {
                        const result = originalMilkAllCattle.call(this);
                        
                        // Create harvest effects for all cattle
                        if (this.cattleSprites && typeof window.createHarvestParticleEffect === 'function') {
                            Object.values(this.cattleSprites).forEach(sprite => {
                                if (sprite.x !== undefined && sprite.y !== undefined) {
                                    window.createHarvestParticleEffect(this, sprite.x, sprite.y);
                                }
                            });
                            
                            // Play enhanced harvest sound
                            if (typeof window.playSoundEffect === 'function') {
                                window.playSoundEffect('harvest', { volume: 0.8 });
                            }
                        }
                        
                        return result;
                    };
                    
                    console.log("Enhanced Ranch scene milkAllCattle with particle effects");
                }
                
                // Enhance milk animation with neon colors
                if (typeof originalCreateMilkAnimation === 'function') {
                    ranchScene.createMilkAnimation = function(cattleId, amount) {
                        const animation = originalCreateMilkAnimation.call(this, cattleId, amount);
                        
                        // Add neon glow to any text in the animation
                        if (animation && animation.text && typeof window.addTextGlow === 'function') {
                            window.addTextGlow(animation.text, '#00ffff', 8);
                        }
                        
                        return animation;
                    };
                    
                    console.log("Enhanced Ranch scene createMilkAnimation with neon glow");
                }
            }
        } catch (error) {
            console.error("Error enhancing Ranch scene:", error);
        }
    }
    
    /**
     * Enhance the Saloon scene with neon effects and animations
     */
    function enhanceSaloonScene() {
        try {
            // Get the Saloon scene if it exists
            const saloonScene = getSceneInstance('SaloonScene');
            
            if (saloonScene) {
                // Store original methods to extend their functionality
                const originalUpdateCardDisplay = saloonScene.updateCardDisplay;
                const originalUpdateRaceProgress = saloonScene.updateRaceProgress;
                
                // Replace the updateCardDisplay function with enhanced version
                if (typeof originalUpdateCardDisplay === 'function') {
                    saloonScene.updateCardDisplay = function(card) {
                        const cardElement = originalUpdateCardDisplay.call(this, card);
                        
                        // Add neon glow to card element
                        if (cardElement && cardElement.setText && typeof window.addTextGlow === 'function') {
                            window.addTextGlow(cardElement, getColorForSuit(card.suit), 6);
                        }
                        
                        return cardElement;
                    };
                    
                    console.log("Enhanced Saloon scene updateCardDisplay with neon glow");
                }
                
                // Replace the updateRaceProgress function with enhanced version
                if (typeof originalUpdateRaceProgress === 'function') {
                    saloonScene.updateRaceProgress = function(progress) {
                        const progressIndicator = originalUpdateRaceProgress.call(this, progress);
                        
                        // Check if a suit has reached 100% (race win)
                        if (progress && typeof window.createRaceWinParticleEffect === 'function') {
                            Object.entries(progress).forEach(([suit, value]) => {
                                if (value >= 100) {
                                    // Get the center of the game
                                    const x = this.game.config.width / 2;
                                    const y = this.game.config.height / 2;
                                    
                                    // Create winning effect
                                    window.createRaceWinParticleEffect(this, x, y);
                                    
                                    // Play winning sound with enhanced system
                                    if (typeof window.playRaceWinSound === 'function') {
                                        // Calculate winnings based on player bet and odds
                                        const betElement = document.getElementById(`${suit}-bet-display`);
                                        const bet = betElement ? parseInt(betElement.textContent || '0') : 0;
                                        
                                        // Get odds from display
                                        const oddsElement = document.getElementById(`${suit}-odds`);
                                        const oddsText = oddsElement ? oddsElement.textContent : '';
                                        const odds = parseFloat(oddsText.replace('x', '')) || 5;
                                        
                                        const winnings = Math.round(bet * odds);
                                        window.playRaceWinSound(winnings);
                                    }
                                }
                            });
                        }
                        
                        return progressIndicator;
                    };
                    
                    console.log("Enhanced Saloon scene updateRaceProgress with win effects");
                }
            }
        } catch (error) {
            console.error("Error enhancing Saloon scene:", error);
        }
    }
    
    /**
     * Enhance the Night scene with neon effects and animations
     */
    function enhanceNightScene() {
        try {
            // Get the Night scene if it exists
            const nightScene = getSceneInstance('NightScene');
            
            if (nightScene) {
                // Store original methods to extend their functionality
                const originalAddBrewingAnimation = nightScene.addBrewingAnimation;
                const originalAddGlowEffect = nightScene.addGlowEffect;
                
                // Enhance brewing animation
                if (typeof originalAddBrewingAnimation === 'function') {
                    nightScene.addBrewingAnimation = function(cellIndex) {
                        const animation = originalAddBrewingAnimation.call(this, cellIndex);
                        
                        // Get cell position for particle effect
                        const cell = this.gridCells && this.gridCells[cellIndex];
                        if (cell && cell.x !== undefined && cell.y !== undefined && 
                            typeof window.createHarvestParticleEffect === 'function') {
                            
                            // Use purple particles instead of green
                            window.createHarvestParticleEffect(this, cell.x, cell.y);
                            
                            // Add more dramatic lighting to the cell
                            if (typeof this.addGlowEffect === 'function') {
                                this.addGlowEffect(cellIndex, 0xff44cc, 0.8);
                            }
                        }
                        
                        return animation;
                    };
                    
                    console.log("Enhanced Night scene addBrewingAnimation with particle effects");
                }
                
                // Enhance glow effect
                if (typeof originalAddGlowEffect === 'function') {
                    nightScene.addGlowEffect = function(cellIndex, color = 0xff44cc, intensity = 0.6) {
                        // Call original with enhanced parameters
                        return originalAddGlowEffect.call(this, cellIndex, color, intensity);
                    };
                    
                    console.log("Enhanced Night scene addGlowEffect with stronger neon glow");
                }
            }
        } catch (error) {
            console.error("Error enhancing Night scene:", error);
        }
    }
    
    /**
     * Enhance player progression with sound effects
     */
    function enhancePlayerProgression() {
        try {
            // Enhance level up functionality
            if (typeof window.levelUpPlayer === 'function') {
                const originalLevelUpPlayer = window.levelUpPlayer;
                
                window.levelUpPlayer = function() {
                    const result = originalLevelUpPlayer.call(this);
                    
                    // Play level up sound with enhanced system
                    if (typeof window.playLevelUpSound === 'function' && 
                        typeof window.playerData === 'object' && 
                        window.playerData.level) {
                        
                        window.playLevelUpSound(window.playerData.level);
                    }
                    
                    return result;
                };
                
                console.log("Enhanced levelUpPlayer function with sound effects");
            }
            
            // Enhance win celebration with particle effects
            if (typeof window.showWinCelebration === 'function') {
                const originalShowWinCelebration = window.showWinCelebration;
                
                window.showWinCelebration = function(amount) {
                    const result = originalShowWinCelebration.call(this, amount);
                    
                    // Get active scene and add particle effect in the center
                    const scene = window.game && window.game.scene.getScenes(true)[0];
                    if (scene && typeof window.createRaceWinParticleEffect === 'function') {
                        const x = scene.game.config.width / 2;
                        const y = scene.game.config.height / 2;
                        
                        window.createRaceWinParticleEffect(scene, x, y);
                    }
                    
                    return result;
                };
                
                console.log("Enhanced showWinCelebration function with particle effects");
            }
        } catch (error) {
            console.error("Error enhancing player progression:", error);
        }
    }
    
    /**
     * Get a scene instance by name
     * @param {string} sceneName - The name of the scene to retrieve
     * @returns {Phaser.Scene|null} The scene instance or null if not found
     */
    function getSceneInstance(sceneName) {
        try {
            if (window.game && window.game.scene) {
                const scene = window.game.scene.getScene(sceneName);
                return scene;
            }
        } catch (error) {
            console.error(`Error getting scene ${sceneName}:`, error);
        }
        
        return null;
    }
    
    /**
     * Get color for a card suit
     * @param {string} suit - The card suit (♥, ♦, ♣, ♠)
     * @returns {string} The CSS color for the suit
     */
    function getColorForSuit(suit) {
        switch(suit) {
            case '♥': return '#ff2f5f'; // Hearts
            case '♦': return '#ffaf2f'; // Diamonds
            case '♣': return '#2fff7f'; // Clubs
            case '♠': return '#2f9fff'; // Spades
            default: return '#ffffff';  // Default
        }
    }
})();