/**
 * Fixed Sidebar.js - Resolving theme toggle and notification toggle issues
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fix navigation buttons (Home, Map, Recommendations, Saved Places)
    const navItems = document.querySelectorAll('.nav-item, .sidebar-link');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section ID from href attribute
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active states
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Navigate to section
            navigateToSection(targetId);
            
            // Close sidebar
            if (sidebar) sidebar.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    });

    function navigateToSection(sectionId) {
        const allSections = document.querySelectorAll('section.section');
        const targetSection = document.getElementById(sectionId);
        
        if (allSections.length && targetSection) {
            // Hide all sections
            allSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            targetSection.classList.add('active');
            
            // Update URL hash without scrolling
            if (history.pushState) {
                history.pushState(null, null, '#' + sectionId);
            } else {
                location.hash = '#' + sectionId;
            }
            
            // Also update navbar links
            const navbarLinks = document.querySelectorAll('.nav-items a');
            if (navbarLinks.length) {
                navbarLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        }
    }
    
    // FIXED: Theme toggle functionality with direct DOM manipulation
    function setupThemeToggle() {
        const themeSwitch = document.getElementById('theme-switch');
        const navThemeToggle = document.getElementById('nav-theme-toggle');
        
        // Function to apply theme
        function applyTheme(isDark) {
            if (isDark) {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
            
            // Sync both toggles
            if (themeSwitch) themeSwitch.checked = isDark;
            if (navThemeToggle) navThemeToggle.checked = isDark;
        }
        
        // Check initial state
        const initialDarkMode = localStorage.getItem('theme') === 'dark' || 
                               document.body.classList.contains('dark-mode');
        
        // Apply initial theme
        applyTheme(initialDarkMode);
        
        // Sidebar theme toggle
        if (themeSwitch) {
            // Add direct click handler
            themeSwitch.addEventListener('click', function() {
                applyTheme(this.checked);
            });
            
            // Make the entire setting item clickable
            const themeItem = themeSwitch.closest('.setting-item');
            if (themeItem) {
                themeItem.addEventListener('click', function(e) {
                    // Prevent double toggling when clicking the actual checkbox
                    if (e.target !== themeSwitch) {
                        themeSwitch.checked = !themeSwitch.checked;
                        applyTheme(themeSwitch.checked);
                    }
                });
            }
        }
        
        // Header theme toggle
        if (navThemeToggle) {
            navThemeToggle.addEventListener('change', function() {
                applyTheme(this.checked);
            });
        }
    }
    
    // FIXED: Notifications toggle functionality
    function setupNotificationToggle() {
        const notificationToggle = document.getElementById('notification-toggle');
        
        if (notificationToggle) {
            // Set initial state
            const notificationsEnabled = localStorage.getItem('notifications') !== 'disabled';
            notificationToggle.checked = notificationsEnabled;
            
            // Direct click handler
            notificationToggle.addEventListener('click', function() {
                toggleNotifications(this.checked);
            });
            
            // Make the setting item clickable
            const notificationItem = notificationToggle.closest('.setting-item');
            if (notificationItem) {
                notificationItem.addEventListener('click', function(e) {
                    // Prevent double toggling when clicking the actual checkbox
                    if (e.target !== notificationToggle) {
                        notificationToggle.checked = !notificationToggle.checked;
                        toggleNotifications(notificationToggle.checked);
                    }
                });
            }
            
            // Toggle notifications function
            function toggleNotifications(isEnabled) {
                localStorage.setItem('notifications', isEnabled ? 'enabled' : 'disabled');
            }
        }
    }
    
    // Setup sidebar toggle button
    function setupSidebarToggle() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.add('active');
                if (sidebarOverlay) sidebarOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        }
    }
    
    // Setup sidebar close functionality
    function setupSidebarClose() {
        const closeBtn = document.querySelector('.close-sidebar');
        
        if (closeBtn && sidebar) {
            closeBtn.addEventListener('click', function() {
                sidebar.classList.remove('active');
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        if (sidebarOverlay && sidebar) {
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    }
    
    // Initialize all sidebar functionality
    setupThemeToggle();
    setupNotificationToggle();
    setupSidebarToggle();
    setupSidebarClose();
});