#!/bin/bash

# ============================================
# Individual Service Startup Scripts
# ============================================

# Start only Go Backend
start-go() {
    cd backend
    echo "🚀 Starting Golang Backend (PayPal)..."
    echo "📍 http://localhost:8080"
    go run main.go
}

# Start only Stripe Backend
start-stripe() {
    cd stripe-backend
    echo "🚀 Starting Express.js Backend (Stripe)..."
    echo "📍 http://localhost:4242"
    npm start
}

# Start only Frontend
start-frontend() {
    echo "🚀 Starting Next.js Frontend..."
    echo "📍 http://localhost:3000"
    npm run dev
}

# Default - start all
echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚀 SaaS Platform - Service Starter                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Usage: ./start.sh [SERVICE]"
echo ""
echo "Available services:"
echo "  go          Start Golang backend (PayPal)"
echo "  stripe      Start Stripe backend"
echo "  frontend    Start Next.js frontend"
echo "  all         Start all services (default)"
echo ""

SERVICE=${1:-all}

case $SERVICE in
    go)
        start-go
        ;;
    stripe)
        start-stripe
        ;;
    frontend)
        start-frontend
        ;;
    all)
        echo "Starting all services..."
        start-go &
        GO_PID=$!
        sleep 2
        start-stripe &
        STRIPE_PID=$!
        sleep 2
        start-frontend &
        FRONTEND_PID=$!
        
        echo ""
        echo "✅ All services started!"
        echo "   Go Backend:   $GO_PID"
        echo "   Stripe:       $STRIPE_PID"
        echo "   Frontend:     $FRONTEND_PID"
        echo ""
        echo "Press Ctrl+C to stop all services"
        
        trap "kill $GO_PID $STRIPE_PID $FRONTEND_PID" INT TERM
        wait
        ;;
    *)
        echo "Unknown service: $SERVICE"
        exit 1
        ;;
esac
