import { UserProfile } from '../types'

export class SofttyAuthService {
  private static currentUser: UserProfile | null = {
    id: 'user_softty_demo',
    name: 'Bonglv',
    email: 'bonglv@softty.net',
    tier: 'pro',
  }

  static getCurrentUser(): UserProfile | null {
    return this.currentUser
  }

  static async loginWithDeviceCode(code: string): Promise<UserProfile> {
    // In production, syncs with https://accounts.softty.net/api/oauth/v2/token
    this.currentUser = {
      id: 'user_softty_synced',
      name: 'Bonglv',
      email: 'bonglv@softty.net',
      tier: 'pro',
    }
    return this.currentUser
  }

  static logout(): void {
    this.currentUser = null
  }
}
