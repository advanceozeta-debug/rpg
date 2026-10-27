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

export function bindPad(pad) {
  // 조이스틱
  const stick = pad.querySelector('.stick'), knob = pad.querySelector('.knob');
  let sid = null;
  const setDir = (dx, dy) => {
    const m = Math.hypot(dx, dy), r = stick.clientWidth / 2;
    const k = m > r * .55 ? r * .55 / m : 1;
    knob.style.transform = `translate(${dx * k}px,${dy * k}px)`;
    const th = r * .28;
    const L = dx < -th, R = dx > th, U = dy < -th * 1.4, D = dy > th * 1.4;
    for (const [a, on] of [['left', L], ['right', R], ['down', D], ['up', U]]) { if (on) press(a); else release(a); }
  };
  stick.addEventListener('pointerdown', e => {
    e.preventDefault(); sid = e.pointerId; try { stick.setPointerCapture(sid); } catch (_) {}
    const b = stick.getBoundingClientRect(); setDir(e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2);
  });
  stick.addEventListener('pointermove', e => {
    if (e.pointerId !== sid) return;
    const b = stick.getBoundingClientRect(); setDir(e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2);
  });
  const endStick = () => { sid = null; knob.style.transform = ''; ['left', 'right', 'up', 'down'].forEach(release); };
  stick.addEventListener('pointerup', endStick); stick.addEventListener('pointercancel', endStick); stick.addEventListener('lostpointercapture', endStick);
  // 버튼
  pad.querySelectorAll('[data-act]').forEach(b => {
    const a = b.dataset.act;
    b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} press(a); b.classList.add('on'); });
    const up = () => { release(a); b.classList.remove('on'); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', e => e.preventDefault());
  });
}
export { ACTS };
