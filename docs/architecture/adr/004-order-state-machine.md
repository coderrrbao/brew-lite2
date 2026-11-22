# ADR-004: Máy trạng thái của đơn hàng (Order State Machine)

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-005, ADR-006

## Bối cảnh
Đơn hàng đi qua nhiều bước (thanh toán, pha chế, giao) với hai nhóm người dùng khác nhau (khách và nhân viên). Nếu cho phép đổi trạng thái tùy ý, dữ liệu sẽ sai (ví dụ đơn chưa thanh toán đã được pha chế).

## Quyết định
Trạng thái đơn hàng chỉ đổi theo bảng chuyển hợp lệ, kiểm tra tập trung tại `OrdersService.assertTransition`. Chuyển sai trả về lỗi 409 (Conflict).

| Từ | Được chuyển tới |
|---|---|
| PENDING | PAID, PAYMENT_FAILED, CANCELLED |
| PAID | PREPARING, CANCELLED |
| PREPARING | READY |
| READY | COMPLETED |
| PAYMENT_FAILED | PENDING, PAID, CANCELLED |
| COMPLETED, CANCELLED | (trạng thái cuối) |

Luồng chính: `PENDING → PAID → PREPARING → READY → COMPLETED`. Hai trạng thái thêm vào là `PAYMENT_FAILED` (thanh toán lỗi, cho thử lại) và `CANCELLED`.

Quy tắc theo vai trò:
- **Khách hàng** chỉ được đưa đơn của chính mình về `PENDING` (thử lại) hoặc `CANCELLED`.
- **Nhân viên (STAFF)** xử lý các bước `PAID → PREPARING → READY → COMPLETED`.
- Mỗi lần cập nhật dùng điều kiện `where: { id, status: <trạng thái cũ> }` để chống hai yêu cầu đổi trạng thái cùng lúc (trả 409 nếu bị chen).

## Hệ quả
- **Ưu điểm:** luật nghiệp vụ nằm một chỗ, dễ kiểm thử và dễ đối chiếu với sơ đồ trạng thái trong SRS; chặn được thao tác sai và race condition.
- **Hạn chế:** thêm trạng thái mới phải sửa bảng chuyển và enum `OrderStatus` trong Prisma; bảng chuyển nằm trong code, không nằm trong CSDL.
- **Trade-off:** chọn kiểm tra ở tầng service (dễ đọc, dễ test) thay vì ràng buộc ở tầng CSDL.

## Bằng chứng trong mã nguồn
`apps/api/src/orders/orders.service.ts` (`allowedOrderTransitions`), `apps/api/prisma/schema.prisma` (`enum OrderStatus`).
