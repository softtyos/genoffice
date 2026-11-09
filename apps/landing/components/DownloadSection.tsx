'use client'

import React, { useState } from 'react'
import {
  Apple,
  Monitor,
  Terminal,
  Smartphone,
  Download,
  CheckCircle2,
  X,
  FileCode,
  ShieldCheck,
  QrCode,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'

interface DownloadPackage {
  os: string
  label: string
  fileName: string
  size: string
  version: string
  type: 'desktop' | 'mobile'
  guide: string
}

export function DownloadSection() {
  const { t } = useApp()
  const [activePackage, setActivePackage] = useState<DownloadPackage | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const downloads = [
    {
      os: 'macOS',
      icon: Apple,
      desc: t.download.macDesc,
      primary: true,
      formats: [
        {
          label: t.download.macArm,
          ext: '.dmg',
          pkg: {
            os: 'macOS (Apple Silicon M1/M2/M3/M4)',
            label: t.download.macArm,
            fileName: 'Softty-Office-1.0.0-arm64.dmg',
            size: '86.4 MB',
            version: 'v1.0.0 (Universal / ARM64)',
            type: 'desktop' as const,
            guide: 'Mở tệp .dmg vừa tải và kéo biểu tượng Softty Office vào thư mục Applications để sử dụng ngay.',
          },
        },
        {
          label: t.download.macIntel,
          ext: '.dmg',
          pkg: {
            os: 'macOS (Intel Core x86_64)',
            label: t.download.macIntel,
            fileName: 'Softty-Office-1.0.0-x64.dmg',
            size: '89.1 MB',
            version: 'v1.0.0 (Intel)',
            type: 'desktop' as const,
            guide: 'Mở tệp .dmg và kéo biểu tượng Softty Office vào thư mục Applications.',
          },
        },
      ],
    },
    {
      os: 'Windows',
      icon: Monitor,
      desc: t.download.winDesc,
      primary: false,
      formats: [
        {
          label: t.download.winSetup,
          ext: '.exe',
          pkg: {
            os: 'Windows (64-bit Installer)',
            label: t.download.winSetup,
            fileName: 'Softty-Office-Setup-1.0.0.exe',
            size: '81.2 MB',
            version: 'v1.0.0 (NSIS Installer)',
            type: 'desktop' as const,
            guide: 'Chạy tệp cài đặt .exe, chương trình sẽ tự động thiết lập và tạo biểu tượng Softty Office trên Desktop.',
          },
        },
        {
          label: t.download.winPortable,
          ext: '.zip',
          pkg: {
            os: 'Windows (Portable No-Install)',
            label: t.download.winPortable,
            fileName: 'Softty-Office-1.0.0-win-x64.zip',
            size: '79.5 MB',
            version: 'v1.0.0 (Portable)',
            type: 'desktop' as const,
            guide: 'Giải nén tệp .zip vào bất kỳ thư mục nào và chạy trực tiếp file Softty Office.exe mà không cần cài đặt quyền Admin.',
          },
        },
      ],
    },
    {
      os: 'Linux',
      icon: Terminal,
      desc: t.download.linuxDesc,
      primary: false,
      formats: [
        {
          label: t.download.linuxAppImage,
          ext: '.AppImage',
          pkg: {
            os: 'Linux (Universal AppImage)',
            label: t.download.linuxAppImage,
            fileName: 'Softty-Office-1.0.0.AppImage',
            size: '84.0 MB',
            version: 'v1.0.0 (AppImage)',
            type: 'desktop' as const,
            guide: 'Cấp quyền thực thi: chmod +x Softty-Office-1.0.0.AppImage và nhấp đúp để mở trên Ubuntu, Fedora, Debian, Arch...',
          },
        },
        {
          label: t.download.linuxDeb,
          ext: '.deb',
          pkg: {
            os: 'Linux (Debian / Ubuntu Package)',
            label: t.download.linuxDeb,
            fileName: 'softty-office_1.0.0_amd64.deb',
            size: '78.6 MB',
            version: 'v1.0.0 (deb)',
            type: 'desktop' as const,
            guide: 'Cài đặt qua dòng lệnh: sudo dpkg -i softty-office_1.0.0_amd64.deb',
          },
        },
      ],
    },
    {
      os: 'Mobile Companion',
      icon: Smartphone,
      desc: t.download.mobileDesc,
      primary: false,
      formats: [
        {
          label: t.download.mobileIos,
          ext: 'iOS',
          pkg: {
            os: 'iOS (iPhone / iPad)',
            label: t.download.mobileIos,
            fileName: 'Softty Office trên App Store & TestFlight',
            size: '42.5 MB',
            version: 'v1.0.0 (iOS 15+)',
            type: 'mobile' as const,
            guide: 'Quét mã QR bằng Camera iPhone để mở trên App Store hoặc cài đặt phiên bản sớm qua TestFlight.',
          },
        },
        {
          label: t.download.mobileAndroid,
          ext: 'Android',
          pkg: {
            os: 'Android (Google Play / APK)',
            label: t.download.mobileAndroid,
            fileName: 'softty-office-mobile-1.0.0.apk',
            size: '39.8 MB',
            version: 'v1.0.0 (Android 10+)',
            type: 'mobile' as const,
            guide: 'Tải trực tiếp tệp .apk về điện thoại Android hoặc quét mã QR để cài đặt.',
          },
        },
      ],
    },
  ]

  const handleStartDownload = (pkg: DownloadPackage) => {
    setIsDownloading(true)
    setDownloadSuccess(false)

    setTimeout(() => {
      setIsDownloading(false)
      setDownloadSuccess(true)

      // Generate a mock clean installer receipt / trigger download
      const content = `Softty Office v1.0.0 Installation Receipt\nPackage: ${pkg.fileName}\nPlatform: ${pkg.os}\nChecksum SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069\nPublisher: SOFTTY.NET CO., LTD\nLicense: Lifetime Free Offline Productivity`
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pkg.type === 'desktop' ? pkg.fileName : `${pkg.fileName}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 800)
  }

  return (
    <section id="download" className="py-24 bg-slate-50 dark:bg-[#0e1322] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-[#06b6d4] uppercase">
            {t.download.tag}
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.download.title}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            {t.download.desc}
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
                    ? 'bg-white dark:bg-[#131b2e] border-blue-500 shadow-md dark:shadow-xl dark:shadow-blue-500/10'
                    : 'bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-white mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.os}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">{item.desc}</p>
                </div>

                <div className="space-y-2.5">
                  {item.formats.map((fmt, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => {
                        setActivePackage(fmt.pkg)
                        setDownloadSuccess(false)
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0e1322] hover:bg-blue-50 dark:hover:bg-[#1a233b] border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all group text-left cursor-pointer"
                    >
                      <span className="group-hover:text-blue-600 dark:group-hover:text-[#06b6d4]">
                        {fmt.label}
                      </span>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-[#06b6d4] transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Download Dialog Modal */}
      {activePackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setActivePackage(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-[#06b6d4] flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Tải Softty Office v1.0.0
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activePackage.os}</p>
              </div>
            </div>

            {/* Package Details */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 space-y-2 text-xs mb-5">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Tệp cài đặt:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">
                  {activePackage.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Dung lượng:</span>
                <span className="font-semibold">{activePackage.size}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">Giấy phép:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Miễn phí trọn đời (100% Offline)
                </span>
              </div>
            </div>

            {/* Installation Guide */}
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-200/50 dark:border-blue-900/40 mb-6 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-[#06b6d4] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
                  Hướng dẫn cài đặt nhanh:
                </p>
                <p>{activePackage.guide}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => handleStartDownload(activePackage)}
                disabled={isDownloading}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#06b6d4] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                {isDownloading ? (
                  <span>Đang kết nối máy chủ tải về...</span>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Đang tải xuống tệp!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Bắt Đầu Tải Về Ngay</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActivePackage(null)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
