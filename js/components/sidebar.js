/**
 * Sidebar Component
 * Handles all sidebar related functionality including theme toggling
 * Last updated: 2025-07-16
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const themeSwitch = document.querySelector('#theme-switch');
    const navThemeToggle = document.querySelector('#nav-theme-toggle');
    const notificationToggle = document.querySelector('#notification-toggle');
    const navItems = document.querySelectorAll('.nav-grid a');

    // Setup sidebar functionality
    setupSidebarToggle();
    setupSidebarClose();
    setupThemeToggle();
    setupNotificationToggle();

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
    
    // Setup theme toggle functionality
    function setupThemeToggle() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = savedTheme === 'dark' || (savedTheme === null && prefersDark);
        
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
            
            // Update chart themes if present
            if (window.themeFunctions && window.themeFunctions.updateCharts) {
                window.themeFunctions.updateCharts();
            }
            
            // Update map theme if present
            if (window.themeFunctions && window.themeFunctions.applyThemeToMap && window.map) {
                window.themeFunctions.applyThemeToMap(window.map);
            }
        }
        
        // Apply initial theme
        applyTheme(isDarkMode);
        
        // Sidebar theme toggle
        if (themeSwitch) {
            themeSwitch.addEventListener('click', function() {
                applyTheme(this.checked);
                
                // Show toast notification if available
                if (window.appFunctions && window.appFunctions.showToast) {
                    const message = this.checked ? 'Dark mode enabled' : 'Light mode enabled';
                    window.appFunctions.showToast(message, 'info');
                }
            });
            
            // Make the entire setting item clickable
            const themeItem = themeSwitch.closest('.setting-item');
            if (themeItem) {
                themeItem.addEventListener('click', function(e) {
                    // Prevent double toggling when clicking the actual checkbox
                    if (e.target !== themeSwitch) {
                        themeSwitch.checked = !themeSwitch.checked;
                        applyTheme(themeSwitch.checked);
                        
                        // Show toast notification if available
                        if (window.appFunctions && window.appFunctions.showToast) {
                            const message = themeSwitch.checked ? 'Dark mode enabled' : 'Light mode enabled';
                            window.appFunctions.showToast(message, 'info');
                        }
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
    
    // Setup notifications toggle functionality
    function setupNotificationToggle() {
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
                
                // Show toast notification if available
                if (window.appFunctions && window.appFunctions.showToast) {
                    const message = isEnabled ? 'Notifications enabled' : 'Notifications disabled';
                    window.appFunctions.showToast(message, isEnabled ? 'success' : 'info');
                }
                
                // Request notification permission if enabled
                if (isEnabled && 'Notification' in window) {
                    Notification.requestPermission();
                }
            }
        }
    }
});