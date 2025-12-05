# Firestore Rules Deployment Instructions

## Problem
The Firestore security rules have been updated locally in `firestore.rules` to grant admin access to projects, but these rules **must be deployed to Firebase** before they take effect.

## Why Projects Don't Show for Admin

The old Firestore rules (currently active on Firebase) block admin access:
```javascript
// OLD RULE (blocking admin)
allow read: if isAuthenticated() &&
  (resource.data.agent_id == request.auth.uid ||
   resource.data.candidate_id == request.auth.uid);
```

The new rules (in local file, not yet deployed) grant admin access:
```javascript
// NEW RULE (allows admin) - NOT YET ACTIVE
allow read: if isAuthenticated() &&
  (isAdmin() ||
   resource.data.agent_id == request.auth.uid ||
   resource.data.candidate_id == request.auth.uid);
```

## Solution: Deploy Updated Rules

### Method 1: Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Deploy the rules**:
```bash
cd /home/user/rework
firebase deploy --only firestore:rules --project remote-worksio
```

4. **Verify deployment**:
```bash
firebase firestore:rules --project remote-worksio
```

### Method 2: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **remote-worksio**
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the entire contents of `/home/user/rework/firestore.rules`
5. Paste into the editor (replacing all existing rules)
6. Click **Publish** button
7. Confirm the deployment

## What Changed

The following collections now grant admin full access:

1. **candidate_projects** - Admin can read, update, delete all projects
2. **project_updates** - Admin can update and delete all updates
3. **project_actions** - Admin can delete all actions

## Testing After Deployment

1. **Clear browser cache** and reload the admin pages
2. Open browser console (F12)
3. Visit `/admin/cleanup-projects` - you should see console logs:
   - "🔍 Admin counting projects..."
   - "✅ Projects count: X"
4. Visit `/admin/projects` - you should see:
   - "🔍 Admin fetching all projects..."
   - "✅ Found X projects"

If you see "❌ Error: permission-denied", the rules haven't been deployed yet.

## Verification Commands

Check if rules are deployed correctly:
```bash
# View current rules on Firebase
firebase firestore:rules --project remote-worksio

# Check for the isAdmin() function in candidate_projects rule
firebase firestore:rules --project remote-worksio | grep -A 5 "candidate_projects"
```

## Rollback (If Needed)

If something goes wrong, you can rollback to a previous version:
```bash
firebase firestore:rules:release list --project remote-worksio
firebase firestore:rules:release rollback <RELEASE_ID> --project remote-worksio
```

## Additional Notes

- Rules are applied instantly after deployment (no waiting)
- Browser cache may need to be cleared
- The deployment does NOT affect existing data, only access permissions
- All existing functionality for agents and candidates remains unchanged
