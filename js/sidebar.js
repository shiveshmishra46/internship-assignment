// Enhanced sidebar.js for perfect functionality
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality - fixed with direct DOM manipulation
    initializeThemeToggle();
    
    // Notification toggle functionality - fixed with direct DOM manipulation
    initializeNotificationToggle();
    
    // Sidebar open/close functionality
    setupSidebarToggle();
    
    // Make navigation items work properly
    setupNavigationItems();
    
    // Initialize date in sidebar if needed
    updateSidebarDate();
});

function initializeThemeToggle() {
    const themeSwitch = document.getElementById('theme-switch');
    const navThemeToggle = document.getElementById('nav-theme-toggle');
    
    if (themeSwitch) {
        // Set initial state based on current theme
        const isDarkMode = document.body.classList.contains('dark-mode') || 
                          localStorage.getItem('theme') === 'dark';
        
        if (isDarkMode) {
            themeSwitch.checked = true;
            themeSwitch.nextElementSibling.classList.add('active');
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        }
        
        // Add direct event listener to both the input and the label
        themeSwitch.addEventListener('change', function() {
            handleThemeChange(this.checked);
        });
        
        // Also make the entire setting item clickable
        const themeSetting = themeSwitch.closest('.setting-item');
        if (themeSetting) {
            themeSetting.addEventListener('click', function(e) {
                // Don't trigger if clicking directly on the input (already handled)
                if (e.target !== themeSwitch) {
                    themeSwitch.checked = !themeSwitch.checked;
                    handleThemeChange(themeSwitch.checked);
                }
            });
        }
    }
}

function handleThemeChange(isDark) {
    const themeSwitch = document.getElementById('theme-switch');
    const navThemeToggle = document.getElementById('nav-theme-toggle');
    const themeSlider = themeSwitch ? themeSwitch.nextElementSibling : null;
    
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        if (navThemeToggle) navThemeToggle.checked = true;
        if (themeSlider) themeSlider.classList.add('active');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        if (navThemeToggle) navThemeToggle.checked = false;
        if (themeSlider) themeSlider.classList.remove('active');
        localStorage.setItem('theme', 'light');
    }
    
    // Update map theme if available
    if (window.mapFunctions && window.mapFunctions.updateMapTheme) {
        window.mapFunctions.updateMapTheme(isDark ? 'dark' : 'light');
    }
    
    // Show feedback
    if (window.appFunctions && window.appFunctions.showToast) {
        window.appFunctions.showToast(
            isDark ? 'Dark theme enabled' : 'Light theme enabled', 
            'info'
        );
    }
}

function initializeNotificationToggle() {
    const notificationToggle = document.getElementById('notification-toggle');
    
    if (notificationToggle) {
        // Set initial state based on localStorage
        const notificationsEnabled = localStorage.getItem('notifications') !== 'disabled';
        notificationToggle.checked = notificationsEnabled;
        
        if (notificationsEnabled) {
            notificationToggle.nextElementSibling.classList.add('active');
        }
        
        // Add event listener to the toggle
        notificationToggle.addEventListener('change', function() {
            handleNotificationChange(this.checked);
        });
        
        // Also make the entire setting item clickable
        const notificationSetting = notificationToggle.closest('.setting-item');
        if (notificationSetting) {
            notificationSetting.addEventListener('click', function(e) {
                // Don't trigger if clicking directly on the input (already handled)
                if (e.target !== notificationToggle) {
                    notificationToggle.checked = !notificationToggle.checked;
                    handleNotificationChange(notificationToggle.checked);
                }
            });
        }
    }
}

function handleNotificationChange(isEnabled) {
    const notificationToggle = document.getElementById('notification-toggle');
    const notificationSlider = notificationToggle ? notificationToggle.nextElementSibling : null;
    
    if (isEnabled) {
        localStorage.setItem('notifications', 'enabled');
        if (notificationSlider) notificationSlider.classList.add('active');
        if (window.appFunctions && window.appFunctions.showToast) {
            window.appFunctions.showToast('Notifications enabled', 'success');
        }
    } else {
        localStorage.setItem('notifications', 'disabled');
        if (notificationSlider) notificationSlider.classList.remove('active');
        if (window.appFunctions && window.appFunctions.showToast) {
            window.appFunctions.showToast('Notifications disabled', 'info');
        }
    }
}

function setupSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const closeBtn = document.querySelector('.close-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
        
        const closeSidebar = function() {
            sidebar.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
        
        // Add escape key listener
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });
    }
}

function setupNavigationItems() {
    const navItems = document.querySelectorAll('.nav-item');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section ID
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active states
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Navigate to section
            if (window.appFunctions && window.appFunctions.navigateToSection) {
                window.appFunctions.navigateToSection(targetId);
            }
            
            // Close sidebar
            if (sidebar && sidebarOverlay) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    });
}

function updateSidebarDate() {
    const sidebarDate = document.getElementById('sidebar-date');
    if (sidebarDate) {
        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        sidebarDate.textContent = now.toLocaleDateString(undefined, options);
    }
}