// 월하검무 — 시작점
import { VW, VH, STAGE, STAGES, HERO, GACHA } from './data.js';
import * as Art from './art.js';
import { World } from './world.js';
import { drawHud } from './hud.js';
import { Input, bindKeyboard, bindPad, consume, clearInput, applyPad, bindPadEditor, paintBar } from './input.js';
import { initAudio, sfx, playBgm, setVolumes } from './audio.js';
import { newSave, loadSave, writeSave, wipeSave, loadSettings, writeSettings } from './save.js';
import * as UI from './ui.js';

const $ = s => document.querySelector(s);
const screen = $('#screen'), L = screen.getContext('2d'), hud = $('#hud'), Hc = hud.getContext('2d');
const frame = $('#frame'), wrap = $('#wrap');
L.imageSmoothingEnabled = false;
let sc = 1;

const G = {
  save: loadSave(), settings: loadSettings(), world: null, scene: 'title', paused: false, battle: null,
  persist() { writeSave(G.save); },
  applySettings() { writeSettings(G.settings); setVolumes(G.settings.bgm, G.settings.sfx); applyTouch(); applyPad($('#pad'), G.settings); if (G.world) G.world.settings = G.settings; },
  enterHub, newGame, toTitle, startStage, startEndless,
  resume() { G.paused = false; },
  restart() { const b = G.battle; if (!b) return; b.endless ? startEndless() : startStage(b.stageId); },
  abandon() {
    const W = G.world, b = G.battle; if (!W || !b) return enterHub();
    const silver = Math.floor(W.run.silver / 2); G.save.silver += silver; G.save.kills += W.run.kills;
    if (b.endless) { G.save.moon += W.run.moon; G.save.endlessBest = Math.max(G.save.endlessBest, W.run.wave); }
    G.persist(); enterHub(); UI.toast(`은화 ${silver}개를 챙겨 돌아왔어요.`);
  },
  wipe() { wipeSave(); G.save = null; toTitle(); UI.toast('저장 데이터를 지웠어요.'); },
  replaceSave(s) { G.save = s; G.persist(); refreshParty(); },
  refreshParty, onClose() { clearInput(); },
};
window.__wolha = G;

/* ---------- 화면 크기 ---------- */
function fit() {
  const r = wrap.getBoundingClientRect();
  let w = Math.min(r.width, r.height * 16 / 9); w = Math.max(200, Math.floor(w));
  const h = Math.floor(w * 9 / 16);
  frame.style.width = w + 'px'; frame.style.height = h + 'px';
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  hud.width = Math.round(w * dpr); hud.height = Math.round(h * dpr);
  sc = hud.width / VW;
}
new ResizeObserver(fit).observe(wrap); fit();

/* ---------- 터치 패드 ---------- */
const isTouch = () => matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
function applyTouch() {
  const m = G.settings.touch, on = m === 'on' || (m === 'auto' && isTouch());
  document.body.classList.toggle('touch', on);
}
applyTouch();
bindPad($('#pad'), () => G.settings);
applyPad($('#pad'), G.settings);
let editDone = null;
G.editPad = done => {
  editDone = done; clearInput(); Input.editing = true;
  document.body.classList.add('padedit'); $('#padbar').hidden = false; paintBar($('#padbar'), G.settings);
};
bindPadEditor($('#pad'), $('#padbar'), () => G.settings, () => writeSettings(G.settings), () => {
  Input.editing = false; document.body.classList.remove('padedit'); $('#padbar').hidden = true;
  writeSettings(G.settings); const d = editDone; editDone = null; d && d();
});

/* ---------- 장면 ---------- */
let hubBg = null; const battleBg = {};
const partyEntries = () => (G.save ? G.save.party : ['ria', null]).map(id => id && { id, ...(G.save ? G.save.heroes[id] : { lv: 1, aw: 0 }) });
function makeHub(startX) {
  hubBg = hubBg || Art.buildHubBg();
  G.world = new World({ mode: 'hub', bg: hubBg, party: partyEntries(), stations: Art.STATIONS, settings: G.settings, startX, cb: { interact: openStation } });
  G.world.badge = G.save && G.save.moon >= GACHA.cost1;
}
function refreshParty() {
  if (G.scene !== 'hub' || !G.world) return;
  const x = G.world.hero.x; makeHub(x);
}
function toTitle() {
  G.scene = 'title'; G.battle = null; G.paused = false;
  makeHub(470); G.world.hero.face = -1;
  document.body.dataset.scene = 'title';
  playBgm('hub'); UI.title();
}
function enterHub() {
  if (!G.save) return newGame();
  G.scene = 'hub'; G.battle = null; G.paused = false;
  makeHub(G.lastHubX || 430);
  document.body.dataset.scene = 'hub';
  UI.close(); playBgm('hub');
  if (!G.save.pulls && G.save.moon >= GACHA.cost10) setTimeout(() => G.scene === 'hub' && UI.toast('월석으로 소환 제단에서 동료를 데려와 보세요.'), 600);
}
function newGame() { G.save = newSave(); G.persist(); G.lastHubX = 430; enterHub(); setTimeout(() => UI.toast('월하정에 온 걸 환영해요. 오른쪽 출정의 문에서 싸움이 시작돼요.'), 2600); }
function openStation(id) {
  sfx('ui'); clearInput();
  G.lastHubX = G.world.hero.x;
  const b = () => UI.close();
  ({ stele: () => UI.records(b), codex: () => UI.codex(b), party: () => UI.party(b), altar: () => UI.gacha(b), train: () => UI.train(b), gate: () => UI.stages(b) })[id]?.();
}
function startStage(id) {
  const st = STAGE[id]; if (!st) return;
  if (G.scene === 'hub' && G.world) G.lastHubX = G.world.hero.x;
  battleBg[st.theme] = battleBg[st.theme] || Art.buildBattleBg(st.theme);
  G.battle = { stageId: id, endless: false };
  G.world = new World({ mode: 'battle', bg: battleBg[st.theme], stage: st, waves: st.waves, party: partyEntries(), settings: G.settings, startX: 60,
    cb: { victory: run => finish(true, run), defeat: run => finish(false, run), bossBgm: () => playBgm('boss') } });
  G.scene = 'battle'; G.paused = false; document.body.dataset.scene = 'battle';
  UI.close(); playBgm('battle');
}
function startEndless() {
  if (G.scene === 'hub' && G.world) G.lastHubX = G.world.hero.x;
  battleBg.corridor = battleBg.corridor || Art.buildBattleBg('corridor');
  G.battle = { endless: true };
  G.world = new World({ mode: 'battle', bg: battleBg.corridor, endless: true, stage: { id: '∞', name: '무한 회랑', scale: 1 }, party: partyEntries(), settings: G.settings, startX: 60,
    cb: { defeat: run => finish(false, run), bossBgm: () => playBgm('boss') } });
  G.scene = 'battle'; G.paused = false; document.body.dataset.scene = 'battle';
  UI.close(); playBgm('battle');
}
function finish(win, run) {
  const S = G.save, b = G.battle, r = { win, kills: run.kills, time: run.time, silver: run.silver, moon: 0, endless: b.endless };
  S.kills += run.kills;
  if (b.endless) {
    r.wave = run.wave; r.best = run.wave > S.endlessBest; S.endlessBest = Math.max(S.endlessBest, run.wave); r.moon = run.moon;
  } else {
    const st = STAGE[b.stageId]; r.stageId = st.id; r.stageName = st.name;
    if (win) {
      r.first = !S.cleared[st.id]; r.silver += st.reward.silver; r.moon = r.first ? st.reward.firstMoon : st.reward.moon; S.cleared[st.id] = true;
      const nx = STAGES[st.index + 1]; r.next = nx ? nx.id : null;
    }
  }
  S.silver += r.silver; S.moon += r.moon;
  G.persist(); if (!win) sfx('lose');
  playBgm('hub');
  UI.result(r);
}

/* ---------- 입력 ---------- */
const EMPTY = { held: {}, pressed: {} };
bindKeyboard(e => {
  initAudio();
  if (UI.isOpen()) return UI.onKey(e);
  if (e.code === 'Escape' || e.code === 'KeyP') { openMenu(); return true; }
  if (G.scene === 'hub' && e.code === 'KeyF' && !G.world.near) return false;
  return false;
});
function openMenu() {
  if (G.scene === 'hub') { sfx('ui'); clearInput(); UI.hubMenu(); }
  else if (G.scene === 'battle' && G.world && !G.world.done) { sfx('ui'); clearInput(); G.paused = true; UI.battlePause(); }
}
$('#menuBtn').addEventListener('click', () => { initAudio(); openMenu(); });
addEventListener('pointerdown', () => initAudio(), { capture: true });
document.addEventListener('visibilitychange', () => { if (document.hidden && G.scene === 'battle' && !UI.isOpen()) openMenu(); });

/* ---------- 루프 ---------- */
UI.initUI($('#ui'), G);
let last = performance.now();
function loop(t) {
  const dt = Math.min(1 / 30, (t - last) / 1000); last = t;
  const W = G.world;
  if (W) {
    const blocked = UI.isOpen() || G.scene === 'title';
    if (!(G.scene === 'battle' && (G.paused || (UI.isOpen() && !W.done)))) W.update(dt, blocked ? EMPTY : Input);
    W.badge = G.save && G.save.moon >= GACHA.cost1;
    W.draw(L, Hc, sc);
    W.hideLabels = G.scene === 'title';
    if (G.scene !== 'title' && !UI.isOpen()) drawHud(Hc, W, G.save);
  }
  consume();
  requestAnimationFrame(loop);
}
const fontsReady = document.fonts ? Promise.race([Promise.all(['8px "Silkscreen"', '8px "Do Hyeon"', '8px "Gowun Dodum"'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
Promise.all([fontsReady.catch(() => {}), Art.loadImages(['asbel_44', 'asbel_72'])]).finally(() => {
  setVolumes(G.settings.bgm, G.settings.sfx);
  toTitle();
  requestAnimationFrame(loop);
});
