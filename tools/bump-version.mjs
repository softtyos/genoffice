#!/usr/bin/env node
/**
 * Auto version bumper for Softty Office monorepo.
 * Synchronizes versions across:
 * - package.json (monorepo root)
 * - apps/shell/package.json (desktop app)
 * - apps/landing/package.json (landing page)
 * - apps/mobile/package.json (mobile app package)
 * - apps/mobile/app.json (Expo mobile config: version, android.versionCode, ios.buildNumber)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const targetPackages = [
  resolve(rootDir, 'package.json'),
  resolve(rootDir, 'apps/shell/package.json'),
  resolve(rootDir, 'apps/landing/package.json'),
  resolve(rootDir, 'apps/mobile/package.json'),
];

const mobileAppJsonPath = resolve(rootDir, 'apps/mobile/app.json');

const args = process.argv.slice(2);
let type = 'patch'; // patch | minor | major
let shouldStage = false;
let explicitVersion = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--minor') type = 'minor';
  else if (arg === '--major') type = 'major';
  else if (arg === '--patch') type = 'patch';
  else if (arg === '--stage') shouldStage = true;
  else if (arg === '--set' && args[i + 1]) {
    explicitVersion = args[++i];
  }
}

// Read current root version
const rootPkg = JSON.parse(readFileSync(targetPackages[0], 'utf8'));
const currentVersion = rootPkg.version || '1.0.0';

function incrementVersion(version, bumpType) {
  const parts = version.split('.').map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semver: ${version}`);
  }
  let [major, minor, patch] = parts;
  if (bumpType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

const nextVersion = explicitVersion || incrementVersion(currentVersion, type);

// 1. Update package.json files
for (const file of targetPackages) {
  try {
    const content = readFileSync(file, 'utf8');
    const json = JSON.parse(content);
    json.version = nextVersion;
    writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
  } catch (err) {
    console.warn(`[bump-version] Warning updating ${file}:`, err.message);
  }
}

// 2. Update apps/mobile/app.json
let nextVersionCode = 1;
let nextBuildNumber = '1';
try {
  const content = readFileSync(mobileAppJsonPath, 'utf8');
  const json = JSON.parse(content);
  if (!json.expo) json.expo = {};
  json.expo.version = nextVersion;

  // Synchronized Android versionCode & iOS buildNumber
  if (!json.expo.android) json.expo.android = {};
  if (!json.expo.ios) json.expo.ios = {};
  const currentCode = typeof json.expo.android.versionCode === 'number' ? json.expo.android.versionCode : 1;
  const currentBuild = parseInt(json.expo.ios.buildNumber || '0', 10) || 0;
  const synchronizedNumber = Math.max(currentCode, currentBuild) + 1;
  nextVersionCode = synchronizedNumber;
  nextBuildNumber = String(synchronizedNumber);
  json.expo.android.versionCode = nextVersionCode;
  json.expo.ios.buildNumber = nextBuildNumber;

  writeFileSync(mobileAppJsonPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
} catch (err) {
  console.warn(`[bump-version] Warning updating mobile app.json:`, err.message);
}

console.log(`[bump-version] 🚀 Successfully bumped version: ${currentVersion} -> ${nextVersion}`);
console.log(`[bump-version] 📱 Mobile updated: android.versionCode=${nextVersionCode}, ios.buildNumber=${nextBuildNumber}`);

// 3. Update native Android build.gradle if present
const androidGradlePath = resolve(rootDir, 'apps/mobile/android/app/build.gradle');
if (existsSync(androidGradlePath)) {
  try {
    let gradle = readFileSync(androidGradlePath, 'utf8');
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${nextVersionCode}`);
    gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${nextVersion}"`);
    writeFileSync(androidGradlePath, gradle, 'utf8');
    console.log(`[bump-version] 🤖 Android build.gradle updated: versionCode=${nextVersionCode}, versionName="${nextVersion}"`);
  } catch (err) {
    console.warn(`[bump-version] Warning updating android build.gradle:`, err.message);
  }
}

// 4. Update native iOS Info.plist & project.pbxproj if present
const iosInfoPlist = resolve(rootDir, 'apps/mobile/ios/SofttyOffice/Info.plist');
if (existsSync(iosInfoPlist)) {
  try {
    let plist = readFileSync(iosInfoPlist, 'utf8');
    plist = plist.replace(
      /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+(<\/string>)/,
      `$1${nextVersion}$2`
    );
    plist = plist.replace(
      /(<key>CFBundleVersion<\/key>\s*<string>)[^<]+(<\/string>)/,
      `$1${nextBuildNumber}$2`
    );
    writeFileSync(iosInfoPlist, plist, 'utf8');
    console.log(`[bump-version] 🍎 iOS Info.plist updated: CFBundleShortVersionString="${nextVersion}", CFBundleVersion="${nextBuildNumber}"`);
  } catch (err) {
    console.warn(`[bump-version] Warning updating ios Info.plist:`, err.message);
  }
}

const iosPbxproj = resolve(rootDir, 'apps/mobile/ios/SofttyOffice.xcodeproj/project.pbxproj');
if (existsSync(iosPbxproj)) {
  try {
    let pbx = readFileSync(iosPbxproj, 'utf8');
    pbx = pbx.replace(/CURRENT_PROJECT_VERSION\s*=\s*\d+;/g, `CURRENT_PROJECT_VERSION = ${nextBuildNumber};`);
    pbx = pbx.replace(/MARKETING_VERSION\s*=\s*[^;]+;/g, `MARKETING_VERSION = ${nextVersion};`);
    writeFileSync(iosPbxproj, pbx, 'utf8');
    console.log(`[bump-version] 🍎 iOS project.pbxproj updated: CURRENT_PROJECT_VERSION=${nextBuildNumber}, MARKETING_VERSION=${nextVersion}`);
  } catch (err) {
    console.warn(`[bump-version] Warning updating ios project.pbxproj:`, err.message);
  }
}

// 5. Stage files if requested
if (shouldStage) {
  try {
    const filesToStage = [...targetPackages, mobileAppJsonPath].map((f) => `"${f}"`).join(' ');
    execSync(`git add ${filesToStage}`, { stdio: 'inherit', cwd: rootDir });
    console.log(`[bump-version] 📦 Staged version files into git index.`);
  } catch (err) {
    console.warn(`[bump-version] Warning staging files:`, err.message);
  }
}
