'use client'

import React from 'react'
import { Download, Sparkles, ExternalLink } from 'lucide-react'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e1322]/90 backdrop-blur-md border-b border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Softty <span className="text-[#06b6d4]">Office</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#apps" className="hover:text-white transition-colors">
            6 Ứng Dụng
          </a>
          <a href="#softty-drop" className="hover:text-white transition-colors">
            Softty Drop
          </a>
          <a href="#scanner" className="hover:text-white transition-colors">
            Mobile Scanner
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Bảo Mật
          </a>
          <a href="#download" className="hover:text-white transition-colors">
            Tải Về
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://accounts.softty.net"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            Đăng Nhập
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
          <a
            href="#download"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-600/50"
          >
            <Download className="w-4 h-4" />
            Tải Bản Cài Đặt
          </a>
        </div>
      </div>
    </header>
  )
}
