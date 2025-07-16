/**
 * Network Information Utilities
 * Handles network status and speed detection
 * Last updated: 2025-07-16
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize network status indicator
    initializeNetworkStatus();
    
    // Update network information periodically
    setInterval(updateNetworkInfo, 30000); // Every 30 seconds
});

// Initialize network status
function initializeNetworkStatus() {
    updateNetworkInfo();
    
    // Listen for online/offline events
    window.addEventListener('online', function() {
        updateNetworkIndicator(true);
        if (window.showToast) {
            window.showToast('You are back online!', 'success');
        }
    });
    
    window.addEventListener('offline', function() {
        updateNetworkIndicator(false);
        if (window.showToast) {
            window.showToast('You are offline. Some features may be limited.', 'warning');
        }
    });
}

// Update network information
function updateNetworkInfo() {
    const isOnline = navigator.onLine;
    updateNetworkIndicator(isOnline);
    
    if (isOnline) {
        // Check connection speed
        checkConnectionSpeed();
    }
}

// Update network indicator UI
function updateNetworkIndicator(isOnline) {
    const statusElement = document.getElementById('network-status');
    const indicator = document.getElementById('network-indicator');
    
    if (!statusElement || !indicator) return;
    
    if (isOnline) {
        statusElement.textContent = 'Online';
        indicator.className = 'online';
    } else {
        statusElement.textContent = 'Offline';
        indicator.className = 'offline';
        
        // Update speed indicator
        const speedElement = document.getElementById('network-speed');
        if (speedElement) {
            speedElement.textContent = '--';
        }
    }
    
    // Update offline message visibility
    if (window.updateOfflineMessageVisibility) {
        window.updateOfflineMessageVisibility();
    }
}

// Check connection speed
function checkConnectionSpeed() {
    // Only use this if navigator.connection is available
    if (navigator.connection && navigator.connection.effectiveType) {
        updateConnectionSpeed(navigator.connection.effectiveType);
        
        // Listen for connection changes
        navigator.connection.addEventListener('change', function() {
            updateConnectionSpeed(navigator.connection.effectiveType);
        });
    } else {
        // Fallback: Use image download test
        const startTime = new Date().getTime();
        const url = 'https://www.google.com/images/phd/px.gif'; // Small Google image for testing
        
        fetch(url, { cache: 'no-store' })
            .then(response => response.blob())
            .then(data => {
                const endTime = new Date().getTime();
                const duration = endTime - startTime;
                
                // Simple speed classification
                let connectionType;
                if (duration < 100) {
                    connectionType = '4g';
                } else if (duration < 250) {
                    connectionType = '3g';
                } else if (duration < 500) {
                    connectionType = '2g';
                } else {
                    connectionType = 'slow-2g';
                }
                
                updateConnectionSpeed(connectionType);
            })
            .catch(error => {
                console.warn('Error checking connection speed:', error);
                updateConnectionSpeed('unknown');
            });
    }
}

// Update connection speed indicator
function updateConnectionSpeed(connectionType) {
    const speedElement = document.getElementById('network-speed');
    const indicator = document.getElementById('network-indicator');
    
    if (!speedElement || !indicator) return;
    
    let speedLabel;
    let connectionClass;
    
    switch (connectionType) {
        case '4g':
            speedLabel = 'Fast';
            connectionClass = 'online';
            break;
        case '3g':
            speedLabel = 'Good';
            connectionClass = 'online';
            break;
        case '2g':
            speedLabel = 'Slow';
            connectionClass = 'slow';
            break;
        case 'slow-2g':
            speedLabel = 'Very Slow';
            connectionClass = 'slow';
            break;
        default:
            speedLabel = 'Unknown';
            connectionClass = 'online';
    }
    
    speedElement.textContent = speedLabel;
    indicator.className = connectionClass;
}

// Export functions for other modules
if (typeof window !== 'undefined') {
    window.updateNetworkInfo = updateNetworkInfo;
    window.checkConnectionSpeed = checkConnectionSpeed;
}