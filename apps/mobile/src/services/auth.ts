import { Linking } from 'react-native'
import * as Crypto from 'expo-crypto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserProfile } from '../types'

const ACCOUNTS_BASE_URL = 'https://accounts.softty.net'
const CLIENT_ID = '31d804fccdd8981c6a3aa5d650ae5e08'
const REDIRECT_URI = 'softty-office://auth/callback'
const STORAGE_KEY = '@softty_office_session'

export class SofttyAuthService {
  private static currentUser: UserProfile | null = null
  private static pendingVerifier: string | null = null
  private static pendingState: string | null = null

  static async init(): Promise<UserProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.currentUser = parsed.user || null
        return this.currentUser
      }
    } catch {
      // ignore
    }
    return null
  }

  static getCurrentUser(): UserProfile | null {
    return this.currentUser
  }

  /**
   * Sinh mã PKCE Verifier & Challenge
   */
  private static async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const rawBytes = await Crypto.getRandomBytesAsync(32)
    const verifier = Array.from(rawBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
      encoding: Crypto.CryptoEncoding.BASE64,
    })

    const challenge = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return { verifier, challenge }
  }

  /**
   * Bắt đầu luồng đăng nhập OAuth 2.0 PKCE trên Mobile
   */
  static async startBrowserLogin(): Promise<void> {
    const { verifier, challenge } = await this.generatePKCE()
    const stateRaw = await Crypto.getRandomBytesAsync(16)
    const state = Array.from(stateRaw)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    this.pendingVerifier = verifier
    this.pendingState = state

    const authUrl = `${ACCOUNTS_BASE_URL}/vi/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI,
    )}&response_type=code&scope=openid%20profile%20email&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`

    await Linking.openURL(authUrl)
  }

  /**
   * Xử lý Deep Link Callback từ softty-office://auth/callback?code=...
   */
  static async handleDeepLink(url: string): Promise<UserProfile | null> {
    try {
      if (!url.startsWith(REDIRECT_URI)) return null

      const queryString = url.includes('?') ? url.split('?')[1] : ''
      const params = new URLSearchParams(queryString)

      const code = params.get('code')
      const state = params.get('state')
      const error = params.get('error')

      if (error || !code) {
        throw new Error(error || 'Thiếu authorization code')
      }

      if (this.pendingState && state && state !== this.pendingState) {
        throw new Error('Mã state không khớp (CSRF Protection)')
      }

      const verifier = this.pendingVerifier
      this.pendingVerifier = null
      this.pendingState = null

      // Đổi code lấy Access Token tại /api/oauth/v1/token
      const body = new URLSearchParams()
      body.append('grant_type', 'authorization_code')
      body.append('code', code)
      body.append('redirect_uri', REDIRECT_URI)
      body.append('client_id', CLIENT_ID)
      if (verifier) {
        body.append('code_verifier', verifier)
      }

      const tokenRes = await fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!tokenRes.ok) {
        throw new Error(`Đổi token thất bại: status ${tokenRes.status}`)
      }

      const tokenData = await tokenRes.json()

      // Lấy Profile người dùng
      const userinfoRes = await fetch(`${ACCOUNTS_BASE_URL}/api/oauth/v2/userinfo?app=softty-office`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })

      const userInfo = userinfoRes.ok ? await userinfoRes.json() : {}

      const user: UserProfile = {
        id: userInfo.sub || userInfo.id || 'softty_mobile_user',
        name: userInfo.name || userInfo.email?.split('@')[0] || 'Softty User',
        email: userInfo.email || 'user@softty.net',
        tier: userInfo.softty_entitlements?.tier || userInfo.tier || 'pro',
      }

      this.currentUser = user
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
        }),
      )

      return user
    } catch (err) {
      console.warn('[SofttyAuth Mobile] Failed callback processing:', err)
      return null
    }
  }

  static async logout(): Promise<void> {
    this.currentUser = null
    await AsyncStorage.removeItem(STORAGE_KEY)
  }
}
