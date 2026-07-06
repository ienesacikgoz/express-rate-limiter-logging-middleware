#!/bin/bash
# Express Rate Limiter API Test Script
# Run this script to test all API endpoints

API_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Express Rate Limiter & Logging Middleware API Tests ===${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl -s "$API_URL/health" | jq .
echo ""

# Test 2: Ready Check
echo -e "${BLUE}2. Ready Check${NC}"
curl -s "$API_URL/ready" | jq .
echo ""

# Test 3: User Registration
echo -e "${BLUE}3. Register User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }')

echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo -e "${GREEN}Token: $TOKEN${NC}\n"

# Test 4: User Login
echo -e "${BLUE}4. User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }')

echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo -e "${GREEN}Token: $TOKEN${NC}\n"

# Test 5: Get All Users (Protected)
echo -e "${BLUE}5. Get All Users (Protected)${NC}"
curl -s -X GET "$API_URL/api/users" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 6: Get User by ID (Protected)
echo -e "${BLUE}6. Get User by ID (Protected)${NC}"
curl -s -X GET "$API_URL/api/users/1" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 7: Update User Profile (Protected)
echo -e "${BLUE}7. Update User Profile (Protected)${NC}"
curl -s -X PUT "$API_URL/api/users/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }' | jq .
echo ""

# Test 8: Rate Limit Test
echo -e "${BLUE}8. Rate Limit Test (making 6 rapid requests to /api/auth/login)${NC}"
for i in {1..6}; do
  echo "Request $i:"
  curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}' | jq -r '.error // .message'
done
echo ""

echo -e "${GREEN}=== All tests completed ===${NC}"
