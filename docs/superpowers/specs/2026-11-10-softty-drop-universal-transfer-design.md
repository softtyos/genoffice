# Thiết Kế Kiến Trúc: Softty Drop 2.0 (Universal Cross-Device File Transfer)

**Ngày lập**: 2026-11-10  
**Tác giả**: Antigravity & Softty Office Core Team  
**Trạng thái**: Bản thảo thiết kế (Design Spec)  
**Phạm vi**: `apps/shell` (Electron Desktop), `apps/mobile` (Expo React Native iOS & Android), `packages/*`

---

## 1. Mục Tiêu & Yêu Cầu Cốt Lõi (Goals & Requirements)

### 1.1 Mục tiêu
Xây dựng hệ thống chia sẻ tệp tin đa chiều toàn diện **Softty Drop 2.0**, cho phép người dùng chuyển đổi tài liệu (PDF, Word, Excel, PowerPoint, hình ảnh, văn bản) tức thời giữa:
1. **Mobile ➔ Desktop**
2. **Desktop ➔ Mobile**
3. **Mobile ⇄ Mobile** (iOS ⇄ Android, Android ⇄ Android, iOS ⇄ iOS)
4. **Desktop ⇄ Desktop** (macOS ⇄ Windows ⇄ Linux)

### 1.2 Yêu cầu trải nghiệm (UX Requirements)
* **Tiện lợi tối đa**: 
  - **Quét mã QR**: Thiết bị nhận bật mã QR, thiết bị gửi quét bằng camera để tự động bắt tay ghép đôi trong vòng 0.5s.
  - **Mã PIN 6 số**: Cho phép ghép đôi bằng mã 6 số (ví dụ `749 218`) – cực kỳ tiện lợi khi dùng máy ảo (iOS Simulator) hoặc khi không tiện giơ camera quét.
  - **Nhận diện tự động mạng LAN (AirDrop style)**: Thiết bị trong cùng mạng Wi-Fi tự động hiện diện danh sách một chạm.
* **Tốc độ & Tính ổn định**:
  - Ưu tiên đường truyền nội bộ LAN Direct đạt 50–100 MB/s.
  - Tự động chuyển tiếp P2P / Relay Pipe khi ở khác mạng hoặc 4G/5G, đảm bảo **100% tỷ lệ truyền thành công**.
* **Bảo mật & Quyền riêng tư**:
  - Mã hóa đầu cuối (E2E Encrypted).
  - Không lưu trữ tệp trên máy chủ bên thứ ba (Zero-Storage).
  - Kiểm tra toàn vẹn tệp (Integrity Check) bằng mã băm SHA-256 trước khi mở.
* **Tự động mở tài liệu**:
  - Desktop: Lưu vào `~/Downloads/Softty Drop/` và tự động mở tài liệu trên cửa sổ Softty Office.
  - Mobile: Lưu vào kho tài liệu `Documents` và tự động kích hoạt trình xem `DocumentViewerModal`.

---

## 2. Kiến Trúc Kỹ Thuật (Technical Architecture)

```
                            [SOFTTY DROP 2.0]
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
[TẦNG 1: GHÉP ĐÔI (PAIRING)]              [TẦNG 2: KÊNH TRUYỀN DỮ LIỆU (TRANSPORT)]
• Mã QR động (Dynamic QR Code)             • Fast LAN Direct (HTTP Streaming)
• Mã PIN ngẫu nhiên 6 chữ số               • WebRTC DataChannel (Direct P2P)
• Quét mạng LAN tự động (Ping Beacon)      • Fallback Relay Pipe (Zero-Storage RAM Forward)
```

### 2.1 Cấu trúc Gói Tin Ghép Đôi (Handshake Payload)

Khi một thiết bị bật chế độ **"Nhận File"**, thiết bị sẽ tạo ra một phiên nhận tệp:

```typescript
export interface DropSessionPayload {
  version: 2
  sessionId: string          // UUIDv4 phiên nhận (ví dụ: 'drop-a1b2-c3d4')
  pin: string                // Mã PIN 6 chữ số (ví dụ: '749218')
  deviceName: string         // Tên thiết bị (ví dụ: 'MacBook Pro của Bong', 'iPhone 16 Pro')
  deviceType: 'mac' | 'windows' | 'linux' | 'ios' | 'android'
  ips: string[]              // Danh sách IP nội bộ (LAN candidates)
  port: number               // Cổng lắng nghe (mặc định 54321 trên Desktop, hoặc cổng động)
  createdAt: number          // Timestamp tạo phiên
  expiresAt: number          // Hết hạn sau 10 phút
}
```

Mã QR và Mã PIN 6 số sẽ mã hóa chuỗi JSON trên (hoặc URL rút gọn `softtydrop://pair?data=...`).

---

## 3. Thiết Kế Chi Tiết Từng Module (Component Design)

### 3.1 Desktop Shell (`apps/shell`)

1. **Bộ Mở Rộng `SofttyDropServer` (`apps/shell/src/main/softty-drop-server.ts`)**:
   - Duy trì HTTP Server cổng `54321`.
   - Bổ sung các Endpoint đa chiều:
     - `GET /api/softty-drop/ping`: Trả về thông tin Desktop & trạng thái sẵn sàng.
     - `GET /api/softty-drop/session`: Tạo hoặc lấy phiên nhận tệp hiện tại (kèm mã PIN 6 số và mã QR).
     - `POST /api/softty-drop/receive`: Nhận stream file từ Mobile hoặc Desktop khác, kiểm tra dung lượng, ghi ra đĩa và phát tín hiệu mở tài liệu.
     - `POST /api/softty-drop/send-to-peer`: Desktop chủ động gửi tệp tới thiết bị ngang hàng (qua IP:Port của peer hoặc qua Relay Room).
     - `POST /api/softty-drop/relay/push` & `GET /api/softty-drop/relay/pull`: Đóng vai trò LAN Relay Hub giúp 2 máy Mobile có thể trao đổi file chéo nhau trong mạng mà không cần cài server riêng.

2. **Giao Diện Desktop `SofttyDropModal` (`apps/shell/src/renderer/src/SofttyDropModal.tsx`)**:
   - Thêm nút **Softty Drop 📡** trên thanh điều hướng Sidebar của `Home.tsx`.
   - Màn hình bao gồm 2 Tab:
     - **Tab "Nhận File" (Receive)**:
       - Hiển thị mã QR lớn, sắc nét.
       - Hiển thị mã PIN 6 số to rõ (`749 218`).
       - Radar hiển thị trạng thái *"Đang chờ kết nối..."*.
       - Tự động hiện thông báo và tiến trình (0% ➔ 100%) khi có thiết bị đang bắn file tới.
     - **Tab "Gửi File" (Send)**:
       - Vùng kéo thả tệp (Drag & Drop) hoặc nút chọn tệp từ máy tính.
       - Danh sách thiết bị lân cận tìm thấy trong mạng Wi-Fi.
       - Ô nhập mã PIN 6 số nếu muốn gửi tới máy ở xa hoặc máy chưa tự động hiện.
       - Nút *"Bắn tệp ngay"* kèm thanh phần trăm thời gian thực.

### 3.2 Mobile App (`apps/mobile`)

1. **Bộ Dịch Vụ `SofttyDropService` (`apps/mobile/src/services/softtyDrop.ts`)**:
   - Hỗ trợ tạo phiên nhận (`createReceiveSession`) với mã PIN 6 số.
   - Hỗ trợ kết nối bằng mã PIN 6 số (`connectByPin`).
   - Hỗ trợ giải mã mã QR từ ảnh hoặc chuỗi scan (`parseQrPayload`).
   - Hỗ trợ gửi tệp đa luồng:
     - Thử kết nối LAN trực tiếp (`http://<ip>:<port>/api/softty-drop/receive`).
     - Dự phòng qua Relay Room (`/api/softty-drop/relay`).
   - Báo cáo tiến trình `onProgress(0.0 -> 1.0)`.

2. **Giao Diện `DropScreen.tsx` Cải Tiến Toàn Diện**:
   - Chuyển đổi linh hoạt giữa 2 chế độ:
     - **Chế độ Gửi (Send Mode)**:
       - Radar quét máy lân cận.
       - Tùy chọn 1: Bấm vào thiết bị lân cận đã tìm thấy.
       - Tùy chọn 2: Quét mã QR bằng Camera (tận dụng module quét ảnh của app).
       - Tùy chọn 3: Nhập mã PIN 6 số.
       - Chọn tệp từ máy hoặc chọn tài liệu vừa scan từ `ScannerScreen`.
     - **Chế độ Nhận (Receive Mode)**:
       - Sinh mã QR hiển thị trực tiếp trên màn hình điện thoại.
       - Hiển thị mã PIN 6 số của điện thoại.
       - Lắng nghe tệp gửi tới, tự động lưu vào danh sách tài liệu `Documents` và hiện Modal hỏi mở ngay.

---

## 4. Kịch Bản Kiểm Thử & Tiêu Chí Nghiệm Thu (Verification Matrix)

| STT | Kịch Bản Kiểm Thử | Môi Trường | Tiêu Chí Đạt (Pass Criteria) |
| :--- | :--- | :--- | :--- |
| **TC1** | **Mobile ➔ Desktop qua Quét QR / IP LAN** | iOS Simulator / Android ➔ macOS Desktop | File PDF/Doc gửi thành công; Desktop nhận đủ 100% dung lượng; Desktop tự động focus và mở tài liệu. |
| **TC2** | **Desktop ➔ Mobile qua Mã PIN 6 số** | macOS Desktop ➔ iOS Simulator / Android | Mobile bật "Nhận File" sinh mã PIN; Desktop nhập mã PIN và bấm gửi file; Mobile nhận đủ byte, lưu vào Documents, hiện thông báo thành công. |
| **TC3** | **Mobile ⇄ Mobile qua Hub Relay** | iOS Simulator ⇄ Android Phone | Thiết bị A gửi file cho Thiết bị B qua mã PIN 6 số; Thiết bị B nhận trọn vẹn tệp không bị suy hao. |
| **TC4** | **Kiểm tra Toàn vẹn Tệp (SHA-256 Checksum)** | Tự động hóa qua Test Script | File gửi và file nhận có cùng mã băm SHA-256 (khớp 100% từng byte). |
| **TC5** | **Xử lý Ngoại lệ & Mất Mạng** | Rút mạng / Timeout | Ứng dụng không bị crash, hiển thị thông báo lỗi rõ ràng thân thiện cho người dùng. |

---

## 5. Kế Hoạch Triển Khai Từng Bước (Implementation Plan)

1. **Bước 1**: Nâng cấp `softty-drop-server.ts` trên Electron Desktop hỗ trợ Session ID, PIN 6 số, và Relay Hub endpoints.
2. **Bước 2**: Xây dựng `SofttyDropModal.tsx` và gắn vào Sidebar `Home.tsx` trên Desktop.
3. **Bước 3**: Cập nhật `SofttyDropService.ts` và `DropScreen.tsx` trên Mobile hỗ trợ cả 2 chế độ Gửi & Nhận (kèm QR generator & PIN pairing).
4. **Bước 4**: Viết kịch bản kiểm thử End-to-End tự động (`tools/test-universal-drop-e2e.mjs`) kiểm tra đồng thời cả 4 chiều truyền tệp và kiểm tra mã băm SHA-256.
5. **Bước 5**: Chạy kiểm thử thực tế trên máy ảo iOS Simulator và môi trường thật, xác nhận 100% chức năng hoạt động hoàn hảo trước khi nghiệm thu.
