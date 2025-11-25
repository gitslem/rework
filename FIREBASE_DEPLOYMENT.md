# Firebase Deployment Guide for Remote-Works

This guide explains how to deploy the redesigned Remote-Works platform to Firebase.

## Overview

Remote-Works is now configured as an agent-candidate marketplace where:
- **Agents** help candidates get approved for AI training platforms (Outlier, Alignerr, OneForma, Appen, etc.)
- **Candidates** hire agents and get expert assistance with their applications
- **Admin approval** is required for candidates before they can hire agents

## Prerequisites

1. Node.js 18+ installed
2. Firebase CLI installed: `npm install -g firebase-tools`
3. A Firebase project created at https://console.firebase.google.com
4. Supabase account for database (or migrate to Firebase Realtime Database/Firestore)

## Setup Steps

### 1. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
   ```

4. Build the frontend:
   ```bash
   npm run build
   ```

### 2. Firebase Setup

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in the frontend directory:
   ```bash
   firebase init
   ```

3. Select these options:
   - **Hosting**: Configure files for Firebase Hosting
   - **Build directory**: `.next` (for Next.js)
   - **Single-page app**: Yes
   - **Automatic builds**: Optional (recommended)

4. Update `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "out",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. Configure Next.js for static export (add to `next.config.js`):
   ```javascript
   module.exports = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   }
   ```

6. Build for static export:
   ```bash
   npm run build
   ```

### 3. Database Migration

1. Run the new migration in your Supabase SQL editor:
   ```sql
   -- Copy contents from database/migrations/007_agent_marketplace_updates.sql
   ```

2. This migration adds:
   - Candidate approval system
   - Agent services and verification
   - Messaging system
   - Service requests tracking

### 4. Backend Deployment

The backend can be deployed to:

**Option A: Render.com (Recommended)**
1. Push code to GitHub
2. Connect Render to your repository
3. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Deploy automatically

**Option B: Firebase Functions**
1. Migrate Python backend to Node.js/TypeScript
2. Deploy as Firebase Cloud Functions
3. Update frontend API_URL to point to functions

### 5. Deploy to Firebase

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

3. Your site will be live at: `https://your-project.web.app`

## Key Changes in Redesign

### Pages Created/Updated

1. **Homepage** (`/`) - Agent-candidate marketplace focus
2. **About** (`/about`) - Mission and team information
3. **FAQ** (`/faq`) - Comprehensive Q&A
4. **Support** (`/support`) - Contact form and support info
5. **Terms** (`/terms`) - Terms of Service
6. **Privacy** (`/privacy`) - Privacy Policy
7. **Register** (`/register`) - Agent/Candidate registration
8. **Agent Dashboard** (`/agent-dashboard`) - Agent workspace
9. **Candidate Dashboard** (`/candidate-dashboard`) - Candidate workspace
10. **Agents Browse** (`/agents`) - Browse and hire agents

### Database Schema Updates

New tables and fields added in `007_agent_marketplace_updates.sql`:
- `messages` table for agent-candidate communication
- `service_requests` table for tracking application help requests
- Agent verification and services fields in `profiles` table
- Candidate approval fields in `users` table

### User Roles

- **candidate** - Users seeking help getting approved
- **agent** - Verified experts who help candidates
- **admin** - Platform administrators

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test agent registration flow
- [ ] Test candidate registration flow
- [ ] Verify Google OAuth works
- [ ] Test database connections
- [ ] Check responsive design on mobile
- [ ] Verify all links work
- [ ] Test contact form
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic with Firebase)
- [ ] Configure email notifications
- [ ] Set up analytics (Firebase Analytics or Google Analytics)

## Ongoing Development

### To Add Later:
1. **Complete Admin Panel** - Approve candidates and agents
2. **Messaging System** - Real-time chat between agents and candidates
3. **Payment Integration** - Stripe/PayPal for agent payments
4. **Agent Profiles** - Detailed profiles with portfolios
5. **Review System** - Ratings and reviews for agents
6. **Notification System** - Email/SMS notifications
7. **Search & Filtering** - Advanced agent search
8. **Analytics Dashboard** - Stats for agents and candidates

## Support

For issues or questions:
- Email: support@remote-works.io
- GitHub Issues: https://github.com/gitslem/rework/issues
- Documentation: See project README files

## License

© 2025 Remote-Works. All rights reserved.
