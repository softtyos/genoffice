import { chromium } from 'playwright';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'dist/store-assets/social');
mkdirSync(outDir, { recursive: true });

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const logoPath = resolve(rootDir, 'dist/store-assets/google-play/app_icon_512x512.png');
const logoBase64 = readFileSync(logoPath).toString('base64');

// 1. Poster Vuông Chuẩn 1:1 (1200 x 1200 px) - Nền Sáng Hiện Đại
const squareLightHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 1200px;
      overflow: hidden;
      background: linear-gradient(145deg, #FFFFFF 0%, #F0F6FF 45%, #E8F1FC 100%);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 65px 60px 55px 60px;
      color: #0F172A;
      position: relative;
    }

    /* Ambient Soft Light Gradients */
    .glow-top {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 70%);
      border-radius: 50%;
      filter: blur(80px);
      z-index: 1;
    }

    .glow-bottom {
      position: absolute;
      bottom: -150px;
      right: -100px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 65%);
      border-radius: 50%;
      filter: blur(70px);
      z-index: 1;
    }

    /* Top Section */
    .header {
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      background: #EFF6FF;
      border: 1.5px solid #BFDBFE;
      border-radius: 30px;
      color: #1D4ED8;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 20px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.12);
    }

    h1.title {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -2px;
      margin-bottom: 12px;
      color: #0F172A;
    }

    h1.title span.hl {
      color: #2563EB;
      background: linear-gradient(135deg, #2563EB 0%, #0284C7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.subtitle {
      font-size: 21px;
      color: #475569;
      max-width: 880px;
      line-height: 1.45;
      font-weight: 500;
    }

    /* Hero Center Section */
    .hero-center {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      width: 100%;
      margin: 15px 0;
    }

    .logo-frame {
      width: 250px;
      height: 250px;
      background: #FFFFFF;
      border-radius: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 25px 60px -10px rgba(37, 99, 235, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      border: 3px solid #E2E8F0;
      padding: 12px;
      flex-shrink: 0;
    }

    .logo-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 44px;
    }

    .apps-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 500px;
    }

    .app-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 16px;
      padding: 12px 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;
    }

    .app-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      color: #FFFFFF;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .ai-doc { background: linear-gradient(135deg, #3B82F6, #1D4ED8); }
    .ai-sheet { background: linear-gradient(135deg, #34D399, #059669); }
    .ai-slide { background: linear-gradient(135deg, #FB923C, #EA580C); }
    .ai-pdf { background: linear-gradient(135deg, #FB7185, #E11D48); }

    .app-info h3 {
      font-size: 17px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 2px;
    }

    .app-info p {
      font-size: 13.5px;
      color: #64748B;
      font-weight: 500;
    }

    /* 3 Highlights Row */
    .highlights-row {
      z-index: 2;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      width: 100%;
      max-width: 1080px;
    }

    .hl-box {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 20px;
      padding: 22px 20px;
      text-align: center;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
    }

    .hl-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #EFF6FF;
      color: #2563EB;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin: 0 auto 12px auto;
    }

    .hl-box h4 {
      font-size: 17px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 6px;
    }

    .hl-box p {
      font-size: 13px;
      color: #64748B;
      line-height: 1.45;
      font-weight: 500;
    }

    /* Bottom Platforms & URL Bar */
    .bottom-bar {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1080px;
      padding: 18px 30px;
      background: #FFFFFF;
      border: 2px solid #DBEAFE;
      border-radius: 22px;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.08);
    }

    .url-tag {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 19px;
      font-weight: 900;
      color: #2563EB;
      letter-spacing: -0.5px;
    }

    .platforms-list {
      display: flex;
      gap: 8px;
    }

    .plat-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="glow-top"></div>
  <div class="glow-bottom"></div>

  <!-- Header -->
  <div class="header">
    <div class="badge">✦ CHÍNH THỨC RA MẮT • MIỄN PHÍ 100%</div>
    <h1 class="title">Softty <span class="hl">Office</span></h1>
    <p class="subtitle">Bộ phần mềm văn phòng thế hệ mới — Nhẹ nhàng, nhanh mượt, bảo mật riêng tư & kết nối tức thì giữa điện thoại và máy tính.</p>
  </div>

  <!-- Hero Center -->
  <div class="hero-center">
    <div class="logo-frame">
      <img src="data:image/png;base64,${logoBase64}" alt="Softty Office Light 3D Logo" />
    </div>

    <div class="apps-stack">
      <div class="app-card">
        <div class="app-icon ai-doc">DOC</div>
        <div class="app-info">
          <h3>Soạn thảo văn bản (Docs)</h3>
          <p>Tương thích 100% Word (.docx), mở văn bản không lỗi font</p>
        </div>
      </div>
      <div class="app-card">
        <div class="app-icon ai-sheet">XLS</div>
        <div class="app-info">
          <h3>Bảng tính thông minh (Sheets)</h3>
          <p>Tương thích Excel (.xlsx), mở file lớn siêu tốc, mượt mà</p>
        </div>
      </div>
      <div class="app-card">
        <div class="app-icon ai-slide">PPT</div>
        <div class="app-info">
          <h3>Trình chiếu thuyết trình (Slides)</h3>
          <p>Tương thích PowerPoint (.pptx), tạo bài giảng sắc nét</p>
        </div>
      </div>
      <div class="app-card">
        <div class="app-icon ai-pdf">PDF</div>
        <div class="app-info">
          <h3>Đọc & Ký tài liệu PDF</h3>
          <p>Ký tên điện tử trên hợp đồng & quét giấy tờ bằng điện thoại</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 3 Highlights -->
  <div class="highlights-row">
    <div class="hl-box">
      <div class="hl-icon">⚡</div>
      <h4>Softty Drop LAN</h4>
      <p>"Bắn" tài liệu, ảnh quét sang PC/Mac qua Wi-Fi tức thì không cần cáp.</p>
    </div>
    <div class="hl-box">
      <div class="hl-icon">📷</div>
      <h4>Máy quét Camera</h4>
      <p>Tự động nhận diện mép giấy, làm nét văn bản và gộp nhiều trang PDF.</p>
    </div>
    <div class="hl-box">
      <div class="hl-icon">🔒</div>
      <h4>100% Cục bộ & Riêng tư</h4>
      <p>Lưu an toàn trên máy bạn, mất mạng vẫn dùng tốt, không lo lộ dữ liệu.</p>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div class="bottom-bar">
    <div class="url-tag">
      <span>🌐</span> office.softty.net
    </div>
    <div class="platforms-list">
      <span class="plat-item">🍏 macOS</span>
      <span class="plat-item">💻 Windows</span>
      <span class="plat-item">🤖 Android</span>
      <span class="plat-item">🍎 iOS</span>
    </div>
  </div>
</body>
</html>
`;

// 2. Poster Dọc Chuẩn 4:5 (1080 x 1350 px) - Nền Sáng Tối Ưu Mobile Feed
const portraitLightHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1350px;
      overflow: hidden;
      background: linear-gradient(150deg, #FFFFFF 0%, #F0F6FF 40%, #E2EDFA 100%);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 65px 50px 50px 50px;
      color: #0F172A;
      position: relative;
    }

    .glow-top {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 750px;
      height: 750px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 70%);
      border-radius: 50%;
      filter: blur(80px);
      z-index: 1;
    }

    .header {
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      background: #EFF6FF;
      border: 1.5px solid #BFDBFE;
      border-radius: 30px;
      color: #1D4ED8;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 18px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.1);
    }

    h1.title {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -2px;
      margin-bottom: 12px;
      color: #0F172A;
    }

    h1.title span.hl {
      color: #2563EB;
      background: linear-gradient(135deg, #2563EB 0%, #0284C7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.subtitle {
      font-size: 20px;
      color: #475569;
      max-width: 820px;
      line-height: 1.45;
      font-weight: 500;
    }

    .logo-hero {
      z-index: 2;
      width: 250px;
      height: 250px;
      background: #FFFFFF;
      border-radius: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 25px 60px -10px rgba(37, 99, 235, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      border: 3px solid #E2E8F0;
      padding: 14px;
      margin: 10px 0;
    }

    .logo-hero img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 42px;
    }

    /* 4 Document Format Pills */
    .doc-pills {
      z-index: 2;
      display: flex;
      justify-content: center;
      gap: 12px;
      width: 100%;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }

    .pill-doc { background: #EFF6FF; color: #1D4ED8; border: 1.5px solid #BFDBFE; }
    .pill-sheet { background: #ECFDF5; color: #047857; border: 1.5px solid #A7F3D0; }
    .pill-slide { background: #FFF7ED; color: #C2410C; border: 1.5px solid #FED7AA; }
    .pill-pdf { background: #FFF1F2; color: #BE123C; border: 1.5px solid #FECDD3; }

    /* Features Card */
    .features-card {
      z-index: 2;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 24px;
      padding: 24px 28px;
      width: 100%;
      max-width: 980px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }

    .feat-row {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .f-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #2563EB;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }

    .f-desc h4 {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 2px;
    }

    .f-desc p {
      font-size: 14px;
      color: #64748B;
      line-height: 1.35;
      font-weight: 500;
    }

    /* Bottom Bar */
    .bottom-footer {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 980px;
      padding: 16px 28px;
      background: #FFFFFF;
      border: 2px solid #DBEAFE;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.08);
    }

    .cta-domain {
      font-size: 18px;
      font-weight: 900;
      color: #2563EB;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .badge-list {
      display: flex;
      gap: 8px;
    }

    .plat-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="glow-top"></div>

  <!-- Header -->
  <div class="header">
    <div class="badge">✦ CHÍNH THỨC RA MẮT • MIỄN PHÍ 100%</div>
    <h1 class="title">Softty <span class="hl">Office</span></h1>
    <p class="subtitle">Phần mềm văn phòng thế hệ mới — Làm việc nhẹ nhàng, nhanh mượt và riêng tư trên cả Máy tính & Điện thoại.</p>
  </div>

  <!-- Logo Hero -->
  <div class="logo-hero">
    <img src="data:image/png;base64,${logoBase64}" alt="Softty Office Light 3D Logo" />
  </div>

  <!-- 4 Doc Format Pills -->
  <div class="doc-pills">
    <span class="pill pill-doc">📄 Word .docx</span>
    <span class="pill pill-sheet">📊 Excel .xlsx</span>
    <span class="pill pill-slide">📽️ PPT .pptx</span>
    <span class="pill pill-pdf">📕 PDF & Ký tên</span>
  </div>

  <!-- Features Card -->
  <div class="features-card">
    <div class="feat-row">
      <div class="f-icon-circle">⚡</div>
      <div class="f-desc">
        <h4>Softty Drop LAN</h4>
        <p>"Bắn" tài liệu, ảnh hóa đơn từ điện thoại sang PC/Mac tức thì qua Wi-Fi, không cần dây cáp.</p>
      </div>
    </div>
    <div class="feat-row">
      <div class="f-icon-circle">📷</div>
      <div class="f-desc">
        <h4>Máy quét Camera thông minh</h4>
        <p>Tự động nhận diện mép giấy, làm nét chữ và gộp nhiều trang thành tệp PDF chất lượng cao.</p>
      </div>
    </div>
    <div class="feat-row">
      <div class="f-icon-circle">🔒</div>
      <div class="f-desc">
        <h4>100% Cục bộ & Bảo mật riêng tư</h4>
        <p>Lưu trữ an toàn trên thiết bị của bạn, hoạt động offline mượt mà không cần mạng Internet.</p>
      </div>
    </div>
  </div>

  <!-- Bottom Footer -->
  <div class="bottom-footer">
    <div class="cta-domain">
      <span>🌐</span> office.softty.net
    </div>
    <div class="badge-list">
      <span class="plat-badge">💻 Windows / Mac</span>
      <span class="plat-badge">🤖 Android</span>
      <span class="plat-badge">🍎 iOS</span>
    </div>
  </div>
</body>
</html>
`;

async function main() {
  console.log('🚀 Đang kết xuất các bộ ảnh Poster Facebook TÔNG MÀU SÁNG (Light Theme)...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Render Square Light Poster (1200x1200)
  const pageSquare = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 1,
  });
  await pageSquare.setContent(squareLightHtml);
  const squarePath = join(outDir, 'poster_facebook_light_square_1200x1200.png');
  await pageSquare.screenshot({ path: squarePath, type: 'png' });
  await pageSquare.close();
  console.log('  ✓ Đã tạo poster vuông 1:1 nền sáng (1200x1200):', squarePath);

  // 2. Render Portrait Light Poster (1080x1350)
  const pagePortrait = await browser.newPage({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 1,
  });
  await pagePortrait.setContent(portraitLightHtml);
  const portraitPath = join(outDir, 'poster_facebook_light_portrait_1080x1350.png');
  await pagePortrait.screenshot({ path: portraitPath, type: 'png' });
  await pagePortrait.close();
  console.log('  ✓ Đã tạo poster dọc 4:5 nền sáng (1080x1350):', portraitPath);

  await browser.close();

  // Copy to brain artifacts
  const artifactDir = '/Users/bonglv/.gemini/antigravity/brain/63074737-0d84-4965-ad1f-9c816e9c8773';
  copyFileSync(squarePath, join(artifactDir, 'facebook_light_poster_square.png'));
  copyFileSync(portraitPath, join(artifactDir, 'facebook_light_poster_portrait.png'));
  console.log('  ✓ Đã copy các poster nền sáng sang artifact directory');

  console.log('🎉 Hoàn tất kết xuất bộ Poster Facebook Tông Màu Sáng!');
}

main().catch(console.error);
