// 화면 위 정보 (HP, 스킬, 재화, 보스 체력)
import { VW, VH, SKILLS } from './data.js';
import * as Art from './art.js';
import { txt, FONT } from './world.js';

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function box(c, x, y, w, h, fill = 'rgba(16,11,34,.82)', line = 'rgba(150,130,230,.55)') {
  c.fillStyle = fill; c.fillRect(x, y, w, h);
  c.strokeStyle = line; c.lineWidth = .5; c.strokeRect(x + .25, y + .25, w - .5, h - .5);
}
function bar(c, x, y, w, h, f, col, lag) {
  c.fillStyle = '#0c0818'; c.fillRect(x - .5, y - .5, w + 1, h + 1);
  c.fillStyle = '#2a2150'; c.fillRect(x, y, w, h);
  if (lag != null) { c.fillStyle = '#f4ecff'; c.fillRect(x, y, w * clamp(lag, 0, 1), h); }
  c.fillStyle = col; c.fillRect(x, y, w * clamp(f, 0, 1), h);
  c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x, y, w * clamp(f, 0, 1), h * .35);
}
function icon(c, img, x, y, s) { c.imageSmoothingEnabled = false; c.drawImage(img, x, y, s, s); }
function cdSlot(c, x, y, s, img, cd, max, key, ready) {
  box(c, x, y, s, s, 'rgba(10,6,24,.9)', ready ? 'rgba(127,227,255,.8)' : 'rgba(120,110,170,.5)');
  icon(c, img, x + 1, y + 1, s - 2);
  if (cd > 0) {
    c.fillStyle = 'rgba(8,4,20,.72)'; const f = clamp(cd / max, 0, 1); c.fillRect(x, y + s * (1 - f), s, s * f);
    txt(c, cd >= 1 ? String(Math.ceil(cd)) : cd.toFixed(1), x + s / 2, y + s / 2 - 2.6, { size: 5, col: '#ffffff', align: 'center', font: 'p' });
  }
  txt(c, key, x + .8, y + s - 4.4, { size: 3.8, col: '#ffe3a3', font: 'p' });
}

export function drawHud(c, W, save) {
  const h = W.hero; if (!h) return;
  // 영웅 패널
  box(c, 4, 4, 114, 33);
  box(c, 6.5, 6.5, 21, 21, 'rgba(40,30,80,.9)', h.def.pal.acc);
  icon(c, Art.heroCanvas(h.id, 'face'), 7, 7, 20);
  txt(c, h.def.name, 31, 5.2, { size: 7, col: '#ffffff', font: 'd' });
  c.font = `7px ${FONT.d}`; const nw = c.measureText(h.def.name).width;
  txt(c, 'Lv.' + h.lv, 33 + nw, 6.8, { size: 4.6, col: '#c9c2ee', font: 'p' });
  if (h.buffT > 0) txt(c, 'ATK↑', 112, 6.6, { size: 4.2, col: '#ffd36b', font: 'p', align: 'right' });
  bar(c, 31, 14.5, 82, 4.5, h.hp / h.maxHp, h.hp / h.maxHp < .3 ? '#ff4d6d' : '#ff5d8a', h.hpLag / h.maxHp);
  txt(c, Math.ceil(h.hp) + ' / ' + h.maxHp, 72, 14.6, { size: 3.9, col: '#ffffff', align: 'center', font: 'p' });
  cdSlot(c, 31, 22, 11, Art.skillIcon(h.def.e, h.def.pal.acc), h.cdE, SKILLS[h.def.e].cd, 'E', h.cdE <= 0);
  cdSlot(c, 44, 22, 11, Art.skillIcon(h.def.q, h.def.pal.acc), h.cdQ, SKILLS[h.def.q].cd, 'Q', h.cdQ <= 0);
  const p = W.partner;
  if (p) {
    box(c, 96, 22, 11, 11, 'rgba(10,6,24,.9)', p.dead ? 'rgba(120,60,80,.6)' : W.tagCD <= 0 ? 'rgba(255,211,107,.85)' : 'rgba(120,110,170,.5)');
    icon(c, Art.heroCanvas(p.id, 'face'), 96.5, 22.5, 10);
    if (p.dead) { c.fillStyle = 'rgba(40,0,10,.7)'; c.fillRect(96, 22, 11, 11); }
    else if (W.tagCD > 0) { c.fillStyle = 'rgba(8,4,20,.65)'; const f = clamp(W.tagCD / 6, 0, 1); c.fillRect(96, 22 + 11 * (1 - f), 11, 11 * f); }
    txt(c, 'G', 96.8, 28.6, { size: 3.8, col: '#ffe3a3', font: 'p' });
    bar(c, 108.5, 22.5, 2, 10, 1, '#2a2150');
    const f = clamp(p.hp / p.maxHp, 0, 1); c.fillStyle = '#ff5d8a'; c.fillRect(108.5, 22.5 + 10 * (1 - f), 2, 10 * f);
    txt(c, '교대', 88, 24.4, { size: 4.4, col: '#c9c2ee', align: 'right', font: 'd' });
  }

  if (W.mode === 'hub') {
    // 재화
    const pill = (x, kind, v) => { box(c, x, 4, 54, 11); icon(c, Art.coinIcon(kind), x + 2, 5.5, 8); txt(c, v.toLocaleString(), x + 51, 6.4, { size: 5.6, col: '#ffffff', align: 'right', font: 'p' }); };
    pill(VW - 116, 'moon', save.moon); pill(VW - 58, 'silver', save.silver);
    txt(c, '월하정', VW - 5, 18.5, { size: 8, col: '#ffe3a3', align: 'right', font: 'd' });
    txt(c, '[F] 상호작용 · [Esc] 메뉴', VW - 5, 28.5, { size: 4.8, col: '#b8b0e0', align: 'right', font: 'b' });
  } else {
    const st = W.stage;
    txt(c, W.endless ? '무한 회랑' : st.id + '  ' + st.name, VW - 5, 5, { size: 7, col: '#ffe3a3', align: 'right', font: 'd' });
    txt(c, W.endless ? 'WAVE ' + Math.max(1, W.wave) + '  ·  최고 ' + save.endlessBest : 'WAVE ' + Math.max(1, W.wave) + ' / ' + W.waves.length, VW - 5, 14.5, { size: 4.8, col: '#ece8ff', align: 'right', font: 'p' });
    icon(c, Art.coinIcon('silver'), VW - 40, 21.5, 6);
    txt(c, String(W.run.silver), VW - 5, 22, { size: 5, col: '#ffffff', align: 'right', font: 'p' });
    if (W.run.moon) { icon(c, Art.coinIcon('moon'), VW - 40, 29, 6); txt(c, String(W.run.moon), VW - 5, 29.5, { size: 5, col: '#bff0ff', align: 'right', font: 'p' }); }
    const boss = W.enemies.find(e => e.d.boss);
    if (boss) {
      txt(c, boss.d.name + (boss.hp < boss.max * .5 ? '  ·  분노' : ''), VW / 2, VH - 19, { size: 6, col: '#ffb3cf', align: 'center', font: 'd' });
      bar(c, VW / 2 - 80, VH - 10, 160, 3.5, boss.hp / boss.max, '#ff4d6d');
    }
  }
  // 배너
  const b = W.banner;
  if (b) {
    const a = clamp(Math.min(b.t * 3, (b.max - b.t) * 6), 0, 1), yy = 56 + (1 - a) * -6;
    c.globalAlpha = a;
    c.fillStyle = 'rgba(12,8,28,.55)'; c.fillRect(0, yy - 4, VW, b.sub ? 30 : 22);
    c.fillStyle = 'rgba(255,211,107,.6)'; c.fillRect(VW / 2 - 50, yy - 4, 100, .5); c.fillRect(VW / 2 - 50, yy + (b.sub ? 26 : 18), 100, .5);
    txt(c, b.text, VW / 2, yy, { size: 13, col: '#ffe3a3', align: 'center', font: /[가-힣]/.test(b.text) ? 'd' : 'p' });
    if (b.sub) txt(c, b.sub, VW / 2, yy + 16, { size: 6.5, col: '#7fe3ff', align: 'center', font: 'd' });
    c.globalAlpha = 1;
  }
}
