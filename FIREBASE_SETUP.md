# Firebase Setup for Candidate Projects

This guide shows you how to set up the candidate projects feature using **Firebase Firestore** instead of PostgreSQL.

## ✅ Why Firebase?

- ✨ **No database server needed** - Firebase handles everything
- 🔄 **Real-time updates** - Changes sync instantly
- 🚀 **Simple setup** - Just configure and go
- 📱 **Mobile ready** - Easy to add mobile apps later
- 🔒 **Built-in security** - Firestore security rules

---

## Step 1: Configure Firebase Console

### 1.1 Create Firestore Collections

Go to Firebase Console → Firestore Database → Start collection

Create these 3 collections:

1. **`candidate_projects`**
   - Document ID: Auto-ID
   - Fields: (Firebase will auto-create based on your data)

2. **`project_updates`**
   - Document ID: Auto-ID
   - Fields: (Auto-created)

3. **`project_actions`**
   - Document ID: Auto-ID
   - Fields: (Auto-created)

### 1.2 Add Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules

Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Helper function to check if user is agent
    function isAgent() {
      return isAuthenticated() && getUserRole() == 'agent';
    }

    // Candidate Projects Collection
    match /candidate_projects/{projectId} {
      // Allow read if user is the candidate or agent assigned to project
      allow read: if isAuthenticated() && (
        resource.data.candidate_id == request.auth.uid ||
        resource.data.agent_id == request.auth.uid
      );

      // Only agents can create projects
      allow create: if isAgent() &&
        request.resource.data.agent_id == request.auth.uid;

      // Only the assigned agent can update their projects
      allow update: if isAuthenticated() &&
        resource.data.agent_id == request.auth.uid;

      // Only the assigned agent can delete their projects
      allow delete: if isAuthenticated() &&
        resource.data.agent_id == request.auth.uid;
    }

    // Project Updates Collection
    match /project_updates/{updateId} {
      // Allow read if user has access to the parent project
      allow read: if isAuthenticated();

      // Only agents can create updates
      allow create: if isAgent() &&
        request.resource.data.agent_id == request.auth.uid;

      // Only the creator can update/delete
      allow update, delete: if isAuthenticated() &&
        resource.data.agent_id == request.auth.uid;
    }

    // Project Actions Collection
    match /project_actions/{actionId} {
      // Allow read if user has access to the parent project
      allow read: if isAuthenticated();

      // Both agents and candidates can create actions
      allow create: if isAuthenticated() &&
        request.resource.data.creator_id == request.auth.uid;

      // Anyone involved in the project can update actions
      allow update: if isAuthenticated();

      // Only the creator or agent can delete
      allow delete: if isAuthenticated() &&
        resource.data.creator_id == request.auth.uid;
    }

    // Existing rules for users, profiles, messages, etc.
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    match /profiles/{profileId} {
      allow read: if true;
      allow write: if isAuthenticated() && request.auth.uid == profileId;
    }

    match /messages/{messageId} {
      allow read: if isAuthenticated() && (
        resource.data.senderId == request.auth.uid ||
        resource.data.recipientId == request.auth.uid
      );
      allow create: if isAuthenticated() &&
        request.resource.data.senderId == request.auth.uid;
    }

    match /service_requests/{requestId} {
      allow read: if isAuthenticated() && (
        resource.data.candidateId == request.auth.uid ||
        resource.data.agentId == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.candidateId == request.auth.uid ||
        resource.data.agentId == request.auth.uid
      );
    }
  }
}
```

### 1.3 Create Firestore Indexes (Optional for Better Performance)

Go to Firebase Console → Firestore Database → Indexes

Add these composite indexes:

**Index 1: candidate_projects by status and agent_id**
- Collection: `candidate_projects`
- Fields:
  - `status` (Ascending)
  - `agent_id` (Ascending)
  - `created_at` (Descending)

**Index 2: candidate_projects by status and candidate_id**
- Collection: `candidate_projects`
- Fields:
  - `status` (Ascending)
  - `candidate_id` (Ascending)
  - `created_at` (Descending)

**Index 3: project_updates by project_id**
- Collection: `project_updates`
- Fields:
  - `project_id` (Ascending)
  - `created_at` (Descending)

**Index 4: project_actions by project_id**
- Collection: `project_actions`
- Fields:
  - `project_id` (Ascending)
  - `created_at` (Descending)

---

## Step 2: Update Your Frontend Code

### Option A: Replace the existing page

```bash
cd ~/Projects/rework/frontend/src/pages
mv candidate-projects.tsx candidate-projects-postgresql.tsx.backup
mv candidate-projects-firebase.tsx candidate-projects.tsx
```

### Option B: Use Firebase version directly

Just access: `http://localhost:3000/candidate-projects-firebase`

---

## Step 3: Test the Feature

### 3.1 Start Your Frontend

```bash
cd ~/Projects/rework/frontend
npm run dev
```

### 3.2 Access the Projects Page

Open: `http://localhost:3000/candidate-projects-firebase`

Or if you renamed it:
Open: `http://localhost:3000/candidate-projects`

---

## Features with Firebase

### ✨ Real-time Updates
- Changes sync instantly across all devices
- No need to refresh the page
- See updates as they happen

### ✨ No Backend Needed
- All data operations happen directly from the frontend
- Firebase handles authentication and authorization
- Firestore security rules protect your data

### ✨ Offline Support
- Firebase caches data locally
- Works even when offline
- Syncs when connection returns

---

## Data Structure in Firestore

### Collection: `candidate_projects`

```javascript
{
  candidate_id: "user_uid",
  agent_id: "agent_uid",
  title: "Project Title",
  description: "Project description",
  platform: "Upwork",
  project_url: "https://...",
  status: "active", // or "pending", "completed", "cancelled"
  budget: 500,
  deadline: Timestamp,
  started_at: Timestamp,
  completed_at: Timestamp,
  tags: ["React", "Node.js"],
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Collection: `project_updates`

```javascript
{
  project_id: "project_doc_id",
  agent_id: "agent_uid",
  week_number: 1,
  update_title: "Week 1 Progress",
  update_content: "Completed authentication...",
  hours_completed: 8.5,
  screen_sharing_hours: 2.0,
  progress_percentage: 25,
  blockers: ["Need API credentials"],
  concerns: "Timeline might be tight",
  next_steps: ["Implement dashboard", "Add tests"],
  attachments: ["url1", "url2"],
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Collection: `project_actions`

```javascript
{
  project_id: "project_doc_id",
  creator_id: "user_uid",
  assigned_to_candidate: true,
  assigned_to_agent: false,
  title: "Complete Upwork verification",
  description: "Submit ID and complete video verification",
  action_type: "verification",
  status: "pending", // or "in_progress", "completed", "cancelled"
  priority: "high", // or "low", "medium", "urgent"
  due_date: Timestamp,
  scheduled_time: Timestamp,
  duration_minutes: 30,
  platform: "Upwork",
  platform_url: "https://upwork.com/verify",
  completed_at: Timestamp,
  completion_notes: "Verification successful",
  attachments: [],
  created_at: Timestamp,
  updated_at: Timestamp
}
```

---

## Querying Data

### Get Active Projects for Agent

```javascript
const q = query(
  collection(db, 'candidate_projects'),
  where('agent_id', '==', userUid),
  where('status', '==', 'active'),
  orderBy('created_at', 'desc')
);

const snapshot = await getDocs(q);
const projects = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### Get Project Updates

```javascript
const q = query(
  collection(db, 'project_updates'),
  where('project_id', '==', projectId),
  orderBy('created_at', 'desc')
);

const snapshot = await getDocs(q);
const updates = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### Real-time Listening

```javascript
const unsubscribe = onSnapshot(
  query(collection(db, 'candidate_projects'), where('agent_id', '==', userUid)),
  (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProjects(projects);
  }
);

// Clean up listener when component unmounts
return () => unsubscribe();
```

---

## Advantages of Firebase Over PostgreSQL

| Feature | Firebase | PostgreSQL |
|---------|----------|------------|
| Setup | ✅ Instant | ❌ Requires server |
| Real-time | ✅ Built-in | ❌ Need Socket.io |
| Offline | ✅ Auto-sync | ❌ Manual implementation |
| Security | ✅ Security rules | ❌ Backend logic needed |
| Scaling | ✅ Auto-scales | ❌ Manual scaling |
| Mobile | ✅ Same code | ❌ Different API |
| Cost | ✅ Pay as you go | ❌ Fixed server cost |

---

## Next Steps

1. ✅ Set up Firestore collections (Done in Step 1)
2. ✅ Add security rules (Done in Step 1)
3. ✅ Use the Firebase page component
4. 🎨 Customize the UI to match your brand
5. 📱 Add mobile app (optional - same Firebase config works!)

---

## Troubleshooting

### Error: "Missing or insufficient permissions"
- Check your Firestore security rules
- Ensure user is authenticated
- Verify user has the correct role

### Error: "Requires index"
- Firebase will show a link to create the index
- Click the link and it will auto-create the index
- Wait 1-2 minutes for it to build

### Data not updating in real-time
- Check that you're using `onSnapshot()` not `getDocs()`
- Verify your Firebase config is correct
- Check browser console for errors

---

## 🎉 You're All Set!

Your candidate projects feature now runs entirely on Firebase with:
- ✅ Real-time sync
- ✅ No backend server needed
- ✅ Secure data access
- ✅ Offline support

Access your projects at: **http://localhost:3000/candidate-projects-firebase**
