import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const proposalsDir = resolve(rootDir, 'dist/store-assets/logo-proposals');
const concept3SvgPath = resolve(proposalsDir, 'concept_3_office_suite_stack.svg');
const concept3Svg = readFileSync(concept3SvgPath, 'utf8');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('🚀 Đang áp dụng Logo Phương án 3 (The 3D Office Suite Stack) trên toàn bộ hệ sinh thái...');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Render Master 1024x1024 Icon
  const page1024 = await browser.newPage({
    viewport: { width: 1024, height: 1024 },
    deviceScaleFactor: 1,
  });
  const scaledSvg1024 = concept3Svg.replace('width="512" height="512"', 'width="1024" height="1024"');
  await page1024.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${scaledSvg1024}</body></html>`);
  const masterIcon1024 = resolve(rootDir, 'apps/mobile/assets/icon.png');
  await page1024.screenshot({ path: masterIcon1024, type: 'png', omitBackground: true });
  console.log('  ✓ Đã cập nhật apps/mobile/assets/icon.png (1024x1024)');

  // 2. Render 512x512 Store Icon
  const page512 = await browser.newPage({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1,
  });
  await page512.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${concept3Svg}</body></html>`);
  const storeIcon512 = resolve(rootDir, 'dist/store-assets/google-play/app_icon_512x512.png');
  await page512.screenshot({ path: storeIcon512, type: 'png', omitBackground: true });
  console.log('  ✓ Đã cập nhật dist/store-assets/google-play/app_icon_512x512.png (512x512)');

  // 3. Render Adaptive Icon (Centered logo on square for Android)
  const adaptiveIconPath = resolve(rootDir, 'apps/mobile/assets/adaptive-icon.png');
  copyFileSync(masterIcon1024, adaptiveIconPath);
  console.log('  ✓ Đã cập nhật apps/mobile/assets/adaptive-icon.png');

  // 4. Render Splash Screen (2048 x 2048 with centered logo)
  const pageSplash = await browser.newPage({
    viewport: { width: 2048, height: 2048 },
    deviceScaleFactor: 1,
  });
  const splashHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        width: 2048px;
        height: 2048px;
        background: #090d16;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .logo {
        width: 600px;
        height: 600px;
      }
    </style>
  </head>
  <body>
    <div class="logo">${concept3Svg.replace('width="512" height="512"', 'width="600" height="600"')}</div>
  </body>
  </html>
  `;
  await pageSplash.setContent(splashHtml);
  const splashPath = resolve(rootDir, 'apps/mobile/assets/splash.png');
  await pageSplash.screenshot({ path: splashPath, type: 'png' });
  console.log('  ✓ Đã cập nhật apps/mobile/assets/splash.png');

  // 5. iOS Native AppIcon
  const iosIconPath = resolve(rootDir, 'apps/mobile/ios/SofttyOffice/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png');
  copyFileSync(masterIcon1024, iosIconPath);
  console.log('  ✓ Đã cập nhật iOS AppIcon (1024x1024)');

  // 6. Feature Graphic 1024x500 with Concept 3
  const iconBase64 = readFileSync(storeIcon512).toString('base64');
  const pageFeature = await browser.newPage({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1,
  });
  const featureHtml = `
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
        background: radial-gradient(circle at 72% 35%, #172554 0%, #090d16 75%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 68px;
        color: #ffffff;
        position: relative;
      }
      .mesh-glow {
        position: absolute;
        top: -60px;
        right: 20px;
        width: 520px;
        height: 520px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(16, 185, 129, 0.18) 45%, transparent 70%);
        border-radius: 50%;
        filter: blur(50px);
      }
      .left {
        max-width: 580px;
        z-index: 2;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: rgba(59, 130, 246, 0.18);
        border: 1px solid rgba(59, 130, 246, 0.45);
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
        margin-bottom: 22px;
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
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.4px;
      }
      .pill-doc { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
      .pill-sheet { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
      .pill-slide { background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); }
      .pill-pdf { background: rgba(244, 63, 94, 0.2); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); }
      
      .features {
        display: flex;
        gap: 12px;
      }
      .feat {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
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
        box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.6), 0 0 50px rgba(59, 130, 246, 0.35);
      }
      .logo-container img {
        width: 220px;
        height: 220px;
        border-radius: 44px;
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
        <img src="data:image/png;base64,${iconBase64}" alt="Softty Office Logo" />
      </div>
    </div>
  </body>
  </html>
  `;
  await pageFeature.setContent(featureHtml);
  const featureGraphicPath = resolve(rootDir, 'dist/store-assets/google-play/feature_graphic_1024x500.png');
  await pageFeature.screenshot({ path: featureGraphicPath, type: 'png' });
  console.log('  ✓ Đã cập nhật dist/store-assets/google-play/feature_graphic_1024x500.png');

  await browser.close();

  // 7. Update Android native mipmaps & splashscreen_logo across densities
  console.log('\n🤖 Đang cập nhật Android native mipmaps & splashscreen...');
  const resDir = resolve(rootDir, 'apps/mobile/android/app/src/main/res');
  const tempPng = '/tmp/temp_icon_convert.png';

  const densities = [
    { name: 'mdpi', iconSize: 48, fgSize: 108, splashSize: 288 },
    { name: 'hdpi', iconSize: 72, fgSize: 162, splashSize: 432 },
    { name: 'xhdpi', iconSize: 96, fgSize: 216, splashSize: 576 },
    { name: 'xxhdpi', iconSize: 144, fgSize: 324, splashSize: 864 },
    { name: 'xxxhdpi', iconSize: 192, fgSize: 432, splashSize: 1152 },
  ];

  for (const d of densities) {
    const mipmapDir = resolve(resDir, `mipmap-${d.name}`);
    const drawableDir = resolve(resDir, `drawable-${d.name}`);

    // ic_launcher.webp
    execSync(`sips -z ${d.iconSize} ${d.iconSize} "${masterIcon1024}" --out "${tempPng}" >/dev/null`);
    execSync(`cwebp -q 100 "${tempPng}" -o "${resolve(mipmapDir, 'ic_launcher.webp')}" >/dev/null 2>&1`);

    // ic_launcher_round.webp
    copyFileSync(resolve(mipmapDir, 'ic_launcher.webp'), resolve(mipmapDir, 'ic_launcher_round.webp'));

    // ic_launcher_foreground.webp
    execSync(`sips -z ${d.fgSize} ${d.fgSize} "${masterIcon1024}" --out "${tempPng}" >/dev/null`);
    execSync(`cwebp -q 100 "${tempPng}" -o "${resolve(mipmapDir, 'ic_launcher_foreground.webp')}" >/dev/null 2>&1`);

    // splashscreen_logo.png
    if (d.splashSize) {
      execSync(`sips -z ${d.splashSize} ${d.splashSize} "${masterIcon1024}" --out "${resolve(drawableDir, 'splashscreen_logo.png')}" >/dev/null`);
    }

    console.log(`  ✓ Đã cập nhật mipmap-${d.name} (${d.iconSize}px) & drawable-${d.name}`);
  }

  // 8. Update Web & Desktop shared marks
  console.log('\n🌐 Đang cập nhật biểu tượng web & desktop...');
  const landingPublic = resolve(rootDir, 'apps/landing/public');
  writeFileSync(resolve(landingPublic, 'softty-mark.svg'), concept3Svg);
  copyFileSync(storeIcon512, resolve(landingPublic, 'logo.png'));
  execSync(`sips -z 180 180 "${storeIcon512}" --out "${resolve(landingPublic, 'apple-touch-icon.png')}" >/dev/null`);
  writeFileSync(resolve(rootDir, 'apps/landing/app/icon.svg'), concept3Svg);

  const shellAssets = resolve(rootDir, 'apps/shell/src/renderer/src/assets');
  writeFileSync(resolve(shellAssets, 'softty-mark.svg'), concept3Svg);

  console.log('\n🎉 HOÀN TẤT ĐỒNG BỘ TOÀN DIỆN LOGO PHƯƠNG ÁN 3!');
}

main().catch(console.error);
