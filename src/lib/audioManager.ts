class AudioManager {
    private context: AudioContext | null = null;

    init() {
        if (!this.context) {
            const Context = window.AudioContext || (window as any).webkitAudioContext;
            this.context = new Context();

            // Warm up with silence
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.start(0);
            osc.stop(0.001);
        }

        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    playAlarm() {
        if (!this.context) this.init();
        if (this.context!.state === 'suspended') {
            this.context!.resume();
        }

        const ctx = this.context!;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 1);
    }
}

export const audioManager = new AudioManager();
