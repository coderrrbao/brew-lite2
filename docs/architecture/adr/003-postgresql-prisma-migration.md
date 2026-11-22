# ADR-003: PostgreSQL, Prisma ORM và migration

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-005, ADR-008

## Bối cảnh
Dữ liệu đơn hàng, thanh toán, điểm thưởng cần tính toàn vẹn và giao dịch (transaction). Schema thay đổi liên tục trong quá trình phát triển, nhiều người cùng sửa.

## Quyết định
1. Lưu dữ liệu bằng **PostgreSQL 16**.
2. Truy cập qua **Prisma ORM** (schema duy nhất tại `apps/api/prisma/schema.prisma`, client sinh tự động).
3. Mọi thay đổi schema đi qua **migration được commit** trong `apps/api/prisma/migrations/` (hiện có 8 migration, từ `init` đến `add_payment_status`) để dựng lại cơ sở dữ liệu từ đầu tại bất kỳ máy nào. Dữ liệu mẫu nạp bằng `prisma/seed.ts`.
4. Môi trường triển khai áp migration bằng `prisma migrate deploy` (pipeline CD và Docker CI).

## Phương án đã cân nhắc
| Phương án | Lý do không chọn |
|---|---|
| MongoDB | Khó đảm bảo ràng buộc và giao dịch nhiều bảng cho đơn hàng - thanh toán - điểm thưởng |
| SQL thuần hoặc query builder | Mất kiểu dữ liệu an toàn và migration tích hợp |

## Hệ quả
- **Ưu điểm:** ràng buộc khóa ngoại, unique, index do DB bảo đảm; kiểu TypeScript sinh từ schema; lịch sử thay đổi CSDL nằm trong Git.
- **Hạn chế:** gắn chặt với Prisma; job kiểm tra chất lượng trong `ci.yml` dùng `prisma db push` thay vì `migrate deploy`, nên có thể không phát hiện migration bị lỗi (cần thống nhất, xem dưới); một số tên migration cần đặt lại cho đúng chính tả (ví dụ `add_table_save_uservorcher`).
- **Trade-off:** chấp nhận phụ thuộc công cụ để đổi lấy tốc độ phát triển và an toàn kiểu.

## Việc cần làm
Đổi bước `prisma db push` trong `ci.yml` thành `prisma migrate deploy` để CI kiểm tra đúng đường đi như môi trường thật.

## Bằng chứng trong mã nguồn
`apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/`, `.github/workflows/cd.yml`, `.github/workflows/docker-ci.yml`.
