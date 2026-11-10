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

// Poster 1: Square 1200 x 1200 px (Chuẩn Fanpage Feed Facebook)
const squarePosterHtml = `
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
      background: radial-gradient(circle at 50% 25%, #172554 0%, #0A1128 55%, #050811 100%);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 70px 60px 60px 60px;
      color: #ffffff;
      position: relative;
    }

    .ambient-glow-1 {
      position: absolute;
      top: -80px;
      left: 50%;
      transform: translateX(-50%);
      width: 750px;
      height: 750px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(16, 185, 129, 0.2) 45%, transparent 70%);
      border-radius: 50%;
      filter: blur(80px);
      z-index: 1;
    }

    .ambient-glow-2 {
      position: absolute;
      bottom: -100px;
      right: -80px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 65%);
      border-radius: 50%;
      filter: blur(70px);
      z-index: 1;
    }

    /* Top Section */
    .top-header {
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      background: rgba(37, 99, 235, 0.25);
      border: 1.5px solid rgba(147, 197, 253, 0.45);
      border-radius: 30px;
      color: #93C5FD;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 22px;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
    }

    h1.brand-title {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -2px;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #FFFFFF 40%, #E2E8F0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h1.brand-title span.hl {
      background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.tagline {
      font-size: 22px;
      color: #94A3B8;
      max-width: 860px;
      line-height: 1.45;
      font-weight: 500;
    }

    /* Middle Hero Section */
    .hero-center {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      margin: 20px 0;
      width: 100%;
    }

    .logo-card {
      width: 250px;
      height: 250px;
      background: #FFFFFF;
      border-radius: 54px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(37, 99, 235, 0.4);
      border: 4px solid rgba(255, 255, 255, 0.8);
      padding: 12px;
      flex-shrink: 0;
    }

    .logo-card img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 42px;
    }

    .hero-formats {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 480px;
    }

    .format-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 12px 20px;
      backdrop-filter: blur(10px);
    }

    .format-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      color: #FFFFFF;
      flex-shrink: 0;
    }

    .f-word { background: linear-gradient(135deg, #2563EB, #1D4ED8); }
    .f-excel { background: linear-gradient(135deg, #10B981, #059669); }
    .f-ppt { background: linear-gradient(135deg, #F97316, #EA580C); }
    .f-pdf { background: linear-gradient(135deg, #F43F5E, #E11D48); }

    .format-text h3 {
      font-size: 17px;
      font-weight: 700;
      color: #F8FAFC;
      margin-bottom: 2px;
    }

    .format-text p {
      font-size: 13px;
      color: #94A3B8;
    }

    /* Key Features Row */
    .features-grid {
      z-index: 2;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      width: 100%;
      max-width: 1040px;
      margin-bottom: 10px;
    }

    .feature-box {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 22px 20px;
      text-align: center;
      backdrop-filter: blur(12px);
    }

    .feat-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }

    .feature-box h4 {
      font-size: 17px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 6px;
    }

    .feature-box p {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.4;
    }

    /* Bottom Platforms Bar */
    .bottom-platforms {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1040px;
      padding: 16px 28px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
    }

    .avail-text {
      font-size: 15px;
      font-weight: 700;
      color: #CBD5E1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .platform-badges {
      display: flex;
      gap: 10px;
    }

    .p-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      color: #F1F5F9;
    }
  </style>
</head>
<body>
  <div class="ambient-glow-1"></div>
  <div class="ambient-glow-2"></div>

  <!-- Top Header -->
  <div class="top-header">
    <div class="badge-pill">✦ CHÍNH THỨC RA MẮT HỆ SINH THÁI</div>
    <h1 class="brand-title">Softty <span class="hl">Office</span></h1>
    <p class="tagline">Bộ công cụ văn phòng thông minh tất cả trong một & truyền dữ liệu tức thì giữa điện thoại và máy tính.</p>
  </div>

  <!-- Hero Center -->
  <div class="hero-center">
    <div class="logo-card">
      <img src="data:image/png;base64,${logoBase64}" alt="Softty Office 3D Logo" />
    </div>
    <div class="hero-formats">
      <div class="format-item">
        <div class="format-icon f-word">DOC</div>
        <div class="format-text">
          <h3>Microsoft Word & Docs</h3>
          <p>Mở văn bản .docx, .doc, txt, markdown mượt mà</p>
        </div>
      </div>
      <div class="format-item">
        <div class="format-icon f-excel">XLS</div>
        <div class="format-text">
          <h3>Bảng tính Excel & Sheets</h3>
          <p>Hiển thị bảng dữ liệu, công thức, đồ thị sắc nét</p>
        </div>
      </div>
      <div class="format-item">
        <div class="format-icon f-ppt">PPT</div>
        <div class="format-text">
          <h3>Trình chiếu PowerPoint</h3>
          <p>Xem slide bài giảng, thuyết trình sống động</p>
        </div>
      </div>
      <div class="format-item">
        <div class="format-icon f-pdf">PDF</div>
        <div class="format-text">
          <h3>Tài liệu PDF & Quét Camera</h3>
          <p>Đọc, lật trang, xuất PDF hóa đơn nhanh gọn</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Key Features Grid -->
  <div class="features-grid">
    <div class="feature-box">
      <div class="feat-icon">⚡</div>
      <h4>Softty Drop LAN</h4>
      <p>"Bắn" tài liệu, ảnh quét sang PC/Mac qua Wi-Fi tức thì không cần dây cáp.</p>
    </div>
    <div class="feature-box">
      <div class="feat-icon">📷</div>
      <h4>Máy quét Camera AI</h4>
      <p>Tự động nhận diện khung viền tài liệu, làm nét và xuất PDF nhiều trang.</p>
    </div>
    <div class="feature-box">
      <div class="feat-icon">🔒</div>
      <h4>100% Cục bộ Offline</h4>
      <p>Không cần mạng, không gửi dữ liệu lên đám mây, bảo mật tuyệt đối.</p>
    </div>
  </div>

  <!-- Bottom Platform Bar -->
  <div class="bottom-platforms">
    <div class="avail-text">
      <span>🌐</span> Sẵn sàng trên mọi nền tảng:
    </div>
    <div class="platform-badges">
      <span class="p-badge">🤖 Google Play</span>
      <span class="p-badge">🍎 App Store</span>
      <span class="p-badge">💻 Windows</span>
      <span class="p-badge">🍏 macOS</span>
    </div>
  </div>
</body>
</html>
`;

// Poster 2: Vertical 1080 x 1350 px (Tối ưu Mobile Newsfeed Facebook)
const portraitPosterHtml = `
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
      background: radial-gradient(circle at 50% 20%, #172554 0%, #0A1128 50%, #040711 100%);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 70px 50px 55px 50px;
      color: #ffffff;
      position: relative;
    }

    .ambient-glow-1 {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(37, 99, 235, 0.45) 0%, rgba(16, 185, 129, 0.2) 45%, transparent 70%);
      border-radius: 50%;
      filter: blur(80px);
      z-index: 1;
    }

    .top-header {
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      background: rgba(37, 99, 235, 0.25);
      border: 1.5px solid rgba(147, 197, 253, 0.45);
      border-radius: 30px;
      color: #93C5FD;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
    }

    h1.brand-title {
      font-size: 66px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -2px;
      margin-bottom: 12px;
      color: #FFFFFF;
    }

    h1.brand-title span.hl {
      background: linear-gradient(135deg, #60A5FA 0%, #34D399 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.tagline {
      font-size: 20px;
      color: #94A3B8;
      max-width: 800px;
      line-height: 1.45;
      font-weight: 500;
    }

    .logo-hero {
      z-index: 2;
      width: 260px;
      height: 260px;
      background: #FFFFFF;
      border-radius: 58px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 35px 90px rgba(0, 0, 0, 0.65), 0 0 70px rgba(37, 99, 235, 0.45);
      border: 4px solid rgba(255, 255, 255, 0.85);
      padding: 14px;
      margin: 10px 0;
    }

    .logo-hero img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 46px;
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
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.4px;
    }

    .pill-doc { background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1.5px solid rgba(59, 130, 246, 0.5); }
    .pill-sheet { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1.5px solid rgba(16, 185, 129, 0.5); }
    .pill-slide { background: rgba(249, 115, 22, 0.25); color: #fdba74; border: 1.5px solid rgba(249, 115, 22, 0.5); }
    .pill-pdf { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1.5px solid rgba(239, 68, 68, 0.5); }

    /* Features Grid */
    .features-card {
      z-index: 2;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 24px 30px;
      width: 100%;
      max-width: 960px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      backdrop-filter: blur(12px);
    }

    .feat-row {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .f-icon-circle {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(147, 197, 253, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .f-desc h4 {
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 3px;
    }

    .f-desc p {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.35;
    }

    /* Bottom Footer */
    .bottom-footer {
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 960px;
      padding: 16px 26px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 20px;
    }

    .cta-text {
      font-size: 16px;
      font-weight: 800;
      color: #38BDF8;
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
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #F1F5F9;
    }
  </style>
</head>
<body>
  <div class="ambient-glow-1"></div>

  <div class="top-header">
    <div class="badge-pill">✦ CHÍNH THỨC RA MẮT HỆ SINH THÁI</div>
    <h1 class="brand-title">Softty <span class="hl">Office</span></h1>
    <p class="tagline">Bộ công cụ văn phòng thế hệ mới — Đọc mọi tài liệu & kết nối không dây tức thì với máy tính.</p>
  </div>

  <div class="logo-hero">
    <img src="data:image/png;base64,${logoBase64}" alt="Softty Office 3D Logo" />
  </div>

  <div class="doc-pills">
    <span class="pill pill-doc">📄 Word .docx</span>
    <span class="pill pill-sheet">📊 Excel .xlsx</span>
    <span class="pill pill-slide">📽️ PPT .pptx</span>
    <span class="pill pill-pdf">📕 PDF & Scan</span>
  </div>

  <div class="features-card">
    <div class="feat-row">
      <div class="f-icon-circle">⚡</div>
      <div class="f-desc">
        <h4>Softty Drop LAN</h4>
        <p>"Bắn" tài liệu, ảnh hóa đơn sang máy tính trong cùng mạng Wi-Fi cực nhanh, không qua đám mây.</p>
      </div>
    </div>
    <div class="feat-row">
      <div class="f-icon-circle">📷</div>
      <div class="f-desc">
        <h4>Máy quét Camera thông minh</h4>
        <p>Tự động nhận diện khung mép tài liệu, làm nét văn bản và gộp thành một file PDF hoàn chỉnh.</p>
      </div>
    </div>
    <div class="feat-row">
      <div class="f-icon-circle">🔒</div>
      <div class="f-desc">
        <h4>100% Cục bộ & Quyền riêng tư</h4>
        <p>Hoạt động hoàn toàn Offline, không cần tài khoản, dữ liệu thuộc quyền sở hữu của bạn.</p>
      </div>
    </div>
  </div>

  <div class="bottom-footer">
    <div class="cta-text">🔥 TẢI NGAY MIỄN PHÍ TRÊN:</div>
    <div class="badge-list">
      <span class="plat-badge">🤖 Android</span>
      <span class="plat-badge">🍎 iOS</span>
      <span class="plat-badge">💻 Windows / Mac</span>
    </div>
  </div>
</body>
</html>
`;

async function main() {
  console.log('🚀 Đang kết xuất các bộ ảnh Poster Facebook cho Fanpage...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // Render Square Poster (1200x1200)
  const pageSquare = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 1,
  });
  await pageSquare.setContent(squarePosterHtml);
  const squarePath = join(outDir, 'poster_facebook_square_1200x1200.png');
  await pageSquare.screenshot({ path: squarePath, type: 'png' });
  await pageSquare.close();
  console.log('  ✓ Đã tạo poster vuông 1:1 (1200x1200):', squarePath);

  // Render Portrait Poster (1080x1350)
  const pagePortrait = await browser.newPage({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 1,
  });
  await pagePortrait.setContent(portraitPosterHtml);
  const portraitPath = join(outDir, 'poster_facebook_portrait_1080x1350.png');
  await pagePortrait.screenshot({ path: portraitPath, type: 'png' });
  await pagePortrait.close();
  console.log('  ✓ Đã tạo poster dọc 4:5 (1080x1350):', portraitPath);

  await browser.close();

  // Copy to brain artifacts
  const artifactDir = '/Users/bonglv/.gemini/antigravity/brain/63074737-0d84-4965-ad1f-9c816e9c8773';
  copyFileSync(squarePath, join(artifactDir, 'facebook_poster_square.png'));
  copyFileSync(portraitPath, join(artifactDir, 'facebook_poster_portrait.png'));
  console.log('  ✓ Đã copy các poster sang artifact directory');

  console.log('🎉 Hoàn tất kết xuất bộ Poster truyền thông Fanpage!');
}

main().catch(console.error);
