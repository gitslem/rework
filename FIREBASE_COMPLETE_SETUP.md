# Complete Firebase Setup Guide for Remote-Works

## Overview

This guide covers the complete Firebase implementation for Remote-Works, including all requested features:

- ✅ Firebase Configuration (Auth, Firestore, Storage, Analytics)
- ✅ Email/Password Authentication
- ✅ Google OAuth Authentication
- ✅ Admin Panel for approving candidates/agents
- ✅ Real-time Messaging System
- ✅ PayPal Payment Integration
- ✅ Detailed Agent Profiles with Portfolios
- ✅ Review and Rating System
- ✅ Advanced Search and Filtering
- ✅ Email Notifications
- ✅ Analytics Dashboards

## 1. Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `remote-works`
4. Enable Google Analytics (recommended)
5. Create project

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** sign-in
   - Add your authorized domains
   - Configure OAuth consent screen

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Start in **production mode** (we'll set rules later)
3. Choose a location closest to your users

### Step 4: Enable Storage

1. Go to **Storage** → **Get started**
2. Start in **production mode**
3. Use default bucket

### Step 5: Get Firebase Config

1. Go to **Project Settings** → **General**
2. Scroll down to "Your apps"
3. Click **Web** icon (`</>`)
4. Register app name: `remote-works-web`
5. Copy the firebaseConfig object

### Step 6: Update Environment Variables

Create `frontend/.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remote-works.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=remote-works
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=remote-works.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# Site URL
NEXT_PUBLIC_SITE_URL=https://remote-works.web.app
```

## 2. Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return request.auth.uid == uid;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Profiles collection
    match /profiles/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Service Requests
    match /serviceRequests/{requestId} {
      allow read: if isAuthenticated() && (
        resource.data.candidateId == request.auth.uid ||
        resource.data.agentId == request.auth.uid ||
        isAdmin()
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.candidateId == request.auth.uid ||
        resource.data.agentId == request.auth.uid ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }

    // Messages
    match /messages/{messageId} {
      allow read: if isAuthenticated() && (
        resource.data.senderId == request.auth.uid ||
        resource.data.recipientId == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.recipientId == request.auth.uid;
      allow delete: if isOwner(resource.data.senderId) || isAdmin();
    }

    // Reviews
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.reviewerId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
  }
}
```

## 3. Storage Security Rules

Go to **Storage** → **Rules** and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /portfolios/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /documents/{userId}/{fileName} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Firestore Indexes

Some queries require composite indexes. Create them in Firestore:

1. Go to **Firestore Database** → **Indexes**
2. Add these composite indexes:

**serviceRequests**:
- Collection: `serviceRequests`
- Fields:
  - `candidateId` (Ascending)
  - `createdAt` (Descending)

- Collection: `serviceRequests`
- Fields:
  - `agentId` (Ascending)
  - `createdAt` (Descending)

**messages**:
- Collection: `messages`
- Fields:
  - `conversationId` (Ascending)
  - `createdAt` (Ascending)

**notifications**:
- Collection: `notifications`
- Fields:
  - `userId` (Ascending)
  - `createdAt` (Descending)

## 5. Install Firebase Dependencies

```bash
cd frontend
npm install firebase
```

## 6. PayPal Setup

### Get PayPal Client ID

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create an app or use existing
3. Copy **Client ID**
4. Add to `.env.local` as `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

### Install PayPal SDK

```bash
npm install @paypal/react-paypal-js
```

## 7. Email Notifications with Firebase Functions

### Setup Firebase Functions

```bash
npm install -g firebase-tools
firebase init functions
```

Select:
- JavaScript or TypeScript
- Install dependencies

### Create Email Function

Create `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

export const sendWelcomeEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();

    const mailOptions = {
      from: functions.config().email.user,
      to: userData.email,
      subject: 'Welcome to Remote-Works!',
      html: `
        <h1>Welcome ${userData.displayName}!</h1>
        <p>Thank you for joining Remote-Works.</p>
        <p>Your account as a ${userData.role} has been created.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', userData.email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  });

export const sendApprovalEmail = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before.isCandidateApproved && after.isCandidateApproved) {
      const mailOptions = {
        from: functions.config().email.user,
        to: after.email,
        subject: 'Your Remote-Works Account is Approved!',
        html: `
          <h1>Congratulations!</h1>
          <p>Your candidate account has been approved.</p>
          <p>You can now browse and hire agents.</p>
          <a href="${functions.config().site.url}/agents">Browse Agents</a>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Error sending approval email:', error);
      }
    }
  });
```

### Configure Email

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password" site.url="https://remote-works.web.app"
```

### Deploy Functions

```bash
firebase deploy --only functions
```

## 8. File Structure

The implementation includes:

```
frontend/
├── firebase.config.ts                    # Firebase initialization
├── src/
│   ├── types/
│   │   └── index.ts                      # TypeScript interfaces
│   ├── lib/
│   │   └── firebase/
│   │       ├── auth.ts                   # Authentication functions
│   │       └── firestore.ts              # Firestore CRUD operations
│   ├── pages/
│   │   ├── register-new.tsx              # Email/Google registration
│   │   ├── login-new.tsx                 # Email/Google login
│   │   ├── admin/
│   │   │   ├── index.tsx                 # Admin dashboard
│   │   │   ├── candidates.tsx            # Approve candidates
│   │   │   ├── agents.tsx                # Approve agents
│   │   │   └── analytics.tsx             # Platform analytics
│   │   ├── messages/
│   │   │   ├── index.tsx                 # Conversations list
│   │   │   └── [conversationId].tsx      # Chat interface
│   │   ├── agent-profile/
│   │   │   └── [uid].tsx                 # Detailed agent profile
│   │   └── ...existing pages
│   └── components/
│       ├── PayPalCheckout.tsx            # PayPal integration
│       ├── ReviewForm.tsx                # Leave reviews
│       ├── ReviewsList.tsx               # Display reviews
│       ├── MessageThread.tsx             # Real-time chat
│       ├── NotificationBell.tsx          # Notifications dropdown
│       └── SearchFilters.tsx             # Advanced filtering
```

## 9. Key Features Implementation

### Authentication
- Email/password registration and login
- Google OAuth integration
- Email verification
- Password reset
- Role-based access (candidate, agent, admin)

### Admin Panel
- Approve/reject candidates
- Verify agents
- View platform analytics
- Monitor service requests
- Handle disputes

### Messaging
- Real-time chat with Firestore listeners
- Conversation threading
- Unread message indicators
- Message notifications

### PayPal Integration
- Secure payment processing
- Escrow system (held until service complete)
- Agent payouts
- Transaction history
- Refund processing

### Agent Profiles
- Portfolio showcase with images
- Service pricing by platform
- Success rate and statistics
- Client reviews and ratings
- Availability status

### Reviews & Ratings
- 5-star rating system
- Written reviews
- Auto-calculation of average ratings
- Review verification (only after service complete)

### Search & Filtering
- Filter by platform specialty
- Filter by rating
- Filter by price range
- Sort by success rate, rating, clients
- Keyword search

### Notifications
- Real-time notification system
- Email notifications via Firebase Functions
- In-app notification bell
- Notification types: approval, message, payment, review

### Analytics
- Total users/candidates/agents
- Revenue tracking
- Success rate metrics
- Top performing agents
- Recent activity feed

## 10. Deployment

### Build the Frontend

```bash
cd frontend
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### Deploy Everything

```bash
firebase deploy
```

Your site will be live at: `https://remote-works.web.app`

## 11. Testing Checklist

- [ ] User registration (email and Google)
- [ ] User login and logout
- [ ] Email verification
- [ ] Password reset
- [ ] Candidate approval flow
- [ ] Agent verification flow
- [ ] Browse agents with filters
- [ ] Send messages between users
- [ ] Create service requests
- [ ] PayPal payment processing
- [ ] Leave reviews
- [ ] View analytics (admin)
- [ ] Receive notifications
- [ ] Upload portfolio images
- [ ] Mobile responsiveness

## 12. Maintenance

### Monitor Usage
- Check Firebase Console → Usage tab
- Monitor Firestore reads/writes
- Check authentication users
- Review storage usage

### Backup Data
```bash
gcloud firestore export gs://remote-works.appspot.com/backups
```

### Update Security Rules
Review and update rules as features evolve

### Monitor Costs
Firebase has free tier, but monitor:
- Firestore operations
- Storage bandwidth
- Cloud Functions invocations

## Support

For issues:
- Check Firebase Console logs
- Review browser console for errors
- Check Firestore security rules
- Verify environment variables

---

© 2025 Remote-Works. All rights reserved.
