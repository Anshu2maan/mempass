class Utils {
    static escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const days = Math.floor((now - date) / 86400000);
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }

    static showToast(message, duration = 3000) {
        // Agar message nahi hai to return
        if (!message) return;
        
        // Message ko string mein convert karo
        const msgStr = message.toString();
        
        // User-friendly messages
        let displayMessage = msgStr;
        
        // Common technical messages ko friendly banayo
        if (msgStr.includes('Decrypting') || msgStr.includes('Decrypt')) {
            displayMessage = '🔓 Opening file...';
        } else if (msgStr.includes('Decrypt failed') || msgStr.includes('Decryption failed')) {
            displayMessage = '❌ Could not open file. Please try again.';
        } else if (msgStr.includes('Downloading') || msgStr.includes('Download')) {
            displayMessage = msgStr.includes('failed') ? '❌ Download failed' : '✅ Download complete';
        } else if (msgStr.includes('Uploading') || msgStr.includes('Upload')) {
            displayMessage = '📤 Uploading...';
        } else if (msgStr.includes('Export')) {
            displayMessage = '📥 Exporting...';
        } else if (msgStr.includes('Import')) {
            displayMessage = '📤 Importing...';
        } else if (msgStr.includes('Error') || /failed|fail/i.test(msgStr) || msgStr.startsWith('❌')) {
            displayMessage = '❌ Something went wrong';
        } else if (msgStr.includes('Success') || msgStr.includes('success') || msgStr.startsWith('✅')) {
            displayMessage = '✅ ' + msgStr.replace(/✅/g, '').trim();
        }
        
        // Emoji cleanup (but keep one at start)
        if (!displayMessage.startsWith('✅') && !displayMessage.startsWith('❌') && 
            !displayMessage.startsWith('🔓') && !displayMessage.startsWith('📤') && 
            !displayMessage.startsWith('📥')) {
            displayMessage = 'ℹ️ ' + displayMessage.replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim();
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 9999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            max-width: 350px;
            font-weight: 500;
            font-size: 0.95rem;
            line-height: 1.4;
            pointer-events: none;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.1);
        `;
        toast.textContent = displayMessage;
        document.body.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
        }, duration);
    }

    static addKeyframeAnimations() {
        // Check if animations already exist
        if (document.getElementById('utils-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'utils-animations';
        style.textContent = `
            @keyframes slideIn { 
                from { transform: translateX(100%); opacity: 0; } 
                to { transform: translateX(0); opacity: 1; } 
            }
            @keyframes slideOut { 
                from { transform: translateX(0); opacity: 1; } 
                to { transform: translateX(100%); opacity: 0; } 
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    static initTheme() {
        const savedTheme = localStorage.getItem('mempass_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log('🎨 Theme loaded:', savedTheme);
    }

    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('mempass_theme', newTheme);
        
        this.showToast(`${newTheme === 'dark' ? '🌙' : '☀️'} ${newTheme} mode`);
    }

    // Utility: Copy to clipboard with fallback
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('✅ Copied to clipboard');
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('✅ Copied to clipboard');
                return true;
            } catch (e) {
                this.showToast('❌ Copy failed');
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    // Utility: Generate random ID
    static generateId(prefix = '') {
        return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Utility: Debounce function
    static debounce(func, wait = 200) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility: Check if string is valid JSON
    static isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Make Utils globally available
window.Utils = Utils;
