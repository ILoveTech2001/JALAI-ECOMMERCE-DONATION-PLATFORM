#!/bin/bash

# API Testing Script for Jalai Donation Platform
# This script tests the main API endpoints

BASE_URL="http://localhost:8080/api"
ADMIN_TOKEN=""
CLIENT_TOKEN=""
ORPHANAGE_TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -n "$token" ]; then
        curl -s -X $method \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $token" \
             -d "$data" \
             "$BASE_URL$endpoint"
    else
        curl -s -X $method \
             -H "Content-Type: application/json" \
             -d "$data" \
             "$BASE_URL$endpoint"
    fi
}

# Test 1: Health Check
test_health_check() {
    print_test "Health Check"
    response=$(curl -s http://localhost:8080/actuator/health)
    if echo "$response" | grep -q '"status":"UP"'; then
        print_success "Application is running"
    else
        print_error "Application is not running properly"
        echo "Response: $response"
        exit 1
    fi
}

# Test 2: Get Public Categories
test_public_categories() {
    print_test "Get Public Categories"
    response=$(api_call "GET" "/categories/public")
    if [ $? -eq 0 ]; then
        print_success "Public categories retrieved"
        echo "Categories: $(echo $response | jq -r '.[].name' 2>/dev/null || echo $response)"
    else
        print_error "Failed to get public categories"
    fi
}

# Test 3: Admin Login
test_admin_login() {
    print_test "Admin Login"
    login_data='{
        "email": "admin@jalai.com",
        "password": "Admin123!"
    }'
    
    response=$(api_call "POST" "/auth/login" "$login_data")
    ADMIN_TOKEN=$(echo $response | jq -r '.accessToken' 2>/dev/null)
    
    if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
        print_success "Admin login successful"
        print_info "Admin Token: ${ADMIN_TOKEN:0:20}..."
    else
        print_error "Admin login failed"
        echo "Response: $response"
    fi
}

# Test 4: Client Registration
test_client_registration() {
    print_test "Client Registration"
    register_data='{
        "name": "Test Client",
        "email": "testclient@example.com",
        "password": "TestPass123!",
        "phone": "+1234567890",
        "location": "Test City"
    }'
    
    response=$(api_call "POST" "/auth/register/client" "$register_data")
    CLIENT_TOKEN=$(echo $response | jq -r '.accessToken' 2>/dev/null)
    
    if [ "$CLIENT_TOKEN" != "null" ] && [ -n "$CLIENT_TOKEN" ]; then
        print_success "Client registration successful"
        print_info "Client Token: ${CLIENT_TOKEN:0:20}..."
    else
        print_error "Client registration failed"
        echo "Response: $response"
    fi
}

# Test 5: Client Login
test_client_login() {
    print_test "Client Login"
    login_data='{
        "email": "john.doe@email.com",
        "password": "Client123!"
    }'
    
    response=$(api_call "POST" "/auth/login" "$login_data")
    token=$(echo $response | jq -r '.accessToken' 2>/dev/null)
    
    if [ "$token" != "null" ] && [ -n "$token" ]; then
        print_success "Client login successful"
        CLIENT_TOKEN=$token
    else
        print_error "Client login failed - using registered client token"
    fi
}

# Test 6: Get Products
test_get_products() {
    print_test "Get Products"
    response=$(api_call "GET" "/products?page=0&size=5")
    
    if echo "$response" | grep -q '"content"'; then
        print_success "Products retrieved successfully"
        product_count=$(echo $response | jq -r '.totalElements' 2>/dev/null || echo "unknown")
        print_info "Total products: $product_count"
    else
        print_error "Failed to get products"
        echo "Response: $response"
    fi
}

# Test 7: Create Product (Client)
test_create_product() {
    print_test "Create Product (Client)"
    
    if [ -z "$CLIENT_TOKEN" ]; then
        print_error "No client token available"
        return
    fi
    
    # First get a category ID
    categories_response=$(api_call "GET" "/categories/public")
    category_id=$(echo $categories_response | jq -r '.[0].id' 2>/dev/null)
    
    if [ "$category_id" = "null" ] || [ -z "$category_id" ]; then
        print_error "No categories available for product creation"
        return
    fi
    
    # Get client ID from token (simplified - in real scenario you'd decode JWT)
    client_response=$(api_call "GET" "/client/profile/$(uuidgen)" "" "$CLIENT_TOKEN")
    
    product_data='{
        "name": "Test Product API",
        "description": "Product created via API test",
        "price": 99.99,
        "imageUrl": "http://example.com/test-image.jpg",
        "sellerId": "'"$(uuidgen)"'",
        "categoryId": "'"$category_id"'"
    }'
    
    response=$(api_call "POST" "/products" "$product_data" "$CLIENT_TOKEN")
    
    if echo "$response" | grep -q '"id"'; then
        print_success "Product created successfully"
        product_id=$(echo $response | jq -r '.id' 2>/dev/null)
        print_info "Product ID: $product_id"
    else
        print_error "Failed to create product"
        echo "Response: $response"
    fi
}

# Test 8: Search Products
test_search_products() {
    print_test "Search Products"
    response=$(api_call "GET" "/products/search?keyword=phone")
    
    if [ $? -eq 0 ]; then
        print_success "Product search completed"
        result_count=$(echo $response | jq '. | length' 2>/dev/null || echo "unknown")
        print_info "Search results: $result_count"
    else
        print_error "Product search failed"
    fi
}

# Test 9: Orphanage Registration
test_orphanage_registration() {
    print_test "Orphanage Registration"
    register_data='{
        "name": "Test Orphanage API",
        "email": "testorphanage@example.com",
        "password": "TestPass123!",
        "phoneNumber": "+1234567891",
        "location": "Test Orphanage Location"
    }'
    
    response=$(api_call "POST" "/auth/register/orphanage" "$register_data")
    ORPHANAGE_TOKEN=$(echo $response | jq -r '.accessToken' 2>/dev/null)
    
    if [ "$ORPHANAGE_TOKEN" != "null" ] && [ -n "$ORPHANAGE_TOKEN" ]; then
        print_success "Orphanage registration successful"
        print_info "Orphanage Token: ${ORPHANAGE_TOKEN:0:20}..."
    else
        print_error "Orphanage registration failed"
        echo "Response: $response"
    fi
}

# Test 10: Create Donation
test_create_donation() {
    print_test "Create Donation"
    
    if [ -z "$CLIENT_TOKEN" ] || [ -z "$ORPHANAGE_TOKEN" ]; then
        print_error "Missing required tokens for donation test"
        return
    fi
    
    donation_data='{
        "clientId": "'"$(uuidgen)"'",
        "orphanageId": "'"$(uuidgen)"'",
        "donationType": "CASH",
        "appointmentDate": "2024-12-31T10:00:00",
        "cashAmount": 100.00,
        "itemDescription": null
    }'
    
    response=$(api_call "POST" "/donations" "$donation_data" "$CLIENT_TOKEN")
    
    if echo "$response" | grep -q '"id"'; then
        print_success "Donation created successfully"
        donation_id=$(echo $response | jq -r '.id' 2>/dev/null)
        print_info "Donation ID: $donation_id"
    else
        print_error "Failed to create donation"
        echo "Response: $response"
    fi
}

# Test 11: Invalid Login
test_invalid_login() {
    print_test "Invalid Login (Security Test)"
    login_data='{
        "email": "invalid@example.com",
        "password": "wrongpassword"
    }'
    
    response=$(api_call "POST" "/auth/login" "$login_data")
    
    if echo "$response" | grep -q '"errorCode"'; then
        print_success "Invalid login properly rejected"
    else
        print_error "Security issue: Invalid login not properly handled"
        echo "Response: $response"
    fi
}

# Test 12: Unauthorized Access
test_unauthorized_access() {
    print_test "Unauthorized Access (Security Test)"
    response=$(api_call "GET" "/admin/users")
    
    if echo "$response" | grep -q '"status":401\|"error":"Unauthorized"'; then
        print_success "Unauthorized access properly blocked"
    else
        print_error "Security issue: Unauthorized access not blocked"
        echo "Response: $response"
    fi
}

# Main test execution
main() {
    echo "🧪 Jalai Donation Platform - API Testing"
    echo "========================================"
    
    # Check if jq is available for JSON parsing
    if ! command -v jq &> /dev/null; then
        print_info "jq not found. JSON responses will be shown raw."
    fi
    
    # Run tests
    test_health_check
    echo
    
    test_public_categories
    echo
    
    test_admin_login
    echo
    
    test_client_registration
    echo
    
    test_client_login
    echo
    
    test_get_products
    echo
    
    test_search_products
    echo
    
    test_create_product
    echo
    
    test_orphanage_registration
    echo
    
    test_create_donation
    echo
    
    test_invalid_login
    echo
    
    test_unauthorized_access
    echo
    
    print_success "API testing completed! 🎉"
    
    # Summary
    echo
    echo "📋 Test Summary:"
    echo "- Admin Token: ${ADMIN_TOKEN:+Available}"
    echo "- Client Token: ${CLIENT_TOKEN:+Available}"
    echo "- Orphanage Token: ${ORPHANAGE_TOKEN:+Available}"
    echo
    echo "💡 Use these tokens for further manual testing with Postman or curl"
}

# Run main function
main "$@"
