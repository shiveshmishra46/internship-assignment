// Initialize live clock
function initializeLiveClock() {
    const clockElement = document.getElementById('live-clock');
    const clockTime = clockElement.querySelector('.clock-time');
    const clockDate = clockElement.querySelector('.clock-date');
    
    function updateClock() {
        const now = new Date();
        
        // Format time: HH:MM AM/PM
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        // Format date: Day, Month DD, YYYY
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        
        // Update DOM elements
        clockTime.textContent = `${hours}:${minutes} ${ampm}`;
        clockDate.textContent = `${day}, ${month} ${date}`;
    }
    
    // Update immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
}

// Initialize theme based on user preference or system setting
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        
        // Update toggle switches
        document.querySelectorAll('.theme-toggle-input').forEach(toggle => {
            toggle.checked = true;
        });
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        
        // Update toggle switches
        document.querySelectorAll('.theme-toggle-input').forEach(toggle => {
            toggle.checked = false;
        });
    }
}

// Apply theme to map
function applyThemeToMap(map) {
    if (!map) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        // Apply dark style to map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19
        }).addTo(map);
    } else {
        // Apply light style to map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
    }
}

// Update charts based on theme
function updateCharts() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update all Chart.js instances
    if (window.Chart && Chart.instances) {
        Object.values(Chart.instances).forEach(chart => {
            // Update text color for labels
            if (chart.config.options.scales && chart.config.options.scales.x) {
                chart.config.options.scales.x.ticks.color = textColor;
                chart.config.options.scales.y.ticks.color = textColor;
                chart.config.options.scales.x.grid.color = gridColor;
                chart.config.options.scales.y.grid.color = gridColor;
            }
            
            // Update legend text color
            if (chart.config.options.plugins && chart.config.options.plugins.legend) {
                chart.config.options.plugins.legend.labels.color = textColor;
            }
            
            chart.update();
        });
    }
}

// Set up sidebar
function setupSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    // Open sidebar
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        });
    }
    
    // Close sidebar
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close sidebar when clicking overlay
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Update sidebar links to match the navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    if (sidebarLinks) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get target section ID
                const targetId = link.getAttribute('href').substring(1);
                
                // Navigate to section
                if (window.appFunctions && window.appFunctions.navigateToSection) {
                    window.appFunctions.navigateToSection(targetId);
                }
                
                // Update active link in sidebar
                sidebarLinks.forEach(sLink => sLink.classList.remove('active'));
                link.classList.add('active');
                
                // Update active link in main navigation
                const navLinks = document.querySelectorAll('.nav-items a');
                navLinks.forEach(navLink => {
                    if (navLink.getAttribute('href').substring(1) === targetId) {
                        navLink.classList.add('active');
                    } else {
                        navLink.classList.remove('active');
                    }
                });
                
                // Close sidebar
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

// Initialize theme functionality on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize live clock
    initializeLiveClock();
    
    // Initialize theme
    initializeTheme();
    
    // Set up theme toggle in nav
    const themeToggle = document.getElementById('nav-theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const isDarkMode = themeToggle.checked;
            
            if (isDarkMode) {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
            
            // Update charts for the new theme
            updateCharts();
            
            // Update maps if they exist
            if (window.map) {
                applyThemeToMap(window.map);
            }
            
            // Sync other theme toggles
            document.querySelectorAll('.theme-toggle-input').forEach(toggle => {
                if (toggle !== themeToggle) {
                    toggle.checked = isDarkMode;
                }
            });
        });
    }
});

// Export functions to be used by other modules
window.themeFunctions = {
    applyThemeToMap,
    updateCharts
};