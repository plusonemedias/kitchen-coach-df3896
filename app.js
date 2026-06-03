/* ============================================================================
 * KITCHEN COACH — app logic (vanilla JS, no build, NO backend, NO API).
 * Data is localStorage, namespaced by user. ONE user loads at a time. Jean's
 * instance never reads gf's keys and vice versa (COUPLE RULE).
 * The coach is fully OFFLINE — rules + your real logged data, nothing to pay for.
 * ==========================================================================*/
'use strict';

/* ---------------- routing ---------------- */
const params = new URLSearchParams(location.search);
let USER = params.get('user');
const CFG = USER ? CONFIGS[USER] : null;

/* ---------------- storage (namespaced) ---------------- */
const NS = () => `kc:${USER}:`;
function load(key, fallback) {
  try { const v = localStorage.getItem(NS() + key); return v == null ? fallback : JSON.parse(v); }
  catch { return fallback; }
}
function save(key, val) { localStorage.setItem(NS() + key, JSON.stringify(val)); }

/* ---------------- date helpers ---------------- */
function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function nowHM() { const d = new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function fmtTime(hm) {
  if (!hm) return '';
  const [h, m] = hm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM'; const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2,'0')} ${ap}`;
}
function dayTypeFor(d = new Date()) { return CFG.dayTypes[d.getDay()]; }
// which template tags belong to a given day type
function tagsForDayType(dt) { if (dt.soccer) return ['soccer','training','any']; if (dt.training) return ['training','any']; return ['rest','any']; }
function todayTags() { return tagsForDayType(dayTypeFor()); }
function mealsForDayType(dt) { const tags = tagsForDayType(dt); return CFG.library.filter(it => tags.includes(it.day)).sort((a,b)=>(a.time||'').localeCompare(b.time||'')); }
function todayMeals() { return mealsForDayType(dayTypeFor()); }
function snackItems() { return CFG.library.filter(it => it.day === 'grab'); }

/* ---------------- data accessors ---------------- */
const logsFor = (dk = todayKey()) => load('logs', {})[dk] || [];
function setLogsFor(dk, arr) { const all = load('logs', {}); all[dk] = arr; save('logs', all); }
function addEntry(e) {
  const dk = todayKey(); const arr = logsFor(dk);
  arr.push(Object.assign({ id: 'e' + Date.now() + Math.round(performance.now()), time: nowHM(), kind: 'food' }, e));
  arr.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  setLogsFor(dk, arr);
}
function delEntry(id) { const dk = todayKey(); setLogsFor(dk, logsFor(dk).filter(e => e.id !== id)); }
function totals(dk = todayKey()) {
  return logsFor(dk).reduce((t, e) => { t.kcal += +e.kcal||0; t.p += +e.p||0; t.c += +e.c||0; t.f += +e.f||0; return t; }, { kcal:0, p:0, c:0, f:0 });
}
const waterFor = (dk = todayKey()) => (load('water', {})[dk] || 0);
function addWater(ml) { const all = load('water', {}); const dk = todayKey(); all[dk] = Math.max(0, (all[dk]||0) + ml); save('water', all); }

/* ---------------- SVG ring ---------------- */
function ring({ value, target, label, big, sub, color, hero }) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const over = target > 0 && value > target;
  const r = hero ? 76 : 42, c = 2 * Math.PI * r, sz = hero ? 200 : 100, ctr = sz / 2;
  const dash = c * pct;
  const stroke = over ? 'var(--amber)' : color;
  return `<div class="ring-wrap ${hero ? 'hero' : ''}">
    <svg viewBox="0 0 ${sz} ${sz}" role="img" aria-label="${label}: ${big}">
      <circle cx="${ctr}" cy="${ctr}" r="${r}" fill="none" stroke="var(--ring-track)" stroke-width="${hero?14:9}"/>
      <circle cx="${ctr}" cy="${ctr}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${hero?14:9}"
        stroke-linecap="round" stroke-dasharray="${dash} ${c}" transform="rotate(-90 ${ctr} ${ctr})"/>
      <foreignObject x="0" y="0" width="${sz}" height="${sz}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="height:${sz}px;display:flex;align-items:center;justify-content:center">
          <div class="ring-center"><div class="big">${big}</div><div class="sub">${sub}</div></div>
        </div>
      </foreignObject>
    </svg>
    <div class="ring-label">${label}</div>
  </div>`;
}

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

/* ---------------- toast ---------------- */
let toastT;
function toast(html) {
  const old = document.getElementById('toast'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'toast'; el.id = 'toast'; el.innerHTML = html;
  document.body.appendChild(el);
  clearTimeout(toastT); toastT = setTimeout(() => el.remove(), 1600);
}

/* ============================================================================
 * SHELL
 * ==========================================================================*/
let activeTab = 'today';
const app = () => document.getElementById('app');

function render() {
  if (!USER || !CFG) { renderChooser(); return; }
  document.documentElement.style.setProperty('--gold', CFG.accent);
  document.documentElement.style.setProperty('--royal', CFG.accent2);
  document.title = `Kitchen Coach — ${CFG.name}`;
  const dt = dayTypeFor();
  app().innerHTML = `
    <header class="app-header">
      <span class="crest">${esc(CFG.name[0])}</span>
      <div>
        <div class="who">${esc(CFG.name)}${CFG.estimates ? ' <span class="pill">estimate</span>' : ''}</div>
        <div class="daytype">${esc(dt.label)} · ${dt.kcal.toLocaleString()} kcal · ${dt.protein}g protein</div>
      </div>
      <span class="spacer"></span>
      <button class="icon-btn" title="Settings" aria-label="Settings" onclick="openSettings()">⚙</button>
    </header>
    <div class="rule"></div>
    <main id="view"></main>
    <nav class="tabbar">
      ${tabBtn('today','Today','◎')}
      ${tabBtn('log','Log','✦')}
      ${tabBtn('menu','Menu','▤')}
      ${tabBtn('weigh','Weigh','♛')}
      ${tabBtn('coach','Coach','✉')}
      ${tabBtn('kitchen','Kitchen','⚜')}
    </nav>`;
  renderView();
}
const TAB_ORDER = ['today','log','menu','weigh','coach','kitchen'];
function tabBtn(id, label, icon) { return `<button class="${activeTab===id?'active':''}" onclick="go('${id}')"><span class="ti">${icon}</span>${label}</button>`; }
function go(tab) { activeTab = tab; renderView(); document.querySelectorAll('.tabbar button').forEach((b,i)=>b.classList.toggle('active',TAB_ORDER[i]===tab)); }

function renderView() {
  const v = document.getElementById('view'); if (!v) return;
  if (activeTab === 'today') v.innerHTML = viewToday();
  else if (activeTab === 'log') v.innerHTML = viewLog();
  else if (activeTab === 'menu') v.innerHTML = viewMenu();
  else if (activeTab === 'weigh') v.innerHTML = viewWeigh();
  else if (activeTab === 'coach') { v.innerHTML = viewCoach(); mountChat(); }
  else if (activeTab === 'kitchen') v.innerHTML = viewKitchen();
}

/* ============================================================================
 * TODAY  — hero protein ring + ONE-TAP meal logging right here
 * ==========================================================================*/
function viewToday() {
  const dt = dayTypeFor(); const t = totals();
  const pLeft = Math.max(0, dt.protein - Math.round(t.p));
  const kLeft = dt.kcal - Math.round(t.kcal);
  const water = waterFor();

  let lead, sub;
  if (pLeft <= 0) { lead = `<span class="status-green em">Protein hit.</span>`; sub = `Nicely done — you're at ${Math.round(t.p)}g.`; }
  else {
    const item = todayMeals().filter(i => i.p >= pLeft - 8).sort((a,b)=>a.p-b.p)[0] || CFG.library.slice().sort((a,b)=>b.p-a.p)[0];
    lead = `<span class="em">${pLeft}g protein</span> to go`;
    sub = `That's your ${esc(item.name.toLowerCase())}.`;
  }
  if (kLeft < 0) sub += ` <span class="status-amber">${Math.abs(kLeft)} kcal over.</span>`;
  else sub += ` ${kLeft.toLocaleString()} kcal left.`;
  if (t.kcal > 0 && t.kcal < CFG.calorieFloor) sub += ` <span class="small muted">(floor ${CFG.calorieFloor.toLocaleString()}.)</span>`;

  const estBanner = CFG.estimates ? `<div class="banner estimate">
    <strong>Estimates — refine at week 2.</strong> ${CFG.estimateRanges.kcal} kcal · ${CFG.estimateRanges.protein}g protein.
    See a dietitian if you take meds or have a condition.</div>` : '';

  let windowHint = '';
  if (CFG.fasting && CFG.eatingWindow && !dt.soccer) {
    const h = new Date().getHours();
    const inWin = h >= CFG.eatingWindow.start && h < CFG.eatingWindow.end;
    windowHint = `<div class="banner">Eating window <strong>12:00–8:00 PM</strong> · ${inWin ? 'open now' : 'closed'}.</div>`;
  } else if (dt.soccer) windowHint = `<div class="banner">Soccer night — recovery overrides the window. Shake + banana within 30 min, dinner ~9 PM.</div>`;

  return `
  ${estBanner}${windowHint}
  <div class="card">
    <div class="rings">
      ${ring({ value: t.p, target: dt.protein, label: 'Protein', big: `${Math.round(t.p)}`, sub: `of ${dt.protein}g`, color: 'var(--gold)', hero: true })}
    </div>
    <div class="remain"><div class="lead">${lead}</div><div class="sub">${sub}</div></div>
    <div class="rings" style="margin-top:20px">
      ${ring({ value: t.kcal, target: dt.kcal, label: 'Calories', big: `${Math.round(t.kcal).toLocaleString()}`, sub: `of ${dt.kcal.toLocaleString()}`, color: 'var(--royal)' })}
      ${ring({ value: water, target: CFG.waterTargetMl, label: 'Water', big: `${(water/1000).toFixed(1)}L`, sub: `of 3 L`, color: 'var(--gold-2)' })}
    </div>
  </div>

  <div class="card">
    <div class="card-title">Today's plan · tap to log</div>
    <div class="agenda">
      ${(() => { const logged = new Set(logsFor().map(e => e.name)); return todayMeals().map(it => schedRow(it, logged)).join(''); })()}
    </div>
    <button class="btn ghost full" style="margin-top:14px;color:var(--muted)" onclick="go('log')">＋ Log something else</button>
  </div>

  <div class="card tight">
    <div class="card-title">Water</div>
    <div class="water-bar"><div class="water-fill" style="width:${Math.min(100, water/CFG.waterTargetMl*100)}%"></div></div>
    <div class="row" style="margin-top:12px;gap:10px">
      <button class="btn full" onclick="addWater(250);bumpToday()">+250 ml</button>
      <button class="btn full" onclick="addWater(500);bumpToday()">+500 ml</button>
      <button class="btn ghost" style="flex:none" onclick="addWater(-250);bumpToday()">−</button>
    </div>
  </div>

  ${CFG.deskNibble ? deskNibbleCard() : ''}
  ${week2Prompt()}
  `;
}
function mealRow(it) {
  const i = CFG.library.indexOf(it);
  return `<button class="meal" onclick="quickAdd(${i})">
    <span class="plus">+</span>
    <span class="body"><span class="nm">${esc(it.name)}</span>${it.desc?`<span class="ds">${esc(it.desc)}</span>`:''}</span>
    <span class="mc">${it.p}g P<small>${it.kcal} kcal</small></span>
  </button>`;
}
// timed agenda row for Today's plan — logged meals check off
function schedRow(it, logged) {
  const i = CFG.library.indexOf(it);
  const done = logged.has(it.name);
  return `<button class="sched ${done?'done':''}" onclick="quickAdd(${i})">
    <span class="t">${fmtTime(it.time)}</span>
    <span class="node">${done?'✓':'＋'}</span>
    <span class="body"><span class="nm">${esc(it.name)}</span>${it.desc?`<span class="ds">${esc(it.desc)}</span>`:''}</span>
    <span class="mc">${it.p}g<small>${it.kcal} kcal</small></span>
  </button>`;
}
function bumpToday() { document.getElementById('view').innerHTML = viewToday(); }
function quickAdd(i) {
  const it = CFG.library[i];
  addEntry({ name: it.name, kcal: it.kcal, p: it.p, c: it.c, f: it.f, time: nowHM() });
  toast(`Logged <span class="g">${esc(it.name)}</span> · +${it.p}g P`);
  bumpToday();
}

/* ---------------- desk-nibble ---------------- */
function weekStart(d = new Date()) { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); x.setHours(0,0,0,0); return x; }
function nibbleWeek() {
  const all = load('logs', {}); const start = weekStart();
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate()+i); return (all[todayKey(d)]||[]).filter(e=>e.kind==='nibble').length; });
}
function deskNibbleCard() {
  const week = nibbleWeek(); const total = week.reduce((a,b)=>a+b,0);
  const labels = ['S','M','T','W','T','F','S']; const todayIdx = new Date().getDay();
  return `<div class="card">
    <div class="card-title">Desk nibbles</div>
    <div class="row between">
      <div class="nibble-status">${total===0?'<span class="status-green">Nothing at the desk</span>':'<span class="status-amber">Counted this week</span>'}</div>
      <div class="nibble-count">${total}</div>
    </div>
    <p class="small muted">A snack only helps if it's <strong>plated, single, and counted</strong>. Free grazing is the leak.</p>
    <button class="btn royal full" style="margin-top:6px" onclick="logNibble()">＋ Counted a plated snack</button>
    <div class="nibble-week">${week.map((n,i)=>`<span class="${n>0?'hit':''} ${i===todayIdx?'today':''}">${labels[i]}<br>${n||'·'}</span>`).join('')}</div>
  </div>`;
}
function logNibble() {
  openModal(`<h2>Counted desk snack</h2>
    <p class="small muted">Plate it, count it. This adds to today's calories.</p>
    <label class="field">What was it?</label>
    <input id="nb-name" placeholder="e.g. portioned nuts" value="Counted snack"/>
    <div class="field-row">
      <div><label class="field">kcal</label><input id="nb-k" type="number" inputmode="numeric" value="180"/></div>
      <div><label class="field">protein g</label><input id="nb-p" type="number" inputmode="numeric" value="5"/></div>
    </div>
    <button class="btn primary full" style="margin-top:16px" onclick="saveNibble()">Log it</button>`);
}
function saveNibble() {
  addEntry({ kind: 'nibble', name: val('nb-name') || 'Counted snack', kcal: +val('nb-k')||0, p: +val('nb-p')||0, c: 0, f: 0 });
  closeModal(); toast('Snack counted'); bumpToday();
}

/* ---------------- week-2 refine (suggestion only) ---------------- */
function loggedWeeksCount() {
  const all = load('logs', {}); const byWeek = {};
  Object.keys(all).forEach(dk => { if ((all[dk]||[]).length) { const ws = todayKey(weekStart(new Date(dk+'T12:00'))); (byWeek[ws] = byWeek[ws] || new Set()).add(dk); } });
  return Object.values(byWeek).filter(s => s.size >= 5).length;
}
function week2Prompt() {
  if (load('week2dismissed', false)) return '';
  const weights = load('weights', []);
  if (loggedWeeksCount() < 2 || weights.length < 2) return '';
  const moved = weights[0].kg - weights[weights.length-1].kg;
  if (moved >= 0.4 * weights.length) return '';
  return `<div class="card" style="border-color:var(--gold)">
    <div class="card-title" style="color:var(--gold)">Two clean weeks logged</div>
    <p>If the scale's flat, consider trimming <strong>~150 kcal</strong>. Early movement is water, not fat — a suggestion only, nothing changes automatically.</p>
    <div class="row" style="gap:10px;margin-top:10px">
      <button class="btn full" onclick="openSettings()">Adjust myself</button>
      <button class="btn ghost" onclick="save('week2dismissed',true);bumpToday()">Dismiss</button>
    </div>
    <p class="small muted" style="margin-top:8px">Targets live in <code>config.js</code> — refine off real data, not before.</p>
  </div>`;
}

/* ============================================================================
 * LOG — full library + manual + timeline
 * ==========================================================================*/
function viewLog() {
  const entries = logsFor(); const t = totals(); const dt = dayTypeFor();
  const inWindow = e => { if (!CFG.fasting || !CFG.eatingWindow || dt.soccer) return true; const h = +(e.time||'12:00').split(':')[0]; return h >= CFG.eatingWindow.start && h < CFG.eatingWindow.end; };
  return `
  <div class="card">
    <div class="card-title">Tap to log — all items</div>
    <div class="lib-grid">${CFG.library.map(it => mealRow(it)).join('')}</div>
    <button class="btn full" style="margin-top:12px" onclick="openManual()">✎ Manual add (anything else)</button>
  </div>
  <div class="card">
    <div class="card-title">Today · ${Math.round(t.kcal).toLocaleString()} kcal · ${Math.round(t.p)}g P</div>
    ${entries.length ? `<ul class="timeline">${entries.map(e=>`
      <li class="entry ${e.kind==='nibble'?'nibble':''} ${inWindow(e)?'':'outside'}">
        <span class="time">${fmtTime(e.time)}</span>
        <span class="nm">${esc(e.name)}<div class="mc">${e.kcal} kcal · ${e.p}g P${e.c?` · ${e.c}C`:''}${e.f?` · ${e.f}F`:''}</span></span>
        <button class="x" title="Edit" onclick="editEntry('${e.id}')">✎</button>
        <button class="x" title="Delete" onclick="delEntry('${e.id}');renderView()">✕</button>
      </li>`).join('')}</ul>` : '<p class="muted small">Nothing logged yet. Tap a meal above.</p>'}
  </div>`;
}
function openManual(entry) {
  const e = entry || {};
  openModal(`<h2>${entry?'Edit entry':'Manual add'}</h2>
    <label class="field">Name</label>
    <input id="m-name" value="${esc(e.name||'')}" placeholder="e.g. Chicken shawarma"/>
    <div class="field-row three">
      <div><label class="field">kcal</label><input id="m-k" type="number" inputmode="numeric" value="${e.kcal||''}"/></div>
      <div><label class="field">protein g</label><input id="m-p" type="number" inputmode="numeric" value="${e.p||''}"/></div>
      <div><label class="field">time</label><input id="m-t" type="time" value="${e.time||nowHM()}"/></div>
    </div>
    <div class="field-row">
      <div><label class="field">carbs g <span class="muted">(opt)</span></label><input id="m-c" type="number" inputmode="numeric" value="${e.c||''}"/></div>
      <div><label class="field">fat g <span class="muted">(opt)</span></label><input id="m-f" type="number" inputmode="numeric" value="${e.f||''}"/></div>
    </div>
    <button class="btn primary full" style="margin-top:16px" onclick="saveManual('${e.id||''}')">${entry?'Save':'Add'}</button>`);
}
function saveManual(id) {
  const data = { name: val('m-name')||'Food', kcal:+val('m-k')||0, p:+val('m-p')||0, c:+val('m-c')||0, f:+val('m-f')||0, time:val('m-t')||nowHM() };
  if (id) { const dk = todayKey(); const arr = logsFor(dk).map(e => e.id===id ? Object.assign(e,data) : e); arr.sort((a,b)=>(a.time||'').localeCompare(b.time||'')); setLogsFor(dk,arr); }
  else addEntry(data);
  closeModal(); toast('Logged'); renderView();
}
function editEntry(id) { const e = logsFor().find(x=>x.id===id); if (e) openManual(e); }

/* ============================================================================
 * WEIGH-IN
 * ==========================================================================*/
function viewWeigh() {
  const weights = load('weights', []); const last = weights[weights.length-1];
  const weighDayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][CFG.weighInDay];
  return `
  <div class="card tight">
    <div class="card-title">Weekly weigh-in · ${weighDayName} AM</div>
    <div class="field-row">
      <div><label class="field">Weight (kg)</label><input id="wt-kg" type="number" inputmode="decimal" step="0.1" placeholder="${last?last.kg:'82.0'}"/></div>
      <div><label class="field">Date</label><input id="wt-date" type="date" value="${todayKey()}"/></div>
    </div>
    <button class="btn primary full" style="margin-top:14px" onclick="addWeight()">Save weigh-in</button>
  </div>
  <div class="card">
    <div class="card-title">Trend → ${CFG.goalWeightKg} kg by ${esc(CFG.goalDateLabel)}</div>
    ${weightChart(weights)}
    ${weights.length ? `<table style="margin-top:12px"><thead><tr><th>Date</th><th class="num">kg</th><th class="num">Δ</th><th></th></tr></thead><tbody>
      ${weights.slice().reverse().map((w,ri)=>{ const idx = weights.length-1-ri; const prev = weights[idx-1]; const delta = prev?(w.kg-prev.kg).toFixed(1):'—';
        return `<tr><td>${esc(w.date)}</td><td class="num">${w.kg.toFixed(1)}</td><td class="num ${prev&&w.kg<prev.kg?'status-green':''}">${delta!=='—'&&+delta>0?'+':''}${delta}</td><td class="num"><button class="x" onclick="delWeight(${idx})">✕</button></td></tr>`;
      }).join('')}</tbody></table>` : '<p class="muted small">No weigh-ins yet.</p>'}
  </div>`;
}
function addWeight() {
  const kg = parseFloat(val('wt-kg')); const date = val('wt-date')||todayKey();
  if (!kg || kg <= 0) return;
  const weights = load('weights', []).filter(w=>w.date!==date); weights.push({date,kg}); weights.sort((a,b)=>a.date.localeCompare(b.date));
  save('weights', weights); toast('Weigh-in saved'); renderView();
}
function delWeight(i) { const w = load('weights', []); w.splice(i,1); save('weights', w); renderView(); }
function weightChart(weights) {
  if (weights.length < 2) return `<svg class="chart" viewBox="0 0 320 200"><text x="14" y="100">Log 2+ weigh-ins to see the trend.</text></svg>`;
  const W=320,H=200,pad=30; const ys = weights.map(w=>w.kg);
  const minY = Math.min(...ys, CFG.goalWeightKg)-1, maxY = Math.max(...ys, CFG.goalWeightKg)+1;
  const X = i => pad + (W-pad-10)*(i/(weights.length-1));
  const Y = v => H-pad - (H-pad-15)*((v-minY)/(maxY-minY));
  const path = weights.map((w,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(w.kg).toFixed(1)}`).join(' ');
  const goalY = Y(CFG.goalWeightKg).toFixed(1);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <line x1="${pad}" y1="${goalY}" x2="${W-10}" y2="${goalY}" stroke="var(--green)" stroke-dasharray="4 4" opacity=".7"/>
    <text x="${W-10}" y="${+goalY-4}" text-anchor="end" fill="var(--green)">goal ${CFG.goalWeightKg}kg</text>
    <path d="${path}" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linejoin="round"/>
    ${weights.map((w,i)=>`<circle cx="${X(i)}" cy="${Y(w.kg)}" r="3.5" fill="var(--gold)"/>`).join('')}
    <text x="${pad}" y="${H-8}">${esc(weights[0].date.slice(5))}</text>
    <text x="${W-10}" y="${H-8}" text-anchor="end">${esc(weights[weights.length-1].date.slice(5))}</text>
  </svg>`;
}

/* ============================================================================
 * MENU — full weekly meal menu (every meal at its time) + all snacks
 * ==========================================================================*/
const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function viewMenu() {
  // group weekdays that share the same plan so identical days collapse
  const order = [1,2,3,4,5,6,0]; // Mon → Sun
  const groups = []; const seen = {};
  order.forEach(i => {
    const dt = CFG.dayTypes[i];
    const meals = mealsForDayType(dt);
    const sig = `${dt.kcal}/${dt.protein}|${meals.map(m=>m.name).join(',')}`;
    if (seen[sig] == null) { seen[sig] = groups.length; groups.push({ days:[i], dt, meals }); }
    else groups[seen[sig]].days.push(i);
  });
  const todayIdx = new Date().getDay();

  const groupCard = g => {
    const daysLabel = g.days.length === 7 ? 'Every day'
      : g.days.sort((a,b)=>((a+6)%7)-((b+6)%7)).map(i=>DAY_ABBR[i]).join(' · ');
    const isToday = g.days.includes(todayIdx);
    let run = 0;
    const rows = g.meals.map(m => { run += m.kcal; return `
      <div class="menu-row">
        <span class="t">${fmtTime(m.time)}</span>
        <span class="body"><span class="nm">${esc(m.name)}</span>${m.desc?`<span class="ds">${esc(m.desc)}</span>`:''}</span>
        <span class="mc">${m.p}g<small>${m.kcal}</small></span>
      </div>`;
    }).join('');
    return `<div class="card">
      <div class="card-title">${esc(daysLabel)}${isToday?' <span class="pill">today</span>':''}</div>
      <p class="small muted" style="margin-top:-8px">${esc(g.dt.short)} · ${g.dt.kcal.toLocaleString()} kcal · ${g.dt.protein}g protein</p>
      <div class="menu-list">${rows}</div>
    </div>`;
  };

  const snacks = snackItems();
  const snackCard = `<div class="card">
    <div class="card-title">Snacks & extras</div>
    <p class="small muted" style="margin-top:-8px">${CFG.deskNibble ? 'Plate it, count it, log it — one counted snack, not free grazing.' : 'Quick protein add-ons. Plate and log them.'}</p>
    <table style="margin-top:8px"><thead><tr><th>Item</th><th class="num">P</th><th class="num">kcal</th></tr></thead><tbody>
      ${snacks.map(s=>`<tr><td>${esc(s.name)}</td><td class="num">${s.p}g</td><td class="num">${s.kcal}</td></tr>`).join('')}
    </tbody></table>
  </div>`;

  const est = CFG.estimates ? `<div class="banner estimate"><strong>Estimates.</strong> Portions are ~⅔ of the household plate. Refine off the scale at week 2.</div>` : '';
  return est + groups.map(groupCard).join('') + snackCard;
}

/* ============================================================================
 * KITCHEN (grocery + batch)
 * ==========================================================================*/
function viewKitchen() {
  return `
  <div class="card">
    <div class="card-title">This week's grocery list</div>
    ${GROCERY_LIST.map(g=>`<h3 class="serif" style="color:var(--royal);margin-top:12px">${esc(g.cat)}</h3><ul class="tidy">${g.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`).join('')}
    <p class="small muted" style="margin-top:10px">${esc(GROCERY_BUDGET)}</p>
  </div>
  <div class="card">
    <div class="card-title">Sunday batch · ~2 hrs</div>
    <p class="small muted" style="margin-top:-6px">Oven + rice cooker + stovetop running in parallel.</p>
    <ol class="tidy">${BATCH_STEPS.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
  </div>`;
}

/* ============================================================================
 * COACH — in-app Claude when an API key is set, offline rules coach otherwise.
 * ==========================================================================*/
const COACH_CHIPS = [
  'What should I eat now?',
  "Am I on track?",
  'Plan my day',
  'Eating out',
  'Craving a snack',
  'Batch & grocery',
];
let pendingImage = null; // { dataUrl, mediaType, base64 } for photo verdicts

function viewCoach() {
  const chat = load('chat', []);
  const key = load('apikey', '');

  // No key → setup card + the always-on offline coach (with the Project copy option).
  if (!key) return `
    <div class="card">
      <div class="card-title">Chat with Claude in-app</div>
      <p class="small">Paste a personal Anthropic API key and the Coach tab becomes a real Claude chat that reads your live log — including food-photo verdicts. No copy-paste.</p>
      <ul class="tidy small">
        <li><strong>Pay-as-you-go</strong> and separate from any Claude subscription — usually ~$1–3/month for two casual users.</li>
        <li>Stored <strong>only on this device</strong>, sent <strong>only to api.anthropic.com</strong>.</li>
        <li>Get one at <span class="muted">console.anthropic.com → API keys</span>.</li>
      </ul>
      <label class="field">API key (sk-ant-…)</label>
      <input id="key-input" type="password" placeholder="sk-ant-..."/>
      <button class="btn primary full" style="margin-top:12px" onclick="saveKey()">Turn on the Claude coach</button>
    </div>
    <div class="card" style="display:flex;flex-direction:column;min-height:42vh">
      <div class="card-title">Quick coach · offline · instant · free</div>
      <div class="chat-scroll" id="chat-scroll">
        ${chat.length ? chat.map(renderMsg).join('') : `<div class="msg assistant">${mdLite(coachGreeting())}</div>`}
      </div>
      <div class="chips">${COACH_CHIPS.map(c=>`<button class="chip" onclick="coachAsk(this.textContent)">${esc(c)}</button>`).join('')}</div>
      <div class="chat-input">
        <textarea id="chat-text" rows="1" placeholder="Ask the coach…" oninput="autoGrow(this)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat()}"></textarea>
        <button class="btn primary" style="flex:none" onclick="sendChat()" aria-label="Send">›</button>
      </div>
    </div>`;

  // Key set → real Claude chat with photo attach.
  return `
    <div class="card" style="display:flex;flex-direction:column;min-height:64vh">
      <div class="card-title">Coach · Claude · reads today's log</div>
      <div class="chat-scroll" id="chat-scroll">
        ${chat.length ? chat.map(renderMsg).join('') : `<div class="msg assistant">${mdLite(coachGreeting())}</div>`}
      </div>
      <div id="typing" class="typing hide">Coach is thinking…</div>
      <div class="chips">${COACH_CHIPS.map(c=>`<button class="chip" onclick="coachAsk(this.textContent)">${esc(c)}</button>`).join('')}</div>
      <div id="attach-row"></div>
      <div class="chat-input">
        <label class="icon-btn" title="Attach a food photo" style="flex:none">📷<input id="photo" type="file" accept="image/*" class="sr" onchange="pickPhoto(event)"></label>
        <textarea id="chat-text" rows="1" placeholder="Ask Claude… or attach a photo" oninput="autoGrow(this)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat()}"></textarea>
        <button class="btn primary" style="flex:none" onclick="sendChat()" aria-label="Send">›</button>
      </div>
    </div>`;
}
function saveKey() { const k = (val('key-input')||'').trim(); if (k) { save('apikey', k); toast('Claude coach on'); renderView(); } }

/* Live-data context block injected into each Claude message (data only, no question). */
function coachContext() {
  const s = liveSnapshot();
  const w = load('weights', []).slice(-4);
  const L = [];
  L.push(`Coaching ${CFG.name}${CFG.estimates ? ' (targets are ESTIMATES — use the labelled ranges, never invent precise numbers)' : ' (confirmed numbers)'}.`);
  L.push(`Today ${todayKey()} — ${s.dt.label}. Target ${s.dt.kcal.toLocaleString()} kcal / ${s.dt.protein}g protein. Floor ${CFG.calorieFloor}.`);
  L.push(`Logged so far: ${Math.round(s.t.kcal)} kcal, ${Math.round(s.t.p)}g protein, ${Math.round(s.t.c)}g carbs, ${Math.round(s.t.f)}g fat. Water ${(s.water/1000).toFixed(1)}/3 L.`);
  L.push(`Remaining: ${s.kLeft.toLocaleString()} kcal, ${s.pLeft}g protein.`);
  L.push(s.entries.length ? `Entries today: ${s.entries.map(e=>`${fmtTime(e.time)} ${e.name} (${e.kcal} kcal / ${e.p}g P)`).join('; ')}.` : 'Nothing logged yet today.');
  if (CFG.deskNibble) L.push(`Desk-nibbles counted this week: ${nibbleWeek().reduce((a,b)=>a+b,0)}.`);
  if (w.length) L.push(`Recent weigh-ins: ${w.map(x=>`${x.date} ${x.kg}kg`).join(', ')}. Goal ${CFG.goalWeightKg}kg by ${CFG.goalDateLabel}.`);
  return L.join('\n');
}

function pickPhoto(ev) {
  const file = ev.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = { dataUrl: reader.result, mediaType: file.type, base64: String(reader.result).split(',')[1] };
    const row = document.getElementById('attach-row');
    if (row) row.innerHTML = `<div class="attach-chip">📎 Photo attached — ask for a ✅/✏️/❌ verdict <button class="x" onclick="clearPhoto()">✕</button></div>`;
  };
  reader.readAsDataURL(file);
}
function clearPhoto() { pendingImage = null; const row = document.getElementById('attach-row'); if (row) row.innerHTML = ''; }

function mountChat() { const s = document.getElementById('chat-scroll'); if (s) s.scrollTop = s.scrollHeight; }
function autoGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(120, el.scrollHeight)+'px'; }
function renderMsg(m) {
  if (m.error) return `<div class="msg error">${esc(m.content)}</div>`;
  const img = m.image ? `<img src="${m.image}" alt="attached photo"/>` : '';
  return `<div class="msg ${m.role==='user'?'user':'assistant'}">${m.role==='assistant'?mdLite(m.content):esc(m.content)}${img}</div>`;
}
function coachAsk(text) { const ta = document.getElementById('chat-text'); if (ta) ta.value = text; sendChat(); }

async function sendChat() {
  const text = (val('chat-text')||'').trim();
  if (!text && !pendingImage) return;
  const key = load('apikey', '');
  const chat = load('chat', []);
  chat.push({ role:'user', content: text || '(photo)', image: pendingImage ? pendingImage.dataUrl : null });
  save('chat', chat);

  // No key → instant offline rules coach.
  if (!key) { chat.push({ role:'assistant', content: coachReply(text) }); save('chat', chat); renderView(); return; }

  // Key → real Claude call.
  const imageForApi = pendingImage; pendingImage = null;
  const ta = document.getElementById('chat-text'); if (ta) ta.value = '';
  renderView();
  const typing = document.getElementById('typing'); if (typing) typing.classList.remove('hide');

  const dt = dayTypeFor();
  const system = [
    { type: 'text', text: MASTERBRIEF, cache_control: { type: 'ephemeral' } },  // cached → cheap per message
    { type: 'text', text: `INSTANCE: You are coaching ${CFG.name}. Today is a ${dt.label} day — target ${dt.kcal} kcal / ${dt.protein}g protein, floor ${CFG.calorieFloor}.${CFG.estimates ? ' Her targets are ESTIMATES; never present them as precise.' : ''} Only ever discuss ${CFG.name}'s own data — never the partner's. Keep replies mobile-short: tables for macros, bullets for lists.` },
  ];
  const apiMessages = chat.filter(m => !m.error).map((m, i, arr) => {
    const blocks = [];
    if (m.role === 'user' && i === arr.length - 1) {
      blocks.push({ type: 'text', text: `[LIVE DATA — today]\n${coachContext()}\n\n[MESSAGE]\n${m.content}` });
      if (imageForApi) blocks.push({ type: 'image', source: { type: 'base64', media_type: imageForApi.mediaType, data: imageForApi.base64 } });
    } else {
      blocks.push({ type: 'text', text: m.content });
    }
    return { role: m.role, content: blocks };
  });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1024, system, messages: apiMessages }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ? data.error.message : `HTTP ${res.status}`);
    const reply = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    const chat2 = load('chat', []); chat2.push({ role: 'assistant', content: reply || '(no response)' }); save('chat', chat2);
  } catch (err) {
    const chat2 = load('chat', []); chat2.push({ role: 'assistant', error: true, content: `Couldn't reach Claude: ${err.message}. Check your API key in Settings — the offline quick coach still works.` }); save('chat', chat2);
  }
  renderView();
}

/* ---- the offline coach brain ---- */
function liveSnapshot() {
  const dt = dayTypeFor(); const t = totals();
  return {
    dt, t,
    pLeft: Math.max(0, dt.protein - Math.round(t.p)),
    kLeft: dt.kcal - Math.round(t.kcal),
    water: waterFor(),
    entries: logsFor(),
    hour: new Date().getHours(),
  };
}
function suggestForProtein(pLeft) {
  // pick template items (today's meals first, then anything) that cover the gap
  const pool = todayMeals().filter(i => i.day !== 'grab');
  const fit = pool.filter(i => i.p >= pLeft - 10).sort((a,b)=>a.p-b.p)[0];
  if (fit) return fit;
  return CFG.library.slice().sort((a,b)=>b.p-a.p)[0];
}
function coachGreeting() {
  const s = liveSnapshot();
  return `I'm your kitchen coach — fully offline, reading your real log. Today is a **${s.dt.short}** day: target **${s.dt.kcal.toLocaleString()} kcal / ${s.dt.protein}g protein**.\n\nTap a chip below or ask me anything.`;
}
function coachReply(text) {
  const q = ' ' + text.toLowerCase() + ' ';
  const s = liveSnapshot();

  // COUPLE RULE guard (Jean asking about her plate)
  if (USER === 'jean' && /\b(her|she|girlfriend|gf|wife|partner)\b/.test(q))
    return `That's not your lane. ${COACH_FACTS.couple}\n\nKeep your eyes on **your** plate — log what *you* eat, cook the batch, and let the kitchen do the rest.`;

  const has = (...words) => words.some(w => q.includes(w));

  // on track / status
  if (has('on track','how am i','status','doing','progress','summary','recap')) {
    const verdict = s.pLeft === 0 ? '✦ Protein hit' : (s.t.p >= s.dt.protein*0.6 ? 'on pace' : 'behind on protein');
    return `**Where you stand — ${s.dt.short} day**\n\n| | now | target | left |\n|---|---|---|---|\n| Protein | ${Math.round(s.t.p)}g | ${s.dt.protein}g | ${s.pLeft}g |\n| Calories | ${Math.round(s.t.kcal).toLocaleString()} | ${s.dt.kcal.toLocaleString()} | ${s.kLeft.toLocaleString()} |\n| Water | ${(s.water/1000).toFixed(1)}L | 3L | ${Math.max(0,(3000-s.water)/1000).toFixed(1)}L |\n\n${s.pLeft>0?`You're ${verdict}. ${COACH_FACTS.protein}`:`Protein's in the bank — ${s.kLeft<0?'ease off calories the rest of the day.':'just keep water moving.'}`}`;
  }

  // what to eat now
  if (has('eat now','what should i eat','what now','hungry','what to eat','suggest','recommend','next meal')) {
    if (s.pLeft <= 0) return `You've already hit protein (**${Math.round(s.t.p)}g**). ${s.kLeft>200?`If you're genuinely hungry, a light protein like Greek yogurt keeps it clean — you've got ${s.kLeft.toLocaleString()} kcal of room.`:`You're near your calorie target — water or herbal tea over more food.`}`;
    const it = suggestForProtein(s.pLeft);
    return `You've got **${s.pLeft}g protein** and **${s.kLeft.toLocaleString()} kcal** left.\n\nLog your **${it.name.toLowerCase()}**${it.desc?` (${it.desc})`:''} — **${it.p}g P · ${it.kcal} kcal**. That lands you${s.pLeft-it.p<=5?' on protein.':` ${Math.max(0,s.pLeft-it.p)}g short — top up with a yogurt or whey.`}\n\nTap it on the **Today** screen to log in one tap.`;
  }

  // plan the day
  if (has('plan','what do i eat today','day plan','schedule','layout')) {
    const meals = todayMeals().filter(i => i.day !== 'grab');
    let run = 0;
    const rows = meals.map(m => { run += m.kcal; return `| ${fmtTime(m.time)} | ${m.name} | ${m.p}g | ${run.toLocaleString()} |`; }).join('\n');
    return `**${s.dt.label} — ${s.dt.kcal.toLocaleString()} / ${s.dt.protein}g**\n\n| Time | Meal | Protein | Running |\n|---|---|---|---|\n${rows}\n\n${s.dt.soccer?COACH_FACTS.soccer:CFG.fasting?COACH_FACTS.eatingWindow:'Eat across the day, protein at every meal.'}`;
  }

  // eating out
  if (has('eating out','restaurant','order','uber','takeout','take out','out for','dinner out')) {
    const it = suggestForProtein(Math.max(20, s.pLeft));
    return `**Out tonight — protect protein, skip the leaks.**\n\n- ${COACH_FACTS.eatingOut}\n- You have **${s.pLeft}g protein / ${s.kLeft.toLocaleString()} kcal** left — aim a main near **${Math.max(30,s.pLeft)}g protein**.\n- Good picks: grilled chicken or fish + rice/potato + veg. Dressing on the side.\n- ${COACH_FACTS.liquids}\n\nLog it with **Manual add** when it lands.`;
  }

  // craving / snack / desk
  if (has('craving','snack','desk','nibble','chips','biscuit','bored','stress')) {
    return `**The desk rule:** ${COACH_FACTS.deskNibble}\n\nIf you're going to snack, make it count: portion it onto a plate, then log it with **“Counted a plated snack”** on the Today screen. ${CFG.deskNibble?'That keeps the one real leak visible.':''}\n\nBetter swaps: Greek yogurt, cottage cheese, or a protein muffin — protein curbs the craving.`;
  }

  // batch / cooking / grocery
  if (has('batch','cook','prep','meal prep','grocery','shopping','groceries','buy')) {
    if (has('grocery','shopping','groceries','buy')) {
      return `**This week's groceries** (full list on the Kitchen tab):\n\n${GROCERY_LIST.map(g=>`**${g.cat}** — ${g.items.length} items`).join('\n')}\n\n${GROCERY_BUDGET}`;
    }
    return `**Sunday batch — ~2 hrs, everything running in parallel:**\n\n${BATCH_STEPS.slice(0,4).map((st,i)=>`${i+1}. ${st}`).join('\n')}\n\nFull step-by-step is on the **Kitchen** tab.`;
  }

  // water
  if (has('water','hydrat','drink')) {
    const left = Math.max(0, 3000 - s.water);
    return left<=0 ? `Water's done — **${(s.water/1000).toFixed(1)}L** today. Nice.` : `You're at **${(s.water/1000).toFixed(1)}L** of 3L — **${(left/1000).toFixed(1)}L** to go. Tap +500ml on the Today screen. ${COACH_FACTS.water}`;
  }

  // weight / scale
  if (has('weight','scale','weigh','heavier','lighter','plateau','stuck','flat')) {
    const w = load('weights', []);
    if (w.length < 2) return `Log a couple of weekly weigh-ins on the **Weigh** tab first. ${COACH_FACTS.week2}`;
    const moved = (w[0].kg - w[w.length-1].kg).toFixed(1);
    return `You've moved **${moved} kg** across ${w.length} weigh-ins (latest ${w[w.length-1].kg}kg, goal ${CFG.goalWeightKg}kg).\n\n${+moved < 0.4*w.length ? `Slower than expected. ${COACH_FACTS.week2}` : `On pace — hold the line, don't cut more.`}`;
  }

  // protein generic
  if (has('protein')) {
    if (s.pLeft <= 0) return `Protein's hit — **${Math.round(s.t.p)}g** of ${s.dt.protein}g. ${COACH_FACTS.protein}`;
    const it = suggestForProtein(s.pLeft);
    return `**${s.pLeft}g protein** to go. Quickest close: your **${it.name.toLowerCase()}** (${it.p}g). ${COACH_FACTS.protein}`;
  }

  // philosophy / motivation / help
  if (has('help','what can you','how do','overhaul','everything','motivat','stuck on'))
    return `I read your real log and coach off it. Try:\n\n- **What should I eat now?** — fits a meal to your remaining macros\n- **Am I on track?** — today's numbers at a glance\n- **Plan my day** — your full template for ${s.dt.short} days\n- **Eating out** / **Craving a snack** / **Batch & grocery**\n\nCore idea: ${COACH_FACTS.philosophy}`;

  // fallback
  const it = suggestForProtein(Math.max(20, s.pLeft));
  return `Here's where you are: **${Math.round(s.t.p)}/${s.dt.protein}g protein**, **${Math.round(s.t.kcal).toLocaleString()}/${s.dt.kcal.toLocaleString()} kcal**.\n\n${s.pLeft>0?`Next move: your **${it.name.toLowerCase()}** (${it.p}g P).`:`Protein's done — keep water moving.`}\n\nAsk me “what should I eat now”, “am I on track”, or tap a chip.`;
}

/* tiny markdown: tables, bold, bullets, ordered lists, line breaks */
function mdLite(src) {
  const lines = esc(src).split('\n'); let html = '', i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*\|.*\|\s*$/.test(line) && i+1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i+1])) {
      const head = line.split('|').slice(1,-1).map(s=>s.trim()); i += 2; const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i].split('|').slice(1,-1).map(s=>s.trim())); i++; }
      html += `<table><thead><tr>${head.map(h=>`<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`; continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) { let items=''; while (i<lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items += `<li>${inline(lines[i].replace(/^\s*\d+\.\s+/,''))}</li>`; i++; } html += `<ol class="tidy">${items}</ol>`; continue; }
    if (/^\s*[-*]\s+/.test(line)) { let items=''; while (i<lines.length && /^\s*[-*]\s+/.test(lines[i])) { items += `<li>${inline(lines[i].replace(/^\s*[-*]\s+/,''))}</li>`; i++; } html += `<ul class="tidy">${items}</ul>`; continue; }
    html += line.trim() ? `<p>${inline(line)}</p>` : ''; i++;
  }
  return html;
}
function inline(s) { return s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`(.+?)`/g,'<code>$1</code>'); }

/* ============================================================================
 * SETTINGS / export / import / Claude coach key
 * ==========================================================================*/
function openSettings() {
  const key = load('apikey', '');
  openModal(`<h2>Settings — ${esc(CFG.name)}</h2>
    <h3 class="serif">Claude coach</h3>
    <p class="small muted">${key ? 'In-app Claude coach is <strong>on</strong>.' : 'Offline coach is on (free). Add an Anthropic API key to chat with Claude in-app.'} Pay-as-you-go, device-only, sent only to api.anthropic.com.</p>
    <label class="field">API key (sk-ant-…)</label>
    <input id="set-key" type="password" placeholder="sk-ant-..." value="${key ? '••••••••••••' : ''}"/>
    <div class="row" style="gap:8px;margin-top:8px">
      <button class="btn full" onclick="updateKey()">${key ? 'Update key' : 'Save key'}</button>
      ${key ? '<button class="btn danger" onclick="clearKey()">Turn off</button>' : ''}
    </div>
    <hr>
    <h3 class="serif">Backup / move devices</h3>
    <p class="small muted">All ${esc(CFG.name)}'s data stays on this device (the API key is never included in a backup).</p>
    <div class="btn-grid">
      <button class="btn full" onclick="exportData()">⬇ Export JSON backup</button>
      <label class="btn full" style="cursor:pointer">⬆ Import JSON backup<input type="file" accept="application/json" class="sr" onchange="importData(event)"></label>
    </div>
    <hr>
    <p class="small muted">Targets are baked into <code>config.js</code>. ${CFG.estimates ? 'Her numbers are estimates — refine off the scale at week 2, not before.' : 'Jean\'s numbers are confirmed.'}</p>
    <button class="btn ghost full" style="margin-top:10px" onclick="switchUser()">Switch instance</button>
    <button class="btn danger full" style="margin-top:10px" onclick="resetToday()">Clear today's log</button>`);
}
function updateKey() { const k = (val('set-key')||'').trim(); if (k && !/^•+$/.test(k)) { save('apikey', k); toast('Key updated'); } closeModal(); renderView(); }
function clearKey() { localStorage.removeItem(NS()+'apikey'); closeModal(); toast('Claude coach off'); renderView(); }
function resetToday() { if (confirm("Clear today's food log?")) { setLogsFor(todayKey(), []); closeModal(); toast('Today cleared'); renderView(); } }
function switchUser() { location.search = ''; }
function exportData() {
  const dump = { app:'kitchen-coach', user:USER, exported:new Date().toISOString(), data:{} };
  for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if (k.startsWith(NS()) && k !== NS()+'apikey') dump.data[k]=localStorage.getItem(k); } // never export the key
  const blob = new Blob([JSON.stringify(dump,null,2)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `kitchen-coach-${USER}-backup.json`; a.click(); URL.revokeObjectURL(a.href);
}
function importData(ev) {
  const file = ev.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const dump = JSON.parse(reader.result);
      if (dump.user && dump.user !== USER && !confirm(`This backup is for "${dump.user}", not "${USER}". Import into ${USER}'s tracker anyway?`)) return;
      Object.keys(dump.data||{}).forEach(k => { localStorage.setItem(k.replace(/^kc:[^:]+:/, NS()), dump.data[k]); });
      closeModal(); renderView(); toast('Backup imported');
    } catch { alert('Could not read that file.'); }
  };
  reader.readAsText(file);
}

/* ---------------- modal + helpers ---------------- */
function openModal(html) {
  closeModal();
  const bg = document.createElement('div'); bg.className='modal-bg'; bg.id='modal-bg';
  bg.onclick = e => { if (e.target === bg) closeModal(); };
  bg.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(bg);
}
function closeModal() { const m = document.getElementById('modal-bg'); if (m) m.remove(); }
function val(id) { const el = document.getElementById(id); return el ? el.value : ''; }

/* ---------------- chooser ---------------- */
function renderChooser() {
  document.title = 'Kitchen Coach';
  app().innerHTML = `<div class="chooser">
    <div class="brand">Kitchen <span class="g serif">Coach</span></div>
    <p class="muted">Two private trackers. Pick yours — data never crosses over.</p>
    <a class="pick jean" href="?user=jean"><span class="seal">J</span> Jean</a>
    <a class="pick gf" href="?user=gf"><span class="seal">H</span> Her</a>
    <p class="small muted">Each tracker lives only in this browser. Add to your home screen from the share menu.</p>
  </div>`;
}

/* ---------------- boot ---------------- */
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
