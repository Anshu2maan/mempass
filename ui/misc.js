// ui/misc.js - assorted helpers used by multiple modules

function isValidThumbnail(t) {
    if (!t || typeof t !== 'string') return false;
    return t.startsWith('data:') || t.startsWith('blob:') || /^https?:\/\//.test(t);
}

// Reveal any already-rendered <img> thumbnails (data: or blob:) by wiring onload or showing if complete
function revealThumbnailsIn(root) {
    try {
        const container = (typeof root === 'string') ? document.getElementById(root) : root;
        if (!container) return;
        const imgs = container.querySelectorAll('img');
        imgs.forEach(img => {
            const srcAttr = img.getAttribute('src') || '';
            if (!srcAttr) return;
            if (srcAttr.startsWith('data:') || srcAttr.startsWith('blob:')) {
                if (img.complete) {
                    img.style.visibility = 'visible';
                } else {
                    img.onload = () => { try { img.style.visibility = 'visible'; } catch(e){} };
                    img.onerror = () => { try { img.style.visibility = 'hidden'; } catch(e){} };
                }
            }
        });
    } catch (e) { console.error('revealThumbnailsIn error', e); }
}

function togglePasswordVisibilityField(id) {
    const el = document.getElementById(id);
    el.type = el.type === 'password' ? 'text' : 'password';
    resetInactivityTimer();
}

function checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
            const used = (estimate.usage / estimate.quota * 100).toFixed(1);
            if (used > 80) {
                // storage nearing quota, take action if desired
            }
        });
    }
}

window.toggleTheme = function() {
    if (typeof Utils !== 'undefined') {
        Utils.toggleTheme();
        resetInactivityTimer();
    }
};

function debugVault() {
    console.log('=== DEBUG ===');
    console.log('unlocked:', window.isVaultUnlocked);
    console.log('uploading:', isUploading);
    console.log('last activity:', new Date(lastActivityTime).toLocaleTimeString());
    console.log('inactive for:', Math.floor((Date.now() - lastActivityTime)/1000), 's');
    console.log('vault exists:', !!window.vault);
    console.log('key exists:', !!(window.vault?.key));
    console.log('passwords:', window.vault?.passwords?.length || 0);
    console.log('docs:', window.documentVault?.documents?.length || 0);
    console.log('pin attempts:', pinAttempts);
    console.log('lock until:', localStorage.getItem(STORAGE_KEYS.pinLockUntil));
}

window.isValidThumbnail = isValidThumbnail;
window.revealThumbnailsIn = revealThumbnailsIn;
window.togglePasswordVisibilityField = togglePasswordVisibilityField;
window.checkStorageQuota = checkStorageQuota;

function showPasswordsTab() {
    document.getElementById('passwordVaultContent').style.display = 'block';
    document.getElementById('documentsVaultContent').style.display = 'none';
    
    document.getElementById('showPasswordsTab').style.background = '#667eea';
    document.getElementById('showDocumentsTab').style.background = '#718096';
    
    loadSavedPasswords();
    resetInactivityTimer();
}

function showDocumentsTab() {
    document.getElementById('passwordVaultContent').style.display = 'none';
    document.getElementById('documentsVaultContent').style.display = 'block';
    
    document.getElementById('showPasswordsTab').style.background = '#718096';
    document.getElementById('showDocumentsTab').style.background = '#667eea';
    
    loadDocuments();
    resetInactivityTimer();
}

window.showPasswordsTab = showPasswordsTab;
window.showDocumentsTab = showDocumentsTab;

window.debugVault = debugVault;
