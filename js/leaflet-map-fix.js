/**
 * Optimized map loading script
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map with preloaded tiles for better performance
    let map = null;
    let userMarker = null;
    const mapElement = document.getElementById('map-element');
    
    // Only initialize map when needed
    function initializeMap() {
        if (map) return; // Map already initialized
        
        // Add loading indicator
        if (mapElement) {
            mapElement.innerHTML = '<div class="map-loading"><div class="spinner"></div><p>Loading map...</p></div>';
            
            // Create style for map loading
            const style = document.createElement('style');
            style.textContent = `
                .map-loading {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(245, 245, 245, 0.8);
                    z-index: 999;
                }
                .dark-mode .map-loading {
                    background-color: rgba(45, 55, 72, 0.8);
                    color: #f7fafc;
                }
                .map-loading .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create map with a small timeout to ensure container is ready
        setTimeout(() => {
            try {
                map = L.map('map-element', {
                    center: [51.505, -0.09], // Default to London
                    zoom: 13,
                    zoomControl: false // We'll add custom zoom controls
                });
                
                // Use a reliable tile provider
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    minZoom: 2
                }).addTo(map);
                
                // Remove loading indicator once tiles are loaded
                map.on('load tileload', function() {
                    const loading = document.querySelector('.map-loading');
                    if (loading) loading.style.display = 'none';
                });
                
                // Setup custom zoom controls
                setupMapControls();
                
                // Try to get user location
                getUserLocation();
            } catch (err) {
                console.error('Map initialization error:', err);
                if (mapElement) {
                    mapElement.innerHTML = '<div class="map-error"><p>Could not load map. Please try again later.</p></div>';
                }
            }
        }, 100);
    }
    
    // Setup map controls
    function setupMapControls() {
        if (!map) return;
        
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const findMeBtn = document.getElementById('find-me');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                map.zoomIn();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                map.zoomOut();
            });
        }
        
        if (findMeBtn) {
            findMeBtn.addEventListener('click', function() {
                getUserLocation();
            });
        }
    }
    
    // Get user's geolocation
    function getUserLocation() {
        if (!map) return;
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    
                    // Center map on user location
                    map.setView([userLat, userLng], 15);
                    
                    // Add or update user marker
                    if (userMarker) {
                        userMarker.setLatLng([userLat, userLng]);
                    } else {
                        // Create a custom marker for better visibility in both themes
                        const userIcon = L.divIcon({
                            className: 'user-marker',
                            html: '<div class="user-marker-inner"></div>',
                            iconSize: [20, 20]
                        });
                        
                        // Add marker style
                        const style = document.createElement('style');
                        style.textContent = `
                            .user-marker {
                                background: transparent;
                            }
                            .user-marker-inner {
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background-color: #3182ce;
                                border: 3px solid white;
                                box-shadow: 0 0 0 2px #3182ce, 0 0 10px rgba(0,0,0,0.5);
                            }
                            .user-marker-inner::after {
                                content: '';
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                width: 40px;
                                height: 40px;
                                margin-left: -20px;
                                margin-top: -20px;
                                border-radius: 50%;
                                border: 2px solid rgba(49, 130, 206, 0.5);
                                animation: pulse 2s infinite;
                            }
                            @keyframes pulse {
                                0% { transform: scale(0.5); opacity: 1; }
                                100% { transform: scale(1.5); opacity: 0; }
                            }
                        `;
                        document.head.appendChild(style);
                        
                        userMarker = L.marker([userLat, userLng], {icon: userIcon}).addTo(map);
                    }
                },
                function(error) {
                    console.error('Geolocation error:', error);
                    // Show error message
                    const findMeBtn = document.getElementById('find-me');
                    if (findMeBtn) {
                        findMeBtn.classList.add('error');
                        findMeBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Location access denied';
                        
                        setTimeout(() => {
                            findMeBtn.classList.remove('error');
                            findMeBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Locate Me';
                        }, 3000);
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }
    }
    
    // Initialize map when the map section becomes active
    function checkAndInitMap() {
        const mapSection = document.getElementById('map');
        if (mapSection && mapSection.classList.contains('active') && !map) {
            initializeMap();
        }
    }
    
    // Check when sections change
    const navItems = document.querySelectorAll('.nav-item, .nav-items a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === 'map') {
                setTimeout(checkAndInitMap, 100);
            }
        });
    });
    
    // Also check on page load if the map section is active
    checkAndInitMap();
});