# Troubleshooting: Agent Updates Page Permission Issues

## Problem: "Permission denied" error when saving updates as Admin

If you're getting permission denied errors when trying to save updates, follow these steps:

---

## Step 1: Check Your User Document in Firestore

### Using Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database**
4. Find the `users` collection
5. Look for your user document (use your email or UID to find it)
6. Check that the document has:
   ```json
   {
     "uid": "your-user-id",
     "email": "your-email@example.com",
     "role": "admin",   ← MUST be exactly "admin" (lowercase)
     "displayName": "Your Name",
     "isActive": true,
     "isVerified": true,
     ...
   }
   ```

### Common Issues:

❌ **Wrong:** `"role": "Admin"` (capital A)
❌ **Wrong:** `"role": "ADMIN"` (all caps)
❌ **Wrong:** `"role": " admin"` (extra space)
❌ **Wrong:** Role field doesn't exist
✅ **Correct:** `"role": "admin"` (exactly lowercase)

---

## Step 2: Use the Debug Panel

When you open the agent-updates page as an admin, you'll see a blue **Debug Info** panel showing:

- UID
- Email
- Role
- Is Admin (should be YES)
- Can Edit (should be YES)
- Has Access (should be YES)

If any of these show NO or unexpected values, your user document needs to be fixed.

---

## Step 3: Check Browser Console

When you try to save and get an error:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for the debug output:
   ```
   === SAVE DEBUG INFO ===
   User object: {...}
   User role: admin
   Is Admin: true
   Can Edit: true
   User UID: abc123
   User Email: admin@example.com
   User doc exists: true
   User doc data: {...}
   ```

4. If you see errors, note the error code:
   - `permission-denied` - Role issue in Firestore
   - `unauthenticated` - Not signed in
   - `not-found` - User document doesn't exist

---

## Step 4: Fix User Role in Firestore

### Method 1: Firebase Console
1. Go to Firestore Database → users collection
2. Find your user document
3. Edit the document
4. Set `role` field to exactly `"admin"` (lowercase, no extra spaces)
5. Save changes
6. Refresh the agent-updates page

### Method 2: Firestore Rules Testing (in Firebase Console)
1. Go to Firestore → Rules tab
2. Click "Rules Playground"
3. Test if your user can create documents:
   ```
   Location: /agent_weekly_updates/test123
   Operation: create
   Authenticated: YES
   Provider: Google
   UID: <your-uid>
   ```
4. If it fails, check the error message

---

## Step 5: Verify Firestore Rules

Check that your `firestore.rules` file has the correct rules for agent_weekly_updates:

```javascript
match /agent_weekly_updates/{updateId} {
  // Allow read if user is admin or an approved agent
  allow read: if isAuthenticated() && (isAdmin() || isAgent());

  // Allow create if user is admin or an approved agent
  allow create: if isAuthenticated() && (isAdmin() || isAgent());

  // Allow update if user is admin or the creator
  allow update: if isAuthenticated() &&
    (isAdmin() || resource.data.createdBy == request.auth.uid);

  // Allow delete only for admin
  allow delete: if isAdmin();
}
```

And the helper functions:

```javascript
function isAdmin() {
  return isAuthenticated() &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

function isAgent() {
  return isAuthenticated() &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'agent';
}
```

---

## Step 6: Test After Fixing

After fixing your user role:

1. **Sign out** completely from the app
2. **Clear browser cache** (or use incognito mode)
3. **Sign in** again
4. Navigate to `/admin/agent-updates`
5. Check the Debug Info panel - all should be YES/green
6. Try to add a new update
7. Check browser console for debug output

---

## Still Having Issues?

### Create a New Admin User (if needed)

If your existing user can't be fixed, create a new admin user:

1. Sign up with a new email
2. After signup, go to Firestore
3. Find the new user document in `users` collection
4. Manually set `role: "admin"`
5. Sign out and sign back in
6. Try accessing the agent-updates page

### Check Firebase Authentication

Make sure you're signed in:
```javascript
// In browser console on the page:
firebase.auth().currentUser
```

Should return your user object with email and UID.

---

## Quick Checklist

- [ ] User document exists in Firestore `users` collection
- [ ] User document has `role` field set to exactly `"admin"`
- [ ] No typos, extra spaces, or wrong casing in role value
- [ ] User is signed in (check Firebase Auth current user)
- [ ] Firestore rules are deployed and correct
- [ ] Browser cache cleared / using incognito mode
- [ ] Debug panel shows all green/YES values
- [ ] Browser console shows no authentication errors

---

## Contact Support

If none of these steps work, provide the following information:

1. Screenshot of Debug Info panel
2. Screenshot of your user document in Firestore
3. Full error message from browser console
4. Your user email (for lookup)
5. Whether this is a new or existing user account

The debug logging added will help identify the exact issue!
