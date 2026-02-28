// ui-handlers.js - COMPLETE FINAL VERSION
// Tab switch par lock nahi hoga, sirf tab close par

// ==================== GLOBAL VARIABLES ====================
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

// ==================== TAB CLOSE LOCK ====================
// Visibility change par nahi, sirf tab close par lock

// Note: previous behavior locked the vault on tab close/page hide.
// To honor time-based locking only, those listeners are intentionally removed.
// If you still want to lock on actual tab close (unload), re-enable the handlers.

// 👇 IMPORTANT: VisibilityChange Listener COMPLETELY HATAYA
// Ab tab switch karne se KUCH NAHI hoga

// ==================== PIN INPUT HANDLING ====================
function handlePinInput(idx, e) {
    const input = e.target;
    const val = input.value;
    
    // Mobile numeric keyboard
    input.inputMode = 'numeric';
    input.pattern = '[0-9]*';
    
    // Auto-focus next
    if (val.length === 1 && idx < 6) {
        const nextInput = document.getElementById(`pin${idx+1}`);
        if (nextInput) nextInput.focus();
    }
    
    // Backspace handling
    if (e.inputType === 'deleteContentBackward' && idx > 1 && val === '') {
        const prevInput = document.getElementById(`pin${idx-1}`);
        if (prevInput) {
            prevInput.focus();
            prevInput.value = '';
        }
    }
    
    if (window.isVaultUnlocked) resetInactivityTimer();
}

function getPin() {
    let pin = '';
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`pin${i}`);
        if (input) pin += input.value;
    }
    return pin;
}

function clearPinInputs() {
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`pin${i}`);
        if (input) input.value = '';
    }
}

// ==================== PIN MODAL ====================
function showPinModal(mode) {
    pinModalMode = mode;
    const title = document.getElementById('pinModalTitle');
    const desc = document.getElementById('pinModalDescription');
    
    const modalTitles = {
        setup: { title: '🔐 Set PIN', desc: 'Choose a 6-digit PIN' },
        verify: { title: '🔓 Unlock', desc: 'Enter your 6-digit PIN' },
        change: { title: '🔄 Change PIN', desc: 'Enter new 6-digit PIN' }
    };
    
    if (title && desc) {
        title.textContent = modalTitles[mode].title;
        desc.textContent = modalTitles[mode].desc;
    }
    
    clearPinInputs();
    document.getElementById('pinModal').style.display = 'flex';
    setTimeout(() => document.getElementById('pin1')?.focus(), 100);
}

function closePinModal() {
    document.getElementById('pinModal').style.display = 'none';
    clearPinInputs();
    document.getElementById('pinError').textContent = '';
    document.getElementById('pinSuccess').textContent = '';
}

// ==================== PIN VERIFICATION ====================
async function verifyPin() {
    const pin = getPin();
    const err = document.getElementById('pinError');
    const succ = document.getElementById('pinSuccess');
    
    err.textContent = '';
    succ.textContent = '';

    // Check lockout
    const lockUntil = localStorage.getItem(STORAGE_KEYS.pinLockUntil);
    if (lockUntil && Date.now() < parseInt(lockUntil)) {
        const remaining = Math.ceil((parseInt(lockUntil) - Date.now()) / 60000);
        err.textContent = `Please wait ${remaining} minutes`;
        return;
    }

    // Validate PIN
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
        err.textContent = 'PIN must be 6 digits';
        clearPinInputs();
        document.getElementById('pin1')?.focus();
        return;
    }

    try {
            if (pinModalMode === 'setup' || pinModalMode === 'change') {
            await vault.setPin(pin);
            succ.textContent = 'PIN set';
            
            setTimeout(() => {
                closePinModal();
                Utils.showToast('🔐 PIN set successfully');
                
                const setupBtn = document.getElementById('setupPinBtn');
                setupBtn.textContent = '🔐 Change PIN';
                setupBtn.onclick = () => showPinModal('change');
                
                pinAttempts = 0;
                localStorage.setItem(STORAGE_KEYS.pinAttempts, '0');
                localStorage.removeItem(STORAGE_KEYS.pinLockUntil);
            }, 1200);
            
        } else {
            // If no PIN has been set yet, inform user to set PIN instead of saying "Wrong PIN"
            if (!vault?.settings?.saltB64) {
                err.textContent = '🔧 Set PIN first';
                clearPinInputs();
                return;
            }

            const ok = await vault.verifyPin(pin);
            
            if (ok) {
                pinAttempts = 0;
                localStorage.setItem(STORAGE_KEYS.pinAttempts, '0');
                localStorage.removeItem(STORAGE_KEYS.pinLockUntil);
                
                succ.textContent = '✓ Unlocking...';
                
                setTimeout(() => {
                    closePinModal();
                    unlockVault();
                    
                    const lastExport = localStorage.getItem(STORAGE_KEYS.lastExport);
                    if (!lastExport || Date.now() - parseInt(lastExport) > 30 * 24 * 60 * 60 * 1000) {
                        Utils.showToast('Consider backing up your vault', 10000);
                    }
                }, 600);
                
            } else {
                pinAttempts++;
                localStorage.setItem(STORAGE_KEYS.pinAttempts, pinAttempts.toString());
                
                    if (pinAttempts >= 5) {
                    const lockTime = Date.now() + (10 * 60 * 1000);
                    localStorage.setItem(STORAGE_KEYS.pinLockUntil, lockTime.toString());
                    err.textContent = `Locked for 10 minutes`;
                    pinAttempts = 0;
                    localStorage.setItem(STORAGE_KEYS.pinAttempts, '0');
                    clearPinInputs();
                    return;
                }
                
                err.textContent = `Wrong PIN (${5 - pinAttempts} attempts left)`;
                clearPinInputs();
                document.getElementById('pin1')?.focus();
            }
        }
    } catch (e) {
        console.error('PIN error:', e);
        err.textContent = e.message || 'Error occurred';
    }
}

function forgotPin() {
    if (confirm('Reset vault? This will erase all data. Continue?')) {
        vault.resetPin();
        closePinModal();
        lockVault();
        
        const setupBtn = document.getElementById('setupPinBtn');
        setupBtn.textContent = '🔐 Set PIN';
        setupBtn.onclick = () => showPinModal('setup');
        
        Utils.showToast('Vault reset');
    }
}

// ==================== VAULT LOCK/UNLOCK ====================
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

// ==================== TAB SWITCHING ====================
function showPasswordsTab() {
    document.getElementById('passwordVaultContent').style.display = 'block';
    document.getElementById('documentsVaultContent').style.display = 'none';
    
    document.getElementById('showPasswordsTab').style.background = '#667eea';
    document.getElementById('showDocumentsTab').style.background = '#718096';
    
    loadSavedPasswords();
    resetInactivityTimer();
}

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

function showDocumentsTab() {
    document.getElementById('passwordVaultContent').style.display = 'none';
    document.getElementById('documentsVaultContent').style.display = 'block';
    
    document.getElementById('showPasswordsTab').style.background = '#718096';
    document.getElementById('showDocumentsTab').style.background = '#667eea';
    
    loadDocuments();
    resetInactivityTimer();
}

// 👇 visibilitychange listener intentionally removed
// Tab switch par kuch nahi hoga

// ==================== PASSWORD GENERATION ====================
async function generatePassword() {
    const phrase = document.getElementById('masterPhrase').value.trim();
    const service = document.getElementById('serviceName').value.trim();
    const length = parseInt(document.getElementById('passwordLength').value);
    const version = parseInt(document.getElementById('version').value);

    if (!phrase || !service) {
        Utils.showToast("Enter master phrase and service");
        return;
    }

    if (length < 8) {
        Utils.showToast("Minimum 8 characters");
        document.getElementById('passwordLength').value = "8";
        return;
    }

    try {
        Utils.showToast('Generating...', 1000);
        currentPassword = await PasswordGenerator.generate(phrase, service, version, length);
        currentService = service;

        const output = document.getElementById('passwordOutput');
        output.textContent = currentPassword;
        output.dataset.realPassword = currentPassword;
        output.style.webkitTextSecurity = 'disc';
        
        document.getElementById('passwordDisplay').style.display = 'flex';

        // Show strength
        const strength = PasswordGenerator.estimateStrength(currentPassword);
        const fill = document.getElementById('strengthFill');
        fill.style.width = `${strength.strength}%`;
        fill.style.background = strength.strength >= 70 ? '#48bb78' : strength.strength >= 40 ? '#ed8936' : '#f56565';
        
        document.getElementById('strengthLabel').textContent = `Cracking time: ${strength.readableTime}`;
        
        updateMasterStrength(phrase);
        resetInactivityTimer();
        
    } catch (error) {
        console.error('Generation error:', error);
        Utils.showToast('Generation failed');
    }
}

function updateMasterStrength(phrase) {
    const fill = document.querySelector('#masterStrength .strength-fill');
    const label = document.getElementById('masterStrengthLabel');
    
    let score = 0;
    if (phrase.length >= 12) score += 40;
    else if (phrase.length >= 8) score += 20;
    
    if (/[a-z]/.test(phrase) && /[A-Z]/.test(phrase)) score += 20;
    if (/[0-9]/.test(phrase)) score += 20;
    if (/[^a-zA-Z0-9]/.test(phrase)) score += 20;
    
    score = Math.min(score, 100);
    
    fill.style.width = `${score}%`;
    fill.style.background = score >= 70 ? '#48bb78' : score >= 40 ? '#ed8936' : '#f56565';
    
    label.textContent = score >= 70 ? 'Strong' : score >= 40 ? 'Medium' : 'Weak';
    resetInactivityTimer();
}

// Toggle visibility of generated password in the generator area
function togglePasswordOutput() {
    const output = document.getElementById('passwordOutput');
    const btn = document.getElementById('togglePasswordOutput');
    if (!output || !btn) return;

    const isMasked = output.style.webkitTextSecurity === 'disc' || output.dataset.masked === '1';
    if (isMasked) {
        // show
        output.style.webkitTextSecurity = 'none';
        output.textContent = output.dataset.realPassword || currentPassword || '';
        output.dataset.masked = '0';
        btn.textContent = '🙈';
    } else {
        // hide
        output.style.webkitTextSecurity = 'disc';
        output.textContent = output.dataset.realPassword ? output.dataset.realPassword : currentPassword || '';
        output.dataset.masked = '1';
        btn.textContent = '👁️';
    }

    resetInactivityTimer();
}

// ==================== PASSWORD ACTIONS ====================
async function savePassword() {
    const service = document.getElementById('serviceName').value.trim();

    if (!service || !currentPassword) {
        Utils.showToast('Generate password first');
        return;
    }

    if (!vault?.settings?.saltB64) {
        showPinModal('setup');
        return;
    }

    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }

    const username = prompt('Username:', 'user@example.com');
    if (username === null) return;

    const notes = prompt('Notes (optional):', '');

    try {
        await vault.addPassword(service, username, currentPassword, notes);
        loadSavedPasswords();
        Utils.showToast('Password saved');
        resetInactivityTimer();
    } catch (error) {
        console.error('Save error:', error);
        Utils.showToast('Save failed');
    }
}

function copyPassword() {
    if (!currentPassword) {
        Utils.showToast('No password');
        return;
    }
    
    navigator.clipboard.writeText(currentPassword)
    .then(() => Utils.showToast('Copied'))
    .catch(() => Utils.showToast('Copy failed'));
    resetInactivityTimer();
}

function incrementVersion() {
    const el = document.getElementById('version');
    el.value = parseInt(el.value) + 1;
    resetInactivityTimer();
}

// ==================== NEW COOL SAVE MODAL ====================
function showSavePasswordModal() {
    if (!currentPassword || !currentService) {
        Utils.showToast('Generate a password first ✨');
        return;
    }
    if (!vault?.settings?.saltB64) {
        showPinModal('setup');
        return;
    }
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }

    // Fill data
    document.getElementById('saveService').value = currentService;
    document.getElementById('savePasswordField').value = currentPassword;
    document.getElementById('saveUsername').value = '';
    document.getElementById('saveNotes').value = '';
    document.getElementById('saveFavorite').checked = false;

    document.getElementById('savePasswordModal').style.display = 'flex';
    setTimeout(() => document.getElementById('saveUsername').focus(), 200);
}

function closeSavePasswordModal() {
    document.getElementById('savePasswordModal').style.display = 'none';
}

async function confirmSavePassword() {
    const username = document.getElementById('saveUsername').value.trim();
    const notes = document.getElementById('saveNotes').value.trim();
    const isFavorite = document.getElementById('saveFavorite').checked;

    try {
        const entry = await vault.addPassword(currentService, username, currentPassword, notes);
        
        if (isFavorite && entry.id) {
            const pwd = vault.passwords.find(p => p.id === entry.id);
            if (pwd) pwd.favorite = true;
            await vault.saveToDB();
        }

        closeSavePasswordModal();
        loadSavedPasswords();
        
        // Super cool success
        Utils.showToast('🎉 Password saved successfully!', 3000);
        
        // Optional: clear generator after save
        // document.getElementById('passwordDisplay').style.display = 'none';
        
    } catch (e) {
        Utils.showToast('❌ Save failed: ' + e.message);
    }
}

// ==================== PASSWORD VAULT DISPLAY ====================
async function loadSavedPasswords() {
    if (!window.isVaultUnlocked || !vault) return;
    
    const container = document.getElementById('savedPasswords');
    if (!container) return;
    
    const query = document.getElementById('searchPasswords')?.value || '';
    const sort = document.getElementById('sortPasswords')?.value || 'newest';

    let items = vault.searchPasswords(query);
    items = vault.sortPasswords(sort);

    if (vault.updateStats) vault.updateStats();

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">${query ? '🔍' : '🔒'}</div>
                <h3>${query ? 'No results' : 'No passwords'}</h3>
                <p>${query ? 'Try different search' : 'Generate & save a password'}</p>
            </div>`;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="saved-password-item" data-id="${item.id}">
            <div class="password-item-header">
                <div>
                    <strong>${Utils.escapeHtml(item.service)}</strong>
                    <div style="font-size:0.9rem;color:#718096;">
                        👤 ${Utils.escapeHtml(vault.getDecryptedUsername(item) || 'No username')} • 
                        📅 ${Utils.formatDate(item.created)}
                        ${item.favorite ? ' ⭐' : ''}
                    </div>
                </div>
                <div class="password-item-actions">
                    <button class="action-btn" onclick="copySavedPassword('${item.id}')">📋</button>
                    <button class="action-btn" onclick="togglePasswordVisibility('${item.id}')">👁️</button>
                    <button class="action-btn" onclick="editPassword('${item.id}')">✏️</button>
                    <button class="action-btn" onclick="deletePassword('${item.id}')" style="color:#f56565;">🗑️</button>
                </div>
            </div>
            <div class="password-display-hidden" id="password-${item.id}">
                <span class="hidden-password">••••••••••••</span>
            </div>
            ${vault.getDecryptedNotes(item) ? 
                `<div style="margin-top:10px;font-size:0.9rem;background:#edf2f7;padding:8px;border-radius:6px;">
                    📝 ${Utils.escapeHtml(vault.getDecryptedNotes(item))}
                </div>` : ''}
        </div>
    `).join('');
    
    resetInactivityTimer();
}

// ==================== PASSWORD ITEM ACTIONS ====================
async function copySavedPassword(id) {
    const item = vault.passwords.find(p => p.id == id);
    if (!item) return;
    
    let password = item._decryptedPassword;
    
    if (!password && item.password?.iv && vault.key) {
        try {
            password = await vault.decryptField(vault.key, item.password);
            item._decryptedPassword = password;
        } catch (e) {
            console.error('Decryption failed:', e);
            Utils.showToast('❌ Decryption failed');
            return;
        }
    }
    
    navigator.clipboard.writeText(password)
        .then(() => Utils.showToast('✓ Copied'))
        .catch(() => Utils.showToast('❌ Copy failed'));
    
    resetInactivityTimer();
}

async function togglePasswordVisibility(id) {
    const el = document.getElementById(`password-${id}`);
    const item = vault.passwords.find(p => p.id == id);
    if (!el || !item) return;
    
    if (pendingDecrypt) pendingDecrypt = null;
    
    if (el.innerHTML.includes('hidden-password')) {
        let password = item._decryptedPassword;
        
        if (!password && item.password?.iv) {
            Utils.showToast('Decrypting...', 800);
            try {
                password = await vault.decryptField(vault.key, item.password);
                item._decryptedPassword = password;
            } catch (e) {
                Utils.showToast('❌ Decrypt failed');
                return;
            }
        }
        
        el.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-family:monospace;font-size:1.2rem;">${Utils.escapeHtml(password)}</span>
                <button class="action-btn" onclick="copySavedPassword('${item.id}')">📋</button>
            </div>`;
    } else {
        el.innerHTML = '<span class="hidden-password">••••••••••••</span>';
    }
    
    resetInactivityTimer();
}

async function editPassword(id) {
    const item = vault.passwords.find(p => p.id == id);
    if (!item) return;
    
    const username = vault.getDecryptedUsername(item);
    const password = vault.getDecryptedPassword(item);
    const notes = vault.getDecryptedNotes(item);
    
    const newUsername = prompt('Edit username:', username || '');
    if (newUsername === null) return;
    
    const newPassword = prompt('Edit password:', password || '');
    if (newPassword === null) return;
    
    const newNotes = prompt('Edit notes:', notes || '');
    
    try {
        await vault.updatePassword(item.id, {
            username: newUsername,
            password: newPassword,
            notes: newNotes
        });
        loadSavedPasswords();
        Utils.showToast('✓ Updated');
    } catch (error) {
        console.error('Update error:', error);
        Utils.showToast('❌ Update failed');
    }
    
    resetInactivityTimer();
}

async function deletePassword(id) {
    if (!confirm('⚠️ Delete permanently?')) return;
    
    try {
        await vault.deletePassword(id);
        loadSavedPasswords();
        Utils.showToast('🗑️ Deleted');
    } catch (error) {
        console.error('Delete error:', error);
        Utils.showToast('❌ Delete failed');
    }
    
    resetInactivityTimer();
}

// ==================== SEARCH ====================
function searchPasswords() {
    loadSavedPasswords();
    resetInactivityTimer();
}

function handleServiceInput(e) {
    const query = e.target.value.toLowerCase();
    const suggestions = document.getElementById('searchSuggestions');
    
    if (query.length === 0) {
        suggestions.style.display = 'none';
        return;
    }
    
    const matches = COMMON_SERVICES.filter(s => s.includes(query)).slice(0, 5);
    
    if (matches.length > 0) {
        suggestions.innerHTML = matches.map(s => `
            <div class="search-suggestion-item" onclick="selectServiceSuggestion('${s}')">
                <div class="suggestion-service">${s}</div>
            </div>
        `).join('');
        suggestions.style.display = 'block';
    } else {
        suggestions.style.display = 'none';
    }
    
    resetInactivityTimer();
}

function selectServiceSuggestion(service) {
    document.getElementById('serviceName').value = service;
    document.getElementById('searchSuggestions').style.display = 'none';
    resetInactivityTimer();
}

// ==================== EXPORT/IMPORT ====================
async function exportVault() {
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }
    
    try {
        Utils.showToast('🔐 Encrypting...', 2000);
        const data = await vault.exportData();
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mempass-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        localStorage.setItem(STORAGE_KEYS.lastExport, Date.now().toString());
        Utils.showToast('📥 Exported');
        
    } catch (err) {
        console.error('Export error:', err);
        Utils.showToast('❌ ' + err.message);
    }
    
    resetInactivityTimer();
}

async function importVault() {
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }
    
    if (!confirm('⚠️ Current vault will be replaced!')) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                Utils.showToast('🔓 Decrypting...', 2000);
                const data = JSON.parse(ev.target.result);
                await vault.importData(data);
                await loadSavedPasswords();
                Utils.showToast('📤 Imported');
            } catch (err) {
                console.error('Import error:', err);
                alert('Import failed: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
    resetInactivityTimer();
}

// ==================== DOCUMENT FUNCTIONS ====================
async function loadDocuments() {
    if (!window.isVaultUnlocked || !window.documentVault) return;
    
    const container = document.getElementById('documentsGrid');
    const search = document.getElementById('searchDocuments')?.value || '';
    
    let docs = search ? await window.documentVault.searchDocuments(search) : window.documentVault.documents || [];
    
    updateDocumentStats();
    
    if (docs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">${search ? '🔍' : '📁'}</div>
                <h3>${search ? 'No documents' : 'No documents yet'}</h3>
                <p>${search ? 'Try different search' : 'Click + Add to upload'}</p>
            </div>`;
        return;
    }
    
    container.innerHTML = docs.map(doc => {
        const type = DOCUMENT_TYPES[doc.type] || DOCUMENT_TYPES.other;
        const files = doc.files?.length || 0;
        const size = doc.files?.reduce((s, f) => s + (f.size || 0), 0) || 0;
        const firstFile = doc.files && doc.files.length > 0 ? doc.files[0] : null;
                    const thumbHtml = firstFile && isValidThumbnail(firstFile.thumbnail) ? `
                        <img src="${firstFile.thumbnail}" alt="thumb" style="width:48px;height:48px;object-fit:cover;border-radius:6px;visibility:hidden;">` :
                        (firstFile && firstFile.type?.startsWith('image/') ? `
                        <img id="doc-thumb-${doc.id}-0" data-docid="${doc.id}" data-fileidx="0" src="" alt="thumb" style="width:48px;height:48px;object-fit:cover;border-radius:6px;visibility:hidden;">` :
                        `<div class="doc-icon">${type.icon}</div>`);

        return `
            <div class="doc-card" onclick="viewDocument('${doc.id}')">
                    ${thumbHtml}
                <div class="doc-info">
                    <div class="doc-title">
                        ${Utils.escapeHtml(doc.title)}
                        ${doc.favorite ? '⭐' : ''}
                    </div>
                    <div class="doc-meta">
                        ${files} file(s) • ${window.documentVault.formatFileSize(size)} • ${Utils.formatDate(doc.created)}
                    </div>
                </div>
                <div class="doc-badge">${type.name}</div>
            </div>
        `;
    }).join('');
    
    resetInactivityTimer();
    // Reveal any inline thumbnails already present (data: / blob:)
    revealThumbnailsIn(container);
    // Populate missing thumbnails by decrypting image files as needed
    populateMissingThumbnails(docs);
}

async function populateMissingThumbnails(docs) {
    if (!docs || !window.documentVault) return;
    for (let doc of docs) {
        if (!doc.files) continue;
        for (let i = 0; i < doc.files.length; i++) {
            const f = doc.files[i];
            if (f.type?.startsWith('image/') && !isValidThumbnail(f.thumbnail)) {
                // Try to populate both card thumbnail and file-list thumbnail (if present).
                const elCard = document.getElementById(`doc-thumb-${doc.id}-${i}`);
                const elFile = document.getElementById(`docfile-thumb-${doc.id}-${i}`);

                // Check if either needs population
                const needsCard = elCard && (!elCard.getAttribute('src') || elCard.getAttribute('src') === '');
                const needsFile = elFile && (!elFile.getAttribute('src') || elFile.getAttribute('src') === '');

                if (!needsCard && !needsFile) continue;

                try {
                    const freshDoc = window.documentVault.documents.find(d => d.id === doc.id) || await window.documentVault.getDocument(doc.id, false);
                    const encFile = freshDoc.files[i];
                    if (!encFile) continue;
                    const blob = await window.documentVault.decryptFile(encFile);
                    const url = URL.createObjectURL(blob);

                    if (needsCard) {
                        try { elCard.onload = () => { try { elCard.style.visibility = 'visible'; } catch(e){} }; elCard.src = url; elCard.dataset.objUrl = url; } catch (e) {}
                    }
                    if (needsFile) {
                        try { elFile.onload = () => { try { elFile.style.visibility = 'visible'; } catch(e){} }; elFile.src = url; elFile.dataset.objUrl = url; } catch (e) {}
                    }
                } catch (e) {
                    console.warn('Thumbnail decrypt failed for', doc.id, i, e);
                }
            }
        }
    }
}

function updateDocumentStats() {
    if (!window.documentVault) return;
    
    const stats = window.documentVault.getStats();
    document.getElementById('docTotalCount').textContent = stats.total;
    document.getElementById('docExpiringCount').textContent = stats.expiringSoon;
    document.getElementById('docFavoritesCount').textContent = stats.favorites;
}

// Show documents that are expiring soon (clicked from stats)
async function showExpiringDocuments() {
    if (!window.isVaultUnlocked || !window.documentVault) {
        showPinModal('verify');
        return;
    }

    Utils.showToast('Loading expiring documents...', 600);
    const expiring = await window.documentVault.checkExpiringDocuments();

    const container = document.getElementById('documentsGrid');
    // Toolbar: Total / Favorites (span full grid row)
    const toolbarHtml = `
        <div class="doc-view-toolbar" style="grid-column: 1 / -1;">
            <button class="ghost" onclick="loadDocuments()">All (Total)</button>
            <button class="ghost" onclick="showFavoritesDocuments()">Favorites</button>
        </div>
    `;

    if (!expiring || expiring.length === 0) {
        container.innerHTML = toolbarHtml + `
            <div class="empty-state">
                <div class="icon">✅</div>
                <h3>No expiring documents</h3>
                <p>No documents expiring in the next 30 days.</p>
            </div>`;
        return;
    }

    // Map to full document objects where possible
    const docs = expiring.map(e => window.documentVault.documents.find(d => d.id === e.id)).filter(Boolean);

    container.innerHTML = toolbarHtml + docs.map(doc => {
        const type = DOCUMENT_TYPES[doc.type] || DOCUMENT_TYPES.other;
        const files = doc.files?.length || 0;
        const size = doc.files?.reduce((s, f) => s + (f.size || 0), 0) || 0;
        const firstFile = doc.files && doc.files.length > 0 ? doc.files[0] : null;
                    const thumbHtml = firstFile && isValidThumbnail(firstFile.thumbnail) ? `
                        <img src="${firstFile.thumbnail}" alt="thumb" style="width:48px;height:48px;object-fit:cover;border-radius:6px;visibility:hidden;">` :
                        (firstFile && firstFile.type?.startsWith('image/') ? `
                        <img id="doc-thumb-${doc.id}-0" data-docid="${doc.id}" data-fileidx="0" src="" alt="thumb" style="width:48px;height:48px;object-fit:cover;border-radius:6px;visibility:hidden;">` :
                        `<div class="doc-icon">${type.icon}</div>`);

        return `
            <div class="doc-card" onclick="viewDocument('${doc.id}')">
                ${thumbHtml}
                <div class="doc-info">
                    <div class="doc-title">${Utils.escapeHtml(doc.title)} ${doc.favorite ? '⭐' : ''}</div>
                    <div class="doc-meta">${files} file(s) • ${window.documentVault.formatFileSize(size)} • ${Utils.formatDate(doc.created)}</div>
                </div>
                <div class="doc-badge">${type.name}</div>
            </div>`;
    }).join('');

    // Reveal inline thumbnails and populate missing ones
    revealThumbnailsIn(container);
    populateMissingThumbnails(docs);
    resetInactivityTimer();
}

// Show favorite documents
async function showFavoritesDocuments() {
    if (!window.isVaultUnlocked || !window.documentVault) {
        showPinModal('verify');
        return;
    }

    Utils.showToast('Loading favorites...', 400);
    const container = document.getElementById('documentsGrid');
    const toolbarHtml = `
        <div class="doc-view-toolbar" style="grid-column: 1 / -1;">
            <button class="ghost" onclick="loadDocuments()">All (Total)</button>
            <button class="primary" onclick="showFavoritesDocuments()">Favorites</button>
        </div>
    `;

    const docs = (window.documentVault.documents || []).filter(d => d.favorite);
    if (!docs || docs.length === 0) {
        container.innerHTML = toolbarHtml + `
            <div class="empty-state">
                <div class="icon">⭐</div>
                <h3>No favorites</h3>
                <p>You haven't favorited any documents yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = toolbarHtml + docs.map(doc => {
        const type = DOCUMENT_TYPES[doc.type] || DOCUMENT_TYPES.other;
        const files = doc.files?.length || 0;
        const size = doc.files?.reduce((s, f) => s + (f.size || 0), 0) || 0;
        return `
            <div class="doc-card" onclick="viewDocument('${doc.id}')">
                <div class="doc-icon">${type.icon}</div>
                <div class="doc-info">
                    <div class="doc-title">${Utils.escapeHtml(doc.title)} ${doc.favorite ? '⭐' : ''}</div>
                    <div class="doc-meta">${files} file(s) • ${window.documentVault.formatFileSize(size)} • ${Utils.formatDate(doc.created)}</div>
                </div>
                <div class="doc-badge">${type.name}</div>
            </div>`;
    }).join('');

    // Reveal inline thumbnails and populate missing ones
    revealThumbnailsIn(container);
    populateMissingThumbnails(docs);
    resetInactivityTimer();
}

function showDocumentModal(type = null) {
    const modal = document.getElementById('documentModal');
    
    document.getElementById('documentModalTitle').textContent = type ? `Add ${DOCUMENT_TYPES[type].name}` : 'Add Document';
    
    const select = document.getElementById('documentType');
    select.innerHTML = Object.entries(DOCUMENT_TYPES).map(([k, v]) => 
        `<option value="${k}" ${k === type ? 'selected' : ''}>${v.icon} ${v.name}</option>`
    ).join('');
    
    updateDocumentFields(type || 'aadhar');
    modal.style.display = 'flex';
    resetInactivityTimer();
}

function updateDocumentFields(type) {
    const container = document.getElementById('documentFields');
    const template = DOCUMENT_TYPES[type].template;
    
    container.innerHTML = Object.entries(template).map(([key, field]) => {
        let input = '';
        if (field.type === 'textarea') {
            input = `<textarea id="doc_${key}" placeholder="${field.label}"></textarea>`;
        } else if (field.type === 'select') {
            input = `<select id="doc_${key}">${field.options.map(o => `<option>${o}</option>`).join('')}</select>`;
        } else if (field.type === 'date') {
            input = `<input type="date" id="doc_${key}">`;
        } else {
            input = `<input type="text" id="doc_${key}" placeholder="${field.label}" ${field.pattern ? `pattern="${field.pattern}"` : ''}>`;
        }
        
        return `<div class="input-group"><label>${field.label}</label>${input}</div>`;
    }).join('');
    
    resetInactivityTimer();
}

async function handleDocumentUpload() {
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }
    
    const files = document.getElementById('documentFiles').files;
    if (files.length === 0) {
        Utils.showToast('Select files');
        return;
    }
    
    isUploading = true;
    Utils.showToast('📤 Uploading...', 0);
    
    try {
        const type = document.getElementById('documentType').value;
        const title = document.getElementById('documentTitle').value.trim() || DOCUMENT_TYPES[type].name;
        
        for (let file of files) {
            const maxSize = DOCUMENT_TYPES[type].maxSize || 10 * 1024 * 1024;
            if (file.size > maxSize) {
                Utils.showToast(`File too large: ${file.name}`);
                return;
            }
            
            const allowed = DOCUMENT_TYPES[type].fileTypes || ['image/*', 'application/pdf'];
            const ok = allowed.some(t => {
                if (t.endsWith('/*')) return file.type.startsWith(t.split('/')[0]);
                return t === file.type;
            });
            
            if (!ok) {
                Utils.showToast(`Invalid type: ${file.name}`);
                return;
            }
        }
        
        const metadata = {};
        for (let key in DOCUMENT_TYPES[type].template) {
            const input = document.getElementById(`doc_${key}`);
            if (input?.value) metadata[key] = input.value;
        }
        
        await window.documentVault.addDocument({
            type, title, metadata,
            tags: [],
            favorite: document.getElementById('documentFavorite')?.checked || false,
            notes: ''
        }, Array.from(files));
        
        closeDocumentModal();
        loadDocuments();
        Utils.showToast('✓ Document saved');
        
    } catch (error) {
        console.error('Upload error:', error);
        Utils.showToast('❌ Error: ' + error.message);
    } finally {
        isUploading = false;
        resetInactivityTimer();
    }
}

function closeDocumentModal() {
    document.getElementById('documentModal').style.display = 'none';
    document.getElementById('documentTitle').value = '';
    document.getElementById('documentFiles').value = '';
    document.getElementById('documentFavorite').checked = false;
    document.querySelectorAll('[id^="doc_"]').forEach(f => f.value = '');
    resetInactivityTimer();
}

async function viewDocument(id) {
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }
    
    try {
        Utils.showToast('Loading...', 800);
        
        const doc = await window.documentVault.getDocument(id);
        if (!doc) {
            Utils.showToast('Not found');
            return;
        }
        
        const decrypted = {};
        for (let [k, v] of Object.entries(doc.metadata || {})) {
            try {
                decrypted[k] = await window.documentVault.decryptField(v);
            } catch {
                decrypted[k] = '🔒 Encrypted';
            }
        }
        
        // Store current viewing doc ID for edit button
        window.currentViewingDocId = id;
        showDocumentViewModal(doc, decrypted);
        
    } catch (error) {
        console.error('View error:', error);
        Utils.showToast('❌ Error');
    }
    
    resetInactivityTimer();
}

function showDocumentViewModal(doc, metadata) {
    const modal = document.getElementById('documentViewModal');
    const type = DOCUMENT_TYPES[doc.type] || DOCUMENT_TYPES.other;
    
    document.getElementById('viewDocumentTitle').textContent = doc.title;
    
    let metaHtml = Object.entries(metadata).map(([k, v]) => {
        const label = type.template[k]?.label || k;
        return `
            <div class="document-field">
                <div class="document-field-label">${label}</div>
                <div class="document-field-value">${Utils.escapeHtml(v || '')}</div>
            </div>
        `;
    }).join('');
    
    let filesHtml = '';
    if (doc.files?.length) {
        filesHtml = '<h3>Files</h3><div class="document-files">';
        doc.files.forEach((f, i) => {
            const isImage = f.type?.startsWith('image/');
            const thumb = isValidThumbnail(f.thumbnail) ? `<img src="${f.thumbnail}" alt="thumb" style="width:60px;height:60px;object-fit:cover;border-radius:6px;margin-right:10px;visibility:hidden;">` : (isImage ? `<img id="docfile-thumb-${doc.id}-${i}" data-docid="${doc.id}" data-fileidx="${i}" src="" alt="thumb" style="width:60px;height:60px;object-fit:cover;border-radius:6px;margin-right:10px;visibility:hidden;">` : '');
            const iconHtml = !isValidThumbnail(f.thumbnail) ? (isImage ? '🖼️' : '📄') : '';
            filesHtml += `
                <div class="document-file" onclick="previewDocumentFile('${doc.id}', ${i})" style="display:flex;align-items:center;gap:10px;">
                    ${thumb}
                    <div style="flex:1;">
                        <div class="document-file-name">${f.name || 'File'}</div>
                        <div class="document-file-size">${window.documentVault.formatFileSize(f.size || 0)}</div>
                    </div>
                    <div class="document-file-icon">${iconHtml}</div>
                </div>
            `;
        });
        filesHtml += '</div>';
    }
    
    let expiry = '';
    if (metadata.expiryDate) {
        const days = Math.ceil((new Date(metadata.expiryDate) - new Date()) / 86400000);
        if (days > 0 && days <= 30) {
            expiry = `<div class="expiry-warning">Expires in ${days} days</div>`;
        }
    }
    
    document.getElementById('documentViewContent').innerHTML = `
        <div class="document-view-section">
            ${expiry}
            <div class="document-field">
                <div class="document-field-label">Type</div>
                <div class="document-field-value">${type.icon} ${type.name}</div>
            </div>
            ${metaHtml}
            ${doc.notes ? `
                <div class="document-field">
                    <div class="document-field-label">Notes</div>
                    <div class="document-field-value">${Utils.escapeHtml(doc.notes)}</div>
                </div>
            ` : ''}
            <div class="document-field">
                <div class="document-field-label">Added</div>
                <div class="document-field-value">${new Date(doc.created).toLocaleString()}</div>
            </div>
            ${filesHtml}
        </div>
    `;
    
    document.getElementById('deleteDocumentBtn').onclick = () => {
        if (confirm('Delete this document? This action cannot be undone.')) {
            closeDocumentViewModal();
            setTimeout(() => deleteDocument(doc.id), 300);
        }
    };
    
    modal.style.display = 'flex';
    // Reveal thumbnails rendered from stored thumbnail data, then populate any missing ones
    revealThumbnailsIn(document.getElementById('documentViewContent'));
    populateMissingThumbnails([doc]);
    resetInactivityTimer();
}

function closeDocumentViewModal() {
    // Revoke any object URLs created for thumbnails in the document view
    const content = document.getElementById('documentViewContent');
    if (content) {
        const imgs = content.querySelectorAll('img[data-docid], img[id^="docfile-thumb-"]');
        imgs.forEach(img => {
            try {
                const url = img.dataset.objUrl || img.src;
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
            } catch (e) {}
            try { img.src = ''; } catch (e) {}
        });
    }

    document.getElementById('documentViewModal').style.display = 'none';
    resetInactivityTimer();
}

function closeEditDocumentModal() {
    document.getElementById('documentEditModal').style.display = 'none';
    resetInactivityTimer();
}

async function editDocument(docId) {
    if (!window.isVaultUnlocked || !window.documentVault) {
        showPinModal('verify');
        return;
    }

    try {
        const doc = await window.documentVault.getDocument(docId, false);
        if (!doc) {
            Utils.showToast('Document not found');
            return;
        }

        // Decrypt metadata for editing
        const decryptedMeta = {};
        for (let [k, v] of Object.entries(doc.metadata || {})) {
            try {
                decryptedMeta[k] = await window.documentVault.decryptField(v);
            } catch (e) {
                decryptedMeta[k] = '';
            }
        }

        // Store current doc in window for saving later
        window.currentEditingDoc = { doc, decryptedMeta };

        // Populate edit form
        document.getElementById('editDocumentTitle').value = doc.title || '';
        document.getElementById('editDocumentNotes').value = doc.notes || '';

        // Show current files with delete option
        const filesList = document.getElementById('editDocumentFilesList');
        if (doc.files && doc.files.length > 0) {
            filesList.innerHTML = doc.files.map((f, i) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee;">
                    <div>
                        <div style="font-weight:500;">${Utils.escapeHtml(f.name || 'File')}</div>
                        <div style="font-size:0.85rem; color:#666;">${window.documentVault.formatFileSize(f.size || 0)}</div>
                    </div>
                    <button onclick="deleteFileFromEdit(${i})" style="background:#f56565; padding:5px 10px; border:none; border-radius:4px; color:white; cursor:pointer; font-size:0.9rem;">Remove</button>
                </div>
            `).join('');
        } else {
            filesList.innerHTML = '<div style="color:#999;">No files attached</div>';
        }

        document.getElementById('editDocumentNewFiles').value = '';
        document.getElementById('documentEditModal').style.display = 'flex';
        resetInactivityTimer();
    } catch (error) {
        console.error('Edit error:', error);
        Utils.showToast('❌ Error loading document');
    }
}

function deleteFileFromEdit(index) {
    if (!window.currentEditingDoc) return;
    
    const doc = window.currentEditingDoc.doc;
    if (doc.files && doc.files[index]) {
        doc.files.splice(index, 1);
        
        // Re-render files list
        const filesList = document.getElementById('editDocumentFilesList');
        if (doc.files.length > 0) {
            filesList.innerHTML = doc.files.map((f, i) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee;">
                    <div>
                        <div style="font-weight:500;">${Utils.escapeHtml(f.name || 'File')}</div>
                        <div style="font-size:0.85rem; color:#666;">${window.documentVault.formatFileSize(f.size || 0)}</div>
                    </div>
                    <button onclick="deleteFileFromEdit(${i})" style="background:#f56565; padding:5px 10px; border:none; border-radius:4px; color:white; cursor:pointer; font-size:0.9rem;">Remove</button>
                </div>
            `).join('');
        } else {
            filesList.innerHTML = '<div style="color:#999;">No files attached</div>';
        }
        Utils.showToast('📎 File removed');
    }
}

async function saveEditDocument() {
    if (!window.isVaultUnlocked || !window.documentVault || !window.currentEditingDoc) {
        showPinModal('verify');
        return;
    }

    isUploading = true;
    try {
        Utils.showToast('Saving changes...', 2000);
        const { doc, decryptedMeta } = window.currentEditingDoc;

        // Update title and notes
        doc.title = document.getElementById('editDocumentTitle').value.trim() || 'Untitled';
        doc.notes = document.getElementById('editDocumentNotes').value || '';
        doc.updated = new Date().toISOString();

        // Handle new files
        const newFiles = document.getElementById('editDocumentNewFiles').files;
        if (newFiles && newFiles.length > 0) {
            for (let file of newFiles) {
                const maxSize = DOCUMENT_TYPES[doc.type]?.maxSize || 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    Utils.showToast(`File too large: ${file.name}`);
                    return;
                }

                try {
                    const encrypted = await window.documentVault.encryptFile(file);
                    doc.files.push(encrypted);
                } catch (e) {
                    console.warn('Failed to encrypt new file', file.name, e);
                    Utils.showToast(`Failed to encrypt: ${file.name}`);
                }
            }
        }

        // Save updated document
        await window.documentVault.saveDocument(doc);
        closeEditDocumentModal();
        closeDocumentViewModal();
        await loadDocuments();
        Utils.showToast('Document updated');
    } catch (error) {
        console.error('Save error:', error);
        Utils.showToast('❌ Save failed: ' + error.message);
    } finally {
        isUploading = false;
        window.currentEditingDoc = null;
        resetInactivityTimer();
    }
}

async function downloadDocumentFile(docId, index) {
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }

    // If we have a current preview for this file, use it to download without re-decrypting
    if (window.currentPreview && window.currentPreview.docId === docId && window.currentPreview.index === index) {
        try {
            const { blob, filename } = window.currentPreview;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || 'file';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            Utils.showToast('✓ Downloaded');
        } catch (e) {
            console.error('Download preview error:', e);
            Utils.showToast('❌ Download failed');
        }
        resetInactivityTimer();
        return;
    }

    isUploading = true;

    try {
        Utils.showToast('Preparing file...', 1500);

        const doc = await window.documentVault.getDocument(docId, false);
        if (!doc?.files?.[index]) {
            Utils.showToast('File not found');
            return;
        }

        const blob = await window.documentVault.decryptFile(doc.files[index]);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.files[index].name || 'file';
        a.click();

        URL.revokeObjectURL(url);
        Utils.showToast('Downloaded');

    } catch (error) {
        console.error('Download error:', error);
        Utils.showToast('Download failed');
    } finally {
        isUploading = false;
        resetInactivityTimer();
    }
}

// Preview file in modal (decrypts file if needed)
// ==================== PREVIEW DOCUMENT FILE (PDF FIX) ====================
async function previewDocumentFile(docId, index) {
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }

    const doc = await window.documentVault.getDocument(docId, false);
    if (!doc?.files?.[index]) {
        Utils.showToast('File not found');
        return;
    }

    const fileMeta = doc.files[index];
    const modal = document.getElementById('filePreviewModal');
    const content = document.getElementById('filePreviewContent');
    const titleEl = document.getElementById('filePreviewTitle');

    titleEl.textContent = `${fileMeta.name || 'File'} (${fileMeta.type || ''})`;
    content.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">Decrypting...</div>';
    modal.style.display = 'flex';

    let objUrl = null;

    try {
        const blob = await window.documentVault.decryptFile(fileMeta);
        objUrl = URL.createObjectURL(blob);

        window.currentPreview = {
            docId,
            index,
            blob,
            filename: fileMeta.name,
            mime: fileMeta.type,
            objUrl                     // ← important for cleanup
        };

        content.innerHTML = '';

        const isImage = (fileMeta.type || '').startsWith('image/');
        const isPdf   = (fileMeta.type || '').toLowerCase().includes('pdf');

        if (isImage) {
            const img = document.createElement('img');
            img.src = objUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '70vh';
            img.style.objectFit = 'contain';
            content.appendChild(img);

        } else if (isPdf) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                // ───── MOBILE: Native PDF viewer (best experience) ─────
                content.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;">
                        <div style="font-size:4.5rem;margin-bottom:20px;">📕</div>
                        <h3>PDF Ready</h3>
                        <p style="color:#718096;margin:15px 0 30px;">Tap to open in your browser's PDF viewer</p>
                        <button onclick="openPdfInNewTab()" 
                                style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;
                                       padding:18px 40px;font-size:1.15rem;border:none;border-radius:16px;
                                       box-shadow:0 10px 25px rgba(102,126,234,0.35);">
                            📄 Open PDF
                        </button>
                    </div>`;
            } else {
                // ───── DESKTOP: Embedded iframe (as before) ─────
                const iframe = document.createElement('iframe');
                iframe.src = objUrl;
                iframe.style.width = '100%';
                iframe.style.height = '70vh';
                iframe.style.border = 'none';
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
                content.appendChild(iframe);
            }
        } else {
            // Other file types
            content.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <div style="font-size:3.5rem;margin-bottom:20px;">📎</div>
                    <p><strong>${Utils.escapeHtml(fileMeta.name)}</strong></p>
                    <p style="color:#718096;">${window.documentVault.formatFileSize(fileMeta.size)}</p>
                    <button onclick="downloadCurrentPreview()" style="margin-top:25px;">⬇️ Download File</button>
                </div>`;
        }
    } catch (err) {
        console.error('Preview error:', err);
        content.innerHTML = '<div style="padding:40px;color:#f56565;text-align:center;">Unable to preview this file.</div>';
    }

    resetInactivityTimer();
}
function sharePreview() {
    if (!window.currentPreview) {
        alert('No preview available to share.');
        return;
    }
    const { blob, filename, mime } = window.currentPreview;

    // Web Share Level 2 (files)
    try {
        const file = new File([blob], filename || 'file', { type: mime });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: filename }).catch(err => alert('Share failed: ' + err));
            return;
        }
    } catch (e) {
        // ignore
    }

    // Fallback: try sharing a blob URL (may not work everywhere)
    if (navigator.share) {
        const url = URL.createObjectURL(blob);
        navigator.share({ title: filename, text: filename, url }).catch(() => {
            alert('Sharing not supported. Please download and share manually.');
        }).finally(() => setTimeout(() => URL.revokeObjectURL(url), 5000));
        return;
    }

    alert('Sharing not supported on this device. Please download the file and share it manually.');
}

function openPdfInNewTab() {
    if (window.currentPreview?.objUrl) {
        window.open(window.currentPreview.objUrl, '_blank');
    } else {
        Utils.showToast('PDF not ready');
    }
}

function downloadCurrentPreview() {
    if (!window.currentPreview?.blob) return;
    const { blob, filename } = window.currentPreview;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 8000);
}

async function deleteDocument(id) {
    try {
        await window.documentVault.deleteDocument(id);
        await loadDocuments();
        Utils.showToast('Deleted');
    } catch (error) {
        console.error('Delete error:', error);
        Utils.showToast('Delete failed');
    }
    resetInactivityTimer();
}

async function exportDocuments() {
    if (!window.isVaultUnlocked || !window.documentVault) {
        showPinModal('verify');
        return;
    }
    
    try {
        // Ask user for export password and encrypt exported JSON
        const plain = await window.documentVault.exportDocuments();
        const json = JSON.stringify(plain, null, 2);

        const password = prompt('Set a password (min 8 chars) to encrypt export:');
        if (!password) throw new Error('Export cancelled');
        if (password.length < 8) throw new Error('Password must be at least 8 characters');

        const salt = cryptoUtils.generateSalt();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const exportKey = await cryptoUtils.deriveExportKey(password, salt);

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            exportKey,
            new TextEncoder().encode(json)
        );

        const out = {
            encrypted: true,
            saltB64: cryptoUtils.toBase64(salt),
            ivB64: cryptoUtils.toBase64(iv),
            dataB64: cryptoUtils.toBase64(new Uint8Array(encrypted)),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documents-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showToast('📥 Exported (encrypted)');
    } catch (error) {
        console.error('Export error:', error);
        // Show detailed error to the user for debugging
        alert('Export failed: ' + (error && error.message ? error.message : String(error)) + '\n\nSee console for stack.');
        Utils.showToast('❌ Export failed');
    }
    resetInactivityTimer();
}

async function importDocuments() {
    if (!window.isVaultUnlocked || !window.documentVault) {
        showPinModal('verify');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                let parsed = JSON.parse(ev.target.result);

                if (parsed.encrypted) {
                    const password = prompt('🔑 Enter password to decrypt documents import:');
                    if (!password) throw new Error('Import cancelled');

                    const salt = cryptoUtils.fromBase64(parsed.saltB64);
                    const iv = cryptoUtils.fromBase64(parsed.ivB64);
                    const encryptedData = cryptoUtils.fromBase64(parsed.dataB64);
                    const exportKey = await cryptoUtils.deriveExportKey(password, salt);

                    try {
                        const decrypted = await crypto.subtle.decrypt(
                            { name: 'AES-GCM', iv },
                            exportKey,
                            encryptedData
                        );
                        parsed = JSON.parse(new TextDecoder().decode(decrypted));
                    } catch (err) {
                        throw new Error('Wrong password or corrupted file');
                    }
                }

                // Now parsed is the plain export structure
                await window.documentVault.importDocuments(parsed);
                await loadDocuments();
                Utils.showToast('📤 Documents imported');
            } catch (err) {
                console.error('Import error:', err);
                alert('Import failed: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    input.click();
    resetInactivityTimer();
}

function searchDocuments() {
    loadDocuments();
    resetInactivityTimer();
}

function filterDocuments() {
    loadDocuments();
    resetInactivityTimer();
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
            if (used > 80) Utils.showToast(`⚠️ Storage ${used}% full`, 8000);
        });
    }
}

window.toggleTheme = function() {
    if (typeof Utils !== 'undefined') {
        Utils.toggleTheme();
        resetInactivityTimer();
    }
};

// ==================== DEBUG ====================
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

// ==================== GLOBAL EXPORTS ====================
// Setup preview modal buttons
try {
    const dlBtn = document.getElementById('downloadPreviewBtn');
    const shBtn = document.getElementById('sharePreviewBtn');
    const closeBtn = document.getElementById('closeFilePreviewBtn');
    const previewModal = document.getElementById('filePreviewModal');
    const previewContent = document.getElementById('filePreviewContent');

    if (dlBtn) dlBtn.addEventListener('click', () => {
        if (window.currentPreview) downloadDocumentFile(window.currentPreview.docId, window.currentPreview.index);
    });
    if (shBtn) shBtn.addEventListener('click', () => sharePreview());
    if (closeBtn) closeBtn.addEventListener('click', () => {
        try {
            if (previewContent) {
                const els = previewContent.querySelectorAll('img, iframe');
                els.forEach(el => {
                    const src = el.getAttribute('src') || '';
                    if (src && src.startsWith('blob:')) URL.revokeObjectURL(src);
                });
                previewContent.innerHTML = '';
            }
            if (previewModal) previewModal.style.display = 'none';
            window.currentPreview = null;
        } catch (e) { console.error(e); }
    });
} catch (e) { console.error('Preview button setup failed', e); }

window.handlePinInput = handlePinInput;
window.showPinModal = showPinModal;
window.closePinModal = closePinModal;
window.verifyPin = verifyPin;
window.forgotPin = forgotPin;
window.unlockVault = unlockVault;
window.lockVault = lockVault;
window.generatePassword = generatePassword;
window.savePassword = savePassword;
window.copyPassword = copyPassword;
window.incrementVersion = incrementVersion;
window.loadSavedPasswords = loadSavedPasswords;
window.togglePasswordOutput = togglePasswordOutput;
window.searchPasswords = searchPasswords;
window.copySavedPassword = copySavedPassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.editPassword = editPassword;
window.deletePassword = deletePassword;
window.handleServiceInput = handleServiceInput;
window.selectServiceSuggestion = selectServiceSuggestion;
window.exportVault = exportVault;
window.importVault = importVault;
window.showPasswordsTab = showPasswordsTab;
window.showDocumentsTab = showDocumentsTab;
window.loadDocuments = loadDocuments;
window.showDocumentModal = showDocumentModal;
window.updateDocumentFields = updateDocumentFields;
window.handleDocumentUpload = handleDocumentUpload;
window.showExpiringDocuments = showExpiringDocuments;
window.showFavoritesDocuments = showFavoritesDocuments;
window.closeDocumentModal = closeDocumentModal;
window.viewDocument = viewDocument;
window.closeDocumentViewModal = closeDocumentViewModal;
window.closeEditDocumentModal = closeEditDocumentModal;
window.editDocument = editDocument;
window.deleteFileFromEdit = deleteFileFromEdit;
window.saveEditDocument = saveEditDocument;
window.downloadDocumentFile = downloadDocumentFile;
window.deleteDocument = deleteDocument;
window.exportDocuments = exportDocuments;
window.searchDocuments = searchDocuments;
window.filterDocuments = filterDocuments;
window.togglePasswordVisibilityField = togglePasswordVisibilityField;
window.debugVault = debugVault;
window.checkStorageQuota = checkStorageQuota;
window.previewDocumentFile = previewDocumentFile;
window.sharePreview = sharePreview;
