// 메뉴 화면들
import { HEROES, HERO, RARITY, WEAPONS, SKILLS, CHAPTERS, STAGE, STAGES, ENEMIES, GACHA, MAX_LV, VERSION, COUPONS, heroStats, power, lvCost } from './data.js';
import * as Art from './art.js';
import { sfx } from './audio.js';
import { exportCode, importCode } from './save.js';

let root, G, cur = null;
const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const fmt = n => Math.round(n).toLocaleString();
const coin = k => `<img class="coin" src="${Art.coinURL(k)}" alt="${k === 'moon' ? '월석' : '은화'}">`;
const stars = r => `<span class="stars r${r}">${RARITY[r].stars}</span>`;
const sprite = (id, cls = '') => `<img class="spr ${cls}" src="${Art.heroURL(id, 'full')}" alt="">`;
const face = id => `<img class="face" src="${Art.heroURL(id, 'face')}" alt="">`;

export function initUI(el, api) {
  root = el; G = api;
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled || !cur) return;
    e.preventDefault();
    const fn = cur.actions[b.dataset.a];
    if (fn) { fn(b.dataset.v, b); }
  });
}
export const isOpen = () => !!cur;
export const current = () => cur && cur.name;

function show(name, html, actions = {}, opts = {}) {
  cur = { name, actions, back: opts.back, keys: opts.keys };
  root.innerHTML = `<div class="panel ${opts.cls || ''}" data-p="${name}">${html}</div>`;
  root.hidden = false; document.body.classList.add('menuopen');
  const first = root.querySelector('[autofocus]') || root.querySelector('.nav:not([disabled])');
  if (first && !opts.noFocus) first.focus({ preventScroll: true });
  opts.after?.(root);
}
export function close() { cur = null; root.innerHTML = ''; root.hidden = true; document.body.classList.remove('menuopen'); G.onClose?.(); }
function back() { if (cur?.back) { sfx('ui'); cur.back(); } }
function head(title, right = '') {
  return `<header class="phead"><button class="back nav" data-a="back" aria-label="뒤로">◀ 뒤로</button><h2>${title}</h2><div class="pright">${right}</div></header>`;
}
const wallet = () => `<span class="pill">${coin('moon')}${fmt(G.save.moon)}</span><span class="pill">${coin('silver')}${fmt(G.save.silver)}</span>`;

// 키보드 조작
export function onKey(e) {
  if (!cur) return false;
  const k = e.code;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    if (k === 'Escape') { e.target.blur(); return true; }
    return false;
  }
  if (cur.keys && cur.keys(k)) return true;
  if (k === 'Escape' || k === 'Backspace') { back(); return true; }
  const navs = [...root.querySelectorAll('.nav:not([disabled])')].filter(n => n.offsetParent !== null);
  const i = navs.indexOf(document.activeElement);
  if (k === 'ArrowDown' || k === 'KeyS' || k === 'ArrowUp' || k === 'KeyW') {
    if (!navs.length) return true;
    const d = (k === 'ArrowDown' || k === 'KeyS') ? 1 : -1;
    const n = navs[(i + d + navs.length) % navs.length] || navs[0];
    n.focus(); n.scrollIntoView({ block: 'nearest' }); sfx('ui'); return true;
  }
  if (k === 'ArrowLeft' || k === 'KeyA' || k === 'ArrowRight' || k === 'KeyD') {
    const f = document.activeElement, dir = (k === 'ArrowLeft' || k === 'KeyA') ? 'l' : 'r';
    if (f && f.dataset[dir]) { cur.actions[f.dataset[dir]]?.(f.dataset.v, f); return true; }
    if (navs.length && (cur.name === 'gachaRes' || f?.closest('.hgrid'))) { const n = navs[(i + (dir === 'r' ? 1 : -1) + navs.length) % navs.length]; n?.focus(); return true; }
    return false;
  }
  if (k === 'Enter' || k === 'KeyJ' || k === 'Space') { const f = document.activeElement; if (f && f.dataset.a && root.contains(f)) { f.click(); return true; } return false; }
  return false;
}

export function toast(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
}

function confirmBox(msg, okLabel, onOk, onCancel) {
  const prev = cur;
  show('confirm', `<div class="win confirm"><p>${msg}</p><div class="row"><button class="btn danger nav" data-a="ok">${okLabel}</button><button class="btn nav" data-a="no" autofocus>취소</button></div></div>`,
    { ok: () => { onOk(); }, no: () => { onCancel ? onCancel() : null; } }, { cls: 'center', back: () => onCancel && onCancel() });
}

/* ---------------- 타이틀 ---------------- */
export function title() {
  const has = !!G.save;
  show('title', `
    <div class="title-art">
      <span class="eyebrow">Moonlight Blade · Action RPG</span>
      <h1 class="logo">월하검무</h1>
      <p class="tag">달빛 아래, 검이 춤춘다</p>
    </div>
    <div class="win menu-box">
      ${has ? '<button class="btn nav main" data-a="cont">이어하기</button>' : ''}
      <button class="btn nav ${has ? '' : 'main'}" data-a="new">새로 시작</button>
      <button class="btn nav" data-a="rec" ${has ? '' : 'disabled'}>기록</button>
      <button class="btn nav" data-a="set">설정</button>
      <button class="btn nav" data-a="ctl">조작법</button>
    </div>
    <div class="foot"><span>${has ? '저장: 이 기기 브라우저' : '저장 데이터 없음'}</span><span>${VERSION} · 싱글 플레이 · 현실 결제 없음</span></div>`,
    {
      cont: () => { sfx('ok'); G.enterHub(); },
      new: () => {
        if (!has) { sfx('ok'); G.newGame(); return; }
        confirmBox('저장된 기록을 지우고 처음부터 시작할까요?<br><small>지운 기록은 되돌릴 수 없어요. 설정에서 먼저 내보내기를 해 두면 안전해요.</small>', '지우고 시작', () => { sfx('ok'); G.newGame(); }, title);
      },
      rec: () => records(title), set: () => settings(title), ctl: () => controls(title),
    }, { cls: 'title' });
}

/* ---------------- 일시정지 ---------------- */
export function hubMenu() {
  show('hubMenu', `<div class="win menu-box">
      <h3 class="mt">월하정 메뉴</h3>
      <button class="btn nav main" data-a="go" autofocus>계속하기</button>
      <button class="btn nav" data-a="st">출정의 문</button>
      <button class="btn nav" data-a="ga">소환 제단</button>
      <button class="btn nav" data-a="pa">편성</button>
      <button class="btn nav" data-a="tr">영웅 수련</button>
      <button class="btn nav" data-a="cx">영웅록</button>
      <button class="btn nav" data-a="se">설정</button>
      <button class="btn nav" data-a="pe">터치 패드 배치 편집</button>
      <button class="btn nav" data-a="ct">조작법</button>
      <button class="btn nav" data-a="ti">타이틀로</button>
    </div>`, {
    go: close, st: () => stages(hubMenu), ga: () => gacha(hubMenu), pa: () => party(hubMenu), tr: () => train(hubMenu), cx: () => codex(hubMenu),
    se: () => settings(hubMenu), pe: () => { close(); G.editPad(hubMenu); }, ct: () => controls(hubMenu), ti: () => G.toTitle(),
  }, { cls: 'center', back: close });
}
export function battlePause() {
  show('pause', `<div class="win menu-box">
      <h3 class="mt">일시정지</h3>
      <button class="btn nav main" data-a="go" autofocus>계속하기</button>
      <button class="btn nav" data-a="re">처음부터 다시</button>
      <button class="btn nav" data-a="se">설정</button>
      <button class="btn nav" data-a="pe">터치 패드 배치 편집</button>
      <button class="btn nav" data-a="ct">조작법</button>
      <button class="btn nav" data-a="ex">포기하고 월하정으로</button>
    </div>`, {
    go: () => { close(); G.resume(); }, re: () => G.restart(), se: () => settings(battlePause), pe: () => { close(); G.editPad(battlePause); }, ct: () => controls(battlePause),
    ex: () => confirmBox('지금 나가면 이번 출정에서 모은 은화를 절반만 가져가요.', '나가기', () => G.abandon(), battlePause),
  }, { cls: 'center', back: () => { close(); G.resume(); } });
}

/* ---------------- 설정 ---------------- */
const SETROWS = [
  { k: 'bgm', name: '배경음 음량', desc: '배경 음악의 크기예요. ← → 로 10%씩 바꿔요.', type: 'pct' },
  { k: 'sfx', name: '효과음 음량', desc: '칼 소리, 타격음, 메뉴 소리의 크기예요.', type: 'pct' },
  { k: 'shake', name: '화면 흔들림', desc: '강한 공격이 맞을 때 화면이 흔들리는 정도예요. 어지러우면 줄이세요.', type: 'pct' },
  { k: 'nums', name: '데미지 숫자', desc: '적에게 준 피해량을 머리 위에 띄울지 정해요.', type: 'bool' },
  { k: 'touch', name: '터치 패드', desc: '화면 조작 버튼을 언제 보일지 정해요. 자동이면 터치 화면에서만 보여요.', type: 'enum', opts: [['auto', '자동'], ['on', '항상 켜기'], ['off', '끄기']] },
  { k: 'stickMode', name: '조이스틱 방식', desc: '따라가기: 화면 왼쪽 아래 어디를 눌러도 그 자리에 조이스틱이 생겨요. 고정: 원 안을 눌러야 움직여요.', type: 'enum', opts: [['float', '따라가기'], ['fixed', '고정']] },
  { k: 'stickSize', name: '조이스틱 크기', desc: '왼쪽 조이스틱의 크기예요. 60%에서 180%까지 바꿀 수 있어요.', type: 'scale', min: .6, max: 1.8 },
  { k: 'btnSize', name: '버튼 크기', desc: '오른쪽 공격·점프·스킬 버튼의 크기예요.', type: 'scale', min: .6, max: 1.8 },
];
export function settings(backTo) {
  const st = G.settings;
  const val = r => r.type === 'pct' || r.type === 'scale' ? Math.round(st[r.k] * 100) + '%' : r.type === 'bool' ? (st[r.k] ? '켜기' : '끄기') : r.opts.find(o => o[0] === st[r.k])[1];
  const rows = SETROWS.map((r, i) => `<button class="srow nav" data-a="cyc" data-v="${i}" data-l="dec" data-r="inc" data-desc="${esc(r.desc)}"><span>${r.name}</span><span class="sval"><i data-a="dec" data-v="${i}">◀</i><b>${val(r)}</b><i data-a="inc" data-v="${i}">▶</i></span></button>`).join('');
  const change = (i, d) => {
    const r = SETROWS[+i];
    if (r.type === 'pct') st[r.k] = Math.round(Math.max(0, Math.min(1, st[r.k] + d * .1)) * 10) / 10;
    else if (r.type === 'scale') st[r.k] = Math.round(Math.max(r.min, Math.min(r.max, st[r.k] + d * .1)) * 10) / 10;
    else if (r.type === 'bool') st[r.k] = !st[r.k];
    else { const ix = r.opts.findIndex(o => o[0] === st[r.k]); st[r.k] = r.opts[(ix + d + r.opts.length) % r.opts.length][0]; }
    G.applySettings(); sfx('ui');
    const el = root.querySelector(`.srow[data-v="${i}"] b`); if (el) el.textContent = val(r);
    root.querySelector('.sdesc .bar i')?.style.setProperty('width', r.type === 'pct' ? st[r.k] * 100 + '%' : r.type === 'scale' ? (st[r.k] - r.min) / (r.max - r.min) * 100 + '%' : '0');
    const bg = root.querySelector('.sdesc .big'); if (bg) bg.textContent = val(r);
  };
  show('settings', head('설정') + `
    <div class="cols">
      <div class="win list">
        <div class="glabel">터치 패드</div>
<button class="srow nav hl" data-a="pedit" data-desc="조이스틱과 버튼을 손가락으로 끌어서 원하는 자리에 놓고, 크기도 바꿀 수 있어요."><span>터치 패드 배치 · 크기 편집</span></button>
        <div class="glabel">소리 · 화면 · 조작</div>${rows}
        <div class="glabel">기록</div>
        <button class="srow nav" data-a="exp" data-desc="다른 기기로 옮기거나 백업할 수 있게 저장 데이터를 글자 코드로 꺼내요." ${G.save ? '' : 'disabled'}><span>저장 데이터 내보내기 / 가져오기</span></button>
        <button class="srow nav" data-a="cpn" data-desc="받은 쿠폰 코드를 입력해 보상을 받아요." ${G.save ? '' : 'disabled'}><span>쿠폰 코드 입력</span></button>
        <button class="srow nav danger" data-a="wipe" data-desc="이 기기의 저장 데이터를 모두 지워요. 되돌릴 수 없어요." ${G.save ? '' : 'disabled'}><span>저장 데이터 초기화</span></button>
      </div>
      <div class="win sdesc"><h3>설정 안내</h3><p>항목을 고르면 설명이 여기에 나와요.</p></div>
    </div>`, {
    back: () => backTo(), cyc: (i, b) => { if (!b.matches('.srow')) return; change(i, 1); }, inc: i => change(i, 1), dec: i => change(i, -1),
    pedit: () => { close(); G.editPad(() => settings(backTo)); },
    exp: () => dataPanel(() => settings(backTo)), cpn: () => coupon(() => settings(backTo)),
    wipe: () => confirmBox('이 기기의 저장 데이터를 모두 지울까요?<br><small>영웅, 재화, 클리어 기록이 전부 사라져요.</small>', '모두 지우기', () => G.wipe(), () => settings(backTo)),
  }, { back: () => backTo(), after: r => {
    r.querySelectorAll('.srow').forEach(b => b.addEventListener('focus', () => {
      const d = r.querySelector('.sdesc'); const i = b.dataset.v, row = i != null && b.dataset.a === 'cyc' ? SETROWS[+i] : null;
      d.innerHTML = `<h3>${b.querySelector('span').textContent}</h3><p>${b.dataset.desc || ''}</p>${row && (row.type === 'pct' || row.type === 'scale') ? `<div class="bar"><i style="width:${row.type === 'scale' ? (st[row.k] - row.min) / (row.max - row.min) * 100 : st[row.k] * 100}%"></i></div><b class="big">${Math.round(st[row.k] * 100)}%</b>` : ''}`;
    }));
    r.querySelector('.srow')?.dispatchEvent(new Event('focus'));
  } });
}
function dataPanel(backTo) {
  const code = exportCode(G.save);
  show('data', head('저장 데이터') + `
    <div class="win pad">
      <p class="note">아래 코드를 복사해 두면 다른 기기나 브라우저에서 그대로 이어할 수 있어요.</p>
      <textarea id="dcode" class="code" readonly>${code}</textarea>
      <div class="row"><button class="btn nav" data-a="copy">코드 복사</button></div>
      <p class="note">다른 곳에서 내보낸 코드를 붙여 넣고 가져오면 지금 기록을 덮어써요.</p>
      <textarea id="icode" class="code" placeholder="WH1. 로 시작하는 코드를 붙여 넣으세요"></textarea>
      <div class="row"><button class="btn nav" data-a="imp">가져오기</button></div>
      <p class="msg" id="dmsg" role="status"></p>
    </div>`, {
    back: backTo,
    copy: () => { const t = root.querySelector('#dcode'); const ok = () => { root.querySelector('#dmsg').textContent = '복사했어요.'; sfx('ok'); };
      try { navigator.clipboard.writeText(code).then(ok, () => { t.select(); root.querySelector('#dmsg').textContent = '자동 복사가 막혀 있어요. 선택된 코드를 직접 복사하세요.'; }); } catch (e) { t.select(); } },
    imp: () => { try { const s = importCode(root.querySelector('#icode').value); G.replaceSave(s); root.querySelector('#dmsg').textContent = '가져왔어요.'; sfx('ok'); } catch (e) { root.querySelector('#dmsg').textContent = '코드를 읽지 못했어요. WH1. 로 시작하는 코드 전체를 붙여 넣었는지 확인하세요.'; sfx('no'); } },
  }, { back: backTo });
}
function coupon(backTo) {
  show('coupon', head('쿠폰 코드') + `<div class="win pad narrow">
      <label class="note" for="cin">쿠폰 코드</label>
      <input id="cin" class="code1" autocomplete="off" spellcheck="false" placeholder="예: WOLHA">
      <div class="row"><button class="btn nav main" data-a="use">받기</button></div>
      <p class="msg" id="cmsg" role="status"></p></div>`, {
    back: backTo,
    use: () => {
      const v = root.querySelector('#cin').value.trim().toUpperCase(), c = COUPONS[v], m = root.querySelector('#cmsg');
      if (!c) { m.textContent = '없는 코드예요. 철자를 확인하세요.'; sfx('no'); return; }
      if (G.save.coupons.includes(v)) { m.textContent = '이미 받은 쿠폰이에요.'; sfx('no'); return; }
      G.save.coupons.push(v); G.save.moon += c.moon || 0; G.save.silver += c.silver || 0; G.persist(); m.textContent = c.msg; sfx('level');
    },
  }, { back: backTo });
}

/* ---------------- 조작법 ---------------- */
export function controls(backTo, tab = 0) {
  const keys = [['이동', 'A · D  /  ← →'], ['점프 (2단)', 'W · Space · ↑ · K'], ['발판 아래로', 'S + 점프'], ['기본 공격', 'J · Z'], ['대시', 'Shift · L · C'], ['스킬 1', 'E'], ['스킬 2', 'Q'], ['교대', 'G'], ['상호작용', 'F'], ['일시정지 · 메뉴', 'Esc']];
  const tips = tab === 0 ? [
    ['콤보', '기본 공격을 연타하면 무기마다 3~5연격이 이어져요. 마지막 타격은 강하게 들어가요.'],
    ['대시', '대시하는 동안 잠깐 무적이에요. 공중에서도 한 번 쓸 수 있어요.'],
    ['스킬', 'E와 Q는 영웅마다 달라요. 쿨타임이 끝나면 아이콘 테두리가 밝아져요.'],
    ['교대', '교대 영웅이 등장하면서 주변을 베어요. 출전 영웅이 쓰러지면 교대 영웅이 자동으로 나와요.'],
    ['보스', '월식수는 돌진, 도약 내려찍기, 울부짖기를 써요. 내려찍기의 충격파는 점프로 피하세요.'],
  ] : [
    ['이동', '왼쪽 아래 원을 끌어서 움직여요. 아래로 끌고 점프하면 발판 아래로 내려가요.'],
    ['공격', '오른쪽 큰 버튼이 기본 공격이에요. 길게 누르지 말고 톡톡 연타하세요.'],
    ['스킬', '스킬1·스킬2 버튼에 쿨타임이 남아 있으면 눌러도 나가지 않아요.'],
    ['화면', '휴대폰은 가로로 돌리면 더 크게 보여요. 설정에서 터치 패드를 끌 수도 있어요.'],
  ];
  show('controls', head('조작법') + `
    <div class="cols">
      <div class="win list"><table class="ktable"><thead><tr><th>행동</th><th>키보드</th></tr></thead><tbody>${keys.map(k => `<tr><td>${k[0]}</td><td>${k[1]}</td></tr>`).join('')}</tbody></table></div>
      <div class="win">
        <div class="tabs"><button class="tab nav ${tab === 0 ? 'on' : ''}" data-a="t0">전투 요령</button><button class="tab nav ${tab === 1 ? 'on' : ''}" data-a="t1">터치 조작</button></div>
        <dl class="tips">${tips.map(t => `<dt>${t[0]}</dt><dd>${t[1]}</dd>`).join('')}</dl>
      </div>
    </div>`, { back: () => backTo(), t0: () => controls(backTo, 0), t1: () => controls(backTo, 1) },
    { back: () => backTo(), keys: k => { if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'KeyA' || k === 'KeyD') { controls(backTo, tab ? 0 : 1); return true; } } });
}

/* ---------------- 기록 ---------------- */
export function records(backTo) {
  const S = G.save, own = Object.keys(S.heroes).length, cl = Object.keys(S.cleared).length;
  const days = Math.max(1, Math.ceil((Date.now() - S.created) / 864e5));
  show('records', head('기록 비석') + `
    <div class="win pad">
      <dl class="stats">
        <div><dt>클리어한 스테이지</dt><dd>${cl} <small>/ ${STAGES.length}</small></dd></div>
        <div><dt>무한 회랑 최고</dt><dd>${S.endlessBest} <small>웨이브</small></dd></div>
        <div><dt>보유 영웅</dt><dd>${own} <small>/ ${HEROES.length}</small></dd></div>
        <div><dt>처치한 적</dt><dd>${fmt(S.kills)}</dd></div>
        <div><dt>소환 횟수</dt><dd>${fmt(S.pulls)}</dd></div>
        <div><dt>함께한 날</dt><dd>${days} <small>일째</small></dd></div>
      </dl>
      <p class="note">기록은 이 기기 브라우저에 저장돼요. 친구와 겨루는 온라인 랭킹은 다음 업데이트에서 준비 중이에요.</p>
    </div>`, { back: () => backTo() }, { back: () => backTo() });
}

/* ---------------- 소환 제단 ---------------- */
export function gacha(backTo) {
  const S = G.save, f5 = HEROES.filter(h => h.rarity === 5), feat = [...f5.slice(0, 2), ...HEROES.filter(h => h.rarity >= 6), ...f5.slice(2)];
  show('gacha', head('소환 제단', wallet()) + `
    <div class="cols g">
      <div class="win banner">
        <div class="bimg">${feat.map(h => sprite(h.id, h.rarity >= 6 ? 'big six' : 'big')).join('')}</div>
        <div class="btext">
          <span class="eyebrow">상시 소환</span>
          <h3>달빛 아래 모인 영웅들</h3>
          <p><span class="stars r6">★6</span> 아스벨 ${(GACHA.p6 * 100).toFixed(1)}% · ★5 ${(GACHA.p5 * 100).toFixed(1)}% · ★4 ${(GACHA.p4 * 100).toFixed(0)}%<br>10회마다 ★4 이상 확정 · ${GACHA.pity5}회 안에 ★5 · ${GACHA.pity6}회 안에 ★6 확정</p>
          <p class="pity">★5 확정까지 <b>${GACHA.pity5 - S.pity5}</b>회 · ★6 확정까지 <b>${GACHA.pity6 - (S.pity6 || 0)}</b>회</p>
        </div>
      </div>
      <div class="win gside">
        <button class="btn nav" data-a="one" ${S.moon < GACHA.cost1 ? 'disabled' : ''}><span>1회 소환</span><span class="cost">${coin('moon')}${GACHA.cost1}</span></button>
        <button class="btn nav main" data-a="ten" ${S.moon < GACHA.cost10 ? 'disabled' : ''} autofocus><span>10회 소환</span><span class="cost">${coin('moon')}${GACHA.cost10}</span></button>
        <button class="btn nav" data-a="list">등장 목록</button>
        <p class="note">${S.moon < GACHA.cost1 ? '월석이 부족해요. 스테이지를 처음 클리어하거나 무한 회랑 5웨이브마다 월석을 받아요.' : '이미 가진 영웅이 다시 나오면 각성해서 더 강해져요 (최대 5단계).'}</p>
      </div>
    </div>`, {
    back: () => backTo(), one: () => doPull(1, backTo), ten: () => doPull(10, backTo), list: () => rates(() => gacha(backTo)),
  }, { back: () => backTo() });
}
function doPull(n, backTo) {
  const S = G.save, cost = n === 10 ? GACHA.cost10 : GACHA.cost1;
  if (S.moon < cost) { sfx('no'); return; }
  S.moon -= cost;
  const res = [];
  for (let i = 0; i < n; i++) res.push(pullOne(S));
  if (n === 10 && !res.some(r => r.r >= 4)) { /* 10회 보장은 pity4로 처리됨 */ }
  if (!S.party[1]) { const nw = res.find(r => r.res === 'new' && r.id !== S.party[0]); if (nw) S.party[1] = nw.id; }
  G.persist(); sfx('pull');
  const best = Math.max(...res.map(r => r.r));
  setTimeout(() => sfx(best >= 5 ? 'r5' : best === 4 ? 'r4' : 'ok'), 450);
  show('gachaRes', `<div class="gres ${best === 6 ? 'rainbow' : best === 5 ? 'gold' : best === 4 ? 'violet' : ''}">
      <div class="cards n${n}">${res.map((r, i) => `<div class="gcard r${r.r}" style="--d:${i * (n === 10 ? 90 : 0) + 250}ms">
        ${sprite(r.id)}<b>${HERO[r.id].name}</b>${stars(r.r)}
        <span class="gtag ${r.res}">${r.res === 'new' ? 'NEW' : r.res === 'aw' ? '각성 ' + r.aw : '은화 +' + r.silver}</span></div>`).join('')}</div>
      <div class="row">
        <button class="btn nav" data-a="again" ${S.moon < cost ? 'disabled' : ''}>${n}회 더 <span class="cost">${coin('moon')}${cost}</span></button>
        <button class="btn nav main" data-a="ok" autofocus>확인</button>
      </div></div>`, { ok: () => gacha(backTo), again: () => doPull(n, backTo) }, { cls: 'center dark', back: () => gacha(backTo) });
}
function pullOne(S) {
  S.pulls++; S.pity6 = (S.pity6 || 0) + 1; S.pity5++; S.pity4++;
  const x = Math.random();
  let r = 3;
  if (S.pity6 >= GACHA.pity6 || x < GACHA.p6) r = 6;
  else if (S.pity5 >= GACHA.pity5 || x < GACHA.p6 + GACHA.p5) r = 5;
  else if (S.pity4 >= GACHA.pity4 || x < GACHA.p6 + GACHA.p5 + GACHA.p4) r = 4;
  if (r === 6) { S.pity6 = 0; S.pity5 = 0; S.pity4 = 0; } else if (r === 5) { S.pity5 = 0; S.pity4 = 0; } else if (r === 4) S.pity4 = 0;
  const pool = HEROES.filter(h => h.rarity === r), def = pool[Math.random() * pool.length | 0];
  const own = S.heroes[def.id];
  if (!own) { S.heroes[def.id] = { lv: 1, aw: 0 }; return { id: def.id, r, res: 'new' }; }
  if (own.aw < 5) { own.aw++; return { id: def.id, r, res: 'aw', aw: own.aw }; }
  const v = { 3: 100, 4: 300, 5: 1000, 6: 2000 }[r]; S.silver += v; return { id: def.id, r, res: 'silver', silver: v };
}
function rates(backTo) {
  const grp = [6, 5, 4, 3].map(r => {
    const list = HEROES.filter(h => h.rarity === r), p = r === 6 ? GACHA.p6 : r === 5 ? GACHA.p5 : r === 4 ? GACHA.p4 : 1 - GACHA.p6 - GACHA.p5 - GACHA.p4;
    return `<div class="glabel">${stars(r)} <span>${(p * 100).toFixed(1)}% · ${list.length}명</span></div>
      <div class="rgrid">${list.map(h => `<div class="rcard r${r}">${sprite(h.id)}<div><b>${h.name}</b><span>${(p / list.length * 100).toFixed(2)}%</span></div></div>`).join('')}</div>`;
  }).join('');
  show('rates', head('등장 목록', '<span class="note">1회 소환당 개별 확률</span>') + `<div class="win pad scroll">${grp}</div>`, { back: backTo }, { back: backTo });
}

/* ---------------- 영웅록 ---------------- */
export function codex(backTo, sel) {
  const S = G.save;
  const cards = HEROES.map(h => {
    const o = S.heroes[h.id];
    return `<button class="hcard nav r${h.rarity} ${o ? '' : 'locked'}" data-a="pick" data-v="${h.id}">${sprite(h.id)}<b>${o ? h.name : '???'}</b>${stars(h.rarity)}${o ? `<span class="lv">Lv.${o.lv}${o.aw ? ' · 각성' + o.aw : ''}</span>` : '<span class="lv">미획득</span>'}</button>`;
  }).join('');
  show('codex', head('영웅록', `<span class="note">${Object.keys(S.heroes).length} / ${HEROES.length}명</span>`) + `<div class="win pad scroll"><div class="hgrid">${cards}</div></div>`,
    { back: () => backTo(), pick: id => { sfx('ui'); heroDetail(id, () => codex(backTo)); } }, { back: () => backTo() });
}
export function heroDetail(id, backTo) {
  const S = G.save, h = HERO[id], o = S.heroes[id], lv = o ? o.lv : 1, aw = o ? o.aw : 0, st = heroStats(h, lv, aw);
  const sk = (t, nm, key) => `<div class="skill"><img src="${Art.skillURL(t, h.pal.acc)}" alt=""><div><b>${key} · ${nm}</b><span>쿨타임 ${SKILLS[t].cd}초</span><p>${SKILLS[t].desc}</p></div></div>`;
  show('hero', head(o ? h.name : '미획득 영웅') + `
    <div class="cols">
      <div class="win hero-show r${h.rarity}">${sprite(id, 'huge' + (o ? '' : ' locked'))}<div class="hname"><small>${h.title}</small><b>${o ? h.name : '???'}</b>${stars(h.rarity)}</div></div>
      <div class="win pad scroll">
        <dl class="kv"><div><dt>무기</dt><dd>${WEAPONS[h.weapon].name}</dd></div><div><dt>레벨</dt><dd>${o ? lv + ' / ' + MAX_LV : '-'}</dd></div><div><dt>각성</dt><dd>${o ? aw + ' / 5' : '-'}</dd></div>
          <div><dt>HP</dt><dd>${st.hp}</dd></div><div><dt>공격력</dt><dd>${st.atk}</dd></div><div><dt>전투력</dt><dd>${power(h, lv, aw)}</dd></div></dl>
        ${sk(h.e, h.eName, 'E')}${sk(h.q, h.qName, 'Q')}
        <p class="flavor">${o ? h.desc : '소환 제단에서 만날 수 있어요.'}</p>
        ${o ? `<div class="row"><button class="btn nav" data-a="main" ${S.party[0] === id ? 'disabled' : ''}>출전으로</button><button class="btn nav" data-a="sub" ${S.party[1] === id ? 'disabled' : ''}>교대로</button><button class="btn nav" data-a="tr">수련하기</button></div>` : ''}
      </div>
    </div>`, {
    back: () => backTo(),
    main: () => { setParty(0, id); heroDetail(id, backTo); }, sub: () => { setParty(1, id); heroDetail(id, backTo); },
    tr: () => train(() => heroDetail(id, backTo), id),
  }, { back: () => backTo() });
}
function setParty(slot, id) {
  const P = G.save.party, other = 1 - slot;
  if (P[other] === id) P[other] = P[slot];
  P[slot] = id;
  if (!P[0]) { P[0] = P[1]; P[1] = null; }
  G.persist(); G.refreshParty(); sfx('ok');
}

/* ---------------- 편성 ---------------- */
export function party(backTo, slot = 0) {
  const S = G.save, P = S.party;
  const slotHtml = (i, label) => {
    const id = P[i];
    return `<button class="pslot nav ${slot === i ? 'on' : ''}" data-a="slot" data-v="${i}"><span class="plabel">${label}</span>${id ? sprite(id, 'big') + `<b>${HERO[id].name}</b><span class="lv">Lv.${S.heroes[id].lv} · 전투력 ${power(HERO[id], S.heroes[id].lv, S.heroes[id].aw)}</span>` : '<b class="empty">비어 있음</b><span class="lv">아래에서 영웅을 고르세요</span>'}</button>`;
  };
  const owned = HEROES.filter(h => S.heroes[h.id]);
  show('party', head('편성', '<span class="note">출전 영웅으로 싸우고, G로 교대 영웅과 바꿔요</span>') + `
    <div class="win pad scroll">
      <div class="pslots">${slotHtml(0, '출전')}${slotHtml(1, '교대')}</div>
      ${slot === 1 && P[1] ? '<div class="row"><button class="btn nav" data-a="clear">교대 비우기</button></div>' : ''}
      <div class="glabel">보유 영웅 · ${slot === 0 ? '출전' : '교대'} 자리에 넣을 영웅을 고르세요</div>
      <div class="hgrid">${owned.map(h => { const o = S.heroes[h.id], inP = P.indexOf(h.id); return `<button class="hcard nav r${h.rarity} ${inP >= 0 ? 'inparty' : ''}" data-a="put" data-v="${h.id}">${sprite(h.id)}<b>${h.name}</b>${stars(h.rarity)}<span class="lv">${inP === 0 ? '출전 중' : inP === 1 ? '교대 중' : 'Lv.' + o.lv}</span></button>`; }).join('')}</div>
      ${owned.length < 2 ? '<p class="note">영웅이 한 명뿐이에요. 소환 제단에서 동료를 데려오면 교대할 수 있어요.</p>' : ''}
    </div>`, {
    back: () => backTo(), slot: v => { sfx('ui'); party(backTo, +v); },
    put: id => { setParty(slot, id); party(backTo, slot); },
    clear: () => { S.party[1] = null; G.persist(); G.refreshParty(); party(backTo, 1); },
  }, { back: () => backTo() });
}

/* ---------------- 영웅 수련 ---------------- */
export function train(backTo, focusId) {
  const S = G.save, owned = HEROES.filter(h => S.heroes[h.id]).sort((a, b) => (S.party.indexOf(b.id) >= 0) - (S.party.indexOf(a.id) >= 0) || b.rarity - a.rarity);
  const rows = owned.map(h => {
    const o = S.heroes[h.id], max = o.lv >= MAX_LV, cost = lvCost(o.lv), st = heroStats(h, o.lv, o.aw), nx = max ? null : heroStats(h, o.lv + 1, o.aw);
    return `<div class="trow r${h.rarity}">${face(h.id)}<div class="tinfo"><b>${h.name}</b> ${stars(h.rarity)}<span>Lv.${o.lv} · HP ${st.hp}${nx ? ' → ' + nx.hp : ''} · 공격력 ${st.atk}${nx ? ' → ' + nx.atk : ''}</span></div>
      <button class="btn nav sm" data-a="up" data-v="${h.id}" ${max || S.silver < cost ? 'disabled' : ''} ${h.id === focusId ? 'autofocus' : ''}>${max ? '최대 레벨' : `레벨 업 <span class="cost">${coin('silver')}${fmt(cost)}</span>`}</button>
      <button class="btn nav sm" data-a="up5" data-v="${h.id}" ${max || S.silver < cost ? 'disabled' : ''}>최대한</button></div>`;
  }).join('');
  show('train', head('영웅 수련', wallet()) + `<div class="win pad scroll"><p class="note">은화로 레벨을 올려요. 레벨이 오를 때마다 HP와 공격력이 7%씩 올라요. 은화는 적을 쓰러뜨리거나 스테이지를 클리어하면 받아요.</p>${rows}</div>`, {
    back: () => backTo(),
    up: id => { lvUp(id, 1); train(backTo, id); },
    up5: id => { lvUp(id, 99); train(backTo, id); },
  }, { back: () => backTo() });
}
function lvUp(id, n) {
  const S = G.save, o = S.heroes[id]; let k = 0;
  while (k < n && o.lv < MAX_LV && S.silver >= lvCost(o.lv)) { S.silver -= lvCost(o.lv); o.lv++; k++; }
  if (k) { sfx('level'); G.persist(); G.refreshParty(); toast(`${HERO[id].name} Lv.${o.lv}`); } else sfx('no');
}

/* ---------------- 출정 ---------------- */
export function stages(backTo, tab, selId) {
  const S = G.save;
  const unlocked = s => !s.prev || S.cleared[s.prev];
  if (tab == null) { const nxt = STAGES.find(s => !S.cleared[s.id] && unlocked(s)); tab = nxt ? nxt.chapter - 1 : 0; selId = selId || (nxt && nxt.id); }
  const myPow = S.party.filter(Boolean).reduce((a, id) => Math.max(a, power(HERO[id], S.heroes[id].lv, S.heroes[id].aw)), 0);
  const tabs = CHAPTERS.map((c, i) => `<button class="tab nav ${tab === i ? 'on' : ''}" data-a="tab" data-v="${i}">제${c.id}장 ${c.name}</button>`).join('') + `<button class="tab nav ${tab === 2 ? 'on' : ''}" data-a="tab" data-v="2">무한 회랑</button>`;
  let body;
  if (tab === 2) {
    body = `<div class="win pad endless">
      <h3>무한 회랑</h3>
      <p>끝없이 이어지는 붉은 문 사이로 그림자 무리가 몰려와요. 웨이브가 오를수록 적이 강해지고, 5웨이브마다 월식수가 나타나요.</p>
      <dl class="kv"><div><dt>최고 기록</dt><dd>${S.endlessBest} 웨이브</dd></div><div><dt>보상</dt><dd>웨이브마다 은화 · 5웨이브마다 ${coin('moon')}60</dd></div></dl>
      <div class="row"><button class="btn nav main" data-a="endless" autofocus>출정</button></div></div>`;
  } else {
    const ch = CHAPTERS[tab];
    const sel = STAGE[selId] && STAGE[selId].chapter === ch.id ? STAGE[selId] : ch.stages.find(s => unlocked(s) && !S.cleared[s.id]) || ch.stages[0];
    const list = ch.stages.map(s => { const u = unlocked(s), c = S.cleared[s.id]; return `<button class="srow nav ${sel.id === s.id ? 'on' : ''}" data-a="sel" data-v="${s.id}" ${u ? '' : 'disabled'}><span>${s.id}  ${u ? s.name : '잠김'}</span><span class="sval">${s.boss ? '<em class="bosstag">BOSS</em>' : ''}${c ? '<em class="clr">클리어</em>' : ''}</span></button>`; }).join('');
    const ens = [...new Set(sel.waves.flat())];
    const first = !S.cleared[sel.id];
    body = `<div class="cols">
      <div class="win list">${list}</div>
      <div class="win pad sinfo">
        <h3>${sel.id} ${sel.name}</h3>
        <dl class="kv"><div><dt>권장 전투력</dt><dd class="${myPow >= sel.rec ? 'ok' : 'warn'}">${sel.rec}</dd></div><div><dt>내 전투력</dt><dd>${myPow}</dd></div><div><dt>웨이브</dt><dd>${sel.waves.length}</dd></div></dl>
        <div class="glabel">등장하는 적</div><p class="enemies">${ens.map(t => `<span class="${ENEMIES[t].boss ? 'boss' : ENEMIES[t].elite ? 'elite' : ''}">${ENEMIES[t].name}</span>`).join('')}</p>
        <div class="glabel">보상</div><p class="rew">${coin('silver')} ${fmt(sel.reward.silver)} + 처치 은화 · ${coin('moon')} ${first ? sel.reward.firstMoon + ' <small>(첫 클리어)</small>' : sel.reward.moon}</p>
        <div class="row"><button class="btn nav main" data-a="go" data-v="${sel.id}" ${unlocked(sel) ? 'autofocus' : 'disabled'}>출정</button></div>
      </div></div>`;
  }
  show('stages', head('출정의 문') + `<div class="tabs top">${tabs}</div>` + body, {
    back: () => backTo(), tab: v => { sfx('ui'); stages(backTo, +v); }, sel: v => { sfx('ui'); stages(backTo, tab, v); },
    go: v => { sfx('ok'); G.startStage(v); }, endless: () => { sfx('ok'); G.startEndless(); },
  }, { back: () => backTo() });
}

/* ---------------- 결과 ---------------- */
export function result(r) {
  const win = r.win, t = Math.round(r.time), next = r.next;
  show('result', `<div class="win result ${win ? 'win-g' : 'lose'}">
      <span class="eyebrow">${r.endless ? '무한 회랑' : r.stageId + ' ' + r.stageName}</span>
      <h2>${win ? '승리' : r.endless ? '회랑에서 물러났어요' : '패배'}</h2>
      <dl class="kv">
        ${r.endless ? `<div><dt>도달 웨이브</dt><dd>${r.wave}${r.best ? ' <em class="clr">최고 기록</em>' : ''}</dd></div>` : ''}
        <div><dt>처치</dt><dd>${r.kills}</dd></div><div><dt>시간</dt><dd>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</dd></div>
        <div><dt>은화</dt><dd>${coin('silver')} +${fmt(r.silver)}</dd></div>
        ${r.moon ? `<div><dt>월석</dt><dd>${coin('moon')} +${fmt(r.moon)}${r.first ? ' <small>첫 클리어</small>' : ''}</dd></div>` : ''}
      </dl>
      ${!win && !r.endless ? '<p class="note">영웅 수련에서 레벨을 올리거나, 교대 영웅을 편성하면 더 오래 버틸 수 있어요.</p>' : ''}
      <div class="row">
        <button class="btn nav" data-a="re">다시 하기</button>
        ${next ? '<button class="btn nav main" data-a="next" autofocus>다음 스테이지</button>' : ''}
        <button class="btn nav ${next ? '' : 'main'}" data-a="hub" ${next ? '' : 'autofocus'}>월하정으로</button>
      </div></div>`, {
    re: () => r.endless ? G.startEndless() : G.startStage(r.stageId), next: () => G.startStage(next), hub: () => G.enterHub(),
  }, { cls: 'center', back: () => G.enterHub() });
}
