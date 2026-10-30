#!/usr/bin/env node
/*
 Lightweight advisory scanner for react-effects-refs-escape-hatches.
 It intentionally avoids third-party dependencies so it can run in most repositories.
 */
const fs = require('fs');
const path = require('path');

const root = process.argv[2] || process.cwd();
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);
const findings = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) scan(full);
  }
}

function add(file, message) {
  findings.push({ file: path.relative(root, file), message });
}

function scan(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (/dangerouslySetInnerHTML/.test(text)) add(file, 'Review dangerouslySetInnerHTML usage and sanitation.');
  if (/eslint-disable.*react-hooks/.test(text)) add(file, 'Avoid disabling React Hooks lint rules without a precise justification.');
  if (/useEffect\s*\([^)]*set[A-Z]/s.test(text)) add(file, 'Check whether this effect derives state that could be computed during render.');
  if (/key=\{\s*index\s*\}|key=\{\s*i\s*\}/.test(text)) add(file, 'Avoid array index keys when domain identity exists.');
  if (/useMemo|useCallback|memo\(/.test(text) && !/Profiler|performance|memoization|hot path/i.test(text)) add(file, 'Manual memoization should be justified by measurement or clear stability requirement.');
}

walk(root);
console.log(JSON.stringify({ skill: 'react-effects-refs-escape-hatches', root, findings, count: findings.length }, null, 2));
process.exit(0);
