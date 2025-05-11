// Shadow grid cell state management
// This is a utility script specifically for shadow market cells

// Make sure we only run this if Phaser exists
if (typeof Phaser !== 'undefined') {
    // Initialize shadow cells
    function initShadowCells() {
        // Ensure cells are created for the shadow grid
        for (let i = 0; i < shadowGrid.size * shadowGrid.size; i++) {
            if (!shadowGrid.cells[i]) {
                shadowGrid.cells[i] = {
                    id: i,
                    state: 'empty-night',
                    stage: 0,
                    maxStage: 3,
                    yield: 0
                };
            }
        }
    }

    // Render shadow cells using Phaser Graphics (no sprites/textures)
    function renderShadowCell(scene, x, y, cellIndex) {
        const cell = shadowGrid.cells[cellIndex];
        const container = scene.add.container(x, y);
        
        // Determine colors and text based on state
        let fillColor, strokeColor, stateText;
        switch(cell.state) {
            case 'brewing':
                fillColor = 0x442288;
                strokeColor = 0xbb44ff;
                stateText = "BREWING";
                break;
            case 'distilling':
                fillColor = 0x553399;
                strokeColor = 0xcc66ff;
                stateText = "DISTILLING";
                break;
            case 'ready':
                fillColor = 0x664488;
                strokeColor = 0xff88ff;
                stateText = "READY!";
                break;
            default: // empty-night
                fillColor = 0x2a1155;
                strokeColor = 0x6622aa;
                stateText = "EMPTY";
        }
        
        // Create the cell background (square)
        const cellSize = 80;
        const bg = scene.add.graphics();
        bg.fillStyle(fillColor, 1);
        bg.fillRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
        
        // Add glow/border effect
        const border = scene.add.graphics();
        border.lineStyle(3, strokeColor, 0.8);
        border.strokeRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
        
        // Add state label text
        const label = scene.add.text(0, 0, stateText, {
            fontFamily: 'Share Tech Mono',
            fontSize: '14px',
            align: 'center',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Add progress indicator if not empty
        if (cell.state !== 'empty-night') {
            const progress = scene.add.text(
                0, 
                cellSize/2 - 15, 
                `${cell.stage || 0}/${cell.maxStage || 3}`,
                {
                    fontFamily: 'Share Tech Mono',
                    fontSize: '14px',
                    fill: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            container.add(progress);
        }
        
        // Add all elements to container
        container.add(bg);
        container.add(border);
        container.add(label);
        
        // Make container interactive
        container.setSize(cellSize, cellSize);
        container.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                handleShadowCellClick(cellIndex);
            });
        
        // Add entrance animation
        container.alpha = 0;
        container.scale = 0.7;
        
        scene.tweens.add({
            targets: container,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut',
            delay: cellIndex * 50 // Staggered appearance
        });
        
        // Add state-specific effects
        if (cell.state === 'brewing') {
            scene.tweens.add({
                targets: container,
                scaleX: { from: 0.98, to: 1.02 },
                scaleY: { from: 0.98, to: 1.02 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        } else if (cell.state === 'ready') {
            scene.tweens.add({
                targets: border,
                alpha: { from: 0.4, to: 1 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
        
        return container;
    }

    // Update shadow cell appearance
    function updateShadowCell(scene, cellContainer, cellIndex) {
        const cell = shadowGrid.cells[cellIndex];
        if (!cell || !cellContainer) return;
        
        // Find the components within the container
        let bg = null;
        let border = null;
        let label = null;
        let progress = null;
        
        for (let i = 0; i < cellContainer.list.length; i++) {
            const item = cellContainer.list[i];
            if (item.type === 'Graphics' && !item._lineWidth) {
                bg = item;
            } else if (item.type === 'Graphics' && item._lineWidth) {
                border = item;
            } else if (item.type === 'Text' && !item.text.includes('/')) {
                label = item;
            } else if (item.type === 'Text' && item.text.includes('/')) {
                progress = item;
            }
        }
        
        // Determine colors and text based on state
        let fillColor, strokeColor, stateText;
        switch(cell.state) {
            case 'brewing':
                fillColor = 0x442288;
                strokeColor = 0xbb44ff;
                stateText = "BREWING";
                break;
            case 'distilling':
                fillColor = 0x553399;
                strokeColor = 0xcc66ff;
                stateText = "DISTILLING";
                break;
            case 'ready':
                fillColor = 0x664488;
                strokeColor = 0xff88ff;
                stateText = "READY!";
                break;
            default: // empty-night
                fillColor = 0x2a1155;
                strokeColor = 0x6622aa;
                stateText = "EMPTY";
        }
        
        // Update background color
        if (bg) {
            const cellSize = 80;
            bg.clear();
            bg.fillStyle(fillColor, 1);
            bg.fillRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
        }
        
        // Update border color
        if (border) {
            const cellSize = 80;
            border.clear();
            border.lineStyle(3, strokeColor, 0.8);
            border.strokeRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
        }
        
        // Update state label text
        if (label) {
            label.setText(stateText);
        }
        
        // Update or create progress indicator
        if (cell.state !== 'empty-night') {
            if (progress) {
                progress.setText(`${cell.stage || 0}/${cell.maxStage || 3}`);
                progress.visible = true;
            } else {
                // Create new progress indicator if needed
                const cellSize = 80;
                const newProgress = scene.add.text(
                    0, 
                    cellSize/2 - 15, 
                    `${cell.stage || 0}/${cell.maxStage || 3}`,
                    {
                        fontFamily: 'Share Tech Mono',
                        fontSize: '14px',
                        fill: '#FFFFFF',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5);
                cellContainer.add(newProgress);
            }
        } else if (progress) {
            progress.visible = false;
        }
        
        // Clear existing tweens
        scene.tweens.killTweensOf(cellContainer);
        scene.tweens.killTweensOf(border);
        
        // Add state-specific effects
        if (cell.state === 'brewing') {
            scene.tweens.add({
                targets: cellContainer,
                scaleX: { from: 0.98, to: 1.02 },
                scaleY: { from: 0.98, to: 1.02 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        } else if (cell.state === 'ready') {
            scene.tweens.add({
                targets: border,
                alpha: { from: 0.4, to: 1 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
    }

    // Make these functions available globally
    window.initShadowCells = initShadowCells;
    window.renderShadowCell = renderShadowCell;
    window.updateShadowCell = updateShadowCell;
}