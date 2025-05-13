/**
 * Bull Run Boost - Asset Handler
 * 
 * This file manages asset loading and handles missing textures with
 * fallbacks. It also provides utility functions to create SVG assets
 * programmatically when needed.
 */

// Asset handler namespace
window.assetHandler = {
    // Load a texture safely, with error handling
    safePhaserImageLoad: function(scene, key, path) {
        try {
            scene.load.svg(key, path);
            console.log(`Successfully loaded: ${key}`);
        } catch (error) {
            console.error(`Failed to load texture: ${key}`, error);
            this.handleMissingTexture(scene, key);
        }
    },
    
    // Handle missing textures by creating a placeholder
    handleMissingTexture: function(scene, key, width = 64, height = 64, color = 0x3a76c4) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(0, 0, width, height);
        graphics.lineBetween(0, 0, width, height);
        graphics.lineBetween(width, 0, 0, height);
        
        // Generate a texture from the graphics object
        graphics.generateTexture(key, width, height);
        graphics.destroy();
        
        console.warn(`Created placeholder for missing texture: ${key}`);
    },
    
    // Preload common assets used across scenes
    preloadCommonAssets: function(scene) {
        // Generate missing assets if they don't exist yet
        this.createMissingAssets();
        
        // Common icons and UI elements
        this.safePhaserImageLoad(scene, 'hay-icon', 'img/hay-icon.svg');
        this.safePhaserImageLoad(scene, 'milk-bottle', 'img/milk-bottle.svg');
        this.safePhaserImageLoad(scene, 'bubble', 'img/bubble.svg');
        this.safePhaserImageLoad(scene, 'water-drop', 'img/water-drop.svg');
        this.safePhaserImageLoad(scene, 'glow', 'img/glow.svg');
        
        // Main scene assets
        this.safePhaserImageLoad(scene, 'town-bg', 'img/town-bg.svg');
        this.safePhaserImageLoad(scene, 'ether-bg', 'img/ether-bg.svg');
        this.safePhaserImageLoad(scene, 'field-empty', 'img/field-empty.svg');
        this.safePhaserImageLoad(scene, 'field-growing', 'img/field-growing.svg');
        this.safePhaserImageLoad(scene, 'field-ready', 'img/field-ready.svg');
        this.safePhaserImageLoad(scene, 'character', 'img/character.svg');
        this.safePhaserImageLoad(scene, 'cattle', 'img/cattle.svg');
        this.safePhaserImageLoad(scene, 'pasture', 'img/pasture.svg');
        this.safePhaserImageLoad(scene, 'saloon', 'img/saloon.svg');
        this.safePhaserImageLoad(scene, 'portal', 'img/portal.svg');
        
        // Saloon scene assets
        this.safePhaserImageLoad(scene, 'saloon-bg', 'img/saloon-bg.svg');
        this.safePhaserImageLoad(scene, 'cauldron', 'img/cauldron.svg');
        this.safePhaserImageLoad(scene, 'crystal-node', 'img/crystal-node.svg');
        
        // Card suit assets
        this.safePhaserImageLoad(scene, 'card-hearts', 'img/card-hearts.svg');
        this.safePhaserImageLoad(scene, 'card-diamonds', 'img/card-diamonds.svg');
        this.safePhaserImageLoad(scene, 'card-clubs', 'img/card-clubs.svg');
        this.safePhaserImageLoad(scene, 'card-spades', 'img/card-spades.svg');
        
        console.log('Common assets preloaded');
    },
    
    // Create missing assets programmatically
    createMissingAssets: function() {
        const saveAsset = (content, filename) => {
            // This is a no-op in production - assets should be saved to the server
            // On first run, you would provide SVG strings for assets that don't exist
            console.log(`Asset would be created: ${filename}`);
        };
        
        // Create common SVG assets if they don't exist
        saveAsset(this.createHayIconSVG(), 'img/hay-icon.svg');
        saveAsset(this.createWaterDropSVG(), 'img/water-drop.svg');
        saveAsset(this.createMilkBottleSVG(), 'img/milk-bottle.svg');
        saveAsset(this.createBubbleSVG(), 'img/bubble.svg');
        saveAsset(this.createGlowSVG(), 'img/glow.svg');
    },
    
    // SVG generators for common assets
    createHayIconSVG: function() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="15" width="20" height="20" fill="#f0c060" />
  <rect x="15" y="10" width="10" height="25" fill="#f0c060" />
  <line x1="10" y1="20" x2="30" y2="20" stroke="#c09030" stroke-width="2" />
  <line x1="10" y1="25" x2="30" y2="25" stroke="#c09030" stroke-width="2" />
  <line x1="10" y1="30" x2="30" y2="30" stroke="#c09030" stroke-width="2" />
  <line x1="20" y1="10" x2="20" y2="35" stroke="#c09030" stroke-width="2" />
</svg>`;
    },
    
    createWaterDropSVG: function() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 5 Q30 15 30 25 Q30 35 20 35 Q10 35 10 25 Q10 15 20 5 Z" fill="#87ceeb" />
  <path d="M20 10 Q25 15 25 25 Q25 30 20 30 Q15 30 15 25 Q15 15 20 10 Z" fill="#b0e2ff" />
</svg>`;
    },
    
    createMilkBottleSVG: function() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <rect x="15" y="5" width="10" height="5" fill="#dddddd" />
  <path d="M15 10 Q10 15 10 20 L10 35 L30 35 L30 20 Q30 15 25 10 Z" fill="#ffffff" />
  <rect x="10" y="30" width="20" height="5" fill="#f0f0f0" />
</svg>`;
    },
    
    createBubbleSVG: function() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="15" fill="#ffffff" fill-opacity="0.7" />
  <circle cx="15" cy="15" r="5" fill="#ffffff" fill-opacity="0.9" />
</svg>`;
    },
    
    createGlowSVG: function() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="20" cy="20" r="20" fill="url(#glow)" />
</svg>`;
    }
};