/* SECURITIES INTELLIGENCE — module views, charts, event wiring, boot. */

/* ================= charts (SVG, theme tokens) ================= */
function niceRange(min, max) { if (min === max) { min -= 1; max += 1; } const pad = (max - min) * 0.08; return [min - pad, max + pad]; }
function lineChart(o) {
  const w = o.w || 760, h = o.h || 240, m = { l: 56, r: 16, t: 14, b: 30 };
  const all = o.series.flatMap(s => s.pts); if (!all.length) return `<div class="empty-state">No data points to chart.</div>`;
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]).filter(v => v !== null && !isNaN(v));
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]; const [y0, y1] = niceRange(Math.min(...ys), Math.max(...ys));
  const X = x => m.l + (x1 === x0 ? 0.5 : (x - x0) / (x1 - x0)) * (w - m.l - m.r); const Y = y => h - m.b - (y - y0) / (y1 - y0) * (h - m.t - m.b);
  let g = "";
  for (let i = 0; i <= 4; i++) { const v = y0 + (y1 - y0) * i / 4; g += `<line class="grid" x1="${m.l}" x2="${w - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="axis" x="${m.l - 6}" y="${Y(v) + 3}" text-anchor="end">${esc((o.yFmt || (v => v.toFixed(1)))(v))}</text>`; }
  const ticks = o.xTicks || uniq(o.series[0].pts.map(p => p[0])).filter((_, i, a) => a.length <= 6 || i % Math.ceil(a.length / 6) === 0);
  ticks.forEach(t => { g += `<text class="axis" x="${X(t)}" y="${h - 10}" text-anchor="middle">${esc(o.xFmt ? o.xFmt(t) : t)}</text>`; });
  (o.markers || []).forEach(mk => { if (mk.x < x0 || mk.x > x1) return; g += `<line class="marker ${mk.cls || ""}" x1="${X(mk.x)}" x2="${X(mk.x)}" y1="${m.t}" y2="${h - m.b}"><title>${esc(mk.label)}</title></line><circle class="mk-dot ${mk.cls || ""}" cx="${X(mk.x)}" cy="${m.t + 4}" r="4"><title>${esc(mk.label)}</title></circle>`; });
  o.series.forEach((s, si) => {
    const pts = s.pts.filter(p => p[1] !== null && !isNaN(p[1]));
    if (!pts.length) return;
    const d = pts.map((p, i) => (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1)).join(" ");
    if (si === 0 && o.area) g += `<path class="area s${si}" d="${d} L${X(pts[pts.length - 1][0]).toFixed(1)} ${h - m.b} L${X(pts[0][0]).toFixed(1)} ${h - m.b} Z"/>`;
    g += `<path class="line s${si}" d="${d}"><title>${esc(s.name)}</title></path>`;
    const last = pts[pts.length - 1]; g += `<circle class="end s${si}" cx="${X(last[0])}" cy="${Y(last[1])}" r="3.5"><title>${esc(s.name)}: ${esc((o.yFmt || (v => v))(last[1]))}</title></circle>`;
    if (o.dots) pts.forEach(p => { g += `<circle class="dot s${si}" cx="${X(p[0])}" cy="${Y(p[1])}" r="2.6"><title>${esc((o.xFmt ? o.xFmt(p[0]) : p[0]) + ": " + (o.yFmt || (v => v))(p[1]))}</title></circle>`; });
  });
  const legend = `<div class="legend">${o.series.map((s, i) => `<span><i class="sw s${i}"></i>${esc(s.name)}</span>`).join("")}${(o.markers || []).length ? `<span><i class="sw mk"></i>Events</span>` : ""}</div>`;
  return `<figure class="chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.label || "Chart")}">${g}</svg>${legend}</figure>`;
}
const dnum = s => new Date(s + "T00:00:00Z").getTime();
const dfmt = t => new Date(t).toISOString().slice(0, 10);
const dshort = t => { const d = new Date(t); return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()] + " " + d.getUTCDate() + (d.getUTCMonth() === 0 ? " '" + String(d.getUTCFullYear()).slice(2) : ""); };

function timelineChart(items, lanes, label) {
  items = items.filter(i => i.date && /^\d{4}-\d{2}-\d{2}$/.test(i.date));
  if (!items.length) return `<div class="empty-state">No dated items for this company yet.</div>`;
  const w = 860, laneH = 34, m = { l: 150, r: 20, t: 10, b: 28 }, h = m.t + m.b + lanes.length * laneH;
  const ts = items.map(i => dnum(i.date)); let t0 = Math.min(...ts), t1 = Math.max(...ts); if (t0 === t1) { t0 -= 86400000 * 15; t1 += 86400000 * 15; }
  const pad = (t1 - t0) * 0.04; t0 -= pad; t1 += pad;
  const X = t => m.l + (t - t0) / (t1 - t0) * (w - m.l - m.r);
  let g = "";
  lanes.forEach((ln, i) => { const y = m.t + i * laneH + laneH / 2; g += `<line class="grid" x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}"/><text class="axis lane" x="${m.l - 10}" y="${y + 4}" text-anchor="end">${esc(ln[1])}</text>`; });
  for (let i = 0; i <= 5; i++) { const t = t0 + (t1 - t0) * i / 5; g += `<text class="axis" x="${X(t)}" y="${h - 8}" text-anchor="middle">${esc(dshort(t))}</text>`; }
  items.forEach(it => { const li = lanes.findIndex(l => l[0] === it.lane); if (li < 0) return; const y = m.t + li * laneH + laneH / 2;
    g += `<g class="tl-item ${it.cls || ""}" data-act="open" data-e="${it.entity}" data-id="${esc(it.id)}" tabindex="0" role="button" aria-label="${esc(it.date + " " + it.label)}"><circle cx="${X(dnum(it.date))}" cy="${y}" r="6"/><title>${esc(it.date + " — " + it.label)}</title></g>`; });
  return `<figure class="chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label || "Timeline")}">${g}</svg><figcaption class="muted small">Select a point to open its record.</figcaption></figure>`;
}

function statusBar(counts) {
  const order = ["Supported by verified evidence", "Supported by reasonable inference", "Contested", "Unsupported", "Not established from available sources", "Not applicable", "Unassessed"];
  const total = order.reduce((s, k) => s + (counts[k] || 0), 0); if (!total) return `<span class="empty">—</span>`;
  return `<div class="sbar" role="img" aria-label="Element status distribution">${order.filter(k => counts[k]).map(k => `<span class="seg ${STATUS_CLASS[k]}" style="flex:${counts[k]}" title="${esc(k)}: ${counts[k]}"></span>`).join("")}</div>`;
}

function riskMatrix(issues) {
  const sev = ["Severe", "High", "Moderate", "Low", "Unknown"];
  const cells = {}; issues.forEach(i => { const k = (i.severity || "Unknown") + "|" + issueEvidenceClass(i).level; (cells[k] = cells[k] || []).push(i); });
  let html = `<div class="matrix" role="table" aria-label="Risk matrix"><div class="mx-corner">Severity ↓ / Evidence →</div>${EV_LEVELS.map(l => `<div class="mx-col">${esc(l)}</div>`).join("")}`;
  sev.forEach(s => { html += `<div class="mx-row">${esc(s)}</div>` + EV_LEVELS.map((_, li) => { const list = cells[s + "|" + li] || []; const heat = (["Severe", "High"].includes(s) && li >= 3) ? "hot" : (["Severe", "High"].includes(s) || li >= 3) ? "warm" : "";
    return `<div class="mx-cell ${list.length ? heat : "nil"}">${list.map(i => chip("issues", i.id)).join("")}</div>`; }).join(""); });
  return html + `</div><p class="muted small">Rows: B. legal risk severity (your classification). Columns: C. evidence strength derived from essential elements. A cell is a research priority, not a liability finding.</p>`;
}

function diffWords(a, b) {
  const A = String(a).split(/\s+/), B = String(b).split(/\s+/); const n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  let i = 0, j = 0, out = [];
  while (i < n && j < m) { if (A[i] === B[j]) { out.push(esc(A[i])); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) { out.push(`<del>${esc(A[i++])}</del>`); } else { out.push(`<ins>${esc(B[j++])}</ins>`); } }
  while (i < n) out.push(`<del>${esc(A[i++])}</del>`); while (j < m) out.push(`<ins>${esc(B[j++])}</ins>`);
  return out.join(" ");
}

/* ================= layout ================= */
function render() {
  const root = document.getElementById("app"); if (!root) return;
  const act = document.activeElement; const fid = act && act.id; const sel = act && typeof act.selectionStart === "number" ? [act.selectionStart, act.selectionEnd] : null;
  const scrollY = (document.getElementById("main") || {}).scrollTop || 0;
  let main;
  try { main = VIEWS[App.tab] ? VIEWS[App.tab]() : VIEWS.command(); }
  catch (e) { main = `<div class="errorbox"><h2>Something went wrong drawing this view</h2><p>${esc(e.message)}</p><p>Your data is unchanged. Try another module, or export a backup from Data &amp; Backup.</p></div>`; if (window.console) console.error(e); }
  root.innerHTML = header() + `<div class="shell"><nav class="nav" aria-label="Modules">${TABS.map(t => `<a href="#${t[0]}" class="navlink${App.tab === t[0] ? " on" : ""}" ${App.tab === t[0] ? 'aria-current="page"' : ""}><span class="navkey">${esc(t[2])}</span>${esc(t[1])}</a>`).join("")}</nav>
    <main id="main" class="main" tabindex="-1">${banners()}${main}</main></div>${drawerHtml()}${modalHtml()}<div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  renderToast();
  const mainEl = document.getElementById("main"); if (mainEl) mainEl.scrollTop = scrollY;
  if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); if (sel && typeof el.setSelectionRange === "function") { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* ignore */ } } } }
}

function header() {
  const ws = W(); const st = ws.settings.system_state;
  const cos = ws.companies;
  return `<header class="top">
    <div class="brand"><div class="logo" aria-hidden="true">SI</div><div><div class="bname">Securities Intelligence</div><div class="bsub">Research &amp; litigation analytics · not affiliated with the SEC</div></div></div>
    <div class="topctl">
      <div class="seg-toggle" role="group" aria-label="Workspace">${["real", "demo"].map(k => `<button class="${App.kind === k ? "on" : ""}" data-act="switchKind" data-k="${k}" aria-pressed="${App.kind === k}">${k === "real" ? "Real workspace" : "Demo (fictional)"}</button>`).join("")}</div>
      <label class="scope"><span>Company</span>${selectHtml("scope-select", [""].concat(cos.map(c => c.id)), ws.settings.selected_company, 'data-chg="scope"', ["All companies"].concat(cos.map(c => trunc(raw(c.name) || c.id, 34))))}</label>
      ${pill(st === "ACTIVATED" ? "ACTIVATED" : "PRE-EXAM", st === "ACTIVATED" ? "ok" : "warn", st === "ACTIVATED" ? "Formal assignment loaded" : "Formal assignment not yet provided")}
      <span id="persist" class="persist ${Store.mode}" title="Where your changes are saved">${esc(Store.status)}</span>
    </div></header>`;
}
function onStoreStatus() { const el = document.getElementById("persist"); if (el) { el.textContent = Store.status; el.className = "persist " + Store.mode; } }

function banners() {
  const ws = W(); let b = "";
  if (App.kind === "demo") b += `<div class="banner demo"><strong>Fictional demonstration data.</strong> Every company, filing, person, figure and price in this workspace is invented. Switch to <button class="linkbtn" data-act="switchKind" data-k="real">Real workspace</button> for actual research.</div>`;
  const ai = ws.assignment.ai_restrictions; if (ai && ai.status === "provided" && ai.value) b += `<div class="banner ai"><strong>Professor's AI-use restrictions:</strong> ${esc(trunc(ai.value, 300))}</div>`;
  if (ws.settings.system_state !== "ACTIVATED") b += `<div class="banner pend">Formal assignment requirements are <strong>pending</strong>. Scoring weights, page budget and perspectives are provisional until the exam is activated.</div>`;
  return b;
}

function pageHead(title, sub, actions) { return `<div class="phead"><div><h1>${esc(title)}</h1>${sub ? `<p class="lede">${sub}</p>` : ""}</div><div class="pact">${actions || ""}</div></div>`; }
function card(title, body, o) { o = o || {}; return `<section class="card ${o.cls || ""}"${o.id ? ` id="${o.id}"` : ""}>${title ? `<div class="chead"><h2>${esc(title)}${o.tip ? tip(o.tip) : ""}</h2>${o.actions || ""}</div>` : ""}<div class="cbody">${body}</div></section>`; }
function kpi(label, value, sub, cls, tipText) { return `<div class="kpi ${cls || ""}"><div class="klabel">${esc(label)}${tipText ? tip(tipText) : ""}</div><div class="kval">${value}</div>${sub ? `<div class="ksub">${sub}</div>` : ""}</div>`; }
function subTabs(group, items) { const cur = App.ui.sub[group]; return `<div class="subtabs" role="tablist">${items.map(i => `<button role="tab" class="${cur === i[0] ? "on" : ""}" aria-selected="${cur === i[0]}" data-act="sub" data-g="${group}" data-v="${i[0]}">${esc(i[1])}</button>`).join("")}</div>`; }
function companyName(id) { const c = byId("companies", id); return c ? raw(c.name) || c.id : (id ? id + " (missing)" : "—"); }
function needCompany(msg) { return `<div class="empty-state">${msg || "Choose a company in the header to use this module."} ${W().companies.length ? "" : `<button class="btn" data-act="new" data-e="companies">Add a company</button>`}</div>`; }

/* ================= A. Command Center ================= */
function viewCommand() {
  const ws = W(); const s = ws.settings;
  const cases = ws.authorities.filter(a => /opinion/.test(a.authority_type || ""));
  const assigned = ws.authorities.filter(a => a.course_relation === "assigned").length;
  const evv = ws.evidence.filter(e => e.verification_status === "verified_from_source").length;
  const req = ASSIGNMENT_FIELDS.filter(f => (ws.assignment[f[0]] || {}).status === "provided").length;
  const crit = ws.tasks.filter(t => t.priority === "critical" && t.status !== "done");
  const exp = s.course_docs_expected; const ing = Number(s.course_docs_ingested) || 0;
  const comp = completeness("");
  const ready = READINESS.map(r => {
    let v = null;
    if (r[1] === "course") v = exp ? (ing >= exp && ws.doctrines.length > 0) : null;
    if (r[1] === "screening") v = ws.companies.length > 0 && ws.companies.some(c => selectionScore(c).score !== null);
    if (r[1] === "elements") v = ws.elements.length > 0;
    if (r[1] === "demo") v = (App.kinds.demo && App.kinds.demo.companies.length > 0);
    if (r[1] === "assignment") v = true;
    if (r[1] === null) v = !!s.readiness_manual[r[0]];
    return { label: r[0], v, manual: r[1] === null };
  });
  const tiles = `<div class="kpis">
    ${kpi("System state", s.system_state === "ACTIVATED" ? "Activated" : "Pre-exam", s.system_state === "ACTIVATED" ? "Assignment loaded" : "Assignment pending", s.system_state === "ACTIVATED" ? "ok" : "warn")}
    ${kpi("Course ingestion", exp ? `${ing}<small>/${exp}</small>` : `${ing}<small>/?</small>`, exp ? fmtPct(pct(ing, exp)) + " of expected files" : "Expected file count unknown", exp && ing >= exp ? "ok" : "warn", "Count of course files indexed vs. expected. Set the numbers below.")}
    ${kpi("Doctrines indexed", ws.doctrines.length, ws.doctrines.filter(d => d.course_relation === "assigned" || d.course_relation === "mentioned_in_course").length + " tied to course")}
    ${kpi("Cases", cases.length, assigned + " authorities marked assigned")}
    ${kpi("Legal authorities", ws.authorities.length, ws.authorities.filter(a => authorityCitation(a).ready).length + " citation-ready")}
    ${kpi("Company records", ws.companies.length, ws.issues.length + " legal issues")}
    ${kpi("Evidence verified", fmtPct(pct(evv, ws.evidence.length)), evv + " of " + ws.evidence.length + " from source", pct(evv, ws.evidence.length) >= 80 ? "ok" : "warn", "Share of evidence records whose cited location was actually opened and read.")}
    ${kpi("Assignment requirements", `${req}<small>/${ASSIGNMENT_FIELDS.length}</small>`, req ? "provided" : "all pending", req === ASSIGNMENT_FIELDS.length ? "ok" : "warn")}
    ${kpi("Critical tasks open", crit.length, ws.tasks.filter(t => t.status !== "done").length + " open in total", crit.length ? "bad" : "ok")}
    ${kpi("E. Research completeness", fmtPct(comp.score), "average of " + comp.comps.filter(c => c.p !== null).length + " known components", "", "Unweighted average of the components shown below; unknown components are excluded rather than counted as zero.")}
  </div>`;
  const phase = `<div class="row gap"><label class="flt"><span>Current investigation phase</span>${selectHtml("phase-select", ENUM.phase, s.phase, 'data-chg="settings" data-k="phase"')}</label>
    <label class="flt"><span>Course files expected</span><input id="set-exp" type="number" min="0" value="${exp === null || exp === undefined ? "" : esc(exp)}" placeholder="unknown" data-chg="settingsNum" data-k="course_docs_expected"></label>
    <label class="flt"><span>Course files indexed</span><input id="set-ing" type="number" min="0" value="${esc(ing)}" data-chg="settingsNum" data-k="course_docs_ingested"></label></div>`;
  const readiness = `<ul class="checklist">${ready.map((r, i) => `<li>${r.v === null ? pill("Unknown", "mute") : r.v ? pill("Met", "ok") : pill("Not met", "warn")} <span>${esc(r.label)}</span>${r.manual ? ` <label class="chk small"><input type="checkbox" id="rdy-${i}" data-chg="readiness" data-k="${esc(r.label)}"${r.v ? " checked" : ""}> confirmed</label>` : ""}</li>`).join("")}</ul>
    <p class="muted small">From the project's pre-exam completion standard. Computed items update automatically; the others need your confirmation. A polished dashboard is not readiness — the mock investigation and red-team items must actually be done.</p>`;
  const compHtml = `<table class="mini">${comp.comps.map(c => `<tr><td>${esc(c.label)}</td><td class="num">${c.total ? c.done + "/" + c.total : "—"}</td><td class="bar">${c.p === null ? pill("Unknown", "mute") : `<div class="meter"><span style="width:${c.p}%"></span></div>`}</td><td class="num">${fmtPct(c.p)}</td></tr>`).join("")}</table>`;
  const tasks = ws.tasks.filter(t => matchSearch("tasks", t) && (!fval("tasks", "status") || t.status === fval("tasks", "status")) && (!fval("tasks", "priority") || t.priority === fval("tasks", "priority")) && inScope(t));
  const tt = dataTable("tasks", tasks, [
    { k: "title", label: "Task", r: t => esc(t.title) }, { k: "status", label: "Status", r: t => selectHtml("ts-" + t.id, ENUM.taskStatus, t.status, `data-chg="setField" data-e="tasks" data-id="${esc(t.id)}" data-k="status" aria-label="Status"`) },
    { k: "priority", label: "Priority", r: t => selectHtml("tp-" + t.id, ENUM.priority, t.priority, `data-chg="setField" data-e="tasks" data-id="${esc(t.id)}" data-k="priority" aria-label="Priority"`), s: t => ENUM.priority.indexOf(t.priority) },
    { k: "company_id", label: "Company", r: t => t.company_id ? esc(trunc(companyName(t.company_id), 26)) : `<span class="empty">—</span>` }, { k: "issue_id", label: "Issue", r: t => t.issue_id ? chip("issues", t.issue_id) : `<span class="empty">—</span>` },
    { k: "due", label: "Due" }], { entity: "tasks", empty: "No research tasks. Add one to track outstanding work." });
  return pageHead("Command Center", "System status, readiness and outstanding work across the project.", `<button class="btn primary" data-act="new" data-e="tasks">Add task</button>`) + tiles +
    `<div class="grid2">${card("Phase and course ingestion", phase)}${card("E. Research completeness" + (scopeCompany() ? "" : " — all companies"), compHtml, { tip: "Tracks verified evidence, analyzed issues and remaining tasks. Independent of risk and viability." })}</div>` +
    `<div class="grid2">${card("Research readiness indicators", readiness)}${card("Outstanding critical tasks", crit.length ? `<ul class="links">${crit.map(t => `<li>${stPill("critical")} <button class="linkbtn" data-act="open" data-e="tasks" data-id="${esc(t.id)}">${esc(t.title)}</button> ${t.due ? `<span class="muted">due ${esc(t.due)}</span>` : ""}</li>`).join("")}</ul>` : `<p class="muted">No open critical tasks.</p>`)}</div>` +
    card("Research tasks", `<div class="toolbar">${searchBox("tasks", "Search tasks")}${filterSel("tasks", "status", "Status", ENUM.taskStatus)}${filterSel("tasks", "priority", "Priority", ENUM.priority)}</div>${tt}`);
}

/* ================= B. Company Intelligence ================= */
function viewCompanies() {
  const ws = W(); const w = ws.settings.weights; const wsum = CRITERIA.reduce((s, c) => s + (Number(w[c[0]]) || 0), 0);
  const rows = ws.companies.filter(c => matchSearch("cos", c) && (!fval("cos", "entity_type") || c.entity_type === fval("cos", "entity_type")) && (!fval("cos", "reporting_status") || c.reporting_status === fval("cos", "reporting_status")) && (!fval("cos", "perspective_fit") || c.perspective_fit === fval("cos", "perspective_fit")))
    .map(c => { const sc = selectionScore(c); const ev = ws.evidence.filter(e => e.company_id === c.id); return Object.assign({}, c, { _sc: sc, _iss: ws.issues.filter(i => i.company_id === c.id).length, _ev: ev.length, _evv: ev.filter(e => e.verification_status === "verified_from_source").length, _comp: completeness(c.id).score }); });
  if (!App.ui.sort.cos) App.ui.sort.cos = { k: "_score", d: -1 };
  const table = dataTable("cos", rows, [
    { k: "_cmp", label: "Compare", nosort: true, r: c => `<input type="checkbox" id="cmp-${esc(c.id)}" data-chg="compare" data-id="${esc(c.id)}"${App.ui.compare.includes(c.id) ? " checked" : ""} aria-label="Compare ${esc(raw(c.name))}">` },
    { k: "name", label: "Company", r: c => `<strong>${esc(raw(c.name))}</strong><div class="muted small">${disp(c.ticker)} · ${esc(c.entity_type || "—")}</div>` },
    { k: "reporting_status", label: "Reporting status", r: c => disp(c.reporting_status) },
    { k: "_iss", label: "Issues", cls: "num" }, { k: "_evv", label: "Evidence verified", cls: "num", r: c => `${c._evv}/${c._ev}` },
    { k: "_score", label: "A. Selection suitability", s: c => c._sc.score === null ? -1 : c._sc.score, tip: "Weighted average of criteria scored 0–5 AND linked to evidence. Unknown or unsupported criteria are excluded; coverage shows the weight actually scored.",
      r: c => c._sc.score === null ? pill("Unknown — no supported scores", "mute") : `<div class="scorecell"><strong>${c._sc.score}</strong><span class="muted small">/100</span> ${c._sc.sufficient ? pill("coverage " + c._sc.coverage + "%", "ok2") : pill("coverage " + c._sc.coverage + "% — insufficient", "warn")}</div>` },
    { k: "perspective_fit", label: "Perspective fit" }, { k: "_comp", label: "E. Completeness", cls: "num", r: c => fmtPct(c._comp) }
  ], { entity: "companies", expand: c => scoreEditor(byId("companies", c.id)), empty: "No company records yet. Add companies one at a time or import the professor's list." });
  const weights = `<div class="weights">${CRITERIA.map(c => `<label class="wt"><span>${esc(c[1])}</span><input type="number" min="0" max="100" id="w-${c[0]}" value="${esc(w[c[0]])}" data-chg="weight" data-k="${c[0]}"></label>`).join("")}<div class="wsum ${wsum === 100 ? "" : "warnt"}">Total ${wsum}${wsum === 100 ? "" : " — scores are normalized by the total"}</div><button class="btn small" data-act="resetWeights">Restore 25/25/20/10/10/10</button></div>`;
  const cmp = App.ui.compare.filter(id => byId("companies", id));
  const compare = cmp.length >= 2 ? comparisonView(cmp) : `<p class="muted">Tick two or three companies in the ranking table to compare them side by side.</p>`;
  const sel = scopeCompany() ? byId("companies", scopeCompany()) : null;
  return pageHead("Company Intelligence", "Candidate records, weighted selection scoring, comparison and research dossiers. Scores count only when linked to evidence.",
    `<button class="btn" data-act="modal" data-type="companyImport">Import company list</button><button class="btn primary" data-act="new" data-e="companies">Add company</button>`) +
    card("A. Selection-suitability weights", weights, { tip: "Research-selection weights from the project instructions. They rank paper suitability, not legal liability." }) +
    card("Candidate ranking", `<div class="toolbar">${searchBox("cos", "Search companies")}${filterSel("cos", "entity_type", "Entity type", ENUM.entityType)}${filterSel("cos", "reporting_status", "Reporting", ENUM.reporting)}${filterSel("cos", "perspective_fit", "Perspective fit", ENUM.perspectiveFit)}</div>${table}<p class="muted small">Expand a row (▸) to score its criteria and link supporting evidence.</p>`) +
    card("Comparison view", compare) + (sel ? dossier(sel) : card("Research dossier", `<p class="muted">Choose a company in the header to open its dossier.</p>`));
}
function scoreEditor(c) {
  const sc = selectionScore(c);
  return `<table class="mini scoretbl"><thead><tr><th>Criterion</th><th>Weight</th><th>Score (0–5)</th><th>Supporting evidence</th><th>State</th><th>Rationale</th></tr></thead><tbody>${sc.details.map(d => `<tr>
    <td>${esc(d.label)}</td><td class="num">${d.weight}</td>
    <td>${selectHtml("sc-" + c.id + "-" + d.key, ["", "0", "1", "2", "3", "4", "5"], d.score === null ? "" : String(d.score), `data-chg="score" data-id="${esc(c.id)}" data-c="${d.key}" aria-label="Score for ${esc(d.label)}"`, ["Unknown", "0", "1", "2", "3", "4", "5"])}</td>
    <td>${chips("evidence", d.evidence)} <button class="btn small" data-act="modal" data-type="scoreEvidence" data-id="${esc(c.id)}" data-c="${d.key}">Link evidence</button></td>
    <td>${d.state === "counted" ? pill("Counted", "ok") : d.state === "unsupported" ? pill("Unsupported — excluded", "warn", "A score without linked evidence is not counted.") : pill("Unknown", "mute")}</td>
    <td><input id="sn-${esc(c.id)}-${d.key}" value="${esc(d.note)}" data-chg="scoreNote" data-id="${esc(c.id)}" data-c="${d.key}" placeholder="Why this score" aria-label="Rationale"></td></tr>`).join("")}</tbody></table>`;
}
function comparisonView(ids) {
  const ws = W(); const cos = ids.map(id => byId("companies", id));
  const rowsDef = [["Entity type", c => disp(c.entity_type)], ["Reporting status", c => disp(c.reporting_status)], ["Securities activities", c => disp(c.securities_activities)], ["Perspective fit", c => disp(c.perspective_fit)],
    ["A. Selection suitability", c => { const s = selectionScore(c); return s.score === null ? pill("Unknown", "mute") : s.score + " (coverage " + s.coverage + "%)"; }]]
    .concat(CRITERIA.map(cr => [" · " + cr[1], c => { const d = selectionScore(c).details.find(x => x.key === cr[0]); return d.state === "counted" ? d.score + "/5" : d.state === "unsupported" ? pill("unsupported", "warn") : pill("unknown", "mute"); }]))
    .concat([["Legal issues", c => ws.issues.filter(i => i.company_id === c.id).map(i => `<div>${chip("issues", i.id)} ${stPill(i.severity)}</div>`).join("") || `<span class="empty">—</span>`],
      ["Evidence (verified/total)", c => { const e = ws.evidence.filter(x => x.company_id === c.id); return e.filter(x => x.verification_status === "verified_from_source").length + "/" + e.length; }],
      ["E. Completeness", c => fmtPct(completeness(c.id).score)]]);
  return `<div class="tablewrap"><table class="dt cmp"><thead><tr><th></th>${cos.map(c => `<th>${esc(raw(c.name))}</th>`).join("")}</tr></thead><tbody>${rowsDef.map(r => `<tr><th scope="row">${esc(r[0])}</th>${cos.map(c => `<td>${r[1](c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><button class="btn small" data-act="clearCompare">Clear comparison</button>`;
}
function dossier(c) {
  const ws = W(); const iss = ws.issues.filter(i => i.company_id === c.id);
  const prof = `<dl class="kv two">${ENTITIES.companies.fields.filter(f => f[0] !== "summary").map(f => `<dt>${esc(f[1])}</dt><dd>${disp(c[f[0]])}</dd>`).join("")}</dl>${has(c.summary) ? `<p class="pre">${esc(c.summary)}</p>` : ""}`;
  const issuesHtml = iss.length ? `<table class="mini"><thead><tr><th>Issue</th><th>B. Severity</th><th>C. Evidence</th><th>D. Viability</th></tr></thead><tbody>${iss.map(i => { const ev = issueEvidenceClass(i), lv = litViability(i); return `<tr><td>${chip("issues", i.id)}</td><td>${stPill(i.severity)}</td><td>${pill(ev.label, ev.cls)}</td><td>${pill(lv.label, lv.cls, lv.why)}</td></tr>`; }).join("")}</tbody></table>` : `<p class="muted">No legal issues recorded.</p>`;
  const counts = [["Documents", ws.documents.filter(d => d.company_id === c.id).length, "disclosure"], ["Statements", ws.statements.filter(d => d.company_id === c.id).length, "disclosure"], ["Evidence", ws.evidence.filter(d => d.company_id === c.id).length, "evidence"], ["Financial obs.", ws.fin_obs.filter(d => d.company_id === c.id).length, "forensics"], ["Market obs.", ws.mkt_obs.filter(d => d.company_id === c.id).length, "forensics"], ["Open tasks", ws.tasks.filter(t => t.company_id === c.id && t.status !== "done").length, "command"]];
  return card("Research dossier — " + raw(c.name), `<div class="grid2"><div>${prof}<button class="btn small" data-act="open" data-e="companies" data-id="${esc(c.id)}">Open full record</button></div><div><h3 class="sub">Legal issues</h3>${issuesHtml}<h3 class="sub">Record counts</h3><div class="counts">${counts.map(x => `<a class="count" href="#${x[2]}"><b>${x[1]}</b><span>${x[0]}</span></a>`).join("")}</div></div></div>`);
}

/* ================= C. Regulatory Analysis ================= */
function viewRegulatory() {
  const sub = App.ui.sub.regulatory; let body = "";
  if (sub === "doctrines") {
    const rows = W().doctrines.filter(d => matchSearch("doc", d) && (!fval("doc", "private_right") || d.private_right === fval("doc", "private_right")) && (!fval("doc", "course_relation") || d.course_relation === fval("doc", "course_relation")));
    body = card("Doctrine database", `<div class="toolbar">${searchBox("doc", "Search doctrines, statutes, elements")}${filterSel("doc", "private_right", "Private right", ENUM.privateRight)}${filterSel("doc", "course_relation", "Course relation", ENUM.courseRelation)}${COURSE_DOCTRINES.length ? `<button class="btn" data-act="loadCourse">Load course doctrine index (${COURSE_DOCTRINES.length})</button>` : ""}<button class="btn primary" data-act="new" data-e="doctrines">Add doctrine</button></div>` +
      dataTable("doc", rows, [{ k: "topic", label: "Topic" }, { k: "subtopic", label: "Subtopic" }, { k: "statute", label: "Statute / rule" }, { k: "case_ids", label: "Linked cases", r: d => chips("authorities", d.case_ids) },
        { k: "private_right", label: "Private right", r: d => disp(d.private_right) }, { k: "_iss", label: "Issues", cls: "num", r: d => W().issues.filter(i => i.doctrine_id === d.id).length, s: d => W().issues.filter(i => i.doctrine_id === d.id).length },
        { k: "course_relation", label: "Course", r: d => stPill(d.course_relation) }], { entity: "doctrines", empty: COURSE_DOCTRINES.length ? "No doctrines yet. Load the course doctrine index or add one." : "No doctrines yet. Add them from your own course notes, or import a doctrines CSV/JSON in Data & Backup." }));
  } else if (sub === "rules") {
    const types = ["statute", "regulation", "sec_final_rule_release", "sec_interpretive_release", "sec_proposed_rule", "sec_staff_guidance", "sro_rule"];
    const rows = W().authorities.filter(a => types.includes(a.authority_type) && matchSearch("rules", a) && (!fval("rules", "authority_type") || a.authority_type === fval("rules", "authority_type")));
    body = card("Statutes, SEC rules and releases", `<div class="toolbar">${searchBox("rules", "Search statutes and rules")}${filterSel("rules", "authority_type", "Type", types)}<button class="btn" data-act="new" data-e="authorities">Add authority</button></div>` +
      dataTable("rules", rows, [{ k: "short_name", label: "Name" }, { k: "citation", label: "Citation", r: a => `<span class="small">${esc(a.citation)}</span>` }, { k: "authority_type", label: "Type", r: a => stPill(a.authority_type) },
        { k: "binding_force", label: "Binding force", r: a => esc(String(a.binding_force || "").replace(/_/g, " ")) }, { k: "current_validity", label: "Validity", r: a => stPill(a.current_validity) }],
        { entity: "authorities", empty: "No statutes or rules loaded. Use Evidence Vault → Authorities → Add supplemental library." }));
  } else if (sub === "issues") {
    const rows = issuesInScope().filter(i => matchSearch("iss", i) && (!fval("iss", "doctrine_id") || i.doctrine_id === fval("iss", "doctrine_id")) && (!fval("iss", "severity") || i.severity === fval("iss", "severity"))
      && (!fval("iss", "ev") || issueEvidenceClass(i).label.indexOf(fval("iss", "ev")) === 0) && (!fval("iss", "private_right") || i.private_right === fval("iss", "private_right")));
    const docs = W().doctrines;
    body = card("Legal issues and elements", `<div class="toolbar">${searchBox("iss", "Search issues")}${filterSel("iss", "doctrine_id", "Doctrine", docs.map(d => d.id), docs.map(d => trunc(d.subtopic || d.topic, 30)))}${filterSel("iss", "severity", "Severity", ENUM.severity)}
      ${filterSel("iss", "ev", "Evidentiary support", ["Unknown", "Gaps", "Contested", "Partially assessed", "Elements supported", "No elements"])}${filterSel("iss", "private_right", "Private right", ENUM.privateRight)}<button class="btn primary" data-act="modal" data-type="newIssue">New issue from template</button></div>` +
      dataTable("iss", rows, [{ k: "title", label: "Issue", r: i => `<strong>${esc(i.title)}</strong><div class="muted small">${esc(trunc(companyName(i.company_id), 40))} · ${esc(i.template || "custom")}</div>` },
        { k: "private_right", label: "Regime", r: i => regimePill(i) }, { k: "severity", label: "B. Severity", r: i => stPill(i.severity), s: i => ENUM.severity.indexOf(i.severity) },
        { k: "_ev", label: "C. Evidence strength", r: i => { const e = issueEvidenceClass(i); return pill(e.label, e.cls) + statusBar(e.counts); }, s: i => issueEvidenceClass(i).level },
        { k: "_lv", label: "D. Private viability", r: i => { const l = litViability(i); return pill(l.label, l.cls, l.why); }, nosort: true }],
        { entity: "issues", expand: elementGrid, empty: "No legal issues in scope. Create one from a claim template." }));
  } else {
    body = card("Private remedies vs. SEC enforcement", `<div class="tablewrap"><table class="dt"><thead><tr><th>Provision</th><th>Private right</th><th>Who may sue</th><th>Mental state / standard</th><th>SEC / government</th></tr></thead><tbody>${REMEDY_MAP.map(r => `<tr><td><strong>${esc(r[0])}</strong></td><td>${pill(r[1], /^None/.test(r[1]) ? "bad2" : /Limited/.test(r[1]) ? "warn" : "ok2")}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`).join("")}</tbody></table></div><p class="muted small">Reference table from the research engine. ${Object.keys(COURSE_TEMPLATE_COVERAGE).length ? "Course coverage by claim template: " + Object.entries(COURSE_TEMPLATE_COVERAGE).map(([k, v]) => esc(k) + " — " + esc(v)).join("; ") + ". " : "Supplemental reference — not reconciled to any course. "}A compliance deficiency does not by itself create a private claim.</p>`);
  }
  return pageHead("Regulatory Analysis", "Doctrines, statutes and rules, issue-to-element mapping, and enforcement regimes.") +
    subTabs("regulatory", [["issues", "Issues & elements"], ["doctrines", "Doctrines"], ["rules", "Statutes & SEC rules"], ["regimes", "Enforcement regimes"]]) + body;
}
function regimePill(i) { const pr = i.private_right || "Unknown"; return /^None/.test(pr) ? pill("SEC/DOJ only", "bad2", "No private cause of action") : pr === "Unknown" ? pill("Undetermined", "mute") : pill("Private: " + pr, "ok2", "SEC can also enforce"); }
function courseNote(code) {
  const f = typeof COURSE_ELEMENT_FRAMING !== "undefined" && COURSE_ELEMENT_FRAMING[code]; if (!f) return "";
  return `<details class="cnote"><summary class="muted small">Course framing</summary><div class="small">${esc(f.framing)}${f.cases.length ? `<br><em>Cases:</em> ${esc(f.cases.join(", "))}` : ""}${f.gap ? `<br><em>Check:</em> ${esc(f.gap)}` : ""}</div></details>`;
}
function elementGrid(i) {
  const els = elementsOf(i.id);
  if (!els.length) return `<p class="muted">No elements. <button class="btn small" data-act="new" data-e="elements" data-issue="${esc(i.id)}">Add element</button></p>`;
  return `<table class="mini elgrid"><thead><tr><th>Code</th><th>Element</th><th>Essential</th><th>Status</th><th>Evidence</th><th></th></tr></thead><tbody>${els.map(e => `<tr>
    <td class="mono small">${esc(e.code)}</td><td>${esc(e.label)}${courseNote(e.code)}</td><td>${e.essential ? "Yes" : "No"}</td>
    <td>${selectHtml("es-" + e.id, ENUM.elementStatus, e.status || "Unassessed", `data-chg="setField" data-e="elements" data-id="${esc(e.id)}" data-k="status" class="stsel ${STATUS_CLASS[e.status || "Unassessed"]}" aria-label="Status of ${esc(e.label)}"`)}</td>
    <td>${chips("evidence", e.evidence_ids)}</td><td><button class="btn small" data-act="openEdit" data-e="elements" data-id="${esc(e.id)}">Link evidence / analyze</button></td></tr>`).join("")}</tbody></table>
    <button class="btn small" data-act="new" data-e="elements" data-issue="${esc(i.id)}">Add element</button>`;
}

/* ================= D. Disclosure Intelligence ================= */
function viewDisclosure() {
  const ws = W(); const c = scopeCompany();
  const docs = scoped("documents").filter(d => matchSearch("docs", d) && (!fval("docs", "doc_type") || d.doc_type === fval("docs", "doc_type")) && (!fval("docs", "review_status") || d.review_status === fval("docs", "review_status")));
  const inv = card("SEC filing and document inventory", `<div class="toolbar">${searchBox("docs", "Search documents")}${filterSel("docs", "doc_type", "Form", uniq(scoped("documents").map(d => d.doc_type).filter(Boolean)))}${filterSel("docs", "review_status", "Review", ENUM.reviewStatus)}<button class="btn primary" data-act="new" data-e="documents">Add document</button></div>` +
    dataTable("docs", docs, [{ k: "doc_type", label: "Form" }, { k: "title", label: "Title" }, { k: "filing_date", label: "Filed", s: d => sortKey(d.filing_date) }, { k: "period_end", label: "Period end" },
      { k: "accession", label: "Accession / ID", r: d => `<span class="mono small">${disp(d.accession)}</span>` }, { k: "amends", label: "Amends", r: d => d.amends ? chip("documents", d.amends) : `<span class="empty">—</span>` },
      { k: "review_status", label: "Review", r: d => selectHtml("rv-" + d.id, ENUM.reviewStatus, d.review_status || "not_reviewed", `data-chg="setField" data-e="documents" data-id="${esc(d.id)}" data-k="review_status" aria-label="Review status"`) },
      { k: "_c", label: "Company", r: d => esc(trunc(companyName(d.company_id), 22)), nosort: true }], { entity: "documents", empty: c ? "No documents recorded for this company." : "No documents recorded." }));
  if (!c) return pageHead("Disclosure Intelligence", "Filing inventory, chronology and statement comparison. A discrepancy is an investigative lead, not proof of a violation.") + inv + card("Chronology and comparison", needCompany("Choose a company in the header to see its disclosure chronology and compare statements over time."));
  const stm = ws.statements.filter(s => s.company_id === c);
  const lanes = [["filing", "Filings & documents"], ["statement", "Public statements"], ["lead", "Investigative leads"], ["event", "Material events"]];
  const items = scoped("documents").filter(d => has(d.filing_date)).map(d => ({ date: d.filing_date, lane: "filing", label: d.doc_type + " — " + d.title, entity: "documents", id: d.id }))
    .concat(stm.map(s => ({ date: s.statement_date, lane: s.lead_flag && s.lead_flag !== "none" ? "lead" : "statement", label: s.topic + ": " + trunc(s.text, 80), entity: "statements", id: s.id, cls: s.lead_flag && s.lead_flag !== "none" ? "warn" : "" })))
    .concat(scoped("events").map(e => ({ date: e.date, lane: "event", label: e.title, entity: "events", id: e.id, cls: e.corrective_candidate ? "bad" : "" })));
  const topics = uniq(stm.map(s => s.topic)).sort();
  const busiest = topics.slice().sort((x, y) => stm.filter(s => s.topic === y).length - stm.filter(s => s.topic === x).length)[0];
  const topic = topics.includes(App.ui.stmtTopic) ? App.ui.stmtTopic : busiest || "";
  const seq = stm.filter(s => s.topic === topic).sort((a, b) => cmp(a.statement_date, b.statement_date));
  const comp = topics.length ? `<div class="toolbar"><label class="flt"><span>Topic</span>${selectHtml("topic-select", topics, topic, 'data-chg="ui" data-k="stmtTopic"')}</label><button class="btn primary" data-act="new" data-e="statements" data-topic="${esc(topic)}">Add statement</button></div>
    <div class="stmts">${seq.map((s, i) => `<article class="stmt ${s.lead_flag && s.lead_flag !== "none" ? "lead" : ""}"><div class="stmt-h"><strong>${esc(s.statement_date)}</strong> · ${disp(s.speaker)} · ${s.document_id ? chip("documents", s.document_id) : ""} <span class="muted small">${disp(s.location)}</span> ${stPill(s.statement_type)}</div>
      <blockquote>${i ? diffWords(seq[i - 1].text, s.text) : esc(s.text)}</blockquote>
      ${s.lead_flag && s.lead_flag !== "none" ? `<div class="leadbox">${pill("Investigative lead — not proof of a violation", "warn")} <strong>${esc(s.lead_flag)}</strong>. ${esc(s.lead_note || "")}</div>` : ""}
      <div class="small">Evidence: ${chips("evidence", s.evidence_ids)} <button class="btn small" data-act="open" data-e="statements" data-id="${esc(s.id)}">Open</button></div></article>`).join("")}</div>
    <p class="muted small">Words removed since the previous statement are struck through; added words are highlighted.</p>` : `<div class="empty-state">No statements recorded. <button class="btn" data-act="new" data-e="statements">Add statement</button></div>`;
  const leads = stm.filter(s => s.lead_flag && s.lead_flag !== "none");
  const leadTbl = dataTable("leads", leads, [{ k: "statement_date", label: "Date" }, { k: "topic", label: "Topic" }, { k: "lead_flag", label: "Lead type" }, { k: "lead_note", label: "Materiality / notes", r: s => esc(trunc(s.lead_note, 140)) }, { k: "evidence_ids", label: "Evidence", r: s => chips("evidence", s.evidence_ids) }], { entity: "statements", empty: "No statements flagged as leads." });
  return pageHead("Disclosure Intelligence", "Filing inventory, chronology and statement comparison. A discrepancy is an investigative lead, not proof of a violation.") +
    card("Disclosure chronology", timelineChart(items, lanes, "Disclosure chronology")) + card("Statement comparison across time", comp) +
    card("Materiality investigation — flagged leads", leadTbl + `<p class="muted small">For each lead, test materiality (total mix; probability × magnitude), whether the statement was misleading when made, and what investors already knew. Record the result as evidence before relying on it.</p>`) + inv;
}

/* ================= E. Financial Forensics ================= */
function viewForensics() {
  const c = scopeCompany(); const ws = W();
  if (!c) return pageHead("Financial Forensics", "Metric trends, ratios, anomalies, insider transactions and market-adjusted returns.") + card("", needCompany());
  const fin = ws.fin_obs.filter(f => f.company_id === c); const metrics = uniq(fin.map(f => f.metric)).sort();
  const periods = uniq(fin.map(f => f.period_end)).sort();
  const th = Number(ws.settings.anomaly_threshold) || 20;
  const valOf = (m, p) => { const r = fin.find(f => f.metric === m && f.period_end === p); return r ? num(r.value) : null; };
  const recOf = (m, p) => fin.find(f => f.metric === m && f.period_end === p);
  const anomalies = [];
  const pivot = metrics.length ? `<div class="tablewrap"><table class="dt fin"><thead><tr><th>Metric</th>${periods.map(p => `<th class="num">${esc((fin.find(f => f.period_end === p) || {}).period_label || p)}</th>`).join("")}</tr></thead><tbody>${metrics.map(m => `<tr><th scope="row">${esc(m)}</th>${periods.map((p, i) => {
    const r = recOf(m, p); if (!r) return `<td class="num"><span class="empty">—</span></td>`; const v = num(r.value);
    const prev = i ? valOf(m, periods[i - 1]) : null; const ch = v !== null && prev ? (v - prev) / Math.abs(prev) * 100 : null; const anom = ch !== null && Math.abs(ch) >= th;
    if (anom) anomalies.push({ m, p, ch, r });
    const unsourced = r.data_status !== "demo_fictional" && !has(r.evidence_id);
    return `<td class="num ${anom ? "anom" : ""}"><button class="cellbtn" data-act="open" data-e="fin_obs" data-id="${esc(r.id)}" title="${esc(r.data_status)}${unsourced ? " — no source evidence" : ""}">${v === null ? disp(r.value) : v.toLocaleString()}</button>${ch !== null ? `<div class="chg ${ch < 0 ? "neg" : "pos"}">${ch > 0 ? "+" : ""}${ch.toFixed(1)}%</div>` : ""}${unsourced ? `<div class="chg neg">unsourced</div>` : ""}</td>`;
  }).join("")}</tr>`).join("")}</tbody></table></div><p class="muted small">Units: ${esc(uniq(fin.map(f => f.unit)).join(", ") || "—")}. Values flagged when the period-over-period change is at least the anomaly threshold. ${fin.some(f => f.data_status === "demo_fictional") ? pill("Fictional demo values", "warn") : ""}</p>` : `<div class="empty-state">No financial observations for this company. Add values taken from filed statements and link each to its evidence record. Never enter estimated figures.</div>`;
  const metric = metrics.includes(App.ui.metric) ? App.ui.metric : metrics[0];
  const chart = metric ? lineChart({ series: [{ name: metric, pts: periods.map(p => [dnum(p), valOf(metric, p)]).filter(p => p[1] !== null) }], xFmt: t => dfmt(t), dots: true, area: true, label: metric + " by period", yFmt: v => v.toLocaleString(undefined, { maximumFractionDigits: 1 }) }) : "";
  const ratios = ws.settings.ratios || [];
  const ratioTbl = ratios.length ? `<table class="mini"><thead><tr><th>Ratio</th>${periods.map(p => `<th class="num">${esc((fin.find(f => f.period_end === p) || {}).period_label || p)}</th>`).join("")}<th></th></tr></thead><tbody>${ratios.map((r, i) => `<tr><td>${esc(r.name)}<div class="muted small">${esc(r.num)} ÷ ${esc(r.den)}${Number(r.mult) !== 1 ? " × " + esc(r.mult) : ""}</div></td>${periods.map(p => { const a = valOf(r.num, p), b = valOf(r.den, p); return `<td class="num">${a !== null && b ? (a / b * (Number(r.mult) || 1)).toFixed(2) : `<span class="empty" title="Missing a component">—</span>`}</td>`; }).join("")}<td><button class="btn small" data-act="delRatio" data-i="${i}">Remove</button></td></tr>`).join("")}</tbody></table>` : `<p class="muted">No ratios defined.</p>`;
  const ratioForm = metrics.length >= 2 ? `<form class="row gap" data-sub="addRatio"><label class="flt"><span>Name</span><input id="r-name" required placeholder="e.g., DSO (days)"></label><label class="flt"><span>Numerator</span>${selectHtml("r-num", metrics, metrics[0])}</label><label class="flt"><span>Denominator</span>${selectHtml("r-den", metrics, metrics[1])}</label><label class="flt"><span>Multiplier</span><input id="r-mult" type="number" step="any" value="1"></label><button class="btn" type="submit">Add ratio</button></form>` : "";
  /* market */
  const mk = ws.mkt_obs.filter(m => m.company_id === c).sort((a, b) => cmp(a.date, b.date));
  const rets = mk.map((m, i) => { const p = i ? mk[i - 1] : null; const r = p && num(p.close) && num(m.close) !== null ? num(m.close) / num(p.close) - 1 : null; const b = p && num(p.benchmark_close) && num(m.benchmark_close) !== null ? num(m.benchmark_close) / num(p.benchmark_close) - 1 : null; return Object.assign({}, m, { _r: r, _b: b, _a: r !== null && b !== null ? r - b : null }); });
  const evts = ws.events.filter(e => e.company_id === c);
  let market;
  if (!mk.length) market = `<div class="empty-state">No market observations. Import a sourced daily price file (CSV) in Data &amp; Backup, or add observations with their source. Prices are never generated for real companies.</div>`;
  else {
    const f0 = num(mk[0].close), b0 = num(mk[0].benchmark_close);
    const series = [{ name: "Company (indexed to 100)", pts: mk.map(m => [dnum(m.date), num(m.close) !== null && f0 ? num(m.close) / f0 * 100 : null]) }];
    if (b0) series.push({ name: (mk[0].benchmark_name || "Benchmark") + " (indexed)", pts: mk.map(m => [dnum(m.date), num(m.benchmark_close) !== null ? num(m.benchmark_close) / b0 * 100 : null]) });
    const markers = evts.filter(e => has(e.date)).map(e => ({ x: dnum(e.date), label: e.date + " — " + e.title, cls: e.corrective_candidate ? "bad" : e.event_type === "insider_trade" ? "warn" : "" }));
    const ccs = evts.filter(e => e.corrective_candidate);
    const ccRows = ccs.map(e => {
      let idx = rets.findIndex(r => r.date >= e.date); if (idx >= 0 && /after/i.test(e.time || "") && rets[idx].date === e.date) idx++;
      if (idx < 0 || idx >= rets.length) return `<tr><td>${chip("events", e.id)}</td><td colspan="5">${pill("No trading data on or after this date", "mute")}</td></tr>`;
      const d0 = rets[idx]; const win = rets.slice(idx, idx + 3); const cum = win.every(r => r._a !== null) ? win.reduce((s, r) => s + r._a, 0) : null;
      const prev = rets.slice(Math.max(0, idx - 20), idx).map(r => num(r.volume)).filter(v => v); const avgV = prev.length ? prev.reduce((s, v) => s + v, 0) / prev.length : null;
      return `<tr><td>${chip("events", e.id)}<div class="muted small">${esc(e.date)} ${esc(e.time || "")}</div></td><td>${esc(d0.date)}</td><td class="num">${fp(d0._r)}</td><td class="num">${fp(d0._b)}</td><td class="num"><strong>${fp(d0._a)}</strong></td><td class="num">${fp(cum)}</td><td class="num">${avgV && num(d0.volume) ? (num(d0.volume) / avgV).toFixed(1) + "×" : "—"}</td></tr>`;
    }).join("");
    market = lineChart({ series, markers, xFmt: dshort, label: "Indexed price vs. benchmark", yFmt: v => v.toFixed(0) }) +
      `<h3 class="sub">Potential corrective disclosures ${tip("Day 0 = first trading day on/after the event (next day if after the close). Market-adjusted = company return minus benchmark return. This is not an event study and does not establish loss causation (Dura).")}</h3>` +
      (ccs.length ? `<div class="tablewrap"><table class="dt"><thead><tr><th>Event</th><th>Day 0</th><th class="num">Raw return</th><th class="num">Benchmark</th><th class="num">Market-adjusted</th><th class="num">Cum. adj. (0,+2)</th><th class="num">Volume vs. 20-day avg.</th></tr></thead><tbody>${ccRows}</tbody></table></div>` : `<p class="muted">Mark an event as a corrective-disclosure candidate to analyze it here.</p>`) +
      `<div class="limits"><strong>Limitations and alternative explanations.</strong> Single-company daily data; no market-model estimation in this view (use the research engine's event_study.py for α/β and t-statistics). Check confounding same-day news, leakage before day 0, and partial disclosures. ${mk.some(m => m.data_status === "demo_fictional") ? "<strong>These prices are synthetic and fictional.</strong>" : ""}</div>` +
      `<details><summary>Daily returns table (${rets.length} days)</summary>${dataTable("rets", rets, [{ k: "date", label: "Date" }, { k: "close", label: "Close", cls: "num" }, { k: "_r", label: "Return", cls: "num", r: r => fp(r._r) }, { k: "_b", label: "Benchmark", cls: "num", r: r => fp(r._b) }, { k: "_a", label: "Market-adjusted", cls: "num", r: r => fp(r._a) }, { k: "volume", label: "Volume", cls: "num" }, { k: "data_status", label: "Data", r: r => stPill(r.data_status) }], { entity: "mkt_obs" })}</details>`;
  }
  const trades = evts.filter(e => e.event_type === "insider_trade");
  const tradeTbl = dataTable("trades", trades, [{ k: "date", label: "Date" }, { k: "person", label: "Insider" }, { k: "trade_code", label: "Code", tip: "Form 4 code: S open-market sale, P purchase, F tax withholding, M option exercise, G gift, A grant." },
    { k: "shares", label: "Shares", cls: "num", r: e => has(e.shares) ? Number(e.shares).toLocaleString() : disp(e.shares) }, { k: "price", label: "Price", cls: "num" }, { k: "plan_10b5_1", label: "10b5-1 plan", r: e => e.plan_10b5_1 === "No" ? pill("No", "warn") : disp(e.plan_10b5_1) },
    { k: "evidence_ids", label: "Evidence", r: e => chips("evidence", e.evidence_ids) }], { entity: "events", empty: "No insider transactions recorded. Add events of type 'insider_trade' from Forms 4." });
  return pageHead("Financial Forensics", "Use verified numbers only. Every value links to its source; unknown stays unknown.", `<button class="btn" data-act="new" data-e="fin_obs">Add financial value</button><button class="btn" data-act="new" data-e="events" data-type="insider_trade">Add insider trade</button>`) +
    card("Financial statement metrics", `<div class="toolbar">${metrics.length ? `<label class="flt"><span>Chart metric</span>${selectHtml("metric-select", metrics, metric, 'data-chg="ui" data-k="metric"')}</label>` : ""}<label class="flt"><span>Anomaly threshold (%)</span><input id="anom-th" type="number" min="1" value="${esc(th)}" data-chg="settingsNum" data-k="anomaly_threshold"></label></div>${pivot}${chart}`) +
    `<div class="grid2">${card("Ratio analysis", ratioTbl + ratioForm)}${card("Anomaly review", anomalies.length ? `<ul class="links">${anomalies.map(a => `<li>${pill((a.ch > 0 ? "+" : "") + a.ch.toFixed(1) + "%", a.ch < 0 ? "bad2" : "warn")} ${esc(a.m)} · ${esc(a.r.period_label || a.p)} ${chip("fin_obs", a.r.id)}</li>`).join("")}</ul><p class="muted small">An anomaly is a question to investigate (seasonality, acquisitions, accounting changes), not a finding.</p>` : `<p class="muted">No changes at or above ${th}%.</p>`)}</div>` +
    card("Executive transaction timeline", tradeTbl) + card("Market event chronology and returns", market);
}
const fp = v => v === null || v === undefined || isNaN(v) ? `<span class="empty">—</span>` : `<span class="${v < 0 ? "neg" : "pos"}">${(v * 100).toFixed(2)}%</span>`;

/* ================= F. Litigation Strategy ================= */
function viewLitigation() {
  const iss = issuesInScope();
  if (!iss.length) return pageHead("Litigation Strategy", "Claims, elements, defenses, scienter, causation and exposure for each issue.") + card("", `<div class="empty-state">No legal issues in scope. <button class="btn" data-act="modal" data-type="newIssue">New issue from template</button></div>`);
  const cur = iss.find(i => i.id === App.ui.litIssue) || iss[0];
  const ev = issueEvidenceClass(cur), lv = litViability(cur);
  const claims = W().claims.filter(c => c.issue_id === cur.id);
  const linked = W().evidence.filter(e => (e.issue_ids || []).includes(cur.id) || elementsOf(cur.id).some(el => (el.evidence_ids || []).includes(e.id)));
  const sup = linked.filter(e => e.supports_or_contradicts === "supports"), con = linked.filter(e => ["contradicts", "mixed"].includes(e.supports_or_contradicts));
  const gaps = elementsOf(cur.id).filter(e => ["Unsupported", "Not established from available sources", "Contested", "Unassessed"].includes(e.status || "Unassessed"));
  const dims = `<div class="kpis four">
    ${kpi("B. Legal risk severity", stPill(cur.severity), esc(trunc(cur.severity_rationale || "No rationale recorded", 80)), "", "Your classification of how serious the potential exposure is. Not a finding of liability. Edit on the issue record.")}
    ${kpi("C. Evidence strength", pill(ev.label, ev.cls), statusBar(ev.counts), "", "Derived from essential elements: any essential element Unsupported/Not established → Gaps; any Contested → Contested; any unassessed → Partially assessed; else Elements supported.")}
    ${kpi("D. Private litigation viability", pill(lv.label, lv.cls), esc(lv.why), "", "Separate from regulatory exposure. N/A where no private right exists. Pleading-stage view only; not a probability of liability.")}
    ${kpi("Regulatory exposure", stPill(cur.exposure), regimePill(cur), "", "Classification of SEC/government exposure, recorded on the issue.")}</div>`;
  const claimCard = c => `<article class="claim ${c.kind}"><div class="claim-h">${pill(c.kind.replace("_", " "), c.kind === "defense" ? "ok2" : c.kind === "claim" ? "bad2" : "warn")} <strong>${esc(c.provision)}</strong> <span class="muted small">${esc(c.forum || "")}${c.pleading_standard ? " · " + esc(c.pleading_standard) : ""}</span>
    ${c.kind === "claim" ? " · pleading risk " + stPill(c.pleading_risk) : ""} <button class="btn small" data-act="open" data-e="claims" data-id="${esc(c.id)}">Open</button></div>
    <div class="claim-g">${[["Plaintiff / regulator", c.plaintiff_arguments], ["Defense", c.defense_arguments], ["SEC enforcement", c.sec_considerations], ["Scienter", c.scienter_analysis], ["Causation", c.causation_analysis], ["Unresolved", c.unresolved]].filter(x => has(x[1])).map(x => `<div><div class="eyebrow">${esc(x[0])}</div><p>${esc(x[1])}</p></div>`).join("") || `<p class="muted">No analysis recorded yet.</p>`}</div>
    <div class="small">Evidence: ${chips("evidence", c.evidence_ids)}</div></article>`;
  const evList = list => list.length ? `<ul class="evlist">${list.map(e => `<li>${stPill(e.verification_status)} ${chip("evidence", e.id)} <span class="small">${esc(trunc(e.proposition, 130))}</span></li>`).join("")}</ul>` : `<p class="muted">None linked.</p>`;
  return pageHead("Litigation Strategy", "Claims, elements, defenses, scienter, causation and exposure for each issue.", `<button class="btn" data-act="new" data-e="claims" data-issue="${esc(cur.id)}">Add claim / defense</button>`) +
    `<div class="toolbar"><label class="flt wide"><span>Issue</span>${selectHtml("lit-issue", iss.map(i => i.id), cur.id, 'data-chg="ui" data-k="litIssue"', iss.map(i => trunc(i.title, 90)))}</label><button class="btn small" data-act="open" data-e="issues" data-id="${esc(cur.id)}">Open issue record</button></div>` +
    dims + card("Required elements", elementGrid(cur)) +
    card("Claims, defenses and enforcement theories", claims.length ? claims.map(claimCard).join("") : `<div class="empty-state">No claims or defenses recorded for this issue. <button class="btn" data-act="new" data-e="claims" data-issue="${esc(cur.id)}">Add one</button></div>`) +
    `<div class="grid2">${card("Supporting facts (" + sup.length + ")", evList(sup))}${card("Contradictory facts (" + con.length + ")", evList(con))}</div>` +
    card("Unresolved evidence", gaps.length ? `<ul class="links">${gaps.map(g => `<li>${stPill(g.status || "Unassessed")} <span class="mono small">${esc(g.code)}</span> ${esc(g.label)}${g.essential ? " " + pill("essential", "mute") : ""} ${has(g.counter) ? `<div class="muted small">${esc(g.counter)}</div>` : ""}</li>`).join("")}</ul>` : `<p class="muted">Every element has been resolved.</p>`) +
    card("Risk matrix — issues in scope", riskMatrix(iss));
}

/* ================= G. Evidence Vault ================= */
function viewEvidence() {
  const sub = App.ui.sub.evidence; let body = "";
  if (sub === "evidence") {
    const iss = issuesInScope();
    const rows = scoped("evidence").filter(e => matchSearch("ev", e) && (!fval("ev", "verification_status") || e.verification_status === fval("ev", "verification_status")) && (!fval("ev", "proposition_class") || e.proposition_class === fval("ev", "proposition_class"))
      && (!fval("ev", "evidentiary_strength") || e.evidentiary_strength === fval("ev", "evidentiary_strength")) && (!fval("ev", "issue") || (e.issue_ids || []).includes(fval("ev", "issue")))
      && (!fval("ev", "unverified") || e.verification_status !== "verified_from_source") && (!fval("ev", "ready") || evidenceCitation(e).ready) && (!fval("ev", "conflicts") || (e.conflicts_with || []).length || e.proposition_class === "disputed"));
    body = card("Evidence records", `<div class="toolbar">${searchBox("ev", "Search propositions, sources, pinpoints")}${filterSel("ev", "verification_status", "Verification", ENUM.verif)}${filterSel("ev", "proposition_class", "Classification", ENUM.propClass)}${filterSel("ev", "evidentiary_strength", "Strength", ENUM.strength)}${filterSel("ev", "issue", "Issue", iss.map(i => i.id), iss.map(i => trunc(i.title, 32)))}
      ${filterChk("ev", "unverified", "Unverified only")}${filterChk("ev", "ready", "Citation-ready only")}${filterChk("ev", "conflicts", "Conflicts only")}<button class="btn primary" data-act="new" data-e="evidence">Add evidence</button></div>` +
      dataTable("ev", rows, [{ k: "id", label: "ID", r: e => `<span class="mono small">${esc(e.id)}</span>` }, { k: "proposition", label: "Proposition", r: e => esc(trunc(e.proposition, 110)) },
        { k: "proposition_class", label: "Class", r: e => stPill(e.proposition_class) }, { k: "verification_status", label: "Verification", r: e => stPill(e.verification_status) },
        { k: "evidentiary_strength", label: "Strength", r: e => stPill(e.evidentiary_strength) }, { k: "_ready", label: "Citation", s: e => evidenceCitation(e).ready ? 1 : 0, r: e => evidenceCitation(e).ready ? pill("Ready", "ok") : pill("Not ready", "warn", evidenceCitation(e).missing.join("; ")) },
        { k: "_cf", label: "Conflicts", s: e => (e.conflicts_with || []).length, r: e => (e.conflicts_with || []).length ? pill((e.conflicts_with || []).length + " conflict", "bad") : "" }],
        { entity: "evidence", expand: evidenceExpand, empty: "No evidence matches these filters." }));
  } else if (sub === "sources") {
    const rows = scoped("documents").filter(d => matchSearch("src", d));
    body = card("Primary source register", `<div class="toolbar">${searchBox("src", "Search sources")}<button class="btn primary" data-act="new" data-e="documents">Add source document</button></div>` +
      dataTable("src", rows, [{ k: "title", label: "Source" }, { k: "doc_type", label: "Type" }, { k: "filing_date", label: "Date" }, { k: "accession", label: "Identifier", r: d => `<span class="mono small">${disp(d.accession)}</span>` },
        { k: "url", label: "URL", r: d => disp(d.url, { url: true }) }, { k: "_n", label: "Evidence citing it", cls: "num", r: d => W().evidence.filter(e => e.document_id === d.id).length, s: d => W().evidence.filter(e => e.document_id === d.id).length },
        { k: "review_status", label: "Review", r: d => stPill(d.review_status) }], { entity: "documents", empty: "No sources registered." }));
  } else if (sub === "authorities") {
    const rows = W().authorities.filter(a => matchSearch("au", a) && (!fval("au", "current_validity") || a.current_validity === fval("au", "current_validity")) && (!fval("au", "holding_source") || a.holding_source === fval("au", "holding_source"))
      && (!fval("au", "course_relation") || a.course_relation === fval("au", "course_relation")) && (!fval("au", "notready") || !authorityCitation(a).ready));
    body = card("Legal authority records", `<div class="toolbar">${searchBox("au", "Search citations and holdings")}${filterSel("au", "current_validity", "Validity", ENUM.validity)}${filterSel("au", "holding_source", "Holding source", ENUM.holdingSource)}${filterSel("au", "course_relation", "Course", ENUM.courseRelation)}${filterChk("au", "notready", "Not citation-ready only")}
      <button class="btn" data-act="loadLibrary">Add authority library (${SUPPLEMENTAL_AUTHORITIES.length})</button><button class="btn primary" data-act="new" data-e="authorities">Add authority</button></div>` +
      dataTable("au", rows, [{ k: "short_name", label: "Authority", r: a => `<strong>${esc(a.short_name)}</strong><div class="muted small">${esc(trunc(a.citation, 90))}</div>` }, { k: "authority_type", label: "Type", r: a => esc(String(a.authority_type || "").replace(/_/g, " ")) },
        { k: "holding_source", label: "Holding from", r: a => stPill(a.holding_source) }, { k: "current_validity", label: "Validity", r: a => selectHtml("av-" + a.id, ENUM.validity, a.current_validity || "verification_pending", `data-chg="setValidity" data-id="${esc(a.id)}" aria-label="Validity"`) },
        { k: "course_relation", label: "Course", r: a => stPill(a.course_relation) }, { k: "_r", label: "Citation", s: a => authorityCitation(a).ready ? 1 : 0, r: a => authorityCitation(a).ready ? pill("Ready", "ok") : pill("Not ready", "warn", authorityCitation(a).missing.join("; ")) }],
        { entity: "authorities", empty: "No authorities. Add the supplemental library as a starting point, then verify each one." }) +
      `<p class="muted small">Changing validity to anything other than "verification pending" asks for the basis — the dashboard does not record treatment without one.</p>`);
  } else {
    body = card("Verification log", dataTable("vlog", W().verification_log.filter(v => matchSearch("vlog", v)), [{ k: "at", label: "When", r: v => esc(String(v.at).replace("T", " ").slice(0, 16)) }, { k: "record_id", label: "Record", r: v => { const f = findAny(v.record_id); return f ? chip(f.entity, v.record_id) : esc(v.record_id); } },
      { k: "action", label: "Field" }, { k: "from", label: "From", r: v => stPill(v.from) }, { k: "to", label: "To", r: v => stPill(v.to) }, { k: "note", label: "Note" }], { empty: "No verification changes logged yet." }));
  }
  return pageHead("Evidence Vault", "Every factual proposition, source and authority with provenance, verification status and citation readiness.") +
    subTabs("evidence", [["evidence", "Evidence"], ["sources", "Source register"], ["authorities", "Authorities"], ["log", "Verification log"]]) + body;
}
function evidenceExpand(e) {
  const c = evidenceCitation(e);
  return `<div class="grid2 tight"><dl class="kv">${[["Proposition", `<div class="pre">${esc(e.proposition)}</div>`], ["Scope", disp(e.proposition_scope)], ["Source", esc(e.source_title || "") + " " + (e.document_id ? chip("documents", e.document_id) : "")], ["Source type", disp(e.source_type)],
    ["Dates", "Filed " + disp(e.filing_or_document_date) + " · event " + disp(e.event_date)], ["URL", disp(e.url, { url: true })], ["Pinpoint", disp(e.pinpoint)], ["Excerpt", has(e.excerpt) ? `<q>${esc(e.excerpt)}</q> <span class="muted small">(${esc(e.excerpt_type)})</span>` : disp(e.excerpt)],
    ["Limitations", disp(e.limitations)]].map(x => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join("")}</dl>
    <div><div class="ff"><label for="vs-${esc(e.id)}">Verification status</label>${selectHtml("vs-" + e.id, ENUM.verif, e.verification_status || "not_accessed", `data-chg="setField" data-e="evidence" data-id="${esc(e.id)}" data-k="verification_status"`)}</div>
    <div class="ff"><label for="st-${esc(e.id)}">Evidentiary strength</label>${selectHtml("st-" + e.id, ENUM.strength, e.evidentiary_strength || "unassessed", `data-chg="setField" data-e="evidence" data-id="${esc(e.id)}" data-k="evidentiary_strength"`)}</div>
    <p>Issues: ${chips("issues", e.issue_ids)}</p><p>Elements: ${chips("elements", e.element_ids)}</p><p>Conflicts: ${chips("evidence", e.conflicts_with)}</p>
    <p>${c.ready ? pill("Citation-ready", "ok") : pill("Not citation-ready", "warn")} <span class="muted small">${esc(c.missing.join("; "))}</span></p>
    <button class="btn small" data-act="openEdit" data-e="evidence" data-id="${esc(e.id)}">Edit all fields</button></div></div>`;
}

/* ================= H. Paper Production ================= */
function viewPaper() {
  const ws = W(); const a = ws.assignment; const s = ws.settings;
  const reqHtml = `<table class="mini">${ASSIGNMENT_FIELDS.map(f => { const v = a[f[0]] || {}; return `<tr><td>${esc(f[1])}</td><td>${stPill(v.status || "pending")}</td><td class="small">${v.status === "provided" ? esc(trunc(v.value, 120)) : `<span class="muted">${v.status === "not_specified_by_professor" ? "Professor did not specify" : "Pending — do not assume"}</span>`}</td></tr>`; }).join("")}</table><a class="btn small" href="#activation">Enter requirements</a>`;
  const permitted = a.perspectives && a.perspectives.status === "provided" ? a.perspectives.value : "";
  const persp = `<label class="flt"><span>Controlling perspective for the paper</span>${selectHtml("persp-select", ENUM.perspective, s.perspective, 'data-chg="settings" data-k="perspective"')}</label>
    <p class="small">${permitted ? "Permitted by the assignment: <strong>" + esc(permitted) + "</strong>. Make sure your choice matches." : pill("Permitted perspectives pending", "warn") + " The project expects in-house counsel or opposing counsel, but the assignment controls."}</p>`;
  const thesis = `<form data-sub="saveThesis"><label for="thesis-text" class="sr">Thesis</label><textarea id="thesis-text" rows="4" placeholder="State the thesis you will defend.">${esc(s.thesis || "")}</textarea><div class="formbar"><button class="btn primary" type="submit">Save thesis version</button></div></form>
    ${(s.thesis_history || []).length ? `<details><summary>${s.thesis_history.length} earlier version(s)</summary><ul class="links">${s.thesis_history.map(h => `<li><span class="muted small">${esc(String(h.at).slice(0, 16).replace("T", " "))}</span> ${esc(h.text)}</li>`).join("")}</ul></details>` : ""}`;
  const iss = issuesInScope().slice().sort((x, y) => (Number(x.priority) || 99) - (Number(y.priority) || 99));
  const prio = iss.length ? `<ol class="prio">${iss.map((i, n) => `<li><span class="rank">${n + 1}</span> ${chip("issues", i.id)} ${stPill(i.severity)} ${pill(issueEvidenceClass(i).label, issueEvidenceClass(i).cls)}
    <span class="pbtns"><button class="btn small" data-act="prio" data-id="${esc(i.id)}" data-d="-1" ${n === 0 ? "disabled" : ""} aria-label="Move up">↑</button><button class="btn small" data-act="prio" data-id="${esc(i.id)}" data-d="1" ${n === iss.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button></span></li>`).join("")}</ol>` : `<p class="muted">No issues in scope.</p>`;
  const secs = ws.sections.slice().sort((x, y) => (Number(x.order) || 0) - (Number(y.order) || 0));
  const pages = secs.reduce((t, x) => t + (Number(x.target_pages) || 0), 0);
  const lim = pageLimit();
  const outline = dataTable("secs", secs, [{ k: "order", label: "#", cls: "num" }, { k: "title", label: "Section" }, { k: "issue_ids", label: "Issues", r: x => chips("issues", x.issue_ids) }, { k: "target_pages", label: "Pages", cls: "num" },
    { k: "status", label: "Status", r: x => selectHtml("ss-" + x.id, ENUM.sectionStatus, x.status || "not_started", `data-chg="setField" data-e="sections" data-id="${esc(x.id)}" data-k="status" aria-label="Section status"`) },
    { k: "_c", label: "Citations verified", r: x => { const au = x.authority_ids || []; const ok = au.filter(id => { const r = byId("authorities", id); return r && authorityCitation(r).ready; }).length; return au.length ? ok + "/" + au.length : `<span class="empty">—</span>`; }, nosort: true }],
    { entity: "sections", empty: "No outline sections yet." }) + `<p class="small">Page budget: <strong>${pages}</strong> planned${lim ? ` of <strong>${lim}</strong> allowed ${pages > lim ? pill("over limit", "bad") : pill("within limit", "ok")}` : ` · page limit ${W().assignment.page_limit && W().assignment.page_limit.status === "provided" ? pill("no page number found in the saved limit — check wording", "warn") : pill("pending", "warn")}`}. Confirm whether footnotes, title page and appendices count once the instructions arrive; validate against the rendered document, not word count.</p>`;
  const usedAu = uniq(ws.issues.flatMap(i => i.authority_ids || []).concat(ws.sections.flatMap(x => x.authority_ids || [])));
  const auOk = usedAu.filter(id => { const r = byId("authorities", id); return r && authorityCitation(r).ready; }).length;
  const usedEv = uniq(ws.sections.flatMap(x => x.evidence_ids || []).concat(ws.elements.flatMap(e => e.evidence_ids || [])));
  const evOk = usedEv.filter(id => { const r = byId("evidence", id); return r && evidenceCitation(r).ready; }).length;
  const comp = completeness(scopeCompany());
  const progress = `<table class="mini"><tr><td>E. Legal research completeness</td><td class="num">${fmtPct(comp.score)}</td></tr><tr><td>Cited authorities verified</td><td class="num">${usedAu.length ? auOk + "/" + usedAu.length + " (" + fmtPct(pct(auOk, usedAu.length)) + ")" : "—"}</td></tr><tr><td>Cited evidence citation-ready</td><td class="num">${usedEv.length ? evOk + "/" + usedEv.length + " (" + fmtPct(pct(evOk, usedEv.length)) + ")" : "—"}</td></tr><tr><td>Audit findings (scope)</td><td class="num"><a href="#audit">${runAudit().length}</a></td></tr></table>`;
  const rt = `<table class="mini">${REDTEAM.map((r, i) => `<tr><td>${esc(r)}</td><td>${selectHtml("rt-" + i, ENUM.redteam, (s.redteam || {})[r] || "not_started", `data-chg="redteam" data-k="${esc(r)}" aria-label="Status"`)}</td></tr>`).join("")}</table>`;
  const gate = readinessGate(pages, lim, usedAu.length - auOk);
  return pageHead("Paper Production", "Requirements, perspective, thesis, issue priority, outline, verification progress, adversarial audit and submission readiness.", `<button class="btn primary" data-act="new" data-e="sections">Add section</button>`) +
    `<div class="grid2">${card("Assignment requirements", reqHtml)}${card("Perspective and thesis", persp + thesis)}</div>` +
    `<div class="grid2">${card("Issue prioritization", prio)}${card("Research and citation progress", progress)}</div>` +
    card("Outline and page budget", outline) +
    `<div class="grid2">${card("Draft review and adversarial audit", rt + `<p class="muted small">Complete as a skeptical partner and demanding professor. Any "fail" blocks submission readiness.</p>`)}${card("Final submission readiness", gate)}</div>`;
}
function pageLimit() {
  const p = W().assignment.page_limit; if (!p || p.status !== "provided") return null;
  const t = String(p.value);
  const range = t.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*pages?/i); if (range) return Number(range[2]);
  const single = t.match(/(\d+(?:\.\d+)?)\s*pages?/i); if (single) return Number(single[1]);
  const bare = t.trim().match(/^(\d+(?:\.\d+)?)$/); return bare ? Number(bare[1]) : null;
}
function readinessGate(pages, lim, unverifiedCites) {
  const ws = W(); const a = ws.assignment; const s = ws.settings;
  const rtVals = REDTEAM.map(r => (s.redteam || {})[r] || "not_started");
  const conds = [
    ["Formal assignment requirements provided", ["title", "instructions", "page_limit", "citation_style", "perspectives"].every(k => a[k] && a[k].status !== "pending")],
    ["AI-use policy reviewed (provided or confirmed unspecified)", a.ai_restrictions && a.ai_restrictions.status !== "pending"],
    ["Thesis recorded", has(s.thesis)], ["Perspective selected", s.perspective && s.perspective !== "Undecided"],
    ["All outline sections final", ws.sections.length > 0 && ws.sections.every(x => x.status === "final")],
    ["Page budget within limit", lim ? ws.sections.reduce((t, x) => t + (Number(x.target_pages) || 0), 0) <= lim : null],
    ["Every cited authority verified", unverifiedCites === 0],
    ["No unsupported conclusions or integrity violations", !runAudit().some(f => ["Unsupported conclusions", "Integrity rule violations"].includes(f.cat))],
    ["Adversarial audit complete with no failures", rtVals.every(v => v === "pass" || v === "not_applicable")]
  ];
  const ok = conds.every(c => c[1] === true);
  return `<p>${ok ? pill("Ready for student's final review", "ok") : pill("Not ready", "bad")}</p><ul class="checklist">${conds.map(c => `<li>${c[1] === null ? pill("Unknown", "mute") : c[1] ? pill("Met", "ok") : pill("Not met", "warn")} ${esc(c[0])}</li>`).join("")}</ul><p class="muted small">The student keeps control of the thesis, judgments and final submission.</p>`;
}

/* ================= Audit ================= */
function viewAudit() {
  const f = runAudit(); const by = {}; AUDIT_CATS.forEach(c => by[c] = []); f.forEach(x => (by[x.cat] = by[x.cat] || []).push(x));
  const summary = `<div class="kpis">${AUDIT_CATS.map(c => kpi(c, by[c].length, "", by[c].length ? (["Unsupported conclusions", "Integrity rule violations", "Stale authorities"].includes(c) ? "bad" : "warn") : "ok")).join("")}</div>`;
  const lists = AUDIT_CATS.filter(c => by[c].length).map(c => card(c + " (" + by[c].length + ")", `<ul class="audit">${by[c].map(x => `<li>${chip(x.entity, x.id)} <span>${esc(x.msg)}</span></li>`).join("")}</ul>`)).join("");
  return pageHead("Audit", "Unsupported conclusions, missing sources, unverified citations, conflicts, missing elements, stale authorities and incomplete analysis" + (scopeCompany() ? " for " + esc(companyName(scopeCompany())) : " across the workspace") + ".") + summary + (lists || card("", `<div class="empty-state">No audit findings in scope.</div>`));
}

/* ================= Activation ================= */
function viewActivation() {
  const ws = W(); const a = ws.assignment; const s = ws.settings;
  const form = `<form data-sub="saveAssignment" class="assign">${ASSIGNMENT_FIELDS.map(f => { const v = a[f[0]] || { status: "pending", value: "" }; return `<div class="ff arow"><label for="as-${f[0]}">${esc(f[1])}</label>
    ${selectHtml("ass-" + f[0], ENUM.reqStatus, v.status, `aria-label="Status of ${esc(f[1])}"`, ["Pending", "Provided", "Not specified by professor"])}
    ${f[2] === "textarea" ? `<textarea id="as-${f[0]}" rows="${f[0] === "instructions" ? 6 : 3}" placeholder="Paste exactly as provided">${esc(v.value)}</textarea>` : `<input id="as-${f[0]}" value="${esc(v.value)}" placeholder="Enter exactly as provided">`}</div>`; }).join("")}
    <div class="formbar"><button class="btn primary" type="submit">Save requirements</button></div><div id="assign-errors" class="errors" role="alert"></div></form>`;
  const prev = App.ui.companyPreview;
  const listImport = `<p class="small">Paste one company per line. Optional: <span class="mono">Name | Ticker</span>. Records are created in the current workspace (${App.kind === "demo" ? "Demo — will be DEMO- prefixed" : "Real"}), with every other field left empty.</p>
    <textarea id="co-paste" rows="5" data-inp="companyPaste">${esc(App.ui.companyPaste || (a.company_list && a.company_list.value) || "")}</textarea>
    <div class="formbar"><button class="btn" data-act="previewCompanies">Preview</button>${prev ? `<button class="btn primary" data-act="createCompanies">Create ${prev.filter(p => !p.dup).length} company record(s)</button>` : ""}</div>
    ${prev ? `<table class="mini"><thead><tr><th>Name</th><th>Ticker</th><th>Status</th></tr></thead><tbody>${prev.map(p => `<tr><td>${esc(p.name)}</td><td>${esc(p.ticker || "—")}</td><td>${p.dup ? pill("Already exists — skipped", "mute") : pill("New", "ok")}</td></tr>`).join("")}</tbody></table>` : ""}`;
  const canActivate = a.title && a.title.status === "provided" && a.instructions && a.instructions.status === "provided" && has(a.instructions.value);
  const act = s.system_state === "ACTIVATED" ? `<p>${pill("Activated", "ok")} The workflow now reads the saved requirements: page budget, permitted perspectives, citation style and AI restrictions appear across the modules.</p><button class="btn" data-act="confirm" data-msg="Return to pre-exam state? Requirements are kept." data-do="deactivate">Return to pre-exam state</button>`
    : `<p>Activation requires at least the assignment title and the professor's exact instructions. Nothing is filled in automatically.</p><button class="btn primary" data-act="confirm" data-msg="Activate the exam workflow with the saved requirements? This sets the phase to Assignment intake and creates intake tasks." data-do="activate" ${canActivate ? "" : "disabled"}>Activate final exam workflow</button>${canActivate ? "" : ` <span class="muted small">Save a title and instructions first.</span>`}`;
  return pageHead("Exam Activation", "Enter or paste the formal assignment exactly as provided. The dashboard adapts without being rebuilt.") +
    `<div class="grid2">${card("Formal assignment requirements", form)}<div>${card("Activate", act)}${card("Import the professor's company list", listImport)}${card("After activation", `<ol class="small"><li>Read the whole assignment; confirm every requirement status.</li><li>Check AI-use permissions — they appear as a banner on every page.</li><li>Import the company list, then screen each company in Company Intelligence.</li><li>Set the page limit and citation style; the Paper module uses them.</li><li>Run the Audit before drafting and again before submission.</li></ol>`)}</div></div>`;
}

/* ================= Data & Backup ================= */
function viewData() {
  const ws = W(); const p = App.ui.importPreview;
  const counts = ENTITY_KEYS.map(k => `<tr><td>${esc(ENTITIES[k].label)}</td><td class="num">${ws[k].length}</td><td><button class="btn small" data-act="exportCsv" data-e="${k}">CSV</button></td></tr>`).join("");
  const prevHtml = p ? `<div class="importprev">${p.errors.length ? `<div class="errors"><strong>${p.errors.length} error(s) — import blocked.</strong><ul>${p.errors.slice(0, 12).map(e => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
    ${p.warnings.length ? `<details><summary>${p.warnings.length} warning(s)</summary><ul class="small">${p.warnings.slice(0, 40).map(e => `<li>${esc(e)}</li>`).join("")}</ul></details>` : ""}
    <p class="small">File: <strong>${esc(p.filename || "")}</strong>${p.legacy ? " · research-engine format converted" : ""}${p.migrations.length ? " · migrated " + esc(p.migrations.join(", ")) : ""}${p.csv ? " · CSV for " + esc(ENTITIES[p.csv].label) : ""}</p>
    <p class="small">${p.counts.map(c => esc(ENTITIES[c[0]].label) + ": " + c[1]).join(" · ") || "No records found."}</p>
    ${p.errors.length ? "" : `<div class="formbar">${p.csv ? `<button class="btn primary" data-act="applyImport" data-m="merge">Add new records</button><button class="btn" data-act="applyImport" data-m="upsert">Add and update by ID</button>` : `<button class="btn primary" data-act="applyImport" data-m="merge">Merge (add new IDs only)</button><button class="btn danger" data-act="confirm" data-msg="Replace the entire ${App.kind} workspace with this file? Export a backup first." data-do="importReplace">Replace workspace</button>`}<button class="btn" data-act="cancelImport">Cancel</button></div>`}</div>` : "";
  return pageHead("Data & Backup", "Export and import research data. The JSON file is the authoritative backup; CSV covers tabular records.") +
    `<div class="grid2">${card("Storage", `<p><strong>${esc(Store.status)}</strong></p><p class="small">${Store.mode === "db" ? "Your workspaces are saved in the host's database (available only when this app runs as a Claude artifact). Export JSON backups anyway — before the exam and after major changes." : "Changes are only kept in this browser (or not at all). Export a JSON backup after every session."}</p>
      <p class="small">Real and demo data are stored separately. The Real workspace refuses records with DEMO- IDs.</p><div class="formbar"><button class="btn primary" data-act="exportJson">Export ${App.kind === "demo" ? "demo" : "real"} workspace (JSON)</button><button class="btn" data-act="exportSample">Download fictional sample dataset</button></div>`)}
      ${card("Import", `<div class="ff"><label for="imp-json">JSON workspace or research-engine file</label><input type="file" id="imp-json" accept=".json,application/json" data-chg="importJson"></div>
      <div class="row gap"><label class="flt"><span>CSV into</span>${selectHtml("imp-csv-entity", ENTITY_KEYS, App.ui.csvEntity || "evidence", 'data-chg="ui" data-k="csvEntity"', ENTITY_KEYS.map(k => ENTITIES[k].label))}</label><div class="ff"><label for="imp-csv">CSV file</label><input type="file" id="imp-csv" accept=".csv,text/csv" data-chg="importCsv"></div></div>${prevHtml}`)}</div>` +
    `<div class="grid2">${card("Records and CSV export", `<table class="mini">${counts}</table>`)}
      ${card("Reset and clear", `<p class="small">Reset restores the fictional demo dataset. Clearing the Real workspace deletes every real record after you type DELETE.</p><div class="formbar"><button class="btn" data-act="confirm" data-msg="Reset the demo workspace to the original fictional dataset? Demo changes are lost." data-do="resetDemo">Reset demo data</button>
        <button class="btn danger" data-act="modal" data-type="clearReal">Clear real workspace…</button></div><p class="small muted">Schema version ${SCHEMA_VERSION}. Older files (0.9.0) are migrated on import; unknown versions are refused.</p>`)}</div>`;
}

/* ================= Guide ================= */
function viewGuide() {
  return pageHead("Guide", "How to use the platform, and how its numbers are made.") + `<div class="grid2">${card("Workflow", `<ol class="small">
    <li><strong>Before the exam:</strong> work in the Demo workspace to learn the controls. Load the supplemental authority library into the Real workspace and begin verifying it. Index doctrines from your course notes.</li>
    <li><strong>Activation:</strong> paste the assignment exactly into Exam Activation, mark each requirement's status, activate, and import the company list.</li>
    <li><strong>Screening:</strong> in Company Intelligence, score each criterion 0–5 only after linking the evidence behind the score.</li>
    <li><strong>Investigation:</strong> register documents, add evidence with pinpoints, create issues from templates, and set element statuses.</li>
    <li><strong>Analysis:</strong> use Disclosure, Forensics and Litigation views; record claims and defenses with scienter and causation analysis.</li>
    <li><strong>Paper:</strong> outline sections, track citation verification, complete the red-team checklist, and clear the Audit.</li></ol>`)}
    ${card("Scoring dimensions (never combined)", `<dl class="kv"><dt>A. Selection suitability</dt><dd>Weighted average (default 25/25/20/10/10/10) of criteria scored 0–5 <em>and</em> linked to evidence. Unknown or unsupported criteria are excluded, and coverage shows how much weight was actually scored; below 50% is "insufficient."</dd>
    <dt>B. Legal risk severity</dt><dd>Your classification (Low → Severe) with a rationale. Seriousness of potential exposure, not liability.</dd>
    <dt>C. Evidence strength</dt><dd>Derived from essential elements: Gaps → Contested → Partially assessed → Elements supported. All unassessed = Unknown.</dd>
    <dt>D. Litigation viability</dt><dd>Private claims only; N/A where no private right exists. Derived from C plus pleading risk on recorded claims.</dd>
    <dt>E. Research completeness</dt><dd>Average of known components: evidence verified, elements assessed, issues concluded, tasks done. Unknown components are excluded, not zeroed.</dd></dl>`)}</div>
    <div class="grid2">${card("Field states", `<p class="small">Each field distinguishes <strong>empty</strong> (not yet entered, shown —) from four recorded states: ${ENUM.fieldStatus.slice(1).map(s => disp({ $s: s })).join(" ")}. Use the "Field state" control in any edit form and add a note.</p>`)}
    ${card("Integrity rules enforced", `<ul class="small"><li>A verified fact needs a source actually read and a pinpoint (R1).</li><li>Unaccessed sources cannot be rated strong or high-confidence (R2).</li><li>Complaints and short-seller reports prove only that the allegation was made (R3).</li><li>Demo and real records never mix.</li><li>Authority validity other than "pending" requires a stated basis.</li><li>Element "supported" without evidence is flagged as an unsupported conclusion.</li></ul>`)}</div>
    ${card("Technical notes", `<ul class="small"><li>Storage: this browser's localStorage (each browser and device is separate). Export JSON regularly.</li><li>The page cannot fetch EDGAR or market data directly; add data from sources you have opened, or import CSV.</li><li>Market view computes raw and market-adjusted returns only; formal event studies use the research engine's script.</li><li>Not affiliated with or endorsed by the SEC. Scores are research aids, not legal conclusions.</li></ul>`)}`;
}

const VIEWS = { command: viewCommand, companies: viewCompanies, regulatory: viewRegulatory, disclosure: viewDisclosure, forensics: viewForensics, litigation: viewLitigation, evidence: viewEvidence, paper: viewPaper, audit: viewAudit, activation: viewActivation, data: viewData, guide: viewGuide };

/* ================= modals ================= */
function modalHtml() {
  const m = App.ui.modal; if (!m) return "";
  let body = "", title = m.title || "";
  if (m.type === "confirm") { title = "Please confirm"; body = `<p>${esc(m.msg)}</p><div class="formbar"><button class="btn primary" data-act="confirmYes" id="confirm-yes">Confirm</button><button class="btn" data-act="modalClose">Cancel</button></div>`; }
  else if (m.type === "copy") { body = `<p class="small">${esc(m.note || "")}</p><textarea id="copy-text" rows="14" readonly>${esc(m.text)}</textarea><div class="formbar"><button class="btn primary" data-act="copyText">Copy to clipboard</button><button class="btn" data-act="modalClose">Close</button></div>`; }
  else if (m.type === "newIssue") {
    title = "New issue from template"; const cos = W().companies; const docs = W().doctrines;
    body = cos.length ? `<form data-sub="createIssue"><div class="ff"><label for="ni-co">Company</label>${selectHtml("ni-co", cos.map(c => c.id), scopeCompany() || cos[0].id, "", cos.map(c => raw(c.name)))}</div>
      <div class="ff"><label for="ni-title">Issue title</label><input id="ni-title" required placeholder="e.g., Rule 10b-5: demand statements"></div>
      <div class="ff"><label for="ni-tpl">Claim template</label>${selectHtml("ni-tpl", Object.keys(TEMPLATES), "10B5", "", Object.keys(TEMPLATES).map(k => TEMPLATES[k].name + " (" + TEMPLATES[k].els.length + " elements)"))}</div>
      <div class="ff"><label for="ni-doc">Doctrine</label>${selectHtml("ni-doc", [""].concat(docs.map(d => d.id)), "", "", ["— none —"].concat(docs.map(d => trunc(d.subtopic || d.topic, 50))))}</div>
      <div class="formbar"><button class="btn primary" type="submit">Create issue and elements</button><button class="btn" type="button" data-act="modalClose">Cancel</button></div><div id="ni-errors" class="errors" role="alert"></div></form>` : `<p>Add a company first.</p><div class="formbar"><button class="btn" data-act="modalClose">Close</button></div>`;
  } else if (m.type === "companyImport") {
    title = "Import company list"; body = `<p class="small">One company per line; optional "Name | Ticker". Only names and tickers are recorded.</p><textarea id="ci-text" rows="8"></textarea><div class="formbar"><button class="btn primary" data-act="modalCompanies">Create records</button><button class="btn" data-act="modalClose">Cancel</button></div><div id="ci-errors" class="errors" role="alert"></div>`;
  } else if (m.type === "scoreEvidence") {
    const c = byId("companies", m.id); const crit = CRITERIA.find(x => x[0] === m.c); const sel = ((c.scores || {})[m.c] || {}).evidence_ids || [];
    const evs = W().evidence.filter(e => e.company_id === m.id);
    title = "Evidence for: " + crit[1];
    body = evs.length ? `<form data-sub="saveScoreEvidence"><div class="evpick">${evs.map(e => `<label class="chk"><input type="checkbox" name="sev" value="${esc(e.id)}"${sel.includes(e.id) ? " checked" : ""}> ${stPill(e.verification_status)} <span class="small">${esc(trunc(e.proposition, 120))}</span></label>`).join("")}</div><div class="formbar"><button class="btn primary" type="submit">Save links</button><button class="btn" type="button" data-act="modalClose">Cancel</button></div></form>`
      : `<p>This company has no evidence records yet. A score cannot be supported until evidence exists.</p><div class="formbar"><button class="btn" data-act="newFromModal" data-e="evidence">Add evidence</button><button class="btn" data-act="modalClose">Close</button></div>`;
  } else if (m.type === "clearReal") {
    title = "Clear the Real workspace"; body = `<p>This deletes every record in the Real workspace, from this page and from storage. Export a backup first.</p><div class="ff"><label for="clear-confirm">Type DELETE to confirm</label><input id="clear-confirm" autocomplete="off"></div><div class="formbar"><button class="btn danger" data-act="clearReal">Delete all real records</button><button class="btn" data-act="modalClose">Cancel</button></div><div id="clear-errors" class="errors" role="alert"></div>`;
  } else if (m.type === "validity") {
    const a = byId("authorities", m.id); title = "Record the basis for this validity status";
    body = `<p class="small">${esc(a ? a.short_name : m.id)} → <strong>${esc(String(m.to).replace(/_/g, " "))}</strong>. State what established it (e.g., "KeyCite by me 2026-12-01: no negative treatment" or the decision that overruled it).</p><form data-sub="saveValidity"><div class="ff"><label for="val-basis">Basis</label><textarea id="val-basis" rows="3" required></textarea></div><div class="ff"><label for="val-method">Verification method</label><input id="val-method" placeholder="e.g., KeyCite, Shepard's, read opinion"></div><div class="formbar"><button class="btn primary" type="submit">Save status</button><button class="btn" type="button" data-act="modalClose">Cancel</button></div><div id="val-errors" class="errors" role="alert"></div></form>`;
  }
  return `<div class="overlay" data-act="modalBackdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${body}</div></div>`;
}

/* ================= event wiring ================= */
function parseCompanyLines(text) {
  const existing = new Set(W().companies.map(c => String(raw(c.name) || "").toLowerCase().trim()));
  const seen = new Set();
  return String(text || "").split(/\r?\n/).map(l => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim()).filter(Boolean).map(l => { const [name, ticker] = l.split("|").map(x => (x || "").trim()); const key = name.toLowerCase(); const dup = existing.has(key) || seen.has(key); seen.add(key); return { name, ticker: ticker || "", dup }; });
}
function createCompanies(list) {
  const add = list.filter(p => !p.dup && p.name);
  mutate(["companies"], ws => add.forEach(p => ws.companies.push({ id: uniqueId(ws, "companies"), name: p.name, ticker: p.ticker, cik: "", entity_type: "Unknown", reporting_status: "Unknown", industry: "", securities_activities: "", us_nexus: "", perspective_fit: "Unknown", summary: "", source_note: "Imported from professor's list " + todayIso(), scores: {} })));
  return add.length;
}

const ACT = {
  sort(d) { const cur = App.ui.sort[d.t]; App.ui.sort[d.t] = { k: d.k, d: cur && cur.k === d.k ? -cur.d : 1 }; render(); },
  expand(d) { const k = d.t + ":" + d.id; App.ui.expanded[k] = !App.ui.expanded[k]; render(); },
  open(d) { openDrawer(d.e, d.id, "view"); },
  openEdit(d) { openDrawer(d.e, d.id, "edit"); },
  closeDrawer() { App.ui.drawer = null; render(); },
  editDrawer() { App.ui.drawer.mode = "edit"; render(); },
  viewDrawer() { App.ui.drawer.mode = "view"; render(); },
  new(d) { const pre = {}; if (d.issue) pre.issue_id = d.issue; if (d.topic) pre.topic = d.topic; if (d.type) pre.event_type = d.type; if (d.e === "elements") Object.assign(pre, { status: "Unassessed", essential: true, evidence_ids: [] }); if (d.e === "tasks") Object.assign(pre, { status: "open", priority: "normal" }); newRecord(d.e, pre); },
  newFromModal(d) { App.ui.modal = null; newRecord(d.e, {}); },
  askDelete(d) { App.ui.modal = { type: "confirm", msg: "Delete " + d.id + "? Links to it in other records will be removed.", do: "delete", payload: { e: d.e, id: d.id } }; render(); },
  confirm(d) { App.ui.modal = { type: "confirm", msg: d.msg, do: d.do }; render(); },
  confirmYes() { const m = App.ui.modal; App.ui.modal = null; DO[m.do] && DO[m.do](m.payload); },
  modalClose() { App.ui.modal = null; render(); },
  modalBackdrop(d, el, e) { if (e.target === el) { App.ui.modal = null; render(); } },
  modal(d) { App.ui.modal = { type: d.type, id: d.id, c: d.c }; render(); },
  sub(d) { App.ui.sub[d.g] = d.v; render(); },
  switchKind(d) { App.kind = d.k; App.ui.drawer = null; App.ui.compare = []; App.ui.importPreview = null; try { localStorage.setItem("si_kind", d.k); } catch (e) { /* ignore */ } render(); },
  resetWeights() { mutate([], ws => { ws.settings.weights = Object.fromEntries(CRITERIA.map(c => [c[0], c[2]])); }); },
  clearCompare() { App.ui.compare = []; render(); },
  prio(d) {
    mutate(["issues"], ws => { const list = ws.issues.filter(i => !scopeCompany() || i.company_id === scopeCompany()).sort((x, y) => (Number(x.priority) || 99) - (Number(y.priority) || 99));
      const i = list.findIndex(x => x.id === d.id); const j = i + Number(d.d); if (j < 0 || j >= list.length) return; const t = list[i]; list[i] = list[j]; list[j] = t; list.forEach((x, n) => x.priority = n + 1); });
  },
  delRatio(d) { mutate([], ws => ws.settings.ratios.splice(Number(d.i), 1)); },
  loadCourse() {
    const pre = App.kind === "demo" ? "DEMO-" : ""; let nd = 0, na = 0;
    mutate(["doctrines", "authorities"], ws => {
      const aids = new Set(ws.authorities.map(a => a.id)); const lib = Object.fromEntries(SUPPLEMENTAL_AUTHORITIES.map(a => [a.authority_id, a]));
      const dids = new Set(ws.doctrines.map(d => d.id));
      COURSE_DOCTRINES.forEach(d => {
        const id = pre + d.id; if (dids.has(id)) return;
        const rec = Object.assign({}, d, { id, case_ids: d.case_ids.map(c => pre + c) });
        d.case_ids.forEach(c => { if (!aids.has(pre + c) && lib[c]) { ws.authorities.push(authorityFromLibrary(lib[c], pre + c)); aids.add(pre + c); na++; } });
        ws.doctrines.push(rec); nd++;
      });
      if ((Number(ws.settings.course_docs_ingested) || 0) < COURSE_META.files) ws.settings.course_docs_ingested = COURSE_META.files;
    });
    toast(nd ? `Loaded ${nd} doctrines and ${na} linked authorities from the course index.` : "The course doctrine index is already loaded.", "ok");
  },
  loadLibrary() {
    let added = 0; mutate(["authorities"], ws => { const ids = new Set(ws.authorities.map(a => a.id)); SUPPLEMENTAL_AUTHORITIES.forEach(a => { const id = (App.kind === "demo" ? "DEMO-" : "") + a.authority_id; if (!ids.has(id)) { ws.authorities.push(authorityFromLibrary(a, id)); added++; } }); });
    toast(added ? "Added " + added + " supplemental authorities (all need verification)." : "The library is already loaded.", "ok");
  },
  exportJson() { offerFile("securities-intelligence-" + App.kind + "-" + todayIso() + ".json", exportJson()); },
  exportSample() { const d = buildDemo(); offerFile("securities-intelligence-sample-FICTIONAL.json", JSON.stringify(Object.assign({ export_note: "FICTIONAL DEMONSTRATION DATA" }, d), null, 2)); },
  exportCsv(d) { offerFile(d.e + "-" + App.kind + "-" + todayIso() + ".csv", exportCsv(d.e)); },
  async copyText() { const t = document.getElementById("copy-text"); try { await navigator.clipboard.writeText(t.value); toast("Copied.", "ok"); } catch (e) { t.select(); toast("Copy was blocked — the text is selected; press Ctrl/Cmd+C.", "warn"); } },
  applyImport(d) {
    const p = App.ui.importPreview; if (!p) return;
    if (p.csv) { const e = p.csv; let n = 0, u = 0; mutate([e], ws => { p.ws[e].forEach(r => { const i = ws[e].findIndex(x => x.id === r.id); if (i < 0) { ws[e].push(r); n++; } else if (d.m === "upsert") { Object.assign(ws[e][i], r); u++; } }); }); App.ui.importPreview = null; render(); toast("Imported " + n + " new" + (u ? ", updated " + u : "") + " " + ENTITIES[e].label.toLowerCase() + ".", "ok"); }
    else applyImport(p, "merge");
  },
  cancelImport() { App.ui.importPreview = null; render(); },
  previewCompanies() { const el = document.getElementById("co-paste"); App.ui.companyPaste = el ? el.value : ""; App.ui.companyPreview = parseCompanyLines(App.ui.companyPaste); if (!App.ui.companyPreview.length) toast("Paste at least one company name.", "warn"); render(); },
  createCompanies() { const n = createCompanies(App.ui.companyPreview || []); App.ui.companyPreview = null; App.ui.companyPaste = ""; toast("Created " + n + " company record(s).", "ok"); },
  modalCompanies() { const t = document.getElementById("ci-text").value; const list = parseCompanyLines(t); if (!list.length) { document.getElementById("ci-errors").textContent = "Paste at least one company name."; return; } App.ui.modal = null; const n = createCompanies(list); toast("Created " + n + " company record(s); " + (list.length - n) + " duplicate(s) skipped.", "ok"); },
  clearReal() { const v = (document.getElementById("clear-confirm") || {}).value; if (v !== "DELETE") { document.getElementById("clear-errors").textContent = "Type DELETE exactly to confirm."; return; } App.ui.modal = null; App.kinds.real = emptyWorkspace("real"); if (App.kind === "real") App.ui.drawer = null; if (App.ready) Store.saveAll("real"); render(); toast("Real workspace cleared.", "ok"); }
};
const DO = {
  delete(p) { deleteRecord(p.e, p.id); },
  resetDemo() { App.kinds.demo = buildDemo(); if (App.ready) Store.saveAll("demo"); App.ui.drawer = null; render(); toast("Demo data reset.", "ok"); },
  importReplace() { applyImport(App.ui.importPreview, "replace"); },
  activate() {
    mutate(["tasks"], ws => {
      ws.settings.system_state = "ACTIVATED"; ws.settings.phase = "Assignment intake"; const a = ws.assignment;
      const t = (title, pr) => ws.tasks.push({ id: uniqueId(ws, "tasks"), title, status: "open", priority: pr, company_id: "", issue_id: "", due: "", notes: "Created at activation " + todayIso() });
      t("Read the entire assignment and confirm every requirement's status", "critical");
      t("Confirm permitted AI use: " + (a.ai_restrictions.status === "provided" ? trunc(a.ai_restrictions.value, 80) : "not yet provided"), "critical");
      if (a.company_list.status === "provided") t("Create and screen every company on the professor's list", "critical");
      t("Confirm page-limit counting rules (footnotes, title page, appendices)", "high");
      t("Confirm citation style: " + (a.citation_style.status === "provided" ? a.citation_style.value : "pending"), "high");
      if (a.source_restrictions.status === "provided") t("Apply research source restrictions to every workflow", "critical");
    });
    toast("Exam workflow activated.", "ok");
  },
  deactivate() { mutate([], ws => { ws.settings.system_state = "PRE_EXAM"; ws.settings.phase = "Pre-exam build"; }); }
};

const CHG = {
  filter(d, el) { App.ui.filters[d.t] = App.ui.filters[d.t] || {}; App.ui.filters[d.t][d.k] = el.value; render(); },
  filterchk(d, el) { App.ui.filters[d.t] = App.ui.filters[d.t] || {}; App.ui.filters[d.t][d.k] = el.checked; render(); },
  scope(d, el) { mutate([], ws => { ws.settings.selected_company = el.value; }); },
  setField(d, el) { setField(d.e, d.id, d.k, el.value); },
  setValidity(d, el) { const a = byId("authorities", d.id); if (el.value === "verification_pending") { setField("authorities", d.id, "current_validity", el.value); return; } App.ui.modal = { type: "validity", id: d.id, to: el.value, from: a.current_validity }; render(); },
  settings(d, el) { mutate([], ws => { ws.settings[d.k] = el.value; }); },
  settingsNum(d, el) { mutate([], ws => { ws.settings[d.k] = el.value === "" ? null : Number(el.value); }); },
  readiness(d, el) { mutate([], ws => { ws.settings.readiness_manual[d.k] = el.checked; }); },
  redteam(d, el) { mutate([], ws => { ws.settings.redteam = ws.settings.redteam || {}; ws.settings.redteam[d.k] = el.value; }); },
  weight(d, el) { mutate([], ws => { ws.settings.weights[d.k] = Math.max(0, Number(el.value) || 0); }); },
  compare(d, el) { const s = new Set(App.ui.compare); if (el.checked) { if (s.size >= 3) { el.checked = false; toast("Compare up to three companies.", "warn"); return; } s.add(d.id); } else s.delete(d.id); App.ui.compare = Array.from(s); render(); },
  score(d, el) { mutate(["companies"], ws => { const c = ws.companies.find(x => x.id === d.id); c.scores = c.scores || {}; c.scores[d.c] = Object.assign({ evidence_ids: [], note: "" }, c.scores[d.c] || {}, { score: el.value === "" ? null : Number(el.value) }); }); },
  scoreNote(d, el) { mutate(["companies"], ws => { const c = ws.companies.find(x => x.id === d.id); c.scores = c.scores || {}; c.scores[d.c] = Object.assign({ score: null, evidence_ids: [] }, c.scores[d.c] || {}, { note: el.value }); }); },
  ui(d, el) { App.ui[d.k] = el.value; render(); },
  importJson(d, el) { const f = el.files && el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { App.ui.importPreview = prepareImport(String(r.result), f.name); if (App.ui.importPreview.errors && !App.ui.importPreview.ws) App.ui.importPreview = Object.assign({ warnings: [], migrations: [], counts: [] }, App.ui.importPreview); render(); }; r.onerror = () => toast("Could not read that file.", "bad"); r.readAsText(f); },
  importCsv(d, el) {
    const f = el.files && el.files[0]; if (!f) return; const ent = App.ui.csvEntity || "evidence";
    const r = new FileReader(); r.onload = () => { const res = csvToRecords(ent, String(r.result)); const ws = { schema_version: SCHEMA_VERSION }; ws[ent] = res.records;
      const v = validateWorkspace(Object.assign(emptyWorkspace(App.kind), W(), { [ent]: W()[ent].filter(x => !res.records.some(y => y.id === x.id)).concat(res.records) }), App.kind);
      const errs = res.errors.filter(e => !/^Unknown columns/.test(e)).concat(v.errors.filter(e => res.records.some(x => e.indexOf(x.id) === 0)));
      App.ui.importPreview = { ws, csv: ent, errors: errs, warnings: res.errors.filter(e => /^Unknown columns/.test(e)).concat(v.warnings.filter(w => res.records.some(x => w.indexOf(x.id) === 0))), migrations: [], counts: [[ent, res.records.length]], filename: f.name };
      render(); }; r.readAsText(f);
  }
};

const SUB = {
  saveDrawer() { saveDrawer(); },
  addRatio() { const name = document.getElementById("r-name").value.trim(); if (!name) { toast("Name the ratio.", "warn"); return; } const r = { name, num: document.getElementById("r-num").value, den: document.getElementById("r-den").value, mult: Number(document.getElementById("r-mult").value) || 1 }; mutate([], ws => ws.settings.ratios.push(r)); },
  saveThesis() { const t = document.getElementById("thesis-text").value.trim(); mutate([], ws => { if (has(ws.settings.thesis) && ws.settings.thesis !== t) ws.settings.thesis_history.unshift({ at: nowIso(), text: ws.settings.thesis }); ws.settings.thesis = t; }); toast("Thesis saved.", "ok"); },
  saveAssignment() {
    const errs = [];
    const vals = ASSIGNMENT_FIELDS.map(f => { const st = document.getElementById("ass-" + f[0]).value; const v = document.getElementById("as-" + f[0]).value; if (st === "provided" && !v.trim()) errs.push(f[1] + ": marked provided but empty."); return [f[0], { status: st, value: v }]; });
    if (errs.length) { document.getElementById("assign-errors").innerHTML = errs.map(esc).join("<br>"); return; }
    mutate([], ws => vals.forEach(([k, v]) => ws.assignment[k] = v)); toast("Requirements saved.", "ok");
  },
  createIssue() {
    const co = document.getElementById("ni-co").value, title = document.getElementById("ni-title").value.trim(), tpl = document.getElementById("ni-tpl").value, doc = document.getElementById("ni-doc").value;
    if (!title) { document.getElementById("ni-errors").textContent = "Give the issue a title."; return; }
    let id; mutate(["issues", "elements"], ws => { id = uniqueId(ws, "issues"); const rec = { id, company_id: co, title, template: tpl, doctrine_id: doc, reach: "", controlling_perspective: "Undecided", private_right: TEMPLATES[tpl].private_right, severity: "Unknown", severity_rationale: "", exposure: "Unknown", conclusion: "", conclusion_confidence: "Unknown", priority: ws.issues.length + 1, authority_ids: [], open_questions: "" };
      ws.issues.push(rec); afterCreate(ws, "issues", { id, template: tpl, private_right: rec.private_right }); App.ui.modal = null; App.ui.expanded["iss:" + id] = true; });
    toast("Issue created with " + TEMPLATES[tpl].els.length + " elements.", "ok");
  },
  saveScoreEvidence(d, form) { const m = App.ui.modal; const ids = Array.from(form.querySelectorAll('input[name="sev"]:checked')).map(x => x.value); mutate(["companies"], ws => { const c = ws.companies.find(x => x.id === m.id); c.scores = c.scores || {}; c.scores[m.c] = Object.assign({ score: null, note: "" }, c.scores[m.c] || {}, { evidence_ids: ids }); App.ui.modal = null; }); },
  saveValidity() { const m = App.ui.modal; const basis = document.getElementById("val-basis").value.trim(); if (basis.length < 10) { document.getElementById("val-errors").textContent = "Describe the basis in at least a short sentence."; return; } const method = document.getElementById("val-method").value.trim();
    mutate(["authorities", "verification_log"], ws => { const a = ws.authorities.find(x => x.id === m.id); logVerification(ws, "authorities", a.id, "current_validity", a.current_validity, m.to, basis); a.current_validity = m.to; a.validity_basis = basis; if (method) { a.verification_method = method; a.verified_date = todayIso(); } App.ui.modal = null; }); }
};

function bindEvents() {
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    if (el.tagName === "TR" && e.target.closest("input,select,textarea,a,label,button")) return;
    if (el.tagName === "A") return;
    if (el.disabled) return;
    const fn = ACT[el.dataset.act]; if (!fn) return;
    fn(el.dataset, el, e);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if (App.ui.modal) { App.ui.modal = null; render(); } else if (App.ui.drawer) { App.ui.drawer = null; render(); } return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("th[data-act], g[data-act]")) { e.preventDefault(); const fn = ACT[e.target.dataset.act]; fn && fn(e.target.dataset, e.target, e); }
  });
  document.addEventListener("change", e => { const el = e.target.closest("[data-chg]"); if (!el) return; const fn = CHG[el.dataset.chg]; fn && fn(el.dataset, el, e); });
  let inputTimer;
  document.addEventListener("input", e => {
    const el = e.target.closest("[data-inp]"); if (!el) return;
    if (el.dataset.inp === "search") { App.ui.search[el.dataset.t] = el.value; clearTimeout(inputTimer); inputTimer = setTimeout(render, 160); }
    if (el.dataset.inp === "companyPaste") App.ui.companyPaste = el.value;
  });
  document.addEventListener("submit", e => { const f = e.target.closest("form[data-sub]"); if (!f) return; e.preventDefault(); const fn = SUB[f.dataset.sub]; fn && fn(f.dataset, f, e); });
  window.addEventListener("hashchange", route);
}
function route() { const h = (location.hash || "").replace("#", ""); App.tab = VIEWS[h] ? h : "command"; App.ui.drawer = null; render(); const m = document.getElementById("main"); if (m) m.scrollTop = 0; }

async function boot() {
  App.kinds.demo = buildDemo(); App.kinds.real = emptyWorkspace("real");
  let pref = null; try { pref = localStorage.getItem("si_kind"); } catch (e) { /* ignore */ }
  App.kind = pref === "real" || pref === "demo" ? pref : "demo";
  bindEvents(); route();
  await Store.init(); onStoreStatus();
  for (const k of ["real", "demo"]) {
    try { const ws = await Store.load(k); if (ws) App.kinds[k] = migrate(ws).ws; }
    catch (e) { toast("Could not load the " + k + " workspace from storage: " + (e.message || e.code || "error") + ". Showing defaults.", "bad"); }
  }
  if (!pref && App.kinds.real && ENTITY_KEYS.some(k => App.kinds.real[k].length)) App.kind = "real";
  App.ready = true; render(); onStoreStatus();
}
if (typeof window !== "undefined" && !window.__SI_NO_BOOT) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot(); }
