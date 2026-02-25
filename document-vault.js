// document-vault.js - Final version with all fixes

class DocumentVault {
    constructor(cryptoUtils, passwordVault) {
        console.log('📁 DocumentVault constructor called');
        this.crypto = cryptoUtils;
        this.passwordVault = passwordVault;
        this.db = null;
        this.documents = [];
        this.initDB();
    }

    async initDB() {
        try {
            this.db = new Dexie('MemPassDocs');
            
            this.db.version(2).stores({
    documents: 'id, type, title, created, updated, favorite, *tags'
}).upgrade(tx => {
    // Purane documents mein tags field add karo
    return tx.documents.toCollection().modify(doc => {
        doc.tags = doc.tags || [];
    });
});
            
            await this.db.open();
            await this.loadDocuments();
            console.log('✅ Document DB initialized');
        } catch (error) {
            console.error('❌ DB init error:', error);
            this.db = null;
        }
    }

    async loadDocuments() {
        if (!this.db) return;
        try {
            this.documents = await this.db.documents.toArray();
            this.updateUI();
            console.log(`📚 Loaded ${this.documents.length} documents`);
        } catch (error) {
            console.error('Error loading documents:', error);
            this.documents = [];
        }
    }

    async saveDocument(document) {
        if (!this.db) throw new Error('Database not initialized');
        try {
            await this.db.documents.put(document);
            await this.loadDocuments();
            return true;
        } catch (error) {
            console.error('Error saving document:', error);
            throw error;
        }
    }

    async deleteDocument(id) {
        if (!this.db) throw new Error('Database not initialized');
        try {
            await this.db.documents.delete(id);
            await this.loadDocuments();
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    async getDocument(id, incrementAccess = true) {
        if (!this.db) return null;
        try {
            const doc = await this.db.documents.get(id);
            if (doc && incrementAccess) {
                doc.accessCount = (doc.accessCount || 0) + 1;
                doc.lastAccessed = new Date().toISOString();
                await this.saveDocument(doc);
            }
            return doc;
        } catch (error) {
            console.error('Error getting document:', error);
            return null;
        }
    }

    async _ensureKey() {
    // Priority order for key lookup
    if (this.passwordVault && this.passwordVault.key) {
        return true;
    }
    if (window.vault && window.vault.key) {
        this.passwordVault = window.vault;
        return true;
    }
    console.error('❌ No encryption key available');
    return false;
}

    async encryptField(text) {
        const hasKey = await this._ensureKey();
        if (!hasKey) throw new Error('Vault must be unlocked');

        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    this.passwordVault.key,
    enc.encode(text)
);
        
        const tag = new Uint8Array(ciphertext.slice(-16));
        const ct = new Uint8Array(ciphertext.slice(0, -16));
        
        return {
            iv: this.crypto.toBase64(iv),
            ct: this.crypto.toBase64(ct),
            tag: this.crypto.toBase64(tag)
        };
    }

    async decryptField(encrypted) {
        const hasKey = await this._ensureKey();
        if (!hasKey) throw new Error('Vault must be unlocked');

        const iv = this.crypto.fromBase64(encrypted.iv);
        const ct = this.crypto.fromBase64(encrypted.ct);
        const tag = this.crypto.fromBase64(encrypted.tag);
        
        const combined = new Uint8Array([...ct, ...tag]);
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            this.passwordVault.key,
            combined
        );

        return new TextDecoder().decode(decrypted);
    }

    async encryptFile(file) {
    return new Promise(async (resolve, reject) => {
        const hasKey = await this._ensureKey();
        if (!hasKey) {
            reject(new Error('Vault must be unlocked'));
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                console.log(`📄 Encrypting ${file.name}, size: ${data.length} bytes, type: ${file.type}`);
                
                const iv = crypto.getRandomValues(new Uint8Array(12));
                
                // PDF ke liye specific handling
                let ciphertext;
                try {
                    ciphertext = await window.crypto.subtle.encrypt(
                        { name: "AES-GCM", iv },
                        this.passwordVault.key,
                        data
                    );
                } catch (encryptError) {
                    console.error('Encryption failed:', encryptError);
                    // Try with different approach for large files
                    if (file.size > 10 * 1024 * 1024) {
                        reject(new Error('File too large (max 10MB for PDF)'));
                    } else {
                        reject(new Error(`Encryption failed: ${encryptError.message}`));
                    }
                    return;
                }
                
                const tag = new Uint8Array(ciphertext.slice(-16));
                const ct = new Uint8Array(ciphertext.slice(0, -16));
                
                let thumbnail = null;
                if (file.type.startsWith('image/')) {
                    thumbnail = await this.generateThumbnail(file);
                }
                
                console.log(`✅ Encrypted ${file.name} successfully`);
                resolve({
                    iv: this.crypto.toBase64(iv),
                    ct: this.crypto.toBase64(ct),
                    tag: this.crypto.toBase64(tag),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    thumbnail: thumbnail
                });
            } catch (error) {
                console.error('❌ File encryption error:', error);
                reject(new Error(`Failed to encrypt ${file.name}: ${error.message}`));
            }
        };
        
        reader.onerror = () => {
            reject(new Error(`Failed to read ${file.name}`));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

    async decryptFile(encryptedFile) {
        const hasKey = await this._ensureKey();
        if (!hasKey) throw new Error('Vault must be unlocked');

        const iv = this.crypto.fromBase64(encryptedFile.iv);
        const ct = this.crypto.fromBase64(encryptedFile.ct);
        const tag = this.crypto.fromBase64(encryptedFile.tag);
        
        const combined = new Uint8Array([...ct, ...tag]);
        
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            this.passwordVault.key,
            combined
        );
        
        return new Blob([decrypted], { type: encryptedFile.type });
    }

    async generateThumbnail(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100 * (img.height / img.width);
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async addDocument(documentData, files) {
        const hasKey = await this._ensureKey();
        if (!hasKey) throw new Error('Vault must be unlocked');

        const encryptedMetadata = {};
        for (let [key, value] of Object.entries(documentData.metadata || {})) {
            if (value) {
                encryptedMetadata[key] = await this.encryptField(String(value));
            }
        }

        const encryptedFiles = [];
        for (let file of files) {
            try {
                const encrypted = await this.encryptFile(file);
                encryptedFiles.push(encrypted);
            } catch (error) {
                console.error('Error encrypting file:', file.name, error);
                throw new Error(`Failed to encrypt file: ${file.name}`);
            }
        }

        const document = {
            id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: documentData.type,
            title: documentData.title || DOCUMENT_TYPES[documentData.type].name,
            metadata: encryptedMetadata,
            files: encryptedFiles,
            tags: documentData.tags || [],
            favorite: documentData.favorite || false,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            notes: documentData.notes || '',
            accessCount: 0,
            lastAccessed: null
        };

        await this.saveDocument(document);
        
        if (documentData.metadata && documentData.metadata.expiryDate) {
            await this.checkDocumentExpiry(document);
        }
        
        return document;
    }

    async searchDocuments(query) {
        if (!query || query.trim() === '') return this.documents;
        if (!this.db) return [];
        
        const q = query.toLowerCase().trim();
        const results = await this.db.documents
            .filter(doc => 
                (doc.title && doc.title.toLowerCase().includes(q)) ||
                (doc.type && doc.type.toLowerCase().includes(q)) ||
                (doc.notes && doc.notes.toLowerCase().includes(q)) ||
                (doc.tags && doc.tags.some(t => t && t.toLowerCase().includes(q)))
            )
            .toArray();
        
        return results;
    }

    getDocumentsByType(type) {
        if (type === 'all') return this.documents;
        return this.documents.filter(d => d.type === type);
    }

    async checkExpiringDocuments() {
        const hasKey = await this._ensureKey();
        if (!hasKey) return [];
        
        const expiringDocs = [];
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        for (let doc of this.documents) {
            if (doc.metadata && doc.metadata.expiryDate) {
                try {
                    const decryptedExpiry = await this.decryptField(doc.metadata.expiryDate);
                    const expiryDate = new Date(decryptedExpiry);
                    
                    if (expiryDate > now && expiryDate < thirtyDays) {
                        const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                        expiringDocs.push({
                            id: doc.id,
                            title: doc.title,
                            daysLeft,
                            expiryDate: decryptedExpiry
                        });
                    }
                } catch (e) {
                    console.warn('Expiry check failed for doc', doc.id);
                }
            }
        }
        
        if (expiringDocs.length > 0) {
            localStorage.setItem('doc_expiry_notifications', JSON.stringify(expiringDocs));
        } else {
            localStorage.removeItem('doc_expiry_notifications');
        }
        
        return expiringDocs;
    }

    async checkDocumentExpiry(document) {
        await this.checkExpiringDocuments();
    }

    async exportDocuments() {
        const hasKey = await this._ensureKey();
        if (!hasKey) throw new Error('Vault must be unlocked');

        // Build a decrypted, usable export structure (files as data URLs)
        const exportDocs = [];
        for (let doc of this.documents) {
            const exported = {
                id: doc.id,
                type: doc.type,
                title: doc.title,
                metadata: {},
                files: [],
                tags: doc.tags || [],
                favorite: doc.favorite || false,
                created: doc.created,
                updated: doc.updated,
                notes: doc.notes || ''
            };

            // Decrypt metadata fields
            for (let [k, v] of Object.entries(doc.metadata || {})) {
                try {
                    exported.metadata[k] = await this.decryptField(v);
                } catch (e) {
                    exported.metadata[k] = null;
                }
            }

            // Decrypt files to data URLs
            for (let f of doc.files || []) {
                try {
                    const blob = await this.decryptFile(f);
                    // Convert Blob to data URL
                    const dataUrl = await new Promise((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = () => res(reader.result);
                        reader.onerror = rej;
                        reader.readAsDataURL(blob);
                    });
                    exported.files.push({ name: f.name, type: f.type, size: f.size, dataUrl });
                } catch (e) {
                    // If file can't be decrypted, skip it
                    console.warn('Failed to decrypt file for export', f.name, e);
                }
            }

            exportDocs.push(exported);
        }

        // Return plain export object; UI will encrypt the full export using an export password
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            documents: exportDocs
        };
    }

    async importDocuments(data) {
        const hasKey = await this._ensureKey();
        if (!hasKey) throw new Error('Vault must be unlocked');

        let parsed = data;

        // If encrypted package, decrypt it here (UI may pass decrypted already)
        if (data.encrypted) {
            // Expect UI to have already decrypted; if not, reject here
            throw new Error('Encrypted import must be decrypted by UI before calling importDocuments');
        }

        if (!parsed || parsed.version !== '1.0') {
            throw new Error('Unsupported export format');
        }

        // parsed.documents contains decrypted documents with files as data URLs
        for (let doc of parsed.documents) {
            // Re-encrypt metadata fields
            const encryptedMetadata = {};
            for (let [k, v] of Object.entries(doc.metadata || {})) {
                if (v != null) {
                    encryptedMetadata[k] = await this.encryptField(String(v));
                }
            }

            // Re-encrypt files from data URLs
            const encryptedFiles = [];
            for (let f of doc.files || []) {
                try {
                    // Convert dataUrl to ArrayBuffer
                    const arrBuff = await (async () => {
                        const base64 = f.dataUrl.split(',')[1];
                        const binary = atob(base64);
                        const len = binary.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
                        return bytes.buffer;
                    })();

                    // Encrypt buffer
                    const iv = crypto.getRandomValues(new Uint8Array(12));
                    const ciphertext = await window.crypto.subtle.encrypt(
                        { name: 'AES-GCM', iv },
                        this.passwordVault.key,
                        new Uint8Array(arrBuff)
                    );
                    const tag = new Uint8Array(ciphertext.slice(-16));
                    const ct = new Uint8Array(ciphertext.slice(0, -16));

                    encryptedFiles.push({
                        iv: this.crypto.toBase64(iv),
                        ct: this.crypto.toBase64(ct),
                        tag: this.crypto.toBase64(tag),
                        name: f.name,
                        type: f.type,
                        size: f.size || (new Uint8Array(arrBuff)).length,
                        thumbnail: f.thumbnail || null
                    });
                } catch (e) {
                    console.warn('Failed to encrypt imported file', f.name, e);
                }
            }

            const storageDoc = {
                id: doc.id || ('doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)),
                type: doc.type,
                title: doc.title,
                metadata: encryptedMetadata,
                files: encryptedFiles,
                tags: doc.tags || [],
                favorite: doc.favorite || false,
                created: doc.created || new Date().toISOString(),
                updated: doc.updated || new Date().toISOString(),
                notes: doc.notes || '',
                accessCount: 0,
                lastAccessed: null
            };

            await this.saveDocument(storageDoc);

            // Ensure imported documents are evaluated for expiry warnings immediately
            try {
                if (storageDoc.metadata && storageDoc.metadata.expiryDate) {
                    await this.checkDocumentExpiry(storageDoc);
                }
            } catch (e) {
                console.warn('Failed to check expiry for imported document', storageDoc.id, e);
            }
        }

        await this.loadDocuments();
        return true;
    }

    getStats() {
        const total = this.documents.length;
        const byType = {};
        let favorites = 0;
        
        this.documents.forEach(doc => {
            byType[doc.type] = (byType[doc.type] || 0) + 1;
            if (doc.favorite) favorites++;
        });
        
        const notifications = JSON.parse(localStorage.getItem('doc_expiry_notifications') || '[]');
        const expiringSoon = notifications.length;
        
        return {
            total,
            byType,
            expiringSoon,
            favorites
        };
    }

    updateUI() {
        window.dispatchEvent(new CustomEvent('documentsUpdated', { 
            detail: { 
                count: this.documents.length,
                stats: this.getStats()
            }
        }));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getDocumentIcon(type) {
        return DOCUMENT_TYPES[type]?.icon || '📄';
    }

    getDocumentTypeName(type) {
        return DOCUMENT_TYPES[type]?.name || 'Document';
    }
}

// Initialize document vault
async function initDocumentVault() {
    console.log('🔧 initDocumentVault called');
    
    if (!window.vault || !window.vault.key) {
        console.error('❌ Password vault not available or locked');
        return null;
    }
    
    try {
        if (window.documentVault) {
            console.log('✅ Document vault already exists');
            window.documentVault.passwordVault = window.vault;
            return window.documentVault;
        }
        
        console.log('📝 Creating new DocumentVault instance');
        window.documentVault = new DocumentVault(cryptoUtils, window.vault);
        
        // Wait for DB initialization
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await window.documentVault.loadDocuments();
        console.log('✅ Document vault initialized, documents:', window.documentVault.documents.length);
        return window.documentVault;
    } catch (error) {
        console.error('❌ Failed to initialize document vault:', error);
        return null;
    }
}

// Make global
window.initDocumentVault = initDocumentVault;