class Utils {
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        // Translate common technical messages into friendly language
        const translateToast = (msg) => {
            if (!msg) return '';
            const m = msg.toString();
            if (m.includes('Decrypting') || m.includes('Decrypt')) return 'Opening file...';
            if (m.includes('Decrypt failed') || m.includes('Decryption failed')) return 'Could not open file. Please try again.';
            if (m.includes('Downloading') || m.includes('Download')) {
                if (/failed|error/i.test(m)) return 'Download failed. Please try again.';
                return 'Download complete.';
            }
            if (m.includes('Uploading') || m.includes('Upload')) return 'Uploading...';
            if (m.includes('Export')) return 'Exporting...';
            if (m.includes('Import')) return 'Importing...';
            if (m.includes('Error') || /failed|fail/i.test(m) || m.startsWith('❌')) return 'Something went wrong. Please try again.';
            // Friendly defaults: remove emoji and trim
            return m.replace(/\u274C|\u2714|\u26A0\uFE0F|[\u{1F300}-\u{1F6FF}]/gu, '').trim();
        };

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 9999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s;
            max-width: 300px;
            font-weight: 500;
        `;
        toast.textContent = translateToast(message);
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static addKeyframeAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn { 
                from { transform: translateX(100%); opacity: 0; } 
                to { transform: translateX(0); opacity: 1; } 
            }
            @keyframes slideOut { 
                from { transform: translateX(0); opacity: 1; } 
                to { transform: translateX(100%); opacity: 0; } 
            }
        `;
        document.head.appendChild(style);
    }
    // Utils class ke andar ye do methods add karo
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
    
    // Show toast notification
    this.showToast(`${newTheme === 'dark' ? '🌙' : '☀️'} ${newTheme} mode enabled`);
}
}
