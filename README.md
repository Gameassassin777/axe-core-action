# Syntropy Axe-Core Accessibility CI

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Axe--Core%20CI-blue.svg)](https://github.com/marketplace/actions/syntropy-axe-core-accessibility-ci)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automated, developer-friendly WCAG 2.1 & 2.2 AA accessibility audit GitHub Action powered by `@axe-core/cli`.

Built and maintained by **Syntropy Digital**.

---

## Features

- **Workflow Annotations:** Every violation becomes a GitHub error/warning annotation with its CSS selector and axe's failure summary, visible in the run log and the Checks tab.
- **Rich Job Summaries:** Automatically generates clean Markdown tables in the GitHub Actions Step Summary.
- **Configurable Severity Gates:** Fail CI on `critical`, `serious`, or `moderate` issues, or run non-blocking for reporting.
- **Zero Configuration:** Pre-configured with sensible defaults for fast CI runs.

---

## Quick Start

Add the following step to your `.github/workflows/accessibility.yml`:

```yaml
name: Accessibility Audit

on: [push, pull_request]

jobs:
  a11y-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Start Local Development Server
        run: npm run build && npm run start & npx wait-on http://localhost:3000

      - name: Run Syntropy Axe Accessibility Audit
        uses: syntropydigital/axe-core-action@v1
        with:
          url: 'http://localhost:3000'
          standard: 'wcag21aa'
          fail-on: 'serious'
```

---

## Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `url` | Web URL or local dev server address to scan | **Yes** | — |
| `standard` | WCAG tag to enforce (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) | No | `wcag21aa` |
| `fail-on` | Minimum severity level to trigger CI failure (`minor`, `moderate`, `serious`, `critical`) | No | `serious` |
| `output-json` | Path where full JSON report will be saved | No | `axe-results.json` |

---

## License

MIT License. Developed by Syntropy Digital.
