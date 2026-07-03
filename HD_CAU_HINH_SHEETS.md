# Hướng dẫn kết nối Form trên Landing Page vào Google Sheet

Để nhận dữ liệu đăng ký tư vấn và đơn đặt hàng combo từ Landing Page trực tiếp về Google Sheet của bạn hoàn toàn miễn phí, hãy làm theo các bước dưới đây sử dụng **Google Apps Script**.

---

## Bước 1: Tạo Google Sheet và thiết lập cột tiêu đề

1. Truy cập vào tài khoản Google Drive của bạn.
2. Tạo một Google Sheet mới (Trang tính).
3. Đặt tiêu đề cho trang tính (Ví dụ: `Danh Sách Đơn Hàng Trà Mộc Lành`).
4. Ở hàng đầu tiên (Hàng 1), tạo các tiêu đề cột theo đúng thứ tự sau để dễ quản lý:
   - Cột A: `Thời gian`
   - Cột B: `Loại đơn` (Đặt combo hoặc Đăng ký tư vấn)
   - Cột C: `Họ và tên`
   - Cột D: `Số điện thoại`
   - Cột E: `Gói Combo`
   - Cột F: `Tình trạng sức khỏe` (Từ form tư vấn)
   - Cột G: `Địa chỉ giao hàng`
   - Cột H: `Ghi chú`

---

## Bước 2: Tạo và dán code vào Google Apps Script

1. Trên thanh công cụ của Google Sheet, nhấn chọn **Tiện ích mở rộng** (Extensions) -> **Apps Script**.
2. Xóa toàn bộ đoạn code mặc định có sẵn trong khung soạn thảo.
3. Sao chép và dán đoạn code dưới đây vào:

```javascript
function doPost(e) {
  try {
    // Mở trang tính hoạt động hiện tại
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Trích xuất các tham số được gửi từ Form trên Landing Page
    var timestamp = e.parameter.timestamp || new Date().toLocaleString("vi-VN");
    var form_type = e.parameter.form_type || "Không xác định";
    var name = e.parameter.name || "";
    var phone = e.parameter.phone || "";
    var combo = e.parameter.combo || "";
    var status = e.parameter.status || "";
    var address = e.parameter.address || "";
    var note = e.parameter.note || "";
    
    // Thêm một hàng mới chứa dữ liệu vào cuối bảng tính
    sheet.appendRow([timestamp, form_type, name, phone, combo, status, address, note]);
    
    // Trả về phản hồi thành công
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Trả về lỗi nếu có sự cố xảy ra
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// Hàm doGet dự phòng hỗ trợ kiểm tra kết nối API
function doGet(e) {
  return ContentService.createTextOutput("API Google Sheets đang hoạt động bình thường!");
}
```

4. Nhấn nút **Lưu** (biểu tượng đĩa mềm 💾 hoặc tổ hợp phím `Ctrl + S` / `Cmd + S`).

---

## Bước 3: Triển khai (Deploy) làm Web App

Để Landing Page có thể gửi dữ liệu đến đoạn code này, bạn cần triển khai nó dưới dạng Web App công khai:

1. Ở góc trên bên phải giao diện Apps Script, nhấn chọn nút **Triển khai** (Deploy) -> **Triển khai mới** (New deployment).
2. Nhấn vào biểu tượng bánh răng ⚙️ cạnh chữ "Chọn loại triển khai" (Select type) và chọn **Ứng dụng web** (Web app).
3. Cấu hình thông tin như sau:
   - **Mô tả**: `Nhận đơn hàng Trà Mộc Lành`
   - **Thực thi dưới dạng** (Execute as): Chọn **Tôi** (Tài khoản Google của bạn - `Tài khoản mặc định`).
   - **Ai có quyền truy cập** (Who has access): Chọn **Mọi người** (Anyone) -> *Đây là cấu hình quan trọng nhất để form tĩnh của bạn có thể gửi dữ liệu lên mà không bị chặn xác thực.*
4. Nhấn nút **Triển khai** (Deploy).
5. Google sẽ yêu cầu bạn cấp quyền truy cập dữ liệu trang tính. Hãy nhấn chọn **Cấp quyền truy cập** (Authorize access), chọn tài khoản Google của bạn, nhấn vào **Nâng cao** (Advanced) ở dưới và chọn **Đi tới Dự án không có tiêu đề (không an toàn)** (Go to Untitled project), sau đó nhấn **Cho phép** (Allow).
6. Sau khi triển khai xong, hộp thoại sẽ hiển thị một đường dẫn **URL ứng dụng web** (Web app URL). Hãy nhấn **Sao chép** (Copy) đường dẫn này.
   - Đường dẫn có dạng tương tự như thế này: `https://script.google.com/macros/s/AKfycbz.../exec`

---

## Bước 4: Nhúng URL Web App vào Code Landing Page

1. Mở file [script.js](file:///Users/macbook/Downloads/Tra%20Ca%20Gai%20Leo/script.js) trong dự án của bạn.
2. Tìm đến dòng số 8 ở đầu file:
   ```javascript
   const GOOGLE_SHEET_SCRIPT_URL = ""; 
   ```
3. Dán URL Web App bạn vừa sao chép ở Bước 3 vào giữa dấu ngoặc kép:
   ```javascript
   const GOOGLE_SHEET_SCRIPT_URL = "DÁN_URL_WEB_APP_CỦA_BẠN_VÀO_ĐÂY"; 
   ```
4. Lưu file lại. Giờ đây, mọi lượt gửi đơn hàng trên Landing Page sẽ được tự động ghi nhận ngay lập tức vào Google Sheet của bạn!
