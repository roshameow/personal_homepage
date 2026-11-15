/* Regression: the normal project config must select polling and rebuild after
 * atomic post replacements, as used by the Raycast/Obsidian synchronization.
 * Run: node _tests/watch_refresh_test.cjs (requires the site's Ruby bundle).
 * Only an isolated temporary site is watched; no HTTP server or real sync runs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const repo = path.resolve(__dirname, '..');

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jekyll-watch-regression-'));
  const source = path.join(root, 'source');
  const output = path.join(root, 'output');
  let child;
  let logs = '';
  let closed = false;
  try {
    const config = fs.readFileSync(path.join(repo, '_config.yml'), 'utf8');
    assert.match(config, /^force_polling:\s*true\s*$/m,
      'Plain jekyll serve must select the reliable polling adapter');
    fs.mkdirSync(path.join(source, 'docs/_posts'), { recursive: true });
    fs.mkdirSync(path.join(source, '_layouts'), { recursive: true });
    fs.mkdirSync(path.join(source, '_plugins'), { recursive: true });
    // Observe the real adapter selected by the installed, bundled listen gem.
    // Jekyll's regular startup log does not print its adapter name.
    fs.writeFileSync(path.join(source, '_plugins/watch_probe.rb'), `
require 'jekyll-watch'
module WatchAdapterProbe
  def build_listener(site, options)
    listener = super
    adapter = listener.instance_variable_get(:@backend).instance_variable_get(:@adapter)
    raise 'Polling was not selected' unless adapter.class.name == 'Listen::Adapter::Polling'
    puts "WATCH_ADAPTER:#{adapter.class.name}"
    listener
  end
end
Jekyll::Watcher.singleton_class.prepend(WatchAdapterProbe)
`);
    fs.writeFileSync(path.join(source, '_config.yml'), config);
    fs.writeFileSync(path.join(source, '_layouts/post.html'), '<!doctype html><main>{{ content }}</main>');
    fs.writeFileSync(path.join(source, 'index.html'), '---\n---\nWatch fixture.');
    const post = path.join(source, 'docs/_posts/2001-01-01-watch-probe.md');
    const html = path.join(output, 'algorithm/watch-probe/index.html');
    const content = version => `---\nlayout: post\ntitle: Watch test\ncategories: [algorithm]\n---\nWATCH_VERSION_${version}\n`;
    fs.writeFileSync(post, content('A'));
    const rubyBin = path.join(os.homedir(), '.rubies/ruby-3.2.2/bin');
    const gemHome = path.join(os.homedir(), '.gem/ruby/3.2.2');
    const env = { ...process.env, LANG: 'en_US.UTF-8' };
    if (fs.existsSync(rubyBin)) env.PATH = rubyBin + path.delimiter + env.PATH;
    if (!env.GEM_HOME && fs.existsSync(gemHome)) env.GEM_HOME = gemHome;
    child = spawn('bundle', ['exec', 'jekyll', 'build', '--watch', '--source', source, '--destination', output],
      { cwd: repo, env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => { logs += chunk; });
    child.stderr.on('data', chunk => { logs += chunk; });
    child.on('close', () => { closed = true; });
    let launchError;
    child.on('error', error => { launchError = error; closed = true; });
    async function waitFor(check, label) {
      const deadline = Date.now() + 45000;
      while (Date.now() < deadline) {
        if (launchError) throw launchError;
        if (check()) return;
        assert(!closed, `${label}: watcher exited\n${logs}`);
        await delay(100);
      }
      assert.fail(`${label}: timed out\n${logs}`);
    }
    await waitFor(() => fs.existsSync(html) && logs.includes('WATCH_ADAPTER:Listen::Adapter::Polling'), 'Polling adapter startup');
    assert(fs.readFileSync(html, 'utf8').includes('WATCH_VERSION_A'));
    // Allow the listener to finish its initial snapshot before the first change.
    await delay(1500);
    for (const version of ['B', 'C']) {
      const temporary = path.join(path.dirname(post), '.sync-homepage-test');
      fs.writeFileSync(temporary, content(version));
      fs.renameSync(temporary, post);
      await waitFor(() => fs.readFileSync(html, 'utf8').includes('WATCH_VERSION_' + version),
        `Atomic replacement ${version}`);
    }
    console.log('PASS: configured polling watcher rebuilds after two atomic post replacements.');
  } finally {
    if (child && !closed) {
      child.kill('SIGTERM');
      for (let i = 0; i < 50 && !closed; i++) await delay(100);
      if (!closed) {
        child.kill('SIGKILL');
        for (let i = 0; i < 20 && !closed; i++) await delay(100);
      }
    }
    if (!child || closed) fs.rmSync(root, { recursive: true, force: true });
    else console.error('Watcher did not stop; fixture retained:', root);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
