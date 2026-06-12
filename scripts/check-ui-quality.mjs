#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components"];
const SOURCE_EXTENSIONS = new Set([".tsx"]);

const failures = [];

function walk(dir) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(path.relative(ROOT, fullPath)));
      continue;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split("\n").length;
}

function addFailure(file, line, message) {
  failures.push(`${path.relative(ROOT, file)}:${line} ${message}`);
}

for (const file of SOURCE_DIRS.flatMap(walk)) {
  const content = fs.readFileSync(file, "utf8");

  for (const match of content.matchAll(/<ScrollView[\s\S]*?\bhorizontal\b[\s\S]*?>/g)) {
    addFailure(file, lineNumberFor(content, match.index ?? 0), "horizontal ScrollView is not allowed in visible UI");
  }

  for (const match of content.matchAll(/text-\[(?:9|10|11|12|13)px\]/g)) {
    addFailure(file, lineNumberFor(content, match.index ?? 0), "arbitrary text below 14px is not allowed");
  }

  for (const match of content.matchAll(/<(?:Pressable|Button)\b[\s\S]*?>/g)) {
    const tag = match[0];
    if (/\b(?:h-9|h-10\s+w-10|h-8\s+w-8|h-6\s+w-6|h-5\s+w-5)\b/.test(tag)) {
      addFailure(file, lineNumberFor(content, match.index ?? 0), "interactive target appears smaller than 44x44");
    }
  }
}

if (failures.length > 0) {
  console.error("UI quality check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("UI quality checks passed.");
