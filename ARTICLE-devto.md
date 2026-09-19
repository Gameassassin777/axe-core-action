---
title: A zero-config accessibility gate for GitHub Actions (axe-core, WCAG 2.2, one step)
published: false
tags: accessibility, github, actions, webdev
---

Most teams find out their site fails accessibility checks when a customer, a lawyer, or a Lighthouse score tells them. The fix for the *finding-out* part is cheap: run axe-core on every pull request and fail the build on serious violations. This action does exactly that, in one workflow step.

## What it does

- Runs `@axe-core/cli` against a URL you give it (your preview server, staging, or a static build).
- Tags the run with the standard you choose: `wcag2a`, `wcag2aa`, `wcag21aa`, or `wcag22aa`.
- Turns every violation into a GitHub annotation — rule id, the CSS selector of the failing node, and axe's failure summary — and writes a Markdown table into the job summary.
- Fails the job when violations at or above your threshold appear (`fail-on: serious` by default; `critical`, `moderate`, or `minor` if you want it stricter).
- Fails the job if the scan itself could not run (unreachable URL, no browser). A scanner that silently passes is worse than a red build, so that case is an error, not a warning.

## The whole setup

```yaml
name: Accessibility
on: [pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build && (npm run start &) && npx wait-on http://localhost:3000
      - uses: Gameassassin777/axe-core-action@v1
        with:
          url: http://localhost:3000
          standard: wcag22aa
          fail-on: serious
```

That's it. The job summary shows a table of rules with impact badges and links to the axe rule documentation; the annotations point at the exact selectors.

## What it does not do

Automated checks catch roughly half to two-thirds of accessibility defects (Deque's own estimate for axe-core is 57% of issues by count). Keyboard traps, focus order, meaningful alt text, and reading order still need a person. Treat this action as the floor, not the audit — it stops regressions and catches the mechanical failures (missing labels, contrast, ARIA misuse, duplicate ids) before review.

## Inputs

| input | default | meaning |
|---|---|---|
| `url` | — | page to scan (required) |
| `standard` | `wcag21aa` | axe tag set: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` |
| `fail-on` | `serious` | minimum impact that fails the job |
| `output-json` | `axe-results.json` | where the full axe report is saved (upload it as an artifact if you want history) |

Source, MIT licence, issues: https://github.com/Gameassassin777/axe-core-action

If you want the manual half of the audit — keyboard flows, screen-reader checks, and code-level fixes for the failures — that is what we do for a living; the README has the contact.
