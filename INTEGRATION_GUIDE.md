# 🔗 Integration Guide - Complete Service Architecture

## Overview

This document explains how the three services (Go Backend, Stripe Backend, and Next.js Frontend) communicate and integrate with each other.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (3000)                   │
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │ Payment Services     │      │ Stripe Elements      │    │
│  │ - PayPalService      │      │ - Payment Element    │    │
│  │ - StripeService      │      │ - Card Element       │    │
│  └──────────────────────┘      └──────────────────────┘    │
└───────┬────────────────────────────┬─────────────────────────┘
        │                            │
        │ HTTP Requests              │ HTTP Requests
        │                            │
        ▼                            ▼
┌──────────────────────┐    ┌───────────────────────┐
│ Go Backend (8080)    │    │ Stripe Backend (4242) │
│ (PayPal)             │    │ (Stripe)              │
│                      │    │                       │
│ handlers/paypal/     │    │ controllers/          │
│ ├─ paypal.go         │    │ ├─ paymentCtrl.js    │
│ ├─ routes.go         │    │ ├─ webhookCtrl.js    │
│ └─ webhook.go        │    │ services/             │
│                      │    │ └─ stripeService.js  │
│ Database Integration │    │                       │
│ ├─ Payment Records   │    │ Inter-Service Comm    │
│ ├─ User Subscriptions│    │ └─ integration.js    │
│ └─ Transactions      │    │                       │
└────────┬─────────────┘    └────────┬──────────────┘
         │                           │
         │ ◄─────────────────────────►│
         │   Service Integration      │
         │   - Status Updates         │
         │   - Event Broadcasting     │
         │   - Webhook Callbacks      │
         │                            │
         ▼                            ▼
┌────────────────────────────────────────┐
│        MySQL Database (saas_db)        │
│  ├─ subscriptions                     │
│  ├─ transactions                      │
│  └─ audit_logs                        │
└────────────────────────────────────────┘
```

---

## 🎯 Service Communication Flow

### Payment Flow (PayPal)

```
1. User selects PayPal on Frontend
   └─► PaymentIntegration.handlePayPalPayment()
       └─► PayPalService.createOrder()
           └─► POST /api/paypal/create-payment (Go Backend)
               └─► Returns: orderId, approvalUrl

2. User redirected to PayPal.com for approval

3. PayPal redirects back to Frontend with orderId

4. Frontend calls capturePayPalPayment()

5. Go Backend sends update to Stripe Backend
   └─► POST /api/payment/update (Stripe Backend)
       └─► ServiceIntegration.sendPaymentUpdate()
           └─► Records payment in database

6. Go Backend processes webhook from PayPal
   └─► Activates subscription
       └─► Updates user record
```

### Payment Flow (Stripe)

```
1. User selects Stripe on Frontend
   └─► PaymentIntegration.handleStripePayment()
       └─► StripeService.createPaymentIntent()
           └─► POST /api/payment/create-intent (Stripe Backend)
               └─► Returns: clientSecret, paymentIntentId

2. Frontend uses Stripe Elements to collect payment
   └─► Stripe.confirmPayment(clientSecret)
       └─► POST /api/payment/confirm (Stripe Backend)
           └─► Returns: status

3. Stripe Backend processes confirmation
   └─► payment_intent.succeeded event
       └─► POST /api/subscription/activate (Go Backend)
           └─► Activates subscription
```

---

## 📡 Service Integration Points

### 1. Frontend ↔ Go Backend

**Connection:** HTTP over CORS

**Endpoints:**
- `POST /api/paypal/create-payment` - Create PayPal order
- `POST /api/paypal/capture/:orderId` - Capture PayPal payment
- `GET /api/payment/:id` - Get payment status
- `GET /api/subscription/:id` - Get subscription status
- `GET /api/user/:id/subscription-status` - Check subscription

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "code": 200
}
```

### 2. Frontend ↔ Stripe Backend

**Connection:** HTTP over CORS

**Endpoints:**
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/confirm` - Confirm payment
- `GET /api/payment/:id` - Get payment status
- `POST /api/payment/update` - Update payment status (from webhooks)

**Response Format:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "error": null
}
```

### 3. Go Backend ↔ Stripe Backend

**Connection:** HTTP with API Key authentication

**Endpoints (Go Backend calling Stripe Backend):**
- `POST /api/payment/update` - Notify payment update
- `POST /api/subscription/activate` - Activate subscription
- `GET /api/webhook/verify` - Verify webhook signature

**Endpoints (Stripe Backend calling Go Backend):**
- `POST /api/payment/update` - Send payment completion
- `POST /api/subscription/activate` - Activate subscription
- `POST /api/event/broadcast` - Broadcast events

**Authentication:**
```
Header: X-API-Key: <GO_BACKEND_API_KEY>
Header: X-Service: stripe-backend
Header: X-Timestamp: <ISO_TIMESTAMP>
```

---

## 🔐 Configuration Files

### backend/.env (Go Backend)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=saas_db

# Server
PORT=8080
GIN_MODE=debug

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Integration
STRIPE_BACKEND_URL=http://localhost:4242
GO_BACKEND_API_KEY=your_api_key

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_secret
```

### stripe-backend/.env (Stripe Backend)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Server
PORT=4242
NODE_ENV=development

# Integration
GO_BACKEND_URL=http://localhost:8080
GO_BACKEND_API_KEY=your_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### .env.local (Frontend)

```env
# Backend URLs
NEXT_PUBLIC_GO_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_BACKEND_URL=http://localhost:4242

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id

# Database
NEXT_PUBLIC_MYSQL_HOST=localhost
NEXT_PUBLIC_MYSQL_DATABASE=saas_db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
```

---

## 🛠️ Service Integration Utilities

### Backend Integration (Go)

**File:** `backend/utils/serviceIntegration.go`

```go
// Initialize service client
sc := NewServiceClient()

// Send payment update to Stripe backend
response, err := sc.SendPaymentUpdate(PaymentUpdateRequest{
    OrderID: "order_123",
    PaymentID: "pay_456",
    Status: "COMPLETED",
    Amount: 99.99,
})

// Activate subscription
response, err := sc.ActivateSubscription(SubscriptionActivateRequest{
    UserID: "user_123",
    SubscriptionID: "sub_456",
    Plan: "pro",
    Status: "active",
})

// Health check
healthy, err := sc.HealthCheck()
```

### Stripe Backend Integration (Node.js)

**File:** `stripe-backend/utils/integration.js`

```js
const integration = require('./utils/integration');

// Send payment update to Go backend
await integration.sendPaymentUpdate({
    paymentId: 'pi_123',
    orderId: 'order_456',
    status: 'COMPLETED',
    amount: 99.99,
    userId: 'user_123',
});

// Activate subscription
await integration.activateSubscription({
    userId: 'user_123',
    subscriptionId: 'sub_456',
    plan: 'pro',
    endDate: new Date(Date.now() + 30*24*60*60*1000),
});

// Health check
const health = await integration.healthCheckGoBackend();
```

### Frontend Payment Services

**File:** `services/paymentService.ts`

```ts
// Create PayPal payment
const response = await PaymentService.createPayPalPayment({
    userId: 'user_123',
    planId: 'plan_456',
    amount: 99.99,
    currency: 'USD',
});

// Create Stripe payment
const response = await PaymentService.createStripePayment({
    userId: 'user_123',
    planId: 'plan_456',
    amount: 99.99,
    currency: 'USD',
});

// Get payment status
const status = await PaymentService.getPaymentStatus('payment_123');

// Check subscription
const subStatus = await PaymentService.checkPaymentAndSubscription('user_123');
```

---

## 🔄 Event Broadcasting

When critical events occur, they are broadcast to all services that need to know:

**Event Types:**
- `payment.completed` - Payment successfully processed
- `payment.failed` - Payment failed
- `subscription.activated` - Subscription activated
- `subscription.canceled` - Subscription canceled
- `refund.processed` - Payment refunded

**Flow:**
```
Event occurs in Stripe Backend
    └─► Generate event object
    └─► POST /api/event/broadcast (Go Backend)
        └─► Parse event
        └─► Update database
        └─► Trigger webhooks
        └─► Notify frontend via WebSocket (optional)
```

---

## ✅ Troubleshooting Integration Issues

### 1. Services Not Communicating

**Symptoms:** Timeout errors, connection refused

**Checks:**
- [ ] Verify all services are running on correct ports
- [ ] Check firewall/proxy settings
- [ ] Verify `STRIPE_BACKEND_URL` and `GO_BACKEND_URL` env vars
- [ ] Check CORS configuration matches frontend URL

**Debug:**
```bash
# Test Go Backend
curl -X GET http://localhost:8080/health

# Test Stripe Backend  
curl -X GET http://localhost:4242/health

# Check network
netstat -an | grep LISTEN
```

### 2. Webhook Not Received

**Symptoms:** Payment successful but subscription not activated

**Checks:**
- [ ] Verify webhook URL is correct
- [ ] Check webhook secret in Stripe dashboard
- [ ] Verify firewall allows incoming webhooks
- [ ] Check logs for webhook processing errors

**Debug:**
```bash
# Check webhook logs
tail -f logs/webhook.log

# Test webhook with curl
curl -X POST http://localhost:4242/api/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: xxx" \
  -d '{"type":"payment_intent.succeeded",...}'
```

### 3. Payment Status Not Updating

**Symptoms:** Payment shows as pending forever

**Checks:**
- [ ] Check Go Backend database connection
- [ ] Verify payment record exists in database
- [ ] Check inter-service API key
- [ ] Review logs for update failures

**Debug:**
```bash
# Check database
mysql -u root -p saas_db
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;

# Check logs
tail -f backend/logs/payment.log
tail -f stripe-backend/logs/payment.log
```

### 4. CORS Errors

**Symptoms:** Browser blocks requests to backends

**Solution:**
1. Update `ALLOWED_ORIGINS` in both backends
2. Ensure frontend URL matches exactly
3. Verify headers are being set correctly

**Debug:**
```bash
# Check CORS headers
curl -I -X OPTIONS http://localhost:8080/api/paypal/create-payment \
  -H "Origin: http://localhost:3000"
```

---

## 📊 Monitoring Integration Health

### Health Check Endpoints

```bash
# Go Backend
GET http://localhost:8080/health
Response: { "status": "ok" }

# Stripe Backend
GET http://localhost:4242/health
Response: { "status": "ok" }

# Both backends calling each other
GET http://localhost:8080/api/health/services
Response: {
  "go_backend": "healthy",
  "stripe_backend": "healthy",
  "database": "healthy"
}
```

### Logging Integration Events

All integration events are logged with timestamp and details:

```
[2024-01-13 10:30:45] Integration Event: PaymentUpdate | GoBackend -> StripeBackend | Status: SUCCESS
  Details: {
    "paymentId": "pi_123",
    "status": "COMPLETED"
  }
```

### Metrics to Monitor

- Payment creation latency
- Inter-service communication time
- Webhook processing time
- Database operation time
- Error rates per endpoint

---

## 🚀 Deployment Considerations

### Production Configuration

1. **Environment Variables**
   - Use strong API keys from actual Stripe/PayPal accounts
   - Use production URLs instead of localhost
   - Enable HTTPS for all inter-service communication

2. **Database**
   - Use managed database service (RDS, Cloud SQL)
   - Enable backups and replication
   - Use connection pooling

3. **Services**
   - Use containerization (Docker) for consistency
   - Deploy behind load balancers
   - Enable health checks and auto-restart

4. **Security**
   - Whitelist IP addresses between services
   - Use VPN/private networks for inter-service communication
   - Rotate API keys regularly
   - Enable HTTPS everywhere

5. **Monitoring**
   - Set up centralized logging
   - Configure alerts for payment failures
   - Monitor integration health continuously
   - Track payment metrics

---

## 📚 Related Documentation

- [PAYMENT_SYSTEM_DOCUMENTATION.md](./PAYMENT_SYSTEM_DOCUMENTATION.md) - Complete API reference
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - File organization
- [README.md](./README.md) - Main documentation
- [QUICK_START_PAYMENT.md](./QUICK_START_PAYMENT.md) - Setup guide

---

**Last Updated:** January 13, 2026
**Status:** Integration Complete ✅
