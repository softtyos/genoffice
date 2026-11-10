import AsyncStorage from '@react-native-async-storage/async-storage'
import { File, UploadType } from 'expo-file-system'
import * as FileSystem from 'expo-file-system/legacy'
import { DesktopPeer } from '../types'

const CUSTOM_PEERS_KEY = '@softty_drop_custom_peers_v1'
const KNOWN_HUB_IP_KEY = '@softty_drop_known_hub_ip_v1'

export interface DropQrPayload {
  type: string
  v: number
  pin: string
  name: string
  ips: string[]
  port: number
  sid?: string
}

export class SofttyDropService {
  private static cachedHubIp: string | null = null

  /**
   * Quét và phát hiện máy tính / Hub trong mạng Wi-Fi cục bộ
   */
  static async scanNearbyDesktops(): Promise<DesktopPeer[]> {
    const peers: DesktopPeer[] = []
    const probedIps = new Set<string>()

    let savedPeers: DesktopPeer[] = []
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_PEERS_KEY)
      if (stored) savedPeers = JSON.parse(stored)
      const storedHub = await AsyncStorage.getItem(KNOWN_HUB_IP_KEY)
      if (storedHub) this.cachedHubIp = storedHub
    } catch {
      // ignore
    }

    const candidates = [
      ...(this.cachedHubIp ? [this.cachedHubIp] : []),
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
        const timeoutId = setTimeout(() => controller.abort(), 900)

        const res = await fetch(`http://${ip}:54321/api/softty-drop/ping`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          const data = await res.json()
          this.cachedHubIp = ip
          await AsyncStorage.setItem(KNOWN_HUB_IP_KEY, ip)

          peers.push({
            id: `peer-${ip}`,
            name: data.name || 'Máy Tính Của Bạn (Softty Office)',
            ip: ip === '10.0.2.2' ? '10.0.2.2' : ip,
            port: data.port || 54321,
            deviceType: data.platform === 'win32' ? 'windows' : 'mac',
            lastSeen: Date.now(),
          })
          break
        }
      } catch {
        // continue probe
      }
    }

    if (peers.length === 0) {
      peers.push({
        id: 'desktop-auto-primary',
        name: 'Máy Tính Của Bạn (Tự Động Kết Nối)',
        ip: this.cachedHubIp || '127.0.0.1',
        port: 54321,
        deviceType: 'mac',
        lastSeen: Date.now(),
      })
    }

    return peers
  }

  /**
   * Tạo phiên nhận tệp mới trên điện thoại kèm mã PIN 6 số và mã QR
   */
  static async createReceiveSession(): Promise<{ pin: string; qrPayload: string }> {
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    const qrPayload = JSON.stringify({
      type: 'softty-drop',
      v: 2,
      pin,
      name: 'Điện thoại di động (Softty Office)',
      ips: [],
      port: 54321,
    })

    // Cố gắng đăng ký mã PIN này với Hub trong mạng LAN nếu có
    const hubIp = this.cachedHubIp || '127.0.0.1'
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 1000)
      await fetch(`http://${hubIp}:54321/api/softty-drop/register-peer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          deviceName: 'Điện thoại di động (Softty Office)',
          deviceType: 'ios',
        }),
        signal: controller.signal,
      })
      clearTimeout(t)
    } catch {
      // Hub chưa kết nối, tiếp tục bình thường
    }

    return { pin, qrPayload }
  }

  /**
   * Lắng nghe / Kéo tệp được gửi tới mã PIN của điện thoại này
   */
  static async pullIncomingFile(
    pin: string,
  ): Promise<{ success: boolean; fileName?: string; localUri?: string; size?: number } | null> {
    const candidates = [
      ...(this.cachedHubIp ? [this.cachedHubIp] : []),
      '127.0.0.1',
      '192.168.88.175',
      '10.0.2.2',
    ]

    for (const ip of candidates) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        const res = await fetch(`http://${ip}:54321/api/softty-drop/relay/pull?pin=${pin}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (res.status === 200) {
          const rawFilename = res.headers.get('x-filename') || `SofttyDrop_${Date.now()}.pdf`
          let fileName = rawFilename
          try {
            fileName = decodeURIComponent(rawFilename)
          } catch {
            // ignore
          }

          const blob = await res.blob()
          const reader = new FileReader()

          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const resStr = reader.result as string
              const b64 = resStr.includes(',') ? resStr.split(',')[1] : resStr
              resolve(b64)
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })

          const localUri = `${FileSystem.documentDirectory || FileSystem.cacheDirectory}${fileName}`
          await FileSystem.writeAsStringAsync(localUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          })

          return {
            success: true,
            fileName,
            localUri,
            size: blob.size,
          }
        }
      } catch {
        // try next candidate
      }
    }

    return null
  }

  /**
   * Gửi tệp bằng mã PIN 6 số của người nhận
   */
  static async sendFileByPin(
    pin: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; message: string }> {
    const cleanPin = pin.replace(/\s+/g, '').trim()
    const peers = await this.scanNearbyDesktops()
    const targetIp = peers.length > 0 ? peers[0].ip : (this.cachedHubIp || '127.0.0.1')
    const targetPort = peers.length > 0 ? peers[0].port : 54321

    onProgress?.(0.2)

    // Cách 1: Gửi qua Relay Push
    const relayEndpoint = `http://${targetIp}:${targetPort}/api/softty-drop/relay/push`
    try {
      onProgress?.(0.4)
      const file = new File(fileUri)
      const task = file.createUploadTask(relayEndpoint, {
        httpMethod: 'POST',
        uploadType: UploadType.BINARY_CONTENT,
        headers: {
          'X-Filename': encodeURIComponent(fileName),
          'X-Target-Pin': cleanPin,
          'Content-Type': mimeType || 'application/octet-stream',
        },
        onProgress: ({ bytesSent, totalBytes }) => {
          if (totalBytes > 0) {
            onProgress?.(Math.min(0.95, bytesSent / totalBytes))
          }
        },
      })

      const res = await task.uploadAsync()
      if (res.status >= 200 && res.status < 300) {
        onProgress?.(1.0)
        return {
          success: true,
          message: `Đã bắn tệp "${fileName}" tới mã PIN ${cleanPin} thành công!`,
        }
      }
    } catch {
      // Fallback to fetch FormData
    }

    try {
      onProgress?.(0.6)
      const formData = new FormData()
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType || 'application/octet-stream',
      } as any)

      const response = await fetch(relayEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Filename': encodeURIComponent(fileName),
          'X-Target-Pin': cleanPin,
        },
      })

      if (response.ok) {
        onProgress?.(1.0)
        return {
          success: true,
          message: `Đã bắn tệp "${fileName}" tới mã PIN ${cleanPin} thành công!`,
        }
      }
      throw new Error(`Mã lỗi từ máy chủ: ${response.status}`)
    } catch (err: any) {
      return {
        success: false,
        message: `Không thể gửi tệp tới mã PIN ${cleanPin}: ${err.message || 'Lỗi mạng'}`,
      }
    }
  }

  /**
   * Gửi tệp bằng mã QR đã quét
   */
  static async sendFileByQrPayload(
    qrText: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const data: DropQrPayload = JSON.parse(qrText)
      if (data && data.pin) {
        // Thử các IP trực tiếp trong mã QR trước
        if (data.ips && data.ips.length > 0) {
          for (const ip of data.ips) {
            try {
              const ping = await fetch(`http://${ip}:${data.port || 54321}/api/softty-drop/ping`)
              if (ping.ok) {
                const directPeer: DesktopPeer = {
                  id: `qr-${ip}`,
                  name: data.name || 'Thiết bị đối ứng',
                  ip,
                  port: data.port || 54321,
                  deviceType: 'mac',
                  lastSeen: Date.now(),
                }
                return await this.sendFileToDesktop(directPeer, fileUri, fileName, mimeType, onProgress)
              }
            } catch {
              // thử tiếp
            }
          }
        }
        // Fallback qua mã PIN
        return await this.sendFileByPin(data.pin, fileUri, fileName, mimeType, onProgress)
      }
    } catch {
      // nếu không phải JSON, coi như mã PIN thuần túy
    }
    return await this.sendFileByPin(qrText, fileUri, fileName, mimeType, onProgress)
  }

  /**
   * Gửi tệp trực tiếp P2P sang máy tính trong mạng LAN
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
          Accept: 'application/json',
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
