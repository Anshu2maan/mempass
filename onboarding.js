// onboarding.js - Improved UX version (Feb 2026)
// Goal: highlight + tooltip must appear together reliably

const Onboarding = {
    steps: [
        { element: '.logo',               title: 'Welcome to MemPass! 🔐',      content: 'Your 100% offline, privacy-first password & document vault.',                  position: 'bottom' },
        { element: '#masterPhrase',       title: 'Your Master Phrase 🎯',       content: 'This is the only secret you need to remember.',                                 position: 'bottom' },
        { element: '#serviceName',        title: 'Service / Website Name 🌐',   content: 'Type any service to get a unique password.',                                     position: 'bottom' },
        { element: '#passwordLength',     title: 'Customize Your Password',     content: 'Choose length (16 recommended) and version.',                                     position: 'right',  altElements: ['#version'] },
        { element: '#generatePasswordBtn',title: 'Generate Secure Password ✨', content: 'Click to generate. Copy or save.',                                               position: 'top'    },
        { element: '#savePasswordBtn',    title: 'Save to Vault 🔒',            content: 'Save passwords encrypted with your PIN.',                                        position: 'top'    },
        { element: '#unlockVaultBtn',     title: 'Unlock with PIN',             content: 'Set/enter 6-digit PIN to access vault.',                                         position: 'bottom', altElements: ['#setupPinBtn'] },
        { element: '#showDocumentsTab',   title: 'Document Vault 📁',           content: 'Store documents securely with expiry alerts.',                                   position: 'top'    },
        { element: '#themeToggleBtn',     title: 'Dark/Light Mode 🌓',          content: 'Toggle theme anytime.',                                                          position: 'left'   },
        { element: null,                  title: 'You\'re All Set! 🚀',         content: 'Start using MemPass securely!<br><br>Enjoy!',                                    position: 'centered', isFinal: true }
    ],

    currentStep: -1,
    overlay: null,
    tooltip: null,
    highlighted: null,

    init() {
        if (localStorage.getItem('mempass_tour_seen') === 'true') return;

        // Give DOM more time — especially on slower devices
        setTimeout(() => this.start(), 1800);
    },

    async start() {
        this.createOverlay();
        await this.showStep(0);
    },

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        document.body.appendChild(this.overlay);
    },

    async showStep(index) {
        if (index < 0 || index >= this.steps.length) return this.finish();

        this.currentStep = index;
        const step = this.steps[index];

        // 1. Clean previous state
        this.removeHighlight();
        this.removeTooltip();

        let target = null;

        // Support alternative selectors (especially useful for conditional elements)
        if (step.element) {
            target = document.querySelector(step.element);
            if (!target && step.altElements) {
                for (const alt of step.altElements) {
                    target = document.querySelector(alt);
                    if (target) break;
                }
            }
        }

        // If still no target and it's not the final centered step → skip
        if (!target && !step.isFinal) {
            console.warn(`Tour step ${index + 1} skipped — element not found: ${step.element}`);
            return this.showStep(index + 1);
        }

        // 2. Scroll to element (if exists)
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            // Give scroll & layout time
            await new Promise(r => setTimeout(r, 450));
        }

        // 3. Highlight (if target exists)
        if (target) {
            this.highlightElement(target);
        }

        // 4. Create & show tooltip
        this.createTooltip(step, index);

        // 5. Position it (after DOM has settled)
        await new Promise(r => setTimeout(r, 100));
        if (target) {
            this.positionTooltip(step, target);
        } else {
            this.positionCenteredTooltip();
        }

        // 6. Focus tooltip for keyboard accessibility
        this.tooltip?.focus();
    },

    highlightElement(target) {
        if (!target) return;
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
        this.tooltip.className = `tour-tooltip tour-${step.position || 'centered'}`;
        this.tooltip.setAttribute('role', 'dialog');
        this.tooltip.setAttribute('aria-labelledby', 'tour-title');
        this.tooltip.tabIndex = -1;

        const isLast = index === this.steps.length - 1;

        this.tooltip.innerHTML = `
            <div class="tour-header">
                <h3 id="tour-title">${step.title}</h3>
                <button class="tour-close" aria-label="Close tour">×</button>
            </div>
            <div class="tour-content">${step.content}</div>
            <div class="tour-footer">
                <div class="tour-progress">
                    ${this.steps.map((_, i) => `<span class="${i === index ? 'active' : ''}"></span>`).join('')}
                </div>
                <div class="tour-actions">
                    ${index > 0 ? '<button class="tour-btn tour-prev">Back</button>' : ''}
                    <button class="tour-btn ${isLast ? 'primary' : ''}" data-action="${isLast ? 'finish' : 'next'}">
                        ${isLast ? 'Finish' : 'Next'}
                    </button>
                    ${!isLast ? '<button class="tour-btn tour-skip">Skip</button>' : ''}
                </div>
            </div>
        `;

        document.body.appendChild(this.tooltip);

        // Event listeners
        this.tooltip.querySelector('.tour-close')?.addEventListener('click', () => this.finish());
        this.tooltip.querySelector('[data-action="next"]')?.addEventListener('click', () => this.next());
        this.tooltip.querySelector('.tour-prev')?.addEventListener('click', () => this.prev());
        this.tooltip.querySelector('.tour-skip')?.addEventListener('click', () => this.finish());

        // Keyboard support
        this.tooltip.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') this.next();
            if (e.key === 'Escape') this.finish();
            if (e.key === 'ArrowLeft' && index > 0) this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    },

    positionTooltip(step, target) {
        if (!target || !this.tooltip) return;

        try {
            const rect = target.getBoundingClientRect();
            const tooltipRect = this.tooltip.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let top, left, transform = '';

            switch (step.position) {
                case 'bottom':
                    top  = rect.bottom + 16;
                    left = rect.left + rect.width / 2;
                    transform = 'translateX(-50%)';
                    break;
                case 'top':
                    top  = rect.top - tooltipRect.height - 16;
                    left = rect.left + rect.width / 2;
                    transform = 'translateX(-50%)';
                    break;
                case 'right':
                    top  = rect.top + rect.height / 2;
                    left = rect.right + 16;
                    transform = 'translateY(-50%)';
                    break;
                case 'left':
                    top  = rect.top + rect.height / 2;
                    left = rect.left - tooltipRect.width - 16;
                    transform = 'translateY(-50%)';
                    break;
                default:
                    this.positionCenteredTooltip();
                    return;
            }

            this.tooltip.style.position = 'fixed';
            this.tooltip.style.top    = `${top}px`;
            this.tooltip.style.left   = `${left}px`;
            this.tooltip.style.transform = transform;

            // Final viewport clamping (very important on mobile)
            requestAnimationFrame(() => {
                if (!this.tooltip) return;
                const cr = this.tooltip.getBoundingClientRect();

                if (cr.left < 12) {
                    this.tooltip.style.left = '12px';
                    this.tooltip.style.transform = 'none';
                }
                if (cr.right > vw - 12) {
                    this.tooltip.style.left = `${vw - cr.width - 12}px`;
                    this.tooltip.style.transform = 'none';
                }
                if (cr.top < 12)    this.tooltip.style.top = '12px';
                if (cr.bottom > vh - 12) this.tooltip.style.top = `${vh - cr.height - 12}px`;
            });
        } catch (err) {
            console.warn('Tooltip positioning failed → falling back to center', err);
            this.positionCenteredTooltip();
        }
    },

    positionCenteredTooltip() {
        if (!this.tooltip) return;
        this.tooltip.style.position = 'fixed';
        this.tooltip.style.top      = '50%';
        this.tooltip.style.left     = '50%';
        this.tooltip.style.transform = 'translate(-50%, -50%)';
        this.tooltip.style.maxWidth  = '90vw';
        this.tooltip.style.maxHeight = '85vh';
        this.tooltip.style.overflowY = 'auto';
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
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        localStorage.setItem('mempass_tour_seen', 'true');
        Utils?.showToast?.('Tour completed! Enjoy MemPass 🔐', 3800);
    }
};

// Auto-start after DOM + critical scripts
window.Onboarding = Onboarding;
document.addEventListener('DOMContentLoaded', () => {
    Onboarding.init();
