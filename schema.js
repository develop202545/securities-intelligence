/* SECURITIES INTELLIGENCE — data model registry (schema v1.0.0)
   Every entity: stable ID (PREFIX-xxxx; DEMO- prefix for fictional data), ISO dates (YYYY-MM-DD).
   Field-state convention: a scalar value, "" (empty = not yet entered), or a status wrapper
   {"$s": "missing" | "unavailable" | "disputed" | "not_applicable", "note": "..."}.  */

const SCHEMA_VERSION = "1.0.0";

const ENUM = {
  elementStatus: ["Unassessed", "Supported by verified evidence", "Supported by reasonable inference", "Contested", "Unsupported", "Not established from available sources", "Not applicable"],
  propClass: ["verified_fact", "supported_inference", "third_party_allegation", "analytical_hypothesis", "disputed", "unknown"],
  propScope: ["truth_of_matter", "that_statement_was_made"],
  verif: ["verified_from_source", "partially_accessed", "secondary_report_only", "not_accessed", "conflict_unresolved"],
  strength: ["strong", "moderate", "weak", "unassessed"],
  confidence: ["high", "medium", "low"],
  supports: ["supports", "contradicts", "neutral", "mixed"],
  excerptType: ["exact_quote", "paraphrase", "data_value", "none"],
  accessedBy: ["student", "claude_web_tool", "claude_from_upload", "connector"],
  sourceType: ["sec_filing", "sec_exhibit", "xbrl_data", "sec_enforcement_complaint", "sec_settled_order", "sec_litigation_release", "court_opinion", "court_pleading", "court_docket", "company_press_release", "earnings_call_transcript", "company_presentation", "company_website", "finra_record", "form_adv", "market_data", "news_report", "analyst_or_short_report", "academic_or_commentary", "course_material", "other"],
  severity: ["Unknown", "Low", "Moderate", "High", "Severe"],
  entityType: ["Unknown", "Operating issuer (SEC reporting)", "Private issuer / exempt offerings", "Investment adviser", "Broker-dealer", "Investment fund / asset manager", "Digital-asset business", "SPAC", "Foreign private issuer", "Other"],
  reporting: ["Unknown", "Exchange Act §12(b) registrant", "Exchange Act §12(g) registrant", "§15(d) reporting only", "Voluntary filer", "Non-reporting / private", "Registered investment company", "Registered investment adviser", "Registered broker-dealer", "Not applicable"],
  perspectiveFit: ["Unknown", "In-house stronger", "Plaintiff-side stronger", "Either"],
  privateRight: ["Unknown", "Express", "Implied", "Limited", "None (SEC/DOJ only)"],
  authorityType: ["statute", "regulation", "scotus_opinion", "circuit_opinion", "district_opinion", "state_opinion", "sec_final_rule_release", "sec_interpretive_release", "sec_proposed_rule", "sec_staff_guidance", "sec_settled_order", "sec_commission_opinion", "sec_complaint", "sro_rule", "secondary"],
  bindingForce: ["binding_nationwide", "binding_in_circuit", "persuasive", "agency_position", "non_binding_staff_view", "not_law_proposed", "allegation_only"],
  holdingSource: ["opinion_text_verified", "statute_text_verified", "course_materials", "secondary_confirmed", "model_knowledge_unverified"],
  courseRelation: ["assigned", "mentioned_in_course", "supplemental_not_in_course", "course_not_yet_ingested"],
  validity: ["verification_pending", "good_law_citator_checked", "in_force_status_checked", "negative_treatment_reported", "superseded", "abrogated_or_overruled", "vacated", "stayed", "rescinded", "proposed_not_final"],
  docType: ["10-K", "10-K/A", "10-Q", "10-Q/A", "8-K", "S-1", "S-3", "S-4", "S-8", "424B", "DEF 14A", "Form 3", "Form 4", "Form 5", "Form 144", "Form D", "SC 13D", "SC 13G", "Form ADV", "Form 1-A", "Form C", "CORRESP", "Press release", "Earnings call transcript", "Investor presentation", "Whitepaper / offering terms", "Court filing", "SEC release / order", "Other"],
  reviewStatus: ["not_reviewed", "partially_reviewed", "reviewed"],
  stmtType: ["historical fact", "opinion", "forward-looking", "puffery", "risk factor", "other"],
  leadFlag: ["none", "potential inconsistency", "potential half-truth / omission", "materialized risk described as hypothetical", "other lead"],
  eventType: ["filing", "statement", "corrective_disclosure_candidate", "insider_trade", "offering", "enforcement", "litigation", "market_event", "corporate_action", "other"],
  tenb51: ["Unknown", "Yes", "No", "Not applicable"],
  claimKind: ["claim", "defense", "enforcement_theory"],
  pleadingRisk: ["Unknown", "Low", "Moderate", "High"],
  exposure: ["Unknown", "Remote", "Possible", "Reasonably possible", "Significant"],
  dataStatus: ["verified", "unverified", "demo_fictional"],
  taskStatus: ["open", "in_progress", "blocked", "done"],
  priority: ["critical", "high", "normal", "low"],
  sectionStatus: ["not_started", "outlined", "drafted", "revised", "final"],
  phase: ["Pre-exam build", "Assignment intake", "Company screening", "Investigation", "Analysis", "Drafting", "Red-team audit", "Final review", "Submitted"],
  perspective: ["Undecided", "In-house counsel", "Opposing / plaintiff counsel"],
  controllingPerspective: ["Undecided", "Regulator", "Plaintiff", "Defense / in-house"],
  confidenceLevel: ["Unknown", "Low", "Medium", "High"],
  reqStatus: ["pending", "provided", "not_specified_by_professor"],
  fieldStatus: ["value", "missing", "unavailable", "disputed", "not_applicable"],
  redteam: ["not_started", "pass", "fail", "not_applicable"]
};

const FIELD_STATUS_LABEL = { value: "Value", missing: "Missing", unavailable: "Unavailable", disputed: "Disputed", not_applicable: "Not applicable" };

/* Field definitions. type: text | textarea | select | date | number | bool | url | ref | refs
   req: required.  ref/refs: target entity.  status: allows field-state wrapper.  */
const ENTITIES = {
  companies: { label: "Companies", prefix: "CO", title: "name", fields: [
    ["name", "Company name", "text", { req: true }],
    ["ticker", "Ticker", "text", { status: true }],
    ["cik", "CIK", "text", { status: true }],
    ["entity_type", "Entity type", "select", { e: "entityType" }],
    ["reporting_status", "Reporting status", "select", { e: "reporting" }],
    ["industry", "Industry", "text", { status: true }],
    ["securities_activities", "Securities activities (offerings, listings, token sales)", "textarea", { status: true }],
    ["us_nexus", "U.S. nexus / jurisdiction notes", "textarea", { status: true }],
    ["perspective_fit", "Perspective suitability", "select", { e: "perspectiveFit" }],
    ["summary", "Dossier summary", "textarea", {}],
    ["source_note", "Where this record came from", "text", {}]
  ]},
  doctrines: { label: "Course doctrines", prefix: "DOC", title: "topic", fields: [
    ["topic", "Topic", "text", { req: true }],
    ["subtopic", "Subtopic", "text", {}],
    ["statute", "Governing statute / rule", "text", { status: true }],
    ["controlling_interpretation", "Controlling interpretation", "textarea", { status: true }],
    ["case_ids", "Assigned / linked cases", "refs", { ref: "authorities" }],
    ["elements", "Required elements", "textarea", {}],
    ["defenses", "Exceptions and defenses", "textarea", {}],
    ["distinctions", "Important distinctions", "textarea", {}],
    ["evidentiary_requirements", "Evidentiary requirements", "textarea", {}],
    ["private_right", "Private cause of action", "select", { e: "privateRight" }],
    ["enforcement", "Enforcement mechanisms", "textarea", {}],
    ["business_application", "How it applies to a business", "textarea", {}],
    ["issue_patterns", "Issue-spotting patterns", "textarea", {}],
    ["course_reference", "Course reference (file + page)", "text", { status: true }],
    ["course_relation", "Course relation", "select", { e: "courseRelation" }],
    ["open_questions", "Open research questions", "textarea", {}]
  ]},
  authorities: { label: "Legal authorities", prefix: "AUTH", title: "short_name", fields: [
    ["citation", "Citation", "text", { req: true }],
    ["short_name", "Short name", "text", { req: true }],
    ["authority_type", "Authority type", "select", { e: "authorityType" }],
    ["jurisdiction", "Jurisdiction", "text", {}],
    ["binding_force", "Binding force", "select", { e: "bindingForce" }],
    ["date_decided_or_effective", "Decided / effective", "date", { status: true }],
    ["rule_or_holding", "Rule or holding (from the source)", "textarea", { req: true }],
    ["holding_source", "Where the holding statement came from", "select", { e: "holdingSource" }],
    ["course_relation", "Course relation", "select", { e: "courseRelation" }],
    ["course_explanation", "Course explanation (kept separate)", "textarea", {}],
    ["current_validity", "Current validity", "select", { e: "validity" }],
    ["validity_basis", "Basis for validity status", "textarea", {}],
    ["verification_method", "Verification method", "text", {}],
    ["verified_date", "Verified on", "date", {}],
    ["pinpoints", "Pinpoints", "text", {}],
    ["issue_tags", "Issue tags", "text", {}],
    ["source_url", "Source URL", "url", {}]
  ]},
  documents: { label: "Corporate documents", prefix: "DOCU", title: "title", fields: [
    ["company_id", "Company", "ref", { ref: "companies", req: true }],
    ["doc_type", "Form / document type", "select", { e: "docType" }],
    ["title", "Title", "text", { req: true }],
    ["filing_date", "Filing / publication date", "date", { status: true }],
    ["period_end", "Reporting period end", "date", { status: true }],
    ["accession", "Accession / identifier", "text", { status: true }],
    ["url", "Source URL", "url", { status: true }],
    ["amends", "Amends / supersedes", "ref", { ref: "documents" }],
    ["items_reviewed", "Items / sections reviewed", "textarea", {}],
    ["review_status", "Review status", "select", { e: "reviewStatus" }],
    ["notes", "Notes", "textarea", {}]
  ]},
  statements: { label: "Disclosure statements", prefix: "STM", title: "topic", fields: [
    ["company_id", "Company", "ref", { ref: "companies", req: true }],
    ["document_id", "Document", "ref", { ref: "documents" }],
    ["topic", "Topic (used for comparison)", "text", { req: true }],
    ["statement_date", "Statement date", "date", { req: true }],
    ["speaker", "Speaker / maker", "text", { status: true }],
    ["location", "Pinpoint", "text", { status: true }],
    ["text", "Statement (exact words or precise paraphrase)", "textarea", { req: true }],
    ["statement_type", "Statement type", "select", { e: "stmtType" }],
    ["lead_flag", "Investigative lead", "select", { e: "leadFlag" }],
    ["lead_note", "Lead note / materiality considerations", "textarea", {}],
    ["evidence_ids", "Evidence", "refs", { ref: "evidence" }]
  ]},
  evidence: { label: "Evidence records", prefix: "EV", title: "proposition", fields: [
    ["company_id", "Company", "ref", { ref: "companies" }],
    ["proposition", "Proposition", "textarea", { req: true }],
    ["proposition_class", "Classification", "select", { e: "propClass" }],
    ["proposition_scope", "Scope", "select", { e: "propScope" }],
    ["source_title", "Source title", "text", { req: true }],
    ["source_type", "Source type", "select", { e: "sourceType" }],
    ["document_id", "Source document (register)", "ref", { ref: "documents" }],
    ["filing_or_document_date", "Filing / document date", "date", { status: true }],
    ["event_date", "Event date", "date", { status: true }],
    ["url", "Source URL", "url", { status: true }],
    ["pinpoint", "Pinpoint (item, page, note, para.)", "text", { status: true }],
    ["excerpt", "Excerpt", "textarea", {}],
    ["excerpt_type", "Excerpt type", "select", { e: "excerptType" }],
    ["verification_status", "Verification status", "select", { e: "verif" }],
    ["accessed_date", "Accessed on", "date", {}],
    ["accessed_by", "Accessed by", "select", { e: "accessedBy" }],
    ["supports_or_contradicts", "Supports / contradicts", "select", { e: "supports" }],
    ["evidentiary_strength", "Evidentiary strength", "select", { e: "strength" }],
    ["strength_rationale", "Strength rationale", "textarea", {}],
    ["issue_ids", "Legal issues", "refs", { ref: "issues" }],
    ["element_ids", "Legal elements", "refs", { ref: "elements" }],
    ["conflicts_with", "Conflicts with", "refs", { ref: "evidence" }],
    ["limitations", "Limitations", "textarea", {}],
    ["confidence", "Confidence", "select", { e: "confidence" }]
  ]},
  issues: { label: "Legal issues", prefix: "ISS", title: "title", fields: [
    ["company_id", "Company", "ref", { ref: "companies", req: true }],
    ["title", "Issue", "text", { req: true }],
    ["template", "Claim template", "select", { e: "_templates" }],
    ["doctrine_id", "Doctrine", "ref", { ref: "doctrines" }],
    ["reach", "Why the statute reaches this company / conduct", "textarea", { status: true }],
    ["controlling_perspective", "Controlling perspective", "select", { e: "controllingPerspective" }],
    ["private_right", "Private cause of action", "select", { e: "privateRight" }],
    ["severity", "B. Legal risk severity", "select", { e: "severity" }],
    ["severity_rationale", "Severity rationale", "textarea", {}],
    ["exposure", "Regulatory exposure class", "select", { e: "exposure" }],
    ["conclusion", "Preliminary conclusion", "textarea", {}],
    ["conclusion_confidence", "Conclusion confidence", "select", { e: "confidenceLevel" }],
    ["priority", "Paper priority (1 = highest)", "number", {}],
    ["authority_ids", "Authorities", "refs", { ref: "authorities" }],
    ["open_questions", "Facts that would change the conclusion", "textarea", {}]
  ]},
  elements: { label: "Issue elements", prefix: "EL", title: "label", fields: [
    ["issue_id", "Issue", "ref", { ref: "issues", req: true }],
    ["code", "Element code", "text", {}],
    ["label", "Element", "text", { req: true }],
    ["essential", "Essential element", "bool", {}],
    ["status", "Status", "select", { e: "elementStatus" }],
    ["evidence_ids", "Evidence", "refs", { ref: "evidence" }],
    ["analysis", "Application", "textarea", {}],
    ["counter", "Counter-evidence / counterargument", "textarea", {}]
  ]},
  claims: { label: "Claims and defenses", prefix: "CLM", title: "provision", fields: [
    ["issue_id", "Issue", "ref", { ref: "issues", req: true }],
    ["kind", "Kind", "select", { e: "claimKind" }],
    ["provision", "Provision / defense", "text", { req: true }],
    ["private_right", "Private cause of action", "select", { e: "privateRight" }],
    ["forum", "Forum", "text", {}],
    ["pleading_standard", "Pleading / proof standard", "text", {}],
    ["plaintiff_arguments", "Plaintiff / regulator arguments", "textarea", {}],
    ["defense_arguments", "Defense arguments", "textarea", {}],
    ["sec_considerations", "SEC enforcement considerations", "textarea", {}],
    ["scienter_analysis", "Scienter / mental state analysis", "textarea", {}],
    ["causation_analysis", "Causation analysis", "textarea", {}],
    ["pleading_risk", "Pleading risk", "select", { e: "pleadingRisk" }],
    ["exposure", "Litigation exposure class", "select", { e: "exposure" }],
    ["unresolved", "Unresolved evidence", "textarea", {}],
    ["evidence_ids", "Evidence", "refs", { ref: "evidence" }]
  ]},
  fin_obs: { label: "Financial observations", prefix: "FIN", title: "metric", fields: [
    ["company_id", "Company", "ref", { ref: "companies", req: true }],
    ["metric", "Metric", "text", { req: true }],
    ["period_end", "Period end", "date", { req: true }],
    ["period_label", "Period label", "text", {}],
    ["value", "Value", "number", { status: true }],
    ["unit", "Unit", "text", {}],
    ["evidence_id", "Source evidence", "ref", { ref: "evidence" }],
    ["data_status", "Data status", "select", { e: "dataStatus" }],
    ["note", "Note", "textarea", {}]
  ]},
  mkt_obs: { label: "Market observations", prefix: "MKT", title: "date", fields: [
    ["company_id", "Company", "ref", { ref: "companies", req: true }],
    ["date", "Trading date", "date", { req: true }],
    ["close", "Close", "number", { status: true }],
    ["benchmark_close", "Benchmark close", "number", { status: true }],
    ["benchmark_name", "Benchmark", "text", {}],
    ["volume", "Volume", "number", {}],
    ["adjustment", "Adjustment basis", "text", {}],
    ["source", "Source", "text", {}],
    ["evidence_id", "Source evidence", "ref", { ref: "evidence" }],
    ["data_status", "Data status", "select", { e: "dataStatus" }]
  ]},
  events: { label: "Material events", prefix: "EVT", title: "title", fields: [
    ["company_id", "Company", "ref", { ref: "companies", req: true }],
    ["date", "Date", "date", { req: true }],
    ["time", "Time / session (pre-open, intraday, after-close)", "text", {}],
    ["event_type", "Event type", "select", { e: "eventType" }],
    ["title", "Title", "text", { req: true }],
    ["description", "Description", "textarea", {}],
    ["document_id", "Document", "ref", { ref: "documents" }],
    ["evidence_ids", "Evidence", "refs", { ref: "evidence" }],
    ["person", "Insider / person", "text", {}],
    ["trade_code", "Form 4 transaction code", "text", {}],
    ["shares", "Shares", "number", {}],
    ["price", "Price", "number", {}],
    ["plan_10b5_1", "Rule 10b5-1 plan", "select", { e: "tenb51" }],
    ["corrective_candidate", "Corrective-disclosure candidate", "bool", {}]
  ]},
  tasks: { label: "Research tasks", prefix: "TSK", title: "title", fields: [
    ["title", "Task", "text", { req: true }],
    ["status", "Status", "select", { e: "taskStatus" }],
    ["priority", "Priority", "select", { e: "priority" }],
    ["company_id", "Company", "ref", { ref: "companies" }],
    ["issue_id", "Issue", "ref", { ref: "issues" }],
    ["due", "Due", "date", {}],
    ["notes", "Notes", "textarea", {}]
  ]},
  sections: { label: "Paper sections", prefix: "SEC", title: "title", fields: [
    ["order", "Order", "number", {}],
    ["title", "Section", "text", { req: true }],
    ["issue_ids", "Issues covered", "refs", { ref: "issues" }],
    ["target_pages", "Target pages", "number", {}],
    ["status", "Status", "select", { e: "sectionStatus" }],
    ["evidence_ids", "Key evidence", "refs", { ref: "evidence" }],
    ["authority_ids", "Key authorities", "refs", { ref: "authorities" }],
    ["notes", "Notes", "textarea", {}]
  ]},
  verification_log: { label: "Verification log", prefix: "VLOG", title: "action", fields: [
    ["at", "When", "text", {}],
    ["record_type", "Record type", "text", {}],
    ["record_id", "Record ID", "text", {}],
    ["action", "Action", "text", {}],
    ["from", "From", "text", {}],
    ["to", "To", "text", {}],
    ["note", "Note", "textarea", {}]
  ]}
};
const ENTITY_KEYS = Object.keys(ENTITIES);

/* Selection-suitability criteria (Dimension A). Weights from master instructions; editable. */
const CRITERIA = [
  ["course", "Course doctrine relevance", 25],
  ["evidence", "Strength of documentary evidence", 25],
  ["argument", "Potential for argument and counterargument", 20],
  ["financial", "Financial and transactional evidence", 10],
  ["thesis", "Opportunity for an original thesis", 10],
  ["fit", "Suitability for a 12–15 page paper", 10]
];

/* Element templates (IDs match research_engine/07_CLAIMS_AND_DEFENSES_RESEARCH_TEMPLATES). SUPPLEMENTAL law. */
const TEMPLATES = {
  "10B5": { name: "Rule 10b-5 private action", private_right: "Implied", els: [
    ["10B5-E1", "Material misrepresentation, half-truth, or scheme", true], ["10B5-E1a", "Defendant 'made' the statement (Janus)", true],
    ["10B5-E2", "Materiality", true], ["10B5-E3", "Scienter (strong inference — Tellabs)", true], ["10B5-E4", "In connection with purchase or sale", true],
    ["10B5-E5", "Reliance / transaction causation", true], ["10B5-E6", "Economic loss", true], ["10B5-E7", "Loss causation (Dura)", true]] },
  "ENF": { name: "SEC 10b-5 / §17(a) enforcement", private_right: "None (SEC/DOJ only)", els: [
    ["ENF-E1", "Misstatement, omission, or scheme", true], ["ENF-E2", "Materiality", true], ["ENF-E3", "Mental state (scienter; negligence for §17(a)(2)-(3))", true],
    ["ENF-E4", "Jurisdictional means; connection / offer or sale", true], ["ENF-E5", "§17(a)(2): money or property obtained by means of", false]] },
  "S11": { name: "Securities Act §11", private_right: "Express", els: [
    ["S11-E1", "Untrue statement / omission in registration statement at effectiveness", true], ["S11-E2", "Materiality", true],
    ["S11-E3", "Securities traceable to the registration statement (Slack)", true], ["S11-E4", "Defendant in a statutory category", true]] },
  "S12A2": { name: "Securities Act §12(a)(2)", private_right: "Express", els: [
    ["S12A2-E1", "Statutory seller (Pinter)", true], ["S12A2-E2", "By means of prospectus / oral communication in a public offering (Gustafson)", true],
    ["S12A2-E3", "Material misstatement or omission", true], ["S12A2-E4", "Plaintiff did not know of untruth", true]] },
  "S5": { name: "Securities Act §5 / §12(a)(1)", private_right: "Express", els: [
    ["S5-SEC", "Instrument is a security (Howey / Reves / Landreth)", true], ["S5-E1", "No registration statement in effect / filed", true],
    ["S5-E2", "Defendant offered or sold", true], ["S5-E3", "Interstate commerce or mails", true], ["S5-DEF", "No exemption available (defendant's burden)", true]] },
  "IT": { name: "Insider trading (10b-5)", private_right: "Limited", els: [
    ["IT-E1", "Material nonpublic information", true], ["IT-E2", "Traded while aware of MNPI", true],
    ["IT-E3", "Duty (classical / misappropriation / tipper benefit)", true], ["IT-E4", "Scienter", true]] },
  "CP": { name: "Control person (§20(a) / §15)", private_right: "Express", els: [
    ["CP-E1", "Primary violation", true], ["CP-E2", "Control", true], ["CP-E3", "Culpable participation (circuit-dependent)", false]] },
  "S16B": { name: "§16(b) short-swing profits", private_right: "Express", els: [
    ["S16B-E1", "Insider status (officer, director, >10% holder)", true], ["S16B-E2", "Purchase and sale of equity securities", true],
    ["S16B-E3", "Within less than six months", true], ["S16B-E4", "Profit realized", true]] },
  "S14A": { name: "§14(a) / Rule 14a-9 proxy", private_right: "Implied", els: [
    ["S14A-E1", "Material misstatement / omission in proxy", true], ["S14A-E2", "Culpability (negligence in many circuits)", true],
    ["S14A-E3", "Essential link (Mills)", true], ["S14A-E4", "Injury", true]] },
  "MANIP": { name: "Market manipulation", private_right: "Implied", els: [
    ["MANIP-E1", "Manipulative act", true], ["MANIP-E2", "Manipulative purpose / scienter", true], ["MANIP-E3", "Reliance, damages, loss causation (private)", false]] },
  "COMPLIANCE": { name: "SEC-only compliance exposure", private_right: "None (SEC/DOJ only)", els: [
    ["CMP-E1", "Applicable requirement (rule / form item)", true], ["CMP-E2", "Facts showing non-compliance", true], ["CMP-E3", "Remediation status", false]] },
  "CUSTOM": { name: "Custom (no template elements)", private_right: "Unknown", els: [] }
};
ENUM._templates = Object.keys(TEMPLATES);

/* Private remedy vs. SEC enforcement reference (SUPPLEMENTAL — verify; see research engine playbook IV-13). */
const REMEDY_MAP = [
  ["1933 Act §11", "Express", "Purchasers traceable to the registration statement", "Strict for issuer; due diligence for others", "SEC: §20 injunction, penalties"],
  ["1933 Act §12(a)(1)", "Express", "Purchaser from a statutory seller", "Strict liability", "SEC: §5 enforcement"],
  ["1933 Act §12(a)(2)", "Express", "Purchaser in a public offering", "Reasonable-care defense", "SEC: §17(a)"],
  ["1933 Act §17(a)", "None (prevailing view)", "SEC / DOJ only", "(a)(1) scienter; (a)(2)-(3) negligence", "Injunction, penalties, disgorgement"],
  ["1934 Act §10(b) / Rule 10b-5", "Implied", "Actual purchasers or sellers", "Scienter", "Injunction, penalties, disgorgement (Sripetch 2026: no investor-loss showing), bars"],
  ["1934 Act §14(a) / Rule 14a-9", "Implied", "Solicited shareholders", "Negligence in many circuits", "SEC enforcement"],
  ["1934 Act §16(b)", "Express", "Issuer / shareholder derivatively", "Strict liability", "—"],
  ["1934 Act §18", "Express", "Actual reliance on filed document", "Good-faith defense", "—"],
  ["1934 Act §20(a) / 1933 Act §15", "Express (derivative)", "Same as primary claim", "Good faith / lack of knowledge defenses", "SEC may also proceed"],
  ["1934 Act §20A", "Express", "Contemporaneous traders", "Requires underlying violation", "SEC §21A penalties up to 3×"],
  ["1934 Act §20(e) aiding and abetting", "None (Central Bank)", "SEC only", "Knowing or reckless", "SEC enforcement"],
  ["Reg FD; §13(b)(2); SOX 302/304", "None", "SEC only", "Varies", "SEC enforcement"],
  ["ICA §47(b)", "None (FS Credit v. Saba, 2026)", "—", "—", "SEC enforcement"],
  ["ICA §36(b)", "Express (fees)", "Fund shareholders", "Fiduciary duty as to fees", "SEC"],
  ["Advisers Act §215", "Limited rescission (TAMA)", "Advisory clients", "—", "SEC §206 enforcement"]
];

/* Adversarial red-team checklist (master instructions §X). */
const REDTEAM = [
  "No source misinterpreted", "No allegation converted into a finding", "Applicable rules correctly identified",
  "No legal elements missing", "No reliance on hindsight", "Plaintiff has a viable private cause of action (or paper says otherwise)",
  "Causation adequately supported", "Important defenses addressed", "Dates and figures consistent",
  "No outdated, reversed, vacated, or stayed authority", "Every quotation and citation genuine", "Conclusion does not exceed the evidence"
];

/* Pre-exam completion standard (Project instructions). auto: computed key or null (manual). */
const READINESS = [
  ["Course materials indexed", "course"], ["Primary-source research workflows exist", null], ["Company-screening templates operational", "screening"],
  ["Legal element frameworks operational", "elements"], ["Dashboard functions with demonstration data", "demo"], ["Evidence and citation records import/export", null],
  ["Mock investigation conducted", null], ["Adversarial review workflow tested", null], ["Activation procedure documented", null],
  ["Missing formal assignment requirements identified", "assignment"]
];

const ASSIGNMENT_FIELDS = [
  ["title", "Assignment title", "text"], ["instructions", "Professor's exact instructions", "textarea"], ["company_list", "Company list (as provided)", "textarea"],
  ["perspectives", "Permitted analytical perspective(s)", "text"], ["page_limit", "Page limit", "text"], ["citation_style", "Citation style", "text"],
  ["source_restrictions", "Research source restrictions", "textarea"], ["ai_restrictions", "AI-use restrictions", "textarea"],
  ["submission_requirements", "Submission requirements", "textarea"], ["deadline", "Deadline", "text"]
];

function emptyWorkspace(kind) {
  const ws = { schema_version: SCHEMA_VERSION, meta: { kind: kind, created: nowIso(), updated: nowIso(), label: kind === "demo" ? "FICTIONAL DEMONSTRATION DATA" : "Real research workspace" },
    settings: { system_state: "PRE_EXAM", phase: "Pre-exam build", selected_company: "", weights: Object.fromEntries(CRITERIA.map(c => [c[0], c[2]])),
      course_docs_expected: null, course_docs_ingested: 0, anomaly_threshold: 20, ratios: [], readiness_manual: {}, redteam: {}, thesis: "", thesis_history: [],
      perspective: "Undecided", page_limit_override: null },
    assignment: Object.fromEntries(ASSIGNMENT_FIELDS.map(f => [f[0], { status: "pending", value: "" }])) };
  ENTITY_KEYS.forEach(k => ws[k] = []);
  return ws;
}

function nowIso() { return new Date().toISOString(); }
function todayIso() { return new Date().toISOString().slice(0, 10); }

/* ---------- Migrations ---------- */
const MIGRATIONS = {
  /* 0.9.0 (prototype export format): companies used "reporting"; no statements / verification_log; assignment fields were plain strings. */
  "0.9.0": function (ws) {
    (ws.companies || []).forEach(c => { if (c.reporting !== undefined && c.reporting_status === undefined) { c.reporting_status = c.reporting; delete c.reporting; } });
    ws.statements = ws.statements || []; ws.verification_log = ws.verification_log || [];
    if (ws.assignment) Object.keys(ws.assignment).forEach(k => { const v = ws.assignment[k]; if (typeof v === "string") ws.assignment[k] = { status: v ? "provided" : "pending", value: v }; });
    ws.schema_version = "1.0.0"; return ws;
  }
};

function migrate(ws) {
  const log = [];
  let guard = 0;
  while (ws.schema_version !== SCHEMA_VERSION && guard++ < 20) {
    const fn = MIGRATIONS[ws.schema_version];
    if (!fn) throw new Error("No migration path from schema version " + ws.schema_version + " to " + SCHEMA_VERSION + ".");
    const from = ws.schema_version; ws = fn(ws); log.push(from + " → " + ws.schema_version);
  }
  /* Fill any structure missing from older or partial files. */
  const base = emptyWorkspace((ws.meta && ws.meta.kind) || "real");
  ws.meta = Object.assign(base.meta, ws.meta || {});
  ws.settings = Object.assign(base.settings, ws.settings || {});
  ws.settings.weights = Object.assign({}, base.settings.weights, ws.settings.weights || {});
  ws.assignment = Object.assign(base.assignment, ws.assignment || {});
  ENTITY_KEYS.forEach(k => { if (!Array.isArray(ws[k])) ws[k] = []; });
  return { ws: ws, log: log };
}

/* Validation of an imported workspace. Returns {errors:[], warnings:[]} */
function validateWorkspace(ws, targetKind) {
  const errors = [], warnings = [];
  if (!ws || typeof ws !== "object") { errors.push("File is not a JSON object."); return { errors, warnings }; }
  if (!ws.schema_version) errors.push("Missing schema_version.");
  const ids = new Set();
  ENTITY_KEYS.forEach(k => {
    if (ws[k] !== undefined && !Array.isArray(ws[k])) errors.push(k + " must be an array.");
    (ws[k] || []).forEach((r, i) => {
      if (!r || typeof r !== "object") { errors.push(k + "[" + i + "] is not an object."); return; }
      if (!r.id) errors.push(k + "[" + i + "] has no id.");
      else if (ids.has(r.id)) errors.push("Duplicate id " + r.id + ".");
      else ids.add(r.id);
      if (r.id) {
        const demoId = String(r.id).startsWith("DEMO-");
        if (targetKind === "real" && demoId) errors.push(r.id + ": demonstration record cannot be imported into the Real workspace.");
        if (targetKind === "demo" && !demoId) warnings.push(r.id + ": record without DEMO- prefix imported into the Demo workspace.");
      }
    });
  });
  ENTITY_KEYS.forEach(k => (ws[k] || []).forEach(r => ENTITIES[k].fields.forEach(f => {
    const [key, , type, o] = f; const v = r[key];
    if ((type === "ref" || type === "refs") && v) {
      (Array.isArray(v) ? v : [v]).forEach(t => { if (t && typeof t === "string" && !ids.has(t)) warnings.push(r.id + "." + key + " points to missing record " + t + "."); });
    }
    if (type === "date" && typeof v === "string" && v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push(r.id + "." + key + ": date must be YYYY-MM-DD (got " + v + ").");
  })));
  return { errors, warnings };
}
