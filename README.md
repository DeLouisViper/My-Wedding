# 💜 Quản Lý Đám Cưới

Ứng dụng web giúp bạn ghi nhớ **chính xác** tiền mừng và hiện vật từ khách mời trong đám cưới, chia rõ theo Nhà Trai / Nhà Gái, dễ dàng gửi lời cảm ơn và đối chiếu khi cần. App chạy hoàn toàn miễn phí trên **GitHub Pages** (giao diện) + **Firebase Firestore** (cơ sở dữ liệu).

Hướng dẫn bên dưới viết cho người **chưa từng dùng GitHub hay Firebase bao giờ**. Làm theo từng bước, không cần cài đặt gì trên máy tính.

---

## Tổng quan các bước

1. Tạo dự án Firebase (miễn phí) — nơi lưu dữ liệu
2. Lấy "cấu hình Firebase" và dán vào file `src/firebase.js`
3. Đưa toàn bộ code này lên một kho GitHub (repository)
4. Bật GitHub Pages — GitHub sẽ tự động build và deploy app
5. Mở link app và bắt đầu sử dụng

---

## Bước 1 — Tạo dự án Firebase

1. Truy cập **https://console.firebase.google.com** và đăng nhập bằng tài khoản Google.
2. Bấm **"Add project" / "Tạo dự án"**.
3. Đặt tên dự án, ví dụ `quan-ly-dam-cuoi`. Bấm **Continue**.
4. Tắt Google Analytics (không cần thiết) → bấm **Create project**. Đợi vài giây rồi bấm **Continue**.

### 1.1 Bật đăng nhập bằng Email/Mật khẩu
1. Trong menu bên trái, chọn **Build → Authentication**.
2. Bấm **Get started**.
3. Chọn tab **Sign-in method** → chọn **Email/Password** → bật (Enable) → **Save**.

### 1.2 Tạo cơ sở dữ liệu Firestore
1. Trong menu bên trái, chọn **Build → Firestore Database**.
2. Bấm **Create database**.
3. Chọn vị trí máy chủ gần bạn (ví dụ `asia-southeast1`), bấm **Next**.
4. Chọn **Start in production mode** → **Create**.
5. Sau khi tạo xong, vào tab **Rules**, xóa hết nội dung mặc định, **dán toàn bộ nội dung file `firestore.rules`** (có sẵn trong thư mục dự án này) vào, rồi bấm **Publish**.

> Firestore và Authentication của Firebase có **gói miễn phí (Spark)** đủ dùng thoải mái cho việc quản lý một hoặc vài đám cưới — không tốn phí.

### 1.3 Lấy cấu hình Firebase cho web app
1. Bấm biểu tượng **⚙️ Project settings** ở góc trên bên trái.
2. Kéo xuống mục **"Your apps"**, bấm biểu tượng **`</>`** (Web) để thêm 1 web app.
3. Đặt tên app (ví dụ `quan-ly-dam-cuoi-web`) → bấm **Register app**.
4. Firebase sẽ hiện ra đoạn mã `firebaseConfig` giống thế này — **giữ lại tab này**, bạn sẽ cần copy các giá trị:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "quan-ly-dam-cuoi.firebaseapp.com",
  projectId: "quan-ly-dam-cuoi",
  storageBucket: "quan-ly-dam-cuoi.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Bước 2 — Dán cấu hình Firebase vào code

Bạn sẽ chỉnh sửa 1 file duy nhất, trực tiếp trên GitHub (không cần cài phần mềm gì) ở **Bước 3.4** bên dưới. File cần sửa là `src/firebase.js`, thay các giá trị `YOUR_API_KEY`, `YOUR_PROJECT_ID`... bằng giá trị thật lấy ở Bước 1.3.

---

## Bước 3 — Đưa code lên GitHub

### 3.1 Tạo tài khoản GitHub
Nếu chưa có, vào **https://github.com/signup** để tạo tài khoản (miễn phí).

### 3.2 Tạo kho chứa code (repository) mới
1. Đăng nhập GitHub → bấm dấu **+** ở góc trên phải → **New repository**.
2. Đặt tên, ví dụ `quan-ly-dam-cuoi`.
3. Để **Public** (hoặc Private đều được).
4. **Không** tích chọn "Add a README file" (vì ta sẽ tải cả bộ code lên).
5. Bấm **Create repository**.

### 3.3 Tải toàn bộ code lên GitHub
Trên trang repository vừa tạo, bạn sẽ thấy nút **"uploading an existing file"**:
1. Bấm vào đó.
2. Kéo thả (hoặc chọn) **toàn bộ file và thư mục** trong bộ code này vào — bao gồm cả thư mục ẩn `.github` (chứa file `deploy.yml`) và file `.gitignore`.
   - Nếu trình duyệt không cho kéo thả thư mục `.github`, bạn có thể dùng **GitHub Desktop** (ứng dụng miễn phí, kéo thả bằng chuột, xem hướng dẫn tại https://desktop.github.com) để đẩy toàn bộ thư mục lên dễ dàng hơn.
3. Ở khung "Commit changes", gõ nội dung bất kỳ ví dụ "Khởi tạo dự án" → bấm **Commit changes**.

> 💡 **Mẹo cho người mới:** cách dễ nhất và đầy đủ nhất là cài **GitHub Desktop**, đăng nhập, chọn **"Add an Existing Repository"**, trỏ vào thư mục code này trên máy, sau đó **Publish repository**. Cách này tải lên đúng 100% cấu trúc thư mục kể cả `.github/workflows`.

### 3.4 Sửa file cấu hình Firebase ngay trên GitHub
1. Trong repository trên GitHub, mở thư mục `src` → bấm vào file `firebase.js`.
2. Bấm biểu tượng cây bút ✏️ (**Edit this file**) ở góc trên phải.
3. Thay 6 giá trị `YOUR_API_KEY`, `YOUR_PROJECT_ID.firebaseapp.com`, `YOUR_PROJECT_ID`, `YOUR_PROJECT_ID.appspot.com`, `YOUR_SENDER_ID`, `YOUR_APP_ID` bằng các giá trị thật đã lấy ở **Bước 1.3**.
4. Kéo xuống dưới, bấm **Commit changes...** → **Commit changes**.

---

## Bước 4 — Bật GitHub Pages để tự động deploy

1. Trong repository, vào tab **Settings**.
2. Menu bên trái chọn **Pages**.
3. Mục **"Build and deployment" → Source**, chọn **GitHub Actions**.
4. Vào tab **Actions** ở đầu trang repository — bạn sẽ thấy quy trình **"Deploy to GitHub Pages"** đang chạy (do bước Commit ở trên tự động kích hoạt). Đợi khoảng 1–2 phút đến khi có dấu ✅ màu xanh.
5. Quay lại **Settings → Pages**, bạn sẽ thấy dòng chữ **"Your site is live at..."** kèm đường link dạng:
   `https://ten-tai-khoan.github.io/quan-ly-dam-cuoi/`

Bấm vào link đó — app của bạn đã hoạt động! 🎉

> Từ giờ, mỗi khi bạn sửa file gì trên GitHub và Commit, GitHub sẽ **tự động build và deploy lại** trong khoảng 1-2 phút, không cần làm gì thêm.

---

## Bước 5 — Bắt đầu sử dụng App

1. Mở link app → bấm **Đăng ký** để tạo tài khoản đầu tiên (họ tên, email, mật khẩu).
2. Bấm **Thêm đám cưới** → nhập tên đám cưới, tên cô dâu/chú rể, ngày cưới.
3. Vào trang đám cưới vừa tạo → bấm **Thêm quà cưới** để nhập thông tin từng khách:
   - Tên khách
   - Thuộc về: Nhà Trai / Nhà Gái
   - Mối quan hệ: Bạn ba mẹ / Họ hàng / Bạn bè / Đồng nghiệp / Khác (tự nhập)
   - Loại quà: Tiền mặt / Vàng / Hiện vật / Khác + Số lượng + Đơn vị (Trăm / Triệu / Chỉ / Khác)
   - Trạng thái: Đã cảm ơn / Đã mừng lại / Khác
4. Dữ liệu **tự động lưu** vào Firestore ngay khi bạn bấm Thêm/Cập nhật — không cần bấm "Lưu" nào khác.
5. Có thể **sửa** hoặc **xóa** bất kỳ mục nào trong bảng bằng nút bút chì ✏️ / thùng rác 🗑️.
6. Bấm **Xuất báo cáo A4** để xem báo cáo đầy đủ, chia riêng Nhà Trai / Nhà Gái, có ngày giờ xuất. Bấm nút **"In / Lưu PDF"**, ở hộp thoại in của trình duyệt chọn máy in **"Save as PDF" / "Lưu dưới dạng PDF"** để tải file PDF về máy.

### Mời thêm thành viên & phân quyền
- Chỉ **chủ sở hữu** (người tạo đám cưới) mới thấy nút **Thành viên**.
- Người được mời **phải đăng ký tài khoản trước** (bằng email của họ), sau đó chủ sở hữu nhập đúng email đó vào ô "Email thành viên" và chọn quyền:
  - **Biên tập**: được thêm/sửa/xóa khách mời.
  - **Chỉ xem**: chỉ xem, không chỉnh sửa được.

### Giao diện Sáng / Tối
Bấm biểu tượng ☀️/🌙 trên thanh điều hướng để chuyển đổi. App dùng tông màu tím với gradient chuyển màu mềm mại ở cả hai chế độ.

---

## Câu hỏi thường gặp

**App có tốn phí không?**
Không. GitHub Pages miễn phí cho repository public. Firebase gói Spark (miễn phí) cho phép khoảng 50.000 lượt đọc và 20.000 lượt ghi Firestore mỗi ngày — dư sức cho việc quản lý quà cưới cá nhân.

**Sao tôi sửa xong mà app chưa cập nhật?**
Vào tab **Actions** trên GitHub kiểm tra xem quy trình build đã chạy xong (✅) chưa. Đôi khi cần tải lại trang (Ctrl+F5) để xóa cache trình duyệt.

**Quên mật khẩu đăng nhập app thì sao?**
Hiện tại bản này chưa có chức năng quên mật khẩu qua giao diện. Bạn có thể vào Firebase Console → Authentication → chọn người dùng → "Reset password" để gửi email đặt lại mật khẩu, hoặc tạo tài khoản mới.

**Muốn đổi tên miền/đường dẫn app?**
Vào Settings → Pages trên GitHub để thêm tên miền riêng (custom domain) nếu bạn có.

---

## Cấu trúc dự án (dành cho ai muốn tìm hiểu thêm)

```
quan-ly-dam-cuoi/
├── src/
│   ├── firebase.js          # Cấu hình kết nối Firebase (cần sửa)
│   ├── contexts/             # Quản lý đăng nhập & giao diện sáng/tối
│   ├── components/            # Các thành phần dùng chung (form, bảng, navbar...)
│   └── pages/                 # Các trang: Đăng nhập, Dashboard, Chi tiết đám cưới, Báo cáo in
├── firestore.rules            # Luật bảo mật Firestore (dán vào Firebase Console)
├── .github/workflows/deploy.yml  # Tự động build & deploy khi có thay đổi
└── README.md                  # Chính là file bạn đang đọc
```

Chúc bạn và gia đình có một đám cưới thật trọn vẹn! 💜
