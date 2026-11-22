# ADR-001: Monorepo và Modular Monolith

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-11-22
- **Liên quan:** ADR-002, ADR-008

## Bối cảnh
BrewLite gồm frontend (Next.js), backend (NestJS) và tài liệu. Nhóm nhỏ, thời gian ngắn, cần đổi API và giao diện cùng lúc mà không phải phối hợp giữa nhiều repository. Nghiệp vụ (menu, đơn hàng, thanh toán, khuyến mãi) gắn chặt với nhau và dùng chung một cơ sở dữ liệu.

## Quyết định
1. Dùng **một repository (monorepo)** với cấu trúc sau. Thư mục gốc dùng **npm workspaces** (`package.json` khai báo `apps/web` và `apps/api`).

```text
brewlite/
|-- apps/
|   |-- web/                   # Next.js mobile-first/PWA
|   `-- api/                   # NestJS
|-- docs/
|   |-- requirements/          # Task 1
|   |-- diagrams/              # Task 2
|   |-- architecture/          # Task 3 (README.md, adr/, diagrams/)
|   |-- traceability-matrix.md
|   `-- deployment.md
|-- tests/                     # Integration/E2E
|-- .github/workflows/         # CI/CD
|-- docker-compose.yml
|-- .env.example
`-- README.md
```

2. Backend là **NestJS Modular Monolith**: một tiến trình triển khai duy nhất, chia module theo chức năng: `auth`, `users`, `products`, `toppings`, `sizes`, `orders`, `payments`, `promotions`, cùng `prisma` dùng chung. Mọi module được nạp trong `AppModule`.
3. Trong mỗi module giữ kiến trúc phân lớp: Controller → Service → Data Access (Prisma).

## Phương án đã cân nhắc
| Phương án | Lý do không chọn |
|---|---|
| Nhiều repo (frontend, backend riêng) | Khó giữ đồng bộ hợp đồng API, tốn công cấu hình CI cho từng repo |
| Microservices | Quá phức tạp so với quy mô; cần giao dịch phân tán cho luồng đặt hàng - thanh toán - tồn kho |

## Hệ quả
- **Ưu điểm:** một lần clone, một pipeline CI, đổi API và UI trong cùng một commit; giao dịch DB đơn giản vì chung một PostgreSQL; dễ tách module thành service sau này nhờ ranh giới module rõ.
- **Hạn chế:** mọi module scale cùng nhau; lỗi nghiêm trọng ở một module có thể làm sập cả backend; ranh giới module chỉ được giữ bằng kỷ luật code, không do hạ tầng ép buộc.
- **Trade-off:** đổi khả năng scale độc lập lấy sự đơn giản trong phát triển và vận hành.

## Bằng chứng trong mã nguồn
`package.json` (workspaces), `apps/api/src/app.module.ts`, `docker-compose.yml`.

## Việc cần làm để mã nguồn khớp cấu trúc này
Mã nguồn hiện tại đang đặt tên thư mục là `frontend/` và `backend/`. Khi chuyển sang `apps/web` và `apps/api` cần:
1. `git mv frontend apps/web` và `git mv backend apps/api`, tạo `tests/` cho kiểm thử tích hợp/E2E (hiện các file `test-*.mjs` nằm ở thư mục gốc).
2. Sửa `workspaces` trong `package.json` gốc thành `["apps/web", "apps/api"]` và các script `--prefix`.
3. Sửa `build` context trong `docker-compose.yml` (`./apps/web`, `./apps/api`) và các `working-directory`/đường dẫn trong `.github/workflows/*.yml`.
4. Cập nhật `README.md` (lệnh chạy cục bộ) và `prisma.config.ts` nếu có đường dẫn tới `backend/`.
Các ADR khác và `README.md` kiến trúc đã dùng đường dẫn mới (`apps/web/...`, `apps/api/...`).
