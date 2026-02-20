/**
 * Build-time script: writes homepage content as static markdown to public/homepage.md.
 * Run before build so content negotiation can serve this file.
 *
 * Run: npx tsx scripts/generate-homepage-markdown.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getHomepageMarkdown } from "../lib/homepage-content";

const __dirname = dirname(fileURLToPath(import.meta.url));
const markdown = getHomepageMarkdown();

const publicDir = join(__dirname, "..", "public");
mkdirSync(publicDir, { recursive: true });
const outPath = join(publicDir, "homepage.md");
writeFileSync(outPath, markdown, "utf8");
console.log("Wrote", outPath);
