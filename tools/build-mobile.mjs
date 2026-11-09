#!/usr/bin/env node
/**
 * Unified Mobile Release Builder for Softty Office.
 * Builds BOTH Android (APK + AAB) and iOS (IPA + xcarchive) locally on this Mac.
 * Automatically increments version and build numbers across all project files.
 *
 * Usage:
 *   pnpm release:mobile
 *   node tools/build-mobile.mjs [--no-bump] [--minor|--major|--patch]
 */

import { existsSync, mkdirSync, copyFileSync, cpSync, statSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const mobileDir = resolve(rootDir, 'apps/mobile');
const androidDir = resolve(mobileDir, 'android');
const iosDir = resolve(mobileDir, 'ios');
const distDir = resolve(rootDir, 'dist/mobile');
const credentialsDir = resolve(mobileDir, 'credentials');

const args = process.argv.slice(2);
const shouldBump = !args.includes('--no-bump');
const bumpType = args.includes('--major') ? '--major' : (args.includes('--minor') ? '--minor' : '--patch');

console.log('='.repeat(70));
console.log('🚀 SOFTTY OFFICE — UNIFIED MOBILE BUILDER (Android + iOS)');
console.log('='.repeat(70));

// 1. Version Bump
if (shouldBump) {
  console.log(`\n📦 [1/4] Tự động nâng phiên bản (${bumpType}) và đồng bộ build number...`);
  try {
    execSync(`node "${resolve(rootDir, 'tools/bump-version.mjs')}" ${bumpType}`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } catch (err) {
    console.error('❌ Lỗi khi tự động nâng phiên bản:', err.message);
    process.exit(1);
  }
} else {
  console.log('\n⏭️ [1/4] Bỏ qua nâng phiên bản (--no-bump được kích hoạt).');
}

// Read current version and synchronized build number
const mobileAppJson = JSON.parse(readFileSync(resolve(mobileDir, 'app.json'), 'utf8'));
const currentVersion = mobileAppJson.expo?.version || '1.0.0';
const buildNumber = mobileAppJson.expo?.android?.versionCode || mobileAppJson.expo?.ios?.buildNumber || 1;

console.log(`\n📌 Target Release: Softty Office Mobile v${currentVersion} (Build ${buildNumber})`);

// Ensure output directory exists
mkdirSync(distDir, { recursive: true });

// 2. Prepare Credentials & Profiles
console.log('\n🔐 [2/4] Kiểm tra và chuẩn bị chứng chỉ phát hành...');
const provisioningSrc = resolve(credentialsDir, 'netsofttyofficemobile.mobileprovision');
const provProfilesDir = resolve(os.homedir(), 'Library/MobileDevice/Provisioning Profiles');
const provUUID = 'dfafc41f-60db-437d-abd0-3c289383be0d';
const provisioningDst = join(provProfilesDir, `${provUUID}.mobileprovision`);

if (existsSync(provisioningSrc)) {
  mkdirSync(provProfilesDir, { recursive: true });
  copyFileSync(provisioningSrc, provisioningDst);
  console.log(`  ✓ iOS Provisioning Profile sẵn sàng (${provUUID})`);
}

const keystorePath = resolve(credentialsDir, 'softty-office.keystore');
if (existsSync(keystorePath)) {
  console.log('  ✓ Android Release Keystore sẵn sàng');
} else {
  console.warn('  ⚠️ Cảnh báo: Android keystore không tìm thấy tại', keystorePath);
}

const exportOptionsPlist = resolve(credentialsDir, 'exportOptions.plist');
if (!existsSync(exportOptionsPlist)) {
  console.error('❌ Thiếu file exportOptions.plist tại', exportOptionsPlist);
  process.exit(1);
}

function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

const startTime = Date.now();

// 3. Android Build
console.log('\n🤖 [3/4] Bắt đầu build Android Release (APK & Google Play AAB)...');
const gradlewPath = resolve(androidDir, 'gradlew');
if (!existsSync(gradlewPath)) {
  console.error('❌ Không tìm thấy gradlew tại', androidDir);
  process.exit(1);
}

const androidCmd = './gradlew assembleRelease bundleRelease';
console.log(`  ⚙️ Chạy: ${androidCmd} (trong apps/mobile/android)`);
const androidBuild = spawnSync('./gradlew', ['assembleRelease', 'bundleRelease'], {
  cwd: androidDir,
  stdio: 'inherit',
  env: process.env,
});

if (androidBuild.status !== 0) {
  console.error('❌ Android build thất bại!');
  process.exit(androidBuild.status || 1);
}

// Copy Android artifacts
const srcApk = resolve(androidDir, 'app/build/outputs/apk/release/app-release.apk');
const srcAab = resolve(androidDir, 'app/build/outputs/bundle/release/app-release.aab');

const targetApk = resolve(distDir, `SofttyOffice-v${currentVersion}-b${buildNumber}.apk`);
const targetAab = resolve(distDir, `SofttyOffice-v${currentVersion}-b${buildNumber}.aab`);

if (existsSync(srcApk)) {
  copyFileSync(srcApk, targetApk);
  console.log(`  ✓ Đã lưu APK: ${targetApk} (${formatBytes(statSync(targetApk).size)})`);
}
if (existsSync(srcAab)) {
  copyFileSync(srcAab, targetAab);
  console.log(`  ✓ Đã lưu AAB: ${targetAab} (${formatBytes(statSync(targetAab).size)})`);
}

// 4. iOS Build
console.log('\n🍎 [4/4] Bắt đầu build iOS Release (IPA & Xcode Archive)...');
const workspacePath = resolve(iosDir, 'SofttyOffice.xcworkspace');
if (!existsSync(workspacePath)) {
  console.error('❌ Không tìm thấy workspace tại', workspacePath);
  process.exit(1);
}

const tempArchiveDir = `/tmp/SofttyOffice_v${currentVersion}_b${buildNumber}.xcarchive`;
const tempExportDir = `/tmp/SofttyOffice_v${currentVersion}_b${buildNumber}_export`;

// Clean previous temp dirs if exist
try {
  execSync(`rm -rf "${tempArchiveDir}" "${tempExportDir}"`);
} catch {}

console.log('  ⚙️ Đang Archive với xcodebuild...');
const archiveArgs = [
  '-workspace', 'SofttyOffice.xcworkspace',
  '-scheme', 'SofttyOffice',
  '-configuration', 'Release',
  '-destination', 'generic/platform=iOS',
  '-archivePath', tempArchiveDir,
  'archive',
  'CODE_SIGN_STYLE=Manual',
  'CODE_SIGN_IDENTITY=Apple Distribution: Ly Van Bong (79J42YA54H)',
  'DEVELOPMENT_TEAM=79J42YA54H',
  `PROVISIONING_PROFILE=${provUUID}`,
];

const iosArchive = spawnSync('xcodebuild', archiveArgs, {
  cwd: iosDir,
  stdio: 'inherit',
  env: process.env,
});

if (iosArchive.status !== 0) {
  console.error('❌ iOS xcodebuild archive thất bại!');
  process.exit(iosArchive.status || 1);
}

console.log('  ⚙️ Đang Export IPA từ Archive...');
const exportArgs = [
  '-exportArchive',
  '-archivePath', tempArchiveDir,
  '-exportPath', tempExportDir,
  '-exportOptionsPlist', exportOptionsPlist,
];

const iosExport = spawnSync('xcodebuild', exportArgs, {
  cwd: iosDir,
  stdio: 'inherit',
  env: process.env,
});

if (iosExport.status !== 0) {
  console.error('❌ iOS xcodebuild exportArchive thất bại!');
  process.exit(iosExport.status || 1);
}

// Copy iOS artifacts
const srcIpa = join(tempExportDir, 'SofttyOffice.ipa');
const targetIpa = resolve(distDir, `SofttyOffice-v${currentVersion}-b${buildNumber}.ipa`);
const targetArchive = resolve(distDir, `SofttyOffice-v${currentVersion}-b${buildNumber}.xcarchive`);

if (existsSync(srcIpa)) {
  copyFileSync(srcIpa, targetIpa);
  console.log(`  ✓ Đã lưu IPA: ${targetIpa} (${formatBytes(statSync(targetIpa).size)})`);
}

if (existsSync(tempArchiveDir)) {
  try {
    execSync(`rm -rf "${targetArchive}"`);
    cpSync(tempArchiveDir, targetArchive, { recursive: true });
    console.log(`  ✓ Đã lưu Archive: ${targetArchive}`);
  } catch (err) {
    console.warn('  ⚠️ Không thể sao chép xcarchive:', err.message);
  }
}

const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n' + '='.repeat(70));
console.log(`🎉 BUILD HOÀN TẤT THÀNH CÔNG TRONG ${totalDuration}s!`);
console.log('='.repeat(70));
console.log(`📌 Phiên bản: Softty Office v${currentVersion} (Build Number: ${buildNumber})`);
console.log(`📂 Thư mục chứa thành phẩm: ${distDir}`);
console.log('-'.repeat(70));
console.log(`🤖 Android Google Play Bundle (.aab):`);
console.log(`   └─ ${targetAab} [${existsSync(targetAab) ? formatBytes(statSync(targetAab).size) : 'N/A'}]`);
console.log(`🤖 Android Cài trực tiếp (.apk):`);
console.log(`   └─ ${targetApk} [${existsSync(targetApk) ? formatBytes(statSync(targetApk).size) : 'N/A'}]`);
console.log(`🍎 iOS App Store / TestFlight (.ipa):`);
console.log(`   └─ ${targetIpa} [${existsSync(targetIpa) ? formatBytes(statSync(targetIpa).size) : 'N/A'}]`);
console.log(`🍎 iOS Xcode Archive (.xcarchive):`);
console.log(`   └─ ${targetArchive}`);
console.log('='.repeat(70));
console.log('🚀 HƯỚNG DẪN ĐĂNG TẢI LÊN CỬA HÀNG ỨNG DỤNG:');
console.log('  • Google Play Console: Upload file .aab vào phần Releases > Production/Testing.');
console.log('  • Apple App Store Connect: Sử dụng phần mềm Apple Transporter hoặc lệnh sau:');
console.log(`    xcrun altool --upload-app -f "${targetIpa}" -t ios --apiKey 5UMT6RKL4H --apiIssuer 08da8577-d648-4cb9-952b-7be7df8ceb62`);
console.log('='.repeat(70) + '\n');
