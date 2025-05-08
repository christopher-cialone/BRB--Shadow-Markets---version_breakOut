# Bull Run Boost – Shadow Markets of the Cyber-West

A 2.5D pixel art game with a cypherpunk Western theme, featuring day-night gameplay, mock blockchain integration, and educational financial mechanics.

## Project Overview

Bull Run Boost is a game that combines Western and cypherpunk aesthetics with educational financial mechanics. Players can:

- Choose between Entrepreneur and Adventurer archetypes
- Manage resources and breed cattle during the day in Cipher Gulch
- Gamble at the saloon with poker mini-games
- Craft and sell shadow potions at night in the Ether Range
- Experience day-night cycles with different gameplay environments
- Learn financial literacy concepts through gameplay

## Setup Instructions

### Prerequisites
- Unity Editor (2020.3 LTS or newer recommended)
- Basic understanding of Unity interface

### Import Steps
1. Create a new Unity 2D project
2. Import the provided C# scripts into your Assets/Scripts folder
3. Create the following scenes in your project:
   - MainMenu
   - DaytimeRanch
   - Saloon
   - EtherRange
4. Set up the scene hierarchy as described below
5. Import free pixel art assets from Unity Asset Store (e.g., "Pixel Art Top Down - Basic")
6. Configure the build settings to include all scenes

## Scene Setup

### Main Menu Scene
1. Create a new Scene named "MainMenu"
2. Add a Canvas with UI elements:
   - Background Image (Western desert)
   - Title Text ("Bull Run Boost")
   - Player Name Input Field
   - Character Selection Buttons (Entrepreneur, Adventurer)
   - Start Game Button
   - Stats Display Text
3. Add a GameManager empty object and attach:
   - GameManager.cs
   - PlayerData.cs
   - UIManager.cs
   - TransitionManager.cs
   - SoundManager.cs
4. Add a Camera and attach PixelPerfectSetup.cs

### Daytime Ranch Scene (Cipher Gulch)
1. Create a new Scene named "DaytimeRanch"
2. Set up a 2.5D environment with:
   - Background (Western plains)
   - Barn and fence sprites
   - Player character sprite
3. Add a Canvas with UI elements:
   - Resource Display (Hay, Water, $CATTLE)
   - Breed Cattle Button
   - Upgrade Barn Button
   - Go to Saloon Button
   - Enter Ether Range Button
   - Day Cycle Indicator (Sun icon)
   - Cattle List Panel (initially hidden)
   - Error Message Panel (initially hidden)
   - Tooltip Panels for educational content
4. Add a DaytimeRanchController and attach necessary scripts

### Saloon Scene
1. Create a new Scene named "Saloon"
2. Set up a 2.5D environment with:
   - Background (Wooden interior)
   - Poker table sprites
   - NPC sprites
3. Add a Canvas with UI elements:
   - $CATTLE Balance Display
   - Wager Slider (1-50 $CATTLE)
   - Play Poker Button
   - Back to Ranch Button
   - Result Panel (initially hidden)
   - Tooltip for risk management education
4. Add a SaloonController and attach necessary scripts

### Nighttime Ether Range Scene
1. Create a new Scene named "EtherRange"
2. Set up a 2.5D environment with:
   - Background (Dark forest with neon elements)
   - Market and workshop sprites
   - Player character sprite
3. Add a Canvas with UI elements:
   - $CATTLE Balance Display
   - Craft Shadow Potion Button
   - Sell Potion Button
   - Back to Ranch Button
   - Night Cycle Indicator (Moon icon)
   - Potion List Panel (initially hidden)
   - Error Message Panel (initially hidden)
   - Tooltip for supply/demand education
4. Add an EtherRangeController and attach necessary scripts

## Features Implementation

### Character Selection
- Use CharacterSelection.cs to handle archetype selection
- Entrepreneur gives +10% $CATTLE earning rate
- Adventurer gives +10% heist success rate (future feature)

### Resource Management
- PlayerData.cs manages all player resources:
  - $CATTLE (cryptocurrency balance)
  - Hay and Water (for breeding cattle)
  - Barn capacity (upgradeable)

### Cattle Breeding
- Breed cattle by spending 10 Hay and 10 Water
- Each cattle has random Speed and Milk traits
- Simulates minting NFTs on blockchain (mock implementation)

### Saloon Poker Game
- 50/50 chance of winning
- 10% of wager is "burned" from supply
- Win gives 2x wager after burn
- Educational element teaches risk management

### Shadow Potion Crafting
- Craft potions at night in Ether Range
- Each potion costs 20 $CATTLE with 50% burn
- Potions have random Potency stats
- Sell for 25-35 $CATTLE (random market price)

### Sticky Note Printer
- Optional feature to "print" game progress
- Generate digital sticky notes with player stats
- Choose between To-Do and Tip templates
- Simulates printing process (for future hardware integration)

### Educational Elements
- Tooltips throughout gameplay:
  - Ranch: Budgeting and investment
  - Saloon: Risk management
  - Ether Range: Supply/demand economics
- Financial tips on sticky notes

## Future Enhancements
- Real Solana blockchain integration
- Heist missions for Adventurer archetype
- More archetypes with unique bonuses
- Physical sticky note printing via Bluetooth
- Expanded game world with additional locations

## Credits
- Developed as a financial literacy game with cypherpunk Western theme
- Uses free assets from Unity Asset Store
- Designed for easy expansion and future integration with real blockchain
