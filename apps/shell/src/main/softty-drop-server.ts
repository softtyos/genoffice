/**
 * Softty Drop Local LAN Receiver Server
 * Listens on port 54321 for files dropped from Mobile Companion App
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { app } from 'electron'

export interface SofttyDropOptions {
  port?: number
  onFileReceived: (filePath: string, fileName: string) => boolean | Promise<boolean>
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
): { fileBuffer: Buffer; fileName: string } {
  let fileName = ''

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
      return { fileBuffer, fileName: fileName || `SofttyDrop_${Date.now()}` }
    }
  }

  // Direct binary stream
  if (!fileName && contentDispositionHeader) {
    const match = /filename="?([^";\r\n]+)"?/i.exec(contentDispositionHeader)
    if (match?.[1]) fileName = path.basename(match[1])
  }

  if (!fileName) {
    fileName = `SofttyDrop_${Date.now()}`
    if (buffer.subarray(0, 4).toString() === '%PDF') {
      fileName += '.pdf'
    } else if (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    ) {
      fileName += '.docx'
    }
  }

  return { fileBuffer: buffer, fileName }
}

export class SofttyDropServer {
  private server: http.Server | null = null
  private port: number
  private onFileReceived: (filePath: string, fileName: string) => boolean | Promise<boolean>

  constructor(options: SofttyDropOptions) {
    this.port = options.port || 54321
    this.onFileReceived = options.onFileReceived
  }

  public start(): Promise<number> {
    return new Promise((resolve) => {
      this.server = http.createServer(async (req, res) => {
        // Enable CORS for mobile devices on LAN
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Filename, Content-Disposition')

        if (req.method === 'OPTIONS') {
          res.writeHead(204)
          res.end()
          return
        }

        // Health check / Peer discovery probe
        if (req.method === 'GET' && (req.url === '/' || req.url === '/api/softty-drop/ping' || req.url === '/api/softty-drop/info')) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              app: 'Softty Office Desktop',
              name: `${os.hostname()} (Softty Office)`,
              version: app.getVersion(),
              ready: true,
              platform: process.platform,
              port: this.port,
              ips: getLocalIpAddresses(),
            }),
          )
          return
        }

        // Receive file from Mobile
        if (req.method === 'POST' && req.url === '/api/softty-drop/receive') {
          try {
            const chunks: Buffer[] = []
            req.on('data', (chunk) => chunks.push(chunk))

            req.on('end', async () => {
              const buffer = Buffer.concat(chunks)
              const saveDir = path.join(app.getPath('downloads'), 'Softty Drop')
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

        res.writeHead(404)
        res.end()
      })

      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`[softty-drop] Server listening on http://0.0.0.0:${this.port}`)
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
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }
}
