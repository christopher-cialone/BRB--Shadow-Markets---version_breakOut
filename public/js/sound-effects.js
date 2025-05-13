/**
 * Sound Effects Manager for Bull Run Boost
 * 
 * This module handles loading and playing sound effects for the game.
 * It implements volume control and efficient audio asset loading.
 */

// Initialize the sound effects system
const SoundEffects = (function() {
    // Private variables
    let _sounds = {};
    let _volume = 0.5; // Default volume (0-1)
    let _enabled = true; // Sound enabled by default
    
    // Path to sound assets
    const SOUND_PATHS = {
        // Game actions
        harvest: 'sounds/harvest.mp3',
        distill: 'sounds/distill.mp3',
        win: 'sounds/win.mp3',
        lose: 'sounds/lose.mp3',
        bet: 'sounds/bet.mp3',
        card: 'sounds/card.mp3',
        
        // UI sounds
        click: 'sounds/click.mp3',
        hover: 'sounds/hover.mp3',
        
        // Achievement/progression sounds
        levelUp: 'sounds/level-up.mp3',
        achievement: 'sounds/achievement.mp3',
        
        // Ambient/background
        dayAmbient: 'sounds/day-ambient.mp3',
        nightAmbient: 'sounds/night-ambient.mp3'
    };
    
    /**
     * Preload all sound assets
     */
    function preloadSounds() {
        Object.keys(SOUND_PATHS).forEach(key => {
            loadSound(key, SOUND_PATHS[key]);
        });
    }
    
    /**
     * Load a single sound
     * @param {string} name - Sound identifier
     * @param {string} path - Path to sound file
     */
    function loadSound(name, path) {
        try {
            const audio = new Audio(path);
            audio.volume = _volume;
            _sounds[name] = audio;
            
            // Preload the audio
            audio.load();
            
            console.log(`Loaded sound: ${name}`);
        } catch (error) {
            console.error(`Error loading sound ${name} from ${path}:`, error);
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} name - Name of the sound to play
     * @param {Object} options - Optional settings
     * @param {number} options.volume - Override default volume (0-1)
     * @param {boolean} options.loop - Whether to loop the sound
     */
    function playSound(name, options = {}) {
        // If sound is disabled, do nothing
        if (!_enabled) return;
        
        // Get the sound
        const sound = _sounds[name];
        
        // If sound doesn't exist, try to load it
        if (!sound && SOUND_PATHS[name]) {
            loadSound(name, SOUND_PATHS[name]);
            console.warn(`Sound ${name} wasn't preloaded, loading now`);
            // Exit early, sound will be ready for next time
            return;
        }
        
        // If sound still doesn't exist, exit
        if (!sound) {
            console.warn(`Sound ${name} not found`);
            return;
        }
        
        try {
            // Reset the sound if it's playing
            sound.pause();
            sound.currentTime = 0;
            
            // Apply options
            sound.volume = options.volume !== undefined ? options.volume : _volume;
            sound.loop = options.loop || false;
            
            // Play the sound
            sound.play().catch(error => {
                console.warn(`Error playing sound ${name}: ${error.message}`);
            });
        } catch (error) {
            console.error(`Error playing sound ${name}:`, error);
        }
    }
    
    /**
     * Set the global volume for all sounds
     * @param {number} volume - Volume level (0-1)
     */
    function setVolume(volume) {
        // Ensure volume is between 0 and 1
        _volume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all loaded sounds
        Object.values(_sounds).forEach(sound => {
            sound.volume = _volume;
        });
        
        // Save to localStorage
        try {
            localStorage.setItem('soundVolume', _volume);
        } catch (error) {
            console.error('Error saving sound volume:', error);
        }
    }
    
    /**
     * Enable or disable all sounds
     * @param {boolean} enabled - Whether sounds should be enabled
     */
    function setEnabled(enabled) {
        _enabled = enabled;
        
        // Stop all currently playing sounds if disabled
        if (!_enabled) {
            Object.values(_sounds).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('soundEnabled', _enabled);
        } catch (error) {
            console.error('Error saving sound enabled state:', error);
        }
    }
    
    /**
     * Load user preferences from localStorage
     */
    function loadPreferences() {
        try {
            // Load volume
            const savedVolume = localStorage.getItem('soundVolume');
            if (savedVolume !== null) {
                _volume = parseFloat(savedVolume);
            }
            
            // Load enabled state
            const savedEnabled = localStorage.getItem('soundEnabled');
            if (savedEnabled !== null) {
                _enabled = savedEnabled === 'true';
            }
        } catch (error) {
            console.error('Error loading sound preferences:', error);
        }
    }
    
    // Initialize when script loads
    function init() {
        loadPreferences();
        preloadSounds();
        console.log('Sound system initialized');
    }
    
    // Return public API
    return {
        init,
        play: playSound,
        setVolume,
        setEnabled,
        getVolume: () => _volume,
        isEnabled: () => _enabled
    };
})();

// Initialize the sound system when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    SoundEffects.init();
    
    // Make SoundEffects available globally
    window.SoundEffects = SoundEffects;
});