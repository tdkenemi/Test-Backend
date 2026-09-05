# Bài test Backend AI — Triệu Duy Khang

> **Hệ thống RESTful API xác thực người dùng và quản lý sản phẩm (Bảo mật cao)**  
> Stack: **Node.js · Express.js · MongoDB Atlas · JWT · bcrypt**  
> Ứng viên: **Triệu Duy Khang** — Vị trí: **Backend Developer** — Công ty: **TNM GROUP**

---

## 📩 Gửi anh An Phú ##

Dạ em chào anh Phú, em gửi anh kết quả bài Test Backend ạ. 

**Về việc sử dụng AI (như anh có nhắc nhở):** Em dùng AI như một người Pair-Programming chứ không đơn thuần là gen code thụ động. Cụ thể cách em giải quyết bài toán cùng AI:

1. **Kiểm soát kiến trúc:** Em yêu cầu AI giữ đúng cấu trúc đơn giản, không over-engineer (ví dụ: dùng In-Memory Map cho Brute-force thay vì setup Redis rườm rà).
2. **Xử lý triệt để Edge Cases:** Em thảo luận với AI để bắt đúng lỗi `11000` của MongoDB cho bài toán Race-Condition khi đăng ký trùng email. Bắt lỗi `Validation`, `CastError` ở tầng Global Error Handler.
3. **Debug môi trường thật:** Khi test bằng PowerShell bị lỗi cú pháp `curl` do PowerShell nhận nhầm thành `Invoke-WebRequest`, em đã prompt yêu cầu AI đổi toàn bộ sang `curl.exe` và thoát chuỗi JSON chuẩn xác để chạy test tự động 100% thành công.
4. **Tài liệu & Comment:** Em đã comment cực kỳ chi tiết trong `authController.js` và `server.js` về các quyết định kỹ thuật này. Anh có thể xem toàn bộ quá trình tư duy của em ở file `AI_Prompt_History.txt` trong source code ạ. 

Cảm ơn anh đã review!

---

## Ket qua kiem thu (chup man hinh CMD thuc te)

> Chay tat ca lenh curl ben duoi, chup man hinh, dan vao day truoc khi nop bai.

### 1. Dang ky thanh cong

<img width="856" height="238" alt="image" src="https://github.com/user-attachments/assets/f144c527-e3d5-482e-9166-0130fbafcfe3" />



---

### 2. Dang ky lai email da ton tai

<img width="1045" height="117" alt="image" src="https://github.com/user-attachments/assets/12d59d58-a894-45ed-a2ff-1aeff792b520" />


---

### 3. Dang nhap dung — nhan JWT token

<img width="1043" height="133" alt="image" src="https://github.com/user-attachments/assets/2f498d33-1403-4ad5-a6f9-7c3501be1ee5" />


---

### 4. Dang nhap sai mat khau

<img width="1052" height="118" alt="image" src="https://github.com/user-attachments/assets/bcadc4ba-7198-4bac-8267-d4de491b5784" />


---

### 5. GET /me voi token hop le

<img width="1061" height="82" alt="image" src="https://github.com/user-attachments/assets/a46b9d51-3d22-4ac1-b05b-b01f46e162a0" />


---

### 6. GET /me khong co token

<img width="768" height="113" alt="image" src="https://github.com/user-attachments/assets/c3bbbc09-e710-426e-b17d-9144779254b2" />


---

### 7. GET /products?status=available co token

<img width="1049" height="96" alt="image" src="https://github.com/user-attachments/assets/b0e21f74-a09c-4268-89ef-dc7aeebfa6a0" />


---

### 8. GET /products?status=gia_tri_sai

<img width="1071" height="83" alt="image" src="https://github.com/user-attachments/assets/0d864b8c-c542-40ee-bb5d-1d038ed793ad" />


---

### 9. GET /products khong co token

<img width="935" height="61" alt="image" src="https://github.com/user-attachments/assets/ff62d2ad-a71c-47f0-abf6-22190c24e1ce" />


---

### 10. Brute-force: sai 5 lan, lan 6 dung mat khau van bi chan

<img width="1063" height="367" alt="image" src="https://github.com/user-attachments/assets/4611c831-a428-46dc-be58-6fce0f1e38ec" />
<img width="1072" height="71" alt="image" src="https://github.com/user-attachments/assets/ab77f964-4fa8-4f5e-a9a8-9a576e429add" />

---

## Bảng tổng hợp kết quả theo đề bài

| # | Tình huống | Kết quả mong đợi | Kết quả thực tế |
|---|-----------|-----------------|-----------------|
| 1 | Đăng ký email chưa tồn tại, dữ liệu hợp lệ | 201 Thành công | 201 ✅ |
| 2 | Đăng ký lại email đã tồn tại | 400 Email đã tồn tại | 400 ✅ |
| 3 | 2 request cùng email gần như đồng thời | Chỉ 1 thành công, còn lại 400 | 400 (MongoDB unique index) ✅ |
| 4 | Đăng nhập đúng email và mật khẩu | 200 + JWT token | 200 ✅ |
| 5 | Đăng nhập sai mật khẩu | 401 Từ chối, không cấp token | 401 ✅ |
| 6 | GET /me với token hợp lệ | 200 + thông tin tài khoản | 200 ✅ |
| 7 | GET /me không có token | 401 Từ chối | 401 ✅ |
| 8 | GET /me token sai / hết hạn | 401 Từ chối | 401 ✅ |
| 9 | GET /products?status=available có token | 200 + đúng danh sách | 200 ✅ |
| 10 | GET /products?status=... không có token | 401 Từ chối | 401 ✅ |
| 11 | GET /products?status=gia_tri_khong_hop_le | 400 Lỗi rõ ràng | 400 ✅ |
| 12 | Sai 5 lần, lần 6 đúng mật khẩu | 429 Vẫn bị chặn | 429 ✅ |

---

## Cách chạy dự án

### Yêu cầu

- Node.js >= 16
- MongoDB (local hoặc Atlas)

### Bước 1 — Cài dependencies

```
npm install
```

### Bước 2 — Tạo file `.env`

Sao chép file `.env.example` thành `.env` và điền giá trị thực:

```
copy .env.example .env
```

Nội dung `.env`:

```
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=chuoi-bi-mat-du-dai-va-ngau-nhien
```

> **Lưu ý bảo mật:** File `.env` đã được thêm vào `.gitignore` — TUYỆT ĐỐI không commit file này lên GitHub.

### Bước 3 — Chạy server

```
node server.js
```

Kết quả mong đợi:

```
MongoDB da ket noi thanh cong
Server dang chay tai http://localhost:3000
```

---

## Cấu trúc dự án

```text
.
├── src/
│   ├── config/
│   │   └── db.js                 # Logic kết nối MongoDB
│   ├── controllers/
│   │   ├── authController.js     # API đăng nhập & đăng ký
│   │   └── productController.js  # API sản phẩm
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Middleware xác thực JWT
│   │   └── errorHandler.js       # Global Error Handler
│   ├── models/
│   │   ├── index.js              # Khởi tạo và export models
│   │   ├── Product.js            # Mongoose Schema: Product
│   │   └── User.js               # Mongoose Schema: User
│   ├── routes/
│   │   ├── authRoutes.js         # Endpoints cho Auth
│   │   └── productRoutes.js      # Endpoints cho Product
│   └── services/
│       └── loginAttemptsService.js # In-memory Brute-force protection
├── server.js                     # Entry point (Express server & routes)
├── .env                          # Biến môi trường THỰC (không commit)
├── .env.example                  # Mẫu biến môi trường (commit được)
├── .gitignore                    # Ẩn .env và node_modules
└── README.md                     # Tài liệu dự án
```

---

## Quyết định kỹ thuật

### Chống Race-condition đăng ký trùng email

**Vấn đề:** 2 request cùng email gửi đồng thời có thể vượt qua kiểm tra "email đã tồn tại" trước khi bản ghi đầu tiên được lưu.

**Giải pháp:** Tăng `unique: true` trên trường `email` ở Mongoose Schema. MongoDB tạo **unique index** ở tầng storage engine. Dù bao nhiêu request đồng thời, **chỉ duy nhất 1 thành công**, tất cả còn lại nhận `DuplicateKeyError (code 11000)`.

```js
// models.js
email: { type: String, required: true, unique: true, lowercase: true, trim: true }

// authController.js — bắt lỗi sau khi DB từ chối
} catch (error) {
  if (error.code === 11000) {
    return res.status(400).json({ message: 'Email da ton tai' });
  }
}
```

### Chống Brute-force dò mật khẩu

**Giải pháp:** Sử dụng In-memory `Map` theo dõi số lần sai theo từng `email` (không theo IP để tránh bị qua mặt bởi proxy).

| Tham số | Giá trị |
|---------|---------|
| Số lần sai tối đa | 5 lần |
| Cửa sổ đếm | 1 phút |
| Thời gian khóa | 1 phút |

**Điểm then chốt:** Kiểm tra trạng thái khóa **TRƯỚC** khi truy vấn DB và so sánh mật khẩu — kể cả mật khẩu đúng vẫn bị chặn trong thời gian khóa.

### Bảo mật mật khẩu

Mật khẩu được hash bằng `bcrypt` (saltRounds = 10). Không bao giờ lưu plain text. Khi đăng nhập dùng `bcrypt.compare()`.

### Chống Username Enumeration

`POST /login` trả cùng 1 message cho cả hai trường hợp: email không tồn tại và sai mật khẩu. Kẻ tấn công không biết được email nào đã đăng ký.

---

## Hướng dẫn kiểm thử bằng PowerShell (Windows)

> **Lưu ý quan trọng:**
> - Các lệnh dưới đây dùng chuẩn native **PowerShell** (`Invoke-RestMethod`) để tránh lỗi mất ngoặc kép của cURL trên Windows.
> - Bạn chỉ việc copy paste nguyên vẹn từng khối lệnh dưới đây vào Terminal PowerShell là chạy 100% thành công.
> - **Thay `YOUR_TOKEN`** bằng token thực lấy từ bước đăng nhập.

---

### POST /register

**Hợp lệ — mong đợi 201:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/register -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "password": "matkhau123"}'
```

**Email sai định dạng — mong đợi 400:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/register -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "khonghople", "password": "matkhau123"}' -SkipHttpErrorCheck
```

**Password <= 6 ký tự — mong đợi 400:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/register -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test2@example.com", "password": "123"}' -SkipHttpErrorCheck
```

**Email đã tồn tại — mong đợi 400:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/register -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "password": "matkhau123"}' -SkipHttpErrorCheck
```

---

### POST /login

**Đăng nhập đúng — mong đợi 200 + token:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "password": "matkhau123"}'
```

**Sai mật khẩu — mong đợi 401:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "password": "saimatkhau"}' -SkipHttpErrorCheck
```

---

### GET /me

**Có token hợp lệ — mong đợi 200:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/me -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

**Không có token — mong đợi 401:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/me -Method GET -SkipHttpErrorCheck
```

**Token sai — mong đợi 401:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/me -Method GET -Headers @{"Authorization"="Bearer abc.def.ghi"} -SkipHttpErrorCheck
```

---

### GET /products

**Tất cả sản phẩm — mong đợi 200:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

**Lọc available — mong đợi 200:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products?status=available" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

**Lọc out_of_stock — mong đợi 200:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products?status=out_of_stock" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

**Lọc discontinued — mong đợi 200:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products?status=discontinued" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

**Status không hợp lệ — mong đợi 400:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products?status=invalid_value" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"} -SkipHttpErrorCheck
```

**Không có token — mong đợi 401:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products?status=available" -Method GET -SkipHttpErrorCheck
```

---

### Brute-force (chạy 6 lần liên tiếp)

**Lần 1-4 (mong đợi 401 + số lần còn lại):**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "password": "saimatkhau"}' -SkipHttpErrorCheck
```

**Lần 5 (mong đợi 429 - bị khóa):**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "password": "saimatkhau"}' -SkipHttpErrorCheck
```

**Lần 6 — ĐÚNG mật khẩu nhưng VẪN 429:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email": "test@example.com", "password": "matkhau123"}' -SkipHttpErrorCheck
```

---

## Dữ liệu sản phẩm mẫu (hardcode)

| id | Tên sản phẩm              | Status       |
|----|---------------------------|--------------|
| 1  | Laptop Dell XPS 15        | available    |
| 2  | iPhone 15 Pro Max         | available    |
| 3  | Samsung Galaxy S23        | out_of_stock |
| 4  | Sony WH-1000XM5 Headphone | discontinued |
| 5  | iPad Pro 12.9"            | out_of_stock |

---

*Tac gia: Trieu Duy Khang — Bai test Backend Developer — TNM GROUP*
