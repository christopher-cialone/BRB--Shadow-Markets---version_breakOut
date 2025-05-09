// Simple confetti animation
function createConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.body.appendChild(confettiContainer);
  
  // Create confetti pieces
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
  
  // Create 150 confetti pieces
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random properties
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 5; // 5-15px
      const angle = Math.random() * 360; // 0-360 degrees
      const xStart = Math.random() * 100; // 0-100%
      const xEnd = xStart + (Math.random() * 30 - 15); // Random drift
      
      // Set properties
      confetti.style.backgroundColor = color;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.transform = `rotate(${angle}deg)`;
      confetti.style.left = `${xStart}%`;
      
      // Add to container
      confettiContainer.appendChild(confetti);
      
      // Animate falling with CSS
      confetti.animate([
        { top: '-5%', left: `${xStart}%`, opacity: 1 },
        { top: '100%', left: `${xEnd}%`, opacity: 0 }
      ], {
        duration: Math.random() * 2000 + 1500, // 1.5-3.5s
        easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
      });
      
      // Remove after animation
      setTimeout(() => {
        confetti.remove();
      }, 3500);
    }, Math.random() * 500); // Stagger creation
  }
  
  // Remove container after animation complete
  setTimeout(() => {
    confettiContainer.remove();
  }, 5000);
}