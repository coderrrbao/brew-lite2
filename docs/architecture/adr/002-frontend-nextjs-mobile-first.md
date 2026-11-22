# ADR-002: Frontend Next.js, ưu tiên điện thoại (mobile-first)

- **Trạng thái:** Đã chấp nhận (phần PWA chưa triển khai, xem mục Việc cần làm)
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-001, ADR-007

## Bối cảnh
Khách hàng chủ yếu đặt đồ uống bằng điện thoại, thường qua mạng di động không ổn định. Cần giao diện tải nhanh, dễ bấm bằng một tay và xử lý rõ ràng khi API lỗi.

## Quyết định
1. Dùng **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4**.
2. Thiết kế **mobile-first**: trang chính là menu, giỏ hàng, thanh toán, xác nhận, đơn hàng, đăng nhập.
3. **Khi API lỗi, hiển thị thông báo lỗi và nút thử lại, không dùng dữ liệu cũ.** Cụ thể `app/error.tsx` hiển thị "Không tải được menu" kèm nút thử lại; không có dữ liệu giả hay bộ nhớ đệm cũ che lỗi.
4. Gọi API qua một lớp chung `lib/api/client.ts`. Server-side rendering gọi backend qua `INTERNAL_API_URL` (mạng nội bộ Docker); trình duyệt gọi qua `NEXT_PUBLIC_API_URL`.

## Phương án đã cân nhắc
| Phương án | Lý do không chọn |
|---|---|
| React SPA thuần (Vite) | Mất SSR, tải lần đầu chậm hơn trên di động |
| Ứng dụng native | Tốn chi phí hai nền tảng, ngoài phạm vi môn học |

## Hệ quả
- **Ưu điểm:** tải nhanh nhờ SSR; một ngôn ngữ (TypeScript) cho cả frontend và backend; người dùng luôn thấy trạng thái thật của hệ thống.
- **Hạn chế:** không có chế độ offline; khi mạng hoặc API lỗi, người dùng không xem được menu. Token lưu ở `localStorage` (xem rủi ro trong ADR-007).
- **Trade-off:** chọn tính đúng đắn của dữ liệu thay vì sự tiện lợi khi offline.

## Việc cần làm
Chưa có `manifest` và service worker, tức là **chưa đạt mức PWA**. Nếu SRS yêu cầu PWA, cần bổ sung web app manifest và service worker (chỉ cache tài nguyên tĩnh, không cache dữ liệu đơn hàng và thanh toán để giữ nguyên quyết định số 3).

## Bằng chứng trong mã nguồn
`apps/web/app/error.tsx`, `apps/web/lib/api/client.ts`, `apps/web/package.json`.
