import { readFileSync, writeFileSync } from 'node:fs';
const KIT = new URL('../../markdown-render-speed-02-kit/', import.meta.url);
const cases = JSON.parse(readFileSync(new URL('practice/input/cases.json', KIT), 'utf8'));
const { marked } = await import('../vendor/marked/marked.esm.js');
// separate passes: block lex, inline lex, parse+render
const Lexer = marked.Lexer, Parser = marked.Parser;
let t0 = performance.now();
const lexed = cases.map((c) => Lexer.lex(c.markdown));
let t1 = performance.now();
const rendered = lexed.map((l) => Parser.parse(l));
let t2 = performance.now();
console.log('lex ms', (t1 - t0).toFixed(1), 'parse+render ms', (t2 - t1).toFixed(1));
