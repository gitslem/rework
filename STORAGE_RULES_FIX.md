# Firebase Storage Rules Fix

## Problem

Candidates were unable to sign up because of a Firebase Storage permission error:

```
Firebase Storage: User does not have permission to access 'id-cards/meee_meeee_j4gGmMcCmVbNgRnJ2CXAFvdRP5x2.jpg'. (storage/unauthorized)
```

## Root Cause

The storage security rules expected the path format:
```
/id-cards/{userId}/{fileName}
```

However, the code was uploading files to:
```
/id-cards/{fileName}
```

This mismatch caused the security rules to deny access, preventing candidates from completing their profiles during signup.

## Solution

### Code Changes

Updated `frontend/src/pages/complete-profile.tsx` to include the `userId` in the upload path:

**Before:**
```javascript
const idCardRef = ref(storage, `id-cards/${idCardFileName}`);
```

**After:**
```javascript
const idCardRef = ref(storage, `id-cards/${user.uid}/${idCardFileName}`);
```

### Storage Rules

The storage rules in `frontend/storage.rules` define the correct path structure:

```javascript
// ID Cards - Users can upload their own ID cards
match /id-cards/{userId}/{fileName} {
  // Allow authenticated users to upload their own ID card
  allow create: if isAuthenticated() &&
                   isOwner(userId) &&
                   isValidSize() &&
                   isValidFileType();

  // Allow users to read their own ID cards
  allow read: if isAuthenticated() && isOwner(userId);

  // Allow users to update their own ID cards
  allow update: if isAuthenticated() &&
                   isOwner(userId) &&
                   isValidSize() &&
                   isValidFileType();

  // Allow users to delete their own ID cards
  allow delete: if isAuthenticated() && isOwner(userId);
}
```

## Deployment

To deploy the storage rules to Firebase:

```bash
./deploy-storage-rules.sh
```

Or manually:

```bash
cd frontend
firebase deploy --only storage:rules --project remote-worksio
```

## Testing

After deployment:

1. Go to the signup page
2. Complete the registration form
3. Upload an ID card
4. Submit the profile
5. Verify that the upload succeeds without permission errors

## Benefits

- ✅ Candidates can now successfully upload ID cards during signup
- ✅ Proper security: Users can only access their own ID cards
- ✅ Better organization: Files are grouped by userId
- ✅ Consistent with other storage paths (profile-pictures, portfolio, etc.)

## Related Files

- `frontend/src/pages/complete-profile.tsx` - Profile completion form
- `frontend/storage.rules` - Firebase Storage security rules
- `frontend/firebase.json` - Firebase configuration
- `deploy-storage-rules.sh` - Deployment script
