/**
 * Scene Definitions Module
 * 
 * This module defines all scene classes globally so they can be properly referenced
 * by the Phaser game instance.
 */

(function() {
    'use strict';
    
    // Define scene classes if they don't already exist
    
    // Main Menu Scene
    if (typeof window.MainMenuScene === 'undefined') {
        window.MainMenuScene = class MainMenuScene extends Phaser.Scene {
            constructor() {
                super({ key: 'MainMenuScene' });
                console.log("MainMenuScene defined globally");
            }
            
            preload() {
                console.log("MainMenuScene preload");
            }
            
            create() {
                console.log("MainMenuScene create");
                // More detailed implementation in main-menu-scene.js
            }
        };
        console.log("MainMenuScene class registered globally");
    }
    
    // Ranch Scene 
    if (typeof window.RanchScene === 'undefined') {
        window.RanchScene = class RanchScene extends Phaser.Scene {
            constructor() {
                super({ key: 'RanchScene' });
                console.log("RanchScene defined globally");
            }
            
            preload() {
                console.log("RanchScene preload");
            }
            
            create() {
                console.log("RanchScene create");
                // More detailed implementation in other files
            }
        };
        console.log("RanchScene class registered globally");
    }
    
    // Saloon Scene
    if (typeof window.SaloonScene === 'undefined') {
        window.SaloonScene = class SaloonScene extends Phaser.Scene {
            constructor() {
                super({ key: 'SaloonScene' });
                console.log("SaloonScene defined globally");
            }
            
            preload() {
                console.log("SaloonScene preload");
            }
            
            create() {
                console.log("SaloonScene create");
                // More detailed implementation in other files
            }
        };
        console.log("SaloonScene class registered globally");
    }
    
    // Night Scene
    if (typeof window.NightScene === 'undefined') {
        window.NightScene = class NightScene extends Phaser.Scene {
            constructor() {
                super({ key: 'NightScene' });
                console.log("NightScene defined globally");
            }
            
            preload() {
                console.log("NightScene preload");
            }
            
            create() {
                console.log("NightScene create");
                // More detailed implementation in other files
            }
        };
        console.log("NightScene class registered globally");
    }
    
    console.log("Scene definitions initialized");
})();