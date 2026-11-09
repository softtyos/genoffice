import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, copyFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'dist/store-assets/google-play');
const logoPath = resolve(rootDir, 'dist/store-assets/logo-proposals/concept_1_fluent_ribbon_512x512.png');

const logoBase64 = readFileSync(logoPath).toString('base64');

// Also update the app_icon_512x512.png in google-play directory
copyFileSync(logoPath, resolve(outDir, 'app_icon_512x512.png'));

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
      background: radial-gradient(circle at 70% 30%, #172554 0%, #090d16 75%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 64px;
      color: #ffffff;
      position: relative;
    }
    .mesh-glow {
      position: absolute;
      top: -80px;
      right: 0px;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.28) 0%, rgba(16, 185, 129, 0.18) 45%, transparent 70%);
      border-radius: 50%;
      filter: blur(50px);
    }
    .left {
      max-width: 590px;
      z-index: 2;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-radius: 20px;
      color: #93c5fd;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 18px;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 52px;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -1.2px;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h1 span.hl {
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 17px;
      color: #94a3b8;
      line-height: 1.55;
      margin-bottom: 24px;
    }
    .office-pills {
      display: flex;
      gap: 10px;
      margin-bottom: 22px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.4px;
    }
    .pill-doc { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.35); }
    .pill-sheet { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); }
    .pill-slide { background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.35); }
    .pill-pdf { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); }
    
    .features {
      display: flex;
      gap: 12px;
    }
    .feat {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #e2e8f0;
    }
    .right {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-container {
      width: 250px;
      height: 250px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.6), 0 0 50px rgba(59, 130, 246, 0.3);
    }
    .logo-container img {
      width: 210px;
      height: 210px;
      border-radius: 40px;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="mesh-glow"></div>
  <div class="left">
    <div class="badge">✦ BỘ CÔNG CỤ VĂN PHÒNG THÔNG MINH</div>
    <h1>Softty <span class="hl">Office</span></h1>
    <p>Trình đọc tài liệu văn phòng tất cả trong một & kết nối truyền file tức thì giữa điện thoại và máy tính.</p>
    <div class="office-pills">
      <span class="pill pill-doc">📄 Word .docx</span>
      <span class="pill pill-sheet">📊 Excel .xlsx</span>
      <span class="pill pill-slide">📽️ PPT .pptx</span>
      <span class="pill pill-pdf">📕 PDF & Scan</span>
    </div>
    <div class="features">
      <div class="feat">⚡ Softty Drop LAN</div>
      <div class="feat">📷 Máy quét Camera</div>
      <div class="feat">🔒 100% Cục bộ Offline</div>
    </div>
  </div>
  <div class="right">
    <div class="logo-container">
      <img src="data:image/png;base64,${logoBase64}" alt="Softty Office Logo" />
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
  console.log('✓ Updated Feature Graphic 1024x500 with new Office logo at:', targetPath);
}

main().catch(console.error);
