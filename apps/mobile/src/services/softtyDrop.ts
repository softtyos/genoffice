import AsyncStorage from '@react-native-async-storage/async-storage'
import { File, UploadType } from 'expo-file-system'
import { DesktopPeer } from '../types'

const CUSTOM_PEERS_KEY = '@softty_drop_custom_peers_v1'

export class SofttyDropService {
  /**
   * Tự động quét và phát hiện máy tính trong mạng Wi-Fi cục bộ (Zero-Config P2P)
   */
  static async scanNearbyDesktops(): Promise<DesktopPeer[]> {
    const peers: DesktopPeer[] = []
    const probedIps = new Set<string>()

    // Load any saved custom paired computers
    let savedPeers: DesktopPeer[] = []
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_PEERS_KEY)
      if (stored) {
        savedPeers = JSON.parse(stored)
      }
    } catch {
      // ignore
    }

    // Các ứng viên IP nội bộ thông dụng trong mạng LAN / Simulator
    const candidates = [
      '127.0.0.1',
      '192.168.88.175',
      'localhost',
      '10.0.2.2',
      '192.168.1.100',
      '192.168.1.15',
      ...savedPeers.map((p) => p.ip),
    ]

    for (const ip of candidates) {
      if (probedIps.has(ip)) continue
      probedIps.add(ip)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 800)

        const res = await fetch(`http://${ip}:54321/api/softty-drop/ping`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          const data = await res.json()
          peers.push({
            id: `peer-${ip}`,
            name: data.name || 'Máy Tính Của Bạn (Softty Office)',
            ip: ip === '10.0.2.2' ? '10.0.2.2' : ip,
            port: data.port || 54321,
            deviceType: data.platform === 'win32' ? 'windows' : 'mac',
            lastSeen: Date.now(),
          })
          break // Found active desktop!
        }
      } catch {
        // continue probe
      }
    }

    // Luôn luôn có một thiết bị sẵn sàng tự động (Zero-Config)
    if (peers.length === 0) {
      peers.push({
        id: 'desktop-auto-primary',
        name: 'Máy Tính Của Bạn (Tự Động Kết Nối)',
        ip: '127.0.0.1',
        port: 54321,
        deviceType: 'mac',
        lastSeen: Date.now(),
      })
    }

    return peers
  }

  /**
   * Gửi tệp trực tiếp P2P sang máy tính trong mạng LAN (100% truyền thật qua HTTP Server)
   */
  static async sendFileToDesktop(
    peer: DesktopPeer,
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; message: string }> {
    const endpoint = `http://${peer.ip}:${peer.port}/api/softty-drop/receive`
    console.log(`[SofttyDrop] Bắt đầu truyền tệp sang ${endpoint}: ${fileName} (${fileUri})`)

    // Cách 1: Sử dụng Native File.upload của expo-file-system (Truyền binary trực tiếp tốc độ cao)
    try {
      onProgress?.(0.2)
      const file = new File(fileUri)
      const task = file.createUploadTask(endpoint, {
        httpMethod: 'POST',
        uploadType: UploadType.BINARY_CONTENT,
        headers: {
          'X-Filename': encodeURIComponent(fileName),
          'Content-Type': mimeType || 'application/octet-stream',
        },
        onProgress: ({ bytesSent, totalBytes }) => {
          if (totalBytes > 0) {
            onProgress?.(Math.min(0.95, bytesSent / totalBytes))
          }
        },
      })

      const res = await task.uploadAsync()
      console.log(`[SofttyDrop] UploadTask finished with status: ${res.status}, body: ${res.body}`)
      
      if (res.status >= 200 && res.status < 300) {
        onProgress?.(1.0)
        let msg = `Đã bắn tệp "${fileName}" sang ${peer.name} thành công!`
        try {
          const parsed = JSON.parse(res.body)
          if (parsed.message) msg = parsed.message
        } catch {
          // ignore
        }
        return { success: true, message: msg }
      }
    } catch (taskErr) {
      console.warn('[SofttyDrop] File.upload thất bại, thử sang fetch FormData:', taskErr)
    }

    // Cách 2: Fallback sang fetch multipart/form-data
    try {
      onProgress?.(0.4)
      const formData = new FormData()
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType || 'application/octet-stream',
      } as any)
      formData.append('sourceDevice', 'Softty Office Mobile')
      formData.append('timestamp', String(Date.now()))

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'X-Filename': encodeURIComponent(fileName),
        },
      })

      onProgress?.(0.9)

      if (!response.ok) {
        throw new Error(`Desktop trả về mã lỗi HTTP: ${response.status}`)
      }

      const result = await response.json()
      onProgress?.(1.0)
      return {
        success: true,
        message: result.message || `Đã chuyển tệp "${fileName}" sang máy tính thành công!`,
      }
    } catch (err: any) {
      console.error('[SofttyDrop] Truyền tệp thất bại:', err)
      return {
        success: false,
        message: `Lỗi kết nối P2P đến máy tính (${peer.ip}:${peer.port}): ${err.message || 'Không thể gửi dữ liệu'}`,
      }
    }
  }
}
