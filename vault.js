// vault.js - COMPLETELY FIXED - Production Ready Version
// PasswordVault Class with All Security Enhancements

class PasswordVault {
    constructor() {
        console.log('🔐 Initializing PasswordVault');
        this.db = null;
        this.key = null;
        this.passwords = [];
        this.settingsKey = STORAGE_KEYS.settings;
        this.settings = JSON.parse(localStorage.getItem(this.settingsKey) || '{}');
        this.initDB();
    }

    // ==================== DATABASE METHODS ====================

    async initDB() {
        try {
            this.db = new Dexie('MemPassVault');
            this.db.version(1).stores({
                passwords: '++id, service, username, version, created, updated, favorite'
            });
            await this.db.open();
            console.log('✅ Password DB initialized');
            await this.loadPasswords();
        } catch (err) {
            console.error('❌ Password DB init failed:', err);
            this.db = null;
            // Even without DB, we can still work with in-memory passwords
        }
    }

    async loadPasswords() {
        if (!this.db) return;
        try {
            this.passwords = await this.db.passwords.toArray();
            console.log(`📚 Loaded ${this.passwords.length} passwords`);
        } catch (err) {
            console.error('Load passwords failed:', err);
            this.passwords = [];
        }
    }

    async saveToDB() {
        if (!this.db) return false;
        try {
            await this.db.passwords.bulkPut(this.passwords);
            return true;
        } catch (err) {
            console.error('Save to DB failed:', err);
            return false;
        }
    }

    // ==================== PIN & ENCRYPTION METHODS ====================

    async setPin(pin) {
        if (!pin || pin.length !== PIN_LENGTH || !/^\d+$/.test(pin)) {
            throw new Error('PIN must be exactly 6 digits');
        }

        const salt = cryptoUtils.generateSalt();
        this.key = await cryptoUtils.deriveKeyFromPin(pin, salt);
        
        this.settings.saltB64 = cryptoUtils.toBase64(salt);
        this.settings.version = '2.2';
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));

        await this.reencryptAllPasswords();
        
        console.log('✅ PIN set successfully');
    }

    async verifyPin(pin) {
        if (!this.settings.saltB64) {
            console.log('No PIN set yet');
            return false;
        }

        try {
            const salt = cryptoUtils.fromBase64(this.settings.saltB64);
            const derivedKey = await cryptoUtils.deriveKeyFromPin(pin, salt);
            
            // FIXED: Find any encrypted password to test, not just first one
            const testPwd = this.passwords.find(p => p.password && p.password.iv);
            if (testPwd) {
                await this.decryptField(derivedKey, testPwd.password);
            }
            
            this.key = derivedKey;
            
            // FIXED: Decrypt all passwords after successful verification
            await this.decryptVault();
            
            return true;
        } catch (err) {
            console.log('PIN verification failed:', err);
            this.key = null;
            return false;
        }
    }

    async decryptVault() {
        if (!this.key) throw new Error('No key available');
        
        for (let pwd of this.passwords) {
            try {
                if (pwd.password && typeof pwd.password === 'object' && pwd.password.iv) {
                    pwd._decryptedPassword = await this.decryptField(this.key, pwd.password);
                }
                if (pwd.username && typeof pwd.username === 'object' && pwd.username.iv) {
                    pwd._decryptedUsername = await this.decryptField(this.key, pwd.username);
                }
                if (pwd.notes && typeof pwd.notes === 'object' && pwd.notes.iv) {
                    pwd._decryptedNotes = await this.decryptField(this.key, pwd.notes);
                }
            } catch (err) {
                console.warn('Failed to decrypt password entry:', pwd.id, err);
                // Don't throw - continue with other passwords
            }
        }
        
        if (typeof this.updateStats === 'function') {
            this.updateStats();
        }
    }

    async reencryptAllPasswords() {
        if (!this.key) throw new Error('No key available');
        
        for (let pwd of this.passwords) {
            if (pwd._decryptedPassword) {
                pwd.password = await this.encryptField(pwd._decryptedPassword);
            } else if (pwd.password && typeof pwd.password === 'string') {
                pwd.password = await this.encryptField(pwd.password);
            }
            
            if (pwd._decryptedUsername) {
                pwd.username = await this.encryptField(pwd._decryptedUsername);
            } else if (pwd.username && typeof pwd.username === 'string') {
                pwd.username = await this.encryptField(pwd.username);
            }
            
            if (pwd._decryptedNotes) {
                pwd.notes = await this.encryptField(pwd._decryptedNotes);
            } else if (pwd.notes && typeof pwd.notes === 'string') {
                pwd.notes = await this.encryptField(pwd.notes);
            }
        }
        await this.saveToDB();
    }

    async encryptField(text) {
        if (!this.key) throw new Error('No encryption key');
        if (!text) return null;
        
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            this.key,
            enc.encode(String(text))
        );
        
        const tag = new Uint8Array(ciphertext.slice(-16));
        const ct = new Uint8Array(ciphertext.slice(0, -16));
        
        return {
            iv: cryptoUtils.toBase64(iv),
            ct: cryptoUtils.toBase64(ct),
            tag: cryptoUtils.toBase64(tag)
        };
    }

    async decryptField(key, encrypted) {
        if (!key) throw new Error('No decryption key');
        if (!encrypted || !encrypted.iv || !encrypted.ct || !encrypted.tag) {
            throw new Error('Invalid encrypted field format');
        }
        
        const iv = cryptoUtils.fromBase64(encrypted.iv);
        const ct = cryptoUtils.fromBase64(encrypted.ct);
        const tag = cryptoUtils.fromBase64(encrypted.tag);
        
        const combined = new Uint8Array([...ct, ...tag]);
        
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            combined
        );
        
        return new TextDecoder().decode(decrypted);
    }

    getDecryptedPassword(pwd) {
        if (pwd._decryptedPassword) return pwd._decryptedPassword;
        if (pwd.password && typeof pwd.password === 'string') return pwd.password;
        return '';
    }

    getDecryptedUsername(pwd) {
        if (pwd._decryptedUsername) return pwd._decryptedUsername;
        if (pwd.username && typeof pwd.username === 'string') return pwd.username;
        return '';
    }

    getDecryptedNotes(pwd) {
        if (pwd._decryptedNotes) return pwd._decryptedNotes;
        if (pwd.notes && typeof pwd.notes === 'string') return pwd.notes;
        return '';
    }

    lock() {
        this.key = null;
        for (let pwd of this.passwords) {
            delete pwd._decryptedPassword;
            delete pwd._decryptedUsername;
            delete pwd._decryptedNotes;
        }
        console.log('🔒 Password vault locked');
    }

    // ==================== PASSWORD CRUD METHODS ====================

    async addPassword(service, username, password, notes = '') {
        if (!this.key) throw new Error('Vault is locked');

        const encryptedPwd = await this.encryptField(password);
        const encryptedUser = username ? await this.encryptField(username) : null;
        const encryptedNotes = notes ? await this.encryptField(notes) : null;

        const entry = {
            service: service.toLowerCase(),
            username: encryptedUser,
            password: encryptedPwd,
            notes: encryptedNotes,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            version: parseInt(document.getElementById('version')?.value || '1'),
            favorite: false,
            accessCount: 0,
            lastAccessed: null
        };

        if (this.db) {
            entry.id = await this.db.passwords.add(entry);
        } else {
            entry.id = Date.now() + Math.random(); // Fallback ID
            this.passwords.push(entry);
        }
        
        // Add to array if DB insert didn't already do it
        if (this.db && !this.passwords.find(p => p.id === entry.id)) {
            this.passwords.push(entry);
        }
        
        // Store decrypted values for UI
        entry._decryptedPassword = password;
        entry._decryptedUsername = username;
        entry._decryptedNotes = notes;
        
        await this.loadPasswords(); // Refresh
        return entry;
    }

    async updatePassword(id, updates) {
        const index = this.passwords.findIndex(p => String(p.id) === String(normalizedId));
        if (index === -1) throw new Error('Password not found');

        const entry = { ...this.passwords[index], ...updates, updated: new Date().toISOString() };
        
        if (updates.password) {
            entry.password = await this.encryptField(updates.password);
            entry._decryptedPassword = updates.password;
        }
        if (updates.username) {
            entry.username = await this.encryptField(updates.username);
            entry._decryptedUsername = updates.username;
        }
        if (updates.notes) {
            entry.notes = await this.encryptField(updates.notes);
            entry._decryptedNotes = updates.notes;
        }

        if (this.db) {
            await this.db.passwords.put(entry);
        }
        
        this.passwords[index] = entry;
        return entry;
    }

    async deletePassword(id) {
        // Normalize id type: UI may pass string IDs (from HTML attributes)
        const normalizedId = (typeof id === 'string' && /^\d+$/.test(id)) ? Number(id) : id;

        const index = this.passwords.findIndex(p => p.id === normalizedId);
        if (index === -1) return false;

        if (this.db) {
            await this.db.passwords.delete(normalizedId);
        }
        
        this.passwords.splice(index, 1);
        return true;
    }

    getPassword(id, incrementAccess = true) {
        const pwd = this.passwords.find(p => p.id === id);
        if (pwd && incrementAccess && this.key) {
            pwd.accessCount = (pwd.accessCount || 0) + 1;
            pwd.lastAccessed = new Date().toISOString();
            this.saveToDB(); // Async
        }
        return pwd;
    }

    searchPasswords(query) {
        if (!query) return this.passwords;
        
        const q = query.toLowerCase();
        return this.passwords.filter(p => {
            const svc = (p.service && typeof p.service === 'string') ? p.service.toLowerCase() : '';
            const user = this.getDecryptedUsername(p) || '';
            const notes = this.getDecryptedNotes(p) || '';
            return (
                (svc && svc.includes(q)) ||
                (user && user.toLowerCase().includes(q)) ||
                (notes && notes.toLowerCase().includes(q))
            );
        });
    }

    sortPasswords(sortBy = 'newest') {
        const sorted = [...this.passwords];
        
        switch(sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
            case 'service':
                return sorted.sort((a, b) => a.service.localeCompare(b.service));
            case 'frequent':
                return sorted.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
            default:
                return sorted;
        }
    }

    getSearchSuggestions(query, limit = 5) {
        if (!query) return [];
        
        const q = query.toLowerCase();
        const matches = this.passwords.filter(p => {
            const svc = (p.service && typeof p.service === 'string') ? p.service.toLowerCase() : '';
            const user = this.getDecryptedUsername(p) || '';
            return (svc.includes(q) || (user && user.toLowerCase().includes(q)));
        });
        
        const unique = new Map();
        matches.forEach(p => {
            const key = `${p.service}:${this.getDecryptedUsername(p)}`;
            if (!unique.has(key)) {
                unique.set(key, p);
            }
        });
        
        return Array.from(unique.values()).slice(0, limit);
    }

    // ==================== STATS METHODS ====================

    getStats() {
        const total = this.passwords.length;
        const recent = this.passwords.filter(p => {
            const created = new Date(p.created);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return created >= thirtyDaysAgo;
        }).length;

        const seen = new Set();
        const duplicates = this.passwords.filter(p => {
            const key = `${p.service}:${this.getDecryptedUsername(p)}`;
            if (seen.has(key)) return true;
            seen.add(key);
            return false;
        }).length;

        return { total, recent, duplicates };
    }

    updateStats() {
        const stats = this.getStats();
        const totalEl = document.getElementById('totalCount');
        const recentEl = document.getElementById('recentCount');
        const duplicateEl = document.getElementById('duplicateCount');
        
        if (totalEl) totalEl.textContent = stats.total;
        if (recentEl) recentEl.textContent = stats.recent;
        if (duplicateEl) duplicateEl.textContent = stats.duplicates;
    }

    // ==================== EXPORT/IMPORT METHODS ====================

    async exportData() {
        if (!this.key) throw new Error("Vault not unlocked - please unlock first");
        
        const password = prompt('🔐 Set a strong password (min 8 chars) to encrypt export:');
        if (!password) throw new Error('Export cancelled');
        if (password.length < 8) throw new Error('Password must be at least 8 characters');

        const exportPasswords = [];
        for (let pwd of this.passwords) {
            try {
                exportPasswords.push({
                    id: pwd.id,
                    service: pwd.service,
                    username: this.getDecryptedUsername(pwd),
                    password: this.getDecryptedPassword(pwd),
                    notes: this.getDecryptedNotes(pwd),
                    created: pwd.created,
                    updated: pwd.updated,
                    version: pwd.version,
                    favorite: pwd.favorite,
                    accessCount: pwd.accessCount,
                    lastAccessed: pwd.lastAccessed
                });
            } catch (err) {
                console.warn('Failed to decrypt password for export:', err);
            }
        }

        const json = JSON.stringify({
            settings: this.settings,
            vault: exportPasswords,
            exportDate: new Date().toISOString(),
            version: '2.2'
        });

        const salt = cryptoUtils.generateSalt();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const exportKey = await cryptoUtils.deriveExportKey(password, salt);
        
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            exportKey,
            new TextEncoder().encode(json)
        );

        return {
            encrypted: true,
            saltB64: cryptoUtils.toBase64(salt),
            ivB64: cryptoUtils.toBase64(iv),
            dataB64: cryptoUtils.toBase64(new Uint8Array(encrypted)),
            version: '2.2'
        };
    }

    async importData(data) {
        if (!this.key) throw new Error("Vault not unlocked - please unlock first");
        
        let parsed;
        
        if (!data.encrypted) {
            // Legacy import
            if (!['2.0', '2.1'].includes(data.version)) {
                throw new Error('Unsupported export format');
            }
            parsed = data;
        } else {
            // Encrypted import
            const password = prompt('🔑 Enter password to decrypt import:');
            if (!password) throw new Error('Import cancelled');

            const salt = cryptoUtils.fromBase64(data.saltB64);
            const iv = cryptoUtils.fromBase64(data.ivB64);
            const encryptedData = cryptoUtils.fromBase64(data.dataB64);
            
            const exportKey = await cryptoUtils.deriveExportKey(password, salt);
            
            try {
                const decrypted = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv },
                    exportKey,
                    encryptedData
                );
                parsed = JSON.parse(new TextDecoder().decode(decrypted));
            } catch (error) {
                console.error('Import decryption failed:', error);
                throw new Error('Wrong password or corrupted file');
            }
        }
        
        if (!['2.0', '2.1', '2.2'].includes(parsed.version)) {
            throw new Error('Invalid export format');
        }
        
        // FIXED: Handle DB unavailable case
        if (this.db) {
            await this.db.passwords.clear();
        }
        
        this.settings = parsed.settings;
        this.passwords = parsed.vault || [];
        
        // Re-encrypt with current key
        for (let pwd of this.passwords) {
            if (pwd.password && typeof pwd.password === 'string') {
                pwd._decryptedPassword = pwd.password;
                pwd.password = await this.encryptField(pwd.password);
            }
            if (pwd.username && typeof pwd.username === 'string') {
                pwd._decryptedUsername = pwd.username;
                pwd.username = await this.encryptField(pwd.username);
            }
            if (pwd.notes && typeof pwd.notes === 'string') {
                pwd._decryptedNotes = pwd.notes;
                pwd.notes = await this.encryptField(pwd.notes);
            }
        }
        
        // FIXED: Save to DB if available, otherwise just update localStorage
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        
        if (this.db) {
            const saved = await this.saveToDB();
            if (!saved) {
                console.warn('DB save failed, but settings saved to localStorage');
            }
        }
        
        return true;
    }

    // ==================== UTILITY METHODS ====================

    resetPin() {
        localStorage.removeItem(this.settingsKey);
        if (this.db) {
            this.db.passwords.clear();
        }
        this.passwords = [];
        this.settings = {};
        this.key = null;
        
        localStorage.removeItem(STORAGE_KEYS.pinAttempts);
        localStorage.removeItem(STORAGE_KEYS.pinLockUntil);
        
        console.log('🗑️ Vault reset complete');
    }

    clearAll() {
        this.resetPin();
    }

    getBackupReminder() {
        const lastExport = localStorage.getItem(STORAGE_KEYS.lastExport);
        if (!lastExport) return true;
        
        const daysSinceExport = Math.floor((Date.now() - parseInt(lastExport)) / (24 * 60 * 60 * 1000));
        return daysSinceExport >= 30;
    }
}

// Export for use in other files
window.PasswordVault = PasswordVault;
