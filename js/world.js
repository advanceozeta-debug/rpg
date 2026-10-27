// 월하검무 — 전투·이동 엔진 (거점과 스테이지가 함께 씀)
import { VW, VH, GROUND, HERO, WEAPONS, SKILLS, ENEMIES, heroStats, endlessWave, endlessScale } from './data.js';
import * as Art from './art.js';
import { sfx } from './audio.js';

const rnd = Math.random;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
export const FONT = { d: '"Do Hyeon","Apple SD Gothic Neo","Malgun Gothic",sans-serif', b: '"Gowun Dodum","Apple SD Gothic Neo","Malgun Gothic",sans-serif', p: '"Silkscreen",ui-monospace,monospace' };

function makeHero(entry) {
  const def = HERO[entry.id], st = heroStats(def, entry.lv, entry.aw);
  return { id: def.id, def, lv: entry.lv, aw: entry.aw, maxHp: st.hp, hp: st.hp, hpLag: st.hp, atk: st.atk,
    x: 0, y: GROUND, vx: 0, vy: 0, face: 1, onGround: true, state: 'idle', anim: 0,
    combo: 0, atkT: 0, atkDur: 0, step: null, hitDone: true, atkBuf: 0, jumpBuf: 0, lastAtk: -9,
    dashT: 0, dashCD: 0, dashSpeed: 270, dashHit: null, airDash: true, hurtT: 0, inv: 0, jumps: 0,
    cdE: 0, cdQ: 0, buffT: 0, spinT: 0, spinTick: 0, skillT: 0, dropT: 0, dead: false };
}

export class World {
  constructor(o) {
    this.mode = o.mode; this.bg = o.bg; this.width = o.bg.width; this.plats = o.bg.plats;
    this.settings = o.settings; this.cb = o.cb || {}; this.stage = o.stage || null;
    this.cam = 0; this.t = 0; this.hitstop = 0; this.shake = 0; this.sx = 0; this.sy = 0;
    this.enemies = []; this.shots = []; this.parts = []; this.nums = []; this.drops = []; this.fx = []; this.ghosts = []; this.delayed = [];
    this.banner = null; this.wave = 0; this.spawnQ = []; this.spawnT = 0; this.waveState = 'intro'; this.waveT = 1.3;
    this.run = { silver: 0, moon: 0, kills: 0, time: 0, wave: 0 }; this.done = false; this.deathT = 0;
    this.endless = !!o.endless; this.waves = o.waves || []; this.scale = this.stage ? this.stage.scale : 1;
    this.party = o.party.filter(Boolean).map(makeHero); this.active = 0; this.tagCD = 0;
    this.stations = o.stations || []; this.near = null;
    const h = this.hero; h.x = o.startX ?? 60; h.face = 1;
    this.cam = clamp(h.x - VW / 2, 0, this.width - VW);
    this.petals = Array.from({ length: 18 }, () => ({ x: rnd() * VW, y: rnd() * VH, v: 8 + rnd() * 10, s: rnd() * 6, c: rnd() < .6 ? '#ffb3cf' : '#fff1f7' }));
    this.dps = { log: [], total: 0 };
    if (this.mode === 'hub') { this.enemies.push(this.makeEnemy('dummy', 770, 1)); this.waveState = 'none'; }
  }
  get hero() { return this.party[this.active]; }
  get partner() { return this.party.length > 1 ? this.party[1 - this.active] : null; }

  /* ---------- 공용 ---------- */
  say(text, sub, dur = 1.7) { this.banner = { text, sub, t: dur, max: dur }; }
  num(x, y, v, col, big) { if (this.settings.nums) this.nums.push({ x, y, v, col, big, t: .8 }); }
  burst(x, y, n, cols, spd = 90, grav = 200, life = .5) {
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, s = spd * (.3 + rnd() * .7); this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, g: grav, life: life * (.6 + rnd() * .6), max: life, col: cols[rnd() * cols.length | 0], sz: rnd() < .3 ? 2 : 1 }); }
  }
  addShake(v) { this.shake = Math.max(this.shake, v * this.settings.shake); }
  later(t, fn) { this.delayed.push({ t, fn }); }

  makeEnemy(type, x, sc) {
    const d = ENEMIES[type];
    const e = { type, d, x, y: GROUND, vx: 0, vy: 0, face: -1, hp: d.hp * sc, max: d.hp * sc, dmg: d.dmg * (1 + (sc - 1) * .55),
      w: d.w, h: d.h, flash: 0, stun: 0, t: rnd() * 5, squash: 0, onGround: true, ai: 'walk', aiT: 0, hopT: .4 + rnd(), alt: sc > 2.5 && rnd() < .5,
      shootT: 1.5 + rnd(), swingHit: false, super: !!(d.elite || d.boss || type === 'dummy') };
    if (d.fly) { e.y = GROUND - 40 - rnd() * 20; e.baseY = GROUND - 30 - rnd() * 30; e.onGround = false; e.swoopT = 2 + rnd() * 2; }
    if (type === 'eclipse') { e.ai = 'idle'; e.aiT = 1.2; }
    return e;
  }
  spawn(type) {
    const h = this.hero;
    let x = rnd() < .5 ? this.cam - 12 : this.cam + VW + 12;
    x = clamp(x, 12, this.width - 12);
    if (Math.abs(x - h.x) < 90) x = h.x < this.width / 2 ? Math.min(this.width - 12, h.x + 180) : Math.max(12, h.x - 180);
    const e = this.makeEnemy(type, x, this.scale);
    this.enemies.push(e);
    this.burst(x, e.y - 8, 8, ['#2b2160', '#8f73ff', '#120c22'], 50, 0, .4);
    if (e.d.boss) { this.say('BOSS', e.d.name, 2.2); this.cb.bossBgm?.(); }
    else if (e.d.elite) this.say('ELITE', e.d.name, 1.4);
  }
  box(e) { return [e.x - e.w, e.y - e.h, e.x + e.w, e.y]; }
  heroBox() { const h = this.hero; return [h.x - 4, h.y - 24, h.x + 4, h.y]; }

  /* ---------- 피해 ---------- */
  dmgOf(h, mul) { return h.atk * mul * (h.buffT > 0 ? 1.4 : 1); }
  damage(e, base, dir, o = {}) {
    if (e.dead) return;
    const crit = rnd() < .15, d = Math.max(1, Math.round(base * (crit ? 1.8 : 1) * (.9 + rnd() * .2)));
    e.hp -= d; e.flash = .1;
    this.num(e.x + (rnd() - .5) * 6, e.y - e.h - 2, d, crit ? '#ffe08a' : '#ffffff', crit);
    this.burst(e.x - dir * 2, e.y - e.h / 2, crit ? 9 : 5, ['#ffffff', '#7fe3ff', '#ffe3a3'], 110, 120, .3);
    sfx(crit ? 'crit' : 'hit');
    if (e.type === 'dummy') { this.dps.log.push([this.t, d]); this.dps.total += d; e.hp = e.max; return; }
    if (e.super) { if (e.ai === 'rest' || e.ai === 'idle') { e.vx = dir * 60; } }
    else {
      e.vx = dir * (o.kb ?? (o.heavy ? 190 : 130));
      e.vy = o.launch ? -270 : (e.d.fly ? -40 : -100);
      e.stun = o.launch ? .7 : o.heavy ? .45 : .28; e.onGround = false;
    }
    if (e.hp <= 0) this.kill(e);
  }
  kill(e) {
    e.dead = true; this.run.kills++;
    const boss = e.d.boss;
    this.burst(e.x, e.y - e.h / 2, boss ? 50 : e.d.elite ? 30 : 16,
      e.type === 'wisp' ? ['#8f73ff', '#ece6ff', '#b9a6ff'] : boss ? ['#ffd36b', '#8f73ff', '#2b2050', '#ffffff'] : e.type === 'knight' ? ['#ff4d6d', '#524a78', '#ffe3a3'] : ['#5fd3b4', '#b8f5e4', '#b48cff'], 130, 160, .7);
    const n = Math.max(1, Math.round(e.d.silver * Math.sqrt(this.scale) / 4));
    for (let i = 0; i < Math.min(n, 12); i++) this.drops.push({ kind: 'coin', v: Math.round(e.d.silver * Math.sqrt(this.scale) / Math.min(n, 12)), x: e.x + (rnd() - .5) * 10, y: e.y - e.h / 2, vx: (rnd() - .5) * 80, vy: -100 - rnd() * 80, t: 0 });
    if (boss || rnd() < .12) this.drops.push({ kind: 'heart', big: boss || e.d.elite, x: e.x, y: e.y - e.h / 2, vx: 0, vy: -120, t: 0 });
    if (boss) { this.addShake(6); this.hitstop = .2; }
  }
  aoe(h, x, y, r, mul, o = {}) {
    let n = 0;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const cx = clamp(x, e.x - e.w, e.x + e.w), cy = clamp(y, e.y - e.h, e.y);
      if (Math.hypot(cx - x, cy - y) <= r) { this.damage(e, this.dmgOf(h, mul), Math.sign(e.x - x) || h.face, o); n++; }
    }
    return n;
  }
  hurtHero(d, fromX) {
    const h = this.hero;
    if (!h || h.dead || h.inv > 0 || h.dashT > 0 || this.done) return;
    d = Math.round(d);
    h.hp -= d; this.num(h.x, h.y - 28, d, '#ff6b9a', false);
    h.inv = 1; h.hurtT = .28; h.vx = Math.sign(h.x - fromX || -h.face) * 150; h.vy = -160; h.onGround = false;
    h.atkT = 0; h.skillT = 0; h.spinT = 0;
    this.addShake(5); this.hitstop = .07; sfx('hurt');
    this.burst(h.x, h.y - 14, 10, ['#ff6b9a', '#ffffff'], 100, 200, .4);
    if (h.hp <= 0) {
      h.hp = 0; h.dead = true; this.deathT = 1.1;
      this.burst(h.x, h.y - 14, 40, ['#ffb3cf', '#fff1f7', h.def.pal.acc, h.def.pal.hair], 120, -20, 1.2);
    }
  }

  /* ---------- 스킬 ---------- */
  cast(h, slot, dir) {
    const type = slot === 'e' ? h.def.e : h.def.q, S = SKILLS[type];
    if (slot === 'e') h.cdE = S.cd; else h.cdQ = S.cd;
    if (dir) h.face = dir;
    h.skillT = .3; h.atkT = 0; sfx('skill');
    const acc = h.def.pal.acc, f = h.face, dmg = this.dmgOf(h, S.mul);
    switch (type) {
      case 'wave': this.shots.push({ team: 1, kind: 'wave', x: h.x + f * 10, y: h.y - 13, vx: f * 240, vy: 0, life: .9, dmg, pierce: true, hits: new Set(), w: 6, h: 10, col: acc, heavy: true }); break;
      case 'dashslash': h.dashT = .22; h.dashSpeed = 400; h.inv = .4; h.dashHit = new Set(); h.dashDmg = dmg; h.skillT = 0; break;
      case 'spin': h.spinT = 1; h.spinTick = 0; h.skillT = 0; break;
      case 'bolt': for (const a of [-.16, 0, .16]) this.shots.push({ team: 1, kind: h.def.weapon === 'bow' ? 'arrow' : 'orb', x: h.x + f * 8, y: h.y - 14, vx: f * 300 * Math.cos(a), vy: 300 * Math.sin(a), life: .7, dmg, w: 3, h: 3, col: acc }); break;
      case 'nova': {
        const nx = h.x + f * 26, ny = h.y - 16; h.skillT = .45;
        this.fx.push({ kind: 'charge', x: nx, y: ny, life: .35, max: .35, col: acc });
        this.later(.35, () => { this.fx.push({ kind: 'ring', x: nx, y: ny, r0: 6, r1: 50, life: .35, max: .35, col: acc }); this.burst(nx, ny, 26, [acc, '#ffffff', '#ffe3a3'], 160, 60, .5); if (this.aoe(h, nx, ny, 48, S.mul, { heavy: true })) this.hitstop = .1; this.addShake(5); sfx('boom'); });
        break;
      }
      case 'rain': for (let i = 0; i < 10; i++) this.later(i * .07, () => { this.shots.push({ team: 1, kind: h.def.weapon === 'bow' ? 'fallarrow' : 'fallblade', x: h.x + f * (24 + rnd() * 96), y: h.y - 90, vx: f * 30, vy: 360, life: .6, dmg, w: 4, h: 6, col: acc }); sfx('shoot'); }); break;
      case 'heal': for (const p of this.party) if (!p.dead) { const v = Math.round(p.maxHp * .25); p.hp = Math.min(p.maxHp, p.hp + v); if (p === h) this.num(h.x, h.y - 32, '+' + v, '#7dffb4', false); }
        this.fx.push({ kind: 'ring', x: h.x, y: h.y - 14, r0: 4, r1: 34, life: .4, max: .4, col: '#7dffb4' }); this.burst(h.x, h.y - 14, 18, ['#ffb3cf', '#7dffb4', '#ffffff'], 70, -40, .8); this.aoe(h, h.x, h.y - 14, 34, S.mul); sfx('heal'); break;
      case 'buff': h.buffT = 7; this.fx.push({ kind: 'ring', x: h.x, y: h.y - 14, r0: 20, r1: 4, life: .4, max: .4, col: '#ffd36b' }); this.burst(h.x, h.y - 10, 16, ['#ffd36b', '#ffffff'], 60, -80, .7); break;
      case 'uppercut': {
        const bx = [f > 0 ? h.x : h.x - 28, h.y - 40, f > 0 ? h.x + 28 : h.x, h.y + 2]; let any = 0;
        for (const e of this.enemies) if (!e.dead && hit(bx, this.box(e))) { this.damage(e, dmg, f, { launch: true, heavy: true }); any++; }
        h.vy = -270; h.onGround = false; h.jumps = 1; h.skillT = .25;
        this.fx.push({ kind: 'arc', x: h.x + f * 2, y: h.y - 10, face: f, a0: 1.4, a1: -1.6, r0: 14, r1: 22, life: .22, max: .22, col: acc });
        if (any) { this.hitstop = .09; this.addShake(3); }
        break;
      }
      case 'chain': {
        const list = this.enemies.filter(e => !e.dead && Math.abs(e.x - h.x) < 160).sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x)).slice(0, 4);
        list.forEach((e, i) => this.later(i * .06, () => { if (e.dead) return; this.fx.push({ kind: 'bolt', x: e.x, y: e.y - e.h / 2, life: .25, max: .25, col: acc, seed: rnd() * 1000 }); this.damage(e, dmg, Math.sign(e.x - h.x) || f, { heavy: true }); sfx('zap'); }));
        if (!list.length) this.fx.push({ kind: 'ring', x: h.x + f * 20, y: h.y - 14, r0: 2, r1: 16, life: .25, max: .25, col: acc });
        break;
      }
    }
  }
  doStep(h) {
    const st = h.step, f = h.face, dmg = this.dmgOf(h, st.mul);
    if (st.kind === 'shot') {
      const k = st.shot, sp = k === 'arrow' ? 330 : k === 'orb' ? 220 : 190;
      this.shots.push({ team: 1, kind: k, x: h.x + f * 10, y: h.y - 14, vx: f * sp, vy: 0, life: k === 'arrow' ? .7 : .9, dmg, pierce: !!st.pierce, hits: new Set(), w: k === 'bigorb' ? 6 : 3, h: k === 'bigorb' ? 6 : 3, col: h.def.pal.acc, heavy: st.heavy, boom: k === 'bigorb' ? 22 : 0 });
      sfx('shoot'); return;
    }
    const reach = st.reach, top = h.y - st.h + (st.kind === 'thrust' ? -10 : 2);
    const bx = [f > 0 ? h.x + 2 : h.x - reach, top, f > 0 ? h.x + reach : h.x - 2, top + st.h];
    let any = 0;
    for (const e of this.enemies) if (!e.dead && hit(bx, this.box(e))) { this.damage(e, dmg, f, { heavy: st.heavy }); any++; }
    if (st.kind === 'thrust') this.fx.push({ kind: 'thrust', x: h.x + f * 8, y: h.y - 14, face: f, len: reach - 6, life: .14, max: .14, col: h.def.pal.acc });
    else this.fx.push({ kind: 'arc', x: h.x + f, y: h.y - 14, face: f, a0: st.arc[0], a1: st.arc[1], r0: reach - 12, r1: reach - 6, life: h.atkDur * .7, max: h.atkDur * .7, col: h.def.pal.acc, heavy: st.heavy });
    sfx(st.heavy ? 'heavy' : 'swing');
    if (any) { this.hitstop = st.heavy ? .08 : .04; this.addShake(st.shake || (st.heavy ? 3 : 1.5)); }
  }

  /* ---------- 교대 ---------- */
  trySwap() {
    const p = this.partner;
    if (!p || p.dead || this.tagCD > 0 || this.hero.dead || this.done) return false;
    this.swap(false); return true;
  }
  swap(forced) {
    const o = this.hero, n = this.partner;
    Object.assign(n, { x: o.x, y: forced ? Math.min(o.y, GROUND) : o.y, vx: 0, vy: forced ? -120 : Math.min(0, o.vy), face: o.face, onGround: false, state: 'jump', anim: 0, atkT: 0, dashT: 0, skillT: 0, spinT: 0, hurtT: 0, inv: 1 });
    this.active = 1 - this.active; this.tagCD = forced ? 3 : 6;
    this.fx.push({ kind: 'ring', x: n.x, y: n.y - 14, r0: 4, r1: 36, life: .3, max: .3, col: n.def.pal.acc });
    this.burst(n.x, n.y - 14, 20, [n.def.pal.acc, '#ffffff', n.def.pal.hair], 120, 40, .5);
    if (this.aoe(n, n.x, n.y - 14, 36, 1.8, { heavy: true })) this.hitstop = .12;
    this.addShake(3); sfx('tag');
    if (forced) this.say(n.def.name, '교대 출전!', 1.2);
  }

  /* ---------- 갱신 ---------- */
  update(dt, I) {
    this.t += dt;
    for (const s of this.bg.stars) s.p += dt;
    if (this.hitstop > 0) { this.hitstop -= dt; this.updFx(dt * .15); return; }
    if (!this.done) this.run.time += dt;
    this.updHero(dt, I); this.updEnemies(dt); this.updShots(dt); this.updDrops(dt); this.updFx(dt);
    for (const d of this.delayed) { d.t -= dt; if (d.t <= 0) { d.fn(); d.done = true; } }
    this.delayed = this.delayed.filter(d => !d.done);
    if (this.mode === 'hub') this.updHub(I); else this.updWaves(dt);
    const h = this.hero, tc = clamp(h.x - VW / 2 + h.face * 24, 0, this.width - VW);
    this.cam += (tc - this.cam) * Math.min(1, dt * 5);
  }
  updHero(dt, I) {
    const h = this.hero; if (!h) return;
    this.tagCD -= dt;
    for (const p of this.party) { p.cdE -= dt; p.cdQ -= dt; p.hpLag += (p.hp - p.hpLag) * Math.min(1, dt * 3); }
    if (h.dead) {
      this.deathT -= dt;
      if (this.deathT <= 0 && !this.done) {
        const p = this.partner;
        if (p && !p.dead) this.swap(true);
        else { this.done = true; this.later(.8, () => this.cb.defeat?.(this.run)); }
      }
      return;
    }
    h.dashCD -= dt; h.inv -= dt; h.atkBuf -= dt; h.jumpBuf -= dt; h.dropT -= dt; h.buffT -= dt;
    if (I.pressed.attack) h.atkBuf = .2;
    if (I.pressed.jump) h.jumpBuf = .12;
    if (I.pressed.tag) { if (this.trySwap()) return; }
    const dir = (I.held.right ? 1 : 0) - (I.held.left ? 1 : 0);
    const speed = h.buffT > 0 ? 118 : 96;
    if (h.atkT > 0) { h.atkT -= dt; if (h.atkT <= 0) h.lastAtk = this.t; }
    if (h.skillT > 0) h.skillT -= dt;
    if (h.spinT > 0) {
      h.spinT -= dt; h.spinTick -= dt;
      if (h.spinTick <= 0) { h.spinTick = .12; this.aoe(h, h.x, h.y - 14, 28, SKILLS.spin.mul, { kb: 70 }); this.fx.push({ kind: 'ring', x: h.x, y: h.y - 14, r0: 26, r1: 28, life: .1, max: .1, col: h.def.pal.acc }); sfx('swing'); }
    }
    if (h.hurtT > 0) h.hurtT -= dt;
    else if (h.dashT > 0) {
      h.dashT -= dt; h.vx = h.face * h.dashSpeed; h.vy = 0;
      if (Math.floor(h.dashT * 60) % 2 === 0) this.ghosts.push({ x: h.x, y: h.y, face: h.face, life: .22, snap: { ...h } });
      if (h.dashHit) for (const e of this.enemies) if (!e.dead && !h.dashHit.has(e) && hit([h.x - 10, h.y - 26, h.x + 10, h.y], this.box(e))) { h.dashHit.add(e); this.damage(e, h.dashDmg, h.face, { heavy: true }); this.hitstop = Math.max(this.hitstop, .05); }
      if (h.dashT <= 0 && h.dashHit) { h.dashHit = null; this.fx.push({ kind: 'slashline', x: h.x, y: h.y - 14, face: h.face, len: 90, life: .25, max: .25, col: h.def.pal.acc }); }
    } else {
      if (I.pressed.dash && h.dashCD <= 0 && (h.onGround || h.airDash)) {
        if (!h.onGround) h.airDash = false;
        h.dashT = .16; h.dashSpeed = 270; h.dashHit = null; h.dashCD = .45; h.inv = Math.max(h.inv, .22); h.atkT = 0; h.spinT = 0; if (dir) h.face = dir; sfx('dash');
      } else if (I.pressed.skill1 && h.cdE <= 0 && h.skillT <= 0) this.cast(h, 'e', dir);
      else if (I.pressed.skill2 && h.cdQ <= 0 && h.skillT <= 0) this.cast(h, 'q', dir);
      else if (I.pressed.skill1 || I.pressed.skill2) sfx('no');
      const steps = WEAPONS[h.def.weapon].steps;
      if (h.atkBuf > 0 && h.skillT <= 0 && h.spinT <= 0 && h.dashT <= 0 && (h.atkT <= 0 || h.atkT < h.atkDur * .4)) {
        h.combo = (h.atkT > 0 || this.t - h.lastAtk < .32) ? (h.combo + 1) % steps.length : 0;
        h.step = steps[h.combo]; h.atkDur = h.step.dur; h.atkT = h.atkDur; h.hitDone = false; h.atkBuf = 0;
        if (dir) h.face = dir;
        if (h.onGround && h.step.lunge) h.vx = h.face * h.step.lunge;
      }
      const busy = h.atkT > 0 || h.skillT > 0;
      if (busy && h.onGround) h.vx *= Math.pow(.0005, dt);
      else { const tv = dir * speed * (h.spinT > 0 ? .7 : 1); h.vx += (tv - h.vx) * Math.min(1, dt * (h.onGround ? 16 : 8)); if (dir && !busy) h.face = dir; }
      if (h.jumpBuf > 0 && h.skillT <= 0) {
        if (I.held.down && h.onGround && h.y < GROUND - 1) { h.dropT = .25; h.jumpBuf = 0; h.onGround = false; h.y += 1; }
        else if (h.onGround || h.jumps < 2) {
          const second = !h.onGround; h.vy = second ? -240 : -275; h.jumps = second ? 2 : 1; h.onGround = false; h.jumpBuf = 0; sfx('jump');
          if (second) this.burst(h.x, h.y - 2, 8, ['#e9edfb', h.def.pal.acc], 60, 60, .35);
        }
      }
    }
    if (h.atkT > 0 && !h.hitDone && h.step && h.atkDur - h.atkT >= h.step.hitAt) { h.hitDone = true; this.doStep(h); }
    if (h.dashT <= 0) { h.vy += 900 * dt; if (!I.held.jump && h.vy < -110 && h.hurtT <= 0 && h.skillT <= 0) h.vy += 1100 * dt; if (h.vy > 420) h.vy = 420; }
    if (h.hurtT > 0) h.vx *= Math.pow(.05, dt);
    h.x = clamp(h.x + h.vx * dt, 6, this.width - 6);
    const py = h.y; h.y += h.vy * dt; const was = h.onGround; h.onGround = false;
    if (h.vy >= 0) {
      if (h.y >= GROUND) { h.y = GROUND; h.vy = 0; h.onGround = true; }
      else if (h.dropT <= 0) for (const p of this.plats) if (py <= p.y + .5 && h.y >= p.y && h.x > p.x - 3 && h.x < p.x + p.w + 3) { h.y = p.y; h.vy = 0; h.onGround = true; break; }
    }
    if (h.onGround) { h.jumps = 0; h.airDash = true; if (!was) this.burst(h.x, h.y, 4, ['#9c8fd0', '#e9edfb'], 30, 60, .25); }
    else if (h.jumps === 0) h.jumps = 1;
    const st = h.hurtT > 0 ? 'hurt' : h.dashT > 0 ? 'dash' : h.spinT > 0 ? 'spin' : h.skillT > 0 ? 'skill' : h.atkT > 0 ? 'attack' : !h.onGround ? (h.vy < 0 ? 'jump' : 'fall') : Math.abs(h.vx) > 12 ? 'run' : 'idle';
    if (st !== h.state) { h.state = st; h.anim = 0; }
    h.anim += dt;
  }
  updEnemies(dt) {
    const h = this.hero, hb = this.heroBox(), alive = h && !h.dead && !this.done;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.t += dt; e.flash -= dt; e.squash -= dt;
      const dx = h.x - e.x, toward = Math.sign(dx) || 1;
      switch (e.type) {
        case 'dummy': e.face = -1; break;
        case 'slime':
          if (e.stun > 0) e.stun -= dt;
          else if (e.onGround) { e.face = toward; e.hopT -= dt; e.vx *= Math.pow(.02, dt); if (e.hopT <= 0 && alive) { e.vy = -150 - rnd() * 70; e.vx = toward * (45 + rnd() * 25); e.hopT = .8 + rnd() * .7; e.onGround = false; } }
          e.vy += 700 * dt; break;
        case 'wisp': {
          if (e.stun > 0) { e.stun -= dt; e.vx *= Math.pow(.1, dt); e.vy *= Math.pow(.1, dt); }
          else { e.face = toward; const tv = alive ? toward * 40 : 0; e.vx += (tv - e.vx) * dt * 2; }
          const ty = e.baseY + Math.sin(e.t * 3) * 7 + (Math.abs(dx) < 60 && alive ? (h.y - 16 - e.baseY) * .6 : 0);
          e.vy += ((ty - e.y) * 4 - e.vy) * Math.min(1, dt * 4); break;
        }
        case 'bat': {
          if (e.stun > 0) { e.stun -= dt; e.vx *= Math.pow(.1, dt); e.vy *= Math.pow(.1, dt); break; }
          e.face = toward;
          if (e.ai === 'swoop') { e.aiT -= dt; if (e.aiT <= 0) { e.ai = 'walk'; e.swoopT = 1.8 + rnd() * 1.5; } }
          else {
            e.swoopT -= dt;
            const tx = h.x - toward * 50, ty = e.baseY + Math.sin(e.t * 4) * 5;
            e.vx += ((tx - e.x) * 2 - e.vx) * Math.min(1, dt * 3); e.vy += ((ty - e.y) * 3 - e.vy) * Math.min(1, dt * 3);
            if (e.swoopT <= 0 && alive && Math.abs(dx) < 120) { e.ai = 'swoop'; e.aiT = .7; const a = Math.atan2(h.y - 12 - e.y, dx); e.vx = Math.cos(a) * 190; e.vy = Math.sin(a) * 190; }
          }
          break;
        }
        case 'archer': {
          e.vy += 700 * dt;
          if (e.stun > 0) { e.stun -= dt; break; }
          e.face = toward;
          if (e.ai === 'aim') { e.vx = 0; e.aiT -= dt; if (e.aiT <= 0) { e.ai = 'walk'; e.shootT = 1.8 + rnd(); const a = Math.atan2(h.y - 14 - (e.y - 16), dx); this.shots.push({ team: 2, kind: 'earrow', x: e.x + e.face * 8, y: e.y - 16, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, life: 1.6, dmg: e.dmg, w: 3, h: 2 }); sfx('shoot'); } }
          else {
            const want = Math.abs(dx) < 70 ? -toward : Math.abs(dx) > 130 ? toward : 0;
            e.vx = alive ? want * 38 : 0; e.shootT -= dt;
            if (e.shootT <= 0 && alive && Math.abs(dx) < 200) { e.ai = 'aim'; e.aiT = .55; }
          }
          break;
        }
        case 'knight':
          if (e.stun > 0) e.stun -= dt;
          e.vy += 700 * dt;
          if (e.ai === 'walk') { e.face = toward; e.vx = alive ? toward * 30 : 0; if (Math.abs(dx) < 38 && alive) { e.ai = 'wind'; e.aiT = .6; e.vx = 0; } }
          else if (e.ai === 'wind') { e.vx = 0; e.aiT -= dt; if (e.aiT <= 0) { e.ai = 'swing'; e.aiT = .28; e.swingHit = false; e.vx = e.face * 95; } }
          else if (e.ai === 'swing') {
            e.vx *= Math.pow(.02, dt); e.aiT -= dt;
            if (!e.swingHit && e.aiT < .18) { e.swingHit = true; this.addShake(3); if (hit([e.face > 0 ? e.x : e.x - 38, e.y - 36, e.face > 0 ? e.x + 38 : e.x, e.y], hb)) this.hurtHero(e.dmg * 1.8, e.x); this.burst(e.x + e.face * 28, e.y - 4, 8, ['#8f95b8', '#d3d8f0'], 70, 200, .35); }
            if (e.aiT <= 0) { e.ai = 'rest'; e.aiT = .75; }
          } else { e.vx *= Math.pow(.02, dt); e.aiT -= dt; if (e.aiT <= 0) e.ai = 'walk'; }
          break;
        case 'eclipse': this.updBoss(e, dt, dx, toward, alive); break;
      }
      e.x = clamp(e.x + e.vx * dt, 8, this.width - 8); e.y += e.vy * dt;
      if (e.d.fly) { if (e.stun > 0) e.vy += 300 * dt; if (e.y > GROUND - 4) { e.y = GROUND - 4; e.vy = -Math.abs(e.vy) * .5; } if (e.y < 20) e.y = 20; }
      else if (e.y >= GROUND) { if (!e.onGround) e.squash = .15; e.y = GROUND; e.vy = 0; e.onGround = true; if (e.type === 'slime' && e.stun <= 0) e.vx *= .5; if (e.type === 'eclipse' && e.ai === 'leap') this.bossLand(e); }
      if (e.type !== 'dummy' && alive && hit(hb, this.box(e))) this.hurtHero(e.dmg * (e.ai === 'charge' ? 1.6 : 1), e.x);
    }
    this.enemies = this.enemies.filter(e => !e.dead);
  }
  updBoss(e, dt, dx, toward, alive) {
    const rage = e.hp < e.max * .5, sp = rage ? 1.35 : 1;
    e.vy += 800 * dt; e.aiT -= dt * sp;
    switch (e.ai) {
      case 'idle': e.face = toward; e.vx = alive ? toward * 26 : 0;
        if (e.aiT <= 0 && alive) {
          const r = rnd();
          if (r < .38) { e.ai = 'chargePrep'; e.aiT = .7; e.vx = 0; }
          else if (r < .72) { e.ai = 'leapPrep'; e.aiT = .5; e.vx = 0; }
          else { e.ai = 'howl'; e.aiT = .9; e.vx = 0; this.addShake(4); sfx('boom'); const n = rage ? 3 : 2; for (let i = 0; i < n; i++) this.later(.3 + i * .2, () => { const w = this.makeEnemy(rnd() < .5 ? 'wisp' : 'bat', e.x + (rnd() - .5) * 60, this.scale * .7); w.y = e.y - 40; this.enemies.push(w); this.burst(w.x, w.y, 8, ['#8f73ff', '#2b2160'], 50, 0, .4); }); }
        }
        break;
      case 'chargePrep': e.vx = 0; if (Math.floor(e.t * 20) % 2) this.parts.push({ x: e.x - e.face * 14, y: e.y - 2, vx: -e.face * 40, vy: -20, g: 0, life: .3, max: .3, col: '#8f73ff', sz: 1 }); if (e.aiT <= 0) { e.ai = 'charge'; e.aiT = 1.1; sfx('dash'); } break;
      case 'charge': e.vx = e.face * 250; if (Math.floor(e.t * 30) % 2) this.ghosts.push({ enemy: true, e: { ...e }, life: .18 }); if (e.aiT <= 0 || e.x <= 10 || e.x >= this.width - 10) { e.ai = 'rest'; e.aiT = .9; this.addShake(4); } break;
      case 'leapPrep': e.vx = 0; e.face = toward; if (e.aiT <= 0) { e.ai = 'leap'; e.vy = -360; e.vx = clamp(dx * 1.4, -230, 230); e.onGround = false; sfx('jump'); } break;
      case 'leap': break;
      case 'howl': if (e.aiT <= 0) { e.ai = 'idle'; e.aiT = 1.6; } break;
      case 'rest': e.vx *= Math.pow(.02, dt); if (e.aiT <= 0) { e.ai = 'idle'; e.aiT = rage ? .8 : 1.4; } break;
    }
  }
  bossLand(e) {
    e.ai = 'rest'; e.aiT = .8; e.vx = 0; this.addShake(7); sfx('boom');
    this.burst(e.x, e.y, 20, ['#8f73ff', '#2b2050', '#ffd36b'], 120, 200, .5);
    for (const d of [-1, 1]) this.shots.push({ team: 2, kind: 'shock', x: e.x + d * 14, y: GROUND - 5, vx: d * 170, vy: 0, life: 1.3, dmg: e.dmg * 1.3, w: 5, h: 5 });
  }
  updShots(dt) {
    const hb = this.heroBox();
    for (const s of this.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (s.kind === 'earrow') s.vy += 60 * dt;
      const b = [s.x - s.w, s.y - s.h, s.x + s.w, s.y + s.h];
      if (s.team === 1) {
        if (s.kind === 'fallarrow' || s.kind === 'fallblade') { if (s.y >= GROUND - 2) { s.life = 0; this.burst(s.x, GROUND - 2, 3, [s.col, '#ffffff'], 40, 200, .2); } }
        for (const e of this.enemies) {
          if (e.dead || (s.hits && s.hits.has(e))) continue;
          if (hit(b, this.box(e))) {
            if (s.boom) { this.aoe({ atk: s.dmg, buffT: 0 }, s.x, s.y, s.boom, 1, { heavy: true }); this.fx.push({ kind: 'ring', x: s.x, y: s.y, r0: 4, r1: s.boom, life: .25, max: .25, col: s.col }); s.life = 0; sfx('boom'); break; }
            this.damage(e, s.dmg, Math.sign(s.vx) || 1, { heavy: s.heavy });
            if (s.pierce) s.hits.add(e); else { s.life = 0; break; }
          }
        }
        if (s.kind === 'wave' && rnd() < .6) this.parts.push({ x: s.x - Math.sign(s.vx) * 4, y: s.y + (rnd() - .5) * 14, vx: -s.vx * .1, vy: 0, g: 0, life: .25, max: .25, col: s.col, sz: 1 });
      } else if (this.hero && !this.hero.dead && hit(b, hb)) { this.hurtHero(s.dmg, s.x - s.vx); s.life = 0; }
      if (s.kind === 'shock' && rnd() < .7) this.parts.push({ x: s.x, y: GROUND - 1, vx: (rnd() - .5) * 30, vy: -40 - rnd() * 40, g: 200, life: .3, max: .3, col: rnd() < .5 ? '#8f73ff' : '#ffd36b', sz: 1 });
    }
    this.shots = this.shots.filter(s => s.life > 0 && s.x > -20 && s.x < this.width + 20 && s.y < VH + 10);
  }
  updDrops(dt) {
    const h = this.hero;
    for (const d of this.drops) {
      d.t += dt; d.vy += 500 * dt; d.x += d.vx * dt; d.vx *= Math.pow(.2, dt); d.y += d.vy * dt;
      if (d.y > GROUND - 3) { d.y = GROUND - 3; d.vy = -d.vy * .3; if (Math.abs(d.vy) < 20) d.vy = 0; }
      if (!h || h.dead) continue;
      const dx = h.x - d.x, dy = h.y - 10 - d.y, dist = Math.hypot(dx, dy);
      if (d.kind === 'coin' && d.t > .5 && dist < 60) { d.x += dx * dt * 6; d.y += dy * dt * 6; }
      if (dist < (d.kind === 'coin' ? 10 : 12) && d.t > .3) {
        d.got = true;
        if (d.kind === 'coin') { this.run.silver += d.v; sfx('coin'); }
        else { const v = Math.round(h.maxHp * (d.big ? .4 : .15)); h.hp = Math.min(h.maxHp, h.hp + v); this.num(h.x, h.y - 30, '+' + v, '#7dffb4', false); this.burst(d.x, d.y, 10, ['#ff9bc0', '#ffffff'], 60, 0, .4); sfx('heal'); }
      }
    }
    this.drops = this.drops.filter(d => !d.got && d.t < 14);
  }
  updFx(dt) {
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.life -= dt; }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const n of this.nums) { n.t -= dt; n.y -= 22 * dt; } this.nums = this.nums.filter(n => n.t > 0);
    for (const g of this.ghosts) g.life -= dt; this.ghosts = this.ghosts.filter(g => g.life > 0);
    for (const f of this.fx) f.life -= dt; this.fx = this.fx.filter(f => f.life > 0);
    if (this.banner) { this.banner.t -= dt; if (this.banner.t <= 0) this.banner = null; }
    for (const p of this.petals) { p.s += dt; p.y += p.v * dt; p.x += Math.sin(p.s * 1.3) * 10 * dt - 6 * dt; if (p.y > VH) { p.y = -3; p.x = rnd() * VW + 40; } if (p.x < -4) p.x += VW + 8; }
    if (this.shake > 0) { this.sx = Math.round((rnd() - .5) * this.shake); this.sy = Math.round((rnd() - .5) * this.shake); this.shake = Math.max(0, this.shake - 60 * dt * .5); } else { this.sx = this.sy = 0; }
  }
  updHub(I) {
    const h = this.hero; let near = null;
    for (const s of this.stations) if (Math.abs(s.x - h.x) < 22) near = s;
    this.near = near;
    if (near && I.pressed.interact) this.cb.interact?.(near.id);
    this.dps.log = this.dps.log.filter(l => this.t - l[0] < 4);
    if (!this.dps.log.length && this.t - (this.dps.lastHit || 0) > 4) this.dps.total = 0;
    if (this.dps.log.length) this.dps.lastHit = this.t;
  }
  updWaves(dt) {
    if (this.done) return;
    if (this.waveState === 'intro') { this.waveT -= dt; if (this.waveT <= 0) this.startWave(); return; }
    if (this.waveState === 'fight') {
      if (this.spawnQ.length) { this.spawnT -= dt; if (this.spawnT <= 0 && this.enemies.length < 6 + Math.floor(this.wave / 2)) { this.spawn(this.spawnQ.shift()); this.spawnT = Math.max(.4, 1.1 - this.scale * .05); } }
      else if (!this.enemies.length) {
        this.run.wave = this.wave;
        if (this.endless) {
          this.run.silver += 20 + this.wave * 6; if (this.wave % 5 === 0) { this.run.moon += 60; }
          this.waveState = 'clear'; this.waveT = 1.8; this.say('CLEAR', this.wave % 5 === 0 ? '월석 +60' : 'HP +15%');
          for (const p of this.party) if (!p.dead) p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * .15));
        } else if (this.wave < this.waves.length) {
          this.waveState = 'clear'; this.waveT = 1.6; this.say('CLEAR', 'HP +15%');
          for (const p of this.party) if (!p.dead) p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * .15));
        } else {
          this.done = true; this.say('VICTORY', this.stage ? this.stage.name : '', 2); sfx('win');
          for (const d of this.drops) if (d.kind === 'coin') { this.run.silver += d.v; d.got = true; }
          this.later(1.6, () => this.cb.victory?.(this.run));
        }
      }
    } else if (this.waveState === 'clear') { this.waveT -= dt; if (this.waveT <= 0) this.startWave(); }
  }
  startWave() {
    this.wave++;
    if (this.endless) { this.scale = endlessScale(this.wave); this.spawnQ = endlessWave(this.wave); }
    else this.spawnQ = [...this.waves[this.wave - 1]];
    this.spawnT = .5; this.waveState = 'fight';
    if (!this.spawnQ.some(t => ENEMIES[t].boss)) this.say('WAVE ' + this.wave + (this.endless ? '' : ' / ' + this.waves.length), this.endless ? '무한 회랑' : '', 1.3);
  }

  /* ---------- 그리기 ---------- */
  draw(L, Hc, sc) {
    const cam = Math.round(this.cam), sx = this.sx, sy = this.sy, bg = this.bg;
    L.drawImage(bg.sky, 0, 0);
    for (const s of bg.stars) if (Math.sin(s.p * 2.5) > .4) { L.fillStyle = 'rgba(255,255,255,.5)'; L.fillRect(s.x - 1, s.y, 3, 1); L.fillRect(s.x, s.y - 1, 1, 3); L.fillStyle = '#fff'; L.fillRect(s.x, s.y, 1, 1); }
    L.drawImage(bg.far, Math.round(-cam * .2), 0);
    L.drawImage(bg.mid, Math.round(-cam * .5), 0);
    L.drawImage(bg.fg, -cam + sx, sy);
    bg.dyn?.(L, cam - sx, this.t);
    const X = x => Math.round(x - cam) + sx, Y = y => Math.round(y) + sy;
    // 드랍
    for (const d of this.drops) {
      if (d.t > 11 && Math.floor(d.t * 8) % 2) continue;
      const x = X(d.x), y = Y(d.y + Math.sin(d.t * 4) * (d.vy === 0 ? 1 : 0));
      if (d.kind === 'coin') { L.fillStyle = '#e8ecf9'; L.fillRect(x - 1, y - 1, 3, 3); L.fillStyle = '#aab2d0'; L.fillRect(x, y, 1, 1); L.fillStyle = '#fff'; L.fillRect(x - 1, y - 1, 1, 1); }
      else { const s = d.big ? 2 : 1; L.fillStyle = '#ff6b9a'; L.fillRect(x - 3 * s, y - 2 * s, 2 * s, 2 * s); L.fillRect(x + s, y - 2 * s, 2 * s, 2 * s); L.fillRect(x - 3 * s, y, 6 * s, 2 * s); L.fillRect(x - 2 * s, y + 2 * s, 4 * s, s); L.fillRect(x - s, y + 3 * s, 2 * s, s); L.fillStyle = '#fff'; L.fillRect(x - 2 * s, y - s, s, s); }
    }
    // 적
    for (const e of this.enemies) {
      if (!e.d.fly) { L.globalAlpha = .35; L.fillStyle = Art.OL; L.fillRect(X(e.x) - e.w, GROUND + sy, e.w * 2, 2); L.globalAlpha = 1; }
      Art.blit(L, Art.enemyArt(e), X(e.x), Y(e.y), e.face, { flash: e.flash > 0 });
      if (!e.d.boss && e.type !== 'dummy' && e.hp < e.max) { const bx = X(e.x) - 7, by = Y(e.y - e.h) - 6; L.fillStyle = Art.OL; L.fillRect(bx - 1, by - 1, 16, 3); L.fillStyle = '#2a2150'; L.fillRect(bx, by, 14, 1); L.fillStyle = e.d.elite ? '#ffb347' : '#ff6b9a'; L.fillRect(bx, by, Math.round(14 * clamp(e.hp / e.max, 0, 1)), 1); }
    }
    // 잔상
    for (const g of this.ghosts) {
      if (g.enemy) { Art.blit(L, Art.enemyArt(g.e), X(g.e.x), Y(g.e.y), g.e.face, { tint: '#8f73ff', noOutline: true, alpha: g.life * 2.5 }); continue; }
      Art.blit(L, Art.heroArt(g.snap), X(g.x), Y(g.y), g.face, { tint: g.snap.def.pal.acc, alpha: g.life * 2, noOutline: true });
    }
    // 영웅
    const h = this.hero;
    if (h && !h.dead) {
      L.globalAlpha = .35; L.fillStyle = Art.OL; L.fillRect(X(h.x) - 5, (h.onGround ? Y(h.y) : GROUND + sy), 10, 2); L.globalAlpha = 1;
      if (h.buffT > 0 && Math.floor(this.t * 10) % 2) { L.fillStyle = '#ffd36b'; L.fillRect(X(h.x) + Math.round(Math.sin(this.t * 9) * 7), Y(h.y) - 4 - Math.round((this.t * 30) % 24), 1, 2); }
      if (!(h.inv > 0 && h.dashT <= 0 && h.hurtT <= 0 && Math.floor(this.t * 16) % 2 && this.mode !== 'hub')) Art.blit(L, Art.heroArt(h), X(h.x), Y(h.y), h.face);
    }
    // 이펙트
    for (const f of this.fx) this.drawFx(L, f, X, Y);
    // 탄
    for (const s of this.shots) this.drawShot(L, s, X, Y);
    // 파티클
    for (const p of this.parts) { L.globalAlpha = clamp(p.life / p.max * 1.5, 0, 1); L.fillStyle = p.col; L.fillRect(X(p.x), Y(p.y), p.sz, p.sz); }
    L.globalAlpha = 1;
    for (const p of this.petals) { L.fillStyle = p.c; L.fillRect(Math.round(p.x), Math.round(p.y), Math.sin(p.s * 3) > 0 ? 2 : 1, 1); }

    // ---- 고해상도 레이어 ----
    Hc.setTransform(sc, 0, 0, sc, 0, 0);
    Hc.clearRect(0, 0, VW, VH);
    if (this.mode === 'hub' && !this.hideLabels) this.drawStations(Hc, X);
    for (const n of this.nums) { Hc.globalAlpha = clamp(n.t * 3, 0, 1); txt(Hc, String(n.v), X(n.x), Y(n.y), { size: n.big ? 9 : 6.5, col: n.col, align: 'center', font: 'p' }); }
    Hc.globalAlpha = 1;
  }
  drawFx(L, f, X, Y) {
    const k = clamp(f.life / f.max, 0, 1);
    if (f.kind === 'arc') {
      L.globalAlpha = .85 * Math.min(1, k * 1.6);
      const prog = 1 - k, a1 = f.a0 + (f.a1 - f.a0) * Math.min(1, prog * 1.8 + .2), st = f.a1 > f.a0 ? .05 : -.05;
      const tail = f.a1 > f.a0 ? Math.max(f.a0, a1 - 1.8) : Math.min(f.a0, a1 + 1.8);
      for (let a = tail; st > 0 ? a <= a1 : a >= a1; a += st) for (let r = f.r0; r <= f.r1; r++) { L.fillStyle = r >= f.r1 - 1 ? f.col : '#e4f7ff'; L.fillRect(X(f.x + f.face * Math.cos(a) * r), Y(f.y + Math.sin(a) * r), 1, 1); }
      L.globalAlpha = 1;
    } else if (f.kind === 'thrust') {
      L.globalAlpha = k; L.fillStyle = '#ffffff'; L.fillRect(Math.min(X(f.x), X(f.x + f.face * f.len)), Y(f.y), f.len, 1); L.fillStyle = f.col; L.fillRect(Math.min(X(f.x), X(f.x + f.face * f.len)), Y(f.y) - 1, Math.round(f.len * .7), 1); L.fillRect(Math.min(X(f.x), X(f.x + f.face * f.len)), Y(f.y) + 1, Math.round(f.len * .7), 1); L.globalAlpha = 1;
    } else if (f.kind === 'ring') {
      const r = f.r1 + (f.r0 - f.r1) * k; L.globalAlpha = k; L.fillStyle = f.col;
      for (let a = 0; a < 6.283; a += 1.5 / Math.max(4, r)) L.fillRect(X(f.x + Math.cos(a) * r), Y(f.y + Math.sin(a) * r), 1, 1);
      L.globalAlpha = 1;
    } else if (f.kind === 'charge') {
      L.fillStyle = f.col; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + f.life * 8, r = 4 + k * 18; L.fillRect(X(f.x + Math.cos(a) * r), Y(f.y + Math.sin(a) * r), 1, 1); }
    } else if (f.kind === 'bolt') {
      L.globalAlpha = k; let x = f.x, r = Art.mulberry(f.seed | 0);
      for (let y = f.y - 90; y < f.y; y += 3) { x += (r() - .5) * 6; L.fillStyle = '#ffffff'; L.fillRect(X(x), Y(y), 1, 3); L.fillStyle = f.col; L.fillRect(X(x) + 1, Y(y), 1, 3); }
      L.globalAlpha = 1;
    } else if (f.kind === 'slashline') {
      L.globalAlpha = k; const x0 = Math.min(X(f.x), X(f.x - f.face * f.len)); L.fillStyle = '#ffffff'; L.fillRect(x0, Y(f.y), f.len, 1); L.fillStyle = f.col; L.fillRect(x0 + 6, Y(f.y) - 1, f.len - 12, 1); L.fillRect(x0 + 6, Y(f.y) + 1, f.len - 12, 1); L.globalAlpha = 1;
    }
  }
  drawShot(L, s, X, Y) {
    const x = X(s.x), y = Y(s.y), f = Math.sign(s.vx) || 1;
    switch (s.kind) {
      case 'wave': for (let i = -9; i <= 9; i++) { const o = Math.round(5 * Math.sqrt(1 - (i / 9.5) ** 2)); L.fillStyle = '#ffffff'; L.fillRect(x + f * o, y + i, 2 * f, 1); L.fillStyle = s.col; L.fillRect(x + f * (o - 2), y + i, 2 * f, 1); L.globalAlpha = .4; L.fillRect(x + f * (o - 5), y + i, 3 * f, 1); L.globalAlpha = 1; } break;
      case 'arrow': case 'fallarrow': {
        const a = Math.atan2(s.vy, s.vx); for (let i = 0; i < 9; i++) { L.fillStyle = i < 2 ? '#ffffff' : i > 6 ? s.col : '#cfd6ee'; L.fillRect(Math.round(x - Math.cos(a) * i), Math.round(y - Math.sin(a) * i), 1, 1); } break;
      }
      case 'fallblade': for (let i = 0; i < 7; i++) { L.fillStyle = i < 3 ? '#ffffff' : s.col; L.fillRect(x, y - i, 1, 1); } L.fillStyle = s.col; L.fillRect(x - 1, y - 5, 3, 1); break;
      case 'orb': L.fillStyle = s.col; L.fillRect(x - 2, y - 2, 4, 4); L.fillStyle = '#ffffff'; L.fillRect(x - 1, y - 1, 2, 2); L.globalAlpha = .4; L.fillStyle = s.col; L.fillRect(x - 3 - f * 3, y - 1, 3, 2); L.globalAlpha = 1; break;
      case 'bigorb': L.globalAlpha = .35; L.fillStyle = s.col; L.fillRect(x - 6, y - 6, 12, 12); L.globalAlpha = 1; L.fillStyle = s.col; L.fillRect(x - 4, y - 4, 8, 8); L.fillStyle = '#ffffff'; L.fillRect(x - 2, y - 2, 4, 4); break;
      case 'earrow': { const a = Math.atan2(s.vy, s.vx); for (let i = 0; i < 8; i++) { L.fillStyle = i < 2 ? '#ffd36b' : '#8a5a3a'; L.fillRect(Math.round(x - Math.cos(a) * i), Math.round(y - Math.sin(a) * i), 1, 1); } break; }
      case 'shock': for (let i = 0; i < 4; i++) { L.fillStyle = i % 2 ? '#ffd36b' : '#8f73ff'; L.fillRect(x - 3 + i * 2 * -f, y - 6 + i * 2 + Math.round(Math.sin(this.t * 30 + i) * 1), 2, 8 - i * 2); } break;
    }
  }
  drawStations(Hc, X) {
    for (const s of this.stations) {
      const x = X(s.x), near = this.near === s;
      if (x < -60 || x > VW + 60) continue;
      const y = GROUND - (s.id === 'gate' ? 66 : s.id === 'party' ? 56 : s.id === 'altar' ? 62 : 46);
      Hc.font = `${near ? 8 : 7}px ${FONT.d}`;
      const label = near ? '[F] ' + s.name : s.name, w = Hc.measureText(label).width + 10;
      Hc.fillStyle = near ? 'rgba(24,16,48,.92)' : 'rgba(18,12,34,.72)'; Hc.fillRect(x - w / 2, y - 10, w, 12);
      Hc.fillStyle = near ? '#ffd36b' : '#7fe3ff'; Hc.fillRect(x - w / 2, y - 10, 1.2, 12);
      if (near) { Hc.fillStyle = '#ffd36b'; Hc.fillRect(x - w / 2, y + 1.6, w, .6); }
      txt(Hc, label, x, y - 8.5, { size: near ? 8 : 7, col: near ? '#ffe3a3' : '#ece8ff', align: 'center', font: 'd', shadow: false });
      if (near) txt(Hc, s.sub, x, y + 4, { size: 5.5, col: '#c9c2ee', align: 'center', font: 'b' });
      if (s.badge && this.badge) { Hc.fillStyle = '#ff6b9a'; Hc.beginPath(); Hc.arc(x + w / 2 - 1, y - 10, 2.4, 0, 6.29); Hc.fill(); }
    }
    // 허수아비 DPS
    const d = this.enemies.find(e => e.type === 'dummy');
    if (d) {
      const x = X(d.x), y = GROUND - 50, span = this.dps.log.length ? Math.max(1, this.t - this.dps.log[0][0]) : 1;
      const dps = this.dps.log.reduce((a, l) => a + l[1], 0) / Math.max(1, Math.min(4, span));
      txt(Hc, '수련 허수아비', x, y, { size: 6.5, col: '#ece8ff', align: 'center', font: 'd' });
      txt(Hc, 'DPS ' + Math.round(dps) + '  ·  누적 ' + this.dps.total, x, y + 8, { size: 5, col: '#ffd36b', align: 'center', font: 'p' });
    }
  }
}

export function txt(c, s, x, y, o = {}) {
  const size = o.size || 7;
  c.font = `${o.weight || ''} ${size}px ${FONT[o.font || 'b']}`;
  c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'top';
  if (o.shadow !== false) { c.fillStyle = 'rgba(10,6,24,.92)'; c.fillText(s, x + size * .09, y + size * .09); }
  c.fillStyle = o.col || '#fff'; c.fillText(s, x, y);
}
