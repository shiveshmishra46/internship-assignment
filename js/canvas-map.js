// Canvas API implementation for interactive map

// Map state variables
let mapCanvas;
let mapContext;
let mapCenter = { lat: 0, lng: 0 }; // Default center (will be updated with user location)
let mapZoom = 15; // Initial zoom level
let mapMarkers = [];
let isDragging = false;
let lastDragPosition = null;
let userMarker = null;
let mapReady = false;

// Initialize canvas map
function initCanvasMap() {
    // Get canvas and context
    mapCanvas = document.getElementById('map-canvas');
    
    if (!mapCanvas) {
        console.error('Map canvas not found');
        return;
    }
    
    mapContext = mapCanvas.getContext('2d');
    
    if (!mapContext) {
        console.error('Could not get canvas context');
        return;
    }
    
    // Set canvas dimensions to match container
    resizeCanvas();
    
    // Add event listeners for map interactions
    setupMapInteractions();
    
    // Set map as ready
    mapReady = true;
    
    // Draw initial map
    drawMap();
    
    // Set up zoom buttons
    document.getElementById('zoom-in').addEventListener('click', () => {
        zoomMap(1); // Zoom in
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        zoomMap(-1); // Zoom out
    });
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
}

// Resize canvas to match container dimensions
function resizeCanvas() {
    const mapContainer = mapCanvas.parentElement;
    mapCanvas.width = mapContainer.clientWidth;
    mapCanvas.height = mapContainer.clientHeight;
    
    // Redraw map after resize
    if (mapReady) {
        drawMap();
    }
}

// Set up map interaction events
function setupMapInteractions() {
    // Mouse events for drag functionality
    mapCanvas.addEventListener('mousedown', startDrag);
    mapCanvas.addEventListener('mousemove', drag);
    mapCanvas.addEventListener('mouseup', endDrag);
    mapCanvas.addEventListener('mouseleave', endDrag);
    
    // Touch events for mobile devices
    mapCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        startDrag(e.touches[0]);
    });
    
    mapCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling
        drag(e.touches[0]);
    });
    
    mapCanvas.addEventListener('touchend', endDrag);
    
    // Mouse wheel for zoom
    mapCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        zoomMap(e.deltaY > 0 ? -1 : 1);
    });
}

// Start drag operation
function startDrag(e) {
    isDragging = true;
    lastDragPosition = getEventPosition(e);
}

// Handle drag movement
function drag(e) {
    if (!isDragging || !lastDragPosition) return;
    
    const currentPosition = getEventPosition(e);
    const dx = currentPosition.x - lastDragPosition.x;
    const dy = currentPosition.y - lastDragPosition.y;
    
    // Convert pixel movement to coordinate change based on zoom level
    const scale = Math.pow(2, mapZoom - 15); // Adjust based on zoom level
    const latChange = dy * 0.0001 / scale;
    const lngChange = dx * 0.0001 / scale;
    
    // Update map center
    mapCenter.lat -= latChange;
    mapCenter.lng += lngChange;
    
    // Update last position
    lastDragPosition = currentPosition;
    
    // Redraw map
    drawMap();
}

// End drag operation
function endDrag() {
    isDragging = false;
    lastDragPosition = null;
}

// Get mouse/touch position relative to canvas
function getEventPosition(e) {
    const rect = mapCanvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Handle map zooming
function zoomMap(delta) {
    // Adjust zoom level within limits
    mapZoom = Math.max(12, Math.min(19, mapZoom + delta));
    
    // Redraw map
    drawMap();
}

// Update map with user's location
function updateMapWithLocation(location) {
    if (!mapReady || !location) return;
    
    // Set map center to user's location
    mapCenter = {
        lat: location.latitude,
        lng: location.longitude
    };
    
    // Create/update user marker
    userMarker = {
        lat: location.latitude,
        lng: location.longitude,
        type: 'user',
        accuracy: location.accuracy
    };
    
    // Redraw map
    drawMap();
}

// Add places to the map
function addPlacesToMap(places) {
    if (!mapReady) return;
    
    // Clear existing place markers (keep user marker)
    mapMarkers = mapMarkers.filter(marker => marker.type === 'user');
    
    // Add place markers
    places.forEach(place => {
        // In a real app, place would have proper coordinates
        // Here we're creating synthetic coordinates near the user's location
        const marker = {
            lat: mapCenter.lat + (Math.random() * 0.01 - 0.005),
            lng: mapCenter.lng + (Math.random() * 0.01 - 0.005),
            type: 'place',
            title: place.name,
            placeId: place.id,
            placeType: place.type
        };
        
        mapMarkers.push(marker);
    });
    
    // Redraw map
    drawMap();
}

// Center map on a specific place
function centerMapOnPlace(place) {
    if (!mapReady || !place.location) return;
    
    // Set map center to place location
    mapCenter = {
        lat: place.location.latitude,
        lng: place.location.longitude
    };
    
    // Find existing marker or create one
    let marker = mapMarkers.find(m => m.placeId === place.id);
    
    if (!marker) {
        marker = {
            lat: place.location.latitude,
            lng: place.location.longitude,
            type: 'highlighted',
            title: place.name,
            placeId: place.id,
            placeType: place.category
        };
        
        mapMarkers.push(marker);
    } else {
        // Update marker type to highlight it
        marker.type = 'highlighted';
    }
    
    // Redraw map
    drawMap();
}

// Draw the map and all elements
function drawMap() {
    if (!mapContext) return;
    
    // Clear canvas
    mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    // Draw map background (grid style for demo)
    drawMapBackground();
    
    // Draw user location accuracy circle
    if (userMarker) {
        drawAccuracyCircle();
    }
    
    // Draw all markers
    drawMarkers();
    
    // Draw scale indicator
    drawScaleIndicator();
}

// Draw a grid-based map background (for demonstration)
function drawMapBackground() {
    const gridSize = 0.001 * Math.pow(2, 15 - mapZoom); // Grid size in coordinates
    
    // Calculate grid starting coordinates
    const startLat = Math.floor(mapCenter.lat / gridSize) * gridSize;
    const startLng = Math.floor(mapCenter.lng / gridSize) * gridSize;
    
    // Set grid style
    mapContext.lineWidth = 0.5;
    mapContext.strokeStyle = '#ddd';
    
    // Draw vertical grid lines
    for (let lng = startLng - 10 * gridSize; lng < startLng + 10 * gridSize; lng += gridSize) {
        const x = mapCanvas.width / 2 + (lng - mapCenter.lng) * (10000 * Math.pow(2, mapZoom - 15));
        mapContext.beginPath();
        mapContext.moveTo(x, 0);
        mapContext.lineTo(x, mapCanvas.height);
        mapContext.stroke();
    }
    
    // Draw horizontal grid lines
    for (let lat = startLat - 10 * gridSize; lat < startLat + 10 * gridSize; lat += gridSize) {
        const y = mapCanvas.height / 2 - (lat - mapCenter.lat) * (10000 * Math.pow(2, mapZoom - 15));
        mapContext.beginPath();
        mapContext.moveTo(0, y);
        mapContext.lineTo(mapCanvas.width, y);
        mapContext.stroke();
    }
    
    // Draw map labels
    mapContext.fillStyle = '#333';
    mapContext.font = '12px Arial';
    mapContext.fillText(`Lat: ${mapCenter.lat.toFixed(5)}, Lng: ${mapCenter.lng.toFixed(5)}`, 10, 20);
    mapContext.fillText(`Zoom: ${mapZoom}`, 10, 40);
}

// Draw location accuracy circle
function drawAccuracyCircle() {
    if (!userMarker || !userMarker.accuracy) return;
    
    // Convert accuracy radius to pixels
    const scale = 10000 * Math.pow(2, mapZoom - 15);
    const radiusInPixels = userMarker.accuracy / 111320 * scale; // Convert meters to degrees then to pixels
    
    // Calculate screen position of user marker
    const userX = mapCanvas.width / 2;
    const userY = mapCanvas.height / 2;
    
    // Draw accuracy circle
    mapContext.beginPath();
    mapContext.arc(userX, userY, radiusInPixels, 0, 2 * Math.PI);
    mapContext.fillStyle = 'rgba(66, 133, 244, 0.2)';
    mapContext.fill();
    mapContext.strokeStyle = 'rgba(66, 133, 244, 0.5)';
    mapContext.lineWidth = 1;
    mapContext.stroke();
}

// Draw all markers on the map
function drawMarkers() {
    // Scale factor for converting coordinate differences to pixels
    const scale = 10000 * Math.pow(2, mapZoom - 15);
    
    // Draw normal place markers first
    mapMarkers.filter(marker => marker.type === 'place').forEach(marker => {
        drawMarker(marker, scale);
    });
    
    // Draw highlighted marker next
    mapMarkers.filter(marker => marker.type === 'highlighted').forEach(marker => {
        drawMarker(marker, scale);
    });
    
    // Draw user marker last (on top)
    if (userMarker) {
        drawMarker(userMarker, scale);
    }
}

// Draw individual marker
function drawMarker(marker, scale) {
    // Calculate marker position on screen
    const x = mapCanvas.width / 2 + (marker.lng - mapCenter.lng) * scale;
    const y = mapCanvas.height / 2 - (marker.lat - mapCenter.lat) * scale;
    
    // Draw different marker types
    if (marker.type === 'user') {
        // User location marker (blue dot)
        mapContext.beginPath();
        mapContext.arc(x, y, 8, 0, 2 * Math.PI);
        mapContext.fillStyle = '#4285F4';
        mapContext.fill();
        mapContext.strokeStyle = '#FFFFFF';
        mapContext.lineWidth = 3;
        mapContext.stroke();
    } else if (marker.type === 'highlighted') {
        // Highlighted place marker (bouncing pin)
        drawPlacePin(x, y, '#FF5252', 5, marker.title, true);
    } else {
        // Regular place marker
        let color;
        switch (marker.placeType) {
            case 'restaurant':
                color = '#FF9800';
                break;
            case 'hotel':
                color = '#9C27B0';
                break;
            case 'attraction':
                color = '#4CAF50';
                break;
            default:
                color = '#607D8B';
        }
        
        drawPlacePin(x, y, color, 0, marker.title, false);
    }
}

// Draw a place pin with optional bounce animation
function drawPlacePin(x, y, color, bounceOffset, title, showLabel) {
    // Calculate bounce offset (animated)
    const offset = bounceOffset * Math.sin(Date.now() / 200);
    
    // Draw pin
    mapContext.beginPath();
    mapContext.moveTo(x, y - 20 - offset);
    mapContext.bezierCurveTo(
        x - 10, y - 20 - offset,
        x - 10, y - offset,
        x, y - offset
    );
    mapContext.bezierCurveTo(
        x + 10, y - offset,
        x + 10, y - 20 - offset,
        x, y - 20 - offset
    );
    
    // Pin head
    mapContext.moveTo(x, y - 20 - offset);
    mapContext.arc(x, y - 20 - offset, 6, 0, 2 * Math.PI);
    
    // Fill and stroke
    mapContext.fillStyle = color;
    mapContext.fill();
    mapContext.strokeStyle = '#FFFFFF';
    mapContext.lineWidth = 2;
    mapContext.stroke();
    
    // Draw label if requested
    if (showLabel && title) {
        // Create label background
        mapContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
        mapContext.font = 'bold 12px Arial';
        const textWidth = mapContext.measureText(title).width;
        const padding = 8;
        
        mapContext.fillRect(
            x - textWidth/2 - padding, 
            y - 50 - offset, 
            textWidth + padding * 2, 
            24
        );
        
        // Draw text
        mapContext.fillStyle = '#FFFFFF';
        mapContext.textAlign = 'center';
        mapContext.fillText(title, x, y - 35 - offset);
    }
}

// Draw scale indicator
function drawScaleIndicator() {
    // Calculate scale based on zoom level
    const metersPerPixel = 156543.03392 * Math.cos(mapCenter.lat * Math.PI / 180) / Math.pow(2, mapZoom);
    
    // Create a scale bar of reasonable length (about 20% of canvas width)
    const targetLengthInPixels = mapCanvas.width * 0.2;
    const actualMeters = Math.round(targetLengthInPixels * metersPerPixel);
    
    // Round to a nice number for display
    let roundedMeters;
    if (actualMeters > 10000) {
        roundedMeters = Math.round(actualMeters / 1000) * 1000;
    } else if (actualMeters > 1000) {
        roundedMeters = Math.round(actualMeters / 500) * 500;
    } else if (actualMeters > 100) {
        roundedMeters = Math.round(actualMeters / 100) * 100;
    } else {
        roundedMeters = Math.round(actualMeters / 10) * 10;
    }
    
    // Calculate the pixel length for the rounded distance
    const scaleBarLength = roundedMeters / metersPerPixel;
    
    // Format the distance for display
    let scaleText;
    if (roundedMeters >= 1000) {
        scaleText = `${roundedMeters / 1000} km`;
    } else {
        scaleText = `${roundedMeters} m`;
    }
    
    // Draw scale bar
    const x = 20;
    const y = mapCanvas.height - 20;
    
    // Draw bar
    mapContext.beginPath();
    mapContext.moveTo(x, y);
    mapContext.lineTo(x + scaleBarLength, y);
    mapContext.strokeStyle = '#000000';
    mapContext.lineWidth = 3;
    mapContext.stroke();
    
    // Draw end caps
    mapContext.beginPath();
    mapContext.moveTo(x, y - 5);
    mapContext.lineTo(x, y + 5);
    mapContext.moveTo(x + scaleBarLength, y - 5);
    mapContext.lineTo(x + scaleBarLength, y + 5);
    mapContext.stroke();
    
    // Draw text
    mapContext.fillStyle = '#000000';
    mapContext.font = '12px Arial';
    mapContext.textAlign = 'center';
    mapContext.fillText(scaleText, x + scaleBarLength / 2, y - 8);
}

// Make functions available to other scripts
window.mapFunctions = {
    updateMapWithLocation,
    addPlacesToMap,
    centerMapOnPlace
};