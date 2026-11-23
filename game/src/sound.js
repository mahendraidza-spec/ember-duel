// sound.js — tiny synthesised sound effects with WebAudio. No audio files:
// every blip is an oscillator, so the game stays fully offline and self
// contained. Safe to call before any user gesture (it just stays silent).

let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, dur, type = 'sine', gain = 0.08, when = 0) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, ctx.currentTime + when);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(ctx.currentTime + when);
    osc.stop(ctx.currentTime + when + dur);
  } catch (_e) {
    // Sound is garnish; a browser without WebAudio still plays fine.
  }
}

export const sfx = {
  deal() {
    tone(520, 0.09, 'triangle', 0.05);
  },
  play() {
    tone(660, 0.1, 'triangle', 0.07);
    tone(880, 0.12, 'triangle', 0.05, 0.06);
  },
  hit() {
    tone(180, 0.18, 'sawtooth', 0.09);
    tone(120, 0.2, 'square', 0.05, 0.02);
  },
  block() {
    tone(300, 0.12, 'sine', 0.08);
  },
  heal() {
    tone(523, 0.12, 'sine', 0.06);
    tone(784, 0.16, 'sine', 0.05, 0.08);
  },
  turn() {
    tone(440, 0.08, 'triangle', 0.05);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.07, i * 0.12));
  },
  lose() {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'sine', 0.07, i * 0.14));
  },
};
