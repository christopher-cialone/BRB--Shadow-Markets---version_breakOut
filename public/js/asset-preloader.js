// Asset preloader to handle texture creation and avoid duplicates

// Keep track of loaded images
const loadedAssets = {
    textures: new Set(),
    atlases: new Set(),
    audio: new Set()
};

// Safe image loading that prevents duplicate key errors
function safePhaserImageLoad(scene, key, path) {
    if (!scene || !scene.textures) {
        console.error("Scene is not properly initialized for texture loading");
        return false;
    }
    
    try {
        // Track textures globally across all scenes to avoid conflicts
        if (!window.loadedTextureKeys) {
            window.loadedTextureKeys = new Set();
        }
        
        // Check if the texture with this key already exists
        if (scene.textures.exists(key) || window.loadedTextureKeys.has(key)) {
            // Don't log warning for common textures that are expected to be used across scenes
            const commonTextures = ['game-bg', 'shadow-bg', 'barn', 'cattle', 'milk-bottle'];
            if (!commonTextures.includes(key)) {
                console.warn(`Skipping load for existing texture: ${key}`);
            }
            return true; // Already loaded, no need to load again
        }
        
        // If it doesn't exist, load it
        scene.load.image(key, path);
        loadedAssets.textures.add(key);
        window.loadedTextureKeys.add(key);
        
        // Add error handler in case loading fails
        scene.load.on('loaderror', function(fileObj) {
            if (fileObj.key === key) {
                console.error(`Failed to load texture: ${key} from ${path}`);
                handleMissingTexture(scene, key);
            }
        }, this);
        
        return true;
    } catch (e) {
        console.error(`Error loading texture ${key} from ${path}:`, e);
        // Create placeholder on error
        handleMissingTexture(scene, key);
        return false;
    }
}

// Handle missing assets gracefully with placeholders
function handleMissingTexture(scene, key, width = 64, height = 64, color = 0x3a76c4) {
    if (!scene || !scene.textures) {
        console.error("Scene is not properly initialized for texture creation");
        return false;
    }
    
    try {
        // Check if texture already exists
        if (scene.textures.exists(key)) {
            return true;
        }
        
        // Create a placeholder texture
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, width, height);
        
        // Add grid pattern
        graphics.lineStyle(1, 0xffffff, 0.3);
        for (let i = 0; i <= width; i += 8) {
            graphics.moveTo(i, 0);
            graphics.lineTo(i, height);
        }
        for (let j = 0; j <= height; j += 8) {
            graphics.moveTo(0, j);
            graphics.lineTo(width, j);
        }
        
        // Add missing texture indicator
        graphics.lineStyle(2, 0xff0000, 1);
        graphics.strokeRect(0, 0, width, height);
        graphics.lineTo(width, height);
        graphics.moveTo(width, 0);
        graphics.lineTo(0, height);
        
        // Generate texture
        graphics.generateTexture(key, width, height);
        graphics.destroy();
        
        console.warn(`Created placeholder for missing texture: ${key}`);
        return true;
    } catch (e) {
        console.error(`Error creating placeholder texture ${key}:`, e);
        return false;
    }
}

// Preload common game assets to ensure they're available across scenes
function preloadCommonAssets(scene) {
    if (!scene) return;
    
    const imageAssets = [
        { key: 'game-bg', path: 'img/game-background.jpeg' },
        { key: 'cattle', path: 'img/cattle.png' },
        { key: 'milk-bottle', path: 'img/milk-bottle.png' },
        { key: 'water-drop', path: 'img/water-drop.png' },
        { key: 'hay-icon', path: 'img/hay-icon.png' },
        { key: 'cell-empty', path: 'img/empty.png' },
        { key: 'cell-planted', path: 'img/planted.png' },
        { key: 'cell-growing', path: 'img/growing.png' },
        { key: 'cell-harvestable', path: 'img/harvestable.png' },
        { key: 'empty-night', path: 'img/empty-night.png' },
        { key: 'brewing', path: 'img/brewing.png' },
        { key: 'distilling', path: 'img/distilling.png' },
        { key: 'ready', path: 'img/ready.png' },
        { key: 'bubble', path: 'img/bubble.png' },
        { key: 'glow', path: 'img/glow.png' }
    ];
    
    // Load images safely
    imageAssets.forEach(asset => {
        safePhaserImageLoad(scene, asset.key, asset.path);
    });
    
    // Ensure start method is called to load the assets
    scene.load.start();
}

// If Phaser is available, make these functions available globally
if (typeof Phaser !== 'undefined') {
    window.safePhaserImageLoad = safePhaserImageLoad;
    window.handleMissingTexture = handleMissingTexture;
    window.preloadCommonAssets = preloadCommonAssets;
}