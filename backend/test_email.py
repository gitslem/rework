"""
Test script to verify MailerSend email functionality
Run this to test email sending directly without Celery
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.email_service import email_service
from app.core.config import settings

def test_email():
    print("=" * 60)
    print("🔍 MAILERSEND EMAIL TEST")
    print("=" * 60)

    # Display configuration
    print(f"\n📧 Email Configuration:")
    print(f"   API Key: {settings.MAILERSEND_API_KEY[:20]}...")
    print(f"   From Email: {settings.FROM_EMAIL}")
    print(f"   From Name: {settings.FROM_NAME}")
    print(f"   Frontend URL: {settings.FRONTEND_URL}")

    # Get test email from user
    print(f"\n{'='*60}")
    test_email = input("Enter your email address to test: ").strip()

    if not test_email or '@' not in test_email:
        print("❌ Invalid email address")
        return

    print(f"\n🚀 Sending test email to: {test_email}")
    print(f"{'='*60}\n")

    # Test 1: Project Created Email
    print("📝 Test 1: Project Created Notification")
    result1 = email_service.send_project_created_notification(
        candidate_email=test_email,
        candidate_name="Test User",
        agent_name="Test Agent",
        project_title="Sample Project - Email Test",
        project_description="This is a test email to verify MailerSend integration is working correctly.",
        project_id=999,
        platform="Outlier AI"
    )

    if result1:
        print("✅ Project Created Email: SUCCESS")
    else:
        print("❌ Project Created Email: FAILED")

    print(f"\n{'='*60}\n")

    # Test 2: Project Updated Email
    print("📝 Test 2: Project Updated Notification")
    result2 = email_service.send_project_updated_notification(
        candidate_email=test_email,
        candidate_name="Test User",
        agent_name="Test Agent",
        project_title="Sample Project - Email Test",
        project_id=999,
        update_summary="Testing email notification system"
    )

    if result2:
        print("✅ Project Updated Email: SUCCESS")
    else:
        print("❌ Project Updated Email: FAILED")

    print(f"\n{'='*60}\n")

    # Test 3: Status Changed Email
    print("📝 Test 3: Status Changed Notification")
    result3 = email_service.send_project_status_changed_notification(
        candidate_email=test_email,
        candidate_name="Test User",
        agent_name="Test Agent",
        project_title="Sample Project - Email Test",
        project_id=999,
        old_status="PENDING",
        new_status="ACTIVE"
    )

    if result3:
        print("✅ Status Changed Email: SUCCESS")
    else:
        print("❌ Status Changed Email: FAILED")

    print(f"\n{'='*60}")
    print("📊 Test Results Summary:")
    print(f"{'='*60}")

    total = 3
    passed = sum([result1, result2, result3])

    print(f"   Total Tests: {total}")
    print(f"   Passed: {passed}")
    print(f"   Failed: {total - passed}")

    if passed == total:
        print(f"\n✅ ALL TESTS PASSED! Emails are working correctly.")
        print(f"   Check {test_email} for the test emails.")
    else:
        print(f"\n❌ SOME TESTS FAILED. Check the logs above for details.")

    print(f"{'='*60}\n")

if __name__ == "__main__":
    try:
        test_email()
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
