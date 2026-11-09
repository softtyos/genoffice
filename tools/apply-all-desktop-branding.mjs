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

const concept3SvgPath = resolve(rootDir, 'dist/store-assets/logo-proposals/concept_3_office_suite_stack.svg');
const concept3Svg = readFileSync(concept3SvgPath, 'utf8');

// Windows ICO builder
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
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

async function renderPngBuffer(browser, svgString, size) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  const scaledSvg = svgString.replace('width="512" height="512"', `width="${size}" height="${size}"`);
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${scaledSvg}</body></html>`);
  const buf = await page.screenshot({ type: 'png', omitBackground: true });
  await page.close();
  return buf;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 ĐỒNG BỘ TOÀN DIỆN LOGO 3D OFFICE STACK (DESKTOP, MOBILE, WEB)');
  console.log('='.repeat(70));

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Generate master PNGs
  console.log('\n[1/5] Đang kết xuất các kích thước Master PNG...');
  const png1024 = await renderPngBuffer(browser, concept3Svg, 1024);
  const png512 = await renderPngBuffer(browser, concept3Svg, 512);
  const png256 = await renderPngBuffer(browser, concept3Svg, 256);
  const png128 = await renderPngBuffer(browser, concept3Svg, 128);
  const png64 = await renderPngBuffer(browser, concept3Svg, 64);
  const png48 = await renderPngBuffer(browser, concept3Svg, 48);
  const png32 = await renderPngBuffer(browser, concept3Svg, 32);
  const png24 = await renderPngBuffer(browser, concept3Svg, 24);
  const png16 = await renderPngBuffer(browser, concept3Svg, 16);

  // 2. Generate macOS .icns for Desktop Apps
  console.log('\n[2/5] Đang tạo bộ biểu tượng macOS .icns...');
  const tmp = mkdtempSync(join(tmpdir(), 'softty-app-icons-'));
  try {
    const iconsetDir = join(tmp, 'icon.iconset');
    mkdirSync(iconsetDir, { recursive: true });

    writeFileSync(join(iconsetDir, 'icon_16x16.png'), png16);
    writeFileSync(join(iconsetDir, 'icon_16x16@2x.png'), png32);
    writeFileSync(join(iconsetDir, 'icon_32x32.png'), png32);
    writeFileSync(join(iconsetDir, 'icon_32x32@2x.png'), png64);
    writeFileSync(join(iconsetDir, 'icon_128x128.png'), png128);
    writeFileSync(join(iconsetDir, 'icon_128x128@2x.png'), png256);
    writeFileSync(join(iconsetDir, 'icon_256x256.png'), png256);
    writeFileSync(join(iconsetDir, 'icon_256x256@2x.png'), png512);
    writeFileSync(join(iconsetDir, 'icon_512x512.png'), png512);
    writeFileSync(join(iconsetDir, 'icon_512x512@2x.png'), png1024);

    const shellBuildDir = resolve(rootDir, 'apps/shell/build');
    const docsBuildDir = resolve(rootDir, 'apps/docs/build');

    const outShellIcns = join(shellBuildDir, 'icon.icns');
    execFileSync('iconutil', ['-c', 'icns', iconsetDir, '-o', outShellIcns]);
    console.log('  ✓ Đã cập nhật apps/shell/build/icon.icns');

    if (docsBuildDir) {
      const outDocsIcns = join(docsBuildDir, 'icon.icns');
      copyFileSync(outShellIcns, outDocsIcns);
      console.log('  ✓ Đã cập nhật apps/docs/build/icon.icns');
    }

    // 3. Generate Windows .ico for Desktop Apps
    console.log('\n[3/5] Đang tạo bộ biểu tượng Windows .ico...');
    const winSizes = [
      { size: 16, png: png16 },
      { size: 24, png: png24 },
      { size: 32, png: png32 },
      { size: 48, png: png48 },
      { size: 64, png: png64 },
      { size: 128, png: png128 },
      { size: 256, png: png256 },
    ];
    const icoBuf = buildIco(winSizes);
    writeFileSync(join(shellBuildDir, 'icon.ico'), icoBuf);
    writeFileSync(join(docsBuildDir, 'icon.ico'), icoBuf);
    console.log('  ✓ Đã cập nhật apps/shell/build/icon.ico và apps/docs/build/icon.ico');

    // 4. Update Desktop Linux Icons & PNGs
    console.log('\n[4/5] Đang cập nhật biểu tượng Desktop Linux & Renderer...');
    writeFileSync(join(shellBuildDir, 'icon.png'), png512);
    writeFileSync(join(shellBuildDir, 'icon-mac.png'), png1024);
    writeFileSync(join(docsBuildDir, 'icon.png'), png512);
    writeFileSync(join(docsBuildDir, 'icon-mac.png'), png1024);

    const linuxIconsDir = join(shellBuildDir, 'icons');
    mkdirSync(linuxIconsDir, { recursive: true });
    writeFileSync(join(linuxIconsDir, '16x16.png'), png16);
    writeFileSync(join(linuxIconsDir, '24x24.png'), png24);
    writeFileSync(join(linuxIconsDir, '32x32.png'), png32);
    writeFileSync(join(linuxIconsDir, '48x48.png'), png48);
    writeFileSync(join(linuxIconsDir, '64x64.png'), png64);
    writeFileSync(join(linuxIconsDir, '128x128.png'), png128);
    writeFileSync(join(linuxIconsDir, '256x256.png'), png256);
    writeFileSync(join(linuxIconsDir, '512x512.png'), png512);
    writeFileSync(join(linuxIconsDir, '1024x1024.png'), png1024);
    console.log('  ✓ Đã cập nhật 9 độ phân giải cho apps/shell/build/icons/');

    // In-app 256x256 app-icon.png for all office renderer packages
    const appIconLocations = [
      resolve(rootDir, 'apps/shell/src/renderer/src/assets/app-icon.png'),
      resolve(rootDir, 'apps/docs/src/renderer/assets/app-icon.png'),
      resolve(rootDir, 'apps/sheets/src/renderer/assets/app-icon.png'),
      resolve(rootDir, 'apps/slides/src/renderer/assets/app-icon.png'),
    ];
    for (const loc of appIconLocations) {
      writeFileSync(loc, png256);
      console.log(`  ✓ Đã cập nhật in-app icon: ${loc}`);
    }

  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  // 5. Build Unified Softty Office Horizontal Logo SVG (Icon + Typography)
  console.log('\n[5/5] Đang tạo logo ngang Softty Office (Icon 3D + Chữ)...');
  const horizontalLogoSvg = `
<svg width="1200" height="240" viewBox="0 0 1200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient for 3D Icon Container -->
    <linearGradient id="hl_bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>

    <!-- Card 1: PDF (Red) -->
    <linearGradient id="hl_pdf" x1="200" y1="90" x2="390" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>

    <!-- Card 2: Slides (Orange) -->
    <linearGradient id="hl_slide" x1="160" y1="120" x2="350" y2="310" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>

    <!-- Card 3: Sheets (Green) -->
    <linearGradient id="hl_sheet" x1="120" y1="150" x2="310" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Card 4: Docs (Blue) -->
    <linearGradient id="hl_doc" x1="80" y1="180" x2="270" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <filter id="hl_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Left: The 3D Office Stack Icon Scaled into 224x224 Box -->
  <g transform="translate(8, 8) scale(0.4375)">
    <rect width="512" height="512" rx="112" fill="url(#hl_bg)"/>
    <g filter="url(#hl_shadow)">
      <!-- PDF -->
      <g transform="translate(195, 75) rotate(18)">
        <rect width="170" height="230" rx="20" fill="url(#hl_pdf)"/>
        <rect x="25" y="40" width="80" height="14" rx="7" fill="#ffffff" opacity="0.6"/>
        <rect x="25" y="70" width="120" height="10" rx="5" fill="#ffffff" opacity="0.35"/>
        <text x="135" y="200" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.7">PDF</text>
      </g>
      <!-- PPT -->
      <g transform="translate(155, 105) rotate(6)">
        <rect width="170" height="230" rx="20" fill="url(#hl_slide)"/>
        <circle cx="85" cy="100" r="35" fill="#ffffff" opacity="0.3"/>
        <rect x="25" y="160" width="120" height="10" rx="5" fill="#ffffff" opacity="0.4"/>
        <text x="135" y="200" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.7">PPT</text>
      </g>
      <!-- XLS -->
      <g transform="translate(115, 140) rotate(-6)">
        <rect width="170" height="230" rx="20" fill="url(#hl_sheet)"/>
        <rect x="25" y="45" width="120" height="90" rx="8" fill="#ffffff" opacity="0.2"/>
        <path d="M25 75 H145 M25 105 H145 M65 45 V135 M105 45 V135" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
        <text x="135" y="200" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.7">XLS</text>
      </g>
      <!-- DOC -->
      <g transform="translate(85, 175) rotate(-16)">
        <rect width="175" height="235" rx="22" fill="url(#hl_doc)" stroke="#60a5fa" stroke-width="2" stroke-opacity="0.5"/>
        <path d="M125 0 V45 C125 50 130 55 135 55 H175 Z" fill="#93c5fd" opacity="0.8"/>
        <path d="M125 90 H80 C60 90 55 115 80 120 C100 124 105 128 105 138 C105 155 85 160 65 160" 
              stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="140" y="205" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.9">DOC</text>
      </g>
    </g>
    <!-- AI Star -->
    <path d="M410 110 C412 125 417 129 432 131 C417 133 412 137 410 152 C408 137 403 133 388 131 C403 129 408 125 410 110 Z" fill="#38bdf8"/>
  </g>

  <!-- Right: Modern Typography Softty Office -->
  <text x="270" y="166" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif" font-size="132" font-weight="800" letter-spacing="-3.5">Softty <tspan fill="#2563EB">Office</tspan></text>
</svg>
`.trim();

  // Write to shell assets and landing public
  writeFileSync(resolve(rootDir, 'apps/shell/src/renderer/src/assets/softty-logo.svg'), horizontalLogoSvg);
  writeFileSync(resolve(rootDir, 'apps/shell/src/renderer/src/assets/genoffice-logo.svg'), horizontalLogoSvg);
  writeFileSync(resolve(rootDir, 'apps/landing/public/softty-logo.svg'), horizontalLogoSvg);
  console.log('  ✓ Đã cập nhật softty-logo.svg (Icon 3D + Softty Office text)');

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('🎉 TOÀN BỘ BỘ LOGO DESKTOP, MOBILE VÀ WEB ĐÃ ĐỒNG BỘ 100%!');
  console.log('='.repeat(70));
}

main().catch(console.error);
