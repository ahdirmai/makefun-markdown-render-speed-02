import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

// The harness supplies these directories; defaults are its container mounts.
const inputDirectory = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const cases: { id: string; markdown: string }[] = JSON.parse(
  readFileSync(join(inputDirectory, 'cases.json'), 'utf8'),
);

const rendered = new Array<string>(cases.length);
for (let index = 0; index < cases.length; index++) {
  rendered[index] = parse(cases[index].markdown);
}
writeFileSync(join(outputDirectory, 'html.json'), JSON.stringify(rendered));
