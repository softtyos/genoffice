/**
 * Softty ID Single Sign-On (SSO) Service for Softty Office Desktop
 * Implements OAuth 2.0 Authorization Code Flow with PKCE (RFC 7636)
 * Dual-Channel Callback: Local Loopback Server (RFC 8252) + Deep Link (softty-office://auth/callback)
 *
 * Accounts Gateway: https://accounts.softty.net
 * Client ID: 31d804fccdd8981c6a3aa5d650ae5e08
 */

import http from 'node:http'
import crypto from 'node:crypto'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { app, BrowserWindow, safeStorage, shell } from 'electron'
import type { AccountLoginEvent, AccountStatus } from '../shared/home-api'

const ACCOUNTS_BASE_URL = process.env.SOFTTY_ACCOUNTS_URL || 'https://accounts.softty.net'
const CLIENT_ID = process.env.SOFTTY_CLIENT_ID || '31d804fccdd8981c6a3aa5d650ae5e08'
const DEFAULT_REDIRECT_URI = 'softty-office://auth/callback'
const CREDENTIALS_DIR = path.join(os.homedir(), '.config', 'softty')
const CREDENTIALS_PATH = path.join(CREDENTIALS_DIR, 'office-auth.json')

export interface StoredAuthSession {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  user: {
    id: string
    email: string
    name?: string
    avatarUrl?: string
    tier?: string
  }
}

interface PendingAuthState {
  verifier: string
  state: string
  redirectUri: string
  createdAt: number
}

function renderLoopbackCallbackHtml(isSuccess: boolean, errorMessage?: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${isSuccess ? 'Đăng nhập thành công' : 'Lỗi đăng nhập'} - Softty Office</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #0e1322;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 20px;
      padding: 44px 36px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    .icon-wrapper {
      width: 68px;
      height: 68px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${isSuccess ? 'linear-gradient(135deg, #2563eb, #06b6d4)' : 'linear-gradient(135deg, #ef4444, #f97316)'};
      box-shadow: 0 10px 25px -5px ${isSuccess ? 'rgba(37, 99, 235, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 12px;
      color: #ffffff;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 28px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #38bdf8;
      margin-bottom: 24px;
    }
    .tip {
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">
      ${
        isSuccess
          ? `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`
          : `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
      }
    </div>
    <div class="badge">Softty Office Desktop</div>
    <h1>${isSuccess ? 'Đăng Nhập Thành Công!' : 'Đăng Nhập Thất Bại'}</h1>
    <p>${
      isSuccess
        ? 'Bạn đã xác thực an toàn bằng Softty Account. Ứng dụng Softty Office trên máy tính đang tự động mở và cập nhật phiên làm việc của bạn.'
        : errorMessage || 'Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng quay lại ứng dụng và thử lại.'
    }</p>
    <div class="tip">Bạn có thể đóng tab trình duyệt này để tiếp tục làm việc.</div>
  </div>
  ${
    isSuccess
      ? `<script>
          // Tự động đóng tab sau 2.5 giây
          setTimeout(function() {
            window.open('', '_self', '');
            window.close();
          }, 2500);
        </script>`
      : ''
  }
</body>
</html>`
}

export class SofttyAuthService {
  private activeLoopbackServer: http.Server | null = null
  private pendingState: PendingAuthState | null = null
  private cachedSession: StoredAuthSession | null = null
  private initialized = false
  private onProgressCallback: ((ev: AccountLoginEvent) => void) | null = null

  // Chống xử lý trùng lặp callback
  private inFlightCodes = new Set<string>()
  private completedCodes = new Map<string, number>()

  constructor() {
    this.loadSessionFromDisk()
  }

  private loadSessionFromDisk(): void {
    try {
      if (!fs.existsSync(CREDENTIALS_PATH)) {
        this.cachedSession = null
        this.initialized = true
        return
      }

      const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8')
      const parsed = JSON.parse(raw)

      if (parsed.encryptedToken && safeStorage?.isEncryptionAvailable()) {
        try {
          const decrypted = safeStorage.decryptString(Buffer.from(parsed.encryptedToken, 'base64'))
          parsed.accessToken = decrypted
        } catch {
          // Fallback to unencrypted accessToken
        }
      }

      this.cachedSession = parsed as StoredAuthSession
      this.initialized = true
    } catch (err) {
      console.warn('[SofttyAuth] Failed to load stored credentials:', err)
      this.cachedSession = null
      this.initialized = true
    }
  }

  private saveSessionToDisk(session: StoredAuthSession): void {
    try {
      if (!fs.existsSync(CREDENTIALS_DIR)) {
        fs.mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 })
      }

      const toStore: Record<string, any> = { ...session }

      if (safeStorage?.isEncryptionAvailable() && session.accessToken) {
        try {
          toStore.encryptedToken = safeStorage.encryptString(session.accessToken).toString('base64')
          delete toStore.accessToken
        } catch {
          toStore.accessToken = session.accessToken
        }
      }

      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(toStore, null, 2), { mode: 0o600 })
      this.cachedSession = session
    } catch (err) {
      console.error('[SofttyAuth] Failed to save credentials:', err)
    }
  }

  public getAccountStatus(): AccountStatus {
    if (!this.initialized) this.loadSessionFromDisk()

    if (!this.cachedSession) {
      return { loggedIn: false }
    }

    if (this.cachedSession.expiresAt && Date.now() > this.cachedSession.expiresAt - 60_000) {
      if (this.cachedSession.refreshToken) {
        void this.refreshAccessToken()
      }
    }

    return {
      loggedIn: true,
      email: this.cachedSession.user.email,
      name: this.cachedSession.user.name || this.cachedSession.user.email.split('@')[0],
      avatarUrl: this.cachedSession.user.avatarUrl,
      tier: this.cachedSession.user.tier || 'pro',
    }
  }

  /**
   * Tạo cặp PKCE verifier & challenge (S256)
   */
  private generatePKCE(): { verifier: string; challenge: string } {
    const verifier = crypto.randomBytes(32).toString('hex')
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return { verifier, challenge }
  }

  /**
   * Khởi chạy Local Loopback HTTP Server nhận callback RFC 8252
   */
  private startLocalLoopbackServer(preferredPort = 18235): Promise<{ port: number; redirectUri: string } | null> {
    return new Promise((resolve) => {
      this.stopLocalLoopbackServer()

      const tryListen = (port: number) => {
        if (port > 18260) {
          console.warn('[SofttyAuth] Port range exhausted, fallback to deep link')
          resolve(null)
          return
        }

        const server = http.createServer(async (req, res) => {
          try {
            if (!req.url) return
            const reqUrl = new URL(req.url, `http://127.0.0.1:${port}`)

            if (reqUrl.pathname === '/callback') {
              const code = reqUrl.searchParams.get('code')
              const state = reqUrl.searchParams.get('state')
              const error = reqUrl.searchParams.get('error')

              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
              res.end(renderLoopbackCallbackHtml(!error && !!code, error || undefined))

              this.bringAppToForeground()

              const fullCallbackUrl = `softty-office://auth/callback?code=${encodeURIComponent(code || '')}&state=${encodeURIComponent(state || '')}${
                error ? `&error=${encodeURIComponent(error)}` : ''
              }`

              void this.handleCallback(fullCallbackUrl)

              setTimeout(() => this.stopLocalLoopbackServer(), 2000)
            } else {
              res.writeHead(404)
              res.end('Not Found')
            }
          } catch (err) {
            console.error('[SofttyAuth] Error in Loopback HTTP handler:', err)
          }
        })

        server.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            tryListen(port + 1)
          } else {
            console.error('[SofttyAuth] Loopback server error:', err)
            resolve(null)
          }
        })

        server.listen(port, '127.0.0.1', () => {
          this.activeLoopbackServer = server
          const redirectUri = `http://127.0.0.1:${port}/callback`
          console.log(`[SofttyAuth] Loopback HTTP Server listening on ${redirectUri}`)

          // Auto shutdown sau 5 phút nếu người dùng bỏ dở
          setTimeout(() => {
            if (this.activeLoopbackServer === server) {
              this.stopLocalLoopbackServer()
            }
          }, 5 * 60 * 1000)

          resolve({ port, redirectUri })
        })
      }

      tryListen(preferredPort)
    })
  }

  private stopLocalLoopbackServer(): void {
    if (this.activeLoopbackServer) {
      try {
        this.activeLoopbackServer.close()
      } catch {
        // ignore
      }
      this.activeLoopbackServer = null
    }
  }

  /**
   * Kéo ứng dụng Softty Office lên màn hình trước sau khi trình duyệt duyệt xong
   */
  private bringAppToForeground(): void {
    try {
      if (process.platform === 'darwin') {
        app.focus({ steal: true })
      }
      for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) {
          if (win.isMinimized()) win.restore()
          win.show()
          win.focus()
          break
        }
      }
    } catch (err) {
      console.warn('[SofttyAuth] Failed to bring app to foreground:', err)
    }
  }

  /**
   * Bước 1: Bắt đầu luồng đăng nhập SSO OAuth 2.0 PKCE
   */
  public async startLogin(onProgress: (ev: AccountLoginEvent) => void): Promise<boolean> {
    this.onProgressCallback = onProgress

    const { verifier, challenge } = this.generatePKCE()
    const state = crypto.randomBytes(16).toString('hex')

    // Bật Loopback Server trước
    const loopback = await this.startLocalLoopbackServer()
    const effectiveRedirectUri = loopback ? loopback.redirectUri : DEFAULT_REDIRECT_URI

    this.pendingState = {
      verifier,
      state,
      redirectUri: effectiveRedirectUri,
      createdAt: Date.now(),
    }

    const authUrlObj = new URL(`${ACCOUNTS_BASE_URL}/vi/authorize`)
    authUrlObj.searchParams.set('client_id', CLIENT_ID)
    authUrlObj.searchParams.set('redirect_uri', effectiveRedirectUri)
    authUrlObj.searchParams.set('response_type', 'code')
    authUrlObj.searchParams.set('scope', 'openid profile email')
    authUrlObj.searchParams.set('state', state)
    authUrlObj.searchParams.set('code_challenge', challenge)
    authUrlObj.searchParams.set('code_challenge_method', 'S256')

    const authUrl = authUrlObj.toString()
    console.log('[SofttyAuth] Opening login URL with PKCE:', authUrl)

    onProgress({
      phase: 'url',
      url: authUrl,
      expiresInSec: 300,
    })

    try {
      await shell.openExternal(authUrl)
      return true
    } catch (err: any) {
      console.error('[SofttyAuth] Failed to open external browser:', err)
      onProgress({
        phase: 'error',
        error: 'Không thể mở trình duyệt mặc định. Vui lòng kiểm tra lại cài đặt.',
      })
      return false
    }
  }

  /**
   * Bước 2 & 3: Nhận callback code (từ Loopback hoặc Deep Link OS) -> Đổi lấy Token -> Lấy Profile
   */
  public async handleCallback(rawUrl: string): Promise<boolean> {
    console.log('[SofttyAuth] Received auth callback:', rawUrl.replace(/code=[^&]+/, 'code=********'))

    try {
      const urlObj = new URL(rawUrl)
      const code = urlObj.searchParams.get('code')
      const state = urlObj.searchParams.get('state')
      const error = urlObj.searchParams.get('error')

      if (error) {
        console.error('[SofttyAuth] Auth error from server:', error)
        this.onProgressCallback?.({
          phase: 'error',
          error: 'Người dùng đã hủy hoặc từ chối ủy quyền đăng nhập.',
        })
        return false
      }

      if (!code) {
        console.warn('[SofttyAuth] Missing code in callback')
        return false
      }

      const authKey = `${code}:${state || ''}`
      const now = Date.now()

      // Chống xung đột kép (Race condition giữa loopback & deep link)
      if (this.inFlightCodes.has(authKey)) {
        return false
      }
      const completedAt = this.completedCodes.get(authKey)
      if (completedAt && now - completedAt < 20_000) {
        return false
      }

      this.inFlightCodes.add(authKey)

      if (!this.pendingState) {
        throw new Error('Không tìm thấy phiên đăng nhập đang chờ. Vui lòng thử bấm Đăng Nhập lại.')
      }

      if (now - this.pendingState.createdAt > 10 * 60 * 1000) {
        this.pendingState = null
        throw new Error('Yêu cầu đăng nhập đã hết hạn. Vui lòng thử lại.')
      }

      if (state !== this.pendingState.state) {
        throw new Error('Mã trạng thái bảo mật (state) không khớp.')
      }

      const { verifier, redirectUri } = this.pendingState
      this.pendingState = null

      // Bước 3: Đổi Code lấy Token bằng PKCE Verifier tại /api/oauth/v1/token
      const tokenEndpoint = `${ACCOUNTS_BASE_URL}/api/oauth/v1/token`
      const bodyParams = new URLSearchParams()
      bodyParams.append('grant_type', 'authorization_code')
      bodyParams.append('code', code)
      bodyParams.append('redirect_uri', redirectUri)
      bodyParams.append('client_id', CLIENT_ID)
      bodyParams.append('code_verifier', verifier)

      const tokenRes = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString(),
      })

      if (!tokenRes.ok) {
        const errJson = await tokenRes.json().catch(() => ({}))
        throw new Error(errJson.error_description || errJson.error || `Lỗi server ${tokenRes.status}`)
      }

      const tokenData = await tokenRes.json()
      if (!tokenData.access_token) {
        throw new Error('Máy chủ không trả về access token')
      }

      // Bước 4: Lấy User Profile
      const userInfo = await this.fetchUserInfo(tokenData.access_token)

      const session: StoredAuthSession = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
        user: {
          id: userInfo.sub || userInfo.id || 'softty_user',
          email: userInfo.email || 'user@softty.net',
          name: userInfo.name || userInfo.email?.split('@')[0],
          avatarUrl: userInfo.picture || userInfo.avatarUrl,
          tier: userInfo.softty_entitlements?.tier || userInfo.tier || 'pro',
        },
      }

      this.saveSessionToDisk(session)
      this.bringAppToForeground()

      this.onProgressCallback?.({ phase: 'success' })

      this.completedCodes.set(authKey, Date.now())
      return true
    } catch (err: any) {
      console.error('[SofttyAuth] Error processing callback:', err)
      this.onProgressCallback?.({ phase: 'error', error: err.message || 'Lỗi xác thực tài khoản' })
      return false
    } finally {
      this.stopLocalLoopbackServer()
    }
  }

  private async fetchUserInfo(accessToken: string): Promise<Record<string, any>> {
    try {
      const res = await fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v2/userinfo?app=softty-office`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (err) {
      console.warn('[SofttyAuth] Failed to fetch userinfo:', err)
    }
    return {}
  }

  public async refreshAccessToken(): Promise<boolean> {
    if (!this.cachedSession?.refreshToken) return false

    try {
      const bodyParams = new URLSearchParams()
      bodyParams.append('grant_type', 'refresh_token')
      bodyParams.append('refresh_token', this.cachedSession.refreshToken)
      bodyParams.append('client_id', CLIENT_ID)

      const res = await fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString(),
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.access_token) {
        this.cachedSession.accessToken = data.access_token
        if (data.refresh_token) this.cachedSession.refreshToken = data.refresh_token
        this.cachedSession.expiresAt = Date.now() + (data.expires_in || 3600) * 1000
        this.saveSessionToDisk(this.cachedSession)
        return true
      }
    } catch (err) {
      console.warn('[SofttyAuth] Token refresh error:', err)
    }
    return false
  }

  public cancelPendingLogin(): void {
    this.stopLocalLoopbackServer()
    this.pendingState = null
  }

  public async logout(): Promise<void> {
    this.cancelPendingLogin()

    if (this.cachedSession?.accessToken) {
      fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v1/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: this.cachedSession.accessToken,
          client_id: CLIENT_ID,
        }).toString(),
      }).catch(() => {})
    }

    this.cachedSession = null
    try {
      if (fs.existsSync(CREDENTIALS_PATH)) {
        fs.unlinkSync(CREDENTIALS_PATH)
      }
    } catch (err) {
      console.warn('[SofttyAuth] Failed to delete credentials file:', err)
    }
  }
}
