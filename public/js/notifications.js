/**
 * Notifications Module
 * Handles consistent notification display throughout the game
 */

// Show a notification message
function showNotification(message, type = 'info', autoClose = true) {
    console.log(`Notification (${type}): ${message}`);
    
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = function() {
        notification.remove();
    };
    notification.appendChild(closeBtn);
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto-close after delay if specified
    if (autoClose) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 500);
            }
        }, 4000);
    }
    
    return notification;
}

// Show a result dialog (more prominent than a notification)
function showResult(title, message, type = 'info', autoClose = false) {
    console.log(`Result (${type}): ${title} - ${message}`);
    
    // Create or get result container
    let resultContainer = document.getElementById('result-container');
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'result-container';
        document.body.appendChild(resultContainer);
    }
    
    // Create result dialog
    const resultDialog = document.createElement('div');
    resultDialog.className = `result-dialog ${type}`;
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.className = 'result-title';
    titleElement.textContent = title;
    resultDialog.appendChild(titleElement);
    
    // Add message
    const messageElement = document.createElement('p');
    messageElement.className = 'result-message';
    messageElement.textContent = message;
    resultDialog.appendChild(messageElement);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'result-close-btn';
    closeBtn.textContent = 'Close';
    closeBtn.onclick = function() {
        resultDialog.remove();
    };
    resultDialog.appendChild(closeBtn);
    
    // Add to container
    resultContainer.appendChild(resultDialog);
    
    // Auto-close after delay if specified
    if (autoClose) {
        setTimeout(() => {
            if (resultDialog.parentNode) {
                resultDialog.classList.add('fade-out');
                setTimeout(() => {
                    if (resultDialog.parentNode) {
                        resultDialog.remove();
                    }
                }, 500);
            }
        }, 5000);
    }
    
    return resultDialog;
}

// Show win celebration with confetti
function showWinCelebration(amount) {
    console.log(`Win celebration: +${amount}`);
    
    // Create confetti if available
    if (typeof createConfetti === 'function') {
        createConfetti();
    }
    
    // Get or create celebration overlay
    let celebration = document.getElementById('win-celebration');
    if (!celebration) {
        celebration = document.createElement('div');
        celebration.id = 'win-celebration';
        celebration.className = 'celebration-overlay hidden';
        
        const winContent = document.createElement('div');
        winContent.className = 'celebration-content';
        
        const winTitle = document.createElement('h2');
        winTitle.textContent = 'YOU WIN!';
        winContent.appendChild(winTitle);
        
        const winAmount = document.createElement('div');
        winAmount.id = 'win-amount';
        winAmount.className = 'celebration-amount';
        winContent.appendChild(winAmount);
        
        celebration.appendChild(winContent);
        document.body.appendChild(celebration);
    }
    
    // Set amount and show
    const winAmountElement = document.getElementById('win-amount');
    if (winAmountElement) {
        winAmountElement.textContent = `+${amount.toFixed(2)} $CATTLE`;
    }
    
    celebration.classList.remove('hidden');
    
    // Hide after animation
    setTimeout(() => {
        celebration.classList.add('hidden');
    }, 3500);
}

// Export functions globally
window.showNotification = showNotification;
window.showResult = showResult;
window.showWinCelebration = showWinCelebration;