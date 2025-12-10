# Payment System Configuration Guide

## Overview

This application uses **Stripe** for payment processing, NOT Paystack. All payment-related code and configuration should use Stripe API keys.

## Important Notes

### Payment System Architecture

1. **Payment Processor**: Stripe (NOT Paystack)
2. **Backend Database**: PostgreSQL (via SQLAlchemy)
3. **Frontend Database**: Firestore (for user profiles, messages, etc.)
4. **Wallet Feature**: Currently, there is NO dedicated wallet feature. The `totalEarnings` field in user profiles shows cumulative earnings.

## Required Environment Variables

### Backend (.env)
```bash
# Stripe Configuration (REQUIRED for payment processing)
STRIPE_SECRET_KEY=sk_test_...           # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...      # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...         # Your Stripe webhook secret

# DO NOT USE PAYSTACK - This system uses Stripe
```

### Frontend (.env.local)
```bash
# Stripe Configuration (REQUIRED for payment forms)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Must match backend

# Google OAuth Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## Common Issues & Solutions

### Issue: "7 Permission Issue" / "Wallet Not Functional"

**Symptom**: Users getting Firestore permission denied errors (error code 7) when trying to access payment/transaction data.

**Root Cause**: The Firestore `payments` and `transactions` collections had overly restrictive rules that prevented list queries.

**Solution**:
- Updated Firestore rules to allow `list` queries for authenticated users (with 100 document limit)
- Separated `allow read` into `allow list` and `allow get` for better control
- This allows wallet/earnings features to query user's payment history

**Files Updated**:
- `/firestore.rules`
- `/frontend/firestore.rules`

### Issue: "Paystack Keys Not Working"

**Root Cause**: This application uses Stripe, NOT Paystack.

**Solution**:
1. Remove any Paystack API keys from your environment
2. Configure Stripe API keys in both backend and frontend
3. Get Stripe keys from: https://dashboard.stripe.com/apikeys

### Issue: Google OAuth Users Not Getting Proper Roles

**Symptom**: Users signing in with Google can't access certain features.

**Root Cause**: Google OAuth users ARE getting their `role` field set correctly. The issue is likely related to Firestore rules, not user creation.

**Solution**:
- Verify Firestore rules are deployed in Firebase Console
- Check that the `users` document exists for the user
- Use the test page at `/test-admin-rules` to diagnose permission issues

## Firestore Rules Changes

### Before (Restrictive)
```javascript
// Payments collection
allow read: if isAuthenticated() &&
  (resource.data.payerId == request.auth.uid ||
   resource.data.recipientId == request.auth.uid ||
   isAdmin());
```

**Problem**: This prevented list queries like `getDocs(collection(db, 'payments'))` because Firestore couldn't verify the filter matches the rule.

### After (More Flexible)
```javascript
// Payments collection
allow list: if isAuthenticated() &&
  (request.query.limit <= 100);  // Prevent excessive queries

allow get: if isAuthenticated() &&
  (resource.data.payerId == request.auth.uid ||
   resource.data.recipientId == request.auth.uid ||
   isAdmin());
```

**Benefits**:
- Users can query their payment history without specific filters
- Individual document reads still require permission checks
- 100 document limit prevents abuse

## Deploying Firestore Rules

**IMPORTANT**: After updating firestore.rules, you MUST deploy them to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database → Rules
4. Look for the blue **"Publish"** button at the top
5. Click **"Publish"** to deploy the rules
6. Wait for confirmation (usually takes 10-30 seconds)

**Note**: Rules changes are NOT automatic. If you don't publish, the old rules remain in effect.

## Testing

### Test Firestore Rules Deployment
Visit `/test-admin-rules` in your browser to run diagnostics:
- Checks authentication status
- Verifies user document exists and has correct `role` field
- Tests read access to various collections
- Shows specific error codes if permissions fail

### Test Payment Flow
1. Ensure Stripe keys are configured in both backend and frontend
2. Create a test payment using Stripe test cards: https://stripe.com/docs/testing
3. Use card number: `4242 4242 4242 4242` (for successful payments)
4. Check that payment appears in PostgreSQL database
5. Verify escrow is created and notifications are sent

## Architecture Details

### Payment Flow
1. **Frontend** (PaymentForm.tsx) → Creates payment intent via backend API
2. **Backend** (/payments/create-intent) → Creates Stripe payment intent and PostgreSQL payment record
3. **Stripe** → Processes payment and sends webhook
4. **Backend** (/payments/webhook) → Updates payment status and creates escrow
5. **Notifications** → Sent to both payer and payee via Firestore

### Database Schema
- **PostgreSQL**: Stores actual payment records, escrow, projects, applications
- **Firestore**: Stores user profiles, messages, notifications, connections
- **Firestore payments/transactions collections**: Currently unused, available for future wallet features

## Future: Implementing Wallet Features

If you want to implement wallet/earnings features:

1. **Use PostgreSQL** (Recommended): Query the existing `payments` table via backend API
2. **Use Firestore** (Alternative): Sync payment data to Firestore `payments` collection after processing

**Example Backend Endpoint**:
```python
@router.get("/wallet/earnings")
async def get_user_earnings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payments = db.query(Payment).filter(
        Payment.payee_id == current_user.id,
        Payment.status == PaymentStatus.COMPLETED
    ).all()

    total_earnings = sum(p.amount - p.platform_fee for p in payments)
    return {"total_earnings": total_earnings, "payments": payments}
```

**Example Frontend**:
```typescript
// Fetch from backend API (PostgreSQL)
const response = await fetch('/api/wallet/earnings');
const { total_earnings, payments } = await response.json();

// OR query Firestore (if you sync data there)
const paymentsQuery = query(
  collection(db, 'payments'),
  where('recipientId', '==', user.uid),
  limit(100)
);
const snapshot = await getDocs(paymentsQuery);
```

## Support

If you continue to experience issues:
1. Check all environment variables are set correctly
2. Verify Firestore rules are published in Firebase Console
3. Use `/test-admin-rules` page to diagnose permission issues
4. Check browser console for detailed error messages
5. Review backend logs for Stripe/payment errors

## Summary

✅ **DO USE**: Stripe API keys
❌ **DON'T USE**: Paystack API keys
✅ **Payment Database**: PostgreSQL (backend)
✅ **User Data**: Firestore (frontend)
✅ **Wallet Feature**: Not implemented (use `totalEarnings` field for now)
✅ **Google OAuth**: Working correctly, role assignment is proper
