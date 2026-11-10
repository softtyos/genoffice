import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

console.log('='.repeat(70));
console.log('🚀 SOFTTY DROP 2.0 LOCAL LAN HUB (RUNNING ON PORT 54321)');
console.log('='.repeat(70));

const PORT = 54321;
let currentSession = {
  version: 2,
  sessionId: `drop-${crypto.randomUUID().slice(0, 8)}`,
  pin: '749218',
  deviceName: `${os.hostname()} (Softty Office Desktop)`,
  deviceType: 'mac',
  ips: ['192.168.88.175', '127.0.0.1'],
  port: PORT,
  createdAt: Date.now(),
  expiresAt: Date.now() + 60 * 60 * 1000,
};

const relayBoxes = new Map();
const registeredPeers = new Map();

function extractFilePayload(buffer, contentTypeHeader, contentDispositionHeader, xFilenameHeader) {
  let fileName = '';
  let mimeType = 'application/octet-stream';

  if (xFilenameHeader) {
    try {
      fileName = decodeURIComponent(Array.isArray(xFilenameHeader) ? xFilenameHeader[0] : xFilenameHeader);
    } catch {
      fileName = Array.isArray(xFilenameHeader) ? xFilenameHeader[0] : xFilenameHeader;
    }
  }

  if (contentTypeHeader && contentTypeHeader.includes('multipart/form-data')) {
    const headerEndIndex = buffer.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEndIndex !== -1) {
      const headerPart = buffer.subarray(0, headerEndIndex).toString('utf-8');
      if (!fileName) {
        const match = /filename="?([^";\r\n]+)"?/i.exec(headerPart);
        if (match?.[1]) fileName = path.basename(match[1]);
      }
      const boundaryMatch = /boundary=([^\s;]+)/i.exec(contentTypeHeader);
      const boundary = boundaryMatch ? boundaryMatch[1].trim() : '';
      const binaryStart = headerEndIndex + 4;
      let binaryEnd = buffer.length;
      if (boundary) {
        const found = buffer.indexOf(Buffer.from(`\r\n--${boundary}`), binaryStart);
        if (found !== -1) binaryEnd = found;
      }
      return { fileBuffer: buffer.subarray(binaryStart, binaryEnd), fileName: fileName || `SofttyDrop_${Date.now()}.pdf`, mimeType };
    }
  }

  if (!fileName) fileName = `SofttyDrop_${Date.now()}.pdf`;
  return { fileBuffer: buffer, fileName, mimeType };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Filename, Content-Disposition, X-Target-Pin, X-Sender-Name');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://0.0.0.0:${PORT}`);

  // Ping
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/api/softty-drop/ping')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      app: 'Softty Office Desktop',
      name: currentSession.deviceName,
      version: '1.0.16',
      ready: true,
      pin: currentSession.pin,
      port: PORT,
    }));
    return;
  }

  // Session
  if (req.method === 'GET' && url.pathname === '/api/softty-drop/session') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, session: currentSession }));
    return;
  }

  // Refresh PIN
  if (req.method === 'POST' && url.pathname === '/api/softty-drop/session/refresh') {
    currentSession.pin = Math.floor(100000 + Math.random() * 900000).toString();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, session: currentSession }));
    return;
  }

  // Lookup PIN
  if (req.method === 'GET' && url.pathname.startsWith('/api/softty-drop/pin/')) {
    const pin = url.pathname.replace('/api/softty-drop/pin/', '').trim();
    if (pin === currentSession.pin) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, found: true, isSelf: true, session: currentSession }));
      return;
    }
    const peer = registeredPeers.get(pin);
    if (peer) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, found: true, isSelf: false, peer }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, found: false }));
    return;
  }

  // Register Peer
  if (req.method === 'POST' && url.pathname === '/api/softty-drop/register-peer') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
        registeredPeers.set(body.pin, body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch {
        res.writeHead(400);
        res.end();
      }
    });
    return;
  }

  // List active peers
  if (req.method === 'GET' && url.pathname === '/api/softty-drop/peers') {
    const activePeers = Array.from(registeredPeers.values());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, peers: activePeers }));
    return;
  }

  // Direct receive on Desktop
  if (req.method === 'POST' && url.pathname === '/api/softty-drop/receive') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const { fileBuffer, fileName } = extractFilePayload(
        buffer,
        req.headers['content-type'],
        req.headers['content-disposition'],
        req.headers['x-filename'],
      );

      const saveDir = path.join(os.homedir(), 'Downloads', 'Softty Office');
      if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
      const targetPath = path.join(saveDir, fileName);
      fs.writeFileSync(targetPath, fileBuffer);
      console.log(`[SofttyDropHub] 📥 Đã nhận và lưu file vào: ${targetPath} (${fileBuffer.length} bytes)`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        opened: true,
        filePath: targetPath,
        fileName,
        message: `Tài liệu "${fileName}" đã nhận và lưu vào Downloads/Softty Office!`,
      }));
    });
    return;
  }

  // Relay Push
  if (req.method === 'POST' && url.pathname === '/api/softty-drop/relay/push') {
    const targetPin = req.headers['x-target-pin'];
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const { fileBuffer, fileName, mimeType } = extractFilePayload(
        buffer,
        req.headers['content-type'],
        req.headers['content-disposition'],
        req.headers['x-filename'],
      );

      console.log(`[SofttyDropHub] 🚀 Relay push cho target PIN [ ${targetPin} ]: ${fileName} (${fileBuffer.length} bytes)`);

      // If target is Desktop itself, save directly
      if (targetPin === currentSession.pin) {
        const saveDir = path.join(os.homedir(), 'Downloads', 'Softty Office');
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
        const targetPath = path.join(saveDir, fileName);
        fs.writeFileSync(targetPath, fileBuffer);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, deliveredDirectly: true, fileName }));
        return;
      }

      if (!relayBoxes.has(targetPin)) relayBoxes.set(targetPin, []);
      relayBoxes.get(targetPin).push({ fileName, buffer: fileBuffer, mimeType, createdAt: Date.now() });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, queued: true, fileName, size: fileBuffer.length }));
    });
    return;
  }

  // Relay Pull
  if (req.method === 'GET' && url.pathname === '/api/softty-drop/relay/pull') {
    const pin = url.searchParams.get('pin');
    const box = relayBoxes.get(pin);
    if (!box || box.length === 0) {
      res.writeHead(204);
      res.end();
      return;
    }
    const item = box.shift();
    console.log(`[SofttyDropHub] 📤 Relay pull thành công cho PIN [ ${pin} ]: ${item.fileName} (${item.buffer.length} bytes)`);
    res.writeHead(200, {
      'Content-Type': item.mimeType || 'application/octet-stream',
      'X-Filename': encodeURIComponent(item.fileName),
      'Content-Length': item.buffer.length,
      'Access-Control-Expose-Headers': 'X-Filename',
    });
    res.end(item.buffer);
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SofttyDropHub] Lắng nghe trên http://0.0.0.0:${PORT}`);
  console.log(`[SofttyDropHub] Mã PIN Desktop: ${currentSession.pin}`);
});
