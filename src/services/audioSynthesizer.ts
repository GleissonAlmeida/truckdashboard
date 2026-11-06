/**
 * Web Audio API Synthesizer for Authentic Heavy Truck Sound Cues
 * Generates tactile relay clicks for turn signals and warning chimes for DTC faults.
 */

class TruckAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private volume = 0.35;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Authentic heavy truck electro-mechanical flasher relay click
   * @param isTock false for "tick", true for "tock"
   */
  public playRelayClick(isTock = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isTock ? 1200 : 1600, now);
      filter.Q.setValueAtTime(4.0, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isTock ? 240 : 380, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

      gain.gain.setValueAtTime(this.volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio playback silently ignored if blocked by browser policy
    }
  }

  /**
   * Commercial truck dashboard warning chime (Soft chime for Amber / Check Engine)
   */
  public playWarningChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5 note
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.35); // D5 note

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  /**
   * Critical red Stop Engine alert beep (Urgent double ping)
   */
  public playCriticalAlarm() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      const playBeep = (timeOffset: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now + timeOffset);

        gain.gain.setValueAtTime(this.volume * 0.3, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.13);
      };

      playBeep(0);
      playBeep(0.18);
    } catch {
      // Ignore
    }
  }
}

export const truckAudio = new TruckAudioEngine();
