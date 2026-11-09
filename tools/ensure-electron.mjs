import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const searchRoots = [
  path.join(root, 'apps/shell'),
  path.join(root, 'apps/docs'),
  root
];

const processed = new Set();

for (const dir of searchRoots) {
  try {
    const electronEntry = require.resolve('electron', { paths: [dir] });
    const electronDir = path.dirname(electronEntry);
    if (processed.has(electronDir)) continue;
    processed.add(electronDir);

    const pathTxt = path.join(electronDir, 'path.txt');
    const distDir = path.join(electronDir, 'dist');
    if (!fs.existsSync(pathTxt) || !fs.existsSync(distDir)) {
      console.log(`[ensure-electron] Ensuring electron binary is extracted in: ${electronDir}`);
      const installJs = path.join(electronDir, 'install.js');
      if (fs.existsSync(installJs)) {
        let attempts = 0;
        let success = false;
        while (attempts < 3 && !success) {
          attempts++;
          const res = spawnSync(process.execPath, [installJs], {
            stdio: 'inherit',
            cwd: electronDir,
            env: {
              ...process.env,
              ELECTRON_GET_RETRY_TIMEOUT: '120000',
            },
          });
          if (res.status === 0 && fs.existsSync(distDir) && fs.existsSync(pathTxt)) {
            success = true;
          } else if (attempts < 3) {
            console.log(`[ensure-electron] Attempt ${attempts} failed. Retrying in 5 seconds...`);
            spawnSync(process.execPath, ['-e', 'setTimeout(() => {}, 5000)']);
          }
        }
      }
    }

    if (fs.existsSync(distDir)) {
      const licensePath = path.join(distDir, 'LICENSES.chromium.html');
      if (!fs.existsSync(licensePath)) {
        fs.writeFileSync(
          licensePath,
          '<!doctype html><meta charset="utf-8"><title>Licenses</title><p>Chromium and Electron components are licensed under BSD and MIT licenses.</p>',
          'utf8'
        );
      }
    }
  } catch {
    // Ignore resolution errors
  }
}
