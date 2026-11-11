import { chromium } from 'playwright';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'dist/store-assets/app-store/header-search-results');

mkdirSync(outDir, { recursive: true });

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const iconBase64 = readFileSync(resolve(rootDir, 'apps/mobile/assets/icon.png')).toString('base64');
const artDir = '/Users/bonglv/.gemini/antigravity/brain/63074737-0d84-4965-ad1f-9c816e9c8773';

const screen1Base64 = readFileSync(join(artDir, 'tab_1_doc.png')).toString('base64');
const screen2Base64 = readFileSync(join(artDir, 'tab_3_scanner.png')).toString('base64');
const screen3Base64 = readFileSync(join(artDir, 'tab_2_drop.png')).toString('base64');

function buildHtml(width, height) {
  const scale = width / 1920;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: radial-gradient(circle at 70% 30%, #1e1b4b 0%, #060913 70%);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 ${Math.round(100 * scale)}px;
      color: #ffffff;
      position: relative;
    }
    .glow-1 {
      position: absolute;
      top: -${Math.round(150 * scale)}px;
      right: ${Math.round(200 * scale)}px;
      width: ${Math.round(800 * scale)}px;
      height: ${Math.round(800 * scale)}px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%);
      border-radius: 50%;
      filter: blur(${Math.round(80 * scale)}px);
    }
    .glow-2 {
      position: absolute;
      bottom: -${Math.round(200 * scale)}px;
      left: ${Math.round(100 * scale)}px;
      width: ${Math.round(600 * scale)}px;
      height: ${Math.round(600 * scale)}px;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(${Math.round(90 * scale)}px);
    }
    .left {
      max-width: ${Math.round(850 * scale)}px;
      z-index: 2;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: ${Math.round(16 * scale)}px;
      margin-bottom: ${Math.round(24 * scale)}px;
    }
    .app-icon {
      width: ${Math.round(68 * scale)}px;
      height: ${Math.round(68 * scale)}px;
      border-radius: ${Math.round(16 * scale)}px;
      box-shadow: 0 ${Math.round(10 * scale)}px ${Math.round(30 * scale)}px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: ${Math.round(8 * scale)}px ${Math.round(18 * scale)}px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.45);
      border-radius: ${Math.round(24 * scale)}px;
      color: #a5b4fc;
      font-size: ${Math.round(16 * scale)}px;
      font-weight: 700;
      letter-spacing: ${Math.round(0.8 * scale)}px;
      text-transform: uppercase;
    }
    h1 {
      font-size: ${Math.round(64 * scale)}px;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -${Math.round(1.5 * scale)}px;
      margin-bottom: ${Math.round(18 * scale)}px;
      color: #ffffff;
    }
    h1 span {
      background: linear-gradient(135deg, #818cf8 0%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: ${Math.round(22 * scale)}px;
      color: #94a3b8;
      line-height: 1.55;
      margin-bottom: ${Math.round(36 * scale)}px;
    }
    .tags {
      display: flex;
      gap: ${Math.round(14 * scale)}px;
    }
    .tag {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: ${Math.round(10 * scale)}px ${Math.round(22 * scale)}px;
      border-radius: ${Math.round(12 * scale)}px;
      font-size: ${Math.round(16 * scale)}px;
      font-weight: 600;
      color: #e2e8f0;
      backdrop-filter: blur(10px);
    }
    .right {
      z-index: 2;
      display: flex;
      gap: ${Math.round(24 * scale)}px;
      transform: perspective(${Math.round(1200 * scale)}px) rotateY(-16deg) rotateX(6deg) translateY(${Math.round(30 * scale)}px);
    }
    .phone-mockup {
      width: ${Math.round(270 * scale)}px;
      height: ${Math.round(560 * scale)}px;
      background: #0f172a;
      border-radius: ${Math.round(38 * scale)}px;
      border: ${Math.round(6 * scale)}px solid #334155;
      box-shadow: 0 ${Math.round(30 * scale)}px ${Math.round(70 * scale)}px rgba(0,0,0,0.7);
      overflow: hidden;
      position: relative;
    }
    .phone-mockup img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .offset-up {
      transform: translateY(-${Math.round(36 * scale)}px);
    }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="left">
    <div class="brand-row">
      <img src="data:image/png;base64,${iconBase64}" class="app-icon" />
      <div class="badge">✦ Softty Office Suite</div>
    </div>
    <h1>Trình đọc tài liệu,<br>Scan & <span>Chuyển file LAN</span></h1>
    <p>Giải pháp văn phòng all-in-one cho iPhone & iPad: Đọc Word, Excel, PowerPoint, PDF; Quét hóa đơn tài liệu thông minh và Chuyển file tốc độ cao với máy tính Mac & Windows.</p>
    <div class="tags">
      <div class="tag">📄 Xem Office & PDF</div>
      <div class="tag">📷 Scan AI Tự Căn Chỉnh</div>
      <div class="tag">⚡ Chuyển File Không Dây</div>
    </div>
  </div>
  <div class="right">
    <div class="phone-mockup offset-up">
      <img src="data:image/png;base64,${screen1Base64}" />
    </div>
    <div class="phone-mockup">
      <img src="data:image/png;base64,${screen2Base64}" />
    </div>
    <div class="phone-mockup offset-up">
      <img src="data:image/png;base64,${screen3Base64}" />
    </div>
  </div>
</body>
</html>
`;
}

async function main() {
  console.log('🚀 Đang tạo bộ ảnh Header & Search Results cho App Store...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const sizes = [
    { name: 'Header_Search_Results_3840x2160', width: 3840, height: 2160 },
    { name: 'Header_Search_Results_1920x1280', width: 1920, height: 1280 },
    { name: 'Header_Search_Results_5244x2950', width: 5244, height: 2950 },
  ];

  for (const s of sizes) {
    console.log(`📸 Đang render ${s.name} (${s.width}x${s.height})...`);
    const page = await browser.newPage({
      viewport: { width: s.width, height: s.height },
      deviceScaleFactor: 1,
    });
    await page.setContent(buildHtml(s.width, s.height));
    const pngPath = join(outDir, `${s.name}.png`);
    const jpgPath = join(outDir, `${s.name}.jpg`);
    await page.screenshot({ path: pngPath, type: 'png' });
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 95 });
    await page.close();
    console.log(`  ✓ Đã lưu: ${s.name}.jpg & .png`);
  }

  await browser.close();
  console.log('\n🎉 Hoàn thành tạo bộ ảnh Header & Search Results!');
}

main().catch(console.error);
