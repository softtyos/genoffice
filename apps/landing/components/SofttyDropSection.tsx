'use client'

import React from 'react'
import { Wifi, Send, CheckCircle2, Laptop, Smartphone, ShieldCheck, Zap } from 'lucide-react'

export function SofttyDropSection() {
  return (
    <section id="softty-drop" className="py-24 bg-[#0a0f1d] border-t border-slate-800 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Descriptions */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#06b6d4] text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Độc Quyền Trong Hệ Sinh Thái</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Softty Drop — Bắn File Tức Thì Giữa Điện Thoại & Máy Tính
            </h2>

            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Bạn đang mở cả máy tính và điện thoại cùng lúc? Không cần cắm cáp, không cần gửi qua Zalo hay email làm nén file. Chỉ cần 1 chạm với <strong>Softty Drop</strong>, tài liệu sẽ bắn thẳng từ màn hình điện thoại sang ứng dụng máy tính và tự động mở lên trong tích tắc.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#131b2e] border border-slate-800">
                <Wifi className="w-5 h-5 text-[#06b6d4] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Tự động nhận diện mạng nội bộ (mDNS / Bonjour)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Chỉ cần kết nối cùng Wi-Fi văn phòng hoặc nhà riêng, hai thiết bị sẽ tự động thấy nhau mà không cần cài đặt IP phức tạp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#131b2e] border border-slate-800">
                <Send className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Tự động mở tab làm việc tương ứng</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Bắn file Word $\rightarrow$ tự mở Softty Docs; file Excel $\rightarrow$ tự mở Softty Sheets; file scan $\rightarrow$ tự mở Softty PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#131b2e] border border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Bảo mật mã hóa đầu-cuối (End-to-End Encrypted)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Dữ liệu truyền thẳng ngang hàng (P2P LAN), không qua bất kỳ máy chủ trung gian nào trên Internet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="relative">
            <div className="rounded-2xl p-6 bg-gradient-to-b from-[#131b2e] to-[#0e1322] border border-slate-800 shadow-2xl relative">
              {/* Transfer Simulation Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Thiết bị lân cận sẵn sàng
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Đang quét mDNS
                  </span>
                </div>

                {/* Device 1: Mobile */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0e1322] border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">iPhone 16 Pro</h5>
                      <span className="text-xs text-slate-400">Đã đăng nhập Softty ID</span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-medium">Thiết bị gửi</span>
                </div>

                {/* Animated Transfer Beam */}
                <div className="flex items-center justify-center py-2 text-xs font-mono text-[#06b6d4] gap-2">
                  <span>Hop Dong Kinh Te_v2.pdf (1.8 MB)</span>
                  <Send className="w-4 h-4 animate-bounce" />
                </div>

                {/* Device 2: Desktop */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0e1322] border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">MacBook Pro (Bonglv)</h5>
                      <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã nhận file — Mở ngay trong Softty PDF
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-medium">Hoàn tất</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
