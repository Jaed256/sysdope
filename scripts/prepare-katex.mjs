/**
 * Copies KaTeX CSS + font binaries into `public/katex/` and rewrites font URLs
 * so they resolve from the site origin (fixes broken `url(fonts/...)` when the
 * stylesheet is not served from `node_modules/katex/dist/`).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const katexDist = path.join(root, "node_modules", "katex", "dist");
const outDir = path.join(root, "public", "katex");
const fontsIn = path.join(katexDist, "fonts");
const cssIn = path.join(katexDist, "katex.min.css");
const cssOut = path.join(outDir, "katex.min.css");

if (!fs.existsSync(cssIn)) {
  console.warn("prepare-katex: katex dist missing (npm install katex), skipping.");
  process.exit(0);
}

fs.mkdirSync(path.join(outDir, "fonts"), { recursive: true });

for (const name of fs.readdirSync(fontsIn)) {
  fs.copyFileSync(path.join(fontsIn, name), path.join(outDir, "fonts", name));
}

let css = fs.readFileSync(cssIn, "utf8");
css = css.replace(/url\(fonts\//g, "url(/katex/fonts/");
fs.writeFileSync(cssOut, css);
console.log("prepare-katex: wrote", cssOut);
