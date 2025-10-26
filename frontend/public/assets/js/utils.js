/**
 * Utility Functions for Helpdesk System
 */

/**
 * Generate consistent avatar URL based on ticket ID
 */
function getAvatarUrl(ticketId) {
    const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'pixel-art'];
    const style = styles[ticketId % styles.length];
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${ticketId}`;
}

/**
 * Get SLA status class
 */
function getSLAStatus(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursLeft = (due - now) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'breach';
    if (hoursLeft < 4) return 'warning';
    return 'ok';
}

/**
 * Get SLA text
 */
function getSLAText(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursLeft = Math.floor((due - now) / (1000 * 60 * 60));
    
    if (hoursLeft < 0) return `Breached ${Math.abs(hoursLeft)}h ago`;
    if (hoursLeft < 1) return 'Due in < 1 hour';
    return `${hoursLeft}h remaining`;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show loading notification
 */
function showLoadingNotification(message = 'Processing...') {
    const content = `
        <div class="loader"></div>
        <div class="notification-title">${message}</div>
        <div class="notification-message">Please wait while we process your request</div>
    `;
    document.getElementById('notificationContent').innerHTML = content;
    document.getElementById('notificationOverlay').classList.add('active');
}

/**
 * Show success notification
 */
function showSuccessNotification(message, autoClose = true) {
    const content = `
        <div class="success-icon"></div>
        <div class="notification-title">Success!</div>
        <div class="notification-message">${message}</div>
    `;
    document.getElementById('notificationContent').innerHTML = content;
    
    if (autoClose) {
        setTimeout(() => {
            closeNotification();
        }, 2000);
    }
}

/**
 * Close notification
 */
function closeNotification() {
    document.getElementById('notificationOverlay').classList.remove('active');
}

/**
 * Show error notification
 */
function showErrorNotification(message) {
    alert(message); // Can be enhanced with a styled error notification
    closeNotification();
}