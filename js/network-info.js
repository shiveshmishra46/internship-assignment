// Network Information API implementation

// Variables for network state
let isOnline = true;
let networkType = 'unknown';
let connectionSpeed = 'unknown';

// Initialize network information functionality
function initNetworkInfo() {
    // Check if Network Information API is available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
        // Get initial network info
        updateNetworkInfo(connection);
        
        // Set up event listener for connection changes
        connection.addEventListener('change', () => {
            updateNetworkInfo(connection);
        });
    }
    
    // Set up online/offline event listeners (available in all browsers)
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial online status
    isOnline = navigator.onLine;
    updateOnlineStatus();
}

// Update network information from Connection API
function updateNetworkInfo(connection) {
    // Get connection type
    networkType = connection.type || 'unknown';
    
    // Get effective connection type (4g, 3g, 2g, slow-2g)
    const effectiveType = connection.effectiveType || 'unknown';
    
    // Get connection speed metrics
    const downlinkSpeed = connection.downlink; // Mbps
    const rtt = connection.rtt; // Round-trip time in ms
    
    // Determine connection quality
    let connectionQuality;
    
    if (effectiveType === '4g' || downlinkSpeed > 5) {
        connectionQuality = 'high';
        connectionSpeed = 'fast';
    } else if (effectiveType === '3g' || (downlinkSpeed > 1 && downlinkSpeed <= 5)) {
        connectionQuality = 'medium';
        connectionSpeed = 'moderate';
    } else {
        connectionQuality = 'low';
        connectionSpeed = 'slow';
    }
    
    // Update UI with network information
    updateNetworkUI(connectionQuality, networkType);
    
    // Apply network-aware content strategies
    applyNetworkStrategies(connectionQuality);
    
    console.log('Network info updated:', {
        type: networkType,
        effectiveType,
        downlink: downlinkSpeed + ' Mbps',
        rtt: rtt + ' ms',
        quality: connectionQuality
    });
}

// Handle online event
function handleOnline() {
    isOnline = true;
    updateOnlineStatus();
    
    // Show notification
    window.appFunctions.showNotification('You are back online');
    
    // Sync any data that was changed while offline
    syncOfflineChanges();
}

// Handle offline event
function handleOffline() {
    isOnline = false;
    updateOnlineStatus();
    
    // Show notification
    window.appFunctions.showNotification('You are offline. Limited features available');
}

// Update UI based on online status
function updateOnlineStatus() {
    const statusElement = document.getElementById('network-status');
    const indicator = document.getElementById('network-indicator');
    const offlineMessage = document.getElementById('offline-message');
    
    if (isOnline) {
        statusElement.textContent = 'Online';
        indicator.className = 'online';
        
        if (offlineMessage) {
            offlineMessage.classList.remove('visible');
        }
    } else {
        statusElement.textContent = 'Offline';
        indicator.className = 'offline';
        
        if (offlineMessage) {
            offlineMessage.classList.add('visible');
        }
    }
}

// Update UI based on network quality
function updateNetworkUI(connectionQuality, networkType) {
    const statusElement = document.getElementById('network-status');
    const indicator = document.getElementById('network-indicator');
    
    if (!isOnline) {
        // Keep offline status if not online
        return;
    }
    
    switch (connectionQuality) {
        case 'high':
            statusElement.textContent = 'Fast Connection';
            indicator.className = 'online';
            break;
        case 'medium':
            statusElement.textContent = 'Good Connection';
            indicator.className = 'online';
            break;
        case 'low':
            statusElement.textContent = 'Slow Connection';
            indicator.className = 'slow';
            break;
    }
}

// Apply network-aware content strategies
function applyNetworkStrategies(connectionQuality) {
    // Adjust image quality based on connection
    adjustImageQuality(connectionQuality);
    
    // Adjust content loading strategy
    adjustLoadingStrategy(connectionQuality);
}

// Adjust image quality based on connection
function adjustImageQuality(connectionQuality) {
    // Quality factor for different connection qualities
    const qualityFactors = {
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
    };
    
    const quality = qualityFactors[connectionQuality] || 'low';
    
    // Update image sources with appropriate quality
    // (in a real app, this would use different image sizes or formats)
    document.querySelectorAll('img[data-src]').forEach(img => {
        const src = img.dataset.src;
        if (src && !img.src) {
            // In a real app, we would modify the URL to load different image qualities
            // For this demo, we're just logging the action
            console.log(`Loading image with ${quality} quality:`, src);
        }
    });
}

// Adjust content loading strategy based on connection
function adjustLoadingStrategy(connectionQuality) {
    // Determine how many items to pre-load based on connection quality
    let preloadCount;
    
    switch (connectionQuality) {
        case 'high':
            preloadCount = 10; // Pre-load more items on fast connections
            break;
        case 'medium':
            preloadCount = 5;
            break;
        case 'low':
            preloadCount = 3; // Minimal pre-loading on slow connections
            break;
        default:
            preloadCount = 3;
    }
    
    // Update preload count for the application
    window.preloadCount = preloadCount;
}

// Sync changes made while offline
function syncOfflineChanges() {
    // In a real app, this would check for locally stored data that needs to be synced
    // For this demo, we're just simulating the process
    
    if (!isOnline) {
        return; // No need to sync if still offline
    }
    
    // Check for changes to sync
    const pendingChanges = localStorage.getItem('pendingChanges');
    
    if (pendingChanges) {
        try {
            const changes = JSON.parse(pendingChanges);
            
            if (changes.length > 0) {
                // Show syncing notification
                window.appFunctions.showNotification('Syncing your changes...');
                
                // Use Background Tasks API to handle syncing without blocking UI
                scheduleBackgroundTask(() => {
                    // Simulate network request delay
                    setTimeout(() => {
                        // Clear pending changes after successful sync
                        localStorage.removeItem('pendingChanges');
                        
                        // Show success notification
                        window.appFunctions.showNotification('All changes synced successfully');
                    }, 2000);
                });
            }
        } catch (error) {
            console.error('Error syncing changes:', error);
        }
    }
}

// Save changes locally when offline
function saveChangeOffline(change) {
    // Get existing pending changes
    let pendingChanges = [];
    
    try {
        const stored = localStorage.getItem('pendingChanges');
        if (stored) {
            pendingChanges = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error reading pending changes:', error);
    }
    
    // Add new change
    pendingChanges.push({
        id: window.appFunctions.generateUniqueId(),
        type: change.type,
        data: change.data,
        timestamp: Date.now()
    });
    
    // Store updated changes
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
    
    // Show notification
    window.appFunctions.showNotification('Changes saved offline and will sync when you reconnect');
}

// Make functions available to other scripts
window.networkFunctions = {
    isOnline: () => isOnline,
    getNetworkType: () => networkType,
    getConnectionSpeed: () => connectionSpeed,
    saveChangeOffline
};