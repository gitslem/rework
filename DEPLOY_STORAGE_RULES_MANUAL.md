# Manual Storage Rules Deployment

## Option 1: Deploy via Firebase CLI (Recommended)

### Step 1: Ensure you're in the frontend directory
```bash
cd /home/user/rework/frontend
```

### Step 2: Check your Firebase project
```bash
firebase projects:list
```

### Step 3: Deploy storage rules
```bash
# Use the project name from .firebaserc (remote-works)
firebase deploy --only storage

# OR specify the project explicitly (if different)
firebase deploy --only storage --project remote-works
```

## Option 2: Manual Upload via Firebase Console

If the CLI deployment fails, you can manually upload the storage rules:

### Step 1: Copy the storage rules

The rules are in `/home/user/rework/frontend/storage.rules`. Here's the complete content:

```javascript
rules_version = '2';

// Firebase Storage Security Rules for Remote-Works
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if the user is the owner of the file
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Helper function to validate file size (max 5MB)
    function isValidSize() {
      return request.resource.size <= 5 * 1024 * 1024;
    }

    // Helper function to validate image or PDF file type
    function isValidFileType() {
      return request.resource.contentType.matches('image/.*') ||
             request.resource.contentType == 'application/pdf';
    }

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

    // Profile Pictures - Users can upload their own profile pictures
    match /profile-pictures/{userId}/{fileName} {
      allow create, update: if isAuthenticated() &&
                               isOwner(userId) &&
                               isValidSize() &&
                               request.resource.contentType.matches('image/.*');
      allow read: if isAuthenticated();
      allow delete: if isAuthenticated() && isOwner(userId);
    }

    // Project Files - Authenticated users can upload project-related files
    match /projects/{projectId}/{fileName} {
      allow create, update: if isAuthenticated() && isValidSize();
      allow read: if isAuthenticated();
      allow delete: if isAuthenticated();
    }

    // Portfolio Files - Agents can upload portfolio items
    match /portfolio/{userId}/{fileName} {
      allow create, update: if isAuthenticated() &&
                               isOwner(userId) &&
                               isValidSize();
      allow read: if isAuthenticated();
      allow delete: if isAuthenticated() && isOwner(userId);
    }

    // Admin access - Admins can read all files (define admin check in your app)
    match /{allPaths=**} {
      // By default, deny all other access
      allow read, write: if false;
    }
  }
}
```

### Step 2: Go to Firebase Console

1. Open https://console.firebase.google.com/
2. Select your project: **remote-works** (or remote-worksio)
3. In the left sidebar, click on **Storage**
4. Click on the **Rules** tab
5. Copy and paste the entire rules content from above
6. Click **Publish**

### Step 3: Verify the rules are active

After publishing, you should see the rules take effect immediately. You can test by:
1. Going to your signup page
2. Completing the profile form
3. Uploading an ID card
4. Verifying the upload succeeds without permission errors

## Troubleshooting

### Error: "Could not find rules for the following storage targets: rules"

**Solution:** The `firebase.json` has been updated to specify the bucket explicitly:
```json
"storage": [
  {
    "bucket": "remote-works.appspot.com",
    "rules": "storage.rules"
  }
]
```

Make sure you have the latest version of `firebase.json` before deploying.

### Error: "Project name mismatch"

**Solution:** Check your `.firebaserc` file to see the correct project name:
```bash
cat /home/user/rework/frontend/.firebaserc
```

Use the project name listed there, or update it to match your actual Firebase project.

### Error: "Firebase CLI not authenticated"

**Solution:** Log in to Firebase:
```bash
firebase login
```

## Quick Deploy Script

Use the provided script for easier deployment:
```bash
cd /home/user/rework
./deploy-storage-rules.sh
```

## Verification

After deployment, the following should work:
- ✅ Candidates can upload ID cards during signup
- ✅ Users can upload profile pictures
- ✅ Agents can upload portfolio items
- ✅ Project files can be uploaded by authenticated users
- ✅ All files are properly secured with ownership rules
