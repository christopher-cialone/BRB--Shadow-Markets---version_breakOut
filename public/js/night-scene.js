// NightScene class definition
if (typeof window.NightScene === 'undefined') {
    window.NightScene = class NightScene extends Phaser.Scene {
        constructor() {
            super('NightScene');
            this.gridCells = [];
            this.gridConfig = {
                size: 4,
                cellSize: 80,
                padding: 10,
                startX: 0,
                startY: 0
            };
        }

        preload() {
            this.load.image('cell-empty', 'img/cell-empty.png');
            this.load.image('cell-brewing', 'img/cell-brewing.png');
            this.load.image('cell-distilling', 'img/cell-distilling.png');
            this.load.image('cell-ready', 'img/cell-ready.png');
        }

        create() {
            const width = this.scale.width;
            const height = this.scale.height;
            this.bg = this.add.image(width/2, height/2, 'game-bg');
            this.bg.setDisplaySize(width, height).setTint(0x1a1a2e);
            this.initPhaserGrid();
            this.scale.on('resize', this.resize, this);
        }

        initPhaserGrid() {
            const { size, cellSize, padding } = this.gridConfig;
            const totalWidth = (cellSize + padding) * size;
            const totalHeight = (cellSize + padding) * size;
            this.gridConfig.startX = this.scale.width * 0.25 - totalWidth/2 + cellSize/2;
            this.gridConfig.startY = this.scale.height * 0.5 - totalHeight/2 + cellSize/2;

            this.gridContainer = this.add.container(0, 0);
            this.add.text(this.scale.width * 0.25, this.scale.height * 0.5 - totalHeight/2 - 40, 'Shadow Market Lab', {
                fontFamily: 'Anta', fontSize: '24px', color: '#ffffff'
            }).setOrigin(0.5);

            // Create all cells
            this.createGridCells();
        }
        
        createGridCells() {
            const { size, cellSize, padding, startX, startY } = this.gridConfig;
            
            this.gridCells = []; // Reset the grid cells array
            
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    const cellIndex = row * size + col;
                    const x = startX + col * (cellSize + padding);
                    const y = startY + row * (cellSize + padding);
                    
                    // Determine sprite name based on cell state
                    let spriteName = 'cell-empty';
                    if (window.shadowGrid && window.shadowGrid.cells && window.shadowGrid.cells[cellIndex]) {
                        const cell = window.shadowGrid.cells[cellIndex];
                        if (cell.state === 'brewing') spriteName = 'cell-brewing';
                        if (cell.state === 'distilling') spriteName = 'cell-distilling';
                        if (cell.state === 'ready') spriteName = 'cell-ready';
                    }
                    
                    // Check if the texture exists
                    if (!this.textures.exists(spriteName)) {
                        console.warn(`Texture ${spriteName} not found, using fallback`);
                        // Create a fallback texture using the global function if available
                        if (typeof window.createFallbackTexture === 'function') {
                            window.createFallbackTexture(this, spriteName);
                        } else {
                            // Fallback to creating a simple texture
                            this.createSimpleFallbackTexture(spriteName);
                        }
                    }
                    
                    const cellSprite = this.add.image(x, y, spriteName).setDisplaySize(cellSize, cellSize);
                    cellSprite.setInteractive().on('pointerdown', () => {
                        if (typeof window.handleShadowCellClick === 'function') {
                            window.handleShadowCellClick(cellIndex);
                        } else {
                            console.warn(`Shadow cell click handler not found for cell ${cellIndex}`);
                        }
                    });
                    
                    this.gridCells.push({ sprite: cellSprite, index: cellIndex });
                    this.gridContainer.add(cellSprite);
                }
            }
        }
        
        // Helper function to create a simple fallback texture
        createSimpleFallbackTexture(key) {
            try {
                const graphics = this.make.graphics();
                graphics.fillStyle(0x333333, 0.8);
                graphics.fillRect(0, 0, 64, 64);
                graphics.lineStyle(2, 0xffffff, 0.8);
                graphics.strokeRect(0, 0, 64, 64);
                graphics.generateTexture(key, 64, 64);
                console.log(`Created simple fallback texture: ${key}`);
            } catch (error) {
                console.error(`Error creating simple fallback texture: ${error}`);
            }
        }

        updateCellAppearance(cellIndex) {
            if (!window.shadowGrid || !window.shadowGrid.cells || !this.gridCells) return;
            
            const cell = window.shadowGrid.cells[cellIndex];
            const cellObj = this.gridCells[cellIndex];
            
            if (!cellObj || !cellObj.sprite) return;
            
            let spriteName = 'cell-empty';
            if (cell.state === 'brewing') spriteName = 'cell-brewing';
            if (cell.state === 'distilling') spriteName = 'cell-distilling';
            if (cell.state === 'ready') spriteName = 'cell-ready';
            
            cellObj.sprite.setTexture(spriteName);
        }

        updateAllCells() {
            if (!window.shadowGrid || !window.shadowGrid.cells) return;
            
            window.shadowGrid.cells.forEach((_, index) => this.updateCellAppearance(index));
        }

        resize(gameSize) {
            const width = gameSize.width;
            const height = gameSize.height;
            this.bg.setPosition(width/2, height/2).setDisplaySize(width, height);
            const { size, cellSize, padding } = this.gridConfig;
            const totalWidth = (cellSize + padding) * size;
            const totalHeight = (cellSize + padding) * size;
            this.gridConfig.startX = width * 0.25 - totalWidth/2 + cellSize/2;
            this.gridConfig.startY = height * 0.5 - totalHeight/2 + cellSize/2;
            this.updateGridCellPositions();
        }

        updateGridCellPositions() {
            const { size, cellSize, padding, startX, startY } = this.gridConfig;
            
            if (!this.gridCells) return;
            
            this.gridCells.forEach((cellObj, index) => {
                const row = Math.floor(index / size);
                const col = index % size;
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                cellObj.sprite.setPosition(x, y);
            });
        }
    };
    console.log("NightScene defined globally");
}