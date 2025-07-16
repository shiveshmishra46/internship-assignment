/**
 * Toast Notification Component
 * Handles all toast notification functionality
 * Last updated: 2025-07-16
 */

// Show toast notification
function showToast(message, type = 'info', uniqueId = null) {
    // If we have a uniqueId, check if we already have a toast with this ID
    // This prevents duplicate notifications
    if (uniqueId && window.appState && window.appState.toastTimeouts && window.appState.toastTimeouts[uniqueId]) {
        return; // Don't show duplicate toast
    }
    
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // Create toast structure
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.add('closing');
            setTimeout(() => {
                toast.remove();
                
                // Clear timeout reference
                if (uniqueId && window.appState && window.appState.toastTimeouts) {
                    delete window.appState.toastTimeouts[uniqueId];
                }
            }, 300);
        });
    }
    
    // Store timeout ID if we have a uniqueId
    const toastTimeout = setTimeout(() => {
        toast.classList.add('closing');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toast.remove();
            }
            
            // Clear timeout reference
            if (uniqueId && window.appState && window.appState.toastTimeouts) {
                delete window.appState.toastTimeouts[uniqueId];
            }
        }, 300);
    }, 4000);
    
    // Store timeout if we have a uniqueId
    if (uniqueId && window.appState && window.appState.toastTimeouts) {
        window.appState.toastTimeouts[uniqueId] = toastTimeout;
    }
    
    return toast;
}

// Export function for other modules
if (typeof window !== 'undefined') {
    window.showToast = showToast;
}