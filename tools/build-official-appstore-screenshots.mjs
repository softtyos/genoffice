import { chromium } from 'playwright';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'dist/store-assets/app-store');

mkdirSync(outDir, { recursive: true });

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const artDir = '/Users/bonglv/.gemini/antigravity/brain/63074737-0d84-4965-ad1f-9c816e9c8773';

// 4 clean screen captures
const screens = [
  {
    rawSrc: join(artDir, 'tab_1_doc.png'),
    badge: '✦ BỘ CÔNG CỤ VĂN PHÒNG',
    title: 'Trình đọc tài liệu Đa năng',
    desc: 'Mở và xem mượt mà file Word, Excel, PowerPoint & PDF mọi lúc mọi nơi',
    fileName: '1_documents',
  },
  {
    rawSrc: join(artDir, 'tab_3_scanner.png'),
    badge: '✦ MÁY QUÉT CAMERA',
    title: 'Quét tài liệu & Hóa đơn',
    desc: 'Chụp ảnh tài liệu sắc nét, tự động căn chỉnh và đóng gói thành file PDF đa trang',
    fileName: '2_scanner',
  },
  {
    rawSrc: join(artDir, 'tab_2_drop.png'),
    badge: '✦ CHUYỂN FILE KHÔNG DÂY',
    title: 'Chuyển file sang Máy tính',
    desc: 'Kết nối 1-chạm không dây tốc độ cao giữa iPhone và máy tính Mac / Windows',
    fileName: '3_transfer',
  },
  {
    rawSrc: join(artDir, 'tab_4_profile.png'),
    badge: '✦ TÙY BIẾN & ĐỒNG BỘ',
    title: 'Tài khoản & Cài đặt',
    desc: 'Tùy chỉnh giao diện Sáng / Tối, hỗ trợ song ngữ và lưu trữ ngoại tuyến 100%',
    fileName: '4_settings',
  },
];

const TARGET_SPECS = [
  // TAB 1 TRÊN MÀN HÌNH CỦA BẠN: iPhone with Dynamic Island (medium display)
  // Apple yêu cầu: 1206 x 2622 px hoặc 1179 x 2556 px
  {
    folder: '1_Tab_iPhone_Dynamic_Island_Medium_(1206x2622)',
    width: 1206,
    height: 2622,
    frameWidth: 1020,
    frameHeight: 1880,
    titleSize: 74,
    descSize: 32,
    badgeSize: 24,
    isPad: false,
    headerMarginTop: 130,
    isDefaultRoot: false,
  },
  {
    folder: '1_Tab_iPhone_Dynamic_Island_Medium_Alt_(1179x2556)',
    width: 1179,
    height: 2556,
    frameWidth: 1000,
    frameHeight: 1840,
    titleSize: 72,
    descSize: 32,
    badgeSize: 24,
    isPad: false,
    headerMarginTop: 125,
    isDefaultRoot: true, // Copy ra thư mục gốc - kích thước chuẩn được Apple yêu cầu
  },
  // TAB 2 TRÊN MÀN HÌNH: iPhone Duo
  // Apple yêu cầu: Outer 1398 x 2034 px, Inner 2007 x 2853 px
  {
    folder: '2_Tab_iPhone_Duo_Outer_(1398x2034)',
    width: 1398,
    height: 2034,
    frameWidth: 1120,
    frameHeight: 1420,
    titleSize: 70,
    descSize: 30,
    badgeSize: 22,
    isPad: false,
    headerMarginTop: 100,
    isDefaultRoot: false,
  },
  {
    folder: '2_Tab_iPhone_Duo_Inner_(2007x2853)',
    width: 2007,
    height: 2853,
    frameWidth: 1540,
    frameHeight: 2040,
    titleSize: 98,
    descSize: 42,
    badgeSize: 30,
    isPad: true,
    headerMarginTop: 150,
    isDefaultRoot: false,
  },
  // TAB 3 TRÊN MÀN HÌNH: iPad 13" display
  // Apple yêu cầu: 2064 x 2752 px
  {
    folder: '3_Tab_iPad_13_inch_M4_(2064x2752)',
    width: 2064,
    height: 2752,
    frameWidth: 1560,
    frameHeight: 1980,
    titleSize: 100,
    descSize: 44,
    badgeSize: 32,
    isPad: true,
    headerMarginTop: 160,
    isDefaultRoot: false,
  },
  // CÁC KÍCH THƯỚC PHỤ KHÁC (iPhone 6.9", 6.7", 6.5", 5.5", iPad 12.9")
  {
    folder: '4_Extra_iPhone_6.9_inch_(1320x2868)',
    width: 1320,
    height: 2868,
    frameWidth: 1120,
    frameHeight: 2080,
    titleSize: 82,
    descSize: 36,
    badgeSize: 26,
    isPad: false,
    headerMarginTop: 150,
    isDefaultRoot: false,
  },
  {
    folder: '5_Extra_iPhone_6.7_inch_(1290x2796)',
    width: 1290,
    height: 2796,
    frameWidth: 1080,
    frameHeight: 2020,
    titleSize: 78,
    descSize: 34,
    badgeSize: 25,
    isPad: false,
    headerMarginTop: 140,
    isDefaultRoot: false,
  },
  {
    folder: '6_Extra_iPhone_6.5_inch_(1284x2778)',
    width: 1284,
    height: 2778,
    frameWidth: 1070,
    frameHeight: 2000,
    titleSize: 78,
    descSize: 34,
    badgeSize: 25,
    isPad: false,
    headerMarginTop: 140,
    isDefaultRoot: false,
  },
  {
    folder: '7_Extra_iPhone_5.5_inch_(1242x2208)',
    width: 1242,
    height: 2208,
    frameWidth: 980,
    frameHeight: 1560,
    titleSize: 66,
    descSize: 28,
    badgeSize: 22,
    isPad: false,
    headerMarginTop: 110,
    isDefaultRoot: false,
  },
  {
    folder: '8_Extra_iPad_12.9_inch_(2048x2732)',
    width: 2048,
    height: 2732,
    frameWidth: 1540,
    frameHeight: 1960,
    titleSize: 98,
    descSize: 42,
    badgeSize: 32,
    isPad: true,
    headerMarginTop: 160,
    isDefaultRoot: false,
  },
];

function buildRawHtml(width, height, imgBase64, isPad) {
  const statusBarHeight = Math.round(height * (isPad ? 0.035 : 0.048));
  const homeBarHeight = Math.round(height * (isPad ? 0.025 : 0.02));
  const islandWidth = Math.round(width * 0.22);
  const islandHeight = Math.round(statusBarHeight * 0.58);
  const fontSize = Math.round(statusBarHeight * 0.28);

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
        background: #0A0F1D;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
      }
      .status-bar {
        height: ${statusBarHeight}px;
        background: #0A0F1D;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 ${Math.round(width * 0.05)}px;
        color: #ffffff;
        font-weight: 600;
        font-size: ${fontSize}px;
        position: relative;
        z-index: 10;
        flex-shrink: 0;
      }
      .dynamic-island {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${islandWidth}px;
        height: ${islandHeight}px;
        background: #000000;
        border-radius: ${islandHeight}px;
      }
      .status-right {
        display: flex;
        align-items: center;
        gap: ${Math.round(width * 0.012)}px;
      }
      .battery {
        width: ${Math.round(width * 0.045)}px;
        height: ${Math.round(width * 0.022)}px;
        border: 3.5px solid #ffffff;
        border-radius: 7px;
        position: relative;
        padding: 2px;
      }
      .battery::after {
        content: "";
        position: absolute;
        right: -7px;
        top: 25%;
        width: 3.5px;
        height: 50%;
        background: #ffffff;
        border-radius: 1.5px;
      }
      .battery-level {
        width: 80%;
        height: 100%;
        background: #ffffff;
        border-radius: 1.5px;
      }
      .app-wrapper {
        flex: 1;
        width: ${width}px;
        overflow: hidden;
        position: relative;
        background: #0A0F1D;
      }
      .app-img {
        position: absolute;
        top: -${Math.round(height * 0.038)}px;
        left: 0;
        width: ${width}px;
        height: ${Math.round(height * 0.98)}px;
        object-fit: fill;
      }
      .home-bar {
        height: ${homeBarHeight}px;
        background: #070B14;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 10;
      }
      .home-indicator {
        width: ${Math.round(width * 0.25)}px;
        height: ${Math.round(homeBarHeight * 0.18)}px;
        background: #ffffff;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <div class="status-bar">
      <span>9:41</span>
      ${!isPad ? '<div class="dynamic-island"></div>' : ''}
      <div class="status-right">
        <svg width="${Math.round(width * 0.03)}" height="${Math.round(width * 0.022)}" viewBox="0 0 24 18" fill="white">
          <rect x="1" y="12" width="3" height="6" rx="1"/>
          <rect x="7" y="8" width="3" height="10" rx="1"/>
          <rect x="13" y="4" width="3" height="14" rx="1"/>
          <rect x="19" y="0" width="3" height="18" rx="1"/>
        </svg>
        <svg width="${Math.round(width * 0.028)}" height="${Math.round(width * 0.022)}" viewBox="0 0 24 24" fill="white">
          <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.55 0 6.8 1.34 9.27 3.55L12 18.25 2.73 11.05C5.2 8.84 8.45 7.5 12 7.5z"/>
        </svg>
        <div class="battery"><div class="battery-level"></div></div>
      </div>
    </div>
    <div class="app-wrapper">
      <img src="${imgBase64}" class="app-img" />
    </div>
    <div class="home-bar">
      <div class="home-indicator"></div>
    </div>
  </body>
  </html>
  `;
}

function buildFramedHtml(spec, screenObj, rawImgBase64) {
  const { width, height, frameWidth, frameHeight, titleSize, descSize, badgeSize, isPad, headerMarginTop } = spec;
  const borderRadius = isPad ? 60 : 90;
  const innerRadius = isPad ? 48 : 76;

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
        background: linear-gradient(180deg, #090E1A 0%, #050811 100%);
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #ffffff;
        position: relative;
      }
      .glow {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: ${Math.round(width * 0.85)}px;
        height: ${Math.round(width * 0.85)}px;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%);
        border-radius: 50%;
        filter: blur(100px);
        z-index: 1;
      }
      .header {
        margin-top: ${headerMarginTop}px;
        text-align: center;
        max-width: ${Math.round(width * 0.88)}px;
        z-index: 2;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: ${Math.round(badgeSize * 0.38)}px ${Math.round(badgeSize * 1.1)}px;
        background: rgba(37, 99, 235, 0.25);
        border: 1.5px solid rgba(147, 197, 253, 0.5);
        border-radius: 40px;
        color: #93C5FD;
        font-size: ${badgeSize}px;
        font-weight: 800;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        margin-bottom: ${Math.round(badgeSize * 0.9)}px;
        box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
      }
      .title {
        font-size: ${titleSize}px;
        font-weight: 900;
        line-height: 1.15;
        letter-spacing: -1.5px;
        margin-bottom: ${Math.round(descSize * 0.5)}px;
        background: linear-gradient(135deg, #FFFFFF 40%, #E2E8F0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .desc {
        font-size: ${descSize}px;
        font-weight: 500;
        color: #94A3B8;
        line-height: 1.4;
        padding: 0 40px;
      }
      .mockup-container {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        width: ${frameWidth}px;
        height: ${frameHeight}px;
        background: #1E293B;
        border-radius: ${borderRadius}px ${borderRadius}px 0 0;
        padding: 16px 16px 0 16px;
        box-shadow: 0 -20px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(37, 99, 235, 0.25);
        border: 4px solid #334155;
        border-bottom: none;
        z-index: 2;
      }
      .mockup-screen {
        width: 100%;
        height: 100%;
        border-radius: ${innerRadius}px ${innerRadius}px 0 0;
        overflow: hidden;
        background: #000000;
        position: relative;
      }
      .mockup-screen img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <div class="header">
      <div class="badge">${screenObj.badge}</div>
      <div class="title">${screenObj.title}</div>
      <div class="desc">${screenObj.desc}</div>
    </div>
    <div class="mockup-container">
      <div class="mockup-screen">
        <img src="${rawImgBase64}" />
      </div>
    </div>
  </body>
  </html>
  `;
}

async function main() {
  console.log('🚀 Bắt đầu tạo bộ ảnh chụp màn hình App Store toàn diện...');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const screenDataUris = screens.map(s => {
    return 'data:image/png;base64,' + readFileSync(s.rawSrc).toString('base64');
  });

  for (const spec of TARGET_SPECS) {
    console.log(`\n📱 Đang tạo kích thước: ${spec.folder} (${spec.width}x${spec.height})...`);
    
    const rawTierDir = join(outDir, 'raw', spec.folder);
    const framedTierDir = join(outDir, 'framed', spec.folder);
    mkdirSync(rawTierDir, { recursive: true });
    mkdirSync(framedTierDir, { recursive: true });

    for (let i = 0; i < screens.length; i++) {
      const scr = screens[i];
      const baseUri = screenDataUris[i];

      // 1. Raw Fullscreen
      const rawHtml = buildRawHtml(spec.width, spec.height, baseUri, spec.isPad);
      const rawPage = await browser.newPage({
        viewport: { width: spec.width, height: spec.height },
        deviceScaleFactor: 1,
      });
      await rawPage.setContent(rawHtml);
      
      const rawPngPath = join(rawTierDir, `${scr.fileName}.png`);
      const rawJpgPath = join(rawTierDir, `${scr.fileName}.jpg`);
      await rawPage.screenshot({ path: rawPngPath, type: 'png' });
      await rawPage.screenshot({ path: rawJpgPath, type: 'jpeg', quality: 95 });
      await rawPage.close();

      const cleanRawBase64 = 'data:image/png;base64,' + readFileSync(rawPngPath).toString('base64');

      // 2. Framed Poster
      const framedHtml = buildFramedHtml(spec, scr, cleanRawBase64);
      const framedPage = await browser.newPage({
        viewport: { width: spec.width, height: spec.height },
        deviceScaleFactor: 1,
      });
      await framedPage.setContent(framedHtml);

      const framedPngPath = join(framedTierDir, `${scr.fileName}.png`);
      const framedJpgPath = join(framedTierDir, `${scr.fileName}.jpg`);
      await framedPage.screenshot({ path: framedPngPath, type: 'png' });
      await framedPage.screenshot({ path: framedJpgPath, type: 'jpeg', quality: 95 });
      await framedPage.close();

      // Nếu là kích thước mặc định cho Tab hiện tại của App Store Connect (1206x2622), copy ra ngoài thư mục gốc!
      if (spec.isDefaultRoot) {
        copyFileSync(framedJpgPath, join(outDir, `${scr.fileName}.jpg`));
        copyFileSync(framedPngPath, join(outDir, `${scr.fileName}.png`));
      }

      console.log(`  ✓ [${scr.fileName}] Hoàn tất.`);
    }
  }

  await browser.close();
  console.log('\n🎉 Đã tạo xong toàn bộ các bộ ảnh!');
}

main().catch(err => {
  console.error('Lỗi khi tạo ảnh:', err);
  process.exit(1);
});
