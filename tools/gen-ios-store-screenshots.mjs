import { chromium } from 'playwright';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'dist/store-assets/app-store');
mkdirSync(outDir, { recursive: true });

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const rawScreenshots = [
  {
    file: resolve(outDir, 'ios_clean_1_documents.png'),
    badgeVi: 'BỘ CÔNG CỤ VĂN PHÒNG',
    titleVi: 'Trình đọc tài liệu Đa năng',
    descVi: 'Mở và xem mượt mà file Word, Excel, PowerPoint & PDF mọi lúc mọi nơi',
    badgeEn: 'OFFICE SUITE',
    titleEn: 'All-in-One Document Reader',
    descEn: 'Open & view Word, Excel, PowerPoint & PDF effortlessly anytime, anywhere',
  },
  {
    file: resolve(outDir, 'ios_clean_2_scanner.png'),
    badgeVi: 'MÁY QUÉT CAMERA',
    titleVi: 'Quét tài liệu & Hóa đơn',
    descVi: 'Chụp ảnh tài liệu, xử lý sắc nét và đóng gói thành file PDF đa trang',
    badgeEn: 'CAMERA SCANNER',
    titleEn: 'Smart Document Scanner',
    descEn: 'Capture documents, auto-enhance and export multi-page PDF files',
  },
  {
    file: resolve(outDir, 'ios_clean_3_drop.png'),
    badgeVi: 'CHUYỂN FILE KHÔNG DÂY',
    titleVi: 'Chuyển file sang Máy tính',
    descVi: 'Kết nối 1-chạm không dây tốc độ cao giữa iPhone và máy tính Mac / PC',
    badgeEn: 'FILE TRANSFER',
    titleEn: 'Instant PC File Transfer',
    descEn: '1-tap high-speed wireless transfer between iPhone and Mac / PC',
  },
  {
    file: resolve(outDir, 'ios_clean_4_profile.png'),
    badgeVi: 'TÙY BIẾN & ĐỒNG BỘ',
    titleVi: 'Tài khoản & Cài đặt',
    descVi: 'Tùy chỉnh giao diện Sáng / Tối, hỗ trợ song ngữ và ngoại tuyến 100%',
    badgeEn: 'SETTINGS & PRIVACY',
    titleEn: 'Accounts & Customization',
    descEn: 'Dark & Light theme, bilingual support and 100% offline privacy',
  },
];

async function generateScreenshots() {
  console.log('🚀 Đang tạo bộ ảnh chụp màn hình iOS (iPhone 1290x2796) chuẩn Apple App Store...');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  for (let i = 0; i < rawScreenshots.length; i++) {
    const item = rawScreenshots[i];
    const imgBase64 = readFileSync(item.file).toString('base64');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 1290px;
          height: 2796px;
          overflow: hidden;
          background: linear-gradient(180deg, #0F172A 0%, #090D16 35%, #050811 100%);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #ffffff;
          position: relative;
        }
        .glow {
          position: absolute;
          top: -150px;
          left: 50%;
          transform: translateX(-50%);
          width: 1000px;
          height: 1000px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%);
          border-radius: 50%;
          filter: blur(100px);
          z-index: 1;
        }
        .header {
          margin-top: 130px;
          text-align: center;
          max-width: 1100px;
          z-index: 2;
          padding: 0 40px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          background: rgba(37, 99, 235, 0.22);
          border: 1.5px solid rgba(147, 197, 253, 0.45);
          border-radius: 40px;
          color: #93C5FD;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 28px;
        }
        h1 {
          font-size: 78px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -2px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 34px;
          color: #94A3B8;
          line-height: 1.45;
          font-weight: 500;
        }
        .device-frame {
          position: absolute;
          bottom: -80px;
          width: 1060px;
          height: 2000px;
          background: #111827;
          border-radius: 80px 80px 0 0;
          border: 14px solid #1E293B;
          border-bottom: none;
          box-shadow: 0 -30px 100px rgba(0, 0, 0, 0.8), 0 0 60px rgba(37, 99, 235, 0.25);
          overflow: hidden;
          z-index: 2;
          display: flex;
          justify-content: center;
        }
        .screen-img {
          width: 100%;
          height: auto;
          object-fit: contain;
          border-radius: 66px 66px 0 0;
        }
      </style>
    </head>
    <body>
      <div class="glow"></div>
      <div class="header">
        <div class="badge">✦ ${item.badgeVi}</div>
        <h1>${item.titleVi}</h1>
        <p>${item.descVi}</p>
      </div>
      <div class="device-frame">
        <img class="screen-img" src="data:image/png;base64,${imgBase64}" alt="Screen" />
      </div>
    </body>
    </html>
    `;

    const page = await browser.newPage({
      viewport: { width: 1290, height: 2796 },
      deviceScaleFactor: 1,
    });
    await page.setContent(htmlContent);
    const targetPath = join(outDir, `iphone_6.7_screenshot_${i + 1}.png`);
    await page.screenshot({ path: targetPath, type: 'png' });
    await page.close();
    console.log(`  ✓ Đã tạo iPhone: ${targetPath}`);

    // Generate iPad 13" screenshot (2048 x 2732)
    const ipadHtmlContent = htmlContent
      .replace('width: 1290px;', 'width: 2048px;')
      .replace('height: 2796px;', 'height: 2732px;')
      .replace('width: 1060px;', 'width: 1500px;')
      .replace('height: 2000px;', 'height: 1950px;')
      .replace('font-size: 78px;', 'font-size: 100px;')
      .replace('font-size: 34px;', 'font-size: 44px;')
      .replace('font-size: 26px;', 'font-size: 34px;');

    const ipadPage = await browser.newPage({
      viewport: { width: 2048, height: 2732 },
      deviceScaleFactor: 1,
    });
    await ipadPage.setContent(ipadHtmlContent);
    const ipadTargetPath = join(outDir, `ipad_13_screenshot_${i + 1}.png`);
    await ipadPage.screenshot({ path: ipadTargetPath, type: 'png' });
    await ipadPage.close();
    console.log(`  ✓ Đã tạo iPad: ${ipadTargetPath}`);
  }

  await browser.close();
  console.log('🎉 Toàn bộ ảnh chụp màn hình iOS (1290x2796) đã sẵn sàng trong dist/store-assets/app-store/');
}

generateScreenshots().catch(console.error);
