// onboarding.js - Fully Crash-Proof & Updated Version
const Onboarding = {
    steps: [
        { element: '.logo', title: 'Welcome to MemPass! 🔐', content: 'Your 100% offline, privacy-first password & document vault.', position: 'bottom', placement: 'centered' },
        { element: '#masterPhrase', title: 'Your Master Phrase 🎯', content: 'This is the only secret you need to remember.', position: 'bottom' },
        { element: '#serviceName', title: 'Service / Website Name 🌐', content: 'Type any service to get a unique password.', position: 'bottom' },
        { element: '#passwordLength, #version', title: 'Customize Your Password', content: 'Choose length (16 recommended) and version.', position: 'right' },
        { element: '#generatePasswordBtn', title: 'Generate Secure Password ✨', content: 'Click to generate. Copy or save.', position: 'top' },
        { element: '#savePasswordBtn', title: 'Save to Vault 🔒', content: 'Save passwords encrypted with your PIN.', position: 'top' },
        { element: '#unlockVaultBtn, #setupPinBtn', title: 'Unlock with PIN', content: 'Set/enter 6-digit PIN to access vault.', position: 'bottom' },
        { element: '#showDocumentsTab', title: 'Document Vault 📁', content: 'Store documents securely with expiry alerts.', position: 'top' },
        { element: '#themeToggleBtn', title: 'Dark/Light Mode 🌓', content: 'Toggle theme anytime.', position: 'left' },
        { element: null, title: 'You\'re All Set! 🚀', content: 'Start using MemPass securely!<br><br>Enjoy!', position: 'centered', isFinal: true }
    ],

    currentStep: -1,
    overlay: null,
    tooltip: null,
    highlighted: null,

    init() {
        if (localStorage.getItem('mempass_tour_seen') === 'true') return;
        // Zyada delay taaki locked vault elements bhi load ho sakein
        setTimeout(() => this.start(), 4500);
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
                console.warn(`Tour skipped step ${index + 1}: Element missing → ${step.element}`);
                return this.next(); // crash avoid – auto next
            }

            this.highlightElement(target);
            this.positionTooltip(step, target);
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
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
                <button class="tour-close" aria-label="Close" onclick="Onboarding.finish()">×</button>
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

        this.tooltip.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.next();
            if (e.key === 'Escape') this.finish();
        });
    },

        positionTooltip(step, target) {
        if (!target) return; // extra safety

        try {
            if (!target) return; // double-check

            const rect = target.getBoundingClientRect();
            let tooltipRect = this.tooltip.getBoundingClientRect(); // may be zero first time
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
                    top = rect.top + scrollY - (tooltipRect.height || 200) - 16;
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
                    left = rect.left + scrollX - (tooltipRect.width || 300) - 16;
                    this.tooltip.style.transform = 'translateY(-50%)';
                    break;
                case 'centered':
                    top = (window.innerHeight - (tooltipRect.height || 300)) / 2 + scrollY;
                    left = (window.innerWidth - (tooltipRect.width || 340)) / 2 + scrollX;
                    this.tooltip.style.transform = 'none';
                    break;
            }

            this.tooltip.style.top = `${top}px`;
            this.tooltip.style.left = `${left}px`;

            // Final adjustment after render
            requestAnimationFrame(() => {
                tooltipRect = this.tooltip.getBoundingClientRect();
                if (tooltipRect.left < 10) this.tooltip.style.left = '10px';
                if (tooltipRect.right > window.innerWidth - 10) {
                    this.tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
                }
            });
        } catch (error) {
            console.warn('Tour positioning failed:', error);
            this.positionCenteredTooltip(step); // Fallback to centered if error
        }
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

window.Onboarding = Onboarding;
document.addEventListener('DOMContentLoaded', () => Onboarding.init());
