# Email Notifications Troubleshooting Guide

## Overview
This guide will help you diagnose and fix email notification issues when agents create or update projects for candidates.

---

## Quick Diagnosis Checklist

Run through this checklist to quickly identify the issue:

- [ ] **Backend server is running** on port 8000
- [ ] **Frontend can reach backend** (check browser network tab)
- [ ] **MailerSend API key is configured** in backend
- [ ] **Domain is verified** in MailerSend dashboard
- [ ] **Candidate email exists** in Firebase
- [ ] **No CORS errors** in browser console
- [ ] **No authentication errors** (we removed auth, so this should be OK)

---

## Step 1: Verify Backend is Running

### Start the backend server:
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Test if backend is accessible:
```bash
curl http://localhost:8000/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## Step 2: Test MailerSend Configuration

### Run the email test script:
```bash
cd backend
python test_email_notifications.py
```

### What to look for:
1. **API Key Check**: Should show "✓ Set"
2. **From Email**: Should be "noreply@remote-works.io"
3. **Test Email**: Change `test@example.com` to your actual email

### If API key is not set:
Check `backend/app/core/config.py` line 28:
```python
MAILERSEND_API_KEY: str = "your-api-key-here"
```

Or set it in `backend/.env`:
```env
MAILERSEND_API_KEY=mlsn.your-key-here
```

---

## Step 3: Verify Domain in MailerSend

1. Log into MailerSend dashboard: https://app.mailersend.com/
2. Go to **Domains** section
3. Verify `remote-works.io` shows **Verified** status
4. Check DNS records are properly configured

---

## Step 4: Test Email Flow End-to-End

### Method 1: Using the Frontend

1. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open browser console** (F12 → Console tab)

3. **Create a test project as an agent**

4. **Watch for these logs:**
   ```
   📧 Preparing to send email notification...
   Agent name: [agent name]
   Candidate email: [candidate email]
   📤 Sending email with data: {...}
   📬 Email API response: {...}
   ✅ Email sent successfully!
   ```

### Method 2: Test API Directly

```bash
curl -X POST http://localhost:8000/api/v1/candidate-projects/send-creation-email \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_email": "your-email@example.com",
    "candidate_name": "Test Candidate",
    "agent_name": "Test Agent",
    "project_title": "Test Project",
    "project_description": "Testing email notifications",
    "project_id": "test-123",
    "platform": "Upwork"
  }'
```

**Expected response:**
```json
{
  "message": "Email sent successfully",
  "success": true
}
```

---

## Step 5: Check Backend Logs

The backend now has comprehensive logging. Look for these indicators:

### Successful flow:
```
📧 Email creation request received for: candidate@example.com
   Project: Test Project
   Agent: Test Agent
Calling email service...
✅ Email sent successfully to candidate@example.com (Status: 202)
```

### Failed flow - Common errors:

#### MailerSend API Error:
```
❌ Failed to send email to candidate@example.com. Status: 401
Response: {"message": "Unauthenticated"}
```
**Solution:** Check API key is correct

#### Domain not verified:
```
❌ Failed to send email. Status: 403
Response: {"message": "Domain not verified"}
```
**Solution:** Verify domain in MailerSend dashboard

#### Invalid email:
```
❌ Failed to send email. Status: 422
Response: {"message": "Invalid email address"}
```
**Solution:** Check candidate email in Firebase

---

## Step 6: Check Frontend Console Logs

Open browser DevTools → Console tab and look for:

### Successful flow:
```
📧 Preparing to send email notification...
Agent name: John Doe
Candidate email: candidate@example.com
📤 Sending email with data: {candidate_email: "...", ...}
📬 Email API response: {message: "Email sent successfully", success: true}
✅ Email sent successfully!
```

### Failed flows:

#### Backend not reachable:
```
❌ Failed to send email notification: AxiosError: Network Error
Error details: {message: "Network Error", response: undefined, status: undefined}
```
**Solution:** Start backend server

#### CORS error:
```
Access to XMLHttpRequest at 'http://localhost:8000/...' from origin 'http://localhost:3000' has been blocked by CORS
```
**Solution:** Check CORS configuration in `backend/main.py` (should already be fixed)

#### No candidate email:
```
⚠️ No candidate email found, skipping email notification
```
**Solution:** Ensure candidate has email in Firebase `users` collection

---

## Common Issues and Solutions

### Issue 1: "Email sent successfully" but no email received

**Possible causes:**
1. Email in spam folder
2. MailerSend is in test mode
3. Email quota exceeded

**Solution:**
1. Check spam/junk folder
2. Check MailerSend dashboard for sent emails
3. Verify sending quota not exceeded

### Issue 2: Network Error / Cannot reach backend

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not, start it
cd backend
python -m uvicorn main:app --reload
```

### Issue 3: No candidate email in logs

**Solution:**
```javascript
// Check Firebase console → Firestore → users collection
// Verify the candidate document has an 'email' field
```

### Issue 4: MailerSend returns 401 Unauthorized

**Solution:**
1. Check API key in `backend/app/core/config.py`
2. Generate new API key from MailerSend dashboard if needed
3. Restart backend after updating

---

## Verification Steps

Run these steps to confirm everything is working:

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy",...}
```

### 2. Email Test Script
```bash
cd backend
python test_email_notifications.py
# Should send test emails successfully
```

### 3. Direct API Test
```bash
curl -X POST http://localhost:8000/api/v1/candidate-projects/send-creation-email \
  -H "Content-Type: application/json" \
  -d '{"candidate_email":"YOUR_EMAIL","candidate_name":"Test","agent_name":"Agent","project_title":"Test","project_description":"Test","project_id":"test-1"}'
# Should return: {"message":"Email sent successfully","success":true}
```

### 4. Check Email Inbox
- Wait 1-2 minutes
- Check inbox AND spam folder
- Look for email from noreply@remote-works.io

---

## Debug Mode

For maximum visibility, enable debug logging:

### Backend:
Already enabled! Check terminal output when running the server.

### Frontend:
Already enabled! Open browser console (F12) and watch for emoji-prefixed logs.

### MailerSend:
Check the Activity tab in MailerSend dashboard to see all email attempts.

---

## Still Not Working?

If you've gone through all steps and it's still not working, collect this information:

1. **Backend logs** from terminal
2. **Frontend console logs** from browser
3. **Network tab** showing the API request/response
4. **MailerSend dashboard** Activity tab showing email status

Then check:
- Is the MailerSend API key valid?
- Is the domain verified?
- Are there any rate limits or quota issues?
- Is the candidate email valid?

---

## Success Indicators

You'll know it's working when you see:

✅ Backend logs show: `✅ Email sent successfully to [email] (Status: 202)`
✅ Frontend console shows: `✅ Email sent successfully!`
✅ MailerSend dashboard shows email as "Delivered"
✅ Candidate receives email in their inbox

---

## Quick Fix Checklist

Try these in order:

1. ✅ Restart backend server
2. ✅ Clear browser cache and reload
3. ✅ Run email test script
4. ✅ Test API directly with curl
5. ✅ Check MailerSend dashboard
6. ✅ Verify candidate email exists in Firebase
7. ✅ Check spam folder

---

## Contact Information

If you need help:
- Check backend logs for detailed error messages
- Check frontend console for request/response details
- Verify MailerSend dashboard for email delivery status
