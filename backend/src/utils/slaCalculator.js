/**
 * Calculate SLA due date based on priority
 * @param {string} priority - High, Medium, or Low
 * @returns {Date} SLA due date
 */
function calculateSLADueDate(priority) {
    const now = new Date();
    let hours = 24; // Default

    switch (priority) {
        case 'High':
            hours = 4;
            break;
        case 'Medium':
            hours = 12;
            break;
        case 'Low':
            hours = 24;
            break;
    }

    return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Get SLA status (ok, warning, breach)
 * @param {string} dueDate - ISO date string
 * @returns {string} Status: 'ok', 'warning', or 'breach'
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
 * Get human-readable SLA text
 * @param {string} dueDate - ISO date string
 * @returns {string} Human-readable SLA status
 */
function getSLAText(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursLeft = Math.floor((due - now) / (1000 * 60 * 60));
    
    if (hoursLeft < 0) return `Breached ${Math.abs(hoursLeft)}h ago`;
    if (hoursLeft < 1) return 'Due in < 1 hour';
    return `${hoursLeft}h remaining`;
}

module.exports = {
    calculateSLADueDate,
    getSLAStatus,
    getSLAText
};