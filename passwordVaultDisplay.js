// ui/passwordVaultDisplay.js - rendering and actions for saved password list

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

// export globals
window.loadSavedPasswords = loadSavedPasswords;
window.copySavedPassword = copySavedPassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.editPassword = editPassword;
window.deletePassword = deletePassword;
window.searchPasswords = searchPasswords;
window.handleServiceInput = handleServiceInput;
window.selectServiceSuggestion = selectServiceSuggestion;
