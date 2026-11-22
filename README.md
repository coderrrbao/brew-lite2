# BrewLite

Ứng dụng đặt đồ uống: **Next.js** (frontend) + **NestJS/Prisma** (API) + **PostgreSQL**, đóng gói bằng Docker.
Luồng: Xem menu → Chọn size/topping → Giỏ hàng → Đặt đơn → Thanh toán (mô phỏng) → Theo dõi đơn.

```
apps/web     Next.js 15 (App Router)        apps/api    NestJS 11 + Prisma 7
docs/        yêu cầu, kiến trúc, ADR, deploy tests/      integration + E2E
.github/workflows/  ci.yml · cd.yml · rollback.yml
```

Tài liệu: [`docs/`](docs) · Truy vết: [`docs/traceability-matrix.md`](docs/traceability-matrix.md) · Triển khai & rollback: [`docs/deployment.md`](docs/deployment.md)

## Yêu cầu
Node.js 22+, npm 10+, Docker + Docker Compose.

## Chạy local bằng Docker
```bash
cp .env.example .env
docker compose up --build
```
Seed dữ liệu mẫu (chạy từ máy host, DB mở ở cổng 5433):
```bash
npm install
cd apps/api
npm run db:generate
DATABASE_URL="postgresql://brewlite:brewlite@localhost:5433/brewlite?schema=public" npm run db:seed
```
- Web: http://localhost:3000 · API: http://localhost:4000 · Health: http://localhost:4000/health

## Chạy local không build image
```bash
docker compose up -d db
npm install
cp .env.example .env            # DATABASE_URL đổi host db -> localhost:5433
npm run prisma:generate         # chạy từ root: dùng prisma.config.ts ở root (đọc .env)
npm run prisma:migrate          # hoặc: cd apps/api && DATABASE_URL=... npx prisma migrate deploy
npm run prisma:seed
npm run dev:api                 # terminal 1
npm run dev:web                 # terminal 2 (NEXT_PUBLIC_API_URL=http://localhost:4000)
```
> `apps/api/prisma.config.ts` không tự đọc `.env`; khi chạy lệnh prisma trong `apps/api` hãy truyền `DATABASE_URL` hoặc chạy từ thư mục gốc.

## Test
```bash
npm test --prefix apps/api                      # unit (payments spec cần DATABASE_URL tới Postgres)
npm run lint                                    # eslint (api) + tsc (web)
node tests/integration/test-e2e-api.mjs         # integration API (stack đang chạy + đã seed)
npx playwright install chromium && npm run test:e2e   # E2E UI menu -> xác nhận đơn
```
Chi tiết: [`tests/README.md`](tests/README.md).

## Build
```bash
npm run build:api && npm run build:web
docker compose build
```

## API chính
| Method | Endpoint | Ghi chú |
|---|---|---|
| GET | `/health` | Health check (DB) |
| GET | `/products`, `/products/:id`, `/sizes`, `/toppings` | Menu |
| POST | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | JWT access + refresh |
| GET | `/users/me`, `/users/me/points`, `/users/me/loyalty-history` | JWT; lịch sử điểm (EARN/REDEEM) |
| POST | `/orders` | JWT, tạo đơn (`PENDING`) |
| GET | `/orders/me` | JWT, lịch sử đơn |
| GET | `/orders/staff` · PATCH `/orders/:id/status` | STAFF |
| PATCH | `/orders/:id/user-status` | Khách: thanh toán lại (`PENDING`) / huỷ |
| POST | `/payments` | JWT, header `Idempotency-Key` |
| POST | `/payments/:id/confirm` | JWT, header `Idempotency-Key`, body `{success}` |
| GET/POST | `/promotions`, `/promotions/validate`, `/promotions/redeem` | Khuyến mãi / điểm |

## Deploy
Push `main` hoặc tag `vX.Y.Z` → **CD**: quality gate (CI) → build & push image API (`sha-<7>`) → `prisma migrate deploy` (Supabase) → Render (API) → Vercel (Web) → smoke test `/health`.
Seed production chỉ chạy thủ công (Actions → CD → *Run workflow* → tick `seed_database`) vì seed xoá toàn bộ dữ liệu.
Secrets và cấu hình: [`docs/deployment.md`](docs/deployment.md).

## Rollback
- **API:** Actions → *Rollback API* → nhập tag image (`sha-1a2b3c4`/`v1.0.0`) hoặc commit SHA (xem `docs/deployment.md`).
- **Web:** Vercel → Deployments → *Instant Rollback*.
- **DB:** migration chỉ đi tiến; sửa bằng migration mới.

## Đóng góp
Xem [`CONTRIBUTING.md`](CONTRIBUTING.md) và phân công nhóm [`docs/team-assignment.md`](docs/team-assignment.md).
