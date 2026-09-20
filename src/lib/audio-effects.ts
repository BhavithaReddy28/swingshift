/**
 * Web Audio API synthesized sound generator for Digital Heroes Draw Reveal.
 * Zero external audio files required. Muted by default.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.soundEnabled = localStorage.getItem("dh_sound_enabled") === "true";
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("dh_sound_enabled", enabled ? "true" : "false");
    }
    if (enabled && !this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /**
   * Plays a pitch-modulated rising tick chime for ball lock-in.
   * index 0 to 4 produces ascending frequencies.
   */
  public playBallLockIn(index: number = 0) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 440 + index * 110; // A4, B4, C#5, D#5, F5
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio fallback swallow
    }
  }

  /**
   * Plays a celebratory synth arpeggio chord on win.
   */
  public playWinSting() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.65);
      });
    } catch {
      // Audio fallback swallow
    }
  }
}

export const soundEngine = new SoundEngine();
