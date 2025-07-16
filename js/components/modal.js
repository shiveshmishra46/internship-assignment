/**
 * Modal Component
 * Handles modal dialog functionality
 * Last updated: 2025-07-16
 */

// Place Details Modal Setup
function setupPlaceDetailsModal() {
    const modal = document.getElementById('place-details-modal');
    const viewOnMapBtn = document.getElementById('detail-view-on-map');
    const saveBtn = document.getElementById('detail-save-place');
    
    if (modal) {
        // View on map button functionality
        if (viewOnMapBtn) {
            viewOnMapBtn.addEventListener('click', () => {
                if (window.appState && window.appState.detailsModalPlace) {
                    // Navigate to map section
                    if (window.appFunctions && window.appFunctions.navigateToSection) {
                        window.appFunctions.navigateToSection('map');
                    }
                    
                    // Center map on place
                    setTimeout(() => {
                        if (window.mapFunctions && window.mapFunctions.centerMapOnPlace) {
                            window.mapFunctions.centerMapOnPlace(window.appState.detailsModalPlace);
                        }
                    }, 300);
                    
                    // Close the modal
                    modal.classList.remove('active');
                }
            });
        }
        
        // Save place button functionality
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (window.appState && window.appState.detailsModalPlace) {
                    if (window.appFunctions && window.appFunctions.savePlace) {
                        window.appFunctions.savePlace(window.appState.detailsModalPlace);
                    }
                    modal.classList.remove('active');
                }
            });
        }
    }
}

// Show Place Details Modal
function showPlaceDetails(place) {
    const modal = document.getElementById('place-details-modal');
    const placeName = document.getElementById('detail-place-name');
    const placeImg = document.getElementById('detail-place-image');
    const placeDesc = document.getElementById('detail-place-description');
    const placeAddress = document.getElementById('detail-place-address');
    const placeCategory = document.getElementById('detail-place-category');
    const saveBtn = document.getElementById('detail-save-place');
    
    if (modal && place) {
        // Store reference to place
        if (window.appState) {
            window.appState.detailsModalPlace = place;
        }
        
        // Update modal content
        if (placeName) placeName.textContent = place.name || 'Place Details';
        
        if (placeImg) {
            placeImg.src = place.image || place.imageUrl || 'assets/images/placeholder.jpg';
            placeImg.alt = place.name || 'Place Image';
        }
        
        if (placeDesc) placeDesc.textContent = place.description || 'No description available';
        
        if (placeAddress) placeAddress.textContent = place.address || 'No address available';
        
        if (placeCategory) placeCategory.textContent = place.category || place.type || 'Uncategorized';
        
        // Check if place is already saved
        if (saveBtn && window.appState && window.appState.savedPlaces) {
            const isAlreadySaved = window.appState.savedPlaces.some(savedPlace => savedPlace.id === place.id);
            if (isAlreadySaved) {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Already Saved';
                saveBtn.disabled = true;
                saveBtn.classList.add('saved');
            } else {
                saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save for Later';
                saveBtn.disabled = false;
                saveBtn.classList.remove('saved');
            }
        }
        
        // Show modal
        modal.classList.add('active');
    }
}

// Export functions for other modules
if (typeof window !== 'undefined') {
    window.setupPlaceDetailsModal = setupPlaceDetailsModal;
    window.showPlaceDetails = showPlaceDetails;
}