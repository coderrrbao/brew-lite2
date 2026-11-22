# ADR-006: Thanh toán idempotent và Mock Payment Service

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-004, ADR-005

## Bối cảnh
Người dùng có thể bấm thanh toán hai lần, mạng chập chờn làm client gửi lại yêu cầu, hoặc trình duyệt tự retry. Nếu mỗi lần gửi đều tạo một giao dịch mới thì khách bị tính tiền hai lần. Dự án học thuật cũng không thể tích hợp cổng thanh toán thật.

## Quyết định
1. **Mỗi yêu cầu thanh toán phải kèm header `Idempotency-Key`**; thiếu header thì trả 400. Khóa này lưu ở cột `Payment.idempotencyKey` với ràng buộc **unique** trong CSDL.
2. **Gửi lại cùng key thì không tạo giao dịch mới**: server trả lại payment cũ. Nếu key đã gắn với đơn khác thì trả 409.
3. Bước xác nhận (`confirm`) cũng nhận diện theo key và chỉ xử lý khi đơn đang ở trạng thái thanh toán được (`PENDING` hoặc `PAYMENT_FAILED`); nếu đơn đã xử lý rồi thì trả kết quả hiện tại, không trừ điểm hay trừ kho lần nữa. Toàn bộ nằm trong một transaction.
4. **Dùng Mock Payment Service thay cổng thật**: backend tạo "QR thanh toán" giả, bước `confirm` nhận `success: true/false` để mô phỏng thanh toán thành công hoặc thất bại. Kết quả cập nhật `Payment.status` (`PENDING/PAID/FAILED`) và `Order.status` (`PAID` hoặc `PAYMENT_FAILED`).

## Hệ quả
- **Ưu điểm:** an toàn khi bấm đúp và retry; kiểm thử được cả nhánh thành công lẫn thất bại mà không cần cổng thật; có thể thay bằng cổng thật sau này mà không đổi hợp đồng API.
- **Hạn chế:** mock không kiểm tra chữ ký, webhook hay đối soát như cổng thật; client phải tự sinh và giữ key ổn định cho mỗi lần thử.
- **Trade-off:** đổi độ sát thực tế lấy khả năng kiểm thử và tiến độ.

## Bằng chứng trong mã nguồn
`apps/api/src/payments/payments.controller.ts`, `apps/api/src/payments/payments.service.ts`, `apps/api/prisma/schema.prisma` (`Payment.idempotencyKey @unique`).
