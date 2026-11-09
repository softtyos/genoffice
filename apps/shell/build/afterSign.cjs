const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * electron-builder afterSign hook for macOS.
 * 1. Verifies the Developer ID Application code signature on the .app bundle.
 * 2. Attempts Apple Notarization + Stapling via xcrun notarytool & stapler.
 * 3. Fails gracefully with a diagnostic warning if Apple's Notary API returns 401
 *    so that the build still produces the signed DMG installer.
 */
exports.default = async function afterSign(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  if (!fs.existsSync(appPath)) {
    console.warn(`[afterSign] App bundle not found at: ${appPath}`);
    return;
  }

  console.log(`=== [afterSign] Verifying macOS Code Signature for ${appName}.app ===`);
  try {
    execFileSync('codesign', ['-dv', '--verbose=4', appPath], { stdio: 'inherit' });
    execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath], {
      stdio: 'inherit',
    });
    console.log(`=== [afterSign] Code Signature verified successfully for ${appName}.app ===`);
  } catch (err) {
    console.warn(`[afterSign] Warning: codesign verification reported an issue: ${err.message}`);
  }

  let apiKey = process.env.APPLE_API_KEY;
  const apiKeyId = process.env.APPLE_API_KEY_ID;
  const apiIssuer = process.env.APPLE_API_ISSUER;
  const appleId = process.env.APPLE_ID;
  const applePassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID || '79J42YA54H';

  let authArgs = null;
  if (appleId && applePassword) {
    authArgs = ['--apple-id', appleId, '--password', applePassword, '--team-id', teamId];
    console.log(`[afterSign] Using Apple ID authentication (${appleId}, Team: ${teamId}) for Notarization...`);
  } else if (apiKey && apiKeyId && apiIssuer) {
    if (!fs.existsSync(apiKey)) {
      const tempPath = '/tmp/AuthKey_' + apiKeyId + '.p8';
      const content = apiKey.includes('BEGIN PRIVATE KEY')
        ? apiKey
        : Buffer.from(apiKey, 'base64').toString('utf8');
      fs.writeFileSync(tempPath, content, { mode: 0o600 });
      apiKey = tempPath;
    }
    authArgs = ['--key', apiKey, '--key-id', apiKeyId, '--issuer', apiIssuer];
    console.log(`[afterSign] Using App Store Connect API Key (${apiKeyId}) for Notarization...`);
  } else {
    console.log('[afterSign] Skipping Apple Notarization: No notarization credentials found in environment.');
    return;
  }

  const zipPath = path.join(appOutDir, `${appName}-notarize.zip`);
  try {
    console.log(`=== [afterSign] Archiving ${appName}.app for Apple Notary Service ===`);
    execFileSync('ditto', ['-c', '-k', '--keepParent', appPath, zipPath], { stdio: 'inherit' });

    console.log(`=== [afterSign] Submitting ${appName}.app to Apple Notary Service ===`);
    execFileSync('xcrun', ['notarytool', 'submit', zipPath, ...authArgs, '--wait'], {
      stdio: 'inherit',
    });

    console.log(`=== [afterSign] Stapling Notarization Ticket to ${appName}.app ===`);
    execFileSync('xcrun', ['stapler', 'staple', appPath], { stdio: 'inherit' });
    execFileSync('xcrun', ['stapler', 'validate', appPath], { stdio: 'inherit' });

    process.env.SOFTTY_NOTARIZE_STATUS = 'success';
    console.log(`=== [afterSign] ${appName}.app successfully notarized and stapled! ===`);
  } catch (err) {
    process.env.SOFTTY_NOTARIZE_STATUS = 'failed';
    console.warn('================================================================================');
    console.warn(`[afterSign] WARNING: Apple Notarization did not complete: ${err.message}`);
    console.warn('Continuing build with Developer ID Application signed bundle...');
    console.warn('================================================================================');
  } finally {
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  }
};
