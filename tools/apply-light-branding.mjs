import { chromium } from 'playwright';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// 1. MASTER LIGHT SVGS
// Full Bleed Square (For iOS App Store 1024x1024 and Google Play Store 512x512)
const lightSvgFullBleed = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Pristine Light Background -->
    <linearGradient id="c3_bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>

    <!-- Card 1: PDF (Vibrant Scarlet Red) -->
    <linearGradient id="c3_pdf" x1="200" y1="90" x2="390" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FB7185"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>

    <!-- Card 2: Slides (Vibrant Sunset Orange) -->
    <linearGradient id="c3_slide" x1="160" y1="120" x2="350" y2="310" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>

    <!-- Card 3: Sheets (Vibrant Emerald Green) -->
    <linearGradient id="c3_sheet" x1="120" y1="150" x2="310" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <!-- Card 4: Docs (Vibrant Royal Blue - Main Front) -->
    <linearGradient id="c3_doc" x1="80" y1="180" x2="270" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>

    <!-- Multi-layered tactile 3D drop shadow optimized for light canvas -->
    <filter id="c3_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.22"/>
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.14"/>
    </filter>

    <!-- AI Star Gradient -->
    <linearGradient id="c3_star" x1="388" y1="105" x2="435" y2="153" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <!-- Solid Full Bleed Background (NO alpha, NO rounded mask) -->
  <rect width="512" height="512" fill="url(#c3_bg)"/>

  <!-- 4 Layered Office Document Cards Fanning Out in 3D -->
  <g filter="url(#c3_shadow)">
    <!-- Layer 4: PDF Card (Red - Top Right) -->
    <g transform="translate(195, 75) rotate(18)">
      <rect width="170" height="230" rx="20" fill="url(#c3_pdf)"/>
      <rect x="25" y="40" width="80" height="14" rx="7" fill="#ffffff" opacity="0.75"/>
      <rect x="25" y="70" width="120" height="10" rx="5" fill="#ffffff" opacity="0.45"/>
      <text x="135" y="200" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.92">PDF</text>
    </g>

    <!-- Layer 3: PPTX Slides Card (Orange - Middle Right) -->
    <g transform="translate(155, 105) rotate(6)">
      <rect width="170" height="230" rx="20" fill="url(#c3_slide)"/>
      <circle cx="85" cy="100" r="35" fill="#ffffff" opacity="0.35"/>
      <rect x="25" y="160" width="120" height="10" rx="5" fill="#ffffff" opacity="0.5"/>
      <text x="135" y="200" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.92">PPT</text>
    </g>

    <!-- Layer 2: XLSX Sheets Card (Green - Center Left) -->
    <g transform="translate(115, 140) rotate(-6)">
      <rect width="170" height="230" rx="20" fill="url(#c3_sheet)"/>
      <rect x="25" y="45" width="120" height="90" rx="8" fill="#ffffff" opacity="0.25"/>
      <path d="M25 75 H145 M25 105 H145 M65 45 V135 M105 45 V135" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
      <text x="135" y="200" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.92">XLS</text>
    </g>

    <!-- Layer 1: DOCX Word Card (Blue - Front Foreground) -->
    <g transform="translate(85, 175) rotate(-16)">
      <rect width="175" height="235" rx="22" fill="url(#c3_doc)"/>
      <path d="M125 0 V45 C125 50 130 55 135 55 H175 Z" fill="#93C5FD" opacity="0.9"/>
      
      <!-- Embossed Softty 'S' monogram on front document -->
      <path d="M125 90 H80 C60 90 55 115 80 120 C100 124 105 128 105 138 C105 155 85 160 65 160" 
            stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="140" y="205" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.95">DOC</text>
    </g>
  </g>

  <!-- Glowing AI Sparkle Accent -->
  <path d="M410 105 C412 122 418 127 435 129 C418 131 412 136 410 153 C408 136 402 131 385 129 C402 127 408 122 410 105 Z" 
        fill="url(#c3_star)"/>
  <circle cx="410" cy="129" r="6" fill="#ffffff" opacity="0.85"/>
</svg>
`.trim();

// Rounded Squircle version (For macOS Dock .icns and Desktop icons)
const lightSvgSquircle = lightSvgFullBleed.replace(
  '<rect width="512" height="512" fill="url(#c3_bg)"/>',
  '<rect width="512" height="512" rx="112" fill="url(#c3_bg)" stroke="#E2E8F0" stroke-width="2"/>'
);

// Windows ICO builder
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

async function renderPngBuffer(browser, svgString, size, solidOpaque = false) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  const scaledSvg = svgString.replace('width="512" height="512"', `width="${size}" height="${size}"`);
  const bgStyle = solidOpaque ? 'background:#ffffff;' : 'background:transparent;';
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;${bgStyle}">${scaledSvg}</body></html>`);
  const buf = await page.screenshot({ type: 'png', omitBackground: !solidOpaque });
  await page.close();
  return buf;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🌟 ĐỒNG BỘ TOÀN DIỆN LOGO 3D OFFICE STACK NỀN SÁNG (LIGHT THEME)');
  console.log('   Khắc phục triệt để lỗi Apple 90717 (loại bỏ hoàn toàn kênh Alpha)');
  console.log('='.repeat(70));

  // Save SVGs
  const proposalsDir = resolve(rootDir, 'dist/store-assets/logo-proposals');
  mkdirSync(proposalsDir, { recursive: true });
  writeFileSync(join(proposalsDir, 'concept_3_office_suite_stack.svg'), lightSvgFullBleed);
  writeFileSync(join(proposalsDir, 'concept_3_office_suite_stack_light.svg'), lightSvgFullBleed);
  writeFileSync(join(proposalsDir, 'concept_3_office_suite_stack_squircle.svg'), lightSvgSquircle);
  console.log('✓ Đã cập nhật SVGs Concept 3 nền sáng');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // [1] Render Master OPAQUE PNGs for iOS & Android & Stores (NO ALPHA!)
  console.log('\n[1/6] Kết xuất các icon OPAQUE (24-bit RGB, không có kênh alpha)...');
  const ios1024Opaque = await renderPngBuffer(browser, lightSvgFullBleed, 1024, true);
  const store512Opaque = await renderPngBuffer(browser, lightSvgFullBleed, 512, true);

  // Write iOS AppIcon
  const iosIconPath = resolve(rootDir, 'apps/mobile/ios/SofttyOffice/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png');
  writeFileSync(iosIconPath, ios1024Opaque);
  console.log('  ✓ Đã cập nhật iOS AppIcon (1024x1024 OPAQUE):', iosIconPath);

  // Check with sips
  const sipsCheck = execSync(`sips -g hasAlpha "${iosIconPath}"`).toString().trim();
  console.log('  🔍 Kiểm tra iOS AppIcon:', sipsCheck);

  // Write Google Play Store 512x512
  const storeIconDir = resolve(rootDir, 'dist/store-assets/google-play');
  mkdirSync(storeIconDir, { recursive: true });
  const playStoreIconPath = join(storeIconDir, 'app_icon_512x512.png');
  writeFileSync(playStoreIconPath, store512Opaque);
  console.log('  ✓ Đã cập nhật Google Play icon (512x512 OPAQUE):', playStoreIconPath);

  // Write mobile assets
  writeFileSync(resolve(rootDir, 'apps/mobile/assets/icon.png'), ios1024Opaque);
  writeFileSync(resolve(rootDir, 'apps/mobile/assets/adaptive-icon.png'), ios1024Opaque);
  console.log('  ✓ Đã cập nhật apps/mobile/assets/icon.png & adaptive-icon.png');

  // [2] Render Splash Screen (Light Theme 2048x2048)
  console.log('\n[2/6] Kết xuất màn hình chờ (Splash Screen) nền sáng...');
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
        background: #FFFFFF;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .logo {
        width: 580px;
        height: 580px;
      }
      .brand-title {
        margin-top: 40px;
        font-size: 64px;
        font-weight: 800;
        color: #0F172A;
        letter-spacing: -1.5px;
      }
      .brand-title span {
        color: #2563EB;
      }
    </style>
  </head>
  <body>
    <div class="logo">${lightSvgSquircle.replace('width="512" height="512"', 'width="580" height="580"')}</div>
    <div class="brand-title">Softty <span>Office</span></div>
  </body>
  </html>
  `;
  await pageSplash.setContent(splashHtml);
  const splashPath = resolve(rootDir, 'apps/mobile/assets/splash.png');
  await pageSplash.screenshot({ path: splashPath, type: 'png' });
  await pageSplash.close();
  console.log('  ✓ Đã cập nhật apps/mobile/assets/splash.png (2048x2048)');

  // Update app.json background colors to light
  const appJsonPath = resolve(rootDir, 'apps/mobile/app.json');
  let appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
  appJson.expo.splash.backgroundColor = '#FFFFFF';
  if (appJson.expo.android && appJson.expo.android.adaptiveIcon) {
    appJson.expo.android.adaptiveIcon.backgroundColor = '#FFFFFF';
  }
  writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log('  ✓ Đã cập nhật apps/mobile/app.json (backgroundColor: #FFFFFF)');

  // Update Android colors.xml
  const colorsXmlPath = resolve(rootDir, 'apps/mobile/android/app/src/main/res/values/colors.xml');
  const colorsXml = `
<resources>
  <color name="splashscreen_background">#FFFFFF</color>
  <color name="iconBackground">#FFFFFF</color>
  <color name="colorPrimary">#2563EB</color>
</resources>
`.trim();
  writeFileSync(colorsXmlPath, colorsXml + '\n');
  console.log('  ✓ Đã cập nhật apps/mobile/android/app/src/main/res/values/colors.xml (iconBackground: #FFFFFF)');

  // [3] Update Android Mipmap icons across all densities
  console.log('\n[3/6] Cập nhật Android launcher mipmap icons...');
  const androidDensities = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 },
  ];
  const resDir = resolve(rootDir, 'apps/mobile/android/app/src/main/res');
  for (const d of androidDensities) {
    const dDir = join(resDir, d.name);
    mkdirSync(dDir, { recursive: true });
    const buf = await renderPngBuffer(browser, lightSvgFullBleed, d.size, true);
    writeFileSync(join(dDir, 'ic_launcher.webp'), buf);
    writeFileSync(join(dDir, 'ic_launcher_round.webp'), buf);
    writeFileSync(join(dDir, 'ic_launcher_foreground.webp'), buf);
  }
  console.log('  ✓ Đã cập nhật 5 bộ mipmaps cho Android (ic_launcher, round, foreground)');

  // [4] Desktop macOS .icns, Windows .ico, Linux icons
  console.log('\n[4/6] Tạo bộ biểu tượng Desktop (macOS .icns, Windows .ico, Linux)...');
  const png1024Squircle = await renderPngBuffer(browser, lightSvgSquircle, 1024, false);
  const png512Squircle = await renderPngBuffer(browser, lightSvgSquircle, 512, false);
  const png256Squircle = await renderPngBuffer(browser, lightSvgSquircle, 256, false);
  const png128Squircle = await renderPngBuffer(browser, lightSvgSquircle, 128, false);
  const png64Squircle = await renderPngBuffer(browser, lightSvgSquircle, 64, false);
  const png48Squircle = await renderPngBuffer(browser, lightSvgSquircle, 48, false);
  const png32Squircle = await renderPngBuffer(browser, lightSvgSquircle, 32, false);
  const png24Squircle = await renderPngBuffer(browser, lightSvgSquircle, 24, false);
  const png16Squircle = await renderPngBuffer(browser, lightSvgSquircle, 16, false);

  const tmp = mkdtempSync(join(tmpdir(), 'softty-light-icons-'));
  try {
    const iconsetDir = join(tmp, 'icon.iconset');
    mkdirSync(iconsetDir, { recursive: true });
    writeFileSync(join(iconsetDir, 'icon_16x16.png'), png16Squircle);
    writeFileSync(join(iconsetDir, 'icon_16x16@2x.png'), png32Squircle);
    writeFileSync(join(iconsetDir, 'icon_32x32.png'), png32Squircle);
    writeFileSync(join(iconsetDir, 'icon_32x32@2x.png'), png64Squircle);
    writeFileSync(join(iconsetDir, 'icon_128x128.png'), png128Squircle);
    writeFileSync(join(iconsetDir, 'icon_128x128@2x.png'), png256Squircle);
    writeFileSync(join(iconsetDir, 'icon_256x256.png'), png256Squircle);
    writeFileSync(join(iconsetDir, 'icon_256x256@2x.png'), png512Squircle);
    writeFileSync(join(iconsetDir, 'icon_512x512.png'), png512Squircle);
    writeFileSync(join(iconsetDir, 'icon_512x512@2x.png'), png1024Squircle);

    const shellBuildDir = resolve(rootDir, 'apps/shell/build');
    const docsBuildDir = resolve(rootDir, 'apps/docs/build');
    const outShellIcns = join(shellBuildDir, 'icon.icns');
    execFileSync('iconutil', ['-c', 'icns', iconsetDir, '-o', outShellIcns]);
    copyFileSync(outShellIcns, join(docsBuildDir, 'icon.icns'));
    console.log('  ✓ Đã cập nhật macOS .icns cho shell và docs');

    const winSizes = [
      { size: 16, png: png16Squircle },
      { size: 24, png: png24Squircle },
      { size: 32, png: png32Squircle },
      { size: 48, png: png48Squircle },
      { size: 64, png: png64Squircle },
      { size: 128, png: png128Squircle },
      { size: 256, png: png256Squircle },
    ];
    const icoBuf = buildIco(winSizes);
    writeFileSync(join(shellBuildDir, 'icon.ico'), icoBuf);
    writeFileSync(join(docsBuildDir, 'icon.ico'), icoBuf);
    console.log('  ✓ Đã cập nhật Windows .ico cho shell và docs');

    writeFileSync(join(shellBuildDir, 'icon.png'), png512Squircle);
    writeFileSync(join(shellBuildDir, 'icon-mac.png'), png1024Squircle);
    writeFileSync(join(docsBuildDir, 'icon.png'), png512Squircle);
    writeFileSync(join(docsBuildDir, 'icon-mac.png'), png1024Squircle);

    const linuxIconsDir = join(shellBuildDir, 'icons');
    mkdirSync(linuxIconsDir, { recursive: true });
    writeFileSync(join(linuxIconsDir, '16x16.png'), png16Squircle);
    writeFileSync(join(linuxIconsDir, '24x24.png'), png24Squircle);
    writeFileSync(join(linuxIconsDir, '32x32.png'), png32Squircle);
    writeFileSync(join(linuxIconsDir, '48x48.png'), png48Squircle);
    writeFileSync(join(linuxIconsDir, '64x64.png'), png64Squircle);
    writeFileSync(join(linuxIconsDir, '128x128.png'), png128Squircle);
    writeFileSync(join(linuxIconsDir, '256x256.png'), png256Squircle);
    writeFileSync(join(linuxIconsDir, '512x512.png'), png512Squircle);
    writeFileSync(join(linuxIconsDir, '1024x1024.png'), png1024Squircle);
    console.log('  ✓ Đã cập nhật các icon Linux');

    const appIconLocations = [
      resolve(rootDir, 'apps/shell/src/renderer/src/assets/app-icon.png'),
      resolve(rootDir, 'apps/docs/src/renderer/assets/app-icon.png'),
      resolve(rootDir, 'apps/sheets/src/renderer/assets/app-icon.png'),
      resolve(rootDir, 'apps/slides/src/renderer/assets/app-icon.png'),
    ];
    for (const loc of appIconLocations) {
      writeFileSync(loc, png256Squircle);
      console.log(`  ✓ Đã cập nhật in-app icon: ${loc}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  // [5] Horizontal Logo SVG (Icon 3D + Softty Office text)
  console.log('\n[5/6] Tạo logo ngang Softty Office (Icon 3D nền sáng + Chữ)...');
  const horizontalLogoSvg = `
<svg width="1200" height="240" viewBox="0 0 1200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hl_bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>

    <!-- Card 1: PDF (Red) -->
    <linearGradient id="hl_pdf" x1="200" y1="90" x2="390" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FB7185"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>

    <!-- Card 2: Slides (Orange) -->
    <linearGradient id="hl_slide" x1="160" y1="120" x2="350" y2="310" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>

    <!-- Card 3: Sheets (Green) -->
    <linearGradient id="hl_sheet" x1="120" y1="150" x2="310" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>

    <!-- Card 4: Docs (Blue) -->
    <linearGradient id="hl_doc" x1="80" y1="180" x2="270" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>

    <filter id="hl_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.22"/>
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.14"/>
    </filter>

    <linearGradient id="hl_star" x1="388" y1="105" x2="435" y2="153" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <!-- Left: The 3D Office Stack Icon in 224x224 Box -->
  <g transform="translate(8, 8) scale(0.4375)">
    <rect width="512" height="512" rx="112" fill="url(#hl_bg)" stroke="#E2E8F0" stroke-width="3"/>
    <g filter="url(#hl_shadow)">
      <!-- PDF -->
      <g transform="translate(195, 75) rotate(18)">
        <rect width="170" height="230" rx="20" fill="url(#hl_pdf)"/>
        <rect x="25" y="40" width="80" height="14" rx="7" fill="#ffffff" opacity="0.75"/>
        <rect x="25" y="70" width="120" height="10" rx="5" fill="#ffffff" opacity="0.45"/>
        <text x="135" y="200" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.92">PDF</text>
      </g>
      <!-- PPT -->
      <g transform="translate(155, 105) rotate(6)">
        <rect width="170" height="230" rx="20" fill="url(#hl_slide)"/>
        <circle cx="85" cy="100" r="35" fill="#ffffff" opacity="0.35"/>
        <rect x="25" y="160" width="120" height="10" rx="5" fill="#ffffff" opacity="0.5"/>
        <text x="135" y="200" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.92">PPT</text>
      </g>
      <!-- XLS -->
      <g transform="translate(115, 140) rotate(-6)">
        <rect width="170" height="230" rx="20" fill="url(#hl_sheet)"/>
        <rect x="25" y="45" width="120" height="90" rx="8" fill="#ffffff" opacity="0.25"/>
        <path d="M25 75 H145 M25 105 H145 M65 45 V135 M105 45 V135" stroke="#ffffff" stroke-width="2.5" opacity="0.6"/>
        <text x="135" y="200" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.92">XLS</text>
      </g>
      <!-- DOC -->
      <g transform="translate(85, 175) rotate(-16)">
        <rect width="175" height="235" rx="22" fill="url(#hl_doc)"/>
        <path d="M125 0 V45 C125 50 130 55 135 55 H175 Z" fill="#93C5FD" opacity="0.9"/>
        <path d="M125 90 H80 C60 90 55 115 80 120 C100 124 105 128 105 138 C105 155 85 160 65 160" 
              stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="140" y="205" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.95">DOC</text>
      </g>
    </g>
    <!-- AI Star -->
    <path d="M410 105 C412 122 418 127 435 129 C418 131 412 136 410 153 C408 136 402 131 385 129 C402 127 408 122 410 105 Z" fill="url(#hl_star)"/>
    <circle cx="410" cy="129" r="6" fill="#ffffff" opacity="0.85"/>
  </g>

  <!-- Right: Modern Typography Softty Office -->
  <text x="270" y="166" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif" font-size="132" font-weight="800" letter-spacing="-3.5">Softty <tspan fill="#2563EB">Office</tspan></text>
</svg>
`.trim();

  writeFileSync(resolve(rootDir, 'apps/shell/src/renderer/src/assets/softty-logo.svg'), horizontalLogoSvg);
  writeFileSync(resolve(rootDir, 'apps/shell/src/renderer/src/assets/genoffice-logo.svg'), horizontalLogoSvg);
  writeFileSync(resolve(rootDir, 'apps/landing/public/softty-logo.svg'), horizontalLogoSvg);
  console.log('  ✓ Đã cập nhật softty-logo.svg');

  // [6] Render Google Play Store Feature Graphic (1024x500)
  console.log('\n[6/6] Kết xuất Ảnh đầu trang Google Play (Feature Graphic 1024x500)...');
  const iconBase64 = store512Opaque.toString('base64');
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
        background: linear-gradient(135deg, #0A1628 0%, #0F2347 50%, #1E3A8A 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 68px;
        color: #ffffff;
        position: relative;
      }
      .bg-glow {
        position: absolute;
        top: -100px;
        right: 40px;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(16, 185, 129, 0.25) 50%, transparent 70%);
        border-radius: 50%;
        filter: blur(60px);
      }
      .left {
        max-width: 580px;
        z-index: 2;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 16px;
        background: rgba(37, 99, 235, 0.25);
        border: 1px solid rgba(147, 197, 253, 0.4);
        border-radius: 24px;
        color: #93c5fd;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 20px;
        letter-spacing: 0.5px;
      }
      h1 {
        font-size: 52px;
        font-weight: 900;
        line-height: 1.12;
        letter-spacing: -1.2px;
        margin-bottom: 14px;
        color: #ffffff;
      }
      h1 span.hl {
        background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      p {
        font-size: 17px;
        color: #cbd5e1;
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
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.4px;
      }
      .pill-doc { background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.5); }
      .pill-sheet { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5); }
      .pill-slide { background: rgba(249, 115, 22, 0.25); color: #fdba74; border: 1px solid rgba(249, 115, 22, 0.5); }
      .pill-pdf { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.5); }
      
      .features {
        display: flex;
        gap: 12px;
      }
      .feat {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.16);
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #f1f5f9;
      }
      .right {
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo-frame {
        width: 256px;
        height: 256px;
        background: #ffffff;
        border-radius: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 30px 80px -10px rgba(0, 0, 0, 0.6), 0 0 50px rgba(37, 99, 235, 0.4);
        border: 3px solid rgba(255, 255, 255, 0.6);
        padding: 12px;
      }
      .logo-frame img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 44px;
      }
    </style>
  </head>
  <body>
    <div class="bg-glow"></div>
    <div class="left">
      <div class="badge">✦ BỘ CÔNG CỤ VĂN PHÒNG AI THÔNG MINH</div>
      <h1>Softty <span class="hl">Office</span></h1>
      <p>Soạn thảo Word, tính toán Excel, trình chiếu PowerPoint, đọc PDF & truyền dữ liệu tức thì giữa điện thoại và máy tính.</p>
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
      <div class="logo-frame">
        <img src="data:image/png;base64,${iconBase64}" alt="Softty Office Light Logo" />
      </div>
    </div>
  </body>
  </html>
  `;
  await pageFeature.setContent(featureHtml);
  const featureTarget = join(storeIconDir, 'feature_graphic_1024x500.png');
  await pageFeature.screenshot({ path: featureTarget, type: 'png' });
  await pageFeature.close();
  console.log('  ✓ Đã cập nhật Feature Graphic (1024x500):', featureTarget);

  await browser.close();

  // Copy artifacts for display in conversation
  const artifactDir = '/Users/bonglv/.gemini/antigravity/brain/63074737-0d84-4965-ad1f-9c816e9c8773';
  copyFileSync(iosIconPath, join(artifactDir, 'final_light_ios_icon_1024.png'));
  copyFileSync(playStoreIconPath, join(artifactDir, 'final_light_playstore_512.png'));
  copyFileSync(featureTarget, join(artifactDir, 'final_light_feature_graphic_1024x500.png'));
  console.log('  ✓ Đã copy các ảnh xem trước sang artifact directory');

  console.log('\n' + '='.repeat(70));
  console.log('🎉 TOÀN BỘ HỆ SINH THÁI ĐÃ ĐƯỢC CHUYỂN SANG LOGO NỀN SÁNG HOÀN TOÀN!');
  console.log('='.repeat(70));
}

main().catch(console.error);
