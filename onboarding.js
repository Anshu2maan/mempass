// onboarding.js - Fully Crash-Proof & Updated Version (Fixed Feb 2025)
const Onboarding = {
    steps: [
        { element: '.logo', title: 'Welcome to MemPass! 🔐', content: 'Your 100% offline, privacy-first password & document vault.', position: 'bottom' },
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
        // Increased delay to ensure all UI elements (including conditional ones) are rendered
        setTimeout(() => this.start(), 6000);
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

        let target = null;

        if (step.element) {
            target = document.querySelector(step.element);
            if (!target) {
                console.warn(`Tour skipped step ${index + 1}: Element missing → ${step.element}`);
                return this.next(); // auto skip to avoid stuck tour
            }
            this.highlightElement(target);
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // 1. Pehle tooltip banao
        this.createTooltip(step, index);

        // 2. Phir position set karo (tooltip ab exist karta hai)
        if (target && this.tooltip) {
            this.positionTooltip(step, target);
        } else if (this.tooltip) {
            this.positionCenteredTooltip(step);
        } else {
            console.warn(`Cannot position step ${index + 1}: tooltip not created`);
        }
    },

    highlightElement(target) {
        if (target) {
            target.classList.add('tour-highlight');
            this.highlighted = target;
        }
    },

    removeHighlight() {
        if (this.highlighted) {
            this.highlighted.classList.remove('tour-highlight');
            this.highlighted = null;
        }
    },

    createTooltip(step, index) {
        this.tooltip = document.createElement('div');
        this.tooltip.className = `tour-tooltip tour-${step.position || 'centered'}`;
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

        this.tooltip.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.next();
            if (e.key === 'Escape') this.finish();
        });
    },

    positionTooltip(step, target) {
        if (!target || !this.tooltip) {
            console.warn('positionTooltip: missing target or tooltip');
            return;
        }

        try {
            const rect = target.getBoundingClientRect();
            let tooltipRect = this.tooltip.getBoundingClientRect();
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
                    top = rect.top + scrollY - (tooltipRect.height || 220) - 16;
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
                    left = rect.left + scrollX - (tooltipRect.width || 320) - 16;
                    this.tooltip.style.transform = 'translateY(-50%)';
                    break;
                case 'centered':
                    top = (window.innerHeight - (tooltipRect.height || 300)) / 2 + scrollY;
                    left = (window.innerWidth - (tooltipRect.width || 360)) / 2 + scrollX;
                    this.tooltip.style.transform = 'none';
                    break;
                default:
                    // fallback
                    this.positionCenteredTooltip(step);
                    return;
            }

            this.tooltip.style.position = 'absolute';
            this.tooltip.style.top = `${top}px`;
            this.tooltip.style.left = `${left}px`;

            // Adjust if out of viewport
            requestAnimationFrame(() => {
                if (!this.tooltip) return;
                tooltipRect = this.tooltip.getBoundingClientRect();
                if (tooltipRect.left < 10) this.tooltip.style.left = '10px';
                if (tooltipRect.right > window.innerWidth - 10) {
                    this.tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
                }
                if (tooltipRect.top < 10) this.tooltip.style.top = '10px';
            });
        } catch (error) {
            console.warn('Tour positioning failed:', error);
            if (this.tooltip) this.positionCenteredTooltip(step);
        }
    },

    positionCenteredTooltip(step) {
        if (!this.tooltip) {
            console.warn('positionCenteredTooltip: tooltip missing');
            return;
        }

        this.tooltip.style.position = 'fixed';
        this.tooltip.style.top = '50%';
        this.tooltip.style.left = '50%';
        this.tooltip.style.transform = 'translate(-50%, -50%)';
        this.tooltip.style.maxWidth = '90%';
        this.tooltip.style.maxHeight = '85vh';
        this.tooltip.style.overflowY = 'auto';
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
