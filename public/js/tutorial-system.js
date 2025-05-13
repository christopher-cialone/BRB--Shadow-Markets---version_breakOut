/**
 * Tutorial System for Bull Run Boost
 * 
 * This module creates contextual tutorials for each game section:
 * - Ranch (cattle breeding, milk collection)
 * - Saloon (card racing, betting)
 * - Night Market (shadow brewing, potion crafting)
 */

(function() {
    // Tutorial state
    const tutorialState = {
        // Track which tutorials have been viewed
        viewed: {},
        
        // Current active tutorial
        active: null,
        
        // Tutorial definitions by scene and feature
        tutorials: {
            // Main menu tutorials
            mainMenu: [
                {
                    id: 'welcome',
                    title: 'Welcome to Bull Run Boost!',
                    text: 'This cypherpunk western game combines cattle ranching with shadow market activities. Click through this tutorial to learn the basics.',
                    position: 'center',
                    highlight: '#game-title',
                    next: 'game-overview'
                },
                {
                    id: 'game-overview',
                    title: 'Game Overview',
                    text: 'During the day, manage your ranch and breed cattle. At night, craft shadow potions. Visit the saloon to race and earn $CATTLE tokens!',
                    position: 'center',
                    highlight: '#start-game',
                    next: null
                }
            ],
            
            // Ranch tutorials
            ranch: [
                {
                    id: 'ranch-intro',
                    title: 'Your Cattle Ranch',
                    text: 'This is your ranch where you can breed cattle and collect milk. Click on cattle to see their stats and breeding options.',
                    position: 'bottom',
                    highlight: '.ranch-grid',
                    next: 'cattle-breeding'
                },
                {
                    id: 'cattle-breeding',
                    title: 'Cattle Breeding',
                    text: 'Select two compatible cattle to breed them and create new cattle with combined traits. Better traits mean more milk production!',
                    position: 'right',
                    highlight: '#breed-cattle',
                    next: 'milk-collection'
                },
                {
                    id: 'milk-collection',
                    title: 'Milk Collection',
                    text: 'Click on a cow to milk it and collect from your cattle. Milk is automatically converted to $CATTLE tokens.',
                    position: 'bottom',
                    highlight: '#ranch-grid',
                    next: null
                }
            ],
            
            // Saloon tutorials
            saloon: [
                {
                    id: 'saloon-intro',
                    title: 'The Saloon',
                    text: 'Welcome to the saloon! Here you can bet on card races to win more $CATTLE tokens. The house takes 10% of all bets as a burn fee.',
                    position: 'top',
                    highlight: '#saloon-title',
                    next: 'betting'
                },
                {
                    id: 'betting',
                    title: 'Card Racing & Betting',
                    text: 'Click on a card suit to place your bet. The odds are displayed next to each suit. The higher the odds, the bigger the potential payout!',
                    position: 'bottom',
                    highlight: '.betting-container',
                    next: 'race-mechanics'
                },
                {
                    id: 'race-mechanics',
                    title: 'Race Mechanics',
                    text: 'After placing bets, start the race and draw cards. When a suit reaches 100%, it wins! If you bet on the winner, you earn tokens based on the odds.',
                    position: 'bottom',
                    highlight: '#draw-card-btn',
                    next: 'bonus'
                },
                {
                    id: 'bonus',
                    title: 'Daily Bonus',
                    text: 'New players can claim a bonus of 50 $CATTLE tokens once per session. Use these to place bets and grow your bankroll!',
                    position: 'left',
                    highlight: '#claim-bonus',
                    next: null
                }
            ],
            
            // Night market tutorials
            night: [
                {
                    id: 'night-intro',
                    title: 'Shadow Market',
                    text: 'As night falls, your ranch transforms into a shadow market where you can brew special potions with magical effects.',
                    position: 'top',
                    highlight: '#night-title',
                    next: 'brewing'
                },
                {
                    id: 'brewing',
                    title: 'Shadow Brewing',
                    text: 'Select a cell in the grid to start brewing a shadow essence. Different positions create potions with varied effects and potency.',
                    position: 'bottom',
                    highlight: '.night-grid',
                    next: 'potion-usage'
                },
                {
                    id: 'potion-usage',
                    title: 'Using Potions',
                    text: 'Crafted potions can be used to enhance your cattle breeding, increase milk production, or improve your odds at the saloon races!',
                    position: 'right',
                    highlight: '#potion-inventory',
                    next: null
                }
            ],
            
            // Profile tutorials
            profile: [
                {
                    id: 'profile-intro',
                    title: 'Player Profile',
                    text: 'This is your profile page. Here you can see your stats, achievements, and customize your character.',
                    position: 'top',
                    highlight: '#profile-title',
                    next: 'character-selection'
                },
                {
                    id: 'character-selection',
                    title: 'Character Selection',
                    text: 'Choose between different character archetypes, each with unique bonuses to different game mechanics.',
                    position: 'bottom',
                    highlight: '#character-select',
                    next: null
                }
            ]
        }
    };
    
    // Initialize tutorial system
    function initTutorialSystem() {
        console.log("Initializing tutorial system");
        
        // Create tutorial overlay container if it doesn't exist
        createTutorialContainer();
        
        // Add tutorial buttons to UI
        addTutorialButtons();
        
        // Setup event listeners for scene changes
        setupSceneChangeListeners();
        
        // Check if this is first time playing and show welcome tutorial
        if (!localStorage.getItem('brb_tutorial_viewed_welcome')) {
            // Short delay to ensure everything is loaded
            setTimeout(() => {
                showTutorial('mainMenu', 'welcome');
            }, 1000);
        }
        
        console.log("Tutorial system initialized");
    }
    
    // Create the tutorial container
    function createTutorialContainer() {
        // Check if container already exists
        if (document.getElementById('tutorial-overlay')) {
            return;
        }
        
        // Create container
        const tutorialContainer = document.createElement('div');
        tutorialContainer.id = 'tutorial-overlay';
        tutorialContainer.className = 'hidden';
        
        // Create inner elements
        tutorialContainer.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-box">
                <div class="tutorial-header">
                    <h3 id="tutorial-title">Tutorial Title</h3>
                    <button id="tutorial-close">×</button>
                </div>
                <div class="tutorial-content">
                    <p id="tutorial-text">Tutorial text goes here</p>
                </div>
                <div class="tutorial-footer">
                    <button id="tutorial-next">Next</button>
                    <button id="tutorial-skip">Skip All</button>
                </div>
            </div>
            <div id="tutorial-highlight" class="hidden"></div>
        `;
        
        // Add to document
        document.body.appendChild(tutorialContainer);
        
        // Add event listeners
        document.getElementById('tutorial-close').addEventListener('click', hideTutorial);
        document.getElementById('tutorial-skip').addEventListener('click', skipAllTutorials);
        document.getElementById('tutorial-next').addEventListener('click', showNextTutorial);
        
        // Add CSS
        addTutorialStyles();
    }
    
    // Add CSS styles for tutorial
    function addTutorialStyles() {
        // Check if styles already exist
        if (document.getElementById('tutorial-styles')) {
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'tutorial-styles';
        
        // Add CSS
        style.textContent = `
            #tutorial-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                pointer-events: none;
            }
            
            #tutorial-overlay.hidden {
                display: none;
            }
            
            .tutorial-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                pointer-events: all;
            }
            
            .tutorial-box {
                position: absolute;
                width: 350px;
                background: #1a1a2e;
                border: 2px solid #e94560;
                border-radius: 10px;
                padding: 15px;
                color: #fff;
                box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
                pointer-events: all;
                z-index: 1001;
                font-family: 'Share Tech Mono', monospace;
            }
            
            .tutorial-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                border-bottom: 1px solid #e94560;
                padding-bottom: 5px;
            }
            
            .tutorial-header h3 {
                margin: 0;
                color: #e94560;
                font-size: 1.2em;
            }
            
            #tutorial-close {
                background: none;
                border: none;
                color: #e94560;
                font-size: 1.5em;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .tutorial-content {
                margin-bottom: 15px;
                line-height: 1.4;
            }
            
            .tutorial-footer {
                display: flex;
                justify-content: space-between;
            }
            
            #tutorial-next, #tutorial-skip {
                background: #e94560;
                color: #fff;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-family: 'Share Tech Mono', monospace;
                transition: background 0.3s;
            }
            
            #tutorial-next:hover, #tutorial-skip:hover {
                background: #ff6b81;
            }
            
            #tutorial-highlight {
                position: absolute;
                box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.7);
                z-index: 999;
                border-radius: 4px;
                pointer-events: none;
                transition: all 0.3s ease;
                border: 2px solid #e94560;
                animation: pulse 2s infinite;
            }
            
            #tutorial-highlight.hidden {
                display: none;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.7), 0 0 0 0 rgba(233, 69, 96, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.7), 0 0 0 10px rgba(233, 69, 96, 0);
                }
                100% {
                    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.7), 0 0 0 0 rgba(233, 69, 96, 0);
                }
            }
            
            .help-button {
                background: #e94560;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                transition: background 0.3s, transform 0.3s;
            }
            
            .help-button:hover {
                background: #ff6b81;
                transform: scale(1.1);
            }
        `;
        
        // Add to document
        document.head.appendChild(style);
    }
    
    // Add tutorial buttons to scene headers
    function addTutorialButtons() {
        const sceneHeaders = {
            'ranch': '#ranch-title',
            'saloon': '#saloon-title',
            'night': '#night-title',
            'profile': '#profile-title'
        };
        
        // Add button to each scene header
        for (const scene in sceneHeaders) {
            const headerElement = document.querySelector(sceneHeaders[scene]);
            if (headerElement && !headerElement.querySelector('.help-button')) {
                const helpButton = document.createElement('button');
                helpButton.className = 'help-button';
                helpButton.textContent = '?';
                helpButton.setAttribute('data-scene', scene);
                helpButton.addEventListener('click', function() {
                    // Show first tutorial for this scene
                    const tutorials = tutorialState.tutorials[scene];
                    if (tutorials && tutorials.length > 0) {
                        showTutorial(scene, tutorials[0].id);
                    }
                });
                
                headerElement.appendChild(helpButton);
            }
        }
        
        // Also add to main menu
        const gameTitle = document.querySelector('#game-title');
        if (gameTitle && !gameTitle.querySelector('.help-button')) {
            const helpButton = document.createElement('button');
            helpButton.className = 'help-button';
            helpButton.textContent = '?';
            helpButton.setAttribute('data-scene', 'mainMenu');
            helpButton.addEventListener('click', function() {
                // Show first tutorial for main menu
                const tutorials = tutorialState.tutorials.mainMenu;
                if (tutorials && tutorials.length > 0) {
                    showTutorial('mainMenu', tutorials[0].id);
                }
            });
            
            gameTitle.appendChild(helpButton);
        }
    }
    
    // Setup listeners for scene changes
    function setupSceneChangeListeners() {
        document.addEventListener('scene-changed', function(e) {
            if (e.detail && e.detail.scene) {
                // Add tutorial buttons if they don't exist
                setTimeout(addTutorialButtons, 200);
                
                // Check if tutorials for this scene have been viewed
                const scene = e.detail.scene;
                if (tutorialState.tutorials[scene] && !localStorage.getItem(`brb_tutorial_viewed_${scene}`)) {
                    // Show first tutorial for this scene
                    setTimeout(() => {
                        const tutorials = tutorialState.tutorials[scene];
                        if (tutorials && tutorials.length > 0) {
                            showTutorial(scene, tutorials[0].id);
                        }
                    }, 500);
                }
            }
        });
    }
    
    // Show a specific tutorial
    function showTutorial(scene, tutorialId) {
        // Find the tutorial
        const tutorials = tutorialState.tutorials[scene];
        if (!tutorials) return;
        
        const tutorial = tutorials.find(t => t.id === tutorialId);
        if (!tutorial) return;
        
        // Set active tutorial
        tutorialState.active = { scene, id: tutorialId };
        
        // Get tutorial elements
        const overlay = document.getElementById('tutorial-overlay');
        const title = document.getElementById('tutorial-title');
        const text = document.getElementById('tutorial-text');
        const nextButton = document.getElementById('tutorial-next');
        
        // Set content
        title.textContent = tutorial.title;
        text.textContent = tutorial.text;
        
        // Manage next button
        if (tutorial.next) {
            nextButton.style.display = 'block';
            nextButton.dataset.nextId = tutorial.next;
        } else {
            nextButton.style.display = 'none';
        }
        
        // Show overlay
        overlay.classList.remove('hidden');
        
        // Highlight element if specified
        if (tutorial.highlight) {
            highlightElement(tutorial.highlight, tutorial.position);
        } else {
            // No highlight, center the tutorial box
            const tutorialBox = document.querySelector('.tutorial-box');
            tutorialBox.style.top = '50%';
            tutorialBox.style.left = '50%';
            tutorialBox.style.transform = 'translate(-50%, -50%)';
            
            // Hide highlight element
            document.getElementById('tutorial-highlight').classList.add('hidden');
        }
        
        // Mark as viewed
        markTutorialAsViewed(tutorialId);
    }
    
    // Highlight an element
    function highlightElement(selector, position = 'bottom') {
        const element = document.querySelector(selector);
        if (!element) {
            // Element not found, hide highlight and center the tutorial box
            document.getElementById('tutorial-highlight').classList.add('hidden');
            const tutorialBox = document.querySelector('.tutorial-box');
            tutorialBox.style.top = '50%';
            tutorialBox.style.left = '50%';
            tutorialBox.style.transform = 'translate(-50%, -50%)';
            return;
        }
        
        // Get element position and dimensions
        const rect = element.getBoundingClientRect();
        
        // Set highlight position and size
        const highlight = document.getElementById('tutorial-highlight');
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        highlight.style.top = `${rect.top}px`;
        highlight.style.left = `${rect.left}px`;
        highlight.classList.remove('hidden');
        
        // Position tutorial box based on specified position
        const tutorialBox = document.querySelector('.tutorial-box');
        const boxWidth = 350; // Width from CSS
        const boxHeight = 200; // Approximate height
        
        switch (position) {
            case 'top':
                tutorialBox.style.top = `${rect.top - boxHeight - 10}px`;
                tutorialBox.style.left = `${rect.left + (rect.width / 2) - (boxWidth / 2)}px`;
                tutorialBox.style.transform = 'none';
                break;
            
            case 'bottom':
                tutorialBox.style.top = `${rect.bottom + 10}px`;
                tutorialBox.style.left = `${rect.left + (rect.width / 2) - (boxWidth / 2)}px`;
                tutorialBox.style.transform = 'none';
                break;
            
            case 'left':
                tutorialBox.style.top = `${rect.top + (rect.height / 2) - (boxHeight / 2)}px`;
                tutorialBox.style.left = `${rect.left - boxWidth - 10}px`;
                tutorialBox.style.transform = 'none';
                break;
            
            case 'right':
                tutorialBox.style.top = `${rect.top + (rect.height / 2) - (boxHeight / 2)}px`;
                tutorialBox.style.left = `${rect.right + 10}px`;
                tutorialBox.style.transform = 'none';
                break;
            
            case 'center':
            default:
                tutorialBox.style.top = '50%';
                tutorialBox.style.left = '50%';
                tutorialBox.style.transform = 'translate(-50%, -50%)';
        }
        
        // Make sure tutorial box stays within viewport
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Get updated position
        const boxRect = tutorialBox.getBoundingClientRect();
        
        // Adjust if outside viewport
        if (boxRect.left < 10) {
            tutorialBox.style.left = '10px';
        } else if (boxRect.right > viewport.width - 10) {
            tutorialBox.style.left = `${viewport.width - boxWidth - 10}px`;
        }
        
        if (boxRect.top < 10) {
            tutorialBox.style.top = '10px';
        } else if (boxRect.bottom > viewport.height - 10) {
            tutorialBox.style.top = `${viewport.height - boxHeight - 10}px`;
        }
    }
    
    // Show next tutorial in sequence
    function showNextTutorial() {
        if (!tutorialState.active) return;
        
        const { scene, id } = tutorialState.active;
        const tutorials = tutorialState.tutorials[scene];
        if (!tutorials) return;
        
        const currentIndex = tutorials.findIndex(t => t.id === id);
        if (currentIndex === -1) return;
        
        const currentTutorial = tutorials[currentIndex];
        
        // Check if there's a specific next tutorial
        if (currentTutorial.next) {
            showTutorial(scene, currentTutorial.next);
        } else if (currentIndex < tutorials.length - 1) {
            // Show next tutorial in array
            showTutorial(scene, tutorials[currentIndex + 1].id);
        } else {
            // No more tutorials in this scene
            hideTutorial();
            
            // Mark entire scene as viewed
            localStorage.setItem(`brb_tutorial_viewed_${scene}`, 'true');
        }
    }
    
    // Hide the tutorial overlay
    function hideTutorial() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        // Clear active tutorial
        tutorialState.active = null;
    }
    
    // Skip all tutorials
    function skipAllTutorials() {
        // Hide current tutorial
        hideTutorial();
        
        // Mark all scenes as viewed
        for (const scene in tutorialState.tutorials) {
            localStorage.setItem(`brb_tutorial_viewed_${scene}`, 'true');
            
            // Also mark individual tutorials
            const tutorials = tutorialState.tutorials[scene];
            tutorials.forEach(tutorial => {
                markTutorialAsViewed(tutorial.id);
            });
        }
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('Tutorials disabled. You can re-enable them by clicking the ? buttons.', 'info');
        }
    }
    
    // Mark a tutorial as viewed
    function markTutorialAsViewed(tutorialId) {
        tutorialState.viewed[tutorialId] = true;
        localStorage.setItem(`brb_tutorial_viewed_${tutorialId}`, 'true');
    }
    
    // Reset tutorial viewing history (for testing)
    function resetTutorials() {
        // Clear local storage for tutorials
        for (const key in localStorage) {
            if (key.startsWith('brb_tutorial_viewed_')) {
                localStorage.removeItem(key);
            }
        }
        
        // Clear viewed state
        tutorialState.viewed = {};
        
        // Show first tutorial
        showTutorial('mainMenu', 'welcome');
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('All tutorials have been reset.', 'info');
        }
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initTutorialSystem);
    
    // Expose methods to global scope for debugging and manual triggering
    window.tutorialSystem = {
        init: initTutorialSystem,
        show: showTutorial,
        hide: hideTutorial,
        reset: resetTutorials,
        getState: () => tutorialState
    };
    
    console.log("Tutorial system module loaded");
})();