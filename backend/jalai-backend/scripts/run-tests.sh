#!/bin/bash

# Test runner script for Jalai Donation Platform
# This script runs different types of tests

echo "🧪 Jalai Donation Platform - Test Runner"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    print_error "Maven is not installed or not in PATH"
    exit 1
fi

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    mvn test -Dtest="**/*Test" -DfailIfNoTests=false
    if [ $? -eq 0 ]; then
        print_success "Unit tests completed successfully"
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    mvn test -Dtest="**/*IT" -DfailIfNoTests=false
    if [ $? -eq 0 ]; then
        print_success "Integration tests completed successfully"
    else
        print_error "Integration tests failed"
        return 1
    fi
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    mvn test
    if [ $? -eq 0 ]; then
        print_success "All tests completed successfully"
    else
        print_error "Some tests failed"
        return 1
    fi
}

# Function to run tests with coverage
run_tests_with_coverage() {
    print_status "Running tests with coverage..."
    mvn clean test jacoco:report
    if [ $? -eq 0 ]; then
        print_success "Tests with coverage completed successfully"
        print_status "Coverage report available at: target/site/jacoco/index.html"
    else
        print_error "Tests with coverage failed"
        return 1
    fi
}

# Function to run specific test class
run_specific_test() {
    if [ -z "$1" ]; then
        print_error "Please provide test class name"
        echo "Usage: $0 specific <TestClassName>"
        exit 1
    fi
    
    print_status "Running specific test: $1"
    mvn test -Dtest="$1"
    if [ $? -eq 0 ]; then
        print_success "Test $1 completed successfully"
    else
        print_error "Test $1 failed"
        return 1
    fi
}

# Function to clean and run tests
clean_and_test() {
    print_status "Cleaning and running tests..."
    mvn clean test
    if [ $? -eq 0 ]; then
        print_success "Clean and test completed successfully"
    else
        print_error "Clean and test failed"
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  unit              Run unit tests only"
    echo "  integration       Run integration tests only"
    echo "  all               Run all tests (default)"
    echo "  coverage          Run tests with coverage report"
    echo "  specific <class>  Run specific test class"
    echo "  clean             Clean and run all tests"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 unit"
    echo "  $0 coverage"
    echo "  $0 specific AuthServiceTest"
    echo "  $0 clean"
}

# Main script logic
case "${1:-all}" in
    "unit")
        run_unit_tests
        ;;
    "integration")
        run_integration_tests
        ;;
    "all")
        run_all_tests
        ;;
    "coverage")
        run_tests_with_coverage
        ;;
    "specific")
        run_specific_test "$2"
        ;;
    "clean")
        clean_and_test
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

exit_code=$?

if [ $exit_code -eq 0 ]; then
    print_success "Test execution completed successfully! 🎉"
else
    print_error "Test execution failed! ❌"
fi

exit $exit_code
