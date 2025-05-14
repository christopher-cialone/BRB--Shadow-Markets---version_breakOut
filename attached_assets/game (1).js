(function() {
    'use strict';
    
    // ... (previous game.js code remains unchanged until scene initialization)

    // Ensure Phaser game instance is created
    if (!window.game) {
        window.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'game-container',
            scene: [MainMenuScene, RanchScene, SaloonScene, NightScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        });
    }

    // Function to initialize or restart scenes
    function initializeScenes() {
        if (game && game.scene) {
            // Stop all scenes to avoid duplicates
            game.scene.stop('MainMenuScene');
            game.scene.stop('RanchScene');
            game.scene.stop('SaloonScene');
            game.scene.stop('NightScene');

            // Start the appropriate scene based on currentScene
            switch (currentScene) {
                case 'ranch':
                    game.scene.start('RanchScene');
                    initRanchGrid();
                    break;
                case 'night':
                    game.scene.start('NightScene');
                    initNightGrid();
                    break;
                case 'saloon':
                    game.scene.start('SaloonScene');
                    break;
                default:
                    game.scene.start('MainMenuScene');
            }

            // Reattach event listeners
            attachButtonListeners();
        }
    }

    // Initialize Ranch Grid
    function initRanchGrid() {
        const ranchScene = game.scene.getScene('RanchScene');
        if (ranchScene && ranchScene.initPhaserGrid) {
            ranchScene.initPhaserGrid();
            ranchScene.updateAllCells(); // Force grid render
        }
    }

    // Initialize Night Grid (Ether Range)
    function initNightGrid() {
        const nightScene = game.scene.getScene('NightScene');
        if (nightScene && nightScene.initPhaserGrid) {
            nightScene.initPhaserGrid();
            nightScene.updateAllCells(); // Force grid render
        }
    }

    // Attach button listeners
    function attachButtonListeners() {
        // Ranch buttons
        const harvestAllBtn = document.getElementById('harvest-all');
        if (harvestAllBtn) {
            harvestAllBtn.onclick = () => harvestAllRanchCells();
        }

        // Night buttons
        const distillAllBtn = document.getElementById('distill-all');
        if (distillAllBtn) {
            distillAllBtn.onclick = () => distillAllShadowCells();
        }

        // Travel buttons
        document.querySelectorAll('.travel-button').forEach(btn => {
            btn.onclick = () => {
                currentScene = btn.dataset.scene;
                initializeScenes();
                switchScene(currentScene);
            };
        });
    }

    // Update switchScene to trigger scene initialization
    function switchScene(scene) {
        currentScene = scene;
        document.querySelectorAll('.scene').forEach(el => el.classList.add('hidden'));
        document.getElementById(`${scene}-ui`).classList.remove('hidden');
        initializeScenes();
    }

    // Call initializeScenes on load
    document.addEventListener('DOMContentLoaded', () => {
        initializeScenes();
        // ... (rest of the existing DOMContentLoaded code)
    });

    // ... (rest of the game.js code remains unchanged)

    // Ensure NightScene class (add if missing)
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

                for (let row = 0; row < size; row++) {
                    for (let col = 0; col < size; col++) {
                        const cellIndex = row * size + col;
                        const x = this.gridConfig.startX + col * (cellSize + padding);
                        const y = this.gridConfig.startY + row * (cellSize + padding);
                        const cellSprite = this.add.image(x, y, 'cell-empty').setDisplaySize(cellSize, cellSize);
                        cellSprite.setInteractive().on('pointerdown', () => handleShadowCellClick(cellIndex));
                        this.gridCells.push({ sprite: cellSprite, index: cellIndex });
                        this.gridContainer.add(cellSprite);
                    }
                }
            }

            updateCellAppearance(cellIndex) {
                const cell = shadowGrid.cells[cellIndex];
                const cellObj = this.gridCells[cellIndex];
                if (!cellObj || !cellObj.sprite) return;
                let spriteName = 'cell-empty';
                if (cell.state === 'brewing') spriteName = 'cell-brewing';
                if (cell.state === 'distilling') spriteName = 'cell-distilling';
                if (cell.state === 'ready') spriteName = 'cell-ready';
                cellObj.sprite.setTexture(spriteName);
            }

            updateAllCells() {
                shadowGrid.cells.forEach((_, index) => this.updateCellAppearance(index));
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
                this.gridCells.forEach((cellObj, index) => {
                    const row = Math.floor(index / size);
                    const col = index % size;
                    const x = startX + col * (cellSize + padding);
                    const y = startY + row * (cellSize + padding);
                    cellObj.sprite.setPosition(x, y);
                });
            }
        };
    }

    // ... (rest of the game.js code)
})();