// 키보드 + 터치 패드 입력
export const Input = { held: {}, pressed: {}, enabled: true };
const ACTS = ['left', 'right', 'up', 'down', 'jump', 'attack', 'dash', 'skill1', 'skill2', 'tag', 'interact'];
export const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: ['up', 'jump'], KeyW: ['up', 'jump'], ArrowDown: 'down', KeyS: 'down',
  Space: 'jump', KeyK: 'jump', KeyX: 'jump',
  KeyJ: 'attack', KeyZ: 'attack',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyL: 'dash', KeyC: 'dash',
  KeyE: 'skill1', KeyQ: 'skill2', KeyG: 'tag', KeyF: 'interact',
};
function acts(code) { const a = KEYMAP[code]; return a ? (Array.isArray(a) ? a : [a]) : []; }
export function press(a) { if (!Input.held[a]) Input.pressed[a] = true; Input.held[a] = true; }
export function release(a) { Input.held[a] = false; }
export function clearInput() { Input.held = {}; Input.pressed = {}; }
export function consume() { Input.pressed = {}; }

export function bindKeyboard(onKey) {
  addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (onKey(e)) { e.preventDefault(); return; }
    const a = acts(e.code);
    if (a.length) {
      if (!e.repeat) a.forEach(press);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    }
  });
  addEventListener('keyup', e => acts(e.code).forEach(release));
  addEventListener('blur', clearInput);
}

export function bindPad(pad, getSettings) {
  const stick = pad.querySelector('.stick'), knob = pad.querySelector('.knob'), zone = pad.querySelector('.zone');
  let sid = null, cx = 0, cy = 0;
  const scaleOf = () => parseFloat(stick.style.scale) || 1;
  const setDir = (x, y) => {
    const s = scaleOf(), R = stick.getBoundingClientRect().width / 2;
    let dx = x - cx, dy = y - cy; const m = Math.hypot(dx, dy), lim = R * .6;
    if (m > lim) { dx *= lim / m; dy *= lim / m; }
    knob.style.transform = `translate(${dx / s}px,${dy / s}px)`;
    const th = R * .22;
    const L = dx < -th, Rt = dx > th, U = dy < -th * 1.5, D = dy > th * 1.5;
    for (const [a, on] of [['left', L], ['right', Rt], ['down', D], ['up', U]]) { if (on) press(a); else release(a); }
  };
  const begin = (e, el, float) => {
    if (Input.editing || sid !== null) return;
    e.preventDefault(); e.stopPropagation(); sid = e.pointerId;
    try { el.setPointerCapture(sid); } catch (_) {}
    const b = stick.getBoundingClientRect(), s = scaleOf();
    if (float) {
      const ox = (e.clientX - (b.left + b.width / 2)) / s, oy = (e.clientY - (b.top + b.height / 2)) / s;
      stick.style.transform = `translate(${ox}px,${oy}px)`; stick.classList.add('float');
      cx = e.clientX; cy = e.clientY;
    } else { cx = b.left + b.width / 2; cy = b.top + b.height / 2; }
    setDir(e.clientX, e.clientY);
  };
  const move = e => { if (e.pointerId === sid) setDir(e.clientX, e.clientY); };
  const end = e => {
    if (e && e.pointerId !== undefined && e.pointerId !== sid) return;
    sid = null; knob.style.transform = ''; stick.style.transform = ''; stick.classList.remove('float');
    ['left', 'right', 'up', 'down'].forEach(release);
  };
  stick.addEventListener('pointerdown', e => begin(e, stick, false));
  zone.addEventListener('pointerdown', e => { if ((getSettings().stickMode || 'float') === 'float') begin(e, zone, true); });
  for (const el of [stick, zone]) {
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
  }
  pad.querySelectorAll('[data-act]').forEach(b => {
    const a = b.dataset.act;
    b.addEventListener('pointerdown', e => { if (Input.editing) return; e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} press(a); b.classList.add('on'); });
    const up = () => { release(a); b.classList.remove('on'); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', e => e.preventDefault());
  });
}

// 터치 패드 크기·위치
export function applyPad(pad, st) {
  pad.querySelectorAll('[data-id]').forEach(el => {
    const p = (st.padPos || {})[el.dataset.id] || { x: 0, y: 0 };
    el.style.translate = `${p.x}px ${p.y}px`;
    el.style.scale = String(el.dataset.id === 'stick' ? st.stickSize : st.btnSize);
  });
}
export function bindPadEditor(pad, bar, getSettings, onChange, onDone) {
  let drag = null;
  pad.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('pointerdown', e => {
      if (!Input.editing) return;
      e.preventDefault(); e.stopPropagation();
      const st = getSettings(), id = el.dataset.id, p = st.padPos[id] || { x: 0, y: 0 };
      drag = { el, id, sx: e.clientX, sy: e.clientY, px: p.x, py: p.y, pid: e.pointerId };
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      el.classList.add('drag');
    }, true);
    el.addEventListener('pointermove', e => {
      if (!drag || drag.el !== el || e.pointerId !== drag.pid) return;
      const st = getSettings();
      const x = Math.max(-innerWidth, Math.min(innerWidth, drag.px + e.clientX - drag.sx));
      const y = Math.max(-innerHeight, Math.min(innerHeight, drag.py + e.clientY - drag.sy));
      st.padPos[drag.id] = { x: Math.round(x), y: Math.round(y) };
      applyPad(pad, st);
    });
    const up = () => { if (drag && drag.el === el) { el.classList.remove('drag'); drag = null; onChange(); } };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-pe]'); if (!b) return;
    const st = getSettings(), k = b.dataset.pe, cl = v => Math.round(Math.max(.6, Math.min(1.8, v)) * 10) / 10;
    if (k === 'st-') st.stickSize = cl(st.stickSize - .1);
    if (k === 'st+') st.stickSize = cl(st.stickSize + .1);
    if (k === 'bt-') st.btnSize = cl(st.btnSize - .1);
    if (k === 'bt+') st.btnSize = cl(st.btnSize + .1);
    if (k === 'reset') { st.padPos = {}; st.stickSize = 1; st.btnSize = 1; }
    applyPad(pad, st); onChange(); paintBar(bar, st);
    if (k === 'done') onDone();
  });
}
export function paintBar(bar, st) {
  bar.querySelector('[data-v="st"]').textContent = Math.round(st.stickSize * 100) + '%';
  bar.querySelector('[data-v="bt"]').textContent = Math.round(st.btnSize * 100) + '%';
}
export { ACTS };
