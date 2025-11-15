/**
 * Simple documentation generator that mirrors `jsdoc2md` by invoking jsdoc directly
 * and piping its JSON output through dmd. This avoids the jsdoc2md CLI bug which
 * truncates large JSON payloads in our environment.
 */
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

function loadDmd () {
  try {
    return require('dmd');
  } catch (err) {
    // Some package managers may nest dmd under jsdoc-to-markdown
    return require('jsdoc-to-markdown/node_modules/dmd');
  }
}

const dmd = loadDmd();
const jsdocExecutable = require.resolve('jsdoc/jsdoc.js');
const projectRoot = path.resolve(__dirname, '..');

function runJsdoc (absSource) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `telnyx-docs-${process.pid}-${Date.now()}.json`);
    const fd = fs.openSync(tempFile, 'w');
    const child = spawn('node', [jsdocExecutable, '-X', absSource], {
      stdio: ['ignore', fd, 'inherit']
    });

    child.on('error', (err) => {
      fs.closeSync(fd);
      try { fs.unlinkSync(tempFile); } catch (e) {}
      reject(err);
    });

    child.on('close', (code) => {
      fs.closeSync(fd);
      if (code !== 0) {
        try { fs.unlinkSync(tempFile); } catch (e) {}
        reject(new Error(`JSDoc exited with code ${code}`));
        return;
      }
      try {
        const json = fs.readFileSync(tempFile, 'utf8');
        fs.unlinkSync(tempFile);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function buildDoc (sourcePath, destinationPath) {
  const absSource = path.resolve(projectRoot, sourcePath);
  const absDestination = path.resolve(projectRoot, destinationPath);

  const jsdocJson = await runJsdoc(absSource);
  let templateData;
  try {
    templateData = JSON.parse(jsdocJson);
  } catch (error) {
    throw new Error(`Unable to parse JSDoc JSON output for ${sourcePath}: ${error.message}`);
  }

  console.log(`Parsed ${templateData.length} JSDoc symbols from ${sourcePath}`);

  const filteredData = templateData
    .filter((item) => !item.undocumented && item.kind !== 'package')
    .map((item) => {
      const normalized = Object.assign({}, item);
      if (!normalized.id) {
        normalized.id = normalized.longname || normalized.name || 'anonymous';
      }
      if (normalized.kind === 'class' && normalized.memberof === normalized.name) {
        delete normalized.memberof;
      }
      return normalized;
    });
  console.log(`Emitting ${filteredData.length} symbols for ${sourcePath}`);
  const markdown = await dmd(filteredData, { headingDepth: 2, noCache: true });
  console.log(`Generated ${markdown.length} characters of markdown for ${destinationPath}`);
  fs.writeFileSync(absDestination, markdown, 'utf8');
  console.log(`Documentation written to ${destinationPath}`);
}

async function run () {
  await buildDoc('src/lib/telnyx-device.js', 'docs/TelnyxDevice.md');
  await buildDoc('src/lib/telnyx-call.js', 'docs/TelnyxCall.md');
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
