/**
 * Web Audio API Sound Synthesizer for Photobooth
 * Generates countdown beeps and camera shutter sounds with zero external dependencies.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play countdown beep: pitch increases on final second
   */
  playBeep(isFinal: boolean = false) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const frequency = isFinal ? 1200 : 880;
      const duration = isFinal ? 0.25 : 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio might be muted or not allowed yet by user interaction
    }
  }

  /**
   * Play realistic camera shutter click
   */
  playShutter() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Click 1 (Mirror flip up)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(300, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.05);

      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Noise burst (Curtain movement)
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now + 0.03);
      filter.Q.setValueAtTime(3, now + 0.03);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now + 0.03);
      noise.stop(now + 0.12);

      // Click 2 (Curtain close)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(450, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(100, now + 0.14);

      gain2.gain.setValueAtTime(0.4, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.14);
    } catch {
      // Audio playback safety catch
    }
  }

  /**
   * Sound when adding a sticker
   */
  playPop() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundEffects();
