'use client'

import React from 'react'
import { ShieldCheck, HardDrive, KeyRound, Cpu, Check } from 'lucide-react'

export function PrivacySecurity() {
  const points = [
    {
      icon: HardDrive,
      title: '100% Ngoại Tuyến (Offline-First)',
      desc: 'Tài liệu của bạn được lưu hoàn toàn trên ổ cứng máy tính cá nhân. Phần mềm hoạt động đầy đủ tính năng ngay cả khi không có kết nối Internet.',
    },
    {
      icon: KeyRound,
      title: 'Tự Mang API Key (BYOK)',
      desc: 'Tự do kết nối API của OpenAI, Anthropic Claude, Google Gemini hoặc các server AI cục bộ như Ollama/vLLM. Không qua bất kỳ proxy trung gian nào.',
    },
    {
      icon: ShieldCheck,
      title: 'Bảo Mật & Riêng Tư Tuyệt Đối',
      desc: 'Nội dung văn bản, số liệu kinh doanh và danh bạ không bao giờ bị thu thập hay dùng để huấn luyện mô hình công cộng.',
    },
    {
      icon: Cpu,
      title: 'Lõi Rust Engine Siêu Nhẹ & Tối Ưu',
      desc: 'Không tốn hàng gigabyte RAM như các phần mềm văn phòng cũ. Khởi động trong 1 giây, phản hồi mượt mà trên cả máy tính cấu hình văn phòng.',
    },
  ]

  return (
    <section id="security" className="py-24 bg-[#0a0f1d] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-emerald-400 uppercase">
            An Toàn Dữ Liệu Doanh Nghiệp
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Quyền Kiểm Soát Dữ Liệu Thuộc Về Bạn
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Chúng tôi xây dựng Softty Office với tư duy bảo mật từ gốc rễ. Bạn hoàn toàn làm chủ dữ liệu và chìa khóa AI của mình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {points.map((pt, idx) => {
            const Icon = pt.icon
            return (
              <div key={idx} className="flex gap-5 p-8 rounded-2xl bg-[#131b2e] border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{pt.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{pt.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
