# Auto Fill HUST — Quy chế 2026.1

Tiện ích Chrome Manifest V3 hỗ trợ chọn đáp án trắc nghiệm trên Microsoft Forms.

Phiên bản **4.1.0** cập nhật **200 câu Quy chế 2026.1**, đối chiếu các lựa chọn được đánh dấu trong `ĐÁP ÁN QUY CHẾ 2026.1.docx` do người dùng cung cấp. Tài liệu DOCX gốc được giữ tại máy, không kèm trong repository. Phần đáp án Pháp luật giữ nguyên từ bộ 2025.1, chưa được đối chiếu với tài liệu mới.

## Cài đặt

1. Tải [ZIP của dự án](https://github.com/NguyenHongQuyen-05/Auto_fill_Hust/archive/refs/heads/main.zip) và giải nén, hoặc clone repository:

   ```powershell
   git clone https://github.com/NguyenHongQuyen-05/Auto_fill_Hust.git
   ```

2. Mở `chrome://extensions` và bật **Chế độ dành cho nhà phát triển**.
3. Chọn **Tải tiện ích đã giải nén**, rồi chọn thư mục chứa `manifest.json`.
4. Ghim **Auto Fill Form HUST** lên thanh công cụ để tiện sử dụng.

Nếu đã cài bản cũ, tải bản mới, nhấn **Tải lại** trên thẻ tiện ích tại `chrome://extensions`, sau đó tải lại tab bài thi.

## Sử dụng

1. Mở bài thi tương ứng:
   - [Quy chế 2026.1](https://forms.cloud.microsoft/pages/responsepage.aspx?id=n7jxBugHT0a0COwbRXA_MYHyGUaEfhNNu2j97QvQaYlUOUxLS1VGWEJOVURPM0pUWTRJWks3S0pBRy4u&route=shorturl).
   - [Pháp luật — liên kết được giữ từ phiên bản trước](https://vnshort.com/3B1T).
2. Tự nhập thông tin cá nhân và mở phần câu hỏi trắc nghiệm.
3. Bấm biểu tượng tiện ích, chọn **Fill Form**. Popup hiển thị số câu vừa điền, số câu đã có đáp án và số câu chưa khớp.
4. Nếu biểu mẫu chia thành nhiều trang, chuyển sang trang tiếp theo và bấm **Fill Form** lại.
5. Kiểm tra các lựa chọn và tự nộp bài sau khi hoàn tất.



Mở `tests/content.test.html` bằng Chrome để chạy bộ kiểm tra trên DOM thật. Trang kiểm tra hiển thị kết quả cho bộ 200 câu Quy chế, việc xử lý dấu nháy/Unicode, các câu có đáp án giống nhau, câu chưa khớp và thao tác điền lại.

Mã chính nằm trong `scripts/content.js`; liên kết bài thi nằm trong `popup.html`; phạm vi tên miền nằm trong `manifest.json`.
