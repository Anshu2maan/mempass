// ui/exportImport.js - vault and document export/import handlers

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

                if (parsed.encrypted) {/* Lines 1667-1685 omitted */}

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

// export
window.exportVault = exportVault;
window.importVault = importVault;
window.exportDocuments = exportDocuments;
window.importDocuments = importDocuments;
