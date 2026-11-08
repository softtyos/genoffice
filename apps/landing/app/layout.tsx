import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Softty Office — Bộ Ứng Dụng Văn Phòng AI Toàn Diện',
  description:
    'Bộ ứng dụng văn phòng AI 6-trong-1 bảo mật, ngoại tuyến, xử lý bảng tính triệu dòng với Rust, chia sẻ file tức thì Softty Drop và Camera Scanner.',
  keywords: [
    'Softty Office',
    'AI Office',
    'Docs',
    'Sheets',
    'Slides',
    'PDF',
    'Markdown',
    'Softty Drop',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#0e1322] text-[#f8fafc] antialiased selection:bg-[#2563eb] selection:text-white">
        {children}
      </body>
    </html>
  )
}
