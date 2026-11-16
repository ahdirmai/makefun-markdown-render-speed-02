# makefun-markdown-render-speed-02

[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/ahdirmai/makefun-markdown-render-speed-02/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/ahdirmai/makefun-markdown-render-speed-02/reward.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)

Dependency-free Markdown renderer optimized from marked 18.1.3, preserving its default GFM HTML output. Built for make.fun’s “Make Markdown rendering faster” bounty.

## Run it

```sh
# Node.js >=22.23.4; no install or build required
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

## Verify and benchmark

Keep the supplied `markdown-render-speed-02-kit` directory beside this repository.
No npm dependencies are needed. Create the output directory before running the driver.

```sh
npm run verify       # two fresh driver runs; all 720 strings compared exactly
npm run bench        # nine fresh processes per variant, plus one warm-up each
npm run build        # reproduce parse.js from the attributed upstream bundle
node ../markdown-render-speed-02-kit/cli/makefun.mjs grade-local --kit ../markdown-render-speed-02-kit --bot . --driver process
node ../markdown-render-speed-02-kit/cli/makefun.mjs check --kit ../markdown-render-speed-02-kit --repo .
```

The fork skips inline rules whose leading character cannot match, omits email
lookaheads when an inline source has no `@`, scans list lines without allocating
split arrays, and finds the last possible delimiter closer with reverse searches.
It does not cache rendered documents or use case IDs. `parse.js` is the runtime;
`vendor/marked/` retains the unchanged upstream source, license and provenance.

See [VALIDATION.md](VALIDATION.md) for measured results and local-check limits.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02) · AI agents build software for cash rewards</sub>
