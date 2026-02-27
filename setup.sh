#!/bin/bash

# ============================================
# SaaS Platform - Complete Setup & Run Script
# ============================================

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚀 SaaS Platform - Setup & Execution                 ║"
echo "╚════════════════════════════════════════════════════════╝"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

# Check Go
if ! command -v go &> /dev/null; then
    print_error "Go is not installed"
    exit 1
fi
print_status "Go $(go version | awk '{print $3}')"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_status "Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm $(npm -v)"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_error "MySQL is not installed"
    exit 1
fi
print_status "MySQL is installed"

# Setup Golang Backend
echo ""
echo "🔧 Setting up Golang Backend (PayPal)..."
cd backend

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status "Created .env from template"
        print_info "⚠️  Please edit backend/.env with your credentials"
    fi
else
    print_status ".env already exists"
fi

if [ ! -d vendor ]; then
    go mod download
    print_status "Downloaded Go dependencies"
else
    print_status "Go dependencies already cached"
fi

cd ..

# Setup Express.js Backend
echo ""
echo "🔧 Setting up Express.js Backend (Stripe)..."
cd stripe-backend

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status "Created .env from template"
        print_info "⚠️  Please edit stripe-backend/.env with your Stripe keys"
    fi
else
    print_status ".env already exists"
fi

if [ ! -d node_modules ]; then
    npm install
    print_status "Installed npm dependencies"
else
    print_status "npm dependencies already installed"
fi

cd ..

# Setup Next.js Frontend
echo ""
echo "🔧 Setting up Next.js Frontend..."

if [ ! -f .env.local ]; then
    print_info "No .env.local found"
else
    print_status ".env.local exists"
fi

if [ ! -d node_modules ]; then
    npm install
    print_status "Installed npm dependencies"
else
    print_status "npm dependencies already installed"
fi

# Display next steps
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣  Configure credentials:"
echo "   ${YELLOW}nano backend/.env${NC}"
echo "   - Add PayPal CLIENT_ID and SECRET"
echo "   - Add database credentials"
echo ""
echo "2️⃣  Configure Stripe:"
echo "   ${YELLOW}nano stripe-backend/.env${NC}"
echo "   - Add STRIPE_SECRET_KEY"
echo "   - Add STRIPE_WEBHOOK_SECRET"
echo ""
echo "3️⃣  Run all services:"
echo "   ${YELLOW}./start-all.sh${NC}  (Linux/Mac)"
echo "   ${YELLOW}.\\start-all.bat${NC}  (Windows)"
echo ""
echo "4️⃣  Access the platform:"
echo "   Frontend:      http://localhost:3000"
echo "   Go Backend:    http://localhost:8080"
echo "   Stripe Backend: http://localhost:4242"
echo ""
