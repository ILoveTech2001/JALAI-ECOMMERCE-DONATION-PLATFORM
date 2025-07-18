#!/bin/bash

# Compilation check script for Jalai Donation Platform

echo "🔍 Checking Compilation Status"
echo "=============================="

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

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    print_error "Maven not found. Please install Maven."
    exit 1
fi

print_info "Cleaning previous builds..."
mvn clean -q

print_info "Compiling main sources..."
if mvn compile -q; then
    print_success "Main sources compiled successfully"
else
    print_error "Main source compilation failed"
    exit 1
fi

print_info "Compiling test sources..."
if mvn test-compile -q; then
    print_success "Test sources compiled successfully"
else
    print_error "Test source compilation failed"
    exit 1
fi

print_info "Running dependency check..."
if mvn dependency:resolve -q; then
    print_success "All dependencies resolved"
else
    print_error "Dependency resolution failed"
    exit 1
fi

print_success "All compilation checks passed! 🎉"
echo
echo "📋 Summary:"
echo "- Main sources: ✓ Compiled"
echo "- Test sources: ✓ Compiled"
echo "- Dependencies: ✓ Resolved"
echo
echo "🚀 Ready to run: mvn spring-boot:run"
