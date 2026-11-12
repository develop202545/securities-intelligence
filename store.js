/* Persistence (static GitHub Pages build): browser localStorage → memory only if storage is blocked.
   The database code paths below are inert here (no database is ever connected).
   DB layout per workspace kind (real | demo):
     ws/<kind>/meta/manifest          {schema_version, updated, chunks:{entity:n}, settings, assignment, meta}
     ws/<kind>/ent/<entity>~<n>       {json: "<JSON array slice>"}   (chunked to stay under 256 KiB)  */

const Store = {
  mode: "starting",       // starting | db | local | memory
  db: null,
  downloads: null,
  canWrite: true,
  status: "Connecting to storage…",
  lastSaved: null,
  timers: {},
  pending: {},
  writing: {},
  CHUNK: 150000,

  async init() {
    /* Static-site build: no host database or host download service. Data lives in this browser's localStorage;
       exports use normal browser downloads (see download()). */
    const db = null;
    this.downloads = null;
    if (db) { this.db = db; this.mode = "db"; this.status = "Saved to project database"; }
    else if (this.localOk()) { this.mode = "local"; this.status = "Browser storage only — export backups"; }
    else { this.mode = "memory"; this.status = "Not saved — export a backup before leaving"; }
    return this.mode;
  },

  localOk() { try { const k = "__si_t"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; } catch (e) { return false; } },

  async load(kind) {
    if (this.mode === "db") {
      try {
        const snap = await withTimeout(this.db.doc("ws/" + kind + "/meta/manifest").get(), 10000);
        if (!snap.exists) return null;
        const man = snap.data();
        const ws = { schema_version: man.schema_version, meta: man.meta, settings: man.settings, assignment: man.assignment };
        for (const ent of ENTITY_KEYS) {
          const n = (man.chunks && man.chunks[ent]) || 0; let arr = [];
          for (let i = 0; i < n; i++) {
            const s = await withTimeout(this.db.doc("ws/" + kind + "/ent/" + ent + "~" + i).get(), 10000);
            if (s.exists) arr = arr.concat(JSON.parse(s.data().json || "[]"));
          }
          ws[ent] = arr;
        }
        this._chunks = this._chunks || {}; this._chunks[kind] = Object.assign({}, man.chunks || {});
        return ws;
      } catch (e) {
        this.status = "Database unreachable — using browser copy"; this.mode = this.localOk() ? "local" : "memory";
      }
    }
    if (this.mode === "local") {
      try { const raw = localStorage.getItem("si_ws_" + kind); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    }
    return null;
  },

  /* Schedule a save of the given entities (or "all"). Coalesces bursts. */
  schedule(kind, ws, entities) {
    this.pending[kind] = this.pending[kind] || new Set();
    (entities === "all" ? ENTITY_KEYS.concat(["_meta"]) : entities.concat(["_meta"])).forEach(e => this.pending[kind].add(e));
    clearTimeout(this.timers[kind]);
    this.status = this.mode === "db" ? "Saving…" : this.status;
    this.timers[kind] = setTimeout(() => this.flush(kind), 700);
  },

  async flush(kind) {
    const ws = App.kinds[kind];   /* always write the current object for this workspace */
    if (!ws) return;
    if (this.writing[kind]) { this.timers[kind] = setTimeout(() => this.flush(kind), 500); return; }
    const todo = Array.from(this.pending[kind] || []); this.pending[kind] = new Set();
    if (!todo.length) return;
    this.writing[kind] = true;
    try {
      if (this.mode === "db" && this.canWrite) {
        this._chunks = this._chunks || {}; const chunks = this._chunks[kind] = this._chunks[kind] || {};
        for (const ent of todo) {
          if (ent === "_meta") continue;
          const parts = chunkArray(ws[ent] || [], this.CHUNK);
          for (let i = 0; i < parts.length; i++) await this.db.doc("ws/" + kind + "/ent/" + ent + "~" + i).set({ json: parts[i] });
          const old = chunks[ent] || 0;
          for (let i = parts.length; i < old; i++) await this.db.doc("ws/" + kind + "/ent/" + ent + "~" + i).delete();
          chunks[ent] = parts.length;
        }
        await this.db.doc("ws/" + kind + "/meta/manifest").set({ schema_version: ws.schema_version, updated: nowIso(), chunks: chunks,
          meta: ws.meta, settings: ws.settings, assignment: ws.assignment });
        this.status = "Saved to project database";
      } else if (this.mode === "local") {
        localStorage.setItem("si_ws_" + kind, JSON.stringify(ws));
        this.status = "Saved in this browser only — export backups";
      }
      this.lastSaved = nowIso();
    } catch (e) {
      const code = e && e.code;
      if (code === "invalid_argument" && this.mode === "db") { this.canWrite = false; this.status = "Read-only: you cannot save changes to this shared copy"; }
      else if (code === "quota_exceeded") this.status = "Storage full — export a backup and remove old records";
      else this.status = "Save failed (" + (code || (e && e.message) || "error") + ") — export a backup";
      if (this.localOk()) { try { localStorage.setItem("si_ws_" + kind, JSON.stringify(ws)); } catch (e2) { /* ignore */ } }
    } finally {
      this.writing[kind] = false;
      if (typeof onStoreStatus === "function") onStoreStatus();
    }
  },

  async saveAll(kind) { clearTimeout(this.timers[kind]); this.pending[kind] = new Set(ENTITY_KEYS.concat(["_meta"])); await this.flush(kind); },

  /* File output: downloads capability when present; otherwise caller shows copy dialog. */
  async download(filename, text) {
    if (!this.downloads) {
      /* Standalone file (not inside a sandboxed frame): use a normal browser download. */
      let top = false; try { top = window.top === window.self; } catch (e) { top = false; }
      if (top && typeof Blob !== "undefined" && window.URL && URL.createObjectURL) {
        try {
          const blob = new Blob([text], { type: filename.endsWith(".csv") ? "text/csv" : "application/json" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename;
          document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
          return { ok: true };
        } catch (e) { /* fall through to copy dialog */ }
      }
      return { ok: false, reason: "unavailable" };
    }
    try { await this.downloads.save({ filename: filename, data: text }); return { ok: true }; }
    catch (e) { return { ok: false, reason: (e && (e.code || e.message)) || "declined" }; }
  }
};

function chunkArray(arr, maxChars) {
  const parts = []; let cur = []; let size = 2;
  arr.forEach(r => {
    const s = JSON.stringify(r).length + 1;
    if (cur.length && size + s > maxChars) { parts.push(JSON.stringify(cur)); cur = []; size = 2; }
    cur.push(r); size += s;
  });
  if (cur.length || !parts.length) parts.push(JSON.stringify(cur));
  return parts;
}

function withTimeout(p, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject({ code: "timeout", message: "Timed out" }), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}
