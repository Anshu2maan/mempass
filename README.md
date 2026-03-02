# 🔐 MemPass - Your Personal Digital Vault

**Store Important Documents & Passwords Securely • 100% Offline • PIN Protected**

---

## 📋 **Table of Contents**
- [Overview](#-overview)
- [What is a Digital Vault?](#-what-is-a-digital-vault)
- [What You Can Store](#-what-you-can-store)
- [Core Features](#-core-features)
- [Document Vault](#-document-vault)
- [Password Vault](#-password-vault)
- [Password Generator](#-password-generator)
- [Security Architecture](#-security-architecture)
- [Technical Stack](#-technical-stack)
- [Browser Support](#-browser-support)
- [Installation](#-installation)
- [Quick Start Guide](#-quick-start-guide)
- [Document Types Reference](#-document-types-reference)
- [File Specifications](#-file-specifications)
- [Data Management](#-data-management)
- [Privacy Policy](#-privacy-policy)
- [Why MemPass is Different](#-why-mempass-is-different)
- [Who Should Use MemPass](#-who-should-use-mempass)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [License](#-license)

---

## 📌 **Overview**

MemPass is a privacy-first, offline digital vault that runs entirely in your browser. Just like a bank locker where you keep your valuables, MemPass is where you keep your digital valuables - all on your device, under your control.

**No cloud. No servers. No tracking. Just you and your data.**

---

## 🏦 **What is a Digital Vault?**

| Real World | Digital World |
|------------|---------------|
| Bank locker | 🔐 MemPass |
| Important papers | 📄 Digital documents |
| Jewellery | 🔑 Passwords (as valuable) |
| Will/agreements | 📝 Private notes |
| Family photos | 🖼️ Scanned memories |

Just as you wouldn't leave your locker keys with anyone else, MemPass ensures your digital valuables stay with you - encrypted, protected, and completely private.

---

## 📦 **What You Can Store**

| Category | Examples |
|----------|----------|
| **Government IDs** | Aadhar Card, PAN Card, Voter ID, Passport, Driving License |
| **Personal Documents** | Birth certificates, Marriage certificates, Educational documents, Property papers |
| **Passwords** | Email accounts, Social media, Banking, Shopping sites |
| **Private Notes** | PIN codes, WiFi passwords, Locker combinations, Reminders, Ideas |

**Everything in one place. Everything encrypted. Everything yours.**

---

## ✨ **Core Features**

### 🔐 **Security First**
| Feature | Details |
|---------|---------|
| **PIN Protection** | 6-digit PIN - easy to remember, hard to crack |
| **Military-grade Encryption** | AES-256-GCM (same standard used by banks) |
| **Advanced Key Derivation** | Argon2id - resistant to hacking attempts |
| **Auto-Lock** | Locks automatically when not in use |
| **Attempt Limiting** | 5 wrong tries = 10 minute lockout |
| **Zero Network** | No internet requests = complete privacy |

### 📁 **Document Vault**
| Feature | Details |
|---------|---------|
| **Indian Document Templates** | 6 built-in types with pre-filled fields |
| **File Support** | Images (JPEG, PNG) and PDF documents |
| **Expiry Tracking** | Get reminders for expiring documents |
| **File Previews** | View images and PDFs directly |
| **Search** | Find documents by title, type, or notes |
| **Favorites** | Star important documents |
| **Notes Field** | Add extra info to any document |

### 🔑 **Password Vault**
| Feature | Details |
|---------|---------|
| **Secure Storage** | All passwords encrypted |
| **Search & Sort** | Find passwords instantly |
| **Statistics** | Track total, recent, and duplicates |
| **Notes Field** | Add context to each password |

### ⚡ **Password Generator**
| Feature | Details |
|---------|---------|
| **Deterministic** | Same inputs = same password (never forget!) |
| **Customizable** | Length, version, character sets |
| **Strength Meter** | See how secure your password is |
| **Copy to Clipboard** | One-click copy |

---

## 📁 **Document Vault**

### Built-in Indian Document Types

| Document | Icon | Fields | Files |
|----------|------|--------|-------|
| **Aadhar Card** | 🆔 | Number, Name, DOB, Gender, Address | 2 max |
| **PAN Card** | 📄 | Number, Name, Father's Name, DOB | 1 max |
| **Voter ID** | 🗳️ | EPIC Number, Name, Father's Name, Address | 2 max |
| **Passport** | 🛂 | Number, Name, DOB, Issue/Expiry, Place | 2 max |
| **Driving License** | 🚗 | Number, Name, DOB, Issue/Expiry, Vehicle Class | 2 max |
| **Other Document** | 📁 | Number, Title, Issue/Expiry | 5 max |

### Document Fields by Type

| Document Type | Available Fields |
|--------------|------------------|
| **Aadhar Card** | Document Number, Full Name, Date of Birth, Gender, Address |
| **PAN Card** | PAN Number, Name, Father's Name, Date of Birth |
| **Voter ID** | EPIC Number, Name, Father's Name, Address |
| **Passport** | Passport Number, Name, Date of Birth, Issue Date, Expiry Date, Place of Issue |
| **Driving License** | License Number, Name, Date of Birth, Issue Date, Expiry Date, Vehicle Classes |
| **Other Document** | Document Number, Title, Issue Date, Expiry Date (optional) |

### Notes Field
Every document has a **notes field** separate from its metadata. Use it for:
- Reminders about the document
- Where you used it
- Any additional context

### Expiry Tracking
| Document | Expiry Tracking |
|----------|----------------|
| Passport | ✅ Yes (30-day warning) |
| Driving License | ✅ Yes (30-day warning) |
| Other Document | ✅ Yes (if expiry date filled) |
| Aadhar Card | ❌ No |
| PAN Card | ❌ No |
| Voter ID | ❌ No |

### Search Functionality
- Searches: document title, document type, notes, tags
- Find anything instantly as you type

### File Previews
- **Images:** Displayed directly in the app
- **PDFs:** View in browser or download
- **Other files:** Download option only

---

## 🔑 **Password Vault**

### What Gets Stored
For each password entry, you can save:
- **Service name** (e.g., "Gmail", "Facebook", "Bank of India")
- **Username/Email** (encrypted)
- **Password** (encrypted)
- **Notes** (encrypted, optional)

### Search & Sort
- **Search:** By service, username, or notes
- **Sort:** Newest, oldest, service name, most used

### Statistics
- **Total passwords** - How many you've saved
- **Recent** - Added in last 30 days
- **Duplicates** - Same service+username combinations

---

## 🔄 **Password Generator**

### How It Works
The generator creates passwords using HMAC-SHA256:

```
password = HMAC-SHA256(master phrase, service + ":" + version)
```

**What this means:**
- Same inputs always = same password
- Never need to remember complex passwords
- Change version number to rotate passwords

### Character Sets
```javascript
lowercase:  a b c d e f g h i j k l m n o p q r s t u v w x y z
uppercase:  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
digits:     0 1 2 3 4 5 6 7 8 9
symbols:    ! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : , . < > ?
```

Every password includes **at least one character from each set**.

### Password Strength

| Strength | Score | Cracking Time |
|----------|-------|---------------|
| 🔴 Weak | < 40% | Seconds to hours |
| 🟡 Medium | 40-70% | Days to years |
| 🟢 Strong | > 70% | Centuries to universe age |

---

## 🔒 **Security Architecture**

### PIN Protection
- **6-digit PIN** (numbers only)
- PIN is **never stored** - only the encryption key derived from it
- Each PIN attempt uses **Argon2id** with:
  - 4 iterations
  - 64 MB memory
  - 4 parallel threads

### Encryption (AES-256-GCM)
- **256-bit keys** (military grade)
- **12-byte random IV** per encryption
- **16-byte authentication tag** ensures data hasn't been tampered with

### Attempt Limiting
| Attempts | What Happens |
|----------|--------------|
| 1-4 | "Wrong PIN, X attempts left" |
| 5 | 🔒 Locked for 10 minutes |
| 6+ | Locked until timer expires |

Lockout survives browser restart.

### Auto-Lock
- After **5 minutes** of inactivity
- After **90 seconds** of no interaction
- Immediately when manually locked

### Queue System
All database operations run one after another to prevent conflicts:
- No race conditions
- No data corruption
- Smooth operation even with many items

### Network Isolation
**Zero network requests.** MemPass makes NO connections to any server:
- No analytics
- No telemetry
- No crash reporting
- No license checks
- No tracking of any kind

---

## 🛠️ **Technical Stack**

### Dependencies (Exactly Two)
```html
<!-- Argon2-browser - Password hashing (MIT License) -->
<script src="https://cdn.jsdelivr.net/npm/argon2-browser@1.18.0/dist/argon2-bundled.min.js"></script>

<!-- Dexie.js - IndexedDB wrapper (Apache 2.0) -->
<script src="https://unpkg.com/dexie@3.2.3/dist/dexie.js"></script>
```

### Browser APIs Used
| API | Purpose |
|-----|---------|
| Web Crypto API | Encryption, key derivation, HMAC |
| IndexedDB | Document and password storage |
| localStorage | Settings, PIN attempts, theme |
| FileReader API | Reading files for encryption |
| Service Worker | Offline caching (optional) |

### Built With
- **Pure HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, responsive design
- **Vanilla JavaScript** - No frameworks, just clean code

---

## 🌐 **Browser Support**

Based on actual API requirements:

| Browser | Minimum Version |
|---------|-----------------|
| **Google Chrome** | 55+ |
| **Mozilla Firefox** | 52+ |
| **Apple Safari** | 10.1+ |
| **Microsoft Edge** | 79+ (Chromium) |
| **Opera** | 42+ |
| **Samsung Internet** | 6+ |
| **iOS Safari** | 10.3+ |
| **Android WebView** | 55+ |

**Note:** Internet Explorer and original Edge (EdgeHTML) are not supported.

---

## 📦 **Installation**

### Option 1: Direct Download
```bash
# Download the latest release
# Extract ZIP file
# Open index.html in your browser
```

### Option 2: Git Clone
```bash
git clone https://github.com/anshu2maan/mempass.git
cd mempass
# Open index.html in your browser
# No build step required
```

### Option 3: GitHub Pages
```bash
# Fork the repository
# Enable GitHub Pages in Settings
# Access at: https://yourusername.github.io/mempass
```

### Option 4: Deploy Anywhere
```bash
# Upload all files to any static web server
# Works with Apache, Nginx, Netlify, Vercel
# No backend required
```

---

## 🏁 **Quick Start Guide**

### Step 1: Open MemPass
- Navigate to the app URL or open index.html
- Interactive tour starts automatically (first time only)

### Step 2: Set Your PIN
```
1. Go to "Vault" section
2. Click "Set PIN"
3. Enter 6-digit PIN (e.g., 123456)
4. Click "Unlock"
5. ✅ Vault is ready
```

**PIN Rules:**
- Exactly 6 digits
- Numbers only (0-9)
- No special characters

### Step 3: Add Your First Document
```
1. Enter PIN to unlock
2. Switch to "Documents" tab
3. Click "+ Add Document"
4. Select document type (Aadhar, PAN, etc.)
5. Fill in the fields
6. Add optional notes
7. Upload files (JPEG, PNG, or PDF)
8. Click "Save"
9. ✅ Document stored
```

### Step 4: Generate a Password
```
1. Enter master phrase (e.g., "my secret phrase")
2. Enter service name (e.g., "gmail")
3. Select length (16 recommended)
4. Click "Generate"
5. Copy password
6. ✅ Password ready
```

### Step 5: Save a Password (Optional)
```
1. Ensure vault is unlocked
2. After generating, click "Save"
3. Enter username
4. Add optional notes
5. ✅ Password saved
```

---

## 📑 **Document Types Reference**

### Aadhar Card
| Field | Type | Notes |
|-------|------|-------|
| Aadhar Number | text | 12 digits |
| Full Name | text | As on card |
| Date of Birth | date | - |
| Gender | select | Male/Female/Other |
| Address | textarea | Complete address |

**Limits:** 2 files, 5MB each, JPEG/PNG/PDF

---

### PAN Card
| Field | Type | Notes |
|-------|------|-------|
| PAN Number | text | Format: ABCDE1234F |
| Name | text | As on card |
| Father's Name | text | - |
| Date of Birth | date | - |

**Limits:** 1 file, 3MB, JPEG/PNG/PDF

---

### Voter ID
| Field | Type | Notes |
|-------|------|-------|
| EPIC Number | text | Voter ID number |
| Name | text | As on card |
| Father's Name | text | - |
| Address | textarea | As on card |

**Limits:** 2 files, 3MB each, JPEG/PNG/PDF

---

### Passport
| Field | Type | Notes |
|-------|------|-------|
| Passport Number | text | - |
| Name | text | As on passport |
| Date of Birth | date | - |
| Issue Date | date | - |
| Expiry Date | date | Triggers warning |
| Place of Issue | text | - |

**Limits:** 2 files, 4MB each, JPEG/PNG/PDF  
**Expiry alert:** 30 days before

---

### Driving License
| Field | Type | Notes |
|-------|------|-------|
| License Number | text | - |
| Name | text | As on license |
| Date of Birth | date | - |
| Issue Date | date | - |
| Expiry Date | date | Triggers warning |
| Vehicle Classes | text | e.g., LMV, MCWG |

**Limits:** 2 files, 3MB each, JPEG/PNG/PDF  
**Expiry alert:** 30 days before

---

### Other Document
| Field | Type | Notes |
|-------|------|-------|
| Document Number | text | Optional |
| Title | text | Document name |
| Issue Date | date | Optional |
| Expiry Date | date | Optional, triggers warning |

**Limits:** 5 files, 10MB each, Images/PDF  
**Expiry alert:** 30 days before (if date filled)

---

## 📊 **File Specifications**

### Supported Formats
| Format | Type | Preview |
|--------|------|---------|
| JPEG | image/jpeg | ✅ Full |
| PNG | image/png | ✅ Full |
| PDF | application/pdf | ✅ View/Download |

### Size Limits by Type
| Document Type | Per File | Total |
|--------------|----------|-------|
| Aadhar Card | 5 MB | 10 MB |
| PAN Card | 3 MB | 3 MB |
| Voter ID | 3 MB | 6 MB |
| Passport | 4 MB | 8 MB |
| Driving License | 3 MB | 6 MB |
| Other | 10 MB | 50 MB |

### Browser Storage Limits
| Browser | Typical Limit |
|---------|---------------|
| Chrome | Up to 60% of free disk space |
| Firefox | 50MB to 2GB (configurable) |
| Safari | 1GB to 2GB |
| Edge | Up to 60% of free disk space |

**Recommendation:** Keep total stored files under 100MB for best performance.

---

## 💾 **Data Management**

### Export Passwords
```
1. Unlock vault
2. Click "Export Vault"
3. Enter password (min 8 chars)
4. File downloads as "mempass-YYYY-MM-DD.json"
```

### Import Passwords
```
1. Unlock vault
2. Click "Import Vault"
3. Select exported .json file
4. Enter export password
5. ✅ Data imported (replaces existing)
```

### Export Documents
```
1. Unlock vault
2. Go to "Documents" tab
3. Click "Export Documents"
4. Enter password (min 8 chars)
5. File downloads as "documents-YYYY-MM-DD.json"
```

### Import Documents
```
1. Unlock vault
2. Go to "Documents" tab
3. Click "Import Documents"
4. Select exported .json file
5. Enter export password
6. ✅ Documents added to existing
```

### Reset Vault (Forgot PIN)
```
1. Click "Forgot PIN?" in PIN modal
2. Confirm reset (⚠️ ALL DATA DELETED)
3. Set new PIN
4. Restore from backup if available
```

---

## 🔏 **Privacy Policy**

### What We Store (Locally Only)
| Data | Where | Who Can Access |
|------|-------|----------------|
| Documents | IndexedDB | Only you (with PIN) |
| Passwords | IndexedDB | Only you (with PIN) |
| PIN salt | localStorage | Only you (with PIN) |
| Settings | localStorage | Only you |
| Theme preference | localStorage | Only you |

### What We NEVER Store
- ❌ Your master phrase
- ❌ Your PIN (only derived key exists temporarily)
- ❌ Decrypted documents
- ❌ Decrypted passwords
- ❌ Usage analytics
- ❌ Error logs
- ❌ IP addresses
- ❌ Device information
- ❌ Browser fingerprints

### Network Activity
**Zero.** MemPass makes NO connections to any server:
- No analytics
- No telemetry
- No crash reporting
- No license checks
- No auto-updates
- No tracking of any kind

---

## 🎯 **Why MemPass is Different**

| Aspect | Other Apps | MemPass |
|--------|------------|---------|
| **Document types** | Only 1-2 types | 6 Indian document templates |
| **Offline access** | Often need internet | 100% offline |
| **Encryption** | Server-side | Client-side, your key |
| **Password manager** | Separate app | Built-in |
| **PIN protection** | Often password only | 6-digit PIN + Argon2id |
| **Indian focus** | Generic | Built for India |
| **Network requests** | Many | Zero |
| **Price** | Freemium/Paid | Completely free |

**Bottom line:** MemPass isn't trying to compete with anyone. It's solving a different problem: *your personal digital vault, on your terms, built for your needs.*

---

## 👥 **Who Should Use MemPass**

### ✅ **Perfect For You If:**
- You want to store Aadhar/PAN/Passport securely
- You need documents accessible offline
- You want passwords + documents in one app
- You prefer PIN over complex passwords
- You care about privacy (no cloud)
- You want something that just works, for free

### ❌ **Not For You If:**
- You need cloud sync across devices
- You want official DigiLocker issued documents only
- You prefer biometric authentication only
- You need team/shared access
- You want a mobile app from app store (it's a PWA)

---

## 🔧 **Troubleshooting**

### Common Issues

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| "Vault must be unlocked" | Accessing without PIN | Enter PIN first |
| "PIN must be 6 digits" | Wrong format | Use exactly 6 numbers |
| "Locked for 10 minutes" | 5 failed attempts | Wait 10 minutes or reset |
| File too large | Exceeds limit | Check limits table |
| Wrong file type | Not JPEG/PNG/PDF | Convert format |
| "Decryption failed" | Wrong PIN/corrupt | Try correct PIN or restore |
| Documents not showing | Queue delay | Wait or refresh |
| Thumbnails not showing | Experimental | Icons shown as fallback |

### Debug Mode
Open browser console (F12) and run:
```javascript
debugVault()
```

Shows:
- Unlock status
- Key presence
- Password count
- Document count
- PIN attempts
- Lock status
- Last activity

---

## ❓ **FAQ**

### General Questions

**Q: Is MemPass really free?**
A: Yes, completely free. No paid tiers, no subscriptions.

**Q: Can I use it on multiple devices?**
A: Yes, through manual export/import. No cloud sync by design.

**Q: What if I clear browser data?**
A: All data lost. Always maintain encrypted backups!

**Q: Can I install it as an app?**
A: Yes, it's a PWA. On Chrome/Edge, click "Install" in address bar.

### Document Storage

**Q: Can I store Aadhar card?**
A: Yes, built-in template with all required fields.

**Q: What file formats are supported?**
A: JPEG, PNG images and PDF documents only.

**Q: How do expiry notifications work?**
A: Shows warning when viewing documents expiring within 30 days.

**Q: Can I add notes to documents?**
A: Yes, every document has a notes field.

**Q: Is there a storage limit?**
A: Only browser quota. No artificial limits.

### Password Management

**Q: What if I forget my master phrase?**
A: No recovery. Generate new passwords and update saved ones.

**Q: Are generated passwords random?**
A: Deterministic - same inputs = same password.

**Q: Can I store existing passwords?**
A: Yes, use "Save" button or edit entries.

**Q: Is there a password strength meter?**
A: Yes, with visual feedback and crack time estimate.

### Security

**Q: How is my PIN protected?**
A: PIN never stored. Argon2id derives key each time.

**Q: What if someone steals my device?**
A: They need PIN. 5 wrong attempts = 10 minute lockout.

**Q: Can MemPass see my data?**
A: No network requests = no data transmission. Complete privacy.

**Q: What encryption is used?**
A: AES-256-GCM (military grade).

### Technical

**Q: What browsers are supported?**
A: Chrome 55+, Firefox 52+, Safari 10.1+, Edge 79+.

**Q: Does it work without internet?**
A: 100%. No internet needed after first load.

**Q: Can I host it myself?**
A: Yes, all files are static. Deploy anywhere.

**Q: Is there a mobile app?**
A: It's a PWA - install on home screen from browser.

---

## 📄 **License**

**MIT License**

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

## 🙏 **Acknowledgements**

### Open Source Libraries
- **Argon2-browser** by Anton Danshin - MIT License
- **Dexie.js** by David Fahlander - Apache 2.0 License

### Inspiration
- The need for secure, private document storage for everyone
- Digital India initiative for promoting digital awareness
- LessPass for deterministic password generation concepts

---

## 📞 **Support**

- **GitHub Issues:** Report bugs and suggest improvements
- **Email:** support@mempass.local (placeholder)

---

## 📊 **Project Status**

| Version | Release Date | Status |
|---------|--------------|--------|
| 2.3 | March 2025 | Current |

---

## ⭐ **Support the Project**

If MemPass is useful to you:
- ⭐ Star the repository on GitHub
- 🐛 Report issues you find
- 🔁 Share with friends and family
- 📝 Suggest improvements

---

# 🔐 **MemPass - Your Digital Vault**

**Aadhar se Passport tak  
Password se Property papers tak  
Sab safe, sab secure, sab MemPass mein**

*100% Offline • 100% Free • 100% Private*

---
