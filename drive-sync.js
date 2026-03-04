// drive-sync.js - Auto Google Drive Backup for MemPass v2.3+
/**
 * GoogleDriveSync handles optional encrypted backups of the vault to the
 * user's Google Drive.  It authenticates via OAuth2, creates a dedicated
 * folder, and uploads a single encrypted file whenever the vault changes.
 * Restoring from Drive is also supported.  The encryption password is chosen
 * by the user and never sent to Google.
 */
class GoogleDriveSync {
    constructor() {
        // Paste your Google OAuth Client ID here.  Make sure you have configured the
        // OAuth consent screen and added the origin(s) used by this app as
        // *Authorized JavaScript origins* in the Cloud Console.  For example,
        // if you open the app via `http://127.0.0.1:5500` or `http://localhost:5500`
        // those urls must appear in the origin list.  Otherwise the Google API
        // will reject requests with a "redirect_uri_mismatch" (Error 400).
        //
        // See https://console.cloud.google.com/apis/credentials
        this.CLIENT_ID = '914750102066-jn58fts84soe2di5t9thcnla9hlt5gna.apps.googleusercontent.com'; // your client ID goes here (replace with your own)

        this.SCOPE = 'https://www.googleapis.com/auth/drive.file';
        this.FOLDER_NAME = 'MemPass Backups';
        this.BACKUP_FILE_NAME = 'mempass-backup.mempass';

        this.token = null;
        this.folderId = null;
        this.fileId = null;
        this.backupPassword = null;   // plain after decrypt
        this.enabled = false;
        this.lastSync = 0;
        this.debounceTimer = null;
    }

    async init() {
        const configStr = localStorage.getItem(STORAGE_KEYS.driveConfig);
        if (!configStr) return;

        try {
            const config = JSON.parse(configStr);
            this.enabled = config.enabled || false;
            this.folderId = config.folderId;
            this.fileId = config.fileId;
            this.lastSync = config.lastSync || 0;

            if (config.encryptedBackupPass && window.vault?.key) {
                const decrypted = await vault.decryptField(vault.key, config.encryptedBackupPass);
                this.backupPassword = decrypted;
            }

            if (this.enabled) {
                // try silent authentication so we have a token for future calls
                const authOk = await this.authenticate().catch(() => false);
                if (!authOk) {
                    console.warn('DriveSync: silent auth failed');
                }
                this.updateUIStatus();
                setTimeout(() => this.checkAndRestoreIfNewer(), 1500); // on load
            }
        } catch (e) {}
    }

    updateUIStatus() {
        const statusEl = document.getElementById('driveStatus');
        if (statusEl) {
            statusEl.textContent = this.enabled ? `Last synced: ${Utils.formatDate(this.lastSync)}` : 'Disabled';
            statusEl.style.color = this.enabled ? '#48bb78' : '#f56565';
        }
        const btn = document.getElementById('driveSyncBtn');
        if (btn) btn.textContent = this.enabled ? 'Manage Backup' : 'Enable Backup';
    }

    async enable() {
        if (!window.isVaultUnlocked || !vault.key) {
            Utils.showToast('Unlock vault first');
            return;
        }

        const pass1 = prompt('🔑 Set Cloud Backup Password (min 12 chars, strong):');
        if (!pass1 || pass1.length < 12) return Utils.showToast('Password too weak');
        const pass2 = prompt('Confirm same password:');
        if (pass1 !== pass2) return Utils.showToast('Passwords do not match');

        this.backupPassword = pass1;

        const authOk = await this.authenticate();
        if (!authOk) return;
        // make sure Drive API is enabled for the project or calls will return 403
        // (check https://console.cloud.google.com/apis/library/drive.googleapis.com)

        await this.getOrCreateFolder();
        await this.uploadNow();   // first backup

        // Save encrypted config
        const encryptedPass = await vault.encryptField(this.backupPassword);
        const config = {
            enabled: true,
            folderId: this.folderId,
            fileId: this.fileId,
            lastSync: Date.now(),
            encryptedBackupPass: encryptedPass
        };
        localStorage.setItem(STORAGE_KEYS.driveConfig, JSON.stringify(config));

        this.enabled = true;
        this.updateUIStatus();
        Utils.showToast('☁️ Google Drive Auto Backup ENABLED');
    }

    async disable() {
        // clear local config and UI state
        this.enabled = false;
        this.token = null;
        this.folderId = null;
        this.fileId = null;
        this.backupPassword = null;
        this.lastSync = 0;
        localStorage.removeItem(STORAGE_KEYS.driveConfig);
        this.updateUIStatus();
        Utils.showToast('☁️ Google Drive Auto Backup DISABLED');
    }

    // Ensure the Google GSI library is available. If not already loaded we
    // dynamically inject the script and wait for it to finish loading.
    async ensureGoogleLoaded() {
        if (window.google && google.accounts && google.accounts.oauth2) return;
        return new Promise((res, rej) => {
            const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existing) {
                existing.addEventListener('load', () => res());
                existing.addEventListener('error', () => rej(new Error('Google GSI load failed')));
                return;
            }
            const s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.async = true;
            s.defer = true;
            s.onload = () => res();
            s.onerror = () => rej(new Error('Google GSI load failed'));
            document.head.appendChild(s);
        });
    }

    async authenticate() {
        await this.ensureGoogleLoaded();
        return new Promise(resolve => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPE,
                callback: (resp) => {
                    if (resp.error) {
                        Utils.showToast('Google auth failed');
                        resolve(false);
                    } else {
                        this.token = resp.access_token;
                        resolve(true);
                    }
                }
            });
            tokenClient.requestAccessToken({ prompt: '' }); // silent if possible, else consent
        });
    }

    async getOrCreateFolder() {
        if (this.folderId) return this.folderId;

        const q = `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => '<no body>');
            console.error('Drive folder query error', res.status, txt);
        }
        const data = await res.json();

        if (data.files?.length > 0) {
            this.folderId = data.files[0].id;
        } else {
            const meta = { name: this.FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' };
            const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(meta)
            });
            if (!createRes.ok) {
                const txt = await createRes.text().catch(() => '<no body>');
                console.error('Drive folder creation error', createRes.status, txt);
            }
            const c = await createRes.json();
            this.folderId = c.id;
        }
        return this.folderId;
    }

    async createBackupBlob() {
        const passExport = await this.getPasswordsPlainExport();
        // documentVault may not yet be initialized (e.g. user enabled sync before
        // vault unlock or before document-vault finished setup).  gracefully
        // handle that by falling back to an empty list.
        let docExport = { documents: [] };
        if (window.documentVault && typeof window.documentVault.exportDocuments === 'function') {
            try {
                docExport = await window.documentVault.exportDocuments();
            } catch (e) {
                console.warn('Could not export documents for backup:', e);
            }
        }

        const full = {
            version: "2.3",
            timestamp: Date.now(),
            passwords: passExport,
            documents: (docExport.documents || [])
        };

        const json = JSON.stringify(full);
        const salt = cryptoUtils.generateSalt();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await cryptoUtils.deriveExportKey(this.backupPassword, salt);

        const enc = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(json));

        const backupObj = {
            encrypted: true,
            saltB64: cryptoUtils.toBase64(salt),
            ivB64: cryptoUtils.toBase64(iv),
            dataB64: cryptoUtils.toBase64(new Uint8Array(enc))
        };

        return new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    }

    async getPasswordsPlainExport() {
        const list = [];
        for (let p of vault.passwords) {
            list.push({
                service: p.service,
                username: vault.getDecryptedUsername(p),
                password: vault.getDecryptedPassword(p),
                notes: vault.getDecryptedNotes(p),
                created: p.created,
                updated: p.updated
            });
        }
        return list;
    }

    async uploadNow() {
        if (!this.token) await this.authenticate();
        if (!this.folderId) await this.getOrCreateFolder();

        const blob = await this.createBackupBlob();

        // Check if file exists
        const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${this.BACKUP_FILE_NAME}' and parents in '${this.folderId}'&fields=files(id)`, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        const list = await listRes.json();

        let url, method, body;
        if (list.files && list.files.length > 0) {
            const fid = list.files[0].id;
            url = `https://www.googleapis.com/upload/drive/v3/files/${fid}?uploadType=multipart`;
            method = 'PATCH';
        } else {
            url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id`;
            method = 'POST';
        }

        const metadata = { name: this.BACKUP_FILE_NAME, mimeType: 'application/json', parents: [this.folderId] };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${this.token}` },
            body: form
        });

        // log failure details for debugging permissions issues
        if (!res.ok) {
            const text = await res.text().catch(() => '<error reading response>');
            console.error('Drive upload error', res.status, text);
            if (res.status === 403) {
                try {
                    const parsed = JSON.parse(text);
                    if (parsed.error && parsed.error.reason === 'storageQuotaExceeded') {
                        Utils.showToast('⚠️ Google Drive quota exceeded. Sync disabled. Free up space or use another account.', 7000);
                        // disable further sync attempts until user re‑enables
                        this.enabled = false;
                        this.updateUIStatus();
                        return;
                    } else {
                        Utils.showToast('⚠️ Drive API forbidden – check credentials & origin', 5000);
                    }
                } catch (e) {
                    Utils.showToast('⚠️ Drive API forbidden – check credentials & origin', 5000);
                }
            }
        }

        // if the token expired or was revoked we may get 401; clear token and retry once
        if (res.status === 401) {
            console.warn('Drive sync: token invalid, reauthenticating');
            this.token = null;
            const ok = await this.authenticate();
            if (ok) return this.uploadNow();
            return;
        }

        if (res.ok) {
            const data = await res.json();
            if (data.id) this.fileId = data.id;
            this.lastSync = Date.now();
            localStorage.setItem('mempass_last_drive_sync', this.lastSync);
            this.updateUIStatus();
            Utils.showToast('☁️ Backup uploaded to Google Drive');
        }
    }

    queueSync() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.uploadNow(), 8000);
    }

    async checkAndRestoreIfNewer() {
        if (!this.enabled) return;
        if (!this.token) {
            const ok = await this.authenticate().catch(() => false);
            if (!ok) return;
        }
        if (!this.folderId) return;

        const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${this.BACKUP_FILE_NAME}' and parents in '${this.folderId}'&fields=files(id,modifiedTime)`, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        const data = await listRes.json();
        if (!data.files || data.files.length === 0) return;

        const cloudTime = new Date(data.files[0].modifiedTime).getTime();
        const localTime = this.lastSync || 0;

        if (cloudTime > localTime + 60000) {   // 1 min buffer
            if (confirm('Newer backup found on Google Drive.\nRestore now? (This will REPLACE local data)')) {
                await this.restoreFromDrive(data.files[0].id);
            }
        }
    }

    async restoreFromDrive(fileId) {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        const blob = await res.blob();
        const text = await blob.text();
        const backupObj = JSON.parse(text);

        const salt = cryptoUtils.fromBase64(backupObj.saltB64);
        const iv = cryptoUtils.fromBase64(backupObj.ivB64);
        const encData = cryptoUtils.fromBase64(backupObj.dataB64);
        const key = await cryptoUtils.deriveExportKey(this.backupPassword, salt);

        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encData);
        const plain = JSON.parse(new TextDecoder().decode(decrypted));

        // Import passwords
        await vault.importData({ version: '2.3', vault: plain.passwords, settings: {} });

        // Import documents
        await window.documentVault.importDocuments({ version: '1.0', documents: plain.documents });

        this.lastSync = Date.now();
        localStorage.setItem('mempass_last_drive_sync', this.lastSync);
        this.updateUIStatus();

        await loadSavedPasswords();
        await loadDocuments();
        Utils.showToast('✅ Restored from Google Drive');
    }
}

// global instance is created in main.js during initialization
// window.googleDriveSync = new GoogleDriveSync();