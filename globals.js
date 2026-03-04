// ui/globals.js - shared global variables used across UI modules

// vault-level state
let currentPassword = '';
let currentService = '';
let pinModalMode = 'verify';
let pinAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.pinAttempts) || '0');
let autoLockTimer = null;
let inactivityTimer = null;
let isUploading = false;
let lastActivityTime = Date.now();
let pendingDecrypt = null;
window.hideLockTimer = null;

// expose to window in case other scripts read them directly
window.currentPassword = currentPassword;
window.currentService = currentService;
window.pinModalMode = pinModalMode;
window.pinAttempts = pinAttempts;
window.isUploading = isUploading;
window.lastActivityTime = lastActivityTime;
