# ADR-007: Xác thực JWT (stateless) và băm mật khẩu bcrypt

- **Trạng thái:** Đã chấp nhận (có hạn chế về refresh token, xem mục Rủi ro)
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-002

## Bối cảnh
Hệ thống có hai vai trò (CUSTOMER, STAFF) và cần bảo vệ các API đơn hàng, điểm thưởng. Backend nên dễ scale ngang và không phụ thuộc kho session riêng.

## Quyết định
1. Mật khẩu **không lưu dạng gốc**: băm bằng **bcrypt** (thư viện `bcryptjs`, 12 vòng) trước khi lưu vào `User.passwordHash`.
2. Đăng nhập thành công trả về **JWT access token (hạn 30 phút)** và refresh token. **Server không lưu session cho access token**: mỗi yêu cầu được xác thực bằng chữ ký JWT qua `JwtAuthGuard`; quyền nhân viên kiểm tra bằng `StaffGuard`.
3. Đầu vào được kiểm tra bằng **DTO + ValidationPipe** (`whitelist`, `transform`).
4. Bí mật ký token (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) lấy từ biến môi trường, không commit vào mã nguồn.

## Hệ quả
- **Ưu điểm:** access token không cần tra cứu CSDL cho mỗi yêu cầu; dễ chạy nhiều bản backend; lộ CSDL không làm lộ mật khẩu gốc.
- **Hạn chế:** không thu hồi được access token trước khi hết hạn (tối đa 30 phút).
- **Trade-off:** đổi khả năng thu hồi tức thì lấy sự đơn giản và khả năng scale.

## Rủi ro cần rà soát trong code
1. **Refresh token đang lưu trong bộ nhớ RAM của tiến trình** (`RefreshTokensService` dùng `Map`). Vì vậy câu "server không lưu session" chỉ đúng với **access token**; refresh token sẽ mất khi backend khởi động lại và không dùng được khi chạy nhiều bản backend. Nên chuyển sang bảng trong PostgreSQL hoặc Redis nếu cần scale.
2. `REFRESH_TTL_SECONDS = 24 * 60 * 7` bằng 10.080 giây (khoảng 2 giờ 48 phút), có vẻ chưa đúng ý định "7 ngày" (7 × 24 × 60 × 60 giây). Cần xác nhận lại giá trị mong muốn.
3. `ThrottlerModule` đã được khai báo trong `AuthModule` (20 yêu cầu mỗi phút) nhưng **chưa có `ThrottlerGuard` nào được áp dụng** (không có `APP_GUARD` hay `@UseGuards(ThrottlerGuard)`), nên giới hạn tần suất đăng nhập **chưa hoạt động**. Cần gắn guard để chống dò mật khẩu.
4. Frontend lưu token trong `localStorage`, dễ bị đánh cắp nếu có lỗ hổng XSS. Cách giảm thiểu: cookie `HttpOnly` cho refresh token.

## Bằng chứng trong mã nguồn
`apps/api/src/auth/auth.service.ts`, `apps/api/src/auth/auth.module.ts`, `apps/api/src/auth/refresh-tokens.service.ts`, `apps/api/src/auth/jwt-auth.guard.ts`, `apps/api/src/auth/staff.guard.ts`, `apps/web/lib/api/client.ts`.
