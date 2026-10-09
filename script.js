/* NOCTYRA — an endless universe of identities.
 * Deterministic, client-side, BigInt-based. No profile list exists anywhere:
 * every profile is computed from its identifier alone. */
(() => {
'use strict';

const SKY_LOCAL = './3db23560f4989b80a653c5aab34e714a.jpg';
const SKY_RAW = 'https://raw.githubusercontent.com/InfiniteProfile/NOCTYRA/main/3db23560f4989b80a653c5aab34e714a.jpg';
const BASE_TITLE = document.title;

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ======================================================================
   1. Identifiers (arbitrary size, kept as canonical decimal strings)
   ====================================================================== */
const DIGITS = /^[0-9]+$/;

/** Returns a canonical decimal string (no leading zeros) or null. Never touches Number. */
function normId(v) {
  if (typeof v !== 'string') return null;
  const t = v.trim().replace(/[\s,_']/g, '');
  if (!DIGITS.test(t)) return null;
  return t.replace(/^0+(?=[0-9])/, '');
}
const fmtId = id => (id.length < 6 ? '0'.repeat(6 - id.length) + id : id);
const toB36 = id => BigInt(id).toString(36);

function fromB36(s) {
  if (!/^[0-9a-z]+$/i.test(s)) return null;
  s = s.toLowerCase();
  if (s.length <= 10) return String(parseInt(s, 36));
  let v = 0n;
  for (let i = 0; i < s.length; i += 8) {
    const c = s.slice(i, i + 8);
    v = v * (36n ** BigInt(c.length)) + BigInt(parseInt(c, 36));
  }
  return v.toString();
}

/* ======================================================================
   2. Deterministic pseudorandom generator (seeded from the full identifier)
   ====================================================================== */
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function sfc32(a, b, c, d) {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
function rngFor(id, salt) {
  const s = xmur3('noctyra/1/' + salt + '/' + id);
  const r = sfc32(s(), s(), s(), s());
  for (let i = 0; i < 10; i++) r();
  return r;
}
const int = (r, n) => Math.floor(r() * n);
const pick = (r, a) => a[int(r, a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const article = w => (/^[aeiou]/i.test(w) ? 'an' : 'a');

/* ======================================================================
   3. Vocabulary (building blocks only: the number of identities is unbounded)
   ====================================================================== */
const ST = ['Ael','Ash','Bel','Cael','Cyr','Dra','Eri','Elu','Fen','Gal','Hal','Ire','Isa','Kae','Lun','Lyr','Mir','Mor','Nyx','Nol','Ori','Oth','Pha','Rhe','Sel','Sil','Tal','Tyr','Umb','Vael','Vey','Wyn','Xan','Yor','Zel','Zor','Ves','Thal','Sar','Quin'];
const MID = ['a','e','i','o','u','ae','ia','ou','ei','y','la','ri','ne','vo','the','lu','sa','ra','mi','ka','ni','do','ve','ys'];
const EN = ['n','th','ra','ne','l','s','x','ris','lia','dor','wen','mar','vyn','el','ith','on','a','ys','eth','iel','ora','us'];
const FAM_A = ['Ash','Frost','Moon','Star','Night','Silver','Pale','Hollow','Cold','Grey','Rime','Mist','Raven','Winter','Ever','Dusk','Glass','Iron','Still','Veil','Wolf','Thorn','Sable','Cinder','Gloam','Lone','High','Deep','Far','Wane'];
const FAM_B = ['veil','moor','fall','crest','wood','mere','song','reach','born','watch','wynd','shade','peak','gate','light','ward','keep','hollow','drift','vale','thorn','spire','crown','wake','glen','fen'];
const ARCH = ['Moonwarden','Frostbound Sage','Silent Cartographer','Pine Oracle','Star Reader','Mist Courier','Glacier Scribe','Lantern Keeper','Shadow Archivist','Nightwatch Sentinel','Ridge Walker','Eclipse Scholar','Hollow Pilgrim','Rime Alchemist','Cairn Builder','Dusk Herald','Meteor Chaser','Summit Hermit','Tide Astronomer','Veil Weaver','Echo Binder','Snowfall Chronicler','Forest Cantor','Obsidian Smith','Orbit Navigator','Gloom Healer','Crescent Sworn','Wolfsong Tracker','Winter Envoy','Silver Fletcher','Night Botanist','Memory Warden','Starfall Gleaner','Cold Hearth Keeper','Dream Surveyor'];
const REALM_PRE = ['Silent','Frozen','Sunken','Hollow','Pale','Last','Quiet','Veiled','Forgotten','Northern','Starless','Moonlit','Ashen','Weeping','Drowned','Unnamed'];
const REALM_SUF = ['Reaches','Pines','Basin','Spires','Vale','Terraces','Moors','Observatory','Marches','Deeps','Cairns','Ridge','Glacier','Hollows','Timberline','Cirque'];
const REALM_PLACE = ['Marches','Halls','Gardens','Watch','Stair','Orchard','Lake','Archive','Gate','Passes'];
const CON_A = ['Wolf','Heron','Lantern','Crown','Antler','Harp','Moth','Owl','Stag','Key','Needle','Chalice','Bridge','Raven','Compass','Veil','Spear','Door','Tower','Thread'];
const CON_B = ['Still Water','Last Frost','the Winter Gate','the Hollow Moon','Slow Snow','Quiet Orbit','Falling Stars','the Long Dusk','Pale Hours','the Sleeping Ridge','Distant Pines','Unspoken Names'];
const ELEMENTS = ['Frost','Moonlight','Obsidian','Mist','Pine resin','Starlight','Ash','Glacier ice','Shadow','Silence','Echo','Rime','Quartz','Silver','Wind','Snow','Gravity','Dusk','Stardust','Basalt'];
const STATUS = ['Wandering','Dormant','Vigilant','Veiled','Exiled','Ascendant','Archived','Awakening','Sealed','Undying','Forgotten','Unbound'];
const TRAITS = ['patient','watchful','reserved','luminous','stoic','curious','tender','unyielding','dreamlike','solitary','precise','gentle','austere','restless','eloquent','enduring','wry','contemplative','fearless','measured','wistful','guarded','incisive','serene','devoted','elusive','steadfast','archaic','meticulous','lucid','hushed','resolute','uncanny','humble','tireless','candid'];
const WHEN = ['beneath a waning crescent','on the night the ninth star fell','in the long frost before the first dawn','between two silent eclipses','under the third shooting star of winter','at the hour the forests stopped breathing'];
const SCENE = ['the pines keep the sky\u2019s oldest records','the mountains remember every name ever spoken','mist gathers faster than memory','no footstep leaves an echo','snow falls upward on the clearest nights','the stars lower themselves to listen'];
const DUTY = ['chart the silence between falling stars','carry unwritten letters across the frozen ridges','tend lanterns that no one else can see','catalogue the shadows of forgotten forests','listen at the edge of the glacier for the first sound of morning','guard a door that appears only in moonlight','trace constellations into the bark of ancient pines','keep count of the stars that go out unnoticed'];
const CLOSE = ['it has never led them astray','every star they pass is quietly renamed','the mist parts without being asked','the night keeps their secret','the snow remembers where they have been'];

/* ======================================================================
   4. Profile generation (pure function of the identifier)
   ====================================================================== */
function makeGiven(r) {
  let s = pick(r, ST);
  if (r() < 0.45) s += pick(r, MID);
  s += pick(r, EN);
  s = s.replace(/(.)\1{2,}/g, '$1$1');
  return cap(s.toLowerCase());
}

function generate(id) {
  const r = rngFor(id, 'profile');
  const first = makeGiven(r);
  const family = pick(r, FAM_A) + pick(r, FAM_B);
  const name = first + ' ' + family;
  const slug = (first + '-' + family).toLowerCase().replace(/[^a-z-]/g, '');
  const handle = '@' + slug + '.' + toB36(id);
  const archetype = pick(r, ARCH);
  const realm = r() < 0.6
    ? 'the ' + pick(r, REALM_PRE) + ' ' + pick(r, REALM_SUF)
    : 'the ' + pick(r, REALM_PLACE) + ' of ' + makeGiven(r);
  const constellation = 'The ' + pick(r, CON_A) + ' of ' + pick(r, CON_B);
  const element = pick(r, ELEMENTS);
  const status = pick(r, STATUS);
  const traits = [];
  while (traits.length < 3) { const t = pick(r, TRAITS); if (!traits.includes(t)) traits.push(t); }
  const bio = first + ' was born ' + pick(r, WHEN) + ' in ' + realm + ', where ' + pick(r, SCENE) + '. As ' + article(archetype) + ' ' + archetype + ', they ' + pick(r, DUTY) + '. Their path follows ' + constellation.replace(/^The/, 'the') + ', and ' + pick(r, CLOSE) + '.';
  const desc = first + ' is ' + traits[0] + ', ' + traits[1] + ', and ' + traits[2] + ': ' + article(archetype) + ' ' + archetype.toLowerCase() + ' marked by ' + element.toLowerCase() + '.';
  return { id, first, family, name, slug, handle, archetype, realm, origin: cap(realm), constellation, element, status, traits, bio, desc, tagline: archetype + ' from ' + realm };
}

/* ======================================================================
   5. Procedural monochrome avatars and emblems (inline SVG)
   ====================================================================== */
const BG = '#0b0c0f';
const FR = '#f4f6f8', SV = '#dfe3e8', SL = '#bcc2ca';
const f = n => Math.round(n * 10) / 10;

function ridge(r, base, amp, fill, op) {
  let pts = '-2,64';
  for (let x = -2; x < 70; x += 6 + int(r, 7)) pts += ' ' + x + ',' + f(base - r() * amp);
  return '<polygon points="' + pts + ' 66,64" fill="' + fill + '" opacity="' + op + '"/>';
}
function pines(r, y, fill) {
  let s = '<rect x="0" y="' + y + '" width="64" height="' + (64 - y) + '" fill="' + fill + '"/>';
  for (let x = 1 + r() * 5; x < 66; x += 4 + r() * 5) {
    const h = 7 + r() * 9, w = 2.4 + r() * 2.2;
    s += '<polygon points="' + f(x) + ',' + f(y - h) + ' ' + f(x - w) + ',' + y + ' ' + f(x + w) + ',' + y + '" fill="' + fill + '"/>';
  }
  return s;
}
function crescent(cx, cy, R, dx, dy, k) {
  return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(R) + '" fill="' + FR + '"/><circle cx="' + f(cx + dx) + '" cy="' + f(cy + dy) + '" r="' + f(R * k) + '" fill="' + BG + '"/>';
}

function avatarSVG(p) {
  const r = rngFor(p.id, 'avatar');
  const style = int(r, 8);
  let g = '';
  const ns = 4 + int(r, 6);
  for (let i = 0; i < ns; i++) g += '<circle cx="' + f(4 + r() * 56) + '" cy="' + f(4 + r() * 56) + '" r="' + f(0.4 + r() * 0.9) + '" fill="#e8ebef" opacity="' + f(0.35 + r() * 0.6) + '"/>';

  switch (style) {
    case 0: { // crescent over a ridge
      g += crescent(28 + r() * 8, 24 + r() * 6, 12 + r() * 6, 5 + r() * 5, -2 + r() * 4, 0.92);
      g += ridge(r, 46, 14, '#3a3f47', 1) + ridge(r, 54, 10, '#15171b', 1);
      break;
    }
    case 1: { // hooded figure
      g += '<path d="M8 64Q12 45 32 43Q52 45 56 64Z" fill="#1b1d22" stroke="' + SL + '" stroke-opacity=".5"/>';
      g += '<path d="M17 36Q16 11 32 11Q48 11 47 36Q46 46 32 48Q18 46 17 36Z" fill="#111317" stroke="' + SV + '" stroke-opacity=".7" stroke-width="1.2"/>';
      g += '<path d="M22 34Q23 20 32 20Q41 20 42 34Q40 42 32 43Q24 42 22 34Z" fill="#050607"/>';
      const e = int(r, 3);
      if (e === 0) g += '<circle cx="28" cy="32" r="1.5" fill="' + FR + '"/><circle cx="36" cy="32" r="1.5" fill="' + FR + '"/>';
      else if (e === 1) g += '<path d="M25 32h6M33 32h6" stroke="' + FR + '" stroke-width="1.4" stroke-linecap="round"/>';
      else g += '<path d="M32 26l1.6 4.4 4.4 1.6-4.4 1.6L32 38l-1.6-4.4L26 32l4.4-1.6z" fill="' + FR + '"/>';
      if (r() < 0.6) g += crescent(32, 7, 3.6, 1.6, -0.6, 0.9);
      break;
    }
    case 2: { // mountain scene
      const mx = 40 + r() * 14, my = 12 + r() * 10;
      g += crescent(mx, my, 4 + r() * 3, 2, -1, 0.9);
      g += ridge(r, 40, 20, '#4a4f58', 1) + ridge(r, 47, 14, '#23262c', 1) + pines(r, 58, '#050607');
      break;
    }
    case 3: { // constellation
      const n = 5 + int(r, 4), pts = [];
      for (let i = 0; i < n; i++) pts.push([f(10 + r() * 44), f(10 + r() * 44)]);
      g += '<circle cx="32" cy="32" r="28" fill="none" stroke="' + SL + '" stroke-opacity=".16"/>';
      g += '<polyline points="' + pts.map(q => q.join(',')).join(' ') + '" fill="none" stroke="' + SL + '" stroke-opacity=".7" stroke-width=".8"/>';
      pts.forEach(q => { g += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + f(1.2 + r() * 1.6) + '" fill="' + FR + '"/>'; });
      break;
    }
    case 4: { // frost crystal
      const arms = r() < 0.5 ? 6 : 8, len = 20 + r() * 8, br = 3 + int(r, 2);
      g += '<g stroke="' + SV + '" stroke-width="1.2" stroke-linecap="round" fill="none">';
      for (let k = 0; k < arms; k++) {
        g += '<g transform="rotate(' + f(k * 360 / arms) + ' 32 32)"><line x1="32" y1="32" x2="32" y2="' + f(32 - len) + '"/>';
        for (let j = 1; j <= br; j++) { const y = 32 - (len * j) / (br + 0.6), b = 2 + (br - j) * 1.2 + r() * 2; g += '<path d="M32 ' + f(y) + 'L' + f(32 - b) + ' ' + f(y - b) + 'M32 ' + f(y) + 'L' + f(32 + b) + ' ' + f(y - b) + '"/>'; }
        g += '</g>';
      }
      g += '</g><circle cx="32" cy="32" r="2.2" fill="' + FR + '"/>';
      break;
    }
    case 5: { // orbits around a dark sphere
      const R = 9 + r() * 4;
      for (let i = 0; i < 2 + int(r, 2); i++) {
        const rx = 22 + r() * 6, ry = 7 + r() * 8, th = f(r() * 180), ph = r() * 6.28;
        g += '<g transform="rotate(' + th + ' 32 32)"><ellipse cx="32" cy="32" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="none" stroke="' + SL + '" stroke-opacity=".55"/><circle cx="' + f(32 + rx * Math.cos(ph)) + '" cy="' + f(32 + ry * Math.sin(ph)) + '" r="1.9" fill="' + FR + '"/></g>';
      }
      g += '<circle cx="32" cy="32" r="' + f(R + 3) + '" fill="none" stroke="' + FR + '" stroke-opacity=".3"/><circle cx="32" cy="32" r="' + f(R) + '" fill="#050607" stroke="' + FR + '" stroke-width="1.3"/>';
      break;
    }
    case 6: { // mask
      const face = 'M32 9C47 9 51 24 49 36C47 48 40 55 32 57C24 55 17 48 15 36C13 24 17 9 32 9Z';
      g += '<path d="' + face + '" fill="#14161a" stroke="' + SV + '" stroke-opacity=".75"/><path d="M32 9C47 9 51 24 49 36C47 48 40 55 32 57Z" fill="#cfd4db" opacity=".15"/>';
      g += '<path d="M21 30l7 1.4M43 30l-7 1.4" stroke="' + FR + '" stroke-width="1.5" stroke-linecap="round"/>';
      if (r() < 0.5) g += '<path d="M32 12v14" stroke="' + SL + '" stroke-width="1" opacity=".7"/>'; else g += '<circle cx="32" cy="20" r="1.8" fill="' + FR + '"/>';
      g += '<path d="M24 44q8 5 16 0" fill="none" stroke="' + SL + '" stroke-opacity=".6"/>';
      if (r() < 0.6) g += '<path d="M19 38l5 2M45 38l-5 2" stroke="' + SL + '" stroke-opacity=".6" stroke-linecap="round"/>';
      break;
    }
    default: { // sigil
      const n = 5 + int(r, 5), k = 2 + int(r, Math.max(1, Math.floor(n / 2) - 1)), rad = 22 + r() * 3, rot = r() * 6.28;
      const P = i => [f(32 + rad * Math.cos(rot + i * 6.2832 / n)), f(32 + rad * Math.sin(rot + i * 6.2832 / n))];
      let d = '';
      for (let i = 0; i < n; i++) { const a = P(i), b = P((i + k) % n); d += 'M' + a.join(' ') + 'L' + b.join(' '); }
      g += '<circle cx="32" cy="32" r="' + f(rad + 4) + '" fill="none" stroke="' + SL + '" stroke-opacity=".35"/><path d="' + d + '" fill="none" stroke="' + SV + '" stroke-width="1.1"/><circle cx="32" cy="32" r="3" fill="' + FR + '"/>';
    }
  }
  return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect width="64" height="64" rx="14" fill="' + BG + '"/>' + g + '<rect x=".5" y=".5" width="63" height="63" rx="13.5" fill="none" stroke="' + SL + '" stroke-opacity=".28"/></svg>';
}

function emblemSVG(p) {
  const r = rngFor(p.id, 'emblem');
  const n = 3 + int(r, 6), m = 2 + int(r, 3);
  let d = 'M0,' + f(-(30 + r() * 12));
  for (let i = 0; i < m; i++) d += 'L' + f(3 + r() * 14) + ',' + f(-(8 + r() * 34));
  d += 'L0,' + f(-(6 + r() * 8));
  let arms = '';
  for (let k = 0; k < n; k++) arms += '<g transform="rotate(' + f(k * 360 / n) + ')"><path d="' + d + '"/><path d="' + d + '" transform="scale(-1 1)"/></g>';
  return '<svg viewBox="-48 -48 96 96" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Emblem of ' + esc(p.name) + '" fill="none" stroke="' + SV + '" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"><circle r="45" stroke-opacity=".5"/><circle r="41" stroke-opacity=".28" stroke-dasharray="1 3.2"/>' + arms + '<circle r="2.4" fill="' + FR + '" stroke="none"/></svg>';
}

/* ======================================================================
   6. Directory: windowed (virtualized) infinite scroll
   ====================================================================== */
const list = $('list'), sentinel = $('sentinel'), topSentinel = $('topSentinel'), statusEl = $('status');
const CHEV = '<svg class="go" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const QUIET = '<p class="quiet">The night continues. Keep descending.</p>';

let cols = 1;
let first = 0n;        // logical index of the first mounted card
let next = 0n;         // logical index after the last mounted card
let rootId = '0';
let ready = false, updating = false, loadError = false, rafId = 0, failCount = 0;

const urlFor = id => '?profile=' + id;
const absUrl = id => new URL(urlFor(id), location.href).href;

function cardHTML(id) {
  const p = generate(id);
  return '<a class="card" href="' + urlFor(id) + '" data-id="' + id + '" aria-label="' + esc(p.name + ', ' + p.handle + ', profile ' + id + '. ' + p.tagline) + '">' +
    '<span class="av">' + avatarSVG(p) + '</span>' +
    '<span class="meta"><span class="nm">' + esc(p.name) + '</span><span class="hd">' + esc(p.handle) + '</span><span class="tg">' + esc(p.tagline) + '</span><span class="pid">PROFILE ' + fmtId(id) + '</span></span>' +
    CHEV + '</a>';
}
function makeRow(startBig, count) {
  if (failCount > 0) { failCount--; throw new Error('Simulated batch failure'); }
  let html = '';
  for (let i = 0; i < count; i++) html += cardHTML((startBig + BigInt(i)).toString());
  const row = document.createElement('div');
  row.className = 'row';
  row.dataset.first = startBig.toString();
  row.dataset.n = String(count);
  row.innerHTML = html;
  return row;
}
function appendRow() { const row = makeRow(next, cols); list.appendChild(row); next += BigInt(cols); }
function prependRow() {
  const n = first < BigInt(cols) ? Number(first) : cols;
  if (n <= 0) return;
  const row = makeRow(first - BigInt(n), n);
  list.insertBefore(row, list.firstChild);
  first -= BigInt(n);
}
function removeTop() { const row = list.firstElementChild; first += BigInt(row.dataset.n); row.remove(); }
function removeBottom() { const row = list.lastElementChild; next -= BigInt(row.dataset.n); row.remove(); }

function update(force) {
  rafId = 0;
  if (!ready || updating || loadError) return;
  if (viewerOpen && !force) return;
  updating = true;
  let anchor = null, anchorTop = 0, anchorSet = false;
  const setAnchor = () => {
    if (anchorSet) return;
    anchorSet = true;
    const rows = list.children;
    if (!rows.length) return;
    anchor = rows[0];
    for (let i = 0; i < rows.length; i++) { if (rows[i].getBoundingClientRect().bottom > 0) { anchor = rows[i]; break; } }
    anchorTop = anchor.getBoundingClientRect().top;
  };
  try {
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const near = vh * 1.3, far = vh * 3.5;
    let g = 0;
    // 1. grow downwards: there is no last profile
    while (g++ < 80) {
      const last = list.lastElementChild;
      if (last && last.getBoundingClientRect().bottom > vh + near) break;
      setAnchor(); appendRow();
    }
    // 2. grow upwards (only possible while above profile 0)
    g = 0;
    while (first > 0n && g++ < 80) {
      const top = list.firstElementChild;
      if (top && top.getBoundingClientRect().top < -near) break;
      setAnchor(); prependRow();
    }
    // 3. recycle distant rows; logical indexes are kept, DOM stays small
    g = 0;
    while (g++ < 120 && list.children.length > 3) {
      const top = list.firstElementChild;
      if (top.getBoundingClientRect().bottom > -far) break;
      setAnchor(); if (top === anchor) break; removeTop();
    }
    g = 0;
    while (g++ < 120 && list.children.length > 3) {
      const bot = list.lastElementChild;
      if (bot.getBoundingClientRect().top < vh + far) break;
      setAnchor(); if (bot === anchor) break; removeBottom();
    }
  } catch (err) {
    failLoad(err);
  } finally {
    try {
      if (anchor && anchor.isConnected) {
        const d = anchor.getBoundingClientRect().top - anchorTop;
        if (Math.abs(d) > 0.5) window.scrollBy(0, d); // rebase: visible cards stay put
      }
    } catch (_) { /* ignore */ }
    updating = false;
  }
}
const schedule = () => { if (!rafId) rafId = requestAnimationFrame(() => update(false)); };

function failLoad(err) {
  loadError = true;
  try { console.error('NOCTYRA batch failed:', err); } catch (_) { /* ignore */ }
  statusEl.innerHTML = '<p class="quiet" role="alert">Some identities could not be drawn. The universe is intact.</p><button type="button" id="retry">Try again</button>';
}
function retryLoad() {
  loadError = false;
  statusEl.innerHTML = QUIET;
  update(true);
}

function measureCols() {
  const w = list.clientWidth || document.documentElement.clientWidth || 0;
  return Math.max(1, Math.min(4, Math.floor((w + 12) / 292)));
}
function visibleAnchor() {
  const cards = list.querySelectorAll('.card');
  for (let i = 0; i < cards.length; i++) {
    const r = cards[i].getBoundingClientRect();
    if (r.bottom > 0) return { id: cards[i].dataset.id, top: r.top };
  }
  return null;
}
function resetTo(id) {
  loadError = false;
  statusEl.innerHTML = QUIET;
  list.replaceChildren();
  first = next = BigInt(id);
  update(true);
}
function rebuild(id, top) {
  list.style.minHeight = list.offsetHeight + 'px';
  resetTo(id);
  const el = list.querySelector('.card[data-id="' + id + '"]');
  if (el) { const d = el.getBoundingClientRect().top - top; if (Math.abs(d) > 0.5) window.scrollBy(0, d); }
  list.style.minHeight = '';
}
let resizeTimer = 0;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const nc = measureCols();
    if (nc !== cols) {
      const a = visibleAnchor();
      cols = nc; list.style.setProperty('--cols', nc);
      if (a) rebuild(a.id, a.top); else resetTo(rootId);
    } else schedule();
  }, 120);
}

function setRooted(id) {
  rootId = id;
  if (id === '0') { $('rooted').hidden = true; return; }
  $('rootedText').textContent = 'Exploring from profile ' + fmtId(id) + '.';
  $('rooted').hidden = false;
}
function exploreFrom(id) {
  setRooted(id);
  resetTo(id);
  const el = list.querySelector('.card[data-id="' + id + '"]');
  if (el) el.scrollIntoView({ block: 'start' });
}
function backToStart() {
  setRooted('0');
  resetTo('0');
  window.scrollTo(0, 0);
}

/* ======================================================================
   7. Full profile view + permanent links + history
   ====================================================================== */
const viewer = $('viewer');
let viewerOpen = false, viewerPushed = false, openerEl = null, pendingAfterClose = null, currentId = null;
const background = () => [$('bar'), $('main')];

function renderViewer(id) {
  const p = generate(id);
  $('vName').textContent = p.name;
  $('vHandle').textContent = p.handle;
  $('vTag').textContent = p.tagline;
  $('vId').textContent = fmtId(id);
  $('vBio').textContent = p.bio;
  $('vArch').textContent = p.archetype;
  $('vOrigin').textContent = p.origin;
  $('vCon').textContent = p.constellation;
  $('vElem').textContent = p.element;
  $('vStat').textContent = p.status;
  $('vTraits').innerHTML = p.traits.map(t => '<span>' + esc(cap(t)) + '</span>').join('');
  $('vDesc').textContent = p.desc;
  $('vAvatar').innerHTML = avatarSVG(p);
  $('vEmblem').innerHTML = emblemSVG(p);
  $('vPrev').disabled = id === '0';
  document.title = p.name + ' | NOCTYRA';
  $('vBody').hidden = false;
  $('vError').hidden = true;
}
function showViewerError(msg) {
  $('vBody').hidden = true;
  $('vError').hidden = false;
  $('vErrMsg').textContent = msg;
  $('vPrev').disabled = true; $('vNext').disabled = true;
  currentId = null;
  document.title = BASE_TITLE;
}
function showViewer() {
  if (!viewerOpen) {
    viewerOpen = true;
    viewer.hidden = false;
    document.documentElement.classList.add('locked');
    background().forEach(el => { el.inert = true; el.setAttribute('aria-hidden', 'true'); });
    viewer.scrollTop = 0;
    requestAnimationFrame(() => viewer.classList.add('show'));
  }
  viewer.scrollTop = 0;
  const target = $('vError').hidden ? $('vName') : $('vErrBack');
  target.focus({ preventScroll: true });
}
function hideViewer() {
  if (!viewerOpen) return;
  viewerOpen = false; viewerPushed = false; currentId = null;
  viewer.classList.remove('show');
  viewer.hidden = true;
  document.documentElement.classList.remove('locked');
  background().forEach(el => { el.inert = false; el.removeAttribute('aria-hidden'); });
  document.title = BASE_TITLE;
  const o = openerEl; openerEl = null;
  if (o && o.isConnected && typeof o.focus === 'function') o.focus({ preventScroll: true });
  const fn = pendingAfterClose; pendingAfterClose = null;
  if (fn) fn();
  schedule();
}

/** how: 'push' (new history entry), 'replace' (same entry), 'none' (URL already correct) */
function openProfile(id, how, opener) {
  if (viewerOpen && currentId === id && how !== 'none') return;
  const wasOpen = viewerOpen;
  if (!wasOpen) openerEl = opener || document.activeElement;
  try {
    renderViewer(id);
    currentId = id;
  } catch (err) {
    console.error(err);
    showViewerError('This profile could not be displayed. Return to the directory and try again.');
  }
  if (how === 'push' && !wasOpen) { history.pushState({ noct: 1 }, '', urlFor(id)); viewerPushed = true; }
  else if (how !== 'none') history.replaceState(history.state, '', urlFor(id));
  showViewer();
}
function closeProfile() {
  if (!viewerOpen) return;
  if (viewerPushed) { history.back(); return; } // popstate hides the viewer
  history.replaceState(null, '', location.pathname);
  hideViewer();
}
function profileFromLocation() {
  const params = new URLSearchParams(location.search);
  if (!params.has('profile')) return { kind: 'none' };
  const id = normId(params.get('profile'));
  return id !== null ? { kind: 'id', id } : { kind: 'bad' };
}

window.addEventListener('popstate', () => {
  const loc = profileFromLocation();
  if (loc.kind === 'id') {
    viewerPushed = !!(history.state && history.state.noct);
    openProfile(loc.id, 'none');
  } else if (loc.kind === 'bad') {
    showViewerError('That link does not contain a valid profile number.'); showViewer();
  } else hideViewer();
});

viewer.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const items = [...viewer.querySelectorAll('button:not([disabled])')].filter(el => el.getClientRects().length);
  if (!items.length) { e.preventDefault(); return; }
  const a = items[0], z = items[items.length - 1];
  if (e.shiftKey && (document.activeElement === a || document.activeElement === $('vName'))) { e.preventDefault(); z.focus(); }
  else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
});

/* clipboard + toast */
let toastTimer = 0;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 1900);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fall back */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (_) { return false; }
}

$('vClose').addEventListener('click', closeProfile);
$('vErrBack').addEventListener('click', () => { if (viewerPushed) closeProfile(); else { history.replaceState(null, '', location.pathname); hideViewer(); } });
$('vPrev').addEventListener('click', () => { if (currentId && currentId !== '0') openProfile((BigInt(currentId) - 1n).toString(), 'replace'); });
$('vNext').addEventListener('click', () => { if (currentId) openProfile((BigInt(currentId) + 1n).toString(), 'replace'); });
$('vCopy').addEventListener('click', async () => { if (!currentId) return; toast((await copyText(absUrl(currentId))) ? 'Profile link copied' : 'Copy failed. Copy the address bar instead.'); });
$('vCopyId').addEventListener('click', async () => { if (!currentId) return; toast((await copyText(currentId)) ? 'Profile number copied' : 'Copy failed'); });
$('vExplore').addEventListener('click', () => {
  if (!currentId) return;
  const id = currentId;
  pendingAfterClose = () => exploreFrom(id);
  closeProfile();
});

/* ======================================================================
   8. Search
   ====================================================================== */
const form = $('searchForm'), input = $('q'), clearBtn = $('clear'), results = $('results');
let scan = null;

function parseQuery(raw) {
  const q = (raw || '').trim();
  if (!q) return { type: 'empty' };
  if (/profile\s*=/i.test(q)) {
    const m = q.match(/profile\s*=\s*([^&#\s]*)/i);
    let v = m ? m[1] : '';
    try { v = decodeURIComponent(v); } catch (_) { /* keep raw */ }
    const id = normId(v);
    return id !== null ? { type: 'id', id } : { type: 'bad', msg: 'That link does not contain a valid profile number.' };
  }
  if (/^https?:\/\//i.test(q)) return { type: 'bad', msg: 'That link has no profile parameter.' };
  const id = normId(q);
  if (id !== null) return { type: 'id', id };
  const hm = q.replace(/\s+/g, '').match(/^@?([a-z][a-z-]*)\.([0-9a-z]+)$/i);
  if (hm) {
    const dec = fromB36(hm[2]);
    if (dec !== null && generate(dec).slug === hm[1].toLowerCase()) return { type: 'id', id: dec };
    return { type: 'bad', msg: 'No identity carries that handle.' };
  }
  return { type: 'name', text: q };
}

function showPanel(html) { results.innerHTML = html; results.hidden = false; }
function hidePanel() { results.hidden = true; results.innerHTML = ''; scan = null; }
const panelNote = (msg, warn) => '<div class="res-head"><span>Search</span><button type="button" class="small-btn" data-act="close">Close</button></div><p class="res-note' + (warn ? ' warn' : '') + '">' + esc(msg) + '</p>';

function renderScan(done) {
  const s = scan;
  const items = s.matches.map(p => '<li><button type="button" class="res" data-id="' + p.id + '"><span class="rn">' + esc(p.name) + '</span><span class="rh">' + esc(p.handle) + '</span><span class="rp">PROFILE ' + fmtId(p.id) + '</span></button></li>').join('');
  const lastId = (s.base + BigInt(s.off) - 1n);
  const range = fmtId(s.base.toString()) + ' to ' + fmtId((lastId < s.base ? s.base : lastId).toString());
  showPanel(
    '<div class="res-head"><span>Names matching \u201c' + esc(s.text) + '\u201d</span><button type="button" class="small-btn" data-act="close">Close</button></div>' +
    (items ? '<ul class="res-list">' + items + '</ul>' : '') +
    '<p class="res-note">' + (done ? 'Scanned profiles ' + range + '. ' + (s.matches.length ? s.matches.length + (s.matches.length >= 30 ? '+' : '') + ' found.' : 'No match in this range.') : 'Searching\u2026') + ' Names are searched in the stretch of the universe near your place in the directory, since an endless set has no complete index.</p>' +
    (done ? '<div class="res-actions"><button type="button" class="small-btn" data-act="more">Scan the next ' + s.chunk.toLocaleString('en-US') + ' identities</button></div>' : '')
  );
}
function runScan(s) {
  if (scan !== s) return;
  const STEP = 400;
  const stop = Math.min(s.off + STEP, s.chunkEnd);
  for (; s.off < stop; s.off++) {
    const id = (s.base + BigInt(s.off)).toString();
    const p = generate(id);
    const hay = (p.name + ' ' + p.handle + ' ' + p.archetype + ' ' + p.realm + ' ' + p.constellation + ' ' + p.element + ' ' + p.status + ' ' + p.traits.join(' ')).toLowerCase();
    if (s.terms.every(t => hay.includes(t)) && s.matches.length < 30) s.matches.push(p);
  }
  const done = s.off >= s.chunkEnd;
  renderScan(done);
  if (!done) setTimeout(() => runScan(s), 0);
}
function startScan(text) {
  const a = visibleAnchor();
  const start = a ? a.id : rootId;
  scan = {
    text, terms: text.toLowerCase().replace(/^@/, '').split(/\s+/).filter(Boolean),
    base: BigInt(start), off: 0, chunk: 4000, chunkEnd: 4000, matches: []
  };
  renderScan(false);
  setTimeout(() => runScan(scan), 0);
}
function scanMore() {
  if (!scan) return;
  scan.chunkEnd = scan.off + scan.chunk;
  renderScan(false);
  setTimeout(() => runScan(scan), 0);
}

function doSearch(raw, fromJump) {
  const r = parseQuery(raw);
  if (r.type === 'id') {
    hidePanel(); $('jumpMsg').textContent = '';
    openProfile(r.id, 'push');
    return;
  }
  if (fromJump) {
    $('jumpMsg').textContent = r.type === 'bad' ? r.msg : 'Enter a profile number, @handle or profile link.';
    return;
  }
  if (r.type === 'empty') showPanel(panelNote('Enter a profile number, @handle, profile link or name.'));
  else if (r.type === 'bad') showPanel(panelNote(r.msg, true));
  else startScan(r.text);
}

form.addEventListener('submit', e => { e.preventDefault(); doSearch(input.value, false); });
input.addEventListener('input', () => { clearBtn.hidden = !input.value; });
clearBtn.addEventListener('click', () => { input.value = ''; clearBtn.hidden = true; hidePanel(); input.focus(); });
$('jumpForm').addEventListener('submit', e => { e.preventDefault(); doSearch($('jump').value, true); });
$('jump').addEventListener('input', () => { $('jumpMsg').textContent = ''; });
results.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.id) { const id = b.dataset.id; hidePanel(); openProfile(id, 'push', input); }
  else if (b.dataset.act === 'close') hidePanel();
  else if (b.dataset.act === 'more') scanMore();
});
document.addEventListener('click', e => { if (!results.hidden && !e.target.closest('#bar')) hidePanel(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (viewerOpen) { e.preventDefault(); closeProfile(); }
  else if (!results.hidden) { hidePanel(); input.focus(); }
});

/* ======================================================================
   9. Wiring and start-up
   ====================================================================== */
list.addEventListener('click', e => {
  const a = e.target.closest('a.card');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  openProfile(a.dataset.id, 'push', a);
});
statusEl.addEventListener('click', e => { if (e.target.id === 'retry') retryLoad(); });
$('toStart').addEventListener('click', backToStart);
$('home').addEventListener('click', e => { e.preventDefault(); if (viewerOpen) return; backToStart(); });

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

// Background fallback: if the local copy is missing, use the repository's raw URL.
const probe = new Image();
probe.onerror = () => document.documentElement.style.setProperty('--sky', 'url("' + SKY_RAW + '")');
probe.src = SKY_LOCAL;

// Test hooks (used to simulate an interrupted batch)
window.NOCTYRA_TEST = { failNext(n) { failCount = n == null ? 1 : n; }, generate, normId };

function init() {
  try { history.scrollRestoration = 'manual'; } catch (_) { /* ignore */ }
  cols = measureCols();
  list.style.setProperty('--cols', cols);
  ready = true;
  first = next = 0n;
  update(true);
  if ('IntersectionObserver' in window) {
    try {
      const io = new IntersectionObserver(schedule, { rootMargin: '120% 0px 120% 0px' });
      io.observe(sentinel); io.observe(topSentinel);
    } catch (_) { /* scroll listener already covers this */ }
  }
  const loc = profileFromLocation();
  if (loc.kind === 'id') openProfile(loc.id, 'none');
  else if (loc.kind === 'bad') { showViewerError('That link does not contain a valid profile number.'); openerEl = null; showViewer(); }
}
init();
})();
