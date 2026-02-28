// onboarding.js - Simple, elegant onboarding tour for MemPass

const Onboarding = {
    steps: [
        {
            element: '.logo',
            title: 'Welcome to MemPass! 🔐',
            content: 'Your privacy-focused, offline-first digital vault. Let\'s show you how it works in 3 simple steps.',
            position: 'bottom'
        },
        {
            element: '#masterPhrase',
            title: '1. Master Phrase 🎯',
            content: 'This is the only thing you need to remember. Your passwords are generated mathematically from this phrase.',
            position: 'bottom'
        },
        {
            element: '#serviceName',
            title: '2. Service Name 🌐',
            content: 'Enter the website or service name (like "Gmail" or "Facebook") to generate a unique password for it.',
            position: 'bottom'
        },
        {
            element: '#generatePasswordBtn',
            title: '3. Generate & Save ✨',
            content: 'Click Generate to see your new password, then Save it to your secure, PIN-protected vault.',
            position: 'top'
        },
        {
            element: '#vaultSection',
            title: 'The Secure Vault 🔒',
            content: 'All your saved passwords and documents stay right here on your device, encrypted and safe.',
            position: 'top'
        }
    ],
    currentStep: 0,

    init() {
        const hasSeenTour = localStorage.getItem('mempass_tour_seen');
        if (!hasSeenTour) {
            setTimeout(() => this.showStep(0), 1500);
        }
    },

    showStep(index) {
        this.currentStep = index;
        const step = this.steps[index];
        const target = document.querySelector(step.element);
        if (!target) return;

        this.removeExisting();

        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        
        const tooltip = document.createElement('div');
        tooltip.className = `tour-tooltip tour-${step.position}`;
        
        tooltip.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.content}</p>
            <div class="tour-actions">
                <button class="tour-skip" onclick="Onboarding.skip()">Skip</button>
                <button class="tour-next" onclick="Onboarding.next()">
                    ${index === this.steps.length - 1 ? 'Finish' : 'Next'}
                </button>
            </div>
            <div class="tour-progress">${index + 1} of ${this.steps.length}</div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(tooltip);

        const rect = target.getBoundingClientRect();
        const scrollY = window.scrollY;

        if (step.position === 'bottom') {
            tooltip.style.top = `${rect.bottom + scrollY + 15}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltip.style.transform = 'translateX(-50%)';
        } else if (step.position === 'top') {
            tooltip.style.top = `${rect.top + scrollY - tooltip.offsetHeight - 15}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltip.style.transform = 'translateX(-50%)';
            // Adjust if height is not yet known
            setTimeout(() => {
                tooltip.style.top = `${rect.top + scrollY - tooltip.offsetHeight - 15}px`;
            }, 0);
        }

        target.classList.add('tour-highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.skip();
        }
    },

    skip() {
        this.removeExisting();
        localStorage.setItem('mempass_tour_seen', 'true');
    },

    removeExisting() {
        document.querySelectorAll('.tour-overlay, .tour-tooltip').forEach(el => el.remove());
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    }
};

window.Onboarding = Onboarding;
document.addEventListener('DOMContentLoaded', () => Onboarding.init());
