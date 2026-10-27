// 저장 (이 기기 브라우저에 보관)
const KEY = 'wolha-save-v1', SKEY = 'wolha-settings-v1';

export function newSave() {
  return {
    v: 1, moon: 1600, silver: 600,
    heroes: { ria: { lv: 1, aw: 0, lb: 0, tr: 0, sk: { e: 1, q: 1 } } }, party: ['ria', null],
    cleared: {}, endlessBest: 0, pulls: 0, pity6: 0, pity5: 0, pity4: 0, kills: 0, bossKills: 0, coupons: [],
    mats: { crystal: 0, tome: 0, shard: 0 }, perm: {}, ach: {},
    created: Date.now(),
  };
}
export function loadSave() {
  try { const s = localStorage.getItem(KEY); if (s) return fix(JSON.parse(s)); } catch (e) {}
  return null;
}
function fix(s) {
  const d = newSave();
  for (const k in d) if (s[k] === undefined) s[k] = d[k];
  if (!s.heroes || !Object.keys(s.heroes).length) s.heroes = d.heroes;
  if (!s.heroes[s.party[0]]) s.party = [Object.keys(s.heroes)[0], null];
  s.mats = { crystal: 0, tome: 0, shard: 0, ...(s.mats || {}) };
  for (const k in s.heroes) { const h = s.heroes[k]; h.lb = h.lb || 0; h.tr = h.tr || 0; h.sk = { e: 1, q: 1, ...(h.sk || {}) }; }
  return s;
}
export function writeSave(S) { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }
export function wipeSave() { try { localStorage.removeItem(KEY); } catch (e) {} }

export const defaultSettings = () => ({ bgm: .5, sfx: .8, shake: 1, nums: true, touch: 'auto', stickSize: 1, btnSize: 1, stickMode: 'float', padPos: {} });
export function loadSettings() {
  const d = defaultSettings();
  try { const s = JSON.parse(localStorage.getItem(SKEY) || 'null'); if (s) { const r = { ...d, ...s }; if (!r.padPos || typeof r.padPos !== 'object') r.padPos = {}; return r; } } catch (e) {}
  return d;
}
export function writeSettings(st) { try { localStorage.setItem(SKEY, JSON.stringify(st)); } catch (e) {} }

export function exportCode(S) { return 'WH1.' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
export function importCode(t) {
  t = (t || '').trim();
  if (!t.startsWith('WH1.')) throw new Error('code');
  const s = JSON.parse(decodeURIComponent(escape(atob(t.slice(4)))));
  if (!s || typeof s !== 'object' || !s.heroes) throw new Error('code');
  return fix(s);
}
