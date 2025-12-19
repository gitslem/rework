# Firestore Security Rules Deployment

## Important: Deploy Updated Rules

The Firestore security rules have been updated to allow admin users to read, update, and delete messages in the conversations viewer.

### Changes Made

Updated `firestore.rules` and `frontend/firestore.rules` to allow admins to access the messages collection:

```javascript
// Messages collection - UPDATED
match /messages/{messageId} {
  // Allow read if user is sender, recipient, or admin
  allow read: if isAuthenticated() &&
    (resource.data.senderId == request.auth.uid ||
     resource.data.recipientId == request.auth.uid ||
     isAdmin());

  // Allow update if user is sender, recipient, or admin
  allow update: if isAuthenticated() &&
    (resource.data.senderId == request.auth.uid ||
     resource.data.recipientId == request.auth.uid ||
     isAdmin());

  // Allow delete if user is sender or admin
  allow delete: if isAuthenticated() &&
    (resource.data.senderId == request.auth.uid || isAdmin());
}
```

## Deployment Instructions

### Option 1: Deploy Only Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Option 2: Deploy All
```bash
firebase deploy
```

## Verification

After deployment, verify that:
1. Admin users can access the `/admin/conversations` page without permissions errors
2. The conversations page loads all messages between candidates and agents
3. Regular users (candidates/agents) can still only see their own messages

## Troubleshooting

If you still see "Missing or insufficient permissions" errors:
1. Check that you're logged in as an admin user
2. Verify the rules were deployed: Check Firebase Console → Firestore Database → Rules
3. Clear browser cache and reload the page
4. Check the browser console for detailed error messages

## Security Note

These rules maintain security by:
- Only allowing authenticated users to read messages
- Admins can read all messages for support/moderation purposes
- Regular users can only read messages where they are sender or recipient
- Message creation is limited to authenticated users
