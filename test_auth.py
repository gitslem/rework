#!/usr/bin/env python3
"""
Test script for authentication endpoints
Run this to verify registration and login work correctly
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    """Test health endpoint"""
    print("=" * 60)
    print("Testing Health Endpoint")
    print("=" * 60)
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_registration():
    """Test user registration"""
    print("\n" + "=" * 60)
    print("Testing Registration")
    print("=" * 60)

    test_email = f"test_{datetime.now().timestamp()}@example.com"
    test_data = {
        "email": test_email,
        "password": "testpass123",
        "role": "freelancer"
    }

    print(f"Registering user: {test_email}")
    print(f"Payload: {json.dumps(test_data, indent=2)}")

    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 201:
            print("✅ Registration successful!")
            return test_email, test_data["password"]
        else:
            print("❌ Registration failed!")
            return None, None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

def test_login(email, password):
    """Test user login"""
    print("\n" + "=" * 60)
    print("Testing Login")
    print("=" * 60)

    login_data = {
        "email": email,
        "password": password
    }

    print(f"Logging in: {email}")

    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            print("✅ Login successful!")
            return response.json().get("access_token")
        else:
            print("❌ Login failed!")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_get_user(access_token):
    """Test getting current user"""
    print("\n" + "=" * 60)
    print("Testing Get Current User")
    print("=" * 60)

    try:
        response = requests.get(
            f"{BASE_URL}/users/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            print("✅ Get user successful!")
            return True
        else:
            print("❌ Get user failed!")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_stats(access_token):
    """Test getting dashboard stats"""
    print("\n" + "=" * 60)
    print("Testing Get Dashboard Stats")
    print("=" * 60)

    try:
        response = requests.get(
            f"{BASE_URL}/users/me/stats",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            print("✅ Get stats successful!")
            return True
        else:
            print("❌ Get stats failed!")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n🧪 Starting Authentication Flow Tests")
    print("Make sure the backend is running on http://localhost:8000\n")

    # Test health
    if not test_health():
        print("\n❌ Backend is not running or health check failed!")
        print("Start the backend with: cd backend && python main.py")
        return

    # Test registration
    email, password = test_registration()
    if not email:
        return

    # Test login
    access_token = test_login(email, password)
    if not access_token:
        return

    # Test get current user
    test_get_user(access_token)

    # Test get stats
    test_get_stats(access_token)

    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)
    print(f"\nTest Account Created:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
    print(f"  Token: {access_token[:50]}...")

if __name__ == "__main__":
    main()
