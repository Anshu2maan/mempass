// main.js - Final version with all enhancements
window.vault = null;
window.documentVault = null;
window.isVaultUnlocked = false;
window.autoLockTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 MemPass v2.3 starting...');
    
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
            Utils.addKeyframeAnimations();
            Utils.initTheme();  // Ye line add karo
        }

        // Initialize password vault
        vault = new PasswordVault();
        window.vault = vault;

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
        Utils?.showToast?.("Error starting MemPass. Check console.");
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
    // Password generation (async)
    document.getElementById('generatePasswordBtn')?.addEventListener('click', async () => {
        await generatePassword();
    });
    
    document.getElementById('savePasswordBtn')?.addEventListener('click', savePassword);
    document.getElementById('copyPasswordBtn')?.addEventListener('click', copyPassword);
    document.getElementById('incrementVersion')?.addEventListener('click', incrementVersion);

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

    // Live search for passwords & documents (debounced)
    const debounce = (fn, wait = 200) => {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
    };

    document.getElementById('searchPasswords')?.addEventListener('input', debounce(() => searchPasswords(), 150));
    document.getElementById('searchDocuments')?.addEventListener('input', debounce(() => loadDocuments(), 150));

    // Theme toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => Utils.toggleTheme());

    // Export / Import buttons
    document.getElementById('exportVaultBtn')?.addEventListener('click', () => exportVault());
    document.getElementById('importVaultBtn')?.addEventListener('click', () => importVault());
    document.getElementById('exportDocumentsBtn')?.addEventListener('click', () => exportDocuments());

    // Document modal buttons
    document.getElementById('addDocumentBtn')?.addEventListener('click', () => showDocumentModal());
    document.getElementById('saveDocumentBtn')?.addEventListener('click', () => handleDocumentUpload());
    document.getElementById('closeDocumentModalBtn')?.addEventListener('click', () => closeDocumentModal());
    document.getElementById('documentType')?.addEventListener('change', (e) => updateDocumentFields(e.target.value));
    // Document import/export
    document.getElementById('importDocumentsBtn')?.addEventListener('click', () => importDocuments());
    // Document view modal close
    document.getElementById('closeDocumentViewBtn')?.addEventListener('click', () => closeDocumentViewModal());
    document.getElementById('editDocumentBtn')?.addEventListener('click', (e) => {
        const modal = document.getElementById('documentViewModal');
        const title = document.getElementById('viewDocumentTitle').textContent;
        // Find the document ID from the view modal (we need a way to track it)
        // For now, pass through a stored reference
        if (window.currentViewingDocId) {
            editDocument(window.currentViewingDocId);
        }
    });
    
    // Document edit modal buttons
    document.getElementById('saveEditDocumentBtn')?.addEventListener('click', () => saveEditDocument());
    document.getElementById('closeEditDocumentModalBtn')?.addEventListener('click', () => closeEditDocumentModal());

    // Vault / PIN modal buttons
    document.getElementById('unlockVaultBtn')?.addEventListener('click', () => showPinModal('verify'));
    document.getElementById('verifyPinBtn')?.addEventListener('click', verifyPin);
    document.getElementById('closePinModalBtn')?.addEventListener('click', closePinModal);
    document.getElementById('forgotPinLink')?.addEventListener('click', (e) => { e.preventDefault(); forgotPin(); });

    // Tab buttons inside unlocked vault
    document.getElementById('showPasswordsTab')?.addEventListener('click', showPasswordsTab);
    document.getElementById('showDocumentsTab')?.addEventListener('click', showDocumentsTab);

    // Make the Expiring Soon stat clickable: switch to Documents tab and show expiring list
    const expCountEl = document.getElementById('docExpiringCount');
    if (expCountEl) {
        const statItem = expCountEl.closest('.stat-item') || expCountEl;
        statItem.classList.add('clickable');
        statItem.addEventListener('click', () => {
            const inner = statItem.querySelector('.stat-value') || statItem;
            inner.classList.add('pressed');
            setTimeout(() => inner.classList.remove('pressed'), 300);
            if (typeof showDocumentsTab === 'function') showDocumentsTab();
            setTimeout(() => {
                if (typeof showExpiringDocuments === 'function') showExpiringDocuments();
            }, 120);
        });
    }

    // Toggle for generated password display
    document.getElementById('togglePasswordOutput')?.addEventListener('click', () => {
        if (typeof togglePasswordOutput === 'function') togglePasswordOutput();
    });
    
    // Make the Total stat clickable: show all documents
    const totalEl = document.getElementById('docTotalCount');
    if (totalEl) {
        const statItem = totalEl.closest('.stat-item') || totalEl;
        statItem.classList.add('clickable');
        statItem.addEventListener('click', () => {
            const inner = statItem.querySelector('.stat-value') || statItem;
            inner.classList.add('pressed');
            setTimeout(() => inner.classList.remove('pressed'), 300);
            if (typeof showDocumentsTab === 'function') showDocumentsTab();
            setTimeout(() => {
                if (typeof loadDocuments === 'function') loadDocuments();
            }, 120);
        });
    }

    // Make the Favorites stat clickable: show favorites
    const favEl = document.getElementById('docFavoritesCount');
    if (favEl) {
        const statItem = favEl.closest('.stat-item') || favEl;
        statItem.classList.add('clickable');
        statItem.addEventListener('click', () => {
            const inner = statItem.querySelector('.stat-value') || statItem;
            inner.classList.add('pressed');
            setTimeout(() => inner.classList.remove('pressed'), 300);
            if (typeof showDocumentsTab === 'function') showDocumentsTab();
            setTimeout(() => {
                if (typeof showFavoritesDocuments === 'function') showFavoritesDocuments();
            }, 120);
        });
    }

}

function setupPinInputs() {
    for (let i = 1; i <= PIN_LENGTH; i++) {
        const pinInput = document.getElementById(`pin${i}`);
        if (pinInput) {
            pinInput.addEventListener('input', (e) => handlePinInput(i, e));
            pinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && i === PIN_LENGTH) {
                    verifyPin();
                }
            });
        }
    }
}

// Make functions global
window.lockVault = lockVault;
window.unlockVault = unlockVault;
window.showPinModal = showPinModal;
window.closePinModal = closePinModal;
window.verifyPin = verifyPin;
window.forgotPin = forgotPin;
window.exportVault = exportVault;
window.importVault = importVault;
window.debugVault = debugVault;