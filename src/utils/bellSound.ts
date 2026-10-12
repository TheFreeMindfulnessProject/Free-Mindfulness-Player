// Generates a gentle, rich Tibetan singing bowl chime using the Web Audio API.
// 100% synthesized in real time — zero bandwidth, zero external assets, completely free.

let audioCtx: AudioContext | null = null;

export function playMindfulBell() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Harmonic frequencies for a calming bronze singing bowl
    const fundamental = 392.0; // G4 note
    const harmonics = [
      { freq: fundamental * 1.0, gain: 0.35, decay: 4.5 },
      { freq: fundamental * 2.76, gain: 0.18, decay: 3.8 },
      { freq: fundamental * 5.4, gain: 0.08, decay: 2.2 },
      { freq: fundamental * 8.9, gain: 0.03, decay: 1.5 },
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle pitch micro-wobble for warm organic resonance
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + decay);

      // Strike and smooth exponential decay
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });
  } catch (err) {
    console.warn('Could not synthesize chime:', err);
  }
}
