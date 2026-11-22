# Trưởng nhóm — Nền tảng dự án (trưởng nhóm)

Folder này chứa **đúng các file của bạn**, đã nằm sẵn theo đường dẫn của repo mới.

> Làm **đầu tiên**, commit thẳng lên `main`, push xong thì 6 người mới tạo nhánh.

```bash
git init -b main && git remote add origin <url-repo-moi>
```

## Nhánh `main`

```bash
# chép toàn bộ file của nhánh này vào repo (đứng ở gốc repo mới)
cp -r <đường-dẫn>/brewlite-handoff/00-nen-tang/. .
```

Sau đó commit **lần lượt từng cụm** theo thứ tự dưới đây (mỗi cụm = 1 commit):

**Commit 1**
```bash
git add .gitignore .gitattributes .dockerignore
git commit -m "chore: khởi tạo repo với .gitignore và .gitattributes"
```

**Commit 2**
```bash
git add .env.example
git commit -m "chore: thêm file mẫu biến môi trường .env.example"
```

**Commit 3**
```bash
git add package.json package-lock.json prisma.config.ts
git commit -m "chore: cấu hình monorepo npm workspaces cho apps/api và apps/web"
```

**Commit 4**
```bash
git add apps/api/prisma/schema.prisma apps/api/prisma.config.ts
git commit -m "chore(db): thêm schema Prisma cho toàn bộ thực thể"
```

**Commit 5**
```bash
git add \
  "apps/api/prisma/migrations/20261030100000_init/migration.sql" \
  "apps/api/prisma/migrations/20261104120000_add_promotion_expiration/migration.sql" \
  "apps/api/prisma/migrations/20261104150000_add_user_role/migration.sql" \
  "apps/api/prisma/migrations/20261110095725_add_payment_status/migration.sql" \
  "apps/api/prisma/migrations/20261110170000_add_product_version/migration.sql" \
  "apps/api/prisma/migrations/20261113145017_add_order_points_spent/migration.sql" \
  "apps/api/prisma/migrations/20261118160602_add_table_save_uservorcher/migration.sql" \
  "apps/api/prisma/migrations/20261120090755_add_loyalty_transactions/migration.sql" \
  "apps/api/prisma/migrations/migration_lock.toml"
git commit -m "chore(db): thêm các migration cơ sở dữ liệu"
```

**Commit 6**
```bash
git add apps/api/prisma/seed.ts
git commit -m "chore(db): thêm dữ liệu mẫu seed (size, topping, sản phẩm, voucher, tài khoản)"
```

**Commit 7**
```bash
git add \
  "apps/api/package.json" \
  "apps/api/tsconfig.json" \
  "apps/api/nest-cli.json" \
  "apps/api/eslint.config.mjs" \
  "apps/api/.gitignore"
git commit -m "chore(api): khởi tạo dự án NestJS (package, tsconfig, eslint, nest-cli)"
```

**Commit 8**
```bash
git add apps/api/src/prisma/prisma.module.ts apps/api/src/prisma/prisma.service.ts
git commit -m "feat(api): thêm PrismaModule và PrismaService dùng chung"
```

**Commit 9**
```bash
git add apps/api/src/main.ts apps/api/src/app.module.ts
git commit -m "feat(api): thêm main.ts và AppModule đăng ký các module nghiệp vụ"
```

**Commit 10**
```bash
git add \
  "apps/web/package.json" \
  "apps/web/tsconfig.json" \
  "apps/web/next.config.ts" \
  "apps/web/postcss.config.mjs" \
  "apps/web/.gitignore"
git commit -m "chore(web): khởi tạo dự án Next.js (package, tsconfig, tailwind/postcss)"
```

**Commit 11**
```bash
git add \
  "apps/web/app/layout.tsx" \
  "apps/web/app/providers.tsx" \
  "apps/web/app/globals.css" \
  "apps/web/app/loading.tsx" \
  "apps/web/app/error.tsx" \
  "apps/web/app/not-found.tsx"
git commit -m "feat(web): thêm layout gốc, providers, CSS toàn cục và trang loading/lỗi/404"
```

**Commit 12**
```bash
git add apps/web/components/ui.tsx apps/web/components/Navbar.tsx
git commit -m "feat(web): thêm thành phần giao diện dùng chung (ui) và thanh điều hướng Navbar"
```

**Commit 13**
```bash
git add apps/web/lib/api/client.ts apps/web/lib/store.tsx apps/web/lib/utils.ts
git commit -m "feat(web): thêm API client có tự làm mới token, store giỏ hàng và tiện ích"
```

```bash
git push -u origin main
```

---
Muốn chạy tự động thay vì gõ tay: `./scripts/commit-00-nen-tang.sh <đường-dẫn-repo-mới>` (làm đúng các bước trên).
