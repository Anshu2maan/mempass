class DeterministicEngine {
    constructor(seed) {
        this.state = seed;
    }

    nextInt(max) {
        this.state = (this.state * 1103515245 + 12345) >>> 0;
        return this.state % max;
    }

    choice(arr) {
        return arr[this.nextInt(arr.length)];
    }

    shuffle(arr) {
        const res = [...arr];
        for (let i = res.length - 1; i > 0; i--) {
            const j = this.nextInt(i + 1);
            [res[i], res[j]] = [res[j], res[i]];
        }
        return res;
    }
}

class PasswordGenerator {
    static async generate(phrase, service, version, length) {
        // Use HMAC-SHA256 for seed generation
        const seed = await CryptoUtils.generateSecureSeed(phrase, service, version);
        const eng = new DeterministicEngine(seed);
        let password = "";

        // Ensure at least one of each character type
        ['lower', 'upper', 'digit', 'symbol'].forEach(type => {
            password += CHAR_SETS[type][eng.nextInt(CHAR_SETS[type].length)];
        });

        // Fill remaining length
        while (password.length < length) {
            const type = eng.choice(['lower', 'upper', 'digit', 'symbol']);
            password += CHAR_SETS[type][eng.nextInt(CHAR_SETS[type].length)];
        }

        // Shuffle and trim to exact length
        password = eng.shuffle(password.split('')).join('').slice(0, length);

        return password;
    }

    static estimateStrength(password) {
        if (!password) return { strength: 0, readableTime: "0" };
        
        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 20;
        
        if (charsetSize === 0) return { strength: 0, readableTime: "0" };
        
        const combinations = Math.pow(charsetSize, password.length);
        const guessesPerSecond = 1e9;
        const seconds = combinations / guessesPerSecond;
        const years = seconds / (365 * 24 * 3600);
        
        let strength;
        if (years > 1e9) strength = 100;
        else if (years > 1000) strength = 80;
        else if (years > 1) strength = 60;
        else strength = Math.min(Math.log10(years + 1) * 20, 40);
        
        return {
            strength: Math.round(strength),
            readableTime: this.formatTime(years)
        };
    }

    static formatTime(years) {
        if (years > 1e9) return "Longer than universe age";
        if (years > 1e6) return `${(years / 1e6).toFixed(1)}M years`;
        if (years > 1000) return `${(years / 1000).toFixed(1)}k years`;
        if (years > 1) return `${years.toFixed(1)} years`;
        if (years > 0.001) return `${(years * 365).toFixed(0)} days`;
        return `${(years * 365 * 24).toFixed(0)} hours`;
    }
}