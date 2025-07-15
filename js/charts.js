// Canvas API implementation with Chart.js

// Initialize charts
function initCharts() {
    console.log("Initializing Canvas charts");
    
    // Use Background Tasks API to not block the UI
    scheduleBackgroundTask(() => {
        createCategoriesChart();
        createDistanceChart();
    }, { priority: 'low' });
}

// Create categories distribution chart
function createCategoriesChart() {
    const ctx = document.getElementById('categories-chart');
    
    if (!ctx) {
        console.warn('Categories chart canvas not found');
        return;
    }
    
    try {
        // Mock data for categories
        const data = {
            labels: ['Restaurants', 'Attractions', 'Hotels', 'Parks', 'Museums'],
            datasets: [{
                label: 'Places Visited',
                data: [12, 19, 8, 15, 7],
                backgroundColor: [
                    '#FF9800',
                    '#4CAF50',
                    '#9C27B0',
                    '#8BC34A',
                    '#3F51B5'
                ],
                borderColor: [
                    '#F57C00',
                    '#388E3C',
                    '#7B1FA2',
                    '#689F38',
                    '#303F9F'
                ],
                borderWidth: 1,
                hoverOffset: 10
            }]
        };
        
        // Chart configuration
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: false,
                        text: 'Places Visited by Category',
                        font: {
                            family: 'Poppins',
                            size: 16
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        };
        
        // Create chart
        new Chart(ctx, config);
        
    } catch (error) {
        console.error('Error creating categories chart:', error);
    }
}

// Create distance traveled chart
function createDistanceChart() {
    const ctx = document.getElementById('distance-chart');
    
    if (!ctx) {
        console.warn('Distance chart canvas not found');
        return;
    }
    
    try {
        // Mock data for distance traveled
        const data = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
                label: 'Distance (km)',
                data: [25, 35, 50, 30, 65, 45],
                fill: true,
                backgroundColor: 'rgba(74, 109, 229, 0.2)',
                borderColor: 'rgba(74, 109, 229, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(74, 109, 229, 1)',
                tension: 0.4
            }]
        };
        
        // Chart configuration
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Poppins',
                                size: 12
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        };
        
        // Create chart
        new Chart(ctx, config);
        
    } catch (error) {
        console.error('Error creating distance chart:', error);
    }
}

// Create a custom Canvas visualization
function createCustomVisualization(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.warn(`Canvas element with ID ${canvasId} not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        console.warn('Could not get canvas context');
        return;
    }
    
    try {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw a custom visualization
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        // Draw background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(74, 109, 229, 0.1)';
        ctx.fill();
        
        // Draw data points
        const points = data.length;
        const angle = (2 * Math.PI) / points;
        
        ctx.beginPath();
        
        // First point
        const initialX = centerX + radius * Math.cos(0);
        const initialY = centerY + radius * Math.sin(0);
        ctx.moveTo(initialX, initialY);
        
        for (let i = 1; i < points; i++) {
            const currentAngle = i * angle;
            const x = centerX + radius * Math.cos(currentAngle);
            const y = centerY + radius * Math.sin(currentAngle);
            ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.strokeStyle = 'rgba(74, 109, 229, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
    } catch (error) {
        console.error('Error creating custom canvas visualization:', error);
    }
}

// Make functions available to other scripts
window.chartFunctions = {
    createCategoriesChart,
    createDistanceChart,
    createCustomVisualization
};