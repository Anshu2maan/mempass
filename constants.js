// Constants and configuration
const CHAR_SETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digit: "0123456789",
    symbol: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

const COMMON_SERVICES = [
    'gmail', 'facebook', 'twitter', 'github', 'amazon',
    'netflix', 'instagram', 'linkedin', 'paypal', 'bank'
];

const STORAGE_KEYS = {
    vault: 'mempass_vault_v2',
    settings: 'mempass_settings_v2',
    documents: 'mempass_documents_v1',
    pinAttempts: 'mempass_pin_attempts',
    pinLockUntil: 'mempass_pin_lock_until',
    lastExport: 'mempass_last_export'
};

const PIN_LENGTH = 6;
const AUTO_LOCK_TIME = 5 * 60 * 1000; // 5 minutes
const INACTIVITY_LOCK_TIME = 90000; // 90 seconds
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MIN = 10; // Cooldown in minutes

const DOCUMENT_TYPES = {
    aadhar: {
        name: 'Aadhar Card',
        icon: '🆔',
        fields: ['documentNumber', 'name', 'dateOfBirth', 'gender', 'address'],
        fileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        maxFiles: 2,
        maxSize: 5 * 1024 * 1024,
        template: {
            documentNumber: { label: 'Aadhar Number', pattern: '\\d{4}\\s?\\d{4}\\s?\\d{4}' },
            name: { label: 'Full Name' },
            dateOfBirth: { label: 'Date of Birth', type: 'date' },
            gender: { label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
            address: { label: 'Address', type: 'textarea' }
        }
    },
    pan: {
        name: 'PAN Card',
        icon: '📄',
        fields: ['documentNumber', 'name', 'fatherName', 'dateOfBirth'],
        fileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        maxFiles: 1,
        maxSize: 3 * 1024 * 1024,
        template: {
            documentNumber: { label: 'PAN Number', pattern: '[A-Z]{5}[0-9]{4}[A-Z]' },
            name: { label: 'Name' },
            fatherName: { label: "Father's Name" },
            dateOfBirth: { label: 'Date of Birth', type: 'date' }
        }
    },
    voter: {
        name: 'Voter ID',
        icon: '🗳️',
        fields: ['documentNumber', 'name', 'fatherName', 'address'],
        fileTypes: ['image/jpeg', 'image/png','application/pdf'],
        maxFiles: 2,
        maxSize: 3 * 1024 * 1024,
        template: {
            documentNumber: { label: 'EPIC Number' },
            name: { label: 'Name' },
            fatherName: { label: "Father's Name" },
            address: { label: 'Address', type: 'textarea' }
        }
    },
    passport: {
        name: 'Passport',
        icon: '🛂',
        fields: ['documentNumber', 'name', 'dateOfBirth', 'issueDate', 'expiryDate', 'placeOfIssue'],
        fileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        maxFiles: 2,
        maxSize: 4 * 1024 * 1024,
        template: {
            documentNumber: { label: 'Passport Number' },
            name: { label: 'Name' },
            dateOfBirth: { label: 'Date of Birth', type: 'date' },
            issueDate: { label: 'Issue Date', type: 'date' },
            expiryDate: { label: 'Expiry Date', type: 'date' },
            placeOfIssue: { label: 'Place of Issue' }
        }
    },
    driving: {
        name: 'Driving License',
        icon: '🚗',
        fields: ['documentNumber', 'name', 'dateOfBirth', 'issueDate', 'expiryDate', 'vehicleClasses'],
        fileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        maxFiles: 2,
        maxSize: 3 * 1024 * 1024,
        template: {
            documentNumber: { label: 'License Number' },
            name: { label: 'Name' },
            dateOfBirth: { label: 'Date of Birth', type: 'date' },
            issueDate: { label: 'Issue Date', type: 'date' },
            expiryDate: { label: 'Expiry Date', type: 'date' },
            vehicleClasses: { label: 'Vehicle Classes', type: 'text', placeholder: 'e.g., LMV, MCWG' }
        }
    },
    other: {
        name: 'Other Document',
        icon: '📁',
        fields: ['documentNumber', 'name', 'issueDate', 'expiryDate'],
        fileTypes: ['image/*', 'application/pdf'],
        maxFiles: 5,
        maxSize: 10 * 1024 * 1024,
        template: {
            documentNumber: { label: 'Document Number' },
            name: { label: 'Document Title' },
            issueDate: { label: 'Issue Date', type: 'date' },
            expiryDate: { label: 'Expiry Date (if any)', type: 'date' }
        }
    }
};