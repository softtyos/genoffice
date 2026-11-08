'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-12 bg-[#090d18] border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#06b6d4] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white">
              Softty <span className="text-[#06b6d4]">Office</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <a href="https://accounts.softty.net" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Softty ID
            </a>
            <a href="https://my.softty.net" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Customer Portal
            </a>
            <a href="https://pay.softty.net" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Softty Pay
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Điều Khoản Dịch Vụ
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Chính Sách Bảo Mật
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 Softty Ecosystem. Mọi quyền được bảo lưu.</p>
          <p>Phát triển bởi đội ngũ kỹ sư Softty.net</p>
        </div>
      </div>
    </footer>
  )
}
