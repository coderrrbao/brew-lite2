# BrewLite – Tài liệu SRS rút gọn

## 1. Mục đích và phạm vi

Tài liệu mô tả hai sơ đồ use case của BrewLite sau khi chuẩn hóa theo UML 2.x và đồng bộ mã use case, mã yêu cầu với SRS:

- **Sơ đồ 1 – Use case tổng quát:** toàn bộ UC-01 … UC-09 của SRS và 4 tác nhân.
- **Sơ đồ 2 – Use case chi tiết UC-01:** phân rã "Đặt và thanh toán đơn hàng".

Sơ đồ chỉ phản ánh phạm vi MVP trong SRS. Các chức năng Won't (FR-29 … FR-32) không xuất hiện.

## 2. Quy ước chuẩn hóa

| Hạng mục | Quy ước |
|---|---|
| Mã use case | `UC-xx` theo mục 3 của SRS; use case con đánh `UC-xx.y` |
| Truy vết | Mỗi use case ghi các `FR-xx` liên quan (xem bảng ở mục 4 và 5) |
| Tác nhân | Vẽ hình người; tác nhân thứ cấp (Payment Service) đặt bên phải hệ thống |
| Ranh giới hệ thống | Hình chữ nhật có tên hệ thống ở góc trên |
| Association | Đường liền, không mũi tên |
| Generalization | Mũi tên đầu tam giác rỗng: Khách hàng → Khách vãng lai |
| «include» | Đường đứt nét, mũi tên mở, hướng từ use case gốc đến use case được bao gồm |
| «extend» | Đường đứt nét, mũi tên mở, hướng từ use case mở rộng đến use case gốc; điều kiện ghi trong ngoặc vuông |
| Ngôn ngữ nhãn | Tiếng Việt, động từ ở đầu; tên tác nhân theo SRS |

## 3. Đối chiếu mã cũ và mã mới

| Mã cũ (bản draw.io trước) | Mã mới (SRS) | Ghi chú |
|---|---|---|
| UC-01 Xem thực đơn | UC-02 | Gộp với UC-02 cũ |
| UC-02 Tìm kiếm, lọc đồ uống | UC-02 | FR-02 nằm trong UC-02 |
| UC-03 Quản lý giỏ hàng | UC-03 | Giữ nguyên |
| UC-04 Đăng ký, đăng nhập | UC-04 | Thêm "đăng xuất" theo SRS |
| UC-05 Đặt và thanh toán đơn hàng | UC-01 | Đổi mã |
| UC-06 Theo dõi, xem lịch sử đơn | UC-05 | Đổi mã |
| UC-07 Áp dụng khuyến mãi | UC-08 | Đổi mã |
| UC-08 Tích điểm loyalty | UC-09.1 | Thuộc UC-09, tự động khi thanh toán thành công |
| UC-09 Xử lý đơn hàng | UC-07 | Đổi mã |
| (chưa có) | UC-06 | Thanh toán lại hoặc huỷ đơn, tách từ UC-05.3 cũ |
| UC-10, UC-11 (Manager) | Bỏ | Quản trị menu và báo cáo không có trong SRS (FR-31 là Won't) |
| UC-05.1 | UC-01.1 | Tạo đơn hàng |
| UC-05.2 | UC-01.2, UC-01.3 | Tách khởi tạo và xác nhận thanh toán |
| UC-05.3 | UC-06 | Thanh toán lại, huỷ đơn |

## 4. Sơ đồ 1 – Use case tổng quát

File: `UC-01_tong-quat.drawio`

### 4.1 Tác nhân

| Tác nhân | Vai trò |
|---|---|
| Khách vãng lai | Chưa đăng nhập: xem menu, quản lý giỏ hàng, đăng ký, đăng nhập |
| Khách hàng | Kế thừa Khách vãng lai; thêm đặt hàng, theo dõi đơn, khuyến mãi, điểm thưởng |
| Nhân viên | Xem đơn và cập nhật trạng thái |
| Payment Service (mô phỏng) | Tác nhân thứ cấp, trả kết quả thanh toán |

### 4.2 Use case và truy vết

| Mã | Use case | Tác nhân chính | Yêu cầu |
|---|---|---|---|
| UC-01 | Đặt và thanh toán đơn hàng | Khách hàng; Payment Service | FR-12 … FR-17 |
| UC-02 | Xem menu và chi tiết sản phẩm | Khách vãng lai | FR-01 … FR-04 |
| UC-03 | Quản lý giỏ hàng | Khách vãng lai | FR-05 … FR-07 |
| UC-04 | Đăng ký, đăng nhập, đăng xuất | Khách vãng lai | FR-08 … FR-11 |
| UC-05 | Xem lịch sử và theo dõi đơn | Khách hàng | FR-19, FR-20 |
| UC-06 | Thanh toán lại hoặc huỷ đơn | Khách hàng | FR-18, FR-23 |
| UC-07 | Cập nhật trạng thái đơn | Nhân viên | FR-21, FR-22 |
| UC-08 | Dùng khuyến mãi | Khách hàng | FR-14, FR-24, FR-25 |
| UC-09 | Đổi điểm và xem điểm thưởng | Khách hàng | FR-26 … FR-28 |

### 4.3 Quan hệ giữa các use case

| Quan hệ | Từ | Đến | Điều kiện |
|---|---|---|---|
| «include» | UC-01 | UC-03 | Luôn thực hiện |
| «include» | UC-01 | UC-04 | Luôn thực hiện (phải đăng nhập mới đặt đơn, FR-12) |
| «extend» | UC-08 | UC-01 | [có nhập mã khuyến mãi] |
| «extend» | UC-06 | UC-05 | [đơn ở trạng thái cho phép] |

UC-09 chỉ có association với Khách hàng. Việc cộng điểm tự động khi thanh toán thành công được vẽ ở sơ đồ 2 (UC-09.1).

## 5. Sơ đồ 2 – Use case chi tiết UC-01

File: `UC-02_chi-tiet-UC-01.drawio`

### 5.1 Use case con

| Mã | Use case | Yêu cầu |
|---|---|---|
| UC-01.1 | Tạo đơn hàng (kiểm tra giá, giữ tồn kho) | FR-12, FR-13 |
| UC-01.2 | Khởi tạo thanh toán (Ví hoặc Thẻ, Idempotency-Key) | FR-15, FR-17 |
| UC-01.3 | Xác nhận kết quả thanh toán | FR-16, FR-17 |
| UC-09.1 | Tích điểm thưởng | FR-27 |

### 5.2 Quan hệ

| Quan hệ | Từ | Đến | Điều kiện |
|---|---|---|---|
| «include» | UC-01 | UC-01.1, UC-01.2, UC-01.3 | Luôn thực hiện, theo thứ tự |
| «include» | UC-01 | UC-03, UC-04 | Như sơ đồ 1 |
| «extend» | UC-08 | UC-01.1 | [có nhập mã khuyến mãi] |
| «extend» | UC-09.1 | UC-01.3 | [thanh toán thành công] |
| «extend» | UC-06 | UC-01.3 | [thanh toán thất bại] |

Payment Service liên kết với UC-01.3. Khách hàng liên kết với UC-01.

### 5.3 Đặc tả tóm tắt UC-01

| Mục | Nội dung |
|---|---|
| Tiền điều kiện | Khách hàng đã đăng nhập, giỏ hàng có ít nhất 1 món |
| Luồng chính | 1. Khách nhấn "Đặt hàng". 2. Hệ thống tạo đơn `PENDING` và giữ tồn kho (UC-01.1). 3. Hệ thống tạo giao dịch thanh toán (UC-01.2). 4. Payment Service trả kết quả thành công (UC-01.3). 5. Đơn chuyển `PAID`, cộng điểm (UC-09.1), hiển thị màn hình xác nhận kèm mã đơn |
| Luồng thay thế | Có mã khuyến mãi: server tính mức giảm (UC-08). Thanh toán thất bại: đơn `PAYMENT_FAILED`, giữ giỏ hàng, khách thanh toán lại hoặc huỷ (UC-06) |
| Ngoại lệ | Không đủ hàng: 409, không tạo đơn. Chưa đăng nhập: 401. Gửi lại cùng Idempotency-Key: trả kết quả đã có |
| Hậu điều kiện | Thành công: đơn `PAID`, điểm được cộng một lần. Thất bại: tồn kho vẫn đang giữ cho đến khi đơn bị huỷ, khi đó hoàn lại đúng một lần |

## 6. Điểm cần xác nhận

1. Đã bỏ tác nhân Manager cùng UC-10 và UC-11 vì SRS không có. Nếu báo cáo môn học vẫn cần, phải bổ sung FR tương ứng vào SRS trước.
2. UC-06 được vẽ «extend» UC-05 ở sơ đồ 1 (theo gợi ý của SRS) và «extend» UC-01.3 ở sơ đồ 2 (vì thanh toán lại xuất phát từ thanh toán thất bại). Cả hai cùng đúng nhưng nên ghi chú khi đưa vào báo cáo.
3. UC-09.1 là use case con do mình thêm để tách phần tích điểm tự động khỏi phần đổi điểm và xem điểm (FR-26, FR-28) của UC-09. SRS có thể bổ sung mã này vào bảng use case.
4. Các điểm cần sửa trong chính SRS trước khi chốt:
   - Bảng UC-01 ghi "FR-12 … FR-17, FR-14, FR-27": FR-14 bị trùng trong dải, nên ghi "FR-12 … FR-18" và để FR-14, FR-27 ở UC-08, UC-09.
   - UC-04 gồm cả đăng ký và đăng xuất, nên «include» từ UC-01 nên trỏ vào use case con "Đăng nhập".
   - FR-24 cho khách vãng lai xem mã còn FR-25 bắt buộc JWT; nên nêu rõ đây là chủ ý.
   - FR-23 huỷ đơn `PAID` chưa nói về hoàn tiền; nên ghi chú "mô phỏng, không hoàn tiền thật".
   - FR-21 có `PAYMENT_FAILED→PAID` nhưng không luồng nào kích hoạt; nên bỏ hoặc nối vào FR-18.