/**
 * Notification System
 * Provides visual feedback to players through notifications
 */

// Keep track of active notifications
let activeNotifications = [];
let notificationContainer = null;

/**
 * Initialize the notification system
 */
function initNotificationSystem() {
    // Create notification container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        notificationContainer.style.display = 'flex';
        notificationContainer.style.flexDirection = 'column';
        notificationContainer.style.alignItems = 'flex-end';
        notificationContainer.style.gap = '10px';
        document.body.appendChild(notificationContainer);
    }
    
    console.log("Notification system initialized");
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The notification type ('success', 'error', 'info', 'warning')
 * @param {number} duration - How long to show the notification (in ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Initialize if not already done
    if (!notificationContainer) {
        initNotificationSystem();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.backgroundColor = getNotificationColor(type);
    notification.style.color = '#ffffff';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    notification.style.marginBottom = '10px';
    notification.style.maxWidth = '300px';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.position = 'relative';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.justifyContent = 'space-between';
    
    // Add icon based on type
    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.textContent = getNotificationIcon(type);
    icon.style.marginRight = '10px';
    icon.style.fontSize = '18px';
    
    const textContent = document.createElement('div');
    textContent.style.flex = '1';
    textContent.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'notification-close';
    closeBtn.textContent = '×';
    closeBtn.style.marginLeft = '10px';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.opacity = '0.7';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.7';
    });
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    notification.appendChild(icon);
    notification.appendChild(textContent);
    notification.appendChild(closeBtn);
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Add to tracking array
    activeNotifications.push(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Play sound if available
    const soundMap = {
        'success': 'achievement',
        'error': 'lose',
        'warning': 'hover',
        'info': 'click'
    };
    
    if (typeof window.playSoundEffect === 'function' && soundMap[type]) {
        window.playSoundEffect(soundMap[type]);
    }
    
    // Auto close after duration
    const timeoutId = setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    // Store timeout ID on the notification element
    notification.timeoutId = timeoutId;
    
    return notification;
}

/**
 * Close a notification
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
    // Clear the timeout
    if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
    }
    
    // Animate out
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(50px)';
    
    // Remove after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
        
        // Remove from tracking array
        const index = activeNotifications.indexOf(notification);
        if (index !== -1) {
            activeNotifications.splice(index, 1);
        }
    }, 300);
}

/**
 * Get color for notification type
 * @param {string} type - Notification type
 * @returns {string} CSS color
 */
function getNotificationColor(type) {
    const colors = {
        'success': '#2ecc71',
        'error': '#e74c3c',
        'info': '#3498db',
        'warning': '#f39c12'
    };
    
    return colors[type] || colors.info;
}

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Icon character
 */
function getNotificationIcon(type) {
    const icons = {
        'success': '✓',
        'error': '✗',
        'info': 'ℹ',
        'warning': '⚠'
    };
    
    return icons[type] || icons.info;
}

/**
 * Close all active notifications
 */
function closeAllNotifications() {
    // Make a copy of the array to avoid modification during iteration
    const notificationsToClose = [...activeNotifications];
    
    // Close each notification
    notificationsToClose.forEach(notification => {
        closeNotification(notification);
    });
}

// Export functions for global use
window.showNotification = showNotification;
window.closeAllNotifications = closeAllNotifications;

// Initialize on page load
document.addEventListener('DOMContentLoaded', initNotificationSystem);