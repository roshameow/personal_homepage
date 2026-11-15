/* Regression tests for renderer-only legacy arrow compatibility. Requires Playwright. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const script = fs.readFileSync(path.join(__dirname, '../_includes/mermaid.html'), 'utf8')
  .match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\{\{[\s\S]*?\}\}/g, '"base"');
const arrow = '    PrioCtrl <-- "6. 读取真实回测反馈晋级下一阶段" --- TaskColl';
const fixed = '    TaskColl -->|"6. 读取真实回测反馈晋级下一阶段"| PrioCtrl';
const cases = [
  ['user feedback', 'flowchart TB\n' + arrow, 'flowchart TB\n' + fixed],
  ['legacy graph', 'graph LR\nA<--"feedback"---B', 'graph LR\nB -->|"feedback"| A'],
  ['CRLF and BOM', '\uFEFFflowchart TB\r\n' + arrow + '\r\n', '\uFEFFflowchart TB\r\n' + fixed + '\r\n'],
  ['hyphen IDs, pipe label and semicolon', 'flowchart TB\n  A_1 <-- "a|b" --- B-2;', 'flowchart TB\n  B-2 -->|"a|b"| A_1;'],
  ['unsupported escaped quote unchanged', 'flowchart TB\nA <-- "a \\"quote\\"" --- B'],
  ['literal trailing backslash in label', 'flowchart LR\n C <-- "C:\\" --- D',
    'flowchart LR\n D -->|"C:\\"| C'],
  ['inline comment', 'flowchart TB\nA <-- "feedback" --- B %% C <-- "example" --- D', 'flowchart TB\nB -->|"feedback"| A %% C <-- "example" --- D'],
  ['comment quote does not leak', 'flowchart TB\n%% unmatched " quote\n' + arrow, 'flowchart TB\n%% unmatched " quote\n' + fixed],
  ['init directive', '%%{init: {"theme":"base"}}%%\nflowchart TB\n' + arrow, '%%{init: {"theme":"base"}}%%\nflowchart TB\n' + fixed],
  ['YAML unchanged', '---\ntitle: |\n  A <-- "example" --- B\n---\nflowchart TB\n' + arrow, '---\ntitle: |\n  A <-- "example" --- B\n---\nflowchart TB\n' + fixed],
  ['comment untouched', 'flowchart TB\n%% A <-- "example" --- B'],
  ['normal arrows untouched', 'flowchart TB\nA -->|"text"| B\nB <-->|"two way"| C\nD <--|"back"| E'],
  ['node label untouched', 'flowchart TB\nDoc["A &lt;-- #quot;example#quot; --- B"]'],
  ['multiline quoted text untouched', 'flowchart TB\nDoc["`example\nA <-- "literal" --- B\n`"]\n' + arrow,
    'flowchart TB\nDoc["`example\nA <-- "literal" --- B\n`"]\n' + fixed],
  ['literal trailing backslash', 'flowchart LR\n A["C:\\"]\n C <-- "label" --- D',
    'flowchart LR\n A["C:\\"]\n D -->|"label"| C'],
  ['multiline literal on header', 'flowchart LR; Doc["example\nA <-- "literal" --- B\n"]\n' + arrow,
    'flowchart LR; Doc["example\nA <-- "literal" --- B\n"]\n' + fixed],
  ['sequence untouched', 'sequenceDiagram\nNote over A,B: graph TB\nA <-- "literal" --- B'],
  ['state diagram untouched', 'stateDiagram-v2\nA <-- "literal" --- B'],
  ['chain deliberately untouched', 'flowchart TB\nA <-- "feedback" --- B --> C'],
  ['raw text untouched', 'A <-- "example" --- B']
].map(([name, input, output]) => ({ name, input, output: output === undefined ? input : output }));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    const page = await browser.newPage();
    await page.setContent('<main></main>');
    async function run(inputs) {
      await page.evaluate(inputs => {
        document.querySelector('main').replaceChildren();
        window.sources = [];
        window.originalNodes = inputs.map(source => {
          const pre = document.createElement('pre');
          const code = document.createElement('code');
          code.className = 'language-mermaid';
          code.textContent = source;
          pre.appendChild(code);
          document.querySelector('main').appendChild(pre);
          return code;
        });
        window.mermaid = {
          initialize() {},
          async run({ nodes }) {
            window.sources.push(nodes[0].textContent);
            nodes[0].innerHTML = '<svg></svg>';
          }
        };
      }, inputs);
      await page.evaluate(script);
      await page.waitForFunction(count => window.sources.length === count, inputs.length);
      assert.deepEqual(await page.evaluate(() => window.originalNodes.map(node => node.textContent)), inputs,
        'Compatibility must not mutate the original Markdown/code text');
      return page.evaluate(() => window.sources);
    }
    const outputs = await run(cases.map(test => test.input));
    for (let i = 0; i < cases.length; i++) assert.equal(outputs[i], cases[i].output, cases[i].name);
    assert.deepEqual(await run(outputs), outputs, 'Normalization must be idempotent');
    console.log(`PASS: ${cases.length} Mermaid compatibility cases, source preservation and idempotence.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
