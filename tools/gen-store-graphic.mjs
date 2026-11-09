import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'dist/store-assets/google-play');

const iconBase64 = readFileSync(resolve(rootDir, 'apps/mobile/assets/icon.png')).toString('base64');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1024px;
      height: 500px;
      overflow: hidden;
      background: radial-gradient(circle at 75% 30%, #1e1b4b 0%, #090d16 70%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 70px;
      color: #ffffff;
      position: relative;
    }
    .mesh-glow {
      position: absolute;
      top: -100px;
      right: -50px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%);
      border-radius: 50%;
      filter: blur(40px);
    }
    .left {
      max-width: 580px;
      z-index: 2;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 20px;
      color: #818cf8;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 54px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -1px;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h1 span {
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 18px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .tags {
      display: flex;
      gap: 12px;
    }
    .tag {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #cbd5e1;
    }
    .right {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-container {
      width: 240px;
      height: 240px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.3);
    }
    .logo-container img {
      width: 200px;
      height: 200px;
      border-radius: 36px;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="mesh-glow"></div>
  <div class="left">
    <div class="badge">✦ AI-NATIVE MOBILE COMPANION</div>
    <h1>Softty <span>Office</span></h1>
    <p>Bộ ứng dụng văn phòng thông minh: Đọc Word, Excel, PowerPoint, PDF offline & Softty Drop chuyển file siêu tốc.</p>
    <div class="tags">
      <div class="tag">⚡ Softty Drop LAN</div>
      <div class="tag">📷 Smart Scanner</div>
      <div class="tag">🔒 100% Bảo mật Cục bộ</div>
    </div>
  </div>
  <div class="right">
    <div class="logo-container">
      <img src="data:image/png;base64,${iconBase64}" alt="Softty Office" />
    </div>
  </div>
</body>
</html>
`;

async function main() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1,
  });
  await page.setContent(htmlContent);
  const targetPath = resolve(outDir, 'feature_graphic_1024x500.png');
  await page.screenshot({ path: targetPath, type: 'png' });
  await browser.close();
  console.log('✓ Created Feature Graphic 1024x500 at:', targetPath);
}

main().catch(console.error);
