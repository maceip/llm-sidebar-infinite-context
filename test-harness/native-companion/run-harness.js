const nodeCrypto = require('node:crypto');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const workspaceRoot = path.resolve(__dirname, '..', '..');
const harnessRoot = path.resolve(__dirname);
const tempRoot = path.join(harnessRoot, '.tmp');
const extensionRoot = path.join(tempRoot, 'extension');
const userDataDir = path.join(tempRoot, 'chrome-data');
const tempHome = path.join(tempRoot, 'home');
const configHome = path.join(tempHome, '.config');
const key = fs
  .readFileSync(path.join(harnessRoot, 'dev-extension-key.txt'), 'utf8')
  .trim();

function resolveCommand(baseName) {
  if (process.platform === 'win32') {
    if (baseName === 'npm') {
      return 'npm.cmd';
    }
    if (baseName === 'npx') {
      return 'npx.cmd';
    }
    if (baseName === 'cargo') {
      return 'cargo.exe';
    }
  }
  return baseName;
}

function resolveNativeBinaryPath() {
  const extension = process.platform === 'win32' ? '.exe' : '';
  return path.join(
    workspaceRoot,
    'native/overlay-companion/target/debug',
    `overlay-companion${extension}`,
  );
}

function deriveExtensionId(publicKey) {
  const hash = nodeCrypto
    .createHash('sha256')
    .update(Buffer.from(publicKey, 'base64'))
    .digest('hex')
    .slice(0, 32);
  return hash
    .split('')
    .map((ch) => String.fromCharCode('a'.charCodeAt(0) + parseInt(ch, 16)))
    .join('');
}

async function buildExtension() {
  execFileSync(resolveCommand('npm'), ['run', 'build'], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      LEGAL_NOTICE_URL: 'https://example.com/legal',
      PRIVACY_POLICY_URL: 'https://example.com/privacy',
      LICENSE_URL: 'https://example.com/license',
    },
  });
}

async function buildNativeBinary() {
  execFileSync(
    resolveCommand('cargo'),
    [
      '+stable',
      'build',
      '--manifest-path',
      path.join(workspaceRoot, 'native/overlay-companion/Cargo.toml'),
    ],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: process.env,
    },
  );
}

async function prepareExtension(extensionId) {
  await fse.remove(tempRoot);
  await fse.ensureDir(tempRoot);
  await fse.copy(path.join(workspaceRoot, 'dist'), extensionRoot);

  const manifestPath = path.join(extensionRoot, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.key = key;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const nativePagePath = path.join(
    extensionRoot,
    'src/pages/native-companion-test.html',
  );
  await fse.ensureDir(path.dirname(nativePagePath));
  await fse.copy(
    path.join(workspaceRoot, 'src/pages/native-companion-test.html'),
    nativePagePath,
  );

  const hostDirs = [
    path.join(configHome, 'google-chrome-for-testing', 'NativeMessagingHosts'),
    path.join(configHome, 'google-chrome', 'NativeMessagingHosts'),
    path.join(configHome, 'chromium', 'NativeMessagingHosts'),
    path.join(userDataDir, 'NativeMessagingHosts'),
  ];
  const nativeBinary = resolveNativeBinaryPath();
  const hostManifest = {
    name: 'com.maceip.native_overlay_companion',
    description: 'Native overlay companion test harness host',
    path: nativeBinary,
    type: 'stdio',
    allowed_origins: [`chrome-extension://${extensionId}/`],
  };
  for (const hostDir of hostDirs) {
    await fse.ensureDir(hostDir);
    fs.writeFileSync(
      path.join(hostDir, 'com.maceip.native_overlay_companion.json'),
      JSON.stringify(hostManifest, null, 2),
    );
  }

  return { nativeBinary, hostDirs };
}

async function waitForCompanion(extensionId, browser) {
  const page = await browser.newPage();
  await page.goto(
    `chrome-extension://${extensionId}/src/pages/native-companion-test.html`,
    {
      waitUntil: 'networkidle0',
    },
  );

  const timeoutAt = Date.now() + 60000;
  let lastStatusText = '';
  while (Date.now() < timeoutAt) {
    const statusText = await page.evaluate(
      () =>
        new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'nativeCompanionStatus' },
            (response) => {
              const error = chrome.runtime.lastError?.message;
              resolve(
                JSON.stringify({
                  response: response || null,
                  error: error || null,
                }),
              );
            },
          );
        }),
    );
    lastStatusText = statusText;
    try {
      const payload = JSON.parse(statusText);
      if (
        payload?.response?.success &&
        payload?.response?.state?.connectionState === 'connected'
      ) {
        return payload.response;
      }
    } catch {
      // Ignore malformed or transient status payloads while waiting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    `Timed out waiting for native companion connection; last status=${lastStatusText}`,
  );
}

function buildAgentMemoryFixture() {
  const now = Date.now();
  return {
    schemaVersion: 2,
    updatedAt: now,
    byScope: {
      agent: {
        scope: 'agent',
        episodes: [
          {
            id: `mem_browser_${now}`,
            kind: 'turn',
            scope: 'agent',
            ownerAgentId: 'primary-agent',
            ownerTeamId: 'default-team',
            summary:
              'User prefers the browser memory harness to prove persistence and retrieval for the memory layer.',
            keywords: [
              'browser',
              'memory',
              'persistence',
              'retrieval',
              'harness',
            ],
            createdAt: now,
            accessCount: 0,
            lastAccessedAt: now,
            accessPolicy: {
              tier: 'private',
              readers: ['primary-agent'],
              writers: ['primary-agent'],
            },
            provenance: {
              sourceAgentId: 'primary-agent',
              sourceTeamId: 'default-team',
              createdAt: now,
              revision: 1,
            },
          },
        ],
      },
      team: { scope: 'team', episodes: [] },
      global: { scope: 'global', episodes: [] },
    },
  };
}

async function runMemoryLayerScenario(extensionId, browser) {
  const page = await browser.newPage();
  await page.goto(
    `chrome-extension://${extensionId}/src/pages/browser-memory-test.html`,
    {
      waitUntil: 'networkidle0',
    },
  );

  const result = await page.evaluate(async (fixture) => {
    const AGENT_MEMORY_KEY = 'agentMemory';
    await chrome.storage.local.set({ [AGENT_MEMORY_KEY]: fixture });

    const stats = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'getMemoryStats' }, (response) => {
        resolve(response || null);
      });
    });

    const stored = await chrome.storage.local.get([AGENT_MEMORY_KEY]);
    return {
      storedEpisodes:
        stored?.[AGENT_MEMORY_KEY]?.byScope?.agent?.episodes?.length || 0,
      stats,
    };
  }, buildAgentMemoryFixture());

  if (
    result.storedEpisodes !== 1 ||
    !result.stats?.success ||
    result.stats.episodeCount < 1 ||
    !Array.isArray(result.stats.recentEpisodes) ||
    !result.stats.recentEpisodes.some((episode) =>
      String(episode.summary || '').includes('browser memory harness'),
    )
  ) {
    throw new Error(`Memory layer scenario failed: ${JSON.stringify(result)}`);
  }

  return result;
}

async function runNativeConnectivityScenario(extensionId, browser) {
  const initialStatus = await waitForCompanion(extensionId, browser);
  await new Promise((resolve) => setTimeout(resolve, 23000));
  const followUpStatus = await waitForCompanion(extensionId, browser);

  if (!followUpStatus.state.lastPongAt) {
    throw new Error(
      `Expected heartbeat pong in native status: ${JSON.stringify(followUpStatus)}`,
    );
  }

  return { initialStatus, followUpStatus };
}

async function main() {
  const extensionId = deriveExtensionId(key);
  await buildExtension();
  await buildNativeBinary();
  const { nativeBinary } = await prepareExtension(extensionId);

  execFileSync(nativeBinary, ['install-assets'], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      HOME: tempHome,
      XDG_CONFIG_HOME: configHome,
      OVERLAY_EXTENSION_ID: extensionId,
    },
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    enableExtensions: [extensionRoot],
    userDataDir,
    env: {
      ...process.env,
      HOME: tempHome,
      XDG_CONFIG_HOME: configHome,
      OVERLAY_EXTENSION_ID: extensionId,
    },
  });

  try {
    const workerTarget = await browser.waitForTarget(
      (target) =>
        target.type() === 'service_worker' &&
        target.url().includes(extensionId) &&
        target.url().endsWith('/src/scripts/background.js'),
      { timeout: 30000 },
    );
    console.log(`service worker target: ${workerTarget.url()}`);
    const nativeConnectivity = await runNativeConnectivityScenario(
      extensionId,
      browser,
    );
    const memoryLayer = await runMemoryLayerScenario(extensionId, browser);
    console.log(
      JSON.stringify({ extensionId, nativeConnectivity, memoryLayer }, null, 2),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
