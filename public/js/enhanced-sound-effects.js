/**
 * Enhanced Sound Effects Module
 * 
 * This module provides expanded sound effect capabilities with 
 * robust fallbacks and multiple sound options.
 */

(function() {
    'use strict';
    
    // Track loaded sounds
    const loadedSounds = {};
    
    // Define sounds with paths and fallbacks
    const soundDefinitions = {
        'harvest': { 
            path: 'sounds/harvest.mp3',
            fallbackPath: 'sounds/beep-high.mp3'
        },
        'distill': { 
            path: 'sounds/distill.mp3',
            fallbackPath: 'sounds/beep-synth.mp3'
        },
        'win': { 
            path: 'sounds/win.mp3',
            fallbackPath: 'sounds/chime-win.mp3'
        },
        'lose': { 
            path: 'sounds/lose.mp3',
            fallbackPath: 'sounds/tone-low.mp3'
        },
        'bet': { 
            path: 'sounds/bet.mp3',
            fallbackPath: 'sounds/click.mp3'
        },
        'card': { 
            path: 'sounds/card.mp3',
            fallbackPath: 'sounds/swish.mp3'
        },
        'click': { 
            path: 'sounds/click.mp3',
            fallbackPath: 'sounds/tap.mp3'
        },
        'hover': { 
            path: 'sounds/hover.mp3',
            fallbackPath: 'sounds/tick.mp3'
        },
        'levelUp': { 
            path: 'sounds/levelUp.mp3',
            fallbackPath: 'sounds/achievement-up.mp3'
        },
        'achievement': { 
            path: 'sounds/achievement.mp3',
            fallbackPath: 'sounds/tada.mp3'
        },
        'raceWin': { 
            path: 'sounds/raceWin.mp3',
            fallbackPath: 'sounds/win.mp3'
        },
        'dayAmbient': { 
            path: 'sounds/dayAmbient.mp3',
            fallbackPath: 'sounds/ambient-day.mp3'
        },
        'nightAmbient': { 
            path: 'sounds/nightAmbient.mp3',
            fallbackPath: 'sounds/ambient-night.mp3'
        }
    };
    
    /**
     * Initialize sound system and preload sounds
     */
    function initSoundSystem() {
        try {
            // Create audio elements for all sounds
            Object.keys(soundDefinitions).forEach(soundName => {
                const soundDef = soundDefinitions[soundName];
                
                // Try to create audio with primary path
                let sound = document.getElementById(`sound-${soundName}`);
                if (!sound) {
                    sound = document.createElement('audio');
                    sound.id = `sound-${soundName}`;
                    sound.preload = 'auto';
                    
                    // Create source elements
                    const source = document.createElement('source');
                    source.src = soundDef.path;
                    sound.appendChild(source);
                    
                    // Add fallback source if available
                    if (soundDef.fallbackPath) {
                        const fallbackSource = document.createElement('source');
                        fallbackSource.src = soundDef.fallbackPath;
                        sound.appendChild(fallbackSource);
                    }
                    
                    // Add to DOM but keep hidden
                    sound.style.display = 'none';
                    document.body.appendChild(sound);
                    
                    // Handle load error
                    sound.addEventListener('error', () => {
                        console.warn(`Failed to load sound: ${soundName}`);
                        createFallbackSound(soundName);
                    });
                    
                    // Track successful load
                    sound.addEventListener('canplaythrough', () => {
                        console.log(`Loaded sound: ${soundName}`);
                        loadedSounds[soundName] = true;
                    });
                }
            });
            
            console.log("Sound system initialized");
        } catch (error) {
            console.error("Error initializing sound system:", error);
        }
    }
    
    /**
     * Create a fallback sound using the Web Audio API if HTML Audio fails
     * @param {string} soundName - The name of the sound to create
     */
    function createFallbackSound(soundName) {
        try {
            // Define simple beep tone parameters based on sound type
            let frequency = 440; // Default A note
            let duration = 0.3;  // Default duration in seconds
            
            switch(soundName) {
                case 'levelUp':
                    // Rising tone for level up
                    playToneSequence([330, 392, 440, 494, 523], 0.1);
                    break;
                    
                case 'win':
                case 'raceWin':
                    // Major chord for wins
                    playToneSequence([440, 554, 659], 0.2, true);
                    break;
                    
                case 'lose':
                    // Minor chord for loss
                    playToneSequence([440, 523, 659], 0.2, true, 'down');
                    break;
                    
                case 'achievement':
                    // Fanfare for achievement
                    playToneSequence([392, 440, 494, 523, 587, 659, 784], 0.1);
                    break;
                    
                case 'harvest':
                    frequency = 660;
                    duration = 0.2;
                    playSimpleTone(frequency, duration);
                    break;
                    
                case 'distill':
                    frequency = 880;
                    duration = 0.2;
                    playSimpleTone(frequency, duration);
                    break;
                    
                case 'click':
                    frequency = 1200;
                    duration = 0.05;
                    playSimpleTone(frequency, duration);
                    break;
                    
                default:
                    // Default simple beep
                    playSimpleTone(frequency, duration);
            }
            
            console.log(`Created fallback sound for: ${soundName}`);
        } catch (error) {
            console.error(`Error creating fallback sound for ${soundName}:`, error);
        }
    }
    
    /**
     * Play a simple tone using Web Audio API
     * @param {number} frequency - The frequency of the tone in Hz
     * @param {number} duration - The duration of the tone in seconds
     */
    function playSimpleTone(frequency, duration) {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            // Create oscillator and gain nodes
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            // Configure oscillator
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            
            // Configure gain (volume) with slight fade in/out
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
            
            // Connect the nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // Play the tone
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (error) {
            console.error("Error playing tone:", error);
        }
    }
    
    /**
     * Play a sequence of tones
     * @param {Array<number>} frequencies - Array of frequencies to play in sequence
     * @param {number} noteDuration - Duration of each note in seconds
     * @param {boolean} chord - Whether to play as a chord (simultaneous) or sequence
     * @param {string} direction - Direction of playback ('up' or 'down')
     */
    function playToneSequence(frequencies, noteDuration, chord = false, direction = 'up') {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            // Reverse the array if direction is down
            if (direction === 'down') {
                frequencies = [...frequencies].reverse();
            }
            
            // Play as chord (all notes at once)
            if (chord) {
                frequencies.forEach(frequency => {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.value = frequency;
                    
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.2 / frequencies.length, audioCtx.currentTime + 0.01);
                    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + noteDuration * 2);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + noteDuration * 2);
                });
            } 
            // Play as sequence (one note after another)
            else {
                frequencies.forEach((frequency, index) => {
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.value = frequency;
                    
                    const startTime = audioCtx.currentTime + (index * noteDuration);
                    
                    gainNode.gain.setValueAtTime(0, startTime);
                    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
                    gainNode.gain.linearRampToValueAtTime(0, startTime + noteDuration);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    oscillator.start(startTime);
                    oscillator.stop(startTime + noteDuration);
                });
            }
        } catch (error) {
            console.error("Error playing tone sequence:", error);
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} soundName - The name of the sound to play
     * @param {object} options - Options like volume, rate, etc.
     */
    function playSoundEffect(soundName, options = {}) {
        try {
            const sound = document.getElementById(`sound-${soundName}`);
            
            if (sound) {
                // Reset sound position
                sound.currentTime = 0;
                
                // Apply any options
                if (options.volume !== undefined) sound.volume = options.volume;
                if (options.playbackRate !== undefined) sound.playbackRate = options.playbackRate;
                
                // Play the sound
                sound.play().catch(error => {
                    console.warn(`Failed to play ${soundName} sound:`, error);
                    // Try fallback
                    createFallbackSound(soundName);
                });
                
                return true;
            } else {
                console.warn(`Sound not found: ${soundName}`);
                // Try to create a fallback
                createFallbackSound(soundName);
                return false;
            }
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
            return false;
        }
    }
    
    /**
     * Play sound when player levels up
     * @param {number} level - The new level reached
     */
    function playLevelUpSound(level) {
        // Play level up sound with increased pitch for higher levels
        const options = {
            volume: 0.8,
            playbackRate: Math.min(1 + (level / 100), 2.0) // Gradual pitch increase with level, max 2x
        };
        
        playSoundEffect('levelUp', options);
        console.log(`Played level up sound for level ${level}`);
    }
    
    /**
     * Play sound for race win with win amount affecting the sound
     * @param {number} winAmount - How much the player won
     */
    function playRaceWinSound(winAmount) {
        // Bigger wins get louder and higher pitched sounds
        const normalizedAmount = Math.min(winAmount / 100, 3);
        const options = {
            volume: Math.min(0.6 + (normalizedAmount * 0.3), 1.0),
            playbackRate: Math.min(1 + (normalizedAmount * 0.3), 1.8)
        };
        
        playSoundEffect('raceWin', options);
        console.log(`Played race win sound for win amount ${winAmount}`);
    }
    
    // Initialize sound system when module loads
    initSoundSystem();
    
    // Expose functions to global scope
    window.enhancedPlaySoundEffect = playSoundEffect;
    window.playLevelUpSound = playLevelUpSound;
    window.playRaceWinSound = playRaceWinSound;
    
    // Replace the original playSoundEffect function if it exists
    if (typeof window.playSoundEffect === 'function') {
        const originalPlaySoundEffect = window.playSoundEffect;
        window.playSoundEffect = function(soundName, options) {
            // Try enhanced version first
            const result = playSoundEffect(soundName, options);
            
            // Fall back to original if enhanced fails and original exists
            if (!result) {
                console.log(`Falling back to original sound function for ${soundName}`);
                return originalPlaySoundEffect(soundName);
            }
            
            return result;
        };
        
        console.log("Enhanced the original playSoundEffect function");
    }
})();