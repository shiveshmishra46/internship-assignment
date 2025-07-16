/**
 * Background Tasks Utility
 * Handles scheduling non-critical tasks to run in the background
 * Last updated: 2025-07-16
 */

/**
 * Schedule a task to run in the background
 * Uses requestIdleCallback if available, falls back to setTimeout
 * 
 * @param {Function} task - The task to run in the background
 * @param {Object} options - Options for the task
 * @param {number} options.timeout - Maximum time to wait before running the task (ms)
 * @param {boolean} options.important - Whether the task is important (runs sooner)
 */
function scheduleBackgroundTask(task, options = {}) {
    const { timeout = 2000, important = false } = options;
    
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
        requestIdleCallback(
            deadline => {
                // Check if we have enough time or if we've hit the timeout
                if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
                    task();
                } else {
                    // Not enough time, reschedule
                    scheduleBackgroundTask(task, options);
                }
            },
            { timeout }
        );
    } else {
        // Fallback to setTimeout
        setTimeout(task, important ? 0 : 100);
    }
}

/**
 * Debounce function to limit how often a function can be called
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait between calls (ms)
 * @returns {Function} - The debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit how often a function can be called
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time between allowed function calls (ms)
 * @returns {Function} - The throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// Export functions for other modules
if (typeof window !== 'undefined') {
    window.scheduleBackgroundTask = scheduleBackgroundTask;
    window.debounce = debounce;
    window.throttle = throttle;
}