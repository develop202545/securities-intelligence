/* Course knowledge index — EMPTY in the public distribution.
   The original build derived these from one student's private course notes, which are not distributed.
   To add your own, fill these structures (see docs/COURSE_INDEX_FORMAT.md) or import doctrines as JSON/CSV in Data & Backup.
   - COURSE_DOCTRINES: array of doctrine records (same fields as the Doctrines table; ids like "DOC-01").
   - COURSE_ELEMENT_FRAMING: { "<element code>": { framing: "", cases: ["Case name"], gap: "" } }
   - COURSE_TEMPLATE_COVERAGE: { "<template key>": "coverage note" }
   The app hides course features while these are empty. */
const COURSE_DOCTRINES = [];
const COURSE_ELEMENT_FRAMING = {};
const COURSE_TEMPLATE_COVERAGE = {};
const COURSE_META = { built: "", files: 0, doctrines: 0, cases: 0 };
