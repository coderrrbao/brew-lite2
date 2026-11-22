# BrewLite – Bối cảnh, Stakeholder và Phạm vi

## 1. Bối cảnh và vấn đề nghiệp vụ

### 1.1 Bối cảnh

BrewLite là ứng dụng web **đặt và thanh toán đồ uống không dùng tiền mặt** cho cửa hàng bán nước. Khách chọn đồ uống, tùy chọn size/topping, thanh toán bằng ví điện tử hoặc thẻ, nhận mã đơn rồi **đến quầy lấy đồ uống**.

Luồng nghiệp vụ tối thiểu: **Xem menu → Chọn tùy chọn → Giỏ hàng → Đặt đơn → Thanh toán → Theo dõi đơn**. Frontend dùng Next.js theo hướng mobile-first/PWA (`apps/web`), backend dùng NestJS (`apps/api`), dữ liệu lưu trong PostgreSQL và đóng gói bằng Docker. Dự án đi từ khai thác yêu cầu, mô hình hóa và thiết kế kiến trúc, qua hai Sprint hiện thực, đến triển khai lên môi trường production truy cập được qua HTTPS.

Assignment 2 kế thừa mã nguồn của Assignment 1 (repository `coderrrbao/brew-lite`), được tái cấu trúc theo yêu cầu A2 (`apps/web`, `apps/api`, `docs`, `tests`, `.github/workflows`).

### 1.2 Vấn đề nghiệp vụ cần giải quyết

| # | Vấn đề | Cách BrewLite giải quyết |
| --- | --- | --- |
| P1 | Khách phải xếp hàng để gọi món và trả tiền ở quầy, nhất là giờ cao điểm | Đặt món và thanh toán trước trên web, đến quầy chỉ nhận đồ uống |
| P2 | Phải mang tiền mặt, thu ngân tốn thời gian thối tiền | Thanh toán không tiền mặt (Ví / Thẻ) |
| P3 | Gọi món miệng dễ nhầm size, topping | Chọn tùy chọn trực tiếp, giá tự tính theo tùy chọn |
| P4 | Khách không biết đơn đã được ghi nhận hay chưa | Màn hình xác nhận có mã đơn, trạng thái; xem lịch sử đơn |
| P5 | Thanh toán bị lặp, bán quá số lượng còn lại khi nhiều khách đặt cùng lúc | Thanh toán idempotent; kiểm soát tồn kho bằng transaction và optimistic locking |
| P6 | Đơn hàng chuyển trạng thái tùy tiện, khó kiểm soát | Order State Machine chặn chuyển trạng thái không hợp lệ |
| P7 | Khó giữ chân khách quen | Khuyến mãi, tích điểm thưởng và đổi điểm lấy voucher |

### 1.3 Mục tiêu của dự án

1. Xây dựng MVP chạy được end-to-end: **xem menu → chọn tùy chọn → giỏ hàng → đăng nhập → đặt đơn → thanh toán → xác nhận và theo dõi đơn**.
2. Thực hiện đầy đủ chuỗi công việc từ yêu cầu đến triển khai: khai thác yêu cầu, mô hình hóa, thiết kế kiến trúc, hiện thực qua 2 Sprint theo Agile Scrum.
3. Thiết lập CI/CD và triển khai một phiên bản production truy cập được qua HTTPS.
4. Bàn giao sản phẩm gồm mã nguồn Git, tài liệu, ma trận truy vết, release notes, README, video demo, Sprint Review và Retrospective.

## 2. Bảng Stakeholder

| Stakeholder | Vai trò | Mục tiêu | Kỳ vọng với hệ thống | Trong MVP? |
| --- | --- | --- | --- | --- |
| **Khách hàng** | Người dùng chính: đặt đồ uống, chọn size/topping, thanh toán, theo dõi đơn | Đặt nhanh, thanh toán không tiền mặt, ít phải chờ | Menu có hình/tên/giá; chọn size, topping; giỏ hàng tự tính tiền; đăng ký/đăng nhập; thanh toán Ví/Thẻ; xem mã đơn, trạng thái và lịch sử đơn; dùng khuyến mãi, tích điểm; dùng tốt trên điện thoại | Có |
| **Nhân viên quầy / Barista** | Tiếp nhận đơn, cập nhật trạng thái pha chế | Nhận đơn đã thanh toán, pha chế đúng | Danh sách đơn cần pha; cập nhật PREPARING / READY / COMPLETED | **Một phần** – API dành cho vai trò STAFF có trong MVP (`GET /orders/staff`, `PATCH /orders/:id/status`); giao diện barista riêng là phần mở rộng |
| **Quản lý cửa hàng / Product Owner (PO)** | Xác định yêu cầu, ưu tiên Product Backlog, nghiệm thu Increment sau mỗi Sprint | Sản phẩm đáp ứng nhu cầu cửa hàng, việc giá trị cao được làm trước | Backlog rõ ràng, mỗi Sprint có bản chạy được, tiêu chí chấp nhận kiểm chứng được | Có (vai trò Scrum) |
| **Giảng viên nghiệm thu** | Đánh giá quy trình, tạo phẩm và mức độ đáp ứng tiêu chí chấp nhận | Xác nhận nhóm làm đúng chuỗi từ yêu cầu đến triển khai, sản phẩm chạy được trên production | Tạo phẩm Task 1–3 nằm trong docs, có lịch sử commit/PR rõ ràng; ma trận truy vết; CI/CD chạy thành công; URL production, API và `/health` truy cập được; release notes, README, video demo, Retrospective | Có |
| **Nhóm phát triển** (Development Team, gồm Scrum Master) | Phân tích, thiết kế, lập trình, kiểm thử, triển khai, bàn giao | Hoàn thành 5 task đúng thứ tự, đạt Definition of Done | Phạm vi rõ ràng, công nghệ cố định (Next.js, NestJS, PostgreSQL), tiêu chí chấp nhận cụ thể, nền tảng triển khai ổn định, phân công module rõ ràng | Có |
| **Đơn vị thanh toán** | Cung cấp hoặc được mô phỏng qua cổng thanh toán Ví/Thẻ | Xử lý yêu cầu thanh toán hợp lệ, trả kết quả thành công/lỗi | Nhận yêu cầu thanh toán qua API, hỗ trợ idempotency; trong bài là **mock payment** mô phỏng Momo/VNPay/Stripe | Có (mô phỏng) |

## 3. Phạm vi dự án

### 3.1 In-scope (MVP)

Task 1–3 hoàn thành trước Sprint 1; Sprint 1 ứng với Task 4; Sprint 2 ứng với Task 5. Phạm vi bên dưới bám theo hiện trạng mã nguồn và cấu trúc repository A2.

| Mã | Chức năng / Hạng mục | Task | Sprint |
| --- | --- | --- | --- |
| IS-01 | Tài liệu yêu cầu và thiết kế: context-and-scope, SRS (FR/NFR, MoSCoW), use-case, activity/sequence/class diagram, mô tả kiến trúc, ADR, deployment diagram | 1–3 | Trước Sprint 1 |
| IS-02 | Repository theo cấu trúc A2: `apps/web`, `apps/api`, `docs/`, `tests/`, `.github/workflows/` (npm workspaces); `README.md`, `.gitignore`, `.env.example`, `docker-compose.yml`; chiến lược branch `<module>/<lớp>` và pull request (`CODEOWNERS`, PR template), quy ước commit (Conventional Commits), Definition of Done, Product Backlog (`docs/backlog.md`, issue board) cho 2 Sprint | 4.1 | 1 |
| IS-03 | Quản lý tài liệu: đưa tạo phẩm Task 1–3 vào `docs`; mọi thay đổi yêu cầu, sơ đồ, kiến trúc đi qua commit/PR kèm lý do | 4.2 | 1 |
| IS-04 | API `GET /products`, `GET /products/:id` (id, tên, giá, ảnh); dữ liệu sản phẩm lưu trong PostgreSQL qua Prisma, có dữ liệu mẫu/seed | 4.3 | 1 |
| IS-05 | Màn hình Menu bằng Next.js: lưới sản phẩm, lọc sản phẩm, xem chi tiết; trạng thái loading, empty, error | 4.3 | 1 |
| IS-06 | CI chạy khi mở pull request: Install → Lint → Unit Test → Build cho `apps/api` và `apps/web`, kèm dựng stack Docker Compose để chạy integration test và E2E; không merge nếu lỗi | 4.4 | 1 |
| IS-07 | Chi tiết sản phẩm: chọn size S/M/L, topping (`GET /sizes`, `GET /toppings`), tính giá theo tùy chọn | 5.1 | 2 |
| IS-08 | Giỏ hàng: thêm/sửa số lượng/xóa, lưu state (localStorage), tự tính tổng, badge số lượng | 5.1 | 2 |
| IS-09 | Đăng ký/đăng nhập: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`; băm mật khẩu bcrypt, phát JWT (access + refresh), guard bảo vệ route đặt đơn và thanh toán | 5.1 | 2 |
| IS-10 | Tạo đơn `POST /orders`: validate, transaction, kiểm soát tồn kho khi nhiều khách đặt đồng thời, lưu đơn `PENDING`, trả mã đơn | 5.1 | 2 |
| IS-11 | Thanh toán Ví/Thẻ mô phỏng, hai bước `POST /payments` và `POST /payments/:id/confirm`: idempotent bằng `Idempotency-Key`; đơn → `PAID` hoặc `PAYMENT_FAILED`; giữ nguyên giỏ khi lỗi | 5.1 | 2 |
| IS-12 | Order State Machine `PENDING → PAID → PREPARING → READY → COMPLETED`, cùng nhánh `PAYMENT_FAILED`, `CANCELLED`; chặn chuyển trạng thái không hợp lệ; STAFF cập nhật trạng thái qua `PATCH /orders/:id/status`; khách thanh toán lại hoặc hủy đơn của mình qua `PATCH /orders/:id/user-status` | 5.1 | 2 |
| IS-13 | Khuyến mãi: `GET /promotions`, kiểm tra mã theo tạm tính `POST /promotions/validate`, đổi điểm lấy voucher `POST /promotions/redeem` | 5.1 | 2 |
| IS-14 | Màn hình xác nhận đơn (mã đơn, trạng thái) và lịch sử đơn `GET /orders/me` | 5.1 | 2 |
| IS-15 | Điểm thưởng: cộng `loyaltyPoints` khi đơn `PAID`, trừ điểm khi dùng/đổi voucher, ghi `LoyaltyTransaction` (EARN/REDEEM) trong cùng transaction; `GET /users/me/points`, `GET /users/me/loyalty-history` | 5.1 | 2 |
| IS-16 | Kiểm thử: unit test cho nghiệp vụ quan trọng (state machine, tồn kho, idempotency, điểm thưởng); integration test API tạo đơn/thanh toán (`tests/integration`); test đồng thời tồn kho; ít nhất 1 E2E Playwright từ menu đến xác nhận đơn (`tests/e2e`); test component frontend (Vitest) | 5.2 | 2 |
| IS-17 | Migration Prisma/seed tái tạo được database; `docker-compose.yml` chạy frontend, backend, PostgreSQL (và bước migrate) ở local; **`GET /health`** kiểm tra kết nối DB, dùng cho Docker Compose, nền tảng deploy và smoke test | 5.2 | 2 |
| IS-18 | Pipeline CD: Push/Tag → Lint và Test → Build Docker image API (tag `sha-<commit>`, hoặc `vX.Y.Z`) → Push GitHub Container Registry → Migration an toàn (`prisma migrate deploy`) → Deploy → Smoke test (`/health`, `/products`, web); dừng pipeline khi lỗi và có workflow rollback | 5.3 | 2 |
| IS-19 | Production: URL frontend qua HTTPS (Vercel), URL API và health check (Render), database PostgreSQL không public trực tiếp (Supabase), secret nằm trong secret của CI/nền tảng | 5.4 | 2 |
| IS-20 | Bàn giao: release/tag và release notes, README (chạy local, test, build, deploy, rollback), video demo end-to-end, Sprint Review, Sprint Retrospective | 5.4 | 2 |
| IS-21 | Truy vết: `docs/traceability-matrix.md` nối yêu cầu → use-case/user story → sơ đồ → code/API → test | 1–5 | Xuyên suốt |
| IS-22 | Yêu cầu phi chức năng: API phản hồi < 500 ms với dữ liệu mẫu; bảo mật (băm mật khẩu, JWT, validate đầu vào, secret thật khi deploy); khả dụng (chạy trên các trình duyệt web, mobile-first); khả năng triển khai | 1–5 | Xuyên suốt |
| IS-23 | Quy trình Scrum: Product Backlog, Sprint Planning, Sprint Review, Sprint Retrospective, Definition of Done | 4–5 | 1–2 |

**Công nghệ bắt buộc:** Next.js (Frontend), NestJS (Backend), PostgreSQL và Docker.

**Nền tảng triển khai:** Vercel (frontend), Render (API), Supabase (PostgreSQL), GitHub Container Registry (image), GitHub Actions (CI/CD).

### 3.2 Phạm vi mở rộng

| Mã | Nội dung |
| --- | --- |
| EX-01 | **Giao diện Nhân viên quầy/Barista**: hàng đợi đơn `PAID` và cập nhật `PREPARING` / `READY` / `COMPLETED` trên web (phần API đã có trong MVP) |
| EX-02 | Trang quản trị menu cho quản lý (thêm/sửa/ẩn sản phẩm, giá, tồn kho) |
| EX-03 | Tích hợp cổng thanh toán thật (Momo/VNPay/Stripe) thay cho mock |
| EX-04 | Thông báo khi đơn sẵn sàng (realtime, push của PWA, email hoặc SMS) |
| EX-05 | Báo cáo doanh thu, món bán chạy |
| EX-06 | Hoàn tiền khi khách hủy đơn đã thanh toán |
| EX-07 | Nhiều chi nhánh, đa ngôn ngữ |
| EX-08 | PWA đầy đủ: cài đặt lên màn hình chính (manifest, icon), hoạt động offline |
| EX-09 | Màn hình xem lịch sử điểm thưởng cho khách (API `GET /users/me/loyalty-history` đã có) |
| EX-10 | Log có cấu trúc, giám sát và cảnh báo (hiện dùng log mặc định của NestJS/Render) |

### 3.3 Out-of-scope

| Mã | Nội dung | Lý do |
| --- | --- | --- |
| OS-01 | Thanh toán tiền mặt | Hệ thống chỉ hỗ trợ thanh toán không tiền mặt |
| OS-02 | Giao hàng tận nơi | Khách nhận đồ uống tại quầy |
| OS-03 | Ứng dụng di động native | Chỉ làm web, chạy trên trình duyệt |
| OS-04 | Giao dịch tiền thật, lưu dữ liệu thẻ | Chỉ dùng mock payment, tránh rủi ro bảo mật |
| OS-05 | Quản lý kho nguyên liệu chi tiết, nhà cung cấp | Chỉ kiểm soát tồn kho theo trường `stock` của sản phẩm |
| OS-06 | Quản lý nhân sự, chấm công, lương | Không liên quan nghiệp vụ đặt món |
| OS-07 | Hóa đơn điện tử, máy in bill, phần cứng POS | Ngoài phạm vi bài tập lớn |
| OS-08 | Tối ưu chịu tải lớn, auto-scaling, nhiều vùng triển khai | Production chỉ cần chạy ổn định cho demo và nghiệm thu, dùng gói miễn phí hoặc chi phí thấp |

## 4. Giả định

| Mã | Giả định |
| --- | --- |
| A-01 | Hệ thống phục vụ **một cửa hàng**; khách nhận đồ uống **tại quầy** |
| A-02 | Cổng thanh toán là **mock service** (mô phỏng Momo/VNPay/Stripe); kết quả thành công/thất bại do giao diện mô phỏng gửi lên khi xác nhận, dùng để kiểm thử cả hai nhánh |
| A-03 | Có hai vai trò: **CUSTOMER** (đăng ký trong MVP) và **STAFF** (tài khoản tạo sẵn bằng seed) |
| A-04 | Khách phải **đăng nhập** mới được đặt đơn và thanh toán; khách chưa đăng nhập vẫn xem được menu và thêm vào giỏ |
| A-05 | Trong MVP, việc chuyển `PAID → PREPARING → READY → COMPLETED` do tài khoản STAFF thực hiện qua API (hoặc script/test), chưa có giao diện barista |
| A-06 | Dữ liệu menu là **dữ liệu mẫu (seed)** quy mô nhỏ, mỗi sản phẩm có trường `stock` |
| A-07 | Mã khuyến mãi là dữ liệu cấu hình sẵn; điểm thưởng cộng vào `loyaltyPoints` của User và ghi nhận bằng `LoyaltyTransaction` sau khi đơn `PAID` (`⌊tổng tiền / 1000⌋` điểm) |
| A-08 | Dự án có 2 Sprint, nhóm 6 người có đủ vai trò PO, SM, Development Team; 1 thành viên phụ trách khung chương trình, CI/CD và test tổng, 5 thành viên phụ trách module (kèm view tương ứng) |
| A-09 | Giảng viên đóng vai khách hàng/PO nghiệm thu, sẵn sàng làm rõ yêu cầu theo lịch học phần và được cấp quyền truy cập repository |
| A-10 | Giá và tổng tiền dùng đơn vị VND; giao diện tiếng Việt |
| A-11 | Nhóm dùng Vercel, Render và Supabase (gói miễn phí hoặc chi phí thấp), hỗ trợ HTTPS, Docker và PostgreSQL |

## 5. Ràng buộc

| Mã | Loại | Ràng buộc |
| --- | --- | --- |
| C-01 | Công nghệ | Bắt buộc **Next.js (mobile-first/PWA), NestJS, PostgreSQL**; triển khai bằng Docker. Có thể bổ sung công nghệ khác (Prisma, Playwright, Vitest...) nhưng không thay thế ba thành phần đầu |
| C-02 | Quy trình | Theo Agile Scrum: 2 Sprint (Sprint 1 ứng với Task 4, Sprint 2 ứng với Task 5), 4 sự kiện, 3 tạo phẩm (Product Backlog, Sprint Backlog, Increment) |
| C-03 | Thứ tự thực hiện | 5 task làm tuần tự; task sau chỉ được nghiệm thu khi tạo phẩm bắt buộc của task trước đã có trên repository và có lịch sử thay đổi rõ ràng |
| C-04 | Chấm điểm | 5 task, mỗi task 2 điểm, tổng 10 điểm |
| C-05 | Definition of Done | Code chạy được, CI xanh (lint, test, build); commit Git rõ ràng và được review qua PR; API có validate, UI có loading/lỗi cơ bản; có hướng dẫn chạy trong README |
| C-06 | Hiệu năng | Thời gian phản hồi API < 500 ms với dữ liệu mẫu |
| C-07 | Bảo mật | Mật khẩu băm (bcrypt), token JWT, validate dữ liệu đầu vào; secret không xuất hiện trong repository hoặc log CI; database production không public trực tiếp |
| C-08 | Kiểm thử và CI | Có unit test, integration test cho tạo đơn/thanh toán, ít nhất 1 e2e test; pull request không được merge nếu lint, test hoặc build thất bại. Test phải chứng minh: chặn chuyển trạng thái sai; cùng `Idempotency-Key` gửi 2 lần chỉ tạo 1 thanh toán/đơn; đặt đồng thời không vượt tồn kho |
| C-09 | Triển khai và bàn giao | Có URL frontend qua HTTPS, URL API và `/health`; release/tag, release notes, README (chạy local, test, build, deploy, rollback), video demo. Nếu không có URL production hoạt động lúc chấm thì phần triển khai của Task 5 không được tính |
| C-10 | Truy vết | Có `docs/traceability-matrix.md`; nếu task trước thiếu tạo phẩm bắt buộc thì task sau không được tính phần truy vết |
| C-11 | Tài liệu | Tài liệu yêu cầu đặt trong `docs/requirements/`, sơ đồ trong `docs/diagrams/`, kiến trúc trong `docs/architecture/`; mọi thay đổi đi qua commit/PR |
| C-12 | Thời gian/nhân lực | Thời hạn học phần cố định, nhóm sinh viên kỹ năng không đồng đều, không có ngân sách |

## 6. Rủi ro ban đầu

XS = xác suất xảy ra.

| Mã | Rủi ro | XS | Tác động | Biện pháp giảm thiểu |
| --- | --- | --- | --- | --- |
| R-01 | Sprint 2 quá tải: hoàn thiện MVP, kiểm thử, CD và production cùng nằm trong một Sprint | Cao | Cao | Chuẩn bị Docker, CI và khung deploy từ Sprint 1; ưu tiên luồng chính; điều chỉnh phạm vi tại Daily Scrum |
| R-02 | Nghiệp vụ nâng cao (idempotency, optimistic locking, state machine, loyalty) phức tạp, không kịp thời gian | Cao | Cao | Thiết kế sớm từ Task 2–3, dùng sequence diagram làm chuẩn; ưu tiên 3 test tiêu chí; khuyến mãi/loyalty làm cuối |
| R-03 | Production không truy cập được lúc chấm (nền tảng lỗi, gói miễn phí tạm dừng, cold start) | Trung bình | Cao | Chọn nền tảng ổn định; có `/health` và smoke test có retry; kiểm tra lại trước buổi chấm; giữ sẵn bản release ổn định |
| R-04 | Lỗ hổng bảo mật cơ bản: lộ secret (JWT secret, DB URL) trong repo hoặc log CI, thiếu validate, thiếu guard (ví dụ endpoint thanh toán không yêu cầu JWT) | Trung bình | Cao | Dùng secret của CI, `.env.example` không chứa giá trị thật, class-validator, guard cho route đặt đơn và thanh toán, review bảo mật trước demo |
| R-05 | Migration lỗi khi deploy làm hỏng dữ liệu production | Trung bình | Cao | Thử migration ở local và CI trước; `prisma migrate deploy` (chỉ đi tiến) chạy ở CD trước khi deploy API; có hướng dẫn rollback |
| R-06 | Pipeline CI/CD lỗi hoặc không quay lại được bản trước khi triển khai thất bại | Trung bình | Cao | Tag image bằng commit SHA; smoke test sau deploy; dừng pipeline khi lỗi; workflow rollback và hướng dẫn trong README |
| R-07 | Race condition khi đặt đơn và thanh toán, dữ liệu đơn và thanh toán không khớp | Trung bình | Cao | Dùng transaction; lưu `idempotencyKey` ở bảng Payment; viết integration test đồng thời |
| R-08 | Thiếu giao diện barista nên khó demo chuyển trạng thái sau `PAID` | Trung bình | Trung bình | Dùng tài khoản STAFF gọi API, script hoặc test để chứng minh State Machine; ghi rõ trong demo |
| R-09 | Mock payment khác hành vi cổng thật, gây hiểu sai nghiệp vụ | Thấp | Trung bình | Thiết kế mock có nhánh thành công/lỗi; tách lớp adapter để thay thế sau |
| R-10 | `docker-compose` không chạy được trên máy khác khi demo hoặc khi người ngoài nhóm kiểm tra | Trung bình | Cao | Chạy thử từ repository sạch; cung cấp `.env.example`; nhờ người ngoài nhóm chạy theo README |
| R-11 | Tài liệu (SRS, use-case, sơ đồ, deployment) mâu thuẫn nhau hoặc không khớp với code và schema | Trung bình | Trung bình | Review chéo; cập nhật ma trận truy vết cùng pull request thay đổi |
| R-12 | Làm tài liệu và code dồn vào cuối nên không có lịch sử commit/PR rõ ràng | Trung bình | Cao | Commit từng tạo phẩm ngay khi xong; theo quy ước commit; kiểm tra lịch sử trước khi nộp |
| R-13 | Thay đổi hoặc hiểu sai yêu cầu giữa PO và nhóm | Trung bình | Trung bình | Viết user story kèm tiêu chí chấp nhận; chốt tại Sprint Planning; ghi thay đổi vào Backlog |
| R-14 | Xung đột mã nguồn khi 6 người làm song song (nhất là `schema.prisma`, `app.module.ts`, `seed.ts`) | Trung bình | Trung bình | Quy ước branch `<module>/<lớp>`, `CODEOWNERS`, review chéo; file dùng chung do Người 1 review; thống nhất hợp đồng API sớm |
| R-15 | Thành viên chênh lệch kỹ năng NestJS, Next.js, TypeScript, Docker | Trung bình | Trung bình | Phân công theo thế mạnh, pair programming, chia sẻ tài liệu nội bộ |
| R-16 | Tồn kho bị lệch giữa các bước tạo đơn, thanh toán và hủy (giữ hoặc hoàn tồn kho không nhất quán) | Trung bình | Cao | Chỉ giữ tồn kho ở một bước, hoàn tồn trong transaction; chạy test đồng thời (`tests/integration/test-race-condition.mjs`) |
| R-17 | Seed chạy trên database production xóa toàn bộ dữ liệu | Thấp | Cao | Không seed tự động trong CD; chỉ chạy thủ công có xác nhận (`seed_database`) |
| R-18 | Lockfile và workspace lệch nhau làm CI `npm ci` lỗi | Trung bình | Trung bình | CI dùng `npm install`; commit lại `package-lock.json` sau khi đổi cấu trúc thư mục |