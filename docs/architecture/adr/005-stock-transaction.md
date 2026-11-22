# ADR-005: Tồn kho và Transaction

- **Trạng thái:** Đã chấp nhận (có hai điểm cần rà soát, xem mục Rủi ro)
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-003, ADR-004

## Bối cảnh
Nhiều khách có thể đặt cùng một món khi chỉ còn ít hàng. Nếu kiểm tra tồn rồi trừ tồn ở hai bước tách rời, hai khách có thể cùng "thắng", gây bán lố. Ngược lại, nếu đơn tạo thành công mà trừ kho thất bại (hoặc ngược lại) thì dữ liệu lệch.

## Quyết định
1. **Tạo đơn và trừ tồn kho trong cùng một transaction** (`prisma.$transaction`). Thiếu hàng thì ném lỗi và **hủy cả hai** (đơn không được tạo, kho không bị trừ).
2. Trừ kho bằng **một câu lệnh cập nhật có điều kiện**: `updateMany` với `stock >= số lượng`, rồi `decrement`. Cập nhật có điều kiện chạy nguyên tử trong PostgreSQL nên không bán lố khi đặt đồng thời. Cột `version` được tăng mỗi lần trừ.
3. Khi đơn bị hủy, tồn kho được hoàn lại.
4. Dữ liệu tính tiền (giá, size, topping) luôn **đọc lại từ CSDL** trong transaction, không tin giá từ client.

## Hệ quả
- **Ưu điểm:** không bán lố; không có đơn "ma" thiếu kho; giá do server quyết định.
- **Hạn chế:** transaction giữ khóa dòng sản phẩm trong thời gian ngắn, ảnh hưởng thông lượng khi cực đông.
- **Trade-off:** chọn đúng đắn hơn hiệu năng tối đa; quy mô quán cà phê không cần nhiều hơn.

## Rủi ro cần rà soát trong code
1. `reserveStock` được gọi ở **cả** `OrdersService.create` (lúc tạo đơn) **và** `PaymentsService.pay` (khi thanh toán thành công). Nếu cả hai đều chạy cho cùng một đơn, tồn kho bị trừ hai lần. Cần quyết định trừ ở một thời điểm duy nhất rồi sửa lại code hoặc ghi rõ lý do trong tài liệu.
2. Việc hoàn kho khi hủy đơn (`OrdersService`) chạy **ngoài transaction** và nuốt lỗi (`.catch(() => {})`), nên có thể chuyển trạng thái sang `CANCELLED` nhưng kho không được hoàn. Nên gộp vào cùng transaction với việc đổi trạng thái.
3. Dòng kiểm tra `version` (optimistic locking) đang bị comment trong `products.service.ts`; hiện chỉ dựa vào điều kiện `stock >= số lượng`. Điều này vẫn an toàn, nhưng nên bỏ hoặc dùng hẳn `version` để không gây hiểu nhầm.

## Bằng chứng trong mã nguồn
`apps/api/src/orders/orders.service.ts`, `apps/api/src/products/products.service.ts` (`reserveStock`), `apps/api/src/payments/payments.service.ts`.
