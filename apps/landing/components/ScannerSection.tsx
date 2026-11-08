'use client'

import React from 'react'
import { Camera, FileCheck, Sparkles, Layers, ArrowRight } from 'lucide-react'

export function ScannerSection() {
  return (
    <section id="scanner" className="py-24 bg-[#0e1322] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-400 uppercase">
            Mobile Companion AI
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Biến Điện Thoại Thành Máy Scan Văn Bản Chuyên Nghiệp
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Quét hợp đồng, hóa đơn, tài liệu giấy chỉ trong vài giây. Tự động căn phẳng góc, lọc bóng mờ và xuất file PDF chất lượng cao để ký số hoặc gửi đối tác.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-[#131b2e] border border-slate-800 flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-semibold text-blue-400">BƯỚC 01</span>
            <h3 className="text-lg font-bold text-white mt-2">Quét & Nhận Diện 4 Góc Tự Động</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Camera tự động nhận diện mép tài liệu trong thời gian thực, loại bỏ nền bàn làm việc và nắn thẳng góc nhìn (Perspective Correction).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-[#131b2e] border border-slate-800 flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#06b6d4] mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-semibold text-[#06b6d4]">BƯỚC 02</span>
            <h3 className="text-lg font-bold text-white mt-2">Ghép Nhiều Trang & Lọc Nét</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Quét liên tục nhiều trang của cuốn sách hoặc hợp đồng dày, áp dụng bộ lọc tăng tương phản chữ viết và đóng gói thành 1 file PDF duy nhất.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-[#131b2e] border border-slate-800 flex flex-col items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">BƯỚC 03</span>
            <h3 className="text-lg font-bold text-white mt-2">Bắn Sang Desktop Để Ký Số</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Nhấn 1 chạm <strong>"Bắn Sang Desktop"</strong>, tài liệu lập tức mở trong Softty PDF trên máy tính để thêm chữ ký điện tử hoặc OCR trích xuất nội dung.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
