import { readFileSync } from 'node:fs';
const f = process.argv[2];
const p = JSON.parse(readFileSync(f, 'utf8'));
const byId = new Map(p.nodes.map((n) => [n.id, n]));
const self = new Map();
// time deltas
const counts = new Map();
for (const s of p.samples) counts.set(s, (counts.get(s) ?? 0) + 1);
for (const [id, c] of counts) {
  const n = byId.get(id);
  const key = n.callFrame.functionName || '(anon)';
  self.set(key, (self.get(key) ?? 0) + c);
}
const total = p.samples.length;
const rows = [...self.entries()].filter(([k]) => k !== '(anon)').sort((a, b) => b[1] - a[1]).slice(0, 25);
for (const [k, c] of rows) console.log((100 * c / total).toFixed(1).padStart(6) + '%  ' + k);
