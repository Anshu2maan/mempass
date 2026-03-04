// ui/vault-ui.js - functions for locking/unlocking vault and inactivity/auto-lock timers

function unlockVault() {
    console.log('🔓 Unlocking vault');

    window.isVaultUnlocked = true;
    lastActivityTime = Date.now();

    // Ensure key is set
    if (vault?.key) window.vault.key = vault.key;
    if (window.documentVault) window.documentVault.passwordVault = window.vault;

    // Update UI
    document.getElementById('lockedVault').style.display = 'none';
    document.getElementById('unlockedVault').style.display = 'block';

    showPasswordsTab();
    loadSavedPasswords();

    // Init document vault
    setTimeout(() => {
        if (typeof initDocumentVault === 'function') initDocumentVault();
    }, 500);

    startAutoLockTimer();
    startInactivityTimer();
    setupActivityListeners();

    // if drive sync is enabled schedule a background upload
    if (window.googleDriveSync?.enabled) {
        window.googleDriveSync.queueSync?.();
    }

    Utils.showToast('🔓 Vault unlocked');
}

function lockVault() {
    if (isUploading) {
        console.log('📤 Upload in progress, delaying lock');
        setTimeout(() => {
            if (!isUploading && window.isVaultUnlocked) performLock();
        }, 2000);
        return;
    }
    performLock();
}

function performLock() {
    console.log('🔒 Locking vault');

    window.isVaultUnlocked = false;

    if (vault) vault.lock();
    window.documentVault = null;

    document.getElementById('lockedVault').style.display = 'block';
    document.getElementById('unlockedVault').style.display = 'none';

    clearTimeout(autoLockTimer);
    clearTimeout(inactivityTimer);
    removeActivityListeners();

    Utils.showToast('Vault locked');
}

// ==================== TIMERS ====================
function startAutoLockTimer() {
    clearTimeout(autoLockTimer);

    autoLockTimer = setTimeout(() => {
        if (window.isVaultUnlocked && !isUploading) {
            performLock();
            Utils.showToast('Auto-locked');
        }
    }, 5 * 60 * 1000);

    // Warning at 4 minutes
    setTimeout(() => {
        if (window.isVaultUnlocked && !isUploading) {
            Utils.showToast('Auto-lock in 1 minute', 5000);
        }
    }, 4 * 60 * 1000);
}

function startInactivityTimer() {
    clearTimeout(inactivityTimer);

    if (window.isVaultUnlocked && !isUploading) {
        inactivityTimer = setTimeout(() => {
            const inactive = Date.now() - lastActivityTime;
            if (inactive >= 90000 && window.isVaultUnlocked && !isUploading) {
                performLock();
                Utils.showToast('Locked due to inactivity');
            }
        }, 90000);
    }
}

function resetInactivityTimer() {
    lastActivityTime = Date.now();
    if (window.isVaultUnlocked && !isUploading) {
        startInactivityTimer();
    }
}

function setupActivityListeners() {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(ev => {
        document.addEventListener(ev, resetInactivityTimer, { passive: true });
    });
}

function removeActivityListeners() {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(ev => {
        document.removeEventListener(ev, resetInactivityTimer);
    });
}

// export globals
window.unlockVault = unlockVault;
window.lockVault = lockVault;
window.performLock = performLock;
window.startAutoLockTimer = startAutoLockTimer;
window.startInactivityTimer = startInactivityTimer;
window.resetInactivityTimer = resetInactivityTimer;
window.setupActivityListeners = setupActivityListeners;
window.removeActivityListeners = removeActivityListeners;
