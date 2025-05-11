// NightScene class - Shadow Market gameplay
class NightScene extends Phaser.Scene {
    constructor() {
        super('NightScene');
        
        // Grid configuration for this scene
        this.gridConfig = {
            size: 4, // 4x4 grid
            cellSize: 90,
            padding: 10,
            startX: 0, // Will be calculated in create based on screen size
            startY: 0  // Will be calculated in create based on screen size
        };
        
        // Animation timers and cell references
        this.bubblingTimers = [];
        this.glowTimers = [];
        this.cellSprites = [];
        this.cellIndicators = [];
    }
    
    preload() {
        // Load background 
        this.load.image('shadow-bg', 'img/game-background.jpeg');
        
        // We'll use direct graphics instead of image assets
        
        // Load particle textures for effects
        this.load.image('bubble', 'img/bubble.png');
        this.load.image('glow', 'img/glow.png');
        
        console.log("Night scene preloaded assets");
    }
    
    create() {
        // Create background for night scene
        this.bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'shadow-bg'
        );
        this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.bg.setTint(0x000022); // Dark blue tint for night
        
        // Add grid header
        const headerText = this.add.text(
            this.cameras.main.width / 2,
            50,
            'SHADOW MARKET LABORATORY',
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '32px',
                color: '#00FFFF',
                stroke: '#000000',
                strokeThickness: 4,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#6600CC',
                    blur: 5,
                    stroke: true,
                    fill: true
                }
            }
        );
        headerText.setOrigin(0.5);
        
        // Add decorative underline
        const underline = this.add.graphics();
        underline.lineStyle(2, 0x00ffff, 0.8);
        underline.lineBetween(
            this.cameras.main.width / 2 - 160,
            headerText.y + 25,
            this.cameras.main.width / 2 + 160,
            headerText.y + 25
        );
        
        // Description Text
        const description = this.add.text(
            this.cameras.main.width / 2,
            headerText.y + 50,
            'Craft and distill shadow potions in your lab to earn resources!',
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        );
        description.setOrigin(0.5);
        
        // Create stat displays
        this.etherText = this.add.text(
            this.cameras.main.width / 2 - 150,
            headerText.y + 90,
            'Ether: 0',
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '16px',
                color: '#cc66ff'
            }
        );
        this.etherText.setOrigin(0.5);
        
        this.multiplierText = this.add.text(
            this.cameras.main.width / 2 + 150,
            headerText.y + 90,
            'Multiplier: x1.0',
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '16px',
                color: '#00ffcc'
            }
        );
        this.multiplierText.setOrigin(0.5);
        
        // Create network status display
        const networkHeader = this.add.text(
            this.cameras.main.width / 2,
            headerText.y + 130,
            'Network: Stable',
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '20px',
                color: '#00FFFF'
            }
        );
        networkHeader.setOrigin(0.5);
        
        // Network yield text
        const yieldText = this.add.text(
            this.cameras.main.width / 2,
            networkHeader.y + 30,
            'Normal crystal yield',
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '14px',
                color: '#ffffff'
            }
        );
        yieldText.setOrigin(0.5);
        
        // Create grid container
        this.gridContainer = this.add.container(0, 0);
        
        // Create a visual grid background
        const gridPanel = this.add.graphics();
        
        // Calculate grid dimensions
        const { size, cellSize, padding } = this.gridConfig;
        const totalWidth = (cellSize + padding) * size;
        const totalHeight = (cellSize + padding) * size;
        
        // Position grid in the center of screen with some offset down from header
        const gridX = this.cameras.main.width / 2;
        const gridY = this.cameras.main.height / 2 + 20;
        
        // Store grid position for cell creation
        this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
        this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
        
        // Draw grid panel
        gridPanel.fillStyle(0x000033, 0.7);
        gridPanel.fillRect(
            gridX - totalWidth/2 - 20,
            gridY - totalHeight/2 - 20,
            totalWidth + 40,
            totalHeight + 40
        );
        
        // Add border
        gridPanel.lineStyle(2, 0x3333cc);
        gridPanel.strokeRect(
            gridX - totalWidth/2 - 20,
            gridY - totalHeight/2 - 20,
            totalWidth + 40,
            totalHeight + 40
        );
        
        // Add grid lines
        gridPanel.lineStyle(1, 0x222266);
        
        // Vertical grid lines
        for (let i = 1; i < size; i++) {
            const x = gridX - totalWidth/2 + i * (cellSize + padding);
            gridPanel.lineBetween(
                x,
                gridY - totalHeight/2,
                x,
                gridY + totalHeight/2
            );
        }
        
        // Horizontal grid lines
        for (let i = 1; i < size; i++) {
            const y = gridY - totalHeight/2 + i * (cellSize + padding);
            gridPanel.lineBetween(
                gridX - totalWidth/2,
                y,
                gridX + totalWidth/2,
                y
            );
        }
        
        // Position grid cells within the panel
        this.gridConfig = {
            size: 4,
            cellSize: 80,
            padding: 15,
            startX: gridX + 50,
            startY: gridY + 50
        };
        
        // Initialize the grid cells
        this.initPhaserGrid();
        
        // Add cycle timer text
        const cycleText = this.add.text(
            gridX,
            gridY + totalHeight/2 + 80,
            'Market Cycle: stable',
            {
                fontFamily: 'Share Tech Mono',
                fontSize: '18px',
                color: '#00FFFF',
                align: 'center'
            }
        );
        cycleText.setOrigin(0.5);
        
        // Add a "Distill All" button with glow effect
        const distillBtn = this.add.text(
            this.cameras.main.width / 2,
            gridY + totalHeight/2 + 40,
            "💧 DISTILL ALL",
            {
                fontFamily: 'Share Tech Mono', 
                fontSize: '22px',
                color: '#ffffff',
                backgroundColor: '#6a2ca0',
                padding: { x: 15, y: 10 },
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        distillBtn.setOrigin(0.5);
        distillBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => distillAllShadowCells());
        
        // Add button glow effect
        this.tweens.add({
            targets: distillBtn,
            alpha: { from: 0.9, to: 1 },
            scale: { from: 0.98, to: 1.02 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        // Add "Craft Potion" button
        const craftBtn = this.add.text(
            this.cameras.main.width / 2 - 100,
            gridY + totalHeight/2 + 120,
            "🧪 Craft Potion",
            {
                fontFamily: 'Share Tech Mono', 
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#6a2ca0',
                padding: { x: 10, y: 5 },
                stroke: '#000000',
                strokeThickness: 1
            }
        );
        
        craftBtn.setOrigin(0.5);
        craftBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // This will call the HTML button's click event
                document.getElementById('craft-potion').click();
            });
            
        // Add cost label
        const costLabel = this.add.text(
            craftBtn.x,
            craftBtn.y + 25,
            "20 $CATTLE (50% burn)",
            {
                fontFamily: 'Share Tech Mono', 
                fontSize: '12px',
                color: '#cccccc',
                align: 'center'
            }
        );
        costLabel.setOrigin(0.5);
            
        // Navigation buttons (Ranch, Saloon, Profile)
        const buttonY = this.cameras.main.height - 50;
        const buttonGap = 120;
        
        // Ranch button
        const ranchBtn = this.add.text(
            this.cameras.main.width / 2 - buttonGap,
            buttonY,
            "🏠 Ranch",
            {
                fontFamily: 'Share Tech Mono', 
                fontSize: '22px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 15, y: 10 },
                stroke: '#000000',
                strokeThickness: 1
            }
        );
        ranchBtn.setOrigin(0.5);
        ranchBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                document.getElementById('back-to-ranch-night').click();
            });
            
        // Saloon button
        const saloonBtn = this.add.text(
            this.cameras.main.width / 2,
            buttonY,
            "🎰 Saloon",
            {
                fontFamily: 'Share Tech Mono', 
                fontSize: '22px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 15, y: 10 },
                stroke: '#000000',
                strokeThickness: 1
            }
        );
        saloonBtn.setOrigin(0.5);
        saloonBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                document.getElementById('go-to-saloon-from-night').click();
            });
            
        // Profile button
        const profileBtn = this.add.text(
            this.cameras.main.width / 2 + buttonGap,
            buttonY,
            "👤 Profile",
            {
                fontFamily: 'Share Tech Mono', 
                fontSize: '22px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 15, y: 10 },
                stroke: '#000000',
                strokeThickness: 1
            }
        );
        profileBtn.setOrigin(0.5);
        profileBtn.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                document.getElementById('go-to-profile-from-night').click();
            });
            
        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }
    
    // Initialize the grid for the Shadow Market
    initPhaserGrid() {
        const { size, cellSize, padding, startX, startY } = this.gridConfig;
        
        // Calculate grid dimensions
        const totalWidth = (cellSize + padding) * size;
        const totalHeight = (cellSize + padding) * size;
        
        // Position grid in center of screen area
        const gridX = this.cameras.main.width / 2;
        const gridY = this.cameras.main.height / 2 + 20;
        
        // Create cells
        this.createGridCells();
    }
    
    createGridCells() {
        const { startX, startY, cellSize, padding, size } = this.gridConfig;
        
        // Initialize shadow grid cells
        initShadowCells();
        
        // Clear existing cell sprites if any
        if (this.cellSprites.length > 0) {
            this.cellSprites.forEach(sprite => sprite.destroy());
            this.cellSprites = [];
        }
        
        // Clear existing text indicators
        if (this.cellIndicators.length > 0) {
            this.cellIndicators.forEach(text => text.destroy());
            this.cellIndicators = [];
        }
        
        // Create cells based on shadowGrid data
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const index = row * size + col;
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Create cell using our new utility function
                const cellContainer = renderShadowCell(this, x, y, index);
                this.cellSprites[index] = cellContainer;
            }
        }
    }
    
    updateCellAppearance(cellIndex) {
        const cell = shadowGrid.cells[cellIndex];
        if (!cell) return;
        
        // Get the cell container
        const cellContainer = this.cellSprites[cellIndex];
        if (!cellContainer) return;
        
        // Use our utility function to update the cell appearance
        updateShadowCell(this, cellContainer, cellIndex);
    }
    
    updateAllCells() {
        // Update all cells
        for (let i = 0; i < shadowGrid.cells.length; i++) {
            this.updateCellAppearance(i);
        }
    }
    
    addBubblingAnimation(cellSprite, cellIndex) {
        // Stop any existing animation
        if (this.bubblingTimers[cellIndex]) {
            this.bubblingTimers[cellIndex].remove();
        }
        
        // Add bubbling animation
        const bubbleTween = this.tweens.add({
            targets: cellSprite,
            scaleX: { from: 0.98, to: 1.02 },
            scaleY: { from: 0.98, to: 1.02 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        this.bubblingTimers[cellIndex] = bubbleTween;
    }
    
    addGlowAnimation(cellSprite, cellIndex) {
        // Stop any existing animation
        if (this.glowTimers[cellIndex]) {
            this.glowTimers[cellIndex].remove();
        }
        
        // Find the border graphic in the container
        let borderGraphic = null;
        
        if (cellSprite.list) {
            for (let i = 0; i < cellSprite.list.length; i++) {
                const item = cellSprite.list[i];
                if (item.type === 'Graphics' && item._lineWidth) {
                    borderGraphic = item;
                    break;
                }
            }
        }
        
        // Add flashing animation to the border if found, otherwise to the whole sprite
        const target = borderGraphic || cellSprite;
        
        const glowTween = this.tweens.add({
            targets: target,
            alpha: { from: 0.4, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        this.glowTimers[cellIndex] = glowTween;
    }
    
    resize(gameSize) {
        if (!this.cameras || !this.cameras.main) return;
        
        // Resize background
        if (this.bg) {
            this.bg.setPosition(gameSize.width/2, gameSize.height/2);
            this.bg.setDisplaySize(gameSize.width, gameSize.height);
        }
        
        // Update grid cell positions
        this.updateGridCellPositions();
    }
    
    updateGridCellPositions() {
        // Skip if there are no cells yet
        if (!this.cellSprites || this.cellSprites.length === 0) return;
        
        const { size, cellSize, padding } = this.gridConfig;
        
        // Calculate new grid dimensions
        const totalWidth = (cellSize + padding) * size;
        const totalHeight = (cellSize + padding) * size;
        
        // Center grid in the available space
        const gridX = this.cameras.main.width / 2;
        const gridY = this.cameras.main.height / 2 + 20;
        
        // New starting coordinates
        this.gridConfig.startX = gridX - totalWidth/2 + cellSize/2;
        this.gridConfig.startY = gridY - totalHeight/2 + cellSize/2;
        
        // Update cells
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const index = row * size + col;
                const sprite = this.cellSprites[index];
                if (sprite) {
                    const x = this.gridConfig.startX + col * (cellSize + padding);
                    const y = this.gridConfig.startY + row * (cellSize + padding);
                    sprite.setPosition(x, y);
                }
            }
        }
    }
}