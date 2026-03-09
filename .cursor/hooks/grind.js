#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const MAX_ITERATIONS = 10;
const SCRATCHPAD_PATH = path.join(process.cwd(), ".cursor", "scratchpad.md");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    if (data.status !== "completed" || (data.loop_count || 0) >= MAX_ITERATIONS) {
      process.exit(0);
      return;
    }
    const scratchpad = fs.existsSync(SCRATCHPAD_PATH)
      ? fs.readFileSync(SCRATCHPAD_PATH, "utf8")
      : "";
    if (scratchpad.includes("DONE")) {
      process.exit(0);
      return;
    }
    const n = (data.loop_count || 0) + 1;
    const out = {
      followup_message: `[Iteration ${n}/${MAX_ITERATIONS}] Continue toward the goal. Update .cursor/scratchpad.md with progress. Write DONE on its own line when complete.`
    };
    console.log(JSON.stringify(out));
  } catch (e) {
    process.exit(0);
  }
});
