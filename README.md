# 🔐 MemPass - India's Offline Digital Locker

**Store Aadhar, PAN, Passports & Passwords Securely • 100% Offline • PIN Protected**

---
![Tests](https://github.com/Anshu2maan/mempass/actions/workflows/ultimate-tests.yml/badge.svg)


## 📋 **Table of Contents**
- [Why MemPass Exists](#-why-mempass-exists)
- [What is a Digital Vault?](#-what-is-a-digital-vault)
- [What You Can Store](#-what-you-can-store)
- [Core Features](#-core-features)
- [Document Vault](#-document-vault)
- [Password Manager](#-password-manager)
- [Password Generator](#-password-generator)
- [Security Architecture](#-security-architecture)
- [Technical Stack](#-technical-stack)
- [Browser Support](#-browser-support)
- [Quick Start Guide](#-quick-start-guide)
- [Document Types Reference](#-document-types-reference)
- [File Specifications](#-file-specifications)
- [Data Management](#-data-management)
- [Privacy Policy](#-privacy-policy)
- [Roadmap](#-roadmap)
- [Vision](#-vision)
- [Who Should Use MemPass](#-who-should-use-mempass)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [License](#-license)
- [Join the Movement](#-join-the-movement)

---

## 🚀 **Why MemPass Exists**

India is rapidly digitizing. Every citizen now manages:

| Document | Where People Store It | Problem |
|----------|----------------------|---------|
| **Aadhar Card** | WhatsApp chats | ❌ Not secure, easily accessible to others |
| **PAN Card** | Google Drive | ❌ Cloud = not private, company can access |
| **Passport** | Phone gallery | ❌ No encryption, visible to anyone |
| **Bank passwords** | Notes app | ❌ No protection, device access = all passwords |
| **Exam certificates** | Email drafts | ❌ Scattered, hard to find when needed |
| **Voter ID** | Random folders | ❌ Lost when phone changes |

**The reality:** Most Indians:
- Use the same password everywhere
- Store sensitive documents in unsecured places
- Don't realize when data breaches happen
- Have no backup when phone is lost

**MemPass is built to fix this.**

> A private alternative to DigiLocker + Password Manager  
> 100% offline • 100% free • 100% under your control

---

## 🏦 **What is a Digital Vault?**

| Real World | Digital World |
|------------|---------------|
| Bank locker | 🔐 **MemPass** |
| Important papers | 📄 Digital documents |
| Jewellery | 🔑 Passwords (as valuable) |
| Will/agreements | 📝 Private notes |
| Family photos | 🖼️ Scanned memories |

Just as you wouldn't leave your locker keys with anyone else, MemPass ensures your digital valuables stay with you — encrypted, protected, and completely private.

---

## 📦 **What You Can Store**

| Category | Examples |
|----------|----------|
| **Government IDs** | Aadhar Card, PAN Card, Voter ID, Passport, Driving License |
| **Personal Documents** | Birth certificates, Marriage certificates, Educational documents, Property papers, Medical records |
| **Passwords** | Email accounts, Social media, Banking, Shopping sites, UPI apps, Government portals |
| **Private Notes** | PIN codes, WiFi passwords, Locker combinations, Security questions answers, Reminders, Ideas |

**Everything in one place. Everything encrypted. Everything yours.**

---

## ✨ **Core Features**

### ☁️ **Google Drive Auto Backup**
- Optional end‑to‑end encrypted backup stored in your own Google Drive account.
- Requires obtaining a Google OAuth client ID and placing it in `drive-sync.js`.
- Automatically syncs after changes (passwords/documents) and can restore new cloud backups on launch.

### 🔐 **Security First**
| Feature | Details |
|---------|---------|
| **PIN Protection** | 6-digit PIN - easy to remember, hard to crack |
| **Military Encryption** | AES-256-GCM (same standard used by banks) |
| **Key Derivation** | Argon2id - memory-hard algorithm resistant to hacking |
| **Auto-Lock** | Locks automatically after 5 minutes of inactivity |
| **Attempt Limiting** | 5 wrong tries = 10 minute lockout (survives browser restart) |
| **Zero Network** | No internet requests = complete privacy, no tracking |

> **Note for developers:** the Google Drive backup feature requires you to
> enable the **Google Drive API** for your Cloud project and register every
> origin used to open the app (e.g. `http://127.0.0.1:5500`,
> `http://localhost:5500`, or your production domain) as an *Authorized
> JavaScript origin* on the OAuth client.  Missing either will produce
> 403 "insufficientPermissions" or "redirect_uri_mismatch" errors.

### 📁 **Document Vault**
| Feature | Details |
|---------|---------|
| **Indian Templates** | 6 built-in types with pre-filled fields for Indian IDs |
| **File Support** | Images (JPEG, PNG) and PDF documents |
| **Expiry Tracking** | 30-day advance reminders for expiring documents |
| **File Previews** | View images and PDFs directly in the app |
| **Search** | Find documents by title, type, notes, or tags |
| **Favorites** | Star important documents for quick access |
| **Notes Field** | Add extra information to any document |

### 🔑 **Password Manager**
| Feature | Details |
|---------|---------|
| **Secure Storage** | All passwords encrypted with AES-256-GCM |
| **Search & Sort** | Find passwords instantly by service, username, or notes |
| **Statistics** | Track total passwords, recent additions, and duplicates |
| **Notes Field** | Add context to each password entry |
| **Access Tracking** | See when passwords were last viewed |

### ⚡ **Password Generator**
| Feature | Details |
|---------|---------|
| **Deterministic** | Same inputs always produce the same password (never forget!) |
| **Customizable** | Length (8-24), version number, character sets |
| **Character Sets** | Lowercase, Uppercase, Digits, Symbols (at least one from each) |
| **Strength Meter** | Visual feedback with estimated cracking time |
| **Copy to Clipboard** | One-click copy with fallback for older browsers |

---

## 📁 **Document Vault - Built for India**

### Indian Document Templates

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
- Any additional context or observations

### Expiry Tracking
| Document | Expiry Tracking |
|----------|----------------|
| **Passport** | ✅ Yes (30-day warning) |
| **Driving License** | ✅ Yes (30-day warning) |
| **Other Document** | ✅ Yes (if expiry date filled) |
| **Aadhar Card** | ❌ No (no expiry date field) |
| **PAN Card** | ❌ No (no expiry date field) |
| **Voter ID** | ❌ No (no expiry date field) |

### Search Functionality
- Searches: document title, document type, notes, tags
- Real-time filtering as you type
- Case-insensitive search

### File Previews
- **Images:** Displayed directly in the app with zoom support
- **PDFs:** View in browser (desktop) or open in native viewer (mobile)
- **Other files:** Download option only

### Thumbnails (Experimental)
- Basic thumbnail generation for image files
- Icons shown as fallback when thumbnails aren't available

---

## 🔑 **Password Manager**

### Data Structure
For each password entry, you can save:

| Field | Description | Encrypted? |
|-------|-------------|------------|
| **Service** | Website/app name (e.g., "Gmail", "Bank of India") | No (searchable) |
| **Username** | Your email or user ID | ✅ Yes |
| **Password** | The actual password | ✅ Yes |
| **Notes** | Additional context | ✅ Yes |
| **Created** | Date added | No |
| **Last Accessed** | When you last viewed it | No |
| **Favorite** | Starred or not | No |

### Search & Sort
- **Search:** By service name, username (decrypted), or notes (decrypted)
- **Sort options:** Newest first, oldest first, service name (A-Z), most used

### Statistics
| Statistic | What It Shows |
|-----------|---------------|
| **Total passwords** | How many you've saved |
| **Recent** | Added in last 30 days |
| **Duplicates** | Same service+username combinations (potential security risk) |

---

## 🔄 **Password Generator**

### How It Works
The generator creates passwords using HMAC-SHA256:

```
password = HMAC-SHA256(master phrase, service + ":" + version)
```

**What this means:**
- Same inputs always produce the same password
- You never need to store passwords (but you can)
- Change version number to rotate passwords without changing master phrase
- No randomness = no risk of weak random number generation

### Character Sets
```javascript
lowercase:  a b c d e f g h i j k l m n o p q r s t u v w x y z
uppercase:  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
digits:     0 1 2 3 4 5 6 7 8 9
symbols:    ! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : , . < > ?
```

Every password includes **at least one character from each set**.

### Generation Process
1. Generate seed from master phrase, service, and version
2. Add one character from each set (ensures variety)
3. Fill remaining length with random characters from all sets
4. Shuffle and trim to exact length

### Password Strength
| Strength | Score | Cracking Time (at 1 billion guesses/sec) |
|----------|-------|------------------------------------------|
| 🔴 **Weak** | < 40% | Seconds to hours |
| 🟡 **Medium** | 40-70% | Days to years |
| 🟢 **Strong** | > 70% | Centuries to universe age |

---

## 🔒 **Security Architecture**

### PIN to Key Derivation (Argon2id)
```javascript
// Parameters from crypto.js
const params = {
    time: 4,              // 4 iterations
    mem: 65536,           // 64 MB RAM
    parallelism: 4,       // 4 threads
    hashLen: 32,          // 256-bit key
    type: Argon2id        // Memory-hard algorithm
};
```

**Why Argon2id?** It's currently the most secure password hashing algorithm, resistant to:
- GPU brute-force attacks (memory-hard)
- ASIC attacks (requires custom hardware)
- Parallel cracking attempts

### Encryption (AES-256-GCM)
| Component | Details |
|-----------|---------|
| **Algorithm** | AES-256 in Galois/Counter Mode |
| **Key size** | 256 bits (military grade) |
| **IV size** | 12 bytes (random per encryption) |
| **Authentication tag** | 16 bytes (prevents tampering) |
| **Standard** | NIST recommended |

### File Encryption
Each file gets its own:
1. Unique 12-byte random IV
2. Encrypted with AES-256-GCM
3. 16-byte authentication tag appended
4. IV, ciphertext, and tag stored separately

This means even identical files have different encrypted versions.

### PIN Attempt Limiting
| Attempts | Consequence |
|----------|-------------|
| 1-4 | "Wrong PIN, X attempts left" message |
| 5 | 🔒 **Locked for 10 minutes** |
| 6+ | Locked until timer expires |

Lockout state survives browser restart (stored in localStorage).

### Auto-Lock Behavior
- **After 5 minutes** of total inactivity
- **After 90 seconds** of no interaction (mouse, keyboard, touch)
- **Immediately** when manually locking via UI
- Warning toast appears 1 minute before auto-lock

### Queue System
All database operations run sequentially to prevent race conditions:
```javascript
async _queueOperation(operation) {
    this.operationQueue = this.operationQueue.then(() => operation());
    return this.operationQueue;
}
```

This ensures:
- No data corruption during concurrent operations
- Smooth performance even with many items
- Predictable behavior

### Network Isolation
**Zero network requests.** MemPass makes NO connections to any server:
- No analytics
- No telemetry
- No crash reporting
- No license checks
- No auto-updates
- No tracking of any kind

**What this means:** Even if someone intercepts your network, they'll see nothing from MemPass.

---

## 🛠️ **Technical Stack**

### Dependencies (Exactly Two)
```html
<!-- Argon2-browser v1.18.0 - Password hashing (MIT License) -->
<script src="https://cdn.jsdelivr.net/npm/argon2-browser@1.18.0/dist/argon2-bundled.min.js"></script>

<!-- Dexie.js v3.2.3 - IndexedDB wrapper (Apache 2.0 License) -->
<script src="https://unpkg.com/dexie@3.2.3/dist/dexie.js"></script>
```

Both libraries are:
- Lightweight
- Actively maintained
- No additional network calls
- Open source with permissive licenses

### Built With
- **Pure HTML5** - Semantic markup for accessibility
- **CSS3** - Custom properties, animations, fully responsive design
- **Vanilla JavaScript** - No frameworks, just clean, maintainable code

### Browser APIs Used
| API | Purpose |
|-----|---------|
| **Web Crypto API** (`crypto.subtle`) | Encryption, key derivation, HMAC |
| **IndexedDB** | Document and password storage (via Dexie) |
| **localStorage** | Settings, PIN attempts, theme preference |
| **FileReader API** | Reading files for encryption |
| **Service Worker API** | Offline caching (optional PWA feature) |
| **Clipboard API** | Copy passwords to clipboard |

### File Structure
```
mempass/
├── index.html              # Main application
├── style.css               # All styles and themes
├── manifest.json           # PWA manifest for installability
├── sw.js                   # Service worker (basic caching)
├── constants.js            # Configuration & constants
├── crypto.js               # Web Crypto + Argon2 wrapper
├── utils.js                # Helper functions
├── password-generator.js   # Deterministic password generation
├── vault.js                # Password vault core
├── document-vault.js       # Document vault core
├── ui/                     # UI interaction modules (split for readability)
├── ui/globals.js           # shared state variables
├── ui/pin.js               # PIN modal & verification logic
├── ui/vault-ui.js          # lock/unlock and timer handlers
├── ui/password.js          # password generation/actions
├── ui/passwordVaultDisplay.js # display & manage saved passwords
├── ui/documents.js         # document vault UI logic
├── ui/preview.js           # file preview helpers
├── ui/exportImport.js      # export/import utilities
├── ui/misc.js              # assorted helpers
├── onboarding.js           # Interactive tour
└── main.js                 # Initialization
```

---

## 🌐 **Browser Support**

Based on actual API requirements (not guesses):

| Browser | Minimum Version | Why? |
|---------|-----------------|------|
| **Google Chrome** | 55+ | `async/await` support |
| **Mozilla Firefox** | 52+ | `async/await` support |
| **Apple Safari** | 10.1+ | `async/await` support |
| **Microsoft Edge** | 79+ | Chromium-based with proper Web Crypto |
| **Opera** | 42+ | Based on Chrome engine |
| **Samsung Internet** | 6+ | Based on Chrome |
| **iOS Safari** | 10.3+ | `async/await` support |
| **Android WebView** | 55+ | Based on Chrome |

### API Support Details

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| `async/await` | 55+ | 52+ | 10.1+ | 79+ |
| Web Crypto | 37+ | 34+ | 11+ | 79+ |
| IndexedDB | 24+ | 16+ | 10+ | 79+ |
| `Proxy` (Dexie) | 49+ | 18+ | 10+ | 79+ |
| `class` syntax | 42+ | 45+ | 9+ | 79+ |
| Arrow functions | 45+ | 22+ | 10+ | 79+ |

**Note:** Internet Explorer and original Edge (EdgeHTML) are **not supported** due to missing or buggy Web Crypto API.

---

## 🏁 **Quick Start Guide**

### Step 1: Open MemPass
- Navigate to the app URL or open `index.html`
- Interactive tour starts automatically (first time only)

### Step 2: Set Your PIN
```
1. Locate the "Vault" section
2. Click "Set PIN" button
3. Enter a 6-digit PIN (e.g., 123456)
4. Click "Unlock" or press Enter
5. ✅ Vault is now initialized
```

**PIN Requirements:**
- Exactly 6 digits
- Numbers only (0-9)
- No special characters, no letters

### Step 3: Add Your First Document
```
1. Enter your PIN to unlock the vault
2. Switch to "Documents" tab
3. Click "+ Add Document"
4. Select document type (Aadhar, PAN, etc.)
5. Fill in the fields
6. Add optional notes
7. Upload files (JPEG, PNG, or PDF)
8. Click "Save"
9. ✅ Document stored securely
```

### Step 4: Generate a Password
```
1. Enter a master phrase (e.g., "my secret phrase 123")
2. Enter a service name (e.g., "gmail")
3. Select password length (16 recommended)
4. Click "Generate"
5. Copy the password using the copy button
6. ✅ Password ready to use
```

### Step 5: Save a Password (Optional)
```
1. Ensure vault is unlocked
2. After generating, click "Save"
3. Enter username (e.g., "user@email.com")
4. Add optional notes
5. ✅ Password saved to vault
```

---

## 📑 **Document Types Reference**

### Aadhar Card
| Field | Type | Validation |
|-------|------|------------|
| Aadhar Number | text | 12 digits recommended |
| Full Name | text | As on card |
| Date of Birth | date | - |
| Gender | select | Male/Female/Other |
| Address | textarea | Complete address |

**Limits:** 2 files max, 5MB each, JPEG/PNG/PDF only

---

### PAN Card
| Field | Type | Validation |
|-------|------|------------|
| PAN Number | text | Format: ABCDE1234F |
| Name | text | As on card |
| Father's Name | text | - |
| Date of Birth | date | - |

**Limits:** 1 file max, 3MB, JPEG/PNG/PDF only

---

### Voter ID
| Field | Type | Validation |
|-------|------|------------|
| EPIC Number | text | Voter ID number |
| Name | text | As on card |
| Father's Name | text | - |
| Address | textarea | As on card |

**Limits:** 2 files max, 3MB each, JPEG/PNG/PDF only

---

### Passport
| Field | Type | Validation |
|-------|------|------------|
| Passport Number | text | - |
| Name | text | As on passport |
| Date of Birth | date | - |
| Issue Date | date | - |
| Expiry Date | date | Triggers expiry warning |
| Place of Issue | text | - |

**Limits:** 2 files max, 4MB each, JPEG/PNG/PDF only  
**Expiry alert:** 30 days before expiry

---

### Driving License
| Field | Type | Validation |
|-------|------|------------|
| License Number | text | - |
| Name | text | As on license |
| Date of Birth | date | - |
| Issue Date | date | - |
| Expiry Date | date | Triggers expiry warning |
| Vehicle Classes | text | e.g., LMV, MCWG |

**Limits:** 2 files max, 3MB each, JPEG/PNG/PDF only  
**Expiry alert:** 30 days before expiry

---

### Other Document
| Field | Type | Validation |
|-------|------|------------|
| Document Number | text | Optional |
| Title | text | Document name/title |
| Issue Date | date | Optional |
| Expiry Date | date | Optional, triggers warning if filled |

**Limits:** 5 files max, 10MB each, Images/PDF only  
**Expiry alert:** 30 days before expiry (if date filled)

---

## 📊 **File Specifications**

### Supported Formats
| Format | MIME Type | Preview Support |
|--------|-----------|-----------------|
| JPEG | image/jpeg | ✅ Full preview with zoom |
| PNG | image/png | ✅ Full preview with zoom |
| PDF | application/pdf | ✅ View in browser / Download |

**Note:** Other formats (DOCX, XLSX, etc.) are not supported by the FileReader API.

### Size Limits by Document Type
| Document Type | Per File Limit | Total Limit |
|--------------|----------------|-------------|
| Aadhar Card | 5 MB | 10 MB |
| PAN Card | 3 MB | 3 MB |
| Voter ID | 3 MB | 6 MB |
| Passport | 4 MB | 8 MB |
| Driving License | 3 MB | 6 MB |
| Other Document | 10 MB | 50 MB |

### Browser Storage Limits
Browser storage varies by browser and device:

| Browser | Typical Limit |
|---------|---------------|
| **Chrome** | Up to 60% of free disk space |
| **Firefox** | 50MB to 2GB (configurable) |
| **Safari** | 1GB to 2GB |
| **Edge** | Up to 60% of free disk space |

**Recommendation:** Keep total stored files under 100MB for optimal performance.

---

## 💾 **Data Management**

### Export Passwords
```
1. Unlock vault with PIN
2. Click "Export Vault" button
3. Enter a password (minimum 8 characters)
4. File downloads as "mempass-YYYY-MM-DD.json"
```

The export is encrypted with AES-256-GCM using PBKDF2 key derivation (100,000 iterations).

### Import Passwords
```
1. Unlock vault with PIN
2. Click "Import Vault" button
3. Select exported .json file
4. Enter the password used during export
5. Confirm replacement of existing data
```

**⚠️ Warning:** Importing replaces ALL existing passwords.

### Export Documents
```
1. Unlock vault with PIN
2. Switch to "Documents" tab
3. Click "Export Documents" button
4. Enter a password (minimum 8 characters)
5. File downloads as "documents-YYYY-MM-DD.json"
```

### Import Documents
```
1. Unlock vault with PIN
2. Switch to "Documents" tab
3. Click "Import Documents" button
4. Select exported .json file
5. Enter the password used during export
6. Documents are added to existing collection
```

**Note:** Document import **adds** to existing documents (does not replace).

### Reset Vault (Forgot PIN)
```
1. Click "Forgot PIN?" link in PIN modal
2. Confirm reset (⚠️ ALL DATA WILL BE DELETED)
3. Set new PIN
4. Restore from backup if available
```

### Check Storage Usage
```javascript
// Run in browser console
navigator.storage.estimate().then(estimate => {
    console.log(`Used: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Quota: ${(estimate.quota / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Usage: ${(estimate.usage/estimate.quota*100).toFixed(1)}%`);
});
```

---

## 🔏 **Privacy Policy**

### Data Storage Location
| Data Type | Storage Location | Accessibility |
|-----------|-----------------|---------------|
| **Documents** | IndexedDB | This device only |
| **Passwords** | IndexedDB | This device only |
| **PIN salt** | localStorage | This device only |
| **Settings** | localStorage | This device only |
| **PIN attempts** | localStorage | This device only |
| **Theme preference** | localStorage | This device only |
| **Export timestamp** | localStorage | This device only |

### What We NEVER Store
| Data Type | Why |
|-----------|-----|
| ❌ Master phrase | Never transmitted or stored |
| ❌ PIN | Only derived key exists temporarily in memory |
| ❌ Decrypted documents | Cleared when vault locks |
| ❌ Decrypted passwords | Cleared when vault locks |
| ❌ Usage analytics | No tracking code |
| ❌ Error logs | No remote logging |
| ❌ IP addresses | No server to receive them |
| ❌ Device information | No fingerprinting |
| ❌ Browser fingerprints | No tracking |

### Network Activity
**Zero network requests.** The application makes NO connections to any server:

| Type | Present? |
|------|----------|
| Telemetry | ❌ None |
| Analytics | ❌ None |
| Crash reporting | ❌ None |
| License checks | ❌ None |
| Auto-updates | ❌ None |
| CDN calls | ✅ Only for initial library load (optional) |
| Tracking scripts | ❌ None |

### Third-Party Libraries
Both dependencies are loaded from CDNs but make no additional network calls:

1. **Argon2-browser** - Password hashing (MIT License)
2. **Dexie.js** - IndexedDB wrapper (Apache 2.0)

---

## 🛤️ **Roadmap**

### Phase 1 – Core Stability (Current)
| Status | Feature |
|--------|---------|
| ✅ | Document templates for Indian IDs |
| ✅ | Password generator + vault |
| ✅ | PIN protection with Argon2id |
| ✅ | Export/Import functionality |
| ✅ | Interactive onboarding tour |
| 🔄 | Improve thumbnail display |
| 🔄 | Fix version field storage in vault |

### Phase 2 – Trust & Transparency (Next 3 Months)
| Priority | Feature |
|----------|---------|
| 🔜 | Publish complete threat model |
| 🔜 | Add security documentation |
| 🔜 | Invite external security review |
| 🔜 | Improve backup system with auto-reminder |
| 🔜 | Add export encryption password strength meter |

### Phase 3 – Growth (6+ Months)
| Goal | Approach |
|------|----------|
| 📚 | Educational content on digital safety |
| 🏫 | Campus adoption campaigns (engineering colleges) |
| 🇮🇳 | Hindi-first landing page |
| 📱 | Lightweight Android wrapper (WebView) |
| 🤝 | Partnerships with cybersecurity awareness programs |

---

## 🧠 **Vision**

MemPass is not trying to compete with global password managers like LastPass or 1Password.

**It's trying to do something different:**

| Goal | Why It Matters |
|------|----------------|
| **Raise digital hygiene in India** | Most Indians don't use any password manager |
| **Make encryption normal** | Security should be accessible to everyone, not just tech-savvy users |
| **Give users ownership of data** | No cloud = no surveillance, no data mining |
| **Build trust through transparency** | Open source + auditable = verifiable security |
| **Preserve digital memories** | Important documents shouldn't be scattered across WhatsApp and email |

**The mission:** If even 10,000 Indians stop reusing passwords and start securing their documents because of this tool — the mission succeeds.

### Long-Term Vision
Privacy shouldn't be premium. It should be default.

MemPass aims to become:
> **India's most trusted offline personal digital locker.**

Not by competing, but by serving a different need:
- Built for Indian document types
- Works entirely offline
- Free forever
- No corporate interests

---

## 👥 **Who Should Use MemPass**

### ✅ **Perfect For You If:**

| User Type | Why MemPass Works |
|-----------|-------------------|
| **Students** | Store Aadhar, PAN, marksheets, exam certificates in one place |
| **Job seekers** | Keep resume, ID proofs, educational docs ready for applications |
| **Working professionals** | Manage work logins, store salary slips, tax documents |
| **Government job aspirants** | Store all required documents for form filling |
| **Senior citizens** | Simple PIN-based access to important documents |
| **Travelers** | Keep passport, visa, tickets encrypted and accessible offline |
| **Small business owners** | Store GST documents, business registrations, vendor passwords |
| **Privacy-conscious users** | Complete control, no cloud, no tracking |

### ❌ **Not For You If:**

| User Type | Better Alternative |
|-----------|-------------------|
| Need cloud sync across multiple devices | Use other tools (with sync) |
| Want official DigiLocker issued documents only | Use DigiLocker |
| Prefer biometric authentication only | Use phone's built-in secure folder |
| Need team/shared access | Use enterprise password managers |
| Want native mobile app from app store | Use other tools |
| Can't manage manual backups | Use cloud-based solutions |

---

## 🔧 **Troubleshooting**

### Common Issues and Solutions

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| "Vault must be unlocked" | Accessing vault without PIN | Enter PIN first |
| "PIN must be 6 digits" | Non-numeric or wrong length | Use exactly 6 numbers |
| "Locked for 10 minutes" | 5 failed PIN attempts | Wait 10 minutes or reset vault |
| File won't upload | Exceeds size limit | Check limits table |
| File type not allowed | Not JPEG/PNG/PDF | Convert to supported format |
| "Decryption failed" | Wrong PIN or corrupted data | Try correct PIN or restore backup |
| Documents not showing | Queue delay | Wait a moment or refresh |
| Thumbnails not showing | Experimental feature | Icons shown as fallback |
| Export fails | Memory limit | Export fewer items at once |
| Import fails | Wrong password | Try correct export password |

### Debug Mode
Open browser console (F12) and run:

```javascript
debugVault()
```

Output shows:
- Vault unlock status
- Encryption key presence
- Password count
- Document count
- PIN attempts remaining
- Lock status (if locked)
- Last activity time

### Clear All Data (Manual Reset)
If you need to completely reset the application:

```
Method 1: Through UI
- Click "Forgot PIN?" and confirm reset

Method 2: Manual (if UI inaccessible)
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear IndexedDB → MemPassVault, MemPassDocs
4. Clear localStorage
5. Reload page
```

---

## ❓ **FAQ**

### General Questions

**Q: Is MemPass really free?**  
A: Yes, completely free. No paid tiers, no subscriptions, no hidden costs. Forever.

**Q: Can I use it on multiple devices?**  
A: Yes, through manual export/import. There is no cloud sync by design for privacy.

**Q: What happens if I clear browser data?**  
A: All stored data will be lost. Always maintain encrypted backups!

**Q: Can I install it as an app?**  
A: Yes, MemPass is a Progressive Web App (PWA). On Chrome/Edge, click "Install" in address bar. On Safari, use "Add to Home Screen".

**Q: Is there a mobile app on Play Store?**  
A: Not yet. It's a PWA that works on mobile browsers. Android wrapper is planned for future.

### Document Storage

**Q: Can I store Aadhar card?**  
A: Yes, there's a built-in template with all required fields.

**Q: What file formats are supported?**  
A: JPEG, PNG images and PDF documents only.

**Q: How do expiry notifications work?**  
A: Documents with expiry dates (Passport, Driving License, Other) show a warning when viewed within 30 days of expiry.

**Q: Can I add notes to documents?**  
A: Yes, every document has a notes field separate from its metadata.

**Q: Is there a limit on how many documents I can store?**  
A: Only by browser storage quota. No artificial limits.

**Q: Can I organize documents in folders?**  
A: Currently no folder system, but you can use tags and search.

### Password Management

**Q: What if I forget my master phrase?**  
A: No recovery possible. Generate new passwords and update saved ones.

**Q: Are generated passwords truly random?**  
A: They are deterministic based on HMAC-SHA256. Same inputs always produce same output.

**Q: Can I store existing passwords?**  
A: Yes, use the "Save" button after generation or edit existing entries.

**Q: Is there a password strength meter?**  
A: Yes, with visual feedback and estimated cracking time.

**Q: Why is version always 1 in saved passwords?**  
A: This is a known limitation. Version affects generation but isn't currently saved. Will be fixed in future update.

### Security

**Q: How is my PIN protected?**  
A: PIN is never stored. Argon2id derives an encryption key each time using 64MB memory and 4 iterations.

**Q: What if someone steals my device?**  
A: They need your PIN. 5 failed attempts trigger a 10-minute lockout. All data is encrypted.

**Q: Can MemPass developers see my data?**  
A: No. Zero network requests means no data transmission. Complete privacy.

**Q: Is Argon2id better than PBKDF2?**  
A: Yes. Argon2id is memory-hard, making it resistant to GPU and ASIC brute force attacks.

**Q: What encryption algorithm is used?**  
A: AES-256-GCM (Galois/Counter Mode) which provides both confidentiality and authentication.

**Q: Has MemPass been audited?**  
A: Not yet. Strong cryptography is used, but no formal third-party audit has been conducted. Do not use for mission-critical data until independent validation.

### Technical Questions

**Q: What browsers are supported?**  
A: Chrome 55+, Firefox 52+, Safari 10.1+, Edge 79+ (Chromium), and modern mobile browsers.

**Q: How much storage is available?**  
A: Browser dependent, typically 50MB to 1GB. Check with `navigator.storage.estimate()`.

**Q: Does it work without internet?**  
A: 100%. No internet required after the first page load.

**Q: Can I host it on my own server?**  
A: Yes. All files are static. Deploy to any web server.

**Q: Is the code open source?**  
A: Yes, under MIT License. You can inspect everything.

**Q: Can I contribute?**  
A: Absolutely! Security researchers, developers, and privacy advocates are welcome.

---

## ⚠️ **Security Disclaimer**

MemPass uses strong cryptographic standards:

- ✅ AES-256-GCM for encryption
- ✅ Argon2id for key derivation
- ✅ HMAC-SHA256 for password generation
- ✅ Client-side only operations

**However:** No formal third-party security audit has been conducted yet.

Do not use for mission-critical data until independent security validation is completed.

If you're a security researcher:
- Please review the code
- Report issues responsibly
- Help make MemPass more secure

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

**What this means:**
- ✅ Use it for free, forever
- ✅ Modify it, customize it
- ✅ Share it with others
- ✅ Include in your own projects
- ❌ No warranty provided

---

## 🙏 **Acknowledgements**

### Open Source Libraries
| Library | Author | License |
|---------|--------|---------|
| **Argon2-browser** | Anton Danshin | MIT License |
| **Dexie.js** | David Fahlander | Apache 2.0 License |

### Inspiration
- **LessPass** for deterministic password generation concepts
- **Digital India initiative** for promoting digital awareness
- The need for secure, private document storage for everyone

### Contributors
Thanks to everyone who has reported issues, suggested improvements, or contributed code.

---

## 📢 **Join the Movement**

Privacy shouldn't be premium. It should be default.

If MemPass helps even one person secure their digital life — it's worth it.

### How You Can Help

| Action | Impact |
|--------|--------|
| ⭐ **Star on GitHub** | Helps others discover the project |
| 🐛 **Report issues** | Makes the project more stable |
| 🔁 **Share with friends** | Spreads digital hygiene awareness |
| 📝 **Suggest improvements** | Shapes the future direction |
| 🌐 **Translate** | Help with Hindi/regional languages |
| 🔍 **Security review** | Makes it safer for everyone |

### Connect
- **GitHub:** [github.com/yourusername/mempass](https://github.com/anshu2maan/mempass)
- **Issues:** Report bugs and feature requests
- **Email:** support@mempass.local (placeholder)

---

## 📊 **Project Status**

| Version | Release Date | Status |
|---------|--------------|--------|
| 2.3 | March 2025 | Current Stable |

### Stats
- 📦 150KB total size
- 🔒 100% offline
- 🆓 100% free
- 🌍 Works everywhere

---

# 🔐 **MemPass - India's Offline Digital Locker**

**Aadhar se Passport tak • Password se Property papers tak  
Sab safe, sab secure, sab MemPass mein**

| Hindi | English |
|-------|---------|
| आधार से पासपोर्ट तक | From Aadhar to Passport |
| पासवर्ड से प्रॉपर्टी पेपर्स तक | From passwords to property papers |
| सब सुरक्षित | Everything secure |
| सब MemPass में | Everything in MemPass |

---

*100% Offline • 100% Free • 100% Private*

**Your Digital Vault. Your Data. Your Privacy.**
