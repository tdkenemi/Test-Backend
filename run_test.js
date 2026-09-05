const http = require('http');

function request(path, method, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const opts = { hostname: 'localhost', port: 3000, path, method, headers };
    let result = '';
    
    const req = http.request(opts, (res) => {
      res.on('data', (c) => result += c);
      res.on('end', () => resolve({ status: res.statusCode, body: result }));
    });
    
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('============================================================');
  console.log('       🚀 KỊCH BẢN KIỂM THỬ TỰ ĐỘNG API (TEST SCRIPT)');
  console.log('============================================================\n');

  const randomEmail = `user_${Date.now()}@gmail.com`;

  // 1. Đăng ký (Register)
  const r1 = await request('/api/register', 'POST', { email: randomEmail, password: 'Password123' });
  console.log(`[1] POST /api/register -> Đăng ký tài khoản mới`);
  console.log(`    Status: ${r1.status} | Body: ${r1.body}\n`);

  // 2. Đăng ký trùng email
  const r2 = await request('/api/register', 'POST', { email: randomEmail, password: 'Password123' });
  console.log(`[2] POST /api/register -> Cố tình đăng ký trùng email`);
  console.log(`    Status: ${r2.status} | Body: ${r2.body}\n`);

  // 3. Đăng nhập thành công (Login)
  const r3 = await request('/api/login', 'POST', { email: randomEmail, password: 'Password123' });
  console.log(`[3] POST /api/login -> Đăng nhập đúng mật khẩu`);
  console.log(`    Status: ${r3.status} | Body: ${r3.body}`);
  const token = JSON.parse(r3.body).token;
  console.log(`    Token: ${token ? token.substring(0, 40) + '...' : 'KHÔNG CÓ'}\n`);

  // 4. Lấy thông tin user (GET /api/me)
  const r4 = await request('/api/me', 'GET', null, token);
  console.log(`[4] GET /api/me -> Lấy thông tin cá nhân (Có token)`);
  console.log(`    Status: ${r4.status} | Body: ${r4.body}\n`);

  // 5. Lấy danh sách sản phẩm (GET /api/products)
  const r5 = await request('/api/products', 'GET', null, token);
  console.log(`[5] GET /api/products -> Xem tất cả sản phẩm (Có token)`);
  console.log(`    Status: ${r5.status} | Body: ${r5.body.substring(0, 100)}... (đã cắt ngắn)\n`);

  // 6. Báo lỗi khi truy cập API không tồn tại
  const r6 = await request('/api/invalid_route_test', 'GET', null, token);
  console.log(`[6] GET /api/invalid_route_test -> Test route sai`);
  console.log(`    Status: ${r6.status} | Body: ${r6.body}\n`);

  console.log('============================================================');
  console.log('    ✅ TEST HOÀN TẤT - BẠN CÓ THỂ CHỤP MÀN HÌNH CHỖ NÀY');
  console.log('============================================================');
}

runTests();
