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

export function SofttyDropModal({ isOpen, onClose, port = 54321 }: SofttyDropModalProps): React.ReactElement | null {
  const [tab, setTab] = useState<'receive' | 'send'>('receive')
  const [session, setSession] = useState<DropSession | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')

  // Send state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetPin, setTargetPin] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch or refresh session
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
    }
  }, [isOpen])

  // Handle Send File to Peer via PIN
  const handleSend = async () => {
    if (!selectedFile) {
      setSendError('Vui lòng chọn một tệp để gửi.')
      return
    }
    const cleanPin = targetPin.replace(/\s+/g, '').trim()
    if (!cleanPin || cleanPin.length !== 6) {
      setSendError('Vui lòng nhập đúng mã PIN 6 số của thiết bị nhận.')
      return
    }

    try {
      setSending(true)
      setProgress(0.2)
      setSendError(null)
      setSendSuccess(null)

      // 1. Kiểm tra mã PIN qua Relay Hub nội bộ
      const pinRes = await fetch(`http://127.0.0.1:${port}/api/softty-drop/pin/${cleanPin}`)
      const pinData = pinRes.ok ? await pinRes.json() : null

      setProgress(0.4)

      let targetUrl = `http://127.0.0.1:${port}/api/softty-drop/relay/push`
      const headers: Record<string, string> = {
        'Content-Type': selectedFile.type || 'application/octet-stream',
        'X-Filename': encodeURIComponent(selectedFile.name),
        'X-Target-Pin': cleanPin,
      }

      // Nếu tìm thấy IP direct LAN của peer
      if (pinData && pinData.peer && pinData.peer.ip && pinData.peer.port) {
        targetUrl = `http://${pinData.peer.ip}:${pinData.peer.port}/api/softty-drop/receive`
      }

      setProgress(0.6)

      const buffer = await selectedFile.arrayBuffer()
      const sendRes = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: buffer,
      })

      setProgress(1.0)

      if (sendRes.ok) {
        setSendSuccess(`Đã gửi thành công tệp "${selectedFile.name}" sang thiết bị (PIN: ${cleanPin})!`)
        setSelectedFile(null)
        setTargetPin('')
      } else {
        const errJson = await sendRes.json().catch(() => ({}))
        setSendError(errJson.error || 'Gửi tệp không thành công. Hãy đảm bảo thiết bị nhận đang mở app.')
      }
    } catch (err: any) {
      setSendError(err.message || 'Lỗi mạng khi truyền tệp.')
    } finally {
      setSending(false)
      setTimeout(() => setProgress(0), 1500)
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
              <h3>Softty Drop 2.0</h3>
              <p>Chuyển tệp đa chiều tức thời giữa Máy tính & Điện thoại</p>
            </div>
          </div>
          <button className="drop-close-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="drop-tabs">
          <button
            className={`drop-tab ${tab === 'receive' ? 'active' : ''}`}
            onClick={() => setTab('receive')}
          >
            📥 Nhận tệp trên Máy tính
          </button>
          <button
            className={`drop-tab ${tab === 'send' ? 'active' : ''}`}
            onClick={() => setTab('send')}
          >
            📤 Gửi tệp sang Thiết bị khác
          </button>
        </div>

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
                  <span className="drop-qr-sub">Dùng Camera hoặc App Softty Office quét mã này</span>
                </div>
              ) : (
                <div className="drop-error-box">{statusMessage || 'Không thể tạo mã QR.'}</div>
              )}

              <div className="drop-pin-box">
                <span className="drop-pin-label">HOẶC NHẬP MÃ PIN 6 SỐ</span>
                <div className="drop-pin-digits">
                  {session?.pin ? (
                    session.pin.split('').map((d, i) => (
                      <span key={i} className="drop-digit-cell">
                        {d}
                      </span>
                    ))
                  ) : (
                    <span>------</span>
                  )}
                </div>
                <button className="drop-refresh-btn" onClick={handleRefreshPin} disabled={loading}>
                  🔄 Đổi mã PIN mới
                </button>
              </div>
            </div>

            <div className="drop-tips-box">
              <div className="drop-tip-item">
                <span className="tip-badge">1</span>
                <span>Mở app <strong>Softty Office</strong> trên điện thoại (iOS / Android)</span>
              </div>
              <div className="drop-tip-item">
                <span className="tip-badge">2</span>
                <span>Vào tab <strong>Softty Drop</strong> ➔ Quét mã QR hoặc gõ mã PIN ở trên</span>
              </div>
              <div className="drop-tip-item">
                <span className="tip-badge">3</span>
                <span>Tệp sẽ tự động chuyển sang máy tính và mở ngay lập tức!</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Body: Send */}
        {tab === 'send' && (
          <div className="drop-body-send">
            {/* File picker */}
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
                  <span>Kéo thả tệp vào đây hoặc bấm để chọn từ máy tính</span>
                  <span className="drop-file-types">Hỗ trợ PDF, Word, Excel, PowerPoint, Ảnh, Text...</span>
                </div>
              )}
            </div>

            {/* Target PIN input */}
            <div className="drop-target-section">
              <label className="drop-input-label">MÃ PIN 6 SỐ CỦA THIẾT BỊ NHẬN:</label>
              <div className="drop-pin-input-row">
                <input
                  type="text"
                  maxLength={6}
                  value={targetPin}
                  onChange={(e) => setTargetPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="VD: 749218"
                  className="drop-pin-input"
                />
                <button
                  className="drop-send-submit-btn"
                  onClick={handleSend}
                  disabled={sending || !selectedFile || targetPin.length !== 6}
                >
                  {sending ? 'Đang gửi...' : '🚀 Bắn tệp ngay'}
                </button>
              </div>
            </div>

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
          width: 560px;
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
          font-size: 17px;
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
          gap: 20px;
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
          letter-spacing: 1px;
          color: #64748b;
        }
        .drop-pin-digits {
          display: flex;
          gap: 6px;
        }
        .drop-digit-cell {
          width: 36px;
          height: 48px;
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 800;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .drop-refresh-btn {
          padding: 6px 14px;
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
          padding: 32px 20px;
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
          font-size: 40px;
        }
        .drop-file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .drop-file-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        .drop-file-size {
          font-size: 12px;
          color: #64748b;
        }
        .drop-file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }
        .drop-file-types {
          font-size: 11px;
          color: #94a3b8;
          font-weight: normal;
        }
        .drop-target-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .drop-input-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .drop-pin-input-row {
          display: flex;
          gap: 12px;
        }
        .drop-pin-input {
          flex: 1;
          padding: 12px 16px;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 4px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          color: #0f172a;
        }
        .drop-pin-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .drop-send-submit-btn {
          padding: 0 24px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
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
