// Alternate fresh processes; verify every timed output against the practice oracle.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const root = fileURLToPath(new URL('../', import.meta.url));
const kit = resolve(root, '../markdown-render-speed-02-kit');
const input = join(kit, 'practice/input/cases.json');
const reference = join(kit, 'practice/reference/expected.json');

if (process.argv[2] === '--worker') {
  const start = performance.now();
  const { parse } = await import(pathToFileURL(process.argv[3]));
  const cases = JSON.parse(readFileSync(input, 'utf8'));
  const renderStart = performance.now();
  const cpuStart = process.cpuUsage();
  const output = cases.map(({ markdown }) => parse(markdown));
  const renderCpu = process.cpuUsage(cpuStart);
  const renderMs = performance.now() - renderStart;
  writeFileSync(process.argv[4], JSON.stringify(output));
  const cpu = process.cpuUsage();
  console.log(JSON.stringify({
    cpuMs: (cpu.user + cpu.system) / 1000,
    renderCpuMs: (renderCpu.user + renderCpu.system) / 1000,
    renderMs,
    workloadWallMs: performance.now() - start,
  }));
} else {
  const rounds = Number(process.argv[2] ?? 9);
  if (!Number.isSafeInteger(rounds) || rounds < 3) throw new Error('Use at least 3 rounds.');
  const variants = process.argv.slice(3);
  if (!variants.length) variants.push('../markdown-render-speed-02-kit/baselines/parse.js', 'parse.js');
  const expected = JSON.parse(readFileSync(reference, 'utf8')).cases;
  const cases = JSON.parse(readFileSync(input, 'utf8'));
  const byId = new Map(expected.map(({ id, html }) => [id, html]));
  const results = Object.fromEntries(variants.map((v) => [v, []]));
  const temp = mkdtempSync(join(tmpdir(), 'markdown-bench-'));
  try {
    for (let round = -1; round < rounds; round++) {
      // One untimed warm-up round; reverse order on alternate timed rounds.
      const order = round % 2 === 0 ? variants : [...variants].reverse();
      for (const variant of order) {
        const output = join(temp, 'html.json');
        const start = performance.now();
        const child = spawnSync(process.execPath,
          [fileURLToPath(import.meta.url), '--worker', resolve(root, variant), output],
          { encoding: 'utf8', timeout: 20_000 });
        if (child.status !== 0) throw new Error(`${variant}: ${child.stderr || child.error}`);
        const run = { ...JSON.parse(child.stdout), freshWallMs: performance.now() - start };
        const actual = JSON.parse(readFileSync(output, 'utf8'));
        if (actual.length !== cases.length) throw new Error(`${variant}: wrong case count`);
        for (let i = 0; i < cases.length; i++) {
          if (actual[i] !== byId.get(cases[i].id)) {
            throw new Error(`${variant}: mismatch in ${cases[i].id}, round ${round}`);
          }
        }
        if (round >= 0) results[variant].push(run);
      }
    }
    const median = (values) => {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };
    const summary = Object.fromEntries(Object.entries(results).map(([variant, runs]) => {
      const cpu = runs.map((r) => r.cpuMs).sort((a, b) => a - b);
      const trim = runs.length >= 9 ? 2 : 0;
      const kept = cpu.slice(trim, trim ? -trim : undefined);
      return [variant, {
        casesPassed: cases.length, runs: runs.length,
        cpuMedianMs: median(cpu), cpuMinMs: cpu[0], cpuMaxMs: cpu.at(-1),
        cpuTrimmedMeanMs: kept.reduce((a, b) => a + b, 0) / kept.length,
        renderCpuMedianMs: median(runs.map((r) => r.renderCpuMs)),
        freshWallMedianMs: median(runs.map((r) => r.freshWallMs)),
      }];
    }));
    console.log(JSON.stringify({ node: process.version, platform: `${process.platform}/${process.arch}`,
      method: 'Fresh-process CPU through module load, input JSON, rendering, and output write; one warm-up round; alternating order.',
      summary, results }, null, 2));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
