const fs = require('fs');

const reportPath = process.argv[2] || 'axe-results.json';
const failOn = (process.argv[3] || 'serious').toLowerCase();

const severityWeights = {
  minor: 1,
  moderate: 2,
  serious: 3,
  critical: 4
};

const thresholdWeight = severityWeights[failOn] || 3;

if (!fs.existsSync(reportPath)) {
  // A missing report means the scanner itself failed (bad URL, no browser, driver error).
  // That must fail the check: silently passing a broken scan is worse than a red build.
  console.log(`::error::Axe results file not found at ${reportPath} — the axe-core scan did not run. Check the URL is reachable from the runner and that Chrome is available.`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (e) {
  console.error(`Failed to parse JSON report: ${e.message}`);
  process.exit(1);
}

const violations = Array.isArray(data) ? (data[0] && data[0].violations ? data[0].violations : []) : (data.violations || []);

let failCount = 0;
let markdown = `## ♿ Axe-Core Accessibility CI Report (Syntropy Digital)\n\n`;
markdown += `| Impact | Rule | Description | Help URL |\n| --- | --- | --- | --- |\n`;

violations.forEach(v => {
  const weight = severityWeights[v.impact] || 1;
  const isBlocking = weight >= thresholdWeight;
  if (isBlocking) failCount++;

  const badge = v.impact === 'critical' ? '🔴 Critical' : (v.impact === 'serious' ? '🟠 Serious' : (v.impact === 'moderate' ? '🟡 Moderate' : '🔵 Minor'));
  const help = String(v.help || '').replace(/\|/g, '\\|');   // keep pipes from breaking the table
  markdown += `| ${badge} | \`${v.id}\` | ${help} | [Docs](${v.helpUrl}) |\n`;

  v.nodes.forEach(node => {
    const target = node.target.join(' ');
    if (isBlocking) {
      console.log(`::error title=Accessibility Violation (${v.impact}): ${v.id}::Selector: ${target} - ${node.failureSummary}`);
    } else {
      console.log(`::warning title=Accessibility Warning (${v.impact}): ${v.id}::Selector: ${target}`);
    }
  });
});

if (violations.length === 0) {
  markdown += `\n**✅ Zero accessibility violations detected! Meets target standard.**\n`;
} else {
  markdown += `\n**Found ${violations.length} rules with violations (${failCount} blocking with severity >= '${failOn}').**\n`;
}

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}

console.log(`\nAccessibility scan complete. Violations: ${violations.length}, Blocking: ${failCount}`);

if (failCount > 0) {
  console.error(`\nCI check failed due to ${failCount} blocking accessibility violations.`);
  process.exit(1);
}
