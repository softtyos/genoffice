import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outDir = resolve(rootDir, 'dist/store-assets/logo-proposals');

mkdirSync(outDir, { recursive: true });

// --- CONCEPT 1: "The Fluent Office Ribbon S" (Overlapping colored ribbons forming 'S' with doc layers)
const svgConcept1 = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Canvas Gradient -->
    <linearGradient id="c1_bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Word Blue -->
    <linearGradient id="c1_blue" x1="120" y1="90" x2="380" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <!-- Excel Green -->
    <linearGradient id="c1_green" x1="180" y1="200" x2="380" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- PowerPoint Orange -->
    <linearGradient id="c1_orange" x1="100" y1="310" x2="340" y2="420" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>

    <!-- PDF Coral Red -->
    <linearGradient id="c1_red" x1="300" y1="80" x2="420" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>

    <!-- AI Cyan Glow -->
    <linearGradient id="c1_cyan" x1="140" y1="120" x2="360" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>

    <!-- Ambient Shadow Filter -->
    <filter id="c1_shadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <filter id="c1_glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
    </filter>
  </defs>

  <!-- Deep rounded container -->
  <rect width="512" height="512" rx="112" fill="url(#c1_bg)"/>

  <!-- Subtle glow beneath elements -->
  <circle cx="256" cy="256" r="140" fill="#3b82f6" opacity="0.15" filter="url(#c1_glow)"/>

  <!-- Back Layer: Folded Document Sheet (Word / Blue) -->
  <g filter="url(#c1_shadow)">
    <!-- Base Document Page -->
    <path d="M140 100 C140 84 152 72 168 72 H310 L372 134 V380 C372 396 360 408 344 408 H168 C152 408 140 396 140 380 Z" 
          fill="url(#c1_blue)"/>
    <!-- Folded Corner -->
    <path d="M310 72 V122 C310 128 316 134 322 134 H372 Z" fill="#60a5fa" opacity="0.9"/>
    <path d="M310 72 L372 134 H322 C316 134 310 128 310 122 Z" fill="#1e3a8a" opacity="0.3"/>
  </g>

  <!-- Middle Layer: Spreadsheet Grid Plate (Excel / Green) fanned out -->
  <g filter="url(#c1_shadow)">
    <rect x="175" y="165" width="205" height="155" rx="16" fill="url(#c1_green)"/>
    <!-- Grid lines -->
    <path d="M175 215 H380 M175 265 H380 M245 165 V320 M315 165 V320" stroke="#a7f3d0" stroke-width="3" stroke-opacity="0.3"/>
    <!-- Mini chart bar inside spreadsheet -->
    <rect x="195" y="275" width="20" height="30" rx="3" fill="#ffffff" opacity="0.8"/>
    <rect x="225" y="245" width="20" height="60" rx="3" fill="#ffffff" opacity="0.95"/>
    <rect x="255" y="225" width="20" height="80" rx="3" fill="#ffffff" opacity="0.95"/>
  </g>

  <!-- Front Layer: Dynamic "S" Ribbon representing Softty + Seamless Office Flow -->
  <g filter="url(#c1_shadow)">
    <!-- Elegant thick 3D S Ribbon -->
    <path d="M315 160 C315 160 215 140 175 190 C135 240 220 265 255 285 C295 310 330 340 280 390 C230 435 150 390 150 390" 
          stroke="url(#c1_orange)" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Front glossy highlight overlay on S ribbon -->
    <path d="M305 165 C265 145 205 155 178 190 C155 220 205 245 245 265" 
          stroke="#fed7aa" stroke-width="12" stroke-linecap="round" opacity="0.6"/>
  </g>

  <!-- AI Native Sparkle / Magic Star on top right fold -->
  <path d="M380 95 C383 115 388 120 408 123 C388 126 383 131 380 151 C377 131 372 126 352 123 C372 120 377 115 380 95 Z" 
        fill="#38bdf8"/>
</svg>
`;

// --- CONCEPT 2: "The 4-Color Office Quad-Fold S" (Clean, Iconic, High-End Corporate like WPS / Office 365)
const svgConcept2 = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="c2_bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>

    <!-- Docs Blue Ribbon -->
    <linearGradient id="ribbon_doc" x1="120" y1="120" x2="360" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>

    <!-- Sheets Green Ribbon -->
    <linearGradient id="ribbon_sheet" x1="160" y1="180" x2="360" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>

    <!-- Slides Orange Ribbon -->
    <linearGradient id="ribbon_slide" x1="160" y1="280" x2="360" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>

    <!-- PDF Red Corner -->
    <linearGradient id="ribbon_pdf" x1="320" y1="180" x2="390" y2="240" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#f87171"/>
    </linearGradient>

    <filter id="c2_shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="112" fill="url(#c2_bg)"/>

  <!-- Main Isometric Document Canvas -->
  <g filter="url(#c2_shadow)">
    <!-- Base Document Shield / Page -->
    <rect x="100" y="80" width="312" height="352" rx="36" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-width="2" stroke-opacity="0.12"/>
    
    <!-- Top Ribbon: Document (Blue) -->
    <path d="M330 145 H180 C155 145 135 165 135 190 C135 215 155 235 180 235 H300 C335 235 365 265 365 300 C365 335 335 365 300 365 H150" 
          stroke="url(#ribbon_doc)" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Excel Green Segment (Lower loop inner fold) -->
    <path d="M220 235 H300 C335 235 365 265 365 300 C365 335 335 365 300 365 H170" 
          stroke="url(#ribbon_sheet)" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Slide Orange/Red Accent on Lower Curve -->
    <path d="M260 300 C260 340 230 365 190 365 H150" 
          stroke="url(#ribbon_slide)" stroke-width="52" stroke-linecap="round"/>

    <!-- Document Fold Badge / Icon on Top Right -->
    <g transform="translate(305, 95)">
      <!-- 4 Office Color Dots -->
      <circle cx="20" cy="20" r="10" fill="#3b82f6"/>
      <circle cx="50" cy="20" r="10" fill="#10b981"/>
      <circle cx="20" cy="50" r="10" fill="#f97316"/>
      <circle cx="50" cy="50" r="10" fill="#ef4444"/>
    </g>

    <!-- Center Softty Star in White -->
    <path d="M256 160 C258 175 262 179 277 181 C262 183 258 187 256 202 C254 187 250 183 235 181 C250 179 254 175 256 160 Z" 
          fill="#ffffff"/>
  </g>
</svg>
`;

// --- CONCEPT 3: "The 3D Office Suite Tile" (Stack of Docs, Sheets, Slides, PDF with 'S' Monogram)
const svgConcept3 = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="c3_bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>

    <!-- Card 1: PDF (Red) -->
    <linearGradient id="c3_pdf" x1="200" y1="90" x2="390" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>

    <!-- Card 2: Slides (Orange) -->
    <linearGradient id="c3_slide" x1="160" y1="120" x2="350" y2="310" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>

    <!-- Card 3: Sheets (Green) -->
    <linearGradient id="c3_sheet" x1="120" y1="150" x2="310" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Card 4: Docs (Blue - Main Front) -->
    <linearGradient id="c3_doc" x1="80" y1="180" x2="270" y2="370" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <filter id="c3_shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="112" fill="url(#c3_bg)"/>

  <!-- 4 Layered Office Document Cards Fanning Out -->
  <g filter="url(#c3_shadow)">
    <!-- Layer 4: PDF Card (Red - Top Right) -->
    <g transform="translate(195, 75) rotate(18)">
      <rect width="170" height="230" rx="20" fill="url(#c3_pdf)"/>
      <rect x="25" y="40" width="80" height="14" rx="7" fill="#ffffff" opacity="0.6"/>
      <rect x="25" y="70" width="120" height="10" rx="5" fill="#ffffff" opacity="0.35"/>
      <text x="135" y="200" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.7">PDF</text>
    </g>

    <!-- Layer 3: PPTX Slides Card (Orange - Middle Right) -->
    <g transform="translate(155, 105) rotate(6)">
      <rect width="170" height="230" rx="20" fill="url(#c3_slide)"/>
      <circle cx="85" cy="100" r="35" fill="#ffffff" opacity="0.3"/>
      <rect x="25" y="160" width="120" height="10" rx="5" fill="#ffffff" opacity="0.4"/>
      <text x="135" y="200" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.7">PPT</text>
    </g>

    <!-- Layer 2: XLSX Sheets Card (Green - Center Left) -->
    <g transform="translate(115, 140) rotate(-6)">
      <rect width="170" height="230" rx="20" fill="url(#c3_sheet)"/>
      <rect x="25" y="45" width="120" height="90" rx="8" fill="#ffffff" opacity="0.2"/>
      <path d="M25 75 H145 M25 105 H145 M65 45 V135 M105 45 V135" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
      <text x="135" y="200" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.7">XLS</text>
    </g>

    <!-- Layer 1: DOCX Word Card (Blue - Front Foreground) -->
    <g transform="translate(85, 175) rotate(-16)">
      <rect width="175" height="235" rx="22" fill="url(#c3_doc)" stroke="#60a5fa" stroke-width="2" stroke-opacity="0.5"/>
      <path d="M125 0 V45 C125 50 130 55 135 55 H175 Z" fill="#93c5fd" opacity="0.8"/>
      
      <!-- Embossed Softty 'S' on front document -->
      <path d="M125 90 H80 C60 90 55 115 80 120 C100 124 105 128 105 138 C105 155 85 160 65 160" 
            stroke="#ffffff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="140" y="205" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="end" opacity="0.9">DOC</text>
    </g>
  </g>

  <!-- Glowing AI Star Accent -->
  <path d="M410 110 C412 125 417 129 432 131 C417 133 412 137 410 152 C408 137 403 133 388 131 C403 129 408 125 410 110 Z" 
        fill="#38bdf8"/>
</svg>
`;

writeFileSync(resolve(outDir, 'concept_1_fluent_ribbon.svg'), svgConcept1.trim());
writeFileSync(resolve(outDir, 'concept_2_quad_fold.svg'), svgConcept2.trim());
writeFileSync(resolve(outDir, 'concept_3_office_suite_stack.svg'), svgConcept3.trim());

async function renderPNGs() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const concepts = [
    { name: 'concept_1_fluent_ribbon', svg: svgConcept1 },
    { name: 'concept_2_quad_fold', svg: svgConcept2 },
    { name: 'concept_3_office_suite_stack', svg: svgConcept3 },
  ];

  for (const c of concepts) {
    const page = await browser.newPage({
      viewport: { width: 512, height: 512 },
      deviceScaleFactor: 1,
    });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${c.svg}</body></html>`);
    const path512 = resolve(outDir, `${c.name}_512x512.png`);
    await page.screenshot({ path: path512, type: 'png', omitBackground: true });
    console.log(`✓ Rendered ${c.name} 512x512 to ${path512}`);

    // Also 1024x1024
    const page1024 = await browser.newPage({
      viewport: { width: 1024, height: 1024 },
      deviceScaleFactor: 1,
    });
    // Scale SVG to 1024
    const scaledSvg = c.svg.replace('width="512" height="512"', 'width="1024" height="1024"');
    await page1024.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${scaledSvg}</body></html>`);
    const path1024 = resolve(outDir, `${c.name}_1024x1024.png`);
    await page1024.screenshot({ path: path1024, type: 'png', omitBackground: true });
    console.log(`✓ Rendered ${c.name} 1024x1024 to ${path1024}`);
  }

  await browser.close();
}

renderPNGs().catch(console.error);
