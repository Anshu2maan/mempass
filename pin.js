// ui/pin.js - PIN input/modal handling, verification and reset

// ====== PIN INPUT HELPERS ======
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

// ====== PIN MODAL ======
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

// ====== PIN VERIFICATION ======
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

// keep functions globally accessible
window.handlePinInput = handlePinInput;
window.getPin = getPin;
window.clearPinInputs = clearPinInputs;
window.showPinModal = showPinModal;
window.closePinModal = closePinModal;
window.verifyPin = verifyPin;
window.forgotPin = forgotPin;
