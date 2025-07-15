// Network Information API implementation

// Variables for network state
let isOnline = true;
let networkType = 'unknown';
let connectionSpeed = 'unknown';
let downlinkSpeed = 0;
let rtt = 0;

// Initialize network information functionality
function initNetworkInfo() {
    console.log("Initializing Network Information API");
    
    // Check if Network Information API is available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
        // Get initial network info
        updateNetworkInfo(connection);
        
        // Set up event listener for connection changes
        connection.addEventListener('change', () => {
            updateNetworkInfo(connection);
        });
    } else {
        console.warn("Network Information API not supported. Using online/offline events only.");
    }
    
    // Set up online/offline event listeners (available in all browsers)
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial online status
    isOnline = navigator.onLine;
    updateOnlineStatus();
    
    // Update network info periodically (some browsers don't trigger change events consistently)
    setInterval(() => {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            updateNetworkInfo(conn);
        }
    }, 10000);
}

// Update network information from Connection API
function updateNetworkInfo(connection) {
    // Get connection type
    networkType = connection.type || 'unknown';
    
    // Get effective connection type (4g, 3g, 2g, slow-2g)
    const effectiveType = connection.effectiveType || 'unknown';
    
    // Get connection speed metrics
    downlinkSpeed = connection.downlink || 0; // Mbps
    rtt = connection.rtt || 0; // Round-trip time in ms
    
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
    updateNetworkUI(connectionQuality, networkType, effectiveType);
    
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
    if (window.appFunctions && window.appFunctions.showToast) {
        window.appFunctions.showToast('You are back online', 'success');
    }
    
    // Sync any data that was changed while offline
    syncOfflineChanges();
}

// Handle offline event
function handleOffline() {
    isOnline = false;
    updateOnlineStatus();
    
    // Show notification
    if (window.appFunctions && window.appFunctions.showToast) {
        window.appFunctions.showToast('You are offline. Limited features available', 'warning');
    }
}

// Update UI based on online status
function updateOnlineStatus() {
    const statusElement = document.getElementById('network-status');
    const indicator = document.getElementById('network-indicator');
    const offlineMessage = document.getElementById('offline-message');
    
    if (!statusElement || !indicator) {
        return;
    }
    
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
function updateNetworkUI(connectionQuality, networkType, effectiveType) {
    const statusElement = document.getElementById('network-status');
    const indicator = document.getElementById('network-indicator');
    const speedElement = document.getElementById('network-speed');
    
    if (!statusElement || !indicator || !isOnline) {
        // Keep offline status if not online
        return;
    }
    
    // Update connection type and quality
    let statusText;
    switch (connectionQuality) {
        case 'high':
            statusText = effectiveType === '4g' ? '4G' : 'Fast';
            indicator.className = 'online';
            break;
        case 'medium':
            statusText = effectiveType === '3g' ? '3G' : 'Good';
            indicator.className = 'online';
            break;
        case 'low':
            statusText = effectiveType === '2g' ? '2G' : 'Slow';
            indicator.className = 'slow';
            break;
        default:
            statusText = 'Online';
            indicator.className = 'online';
    }
    
    // Update network type if available (wifi, cellular, etc)
    if (networkType && networkType !== 'unknown') {
        statusText = networkType.charAt(0).toUpperCase() + networkType.slice(1);
    }
    
    statusElement.textContent = statusText;
    
    // Update speed information
    if (speedElement) {
        if (downlinkSpeed > 0) {
            speedElement.textContent = `${downlinkSpeed.toFixed(1)} Mbps`;
        } else {
            speedElement.textContent = '';
        }
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
            // For demonstration purposes, we're just logging the action
            // In a real app, we would replace the URL with a different quality version
            console.log(`Loading image with ${quality} quality:`, src);
        }
    });
    
    // Add class to body for CSS optimizations
    document.body.classList.remove('connection-high', 'connection-medium', 'connection-low');
    document.body.classList.add(`connection-${quality}`);
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
    
    // Adjust animation complexity based on connection
    if (connectionQuality === 'low') {
        // Reduce animations for slow connections
        document.body.classList.add('reduce-motion');
    } else {
        document.body.classList.remove('reduce-motion');
    }
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
                if (window.appFunctions && window.appFunctions.showToast) {
                    window.appFunctions.showToast('Syncing your changes...', 'info');
                }
                
                // Use Background Tasks API to handle syncing without blocking UI
                scheduleBackgroundTask(() => {
                    // Simulate network request delay
                    setTimeout(() => {
                        // Clear pending changes after successful sync
                        localStorage.removeItem('pendingChanges');
                        
                        // Show success notification
                        if (window.appFunctions && window.appFunctions.showToast) {
                            window.appFunctions.showToast('All changes synced successfully', 'success');
                        }
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
        id: window.appFunctions && window.appFunctions.generateUniqueId ? 
            window.appFunctions.generateUniqueId() : 
            Date.now().toString(36) + Math.random().toString(36).substring(2),
        type: change.type,
        data: change.data,
        timestamp: Date.now()
    });
    
    // Store updated changes
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
    
    // Show notification
    if (window.appFunctions && window.appFunctions.showToast) {
        window.appFunctions.showToast('Changes saved offline and will sync when you reconnect', 'info');
    }
}

// Make functions available to other scripts
window.networkFunctions = {
    isOnline: () => isOnline,
    getNetworkType: () => networkType,
    getConnectionSpeed: () => connectionSpeed,
    getDownlinkSpeed: () => downlinkSpeed,
    getRtt: () => rtt,
    saveChangeOffline
};