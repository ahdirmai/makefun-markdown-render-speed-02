// Exercise the actual entrypoint twice, checking every HTML string exactly.
import { mkdtempSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const kit = resolve(root, process.argv[2] ?? '../markdown-render-speed-02-kit');
const input = join(kit, 'practice/input');
const cases = JSON.parse(readFileSync(join(input, 'cases.json'), 'utf8'));
const expected = JSON.parse(readFileSync(join(kit, 'practice/reference/expected.json'), 'utf8')).cases;
assert.equal(cases.length, 720, 'Practice input must contain exactly 720 cases');
assert.equal(expected.length, 720, 'Practice oracle must contain exactly 720 cases');
const byId = new Map(expected.map(({ id, html }) => [id, html]));
assert.equal(byId.size, 720, 'Oracle IDs must be unique');
assert.equal(new Set(cases.map(({ id }) => id)).size, 720, 'Input IDs must be unique');
const temp = mkdtempSync(join(tmpdir(), 'markdown-verify-'));
try {
  const rebuilt = join(temp, 'rebuilt.js');
  const build = spawnSync(process.execPath, [join(root, 'tools/build-fork.mjs'), '4', rebuilt], { encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr || String(build.error));
  assert.equal(readFileSync(rebuilt, 'utf8'), readFileSync(join(root, 'parse.js'), 'utf8'), 'Checked-in parser must match rebuild');
  for (let run = 1; run <= 2; run++) {
    const output = join(temp, String(run));
    mkdirSync(output);
    const child = spawnSync(process.execPath, [join(root, 'main.ts')], {
      cwd: root, encoding: 'utf8', timeout: 20_000,
      env: { ...process.env, MAKEFUN_INPUT_DIR: input, MAKEFUN_OUTPUT_DIR: output },
    });
    assert.equal(child.status, 0, child.stderr || String(child.error));
    const actual = JSON.parse(readFileSync(join(output, 'html.json'), 'utf8'));
    assert.ok(Array.isArray(actual), 'Output must be an array');
    assert.equal(actual.length, cases.length);
    for (const [index, { id }] of cases.entries()) {
      assert.ok(byId.has(id), `Missing oracle for ${id}`);
      assert.equal(typeof actual[index], 'string', `${id}: HTML must be a string`);
      assert.equal(actual[index], byId.get(id), `${id}: exact HTML mismatch`);
    }
    console.log(`Run ${run}: 720/720 exact matches through main.ts`);
  }
  console.log('Rebuild matches parse.js byte for byte.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
