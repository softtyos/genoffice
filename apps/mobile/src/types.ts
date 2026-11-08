export interface DesktopPeer {
  id: string
  name: string
  ip: string
  port: number
  deviceType: 'mac' | 'windows' | 'linux'
  lastSeen: number
}

export interface TransferProgress {
  fileName: string
  fileSize: number
  progress: number // 0 to 1
  status: 'idle' | 'transferring' | 'success' | 'error'
  errorMessage?: string
}

export interface ScannedPage {
  id: string
  uri: string
  width: number
  height: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  tier: 'free' | 'pro' | 'enterprise'
}
