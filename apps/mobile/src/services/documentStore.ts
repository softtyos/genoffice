import AsyncStorage from '@react-native-async-storage/async-storage'
import { OfficeDocument, OfficeDocType } from '../types'

const STORAGE_KEY = '@softty_mobile_office_documents_v1'

export const SAMPLE_DOCUMENTS: OfficeDocument[] = [
  {
    id: 'sample-doc-1',
    name: 'Ke_hoach_kinh_doanh_2026.docx',
    uri: 'file:///sample/Ke_hoach_kinh_doanh_2026.docx',
    size: 245760,
    type: 'docs',
    modifiedAt: Date.now() - 3600000 * 2,
    isSample: true,
    textContent: `KẾ HOẠCH PHÁT TRIỂN KINH DOANH VÀ CÔNG NGHỆ NĂM 2026
TẬP ĐOÀN HỆ SINH THÁI SOFTTY (SOFTTY ECOSYSTEM)

1. TỔNG QUAN CHIẾN LƯỢC
Năm 2026 đánh dấu bước chuyển mình quan trọng của Softty Office với định vị: "Bộ ứng dụng văn phòng AI toàn diện, ngoại tuyến 100%, bảo mật dữ liệu tuyệt đối và tích hợp công nghệ truyền file không chạm Softty Drop".

2. MỤC TIÊU TRỌNG TÂM
- Hoàn thiện bộ 6 ứng dụng: Docs, Sheets, Slides, PDF, Markdown & HTML.
- Tối ưu hóa hiệu năng tính toán bảng tính với lõi Rust Calculation Engine (xlsx-sidecar), đạt khả năng mở file 100MB+ dưới 1 giây.
- Triển khai đồng bộ trải nghiệm xuyên suốt giữa Desktop (macOS, Windows, Linux) và Mobile Companion App (iOS, Android).

3. ĐẶC TÍNH BẢO MẬT & ĐỘC LẬP
- Kiến trúc Offline-First đảm bảo toàn bộ tệp tin được lưu trữ tại ổ đĩa cục bộ của người dùng.
- Cơ chế mang API Key cá nhân (BYOK AI) kết nối trực tiếp các mô hình ngôn ngữ lớn (OpenAI, Anthropic Claude, Gemini) mà không thông qua bất kỳ server proxy trung gian nào.`,
  },
  {
    id: 'sample-sheet-1',
    name: 'Bao_cao_doanh_thu_va_chi_phi_Q1.xlsx',
    uri: 'file:///sample/Bao_cao_doanh_thu_va_chi_phi_Q1.xlsx',
    size: 512000,
    type: 'sheets',
    modifiedAt: Date.now() - 3600000 * 5,
    isSample: true,
    sheetData: {
      sheetNames: ['Doanh Thu Q1', 'Chi Phí Vận Hành', 'Dự Báo Q2'],
      activeSheet: 'Doanh Thu Q1',
      headers: ['Mã SP', 'Tên Sản Phẩm / Dịch Vụ', 'Số Lượng', 'Đơn Giá (VND)', 'Doanh Thu (VND)', 'Tăng Trưởng'],
      rows: [
        ['SO-01', 'Softty Office Desktop License', '1,250', '1,890,000', '2,362,500,000', '+34.5%'],
        ['SO-02', 'Bản Quyền Doanh Nghiệp (Enterprise)', '180', '15,000,000', '2,700,000,000', '+52.1%'],
        ['SO-03', 'Gói Dịch Vụ Cloud S3 & Backup', '920', '450,000', '414,000,000', '+18.2%'],
        ['SO-04', 'Dịch Vụ Ký Số & OCR Document', '3,400', '120,000', '408,000,000', '+89.0%'],
        ['SO-05', 'Hạ Tầng Dedicated Contabo VPS', '45', '8,500,000', '382,500,000', '+12.4%'],
        ['TOTAL', 'TỔNG CỘNG DOANH THU THUẦN', '5,795', '—', '6,267,000,000', '+38.6%'],
      ],
      totalRows: 6,
      totalCols: 6,
    },
  },
  {
    id: 'sample-slide-1',
    name: 'Gioi_thieu_he_sinh_thai_Softty.pptx',
    uri: 'file:///sample/Gioi_thieu_he_sinh_thai_Softty.pptx',
    size: 1450000,
    type: 'slides',
    modifiedAt: Date.now() - 3600000 * 12,
    isSample: true,
    slideData: {
      deckTitle: 'Softty Office — Khái Niệm & Định Vị Tương Lai 2026',
      slides: [
        {
          id: 1,
          title: 'Softty Office 2026',
          subtitle: 'Bộ Ứng Dụng Văn Phòng AI Toàn Diện',
          bullets: [
            'Giải pháp thay thế Microsoft Office & Google Workspace',
            '100% Cục bộ & Bảo mật dữ liệu doanh nghiệp',
            'Đồng bộ tức thì giữa Máy Tính & Thiết Bị Di Động',
          ],
          notes: 'Mở đầu bài thuyết trình giới thiệu bối cảnh thị trường văn phòng bảo mật.',
        },
        {
          id: 2,
          title: 'Lõi Rust Calculation Engine',
          subtitle: 'Hiệu Năng Xử Lý Đỉnh Cao',
          bullets: [
            'Xử lý bảng tính trên 1,000,000 hàng mượt mà',
            'Thời gian mở file XLSX dung lượng 100MB chỉ mất 0.8 giây',
            'Tiết kiệm 80% bộ nhớ RAM so với ứng dụng văn phòng truyền thống',
          ],
          notes: 'Nhấn mạnh sự khác biệt về công nghệ với xlsx-sidecar viết bằng Rust.',
        },
        {
          id: 3,
          title: 'Softty Drop — Chia Sẻ Ngang Hàng P2P',
          subtitle: 'Kết Nối Máy Tính & Điện Thoại Không Dây',
          bullets: [
            'Tự động quét mạng nội bộ qua giao thức mDNS',
            'Bắn file 1-chạm không nén giảm chất lượng',
            'Tự động mở đúng tab làm việc trên máy tính khi nhận file',
          ],
          notes: 'Trình diễn tính năng bắn file từ iPhone sang MacBook.',
        },
        {
          id: 4,
          title: 'Camera Scanner & Ký Số Điện Tử',
          subtitle: 'Số Hóa Tài Liệu Di Động',
          bullets: [
            'Nhận diện mép văn bản và nắn góc tự động',
            'Ghép nhiều trang hợp đồng thành 1 tệp PDF duy nhất',
            'Chèn chữ ký điện tử hợp pháp và gửi đối tác trong 30 giây',
          ],
          notes: 'Minh họa quy trình quét hợp đồng và ký trực tiếp.',
        },
      ],
    },
  },
  {
    id: 'sample-pdf-1',
    name: 'Hop_dong_cung_cap_dich_vu_phan_mem.pdf',
    uri: 'file:///sample/Hop_dong_cung_cap_dich_vu_phan_mem.pdf',
    size: 780000,
    type: 'pdf',
    modifiedAt: Date.now() - 3600000 * 24,
    isSample: true,
    pdfData: {
      totalPages: 3,
      signed: true,
      signedAt: '08/11/2026 14:30',
      signatureName: 'Softty Technologies Co., Ltd',
      contentSummary: [
        'Trang 1: Các bên tham gia hợp đồng, định nghĩa điều khoản dịch vụ phần mềm.',
        'Trang 2: Phạm vi công việc, chỉ số SLA cam kết 99.9% và biểu phí bản quyền.',
        'Trang 3: Điều khoản bảo mật thông tin, chữ ký điện tử số hóa xác thực của đại diện hai bên.',
      ],
    },
  },
  {
    id: 'sample-md-1',
    name: 'Kien_truc_he_thong_va_bao_mat_P2P.md',
    uri: 'file:///sample/Kien_truc_he_thong_va_bao_mat_P2P.md',
    size: 98000,
    type: 'markdown',
    modifiedAt: Date.now() - 3600000 * 36,
    isSample: true,
    textContent: `# KIẾN TRÚC KỸ THUẬT SOFTTY DROP & P2P SYNC

## 1. Giao thức khám phá mDNS (Multicast DNS)
Softty Office trên Desktop và Mobile lắng nghe dịch vụ \`_softtydrop._tcp.local\` trên cổng \`54321\`.
- Khi máy tính khởi chạy, một loopback HTTP server được thiết lập.
- Mobile định kỳ phát gói tin UDP multicast để tìm kiếm các node máy tính đang online trong mạng Wi-Fi LAN.

\`\`\`typescript
interface SofttyNode {
  name: string
  ip: string
  port: number
  deviceType: 'mac' | 'windows' | 'linux'
}
\`\`\`

## 2. Mã hóa dữ liệu truyền tải
Toàn bộ luồng stream nhị phân của tệp tin được truyền trực tiếp dạng HTTP POST multipart/form-data qua giao thức nội bộ bảo mật, đảm bảo:
- Không lưu trên bất kỳ cloud proxy hay telemetry server nào.
- Tốc độ truyền đạt tối đa băng thông mạng Wi-Fi nội bộ (thường từ 20MB/s đến 80MB/s).

## 3. Công thức toán học (KaTeX)
Tốc độ truyền tải lý thuyết được tính toán theo mô hình Shannon:
$$C = B \\log_2 \\left(1 + \\frac{S}{N}\\right)$$

Trong đó $B$ là băng thông kênh truyền và $S/N$ là tỷ số tín hiệu trên nhiễu.`,
  },
]

export class DocumentStoreService {
  static async getDocuments(): Promise<OfficeDocument[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as OfficeDocument[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
      // Initialize with sample documents if empty
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DOCUMENTS))
      return SAMPLE_DOCUMENTS
    } catch {
      return SAMPLE_DOCUMENTS
    }
  }

  static async saveDocument(doc: OfficeDocument): Promise<OfficeDocument[]> {
    const list = await this.getDocuments()
    const index = list.findIndex((item) => item.id === doc.id)
    let updated: OfficeDocument[]
    if (index >= 0) {
      updated = [...list]
      updated[index] = { ...doc, modifiedAt: Date.now() }
    } else {
      updated = [{ ...doc, modifiedAt: Date.now() }, ...list]
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  }

  static async deleteDocument(id: string): Promise<OfficeDocument[]> {
    const list = await this.getDocuments()
    const updated = list.filter((item) => item.id !== id)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY)
  }

  static detectDocType(fileName: string): OfficeDocType {
    const lower = fileName.toLowerCase()
    if (lower.endsWith('.docx') || lower.endsWith('.doc') || lower.endsWith('.odt')) {
      return 'docs'
    }
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv') || lower.endsWith('.tsv')) {
      return 'sheets'
    }
    if (lower.endsWith('.pptx') || lower.endsWith('.ppt') || lower.endsWith('.odp')) {
      return 'slides'
    }
    if (lower.endsWith('.pdf')) {
      return 'pdf'
    }
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
      return 'markdown'
    }
    if (lower.endsWith('.html') || lower.endsWith('.htm')) {
      return 'html'
    }
    // Default to docs
    return 'docs'
  }

  static createBlankDocument(type: OfficeDocType, customName?: string): OfficeDocument {
    const id = `doc-${Date.now()}`
    const timestamp = Date.now()

    switch (type) {
      case 'docs':
        return {
          id,
          name: customName || `Tai_lieu_moi_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.docx`,
          uri: `file:///documents/${id}.docx`,
          size: 12400,
          type: 'docs',
          modifiedAt: timestamp,
          textContent: 'Soạn thảo nội dung văn bản Softty Docs tại đây...\n\nBạn có thể nhập nội dung, định dạng và lưu lại ngoại tuyến trên thiết bị.',
        }
      case 'sheets':
        return {
          id,
          name: customName || `Bang_tinh_moi_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.xlsx`,
          uri: `file:///documents/${id}.xlsx`,
          size: 18500,
          type: 'sheets',
          modifiedAt: timestamp,
          sheetData: {
            sheetNames: ['Sheet1'],
            activeSheet: 'Sheet1',
            headers: ['A', 'B', 'C', 'D', 'E'],
            rows: [
              ['Dữ liệu 1', '100', '200', '300', '=SUM(B1:D1)'],
              ['Dữ liệu 2', '400', '500', '600', '=SUM(B2:D2)'],
              ['Dữ liệu 3', '700', '800', '900', '=SUM(B3:D3)'],
            ],
            totalRows: 3,
            totalCols: 5,
          },
        }
      case 'slides':
        return {
          id,
          name: customName || `Trinh_chieu_moi_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.pptx`,
          uri: `file:///documents/${id}.pptx`,
          size: 45000,
          type: 'slides',
          modifiedAt: timestamp,
          slideData: {
            deckTitle: 'Bài Thuyết Trình Mới',
            slides: [
              {
                id: 1,
                title: 'Tiêu Đề Bài Thuyết Trình',
                subtitle: 'Phát triển bởi Softty Slides',
                bullets: ['Nội dung trang trình chiếu đầu tiên', 'Bấm slide tiếp theo để xem chi tiết'],
              },
            ],
          },
        }
      case 'pdf':
        return {
          id,
          name: customName || `Tai_lieu_PDF_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.pdf`,
          uri: `file:///documents/${id}.pdf`,
          size: 32000,
          type: 'pdf',
          modifiedAt: timestamp,
          pdfData: {
            totalPages: 1,
            signed: false,
            contentSummary: ['Trang 1: Tài liệu PDF chuẩn số hóa.'],
          },
        }
      case 'markdown':
        return {
          id,
          name: customName || `Ghi_chu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.md`,
          uri: `file:///documents/${id}.md`,
          size: 8200,
          type: 'markdown',
          modifiedAt: timestamp,
          textContent: '# Ghi Chú Kỹ Thuật Softty Markdown\n\n- [x] Tính năng 1\n- [ ] Tính năng 2\n\nViết công thức toán:\n$$E = mc^2$$',
        }
      default:
        return {
          id,
          name: customName || `Tai_lieu_${timestamp}.docx`,
          uri: `file:///documents/${id}.docx`,
          size: 1024,
          type: 'docs',
          modifiedAt: timestamp,
          textContent: '',
        }
    }
  }
}
