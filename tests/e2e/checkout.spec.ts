import { test, expect, type Page } from '@playwright/test';

/**
 * E2E – luồng end-to-end của BrewLite (UC-01 Đặt và thanh toán đơn hàng):
 *   Xem menu → Chọn size/topping → Giỏ hàng → (chưa đăng nhập) → Đăng ký
 *   → Đặt đơn → Thanh toán mô phỏng → Xác nhận đơn → Lịch sử đơn.
 *
 * Yêu cầu: stack đang chạy, DB đã seed (sản phẩm "Cà Phê Sữa Đá", size S/M/L, topping "Trân châu đen").
 * Mỗi test tự đăng ký tài khoản mới (email duy nhất) nên không phụ thuộc/không làm bẩn dữ liệu seed.
 */

const PRODUCT_NAME = 'Cà Phê Sữa Đá';
const TOPPING_LABEL = 'Trân châu đen';
const PASSWORD = 'matkhau123';

const digits = (s: string | null | undefined) => (s ?? '').replace(/\D/g, '');

function uniqueUser() {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return { name: 'Khách E2E', email: `e2e.${id}@example.com` };
}

async function addDrinkToCart(page: Page) {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Hôm nay bạn muốn uống gì?' }),
  ).toBeVisible();

  // Menu: có danh sách món, mở chi tiết món
  await page.getByRole('link', { name: new RegExp(PRODUCT_NAME) }).last().click();
  await expect(page).toHaveURL(/\/product\/.+/);
  await expect(page.getByRole('heading', { level: 1, name: PRODUCT_NAME })).toBeVisible();

  // Chọn size L + topping + tăng số lượng lên 2
  await page.getByRole('radio', { name: /^L\b/ }).click();
  await page.getByRole('checkbox', { name: new RegExp(TOPPING_LABEL) }).click();
  await page.getByRole('button', { name: 'Tăng số lượng' }).click();

  const addButton = page.getByRole('button', { name: /Thêm vào giỏ/ });
  await expect(addButton).toBeEnabled();
  const expectedTotal = digits(await addButton.textContent());
  expect(Number(expectedTotal)).toBeGreaterThan(0);

  await addButton.click();
  await expect(page.getByRole('button', { name: /Đã thêm vào giỏ/ })).toBeVisible();
  await page.getByRole('link', { name: /Xem giỏ hàng \(2 món\)/ }).click();

  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Giỏ hàng' })).toBeVisible();
  return expectedTotal;
}

async function registerViaUi(page: Page, user: { name: string; email: string }) {
  await page.getByRole('tab', { name: 'Đăng ký' }).click();
  await page.getByLabel('Họ và tên').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(PASSWORD);
  await page.getByLabel('Xác nhận mật khẩu').fill(PASSWORD);
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
  // Sau khi đăng ký thành công app chuyển về menu và navbar hiển thị tên người dùng
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: /^Đăng nhập$/ })).toHaveCount(0);
}

async function goToCheckoutAsGuestThenLogin(page: Page, user: { name: string; email: string }) {
  // Chưa đăng nhập → bị chặn tại giỏ hàng, được dẫn tới trang đăng nhập
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
  const toast = page.getByRole('alert').filter({ hasText: 'Bạn cần đăng nhập' });
  await expect(toast).toBeVisible();
  await toast.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await registerViaUi(page, user);

  // Giỏ hàng vẫn được giữ lại sau khi đăng ký
  await page.goto('/cart');
  await expect(page.getByRole('heading', { level: 1, name: 'Giỏ hàng' })).toBeVisible();
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Thanh toán' })).toBeVisible();
}

async function startPayment(page: Page) {
  await page.getByRole('radio', { name: /Ví MoMo/ }).click();
  await page.getByRole('button', { name: /Xác nhận thanh toán/ }).click();
  
  await expect(page.getByText('Quét mã để thanh toán')).toBeVisible();
  
  await expect(page.locator('p', { hasText: /^Mã đơn:/ })).toBeVisible();
}
test.describe('E2E – Đặt và thanh toán đơn hàng (UC-01)', () => {
  test('happy path: menu → size/topping → giỏ → đăng ký → thanh toán → xác nhận → lịch sử', async ({
    page,
  }) => {
    const user = uniqueUser();

    const expectedTotal = await addDrinkToCart(page);

    // Tổng tiền giỏ hàng khớp với giá hiển thị ở trang chi tiết
    const cartTotalText = await page
      .locator('dt', { hasText: 'Tổng cộng' })
      .locator('xpath=following-sibling::dd')
      .textContent();
    expect(digits(cartTotalText)).toBe(expectedTotal);

    await goToCheckoutAsGuestThenLogin(page, user);
    await startPayment(page);

    await page.getByRole('button', { name: 'Giả lập thành công' }).click();

    // Trang xác nhận đơn
    await expect(page).toHaveURL(/\/confirmation\/.+/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Đặt hàng thành công' }),
    ).toBeVisible();
    const orderId = (page.url().split('/confirmation/')[1] ?? '').split(/[?#]/)[0];
    expect(orderId).not.toBe('');
    await expect(page.getByText(orderId, { exact: true })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Tiến trình đơn hàng' })).toContainText(
      'Đã thanh toán',
    );
    await expect(page.getByText(PRODUCT_NAME)).toBeVisible();

    // Giỏ hàng đã được dọn sau khi thanh toán
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Giỏ hàng đang trống' })).toBeVisible();

    // Lịch sử đơn hàng có đơn vừa tạo
    await page.goto('/orders');
    await expect(page.getByRole('heading', { level: 1, name: 'Lịch sử đơn hàng' })).toBeVisible();
    await expect(page.getByText(orderId, { exact: true })).toBeVisible();
  });

  test('thanh toán thất bại: hiện lỗi, cho phép thanh toán lại rồi thành công', async ({
    page,
  }) => {
    const user = uniqueUser();

    await addDrinkToCart(page);
    await goToCheckoutAsGuestThenLogin(page, user);
    await startPayment(page);

    // Nhánh thất bại (activity diagram: thanh toán thất bại)
    await page.getByRole('button', { name: 'Giả lập thất bại' }).click();
    const failure = page.getByRole('alert').filter({ hasText: 'Thanh toán thất bại' });
    await expect(failure).toBeVisible();

    // Thanh toán lại → chọn phương thức → thành công
    await failure.getByRole('button', { name: 'Thanh toán lại' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Thanh toán trước đó không thành công' })).toBeVisible();
    await page.getByRole('radio', { name: /Thẻ nội địa/ }).click();
    await page.getByRole('button', { name: /Xác nhận thanh toán/ }).click();
    await expect(page.getByText('Quét mã để thanh toán')).toBeVisible();
    await page.getByRole('button', { name: 'Giả lập thành công' }).click();

    await expect(page).toHaveURL(/\/confirmation\/.+/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Đặt hàng thành công' }),
    ).toBeVisible();
  });

  test('thanh toán thất bại → hủy đơn: quay về giỏ hàng, giỏ hàng vẫn còn món', async ({
    page,
  }) => {
    const user = uniqueUser();

    await addDrinkToCart(page);
    await goToCheckoutAsGuestThenLogin(page, user);
    await startPayment(page);

    await page.getByRole('button', { name: 'Giả lập thất bại' }).click();
    const failure = page.getByRole('alert').filter({ hasText: 'Thanh toán thất bại' });
    await expect(failure).toBeVisible();

    await failure.getByRole('button', { name: 'Hủy đơn' }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Giỏ hàng' })).toBeVisible();
    await expect(page.getByText(PRODUCT_NAME)).toBeVisible();
  });

  test('chưa đăng nhập: không thể thanh toán, được yêu cầu đăng nhập', async ({ page }) => {
    await addDrinkToCart(page);
    await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click();
    await expect(page.getByText('Bạn cần đăng nhập để sử dụng chức năng này.')).toBeVisible();
    await expect(page).toHaveURL(/\/cart$/);
  });
});
