// 월하검무 — 게임 데이터 (영웅, 무기, 스킬, 적, 스테이지)
export const VW = 320, VH = 180, GROUND = 152;
export const VERSION = 'v0.2.0';

export const RARITY = {
  3: { stars: '★★★', color: '#8fb8ff', name: '★3' },
  4: { stars: '★★★★', color: '#c99bff', name: '★4' },
  5: { stars: '★★★★★', color: '#ffd36b', name: '★5' },
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
};

// pal: hair, coat, trim, acc(리본·장식), eye, style(long|short|pony|twin|bob)
export const HEROES = [
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

export const MAX_LV = 40;
export function heroStats(def, lv = 1, aw = 0) {
  const base = { 3: [90, 9], 4: [100, 10], 5: [115, 12] }[def.rarity];
  const w = WEAPONS[def.weapon];
  const g = 1 + (lv - 1) * .07, a = 1 + aw * .08;
  return { hp: Math.round(base[0] * w.hpMul * g * a), atk: Math.round(base[1] * w.atkMul * g * a * 10) / 10 };
}
export function power(def, lv, aw) { const s = heroStats(def, lv, aw); return Math.round(s.hp * .5 + s.atk * 10); }
export function lvCost(lv) { return Math.round(60 * lv * Math.pow(1.08, lv)); }

// 뽑기 확률
export const GACHA = { cost1: 160, cost10: 1600, p5: .012, p4: .13, pity5: 70, pity4: 10 };

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
