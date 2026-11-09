// electron-builder afterAllArtifactBuild: notarize + staple the dmg itself
// (the .app inside was already notarized before the dmg was built).
//
// Credentials, in priority order:
//   1. APPLE_KEYCHAIN_PROFILE                    — local builds (dist:mac)
//   2. APPLE_API_KEY + APPLE_API_KEY_ID +
//      APPLE_API_ISSUER                          — App Store Connect API Key
//   3. APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD +
//      APPLE_TEAM_ID                             — Apple ID credentials
// With none present the step is skipped, which is the normal path for
// contributor builds: `npm run dist:mac` then yields an unsigned dmg.
const { execFileSync } = require('child_process')
const fs = require('fs')

exports.default = function (result) {
  if (process.platform !== 'darwin') return []
  const {
    APPLE_KEYCHAIN_PROFILE,
    APPLE_API_KEY,
    APPLE_API_KEY_ID,
    APPLE_API_ISSUER,
    APPLE_ID,
    APPLE_APP_SPECIFIC_PASSWORD,
    APPLE_TEAM_ID,
  } = process.env

  let credArgs
  if (APPLE_KEYCHAIN_PROFILE) {
    credArgs = ['--keychain-profile', APPLE_KEYCHAIN_PROFILE]
  } else if (APPLE_API_KEY && APPLE_API_KEY_ID && APPLE_API_ISSUER) {
    let keyPath = APPLE_API_KEY
    if (!fs.existsSync(keyPath)) {
      const tempPath = '/tmp/AuthKey_' + APPLE_API_KEY_ID + '.p8'
      const content = APPLE_API_KEY.includes('BEGIN PRIVATE KEY')
        ? APPLE_API_KEY
        : Buffer.from(APPLE_API_KEY, 'base64').toString('utf8')
      fs.writeFileSync(tempPath, content, { mode: 0o600 })
      keyPath = tempPath
    }
    credArgs = ['--key', keyPath, '--key-id', APPLE_API_KEY_ID, '--issuer', APPLE_API_ISSUER]
  } else if (APPLE_ID && APPLE_APP_SPECIFIC_PASSWORD && (APPLE_TEAM_ID || '79J42YA54H')) {
    credArgs = [
      '--apple-id',
      APPLE_ID,
      '--password',
      APPLE_APP_SPECIFIC_PASSWORD,
      '--team-id',
      APPLE_TEAM_ID || '79J42YA54H',
    ]
  } else {
    console.warn('[notarize] no Apple credentials in the environment — dmg left un-notarized')
    return []
  }
  for (const file of result.artifactPaths.filter((p) => p.endsWith('.dmg'))) {
    try {
      console.log(`[notarize] Notarizing ${file} via xcrun notarytool...`)
      execFileSync('xcrun', ['notarytool', 'submit', file, ...credArgs, '--wait'], {
        stdio: 'inherit',
      })
      console.log(`[notarize] Stapling ticket to ${file}...`)
      execFileSync('xcrun', ['stapler', 'staple', file], { stdio: 'inherit' })
      console.log(`[notarize] ${file} successfully notarized and stapled!`)
    } catch (err) {
      console.warn(`[notarize] WARNING: DMG notarization did not complete: ${err.message}`)
      console.warn('Continuing build with signed DMG installer...')
    }
  }
  return []
}
