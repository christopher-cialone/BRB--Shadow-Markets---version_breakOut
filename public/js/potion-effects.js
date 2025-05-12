// Potion effects for the game
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing potion effects system");
    
    // Function to add a visual potion effect to the current scene
    function addPotionEffect(potency = 1) {
        // Try to get the current Phaser scene
        let currentScene = null;
        try {
            if (window.game && window.game.scene) {
                // Check which scene is active
                const sceneMap = {
                    'MainMenuScene': window.game.scene.getScene('MainMenuScene'),
                    'RanchScene': window.game.scene.getScene('RanchScene'),
                    'SaloonScene': window.game.scene.getScene('SaloonScene'),
                    'NightScene': window.game.scene.getScene('NightScene')
                };
                
                for (const [name, scene] of Object.entries(sceneMap)) {
                    if (scene && scene.sys && scene.sys.settings.active) {
                        currentScene = scene;
                        break;
                    }
                }
            }
        } catch (e) {
            console.warn("Error finding current scene:", e);
        }
        
        // If we found a Phaser scene, add effect there
        if (currentScene) {
            try {
                addPhaserEffect(currentScene, potency);
                return;
            } catch (e) {
                console.warn("Error adding Phaser effect:", e);
            }
        }
        
        // Fallback: Use DOM-based effect if Phaser is unavailable
        addDOMEffect(potency);
    }
    
    // Add an effect using Phaser
    function addPhaserEffect(scene, potency) {
        try {
            const width = scene.cameras.main.width;
            const height = scene.cameras.main.height;
            const centerX = width / 2;
            const centerY = height / 2;
            
            // Create a glow effect with particles
            const particles = scene.add.particles('glow');
            
            const emitter = particles.createEmitter({
                x: centerX,
                y: centerY,
                speed: { min: 100, max: 200 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 0.7, end: 0 },
                lifespan: 1500,
                blendMode: 'ADD',
                tint: potency > 5 ? 0xff00ff : 0x7c4dff  // Purple/magenta based on potency
            });
            
            // Emit a burst of particles
            emitter.explode(20 * potency, centerX, centerY);
            
            // Add a text showing the effect
            const effectText = scene.add.text(
                centerX, 
                centerY - 100, 
                `+${10 * potency} Resources!`, 
                {
                    fontFamily: 'Anta',
                    fontSize: `${20 + potency}px`,
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4,
                    shadow: { color: '#7c4dff', fill: true, offsetX: 2, offsetY: 2, blur: 8 }
                }
            ).setOrigin(0.5);
            
            // Animate the text
            scene.tweens.add({
                targets: effectText,
                y: centerY - 150,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    effectText.destroy();
                    particles.destroy();
                }
            });
            
            console.log(`Added potion effect with potency ${potency} to scene`);
        } catch (e) {
            console.error("Failed to add potion effect:", e);
        }
    }
    
    // Add an effect using DOM (fallback)
    function addDOMEffect(potency) {
        // Create effect container
        const effectContainer = document.createElement('div');
        effectContainer.className = 'potion-effect-container';
        effectContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            z-index: 9999;
        `;
        
        // Create effect text
        const effectText = document.createElement('div');
        effectText.className = 'potion-effect-text';
        effectText.textContent = `+${10 * potency} Resources!`;
        effectText.style.cssText = `
            font-family: 'Anta', sans-serif;
            font-size: ${20 + potency}px;
            color: white;
            text-shadow: 0 0 10px #7c4dff, 0 0 20px #7c4dff, 2px 2px 2px black;
            transform: translateY(0);
            opacity: 1;
            animation: potion-effect-animation 2s forwards;
        `;
        
        // Create particles
        for (let i = 0; i < 20 * potency; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 8 + 4;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150 + 50;
            const duration = Math.random() * 1 + 1;
            const delay = Math.random() * 0.5;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${potency > 5 ? '#ff00ff' : '#7c4dff'};
                border-radius: 50%;
                top: calc(50% - ${size/2}px);
                left: calc(50% - ${size/2}px);
                transform: translate(0, 0);
                opacity: 0.7;
                animation: particle-animation ${duration}s ease-out ${delay}s forwards;
            `;
            
            // Set the final position based on angle and distance
            particle.style.setProperty('--endX', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--endY', `${Math.sin(angle) * distance}px`);
            
            effectContainer.appendChild(particle);
        }
        
        // Add style for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes potion-effect-animation {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-100px); opacity: 0; }
            }
            
            @keyframes particle-animation {
                0% { transform: translate(0, 0); opacity: 0.7; }
                100% { transform: translate(var(--endX), var(--endY)); opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
        effectContainer.appendChild(effectText);
        document.body.appendChild(effectContainer);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(effectContainer);
        }, 2500);
        
        console.log(`Added DOM-based potion effect with potency ${potency}`);
    }
    
    // Make the function available globally
    window.addPotionEffect = addPotionEffect;
});