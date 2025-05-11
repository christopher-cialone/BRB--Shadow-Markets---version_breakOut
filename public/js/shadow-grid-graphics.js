// Shadow Market grid using graphics instead of image textures
if (typeof Phaser !== 'undefined') {
    // Check if NightScene exists before modifying it
    if (typeof NightScene !== 'undefined') {
        console.log("Enhancing NightScene with graphics-based cells");
        
        // Override the NightScene's createGridCells method to use graphics instead of textures
        const originalNightCreateGridCells = NightScene.prototype.createGridCells;
        
        // Custom grid cell creation using graphics instead of sprites
        NightScene.prototype.createGridCells = function() {
            console.log("Creating shadow grid cells with graphics approach");
            const { size, cellSize, padding, startX, startY } = this.gridConfig;
            
            // Initialize the cells array if it's empty
            if (shadowGrid.cells.length === 0) {
                console.log("Initializing shadow grid cells");
                for (let i = 0; i < size * size; i++) {
                    shadowGrid.cells.push({
                        id: i,
                        state: 'empty',
                        brewStage: 0,
                        brewMax: 5,
                        potency: 0
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
                    const cell = shadowGrid.cells[cellIndex];
                    
                    // Calculate position
                    const x = startX + col * (cellSize + padding);
                    const y = startY + row * (cellSize + padding);
                    
                    // Create a container for this cell
                    const cellContainer = this.add.container(x, y);
                    
                    // Determine colors based on state
                    let fillColor, strokeColor, label;
                    switch(cell.state) {
                        case 'brewing':
                            fillColor = 0x4a148c;  // Deep purple
                            strokeColor = 0x7c4dff; // Purple
                            label = "BREWING";
                            break;
                        case 'distilling':
                            fillColor = 0x7c4dff;  // Purple
                            strokeColor = 0xe040fb; // Magenta
                            label = "DISTILLING";
                            break;
                        case 'ready':
                            fillColor = 0xe040fb;  // Magenta
                            strokeColor = 0x18ffff; // Cyan
                            label = "READY";
                            break;
                        default: // empty
                            fillColor = 0x212121;  // Dark gray
                            strokeColor = 0x424242; // Gray
                            label = "EMPTY";
                    }
                    
                    // Create the cell background (hexagon shape for shadow market)
                    const bg = this.add.graphics();
                    bg.fillStyle(fillColor, 1);
                    
                    // Draw hexagon
                    const sideLength = cellSize / 2;
                    const hexPoints = [];
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI / 3) * i - Math.PI / 6;
                        hexPoints.push({
                            x: sideLength * Math.cos(angle),
                            y: sideLength * Math.sin(angle)
                        });
                    }
                    
                    bg.beginPath();
                    bg.moveTo(hexPoints[0].x, hexPoints[0].y);
                    for (let i = 1; i < 6; i++) {
                        bg.lineTo(hexPoints[i].x, hexPoints[i].y);
                    }
                    bg.closePath();
                    bg.fill();
                    
                    // Add border
                    const border = this.add.graphics();
                    border.lineStyle(3, strokeColor, 0.8);
                    border.beginPath();
                    border.moveTo(hexPoints[0].x, hexPoints[0].y);
                    for (let i = 1; i < 6; i++) {
                        border.lineTo(hexPoints[i].x, hexPoints[i].y);
                    }
                    border.closePath();
                    border.stroke();
                    
                    // Add state label
                    const stateText = this.add.text(0, -5, label, {
                        fontFamily: 'Share Tech Mono',
                        fontSize: '14px',
                        color: '#ffffff',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5);
                    
                    // Add brewing indicator if not empty
                    if (cell.state !== 'empty') {
                        const brewText = this.add.text(
                            0, 
                            15, 
                            `${cell.brewStage}/${cell.brewMax}`,
                            { 
                                fontFamily: 'Share Tech Mono', 
                                fontSize: '14px',
                                fill: '#FFFFFF',
                                stroke: '#000000',
                                strokeThickness: 2
                            }
                        ).setOrigin(0.5);
                        
                        // Add potency indicator if ready
                        if (cell.state === 'ready' && cell.potency > 0) {
                            const potencyText = this.add.text(
                                0,
                                35,
                                `⚡${cell.potency}`,
                                {
                                    fontFamily: 'Share Tech Mono',
                                    fontSize: '16px',
                                    fill: '#18ffff',
                                    stroke: '#000000',
                                    strokeThickness: 2
                                }
                            ).setOrigin(0.5);
                            cellContainer.add(potencyText);
                        }
                        
                        cellContainer.add(brewText);
                    }
                    
                    // Add all elements to the container
                    cellContainer.add(bg);
                    cellContainer.add(border);
                    cellContainer.add(stateText);
                    
                    // Make container interactive
                    cellContainer.setSize(cellSize, cellSize);
                    cellContainer.setInteractive({ useHandCursor: true })
                        .on('pointerdown', () => {
                            handleShadowCellClick(cellIndex);
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
            
            console.log(`Created ${this.gridCells.length} shadow grid cells`);
        };
        
        // Method to update shadow cell appearance
        NightScene.prototype.updateCellAppearance = function(cellIndex) {
            // Get the cell data and container
            const cell = shadowGrid.cells[cellIndex];
            const cellData = this.gridCells.find(c => c.index === cellIndex);
            if (!cell || !cellData || !cellData.container) return;
            
            const cellContainer = cellData.container;
            
            // Find elements in the container - bg, border, stateText, brewText, potencyText
            let bg = null, border = null, stateText = null, brewText = null, potencyText = null;
            cellContainer.list.forEach(item => {
                if (item.type === 'Graphics' && !item._lineWidth) {
                    bg = item;
                } else if (item.type === 'Graphics' && item._lineWidth) {
                    border = item;
                } else if (item.type === 'Text') {
                    if (item.text.includes('/')) {
                        brewText = item;
                    } else if (item.text.includes('⚡')) {
                        potencyText = item;
                    } else {
                        stateText = item;
                    }
                }
            });
            
            // Determine colors and text based on state
            let fillColor, strokeColor, label;
            switch(cell.state) {
                case 'brewing':
                    fillColor = 0x4a148c;  // Deep purple
                    strokeColor = 0x7c4dff; // Purple
                    label = "BREWING";
                    break;
                case 'distilling':
                    fillColor = 0x7c4dff;  // Purple
                    strokeColor = 0xe040fb; // Magenta
                    label = "DISTILLING";
                    break;
                case 'ready':
                    fillColor = 0xe040fb;  // Magenta
                    strokeColor = 0x18ffff; // Cyan
                    label = "READY";
                    break;
                default: // empty
                    fillColor = 0x212121;  // Dark gray
                    strokeColor = 0x424242; // Gray
                    label = "EMPTY";
            }
            
            const cellSize = this.gridConfig.cellSize;
            
            // Helper function to draw a hexagon
            const drawHexagon = (graphics, fillColorValue) => {
                const sideLength = cellSize / 2;
                const hexPoints = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 6;
                    hexPoints.push({
                        x: sideLength * Math.cos(angle),
                        y: sideLength * Math.sin(angle)
                    });
                }
                
                graphics.clear();
                graphics.fillStyle(fillColorValue, 1);
                graphics.beginPath();
                graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
                for (let i = 1; i < 6; i++) {
                    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
                }
                graphics.closePath();
                graphics.fill();
                
                return hexPoints;
            };
            
            // Update background
            if (bg) {
                const hexPoints = drawHexagon(bg, fillColor);
                
                // Update border
                if (border) {
                    border.clear();
                    border.lineStyle(3, strokeColor, 0.8);
                    border.beginPath();
                    border.moveTo(hexPoints[0].x, hexPoints[0].y);
                    for (let i = 1; i < 6; i++) {
                        border.lineTo(hexPoints[i].x, hexPoints[i].y);
                    }
                    border.closePath();
                    border.stroke();
                }
            }
            
            // Update text
            if (stateText) {
                stateText.setText(label);
            }
            
            // Update brewing indicator
            if (cell.state !== 'empty') {
                if (brewText) {
                    brewText.setText(`${cell.brewStage}/${cell.brewMax}`);
                    brewText.visible = true;
                } else {
                    // Create brewing indicator if missing
                    const newBrewText = this.add.text(
                        0, 
                        15, 
                        `${cell.brewStage}/${cell.brewMax}`,
                        { 
                            fontFamily: 'Share Tech Mono', 
                            fontSize: '14px',
                            fill: '#FFFFFF',
                            stroke: '#000000',
                            strokeThickness: 2
                        }
                    ).setOrigin(0.5);
                    cellContainer.add(newBrewText);
                }
                
                // Update potency indicator
                if (cell.state === 'ready' && cell.potency > 0) {
                    if (potencyText) {
                        potencyText.setText(`⚡${cell.potency}`);
                        potencyText.visible = true;
                    } else {
                        // Create potency indicator if missing
                        const newPotencyText = this.add.text(
                            0,
                            35,
                            `⚡${cell.potency}`,
                            {
                                fontFamily: 'Share Tech Mono',
                                fontSize: '16px',
                                fill: '#18ffff',
                                stroke: '#000000',
                                strokeThickness: 2
                            }
                        ).setOrigin(0.5);
                        cellContainer.add(newPotencyText);
                    }
                } else if (potencyText) {
                    potencyText.visible = false;
                }
            } else if (brewText) {
                brewText.visible = false;
            }
            
            // Add glow effects for cells that need attention
            if (cell.state === 'ready') {
                this.addGlowAnimation(cellContainer, cellIndex);
            } else if (cell.state === 'distilling') {
                this.addBubblingAnimation(cellContainer, cellIndex);
            }
        };
        
        // Method to update all shadow cells
        NightScene.prototype.updateAllCells = function() {
            // Update all cells in the grid
            for (let i = 0; i < this.gridCells.length; i++) {
                const cellData = this.gridCells[i];
                this.updateCellAppearance(cellData.index);
            }
        };
    } else {
        console.error("NightScene not found - shadow grid graphics cannot be initialized");
    }
}