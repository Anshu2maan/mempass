// Crypto utilities using Web Crypto API and Argon2
class CryptoUtils {
    constructor() {
        this.crypto = window.crypto.subtle;
    }

    async deriveKeyFromPin(pin, salt) {
        const enc = new TextEncoder();
        
        if (typeof argon2 === 'undefined') {
            throw new Error('Argon2 library not loaded');
        }

        const hashResult = await argon2.hash({
            pass: enc.encode(pin),
            salt: salt,
            time: 4, // Upgraded for better security
            mem: 65536, // 64 MB - balanced for mobile
            parallelism: 4,
            type: argon2.ArgonType.Argon2id,
            hashLen: 32
        });

        return await this.crypto.importKey(
            "raw",
            hashResult.hash,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );
    }

    async encryptData(key, data) {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await this.crypto.encrypt(
            { name: "AES-GCM", iv },
            key,
            enc.encode(data)
        );
        const tag = new Uint8Array(ciphertext.slice(-16));
        const ct = new Uint8Array(ciphertext.slice(0, -16));
        return { iv, ct, tag };
    }

    async decryptData(key, iv, ct, tag) {
        const combined = new Uint8Array([...ct, ...tag]);
        const decrypted = await this.crypto.decrypt(
            { name: "AES-GCM", iv },
            key,
            combined
        );
        return new TextDecoder().decode(decrypted);
    }

    // Generate secure seed using HMAC-SHA256
    static async generateSecureSeed(phrase, service, version) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(phrase),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            keyMaterial,
            enc.encode(`${service}:${version}`)
        );
        
        // Convert first 4 bytes to 32-bit seed
        const hashArray = new Uint8Array(signature);
        let seed = 0;
        for (let i = 0; i < 4; i++) {
            seed = (seed << 8) | hashArray[i];
        }
        return Math.abs(seed);
    }

    // Derive key for export using PBKDF2
    async deriveExportKey(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await this.crypto.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );
        
        return await this.crypto.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    toBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

    fromBase64(str) {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16));
    }
}

const cryptoUtils = new CryptoUtils();