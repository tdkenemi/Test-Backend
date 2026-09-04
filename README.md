# Bai-test-Backend-AI — Trieu Duy Khang

> **REST API** xac thuc nguoi dung va quan ly san pham  
> Stack: **Node.js · Express.js · MongoDB Atlas · JWT · bcrypt**  
> Ung vien: **Trieu Duy Khang** — Vi tri: **Backend Developer** — Cong ty: **TNM GROUP**

---

## Ket qua kiem thu (chup man hinh CMD thuc te)

> Chay tat ca lenh curl ben duoi, chup man hinh, dan vao day truoc khi nop bai.

### 1. Dang ky thanh cong

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — POST /register thanh cong)*

---

### 2. Dang ky lai email da ton tai

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — POST /register tra 400 Email da ton tai)*

---

### 3. Dang nhap dung — nhan JWT token

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — POST /login tra 200 + token)*

---

### 4. Dang nhap sai mat khau

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — POST /login tra 401)*

---

### 5. GET /me voi token hop le

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — GET /me tra 200 + email + id)*

---

### 6. GET /me khong co token

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — GET /me tra 401)*

---

### 7. GET /products?status=available co token

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — GET /products loc dung trang thai)*

---

### 8. GET /products?status=gia_tri_sai

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — GET /products tra 400 ro rang)*

---

### 9. GET /products khong co token

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — GET /products tra 401)*

---

### 10. Brute-force: sai 5 lan, lan 6 dung mat khau van bi chan

<!-- Dan anh CMD vao day -->
*(Anh chup man hinh CMD — Lan sai thu 5 tra 429, lan 6 dung mat khau van tra 429)*

---

## Bang tong hop ket qua theo de bai

| # | Tinh huong | Ket qua mong doi | Ket qua thuc te |
|---|-----------|-----------------|-----------------|
| 1 | Dang ky email chua ton tai, du lieu hop le | 201 Thanh cong | 201 ✅ |
| 2 | Dang ky lai email da ton tai | 400 Email da ton tai | 400 ✅ |
| 3 | 2 request cung email gan nhu dong thoi | Chi 1 thanh cong, con lai 400 | 400 (MongoDB unique index) ✅ |
| 4 | Dang nhap dung email va mat khau | 200 + JWT token | 200 ✅ |
| 5 | Dang nhap sai mat khau | 401 Tu choi, khong cap token | 401 ✅ |
| 6 | GET /me voi token hop le | 200 + thong tin tai khoan | 200 ✅ |
| 7 | GET /me khong co token | 401 Tu choi | 401 ✅ |
| 8 | GET /me token sai / het han | 401 Tu choi | 401 ✅ |
| 9 | GET /products?status=available co token | 200 + dung danh sach | 200 ✅ |
| 10 | GET /products?status=... khong co token | 401 Tu choi | 401 ✅ |
| 11 | GET /products?status=gia_tri_khong_hop_le | 400 Loi ro rang | 400 ✅ |
| 12 | Sai 5 lan, lan 6 dung mat khau | 429 Van bi chan | 429 ✅ |

---

## Cach chay du an

### Yeu cau

- Node.js >= 16
- MongoDB (local hoac Atlas)

### Buoc 1 — Cai dependencies

```
npm install
```

### Buoc 2 — Tao file `.env`

Sao chep file `.env.example` thanh `.env` va dien gia tri thuc:

```
copy .env.example .env
```

Noi dung `.env`:

```
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=chuoi-bi-mat-du-dai-va-ngau-nhien
```

> **Luu y bao mat:** File `.env` da duoc them vao `.gitignore` — TUYET DOI khong commit file nay len GitHub.

### Buoc 3 — Chay server

```
node server.js
```

Ket qua mong doi:

```
MongoDB da ket noi thanh cong
Server dang chay tai http://localhost:3000
```

---

## Cau truc du an

```
.
├── server.js            # Entry point: Express + routes + error handlers
├── models.js            # Mongoose schemas: User, Product
├── authController.js    # POST /register, POST /login (co brute-force protection)
├── middlewares.js       # authMiddleware: verify JWT
├── productController.js # GET /me, GET /products
├── .env                 # Bien moi truong THUC (khong commit)
├── .env.example         # Mau bien moi truong (commit duoc)
├── .gitignore           # An .env va node_modules
└── README.md
```

---

## Quyet dinh ky thuat

### Chong Race-condition dang ky trung email

**Van de:** 2 request cung email gui dong thoi co the vuot qua kiem tra "email da ton tai" truoc khi ban ghi dau tien duoc luu.

**Giai phap:** Tang `unique: true` tren truong `email` o Mongoose Schema. MongoDB tao **unique index** o tang storage engine. Du bao nhieu request dong thoi, **chi duy nhat 1 thanh cong**, tat ca con lai nhan `DuplicateKeyError (code 11000)`.

```js
// models.js
email: { type: String, required: true, unique: true, lowercase: true, trim: true }

// authController.js — bat loi sau khi DB tu choi
} catch (error) {
  if (error.code === 11000) {
    return res.status(400).json({ message: 'Email da ton tai' });
  }
}
```

### Chong Brute-force do mat khau

**Giai phap:** In-memory `Map` theo doi so lan sai theo tung `email` (khong theo IP de tranh bi qua mat boi proxy).

| Tham so | Gia tri |
|---------|---------|
| So lan sai toi da | 5 lan |
| Cua so dem | 1 phut |
| Thoi gian khoa | 1 phut |

**Diem then chot:** Kiem tra trang thai khoa **TRUOC** khi truy van DB va so sanh mat khau — ke ca mat khau dung van bi chan trong thoi gian khoa.

### Bao mat mat khau

Mat khau duoc hash bang `bcrypt` (saltRounds = 10). Khong bao gio luu plain text. Khi dang nhap dung `bcrypt.compare()`.

### Chong Username Enumeration

`POST /login` tra cung 1 message cho ca hai truong hop: email khong ton tai va sai mat khau. Ke tan cong khong biet duoc email nao da dang ky.

---

## Huong dan kiem thu bang cURL (Windows)

> **Ghi chu dinh dang:**
> - Cac lenh duoi day dung cu phap **Git Bash tren Windows** (`\"` de thoat dau ngoac kep)
> - Neu dung **Command Prompt (cmd):** thay toan bo bang `"..."` va thoat `\"` ben trong
> - **Thay `YOUR_TOKEN`** bang token thuc lay tu buoc dang nhap

---

### POST /register

**Hop le — mong doi 201:**
```
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"matkhau123\"}"
```

**Email sai dinh dang — mong doi 400:**
```
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"email\": \"khonghople\", \"password\": \"matkhau123\"}"
```

**Password <= 6 ky tu — mong doi 400:**
```
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"email\": \"test2@example.com\", \"password\": \"123\"}"
```

**Email da ton tai — mong doi 400:**
```
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"matkhau123\"}"
```

---

### POST /login

**Dang nhap dung — mong doi 200 + token:**
```
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"matkhau123\"}"
```

**Sai mat khau — mong doi 401:**
```
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"saimatkhau\"}"
```

---

### GET /me

**Co token hop le — mong doi 200:**
```
curl http://localhost:3000/me -H "Authorization: Bearer YOUR_TOKEN"
```

**Khong co token — mong doi 401:**
```
curl http://localhost:3000/me
```

**Token sai — mong doi 401:**
```
curl http://localhost:3000/me -H "Authorization: Bearer abc.def.ghi"
```

---

### GET /products

**Tat ca san pham — mong doi 200:**
```
curl "http://localhost:3000/products" -H "Authorization: Bearer YOUR_TOKEN"
```

**Loc available — mong doi 200:**
```
curl "http://localhost:3000/products?status=available" -H "Authorization: Bearer YOUR_TOKEN"
```

**Loc out_of_stock — mong doi 200:**
```
curl "http://localhost:3000/products?status=out_of_stock" -H "Authorization: Bearer YOUR_TOKEN"
```

**Loc discontinued — mong doi 200:**
```
curl "http://localhost:3000/products?status=discontinued" -H "Authorization: Bearer YOUR_TOKEN"
```

**Status khong hop le — mong doi 400:**
```
curl "http://localhost:3000/products?status=invalid_value" -H "Authorization: Bearer YOUR_TOKEN"
```

**Khong co token — mong doi 401:**
```
curl "http://localhost:3000/products?status=available"
```

---

### Brute-force (chay 6 lan lien tiep)

**Lan 1-4 (mong doi 401 + so lan con lai):**
```
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"saimatkhau\"}"
```

**Lan 5 (mong doi 429 - bi khoa):**
```
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"saimatkhau\"}"
```

**Lan 6 — DUNG mat khau nhung VAN 429:**
```
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\", \"password\": \"matkhau123\"}"
```

---

## Du lieu san pham mau (hardcode)

| id | Ten san pham              | Status       |
|----|---------------------------|--------------|
| 1  | Laptop Dell XPS 15        | available    |
| 2  | iPhone 15 Pro Max         | available    |
| 3  | Samsung Galaxy S23        | out_of_stock |
| 4  | Sony WH-1000XM5 Headphone | discontinued |
| 5  | iPad Pro 12.9"            | out_of_stock |

---

*Tac gia: Trieu Duy Khang — Bai test Backend Developer — TNM GROUP*
