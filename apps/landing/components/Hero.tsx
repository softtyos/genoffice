'use client'

import React, { useEffect, useState } from 'react'
import { Download, Apple, Monitor, Smartphone, ArrowRight, Zap, Shield, FileText } from 'lucide-react'

export function Hero() {
  const [os, setOs] = useState<'mac' | 'win' | 'linux'>('mac')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase()
      if (ua.includes('win')) setOs('win')
      else if (ua.includes('linux')) setOs('linux')
      else setOs('mac')
    }
  }, [])

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-medium mb-8">
          <Zap className="w-4 h-4 text-[#06b6d4]" />
          <span>Softty Office v1.0 — 6-trong-1 Trợ Lý Văn Phòng AI & Softty Drop</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Bộ Ứng Dụng Văn Phòng AI{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-cyan-300">
            Ngoại Tuyến, Siêu Tốc & Bảo Mật
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Đầy đủ <strong>Docs, Sheets, Slides, PDF, Markdown & HTML</strong>. Xử lý bảng tính triệu dòng với Rust Engine, kết nối trực tiếp AI, chia sẻ file 1-chạm <strong>Softty Drop</strong> và quét tài liệu từ điện thoại sang máy tính.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#2563eb] to-[#06b6d4] hover:from-[#1d4ed8] hover:to-[#0891b2] shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all text-base transform hover:-translate-y-0.5"
          >
            {os === 'mac' && <Apple className="w-5 h-5" />}
            {os === 'win' && <Monitor className="w-5 h-5" />}
            {os === 'linux' && <Monitor className="w-5 h-5" />}
            <span>Tải Cho {os === 'mac' ? 'macOS (Apple Silicon & Intel)' : os === 'win' ? 'Windows (x64)' : 'Linux'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>

          <a
            href="#softty-drop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium text-slate-200 bg-[#1e293b]/80 hover:bg-[#1e293b] border border-slate-700/60 transition-all text-base"
          >
            <Smartphone className="w-4 h-4 text-[#06b6d4]" />
            <span>Khám phá Softty Drop Mobile</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>100% Offline-First, Dữ Liệu Cục Bộ</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#06b6d4]" />
            <span>Rust Engine Triệu Dòng Bảng Tính</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Tương Thích Tuyệt Đối Microsoft Office</span>
          </div>
        </div>

        {/* Hero Interactive Mockup */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-slate-700/50 to-slate-800/20 shadow-2xl border border-slate-700/60">
          <div className="rounded-xl overflow-hidden bg-[#131b2e] border border-slate-800 text-left">
            {/* Window Title Bar */}
            <div className="h-10 bg-[#0e1322] border-b border-slate-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Softty Office — Toàn bộ tài liệu sẵn sàng
              </div>
              <div className="w-12" />
            </div>

            {/* App Preview Grid */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#0e1322] border border-blue-900/40 hover:border-blue-500/50 transition-colors">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">DOCS</span>
                <h4 className="mt-2 text-sm font-medium text-white">Soạn thảo & Trợ lý AI</h4>
                <p className="mt-1 text-xs text-slate-400">Tóm tắt, viết lại, xuất file DOCX chuẩn quốc tế.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#0e1322] border border-cyan-900/40 hover:border-cyan-500/50 transition-colors">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-[#06b6d4]">SHEETS</span>
                <h4 className="mt-2 text-sm font-medium text-white">Bảng tính Rust 1,000,000+</h4>
                <p className="mt-1 text-xs text-slate-400">Mở file nặng trong 0.8 giây, công thức & biểu đồ mượt mà.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#0e1322] border border-amber-900/40 hover:border-amber-500/50 transition-colors">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">SLIDES</span>
                <h4 className="mt-2 text-sm font-medium text-white">Thuyết trình Tự Động</h4>
                <p className="mt-1 text-xs text-slate-400">Tạo slide đẹp mắt từ tài liệu hoặc phác thảo đề cương.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#0e1322] border border-red-900/40 hover:border-red-500/50 transition-colors">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-400">PDF</span>
                <h4 className="mt-2 text-sm font-medium text-white">Ký số & Trích xuất OCR</h4>
                <p className="mt-1 text-xs text-slate-400">Xem, chỉnh sửa, ký tên và trích xuất bảng biểu bằng AI.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#0e1322] border border-slate-700/60 hover:border-slate-500 transition-colors">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">MARKDOWN</span>
                <h4 className="mt-2 text-sm font-medium text-white">Kỹ thuật & Toán học</h4>
                <p className="mt-1 text-xs text-slate-400">Hỗ trợ KaTeX, Mermaid diagrams, live preview đồng thời.</p>
              </div>

              <div className="p-4 rounded-lg bg-[#0e1322] border border-emerald-900/40 hover:border-emerald-500/50 transition-colors">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">SOFTTY DROP</span>
                <h4 className="mt-2 text-sm font-medium text-white">Bắn File 1-Chạm</h4>
                <p className="mt-1 text-xs text-slate-400">Kết nối tức thì điện thoại và máy tính qua Wi-Fi nội bộ.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
