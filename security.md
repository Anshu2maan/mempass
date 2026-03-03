# 🔒 Security Policy

## ✅ Supported Versions
Since MemPass is actively maintained, only the latest version receives security updates. 
Please always use the latest version from the releases page.

## 🔐 Encryption Standards
- **AES-256-GCM** for data encryption
- **Argon2id** for password hashing (memory-hard function)
- **PBKDF2** as fallback for legacy support
- **100% client-side encryption**, zero network calls

## 🛡️ Security Features
- **PIN Protection**: 5 failed attempts = 10 minute cooldown
- **Auto-lock**: Session expires after 5 minutes of inactivity
- **Rate limiting**: Progressive delays after failed attempts
- **Secure random**: CSPRNG for all cryptographic operations

## 📋 Data Storage
- **Local only**: Everything stored in browser's IndexedDB
- **No cloud sync**: Zero data leaves your device
- **No telemetry**: No tracking, analytics, or logging
- **Portable**: Export/import functionality for backups

## 🔄 Security Updates
- Critical security patches: 48 hours
- Regular updates: Monthly
- Security advisories published on GitHub Releases

## 🐛 Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, report them via:
1. 📧 Email: [anshumaannathchoudhary@gmail.com]
2. 🔒 GitHub Security Advisory: Use the \"Report a Vulnerability\" button

### What to include:
- Type of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You can expect:
- Acknowledgment within 24 hours
- Regular updates on progress
- Credit in release notes (if desired)

## 🏆 Hall of Fame
We believe in responsible disclosure and will acknowledge security researchers who help improve our security.


Last updated: 03-March-2026
