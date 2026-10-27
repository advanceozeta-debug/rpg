// 월하검무 — 게임 데이터 (영웅, 무기, 스킬, 적, 스테이지)
export const VW = 320, VH = 180, GROUND = 152;
export const VERSION = 'v0.4.0';

export const RARITY = {
  3: { stars: '★★★', color: '#8fb8ff', name: '★3' },
  4: { stars: '★★★★', color: '#c99bff', name: '★4' },
  5: { stars: '★★★★★', color: '#ffd36b', name: '★5' },
  6: { stars: '★★★★★★', color: '#ff9be8', name: '★6' },
};

// 무기별 기본 공격 콤보
export const WEAPONS = {
  sword: { name: '검', hpMul: 1, atkMul: 1, steps: [
    { kind: 'arc', mul: 1, reach: 24, h: 30, dur: .27, hitAt: .06, arc: [-2.1, 1.15], lunge: 70 },
    { kind: 'arc', mul: 1, reach: 24, h: 30, dur: .27, hitAt: .06, arc: [1.25, -1.45], lunge: 70 },
    { kind: 'arc', mul: 1.7, reach: 30, h: 34, dur: .36, hitAt: .08, arc: [-2.7, 1.7], lunge: 140, heavy: true },
  ] },
  greatsword: { name: '대검', hpMul: 1.12, atkMul: 1.15, steps: [
    { kind: 'arc', mul: 1.3, reach: 30, h: 34, dur: .4, hitAt: .12, arc: [-2.4, 1.2], lunge: 50, heavy: true },
    { kind: 'arc', mul: 1.3, reach: 30, h: 34, dur: .4, hitAt: .12, arc: [1.3, -1.6], lunge: 50, heavy: true },
    { kind: 'arc', mul: 2.4, reach: 36, h: 40, dur: .55, hitAt: .18, arc: [-3, 1.6], lunge: 110, heavy: true, shake: 4 },
  ] },
  spear: { name: '창', hpMul: 1, atkMul: 1, steps: [
    { kind: 'thrust', mul: .85, reach: 36, h: 12, dur: .22, hitAt: .06, lunge: 60 },
    { kind: 'thrust', mul: .85, reach: 36, h: 12, dur: .22, hitAt: .06, lunge: 60 },
    { kind: 'arc', mul: 1.1, reach: 30, h: 32, dur: .3, hitAt: .08, arc: [-2.3, 1.1], lunge: 40 },
    { kind: 'thrust', mul: 1.8, reach: 46, h: 14, dur: .38, hitAt: .1, lunge: 180, heavy: true },
  ] },
  daggers: { name: '쌍단검', hpMul: .95, atkMul: .8, steps: [
    { kind: 'arc', mul: .7, reach: 19, h: 24, dur: .16, hitAt: .04, arc: [-1.6, 1], lunge: 60 },
    { kind: 'arc', mul: .7, reach: 19, h: 24, dur: .16, hitAt: .04, arc: [1, -1.4], lunge: 60 },
    { kind: 'arc', mul: .75, reach: 19, h: 24, dur: .16, hitAt: .04, arc: [-1.6, 1], lunge: 60 },
    { kind: 'arc', mul: .75, reach: 19, h: 24, dur: .16, hitAt: .04, arc: [1, -1.4], lunge: 60 },
    { kind: 'arc', mul: 1.5, reach: 25, h: 30, dur: .3, hitAt: .07, arc: [-2.8, 1.8], lunge: 150, heavy: true },
  ] },
  bow: { name: '활', hpMul: .9, atkMul: 1, steps: [
    { kind: 'shot', mul: .9, dur: .26, hitAt: .1, shot: 'arrow' },
    { kind: 'shot', mul: .9, dur: .26, hitAt: .1, shot: 'arrow' },
    { kind: 'shot', mul: 1.6, dur: .4, hitAt: .18, shot: 'arrow', pierce: true, heavy: true },
  ] },
  staff: { name: '지팡이', hpMul: .9, atkMul: 1.05, steps: [
    { kind: 'shot', mul: .95, dur: .3, hitAt: .12, shot: 'orb' },
    { kind: 'shot', mul: .95, dur: .3, hitAt: .12, shot: 'orb' },
    { kind: 'shot', mul: 1.9, dur: .45, hitAt: .2, shot: 'bigorb', heavy: true },
  ] },
};

export const SKILLS = {
  wave:      { cd: 4.5, mul: 2.4, desc: '초승달 검기를 날려 앞의 적을 모두 꿰뚫습니다.' },
  dashslash: { cd: 5,   mul: 2.6, desc: '앞으로 순식간에 돌진하며 지나간 자리의 적을 벱니다. 돌진 중 무적.' },
  spin:      { cd: 7,   mul: .7,  desc: '1초 동안 회전하며 주변의 적을 연속으로 공격합니다.' },
  bolt:      { cd: 4,   mul: 1.3, desc: '세 갈래로 탄을 쏩니다.' },
  nova:      { cd: 9,   mul: 4,   desc: '잠시 힘을 모은 뒤 앞쪽에 큰 폭발을 일으킵니다.' },
  rain:      { cd: 9,   mul: 1.1, desc: '앞쪽 넓은 범위에 열 번 쏟아붓습니다.' },
  heal:      { cd: 12,  mul: 1,   desc: '출전·교대 영웅의 HP를 25% 회복하고 주변 적에게 피해를 줍니다.' },
  buff:      { cd: 14,  mul: 0,   desc: '7초 동안 공격력이 40% 오르고 이동이 빨라집니다.' },
  uppercut:  { cd: 5,   mul: 2.8, desc: '적을 공중으로 띄워 올리며 함께 솟구칩니다.' },
  chain:     { cd: 6,   mul: 2.2, desc: '가까운 적 네 명에게 번개를 떨어뜨립니다.' },
  crescent3: { cd: 6,   mul: 2.1, desc: '보랏빛 거대한 초승달 검기를 연달아 세 번 날립니다. 모두 꿰뚫어요.' },
  phantom:   { cd: 10,  mul: 3.2, desc: '눈에 보이지 않는 속도로 돌진해 베고, 지나간 적에게 잔상이 네 번 더 칼을 휘두릅니다. 돌진 중 무적.' },
};

// pal: hair, coat, trim, acc(리본·장식), eye, style(long|short|pony|twin|bob)
export const HEROES = [
  { id: 'asbel', name: '아스벨', title: '월영의 검성', rarity: 6, weapon: 'sword', img: 'asbel', anchor: [25, 41],
    e: 'crescent3', eName: '월영 삼일섬', q: 'phantom', qName: '환영 난무',
    pal: { hair: '#d9dcef', coat: '#2f3f9a', trim: '#c9b07a', acc: '#a77bff', eye: '#4a5cff', style: 'long' },
    desc: '달이 가려진 밤에만 모습을 드러내는 검성. 보랏빛으로 빛나는 검은 그림자까지 벤다고 해요.' },
  { id: 'ria', name: '리아', title: '달빛 검사', rarity: 4, weapon: 'sword',
    e: 'wave', eName: '월광참', q: 'dashslash', qName: '그림자 베기',
    pal: { hair: '#e9edfb', coat: '#2e3f7d', trim: '#f3c75b', acc: '#5fdcff', eye: '#3cc8f2', style: 'long' },
    desc: '달이 뜨는 밤에만 칼을 뽑는 검사. 월하정을 지키는 마지막 문지기예요.' },
  { id: 'seren', name: '세렌', title: '은월의 기사', rarity: 5, weapon: 'greatsword',
    e: 'spin', eName: '은월 회전', q: 'nova', qName: '성운 낙하',
    pal: { hair: '#d9d0ff', coat: '#3b2563', trim: '#dfe4f5', acc: '#c79bff', eye: '#a77bff', style: 'pony' },
    desc: '자기 키만 한 대검을 가볍게 휘두르는 기사단장. 말수가 적고 걸음이 빨라요.' },
  { id: 'haru', name: '하루', title: '홍련 창술사', rarity: 5, weapon: 'spear',
    e: 'dashslash', eName: '홍련 돌격', q: 'uppercut', qName: '승천창',
    pal: { hair: '#ff7a4a', coat: '#7a1f2b', trim: '#f3c75b', acc: '#ffb347', eye: '#ffb347', style: 'short' },
    desc: '해가 진 뒤에도 꺼지지 않는 불꽃 같은 창술사. 늘 맨 앞에 서요.' },
  { id: 'yoru', name: '요루', title: '밤그늘 자객', rarity: 5, weapon: 'daggers',
    e: 'dashslash', eName: '야영', q: 'rain', qName: '천 개의 단검',
    pal: { hair: '#2d3150', coat: '#1b1d2b', trim: '#3fe0c5', acc: '#3fe0c5', eye: '#3fe0c5', style: 'bob' },
    desc: '그림자 사이를 건너뛰는 자객. 기척 없이 나타났다 사라져요.' },
  { id: 'mir', name: '미르', title: '청뢰의 술사', rarity: 5, weapon: 'staff',
    e: 'chain', eName: '청뢰', q: 'nova', qName: '별의 고동',
    pal: { hair: '#8fd6ff', coat: '#5d7fb8', trim: '#f3c75b', acc: '#bff0ff', eye: '#4fa8ff', style: 'twin' },
    desc: '구름 위에서 내려왔다는 소문이 있는 술사. 번개를 장난감처럼 다뤄요.' },
  { id: 'koha', name: '코하', title: '숲의 사수', rarity: 4, weapon: 'bow',
    e: 'bolt', eName: '삼연시', q: 'rain', qName: '화살비',
    pal: { hair: '#7ccf7a', coat: '#2d5a3c', trim: '#c9a26b', acc: '#c6f08a', eye: '#6fd16a', style: 'pony' },
    desc: '숲길의 모든 나무 이름을 아는 사수. 백 걸음 밖의 반딧불도 맞혀요.' },
  { id: 'danbi', name: '단비', title: '꽃비 무녀', rarity: 4, weapon: 'staff',
    e: 'heal', eName: '꽃비 치유', q: 'bolt', qName: '분홍 별탄',
    pal: { hair: '#ffa6c9', coat: '#8a3a5e', trim: '#f3c75b', acc: '#ffd1e3', eye: '#ff7fae', style: 'long' },
    desc: '가뭄 끝에 내리는 비처럼 반가운 무녀. 다친 동료를 그냥 지나치지 못해요.' },
  { id: 'kai', name: '카이', title: '파도 창병', rarity: 4, weapon: 'spear',
    e: 'uppercut', eName: '파도 찌르기', q: 'spin', qName: '와류',
    pal: { hair: '#3d4c8f', coat: '#4b587d', trim: '#dfe4f5', acc: '#7fb2ff', eye: '#7fb2ff', style: 'short' },
    desc: '바닷가 마을 출신 창병. 소용돌이처럼 창을 돌려 적을 휩쓸어요.' },
  { id: 'tori', name: '토리', title: '견습 검사', rarity: 3, weapon: 'sword',
    e: 'spin', eName: '회전 베기', q: 'buff', qName: '기합',
    pal: { hair: '#9a6a44', coat: '#5b5a33', trim: '#e0c27a', acc: '#e0c27a', eye: '#7a4a2a', style: 'short' },
    desc: '월하정에 들어온 지 얼마 안 된 견습생. 목소리가 제일 커요.' },
  { id: 'nagi', name: '나기', title: '바람 궁수', rarity: 3, weapon: 'bow',
    e: 'bolt', eName: '속사', q: 'buff', qName: '집중',
    pal: { hair: '#ffd76a', coat: '#2f6b6b', trim: '#ffe9a3', acc: '#ffe9a3', eye: '#3aa59a', style: 'twin' },
    desc: '바람 부는 방향을 읽는 궁수. 낮잠을 좋아해요.' },
  { id: 'sol', name: '솔', title: '대장간 검객', rarity: 3, weapon: 'greatsword',
    e: 'nova', eName: '대지 가르기', q: 'uppercut', qName: '올려베기',
    pal: { hair: '#ff9d4a', coat: '#6b3a22', trim: '#ffcf7a', acc: '#ffcf7a', eye: '#c46a2a', style: 'pony' },
    desc: '직접 벼린 대검을 쓰는 대장장이 딸. 망치질 소리로 하루를 시작해요.' },
  { id: 'bio', name: '비오', title: '회색 척후', rarity: 3, weapon: 'daggers',
    e: 'dashslash', eName: '질주', q: 'wave', qName: '그림자 표창',
    pal: { hair: '#9aa0b5', coat: '#3d4256', trim: '#c2c8de', acc: '#c2c8de', eye: '#8a90a8', style: 'bob' },
    desc: '비 오는 날 태어나 이름이 비오. 정찰을 맡으면 누구보다 빨라요.' },
];
export const HERO = Object.fromEntries(HEROES.map(h => [h.id, h]));

export const MAX_LV = 40;            // 한계돌파 전 최대 레벨
export const LB_MAX = 5, TR_MAX = 3, SKILL_MAX = 10;
export const lvCap = lb => MAX_LV + (lb || 0) * 10;
export function heroStats(def, lv = 1, aw = 0, tr = 0) {
  const base = { 3: [90, 9], 4: [100, 10], 5: [115, 12], 6: [135, 15] }[def.rarity];
  const w = WEAPONS[def.weapon];
  const g = 1 + (lv - 1) * .07, a = 1 + aw * .08, t = 1 + (tr || 0) * .15;
  return { hp: Math.round(base[0] * w.hpMul * g * a * t), atk: Math.round(base[1] * w.atkMul * g * a * t * 10) / 10 };
}
export function power(def, lv, aw, tr = 0, sk) {
  const s = heroStats(def, lv, aw, tr), sb = sk ? 1 + ((sk.e || 1) + (sk.q || 1) - 2) * .02 : 1;
  return Math.round((s.hp * .5 + s.atk * 10) * sb);
}
export const heroPower = (id, o) => power(HERO[id], o.lv, o.aw, o.tr, o.sk);
export function lvCost(lv) { return Math.round(40 * lv + 3 * lv * lv); }
// 한계돌파: 레벨 상한 +10, 결정·은화 필요
export const LB_COST = [{ crystal: 5, silver: 5000 }, { crystal: 10, silver: 15000 }, { crystal: 20, silver: 30000 }, { crystal: 35, silver: 60000 }, { crystal: 50, silver: 100000 }];
// 초월: 각성 5 이후 능력치 +15%, 별빛 조각·월석 필요
export const TR_COST = [{ shard: 20, moon: 500 }, { shard: 40, moon: 1000 }, { shard: 80, moon: 2000 }];
export const TR_COLOR = ['', '#7fe3ff', '#ffd36b', '#ff9be8'];
export const skillCost = l => ({ tome: l, silver: 400 * l });
export const MATS = {
  crystal: { name: '한계의 결정', desc: '한계돌파에 써요. 스테이지 클리어, 무한 회랑, 업적에서 얻어요.' },
  tome: { name: '비전서', desc: '스킬 강화에 써요. 스테이지 클리어, 무한 회랑, 업적에서 얻어요.' },
  shard: { name: '별빛 조각', desc: '초월에 써요. 각성 5인 영웅이 다시 소환되면 얻고, 업적에서도 얻어요.' },
};
export const DUP_SHARD = { 3: 2, 4: 5, 5: 15, 6: 30 };

// 영구 강화: 계정 전체 영웅에게 적용
export const PERM = [
  { k: 'atk', name: '공격 수련', desc: '모든 영웅의 공격력', per: .02, max: 50, base: 250, pct: true },
  { k: 'hp', name: '체력 수련', desc: '모든 영웅의 최대 HP', per: .02, max: 50, base: 250, pct: true },
  { k: 'crit', name: '급소 찌르기', desc: '치명타 확률', per: .005, max: 30, base: 450, pct: true, add: .15 },
  { k: 'critd', name: '일격필살', desc: '치명타 피해', per: .03, max: 30, base: 450, pct: true, add: 1.8, mulx: true },
  { k: 'cdr', name: '명상', desc: '스킬 쿨타임 감소', per: .01, max: 25, base: 700, pct: true },
  { k: 'spd', name: '경공', desc: '이동 속도', per: .01, max: 15, base: 600, pct: true },
  { k: 'gold', name: '재물운', desc: '은화 획득량', per: .03, max: 30, base: 350, pct: true },
];
export const permCost = (p, l) => Math.round(p.base * Math.pow(l + 1, 1.55));
export function permBonus(perm = {}) { const o = {}; for (const p of PERM) o[p.k] = (perm[p.k] || 0) * p.per; return o; }

// 업적
const A = (id, kind, target, name, reward) => ({ id, kind, target, name, reward });
export const ACH_KINDS = {
  kills: '적 처치', boss: '보스 처치', clear: '스테이지 클리어', endless: '무한 회랑 최고 웨이브', pull: '소환 횟수',
  own: '보유 영웅', lv: '가장 높은 영웅 레벨', lb: '한계돌파 합계', tr: '초월 합계', perm: '영구 강화 합계', skill: '스킬 강화 합계',
};
export const ACH = [
  A('k1', 'kills', 50, '그림자 사냥꾼 I', { moon: 160, silver: 1000 }), A('k2', 'kills', 300, '그림자 사냥꾼 II', { moon: 320, crystal: 3 }),
  A('k3', 'kills', 1500, '그림자 사냥꾼 III', { moon: 480, crystal: 8 }), A('k4', 'kills', 5000, '그림자 사냥꾼 IV', { moon: 1000, shard: 20 }),
  A('b1', 'boss', 1, '월식을 넘어 I', { moon: 300, crystal: 3 }), A('b2', 'boss', 5, '월식을 넘어 II', { moon: 500, tome: 5 }), A('b3', 'boss', 20, '월식을 넘어 III', { moon: 1000, shard: 20 }),
  A('c1', 'clear', 1, '첫 출정', { moon: 160, silver: 500 }), A('c5', 'clear', 5, '달빛 숲길 돌파', { moon: 480, crystal: 5 }), A('c10', 'clear', 10, '안개 낀 폐사 정복', { moon: 1000, crystal: 10, tome: 10 }),
  A('e5', 'endless', 5, '회랑 순례자 I', { moon: 160, tome: 2 }), A('e10', 'endless', 10, '회랑 순례자 II', { moon: 320, crystal: 5 }),
  A('e20', 'endless', 20, '회랑 순례자 III', { moon: 640, shard: 10 }), A('e30', 'endless', 30, '끝없는 회랑', { moon: 1200, shard: 25 }),
  A('p10', 'pull', 10, '첫 소환', { silver: 2000 }), A('p50', 'pull', 50, '소환의 달인 I', { moon: 320, shard: 5 }),
  A('p100', 'pull', 100, '소환의 달인 II', { moon: 640, shard: 10 }), A('p300', 'pull', 300, '소환의 달인 III', { moon: 1600, shard: 30 }),
  A('o3', 'own', 3, '동료 셋', { moon: 160 }), A('o6', 'own', 6, '작은 무리', { moon: 320, tome: 3 }), A('o9', 'own', 9, '월하정의 식구', { moon: 640, crystal: 5 }), A('o13', 'own', 13, '모두 모였다', { moon: 2000, shard: 30 }),
  A('l10', 'lv', 10, '수련의 시작', { silver: 3000 }), A('l20', 'lv', 20, '숙련된 검', { tome: 3, crystal: 2 }), A('l40', 'lv', 40, '한계에 닿다', { crystal: 10, moon: 300 }),
  A('l60', 'lv', 60, '한계 너머', { crystal: 15, tome: 5 }), A('l90', 'lv', 90, '전설의 경지', { moon: 2000, shard: 30 }),
  A('lb1', 'lb', 1, '첫 돌파', { moon: 300, tome: 3 }), A('lb5', 'lb', 5, '돌파의 연속', { crystal: 10, moon: 500 }), A('lb15', 'lb', 15, '부서진 한계', { shard: 20, moon: 1000 }),
  A('t1', 'tr', 1, '첫 초월', { moon: 500, crystal: 10 }), A('t3', 'tr', 3, '별이 되다', { moon: 1500, shard: 20 }),
  A('m10', 'perm', 10, '단련 I', { silver: 5000 }), A('m50', 'perm', 50, '단련 II', { moon: 500, crystal: 5 }), A('m150', 'perm', 150, '단련 III', { moon: 1500, shard: 20 }),
  A('s5', 'skill', 5, '비전 입문', { tome: 5 }), A('s20', 'skill', 20, '비전의 대가', { moon: 800, tome: 10 }),
];
export function achValue(S, kind) {
  const hs = Object.values(S.heroes || {});
  switch (kind) {
    case 'kills': return S.kills || 0;
    case 'boss': return S.bossKills || 0;
    case 'clear': return Object.keys(S.cleared || {}).length;
    case 'endless': return S.endlessBest || 0;
    case 'pull': return S.pulls || 0;
    case 'own': return hs.length;
    case 'lv': return hs.reduce((a, h) => Math.max(a, h.lv), 0);
    case 'lb': return hs.reduce((a, h) => a + (h.lb || 0), 0);
    case 'tr': return hs.reduce((a, h) => a + (h.tr || 0), 0);
    case 'perm': return Object.values(S.perm || {}).reduce((a, v) => a + v, 0);
    case 'skill': return hs.reduce((a, h) => a + ((h.sk?.e || 1) - 1) + ((h.sk?.q || 1) - 1), 0);
  }
  return 0;
}
export const achClaimable = S => S ? ACH.filter(a => !(S.ach || {})[a.id] && achValue(S, a.kind) >= a.target).length : 0;

// 뽑기 확률
export const GACHA = { cost1: 160, cost10: 1600, p6: .004, p5: .012, p4: .13, pity6: 160, pity5: 70, pity4: 10 };

export const ENEMIES = {
  slime:   { name: '달빛 슬라임', hp: 30,   dmg: 8,  w: 7,  h: 10, silver: 4 },
  wisp:    { name: '도깨비불',    hp: 22,   dmg: 10, w: 6,  h: 15, silver: 5, fly: true },
  bat:     { name: '그림자 박쥐', hp: 18,   dmg: 9,  w: 6,  h: 8,  silver: 5, fly: true },
  archer:  { name: '그림자 궁수', hp: 34,   dmg: 11, w: 6,  h: 22, silver: 7 },
  knight:  { name: '그림자 기사', hp: 230,  dmg: 12, w: 9,  h: 33, silver: 30, elite: true },
  eclipse: { name: '월식수',      hp: 1500, dmg: 16, w: 16, h: 28, silver: 120, boss: true },
  dummy:   { name: '수련 허수아비', hp: 1e9, dmg: 0, w: 6,  h: 24 },
};

const W = s => s.split(',').flatMap(p => { const [t, n] = p.split('*'); return Array(+n || 1).fill(t.trim()); });
export const CHAPTERS = [
  { id: 1, name: '달빛 숲길', theme: 'forest', stages: [
    { id: '1-1', name: '숲 입구', scale: 1, waves: ['slime*3', 'slime*4'] },
    { id: '1-2', name: '반딧불 오솔길', scale: 1.25, waves: ['slime*3,wisp*1', 'wisp*2,slime*3', 'bat*2,slime*2'] },
    { id: '1-3', name: '박쥐 굴 앞', scale: 1.5, waves: ['bat*3,slime*2', 'archer*1,slime*3', 'bat*2,archer*2'] },
    { id: '1-4', name: '기사의 다리', scale: 1.8, waves: ['wisp*3,bat*2', 'archer*2,slime*3', 'knight*1,slime*2'] },
    { id: '1-5', name: '월식의 언덕', scale: 2.1, boss: true, waves: ['slime*3,bat*2', 'eclipse*1'] },
  ] },
  { id: 2, name: '안개 낀 폐사', theme: 'temple', stages: [
    { id: '2-1', name: '무너진 산문', scale: 2.6, waves: ['slime*4,archer*1', 'wisp*3,bat*3', 'archer*3,slime*2'] },
    { id: '2-2', name: '이끼 낀 회랑', scale: 3, waves: ['bat*4,wisp*2', 'knight*1,archer*2', 'slime*5,bat*2'] },
    { id: '2-3', name: '종루', scale: 3.4, waves: ['archer*3,wisp*3', 'knight*1,bat*3', 'knight*1,archer*2'] },
    { id: '2-4', name: '안개 연못', scale: 3.9, waves: ['wisp*5,bat*3', 'knight*2', 'archer*4,slime*3'] },
    { id: '2-5', name: '폐사의 주인', scale: 4.5, boss: true, waves: ['knight*1,archer*2', 'eclipse*1'] },
  ] },
].map(ch => ({ ...ch, stages: ch.stages.map((s, i) => ({ ...s, chapter: ch.id, theme: ch.theme, waves: s.waves.map(W) })) }));
export const STAGES = CHAPTERS.flatMap(c => c.stages);
export const STAGE = Object.fromEntries(STAGES.map(s => [s.id, s]));
STAGES.forEach((s, i) => {
  s.index = i;
  s.prev = i ? STAGES[i - 1].id : null;
  s.rec = Math.round(150 * Math.pow(s.scale, .9));
  s.reward = { silver: 150 + i * 70, firstMoon: s.boss ? 480 : 160, moon: 20 };
});

export function endlessWave(n) {
  const boss = n % 5 === 0;
  const pool = n < 3 ? ['slime', 'slime', 'wisp'] : n < 6 ? ['slime', 'wisp', 'bat', 'archer'] : ['slime', 'wisp', 'bat', 'archer', 'archer', 'bat'];
  const cnt = Math.min(12, 3 + Math.floor(n * .8));
  const q = [];
  for (let i = 0; i < cnt; i++) q.push(pool[Math.random() * pool.length | 0]);
  if (n >= 4 && n % 4 === 0) q.splice(1, 0, 'knight');
  if (boss) q.push('eclipse');
  return q;
}
export const endlessScale = n => 1 + (n - 1) * .2;

export const COUPONS = { WOLHA: { moon: 1600, msg: '월석 1600개를 받았어요.' }, MOONLIGHT: { silver: 3000, msg: '은화 3000개를 받았어요.' } };
