# Admin Setup Guide for RemoteWorks

This guide explains how to set up admin access and use the admin dashboard.

## Setting Up Admin Users

### Method 1: Manual Firestore Update (Recommended for First Admin)

1. **Access Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your RemoteWorks project

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Find the `users` collection

3. **Create or Update Admin User**
   - First, the user must sign up normally through the website
   - Find their user document (search by email)
   - Edit the document and change the `role` field from `candidate` or `agent` to `admin`
   - Save the changes

4. **Verify Admin Access**
   - The user should now be able to access `/admin`
   - They will see the admin dashboard instead of access denied

### Method 2: Using Firebase Admin SDK (For Advanced Users)

If you have backend access, you can programmatically set admin roles:

```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

async function setAdmin(userEmail) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', userEmail).get();

  if (snapshot.empty) {
    console.log('User not found');
    return;
  }

  snapshot.forEach(async (doc) => {
    await doc.ref.update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`User ${userEmail} is now an admin`);
  });
}

// Usage
setAdmin('admin@remoteworks.io');
```

## Admin Dashboard Access

### How to Access Admin Dashboard

1. **Login First**
   - Sign in with your admin account at `/login`
   - Make sure your account role is set to 'admin' in Firestore

2. **Navigate to Admin**
   - Visit `/admin` directly
   - Or click "Admin Panel" if you see it in the navigation

3. **Dashboard Features**
   - Agent Applications Management (`/admin/agents`)
   - Candidate Management (`/admin/candidates`)
   - Analytics Dashboard (`/admin/analytics`)

### Admin Pages

#### 1. Main Dashboard (`/admin`)
- Overview of all admin features
- Quick access to agent and candidate management
- System statistics

#### 2. Agent Applications (`/admin/agents`)
- View all agent applications
- Filter by status: Pending, Approved, Rejected
- Search by name or email
- Detailed agent profile view
- Approve/Reject actions with reason tracking

Features:
- ✅ One-click approval
- ❌ Rejection with reason (stored for records)
- 🔍 Search and filter capabilities
- 📊 View complete agent profiles
- 📧 Automatic status updates to Firestore

#### 3. Candidate Management (`/admin/candidates`)
- Coming soon: Similar interface for managing candidates

#### 4. Analytics (`/admin/analytics`)
- Coming soon: Platform statistics and insights

## User Roles Explained

RemoteWorks has three user roles:

### 1. **Candidate** (`role: 'candidate'`)
- Users looking to hire agents
- Can browse and hire agents
- Need admin approval before accessing services
- Default role for most sign-ups

### 2. **Agent** (`role: 'agent'`)
- Service providers helping candidates
- Go through verification process
- Can accept clients after admin approval
- Need detailed profile completion

### 3. **Admin** (`role: 'admin'`)
- Platform administrators
- Can approve/reject agents and candidates
- Access to admin dashboard
- Manage platform settings

## Admin Workflow

### Approving Agents

1. Go to `/admin/agents`
2. Click on "Pending" tab to see new applications
3. Click on any application to view details
4. Review:
   - Personal information
   - Professional background
   - Technical setup
   - Platform expertise
   - Specializations
5. Click "Approve" or "Reject"
6. If rejecting, provide a reason
7. Agent receives automatic status update

### Approving Candidates

1. Go to `/admin/candidates` (when implemented)
2. Review candidate profiles
3. Approve or reject applications
4. Track approval history

## Security Best Practices

1. **Limit Admin Accounts**
   - Only create admin accounts for trusted team members
   - Regularly audit admin user list

2. **Use Strong Authentication**
   - Require 2FA for admin accounts
   - Use strong passwords
   - Consider using Firebase custom claims for additional security

3. **Monitor Admin Actions**
   - Log all approval/rejection actions
   - Review admin activity regularly
   - Set up alerts for suspicious activity

4. **Protect Admin Routes**
   - All admin pages check for admin role
   - Unauthorized users see "Access Denied"
   - Admin status checked on every page load

## Firebase Security Rules

Ensure your Firestore security rules protect admin operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }

    // Profiles collection
    match /profiles/{profileId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == profileId || isAdmin();
    }
  }
}
```

## Troubleshooting

### "Access Denied" Error
- Check that user role is exactly 'admin' (case-sensitive)
- Verify user is signed in
- Clear browser cache and sign in again
- Check Firestore rules allow admin access

### Can't See Admin Panel
- Ensure you're logged in
- Check your role in Firestore database
- Try accessing `/admin` directly

### Approval Not Working
- Check Firestore connection
- Verify admin permissions in security rules
- Check browser console for errors

## Next Steps

After setting up your first admin:

1. ✅ Set admin role in Firestore
2. ✅ Login and access `/admin`
3. ✅ Test agent approval workflow
4. ✅ Set up additional admins if needed
5. ✅ Configure email notifications (optional)
6. ✅ Set up analytics tracking

## Support

If you need help:
- Check the console for error messages
- Review Firebase logs
- Contact support at support@remoteworks.io
