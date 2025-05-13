# BRB Bull Run Boost Refactoring Plan

## Current Issues
- Multiple `MainMenuScene` declarations causing conflicts
- `RanchScene` reference issues 
- Shadow grid initialization problems
- Race bonus button session tracking issues
- Mixed DOM/Phaser approach causing rendering conflicts

## Refactoring Approach
We'll implement a more cohesive Phaser-based game as outlined in the requirements:

### 1. Create a Single Phaser Game Instance
- Create a unified Phaser configuration
- Define clear scene transitions
- Remove duplicate scene declarations

### 2. Implement Scene Structure
- `MainScene`: Map with character movement, ranch, field, pasture
- `SaloonScene`: Race mini-game (reusing existing logic)
- `EtherScene`: Night activities, crystal gathering, potion crafting

### 3. Simplify DOM Integration
- Use DOM only for UI elements (resource displays, notifications)
- Move all game logic and rendering to Phaser
- Use a clear communication pattern between Phaser and DOM

### 4. Preserve Working Features
- Keep the race mini-game functionality
- Maintain the cattle breeding system
- Preserve potion crafting mechanics

### 5. Implementation Steps
1. Create a new main game.js file with proper Phaser initialization
2. Implement the MainScene with character movement
3. Migrate SaloonScene functionality
4. Migrate NightScene (EtherScene) functionality
5. Connect all scenes with proper state management
6. Test each feature incrementally

### 6. Testing Plan
- Verify character movement in MainScene
- Test scene transitions (MainScene → SaloonScene, MainScene → EtherScene)
- Validate racing mini-game functionality
- Confirm cattle and farming mechanics work properly
- Ensure potion crafting functions correctly

This refactoring will address the root causes of our current issues while preserving the game mechanics and improving overall stability.