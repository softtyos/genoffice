'use client'

import React from 'react'
import { FileText, Table, Presentation, FileCode, CheckCircle2 } from 'lucide-react'

export function ShowcaseSection() {
  const apps = [
    {
      id: 'docs',
      name: 'Softty Docs',
      badge: 'Soạn Thảo Văn Bản',
      color: 'from-blue-600 to-blue-400',
      icon: FileText,
      desc: 'Trình biên tập văn bản thông minh, hỗ trợ định dạng DOCX chuẩn của Microsoft Office với tốc độ mở tức thì.',
      features: [
        'AI viết lại, rút gọn, sửa ngữ pháp và dịch thuật 22 ngôn ngữ',
        'Theo dõi thay đổi (Track Changes), bình luận và phân quyền cộng tác',
        'Bộ lọc và định dạng văn bản giàu tính năng (Header, Footer, Rulers)',
      ],
    },
    {
      id: 'sheets',
      name: 'Softty Sheets',
      badge: 'Bảng Tính Rust Triệu Dòng',
      color: 'from-cyan-600 to-teal-400',
      icon: Table,
      desc: 'Bảng tính hiệu năng cao xử lý hàng triệu ô dữ liệu mượt mà nhờ lõi Rust Engine độc quyền (xlsx-sidecar).',
      features: [
        'Mở file XLSX dung lượng hàng trăm MB chỉ trong dưới 1 giây',
        'Đầy đủ hàm tính toán nâng cao: VLOOKUP, XLOOKUP, INDEX/MATCH, Pivot',
        'AI gợi ý biểu đồ phân tích và sinh công thức tự động theo câu hỏi',
      ],
    },
    {
      id: 'slides',
      name: 'Softty Slides',
      badge: 'Thuyết Trình Thông Minh',
      color: 'from-amber-600 to-orange-400',
      icon: Presentation,
      desc: 'Thiết kế slide thuyết trình ấn tượng, tự động hóa từ dàn ý văn bản và xuất PPTX tương thích 100%.',
      features: [
        'Tạo slide thuyết trình hoàn chỉnh từ văn bản hoặc ý tưởng thô',
        'Hệ thống bố cục thông minh tự căn chỉnh khoảng cách và font chữ',
        'Thư viện hiệu ứng chuyển trang, vector đồ họa chuẩn công sở',
      ],
    },
    {
      id: 'pdf',
      name: 'Softty PDF',
      badge: 'Xem, Ký Số & OCR AI',
      color: 'from-rose-600 to-red-400',
      icon: FileCode,
      desc: 'Bộ công cụ xử lý file PDF toàn diện: đọc, chú thích, xoay trang, tách gộp file và ký điện tử bảo mật.',
      features: [
        'Trích xuất văn bản và bảng biểu từ ảnh scan bằng AI OCR tiếng Việt',
        'Ký chữ ký số trực tiếp lên trang văn bản nhanh chóng',
        'Ghép nối trực tiếp với tính năng Camera Scanner trên điện thoại',
      ],
    },
  ]

  return (
    <section id="apps" className="py-20 bg-[#0e1322] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-[#06b6d4] uppercase">
            Hệ Thống Ứng Dụng Toàn Diện
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Mọi Công Cụ Bạn Cần Trong Một Ứng Dụng Duy Nhất
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Không cần chuyển đổi qua lại giữa hàng loạt phần mềm rời rạc. Softty Office cung cấp môi trường làm việc thống nhất trên cả máy tính và điện thoại.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {apps.map((app) => {
            const Icon = app.icon
            return (
              <div
                key={app.id}
                className="relative rounded-2xl bg-[#131b2e] border border-slate-800/80 p-8 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-blue-900/10 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {app.badge}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1 group-hover:text-[#06b6d4] transition-colors">
                      {app.name}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {app.desc}
                </p>

                <ul className="space-y-3 border-t border-slate-800/80 pt-6">
                  {app.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
