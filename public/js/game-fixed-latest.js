/**
 * Main Game Module
 * 
 * This module contains the core game logic and UI handlers.
 * It's simplified to remove syntax errors and improve structure.
 */

(function() {
    'use strict';
    
    // Game state
    let playerData = {
        name: 'Cowboy',
        archetype: 'Entrepreneur',
        characterType: 'the-kid',
        cattleBalance: 100,
        hay: 100,
        water: 100,
        ether: 0,
        barnCapacity: 100,
        cattle: [],
        potionCollection: [],
        // Added progression system - Level and XP
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        stats: {
            cattleBred: 0,
            cropsHarvested: 0,
            potionsDistilled: 0,
            racesWon: 0
        },
        achievements: []
    };
    
    // Market data
    let marketPrice = 10;
    
    /**
     * Add XP to the player's progression
     */
    function addPlayerXP(amount) {
        if (!amount || amount <= 0) return;
        
        // Add XP
        playerData.xp += amount;
        console.log(`Added ${amount} XP! Total: ${playerData.xp}`);
        
        // Check for level up
        if (playerData.xp >= playerData.xpToNextLevel) {
            levelUpPlayer();
        }
        
        // Update UI
        updateXPDisplay();
        
        // Check for any newly achieved accomplishments
        checkAchievements();
    }
    
    /**
     * Level up the player with rewards
     */
    function levelUpPlayer() {
        // Update level
        playerData.level++;
        
        // Reset XP for next level
        playerData.xp = playerData.xp - playerData.xpToNextLevel;
        
        // Reward cattle for leveling up
        playerData.cattleBalance += 50;
        
        // Show level up celebration
        showNotification(`Level Up! You are now level ${playerData.level}`, 'success');
        
        console.log(`Leveled up to ${playerData.level}!`);
        
        // Play level up sound
        playSoundEffect('levelUp');
    }
    
    /**
     * Update the XP display in the UI
     */
    function updateXPDisplay() {
        // Update level display
        const levelDisplay = document.getElementById('player-level');
        if (levelDisplay) {
            levelDisplay.textContent = playerData.level;
        }
        
        // Update XP bar
        const xpBar = document.getElementById('xp-bar-fill');
        if (xpBar) {
            const percentage = (playerData.xp / playerData.xpToNextLevel) * 100;
            xpBar.style.width = `${percentage}%`;
        }
        
        // Update XP text
        const xpText = document.getElementById('xp-text');
        if (xpText) {
            xpText.textContent = `${playerData.xp}/${playerData.xpToNextLevel} XP`;
        }
    }
    
    /**
     * Check for achievement completion
     */
    function checkAchievements() {
        const achievements = [
            {
                id: 'farmer',
                name: 'Farmer',
                description: 'Harvest 10 crops',
                condition: () => playerData.stats.cropsHarvested >= 10,
                reward: 100
            },
            {
                id: 'alchemist',
                name: 'Alchemist',
                description: 'Distill 5 potions',
                condition: () => playerData.stats.potionsDistilled >= 5,
                reward: 100
            },
            {
                id: 'gambler',
                name: 'Gambler',
                description: 'Win 3 races',
                condition: () => playerData.stats.racesWon >= 3,
                reward: 100
            }
        ];
        
        // Check each achievement
        achievements.forEach(achievement => {
            // Skip if already unlocked
            if (playerData.achievements.includes(achievement.id)) return;
            
            // Check if condition is met
            if (achievement.condition()) {
                unlockAchievement(achievement);
            }
        });
    }
    
    /**
     * Unlock an achievement and give rewards
     */
    function unlockAchievement(achievement) {
        // Add to player's achieved list
        playerData.achievements.push(achievement.id);
        
        // Give reward
        playerData.cattleBalance += achievement.reward;
        
        // Show notification
        showNotification(`Achievement Unlocked: ${achievement.name}`, 'achievement');
        
        // Play achievement sound
        playSoundEffect('achievement');
        
        console.log(`Achievement unlocked: ${achievement.name}`);
        
        // Update achievements display
        updateAchievementsDisplay();
    }
    
    /**
     * Update the achievements display in the UI
     */
    function updateAchievementsDisplay() {
        const achievementsContainer = document.getElementById('achievements-list');
        if (!achievementsContainer) return;
        
        // Clear existing achievements
        achievementsContainer.innerHTML = '';
        
        // Get all achievements
        const allAchievements = [
            {
                id: 'farmer',
                name: 'Farmer',
                description: 'Harvest 10 crops',
                reward: 100
            },
            {
                id: 'alchemist',
                name: 'Alchemist',
                description: 'Distill 5 potions',
                reward: 100
            },
            {
                id: 'gambler',
                name: 'Gambler',
                description: 'Win 3 races',
                reward: 100
            }
        ];
        
        // Add each achievement
        allAchievements.forEach(achievement => {
            // Create achievement element
            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement';
            
            // Add unlocked class if achieved
            if (playerData.achievements.includes(achievement.id)) {
                achievementElement.classList.add('unlocked');
            }
            
            // Create title
            const title = document.createElement('div');
            title.className = 'achievement-title';
            title.textContent = achievement.name;
            
            // Create description
            const description = document.createElement('div');
            description.className = 'achievement-description';
            description.textContent = achievement.description;
            
            // Create reward
            const reward = document.createElement('div');
            reward.className = 'achievement-reward';
            reward.textContent = `Reward: ${achievement.reward} $CATTLE`;
            
            // Add to achievement element
            achievementElement.appendChild(title);
            achievementElement.appendChild(description);
            achievementElement.appendChild(reward);
            
            // Add to container
            achievementsContainer.appendChild(achievementElement);
        });
    }
    
    /**
     * Play a sound effect
     */
    function playSoundEffect(soundName) {
        try {
            const sound = document.getElementById(`sound-${soundName}`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(error => {
                    console.warn(`Failed to play ${soundName} sound:`, error);
                });
            } else {
                console.warn(`Sound not found: ${soundName}`);
            }
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
        }
    }
    
    // Wait for the DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM Content Loaded - Setting up event listeners");
        
        // UI event listeners
        const startGameBtn = document.getElementById('start-game');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                // Get player name
                const playerNameInput = document.getElementById('player-name');
                if (playerNameInput) {
                    playerData.name = playerNameInput.value || 'Cowboy';
                }
                
                // Get character type
                const characterType = document.querySelector('input[name="character-type"]:checked');
                if (characterType) {
                    playerData.characterType = characterType.value;
                }
                
                // Get archetype
                const archetype = document.querySelector('input[name="archetype"]:checked');
                if (archetype) {
                    playerData.archetype = archetype.value;
                }
                
                console.log(`Starting game as ${playerData.name} (${playerData.characterType}) - ${playerData.archetype}`);
                
                // Switch to main game scene
                if (window.game && typeof window.switchScene === 'function') {
                    window.switchScene('RanchScene');
                } else {
                    console.error("Game instance or switchScene function not found");
                    showNotification("Error starting game", "error");
                }
            });
        }
        
        // Initialize the XP display
        updateXPDisplay();
        
        // Initialize achievements display
        updateAchievementsDisplay();
        
        console.log("Game initialized");
    });
    
    // Expose functions to global scope
    window.addPlayerXP = addPlayerXP;
    window.levelUpPlayer = levelUpPlayer;
    window.checkAchievements = checkAchievements;
    window.playSoundEffect = playSoundEffect;
    window.playerData = playerData;
    
})();