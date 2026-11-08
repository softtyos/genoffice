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
        spawnSync(process.execPath, [installJs], { stdio: 'inherit', cwd: electronDir });
      }
    }
  } catch {
    // Ignore resolution errors
  }
}
