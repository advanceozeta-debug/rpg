// 월하검무 — 픽셀 아트 (모두 코드로 그림)
import { VW, VH, GROUND, HERO, WEAPONS } from './data.js';

export const OL = '#120c22';
let c = null;
export function mk(w, h) { const k = document.createElement('canvas'); k.width = w; k.height = h; return k; }
export function R(x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function line(x0, y0, a, len, col, th = 1) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let i = 0; i < len; i++) R(Math.round(x0 + ca * i - (th > 1 ? th / 2 : 0)), Math.round(y0 + sa * i - (th > 1 ? th / 2 : 0)), th, th, col);
}
export function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  if (f < 1) { r *= f; g *= f; b *= f; } else { const k = f - 1; r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const ease = q => 1 - Math.pow(1 - q, 3);

/* ---------- 스프라이트 그리기 (외곽선 포함) ---------- */
const SB = mk(112, 112), sb = SB.getContext('2d'), TB = mk(112, 112), tb = TB.getContext('2d');
const OX = 56, OY = 96;
function render(fn, face) { sb.clearRect(0, 0, 112, 112); sb.save(); sb.translate(OX, OY); if (face < 0) sb.scale(-1, 1); const p = c; c = sb; fn(); c = p; sb.restore(); }
function tint(col) { tb.globalCompositeOperation = 'source-over'; tb.clearRect(0, 0, 112, 112); tb.drawImage(SB, 0, 0); tb.globalCompositeOperation = 'source-in'; tb.fillStyle = col; tb.fillRect(0, 0, 112, 112); tb.globalCompositeOperation = 'source-over'; }
export function blit(t, fn, x, y, face, o = {}) {
  render(fn, face);
  const X = Math.round(x) - OX, Y = Math.round(y) - OY;
  t.globalAlpha = o.alpha ?? 1;
  if (!o.noOutline) { tint(OL); t.drawImage(TB, X + 1, Y); t.drawImage(TB, X - 1, Y); t.drawImage(TB, X, Y + 1); t.drawImage(TB, X, Y - 1); }
  if (o.flash) { tint('#ffffff'); t.drawImage(TB, X, Y); }
  else if (o.tint) { tint(o.tint); t.drawImage(TB, X, Y); }
  else t.drawImage(SB, X, Y);
  t.globalAlpha = 1;
}

/* ---------- 영웅 ---------- */
const palCache = {};
function fullPal(def) {
  if (palCache[def.id]) return palCache[def.id];
  const p = def.pal;
  return palCache[def.id] = {
    ...p, hairS: shade(p.hair, .8), hairD: shade(p.hair, .6), hairL: shade(p.hair, 1.35),
    coatS: shade(p.coat, .68), coatL: shade(p.coat, 1.25), eyeD: shade(p.eye, .55),
    skin: '#fbe1d0', skinS: '#eab59f', leg: '#e7e1f6', boot: '#2a2140', blush: '#f59bb0',
  };
}
function weaponPose(h, wp) {
  const s = h.state;
  if (s === 'attack' && h.step) {
    const st = h.step, p = clamp((h.atkDur - h.atkT) / (h.atkDur * .55), 0, 1);
    if (st.kind === 'arc') return { a: st.arc[0] + (st.arc[1] - st.arc[0]) * ease(p), ext: 0 };
    if (st.kind === 'thrust') { const q = (h.atkDur - h.atkT) / h.atkDur; return { a: -.05, ext: Math.round(q < .35 ? q / .35 * 8 : 8 * (1 - (q - .35) / .65)) }; }
    if (st.kind === 'shot') return { a: wp === 'staff' ? -.9 : 0, ext: 2, draw: p < .6 };
  }
  if (s === 'spin') return { a: h.anim * 22, ext: 0 };
  if (s === 'skill') return { a: wp === 'staff' ? -1.1 : -.2, ext: 2 };
  if (s === 'dash') return { a: wp === 'bow' || wp === 'staff' ? .4 : 2.75, ext: 0 };
  if (s === 'hurt') return { a: 2.3, ext: 0 };
  if (s === 'jump') return { a: wp === 'staff' ? -1.3 : -.6, ext: 0 };
  if (s === 'fall') return { a: .2, ext: 0 };
  return { a: { bow: .9, staff: -1.35, spear: -1.1, greatsword: .95, daggers: .9, sword: .75 }[wp], ext: 0 };
}
function drawWeapon(wp, hx, hy, a, P, pose) {
  const pa = a + Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
  if (wp === 'sword') {
    line(hx - ca * 2, hy - sa * 2, a, 3, '#6a4a2a');
    R(Math.round(hx + Math.cos(pa) * 2), Math.round(hy + Math.sin(pa) * 2), 1, 1, P.trim);
    R(Math.round(hx - Math.cos(pa) * 2), Math.round(hy - Math.sin(pa) * 2), 1, 1, P.trim);
    R(hx, hy, 1, 1, P.trim);
    line(hx + ca * 2, hy + sa * 2, a, 13, '#e4f7ff');
    line(hx + ca * 2 + Math.cos(pa), hy + sa * 2 + Math.sin(pa), a, 11, P.acc);
  } else if (wp === 'greatsword') {
    line(hx - ca * 4, hy - sa * 4, a, 5, '#4a3320');
    for (let k = -3; k <= 3; k++) R(Math.round(hx + ca * 1 + Math.cos(pa) * k), Math.round(hy + sa * 1 + Math.sin(pa) * k), 1, 1, P.trim);
    for (let k = -1; k <= 1; k++) line(hx + ca * 2 + Math.cos(pa) * k, hy + sa * 2 + Math.sin(pa) * k, a, 18, k === 0 ? P.acc : '#d6dcf2');
    line(hx + ca * 2 - Math.cos(pa), hy + sa * 2 - Math.sin(pa), a, 18, '#ffffff');
  } else if (wp === 'spear') {
    line(hx - ca * 9, hy - sa * 9, a, 26, '#7a5532');
    line(hx + ca * 17, hy + sa * 17, a, 5, '#e4f0ff');
    line(hx + ca * 17 + Math.cos(pa), hy + sa * 17 + Math.sin(pa), a, 3, '#ffffff');
    R(Math.round(hx + ca * 15 - Math.cos(pa)), Math.round(hy + sa * 15 - Math.sin(pa)), 2, 2, P.acc);
    R(Math.round(hx + ca * 14 - Math.cos(pa) * 2), Math.round(hy + sa * 14 - Math.sin(pa) * 2 + 1), 1, 2, P.acc);
  } else if (wp === 'daggers') {
    R(hx, hy, 1, 1, P.trim);
    line(hx + ca, hy + sa, a, 6, '#e4f7ff'); line(hx + ca + Math.cos(pa), hy + sa + Math.sin(pa), a, 5, P.acc);
  } else if (wp === 'bow') {
    const aim = pose && pose.draw ? -2 : 0;
    for (let i = -8; i <= 8; i++) {
      const t = i / 8, bend = (1 - t * t) * 3;
      R(Math.round(hx + ca * bend + Math.cos(pa) * i), Math.round(hy + sa * bend + Math.sin(pa) * i), 1, 1, i % 4 === 0 ? P.trim : '#8a5a3a');
    }
    const ex1x = hx + Math.cos(pa) * 8, ex1y = hy + Math.sin(pa) * 8, ex2x = hx - Math.cos(pa) * 8, ex2y = hy - Math.sin(pa) * 8;
    const mx = hx + ca * aim, my = hy + sa * aim;
    for (let k = 0; k <= 8; k++) { R(Math.round(ex1x + (mx - ex1x) * k / 8), Math.round(ex1y + (my - ex1y) * k / 8), 1, 1, '#e8e2ff'); R(Math.round(ex2x + (mx - ex2x) * k / 8), Math.round(ex2y + (my - ex2y) * k / 8), 1, 1, '#e8e2ff'); }
    if (pose && pose.draw) line(mx, my, a, 11, '#cfd6ee');
  } else if (wp === 'staff') {
    line(hx - ca * 6, hy - sa * 6, a, 20, '#7a5532');
    line(hx - ca * 6 + Math.cos(pa), hy - sa * 6 + Math.sin(pa), a, 18, '#9a7046');
    const ox = Math.round(hx + ca * 15), oy = Math.round(hy + sa * 15);
    R(ox - 2, oy - 2, 4, 4, P.acc); R(ox - 1, oy - 1, 2, 2, '#ffffff'); R(ox - 3, oy - 1, 1, 2, P.trim); R(ox + 2, oy - 1, 1, 2, P.trim);
  }
}
export function heroArt(h) {
  const def = h.def, P = fullPal(def), wp = def.weapon;
  return () => {
    const s = h.state, t = h.anim; let bob = 0, lo = 0, hs = 0, lift = 0;
    if (s === 'run') { const f = Math.floor(t * 12) % 4; lo = [2, 0, -2, 0][f]; bob = f % 2 ? -1 : 0; hs = [0, 1, 2, 1][f]; }
    else if (s === 'idle') { bob = Math.floor(t * 2.4) % 2 ? -1 : 0; hs = bob ? 1 : 0; }
    else if (s === 'jump') { lo = 1; lift = 1; hs = -1; } else if (s === 'fall') { lo = -1; hs = 3; }
    else if (s === 'dash') { lo = 3; hs = 4; } else if (s === 'attack' || s === 'skill' || s === 'spin') { lo = 2; hs = 2; } else if (s === 'hurt') { lo = -1; hs = 3; }
    const y = bob, st = P.style;
    // 뒷머리
    if (st === 'long') { R(-9 - hs, -25 + y, 5, 11, P.hair); R(-10 - hs, -17 + y, 4, 5, P.hairS); R(-9 - hs, -13 + y, 2, 3, P.hairD); R(-6 - hs, -26 + y, 3, 2, P.hairS); R(-11 - hs, -24 + y, 2, 2, P.acc); R(-12 - hs, -22 + y, 1, 3, P.acc); }
    else if (st === 'pony') { R(-8, -27 + y, 3, 3, P.acc); R(-11 - hs, -27 + y, 4, 3, P.hair); R(-13 - hs, -25 + y, 3, 6, P.hair); R(-14 - hs, -20 + y, 2, 4, P.hairS); R(-13 - hs, -17 + y, 1, 2, P.hairD); }
    else if (st === 'twin') { R(-9 - hs, -25 + y, 3, 10, P.hair); R(-10 - hs, -17 + y, 2, 4, P.hairS); R(-8, -27 + y, 2, 2, P.acc); }
    else if (st === 'bob') { R(-7, -26 + y, 3, 9, P.hairS); R(-8 - (hs > 2 ? 1 : 0), -20 + y, 2, 3, P.hairD); }
    else { R(-7, -26 + y, 3, 7, P.hairS); }
    // 다리
    R(-3 - lo, -7 - lift, 2, 6, P.coatS); R(-4 - lo, -2 - lift, 3, 2, P.boot);
    R(1 + lo, -7 - lift, 2, 6, P.leg); R(1 + lo, -2 - lift, 3, 2, P.boot); R(3 + lo, -2 - lift, 1, 1, P.trim);
    // 몸
    R(-5, -10 + y, 10, 3, P.coat); R(-6 - (hs > 2 ? 1 : 0), -9 + y, 2, 3, P.coatS); R(-5, -8 + y, 10, 1, P.coatS);
    R(-5, -15 + y, 2, 5, P.coatS);
    R(-4, -16 + y, 8, 7, P.coat); R(-1, -16 + y, 3, 6, '#f3f2fb'); R(-4, -11 + y, 8, 1, P.trim); R(0, -11 + y, 1, 1, '#fff6c8');
    R(-3, -16 + y, 6, 1, '#f3f2fb'); R(1, -15 + y, 2, 2, P.acc);
    // 쌍단검 뒷손
    if (wp === 'daggers') { const a2 = (s === 'attack' ? weaponPose(h, wp).a + 2.4 : 1.1); R(-4, -13 + y, 2, 2, P.skin); line(-4 + Math.cos(a2) * 2, -12 + y + Math.sin(a2) * 2, a2, 5, '#e4f7ff'); }
    // 머리
    R(-5, -26 + y, 10, 10, P.skin); R(-5, -17 + y, 10, 1, P.skinS);
    R(-6, -28 + y, 12, 4, P.hair); R(-6, -24 + y, 2, 7, P.hair); R(-7, -27 + y, 2, 4, P.hairS); R(-4, -29 + y, 7, 1, P.hair); R(-2, -29 + y, 3, 1, P.hairL);
    R(-1, -24 + y, 5, 2, P.hair); R(3, -24 + y, 3, 5, P.hair); R(4, -20 + y, 1, 2, P.hairS); R(0, -22 + y, 1, 1, P.hair); R(-4, -24 + y, 1, 2, P.hairS);
    if (st === 'twin') { R(5, -25 + y, 3, 3, P.acc); R(6, -22 + y, 2, 7, P.hair); R(7, -16 + y, 1, 2, P.hairS); }
    if (st === 'bob') { R(4, -23 + y, 3, 6, P.hair); R(-6, -18 + y, 2, 2, P.hair); }
    if (st === 'long') R(-7, -28 + y, 3, 2, P.acc);
    if (st === 'short') { R(4, -28 + y, 2, 2, P.hairS); R(-6, -29 + y, 2, 1, P.hairS); }
    // 얼굴
    const blink = (s === 'idle' || s === 'run') && (t % 3.2) > 3.05;
    if (s === 'hurt') { R(1, -20 + y, 2, 1, OL); R(-3, -20 + y, 2, 1, OL); R(1, -21 + y, 1, 1, OL); R(-2, -21 + y, 1, 1, OL); }
    else if (blink) { R(1, -19 + y, 2, 1, P.eyeD); R(-3, -19 + y, 2, 1, P.eyeD); }
    else { for (const ex of [1, -3]) { R(ex, -21 + y, 2, 1, OL); R(ex, -20 + y, 2, 3, P.eye); R(ex, -20 + y, 2, 1, P.eyeD); R(ex + 1, -19 + y, 1, 1, '#ffffff'); } }
    R(-3, -17 + y, 1, 1, P.blush); R(3, -17 + y, 1, 1, P.blush); R(0, -17 + y, 1, 1, '#c47483');
    // 팔 + 무기
    const pose = weaponPose(h, wp), a = pose.a;
    const sx0 = 1, sy0 = -14 + y;
    const hx = Math.round(sx0 + Math.cos(a) * 4 + (pose.ext || 0)), hy = Math.round(sy0 + Math.sin(a) * 4);
    line(sx0, sy0, Math.atan2(hy - sy0, hx - sx0), Math.max(3, Math.round(Math.hypot(hx - sx0, hy - sy0))), P.coat, 2);
    R(hx, hy, 2, 2, P.skin);
    drawWeapon(wp, hx, hy, a, P, pose);
  };
}

/* ---------- 적 ---------- */
export function enemyArt(e) {
  switch (e.type) {
    case 'slime': return () => {
      const sq = e.vy < -20 ? -2 : e.squash > 0 ? 2 : 0;
      const b = e.alt ? '#b48cff' : '#5fd3b4', d = e.alt ? '#6b4bb8' : '#2f8a7e', l = e.alt ? '#e2d2ff' : '#b8f5e4';
      const w = 14 + sq, h = 10 - sq, x0 = -(w >> 1);
      R(x0 + 2, -h, w - 4, 1, b); R(x0 + 1, -h + 1, w - 2, 1, b); R(x0, -h + 2, w, h - 2, b); R(x0, -2, w, 2, d); R(x0 + 2, -h + 1, 2, 2, l); R(x0 + 1, -h + 3, 1, 1, l);
      const ey = -h + 4; R(1, ey, 2, 3, OL); R(-3, ey, 2, 3, OL); R(1, ey, 1, 1, '#fff'); R(-3, ey, 1, 1, '#fff');
    };
    case 'wisp': return () => {
      const f = Math.floor(e.t * 10) % 3, b = '#8f73ff', m = '#b9a6ff', l = '#ece6ff';
      R(-4, -16, 8, 1, b); R(-5, -15, 10, 9, b); R(-4, -6, 8, 1, b); R(-4, -5, 2, 2 + f, b); R(0, -5, 2, 4 - f, b); R(3, -5, 1, 1 + f, b);
      R(-3, -14, 6, 6, m); R(-2, -13, 3, 2, l); R(-1, -19 + f, 2, 3, m); R(0, -21 + f, 1, 2, l);
      R(-2, -11, 1, 2, OL); R(2, -11, 1, 2, OL);
      R(-7, -12 + (f === 1 ? -1 : 0), 2, 3, b); R(5, -12 + (f === 2 ? -1 : 0), 2, 3, b);
    };
    case 'bat': return () => {
      const up = Math.floor(e.t * 14) % 2, w = '#2e2350', wl = '#4a3a7a';
      R(-3, -6, 6, 5, '#3a2a5e'); R(-3, -8, 1, 2, '#3a2a5e'); R(2, -8, 1, 2, '#3a2a5e'); R(-2, -5, 1, 1, '#ff4d6d'); R(1, -5, 1, 1, '#ff4d6d'); R(-1, -2, 2, 1, '#ffffff');
      if (up) { R(-9, -9, 6, 2, w); R(-11, -11, 3, 2, w); R(3, -9, 6, 2, w); R(8, -11, 3, 2, w); R(-8, -9, 3, 1, wl); R(5, -9, 3, 1, wl); }
      else { R(-9, -4, 6, 2, w); R(-11, -2, 3, 2, w); R(3, -4, 6, 2, w); R(8, -2, 3, 2, w); R(-8, -4, 3, 1, wl); R(5, -4, 3, 1, wl); }
    };
    case 'archer': return () => {
      const aim = e.ai === 'aim', st = Math.floor(e.t * 6) % 2, mv = e.ai === 'walk' ? st : 0;
      R(-3 + mv, -6, 2, 6, '#1d1836'); R(1 - mv, -6, 2, 6, '#1d1836');
      R(-5, -20, 10, 14, '#2f2752'); R(-6, -8, 12, 2, '#241d42'); R(-4, -19, 3, 10, '#3b3266'); R(-5, -13, 10, 1, '#8a6a3a');
      R(-5, -28, 10, 9, '#3b3266'); R(-7, -27, 3, 4, '#3b3266'); R(-8, -24, 2, 3, '#2f2752');
      R(-1, -25, 6, 4, OL); R(1, -24, 2, 1, '#ffd36b'); R(4, -24, 1, 1, '#ffd36b');
      const bx = aim ? 8 : 6;
      for (let i = -8; i <= 8; i++) { const t = i / 8; R(Math.round(bx + (1 - t * t) * 3), -16 + i, 1, 1, '#8a5a3a'); }
      const sx = aim ? bx - 3 : bx;
      for (let i = -8; i <= 8; i++) R(Math.round(bx + (sx - bx) * (1 - Math.abs(i) / 8)), -16 + i, 1, 1, '#cfc6ef');
      R(3, -17, bx - 2, 2, '#2f2752');
      if (aim) { R(sx, -16, 12, 1, '#cfd6ee'); R(sx + 12, -17, 2, 3, '#e8e2ff'); }
    };
    case 'knight': return () => {
      const st = Math.floor(e.t * 6) % 2, mv = e.ai === 'walk' ? st : 0;
      R(-12, -23, 5, 17, '#5a1f38'); R(-13, -9, 4, 3, '#46172c');
      R(-6 + mv, -9, 4, 9, '#2b2540'); R(2 - mv, -9, 4, 9, '#2b2540'); R(-7 + mv, -2, 6, 2, '#1a1530'); R(1 - mv, -2, 6, 2, '#1a1530');
      R(-8, -23, 16, 15, '#3a3358'); R(-6, -21, 12, 8, '#524a78'); R(-5, -21, 10, 1, '#6d649a'); R(-8, -11, 16, 2, '#a8324a');
      R(-6, -33, 12, 11, '#46406a'); R(-5, -33, 10, 1, '#6d649a'); R(-4, -29, 9, 3, OL);
      const glow = e.ai === 'wind' ? '#ffd1dc' : '#ff4d6d'; R(-1, -28, 2, 1, glow); R(2, -28, 2, 1, glow);
      R(-9, -36, 6, 3, '#c0304e'); R(-12, -35, 4, 2, '#c0304e'); R(-14, -34, 3, 2, '#8e2440');
      R(-10, -24, 4, 4, '#6d649a'); R(6, -24, 4, 4, '#6d649a');
      const a = e.ai === 'wind' ? -2.35 + Math.sin(e.t * 40) * .05 : e.ai === 'swing' ? -2.35 + 3.6 * ease(clamp(1 - e.aiT / .28, 0, 1)) : e.ai === 'rest' ? 1.35 : .9;
      const hx = Math.round(5 + Math.cos(a) * 5), hy = Math.round(-19 + Math.sin(a) * 5);
      line(5, -19, a, 5, '#3a3358', 3); R(hx, hy, 3, 3, '#524a78');
      const pa = a + Math.PI / 2;
      for (let k = -3; k <= 3; k++) R(Math.round(hx + 1 + Math.cos(pa) * k), Math.round(hy + 1 + Math.sin(pa) * k), 1, 1, '#c9a24a');
      line(hx + 1 + Math.cos(a) * 2, hy + 1 + Math.sin(a) * 2, a, 22, '#8f95b8', 3);
      line(hx + 1 + Math.cos(a) * 2, hy + 1 + Math.sin(a) * 2, a, 22, '#d3d8f0', 1);
    };
    case 'eclipse': return () => {
      const s = e.ai, f = Math.floor(e.t * (s === 'charge' ? 14 : 7)) % 2, rage = e.hp < e.max * .5;
      const body = '#2b2050', top = '#43367a', dk = '#1a1236', eye = rage ? '#ff4d6d' : '#ffd36b';
      const lean = s === 'charge' ? 2 : s === 'howl' ? -3 : 0, crouch = s === 'leapPrep' ? 4 : 0;
      const lg = (x, o) => { R(x, -8 + o - crouch, 4, 8 - o + crouch, dk); R(x - 1, -1, 5, 1, '#100a24'); };
      lg(-15, f ? 1 : 0); lg(-9, f ? 0 : 1); lg(6, f ? 0 : 1); lg(11, f ? 1 : 0);
      R(-25, -24 - crouch, 8, 3, body); R(-28, -28 - crouch, 4, 5, body); R(-29, -30 - crouch, 3, 3, '#8f73ff');
      R(-18, -25 - crouch + lean, 32, 17, body); R(-16, -26 - crouch + lean, 28, 2, top); R(-14, -10 - crouch, 26, 2, dk);
      for (let k = 0; k < 6; k++) R(-17 + k * 5, -29 - crouch + lean + (k % 2), 3, 4, dk);
      R(-8, -21 - crouch + lean, 1, 4, '#ffd36b'); R(-7, -22 - crouch + lean, 3, 1, '#ffd36b'); R(-7, -17 - crouch + lean, 3, 1, '#ffd36b');
      const hy = (s === 'howl' ? -36 : -31) - crouch + lean, hxx = s === 'charge' ? 12 : 9;
      R(hxx, hy, 14, 12, body); R(hxx, hy, 14, 2, top); R(hxx + 12, hy + 5, 6, 6, body); R(hxx + 10, hy + 11, 8, 2, dk);
      R(hxx + 11, hy + 10, 1, 2, '#ffffff'); R(hxx + 14, hy + 10, 1, 2, '#ffffff'); R(hxx + 17, hy + 6, 1, 1, OL);
      R(hxx + 6, hy + 3, 4, 2, eye); R(hxx + 7, hy + 3, 1, 1, '#ffffff');
      for (let k = 0; k < 7; k++) R(hxx + 2 - k + (k > 4 ? 1 : 0), hy - 1 - k, 2, 1, k > 4 ? '#ffe9a3' : '#ffd36b');
      if (s === 'howl') { R(hxx + 15, hy + 9, 3, 3, '#5a1f38'); }
    };
    case 'dummy': return () => {
      const wob = e.flash > 0 ? 1 : 0;
      R(-1, -6, 2, 6, '#6b4a2a'); R(-5, -2, 10, 2, '#4a3320');
      R(-11 + wob, -21, 22, 2, '#6b4a2a');
      R(-6 + wob, -22, 12, 16, '#c9a66b'); R(-6 + wob, -8, 12, 2, '#a5844f'); R(-6 + wob, -15, 12, 1, '#7a5a34');
      R(-3 + wob, -19, 6, 6, '#ffffff'); R(-2 + wob, -18, 4, 4, '#d9445e'); R(-1 + wob, -17, 2, 2, '#ffffff');
      R(-4 + wob, -30, 8, 8, '#d8b77a'); R(-4 + wob, -31, 8, 1, '#a5844f');
      R(-2 + wob, -27, 1, 1, OL); R(-3 + wob, -28, 1, 1, OL); R(-1 + wob, -28, 1, 1, OL); R(-3 + wob, -26, 1, 1, OL); R(-1 + wob, -26, 1, 1, OL);
      R(2 + wob, -27, 1, 1, OL); R(1 + wob, -28, 1, 1, OL); R(3 + wob, -28, 1, 1, OL); R(1 + wob, -26, 1, 1, OL); R(3 + wob, -26, 1, 1, OL);
    };
  }
  return () => {};
}

/* ---------- 초상화·전신 이미지 (메뉴용) ---------- */
const imgCache = {};
function fakeHero(id, state = 'idle') { return { def: HERO[id], state, anim: .2, atkT: 0, atkDur: 1, step: null }; }
export function heroCanvas(id, kind = 'full') {
  const key = id + kind; if (imgCache[key]) return imgCache[key];
  const k = kind === 'face' ? mk(18, 18) : mk(44, 46);
  const x = k.getContext('2d'); x.imageSmoothingEnabled = false;
  if (kind === 'face') blit(x, heroArt(fakeHero(id)), 9, 30, 1);
  else blit(x, heroArt(fakeHero(id)), 20, 42, 1);
  return imgCache[key] = k;
}
export function heroURL(id, kind) { const key = 'u' + id + kind; return imgCache[key] || (imgCache[key] = heroCanvas(id, kind).toDataURL()); }

/* ---------- 스킬 아이콘 ---------- */
export function skillIcon(type, col = '#7fe3ff') {
  const key = 'sk' + type + col; if (imgCache[key]) return imgCache[key];
  const k = mk(12, 12), p = c; c = k.getContext('2d');
  const W2 = '#ffffff';
  switch (type) {
    case 'wave': for (let i = 0; i < 9; i++) { const a = -1.2 + i * .3; R(Math.round(5 + Math.cos(a) * 4), Math.round(6 + Math.sin(a) * 4), 2, 1, i % 3 ? col : W2); } break;
    case 'dashslash': R(1, 5, 8, 1, col); R(2, 3, 5, 1, col); R(2, 8, 5, 1, col); R(8, 4, 3, 3, W2); break;
    case 'spin': for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; R(Math.round(5.5 + Math.cos(a) * 4), Math.round(5.5 + Math.sin(a) * 4), 1, 1, i % 3 ? col : W2); } R(5, 5, 2, 2, W2); break;
    case 'bolt': R(2, 2, 6, 1, col); R(2, 5, 8, 1, W2); R(2, 8, 6, 1, col); R(8, 2, 2, 1, W2); R(8, 8, 2, 1, W2); break;
    case 'nova': R(5, 1, 2, 10, col); R(1, 5, 10, 2, col); R(3, 3, 6, 6, col); R(4, 4, 4, 4, W2); break;
    case 'rain': for (let i = 0; i < 4; i++) { R(1 + i * 3, 1 + (i % 2) * 2, 1, 6, col); R(1 + i * 3, 7 + (i % 2) * 2, 1, 2, W2); } break;
    case 'heal': R(2, 3, 3, 3, col); R(7, 3, 3, 3, col); R(2, 5, 8, 3, col); R(3, 8, 6, 1, col); R(4, 9, 4, 1, col); R(5, 10, 2, 1, col); R(3, 4, 1, 1, W2); break;
    case 'buff': R(5, 1, 2, 9, col); R(3, 3, 6, 2, col); R(4, 2, 4, 1, W2); R(2, 10, 8, 1, col); break;
    case 'uppercut': R(5, 2, 2, 9, col); R(3, 4, 2, 2, col); R(7, 4, 2, 2, col); R(5, 1, 2, 1, W2); break;
    case 'chain': R(6, 0, 2, 3, W2); R(4, 3, 3, 2, col); R(5, 5, 3, 2, W2); R(3, 7, 3, 2, col); R(4, 9, 2, 3, W2); break;
  }
  c = p;
  return imgCache[key] = k;
}
export function skillURL(type, col) { const key = 'sku' + type + col; return imgCache[key] || (imgCache[key] = skillIcon(type, col).toDataURL()); }

/* ---------- 재화 아이콘 ---------- */
export function coinIcon(kind) {
  const key = 'coin' + kind; if (imgCache[key]) return imgCache[key];
  const k = mk(10, 10), p = c; c = k.getContext('2d');
  if (kind === 'moon') { R(3, 0, 4, 1, '#bff0ff'); R(2, 1, 6, 2, '#7fe3ff'); R(1, 3, 8, 3, '#5fb8e8'); R(2, 6, 6, 2, '#3f86c8'); R(3, 8, 4, 1, '#2d5f9e'); R(3, 2, 2, 2, '#ffffff'); R(6, 4, 1, 2, '#bff0ff'); }
  else { R(2, 1, 6, 8, '#c9cfe6'); R(1, 2, 8, 6, '#c9cfe6'); R(2, 2, 6, 6, '#e8ecf9'); R(3, 3, 4, 4, '#aab2d0'); R(4, 4, 2, 2, '#e8ecf9'); R(2, 1, 2, 1, '#ffffff'); }
  c = p;
  return imgCache[key] = k;
}
export function coinURL(kind) { const key = 'coinu' + kind; return imgCache[key] || (imgCache[key] = coinIcon(kind).toDataURL()); }

/* ---------- 배경 ---------- */
const PLATS = [{ x: 104, y: 114, w: 64 }, { x: 284, y: 94, w: 76 }, { x: 472, y: 114, w: 64 }];
const THEMES = {
  forest:   { sky: ['#100c28', '#151039', '#1c1548', '#251b58', '#322268', '#432b78', '#5a3486', '#713e90'], ridge: '#2a2062', ridgeL: '#43378c', mid: '#1b1544', tree: '#140f36', treeL: '#2b2266', ground: '#211a42', top: '#3d8f86', topL: '#78d8bf', topD: '#2a6a68', plat: '#3a3270', moonX: 248 },
  temple:   { sky: ['#0b1424', '#0f1c30', '#13253c', '#183048', '#1e3b54', '#264860', '#2f566c', '#3a6578'], ridge: '#1a3346', ridgeL: '#2c5068', mid: '#142a3a', tree: '#0f2230', treeL: '#244a5c', ground: '#1d2a36', top: '#5a7f74', topL: '#9cc7b0', topD: '#3e5e57', plat: '#3a4a5a', moonX: 70, fog: true },
  corridor: { sky: ['#140818', '#1c0b22', '#250f2c', '#301436', '#3b1940', '#4a1f48', '#5a2650', '#6b2d56'], ridge: '#2a1030', ridgeL: '#4a1f48', mid: '#200c26', tree: '#180a1e', treeL: '#3a1636', ground: '#24141f', top: '#7a3a4a', topL: '#c06a78', topD: '#552a36', plat: '#4a2a3a', moonX: 160, gates: true },
};
function sky(T, r, stars) {
  const k = mk(VW, VH), x = k.getContext('2d');
  const bh = 16;
  T.sky.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * bh, VW, bh); if (i < T.sky.length - 1) { x.fillStyle = T.sky[i + 1]; for (let p = 0; p < VW; p += 2) { x.fillRect(p + (i % 2), i * bh + bh - 2, 1, 1); x.fillRect(p, i * bh + bh - 1, 1, 1); } } });
  x.fillStyle = T.sky[T.sky.length - 1]; x.fillRect(0, T.sky.length * bh, VW, VH);
  for (let i = 0; i < 90; i++) { const sx = r() * VW | 0, sy = r() * 110 | 0; x.fillStyle = ['#ffffff', '#cfd6ff', '#ffe8b8', '#9e95d6'][r() * 4 | 0]; x.fillRect(sx, sy, 1, 1); if (r() < .12) stars.push({ x: sx, y: sy, p: r() * 6 }); }
  const mx = T.moonX, my = 40, mr = 18;
  for (let py = my - mr - 14; py <= my + mr + 14; py++) for (let px = mx - mr - 14; px <= mx + mr + 14; px++) {
    const d = Math.hypot(px - mx, py - my);
    if (d <= mr) {
      let col = d > mr - 1.6 ? '#ffd786' : '#fff2c9';
      if (Math.hypot(px - (mx - 6), py - (my - 4)) < 3.2 || Math.hypot(px - (mx + 5), py - (my + 6)) < 4 || Math.hypot(px - (mx + 7), py - (my - 7)) < 2) col = '#f4dfa9';
      if (px - mx + py - my > mr * .9) col = d > mr - 1.6 ? '#e9c071' : '#f6e3b2';
      x.fillStyle = col; x.fillRect(px, py, 1, 1);
    } else if (d < mr + 5 && (px + py) % 2 === 0) { x.fillStyle = 'rgba(255,227,163,.22)'; x.fillRect(px, py, 1, 1); }
    else if (d < mr + 13 && px % 2 === 0 && py % 2 === 0) { x.fillStyle = 'rgba(255,227,163,.1)'; x.fillRect(px, py, 1, 1); }
  }
  return k;
}
function pagoda(x, cx, base, col, colL, floors = 3, win = '#ffd27a') {
  let w = 26, y = base;
  for (let f = 0; f < floors; f++) {
    x.fillStyle = col; x.fillRect(cx - w / 2 + 3, y - 8, w - 6, 8);
    x.fillRect(cx - w / 2 - 2, y - 10, w + 4, 2); x.fillStyle = colL; x.fillRect(cx - w / 2 - 3, y - 11, w + 6, 1);
    x.fillStyle = col; x.fillRect(cx - w / 2 - 4, y - 12, 2, 2); x.fillRect(cx + w / 2 + 2, y - 12, 2, 2);
    if (win) { x.fillStyle = win; for (let k = -1; k <= 1; k++) x.fillRect(cx + k * 6, y - 6, 1, 2); }
    y -= 12; w -= 6;
  }
  x.fillStyle = col; x.fillRect(cx - 1, y - 6, 2, 6);
}
function ground(x, T, r, width) {
  x.fillStyle = T.ground; x.fillRect(0, GROUND, width, VH - GROUND);
  for (let i = 0; i < width / 5; i++) { const sx = r() * width | 0, sy = GROUND + 5 + (r() * (VH - GROUND - 5) | 0), w = 2 + (r() * 5 | 0); x.fillStyle = r() < .5 ? shade(T.ground, 1.15) : shade(T.ground, 1.3); x.fillRect(sx, sy, w, 2); x.fillStyle = shade(T.ground, .7); x.fillRect(sx, sy + 2, w, 1); }
  x.fillStyle = T.top; x.fillRect(0, GROUND, width, 3); x.fillStyle = T.topD; x.fillRect(0, GROUND + 3, width, 1);
  for (let p = 0; p < width; p++) {
    if ((p * 7) % 5 < 2) { x.fillStyle = T.topL; x.fillRect(p, GROUND, 1, 1); }
    if (r() < .28) { const bh = 1 + (r() * 3 | 0); x.fillStyle = r() < .5 ? T.top : T.topL; x.fillRect(p, GROUND - bh, 1, bh); }
    if (r() < .02) { x.fillStyle = '#ff9bc0'; x.fillRect(p, GROUND - 3, 1, 1); x.fillStyle = '#fff'; x.fillRect(p + 1, GROUND - 3, 1, 1); }
  }
}
export function buildBattleBg(theme) {
  const T = THEMES[theme] || THEMES.forest, r = mulberry(theme.length * 31 + 7), stars = [];
  const width = 640;
  const SK = sky(T, r, stars);
  const FAR = mk(Math.ceil((width - VW) * .2) + VW, VH), MID = mk(Math.ceil((width - VW) * .5) + VW, VH), FG = mk(width, VH);
  let x = FAR.getContext('2d');
  for (let i = 0; i < FAR.width; i++) { const t = Math.round(104 - 15 * Math.abs(Math.sin(i * .019 + 1.2)) - 9 * Math.abs(Math.sin(i * .052 + .3))); x.fillStyle = T.ridge; x.fillRect(i, t, 1, VH - t); x.fillStyle = T.ridgeL; x.fillRect(i, t, 1, 1); }
  if (theme === 'temple') pagoda(x, 230, 98, '#13283a', '#2c5068', 4);
  else if (theme === 'forest') pagoda(x, 210, 96, '#231a55', '#3a2f7c', 3);
  x = MID.getContext('2d');
  for (let i = 0; i < MID.width; i++) { const t = Math.round(130 - 9 * Math.sin(i * .024) - 5 * Math.sin(i * .071 + 2)); x.fillStyle = T.mid; x.fillRect(i, t, 1, VH - t); }
  if (T.gates) {
    for (let gx = 20; gx < MID.width; gx += 70) {
      x.fillStyle = '#3a1222'; x.fillRect(gx, 82, 3, 60); x.fillRect(gx + 34, 82, 3, 60);
      x.fillStyle = '#5a1a2e'; x.fillRect(gx - 6, 80, 49, 4); x.fillRect(gx - 2, 90, 41, 2);
      x.fillStyle = '#7a2a3e'; x.fillRect(gx - 6, 80, 49, 1);
    }
  } else {
    for (let tx = 4; tx < MID.width; tx += 10 + (r() * 22 | 0)) {
      const base = Math.round(132 - 9 * Math.sin(tx * .024) - 5 * Math.sin(tx * .071 + 2)), hgt = 22 + (r() * 20 | 0);
      if (theme === 'temple' && r() < .3) { // 석등
        x.fillStyle = T.tree; x.fillRect(tx - 1, base - 14, 3, 14); x.fillRect(tx - 4, base - 20, 9, 6); x.fillRect(tx - 5, base - 22, 11, 2); x.fillStyle = '#ffcf7a'; x.fillRect(tx - 1, base - 18, 3, 2); continue;
      }
      for (let yy = 0; yy < hgt; yy++) { const k = yy / hgt, seg = (yy % 7) / 7, w = Math.max(1, Math.round((k * .9 + .1) * (5 + seg * 4))); x.fillStyle = T.tree; x.fillRect(tx - w, base - hgt + yy, w * 2 + 1, 1); x.fillStyle = T.treeL; x.fillRect(tx + w, base - hgt + yy, 1, 1); }
      x.fillStyle = T.tree; x.fillRect(tx, base - 2, 1, 4);
    }
  }
  x = FG.getContext('2d');
  ground(x, T, r, width);
  for (const p of PLATS) {
    for (let yy = 0; yy < 9; yy++) { const ins = yy < 5 ? 0 : (yy - 4) * 2; x.fillStyle = yy === 8 ? shade(T.plat, .6) : T.plat; x.fillRect(p.x + ins, p.y + yy, p.w - ins * 2, 1); }
    x.fillStyle = shade(T.plat, .75); for (let bx = p.x + 6; bx < p.x + p.w - 4; bx += 10) x.fillRect(bx, p.y + 3, 1, 4); x.fillRect(p.x + 2, p.y + 5, p.w - 4, 1);
    x.fillStyle = T.top; x.fillRect(p.x - 1, p.y - 1, p.w + 2, 3); x.fillStyle = T.topL; for (let q = 0; q < p.w; q += 2) x.fillRect(p.x + q, p.y - 1, 1, 1);
    for (let q = 2; q < p.w - 2; q += 3 + (r() * 4 | 0)) { const l = 2 + (r() * 7 | 0); x.fillStyle = T.topD; x.fillRect(p.x + q, p.y + 2, 1, l); }
  }
  const fog = T.fog ? Array.from({ length: 5 }, (_, i) => ({ y: 118 + i * 8, s: 6 + i * 3, a: .06 + i * .015 })) : null;
  return { width, sky: SK, far: FAR, mid: MID, fg: FG, stars, plats: PLATS, theme,
    dyn(L, cam, t) {
      if (fog) for (const f of fog) { L.fillStyle = `rgba(190,220,230,${f.a})`; for (let k = -1; k < 4; k++) { const fx = ((k * 120 - cam * .7 + t * f.s) % 480 + 480) % 480 - 120; L.fillRect(Math.round(fx), f.y, 90, 4); L.fillRect(Math.round(fx) + 10, f.y - 2, 60, 2); } }
    } };
}

// 거점 월하정
export const HUB_W = 960;
export const STATIONS = [
  { id: 'stele', x: 70, name: '기록 비석', sub: '나의 기록' },
  { id: 'codex', x: 180, name: '영웅록', sub: '영웅 도감' },
  { id: 'party', x: 310, name: '편성', sub: '출전·교대 영웅' },
  { id: 'altar', x: 480, name: '소환 제단', sub: '월석으로 영웅 소환', badge: true },
  { id: 'train', x: 630, name: '영웅 수련', sub: '은화로 레벨 올리기' },
  { id: 'gate', x: 900, name: '출정의 문', sub: '스테이지·무한 회랑' },
];
export function buildHubBg() {
  const T = { ...THEMES.forest, moonX: 250 }, r = mulberry(99), stars = [];
  const width = HUB_W;
  const SK = sky(T, r, stars);
  const FAR = mk(Math.ceil((width - VW) * .2) + VW, VH), MID = mk(Math.ceil((width - VW) * .5) + VW, VH), FG = mk(width, VH);
  let x = FAR.getContext('2d');
  for (let i = 0; i < FAR.width; i++) { const t = Math.round(100 - 16 * Math.abs(Math.sin(i * .017 + .4)) - 8 * Math.abs(Math.sin(i * .05 + 1))); x.fillStyle = T.ridge; x.fillRect(i, t, 1, VH - t); x.fillStyle = T.ridgeL; x.fillRect(i, t, 1, 1); }
  pagoda(x, 330, 94, '#231a55', '#3a2f7c', 4);
  x = MID.getContext('2d');
  for (let i = 0; i < MID.width; i++) { const t = Math.round(128 - 6 * Math.sin(i * .03)); x.fillStyle = T.mid; x.fillRect(i, t, 1, VH - t); }
  for (let tx = 10; tx < MID.width; tx += 14 + (r() * 20 | 0)) { const base = 130, hgt = 18 + (r() * 16 | 0); for (let yy = 0; yy < hgt; yy++) { const k = yy / hgt, w = Math.max(1, Math.round((k * .9 + .1) * (4 + (yy % 6) / 6 * 4))); x.fillStyle = T.tree; x.fillRect(tx - w, base - hgt + yy, w * 2 + 1, 1); } }
  // 앞 레이어: 누각 기둥·지붕·마루
  x = FG.getContext('2d'); c = x;
  // 마루
  R(0, GROUND, width, VH - GROUND, '#2a1d30');
  for (let px = 0; px < width; px += 24) { R(px, GROUND + 4, 1, VH - GROUND, '#1e1424'); }
  for (let py = GROUND + 9; py < VH; py += 7) R(0, py, width, 1, '#22172a');
  R(0, GROUND, width, 3, '#5b3a4a'); R(0, GROUND, width, 1, '#8a5a6a'); R(0, GROUND + 3, width, 1, '#1a1020');
  // 지붕
  R(0, 0, width, 14, '#1a1430');
  for (let px = 0; px < width; px += 6) { R(px, 10, 5, 4, '#2a2148'); R(px, 14, 5, 2, '#3a2f5e'); R(px + 2, 16, 1, 1, '#1a1430'); }
  R(0, 18, width, 4, '#5a2430'); R(0, 18, width, 1, '#8a3a48'); R(0, 22, width, 2, '#3a1620');
  for (let px = 8; px < width; px += 16) { R(px, 19, 6, 2, '#2e6b6b'); R(px + 2, 19, 2, 2, '#f3c75b'); }
  // 기둥
  for (let px = 0; px < width; px += 160) {
    R(px + 6, 24, 8, GROUND - 24, '#4a2430'); R(px + 6, 24, 2, GROUND - 24, '#6b3442'); R(px + 12, 24, 2, GROUND - 24, '#341820');
    R(px + 3, GROUND - 6, 14, 6, '#3a3348'); R(px + 3, GROUND - 6, 14, 1, '#5a5270');
    R(px + 4, 24, 12, 3, '#6b3442');
    // 처마 장식 곡선
    for (let k = 0; k < 18; k++) { R(px + 14 + k, 24 + Math.round(Math.sin(k / 18 * Math.PI) * 5), 1, 1, '#341820'); R(px + 6 - k, 24 + Math.round(Math.sin(k / 18 * Math.PI) * 5), 1, 1, '#341820'); }
  }
  // 벚나무 (제단 뒤)
  const tx = 540;
  for (let k = 0; k < 60; k++) { R(tx + Math.round(Math.sin(k * .1) * 2), GROUND - k, 4 - (k > 40 ? 1 : 0), 1, '#3a2228'); }
  for (let k = 0; k < 28; k++) R(tx + 2 + k, GROUND - 46 - Math.round(k * .5), 2, 1, '#3a2228');
  for (let k = 0; k < 22; k++) R(tx - k, GROUND - 40 - Math.round(k * .6), 2, 1, '#3a2228');
  for (let i = 0; i < 260; i++) { const a = r() * 6.28, d = Math.sqrt(r()); const cx = tx + Math.cos(a) * 40 * d + (r() < .5 ? 16 : -6), cy = GROUND - 66 + Math.sin(a) * 18 * d; R(Math.round(cx), Math.round(cy), 2, 2, ['#ffb3cf', '#ff8fb8', '#ffd1e3', '#e8749e'][r() * 4 | 0]); }
  // 시설 소품
  for (const s of STATIONS) prop(s);
  c = null;
  return { width, sky: SK, far: FAR, mid: MID, fg: FG, stars, plats: [], theme: 'hub',
    dyn(L, cam, t) {
      const p = c; c = L;
      // 등롱
      for (let lx = 80; lx < width; lx += 160) {
        const X = Math.round(lx - cam), sw = Math.round(Math.sin(t * 1.4 + lx) * 1.5);
        if (X < -20 || X > VW + 20) continue;
        R(X, 24, 1, 10, '#3a1620');
        L.globalAlpha = .18 + Math.sin(t * 3 + lx) * .04; R(X - 8 + sw, 32, 17, 18, '#ffb35a'); L.globalAlpha = 1;
        R(X - 4 + sw, 34, 9, 12, '#ff8a3a'); R(X - 3 + sw, 35, 7, 10, '#ffc46a'); R(X - 1 + sw, 36, 3, 8, '#fff0b8');
        R(X - 4 + sw, 33, 9, 1, '#3a1620'); R(X - 4 + sw, 46, 9, 1, '#3a1620'); R(X + sw, 47, 1, 3, '#ff8a3a');
      }
      // 소환 제단 크리스털
      const ax = Math.round(480 - cam), ay = GROUND - 44 + Math.round(Math.sin(t * 2) * 2);
      if (ax > -40 && ax < VW + 40) {
        L.globalAlpha = .25 + Math.sin(t * 3) * .08; R(ax - 10, ay - 10, 21, 22, '#7fe3ff'); L.globalAlpha = .12; R(ax - 16, ay - 16, 33, 34, '#7fe3ff'); L.globalAlpha = 1;
        R(ax - 1, ay - 9, 3, 1, '#ffffff'); R(ax - 2, ay - 8, 5, 2, '#bff0ff'); R(ax - 3, ay - 6, 7, 6, '#7fe3ff'); R(ax - 2, ay, 5, 3, '#4fb8e8'); R(ax - 1, ay + 3, 3, 2, '#2f86c8'); R(ax, ay + 5, 1, 1, '#2f86c8');
        R(ax - 2, ay - 6, 2, 4, '#ffffff');
        for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.09; R(ax + Math.round(Math.cos(a) * 12), ay + Math.round(Math.sin(a) * 4), 1, 1, '#ffe3a3'); }
      }
      // 출정의 문 소용돌이
      const gx = Math.round(900 - cam), gy = GROUND - 26;
      if (gx > -40 && gx < VW + 40) {
        for (let i = 0; i < 70; i++) { const a = t * 2 + i * .5, d = (i % 14) + 2; R(gx + Math.round(Math.cos(a + d * .3) * d), gy + Math.round(Math.sin(a + d * .3) * d * 1.3), 1, 1, i % 3 ? '#8f73ff' : '#d4c6ff'); }
        R(gx - 1, gy - 1, 3, 3, '#ffffff');
      }
      c = p;
    } };
}
function prop(s) {
  const X = s.x, G = GROUND;
  if (s.id === 'stele') {
    R(X - 9, G - 4, 18, 4, '#3a3348'); R(X - 7, G - 32, 14, 28, '#4a4766'); R(X - 6, G - 34, 12, 2, '#4a4766'); R(X - 4, G - 35, 8, 1, '#4a4766');
    R(X - 7, G - 32, 2, 28, '#5e5a80'); R(X + 5, G - 32, 2, 28, '#36334c');
    R(X - 2, G - 29, 4, 4, '#ffe3a3'); R(X - 1, G - 29, 3, 3, '#4a4766');
    for (let k = 0; k < 5; k++) R(X - 4, G - 22 + k * 3, 8, 1, '#36334c');
  } else if (s.id === 'codex') {
    R(X - 1, G - 18, 3, 18, '#6b4a2a'); R(X - 6, G - 2, 13, 2, '#4a3320');
    R(X - 10, G - 24, 21, 4, '#7a5532'); R(X - 9, G - 27, 9, 3, '#f3ecd8'); R(X + 1, G - 27, 9, 3, '#e8dfc6'); R(X, G - 27, 1, 4, '#8a3a48');
    for (let k = 0; k < 3; k++) { R(X - 8, G - 27 + k, 6, 1, k === 1 ? '#bfb69c' : '#f3ecd8'); }
    R(X + 13, G - 8, 3, 8, '#efe6cf'); R(X + 14, G - 11, 1, 3, '#ffcf7a');
  } else if (s.id === 'party') {
    R(X - 1, G - 46, 2, 46, '#6b4a2a'); R(X - 6, G - 2, 12, 2, '#4a3320'); R(X - 9, G - 46, 18, 2, '#c9a24a');
    R(X - 8, G - 44, 16, 26, '#2e3f7d'); R(X - 8, G - 18, 4, 3, '#2e3f7d'); R(X - 2, G - 18, 4, 4, '#2e3f7d'); R(X + 4, G - 18, 4, 3, '#2e3f7d');
    R(X - 8, G - 44, 16, 1, '#4a5fa8');
    for (let k = 0; k < 8; k++) { R(X - 4 + k, G - 38 + k, 1, 1, '#dfe4f5'); R(X + 3 - k, G - 38 + k, 1, 1, '#dfe4f5'); }
    R(X - 2, G - 34, 4, 1, '#f3c75b'); R(X - 3, G - 33, 1, 2, '#f3c75b'); R(X - 2, G - 31, 4, 1, '#f3c75b');
  } else if (s.id === 'altar') {
    R(X - 18, G - 6, 36, 6, '#3a3348'); R(X - 14, G - 12, 28, 6, '#4a4766'); R(X - 10, G - 24, 20, 12, '#4a4766');
    R(X - 18, G - 6, 36, 1, '#5e5a80'); R(X - 14, G - 12, 28, 1, '#5e5a80'); R(X - 12, G - 26, 24, 2, '#c9a24a');
    R(X - 6, G - 21, 12, 7, '#36334c'); for (let k = 0; k < 3; k++) R(X - 4, G - 20 + k * 2, 8, 1, '#7fe3ff');
    for (const cx of [-15, 13]) { R(X + cx, G - 18, 2, 6, '#efe6cf'); R(X + cx, G - 20, 1, 2, '#ffcf7a'); }
  } else if (s.id === 'train') {
    R(X - 16, G - 34, 2, 34, '#6b4a2a'); R(X + 14, G - 34, 2, 34, '#6b4a2a'); R(X - 18, G - 36, 36, 3, '#7a5532'); R(X - 18, G - 14, 36, 2, '#5a3a22');
    for (let k = 0; k < 18; k++) R(X - 10, G - 32 + k, 1, 1, k < 14 ? '#cfd6ee' : '#6a4a2a');
    R(X - 12, G - 18, 5, 1, '#c9a24a');
    for (let k = 0; k < 26; k++) R(X - 2, G - 34 + k, 1, 1, '#7a5532'); R(X - 3, G - 36, 3, 4, '#e4f0ff');
    for (let i = -10; i <= 10; i++) { const t = i / 10; R(X + 8 + Math.round((1 - t * t) * 3), G - 22 + i, 1, 1, '#8a5a3a'); } R(X + 8, G - 32, 1, 21, '#e8e2ff');
  } else if (s.id === 'gate') {
    for (let a = 0; a < 6.283; a += .02) {
      for (let rr = 20; rr <= 24; rr++) { const px = X + Math.round(Math.cos(a) * rr), py = G - 26 + Math.round(Math.sin(a) * rr * 1.25); if (py < G) R(px, py, 1, 1, rr === 20 ? '#2a2148' : rr === 24 ? '#5e5a80' : '#4a4766'); }
    }
    R(X - 28, G - 4, 56, 4, '#3a3348'); R(X - 28, G - 4, 56, 1, '#5e5a80');
    R(X - 2, G - 59, 4, 3, '#c9a24a');
  }
}
