# Local validation

Measured 2026-11-16 on darwin/arm64, Node v26.8.2.

- `npm run verify`: two fresh executions of `main.ts`, each exactly 720/720
  matching HTML strings; the generated parser matches `parse.js` byte for byte.
- Kit `grade-local --driver process --worktree`: passed=1, cases_passed=720,
  cases_total=720; 71/71 scorer check groups passed, L1 regrade reproduced byte
  for byte. The kit verified all 27 sealed files and practice input digests.
- `node tools/bench.mjs 9`: one discarded warm-up per variant, then nine fresh
  processes per variant in alternating order. Every timed output matches all
  720 practice cases. Baseline is the kit's actual `baselines/parse.js`.

| Fresh-process measure | House baseline | Optimized |
| --- | ---: | ---: |
| Median CPU | 602.769 ms | 534.539 ms |
| Trimmed mean CPU (drop two extremes at each end) | 609.633 ms | 531.762 ms |
| Median render CPU | 537.853 ms | 469.220 ms |
| Median process wall time | 437.508 ms | 381.786 ms |

The trimmed mean CPU fell 12.78% (1.146× speedup). Raw measurements and method
are in `benchmark.json`; CPU includes module loading, input parsing, rendering
and output serialization/write. Each measurement uses a new Node process.
These are local practice results, not a prediction of the final heat or its
confidence test. The kit specifies Node 22.23.4 for the entry sandbox; final scoring uses its own
sandbox and scored set.

The kit's pre-submit check evaluates committed files, so rerun it after a new
commit. Transcript/recording gates, GitHub ownership, visibility, creation date,
and commit availability require the site's checks. Local grading without
recordings reports no transcript cost/authorship eligibility. No submission or
remote repository is created by these tools.
