#!/bin/bash

# Quick start test for Jalai Donation Platform

echo "🚀 Quick Start Test"
echo "=================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check Maven
if ! command -v mvn &> /dev/null; then
    print_error "Maven not found"
    exit 1
fi

print_info "Cleaning and compiling..."
if mvn clean compile -q; then
    print_success "Compilation successful"
else
    print_error "Compilation failed"
    exit 1
fi

print_info "Testing Spring Boot context loading..."
timeout 30s mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=test --server.port=0" &
PID=$!

sleep 15

if ps -p $PID > /dev/null; then
    print_success "Application started successfully"
    kill $PID
    wait $PID 2>/dev/null
else
    print_warning "Application may have stopped early (check logs)"
fi

print_success "🎉 Quick test completed!"
echo
echo "📋 Next steps:"
echo "1. Start the application: mvn spring-boot:run"
echo "2. Check logs for any database connection issues"
echo "3. Access the API at: http://localhost:8080"
echo "4. API documentation: http://localhost:8080/swagger-ui.html"
