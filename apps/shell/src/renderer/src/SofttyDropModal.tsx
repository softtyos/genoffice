import React, { useState, useEffect, useRef } from 'react'
import { generateQrDataUrl } from './qrcodegen'

export interface SofttyDropModalProps {
  isOpen: boolean
  onClose: () => void
  port?: number
}

interface DropSession {
  version: number
  sessionId: string
  pin: string
  deviceName: string
  deviceType: string
  ips: string[]
  port: number
  expiresAt: number
}

interface PeerInfo {
  pin: string
  deviceName: string
  deviceType: string
  ip: string
}

export function SofttyDropModal({ isOpen, onClose, port = 54321 }: SofttyDropModalProps): React.ReactElement | null {
  const [tab, setTab] = useState<'receive' | 'send'>('send')
  const [session, setSession] = useState<DropSession | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')

  // Discovered Peers
  const [peers, setPeers] = useState<PeerInfo[]>([])
  const [selectedPeerPin, setSelectedPeerPin] = useState<string>('')
  const [showManualPin, setShowManualPin] = useState(false)

  // Send state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [manualPin, setManualPin] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch session & active peers
  const fetchSession = async () => {
    try {
      setLoading(true)
      const res = await fetch(`http://127.0.0.1:${port}/api/softty-drop/session`)
      if (res.ok) {
        const data = await res.json()
        if (data.session) {
          setSession(data.session)
          const qrPayload = JSON.stringify({
            type: 'softty-drop',
            v: 2,
            pin: data.session.pin,
            name: data.session.deviceName,
            ips: data.session.ips,
            port: data.session.port,
            sid: data.session.sessionId,
          })
          const url = generateQrDataUrl(qrPayload)
          setQrDataUrl(url)
        }
      }
    } catch {
      setStatusMessage('Không thể kết nối với dịch vụ Softty Drop nội bộ.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPeers = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/softty-drop/peers`)
      if (res.ok) {
        const data = await res.json()
        const peerList: PeerInfo[] = data.peers || []
        setPeers(peerList)
        if (peerList.length > 0 && !selectedPeerPin) {
          setSelectedPeerPin(peerList[0].pin)
        }
      }
    } catch {
      // ignore
    }
  }

  const handleRefreshPin = async () => {
    try {
      setLoading(true)
      const res = await fetch(`http://127.0.0.1:${port}/api/softty-drop/session/refresh`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.session) {
          setSession(data.session)
          const qrPayload = JSON.stringify({
            type: 'softty-drop',
            v: 2,
            pin: data.session.pin,
            name: data.session.deviceName,
            ips: data.session.ips,
            port: data.session.port,
            sid: data.session.sessionId,
          })
          const url = generateQrDataUrl(qrPayload)
          setQrDataUrl(url)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      void fetchSession()
      void fetchPeers()
      const interval = setInterval(fetchPeers, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Handle Send File to Peer (1-Touch or Manual)
  const handleSend = async () => {
    if (!selectedFile) {
      setSendError('Vui lòng chọn một tệp để gửi.')
      return
    }

    const cleanPin = (selectedPeerPin || manualPin).replace(/\s+/g, '').trim()
    if (!cleanPin) {
      setSendError('Chưa chọn thiết bị nhận. Hãy mở app trên điện thoại hoặc nhập mã kết nối.')
      return
    }

    try {
      setSending(true)
      setProgress(0.2)
      setSendError(null)
      setSendSuccess(null)

      let targetUrl = `http://127.0.0.1:${port}/api/softty-drop/relay/push`
      const headers: Record<string, string> = {
        'Content-Type': selectedFile.type || 'application/octet-stream',
        'X-Filename': encodeURIComponent(selectedFile.name),
        'X-Target-Pin': cleanPin,
      }

      setProgress(0.5)

      const buffer = await selectedFile.arrayBuffer()
      const sendRes = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: buffer,
      })

      setProgress(1.0)

      if (sendRes.ok) {
        const selectedPeer = peers.find((p) => p.pin === cleanPin)
        const peerName = selectedPeer ? selectedPeer.deviceName : `Thiết bị #${cleanPin}`
        setSendSuccess(`🎉 Đã bắn thành công tệp "${selectedFile.name}" sang ${peerName}!`)
        setSelectedFile(null)
      } else {
        const errJson = await sendRes.json().catch(() => ({}))
        setSendError(errJson.error || 'Gửi tệp không thành công. Hãy đảm bảo điện thoại đang mở app.')
      }
    } catch (err: any) {
      setSendError(err.message || 'Lỗi mạng khi truyền tệp.')
    } finally {
      setSending(false)
      setTimeout(() => setProgress(0), 1800)
    }
  }

  if (!isOpen) return null

  return (
    <div className="softty-drop-modal-backdrop" onClick={onClose}>
      <div className="softty-drop-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drop-modal-header">
          <div className="drop-header-title">
            <span className="drop-header-icon">📡</span>
            <div>
              <h3>Softty Drop 2.0 (1-Chạm Không Cần Gõ PIN)</h3>
              <p>Chuyển tệp tức thì giữa Máy tính & Điện thoại trong mạng Wi-Fi</p>
            </div>
          </div>
          <button className="drop-close-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="drop-tabs">
          <button
            className={`drop-tab ${tab === 'send' ? 'active' : ''}`}
            onClick={() => setTab('send')}
          >
            📤 Gửi tệp sang Điện thoại (1-Chạm)
          </button>
          <button
            className={`drop-tab ${tab === 'receive' ? 'active' : ''}`}
            onClick={() => setTab('receive')}
          >
            📥 Nhận tệp trên Máy tính
          </button>
        </div>

        {/* Tab Body: Send */}
        {tab === 'send' && (
          <div className="drop-body-send">
            {/* Target Device Selector: 1-Touch AirDrop Style */}
            <div className="drop-target-section">
              <span className="drop-input-label">THIẾT BỊ NHẬN (TỰ ĐỘNG PHÁT HIỆN):</span>
              <div className="drop-peer-list">
                {peers.length > 0 ? (
                  peers.map((p) => {
                    const isSelected = selectedPeerPin === p.pin
                    return (
                      <div
                        key={p.pin}
                        className={`drop-peer-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedPeerPin(p.pin)
                          setShowManualPin(false)
                        }}
                      >
                        <div className="drop-peer-avatar">📱</div>
                        <div className="drop-peer-info">
                          <span className="drop-peer-name">{p.deviceName}</span>
                          <span className="drop-peer-status">🟢 Đang online • Sẵn sàng 1-chạm</span>
                        </div>
                        {isSelected && <span className="drop-peer-check">✓ Đã chọn</span>}
                      </div>
                    )
                  })
                ) : (
                  <div className="drop-peer-empty">
                    <span>📡 Đang quét thiết bị trong phòng... (Mở app Softty Office trên điện thoại)</span>
                  </div>
                )}
              </div>

              {/* Toggle manual PIN input if needed */}
              <div className="drop-manual-toggle">
                <button
                  type="button"
                  className="drop-link-btn"
                  onClick={() => setShowManualPin(!showManualPin)}
                >
                  {showManualPin ? 'Ẩn nhập mã kết nối thủ công' : 'Hoặc nhập mã kết nối thủ công (nếu không cùng Wi-Fi)'}
                </button>
              </div>

              {showManualPin && (
                <div className="drop-pin-input-row" style={{ marginTop: 8 }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={manualPin}
                    onChange={(e) => {
                      setManualPin(e.target.value.replace(/\D/g, ''))
                      setSelectedPeerPin('')
                    }}
                    placeholder="VD: 360507"
                    className="drop-pin-input"
                  />
                </div>
              )}
            </div>

            {/* File dropzone */}
            <div
              className={`drop-file-dropzone ${selectedFile ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0])
                    setSendError(null)
                  }
                }}
              />
              <span className="drop-dropzone-icon">{selectedFile ? '📄' : '📁'}</span>
              {selectedFile ? (
                <div className="drop-file-info">
                  <span className="drop-file-name">{selectedFile.name}</span>
                  <span className="drop-file-size">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Bấm để chọn tệp khác
                  </span>
                </div>
              ) : (
                <div className="drop-file-placeholder">
                  <span>Kéo thả tệp vào đây hoặc bấm để chọn</span>
                  <span className="drop-file-types">PDF, Word, Excel, PowerPoint, Ảnh, Text...</span>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              className="drop-send-submit-btn"
              onClick={handleSend}
              disabled={sending || !selectedFile || (!selectedPeerPin && manualPin.length !== 6)}
            >
              {sending ? 'Đang bắn tệp...' : '🚀 Bắn tệp sang Điện thoại ngay (1-Chạm)'}
            </button>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="drop-progress-container">
                <div className="drop-progress-bar" style={{ width: `${progress * 100}%` }} />
              </div>
            )}

            {/* Alerts */}
            {sendSuccess && <div className="drop-alert-success">{sendSuccess}</div>}
            {sendError && <div className="drop-alert-error">{sendError}</div>}
          </div>
        )}

        {/* Tab Body: Receive */}
        {tab === 'receive' && (
          <div className="drop-body-receive">
            <div className="drop-qr-card">
              {loading ? (
                <div className="drop-loading-box">
                  <div className="drop-spinner" />
                  <span>Đang khởi tạo mã kết nối...</span>
                </div>
              ) : qrDataUrl ? (
                <div className="drop-qr-wrapper">
                  <img src={qrDataUrl} alt="Mã QR kết nối Softty Drop" className="drop-qr-img" />
                  <span className="drop-qr-sub">Lia camera điện thoại vào đây để bắn file sang</span>
                </div>
              ) : (
                <div className="drop-error-box">{statusMessage || 'Không thể tạo mã QR.'}</div>
              )}

              <div className="drop-pin-box">
                <span className="drop-pin-label">TỰ ĐỘNG NHẬN DIỆN MÁY TÍNH</span>
                <div className="drop-pin-digits">
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                    🟢 Máy tính sẵn sàng nhận file trực tiếp
                  </span>
                </div>
                <button className="drop-refresh-btn" onClick={handleRefreshPin} disabled={loading}>
                  🔄 Làm mới phiên nhận
                </button>
              </div>
            </div>

            <div className="drop-tips-box">
              <div className="drop-tip-item">
                <span className="tip-badge">1</span>
                <span>Mở app <strong>Softty Office</strong> trên điện thoại</span>
              </div>
              <div className="drop-tip-item">
                <span className="tip-badge">2</span>
                <span>Vào tab <strong>Drop</strong> ➔ Bấm <strong>"Chọn tệp & Bắn sang Máy tính"</strong></span>
              </div>
              <div className="drop-tip-item">
                <span className="tip-badge">3</span>
                <span>Tệp sẽ tự động lưu vào <strong>Downloads/Softty Office</strong> và mở ngay!</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .softty-drop-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: dropFadeIn 0.2s ease-out;
        }
        .softty-drop-modal {
          background: var(--home-bg, #ffffff);
          color: var(--home-text, #0f172a);
          width: 580px;
          max-width: 92vw;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--home-border, #e2e8f0);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .drop-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--home-border, #e2e8f0);
          background: var(--home-surface, #f8fafc);
        }
        .drop-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .drop-header-icon {
          font-size: 28px;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(37, 99, 235, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drop-header-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }
        .drop-header-title p {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #64748b;
        }
        .drop-close-btn {
          background: transparent;
          border: none;
          font-size: 16px;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
        }
        .drop-close-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #0f172a;
        }
        .drop-tabs {
          display: flex;
          border-bottom: 1px solid var(--home-border, #e2e8f0);
          background: var(--home-surface, #f8fafc);
        }
        .drop-tab {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .drop-tab.active {
          color: #2563eb;
          border-bottom-color: #2563eb;
          background: var(--home-bg, #ffffff);
        }
        .drop-body-receive, .drop-body-send {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .drop-target-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .drop-peer-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .drop-peer-card {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          gap: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .drop-peer-card:hover {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.02);
        }
        .drop-peer-card.selected {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.06);
          box-shadow: 0 0 0 1px #2563eb;
        }
        .drop-peer-avatar {
          font-size: 24px;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drop-peer-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .drop-peer-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .drop-peer-status {
          font-size: 11px;
          color: #10b981;
          margin-top: 2px;
        }
        .drop-peer-check {
          color: #2563eb;
          font-weight: 700;
          font-size: 13px;
        }
        .drop-peer-empty {
          padding: 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px dashed #cbd5e1;
          font-size: 12px;
          color: #64748b;
          text-align: center;
        }
        .drop-manual-toggle {
          margin-top: 2px;
        }
        .drop-link-btn {
          background: transparent;
          border: none;
          color: #2563eb;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .drop-qr-card {
          display: flex;
          gap: 24px;
          align-items: center;
          padding: 20px;
          background: var(--home-surface, #f8fafc);
          border-radius: 12px;
          border: 1px solid var(--home-border, #e2e8f0);
        }
        .drop-qr-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .drop-qr-img {
          width: 170px;
          height: 170px;
          border-radius: 8px;
          background: #ffffff;
          padding: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .drop-qr-sub {
          font-size: 11px;
          color: #64748b;
          text-align: center;
        }
        .drop-pin-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .drop-pin-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #64748b;
        }
        .drop-refresh-btn {
          padding: 8px 16px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          border-radius: 6px;
          font-size: 12px;
          color: #475569;
          cursor: pointer;
        }
        .drop-refresh-btn:hover {
          background: #f1f5f9;
        }
        .drop-tips-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px;
          background: rgba(37, 99, 235, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(37, 99, 235, 0.15);
        }
        .drop-tip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #334155;
        }
        .tip-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .drop-file-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          background: var(--home-surface, #f8fafc);
          transition: all 0.15s ease;
        }
        .drop-file-dropzone:hover {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.03);
        }
        .drop-file-dropzone.has-file {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        .drop-dropzone-icon {
          font-size: 32px;
        }
        .drop-file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .drop-file-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .drop-file-size {
          font-size: 11px;
          color: #64748b;
        }
        .drop-file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .drop-file-types {
          font-size: 11px;
          color: #94a3b8;
          font-weight: normal;
        }
        .drop-input-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #475569;
        }
        .drop-pin-input-row {
          display: flex;
          gap: 12px;
        }
        .drop-pin-input {
          flex: 1;
          padding: 10px 14px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 3px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          color: #0f172a;
        }
        .drop-send-submit-btn {
          padding: 14px 20px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .drop-send-submit-btn:hover:not(:disabled) {
          background: #1d4ed8;
        }
        .drop-send-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .drop-progress-container {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        .drop-progress-bar {
          height: 100%;
          background: #2563eb;
          transition: width 0.2s ease;
        }
        .drop-alert-success {
          padding: 12px;
          background: #dcfce7;
          border: 1px solid #86efac;
          color: #166534;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .drop-alert-error {
          padding: 12px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #991b1b;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        @keyframes dropFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
