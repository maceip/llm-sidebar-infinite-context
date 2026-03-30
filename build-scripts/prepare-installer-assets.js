const fs = require('fs-extra');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const nativeRoot = path.join(projectRoot, 'native');
const bundleDir = path.join(projectRoot, 'dist-installer');

function nativeBinaryName(base) {
  return process.platform === 'win32' ? `${base}.exe` : base;
}

async function main() {
  const workspaceTargetRoot = path.join(nativeRoot, 'target', 'debug');
  const overlayTargetRoot = path.join(
    nativeRoot,
    'overlay-companion',
    'target',
    'debug',
  );

  const hostBinary = path.join(
    overlayTargetRoot,
    nativeBinaryName('overlay-companion'),
  );
  const installerBinary = path.join(
    workspaceTargetRoot,
    nativeBinaryName('llm-sidebar-installer'),
  );
  const crxPath = path.join(projectRoot, 'dist', 'llm-sidebar.crx');
  const extensionIdPath = path.join(projectRoot, 'dist', 'llm-sidebar-extension-id.txt');

  if (!(await fs.pathExists(hostBinary))) {
    throw new Error(`Native host binary not found: ${hostBinary}`);
  }
  if (!(await fs.pathExists(installerBinary))) {
    throw new Error(`Installer binary not found: ${installerBinary}`);
  }
  if (!(await fs.pathExists(crxPath))) {
    throw new Error(`CRX not found: ${crxPath}. Run npm run pack-crx or npm run build:package.`);
  }
  if (!(await fs.pathExists(extensionIdPath))) {
    throw new Error(`Extension ID metadata not found: ${extensionIdPath}`);
  }

  await fs.emptyDir(bundleDir);
  await fs.copy(hostBinary, path.join(bundleDir, nativeBinaryName('overlay-companion')));
  await fs.copy(installerBinary, path.join(bundleDir, nativeBinaryName('llm-sidebar-installer')));
  await fs.copy(crxPath, path.join(bundleDir, path.basename(crxPath)));
  await fs.copy(
    extensionIdPath,
    path.join(bundleDir, path.basename(extensionIdPath)),
  );

  console.log(`Installer assets prepared in ${bundleDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
