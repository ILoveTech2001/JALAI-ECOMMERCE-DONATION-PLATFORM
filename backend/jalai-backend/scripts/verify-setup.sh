#!/bin/bash

# Verification script for Jalai Donation Platform
# This script checks if everything is properly set up

echo "🔍 Jalai Donation Platform - Setup Verification"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if Java is installed
check_java() {
    print_check "Checking Java installation..."
    if command -v java &> /dev/null; then
        java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        print_success "Java found: $java_version"
    else
        print_error "Java not found. Please install Java 17 or higher."
        return 1
    fi
}

# Check if Maven is installed
check_maven() {
    print_check "Checking Maven installation..."
    if command -v mvn &> /dev/null; then
        maven_version=$(mvn -version | head -n 1)
        print_success "Maven found: $maven_version"
    else
        print_error "Maven not found. Please install Maven 3.6 or higher."
        return 1
    fi
}

# Check if MySQL is running
check_mysql() {
    print_check "Checking MySQL connection..."
    if command -v mysql &> /dev/null; then
        if mysql -u root -proot -e "SELECT 1;" &> /dev/null; then
            print_success "MySQL connection successful"
        else
            print_warning "MySQL connection failed. Please check credentials in application.properties"
        fi
    else
        print_warning "MySQL client not found. Please install MySQL."
    fi
}

# Check project structure
check_project_structure() {
    print_check "Checking project structure..."
    
    required_dirs=(
        "src/main/java/com/example/jalai_backend/model"
        "src/main/java/com/example/jalai_backend/repository"
        "src/main/java/com/example/jalai_backend/service"
        "src/main/java/com/example/jalai_backend/controller"
        "src/main/java/com/example/jalai_backend/security"
        "src/main/java/com/example/jalai_backend/exception"
        "src/main/resources"
        "src/test/java"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "Directory exists: $dir"
        else
            print_error "Missing directory: $dir"
        fi
    done
}

# Check required files
check_required_files() {
    print_check "Checking required files..."
    
    required_files=(
        "pom.xml"
        "src/main/java/com/example/jalai_backend/JalaiBackendApplication.java"
        "src/main/resources/application.properties"
        "src/main/java/com/example/jalai_backend/model/Admin.java"
        "src/main/java/com/example/jalai_backend/model/Client.java"
        "src/main/java/com/example/jalai_backend/model/Product.java"
        "src/main/java/com/example/jalai_backend/security/SecurityConfig.java"
        "src/main/java/com/example/jalai_backend/controller/AuthController.java"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "File exists: $file"
        else
            print_error "Missing file: $file"
        fi
    done
}

# Try to compile the project
check_compilation() {
    print_check "Checking project compilation..."
    if mvn clean compile -q; then
        print_success "Project compiles successfully"
    else
        print_error "Compilation failed. Please check the error messages above."
        return 1
    fi
}

# Check dependencies
check_dependencies() {
    print_check "Checking Maven dependencies..."
    if mvn dependency:resolve -q; then
        print_success "All dependencies resolved successfully"
    else
        print_error "Dependency resolution failed."
        return 1
    fi
}

# Main verification function
main() {
    echo "Starting verification process..."
    echo
    
    check_java
    echo
    
    check_maven
    echo
    
    check_mysql
    echo
    
    check_project_structure
    echo
    
    check_required_files
    echo
    
    check_dependencies
    echo
    
    check_compilation
    echo
    
    print_success "Verification completed! 🎉"
    echo
    echo "📋 Next Steps:"
    echo "1. Set up your database: mysql -u root -p < scripts/setup-database.sql"
    echo "2. Run the application: mvn spring-boot:run"
    echo "3. Test the API: curl http://localhost:8080/actuator/health"
    echo
    echo "📚 Documentation:"
    echo "- README.md - Project overview"
    echo "- API_DOCUMENTATION.md - API reference"
    echo "- DATABASE_SETUP.md - Database setup guide"
}

# Run main function
main "$@"
