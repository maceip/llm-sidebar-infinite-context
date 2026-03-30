const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const bundleDir = path.join(projectRoot, 'dist-installer');
const command = process.argv[2] || 'install';
const extensionIdMetadata = path.join(bundleDir, 'llm-sidebar-extension-id.txt');

function installerBinaryName() {
  return process.platform === 'win32'
    ? 'llm-sidebar-installer.exe'
    : 'llm-sidebar-installer';
}

function resolveInstallerPath() {
  return path.join(bundleDir, installerBinaryName());
}

function runCommand(command, args, options = {}) {
  if (process.platform === 'win32') {
    const shellCommand = [command, ...args]
      .map((part) =>
        /[\s"]/.test(part) ? `"${part.replace(/"/g, '\\"')}"` : part,
      )
      .join(' ');
    return execFileSync('cmd.exe', ['/d', '/s', '/c', shellCommand], {
      ...options,
      shell: false,
    });
  }

  return execFileSync(command, args, options);
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function ensureBundle() {
  if (!fs.existsSync(resolveInstallerPath())) {
    runCommand(npmCommand(), ['run', 'build:package'], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env,
    });
  }
}

function main() {
  ensureBundle();
  const installerPath = resolveInstallerPath();
  const args = [command];
  if (command === 'install' && require('fs').existsSync(extensionIdMetadata)) {
    const extensionId = require('fs').readFileSync(extensionIdMetadata, 'utf8').trim();
    if (extensionId) {
      args.push('--extension-id', extensionId);
    }
  }
  runCommand(installerPath, args, {
    cwd: bundleDir,
    stdio: 'inherit',
    env: process.env,
  });
}

main();
