/**
 * Player Progression System for Bull Run Boost
 * 
 * Features:
 * - XP and Level system with rewards
 * - Achievement system with progress tracking
 * - Sound effects for achievements and level ups
 */

// Initialize player progression data if not exists
function initializePlayerProgression() {
    // Check if playerData exists
    if (!window.playerData) {
        window.playerData = {};
    }
    
    // Initialize XP and level data if not exists
    if (!playerData.level) {
        playerData.level = 1;
        playerData.xp = 0;
        playerData.xpToNextLevel = 100; // XP required for each level
    }
    
    // Initialize achievements if not exists
    if (!playerData.achievements) {
        playerData.achievements = {
            farmer: { 
                id: 'farmer',
                title: 'Master Rancher',
                description: 'Harvest 10 crops from your ranch',
                progress: 0,
                target: 10,
                unlocked: false,
                reward: 100 // $CATTLE reward
            },
            alchemist: { 
                id: 'alchemist',
                title: 'Shadow Alchemist',
                description: 'Distill 5 potions in the shadow market',
                progress: 0,
                target: 5,
                unlocked: false,
                reward: 100
            },
            gambler: { 
                id: 'gambler',
                title: 'Card Shark',
                description: 'Win 3 races at the saloon',
                progress: 0,
                target: 3,
                unlocked: false,
                reward: 100
            }
        };
    }
    
    // Initialize stats for the player if they don't exist
    if (!playerData.stats) {
        playerData.stats = {
            cropHarvested: 0,
            potionsDistilled: 0,
            racesWon: 0,
            racesLost: 0,
            totalEarned: 0,
            totalBurned: 0
        };
    }
}

/**
 * Add XP to the player
 * @param {number} amount - The amount of XP to add
 */
function addPlayerXP(amount) {
    // Initialize if needed
    if (!playerData.xp) {
        initializePlayerProgression();
    }
    
    // Add XP
    playerData.xp += amount;
    console.log(`Added ${amount} XP. Total: ${playerData.xp}`);
    
    // Check for level up
    checkLevelUp();
    
    // Update UI
    updateXPDisplay();
    
    // Save player data
    savePlayerData();
}

/**
 * Check if player has enough XP to level up
 */
function checkLevelUp() {
    while (playerData.xp >= playerData.xpToNextLevel) {
        levelUpPlayer();
    }
}

/**
 * Level up the player and grant rewards
 */
function levelUpPlayer() {
    // Subtract XP for this level
    playerData.xp -= playerData.xpToNextLevel;
    
    // Increase level
    playerData.level++;
    
    // Give level up rewards - $CATTLE and multiplier increase
    const cattleReward = 50;
    const multiplierIncrease = 0.1;
    
    // Add $CATTLE to the player
    if (typeof addCattle === 'function') {
        addCattle(cattleReward);
    } else {
        console.log('addCattle function not available');
        // Fallback: add directly to playerData if exists
        if (playerData.cattle) {
            playerData.cattle += cattleReward;
        }
    }
    
    // Increase grid multipliers
    if (playerData.ranchMultiplier) {
        playerData.ranchMultiplier += multiplierIncrease;
    }
    if (playerData.shadowMultiplier) {
        playerData.shadowMultiplier += multiplierIncrease;
    }
    
    // Play level up sound
    playSoundEffect('levelUp');
    
    // Show level up notification
    showNotification(`Level Up! You're now level ${playerData.level}. Received ${cattleReward} $CATTLE and +${multiplierIncrease} multiplier increase.`, 'success');
    
    console.log(`Level up to ${playerData.level}! Rewarded ${cattleReward} $CATTLE and ${multiplierIncrease} multiplier boost`);
    
    // Save the player data
    savePlayerData();
}

/**
 * Update the XP display in the Profile UI
 */
function updateXPDisplay() {
    // Update level value
    const levelValueElement = document.getElementById('level-value');
    if (levelValueElement) {
        levelValueElement.textContent = playerData.level;
    }
    
    // Update XP text
    const xpValueElement = document.getElementById('xp-value');
    if (xpValueElement) {
        xpValueElement.textContent = `${playerData.xp} / ${playerData.xpToNextLevel}`;
    }
    
    // Update XP progress bar
    const xpProgressBar = document.getElementById('xp-progress-bar');
    if (xpProgressBar) {
        const progressPercentage = (playerData.xp / playerData.xpToNextLevel) * 100;
        xpProgressBar.style.width = `${progressPercentage}%`;
    }
}

/**
 * Check if any achievements should be unlocked based on player stats
 */
function checkAchievements() {
    if (!playerData.achievements) {
        initializePlayerProgression();
        return;
    }
    
    // Check Farmer achievement progress
    const farmerAchievement = playerData.achievements.farmer;
    if (!farmerAchievement.unlocked && playerData.stats.cropHarvested >= farmerAchievement.target) {
        unlockAchievement('farmer');
    } else if (!farmerAchievement.unlocked) {
        farmerAchievement.progress = playerData.stats.cropHarvested;
    }
    
    // Check Alchemist achievement progress
    const alchemistAchievement = playerData.achievements.alchemist;
    if (!alchemistAchievement.unlocked && playerData.stats.potionsDistilled >= alchemistAchievement.target) {
        unlockAchievement('alchemist');
    } else if (!alchemistAchievement.unlocked) {
        alchemistAchievement.progress = playerData.stats.potionsDistilled;
    }
    
    // Check Gambler achievement progress
    const gamblerAchievement = playerData.achievements.gambler;
    if (!gamblerAchievement.unlocked && playerData.stats.racesWon >= gamblerAchievement.target) {
        unlockAchievement('gambler');
    } else if (!gamblerAchievement.unlocked) {
        gamblerAchievement.progress = playerData.stats.racesWon;
    }
    
    // Update the achievement display
    updateAchievementsDisplay();
    
    // Save player data
    savePlayerData();
}

/**
 * Unlock an achievement and grant rewards
 * @param {string} achievementId - The ID of the achievement to unlock
 */
function unlockAchievement(achievementId) {
    if (!playerData.achievements[achievementId]) {
        console.error(`Achievement ${achievementId} does not exist`);
        return;
    }
    
    // Get the achievement
    const achievement = playerData.achievements[achievementId];
    
    // Check if already unlocked
    if (achievement.unlocked) {
        return;
    }
    
    // Unlock the achievement
    achievement.unlocked = true;
    achievement.progress = achievement.target;
    
    // Grant the reward
    const reward = achievement.reward;
    
    // Add $CATTLE to the player
    if (typeof addCattle === 'function') {
        addCattle(reward);
    } else {
        console.log('addCattle function not available');
        // Fallback: add directly to playerData if exists
        if (playerData.cattle) {
            playerData.cattle += reward;
        }
    }
    
    // Play achievement sound
    playSoundEffect('achievement');
    
    // Show achievement notification
    showNotification(`Achievement Unlocked: ${achievement.title}! Received ${reward} $CATTLE.`, 'success');
    
    console.log(`Unlocked achievement: ${achievement.title}. Rewarded ${reward} $CATTLE`);
    
    // Save player data
    savePlayerData();
}

/**
 * Update the achievements display in the Profile UI
 */
function updateAchievementsDisplay() {
    const achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) {
        return;
    }
    
    // Clear the container
    achievementsContainer.innerHTML = '';
    
    // Add each achievement to the container
    for (const key in playerData.achievements) {
        const achievement = playerData.achievements[key];
        
        // Create achievement element
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        // Add achievement content
        achievementElement.innerHTML = `
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-progress">Progress: ${achievement.progress}/${achievement.target}</div>
            <div class="achievement-reward">Reward: ${achievement.reward} $CATTLE</div>
        `;
        
        // Add to container
        achievementsContainer.appendChild(achievementElement);
    }
}

/**
 * Play a sound effect
 * @param {string} soundName - The name of the sound to play
 */
function playSoundEffect(soundName) {
    // Check if soundEffects object exists
    if (!window.soundEffects) {
        window.soundEffects = {};
    }
    
    // Define sound paths if not already defined
    if (!window.soundPaths) {
        window.soundPaths = {
            harvest: 'sounds/harvest.mp3',
            distill: 'sounds/distill.mp3',
            win: 'sounds/win.mp3',
            levelUp: 'sounds/level-up.mp3',
            achievement: 'sounds/achievement.mp3'
        };
    }
    
    // Try to get the sound
    let sound = soundEffects[soundName];
    
    // If sound doesn't exist, create it
    if (!sound && window.soundPaths[soundName]) {
        sound = new Audio(window.soundPaths[soundName]);
        soundEffects[soundName] = sound;
    }
    
    // Play the sound if it exists
    if (sound) {
        // Reset the sound if it's playing
        sound.pause();
        sound.currentTime = 0;
        
        // Play the sound
        sound.play().catch(error => {
            console.log(`Error playing sound ${soundName}: ${error.message}`);
        });
    } else {
        console.log(`Sound ${soundName} not found`);
    }
}

// Utility functions for tracking gameplay stats and updating achievements

/**
 * Track a crop harvest and update stats/achievements
 */
function trackCropHarvest() {
    // Increment stats
    playerData.stats.cropHarvested++;
    
    // Add XP (10 XP per harvest)
    addPlayerXP(10);
    
    // Check achievements
    checkAchievements();
    
    // Save player data
    savePlayerData();
}

/**
 * Track a potion distillation and update stats/achievements
 */
function trackPotionDistill() {
    // Increment stats
    playerData.stats.potionsDistilled++;
    
    // Add XP (20 XP per distill)
    addPlayerXP(20);
    
    // Check achievements
    checkAchievements();
    
    // Save player data
    savePlayerData();
}

/**
 * Track a race win and update stats/achievements
 */
function trackRaceWin() {
    // Increment stats
    playerData.stats.racesWon++;
    
    // Add XP (30 XP per win)
    addPlayerXP(30);
    
    // Check achievements
    checkAchievements();
    
    // Save player data
    savePlayerData();
}

/**
 * Track a race loss and update stats
 */
function trackRaceLoss() {
    // Increment stats
    playerData.stats.racesLost++;
    
    // Save player data
    savePlayerData();
}

/**
 * Save player data to localStorage
 */
function savePlayerData() {
    try {
        localStorage.setItem('playerData', JSON.stringify(playerData));
    } catch (error) {
        console.error('Error saving player data:', error);
    }
}

/**
 * Load player data from localStorage
 */
function loadPlayerData() {
    try {
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Merge data with current playerData
            window.playerData = { ...window.playerData, ...parsedData };
        }
    } catch (error) {
        console.error('Error loading player data:', error);
    }
}

// Initialize on script load
document.addEventListener('DOMContentLoaded', function() {
    // Load player data from localStorage
    loadPlayerData();
    
    // Initialize player progression
    initializePlayerProgression();
    
    // Update displays
    updateXPDisplay();
    updateAchievementsDisplay();
});