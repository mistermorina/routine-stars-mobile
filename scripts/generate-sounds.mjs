// Synthesizes the app's feedback chimes as small mono WAV files.
// Run with: node scripts/generate-sounds.mjs
import { Buffer } from "node:buffer";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 22050;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "sounds");

// Soft bell voice: sine fundamental plus two decaying partials.
function bell(freq, t, duration) {
  const attack = Math.min(t / 0.005, 1);
  const decay = Math.exp((-5 * t) / duration);
  const fade = t > duration * 0.85 ? Math.max(0, 1 - (t - duration * 0.85) / (duration * 0.15)) : 1;
  const partials =
    Math.sin(2 * Math.PI * freq * t) +
    0.4 * Math.sin(2 * Math.PI * freq * 2.0 * t) * Math.exp((-8 * t) / duration) +
    0.15 * Math.sin(2 * Math.PI * freq * 3.0 * t) * Math.exp((-12 * t) / duration);
  return partials * attack * decay * fade;
}

// notes: [{ freq, start, duration, gain }]
function render(notes, totalDuration) {
  const length = Math.ceil(totalDuration * SAMPLE_RATE);
  const samples = new Float64Array(length);
  for (const note of notes) {
    const startIdx = Math.floor(note.start * SAMPLE_RATE);
    const noteLen = Math.ceil(note.duration * SAMPLE_RATE);
    for (let i = 0; i < noteLen && startIdx + i < length; i++) {
      const t = i / SAMPLE_RATE;
      samples[startIdx + i] += bell(note.freq, t, note.duration) * (note.gain ?? 1);
    }
  }
  // Normalize to roughly -3 dB so stacked notes never clip.
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const scale = peak > 0 ? 0.7 / peak : 1;
  return samples.map((s) => s * scale);
}

function toWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  }
  return buffer;
}

// Note frequencies (Hz)
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const A5 = 880.0;
const C6 = 1046.5;
const CS6 = 1108.73;
const E6 = 1318.51;
const A6 = 1760.0;

const sounds = {
  // Quick cheerful two-note pop: single task checked off.
  "task-complete.wav": render(
    [
      { freq: E5, start: 0, duration: 0.18, gain: 0.9 },
      { freq: A5, start: 0.07, duration: 0.28, gain: 1 },
    ],
    0.4
  ),
  // Rising major arpeggio fanfare: whole routine done.
  "routine-complete.wav": render(
    [
      { freq: C5, start: 0.0, duration: 0.5, gain: 0.85 },
      { freq: E5, start: 0.11, duration: 0.5, gain: 0.85 },
      { freq: G5, start: 0.22, duration: 0.55, gain: 0.9 },
      { freq: C6, start: 0.33, duration: 0.75, gain: 1 },
      { freq: E6, start: 0.44, duration: 0.6, gain: 0.5 },
    ],
    1.2
  ),
  // Sparkly shimmer: reward redeemed.
  "reward-redeemed.wav": render(
    [
      { freq: A5, start: 0.0, duration: 0.25, gain: 0.8 },
      { freq: CS6, start: 0.06, duration: 0.25, gain: 0.7 },
      { freq: E6, start: 0.12, duration: 0.35, gain: 0.9 },
      { freq: A6, start: 0.2, duration: 0.3, gain: 0.4 },
    ],
    0.55
  ),
  // Short bright triad: daily mission complete.
  "mission-complete.wav": render(
    [
      { freq: G5, start: 0.0, duration: 0.3, gain: 0.85 },
      { freq: C6, start: 0.1, duration: 0.45, gain: 1 },
    ],
    0.6
  ),
  // Magic chime up: sticker unlocked / milestone.
  "sticker-unlocked.wav": render(
    [
      { freq: C6, start: 0.0, duration: 0.22, gain: 0.7 },
      { freq: E6, start: 0.08, duration: 0.28, gain: 0.8 },
      { freq: A6, start: 0.16, duration: 0.42, gain: 0.9 },
    ],
    0.65
  ),
  // Two rising notes: streak grew.
  "streak-up.wav": render(
    [
      { freq: E5, start: 0.0, duration: 0.22, gain: 0.85 },
      { freq: C6, start: 0.12, duration: 0.38, gain: 1 },
    ],
    0.55
  ),
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  const wav = toWav(samples);
  writeFileSync(join(OUT_DIR, name), wav);
  console.log(`${name}: ${(wav.length / 1024).toFixed(1)} KB`);
}
