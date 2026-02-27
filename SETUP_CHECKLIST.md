# 📋 Checklist - Project Setup & Execution

## ✅ Before Starting

- [ ] Node.js 18+ installed
- [ ] Go 1.20+ installed
- [ ] MySQL 8.0+ installed
- [ ] Git installed
- [ ] 2GB+ free disk space

## ✅ Initial Setup

- [ ] Clone/Navigate to saas2 folder
- [ ] Run `setup.bat` (Windows) or `./setup.sh` (Linux/Mac)
- [ ] All scripts executed successfully

## ✅ Configuration

### Backend (Golang)
- [ ] Created `backend/.env` from template
- [ ] Added PayPal CLIENT_ID
- [ ] Added PayPal CLIENT_SECRET
- [ ] Added database credentials
- [ ] Added JWT_SECRET

### Stripe Backend
- [ ] Created `stripe-backend/.env` from template
- [ ] Added STRIPE_SECRET_KEY
- [ ] Added STRIPE_WEBHOOK_SECRET
- [ ] Added GO_BACKEND_URL

### Frontend (Optional)
- [ ] Created `.env.local` (if needed)
- [ ] Added NEXT_PUBLIC URLs

## ✅ Database

- [ ] MySQL running
- [ ] Database `saas_db` created
- [ ] Connection credentials correct in `backend/.env`

## ✅ Starting Services

### Method 1: All At Once
- [ ] Run `start-all.bat` (Windows) or `./start-all.sh` (Linux/Mac)
- [ ] All 3 services started successfully

### Method 2: Individual Services

**Go Backend:**
- [ ] `cd backend && go run main.go`
- [ ] Server running on port 8080
- [ ] Health check at http://localhost:8080/health ✓

**Stripe Backend:**
- [ ] `cd stripe-backend && npm start`
- [ ] Server running on port 4242
- [ ] Health check at http://localhost:4242 ✓

**Frontend:**
- [ ] `npm run dev` (from root)
- [ ] Server running on port 3000
- [ ] Access at http://localhost:3000 ✓

## ✅ Testing

### PayPal Payment
- [ ] Go to http://localhost:3000/pricing
- [ ] Select plan and choose PayPal
- [ ] Authorize with sandbox account
- [ ] Payment completes successfully
- [ ] Check database: `SELECT * FROM payments WHERE method='paypal'`

### Stripe Payment
- [ ] Go to http://localhost:3000/pricing
- [ ] Select plan and choose Stripe
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete payment successfully
- [ ] Check database: `SELECT * FROM payments WHERE method='stripe'`

## ✅ Verification

- [ ] Frontend loads (http://localhost:3000)
- [ ] Can access pricing page
- [ ] Can see payment options
- [ ] Backend APIs responding (http://localhost:8080/health)
- [ ] Stripe backend responding (http://localhost:4242)
- [ ] Database has payment records
- [ ] No console errors

## 📝 Notes

```
Add any issues or special notes here:
- 
- 
- 
```

## ⚡ Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `setup.bat` | Initial setup (Windows) |
| `./setup.sh` | Initial setup (Linux/Mac) |
| `start-all.bat` | Start all services (Windows) |
| `./start-all.sh` | Start all services (Linux/Mac) |
| `start-go-backend.bat` | Start Go backend only |
| `start-stripe-backend.bat` | Start Stripe backend only |
| `start-frontend.bat` | Start frontend only |
| `go run main.go` | Start Go backend (manual) |
| `npm start` | Start Stripe backend (manual) |

## 🆘 Troubleshooting Quick Fixes

| Issue | Solution |
| Port in use | `taskkill /PID <pid> /F` (Windows) |
| DB error | Check credentials in `backend/.env` |
| Dependencies fail | `npm cache clean --force && npm install` |
| PayPal error | Verify credentials in PayPal Developer Dashboard |
| Can't connect | Ensure all backends running, check CORS settings |

---

**Status: Ready to Deploy! ✅**
