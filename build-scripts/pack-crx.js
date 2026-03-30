#!/usr/bin/env node
/**
 * Packs the dist/ directory into a signed CRX3 file.
 *
 * Usage:
 *   CRX_PRIVATE_KEY=<base64-encoded-pem> node build-scripts/pack-crx.js
 *
 * Or with a PEM file:
 *   node build-scripts/pack-crx.js --key path/to/key.pem
 *
 * Output: dist/llm-sidebar.crx
 */
const nodeCrypto = require('node:crypto');
const fs = require('fs');
const path = require('path');
const yazl = require('yazl');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const outCrx = path.join(distDir, 'llm-sidebar.crx');
const outExtensionId = path.join(distDir, 'llm-sidebar-extension-id.txt');
const defaultDevKeyPath = path.join(projectRoot, 'extension.pem');

function getPrivateKey() {
  // From command line
  const keyFlagIdx = process.argv.indexOf('--key');
  if (keyFlagIdx !== -1 && process.argv[keyFlagIdx + 1]) {
    return fs.readFileSync(process.argv[keyFlagIdx + 1], 'utf-8');
  }

  // From environment (base64-encoded PEM)
  if (process.env.CRX_PRIVATE_KEY) {
    const decoded = Buffer.from(process.env.CRX_PRIVATE_KEY, 'base64').toString(
      'utf-8',
    );
    if (decoded.includes('BEGIN')) return decoded;
    // Maybe it's already plain PEM
    if (process.env.CRX_PRIVATE_KEY.includes('BEGIN'))
      return process.env.CRX_PRIVATE_KEY;
    return decoded;
  }

  if (fs.existsSync(defaultDevKeyPath)) {
    return fs.readFileSync(defaultDevKeyPath, 'utf-8');
  }

  return null;
}

async function createZip(sourceDir) {
  const zipfile = new yazl.ZipFile();

  function addDirectory(currentDir, relativeDir = '') {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const absPath = path.join(currentDir, entry.name);
      const relPath = relativeDir
        ? path.posix.join(relativeDir, entry.name)
        : entry.name;

      if (entry.isDirectory()) {
        addDirectory(absPath, relPath);
      } else if (entry.isFile()) {
        if (relPath.endsWith('.crx') || relPath.endsWith('.zip')) {
          continue;
        }
        zipfile.addFile(absPath, relPath);
      }
    }
  }

  addDirectory(sourceDir);
  zipfile.end();

  return await new Promise((resolve, reject) => {
    const chunks = [];
    zipfile.outputStream.on('data', (chunk) => chunks.push(chunk));
    zipfile.outputStream.on('end', () => resolve(Buffer.concat(chunks)));
    zipfile.outputStream.on('error', reject);
  });
}

/**
 * Build CRX3 format.
 * Reference: https://developer.chrome.com/docs/extensions/reference/api/crx
 *
 * CRX3 file layout:
 *   [4 bytes] "Cr24" magic
 *   [4 bytes] CRX version (3)
 *   [4 bytes] header length
 *   [header]  protobuf-encoded CRX3 header
 *   [zip]     the extension zip
 */
function packCrx3(zipBuf, pemKey) {
  const key = nodeCrypto.createPrivateKey(pemKey);
  const publicKeyDer = nodeCrypto.createPublicKey(key).export({
    type: 'spki',
    format: 'der',
  });

  // Sign the zip with the CRX3 "signed data" prefix
  // CRX3 signed data: CRX3 SignedData protobuf containing the crx_id
  const crxId = nodeCrypto
    .createHash('sha256')
    .update(publicKeyDer)
    .digest()
    .subarray(0, 16);

  // SignedData protobuf (field 1 = crx_id, wire type 2 = length-delimited)
  const signedDataPayload = Buffer.concat([
    Buffer.from([0x0a, crxId.length]), // field 1, length
    crxId,
  ]);

  // The data to sign: "CRX3 SignedData\x00" + LE32(signedDataLen) + signedData + zip
  const prefix = Buffer.from('CRX3 SignedData\x00');
  const signedDataLenBuf = Buffer.alloc(4);
  signedDataLenBuf.writeUInt32LE(signedDataPayload.length);

  const signInput = Buffer.concat([
    prefix,
    signedDataLenBuf,
    signedDataPayload,
    zipBuf,
  ]);

  const signature = nodeCrypto.sign('sha256', signInput, {
    key,
    padding: nodeCrypto.constants.RSA_PKCS1_PADDING,
  });

  // Build the CRX3 FileHeader protobuf
  // sha256_with_rsa proof: field 2 (AsymmetricKeyProof)
  //   - field 1: public_key (bytes)
  //   - field 2: signature (bytes)
  const proofPayload = Buffer.concat([
    // field 1: public_key
    Buffer.from([0x0a]),
    encodeVarint(publicKeyDer.length),
    publicKeyDer,
    // field 2: signature
    Buffer.from([0x12]),
    encodeVarint(signature.length),
    signature,
  ]);

  // CrxFileHeader protobuf
  const headerPayload = Buffer.concat([
    // field 2: sha256_with_rsa (repeated AsymmetricKeyProof)
    Buffer.from([0x12]),
    encodeVarint(proofPayload.length),
    proofPayload,
    // field 10000: signed_header_data
    Buffer.from([0x82, 0xf1, 0x04]),
    encodeVarint(signedDataPayload.length),
    signedDataPayload,
  ]);

  // Assemble CRX3 file
  const magic = Buffer.from('Cr24');
  const version = Buffer.alloc(4);
  version.writeUInt32LE(3);
  const headerLen = Buffer.alloc(4);
  headerLen.writeUInt32LE(headerPayload.length);

  return Buffer.concat([magic, version, headerLen, headerPayload, zipBuf]);
}

function encodeVarint(value) {
  const bytes = [];
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value & 0x7f);
  return Buffer.from(bytes);
}

function generateKey() {
  const { privateKey } = nodeCrypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return privateKey;
}

async function main() {
  // Ensure dist/ exists with built extension
  if (!fs.existsSync(path.join(distDir, 'manifest.json'))) {
    console.error(
      'Error: dist/manifest.json not found. Run `npm run build` first.',
    );
    process.exit(1);
  }

  let pemKey = getPrivateKey();

  if (!pemKey) {
    if (process.argv.includes('--generate-key')) {
      console.log('Generating new RSA key pair...');
      pemKey = generateKey();
      fs.writeFileSync(defaultDevKeyPath, pemKey);
      console.log(
        `Key saved to ${defaultDevKeyPath} — add base64 of this to CRX_PRIVATE_KEY secret`,
      );
    } else {
      console.error('Error: No private key provided.');
      console.error(
        'Set CRX_PRIVATE_KEY env var (base64-encoded PEM) or use --key <file>',
      );
      console.error('Or use --generate-key to create a new key');
      process.exit(1);
    }
  }

  console.log('Creating zip of dist/...');
  const zipBuf = await createZip(distDir);

  console.log('Packing CRX3...');
  const crxBuf = packCrx3(zipBuf, pemKey);

  fs.writeFileSync(outCrx, crxBuf);
  console.log(`CRX written to ${outCrx} (${crxBuf.length} bytes)`);

  // Also output the extension ID for reference
  const key = nodeCrypto.createPrivateKey(pemKey);
  const publicKeyDer = nodeCrypto
    .createPublicKey(key)
    .export({ type: 'spki', format: 'der' });
  const hash = nodeCrypto.createHash('sha256').update(publicKeyDer).digest();
  const extensionId = Array.from(hash.subarray(0, 16))
    .map((b) => {
      const hi = (b >> 4) & 0xf;
      const lo = b & 0xf;
      return String.fromCharCode(97 + hi) + String.fromCharCode(97 + lo);
    })
    .join('');
  fs.writeFileSync(outExtensionId, `${extensionId}
`);
  console.log(`Extension ID: ${extensionId}`);
  console.log(`Extension ID metadata written to ${outExtensionId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
