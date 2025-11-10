#!/bin/bash
# Direct API test script for registration

API_URL="${1:-http://localhost:8000/api/v1}"

echo "======================================================"
echo "TESTING REGISTRATION API"
echo "======================================================"
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo "TEST 1: Health Check"
echo "------------------------------------------------------"
curl -s -w "\nHTTP Status: %{http_code}\n" "$API_URL/../health" | head -20
echo ""

# Test 2: Registration with JSON
echo ""
echo "TEST 2: Registration (freelancer)"
echo "------------------------------------------------------"
TEST_EMAIL="test_$(date +%s)@example.com"
echo "Email: $TEST_EMAIL"
echo "Request:"
cat <<EOF
{
  "email": "$TEST_EMAIL",
  "password": "testpass123",
  "role": "freelancer"
}
EOF

echo ""
echo "Response:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\",\"role\":\"freelancer\"}" \
  "$API_URL/auth/register"

echo ""
echo ""

# Test 3: Registration with different role
echo "TEST 3: Registration (agent)"
echo "------------------------------------------------------"
TEST_EMAIL2="test_$(date +%s)_agent@example.com"
echo "Email: $TEST_EMAIL2"
echo "Response:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL2\",\"password\":\"testpass123\",\"role\":\"agent\"}" \
  "$API_URL/auth/register"

echo ""
echo ""

# Test 4: Registration with business role
echo "TEST 4: Registration (business)"
echo "------------------------------------------------------"
TEST_EMAIL3="test_$(date +%s)_biz@example.com"
echo "Email: $TEST_EMAIL3"
echo "Response:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL3\",\"password\":\"testpass123\",\"role\":\"business\"}" \
  "$API_URL/auth/register"

echo ""
echo ""
echo "======================================================"
echo "TESTS COMPLETE"
echo "======================================================"
