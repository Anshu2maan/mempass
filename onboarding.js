// onboarding.js - Fully Updated, Crash-Proof, Mobile-Friendly Onboarding for MemPass
const Onboarding = {
    steps: [
        {
            element: '.logo',
            title: 'Welcome to MemPass! 🔐',
            content: 'Your 100% offline, privacy-first password & document vault. Everything stays on your device.',
            position: 'bottom',
            placement: 'centered' // special for logo
        },
        {
            element: '#masterPhrase',
            title: 'Your Master Phrase 🎯',
            content: 'This is the **only secret** you need to remember. All passwords are generated from it – no cloud, no recovery needed.',
            position: 'bottom'
        },
        {
            element: '#serviceName',
            title: 'Service / Website Name 🌐',
            content: 'Type any service (gmail, netflix, bank, etc.) to get a unique, strong password every time.',
            position: 'bottom'
        },
        {
            element: '#passwordLength, #version',
            title: 'Customize Your Password',
            content: 'Choose length (16 is strong & recommended) and version number for easy rotation when needed.',
            position: 'right'
        },
        {
            element: '#generatePasswordBtn',
            title: 'Generate Secure Password ✨',
            content: 'Click here → see your password instantly. Copy or save it to the vault.',
            position: 'top'
        },
        {
            element: '#savePasswordBtn',
            title: 'Save to Vault 🔒',
            content: 'Save passwords securely. They’ll be encrypted with your 6-digit PIN.',
            position: 'top'
        },
        {
            element: '#unlockVaultBtn, #setupPinBtn',
            title: 'Unlock with PIN',
            content: 'Set or enter your 6-digit PIN to access saved passwords & documents. Forgotten PIN? Use export backup.',
            position: 'bottom'
        },
        {
            element: '#showDocumentsTab',
            title: 'Document Vault 📁',
            content: 'Store Aadhaar, PAN, Passport, etc. Encrypted files, expiry alerts, search – all local.',
            position: 'top'
        },
        {
            element: '#themeToggleBtn',
            title: 'Dark/Light Mode 🌓',
            content: 'Toggle theme anytime. Your preference is saved.',
            position: 'left'
        },
        {
            element: null, // floating final step
            title: 'You\'re All Set! 🚀',
            content: 'Start generating & storing securely. Your data never leaves your device.<br><br>Enjoy MemPass!',
            position: 'centered',
            isFinal: true
        }
    ],

    currentStep: -1,
    overlay: null,
    tooltip: null,
    highlighted: null,

    init() {
        if (localStorage.getItem('mempass_tour_seen') === 'true') return;
        // Delay badha diya taaki sab elements load ho jayein (vault locked hone pe bhi crash na ho)
        setTimeout(() => this.start(), 3500); // 3.5 seconds wait
    },

    start() {
        this.createOverlay();
        this.showStep(0);
    },

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        document.body.appendChild(this.overlay);
    },

    showStep(index) {
        if (index < 0 || index >= this.steps.length) return this.finish();

        this.currentStep = index;
        const step = this.steps[index];

        this.removeHighlight();
        this.removeTooltip();

        if (step.element) {
            const target = document.querySelector(step.element);
            if (!target) {
                // Element nahi mila (jaise locked vault mein hidden tab) → auto skip
                console.warn(`Tour step skipped: Element not found → ${step.element}`);
                return this.next();
            }

            this.highlightElement(target);
            this.positionTooltip(step, target);
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Floating centered tooltip (last step)
            this.positionCenteredTooltip(step);
        }

        this.createTooltip(step, index);
    },

    highlightElement(target) {
        target.classList.add('tour-highlight');
        this.highlighted = target;
    },

    removeHighlight() {
        if (this.highlighted) {
            this.highlighted.classList.remove('tour-highlight');
            this.highlighted = null;
        }
    },

    createTooltip(step, index) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = `tour-tooltip tour-${step.position}`;
        this.tooltip.setAttribute('role', 'dialog');
        this.tooltip.setAttribute('aria-labelledby', 'tour-title');
        this.tooltip.setAttribute('tabindex', '-1');

        const isLast = index === this.steps.length - 1;

        this.tooltip.innerHTML = `
            <div class="tour-header">
                <h3 id="tour-title">${step.title}</h3>
                <button class="tour-close" aria-label="Close tour" onclick="Onboarding.finish()">×</button>
            </div>
            <div class="tour-content">${step.content}</div>
            <div class="tour-footer">
                <div class="tour-progress">
                    ${Array(this.steps.length).fill().map((_, i) =>
                        `<span class="${i === index ? 'active' : ''}"></span>`
                    ).join('')}
                </div>
                <div class="tour-actions">
                    ${index > 0 ? '<button class="tour-btn tour-prev" onclick="Onboarding.prev()">Previous</button>' : ''}
                    <button class="tour-btn tour-skip" onclick="Onboarding.finish()">Skip</button>
                    <button class="tour-btn tour-next primary" onclick="Onboarding.next()">
                        ${isLast || step.isFinal ? 'Get Started' : 'Next'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.tooltip);
        this.tooltip.focus();

        // Keyboard support
        this.tooltip.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.next();
            if (e.key === 'Escape') this.finish();
        });
    },

    positionTooltip(step, target) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top, left;

        switch (step.position) {
            case 'bottom':
                top = rect.bottom + scrollY + 16;
                left = rect.left + scrollX + (rect.width / 2);
                this.tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'top':
                top = rect.top + scrollY - tooltipRect.height - 16;
                left = rect.left + scrollX + (rect.width / 2);
                this.tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'right':
                top = rect.top + scrollY + (rect.height / 2);
                left = rect.right + scrollX + 16;
                this.tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'left':
                top = rect.top + scrollY + (rect.height / 2);
                left = rect.left + scrollX - tooltipRect.width - 16;
                this.tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'centered':
                top = (window.innerHeight - tooltipRect.height) / 2 + scrollY;
                left = (window.innerWidth - tooltipRect.width) / 2 + scrollX;
                this.tooltip.style.transform = 'none';
                break;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;

        // Overflow handling (mobile pe sahi rahe)
        requestAnimationFrame(() => {
            const currentRect = this.tooltip.getBoundingClientRect();
            if (currentRect.left < 10) this.tooltip.style.left = '10px';
            if (currentRect.right > window.innerWidth - 10) {
                this.tooltip.style.left = `${window.innerWidth - currentRect.width - 10}px`;
            }
            if (currentRect.bottom > window.innerHeight - 10) {
                // Agar bottom overflow ho to top pe shift kar do
                this.tooltip.style.top = `${window.innerHeight - currentRect.height - 10}px`;
            }
        });
    },

    positionCenteredTooltip(step) {
        this.tooltip.style.position = 'fixed';
        this.tooltip.style.top = '50%';
        this.tooltip.style.left = '50%';
        this.tooltip.style.transform = 'translate(-50%, -50%)';
        this.tooltip.style.maxWidth = '90%';
        this.tooltip.style.zIndex = '10001';
    },

    removeTooltip() {
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    },

    next() {
        this.showStep(this.currentStep + 1);
    },

    prev() {
        this.showStep(this.currentStep - 1);
    },

    finish() {
        this.removeHighlight();
        this.removeTooltip();
        if (this.overlay) this.overlay.remove();
        localStorage.setItem('mempass_tour_seen', 'true');

        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast('Welcome aboard! Let’s get secure 🔐', 4000);
        }
    }
};

// Global access
window.Onboarding = Onboarding;

// Start when DOM ready
document.addEventListener('DOMContentLoaded', () => Onboarding.init());
