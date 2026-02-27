// EXAMPLE_REQUESTS.md - API Testing Examples

## 🧪 Testing dengan cURL atau Postman

### 1. User Registration
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123",
    "name": "John Doe"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "user_1702123456_456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. User Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "demo_jwt_token_user_1702123456_456",
  "user": {
    "id": "user_1702123456_456",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 3. Create Payment
```bash
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_1702123456_456",
    "plan_type": "premium",
    "amount": 120000,
    "currency": "IDR",
    "method": "paypal"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_1702123456_789",
    "amount": 120000,
    "currency": "IDR",
    "plan_type": "premium",
    "payment_url": "https://www.sandbox.paypal.com/checkoutnow?token=pay_1702123456_789",
    "payment_type": "redirect",
    "status": "pending"
  }
```

### 4. Verify Payment
```bash
curl -X GET "http://localhost:8080/api/payments/verify?payment_id=pay_1702123456_789"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_1702123456_789",
    "status": "completed",
    "plan_type": "premium",
    "verified_at": "2024-12-09T10:30:00Z"
  }
}
```

### 5. Get All Payments (Admin)
```bash
curl -X GET http://localhost:8080/api/payments/history
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pay_1702123456_789",
      "user_id": "user_1702123456_456",
      "plan_type": "premium",
      "amount": 120000,
      "currency": "IDR",
      "method": "paypal",
      "status": "completed",
      "created_at": "2024-12-09T10:00:00Z",
      "updated_at": "2024-12-09T10:30:00Z"
    }
  ]
}
```

### 6. Get All Subscriptions (Admin)
```bash
curl -X GET http://localhost:8080/api/subscriptions
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_1702123456_123",
      "user_id": "user_1702123456_456",
      "plan_type": "premium",
      "is_active": true,
      "expires_at": "2025-01-09T10:30:00Z",
      "payment_id": "pay_1702123456_789",
      "created_at": "2024-12-09T10:00:00Z",
      "updated_at": "2024-12-09T10:30:00Z"
    }
  ]
}
```

### 7. Get Dashboard Stats (Admin)
```bash
curl -X GET http://localhost:8080/api/admin/stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": 10,
    "total_payments": 8,
    "total_revenue": 960000,
    "active_subscriptions": 8,
    "subscriptions_by_plan": {
      "free": 2,
      "standard": 3,
      "premium": 5
    }
  }
}
```

### 8. Get Payments by Status
```bash
curl -X GET "http://localhost:8080/api/admin/payments/by-status?status=completed"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "pay_1702123456_789",
      "user_id": "user_1702123456_456",
      "plan_type": "premium",
      "amount": 120000,
      "currency": "IDR",
      "method": "paypal",
      "status": "completed",
      "created_at": "2024-12-09T10:00:00Z",
      "updated_at": "2024-12-09T10:30:00Z"
    }
  ]
}
```

### 9. Get Subscriptions by Plan
```bash
curl -X GET "http://localhost:8080/api/admin/subscriptions/by-plan?plan_type=premium"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_1702123456_123",
      "user_id": "user_1702123456_456",
      "plan_type": "premium",
      "is_active": true,
      "expires_at": "2025-01-09T10:30:00Z",
      "payment_id": "pay_1702123456_789",
      "created_at": "2024-12-09T10:00:00Z",
      "updated_at": "2024-12-09T10:30:00Z"
    }
  ]
}
```

## 📦 Postman Collection Template

```json
{
  "info": {
    "name": "SAAS Dashboard API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:8080/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"user@example.com\", \"password\": \"password123\", \"name\": \"John Doe\"}"
        }
      }
    },
    {
      "name": "Get All Payments",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/payments/history"
      }
    },
    {
      "name": "Get All Subscriptions",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/subscriptions"
      }
    },
    {
      "name": "Get Dashboard Stats",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/admin/stats"
      }
    }
  ]
}
```

## 🔍 Troubleshooting

### CORS Error
Jika mendapat CORS error, pastikan:
- Backend berjalan di `http://localhost:8080`
- Frontend berjalan di `http://localhost:3000`
- CORS sudah dikonfigurasi di `main.go`

### Database Connection Error
- Pastikan MySQL sudah running
- Check `.env` file di backend folder
- Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

### 404 Not Found
- Check path endpoint sudah benar
- Pastikan method (GET/POST/PUT/DELETE) sesuai
- Check trailing slash

### Payment Status Tidak Berubah
- Payment status otomatis berubah menjadi "completed" saat verify
- Untuk production, integrate dengan PayPal/blockchain API

## 🎯 Testing Checklist

- [ ] Register user berhasil
- [ ] Login user berhasil
- [ ] Create payment berhasil
- [ ] Verify payment berhasil
- [ ] Get all payments berhasil
- [ ] Get all subscriptions berhasil
- [ ] Get admin stats berhasil
- [ ] Dashboard menampilkan data dengan benar
- [ ] Tidak ada error di console
- [ ] Database records sudah tersimpan
