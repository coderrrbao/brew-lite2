# ADR-008: Đóng gói Docker Compose, CI/CD và cấu hình bằng biến môi trường

- **Trạng thái:** Đã chấp nhận (một phần: logging và `GET /health` chưa triển khai, xem mục Việc cần làm)
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-001, ADR-003

## Bối cảnh
Cần chạy được cùng một hệ thống (frontend, backend, PostgreSQL) trên máy từng thành viên, trên CI và trên máy chủ, mà không sửa mã. Thông tin nhạy cảm (mật khẩu DB, khóa JWT) không được nằm trong repository.

## Quyết định
1. **Đóng gói bằng Docker**: mỗi dịch vụ có `Dockerfile` riêng (frontend, backend); `docker-compose.yml` chạy ba dịch vụ `frontend`, `backend`, `db` (PostgreSQL 16-alpine, có volume `pgdata`).
2. **Thứ tự khởi động theo health check**: `db` dùng `pg_isready`; `backend` chờ `db` khỏe; `frontend` chờ `backend` khỏe. Hiện tại backend được kiểm tra bằng `GET /products`, frontend bằng `GET /`.
3. **CI/CD bằng GitHub Actions**: `ci.yml` (lint, kiểm thử và build cho backend và frontend), `docker-ci.yml` (build image, chạy compose, chạy `prisma migrate deploy`, kiểm tra `curl`, đẩy image lên **GHCR** khi push lên `main`), `cd.yml` (khi push lên `main`: chạy kiểm thử, rồi áp migration và seed lên cơ sở dữ liệu Supabase và kích hoạt triển khai backend trên Render).
4. **Cấu hình bằng biến môi trường** (`DATABASE_URL`, `JWT_*`, `CORS_ORIGIN`, `PORT`, `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`). `.env.example` làm mẫu; giá trị thật được đặt ở môi trường triển khai.

## Hệ quả
- **Ưu điểm:** môi trường nhất quán ("máy ai cũng chạy như nhau"); image bất biến theo tag, dễ quay lui; không lộ bí mật trong mã nguồn.
- **Hạn chế:** Docker Compose phù hợp một máy chủ, không tự mở rộng như Kubernetes; một số giá trị mặc định trong `docker-compose.yml` (ví dụ `change-me-in-production`) chỉ dành cho phát triển và tuyệt đối không dùng khi chạy thật.
- **Trade-off:** chọn công cụ đơn giản, dễ học thay vì nền tảng điều phối đầy đủ.

## Việc cần làm
1. **Health check:** chưa có endpoint `GET /health` riêng. Nên thêm endpoint trả `{ "status": "ok" }` (kiểm tra thêm kết nối DB) và đổi `healthcheck` của backend trong `docker-compose.yml` sang `/health`.
2. **Logging:** chưa có logging có cấu trúc; hiện chỉ dùng logger mặc định của NestJS. Nên bổ sung `Logger`/`pino`, ghi mã yêu cầu, mã người dùng (không ghi mật khẩu, token) cho các sự kiện quan trọng: đăng nhập, tạo đơn, thanh toán, đổi trạng thái.
3. **Migration khi khởi động:** `CMD` của image backend chỉ chạy ứng dụng, không tự chạy `prisma migrate deploy`; bước này đang nằm trong pipeline. Cần ghi rõ trong hướng dẫn triển khai.

## Bằng chứng trong mã nguồn
`docker-compose.yml`, `apps/api/Dockerfile`, `apps/web/Dockerfile`, `.env.example`, `.github/workflows/ci.yml`, `.github/workflows/docker-ci.yml`, `.github/workflows/cd.yml`.
