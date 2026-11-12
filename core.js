/* SECURITIES INTELLIGENCE — application core: state, helpers, generic table/form, scoring, audit, import/export. */

const App = {
  kinds: { real: null, demo: null },
  kind: "demo",
  tab: "command",
  ready: false,
  ui: { search: {}, sort: {}, filters: {}, drawer: null, modal: null, toast: null, expanded: {}, sub: { regulatory: "issues", evidence: "evidence" },
    compare: [], litIssue: "", metric: "", stmtTopic: "", importPreview: null, companyPaste: "", companyPreview: null }
};
function W() { return App.kinds[App.kind]; }

const TABS = [
  ["command", "Command Center", "A"], ["companies", "Company Intelligence", "B"], ["regulatory", "Regulatory Analysis", "C"], ["disclosure", "Disclosure Intelligence", "D"],
  ["forensics", "Financial Forensics", "E"], ["litigation", "Litigation Strategy", "F"], ["evidence", "Evidence Vault", "G"], ["paper", "Paper Production", "H"],
  ["audit", "Audit", "✓"], ["activation", "Exam Activation", "◆"], ["data", "Data & Backup", "⇅"], ["guide", "Guide", "?"]
];

/* ---------- small helpers ---------- */
const esc = s => String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isStat = v => !!v && typeof v === "object" && !Array.isArray(v) && Object.prototype.hasOwnProperty.call(v, "$s");
const raw = v => isStat(v) ? null : v;
const has = v => !isStat(v) && v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0);
const pct = (a, b) => b ? Math.round(100 * a / b) : null;
const fmtPct = p => p === null || p === undefined || isNaN(p) ? "Unknown" : p + "%";
const trunc = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const uniq = a => Array.from(new Set(a));
const num = v => { const r = raw(v); if (r === "" || r === null || r === undefined) return null; const n = Number(r); return isNaN(n) ? null : n; };

function disp(v, opts) {
  if (isStat(v)) return `<span class="fs fs-${esc(v.$s)}" title="${esc(v.note || FIELD_STATUS_LABEL[v.$s])}">${esc(FIELD_STATUS_LABEL[v.$s] || v.$s)}${v.note ? " · " + esc(trunc(v.note, 40)) : ""}</span>`;
  if (v === "" || v === null || v === undefined || (Array.isArray(v) && !v.length)) return `<span class="empty" title="Empty — not yet entered">—</span>`;
  if (Array.isArray(v)) return v.map(esc).join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (opts && opts.url && /^https?:\/\//.test(v)) return `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(trunc(v, 60))}</a>`;
  return esc(v);
}

function byId(entity, id) { return (W()[entity] || []).find(r => r.id === id) || null; }
function findAny(id) { for (const k of ENTITY_KEYS) { const r = (W()[k] || []).find(x => x.id === id); if (r) return { entity: k, rec: r }; } return null; }
function titleOf(entity, rec) { if (!rec) return ""; const t = rec[ENTITIES[entity].title]; return isStat(t) ? rec.id : String(t || rec.id); }
function refLabel(entity, id) { const r = byId(entity, id); return r ? trunc(titleOf(entity, r), 48) : id + " (missing)"; }
function chip(entity, id) { if (!id) return ""; const r = byId(entity, id); return `<button class="chip ${r ? "" : "chip-bad"}" data-act="open" data-e="${entity}" data-id="${esc(id)}" title="${esc(id)}">${esc(r ? trunc(titleOf(entity, r), 34) : id + " (missing)")}</button>`; }
function chips(entity, ids) { return (ids || []).length ? (ids || []).map(i => chip(entity, i)).join(" ") : `<span class="empty">—</span>`; }
function pill(text, cls, tip) { return `<span class="pill ${cls || ""}"${tip ? ` title="${esc(tip)}"` : ""}>${esc(text)}</span>`; }
function tip(text) { return `<span class="tip" tabindex="0" title="${esc(text)}" aria-label="${esc(text)}">i</span>`; }

function scopeCompany() { return W().settings.selected_company || ""; }
function inScope(r) { const c = scopeCompany(); return !c || !r.company_id || r.company_id === c; }
function scoped(entity) { return (W()[entity] || []).filter(r => { const c = scopeCompany(); return !c || r.company_id === c; }); }
function issuesInScope() { return scoped("issues"); }
function elementsOf(issueId) { return W().elements.filter(e => e.issue_id === issueId); }

function newId(entity) {
  const ws = W(); const pre = (App.kind === "demo" ? "DEMO-" : "") + ENTITIES[entity].prefix + "-";
  const ids = new Set(ENTITY_KEYS.flatMap(k => ws[k].map(r => r.id)));
  let n = ws[entity].length + 1; let id;
  do { id = pre + String(n).padStart(4, "0"); n++; } while (ids.has(id));
  return id;
}

/* ---------- status classes ---------- */
const STATUS_CLASS = {
  "Supported by verified evidence": "ok", "Supported by reasonable inference": "ok2", "Contested": "warn", "Unsupported": "bad", "Not established from available sources": "bad",
  "Not applicable": "mute", "Unassessed": "mute",
  verified_from_source: "ok", partially_accessed: "warn", secondary_report_only: "warn", not_accessed: "bad", conflict_unresolved: "bad",
  strong: "ok", moderate: "ok2", weak: "warn", unassessed: "mute",
  Severe: "bad", High: "bad2", Moderate: "warn", Low: "ok2", Unknown: "mute",
  good_law_citator_checked: "ok", in_force_status_checked: "ok2", verification_pending: "warn", negative_treatment_reported: "bad", superseded: "bad", abrogated_or_overruled: "bad",
  vacated: "bad", stayed: "bad", rescinded: "bad", proposed_not_final: "mute",
  open: "warn", in_progress: "ok2", blocked: "bad", done: "ok", critical: "bad", high: "bad2", normal: "mute", low: "mute",
  pending: "warn", provided: "ok", not_specified_by_professor: "mute", final: "ok", revised: "ok2", drafted: "ok2", outlined: "warn", not_started: "mute",
  pass: "ok", fail: "bad", not_applicable: "mute"
};
function stPill(v, tipText) { return pill(String(v || "—").replace(/_/g, " "), STATUS_CLASS[v] || "mute", tipText); }

/* ---------- mutation & logging ---------- */
function mutate(entities, fn, opts) {
  const ws = W(); fn(ws); ws.meta.updated = nowIso();
  if (App.ready) Store.schedule(App.kind, ws, entities);
  if (!opts || !opts.noRender) render();
}
function logVerification(ws, entity, id, field, from, to, note) {
  if (from === to) return;
  const pre = (App.kind === "demo" ? "DEMO-" : "") + "VLOG-";
  ws.verification_log.unshift({ id: pre + Date.now().toString(36) + Math.floor(Math.random() * 1000), at: nowIso(), record_type: entity, record_id: id, action: field, from: String(from || ""), to: String(to || ""), note: note || "" });
}
const LOGGED_FIELDS = { evidence: ["verification_status", "evidentiary_strength"], elements: ["status"], authorities: ["current_validity", "holding_source"], documents: ["review_status"] };

function setField(entity, id, key, value) {
  mutate([entity, "verification_log"], ws => {
    const r = ws[entity].find(x => x.id === id); if (!r) return;
    if ((LOGGED_FIELDS[entity] || []).includes(key)) logVerification(ws, entity, id, key, r[key], value);
    r[key] = value;
  });
}

function toast(msg, kind) { App.ui.toast = { msg, kind: kind || "info", t: Date.now() }; renderToast(); clearTimeout(App._tt); App._tt = setTimeout(() => { App.ui.toast = null; renderToast(); }, 4200); }
function renderToast() { const el = document.getElementById("toast"); if (!el) return; const t = App.ui.toast; el.className = "toast" + (t ? " show " + t.kind : ""); el.textContent = t ? t.msg : ""; }

/* ---------- generic sortable table ---------- */
function sortKey(v) { if (isStat(v)) return "￿" + v.$s; if (Array.isArray(v)) return v.length; if (v === "" || v === null || v === undefined) return "￿"; return typeof v === "number" ? v : String(v).toLowerCase(); }
function cmp(a, b) { if (typeof a === "number" && typeof b === "number") return a - b; return String(a).localeCompare(String(b), undefined, { numeric: true }); }

function dataTable(tid, rows, cols, o) {
  o = o || {};
  const st = App.ui.sort[tid];
  if (st) { const c = cols.find(c => c.k === st.k); if (c) { const f = c.s || (r => sortKey(r[c.k])); rows = rows.slice().sort((a, b) => cmp(f(a), f(b)) * st.d); } }
  const count = `<div class="tcount">${rows.length} record${rows.length === 1 ? "" : "s"}${o.countNote ? " · " + o.countNote : ""}</div>`;
  if (!rows.length) return count + `<div class="empty-state">${o.empty || "No records match."}</div>`;
  const head = (o.expand ? `<th class="xcol" aria-label="Expand"></th>` : "") + cols.map(c => {
    const on = st && st.k === c.k; const arrow = on ? (st.d === 1 ? "▲" : "▼") : "↕";
    return c.nosort ? `<th>${esc(c.label)}${c.tip ? tip(c.tip) : ""}</th>` :
      `<th class="sortable${on ? " sorted" : ""}" data-act="sort" data-t="${tid}" data-k="${c.k}" tabindex="0" title="Sort by ${esc(c.label)}">${esc(c.label)}${c.tip ? tip(c.tip) : ""} <span class="arr">${arrow}</span></th>`;
  }).join("");
  const body = rows.map(r => {
    const ex = o.expand && App.ui.expanded[tid + ":" + r.id];
    const tr = `<tr class="${o.rowCls ? o.rowCls(r) : ""}${o.entity ? " clickable" : ""}" ${o.entity ? `data-act="open" data-e="${o.entity}" data-id="${esc(r.id)}"` : ""}>` +
      (o.expand ? `<td class="xcol"><button class="xbtn" data-act="expand" data-t="${tid}" data-id="${esc(r.id)}" aria-expanded="${ex ? "true" : "false"}" title="${ex ? "Collapse" : "Expand"}">${ex ? "▾" : "▸"}</button></td>` : "") +
      cols.map(c => `<td class="${c.cls || ""}">${c.r ? c.r(r) : disp(r[c.k])}</td>`).join("") + `</tr>`;
    return tr + (ex ? `<tr class="exp-row"><td colspan="${cols.length + 1}">${o.expand(r)}</td></tr>` : "");
  }).join("");
  return count + `<div class="tablewrap"><table class="dt"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function searchBox(tid, ph) { return `<input class="search" type="search" id="search-${tid}" data-inp="search" data-t="${tid}" placeholder="${esc(ph || "Search…")}" value="${esc(App.ui.search[tid] || "")}" aria-label="Search">`; }
function matchSearch(tid, r) { const q = (App.ui.search[tid] || "").trim().toLowerCase(); if (!q) return true; return JSON.stringify(r).toLowerCase().includes(q); }
function filterSel(tid, key, label, options, labels) {
  const v = (App.ui.filters[tid] || {})[key] || "";
  return `<label class="flt"><span>${esc(label)}</span><select id="flt-${tid}-${key}" data-chg="filter" data-t="${tid}" data-k="${key}"><option value="">All</option>${options.map((o, i) => `<option value="${esc(o)}"${o === v ? " selected" : ""}>${esc(labels ? labels[i] : String(o).replace(/_/g, " "))}</option>`).join("")}</select></label>`;
}
function filterChk(tid, key, label) { const v = (App.ui.filters[tid] || {})[key]; return `<label class="chk"><input type="checkbox" id="chk-${tid}-${key}" data-chg="filterchk" data-t="${tid}" data-k="${key}"${v ? " checked" : ""}> ${esc(label)}</label>`; }
function fval(tid, key) { return (App.ui.filters[tid] || {})[key] || ""; }

function selectHtml(id, options, value, attrs, labels) {
  return `<select id="${id}" ${attrs || ""}>${options.map((o, i) => `<option value="${esc(o)}"${String(o) === String(value) ? " selected" : ""}>${esc(labels ? labels[i] : String(o).replace(/_/g, " "))}</option>`).join("")}</select>`;
}

/* ---------- generic drawer (detail + edit) ---------- */
function openDrawer(entity, id, mode) { App.ui.drawer = { entity, id, mode: mode || "view" }; render(); }
function backlinks(id) {
  const out = [];
  ENTITY_KEYS.forEach(k => W()[k].forEach(r => ENTITIES[k].fields.forEach(f => {
    if ((f[2] === "ref" || f[2] === "refs") && r[f[0]] && (Array.isArray(r[f[0]]) ? r[f[0]].includes(id) : r[f[0]] === id) && r.id !== id) out.push([k, r.id, f[1]]);
  })));
  return out;
}

function drawerHtml() {
  const d = App.ui.drawer; if (!d) return "";
  const def = ENTITIES[d.entity];
  const rec = d.mode === "new" ? d.draft : byId(d.entity, d.id);
  if (!rec) return `<aside class="drawer" role="dialog" aria-label="Record"><div class="dhead"><h2>Record not found</h2><button class="btn" data-act="closeDrawer">Close</button></div><p class="pad">The record ${esc(d.id)} no longer exists.</p></aside>`;
  const demo = String(rec.id || "").startsWith("DEMO-");
  let body;
  if (d.mode === "view") {
    body = `<dl class="kv">` + def.fields.map(f => {
      const [k, label, type, o] = f; let v = rec[k];
      let html = type === "ref" ? (v ? (isStat(v) ? disp(v) : chip(o.ref, v)) : disp(v)) : type === "refs" ? chips(o.ref, v) : type === "url" ? disp(v, { url: true }) : type === "textarea" && has(v) ? `<div class="pre">${esc(v)}</div>` : disp(v);
      if (type === "select" && has(v)) html = stPill(v);
      return `<dt>${esc(label)}</dt><dd>${html}</dd>`;
    }).join("") + `</dl>` + extraDetail(d.entity, rec);
    const bl = backlinks(rec.id);
    body += `<h3 class="sub">Linked from</h3>` + (bl.length ? `<ul class="links">${bl.map(b => `<li>${chip(b[0], b[1])} <span class="muted">${esc(ENTITIES[b[0]].label)} · ${esc(b[2])}</span></li>`).join("")}</ul>` : `<p class="muted">No other record links here.</p>`);
  } else {
    body = `<form id="drawer-form" data-sub="saveDrawer" novalidate>` + def.fields.map(f => formField(f, rec[f[0]], d.entity)).join("") +
      `<div class="formbar"><button type="submit" class="btn primary" id="drawer-save">Save</button><button type="button" class="btn" data-act="${d.mode === "new" ? "closeDrawer" : "viewDrawer"}">Cancel</button></div><div id="form-errors" class="errors" role="alert"></div></form>`;
  }
  return `<aside class="drawer" role="dialog" aria-label="${esc(def.label)} record">
    <div class="dhead"><div><div class="eyebrow">${esc(def.label)} · ${esc(rec.id || "new")}${demo ? " · FICTIONAL" : ""}</div><h2>${esc(trunc(titleOf(d.entity, rec) || "New record", 90))}</h2></div>
    <div class="dact">${d.mode === "view" ? `<button class="btn" data-act="editDrawer">Edit</button><button class="btn danger" data-act="askDelete" data-e="${d.entity}" data-id="${esc(rec.id)}">Delete</button>` : ""}<button class="btn" data-act="closeDrawer" aria-label="Close panel">Close</button></div></div>
    <div class="dbody">${body}</div></aside>`;
}

function extraDetail(entity, rec) {
  if (entity === "evidence") { const c = evidenceCitation(rec); return `<h3 class="sub">Citation readiness</h3><p>${c.ready ? pill("Citation-ready", "ok") : pill("Not citation-ready", "warn")} ${c.missing.map(m => `<span class="muted">· ${esc(m)}</span>`).join(" ")}</p>`; }
  if (entity === "authorities") { const c = authorityCitation(rec); return `<h3 class="sub">Citation readiness</h3><p>${c.ready ? pill("Citation-ready", "ok") : pill("Not citation-ready", "warn")} ${c.missing.map(m => `<span class="muted">· ${esc(m)}</span>`).join(" ")}</p>`; }
  if (entity === "issues") { const ev = issueEvidenceClass(rec); return `<h3 class="sub">Dimensions</h3><p>B ${stPill(rec.severity)} · C ${pill(ev.label, ev.cls)} · D ${pill(litViability(rec).label, litViability(rec).cls)}</p>`; }
  return "";
}

function formField(f, v, entity) {
  const [k, label, type, o] = f; const id = "f_" + k; const st = isStat(v) ? v.$s : "value"; const note = isStat(v) ? (v.note || "") : "";
  const disabled = st !== "value" ? " data-statused=\"1\"" : "";
  let input;
  const val = isStat(v) ? "" : (v === undefined || v === null ? "" : v);
  if (type === "textarea") input = `<textarea id="${id}" name="${k}" rows="3"${disabled}>${esc(val)}</textarea>`;
  else if (type === "select") { const opts = ENUM[o.e] || []; input = selectHtml(id, [""].concat(opts), val, `name="${k}"`, [""].concat(opts.map(x => (o.e === "_templates" ? x + " — " + TEMPLATES[x].name : String(x).replace(/_/g, " "))))); }
  else if (type === "bool") input = `<select id="${id}" name="${k}"><option value="false"${val !== true ? " selected" : ""}>No</option><option value="true"${val === true ? " selected" : ""}>Yes</option></select>`;
  else if (type === "ref") { const rows = W()[o.ref]; input = selectHtml(id, [""].concat(rows.map(r => r.id)), val, `name="${k}"`, ["— none —"].concat(rows.map(r => r.id + " · " + trunc(titleOf(o.ref, r), 50)))); }
  else if (type === "refs") { const rows = W()[o.ref]; const sel = Array.isArray(val) ? val : []; input = `<select id="${id}" name="${k}" multiple size="${Math.min(8, Math.max(3, rows.length))}">${rows.map(r => `<option value="${esc(r.id)}"${sel.includes(r.id) ? " selected" : ""}>${esc(r.id + " · " + trunc(titleOf(o.ref, r), 60))}</option>`).join("")}</select><div class="hint">Ctrl/Cmd-click to select several.</div>`; }
  else if (type === "number") input = `<input id="${id}" name="${k}" type="number" step="any" value="${esc(val)}">`;
  else if (type === "date") input = `<input id="${id}" name="${k}" type="date" value="${esc(val)}" pattern="\\d{4}-\\d{2}-\\d{2}">`;
  else input = `<input id="${id}" name="${k}" type="${type === "url" ? "url" : "text"}" value="${esc(val)}">`;
  const stSel = o.status ? `<div class="fsrow"><label for="fs_${k}" class="muted small">Field state</label>${selectHtml("fs_" + k, ENUM.fieldStatus, st, `name="fs_${k}"`, ENUM.fieldStatus.map(s => FIELD_STATUS_LABEL[s]))}<input id="fn_${k}" name="fn_${k}" placeholder="Note (why missing, disputed…)" value="${esc(note)}"></div>` : "";
  return `<div class="ff"><label for="${id}">${esc(label)}${o.req ? ' <span class="req" title="Required">*</span>' : ""}</label>${input}${stSel}</div>`;
}

function readForm(entity) {
  const def = ENTITIES[entity]; const out = {}; const errors = [];
  def.fields.forEach(f => {
    const [k, label, type, o] = f; const el = document.getElementById("f_" + k); if (!el) return;
    let v;
    if (type === "refs") v = Array.from(el.selectedOptions).map(x => x.value);
    else if (type === "bool") v = el.value === "true";
    else if (type === "number") v = el.value === "" ? "" : Number(el.value);
    else v = el.value.trim();
    if (type === "date" && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push(label + ": use YYYY-MM-DD.");
    const fs = document.getElementById("fs_" + k);
    if (fs && fs.value !== "value") v = { $s: fs.value, note: (document.getElementById("fn_" + k).value || "").trim() };
    if (o.req && !has(v) && !isStat(v)) errors.push(label + " is required.");
    out[k] = v;
  });
  return { rec: out, errors };
}

function saveDrawer() {
  const d = App.ui.drawer; if (!d) return;
  const { rec, errors } = readForm(d.entity);
  if (errors.length) { const el = document.getElementById("form-errors"); if (el) el.innerHTML = errors.map(esc).join("<br>"); return; }
  mutate([d.entity, "verification_log"], ws => {
    if (d.mode === "new") { const id = d.draft.id; ws[d.entity].push(Object.assign({ id }, rec)); App.ui.drawer = { entity: d.entity, id, mode: "view" }; afterCreate(ws, d.entity, Object.assign({ id }, rec)); }
    else { const r = ws[d.entity].find(x => x.id === d.id); (LOGGED_FIELDS[d.entity] || []).forEach(k => { if (k in rec) logVerification(ws, d.entity, d.id, k, r[k], rec[k]); }); Object.assign(r, rec); App.ui.drawer.mode = "view"; }
  });
  toast("Saved.", "ok");
}
function afterCreate(ws, entity, rec) {
  if (entity === "issues" && rec.template && TEMPLATES[rec.template]) {
    const tpl = TEMPLATES[rec.template];
    if (!has(rec.private_right) || rec.private_right === "Unknown") ws.issues.find(i => i.id === rec.id).private_right = tpl.private_right;
    tpl.els.forEach(e => ws.elements.push({ id: uniqueId(ws, "elements"), issue_id: rec.id, code: e[0], label: e[1], essential: e[2], status: "Unassessed", evidence_ids: [], analysis: "", counter: "" }));
  }
}
function uniqueId(ws, entity) { const pre = (App.kind === "demo" ? "DEMO-" : "") + ENTITIES[entity].prefix + "-"; const ids = new Set(ws[entity].map(r => r.id)); let n = ws[entity].length + 1, id; do { id = pre + String(n++).padStart(4, "0"); } while (ids.has(id)); return id; }

function newRecord(entity, preset) {
  const id = newId(entity);
  const draft = Object.assign({ id }, preset || {});
  if (!("company_id" in draft) && ENTITIES[entity].fields.some(f => f[0] === "company_id") && scopeCompany()) draft.company_id = scopeCompany();
  App.ui.drawer = { entity, id, mode: "new", draft }; render();
}

function deleteRecord(entity, id) {
  mutate(ENTITY_KEYS, ws => {
    ws[entity] = ws[entity].filter(r => r.id !== id);
    if (entity === "issues") ws.elements = ws.elements.filter(e => e.issue_id !== id);
    ENTITY_KEYS.forEach(k => ws[k].forEach(r => ENTITIES[k].fields.forEach(f => {
      if (f[2] === "refs" && Array.isArray(r[f[0]])) r[f[0]] = r[f[0]].filter(x => x !== id);
      if (f[2] === "ref" && r[f[0]] === id) r[f[0]] = "";
    })));
    if (ws.settings.selected_company === id) ws.settings.selected_company = "";
    App.ui.drawer = null;
  });
  toast("Deleted " + id + " and removed links to it.", "ok");
}

/* ---------- scoring dimensions ---------- */
function selectionScore(co) {
  const w = W().settings.weights; const total = CRITERIA.reduce((s, c) => s + (Number(w[c[0]]) || 0), 0);
  let known = 0, acc = 0; const details = [];
  CRITERIA.forEach(c => {
    const key = c[0]; const wt = Number(w[key]) || 0; const s = (co.scores || {})[key] || {};
    const score = s.score === null || s.score === undefined || s.score === "" ? null : Number(s.score);
    let state = "unknown";
    if (score !== null && (s.evidence_ids || []).length) { state = "counted"; known += wt; acc += wt * score / 5; }
    else if (score !== null) state = "unsupported";
    details.push({ key, label: c[1], weight: wt, score, state, evidence: s.evidence_ids || [], note: s.note || "" });
  });
  const coverage = total ? known / total : 0;
  return { score: known ? Math.round(100 * acc / known) : null, coverage: Math.round(coverage * 100), details, sufficient: coverage >= 0.5 };
}

const EV_LEVELS = ["Unknown", "Gaps", "Contested", "Partial", "Supported"];
function issueEvidenceClass(issue) {
  const els = elementsOf(issue.id); const ess = els.filter(e => e.essential);
  const counts = {}; ENUM.elementStatus.forEach(s => counts[s] = 0); els.forEach(e => counts[e.status || "Unassessed"]++);
  if (!els.length) return { label: "No elements", level: 0, cls: "mute", counts };
  if (els.every(e => (e.status || "Unassessed") === "Unassessed")) return { label: "Unknown", level: 0, cls: "mute", counts };
  const gaps = ess.filter(e => ["Unsupported", "Not established from available sources"].includes(e.status)).length;
  if (gaps) return { label: `Gaps (${gaps} essential)`, level: 1, cls: "bad", counts };
  if (ess.some(e => e.status === "Contested")) return { label: "Contested", level: 2, cls: "warn", counts };
  if (ess.some(e => !e.status || e.status === "Unassessed")) return { label: "Partially assessed", level: 3, cls: "ok2", counts };
  return { label: "Elements supported", level: 4, cls: "ok", counts };
}
function litViability(issue) {
  const pr = issue.private_right;
  if (pr && pr.indexOf("None") === 0) return { label: "N/A — no private right", cls: "mute", why: "Only the SEC/DOJ can enforce this provision; see regulatory exposure instead." };
  if (!pr || pr === "Unknown") return { label: "Unknown", cls: "mute", why: "Private cause of action not yet determined." };
  const ev = issueEvidenceClass(issue);
  const risk = W().claims.filter(c => c.issue_id === issue.id && c.kind === "claim").map(c => c.pleading_risk);
  const high = risk.includes("High");
  const map = { 0: ["Unknown", "mute"], 1: ["Weak", "bad"], 2: ["Contested", "warn"], 3: ["Incomplete", "ok2"], 4: ["Plausible at pleading stage", "ok"] };
  let [label, cls] = map[ev.level];
  if (high && ev.level >= 2) { label += " · high pleading risk"; cls = "warn"; }
  return { label, cls, why: "Derived from essential-element status (" + ev.label + ")" + (high ? " and a claim marked high pleading risk." : ".") + (pr === "Limited" ? " Private right is limited." : "") };
}
function completeness(companyId) {
  const ws = W(); const f = r => !companyId || r.company_id === companyId;
  const ev = ws.evidence.filter(f); const iss = ws.issues.filter(f); const ids = new Set(iss.map(i => i.id));
  const els = ws.elements.filter(e => ids.has(e.issue_id)); const tasks = ws.tasks.filter(t => !companyId || t.company_id === companyId);
  const comps = [
    ["Evidence verified from source", ev.filter(e => e.verification_status === "verified_from_source").length, ev.length],
    ["Elements assessed", els.filter(e => e.status && e.status !== "Unassessed").length, els.length],
    ["Issues with a preliminary conclusion", iss.filter(i => has(i.conclusion)).length, iss.length],
    ["Research tasks done", tasks.filter(t => t.status === "done").length, tasks.length]
  ].map(c => ({ label: c[0], done: c[1], total: c[2], p: pct(c[1], c[2]) }));
  const known = comps.filter(c => c.p !== null);
  return { comps, score: known.length ? Math.round(known.reduce((s, c) => s + c.p, 0) / known.length) : null };
}

function evidenceCitation(e) {
  const missing = [];
  if (e.verification_status !== "verified_from_source") missing.push("source not verified");
  if (!has(e.pinpoint)) missing.push("no pinpoint");
  if (!(has(e.url) || has(e.document_id) || (isStat(e.url) && e.url.$s === "not_applicable" && has(e.document_id)))) missing.push("no URL or source document");
  if (["third_party_allegation", "analytical_hypothesis", "unknown"].includes(e.proposition_class)) missing.push("not a citable fact (" + String(e.proposition_class).replace(/_/g, " ") + ")");
  return { ready: !missing.length, missing };
}
function authorityCitation(a) {
  const missing = [];
  if (!["good_law_citator_checked", "in_force_status_checked"].includes(a.current_validity)) missing.push("validity: " + String(a.current_validity || "unknown").replace(/_/g, " "));
  if (!["opinion_text_verified", "statute_text_verified"].includes(a.holding_source)) missing.push("holding from " + String(a.holding_source || "unknown").replace(/_/g, " "));
  if (["sec_proposed_rule", "sec_complaint"].includes(a.authority_type)) missing.push("not law (" + a.authority_type.replace(/_/g, " ") + ")");
  return { ready: !missing.length, missing };
}

/* ---------- audit engine ---------- */
function runAudit() {
  const ws = W(); const out = [];
  const add = (cat, entity, id, msg) => out.push({ cat, entity, id, msg });
  const sc = scopeCompany(); const inC = r => !sc || !r.company_id || r.company_id === sc;
  const issues = ws.issues.filter(inC); const issueIds = new Set(issues.map(i => i.id));
  issues.forEach(i => {
    const els = elementsOf(i.id);
    if (has(i.conclusion) && !els.some(e => (e.evidence_ids || []).length)) add("Unsupported conclusions", "issues", i.id, "Conclusion stated but no element cites evidence.");
    if (i.conclusion_confidence === "High" && issueEvidenceClass(i).level <= 2) add("Unsupported conclusions", "issues", i.id, "High confidence while an essential element is contested or unsupported.");
    if (!els.length) add("Missing legal elements", "issues", i.id, "Issue has no elements.");
    els.filter(e => e.essential && (!e.status || e.status === "Unassessed")).forEach(e => add("Missing legal elements", "elements", e.id, "Essential element unassessed: " + e.label));
    if (!has(i.conclusion)) add("Incomplete analysis", "issues", i.id, "No preliminary conclusion.");
  });
  ws.elements.filter(e => issueIds.has(e.issue_id)).forEach(e => {
    if (String(e.status).indexOf("Supported") === 0 && !(e.evidence_ids || []).length) add("Unsupported conclusions", "elements", e.id, "Marked '" + e.status + "' with no linked evidence.");
    if (e.status === "Supported by verified evidence" && (e.evidence_ids || []).length && !(e.evidence_ids || []).some(id => { const ev = byId("evidence", id); return ev && ev.verification_status === "verified_from_source"; }))
      add("Unsupported conclusions", "elements", e.id, "Marked verified, but none of its evidence is verified from source.");
  });
  ws.evidence.filter(inC).forEach(e => {
    if (!has(e.url) && !has(e.document_id) && !["analytical_hypothesis", "unknown"].includes(e.proposition_class)) add("Missing sources", "evidence", e.id, "No URL or source document.");
    if (e.proposition_class === "verified_fact" && e.verification_status !== "verified_from_source") add("Integrity rule violations", "evidence", e.id, "R1: verified fact but source not verified.");
    if (e.proposition_class === "verified_fact" && !has(e.pinpoint)) add("Integrity rule violations", "evidence", e.id, "R1: verified fact without pinpoint.");
    if (["not_accessed", "secondary_report_only"].includes(e.verification_status) && (e.confidence === "high" || e.evidentiary_strength === "strong")) add("Integrity rule violations", "evidence", e.id, "R2: unaccessed source rated high/strong.");
    if (["sec_enforcement_complaint", "court_pleading", "analyst_or_short_report"].includes(e.source_type) && e.proposition_class === "verified_fact" && e.proposition_scope !== "that_statement_was_made") add("Integrity rule violations", "evidence", e.id, "R3: allegation source used as proof of the truth of the matter.");
    if ((e.conflicts_with || []).length || e.proposition_class === "disputed" || e.verification_status === "conflict_unresolved") add("Conflicting evidence", "evidence", e.id, "Conflict: " + ((e.conflicts_with || []).join(", ") || "marked disputed/unresolved"));
    (e.conflicts_with || []).forEach(c => { const o = byId("evidence", c); if (o && !(o.conflicts_with || []).includes(e.id)) add("Conflicting evidence", "evidence", e.id, "Conflict with " + c + " is not recorded on both records."); });
    if ((App.kind === "real") && String(e.id).startsWith("DEMO-")) add("Integrity rule violations", "evidence", e.id, "Demonstration record inside the Real workspace.");
  });
  ws.documents.filter(inC).forEach(d => { if (!has(d.url) && !has(d.accession) && !(isStat(d.url) && d.url.$s === "not_applicable")) add("Missing sources", "documents", d.id, "Document has no URL or accession number."); });
  const used = new Set(); issues.forEach(i => (i.authority_ids || []).forEach(a => used.add(a))); ws.sections.forEach(s => (s.authority_ids || []).forEach(a => used.add(a))); ws.doctrines.forEach(d => (d.case_ids || []).forEach(a => used.add(a)));
  used.forEach(aid => {
    const a = byId("authorities", aid); if (!a) { add("Missing sources", "authorities", aid, "Referenced authority does not exist."); return; }
    const c = authorityCitation(a); if (!c.ready) add("Unverified citations", "authorities", aid, c.missing.join("; "));
  });
  ws.authorities.forEach(a => {
    if (["negative_treatment_reported", "superseded", "abrogated_or_overruled", "vacated", "stayed", "rescinded"].includes(a.current_validity)) add("Stale authorities", "authorities", a.id, "Validity: " + a.current_validity.replace(/_/g, " ") + (used.has(a.id) ? " — and it is cited in your analysis." : "."));
    else if (has(a.verified_date) && (Date.now() - new Date(a.verified_date).getTime()) / 86400000 > 30) add("Stale authorities", "authorities", a.id, "Last verified " + a.verified_date + " (over 30 days ago) — re-check before submission.");
  });
  ws.sections.forEach(s => {
    if (s.status !== "final") add("Incomplete analysis", "sections", s.id, "Section status: " + String(s.status || "not started").replace(/_/g, " ") + ".");
    if (!(s.issue_ids || []).length && !/intro/i.test(s.title || "")) add("Incomplete analysis", "sections", s.id, "Section covers no issue.");
  });
  ws.fin_obs.filter(inC).forEach(f => { if (f.data_status !== "demo_fictional" && !has(f.evidence_id)) add("Unsourced numbers", "fin_obs", f.id, "Financial value without source evidence."); });
  const mk = ws.mkt_obs.filter(inC).filter(m => m.data_status !== "demo_fictional" && !has(m.evidence_id) && !has(m.source));
  if (mk.length) add("Unsourced numbers", "mkt_obs", mk[0].id, mk.length + " market observation(s) without a stated source.");
  return out;
}
const AUDIT_CATS = ["Unsupported conclusions", "Missing sources", "Unverified citations", "Conflicting evidence", "Missing legal elements", "Stale authorities", "Incomplete analysis", "Unsourced numbers", "Integrity rule violations"];

/* ---------- import / export ---------- */
function exportJson() { const ws = W(); return JSON.stringify(Object.assign({ export_note: ws.meta.kind === "demo" ? "FICTIONAL DEMONSTRATION DATA" : "Real research workspace", exported_at: nowIso() }, ws), null, 2); }

function csvEscape(v) { const s = String(v === null || v === undefined ? "" : v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function cellOut(v) { if (isStat(v)) return "[" + v.$s + "]" + (v.note ? " " + v.note : ""); if (Array.isArray(v)) return v.join("; "); if (typeof v === "boolean") return v ? "true" : "false"; return v === null || v === undefined ? "" : v; }
function exportCsv(entity) {
  const cols = ["id"].concat(ENTITIES[entity].fields.map(f => f[0])).concat(entity === "companies" ? ["scores_json"] : []);
  const lines = [cols.join(",")];
  W()[entity].forEach(r => lines.push(cols.map(c => csvEscape(c === "scores_json" ? JSON.stringify(r.scores || {}) : cellOut(r[c]))).join(",")));
  return lines.join("\n");
}
function parseCsv(text) {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
    else cur += ch;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r[0] || "").trim() !== "");
}
function csvToRecords(entity, text) {
  const rows = parseCsv(text); if (!rows.length) return { records: [], errors: ["The CSV file is empty."] };
  const head = rows[0].map(h => h.trim()); const errors = [];
  if (!head.includes("id")) errors.push("CSV needs an 'id' column.");
  const defs = Object.fromEntries(ENTITIES[entity].fields.map(f => [f[0], f]));
  const unknown = head.filter(h => h !== "id" && h !== "scores_json" && !defs[h]); if (unknown.length) errors.push("Unknown columns ignored: " + unknown.join(", "));
  const records = rows.slice(1).map((r, n) => {
    const o = {}; head.forEach((h, i) => {
      let v = (r[i] || "").trim(); if (h === "id") { o.id = v; return; }
      if (h === "scores_json") { try { o.scores = v ? JSON.parse(v) : {}; } catch (e) { errors.push("Row " + (n + 2) + ": scores_json is not valid JSON."); } return; }
      const f = defs[h]; if (!f) return; const type = f[2];
      const m = v.match(/^\[(missing|unavailable|disputed|not_applicable)\]\s?(.*)$/);
      if (m) { o[h] = { $s: m[1], note: m[2] || "" }; return; }
      if (type === "refs") o[h] = v ? v.split(";").map(x => x.trim()).filter(Boolean) : [];
      else if (type === "bool") o[h] = /^(true|yes|1)$/i.test(v);
      else if (type === "number") o[h] = v === "" ? "" : Number(v);
      else o[h] = v;
      if (type === "number" && v !== "" && isNaN(Number(v))) errors.push("Row " + (n + 2) + ": " + h + " is not a number (" + v + ").");
      if (type === "date" && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push("Row " + (n + 2) + ": " + h + " must be YYYY-MM-DD (" + v + ").");
    });
    if (!o.id) errors.push("Row " + (n + 2) + ": missing id.");
    return o;
  });
  return { records, errors };
}

/* Research-engine (v1.0 evidence / authority schema) files: {"evidence":[...]} or {"authorities":[...]} without schema_version. */
function legacyToWorkspace(obj) {
  const ws = { schema_version: SCHEMA_VERSION };
  if (Array.isArray(obj.evidence)) ws.evidence = obj.evidence.map(e => ({ id: e.evidence_id, company_id: e.company_id, proposition: e.proposition, proposition_class: e.proposition_class, proposition_scope: e.proposition_scope || "truth_of_matter",
    source_title: e.source_title, source_type: e.source_type, document_id: "", filing_or_document_date: e.filing_or_document_date || "", event_date: e.event_date || "", url: e.url || "", pinpoint: e.pinpoint || "",
    excerpt: e.excerpt || "", excerpt_type: e.excerpt_type || "none", verification_status: e.verification_status, accessed_date: e.accessed_date || "", accessed_by: e.accessed_by || "",
    supports_or_contradicts: e.supports_or_contradicts, evidentiary_strength: e.evidentiary_strength, strength_rationale: e.strength_rationale || "", issue_ids: [], element_ids: [],
    conflicts_with: e.conflicts_with || [], limitations: [e.limitations, (e.legal_issue_ids || []).length ? "Engine issue tags: " + e.legal_issue_ids.join(", ") : "", (e.element_ids || []).length ? "Engine element tags: " + e.element_ids.join(", ") : ""].filter(Boolean).join(" | "), confidence: e.confidence || "medium" }));
  if (Array.isArray(obj.authorities)) ws.authorities = obj.authorities.map(a => authorityFromLibrary(a, a.authority_id));
  return ws;
}
function authorityFromLibrary(a, id) {
  return { id, citation: a.citation, short_name: a.short_name, authority_type: a.authority_type, jurisdiction: a.jurisdiction, binding_force: a.binding_force, date_decided_or_effective: a.date_decided_or_effective || "",
    rule_or_holding: a.rule_or_holding, holding_source: a.holding_source, course_relation: a.course_relation || "course_not_yet_ingested", course_explanation: a.course_explanation || "", current_validity: a.current_validity,
    validity_basis: a.validity_basis || "", verification_method: a.verification_method || "", verified_date: a.verified_date || "", pinpoints: Array.isArray(a.pinpoints) ? a.pinpoints.join("; ") : (a.pinpoints || ""),
    issue_tags: (a.issue_ids || []).join(", "), source_url: a.source_url || "" };
}

function prepareImport(text, filename) {
  let obj; try { obj = JSON.parse(text); } catch (e) { return { errors: ["Not valid JSON: " + e.message] }; }
  let legacy = false;
  if (!obj.schema_version && (Array.isArray(obj.evidence) || Array.isArray(obj.authorities)) && (obj.evidence || obj.authorities || []).some(r => r.evidence_id || r.authority_id)) { obj = legacyToWorkspace(obj); legacy = true; }
  let mig; try { mig = migrate(JSON.parse(JSON.stringify(obj))); } catch (e) { return { errors: [e.message] }; }
  const v = validateWorkspace(mig.ws, App.kind);
  const counts = ENTITY_KEYS.map(k => [k, (mig.ws[k] || []).length]).filter(c => c[1]);
  return { ws: mig.ws, migrations: mig.log, legacy, errors: v.errors, warnings: v.warnings, counts, filename, partial: legacy || !obj.settings };
}
function applyImport(prev, mode) {
  mutate(ENTITY_KEYS, ws => {
    if (mode === "replace") {
      const incoming = prev.ws; incoming.meta.kind = App.kind; App.kinds[App.kind] = incoming;
      if (prev.partial) { const base = emptyWorkspace(App.kind); ["settings", "assignment"].forEach(k => incoming[k] = Object.assign(base[k], ws[k])); }
    } else {
      ENTITY_KEYS.forEach(k => { const ids = new Set(ws[k].map(r => r.id)); (prev.ws[k] || []).forEach(r => { if (!ids.has(r.id)) ws[k].push(r); }); });
    }
  });
  if (App.ready) Store.saveAll(App.kind);
  App.ui.importPreview = null; render();
  toast(mode === "replace" ? "Workspace replaced from file." : "Merged new records from file.", "ok");
}

async function offerFile(filename, text) {
  const r = await Store.download(filename, text);
  if (r.ok) { toast("Saved " + filename + ".", "ok"); return; }
  App.ui.modal = { type: "copy", title: "Copy " + filename, text, note: r.reason === "unavailable" ? "File downloads are not available in this view. Copy the text and save it as " + filename + "." : "The download was not completed (" + r.reason + "). You can copy the text instead." };
  render();
}
