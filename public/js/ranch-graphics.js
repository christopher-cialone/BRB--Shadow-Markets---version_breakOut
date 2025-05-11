// Ranch Scene using graphics instead of image textures
if (typeof Phaser !== 'undefined') {
    // Override the RanchScene's createGridCells method to use graphics instead of textures
    const originalCreateGridCells = RanchScene.prototype.createGridCells;
    
    // Custom grid cell creation using graphics instead of sprites
    RanchScene.prototype.createGridCells = function() {
        console.log("Creating ranch grid cells with graphics approach");
        const { size, cellSize, padding, startX, startY } = this.gridConfig;
        
        // Initialize the cells array if it's empty
        if (ranchGrid.cells.length === 0) {
            for (let i = 0; i < size * size; i++) {
                ranchGrid.cells.push({
                    id: i,
                    state: 'empty',
                    growthStage: 0,
                    growthMax: 3
                });
            }
        }
        
        // Clear existing cells if any
        if (this.gridCells && this.gridCells.length > 0) {
            this.gridCells.forEach(cell => {
                if (cell.container) cell.container.destroy();
            });
        }
        this.gridCells = [];
        
        // Create the grid cells
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cellIndex = row * size + col;
                const cell = ranchGrid.cells[cellIndex];
                
                // Calculate position
                const x = startX + col * (cellSize + padding);
                const y = startY + row * (cellSize + padding);
                
                // Create a container for this cell
                const cellContainer = this.add.container(x, y);
                
                // Determine colors based on state
                let fillColor, strokeColor, label;
                switch(cell.state) {
                    case 'planted':
                        fillColor = 0x3a7d44;  // Dark green
                        strokeColor = 0x4caf50; // Light green
                        label = "PLANTED";
                        break;
                    case 'growing':
                        fillColor = 0x4caf50;  // Regular green
                        strokeColor = 0x8bc34a; // Lime green
                        label = "GROWING";
                        break;
                    case 'harvestable':
                        fillColor = 0x8bc34a;  // Lime green
                        strokeColor = 0xffeb3b; // Yellow
                        label = "READY";
                        break;
                    default: // empty
                        fillColor = 0x795548;  // Brown
                        strokeColor = 0xa1887f; // Light brown
                        label = "EMPTY";
                }
                
                // Create the cell background (square)
                const bg = this.add.graphics();
                bg.fillStyle(fillColor, 1);
                bg.fillRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
                
                // Add border
                const border = this.add.graphics();
                border.lineStyle(3, strokeColor, 0.8);
                border.strokeRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
                
                // Add state label if needed
                const stateText = this.add.text(0, 0, label, {
                    fontFamily: 'Roboto',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }).setOrigin(0.5);
                
                // Add growth indicator if not empty
                if (cell.state !== 'empty') {
                    const growthText = this.add.text(
                        0, 
                        cellSize/2 - 15, 
                        `${cell.growthStage}/${cell.growthMax}`,
                        { 
                            fontFamily: 'Roboto', 
                            fontSize: '14px',
                            fill: '#FFFFFF',
                            stroke: '#000000',
                            strokeThickness: 2
                        }
                    ).setOrigin(0.5);
                    cellContainer.add(growthText);
                }
                
                // Add all elements to the container
                cellContainer.add(bg);
                cellContainer.add(border);
                cellContainer.add(stateText);
                
                // Make container interactive
                cellContainer.setSize(cellSize, cellSize);
                cellContainer.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => {
                        handleRanchCellClick(cellIndex);
                    });
                
                // Add entrance animation
                cellContainer.alpha = 0;
                cellContainer.scale = 0.7;
                
                this.tweens.add({
                    targets: cellContainer,
                    alpha: 1,
                    scale: 1,
                    duration: 400,
                    ease: 'Back.easeOut',
                    delay: cellIndex * 50 // Staggered appearance
                });
                
                // Add to scene and store reference
                this.gridContainer.add(cellContainer);
                this.gridCells.push({ container: cellContainer, index: cellIndex });
            }
        }
        
        console.log(`Created ${this.gridCells.length} ranch grid cells`);
    };
    
    // Method to update cell appearance
    RanchScene.prototype.updateCellAppearance = function(cellIndex) {
        // Get the cell data and container
        const cell = ranchGrid.cells[cellIndex];
        const cellData = this.gridCells.find(c => c.index === cellIndex);
        if (!cell || !cellData || !cellData.container) return;
        
        const cellContainer = cellData.container;
        
        // Find background, border and text in the container
        let bg = null, border = null, stateText = null, growthText = null;
        
        cellContainer.list.forEach(item => {
            if (item.type === 'Graphics' && !item._lineWidth) {
                bg = item;
            } else if (item.type === 'Graphics' && item._lineWidth) {
                border = item;
            } else if (item.type === 'Text' && !item.text.includes('/')) {
                stateText = item;
            } else if (item.type === 'Text' && item.text.includes('/')) {
                growthText = item;
            }
        });
        
        // Determine colors and text based on state
        let fillColor, strokeColor, label;
        switch(cell.state) {
            case 'planted':
                fillColor = 0x3a7d44;  // Dark green
                strokeColor = 0x4caf50; // Light green
                label = "PLANTED";
                break;
            case 'growing':
                fillColor = 0x4caf50;  // Regular green
                strokeColor = 0x8bc34a; // Lime green
                label = "GROWING";
                break;
            case 'harvestable':
                fillColor = 0x8bc34a;  // Lime green
                strokeColor = 0xffeb3b; // Yellow
                label = "READY";
                break;
            default: // empty
                fillColor = 0x795548;  // Brown
                strokeColor = 0xa1887f; // Light brown
                label = "EMPTY";
        }
        
        const cellSize = this.gridConfig.cellSize;
        
        // Update background
        if (bg) {
            bg.clear();
            bg.fillStyle(fillColor, 1);
            bg.fillRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
        }
        
        // Update border
        if (border) {
            border.clear();
            border.lineStyle(3, strokeColor, 0.8);
            border.strokeRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
        }
        
        // Update text
        if (stateText) {
            stateText.setText(label);
        }
        
        // Update growth indicator
        if (cell.state !== 'empty') {
            if (growthText) {
                growthText.setText(`${cell.growthStage}/${cell.growthMax}`);
                growthText.visible = true;
            } else {
                // Create growth indicator if missing
                const newGrowthText = this.add.text(
                    0, 
                    cellSize/2 - 15, 
                    `${cell.growthStage}/${cell.growthMax}`,
                    { 
                        fontFamily: 'Roboto', 
                        fontSize: '14px',
                        fill: '#FFFFFF',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5);
                cellContainer.add(newGrowthText);
            }
        } else if (growthText) {
            growthText.visible = false;
        }
        
        // Add special effects for cells that need attention
        if (cell.state === 'harvestable') {
            this.tweens.add({
                targets: border,
                alpha: { from: 0.6, to: 1 },
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        }
    };
}