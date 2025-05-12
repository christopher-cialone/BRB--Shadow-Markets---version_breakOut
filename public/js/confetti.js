/**
 * Confetti Effect Module
 * Creates a celebratory confetti effect
 */

// Create a confetti effect
function createConfetti() {
    console.log('Creating confetti effect');
    
    // Create canvas for confetti if it doesn't exist
    let confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) {
        confettiCanvas = document.createElement('canvas');
        confettiCanvas.id = 'confetti-canvas';
        confettiCanvas.style.position = 'fixed';
        confettiCanvas.style.top = '0';
        confettiCanvas.style.left = '0';
        confettiCanvas.style.width = '100%';
        confettiCanvas.style.height = '100%';
        confettiCanvas.style.pointerEvents = 'none';
        confettiCanvas.style.zIndex = '9999';
        document.body.appendChild(confettiCanvas);
    }
    
    // Set canvas dimensions
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    // Get context
    const ctx = confettiCanvas.getContext('2d');
    
    // Confetti particles
    const particles = [];
    const particleCount = 150;
    const gravity = 0.5;
    const colors = [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
        '#009688', '#4CAF50', '#8BC34A', '#CDDC39', 
        '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
    
    // Animation
    let frameCount = 0;
    const maxFrames = 200; // Animation duration
    
    function animate() {
        frameCount++;
        
        // Clear canvas
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // Move particle
            p.y += p.speed;
            p.rotation += p.rotationSpeed;
            
            // Draw particle
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            
            ctx.restore();
            
            // Reset particle if it goes off screen
            if (p.y > confettiCanvas.height) {
                particles[i] = {
                    x: Math.random() * confettiCanvas.width,
                    y: -10,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 10 + 5,
                    speed: Math.random() * 3 + 2,
                    angle: Math.random() * 360,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 10 - 5
                };
            }
        }
        
        // Continue animation or clean up
        if (frameCount < maxFrames) {
            requestAnimationFrame(animate);
        } else {
            // Fade out
            confettiCanvas.style.transition = 'opacity 1s';
            confettiCanvas.style.opacity = '0';
            setTimeout(() => {
                if (confettiCanvas.parentNode) {
                    confettiCanvas.parentNode.removeChild(confettiCanvas);
                }
            }, 1000);
        }
    }
    
    // Start animation
    animate();
}

// Export function globally
window.createConfetti = createConfetti;