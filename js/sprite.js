// 시트 기반 영웅 스프라이트 (예: 은월의 마검사)
// - 시트·좌표·재생 속도는 assets/heroes/<id>/<id>_sheet.json 에서 읽어요.
// - 그림은 기기 픽셀 기준 정수 배율로만 그려요 (보간 끔).

export const SPR = {};          // id → { meta, img, flip, tint:{}, fx:{} }
export const SPRITE_CFG = {     // 게임 쪽 설정값 (재생 속도·판정 시점은 JSON을 우선)
  worldScale: .7,               // 스프라이트 1px = 월드 0.7px 근처의 정수 기기 픽셀
  dashFrame: 3, jumpFrame: 2, fallFrame: 6, spinFps: 20,
};

function canvas(w, h) { const k = document.createElement('canvas'); k.width = w; k.height = h; return k; }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

export async function loadSprite(id, base, name) {
  try {
    const meta = await fetch(`${base}/${name}.json`).then(r => r.json());
    const img = await loadImg(`${base}/${meta.image}`);
    const [cw, ch] = meta.cell;
    // 칸마다 좌우 반전한 시트 (왼쪽 이동용)
    const flip = canvas(img.width, img.height), fx = flip.getContext('2d');
    for (let r = 0; r < meta.rows; r++) for (let c = 0; c < meta.columns; c++) {
      fx.save(); fx.translate(c * cw + cw, r * ch); fx.scale(-1, 1); fx.drawImage(img, c * cw, r * ch, cw, ch, 0, 0, cw, ch); fx.restore();
    }
    const effects = {};
    for (const [k, e] of Object.entries(meta.effects || {})) { try { effects[k] = { img: await loadImg(`${base}/${e.file}`), ...e }; } catch (_) {} }
    SPR[id] = { meta, img, flip, tint: {}, fx: effects };
    return SPR[id];
  } catch (e) { console.warn('sprite load failed', id, e); return null; }
}
export const hasSprite = h => !!(h && h.def && h.def.sprite && SPR[h.def.sprite.id]);

function tinted(sp, col, flip) {
  const key = col + (flip ? 'f' : '');
  if (sp.tint[key]) return sp.tint[key];
  const src = flip ? sp.flip : sp.img, k = canvas(src.width, src.height), x = k.getContext('2d');
  x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, k.width, k.height);
  return sp.tint[key] = k;
}

// 상태 → (동작, 프레임). 우선순위: 쓰러짐 > 피격 > 스킬·공격 > 이동
export function pickFrame(h, now, meta) {
  const A = meta.animations, cl = (n, i) => Math.max(0, Math.min(A[n].count - 1, i | 0));
  if (h.dead) return ['down', cl('down', ((now - (h.deadAt ?? now)) * A.down.fps))];
  switch (h.state) {
    case 'hurt': return ['hit', cl('hit', (1 - Math.max(0, h.hurtT) / .28) * A.hit.count)];
    case 'skill': return ['skill', cl('skill', h.anim * A.skill.fps)];
    case 'spin': return ['attack', Math.floor(h.anim * SPRITE_CFG.spinFps) % A.attack.count];
    case 'attack': return ['attack', cl('attack', (h.atkDur - h.atkT) / Math.max(.01, h.atkDur) * A.attack.count)];
    case 'dash': return ['run', SPRITE_CFG.dashFrame];
    case 'jump': return ['run', SPRITE_CFG.jumpFrame];
    case 'fall': return ['run', SPRITE_CFG.fallFrame];
    case 'run': return ['run', Math.floor(h.anim * A.run.fps) % A.run.count];
    default: return ['idle', Math.floor(h.anim * A.idle.fps) % A.idle.count];
  }
}
// 공격 판정 시점: JSON의 hitFrame을 콤보 한 동작 길이에 맞춰 환산
export function hitTime(h, step) {
  const sp = SPR[h.def.sprite?.id]; if (!sp) return step.hitAt;
  const a = sp.meta.animations.attack;
  return step.dur * (a.hitFrame ?? 1) / a.count;
}
export const spriteM = sc => Math.max(1, Math.round(sc * SPRITE_CFG.worldScale));

// c: 기기 픽셀 좌표계 컨텍스트, (x, y): 발 기준점 기기 픽셀
export function drawSprite(c, h, x, y, m, face, now, o = {}) {
  const sp = SPR[h.def.sprite.id], meta = sp.meta, [cw, ch] = meta.cell;
  const [anim, i] = pickFrame(h, now, meta), fr = meta.animations[anim]?.frames[i] || meta.animations.idle.frames[0];
  const flip = face < 0, src = o.tint ? tinted(sp, o.tint, flip) : flip ? sp.flip : sp.img;
  const ax = flip ? cw - fr.anchor[0] : fr.anchor[0], ay = fr.anchor[1];
  c.imageSmoothingEnabled = false;
  c.globalAlpha = o.alpha ?? 1;
  c.drawImage(src, fr.x, fr.y, cw, ch, Math.round(x - ax * m), Math.round(y - ay * m), cw * m, ch * m);
  c.globalAlpha = 1;
}
export function drawEffect(c, spriteId, key, x, y, m, face = 1, alpha = 1, scale = 1) {
  const e = SPR[spriteId]?.fx[key]; if (!e) return false;
  const s = Math.max(1, Math.round(m * scale)), w = e.img.width * s, hh = e.img.height * s;
  c.imageSmoothingEnabled = false; c.globalAlpha = alpha;
  c.save(); c.translate(Math.round(x), Math.round(y)); if (face < 0) c.scale(-1, 1);
  c.drawImage(e.img, Math.round(-e.origin[0] * s), Math.round(-e.origin[1] * s), w, hh);
  c.restore(); c.globalAlpha = 1;
  return true;
}
// 메뉴용 그림 (대기 첫 프레임)
export function menuCanvas(id, kind) {
  const sp = SPR[id]; if (!sp) return null;
  const fr = sp.meta.animations.idle.frames[0], [cw, ch] = sp.meta.cell;
  const cell = canvas(cw, ch), x = cell.getContext('2d'); x.drawImage(sp.img, fr.x, fr.y, cw, ch, 0, 0, cw, ch);
  const d = x.getImageData(0, 0, cw, ch).data; let top = ch;
  for (let yy = 0; yy < ch && top === ch; yy++) for (let xx = 0; xx < cw; xx++) if (d[(yy * cw + xx) * 4 + 3]) { top = yy; break; }
  if (kind === 'face') {
    let sx = 0, n = 0; for (let yy = top; yy < top + 20; yy++) for (let xx = 0; xx < cw; xx++) if (d[(yy * cw + xx) * 4 + 3]) { sx += xx; n++; }
    const cx = Math.round(n ? sx / n : cw / 2) + 2, k = canvas(22, 22), kx = k.getContext('2d');
    kx.drawImage(cell, cx - 11, top + 1, 22, 22, 0, 0, 22, 22); return k;
  }
  const k = canvas(64, 70), kx = k.getContext('2d'); kx.drawImage(cell, 0, ch - 70 - 2, 64, 70, 0, 0, 64, 70); return k;
}
