/**
 * Softty ID Single Sign-On (SSO) Service for Softty Office Desktop
 * Implements OAuth 2.0 Device Authorization Grant (RFC 8628)
 * Accounts Gateway: https://accounts.softty.net
 */

import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { app, safeStorage } from 'electron'
import type { AccountLoginEvent, AccountStatus } from '../shared/home-api'

const ACCOUNTS_BASE_URL = process.env.SOFTTY_ACCOUNTS_URL || 'https://accounts.softty.net'
const CLIENT_ID = process.env.SOFTTY_CLIENT_ID || 'softty-office'
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

export class SofttyAuthService {
  private activeAbortController: AbortController | null = null
  private cachedSession: StoredAuthSession | null = null
  private initialized = false

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
      
      // Decrypt access token if stored as encrypted buffer
      if (parsed.encryptedToken && safeStorage?.isEncryptionAvailable()) {
        try {
          const decrypted = safeStorage.decryptString(Buffer.from(parsed.encryptedToken, 'base64'))
          parsed.accessToken = decrypted
        } catch {
          // Fallback to unencrypted accessToken if decryption fails
        }
      }

      this.cachedSession = parsed as StoredAuthSession
      this.initialized = true
    } catch (err) {
      console.warn('[SofttyAuth] Failed to load stored session:', err)
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

      // Encrypt token on supported platforms
      if (safeStorage?.isEncryptionAvailable() && session.accessToken) {
        try {
          toStore.encryptedToken = safeStorage.encryptString(session.accessToken).toString('base64')
          delete toStore.accessToken // Do not leave plaintext token on disk
        } catch {
          toStore.accessToken = session.accessToken
        }
      }

      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(toStore, null, 2), { mode: 0o600 })
      this.cachedSession = session
    } catch (err) {
      console.error('[SofttyAuth] Failed to persist credentials:', err)
    }
  }

  public getAccountStatus(): AccountStatus {
    if (!this.initialized) this.loadSessionFromDisk()

    if (!this.cachedSession) {
      return { loggedIn: false }
    }

    // Check expiration (with 60-second grace window)
    if (this.cachedSession.expiresAt && Date.now() > this.cachedSession.expiresAt - 60_000) {
      // Token expired, attempt refresh in background if refresh token exists
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

  public async startDeviceLogin(
    onProgress: (ev: AccountLoginEvent) => void,
  ): Promise<boolean> {
    // Cancel any previous pending login flow
    this.cancelPendingLogin()

    const abortController = new AbortController()
    this.activeAbortController = abortController
    const { signal } = abortController

    const deviceName = `Softty Office on ${os.type()} ${os.arch()} (${os.hostname()})`

    try {
      // Step 1: Request device_code & user_code from Softty Accounts
      const initUrl = `${ACCOUNTS_BASE_URL}/api/oauth/v2/device/code`
      const initRes = await fetch(initUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          scope: 'openid profile email',
          device_name: deviceName,
        }),
        signal,
      })

      if (!initRes.ok) {
        const errorData = await initRes.json().catch(() => ({}))
        const errorMsg = errorData.error_description || errorData.error || initRes.statusText
        console.warn('[SofttyAuth] Device code request failed:', errorMsg)
        onProgress({ phase: 'error', error: errorMsg })
        return false
      }

      const {
        device_code,
        user_code,
        verification_uri,
        verification_uri_complete,
        expires_in = 600,
        interval = 5,
      } = await initRes.json()

      const finalUrl = verification_uri_complete || `${verification_uri}?user_code=${user_code}`

      // Push URL & code to UI and notify renderer
      onProgress({
        phase: 'url',
        url: finalUrl,
        userCode: user_code,
        expiresInSec: expires_in,
      })

      // Step 2: Poll token endpoint until user approves or code expires
      let pollIntervalMs = Math.max(interval, 3) * 1000
      const deadline = Date.now() + expires_in * 1000

      while (Date.now() < deadline && !signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
        if (signal.aborted) return false

        const tokenRes = await fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v2/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code,
            client_id: CLIENT_ID,
          }),
          signal,
        })

        const tokenData = await tokenRes.json().catch(() => ({}))

        if (tokenRes.ok && tokenData.access_token) {
          // Step 3: Fetch User Info
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
          onProgress({ phase: 'success' })
          return true
        }

        if (tokenData.error === 'authorization_pending') {
          continue
        }

        if (tokenData.error === 'slow_down') {
          pollIntervalMs += 5000
          continue
        }

        if (tokenData.error === 'access_denied') {
          onProgress({ phase: 'error', error: 'Người dùng đã từ chối yêu cầu kết nối.' })
          return false
        }

        if (tokenData.error === 'expired_token') {
          onProgress({ phase: 'error', error: 'Mã xác thực đã hết hạn.' })
          return false
        }

        if (tokenData.error) {
          onProgress({ phase: 'error', error: tokenData.error_description || tokenData.error })
          return false
        }
      }

      onProgress({ phase: 'error', error: 'Quá thời gian chờ xác thực thiết bị.' })
      return false
    } catch (err: any) {
      if (signal.aborted) return false
      console.error('[SofttyAuth] Error during device login:', err)
      onProgress({ phase: 'error', error: err.message || 'Lỗi kết nối tới máy chủ định danh.' })
      return false
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null
      }
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
      const res = await fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: this.cachedSession.refreshToken,
          client_id: CLIENT_ID,
        }),
      })

      if (!res.ok) {
        console.warn('[SofttyAuth] Refresh token rejected')
        return false
      }

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
    if (this.activeAbortController) {
      this.activeAbortController.abort()
      this.activeAbortController = null
    }
  }

  public async logout(): Promise<void> {
    this.cancelPendingLogin()

    if (this.cachedSession?.accessToken) {
      // Fire-and-forget token revocation
      fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v2/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.cachedSession.accessToken,
          client_id: CLIENT_ID,
        }),
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
