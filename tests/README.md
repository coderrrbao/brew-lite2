# Tests

| Thư mục | Loại | Lệnh |
|---|---|---|
| `apps/api/src/**/*.spec.ts` | Unit (Jest) | `npm test --prefix apps/api` |
| `tests/integration` | Integration API | `npm run test:integration` |
| `tests/e2e` | E2E UI (Playwright) | `npm run test:e2e` |

## E2E (Playwright)
File: `tests/e2e/checkout.spec.ts` – luồng UC-01: Menu → size/topping → Giỏ hàng → Đăng ký → Thanh toán mô phỏng → Xác nhận → Lịch sử đơn. Gồm thêm các nhánh: thanh toán thất bại → thanh toán lại / hủy đơn, và chưa đăng nhập bị chặn.

```bash
# 1) Dựng stack + seed DB (docker compose up --build, hoặc dev:api + dev:web)
# 2) Cài trình duyệt (1 lần)
npx playwright install chromium
# 3) Chạy
npm run test:e2e
# Biến tuỳ chọn: E2E_BASE_URL (mặc định http://localhost:3000)
npm run test:e2e:report   # xem báo cáo HTML
```
Mỗi test tự đăng ký tài khoản có email duy nhất nên có thể chạy lặp lại mà không cần reset DB.
