// ui/password.js - password generation and basic actions

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

// globals
window.generatePassword = generatePassword;
window.updateMasterStrength = updateMasterStrength;
window.togglePasswordOutput = togglePasswordOutput;
window.savePassword = savePassword;
window.copyPassword = copyPassword;
window.incrementVersion = incrementVersion;
