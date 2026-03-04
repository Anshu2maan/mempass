// main.js - Final version with Google Drive Auto Backup (March 2026 update)
window.vault = null;
window.documentVault = null;
window.isVaultUnlocked = false;
window.autoLockTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 MemPass v2.3 starting... (with Google Drive sync support)');

    // Disable browser autofill on sensitive inputs
    const sensitiveInputs = ['masterPhrase', 'serviceName', 'pin1', 'pin2', 'pin3', 'pin4', 'pin5', 'pin6'];
    sensitiveInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('autocomplete', 'off');
            el.setAttribute('autocorrect', 'off');
            el.setAttribute('autocapitalize', 'off');
            el.setAttribute('spellcheck', 'false');
            el.setAttribute('data-form-type', 'other');
        }
    });

    try {
        // Add CSS animations and init theme
        if (typeof Utils !== 'undefined') {
            Utils.addKeyframeAnimations?.();
            Utils.initTheme?.();
        }

        // Initialize password vault
        vault = new PasswordVault();
        window.vault = vault;

        // Initialize document vault (depends on vault.key later)
        if (typeof initDocumentVault === 'function') {
            window.documentVault = await initDocumentVault();
        }

        // Initialize Google Drive sync (must after vault)
        if (typeof GoogleDriveSync !== 'undefined') {
            window.googleDriveSync = new GoogleDriveSync();
            await window.googleDriveSync.init();
            console.log('☁️ Google Drive sync module initialized');
        }

        // Setup initial UI state
        setupInitialUIState();

        // Setup all event listeners
        setupEventListeners();

        // PIN input handling
        setupPinInputs();

        // Focus on service input
        setTimeout(() => {
            document.getElementById('serviceName')?.focus();
        }, 200);

        // Check storage quota
        setTimeout(checkStorageQuota, 1500);

        console.log("✅ MemPass core initialized");
    } catch (error) {
        console.error("❌ Initialization failed:", error);
        Utils?.showToast?.("Error starting MemPass. Check console for details.", 5000);
    }
});

function setupInitialUIState() {
    const setupPinBtn = document.getElementById('setupPinBtn');
    if (!setupPinBtn) return;

    if (vault.settings?.saltB64) {
        setupPinBtn.textContent = '🔐 Change PIN';
        setupPinBtn.onclick = () => showPinModal('change');
        lockVault();
    } else {
        setupPinBtn.textContent = '🔐 Set PIN';
        setupPinBtn.onclick = () => showPinModal('setup');
        lockVault();
    }
}

function setupEventListeners() {
    // ───── Password Generation & Management ─────
    document.getElementById('generatePasswordBtn')?.addEventListener('click', async () => {
        await generatePassword();
    });

    document.getElementById('savePasswordBtn')?.addEventListener('click', savePassword);
    document.getElementById('copyPasswordBtn')?.addEventListener('click', copyPassword);
    document.getElementById('incrementVersionBtn')?.addEventListener('click', incrementVersion);

    // Master phrase strength meter
    document.getElementById('masterPhrase')?.addEventListener('input', (e) => {
        if (typeof updateMasterStrength === 'function') {
            updateMasterStrength(e.target.value);
        }
    });

    // Service input suggestions
    document.getElementById('serviceName')?.addEventListener('input', handleServiceInput);

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions && !e.target.closest('#serviceName') && !e.target.closest('.search-suggestion-item')) {
            suggestions.style.display = 'none';
        }
    });

    // Live search (debounced)
    const debounce = (fn, wait = 200) => {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
    };

    document.getElementById('searchPasswords')?.addEventListener('input', debounce(() => searchPasswords(), 150));
    document.getElementById('searchDocuments')?.addEventListener('input', debounce(() => loadDocuments(), 150));

    // Theme toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => Utils.toggleTheme?.());

    // Export / Import
    document.getElementById('exportVaultBtn')?.addEventListener('click', () => exportVault());
    document.getElementById('importVaultBtn')?.addEventListener('click', () => importVault());
    document.getElementById('exportDocumentsBtn')?.addEventListener('click', () => exportDocuments?.());

    // ───── Document Handlers ─────
    document.getElementById('addDocumentBtn')?.addEventListener('click', () => showDocumentModal?.());
    document.getElementById('saveDocumentBtn')?.addEventListener('click', () => handleDocumentUpload?.());
    document.getElementById('closeDocumentModalBtn')?.addEventListener('click', () => closeDocumentModal?.());
    document.getElementById('documentType')?.addEventListener('change', (e) => updateDocumentFields?.(e.target.value));

    document.getElementById('importDocumentsBtn')?.addEventListener('click', () => importDocuments?.());
    document.getElementById('closeDocumentViewBtn')?.addEventListener('click', () => closeDocumentViewModal?.());

    document.getElementById('editDocumentBtn')?.addEventListener('click', () => {
        if (window.currentViewingDocId) {
            editDocument?.(window.currentViewingDocId);
        }
    });

    document.getElementById('saveEditDocumentBtn')?.addEventListener('click', () => saveEditDocument?.());
    document.getElementById('closeEditDocumentModalBtn')?.addEventListener('click', () => closeEditDocumentModal?.());

    // ───── PIN & Vault ─────
    document.getElementById('unlockVaultBtn')?.addEventListener('click', () => showPinModal('verify'));
    document.getElementById('verifyPinBtn')?.addEventListener('click', verifyPin);
    document.getElementById('closePinModalBtn')?.addEventListener('click', closePinModal);
    document.getElementById('forgotPinLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPin?.();
    });

    // ───── Tabs ─────
    document.getElementById('showPasswordsTab')?.addEventListener('click', showPasswordsTab);
    document.getElementById('showDocumentsTab')?.addEventListener('click', showDocumentsTab);

    // ───── Google Drive Sync Button ─────
    document.getElementById('driveSyncBtn')?.addEventListener('click', () => {
        if (window.googleDriveSync?.enabled) {
            if (confirm('Disable backup? (Cancel to reconfigure)')) {
                window.googleDriveSync.disable();
            } else {
                window.googleDriveSync.enable();
            }
        } else {
            window.googleDriveSync?.enable();
        }
    });

    // ───── Stats Click Handlers (Documents) ─────
    const makeStatClickable = (elId, actionFn) => {
        const el = document.getElementById(elId);
        if (!el) return;
        const statItem = el.closest('.stat-item') || el;
        statItem.classList.add('clickable');
        statItem.addEventListener('click', () => {
            const inner = statItem.querySelector('.stat-value') || statItem;
            inner.classList.add('pressed');
            setTimeout(() => inner.classList.remove('pressed'), 300);
            if (typeof showDocumentsTab === 'function') showDocumentsTab();
            setTimeout(() => {
                if (typeof actionFn === 'function') actionFn();
            }, 120);
        });
    };

    makeStatClickable('docExpiringCount', showExpiringDocuments);
    makeStatClickable('docTotalCount', loadDocuments);
    makeStatClickable('docFavoritesCount', showFavoritesDocuments);

    // Toggle generated password visibility
    document.getElementById('togglePasswordOutput')?.addEventListener('click', () => {
        togglePasswordOutput?.();
    });
}

// ───── Master Phrase Toggle ─────
const toggleMasterBtn = document.getElementById('toggleMasterPhrase');
const masterPhraseInput = document.getElementById('masterPhrase');

if (toggleMasterBtn && masterPhraseInput) {
    toggleMasterBtn.addEventListener('click', () => {
        const currentType = masterPhraseInput.getAttribute('type');
        if (currentType === 'password') {
            masterPhraseInput.setAttribute('type', 'text');
            toggleMasterBtn.textContent = '🙈';
        } else {
            masterPhraseInput.setAttribute('type', 'password');
            toggleMasterBtn.textContent = '👁️';
        }
        masterPhraseInput.focus();
    });
    console.log('Master phrase toggle attached ✅');
} else {
    console.warn('Master phrase toggle elements not found');
}

function setupPinInputs() {
    for (let i = 1; i <= PIN_LENGTH; i++) {
        const pinInput = document.getElementById(`pin${i}`);
        if (pinInput) {
            pinInput.addEventListener('input', (e) => handlePinInput?.(i, e));
            pinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && i === PIN_LENGTH) {
                    verifyPin?.();
                }
            });
        }
    }
}

// Make critical functions globally available
window.lockVault = lockVault;
window.unlockVault = unlockVault;
window.showPinModal = showPinModal;
window.closePinModal = closePinModal;
window.verifyPin = verifyPin;
window.forgotPin = forgotPin;
window.exportVault = exportVault;
window.importVault = importVault;
window.debugVault = debugVault;

// ───── Service Worker Registration ─────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = '/mempass/sw.js';
        const swScope = '/mempass/';

        navigator.serviceWorker.register(swPath, { scope: swScope })
            .then(reg => {
                console.log('✅ Service Worker registered with scope:', reg.scope);
            })
            .catch(err => {
                console.error('❌ Service Worker registration failed:', err);
            });

        // Clean up old conflicting registrations (one-time)
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(reg => {
                if (reg.scope === 'https://anshu2maan.github.io/' || reg.scope.includes('/sw.js')) {
                    reg.unregister();
                    console.log('Old conflicting SW unregistered');
                }
            });
        });
    });
}