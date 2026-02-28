// biometric.js - FIXED VERSION
// Simple Biometric Authentication

class BiometricAuth {
    constructor(vault) {
        console.log('📱 BiometricAuth initializing...');
        this.vault = vault;
        this.isSupported = this.checkSupport();
        this.isEnabled = localStorage.getItem('biometric_enabled') === 'true';
        
        // Auto setup agar supported hai
        if (this.isSupported) {
            this.addBiometricButton();
            // Vault unlocked hone par bhi button add karo (agar modal open ho)
            this.setupModalObserver();
        }
    }

    // Check if browser supports biometric
    checkSupport() {
        const supported = window.PublicKeyCredential !== undefined &&
               typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
        
        if (supported) {
            // Check if actually available
            window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                .then(available => {
                    if (!available) {
                        console.log('📱 Platform authenticator not available');
                    }
                });
        }
        return supported;
    }

    // Watch for PIN modal opening
    setupModalObserver() {
        // Check every second for PIN modal (simple approach)
        setInterval(() => {
            const pinModal = document.getElementById('pinModal');
            if (pinModal && pinModal.style.display === 'flex') {
                this.addBiometricButton();
            }
        }, 1000);
    }

    // Add button to PIN modal
    addBiometricButton() {
        setTimeout(() => {
            const pinModal = document.getElementById('pinModal');
            if (!pinModal) return;

            // Check if button already exists
            if (document.getElementById('bioAuthBtn')) return;

            const actionsDiv = pinModal.querySelector('.modal-actions');
            if (!actionsDiv) return;

            // Check if already has button
            if (actionsDiv.querySelector('#bioAuthBtn')) return;

            const bioBtn = document.createElement('button');
            bioBtn.id = 'bioAuthBtn';
            bioBtn.innerHTML = this.isEnabled ? '📱 Use Fingerprint' : '📱 Enable Biometric';
            bioBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
            bioBtn.style.marginBottom = '10px';
            bioBtn.style.width = '100%';
            
            bioBtn.onclick = async (e) => {
                e.preventDefault();
                if (this.isEnabled) {
                    await this.authenticate();
                } else {
                    await this.setupBiometric();
                }
            };
            
            // Insert at top of actions
            actionsDiv.insertBefore(bioBtn, actionsDiv.firstChild);
            console.log('📱 Biometric button added');
        }, 500);
    }

    // Setup biometric for first time
    async setupBiometric() {
        try {
            // Pehle PIN verify karo
            const pin = prompt('🔐 Enter your current PIN to enable biometric:');
            if (!pin || pin.length !== 6) {
                alert('Invalid PIN');
                return;
            }

            // Verify PIN
            const isValid = await this.vault.verifyPin(pin);
            if (!isValid) {
                alert('Wrong PIN');
                return;
            }

            // Generate random challenge
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            // Get hostname for RP ID
            const hostname = window.location.hostname || 'localhost';

            // Create biometric credential
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: "MemPass",
                        id: hostname
                    },
                    user: {
                        id: new TextEncoder().encode("mempass-user-1"),
                        name: "mempass-user",
                        displayName: "MemPass User"
                    },
                    pubKeyCredParams: [
                        { type: "public-key", alg: -7 }, // ES256
                        { type: "public-key", alg: -257 } // RS256
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required",
                        requireResidentKey: false
                    },
                    timeout: 60000,
                    attestation: "none"
                }
            });

            if (!credential) {
                throw new Error('No credential created');
            }

            // Store credential ID
            const credentialId = Array.from(new Uint8Array(credential.rawId));
            localStorage.setItem('bio_credential_id', JSON.stringify(credentialId));
            
            // Encrypt PIN with simple XOR
            const encryptedPin = this.simpleEncrypt(pin);
            localStorage.setItem('bio_encrypted_pin', encryptedPin);
            localStorage.setItem('biometric_enabled', 'true');
            
            this.isEnabled = true;
            
            // Update button
            const btn = document.getElementById('bioAuthBtn');
            if (btn) btn.innerHTML = '📱 Use Fingerprint';
            
            Utils.showToast('✅ Biometric enabled!', 3000);
            
        } catch (err) {
            console.error('Biometric setup failed:', err);
            
            // User-friendly error message
            let message = '❌ Biometric setup failed.';
            if (err.name === 'NotAllowedError') {
                message = '❌ Setup cancelled or not allowed.';
            } else if (err.name === 'NotSupportedError') {
                message = '❌ Biometric not supported on this device.';
            }
            
            alert(message);
        }
    }

    // Authenticate with biometric
    async authenticate() {
        try {
            const credentialIdStr = localStorage.getItem('bio_credential_id');
            if (!credentialIdStr) {
                this.isEnabled = false;
                localStorage.removeItem('biometric_enabled');
                alert('Biometric not setup. Please enable first.');
                return;
            }

            Utils.showToast('🔐 Verify fingerprint...', 2000);

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const credentialId = new Uint8Array(JSON.parse(credentialIdStr));
            const hostname = window.location.hostname || 'localhost';

            // Get biometric assertion
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    allowCredentials: [{
                        id: credentialId,
                        type: 'public-key',
                        transports: ['internal', 'hybrid']
                    }],
                    userVerification: 'required',
                    timeout: 60000
                }
            });

            if (assertion) {
                // Success! Get PIN and unlock vault
                const encryptedPin = localStorage.getItem('bio_encrypted_pin');
                if (!encryptedPin) {
                    throw new Error('No stored PIN found');
                }
                
                const pin = this.simpleDecrypt(encryptedPin);
                
                // Verify with vault
                const ok = await this.vault.verifyPin(pin);
                if (ok) {
                    // Close PIN modal first
                    const modal = document.getElementById('pinModal');
                    if (modal) modal.style.display = 'none';
                    
                    // Clear PIN inputs
                    for (let i = 1; i <= 6; i++) {
                        const input = document.getElementById(`pin${i}`);
                        if (input) input.value = '';
                    }
                    
                    // Unlock vault
                    unlockVault();
                    Utils.showToast('🔓 Unlocked with biometric!', 2000);
                } else {
                    throw new Error('PIN verification failed');
                }
            }
            
        } catch (err) {
            console.error('Biometric auth failed:', err);
            
            let message = '❌ Biometric failed.';
            if (err.name === 'NotAllowedError') {
                message = '❌ Authentication cancelled.';
            } else if (err.name === 'SecurityError') {
                message = '❌ Security error. Try again.';
            }
            
            Utils.showToast(message, 3000);
        }
    }

    // Simple encryption (XOR with constant)
    simpleEncrypt(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i) ^ 0x55; // XOR with constant
            result += String.fromCharCode(code);
        }
        return btoa(result); // Base64 encode
    }

    simpleDecrypt(encoded) {
        try {
            const text = atob(encoded);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const code = text.charCodeAt(i) ^ 0x55;
                result += String.fromCharCode(code);
            }
            return result;
        } catch (e) {
            console.error('Decryption failed:', e);
            return '';
        }
    }

    // Disable biometric
    disable() {
        if (confirm('Disable biometric login?')) {
            localStorage.removeItem('biometric_enabled');
            localStorage.removeItem('bio_credential_id');
            localStorage.removeItem('bio_encrypted_pin');
            this.isEnabled = false;
            
            const btn = document.getElementById('bioAuthBtn');
            if (btn) btn.innerHTML = '📱 Enable Biometric';
            
            // Remove settings div
            const settings = document.getElementById('biometricSettings');
            if (settings) settings.remove();
            
            Utils.showToast('Biometric disabled');
        }
    }
}

// Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for vault to initialize
    const checkVault = setInterval(() => {
        if (window.vault) {
            clearInterval(checkVault);
            console.log('📱 Creating BiometricAuth instance');
            window.biometric = new BiometricAuth(window.vault);
            
            // Add settings option after vault unlocks
            setupBiometricSettingsCheck();
        }
    }, 500);
});

// Check for unlocked vault and add settings
function setupBiometricSettingsCheck() {
    setInterval(() => {
        if (window.isVaultUnlocked && window.biometric && window.biometric.isEnabled) {
            addBiometricSettings();
        }
    }, 2000);
}

// Add settings option in vault
function addBiometricSettings() {
    const vaultSection = document.getElementById('unlockedVault');
    if (!vaultSection) return;
    
    // Check if already added
    if (document.getElementById('biometricSettings')) return;
    
    // Find where to insert (after stats maybe)
    const passwordContent = document.getElementById('passwordVaultContent');
    if (!passwordContent) return;
    
    const settingsDiv = document.createElement('div');
    settingsDiv.id = 'biometricSettings';
    settingsDiv.style.marginTop = '20px';
    settingsDiv.style.padding = '15px';
    settingsDiv.style.background = 'var(--blur-bg)';
    settingsDiv.style.borderRadius = '12px';
    settingsDiv.style.border = '1px solid var(--card-border)';
    settingsDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3 style="margin-bottom: 5px;">📱 Biometric Login</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    Use fingerprint or face ID to unlock
                </p>
            </div>
            <button id="toggleBiometricBtn" class="action-btn" 
                    style="background: #f56565; color: white; padding: 8px 16px; width: auto;">
                Disable
            </button>
        </div>
    `;
    
    // Insert after stats
    const stats = passwordContent.querySelector('.stats');
    if (stats && stats.nextSibling) {
        passwordContent.insertBefore(settingsDiv, stats.nextSibling);
    } else {
        passwordContent.appendChild(settingsDiv);
    }
    
    document.getElementById('toggleBiometricBtn').onclick = () => {
        if (window.biometric) {
            window.biometric.disable();
        }
    };
}

// Make global
window.BiometricAuth = BiometricAuth;
