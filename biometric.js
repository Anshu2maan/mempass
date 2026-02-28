// biometric.js - Simple Biometric Authentication
// Bas ek file, bas copy-paste, kaam khatam!

class BiometricAuth {
    constructor(vault) {
        this.vault = vault;
        this.isSupported = this.checkSupport();
        this.isEnabled = localStorage.getItem('biometric_enabled') === 'true';
        
        // Auto setup agar supported hai
        if (this.isSupported) {
            this.addBiometricButton();
        }
    }

    // Check if browser supports biometric
    checkSupport() {
        return window.PublicKeyCredential !== undefined &&
               typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
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

            const bioBtn = document.createElement('button');
            bioBtn.id = 'bioAuthBtn';
            bioBtn.innerHTML = this.isEnabled ? '📱 Use Fingerprint' : '📱 Enable Biometric';
            bioBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
            bioBtn.style.marginBottom = '10px';
            
            bioBtn.onclick = async () => {
                if (this.isEnabled) {
                    await this.authenticate();
                } else {
                    await this.setupBiometric();
                }
            };
            
            actionsDiv.prepend(bioBtn);
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

            // Create biometric credential
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: "MemPass",
                        id: window.location.hostname
                    },
                    user: {
                        id: new TextEncoder().encode("mempass-user-1"),
                        name: "MemPass User",
                        displayName: "MemPass User"
                    },
                    pubKeyCredParams: [{
                        type: "public-key",
                        alg: -7 // ES256 algorithm
                    }],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required"
                    },
                    timeout: 60000
                }
            });

            // Store credential ID and encrypted PIN
            localStorage.setItem('bio_credential_id', JSON.stringify(Array.from(new Uint8Array(credential.rawId))));
            
            // Encrypt PIN with simple XOR (basic, but works)
            const encryptedPin = this.simpleEncrypt(pin);
            localStorage.setItem('bio_encrypted_pin', encryptedPin);
            localStorage.setItem('biometric_enabled', 'true');
            
            this.isEnabled = true;
            document.getElementById('bioAuthBtn').innerHTML = '📱 Use Fingerprint';
            
            Utils.showToast('✅ Biometric enabled!', 3000);
            
        } catch (err) {
            console.error('Biometric setup failed:', err);
            alert('❌ Biometric setup failed. Your device may not support it.');
        }
    }

    // Authenticate with biometric
    async authenticate() {
        try {
            const credentialId = localStorage.getItem('bio_credential_id');
            if (!credentialId) {
                this.isEnabled = false;
                localStorage.removeItem('biometric_enabled');
                alert('Biometric not setup. Please enable first.');
                return;
            }

            Utils.showToast('🔐 Scan fingerprint...', 2000);

            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            // Get biometric assertion
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    allowCredentials: [{
                        id: new Uint8Array(JSON.parse(credentialId)),
                        type: 'public-key'
                    }],
                    userVerification: 'required',
                    timeout: 60000
                }
            });

            if (assertion) {
                // Success! Get PIN and unlock vault
                const encryptedPin = localStorage.getItem('bio_encrypted_pin');
                const pin = this.simpleDecrypt(encryptedPin);
                
                // Close PIN modal
                closePinModal();
                
                // Verify and unlock
                const ok = await this.vault.verifyPin(pin);
                if (ok) {
                    unlockVault();
                    Utils.showToast('🔓 Unlocked with biometric!', 2000);
                }
            }
            
        } catch (err) {
            console.error('Biometric auth failed:', err);
            alert('❌ Biometric failed. Use PIN instead.');
        }
    }

    // Simple encryption (enough for this use case)
    simpleEncrypt(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i) ^ 0x55; // XOR with constant
            result += String.fromCharCode(code);
        }
        return btoa(result); // Base64 encode
    }

    simpleDecrypt(encoded) {
        const text = atob(encoded);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i) ^ 0x55;
            result += String.fromCharCode(code);
        }
        return result;
    }

    // Disable biometric
    disable() {
        localStorage.removeItem('biometric_enabled');
        localStorage.removeItem('bio_credential_id');
        localStorage.removeItem('bio_encrypted_pin');
        this.isEnabled = false;
        
        const btn = document.getElementById('bioAuthBtn');
        if (btn) btn.innerHTML = '📱 Enable Biometric';
        
        Utils.showToast('Biometric disabled');
    }
}

// Initialize after vault is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for vault to initialize
    const checkVault = setInterval(() => {
        if (window.vault) {
            clearInterval(checkVault);
            window.biometric = new BiometricAuth(window.vault);
            
            // Add reset option in settings
            addBiometricSettings();
        }
    }, 500);
});

// Add settings option
function addBiometricSettings() {
    const vaultSection = document.getElementById('vaultSection');
    if (!vaultSection) return;
    
    // Check if already added
    if (document.getElementById('biometricSettings')) return;
    
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
                    style="background: #f56565; color: white; padding: 8px 16px;">
                Disable
            </button>
        </div>
    `;
    
    vaultSection.appendChild(settingsDiv);
    
    document.getElementById('toggleBiometricBtn').onclick = () => {
        if (window.biometric) {
            window.biometric.disable();
            settingsDiv.remove();
        }
    };
}

export default BiometricAuth;
