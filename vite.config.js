import { defineConfig, createLogger } from "vite";

// The app is plain browser JavaScript that relies on ordered, classic <script> tags (shared globals),
// so the scripts and stylesheet live in /public and are copied to /dist unchanged.
// base "./" makes the build work from any sub-path (GitHub Pages project sites, a local folder, etc.).
const logger = createLogger();
const warn = logger.warn;
logger.warn = (msg, opts) => {
  // Expected for /public classic scripts and stylesheet — they are intentionally served as-is.
  if (/can't be bundled without type="module"|doesn't exist at build time/.test(msg)) return;
  warn(msg, opts);
};

export default defineConfig({
  base: "./",
  customLogger: logger,
  build: { outDir: "dist", emptyOutDir: true },
  server: { open: true },
  preview: { port: 4173 }
});
