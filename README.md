# 🔐 MemPass - Digital Vault & Password Generator

**Your Offline-First, Encrypted Password Manager and Document Vault**  
*100% Local Storage • PIN Protected • Military-Grade Encryption*

---

## 📋 Table of Contents
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Quick Start Guide](#-quick-start-guide)
- [Detailed Usage](#-detailed-usage)
- [Security Architecture](#-security-architecture)
- [Encryption Details](#-encryption-details)
- [Privacy Policy](#-privacy-policy)
- [Offline Capabilities](#-offline-capabilities)
- [Backup & Restore](#-backup--restore)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [File Upload Limits](#-file-upload-limits)
- [Document Types](#-document-types)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## ✨ Features

### 🔐 Password Management
- **Deterministic Password Generation** - Generate strong, unique passwords using your master phrase + service name
- **No Cloud Storage** - All data stays on your device (IndexedDB + LocalStorage)
- **PIN Protection** - 6-digit PIN with Argon2id key derivation
- **Auto-Lock** - Automatically locks after 5 minutes (90 seconds for inactivity)
- **Password Strength Meter** - Visual feedback with estimated cracking time
- **Search & Sort** - Find passwords quickly with live search
- **Favorites** - Mark important passwords
- **Version Control** - Password rotation with version numbers

### 📁 Document Vault
- **Encrypted Document Storage** - Store images, PDFs, and other files
- **Multiple Document Types** - Aadhar Card, PAN Card, Voter ID, Passport, Driving License, Other
- **Metadata Fields** - Type-specific fields (document numbers, dates, etc.)
- **File Previews** - View images and PDFs directly in the app
- **Expiry Notifications** - Get alerts for expiring documents
- **Thumbnail Generation** - Quick visual identification
- **Document Search** - Search by title, type, tags, or notes

### 🛡️ Security Features
- **Zero-Knowledge Architecture** - We never see your data
- **AES-256-GCM** - Industry-standard encryption
- **Argon2id** - Memory-hard key derivation
- **PBKDF2 for Export** - Additional layer for encrypted backups
- **No Network Requests** - All operations are local
- **PIN Attempt Limiting** - 5 attempts, then 10-minute lockout

### 🎨 User Experience
- **Dark/Light Mode** - Theme toggle with persistent preference
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Toast Notifications** - User-friendly feedback messages
- **Export/Import** - Encrypted backups with password protection

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, responsive design
- **Vanilla JavaScript** - No frameworks, lightweight (~150KB total)

### Libraries
- **[Argon2-browser](https://github.com/antelle/argon2-browser)** - Memory-hard key derivation (v1.18.0)
- **[Dexie.js](https://dexie.org/)** - IndexedDB wrapper (v3.2.3)
- **Web Crypto API** - Native browser cryptography

### Storage
- **IndexedDB** - Document and password storage (via Dexie)
- **LocalStorage** - Settings, PIN attempts, export timestamps

---

## 📦 Installation

### Option 1: Direct Download
1. Download the latest release from [GitHub Releases](https://github.com/yourusername/mempass/releases)
2. Extract the ZIP file
3. Open `index.html` in a modern browser

### Option 2: Clone Repository
```bash
git clone https://github.com/yourusername/mempass.git
cd mempass
# Open index.html in your browser
```

### Browser Requirements
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Web Crypto API support
- IndexedDB support
- Service Workers (optional, for offline)

---

## 🏁 Quick Start Guide

### 1. First Launch
Open MemPass in your browser. You'll see the password generator interface.

### 2. Set Up PIN (Required for Vault)
1. Click **"Set PIN"** button in the Vault section
2. Enter a **6-digit PIN** (e.g., `123456`)
3. ✅ PIN is now set - vault is ready!

### 3. Generate Your First Password
1. Enter a **Master Phrase** (e.g., `correct horse battery staple 42`)
2. Enter a **Service Name** (e.g., `gmail`, `facebook`)
3. Choose password length (12-24 recommended)
4. Click **"Generate"**
5. Copy the password with **"Copy to Clipboard"**

### 4. Save to Vault
1. Unlock vault with your PIN
2. Click **"Save"** button
3. Enter username and optional notes
4. ✅ Password saved to encrypted vault

### 5. Add a Document
1. Unlock vault
2. Switch to **"Documents"** tab
3. Click **"+ Add Document"**
4. Select document type (Aadhar, PAN, etc.)
5. Fill in fields and upload files
6. Click **"Save"**

---

## 📖 Detailed Usage

### Password Generator

#### Input Fields
| Field | Description | Example |
|-------|-------------|---------|
| **Master Phrase** | Your secret phrase (never share) | `correct horse battery staple 42` |
| **Service Name** | Website/app name | `gmail`, `facebook`, `amazon` |
| **Password Length** | 8-24 characters | 16 (recommended) |
| **Version** | Increment for password rotation | 1, 2, 3... |

#### Password Strength
- **Weak** (< 40%) - Easily crackable
- **Medium** (40-70%) - Good for low-security sites
- **Strong** (> 70%) - Suitable for banking, email

### Password Vault

#### Lock/Unlock
- **Auto-lock:** After 5 minutes of inactivity
- **PIN attempts:** 5 attempts, then 10-minute cooldown

#### Managing Passwords
- **View** - Click eye icon to reveal password
- **Copy** - Click clipboard icon
- **Edit** - Pencil icon to update
- **Delete** - Trash icon (confirmation required)
- **Search** - Live search by service, username, or notes
- **Sort** - Newest, oldest, service name, most used

#### Statistics
- **Total Passwords** - Count of saved entries
- **Last 30 Days** - Recently added passwords
- **Duplicates** - Same service/username combinations

### Document Vault

#### Document Features
- **Thumbnails** - Image files show previews
- **Expiry Alerts** - Documents expiring in 30 days show warnings
- **Favorites** - Star important documents
- **Search** - By title, type, tags, or notes
- **Filter** - By document type
- **Preview** - View images/PDFs in modal
- **Download** - Save original files

---

## 🔒 Security Architecture

### Key Derivation
- **Argon2id** parameters:
  - Time cost: 4 iterations
  - Memory: 64 MB
  - Parallelism: 4 threads
  - Output: 32 bytes (256 bits)

### Encryption
- **Algorithm:** AES-256-GCM
- **IV:** 12 bytes random per encryption
- **Authentication Tag:** 16 bytes
- **Key Storage:** Never stored - derived from PIN each time

### Password Generation
- **Seed Generation:** HMAC-SHA256(master phrase, service:version)
- **RNG:** Linear Congruential Generator
- **Character Sets:** lowercase, uppercase, digits, symbols
- **Guaranteed:** At least one character from each set

---

## 🔐 Encryption Details

### PIN-Based Encryption
1. User enters 6-digit PIN
2. Salt (16 bytes) retrieved from localStorage
3. Argon2id derives 256-bit key
4. Key used for AES-GCM encryption/decryption

### Document Encryption
1. Each file gets unique 12-byte IV
2. File encrypted with AES-GCM
3. Authentication tag (16 bytes) appended
4. IV, ciphertext, tag stored separately
5. Thumbnails generated for images

### Export Encryption
1. User provides export password
2. Random salt (16 bytes) generated
3. PBKDF2 with 100,000 iterations
4. AES-GCM encrypts the JSON export
5. Salt, IV, and ciphertext saved in export file

---

## 🕵️ Privacy Policy

### What We Store (Locally Only)
- Encrypted passwords (IndexedDB)
- Encrypted documents (IndexedDB)
- PIN salt (LocalStorage)
- Theme preference
- Export timestamp

### What We NEVER Store
- ❌ Master phrase
- ❌ PIN (only derived key exists temporarily)
- ❌ Decrypted passwords
- ❌ Decrypted documents
- ❌ Any personal information

### Data Transmission
- **Zero** network requests
- **No** analytics or tracking
- **No** cloud sync

---

## 📡 Offline Capabilities

### Progressive Web App
- **Service Worker** caches all assets
- **Works offline** after first visit
- **Installable** on mobile/desktop

### Storage Limits
- **IndexedDB:** Usually 50MB - 1GB
- **LocalStorage:** ~5-10MB
- **Recommendation:** Keep total files under 100MB

---

## 💾 Backup & Restore

### Export Vault
1. Unlock vault
2. Click **"Export Vault"**
3. Enter a strong password (min 8 characters)
4. File downloads as `mempass-YYYY-MM-DD.json`

### Import Vault
1. Unlock vault
2. Click **"Import Vault"** (⚠️ replaces current data)
3. Select exported JSON file
4. Enter export password
5. Data is re-encrypted with your current PIN

### Export Documents
1. Unlock vault, go to Documents tab
2. Click **"Export Documents"**
3. Enter export password
4. File downloads as `documents-YYYY-MM-DD.json`

### Import Documents
1. Unlock vault
2. Click **"Import Documents"** (adds to existing)
3. Select exported JSON file
4. Enter export password
5. Documents are re-encrypted with current PIN

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Vault must be unlocked" | Accessing vault without unlocking | Enter PIN to unlock first |
| "PIN must be 6 digits" | Non-numeric or wrong length | Use exactly 6 numbers |
| "Locked for 10 minutes" | 5 failed PIN attempts | Wait 10 minutes or reset vault |
| "File too large" | Exceeding document limits | Check limits table |
| "Decryption failed" | Wrong PIN or corrupted data | Try correct PIN or restore backup |
| "Database not initialized" | IndexedDB permission issue | Clear site data and reload |

### Reset Vault
If you forget your PIN:
1. Click **"Forgot PIN?"** in PIN modal
2. Confirm reset (⚠️ deletes all data)
3. Set new PIN
4. Restore from backup if available

---

## ❓ FAQ

### Q: Is MemPass really secure?
**A:** Yes! AES-256-GCM with Argon2id. All data stays on your device.

### Q: What if I forget my master phrase?
**A:** No recovery option - this is by design for security.

### Q: Can I use on multiple devices?
**A:** Manual export/import between devices.

### Q: What if I clear browser data?
**A:** All data will be lost. Always maintain encrypted backups!

### Q: Can I recover data if I forget my PIN?
**A:** No, unless you have an encrypted backup.

### Q: Is there a mobile app?
**A:** MemPass is a PWA - install on home screen.

### Q: What is the maximum file size?
**A:** 10MB for Other documents, 3-5MB for specific types.

---

## 📁 File Upload Limits

| Document Type | Max File Size | Allowed Formats |
|--------------|---------------|-----------------|
| Aadhar Card | 5 MB | JPEG, PNG, PDF |
| PAN Card | 3 MB | JPEG, PNG, PDF |
| Voter ID | 3 MB | JPEG, PNG, PDF |
| Passport | 4 MB | JPEG, PNG, PDF |
| Driving License | 3 MB | JPEG, PNG, PDF |
| Other | 10 MB | Images, PDF |

---

## 📄 Document Types

| Type | Icon | Fields | Max Files |
|------|------|--------|-----------|
| **Aadhar Card** | 🆔 | Number, Name, DOB, Gender, Address | 2 |
| **PAN Card** | 📄 | Number, Name, Father's Name, DOB | 1 |
| **Voter ID** | 🗳️ | EPIC Number, Name, Father's Name, Address | 2 |
| **Passport** | 🛂 | Number, Name, DOB, Issue/Expiry, Place | 2 |
| **Driving License** | 🚗 | Number, Name, DOB, Issue/Expiry, Vehicle Class | 2 |
| **Other** | 📁 | Number, Title, Issue/Expiry | 5 |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch
3. **Commit** changes
4. **Push** to branch
5. **Open** Pull Request

### Guidelines
- Maintain zero external dependencies
- Keep backward compatibility
- Add comments for complex logic
- Test in multiple browsers

---

## 📄 License

**MIT License** - See LICENSE file for details

```
Copyright (c) 2025 MemPass Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgements

### Libraries
- **[Argon2-browser](https://github.com/antelle/argon2-browser)** by Anton Danshin (MIT License)
- **[Dexie.js](https://dexie.org/)** by David Fahlander (Apache License 2.0)

### Inspiration
- LessPass - Deterministic password generator
- Bitwarden - Secure vault concepts
- 1Password - Document storage ideas

---

## 📞 Support

- **GitHub Issues:** [Report Bug](https://github.com/yourusername/mempass/issues)
- **Email:** support@mempass.local

---

## 📊 Project Status

**Current Version:** 2.3.0  
**Release Date:** March 2025

---

## ⭐ Support the Project

If you find MemPass useful:
- ⭐ Star the repository
- 🐛 Report issues
- 🔁 Share with friends

---

**Stay secure!** 🔐

---

*Made with ❤️ for privacy-conscious users*
