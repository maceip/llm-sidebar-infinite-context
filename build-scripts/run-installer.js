const path = require('path');
const { execFileSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const bundleDir = path.join(projectRoot, 'dist-installer');
const command = process.argv[2] || 'install';

function installerBinaryName() {
  return process.platform === 'win32'
    ? 'llm-sidebar-installer.exe'
    : 'llm-sidebar-installer';
}

function resolveInstallerPath() {
  return path.join(bundleDir, installerBinaryName());
}

function main() {
  const installerPath = resolveInstallerPath();
  execFileSync(installerPath, [command], {
    cwd: bundleDir,
    stdio: 'inherit',
    env: process.env,
  });
}

main();
