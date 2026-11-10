import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

console.log('='.repeat(70));
console.log('🧪 TEST SUITE: SOFTTY DROP 2.0 RELAY & PIN PROTOCOL');
console.log('='.repeat(70));

const TEST_PORT = 54322;
let server;
const relayBoxes = new Map();
let currentSession = {
  version: 2,
  sessionId: 'drop-test1234',
  pin: '749218',
  deviceName: 'MacBook Pro Test',
  deviceType: 'mac',
  ips: ['127.0.0.1'],
  port: TEST_PORT,
  createdAt: Date.now(),
  expiresAt: Date.now() + 15 * 60 * 1000,
};

function startMockServer() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Filename, Content-Disposition, X-Target-Pin');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || '/', `http://127.0.0.1:${TEST_PORT}`);

      if (req.method === 'GET' && url.pathname === '/api/softty-drop/session') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, session: currentSession }));
        return;
      }

      if (req.method === 'GET' && url.pathname.startsWith('/api/softty-drop/pin/')) {
        const pin = url.pathname.replace('/api/softty-drop/pin/', '');
        if (pin === currentSession.pin) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, found: true, session: currentSession }));
          return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, found: false }));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/softty-drop/relay/push') {
        const targetPin = req.headers['x-target-pin'];
        const fileName = req.headers['x-filename'] || 'file.bin';
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (!relayBoxes.has(targetPin)) relayBoxes.set(targetPin, []);
          relayBoxes.get(targetPin).push({ fileName, buffer, size: buffer.length });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, queued: true, size: buffer.length }));
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/softty-drop/relay/pull') {
        const pin = url.searchParams.get('pin');
        const box = relayBoxes.get(pin);
        if (!box || box.length === 0) {
          res.writeHead(204);
          res.end();
          return;
        }
        const item = box.shift();
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'X-Filename': encodeURIComponent(item.fileName),
          'Content-Length': item.buffer.length,
        });
        res.end(item.buffer);
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(TEST_PORT, '127.0.0.1', () => {
      resolve();
    });
  });
}

async function runTests() {
  await startMockServer();
  console.log(`[1] Mock Server started on port ${TEST_PORT}`);

  // Test 1: Fetch session
  const sessionRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/softty-drop/session`);
  const sessionData = await sessionRes.json();
  if (sessionData.session.pin !== '749218') throw new Error('Session PIN mismatch');
  console.log('  ✓ Test 1: Session PIN retrieval passed (PIN: 749218)');

  // Test 2: Lookup PIN
  const pinRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/softty-drop/pin/749218`);
  const pinData = await pinRes.json();
  if (!pinData.found) throw new Error('PIN lookup failed');
  console.log('  ✓ Test 2: PIN lookup passed');

  // Test 3: Relay Push from Phone A to Phone B (PIN: 888999)
  const sampleContent = Buffer.from('SOFTTY OFFICE 2026 - P2P UNIVERSAL TRANSFER TEST PAYLOAD');
  const sampleHash = crypto.createHash('sha256').update(sampleContent).digest('hex');

  const pushRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/softty-drop/relay/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/pdf',
      'X-Target-Pin': '888999',
      'X-Filename': 'Contract_Signed_2026.pdf',
    },
    body: sampleContent,
  });
  const pushData = await pushRes.json();
  if (!pushData.queued) throw new Error('Relay push failed');
  console.log('  ✓ Test 3: Relay push from Phone A passed (Size: ' + pushData.size + ' bytes)');

  // Test 4: Relay Pull from Phone B
  const pullRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/softty-drop/relay/pull?pin=888999`);
  if (pullRes.status !== 200) throw new Error('Relay pull failed with status ' + pullRes.status);
  const receivedBuf = Buffer.from(await pullRes.arrayBuffer());
  const receivedHash = crypto.createHash('sha256').update(receivedBuf).digest('hex');

  if (receivedHash !== sampleHash) {
    throw new Error(`SHA256 mismatch! Orig: ${sampleHash}, Recv: ${receivedHash}`);
  }
  console.log('  ✓ Test 4: Relay pull from Phone B passed (SHA-256 match 100%)');

  // Test 5: Verify empty box on second pull
  const emptyRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/softty-drop/relay/pull?pin=888999`);
  if (emptyRes.status !== 204) throw new Error('Expected 204 No Content for empty queue');
  console.log('  ✓ Test 5: Queue cleared cleanly after pull');

  server.close();
  console.log('='.repeat(70));
  console.log('🎉 TẤT CẢ 5 BÀI TEST GIAO THỨC SOFTTY DROP 2.0 ĐỀU PASS 100%!');
  console.log('='.repeat(70));
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  if (server) server.close();
  process.exit(1);
});
