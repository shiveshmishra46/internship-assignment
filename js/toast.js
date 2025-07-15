/**
 * Toast notification system for user feedback
 */
document.addEventListener('DOMContentLoaded', function() {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    // Create and display a toast notification
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${getIconForType(type)}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Add visible class after a brief delay for animation
        setTimeout(() => toast.classList.add('visible'), 10);
        
        // Remove toast after duration
        setTimeout(() => {
            toast.classList.remove('visible');
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
    
    // Helper function to get the appropriate icon for toast type
    function getIconForType(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info':
            default: return 'fa-info-circle';
        }
    }
    
    // Add toast functionality to global scope
    window.appFunctions = window.appFunctions || {};
    window.appFunctions.showToast = showToast;
    
    // Add toast styles
    const style = document.createElement('style');
    style.textContent = `
        #toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            pointer-events: none;
        }
        
        .toast {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            background-color: white;
            color: #333;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 8px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            max-width: 300px;
            pointer-events: auto;
        }
        
        .toast.visible {
            transform: translateX(0);
        }
        
        .toast-icon {
            margin-right: 12px;
            font-size: 18px;
        }
        
        .toast-message {
            font-size: 14px;
        }
        
        .toast.success {
            border-left: 4px solid #48bb78;
        }
        
        .toast.success .toast-icon {
            color: #48bb78;
        }
        
        .toast.info {
            border-left: 4px solid #4299e1;
        }
        
        .toast.info .toast-icon {
            color: #4299e1;
        }
        
        .toast.warning {
            border-left: 4px solid #ed8936;
        }
        
        .toast.warning .toast-icon {
            color: #ed8936;
        }
        
        .toast.error {
            border-left: 4px solid #f56565;
        }
        
        .toast.error .toast-icon {
            color: #f56565;
        }
        
        .dark-mode .toast {
            background-color: #2d3748;
            color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
});