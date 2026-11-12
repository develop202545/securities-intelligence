/* FICTIONAL DEMONSTRATION DATASET — every company, filing, person, figure and price below is invented.
   All IDs carry the DEMO- prefix. Market prices are synthetic (seeded random walk) and exist only to test calculations. */

function buildDemo() {
  const ws = emptyWorkspace("demo");
  const T = "2026-11-11T12:00:00-06:00";
  ws.meta.created = T; ws.meta.updated = T;
  Object.assign(ws.settings, {
    phase: "Pre-exam build", selected_company: "DEMO-CO-NWX", course_docs_expected: 10, course_docs_ingested: 7,
    ratios: [{ name: "Backlog / revenue", num: "Backlog", den: "Revenue", mult: 1 }, { name: "DSO (days)", num: "Accounts receivable", den: "Revenue", mult: 91 }],
    thesis: "DEMO: Northwind's FY2025 'robust demand' statements were actionable half-truths because contemporaneous backlog data contradicted them, but loss-causation attribution for the April 15, 2026 decline is contested by a confounding guidance cut.",
    thesis_history: [{ at: "2026-11-08T10:00:00-06:00", text: "DEMO: Northwind misled investors about demand." }],
    perspective: "Opposing / plaintiff counsel",
    readiness_manual: { "Primary-source research workflows exist": true, "Evidence and citation records import/export": true },
    redteam: { "No allegation converted into a finding": "pass", "Causation adequately supported": "fail", "Every quotation and citation genuine": "not_started" }
  });
  const D = s => "DEMO-" + s;

  /* ---------------- Companies ---------------- */
  ws.companies = [
    { id: D("CO-NWX"), name: "Northwind Exemplar Corp. (fictional)", ticker: "NWXF", cik: { $s: "not_applicable", note: "Fictional company" }, entity_type: "Operating issuer (SEC reporting)",
      reporting_status: "Exchange Act §12(b) registrant", industry: "Industrial sensors", securities_activities: "Listed common stock; S-8 equity plans; no registered offering in window.",
      us_nexus: "Fictional U.S. exchange listing — Morrison satisfied in the hypothetical.", perspective_fit: "Plaintiff-side stronger",
      summary: "Demand statements in FY2025 filings vs. declining backlog; CFO sales before April 2026 corrective earnings release.", source_note: "Fictional demo",
      scores: { course: { score: 5, evidence_ids: [D("EV-NWX-0001"), D("EV-NWX-0002")], note: "Classic 10b-5 half-truth fact pattern." },
        evidence: { score: 4, evidence_ids: [D("EV-NWX-0001"), D("EV-NWX-0002"), D("EV-NWX-0003")], note: "Filed statements and audited notes." },
        argument: { score: 4, evidence_ids: [D("EV-NWX-0005"), D("EV-NWX-0008")], note: "Strong defenses on puffery and confounding guidance." },
        financial: { score: 4, evidence_ids: [D("EV-NWX-0002"), D("EV-NWX-0009")], note: "" },
        thesis: { score: 3, evidence_ids: [D("EV-NWX-0006")], note: "" },
        fit: { score: 4, evidence_ids: [D("EV-NWX-0001")], note: "Two to three issues fit 12–15 pages." } } },
    { id: D("CO-CVB"), name: "Corvid Biotherapeutics, Inc. (fictional)", ticker: "CVBF", cik: { $s: "not_applicable", note: "Fictional company" }, entity_type: "Operating issuer (SEC reporting)",
      reporting_status: "Exchange Act §12(b) registrant", industry: "Biotechnology", securities_activities: "S-3 shelf takedown (follow-on offering) in March 2026.",
      us_nexus: "Fictional U.S. listing.", perspective_fit: "Either", summary: "Follow-on prospectus described Phase 2 enrollment as 'on track' while a clinical hold notice was pending.",
      source_note: "Fictional demo",
      scores: { course: { score: 4, evidence_ids: [D("EV-CVB-0001")], note: "§11 / §12(a)(2) plus Omnicare opinion analysis." },
        evidence: { score: 3, evidence_ids: [D("EV-CVB-0001"), D("EV-CVB-0002")], note: "" },
        argument: { score: null, evidence_ids: [], note: "" }, financial: { score: 2, evidence_ids: [], note: "Scored without evidence — excluded until linked." },
        thesis: { score: null, evidence_ids: [], note: "" }, fit: { score: 3, evidence_ids: [D("EV-CVB-0001")], note: "" } } },
    { id: D("CO-HLL"), name: "Halcyon Ledger Labs, Inc. (fictional)", ticker: { $s: "not_applicable", note: "Private company" }, cik: { $s: "missing", note: "No Form D located" },
      entity_type: "Digital-asset business", reporting_status: "Non-reporting / private", industry: "Blockchain infrastructure",
      securities_activities: "2025 token pre-sale (SAFT-like agreements) and 2026 public token distribution.", us_nexus: { $s: "disputed", note: "Purchasers in U.S. and abroad; geofencing claims unverified." },
      perspective_fit: "Either", summary: "Token sale marketing emphasized team efforts and price appreciation; classification under the March 2026 SEC taxonomy is contested.",
      source_note: "Fictional demo",
      scores: { course: { score: 4, evidence_ids: [D("EV-HLL-0001")], note: "Howey / §5." }, evidence: { score: 2, evidence_ids: [D("EV-HLL-0001")], note: "Mostly marketing materials." },
        argument: { score: 4, evidence_ids: [], note: "Unsupported score — excluded." }, financial: { score: null, evidence_ids: [], note: "" }, thesis: { score: null, evidence_ids: [], note: "" }, fit: { score: null, evidence_ids: [], note: "" } } },
    { id: D("CO-BRC"), name: "Bramble Ridge Capital Advisers LLC (fictional)", ticker: { $s: "not_applicable", note: "Private adviser" }, cik: "", entity_type: "Investment adviser",
      reporting_status: "Registered investment adviser", industry: "Wealth management", securities_activities: { $s: "unavailable", note: "Form ADV not yet reviewed" },
      us_nexus: "", perspective_fit: "In-house stronger", summary: "Revenue-sharing arrangement possibly under-disclosed in Form ADV Part 2A. Research not started.", source_note: "Fictional demo",
      scores: {} }
  ];

  /* ---------------- Doctrines (demo stand-ins until course notes are ingested) ---------------- */
  const doc = (id, topic, sub, statute, elements, pr, cases, extra) => Object.assign({ id: D(id), topic, subtopic: sub, statute, controlling_interpretation: "", case_ids: cases.map(c => D(c)),
    elements, defenses: "", distinctions: "", evidentiary_requirements: "", private_right: pr, enforcement: "", business_application: "", issue_patterns: "",
    course_reference: { $s: "missing", note: "Course notes not yet uploaded" }, course_relation: "course_not_yet_ingested", open_questions: "" }, extra || {});
  ws.doctrines = [
    doc("DOC-0001", "Securities fraud", "Rule 10b-5 private action", "Exchange Act §10(b); Rule 10b-5", "Misstatement/omission; materiality; scienter; connection; reliance; economic loss; loss causation", "Implied", ["AUTH-BASIC", "AUTH-TELLABS", "AUTH-DURA", "AUTH-MACQUARIE"],
      { defenses: "Puffery; safe harbor; truth-on-the-market; no price impact; no loss causation", issue_patterns: "Optimistic statements contradicted by internal metrics; insider sales before corrective news", enforcement: "SEC injunction, penalties, disgorgement" }),
    doc("DOC-0002", "Securities fraud", "Materiality", "Rule 10b-5; Securities Act §11", "Substantial likelihood a reasonable investor would consider it important (total mix); probability × magnitude for contingent events", "Unknown", ["AUTH-TSC", "AUTH-BASIC", "AUTH-MATRIXX"]),
    doc("DOC-0003", "Securities fraud", "Scienter and PSLRA pleading", "15 U.S.C. §78u-4(b)(2)", "Strong inference — cogent and at least as compelling as opposing inference", "Unknown", ["AUTH-HOCHFELDER", "AUTH-TELLABS"]),
    doc("DOC-0004", "Securities fraud", "Reliance and loss causation", "Rule 10b-5", "Fraud-on-the-market presumption; price impact; corrective disclosure", "Unknown", ["AUTH-BASIC", "AUTH-HALLIBURTON2", "AUTH-GOLDMAN", "AUTH-DURA"]),
    doc("DOC-0005", "Registration", "Section 11 liability", "Securities Act §11", "Misstatement in registration statement; materiality; traceability; statutory defendant", "Express", ["AUTH-OMNICARE", "AUTH-SLACK"]),
    doc("DOC-0006", "Registration", "Section 5 and exemptions; definition of a security", "Securities Act §§2(a)(1), 4, 5; Reg D", "Security; no registration; offer or sale; jurisdictional means; no exemption", "Express", ["AUTH-HOWEY", "AUTH-RALSTON"]),
    doc("DOC-0007", "Insider trading", "Classical, misappropriation, tipping", "Exchange Act §10(b); Rules 10b5-1, 10b5-2, 14e-3", "MNPI; trading while aware; duty; scienter", "Limited", ["AUTH-CHIARELLA", "AUTH-DIRKS", "AUTH-OHAGAN", "AUTH-SALMAN"]),
    doc("DOC-0008", "Secondary liability", "Control persons", "Exchange Act §20(a); Securities Act §15", "Primary violation; control; culpable participation (circuit split)", "Express", ["AUTH-CENTRALBANK", "AUTH-JANUS"]),
    doc("DOC-0009", "Enforcement", "SEC remedies", "Exchange Act §21(d)", "Injunction; penalties; disgorgement (net profits); bars", "None (SEC/DOJ only)", ["AUTH-LIU", "AUTH-JARKESY", "AUTH-SRIPETCH"])
  ];

  /* ---------------- Authorities: copies of supplemental library entries, DEMO-prefixed ---------------- */
  const pick = ["AUTH-BASIC", "AUTH-TSC", "AUTH-MATRIXX", "AUTH-HOCHFELDER", "AUTH-TELLABS", "AUTH-DURA", "AUTH-HALLIBURTON2", "AUTH-GOLDMAN", "AUTH-MACQUARIE", "AUTH-OMNICARE", "AUTH-SLACK",
    "AUTH-HOWEY", "AUTH-RALSTON", "AUTH-CHIARELLA", "AUTH-DIRKS", "AUTH-OHAGAN", "AUTH-SALMAN", "AUTH-CENTRALBANK", "AUTH-JANUS", "AUTH-LIU", "AUTH-JARKESY", "AUTH-SRIPETCH",
    "AUTH-R-10B5", "AUTH-SA-11", "AUTH-SA-5", "AUTH-REL-33-11412", "AUTH-PROP-10S", "AUTH-GOVIL"];
  ws.authorities = (typeof SUPPLEMENTAL_AUTHORITIES !== "undefined" ? SUPPLEMENTAL_AUTHORITIES : []).filter(a => pick.includes(a.authority_id)).map(a => ({
    id: D(a.authority_id), citation: a.citation, short_name: a.short_name, authority_type: a.authority_type, jurisdiction: a.jurisdiction, binding_force: a.binding_force,
    date_decided_or_effective: a.date_decided_or_effective || "", rule_or_holding: a.rule_or_holding, holding_source: a.holding_source, course_relation: "course_not_yet_ingested",
    course_explanation: "", current_validity: a.current_validity, validity_basis: a.validity_basis || "", verification_method: "", verified_date: "", pinpoints: "",
    issue_tags: (a.issue_ids || []).join(", "), source_url: a.source_url || "" }));
  const tellabs = ws.authorities.find(a => a.id === D("AUTH-TELLABS"));
  if (tellabs) Object.assign(tellabs, { holding_source: "opinion_text_verified", current_validity: "good_law_citator_checked", validity_basis: "FICTIONAL demo citator check",
    verification_method: "FICTIONAL demo: KeyCite by student", verified_date: "2026-11-09", pinpoints: "551 U.S. at 324 (demo pinpoint)" });

  /* ---------------- Documents ---------------- */
  const docu = (id, co, type, title, fd, pe, acc, rs, items) => ({ id: D(id), company_id: D(co), doc_type: type, title, filing_date: fd, period_end: pe, accession: acc,
    url: { $s: "not_applicable", note: "Fictional document" }, amends: "", items_reviewed: items || "", review_status: rs, notes: "" });
  ws.documents = [
    docu("DOCU-NWX-01", "CO-NWX", "10-Q", "Form 10-Q, Q3 FY2025", "2025-11-06", "2025-09-30", "DEMO-0000000000-25-000101", "reviewed", "Part I Item 2 (MD&A); Item 4"),
    docu("DOCU-NWX-02", "CO-NWX", "Earnings call transcript", "Q4 FY2025 earnings call", "2026-02-12", "2025-12-31", "DEMO-CALL-2026-02-12", "reviewed", "CEO prepared remarks; Q&A"),
    docu("DOCU-NWX-03", "CO-NWX", "10-K", "Form 10-K, FY2025", "2026-02-20", "2025-12-31", "DEMO-0000000000-26-000001", "partially_reviewed", "Items 1A, 7, 8 (Note 4), 9A"),
    docu("DOCU-NWX-04", "CO-NWX", "Form 4", "Form 4 — CFO J. Doe (fictional)", "2026-04-03", { $s: "not_applicable", note: "" }, "DEMO-0000000000-26-000044", "reviewed", "Table I"),
    docu("DOCU-NWX-05", "CO-NWX", "8-K", "Form 8-K Item 2.02 — Q1 FY2026 results", "2026-04-15", "2026-03-31", "DEMO-0000000000-26-000060", "reviewed", "Ex. 99.1"),
    docu("DOCU-NWX-06", "CO-NWX", "Press release", "Response to short-seller report", "2026-04-13", { $s: "not_applicable", note: "" }, "DEMO-PR-2026-04-13", "reviewed", "Para. 2"),
    docu("DOCU-CVB-01", "CO-CVB", "S-3", "Form S-3 shelf registration", "2025-08-14", { $s: "not_applicable", note: "" }, "DEMO-0000000000-25-000777", "partially_reviewed", "Risk factors"),
    docu("DOCU-CVB-02", "CO-CVB", "424B", "Prospectus supplement — follow-on offering", "2026-03-04", { $s: "not_applicable", note: "" }, "DEMO-0000000000-26-000301", "reviewed", "Business update; risk factors"),
    docu("DOCU-CVB-03", "CO-CVB", "8-K", "Form 8-K Item 8.01 — FDA clinical hold", "2026-03-27", { $s: "not_applicable", note: "" }, "DEMO-0000000000-26-000340", "reviewed", "Item 8.01"),
    docu("DOCU-HLL-01", "CO-HLL", "Whitepaper / offering terms", "Halcyon token whitepaper v2", "2025-06-01", { $s: "not_applicable", note: "" }, "DEMO-WP-2", "partially_reviewed", "Sections 3, 7"),
    docu("DOCU-HLL-02", "CO-HLL", "Form D", "Form D (searched — not found)", { $s: "missing", note: "No Form D located on EDGAR (fictional search)" }, { $s: "not_applicable", note: "" }, { $s: "missing", note: "" }, "not_reviewed", "")
  ];
  ws.documents[3].amends = "";

  /* ---------------- Evidence ---------------- */
  const ev = (id, co, o) => Object.assign({ id: D(id), company_id: D(co), proposition_scope: "truth_of_matter", url: { $s: "not_applicable", note: "Fictional document" },
    excerpt: "", excerpt_type: "paraphrase", accessed_date: "2026-11-11", accessed_by: "claude_from_upload", strength_rationale: "", issue_ids: [], element_ids: [],
    conflicts_with: [], limitations: "", confidence: "medium", event_date: "" }, o);
  ws.evidence = [
    ev("EV-NWX-0001", "CO-NWX", { proposition: "The FY2025 10-K stated that demand for the flagship product 'remains robust across all regions.'", proposition_class: "verified_fact", proposition_scope: "that_statement_was_made",
      source_title: "Form 10-K, FY2025", source_type: "sec_filing", document_id: D("DOCU-NWX-03"), filing_or_document_date: "2026-02-20", pinpoint: "Item 7 (MD&A), p. 41",
      excerpt: "remains robust across all regions", excerpt_type: "exact_quote", verification_status: "verified_from_source", supports_or_contradicts: "supports", evidentiary_strength: "strong",
      issue_ids: [D("ISS-NWX-10B5")], element_ids: [D("EL-NWX-10B5-1"), D("EL-NWX-10B5-2")], limitations: "Establishes the statement, not its falsity.", confidence: "high" }),
    ev("EV-NWX-0002", "CO-NWX", { proposition: "Flagship backlog fell 31% from Q3 to Q4 FY2025 ($412.0m to $284.3m) per the notes to the audited statements.", proposition_class: "verified_fact",
      source_title: "Form 10-K, FY2025", source_type: "sec_filing", document_id: D("DOCU-NWX-03"), filing_or_document_date: "2026-02-20", event_date: "2025-12-31", pinpoint: "Item 8, Note 4, p. F-18",
      excerpt: "Backlog $412.0m (Q3) → $284.3m (Q4)", excerpt_type: "data_value", verification_status: "verified_from_source", supports_or_contradicts: "supports", evidentiary_strength: "strong",
      issue_ids: [D("ISS-NWX-10B5")], element_ids: [D("EL-NWX-10B5-1"), D("EL-NWX-10B5-3")], limitations: "Seasonality and contract timing could explain part of the decline.", confidence: "high" }),
    ev("EV-NWX-0003", "CO-NWX", { proposition: "CFO sold 120,000 shares in open-market sales (code S) on 2026-04-01, nine trading days before the corrective release; Form 4 not marked as a Rule 10b5-1 trade.",
      proposition_class: "verified_fact", source_title: "Form 4 — CFO", source_type: "sec_filing", document_id: D("DOCU-NWX-04"), filing_or_document_date: "2026-04-03", event_date: "2026-04-01",
      pinpoint: "Table I, rows 1–3", excerpt: "S / 120,000 sh / $48.10 wtd. avg.", excerpt_type: "data_value", verification_status: "verified_from_source", supports_or_contradicts: "supports",
      evidentiary_strength: "moderate", strength_rationale: "Timing suggestive; baseline trading pattern not yet compared.", issue_ids: [D("ISS-NWX-10B5"), D("ISS-NWX-IT")],
      element_ids: [D("EL-NWX-10B5-4"), D("EL-NWX-IT-2")], limitations: "Unusualness not established.", confidence: "medium" }),
    ev("EV-NWX-0004", "CO-NWX", { proposition: "A short-seller report alleged management knew of order cancellations from the two largest customers by January 2026.", proposition_class: "third_party_allegation",
      source_title: "Short-seller report (fictional)", source_type: "analyst_or_short_report", filing_or_document_date: "2026-04-10", pinpoint: "pp. 3–5", verification_status: "secondary_report_only",
      supports_or_contradicts: "supports", evidentiary_strength: "weak", strength_rationale: "Interested party; sources unnamed.", issue_ids: [D("ISS-NWX-10B5")], element_ids: [D("EL-NWX-10B5-4")],
      conflicts_with: [D("EV-NWX-0005")], confidence: "low" }),
    ev("EV-NWX-0005", "CO-NWX", { proposition: "The company publicly denied that any top-ten customer cancelled orders before March 2026.", proposition_class: "verified_fact", proposition_scope: "that_statement_was_made",
      source_title: "Press release (fictional)", source_type: "company_press_release", document_id: D("DOCU-NWX-06"), filing_or_document_date: "2026-04-13", pinpoint: "Para. 2",
      verification_status: "verified_from_source", supports_or_contradicts: "contradicts", evidentiary_strength: "moderate", issue_ids: [D("ISS-NWX-10B5")], element_ids: [D("EL-NWX-10B5-4")],
      conflicts_with: [D("EV-NWX-0004")] }),
    ev("EV-NWX-0006", "CO-NWX", { proposition: "Hypothesis: the 'robust demand' statement was a half-truth because management had backlog data showing a material decline when the 10-K was filed.",
      proposition_class: "analytical_hypothesis", source_title: "System-generated analysis", source_type: "other", url: "", pinpoint: "", accessed_date: "", accessed_by: "",
      excerpt_type: "none", verification_status: "not_accessed", supports_or_contradicts: "supports", evidentiary_strength: "unassessed", issue_ids: [D("ISS-NWX-10B5")],
      element_ids: [D("EL-NWX-10B5-1")], limitations: "Timing of management knowledge not established.", confidence: "low" }),
    ev("EV-NWX-0007", "CO-NWX", { proposition: "Q1 FY2026 release disclosed order cancellations in two regions and cut full-year revenue guidance by 18%.", proposition_class: "verified_fact",
      source_title: "Form 8-K Ex. 99.1", source_type: "sec_filing", document_id: D("DOCU-NWX-05"), filing_or_document_date: "2026-04-15", event_date: "2026-04-15", pinpoint: "Ex. 99.1, paras. 1–3",
      verification_status: "verified_from_source", supports_or_contradicts: "supports", evidentiary_strength: "strong", issue_ids: [D("ISS-NWX-10B5")], element_ids: [D("EL-NWX-10B5-8")], confidence: "high" }),
    ev("EV-NWX-0008", "CO-NWX", { proposition: "The same release announced a CEO transition and a restructuring charge — potentially confounding information on the event day.", proposition_class: "verified_fact",
      source_title: "Form 8-K Ex. 99.1", source_type: "sec_filing", document_id: D("DOCU-NWX-05"), filing_or_document_date: "2026-04-15", pinpoint: "Ex. 99.1, paras. 6–7",
      verification_status: "verified_from_source", supports_or_contradicts: "contradicts", evidentiary_strength: "strong", strength_rationale: "Undermines attribution of the whole decline to the corrective information.",
      issue_ids: [D("ISS-NWX-10B5")], element_ids: [D("EL-NWX-10B5-8")], confidence: "high" }),
    ev("EV-NWX-0009", "CO-NWX", { proposition: "Synthetic demo price series shows a −14% market-adjusted move on 2026-04-15 (fictional).", proposition_class: "supported_inference",
      source_title: "DEMO synthetic market data", source_type: "market_data", pinpoint: "Market observations 2026-04-15", url: "", verification_status: "partially_accessed",
      supports_or_contradicts: "supports", evidentiary_strength: "moderate", issue_ids: [D("ISS-NWX-10B5")], element_ids: [D("EL-NWX-10B5-7"), D("EL-NWX-10B5-8")],
      limitations: "Synthetic data; no event study performed beyond market adjustment.", confidence: "medium" }),
    ev("EV-CVB-0001", "CO-CVB", { proposition: "The March 2026 prospectus supplement described Phase 2 enrollment as 'on track for topline data in Q4 2026.'", proposition_class: "verified_fact",
      proposition_scope: "that_statement_was_made", source_title: "424B prospectus supplement", source_type: "sec_filing", document_id: D("DOCU-CVB-02"), filing_or_document_date: "2026-03-04",
      pinpoint: "Prospectus Summary — Recent Developments, p. S-3", excerpt: "on track for topline data in Q4 2026", excerpt_type: "exact_quote", verification_status: "verified_from_source",
      supports_or_contradicts: "supports", evidentiary_strength: "strong", issue_ids: [D("ISS-CVB-S11")], element_ids: [D("EL-CVB-S11-1")], confidence: "high" }),
    ev("EV-CVB-0002", "CO-CVB", { proposition: "The company disclosed on 2026-03-27 that the FDA had placed the Phase 2 trial on clinical hold, with notice received 2026-02-26.", proposition_class: "verified_fact",
      source_title: "Form 8-K Item 8.01", source_type: "sec_filing", document_id: D("DOCU-CVB-03"), filing_or_document_date: "2026-03-27", event_date: "2026-02-26", pinpoint: "Item 8.01, para. 1",
      verification_status: "verified_from_source", supports_or_contradicts: "supports", evidentiary_strength: "strong", issue_ids: [D("ISS-CVB-S11")], element_ids: [D("EL-CVB-S11-1"), D("EL-CVB-S11-2")], confidence: "high" }),
    ev("EV-CVB-0003", "CO-CVB", { proposition: "Whether underwriters' diligence included FDA correspondence is unknown.", proposition_class: "unknown", source_title: "Research gap", source_type: "other", url: "", pinpoint: "",
      accessed_date: "", accessed_by: "", excerpt_type: "none", verification_status: "not_accessed", supports_or_contradicts: "neutral", evidentiary_strength: "unassessed",
      issue_ids: [D("ISS-CVB-S11")], element_ids: [D("EL-CVB-S11-4")], confidence: "low" }),
    ev("EV-HLL-0001", "CO-HLL", { proposition: "The whitepaper stated that the team's 'continued development will drive token value' and described a treasury buyback program.", proposition_class: "verified_fact",
      proposition_scope: "that_statement_was_made", source_title: "Token whitepaper v2", source_type: "company_website", document_id: D("DOCU-HLL-01"), filing_or_document_date: "2025-06-01",
      pinpoint: "§7, p. 14", excerpt: "continued development will drive token value", excerpt_type: "exact_quote", verification_status: "verified_from_source", supports_or_contradicts: "supports",
      evidentiary_strength: "moderate", issue_ids: [D("ISS-HLL-S5")], element_ids: [D("EL-HLL-S5-1")], confidence: "medium" }),
    ev("EV-HLL-0002", "CO-HLL", { proposition: "No Form D filing for the 2025 pre-sale was located (fictional search).", proposition_class: "verified_fact", source_title: "EDGAR search (fictional)", source_type: "sec_filing",
      document_id: D("DOCU-HLL-02"), filing_or_document_date: { $s: "not_applicable", note: "" }, pinpoint: "Company and full-text search, 2026-11-11", verification_status: "verified_from_source",
      supports_or_contradicts: "supports", evidentiary_strength: "moderate", strength_rationale: "Absence of Form D is a red flag but does not by itself defeat an exemption.",
      issue_ids: [D("ISS-HLL-S5")], element_ids: [D("EL-HLL-S5-5")] })
  ];

  /* ---------------- Issues + elements (from templates) ---------------- */
  const issue = (id, co, title, tpl, o) => Object.assign({ id: D(id), company_id: D(co), title, template: tpl, doctrine_id: "", reach: "", controlling_perspective: "Plaintiff",
    private_right: TEMPLATES[tpl].private_right, severity: "Unknown", severity_rationale: "", exposure: "Unknown", conclusion: "", conclusion_confidence: "Unknown", priority: 9,
    authority_ids: [], open_questions: "" }, o);
  ws.issues = [
    issue("ISS-NWX-10B5", "CO-NWX", "Rule 10b-5: 'robust demand' statements vs. declining backlog", "10B5", { doctrine_id: D("DOC-0001"), reach: "Listed common stock; statements in periodic reports and calls.",
      severity: "High", severity_rationale: "Multiple statements over two quarters; 18% guidance cut.", exposure: "Reasonably possible",
      conclusion: "Falsity and materiality reasonably supported; scienter contested; loss causation confounded by same-day CEO transition.", conclusion_confidence: "Medium", priority: 1,
      authority_ids: [D("AUTH-BASIC"), D("AUTH-TELLABS"), D("AUTH-DURA"), D("AUTH-MACQUARIE")], open_questions: "When did management receive Q4 backlog data? CFO trading baseline?" }),
    issue("ISS-NWX-IT", "CO-NWX", "Insider trading: CFO sales before corrective release", "IT", { doctrine_id: D("DOC-0007"), controlling_perspective: "Regulator", severity: "Moderate",
      exposure: "Possible", priority: 2, authority_ids: [D("AUTH-CHIARELLA"), D("AUTH-DIRKS")], open_questions: "Was the CFO aware of cancellations on 2026-04-01?" }),
    issue("ISS-NWX-CP", "CO-NWX", "§20(a) control-person liability: CEO and CFO", "CP", { doctrine_id: D("DOC-0008"), severity: "Moderate", priority: 3 }),
    issue("ISS-CVB-S11", "CO-CVB", "§11: 'on track' statement in prospectus while clinical hold notice pending", "S11", { doctrine_id: D("DOC-0005"), severity: "High", exposure: "Reasonably possible",
      reach: "Follow-on offering under S-3; statements in the registration statement as of the takedown.", priority: 4, authority_ids: [D("AUTH-OMNICARE"), D("AUTH-SLACK")],
      conclusion: "Strong falsity and materiality evidence; traceability likely satisfied for offering purchasers.", conclusion_confidence: "Medium" }),
    issue("ISS-HLL-S5", "CO-HLL", "§5 / §12(a)(1): unregistered token pre-sale", "S5", { doctrine_id: D("DOC-0006"), severity: "Moderate", exposure: "Possible", priority: 5,
      authority_ids: [D("AUTH-HOWEY"), D("AUTH-REL-33-11412")], open_questions: "Does the 2026 taxonomy treat the token as a digital commodity? Pre-sale purchasers' expectations?" }),
    issue("ISS-BRC-CMP", "CO-BRC", "Adviser conflict disclosure (Form ADV Part 2A)", "COMPLIANCE", { controlling_perspective: "Defense / in-house", severity: "Unknown", priority: 6 })
  ];
  const statusPlan = {
    "ISS-NWX-10B5": ["Supported by verified evidence", "Supported by verified evidence", "Supported by reasonable inference", "Contested", "Supported by verified evidence", "Supported by reasonable inference", "Supported by verified evidence", "Contested"],
    "ISS-NWX-IT": ["Contested", "Supported by verified evidence", "Supported by verified evidence", "Not established from available sources"],
    "ISS-NWX-CP": ["Contested", "Supported by verified evidence", "Unassessed"],
    "ISS-CVB-S11": ["Supported by verified evidence", "Supported by verified evidence", "Supported by reasonable inference", "Not established from available sources"],
    "ISS-HLL-S5": ["Contested", "Supported by verified evidence", "Supported by verified evidence", "Unassessed", "Contested"],
    "ISS-BRC-CMP": ["Unassessed", "Unassessed", "Unassessed"]
  };
  const evByEl = {
    "EL-NWX-10B5-1": ["EV-NWX-0001", "EV-NWX-0002", "EV-NWX-0006"], "EL-NWX-10B5-2": ["EV-NWX-0001"], "EL-NWX-10B5-3": ["EV-NWX-0002"], "EL-NWX-10B5-4": ["EV-NWX-0003", "EV-NWX-0004", "EV-NWX-0005"],
    "EL-NWX-10B5-5": ["EV-NWX-0001"], "EL-NWX-10B5-7": ["EV-NWX-0009"], "EL-NWX-10B5-8": ["EV-NWX-0007", "EV-NWX-0008", "EV-NWX-0009"],
    "EL-NWX-IT-2": ["EV-NWX-0003"], "EL-NWX-IT-3": ["EV-NWX-0003"], "EL-CVB-S11-1": ["EV-CVB-0001", "EV-CVB-0002"], "EL-CVB-S11-2": ["EV-CVB-0002"], "EL-CVB-S11-4": ["EV-CVB-0003"],
    "EL-HLL-S5-1": ["EV-HLL-0001"], "EL-HLL-S5-5": ["EV-HLL-0002"]
  };
  ws.elements = [];
  ws.issues.forEach(is => {
    const key = is.id.replace("DEMO-", "");
    const short = key.replace("ISS-", "");
    TEMPLATES[is.template].els.forEach((e, i) => {
      const elId = "EL-" + short + "-" + (i + 1);
      ws.elements.push({ id: D(elId), issue_id: is.id, code: e[0], label: e[1], essential: e[2], status: (statusPlan[key] || [])[i] || "Unassessed",
        evidence_ids: (evByEl[elId] || []).map(D), analysis: "", counter: "" });
    });
  });
  const el = id => ws.elements.find(e => e.id === D(id));
  Object.assign(el("EL-NWX-10B5-4"), { analysis: "Backlog data in the same filing plus CFO sales support an inference of recklessness.", counter: "Company denial; no internal documents; CFO trading baseline unknown (Tellabs holistic review)." });
  Object.assign(el("EL-NWX-10B5-8"), { analysis: "−14% market-adjusted move on corrective release (synthetic).", counter: "Same-day CEO transition and restructuring charge confound attribution (Dura)." });

  /* ---------------- Claims & defenses ---------------- */
  const clm = (id, iss, kind, prov, o) => Object.assign({ id: D(id), issue_id: D(iss), kind, provision: prov, private_right: "Unknown", forum: "", pleading_standard: "", plaintiff_arguments: "",
    defense_arguments: "", sec_considerations: "", scienter_analysis: "", causation_analysis: "", pleading_risk: "Unknown", exposure: "Unknown", unresolved: "", evidence_ids: [] }, o);
  ws.claims = [
    clm("CLM-0001", "ISS-NWX-10B5", "claim", "Exchange Act §10(b) / Rule 10b-5(b) — half-truth", { private_right: "Implied", forum: "Federal district court", pleading_standard: "Rule 9(b) + PSLRA",
      plaintiff_arguments: "Specific, verifiable demand statement contradicted by same-filing backlog data; repeated across call and 10-K.", defense_arguments: "Puffery ('robust'); backlog disclosed in notes (truth-on-the-market within the same filing).",
      sec_considerations: "SEC could also pursue negligence-based §17(a)(2) only if an offering occurred — none in window.", scienter_analysis: "Motive: CFO sales (not 10b5-1). Opportunity: certifications. Competing inference: seasonal backlog.",
      causation_analysis: "Corrective disclosure 2026-04-15 pre-open; confounded by CEO transition. Need disaggregation.", pleading_risk: "Moderate", exposure: "Reasonably possible",
      unresolved: "Internal knowledge timing; CFO trading baseline.", evidence_ids: [D("EV-NWX-0001"), D("EV-NWX-0002"), D("EV-NWX-0003")] }),
    clm("CLM-0002", "ISS-NWX-10B5", "defense", "Puffery / immaterial optimism", { defense_arguments: "'Robust' is a generalized statement of optimism.", plaintiff_arguments: "Paired with 'across all regions' — a verifiable factual claim.", pleading_risk: "Moderate", evidence_ids: [D("EV-NWX-0001")] }),
    clm("CLM-0003", "ISS-NWX-10B5", "defense", "No loss causation (confounding information)", { defense_arguments: "CEO transition and restructuring explain the decline.", causation_analysis: "Market-adjusted move cannot be split without intraday data or analyst commentary.", evidence_ids: [D("EV-NWX-0008")] }),
    clm("CLM-0004", "ISS-NWX-IT", "enforcement_theory", "Classical insider trading — SEC §21A penalties", { private_right: "Limited", forum: "Federal district court (Jarkesy)", pleading_standard: "Preponderance", sec_considerations: "Penalty up to 3× profit avoided; disgorgement (Sripetch).", unresolved: "Awareness of MNPI on trade date." }),
    clm("CLM-0005", "ISS-CVB-S11", "claim", "Securities Act §11", { private_right: "Express", forum: "State or federal court (Cyan)", pleading_standard: "Rule 8 (Rule 9(b) if sounding in fraud)", plaintiff_arguments: "Statement was untrue when the supplement became part of the registration statement; clinical hold notice received 2026-02-26.",
      defense_arguments: "Opinion (Omnicare); underwriters' due diligence.", causation_analysis: "§11(e) negative causation is the defendant's burden.", pleading_risk: "Low", exposure: "Reasonably possible", evidence_ids: [D("EV-CVB-0001"), D("EV-CVB-0002")] }),
    clm("CLM-0006", "ISS-HLL-S5", "defense", "Token is a non-security digital commodity under the 2026 SEC taxonomy", { defense_arguments: "Agency interpretation; network functionality.", plaintiff_arguments: "Pre-sale marketing emphasized team efforts and price; Howey governs.", pleading_risk: "High" })
  ];

  /* ---------------- Disclosure statements ---------------- */
  const stm = (id, co, docId, topic, date, speaker, loc, text, type, flag, note, evs) => ({ id: D(id), company_id: D(co), document_id: docId ? D(docId) : "", topic, statement_date: date, speaker, location: loc, text,
    statement_type: type, lead_flag: flag, lead_note: note, evidence_ids: (evs || []).map(D) });
  ws.statements = [
    stm("STM-0001", "CO-NWX", "DOCU-NWX-01", "Product demand", "2025-11-06", "Company (10-Q)", "Part I Item 2, p. 27", "Demand for our flagship sensors remained strong in the quarter.", "historical fact", "none", "", []),
    stm("STM-0002", "CO-NWX", "DOCU-NWX-02", "Product demand", "2026-02-12", "CEO (fictional)", "Prepared remarks, 00:06:40", "We continue to see robust demand, and our backlog gives us excellent visibility into 2026.", "opinion", "potential inconsistency", "Backlog had fallen 31% by quarter-end (EV-NWX-0002).", ["EV-NWX-0002"]),
    stm("STM-0003", "CO-NWX", "DOCU-NWX-03", "Product demand", "2026-02-20", "Company (10-K)", "Item 7, p. 41", "Customer demand for our flagship product remains robust across all regions.", "historical fact", "potential half-truth / omission", "Same filing's Note 4 shows backlog decline — materiality: magnitude 31%; flagship ~60% of revenue (fictional).", ["EV-NWX-0001", "EV-NWX-0002"]),
    stm("STM-0004", "CO-NWX", "DOCU-NWX-05", "Product demand", "2026-04-15", "Company (8-K Ex. 99.1)", "Paras. 1–3", "We experienced order cancellations in two regions and are reducing full-year revenue guidance.", "historical fact", "none", "Candidate corrective disclosure.", ["EV-NWX-0007"]),
    stm("STM-0005", "CO-NWX", "DOCU-NWX-03", "Customer concentration risk", "2026-02-20", "Company (10-K)", "Item 1A, p. 19", "The loss of a major customer could adversely affect our results.", "risk factor", "materialized risk described as hypothetical", "If cancellations had occurred by January (alleged), risk framed hypothetically may be a half-truth (circuit-dependent).", ["EV-NWX-0004"]),
    stm("STM-0006", "CO-CVB", "DOCU-CVB-02", "Phase 2 trial status", "2026-03-04", "Company (prospectus)", "p. S-3", "Enrollment is on track for topline data in Q4 2026.", "forward-looking", "potential inconsistency", "Clinical hold notice received 2026-02-26 (EV-CVB-0002). Safe harbor unavailable for statements in connection with some offerings — verify.", ["EV-CVB-0001", "EV-CVB-0002"]),
    stm("STM-0007", "CO-CVB", "DOCU-CVB-03", "Phase 2 trial status", "2026-03-27", "Company (8-K)", "Item 8.01", "The FDA has placed the Phase 2 study on clinical hold.", "historical fact", "none", "", ["EV-CVB-0002"])
  ];

  /* ---------------- Financial observations (fictional) ---------------- */
  const quarters = [["2025-03-31", "Q1 FY2025"], ["2025-06-30", "Q2 FY2025"], ["2025-09-30", "Q3 FY2025"], ["2025-12-31", "Q4 FY2025"], ["2026-03-31", "Q1 FY2026"]];
  const nwx = { "Revenue": [198.4, 205.1, 211.7, 214.9, 176.2], "Backlog": [398.0, 405.6, 412.0, 284.3, 251.9], "Accounts receivable": [96.2, 101.4, 108.8, 131.5, 120.4], "Inventory": [71.0, 73.9, 78.2, 94.6, 101.3] };
  ws.fin_obs = [];
  let n = 1;
  Object.keys(nwx).forEach(m => quarters.forEach((q, i) => ws.fin_obs.push({ id: D("FIN-" + String(n++).padStart(4, "0")), company_id: D("CO-NWX"), metric: m, period_end: q[0], period_label: q[1],
    value: nwx[m][i], unit: "USD millions", evidence_id: (m === "Backlog" && i === 3) ? D("EV-NWX-0002") : "", data_status: "demo_fictional", note: "" })));
  [["Cash and equivalents", [412.0, 371.5, 335.2, 610.4]], ["R&D expense", [38.1, 41.7, 44.9, 47.2]]].forEach(([m, vals]) => quarters.slice(1).forEach((q, i) =>
    ws.fin_obs.push({ id: D("FIN-" + String(n++).padStart(4, "0")), company_id: D("CO-CVB"), metric: m, period_end: q[0], period_label: q[1], value: vals[i], unit: "USD millions", evidence_id: "", data_status: "demo_fictional", note: "" })));

  /* ---------------- Synthetic market observations (seeded; fictional) ---------------- */
  ws.mkt_obs = [];
  let seed = 20260415; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); while (v === 0) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  let px = 52.40, bx = 5000, d = new Date("2026-01-02T12:00:00Z"); let k = 1;
  const shocks = { "2026-04-10": -0.035, "2026-04-15": -0.14 };
  while (d <= new Date("2026-05-29T12:00:00Z")) {
    const iso = d.toISOString().slice(0, 10); const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) {
      const rm = 0.0004 + 0.009 * gauss(); const rf = 0.0002 + 1.2 * rm + 0.011 * gauss() + (shocks[iso] || 0);
      bx = bx * (1 + rm); px = px * (1 + rf);
      ws.mkt_obs.push({ id: D("MKT-" + String(k++).padStart(4, "0")), company_id: D("CO-NWX"), date: iso, close: Math.round(px * 100) / 100, benchmark_close: Math.round(bx * 100) / 100,
        benchmark_name: "DEMO Broad Market Index", volume: Math.round(800000 + 400000 * rnd() + (shocks[iso] ? 3500000 : 0)), adjustment: "Synthetic (no corporate actions)", source: "Synthetic — fictional demo", evidence_id: "", data_status: "demo_fictional" });
    }
    d = new Date(d.getTime() + 86400000);
  }

  /* ---------------- Events ---------------- */
  const evt = (id, co, date, time, type, title, desc, o) => Object.assign({ id: D(id), company_id: D(co), date, time, event_type: type, title, description: desc, document_id: "", evidence_ids: [],
    person: "", trade_code: "", shares: "", price: "", plan_10b5_1: "Not applicable", corrective_candidate: false }, o || {});
  ws.events = [
    evt("EVT-0001", "CO-NWX", "2025-11-06", "after-close", "filing", "Q3 10-Q filed", "Demand described as strong.", { document_id: D("DOCU-NWX-01") }),
    evt("EVT-0002", "CO-NWX", "2026-02-12", "after-close", "statement", "Q4 earnings call", "CEO: 'robust demand'.", { document_id: D("DOCU-NWX-02") }),
    evt("EVT-0003", "CO-NWX", "2026-02-20", "after-close", "filing", "FY2025 10-K filed", "Contains demand statement and backlog note.", { document_id: D("DOCU-NWX-03"), evidence_ids: [D("EV-NWX-0001"), D("EV-NWX-0002")] }),
    evt("EVT-0004", "CO-NWX", "2026-03-02", "", "insider_trade", "CEO sale (fictional)", "", { person: "CEO A. Roe (fictional)", trade_code: "S", shares: 25000, price: 54.10, plan_10b5_1: "Yes" }),
    evt("EVT-0005", "CO-NWX", "2026-04-01", "", "insider_trade", "CFO sale (fictional)", "", { person: "CFO J. Doe (fictional)", trade_code: "S", shares: 120000, price: 48.10, plan_10b5_1: "No", evidence_ids: [D("EV-NWX-0003")], document_id: D("DOCU-NWX-04") }),
    evt("EVT-0006", "CO-NWX", "2026-04-10", "intraday", "market_event", "Short-seller report published", "Allegations of January cancellations.", { evidence_ids: [D("EV-NWX-0004")] }),
    evt("EVT-0007", "CO-NWX", "2026-04-13", "pre-open", "statement", "Company denial press release", "", { evidence_ids: [D("EV-NWX-0005")], document_id: D("DOCU-NWX-06") }),
    evt("EVT-0008", "CO-NWX", "2026-04-15", "pre-open", "corrective_disclosure_candidate", "Q1 results: cancellations + guidance cut", "Same release: CEO transition (confounding).", { evidence_ids: [D("EV-NWX-0007"), D("EV-NWX-0008")], document_id: D("DOCU-NWX-05"), corrective_candidate: true }),
    evt("EVT-0009", "CO-CVB", "2026-02-26", "", "other", "FDA clinical hold notice received", "Per later 8-K.", { evidence_ids: [D("EV-CVB-0002")] }),
    evt("EVT-0010", "CO-CVB", "2026-03-04", "", "offering", "Follow-on offering priced", "", { document_id: D("DOCU-CVB-02") }),
    evt("EVT-0011", "CO-CVB", "2026-03-27", "after-close", "corrective_disclosure_candidate", "Clinical hold disclosed", "", { document_id: D("DOCU-CVB-03"), corrective_candidate: true }),
    evt("EVT-0012", "CO-HLL", "2025-06-01", "", "offering", "Token pre-sale opens", "", { document_id: D("DOCU-HLL-01") })
  ];

  /* ---------------- Tasks, sections, log ---------------- */
  const tsk = (id, title, status, pr, co, iss, due, notes) => ({ id: D(id), title, status, priority: pr, company_id: co ? D(co) : "", issue_id: iss ? D(iss) : "", due, notes: notes || "" });
  ws.tasks = [
    tsk("TSK-0001", "Compare CFO 2026 sales to two-year trading baseline", "open", "critical", "CO-NWX", "ISS-NWX-10B5", "2026-11-20"),
    tsk("TSK-0002", "Find analyst reports on 2026-04-15 to split guidance cut vs. CEO transition", "open", "critical", "CO-NWX", "ISS-NWX-10B5", "2026-11-22"),
    tsk("TSK-0003", "Run citator check on Basic, Dura, Macquarie", "in_progress", "high", "", "", "2026-11-18"),
    tsk("TSK-0004", "Locate underwriting agreement exhibit for CVB offering", "open", "high", "CO-CVB", "ISS-CVB-S11", ""),
    tsk("TSK-0005", "Apply 2026 crypto taxonomy to Halcyon token", "blocked", "normal", "CO-HLL", "ISS-HLL-S5", "", "Waiting on course notes for Howey treatment."),
    tsk("TSK-0006", "Pull Form ADV Part 2A for Bramble Ridge", "open", "normal", "CO-BRC", "ISS-BRC-CMP", ""),
    tsk("TSK-0007", "Reconcile XBRL backlog values to Note 4", "done", "normal", "CO-NWX", "", "2026-11-10")
  ];
  const sec = (id, order, title, issues, pages, status, notes) => ({ id: D(id), order, title, issue_ids: issues.map(D), target_pages: pages, status, evidence_ids: [], authority_ids: [], notes: notes || "" });
  ws.sections = [
    sec("SEC-0001", 1, "Introduction and thesis", [], 1, "outlined"),
    sec("SEC-0002", 2, "Factual and disclosure background", ["ISS-NWX-10B5"], 2.5, "drafted"),
    sec("SEC-0003", 3, "Rule 10b-5: falsity, materiality and scienter", ["ISS-NWX-10B5"], 4, "outlined"),
    sec("SEC-0004", 4, "Reliance and loss causation", ["ISS-NWX-10B5"], 2.5, "not_started", "Needs disaggregation of 2026-04-15 move."),
    sec("SEC-0005", 5, "Insider trading and control-person exposure", ["ISS-NWX-IT", "ISS-NWX-CP"], 2, "not_started"),
    sec("SEC-0006", 6, "Defenses and conclusion", ["ISS-NWX-10B5"], 1.5, "not_started")
  ];
  ws.sections[2].evidence_ids = [D("EV-NWX-0001"), D("EV-NWX-0002"), D("EV-NWX-0003")];
  ws.sections[2].authority_ids = [D("AUTH-BASIC"), D("AUTH-TELLABS"), D("AUTH-MACQUARIE")];
  ws.verification_log = [
    { id: D("VLOG-0001"), at: "2026-11-09T14:02:00-06:00", record_type: "authorities", record_id: D("AUTH-TELLABS"), action: "current_validity", from: "verification_pending", to: "good_law_citator_checked", note: "FICTIONAL demo citator check" },
    { id: D("VLOG-0002"), at: "2026-11-10T09:30:00-06:00", record_type: "evidence", record_id: D("EV-NWX-0002"), action: "verification_status", from: "not_accessed", to: "verified_from_source", note: "Read Note 4 (fictional)" }
  ];
  return ws;
}
