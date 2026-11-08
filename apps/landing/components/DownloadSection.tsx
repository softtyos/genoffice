'use client'

import React from 'react'
import { Apple, Monitor, Terminal, Smartphone, Download, ExternalLink } from 'lucide-react'

export function DownloadSection() {
  const downloads = [
    {
      os: 'macOS',
      icon: Apple,
      desc: 'Hỗ trợ macOS 12 Monterey trở lên',
      formats: [
        { label: 'Apple Silicon (M1/M2/M3/M4)', ext: '.dmg', url: '#' },
        { label: 'Intel Chip (x64)', ext: '.dmg', url: '#' },
      ],
      primary: true,
    },
    {
      os: 'Windows',
      icon: Monitor,
      desc: 'Hỗ trợ Windows 10 / 11 (64-bit)',
      formats: [
        { label: 'Bộ cài đặt Setup', ext: '.exe', url: '#' },
        { label: 'Bản Portable không cần cài', ext: '.zip', url: '#' },
      ],
      primary: false,
    },
    {
      os: 'Linux',
      icon: Terminal,
      desc: 'Ubuntu, Debian, Fedora, Arch',
      formats: [
        { label: 'Bản phổ quát', ext: '.AppImage', url: '#' },
        { label: 'Debian / Ubuntu package', ext: '.deb', url: '#' },
      ],
      primary: false,
    },
    {
      os: 'Mobile Companion',
      icon: Smartphone,
      desc: 'Quét tài liệu & Softty Drop',
      formats: [
        { label: 'iOS App Store / TestFlight', ext: 'iOS', url: '#' },
        { label: 'Android APK / Google Play', ext: 'Android', url: '#' },
      ],
      primary: false,
    },
  ]

  return (
    <section id="download" className="py-24 bg-[#0e1322] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-[#06b6d4] uppercase">
            Tải Bản Cài Đặt Miễn Phí
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Sẵn Sàng Cho Mọi Thiết Bị Của Bạn
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Tải Softty Office hoàn toàn miễn phí cho máy tính và điện thoại. Đăng nhập Softty.net để đồng bộ hồ sơ và bắt đầu làm việc ngay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {downloads.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl flex flex-col justify-between border transition-all ${
                  item.primary
                    ? 'bg-[#131b2e] border-blue-500/50 shadow-xl shadow-blue-500/10'
                    : 'bg-[#131b2e] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.os}</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-6">{item.desc}</p>
                </div>

                <div className="space-y-2.5">
                  {item.formats.map((fmt, fIdx) => (
                    <a
                      key={fIdx}
                      href={fmt.url}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0e1322] hover:bg-[#1a233b] border border-slate-800 hover:border-blue-500/40 text-xs font-medium text-slate-200 transition-all group"
                    >
                      <span>{fmt.label}</span>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-[#06b6d4] transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
