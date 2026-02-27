#!/bin/bash

# ============================================
# SaaS Platform - Start All Services
# ============================================

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚀 SaaS Platform - Starting All Services             ║"
echo "╚════════════════════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create a function to run services in parallel with logging
start_service() {
    local name=$1
    local cmd=$2
    local dir=$3
    local port=$4
    
    echo -e "${BLUE}Starting ${name}...${NC}"
    
    cd "$dir"
    $cmd &
    
    sleep 2
    echo -e "${GREEN}✓ ${name} started on port ${port}${NC}"
    cd - > /dev/null
}

echo ""
echo "📋 Starting services..."
echo ""

# Start Golang Backend (PayPal)
start_service "Golang Backend (PayPal)" "go run main.go" "backend" "8080" &
GOLANG_PID=$!

# Wait a bit before starting Express
sleep 2

# Start Express.js Backend (Stripe)
start_service "Express.js Backend (Stripe)" "npm start" "stripe-backend" "4242" &
EXPRESS_PID=$!

# Wait a bit before starting Next.js
sleep 2

# Start Next.js Frontend
start_service "Next.js Frontend" "npm run dev" "." "3000" &
NEXT_PID=$!

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✅ All Services Started!                             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Access the platform:"
echo -e "   ${YELLOW}Frontend:        http://localhost:3000${NC}"
echo -e "   ${YELLOW}Go Backend:      http://localhost:8080${NC}"
echo -e "   ${YELLOW}Stripe Backend:  http://localhost:4242${NC}"
echo ""
echo "🔍 Service PIDs:"
echo "   Go Backend:    $GOLANG_PID"
echo "   Express.js:    $EXPRESS_PID"
echo "   Next.js:       $NEXT_PID"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C to kill all background processes
trap "kill $GOLANG_PID $EXPRESS_PID $NEXT_PID" INT TERM

# Wait for all processes
wait
