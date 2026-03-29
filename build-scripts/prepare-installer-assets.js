const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const nativeRoot = path.join(projectRoot, 'native');
const bundleDir = path.join(projectRoot, 'dist-installer');

function nativeBinaryName(base) {
  return process.platform === 'win32' ? `${base}.exe` : base;
}

async function main() {
  const hostBinary = path.join(
    nativeRoot,
    'target',
    'debug',
    nativeBinaryName('llm-sidebar-host'),
  );
  const installerBinary = path.join(
    nativeRoot,
    'target',
    'debug',
    nativeBinaryName('llm-sidebar-installer'),
  );
  const crxPath = path.join(projectRoot, 'dist', 'llm-sidebar.crx');

  if (!(await fs.pathExists(hostBinary))) {
    throw new Error(`Native host binary not found: ${hostBinary}`);
  }
  if (!(await fs.pathExists(installerBinary))) {
    throw new Error(`Installer binary not found: ${installerBinary}`);
  }
  if (!(await fs.pathExists(crxPath))) {
    throw new Error(`CRX not found: ${crxPath}. Run npm run pack-crx or npm run build:package.`);
  }

  await fs.emptyDir(bundleDir);
  await fs.copy(hostBinary, path.join(bundleDir, path.basename(hostBinary)));
  await fs.copy(installerBinary, path.join(bundleDir, path.basename(installerBinary)));
  await fs.copy(crxPath, path.join(bundleDir, path.basename(crxPath)));

  console.log(`Installer assets prepared in ${bundleDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
