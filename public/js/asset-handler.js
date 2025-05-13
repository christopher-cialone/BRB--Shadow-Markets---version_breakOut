/**
 * Bull Run Boost - Asset Handler
 * 
 * This file handles asset preloading and provides fallbacks for missing textures.
 */

// Handle missing textures with placeholders
function handleMissingTexture(scene, key, width = 64, height = 64, color = 0xcccccc) {
    console.log(`Creating placeholder texture for: ${key}`);
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    
    // Add a crosshatch pattern to indicate missing texture
    graphics.lineStyle(1, 0x000000, 0.5);
    graphics.moveTo(0, 0);
    graphics.lineTo(width, height);
    graphics.moveTo(width, 0);
    graphics.lineTo(0, height);
    
    // Add text label
    const textStyle = {
        font: '10px Arial',
        fill: '#000000',
        align: 'center',
        wordWrap: { width: width - 4 }
    };
    const text = scene.add.text(width/2, height/2, key, textStyle);
    text.setOrigin(0.5);
    
    // Generate texture
    graphics.generateTexture(key, width, height);
    
    // Clean up
    graphics.destroy();
    text.destroy();
    
    return key;
}

// Safely load images with fallbacks
function safePhaserImageLoad(scene, key, path) {
    try {
        scene.load.image(key, path);
        
        // Add error handler
        scene.load.once('filecomplete-image-' + key, () => {
            console.log(`Successfully loaded: ${key}`);
        });
        
        scene.load.once('loaderror', (fileObj) => {
            if (fileObj.key === key) {
                console.warn(`Failed to load image: ${key} at ${path}`);
                handleMissingTexture(scene, key);
            }
        });
    } catch (error) {
        console.error(`Error loading image ${key}:`, error);
        handleMissingTexture(scene, key);
    }
}

// Preload common assets needed across scenes
function preloadCommonAssets(scene) {
    // UI elements
    safePhaserImageLoad(scene, 'hay-icon', 'img/hay-icon.svg');
    safePhaserImageLoad(scene, 'water-drop', 'img/water-drop.svg');
    safePhaserImageLoad(scene, 'milk-bottle', 'img/milk-bottle.svg');
    safePhaserImageLoad(scene, 'bubble', 'img/bubble.svg');
    safePhaserImageLoad(scene, 'glow', 'img/glow.svg');
    
    // Environment assets
    safePhaserImageLoad(scene, 'town-bg', 'img/town-bg.svg');
    safePhaserImageLoad(scene, 'saloon-bg', 'img/saloon-bg.svg');
    safePhaserImageLoad(scene, 'ether-bg', 'img/ether-bg.svg');
    
    // Field states
    safePhaserImageLoad(scene, 'field-empty', 'img/field-empty.svg');
    safePhaserImageLoad(scene, 'field-growing', 'img/field-growing.svg');
    safePhaserImageLoad(scene, 'field-ready', 'img/field-ready.svg');
    
    // Character and cattle
    safePhaserImageLoad(scene, 'character', 'img/character.svg');
    safePhaserImageLoad(scene, 'cattle', 'img/cattle.svg');
    
    // Buildings
    safePhaserImageLoad(scene, 'saloon', 'img/saloon.svg');
    safePhaserImageLoad(scene, 'portal', 'img/portal.svg');
    safePhaserImageLoad(scene, 'pasture', 'img/pasture.svg');
    
    // Special objects
    safePhaserImageLoad(scene, 'crystal-node', 'img/crystal-node.svg');
    safePhaserImageLoad(scene, 'cauldron', 'img/cauldron.svg');
    
    // Card suits for racing game
    safePhaserImageLoad(scene, 'card-hearts', 'img/card-hearts.svg');
    safePhaserImageLoad(scene, 'card-diamonds', 'img/card-diamonds.svg');
    safePhaserImageLoad(scene, 'card-clubs', 'img/card-clubs.svg');
    safePhaserImageLoad(scene, 'card-spades', 'img/card-spades.svg');
    
    console.log('Common assets preloaded');
}

// Create SVG assets for missing images
function createMissingAssets() {
    // Create minimal SVGs for missing assets
    const hayIcon = createHayIconSVG();
    const waterDrop = createWaterDropSVG();
    const milkBottle = createMilkBottleSVG();
    const bubbleSVG = createBubbleSVG();
    const glowSVG = createGlowSVG();
    
    // Function to save SVG to the right location
    function saveAsset(content, filename) {
        // This is a placeholder - the actual saving would be done server-side
        console.log(`Would save ${filename} with content length: ${content.length}`);
        // In a real implementation, we would save these files to the server
    }
    
    // Save SVGs
    saveAsset(hayIcon, 'hay-icon.svg');
    saveAsset(waterDrop, 'water-drop.svg');
    saveAsset(milkBottle, 'milk-bottle.svg');
    saveAsset(bubbleSVG, 'bubble.svg');
    saveAsset(glowSVG, 'glow.svg');
    
    return {
        hayIcon,
        waterDrop,
        milkBottle,
        bubbleSVG,
        glowSVG
    };
}

// Helper functions to create SVG content
function createHayIconSVG() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" fill="#f5deb3" rx="5" ry="5" />
  <path d="M10 10 L30 10 L30 30 L10 30 Z" fill="#daa520" />
  <line x1="15" y1="15" x2="25" y2="15" stroke="#8b4513" stroke-width="2" />
  <line x1="15" y1="20" x2="25" y2="20" stroke="#8b4513" stroke-width="2" />
  <line x1="15" y1="25" x2="25" y2="25" stroke="#8b4513" stroke-width="2" />
</svg>`;
}

function createWaterDropSVG() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 5 Q30 15 30 25 Q30 35 20 35 Q10 35 10 25 Q10 15 20 5 Z" fill="#87ceeb" />
  <path d="M20 10 Q25 15 25 25 Q25 30 20 30 Q15 30 15 25 Q15 15 20 10 Z" fill="#b0e2ff" />
</svg>`;
}

function createMilkBottleSVG() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <rect x="15" y="5" width="10" height="5" fill="#dddddd" />
  <path d="M15 10 Q10 15 10 20 L10 35 L30 35 L30 20 Q30 15 25 10 Z" fill="#ffffff" />
  <rect x="10" y="30" width="20" height="5" fill="#f0f0f0" />
</svg>`;
}

function createBubbleSVG() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="15" fill="#ffffff" fill-opacity="0.7" />
  <circle cx="15" cy="15" r="5" fill="#ffffff" fill-opacity="0.9" />
</svg>`;
}

function createGlowSVG() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
  <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
  </radialGradient>
  <circle cx="20" cy="20" r="20" fill="url(#glow)" />
</svg>`;
}

// Export functions to window for global use
window.assetHandler = {
    handleMissingTexture,
    safePhaserImageLoad,
    preloadCommonAssets,
    createMissingAssets
};