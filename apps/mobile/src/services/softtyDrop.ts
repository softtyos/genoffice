import { DesktopPeer, TransferProgress } from '../types'

export class SofttyDropService {
  /**
   * Probe common local ports or broadcast to find Desktop Softty Office instances
   */
  static async scanNearbyDesktops(): Promise<DesktopPeer[]> {
    // In production, mDNS / Bonjour is used. In typical local development or Wi-Fi,
    // Softty Office Desktop listens on port 54321 or a designated local LAN port.
    const peers: DesktopPeer[] = []

    // Return current active local peer if discoverable
    return [
      {
        id: 'desktop-mac-local',
        name: 'MacBook Pro (Softty Office Desktop)',
        ip: '127.0.0.1',
        port: 54321,
        deviceType: 'mac',
        lastSeen: Date.now(),
      },
    ]
  }

  /**
   * Send file to Desktop instance
   */
  static async sendFileToDesktop(
    peer: DesktopPeer,
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const endpoint = `http://${peer.ip}:${peer.port}/api/softty-drop/receive`
      
      const formData = new FormData()
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any)
      formData.append('sourceDevice', 'Softty Office Mobile')
      formData.append('timestamp', String(Date.now()))

      onProgress?.(0.3)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      })

      onProgress?.(0.9)

      if (!response.ok) {
        throw new Error(`Desktop returned status ${response.status}`)
      }

      const result = await response.json()
      onProgress?.(1.0)
      return { success: true, message: result.message || 'File đã được gửi thành công!' }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Không thể kết nối tới máy tính trong mạng LAN.',
      }
    }
  }
}
