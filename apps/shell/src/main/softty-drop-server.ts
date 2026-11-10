/**
 * Softty Drop 2.0 Universal Cross-Device Receiver & Relay Server
 * Supports:
 * - LAN direct streaming (port 54321)
 * - 6-digit PIN pairing & dynamic QR code session
 * - LAN Relay Hub for Mobile-to-Mobile & Desktop-to-Mobile transfer
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { app } from 'electron'

export interface SofttyDropOptions {
  port?: number
  onFileReceived: (filePath: string, fileName: string) => boolean | Promise<boolean>
}

export interface DropSessionPayload {
  version: 2
  sessionId: string
  pin: string
  deviceName: string
  deviceType: 'mac' | 'windows' | 'linux' | 'ios' | 'android'
  ips: string[]
  port: number
  createdAt: number
  expiresAt: number
}

interface RelayItem {
  id: string
  fileName: string
  mimeType: string
  buffer: Buffer
  size: number
  targetPin: string
  createdAt: number
}

export interface RegisteredPeer {
  pin: string
  deviceName: string
  deviceType: 'mac' | 'windows' | 'linux' | 'ios' | 'android'
  ip: string
  port: number
  lastSeen: number
}

function getLocalIpAddresses(): string[] {
  const ips: string[] = []
  try {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address)
        }
      }
    }
  } catch {
    // fallback
  }
  return ips
}

function extractFilePayload(
  buffer: Buffer,
  contentTypeHeader?: string,
  contentDispositionHeader?: string,
  xFilenameHeader?: string | string[],
): { fileBuffer: Buffer; fileName: string; mimeType: string } {
  let fileName = ''
  let mimeType = 'application/octet-stream'

  if (xFilenameHeader) {
    try {
      fileName = decodeURIComponent(Array.isArray(xFilenameHeader) ? xFilenameHeader[0] : xFilenameHeader)
    } catch {
      fileName = Array.isArray(xFilenameHeader) ? xFilenameHeader[0] : xFilenameHeader
    }
  }

  // Check if multipart/form-data
  if (contentTypeHeader && contentTypeHeader.includes('multipart/form-data')) {
    const headerEndIndex = buffer.indexOf(Buffer.from('\r\n\r\n'))
    if (headerEndIndex !== -1) {
      const headerPart = buffer.subarray(0, headerEndIndex).toString('utf-8')
      if (!fileName) {
        const filenameMatch = /filename="?([^";\r\n]+)"?/i.exec(headerPart)
        if (filenameMatch?.[1]) {
          fileName = path.basename(filenameMatch[1])
        }
      }

      const mimeMatch = /Content-Type:\s*([^\s;\r\n]+)/i.exec(headerPart)
      if (mimeMatch?.[1]) {
        mimeType = mimeMatch[1]
      }

      const boundaryMatch = /boundary=([^\s;]+)/i.exec(contentTypeHeader)
      const boundary = boundaryMatch ? boundaryMatch[1].trim() : ''
      const binaryStart = headerEndIndex + 4

      let binaryEnd = buffer.length
      if (boundary) {
        const boundaryBuf = Buffer.from(`\r\n--${boundary}`)
        const foundEnd = buffer.indexOf(boundaryBuf, binaryStart)
        if (foundEnd !== -1) {
          binaryEnd = foundEnd
        }
      }

      const fileBuffer = buffer.subarray(binaryStart, binaryEnd)
      return { fileBuffer, fileName: fileName || `SofttyDrop_${Date.now()}`, mimeType }
    }
  }

  // Direct binary stream
  if (!fileName && contentDispositionHeader) {
    const match = /filename="?([^";\r\n]+)"?/i.exec(contentDispositionHeader)
    if (match?.[1]) fileName = path.basename(match[1])
  }

  if (contentTypeHeader) {
    mimeType = contentTypeHeader.split(';')[0].trim()
  }

  if (!fileName) {
    fileName = `SofttyDrop_${Date.now()}`
    if (buffer.subarray(0, 4).toString() === '%PDF') {
      fileName += '.pdf'
      mimeType = 'application/pdf'
    } else if (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    ) {
      fileName += '.docx'
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  }

  return { fileBuffer: buffer, fileName, mimeType }
}

export class SofttyDropServer {
  private server: http.Server | null = null
  private port: number
  private onFileReceived: (filePath: string, fileName: string) => boolean | Promise<boolean>
  private currentSession: DropSessionPayload | null = null
  private relayBoxes: Map<string, RelayItem[]> = new Map()
  private registeredPeers: Map<string, RegisteredPeer> = new Map()
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(options: SofttyDropOptions) {
    this.port = options.port || 54321
    this.onFileReceived = options.onFileReceived
    this.ensureSession()
  }

  public getOrCreateSession(): DropSessionPayload {
    const now = Date.now()
    if (!this.currentSession || now >= this.currentSession.expiresAt) {
      this.currentSession = this.createSession()
    }
    return this.currentSession
  }

  public refreshSession(): DropSessionPayload {
    this.currentSession = this.createSession()
    return this.currentSession
  }

  private createSession(): DropSessionPayload {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString()
    const sessionId = `drop-${crypto.randomUUID().slice(0, 8)}`
    const platform = process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'windows' : 'linux'
    let hostname = 'Desktop'
    try {
      hostname = os.hostname()
    } catch {
      // fallback
    }

    const session: DropSessionPayload = {
      version: 2,
      sessionId,
      pin: randomPin,
      deviceName: `${hostname} (Softty Office)`,
      deviceType: platform,
      ips: getLocalIpAddresses(),
      port: this.port,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes TTL
    }

    return session
  }

  private ensureSession(): void {
    if (!this.currentSession) {
      this.currentSession = this.createSession()
    }
  }

  public start(): Promise<number> {
    return new Promise((resolve) => {
      this.server = http.createServer(async (req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Filename, Content-Disposition, X-Target-Pin, X-Sender-Name')

        if (req.method === 'OPTIONS') {
          res.writeHead(204)
          res.end()
          return
        }

        const url = new URL(req.url || '/', `http://127.0.0.1:${this.port}`)
        const pathname = url.pathname

        // Health check / Peer discovery probe
        if (req.method === 'GET' && (pathname === '/' || pathname === '/api/softty-drop/ping' || pathname === '/api/softty-drop/info')) {
          const session = this.getOrCreateSession()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          let appVersion = '1.0.15'
          try {
            appVersion = app.getVersion()
          } catch {
            // fallback
          }
          res.end(
            JSON.stringify({
              app: 'Softty Office Desktop',
              name: session.deviceName,
              version: appVersion,
              ready: true,
              platform: process.platform,
              port: this.port,
              pin: session.pin,
              sessionId: session.sessionId,
              ips: session.ips,
            }),
          )
          return
        }

        // Get current Drop session (includes 6-digit PIN & QR payload)
        if (req.method === 'GET' && pathname === '/api/softty-drop/session') {
          const session = this.getOrCreateSession()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, session }))
          return
        }

        // Refresh Drop session (generate new 6-digit PIN)
        if (req.method === 'POST' && pathname === '/api/softty-drop/session/refresh') {
          const session = this.refreshSession()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, session }))
          return
        }

        // Lookup connection info by 6-digit PIN
        if (req.method === 'GET' && pathname.startsWith('/api/softty-drop/pin/')) {
          const targetPin = pathname.replace('/api/softty-drop/pin/', '').trim()
          const session = this.getOrCreateSession()

          if (targetPin === session.pin) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, found: true, isSelf: true, session }))
            return
          }

          const peer = this.registeredPeers.get(targetPin)
          if (peer && Date.now() - peer.lastSeen < 15 * 60 * 1000) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, found: true, isSelf: false, peer }))
            return
          }

          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, found: false, error: 'Mã PIN không tồn tại hoặc đã hết hạn.' }))
          return
        }

        // Register peer (Mobile registers its PIN & info)
        if (req.method === 'POST' && pathname === '/api/softty-drop/register-peer') {
          const chunks: Buffer[] = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
              if (body && body.pin) {
                const peerInfo: RegisteredPeer = {
                  pin: body.pin,
                  deviceName: body.deviceName || 'Thiết bị di động',
                  deviceType: body.deviceType || 'ios',
                  ip: body.ip || (req.socket.remoteAddress ? req.socket.remoteAddress.replace(/^.*:/, '') : '127.0.0.1'),
                  port: body.port || 54321,
                  lastSeen: Date.now(),
                }
                this.registeredPeers.set(body.pin, peerInfo)
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true, registered: true }))
                return
              }
            } catch {
              // ignore
            }
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: 'Invalid peer data' }))
          })
          return
        }

        // Direct receive file stream on Desktop
        if (req.method === 'POST' && pathname === '/api/softty-drop/receive') {
          try {
            const chunks: Buffer[] = []
            req.on('data', (chunk) => chunks.push(chunk))

            req.on('end', async () => {
              const buffer = Buffer.concat(chunks)
              let saveDir = '/tmp'
              try {
                saveDir = path.join(app.getPath('downloads'), 'Softty Drop')
              } catch {
                saveDir = path.join(os.homedir(), 'Downloads', 'Softty Drop')
              }

              if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true })
              }

              const { fileBuffer, fileName } = extractFilePayload(
                buffer,
                req.headers['content-type'],
                req.headers['content-disposition'],
                req.headers['x-filename'],
              )

              const targetPath = path.join(saveDir, fileName)
              fs.writeFileSync(targetPath, fileBuffer)

              // Open in Softty Office
              const opened = await this.onFileReceived(targetPath, fileName)

              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  success: true,
                  opened,
                  filePath: targetPath,
                  fileName,
                  size: fileBuffer.length,
                  message: `Tài liệu "${fileName}" đã nhận và mở trên Desktop!`,
                }),
              )
            })
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
          return
        }

        // LAN Relay Push: sender pushes file intended for a specific target PIN
        if (req.method === 'POST' && pathname === '/api/softty-drop/relay/push') {
          const rawTargetPin = req.headers['x-target-pin']
          const targetPin = Array.isArray(rawTargetPin) ? rawTargetPin[0] : rawTargetPin

          if (!targetPin) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: 'Missing X-Target-Pin header' }))
            return
          }

          const chunks: Buffer[] = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', async () => {
            const buffer = Buffer.concat(chunks)
            const { fileBuffer, fileName, mimeType } = extractFilePayload(
              buffer,
              req.headers['content-type'],
              req.headers['content-disposition'],
              req.headers['x-filename'],
            )

            // If target is Desktop itself, save directly
            const currentPin = this.getOrCreateSession().pin
            if (targetPin === currentPin) {
              let saveDir = path.join(os.homedir(), 'Downloads', 'Softty Drop')
              try {
                saveDir = path.join(app.getPath('downloads'), 'Softty Drop')
              } catch {
                // fallback
              }
              if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true })
              const targetPath = path.join(saveDir, fileName)
              fs.writeFileSync(targetPath, fileBuffer)
              await this.onFileReceived(targetPath, fileName)

              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true, deliveredDirectly: true, fileName }))
              return
            }

            // Otherwise store in relay box for receiver polling
            const item: RelayItem = {
              id: `relay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              fileName,
              mimeType,
              buffer: fileBuffer,
              size: fileBuffer.length,
              targetPin,
              createdAt: Date.now(),
            }

            if (!this.relayBoxes.has(targetPin)) {
              this.relayBoxes.set(targetPin, [])
            }
            this.relayBoxes.get(targetPin)!.push(item)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, queued: true, relayId: item.id, fileName, size: item.size }))
          })
          return
        }

        // LAN Relay Pull: receiver checks and retrieves queued files
        if (req.method === 'GET' && pathname === '/api/softty-drop/relay/pull') {
          const pin = url.searchParams.get('pin')
          if (!pin) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: 'Missing pin query parameter' }))
            return
          }

          const box = this.relayBoxes.get(pin)
          if (!box || box.length === 0) {
            res.writeHead(204) // No Content
            res.end()
            return
          }

          const nextItem = box.shift()!
          res.writeHead(200, {
            'Content-Type': nextItem.mimeType,
            'Content-Length': nextItem.buffer.length,
            'X-Filename': encodeURIComponent(nextItem.fileName),
            'X-Relay-Id': nextItem.id,
            'Access-Control-Expose-Headers': 'X-Filename, X-Relay-Id',
          })
          res.end(nextItem.buffer)
          return
        }

        res.writeHead(404)
        res.end(JSON.stringify({ error: 'Not found' }))
      })

      // Background cleanup timer: remove relay items older than 10 minutes
      this.cleanupTimer = setInterval(() => {
        const threshold = Date.now() - 10 * 60 * 1000
        for (const [pin, items] of this.relayBoxes.entries()) {
          const remaining = items.filter((i) => i.createdAt > threshold)
          if (remaining.length === 0) {
            this.relayBoxes.delete(pin)
          } else {
            this.relayBoxes.set(pin, remaining)
          }
        }
      }, 60 * 1000)

      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`[softty-drop] Universal Server listening on http://0.0.0.0:${this.port}`)
        resolve(this.port)
      })

      this.server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[softty-drop] Port ${this.port} in use, trying random port...`)
          this.server?.listen(0, '0.0.0.0', () => {
            const addr = this.server?.address()
            const actualPort = typeof addr === 'object' && addr ? addr.port : 54321
            this.port = actualPort
            console.log(`[softty-drop] Server listening on fallback port ${actualPort}`)
            resolve(actualPort)
          })
        } else {
          console.error('[softty-drop] Server error:', err)
        }
      })
    })
  }

  public stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }
}
