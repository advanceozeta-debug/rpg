// 효과음과 배경음 (WebAudio로 직접 합성)
let ctx = null, master, bgmBus, sfxBus, noiseBuf;
let vol = { bgm: .5, sfx: .8 };
let track = null, step = 0, nextT = 0, timer = null;

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; return; }
  master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
  bgmBus = ctx.createGain(); bgmBus.connect(master);
  sfxBus = ctx.createGain(); sfxBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  setVolumes(vol.bgm, vol.sfx);
  if (track) startLoop();
}
export function setVolumes(b, s) {
  vol = { bgm: b, sfx: s };
  if (!ctx) return;
  bgmBus.gain.value = b * b * .5;
  sfxBus.gain.value = s * s * .9;
}

function tone(type, f0, f1, dur, g = .3, when = 0, bus = sfxBus) {
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator(), a = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(a); a.connect(bus); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, g = .3, freq = 2000, type = 'highpass', when = 0, bus = sfxBus) {
  const t = ctx.currentTime + when;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const a = ctx.createGain(); a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.001, t + dur);
  s.connect(f); f.connect(a); a.connect(bus); s.start(t); s.stop(t + dur + .02);
}
let last = {};
export function sfx(name) {
  if (!ctx || vol.sfx <= 0) return;
  const now = ctx.currentTime;
  if (last[name] && now - last[name] < .03) return;
  last[name] = now;
  switch (name) {
    case 'swing': noise(.09, .18, 3000); break;
    case 'heavy': noise(.16, .25, 1200, 'bandpass'); tone('sine', 140, 60, .15, .2); break;
    case 'hit': tone('square', 380, 120, .07, .12); noise(.05, .2, 1500); break;
    case 'crit': tone('square', 760, 200, .1, .14); noise(.08, .25, 2500); break;
    case 'jump': tone('sine', 300, 620, .1, .12); break;
    case 'dash': noise(.14, .2, 900, 'bandpass'); break;
    case 'skill': tone('triangle', 520, 1040, .18, .16); tone('triangle', 780, 1560, .18, .1, .05); break;
    case 'boom': tone('sine', 120, 40, .4, .35); noise(.35, .3, 600, 'lowpass'); break;
    case 'zap': tone('sawtooth', 1200, 300, .12, .12); noise(.1, .15, 4000); break;
    case 'shoot': tone('triangle', 900, 500, .06, .1); break;
    case 'hurt': tone('sawtooth', 300, 90, .2, .18); break;
    case 'coin': tone('square', 1320, 1320, .05, .07); tone('square', 1760, 1760, .08, .07, .05); break;
    case 'heal': [660, 880, 1100].forEach((f, i) => tone('sine', f, f, .2, .1, i * .06)); break;
    case 'tag': tone('triangle', 440, 880, .12, .15); noise(.12, .2, 2500); break;
    case 'ui': tone('square', 880, 880, .03, .05); break;
    case 'ok': tone('square', 660, 660, .05, .07); tone('square', 990, 990, .08, .07, .05); break;
    case 'no': tone('square', 220, 160, .12, .08); break;
    case 'level': [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, .22, .12, i * .07)); break;
    case 'pull': tone('sine', 200, 1200, .5, .12); noise(.5, .08, 3000); break;
    case 'r4': [784, 988, 1175].forEach((f, i) => tone('triangle', f, f, .3, .12, i * .05)); break;
    case 'r5': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone('triangle', f, f, .5, .12, i * .07)); break;
    case 'win': [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone('square', f, f, .18, .07, i * .11)); break;
    case 'lose': [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f, .3, .12, i * .18)); break;
  }
}

// 배경음 — 8분음표 32스텝 루프
const TR = {
  hub: { bpm: 80, wave: 'triangle',
    lead: [69,0,72,0,76,0,74,72, 69,0,0,0,67,0,69,0, 72,0,74,0,76,0,79,76, 74,0,0,0,72,0,0,0],
    bass: [45,0,0,0,52,0,0,0, 48,0,0,0,55,0,0,0, 50,0,0,0,57,0,0,0, 52,0,0,0,52,0,55,0], hat: false },
  battle: { bpm: 138, wave: 'square',
    lead: [69,72,76,72,69,0,76,0, 74,72,69,67,69,0,0,0, 72,74,76,79,76,0,74,0, 72,69,67,64,69,0,0,0],
    bass: [45,0,45,0,57,0,45,0, 43,0,43,0,55,0,43,0, 41,0,41,0,53,0,41,0, 43,0,43,0,55,0,52,0], hat: true },
  boss: { bpm: 152, wave: 'square',
    lead: [69,0,68,0,69,0,72,71, 69,0,64,0,65,0,64,0, 69,0,68,0,69,0,76,74, 72,71,69,68,69,0,0,0],
    bass: [33,33,45,33,33,45,33,45, 29,29,41,29,29,41,29,41, 31,31,43,31,31,43,31,43, 32,32,44,32,40,40,44,44], hat: true },
};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
export function playBgm(name) {
  if (track && track.name === name) return;
  track = TR[name] ? { name, ...TR[name] } : null;
  step = 0;
  if (ctx) startLoop();
}
function startLoop() {
  clearInterval(timer);
  if (!track) return;
  nextT = ctx.currentTime + .1;
  timer = setInterval(sched, 60);
}
function sched() {
  if (!ctx || !track) return;
  const dt = 60 / track.bpm / 2;
  while (nextT < ctx.currentTime + .25) {
    const i = step % 32, w = nextT - ctx.currentTime;
    const l = track.lead[i], b = track.bass[i];
    if (l) tone(track.wave, hz(l), hz(l), dt * 1.6, .07, w, bgmBus);
    if (b) tone('triangle', hz(b), hz(b), dt * 1.8, .16, w, bgmBus);
    if (track.hat && i % 2 === 0) noise(.03, i % 8 === 4 ? .12 : .05, 7000, 'highpass', w, bgmBus);
    if (track.hat && i % 8 === 0) tone('sine', 120, 45, .14, .25, w, bgmBus);
    nextT += dt; step++;
  }
}
