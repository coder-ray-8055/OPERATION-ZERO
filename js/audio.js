
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.ambientGain = null;
        this.ambientOsc = null;
        this.ambientPlaying = false;

        const saved = localStorage.getItem('op_zero_audio_enabled');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('op_zero_audio_enabled', this.enabled);
        if (!this.enabled && this.ambientPlaying) {
            this.stopAmbient();
        } else if (this.enabled) {
            this.init();
            this.buttonClick();
        }
        return this.enabled;
    }

    keyClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.035);
    }

    buttonClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(now + 0.085);
    }

    folderOpen() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.2);
        filter.Q.value = 3;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }

    accessGranted() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; 
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.38);
        });
    }

    accessDenied() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(140, now);
        osc2.frequency.setValueAtTime(133, now); 

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.28);
        osc2.stop(now + 0.28);
    }

    keypadBeep(digit = 1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [697, 770, 852, 941, 1209, 1336, 1477];
        const f1 = freqs[digit % 4];
        const f2 = freqs[4 + (digit % 3)];

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.frequency.setValueAtTime(f1, now);
        osc2.frequency.setValueAtTime(f2, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.12);
        osc2.stop(now + 0.12);
    }

    doorUnlock() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        const clunk = this.ctx.createOscillator();
        const clunkGain = this.ctx.createGain();
        clunk.type = 'sawtooth';
        clunk.frequency.setValueAtTime(120, now);
        clunk.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        clunkGain.gain.setValueAtTime(0.2, now);
        clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        clunk.connect(clunkGain);
        clunkGain.connect(this.ctx.destination);
        clunk.start(now);
        clunk.stop(now + 0.42);

        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const hiss = this.ctx.createBufferSource();
        hiss.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(350, now + 0.8);

        const hissGain = this.ctx.createGain();
        hissGain.gain.setValueAtTime(0.001, now + 0.2);
        hissGain.gain.linearRampToValueAtTime(0.12, now + 0.35);
        hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        hiss.connect(filter);
        filter.connect(hissGain);
        hissGain.connect(this.ctx.destination);
        hiss.start(now + 0.2);
    }

    transmissionStatic() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        [1760, 2200, 1760].forEach((freq, idx) => {
            const blipTime = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(freq, blipTime);
            gain.gain.setValueAtTime(0.06, blipTime);
            gain.gain.exponentialRampToValueAtTime(0.001, blipTime + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(blipTime);
            osc.stop(blipTime + 0.055);
        });
    }

    missionComplete() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const chords = [
            { freqs: [440, 554.37, 659.25], time: 0 },       
            { freqs: [493.88, 622.25, 739.99], time: 0.22 },  
            { freqs: [523.25, 659.25, 783.99, 1046.50], time: 0.5 } 
        ];

        chords.forEach(chord => {
            const start = this.ctx.currentTime + chord.time;
            chord.freqs.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.08, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(start);
                osc.stop(start + 0.65);
            });
        });
    }
}

window.soundFX = new SoundFX();
