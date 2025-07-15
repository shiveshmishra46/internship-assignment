// Theme management

// Check for user preference
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Check for system preference if no saved preference
    if (!savedTheme) {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDarkMode ? 'dark' : 'light');
    } else {
        setTheme(savedTheme);
    }
    
    // Set up theme toggle buttons
    setupThemeToggles();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Set theme across the app
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        updateThemeToggles(true);
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        updateThemeToggles(false);
    }
    
    // Save preference
    localStorage.setItem('theme', theme);
    
    // Update charts if they exist
    updateChartTheme(theme);
    
    // Update map if it exists
    updateMapTheme(theme);
    
    console.log(`Theme set to ${theme} mode`);
}

// Update all theme toggle switches
function updateThemeToggles(isDark) {
    // Update nav toggle
    const navToggle = document.getElementById('nav-theme-toggle');
    if (navToggle) {
        navToggle.checked = isDark;
    }
    
    // Update sidebar toggle
    const sidebarToggle = document.getElementById('theme-switch');
    if (sidebarToggle) {
        sidebarToggle.checked = isDark;
    }
}

// Set up theme toggle buttons
function setupThemeToggles() {
    // Nav theme toggle
    const navToggle = document.getElementById('nav-theme-toggle');
    if (navToggle) {
        navToggle.addEventListener('change', (e) => {
            setTheme(e.target.checked ? 'dark' : 'light');
            
            // Add animation effect
            const toggleIcon = e.target.nextElementSibling;
            toggleIcon.classList.add('theme-toggle-animation');
            setTimeout(() => {
                toggleIcon.classList.remove('theme-toggle-animation');
            }, 500);
        });
    }
    
    // Sidebar theme toggle
    const sidebarToggle = document.getElementById('theme-switch');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('change', (e) => {
            setTheme(e.target.checked ? 'dark' : 'light');
        });
    }
}

// Update chart themes
function updateChartTheme(theme) {
    // Get Chart.js defaults
    if (window.Chart) {
        const isDark = theme === 'dark';
        
        // Update global chart options
        Chart.defaults.color = isDark ? '#cbd5e0' : '#6c757d';
        Chart.defaults.borderColor = isDark ? '#2d3748' : '#f8f9fa';
        
        // Update existing charts
        if (window.chartFunctions) {
            // Recreate charts with new theme
            setTimeout(() => {
                if (window.chartFunctions.createCategoriesChart) {
                    window.chartFunctions.createCategoriesChart();
                }
                if (window.chartFunctions.createDistanceChart) {
                    window.chartFunctions.createDistanceChart();
                }
            }, 100);
        }
    }
}

// Update map theme
function updateMapTheme(theme) {
    if (window.mapFunctions && window.mapFunctions.updateMapTheme) {
        window.mapFunctions.updateMapTheme(theme);
    }
}

// Add CSS animations for theme toggle
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes theme-toggle-animation {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .theme-toggle-animation {
            animation: theme-toggle-animation 0.5s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize theme
    initTheme();
    
    // Setup sidebar
    setupSidebar();
    
    // Setup network info display on mobile
    setupNetworkInfoDisplay();
});

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
                document.body.style.overflow = ''; // Restore scrolling
            });
        });
    }
    
    // Setup mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navItems = document.querySelector('.nav-items');
    
    if (mobileMenuBtn && navItems) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navItems.classList.toggle('active');
            
            // Create overlay for mobile menu if it doesn't exist
            let mobileOverlay = document.querySelector('.mobile-menu-overlay');
            if (!mobileOverlay && navItems.classList.contains('active')) {
                mobileOverlay = document.createElement('div');
                mobileOverlay.className = 'sidebar-overlay mobile-menu-overlay';
                document.body.appendChild(mobileOverlay);
                
                // Add click event to close menu when overlay is clicked
                mobileOverlay.addEventListener('click', () => {
                    mobileMenuBtn.classList.remove('active');
                    navItems.classList.remove('active');
                    mobileOverlay.remove();
                });
            } else if (mobileOverlay && !navItems.classList.contains('active')) {
                mobileOverlay.remove();
            }
        });
        
        // Close menu when clicking a link
        navItems.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navItems.classList.remove('active');
                
                // Remove mobile overlay if exists
                const mobileOverlay = document.querySelector('.mobile-menu-overlay');
                if (mobileOverlay) {
                    mobileOverlay.remove();
                }
            });
        });
    }
}

// Setup network info display on mobile
function setupNetworkInfoDisplay() {
    const networkInfoContainer = document.querySelector('.network-info-container');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    
    if (networkInfoContainer && sidebarToggle && window.innerWidth <= 768) {
        // Create toggle button for network info
        const infoToggle = document.createElement('button');
        infoToggle.className = 'network-toggle-btn';
        infoToggle.innerHTML = '<i class="fas fa-signal"></i>';
        infoToggle.style.cssText = `
            background: none;
            border: none;
            color: var(--text-dark);
            font-size: 1.2rem;
            cursor: pointer;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Insert toggle before sidebar toggle
        sidebarToggle.parentNode.insertBefore(infoToggle, sidebarToggle);
        
        // Add toggle functionality
        infoToggle.addEventListener('click', () => {
            networkInfoContainer.classList.toggle('visible');
        });
    }
}

// Make theme functions available to other scripts
window.themeFunctions = {
    setTheme,
    getTheme: () => localStorage.getItem('theme') || 'light'
};

// Add to your theme.js file to update the sidebar date

// Update sidebar date
function updateSidebarDate() {
    const sidebarDate = document.getElementById('sidebar-date');
    if (sidebarDate) {
        const now = new Date();
        sidebarDate.textContent = now.toLocaleDateString([], { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
    }
}

// Add this function call to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Existing code here...
    
    // Update sidebar date
    updateSidebarDate();
    
    // Update date every minute
    setInterval(updateSidebarDate, 60000);
});