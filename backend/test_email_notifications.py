#!/usr/bin/env python3
"""
Test script for email notifications
Run this to verify MailerSend configuration and email sending
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.email_service import email_service
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_email_configuration():
    """Test email service configuration"""
    print("=" * 60)
    print("EMAIL CONFIGURATION TEST")
    print("=" * 60)

    print(f"\n1. MailerSend API Key: {'✓ Set' if email_service.api_key and email_service.api_key != '' else '✗ Not Set'}")
    if email_service.api_key:
        print(f"   Key Preview: {email_service.api_key[:20]}...")

    print(f"\n2. From Email: {email_service.from_email}")
    print(f"3. From Name: {email_service.from_name}")
    print(f"4. Frontend URL: {email_service.frontend_url}")

    return email_service.api_key and email_service.api_key != ''

def test_send_project_created_email():
    """Test sending a project creation email"""
    print("\n" + "=" * 60)
    print("TESTING PROJECT CREATION EMAIL")
    print("=" * 60)

    # Test email data
    test_data = {
        "candidate_email": "test@example.com",  # Change this to your email for testing
        "candidate_name": "Test Candidate",
        "agent_name": "Test Agent",
        "project_title": "Test Project - Email Verification",
        "project_description": "This is a test project to verify email notifications are working correctly.",
        "project_id": "test-123",
        "platform": "Upwork"
    }

    print(f"\nTest Data:")
    for key, value in test_data.items():
        print(f"  {key}: {value}")

    print("\nSending email...")

    try:
        success = email_service.send_project_created_notification(**test_data)

        if success:
            print("\n✓ SUCCESS: Email sent successfully!")
            print(f"  Check inbox: {test_data['candidate_email']}")
            return True
        else:
            print("\n✗ FAILED: Email sending failed")
            print("  Check the logs above for details")
            return False

    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_send_project_update_email():
    """Test sending a project update email"""
    print("\n" + "=" * 60)
    print("TESTING PROJECT UPDATE EMAIL")
    print("=" * 60)

    test_data = {
        "candidate_email": "test@example.com",  # Change this to your email for testing
        "candidate_name": "Test Candidate",
        "agent_name": "Test Agent",
        "project_title": "Test Project - Update Notification",
        "project_id": "test-123",
        "update_summary": "Completed initial setup and started development"
    }

    print(f"\nTest Data:")
    for key, value in test_data.items():
        print(f"  {key}: {value}")

    print("\nSending email...")

    try:
        success = email_service.send_project_updated_notification(**test_data)

        if success:
            print("\n✓ SUCCESS: Email sent successfully!")
            print(f"  Check inbox: {test_data['candidate_email']}")
            return True
        else:
            print("\n✗ FAILED: Email sending failed")
            print("  Check the logs above for details")
            return False

    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("EMAIL NOTIFICATION TEST SUITE")
    print("=" * 60)

    # Test configuration
    config_ok = test_email_configuration()

    if not config_ok:
        print("\n✗ CONFIGURATION ERROR: MailerSend API key not configured")
        print("\nPlease set MAILERSEND_API_KEY in:")
        print("  - backend/.env file, or")
        print("  - backend/app/core/config.py")
        sys.exit(1)

    # Test sending emails
    print("\n" + "=" * 60)
    print("IMPORTANT: Update test email addresses in this script")
    print("Change 'test@example.com' to your actual email address")
    print("=" * 60)

    response = input("\nContinue with email tests? (y/n): ")
    if response.lower() != 'y':
        print("Tests cancelled")
        sys.exit(0)

    # Run tests
    test1 = test_send_project_created_email()
    test2 = test_send_project_update_email()

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Configuration: {'✓' if config_ok else '✗'}")
    print(f"Project Created Email: {'✓' if test1 else '✗'}")
    print(f"Project Update Email: {'✓' if test2 else '✗'}")

    if test1 and test2:
        print("\n✓ ALL TESTS PASSED!")
        print("If you received the test emails, the system is working correctly.")
    else:
        print("\n✗ SOME TESTS FAILED")
        print("Check the error messages above and verify your MailerSend configuration.")

    print("=" * 60)
