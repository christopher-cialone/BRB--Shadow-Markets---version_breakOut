// Unified notification system for the game
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing notification system");
    
    // Create notifications container if it doesn't exist
    if (!document.getElementById('notifications')) {
        const notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'notifications';
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
        
        // Add some basic styling
        const style = document.createElement('style');
        style.textContent = `
            .notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 300px;
                z-index: 9999;
            }
            
            .notification {
                padding: 12px 16px;
                margin-bottom: 10px;
                border-radius: 4px;
                color: white;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                font-family: 'Roboto', sans-serif;
                animation: slideIn 0.3s ease forwards;
                position: relative;
                overflow: hidden;
            }
            
            .notification::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                width: 100%;
                background: rgba(255, 255, 255, 0.5);
                animation: shrink 5s linear forwards;
            }
            
            .notification.success {
                background-color: #4caf50;
            }
            
            .notification.error {
                background-color: #f44336;
            }
            
            .notification.info {
                background-color: #2196f3;
            }
            
            .notification.warning {
                background-color: #ff9800;
            }
            
            @keyframes slideIn {
                from { transform: translateX(110%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes shrink {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Main notification function
    function showNotification(message, type = 'info', autoClose = true) {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to container
        notifications.appendChild(notification);
        
        // Auto-remove after timeout unless specified otherwise
        if (autoClose) {
            setTimeout(() => {
                if (notification.parentNode === notifications) {
                    notifications.removeChild(notification);
                }
            }, 5000);
        }
        
        // Add click to dismiss
        notification.addEventListener('click', () => {
            if (notification.parentNode === notifications) {
                notifications.removeChild(notification);
            }
        });
        
        return notification;
    }
    
    // Result modal function for bigger messages
    function showResult(title, message, type = 'info', autoClose = false) {
        // Create modal container if it doesn't exist
        let resultModal = document.getElementById('result-modal');
        
        if (!resultModal) {
            resultModal = document.createElement('div');
            resultModal.id = 'result-modal';
            resultModal.className = 'result-modal hidden';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const modalTitle = document.createElement('h2');
            modalTitle.id = 'result-title';
            modalContent.appendChild(modalTitle);
            
            const modalMessage = document.createElement('p');
            modalMessage.id = 'result-message';
            modalContent.appendChild(modalMessage);
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.className = 'close-modal-btn';
            closeButton.addEventListener('click', () => {
                resultModal.classList.add('hidden');
            });
            modalContent.appendChild(closeButton);
            
            resultModal.appendChild(modalContent);
            document.body.appendChild(resultModal);
            
            // Add modal styling
            const style = document.createElement('style');
            style.textContent = `
                .result-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .modal-content {
                    background-color: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                    border: 2px solid #7c4dff;
                }
                
                .modal-content.success { border-color: #4caf50; }
                .modal-content.error { border-color: #f44336; }
                .modal-content.info { border-color: #2196f3; }
                .modal-content.warning { border-color: #ff9800; }
                
                #result-title {
                    margin-top: 0;
                    color: #ffffff;
                    font-family: 'Anta', sans-serif;
                }
                
                #result-message {
                    color: #cccccc;
                    font-family: 'Roboto', sans-serif;
                }
                
                .close-modal-btn {
                    background-color: #7c4dff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'Roboto', sans-serif;
                    margin-top: 15px;
                }
                
                .close-modal-btn:hover {
                    background-color: #6c3cef;
                }
                
                .hidden {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Update modal content
        const titleElement = document.getElementById('result-title');
        const messageElement = document.getElementById('result-message');
        
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        
        // Set modal type
        const modalContent = resultModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.className = 'modal-content'; // Reset
            modalContent.classList.add(type);
        }
        
        // Show modal
        resultModal.classList.remove('hidden');
        
        // Auto-close if specified
        if (autoClose) {
            setTimeout(() => {
                resultModal.classList.add('hidden');
            }, 3000);
        }
    }
    
    // Create a confetti celebration function
    function showWinCelebration(amount) {
        // Call existing confetti if available
        if (typeof createConfetti === 'function') {
            createConfetti();
        }
        
        // Show win notification
        const notification = showNotification(`You won ${amount} $CATTLE!`, 'success', false);
        
        // Add win amount display
        const winAmount = document.getElementById('win-amount');
        if (winAmount) {
            winAmount.textContent = `+${amount} $CATTLE`;
            winAmount.classList.add('show');
            
            setTimeout(() => {
                winAmount.classList.remove('show');
            }, 3000);
        }
        
        // Remove notification after longer time
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    // Make functions available globally
    window.showNotification = showNotification;
    window.showResult = showResult;
    window.showWinCelebration = showWinCelebration;
});