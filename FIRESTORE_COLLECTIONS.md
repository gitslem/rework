# Firestore Collections Structure

This document describes the Firestore collections needed for the Remote Works application.

## Collections Overview

### 1. `connections` Collection
Stores friend/connection relationships between agents and candidates.

**Created When**: Agent accepts a candidate's service request

**Document Structure**:
```json
{
  "agentId": "firebase_uid",
  "agentName": "John Agent",
  "agentEmail": "agent@example.com",
  "candidateId": "firebase_uid",
  "candidateName": "Jane Candidate",
  "candidateEmail": "candidate@example.com",
  "conversationId": "conv_candidateId_agentId_timestamp",
  "status": "connected",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Indexes Required**:
- `agentId` (ASC) + `status` (ASC)
- `candidateId` (ASC) + `status` (ASC)

**Purpose**:
- Tracks which agents and candidates are connected
- Used to show dropdown of connected candidates when creating projects
- Links messaging threads to connections

---

### 2. `candidate_projects` Collection
Stores projects managed by agents for candidates.

**Document Structure**:
```json
{
  "candidate_id": "firebase_uid",
  "candidate_name": "Jane Candidate",
  "candidate_email": "candidate@example.com",
  "agent_id": "firebase_uid",
  "title": "Upwork Account Setup",
  "description": "Help setting up and optimizing Upwork profile",
  "platform": "Upwork",
  "status": "active" | "pending" | "completed" | "cancelled",
  "budget": 500,
  "tags": ["upwork", "profile", "setup"],
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

**Indexes Required**:
- `agent_id` (ASC) + `status` (ASC) + `created_at` (DESC)
- `candidate_id` (ASC) + `status` (ASC) + `created_at` (DESC)

**Purpose**: Track projects between agents and candidates

---

### 3. `project_updates` Collection
Stores weekly updates from agents on project progress.

**Document Structure**:
```json
{
  "project_id": "project_document_id",
  "agent_id": "firebase_uid",
  "update_title": "Week 1 Progress",
  "update_content": "Completed profile setup and added portfolio items",
  "hours_completed": 8.5,
  "screen_sharing_hours": 2.0,
  "progress_percentage": 40,
  "blockers": [],
  "next_steps": [],
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

**Indexes Required**:
- `project_id` (ASC) + `created_at` (DESC)

**Purpose**: Track progress updates agents post about projects

---

### 4. `project_actions` Collection
Stores action items that need attention from candidates or agents.

**Document Structure**:
```json
{
  "project_id": "project_document_id",
  "creator_id": "firebase_uid",
  "title": "Complete ID Verification",
  "description": "Upload government ID for platform verification",
  "action_type": "task" | "signup" | "verification" | "exam" | "meeting",
  "assigned_to_candidate": true,
  "assigned_to_agent": false,
  "priority": "low" | "medium" | "high" | "urgent",
  "status": "pending" | "in_progress" | "completed" | "cancelled",
  "platform": "Upwork",
  "platform_url": "https://upwork.com/verify",
  "completed_at": "Timestamp",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

**Indexes Required**:
- `project_id` (ASC) + `created_at` (DESC)
- `project_id` (ASC) + `status` (ASC)

**Purpose**: Track action items and tasks for projects

---

### 5. `notifications` Collection
Stores notifications for users about projects, messages, and actions.

**Document Structure**:
```json
{
  "userId": "firebase_uid",
  "type": "project_created" | "project_update" | "action_needed" | "message",
  "title": "New Project Assigned",
  "message": "You have been assigned to a new project: Upwork Account Setup",
  "projectId": "project_document_id",
  "priority": "low" | "medium" | "high" | "urgent",
  "read": false,
  "createdAt": "Timestamp"
}
```

**Indexes Required**:
- `userId` (ASC) + `read` (ASC) + `createdAt` (DESC)
- `userId` (ASC) + `createdAt` (DESC)

**Purpose**: Notify users about important events

**Notification Types**:
- `project_created`: New project assigned to candidate
- `project_update`: Agent posted progress update
- `action_needed`: New action item assigned
- `message`: New message received

---

### 6. `messages` Collection
Stores messages between agents and candidates.

**Document Structure**:
```json
{
  "senderId": "firebase_uid",
  "senderName": "John Agent",
  "senderEmail": "agent@example.com",
  "recipientId": "firebase_uid",
  "recipientName": "Jane Candidate",
  "message": "Let's discuss your Upwork account setup",
  "subject": "Service Request Accepted",
  "status": "unread" | "read" | "accepted" | "rejected",
  "type": "service_request" | "general" | "payment_confirmation",
  "conversationId": "conv_candidateId_agentId_timestamp",
  "isReply": false,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Indexes Required**:
- `recipientId` (ASC) + `status` (ASC) + `createdAt` (DESC)
- `conversationId` (ASC) + `createdAt` (ASC)
- `senderId` (ASC) + `createdAt` (DESC)

**Purpose**:
- Handle messaging between agents and candidates
- Group messages by conversationId for threaded conversations

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Connections collection
    match /connections/{connectionId} {
      allow read: if isAuthenticated() &&
        (resource.data.agentId == request.auth.uid ||
         resource.data.candidateId == request.auth.uid);
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.agentId;
      allow update: if isAuthenticated() &&
        (resource.data.agentId == request.auth.uid ||
         resource.data.candidateId == request.auth.uid);
    }

    // Projects collection
    match /candidate_projects/{projectId} {
      allow read: if isAuthenticated() &&
        (resource.data.agent_id == request.auth.uid ||
         resource.data.candidate_id == request.auth.uid);
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.agent_id;
      allow update: if isAuthenticated() &&
        (resource.data.agent_id == request.auth.uid ||
         resource.data.candidate_id == request.auth.uid);
      allow delete: if isAuthenticated() && resource.data.agent_id == request.auth.uid;
    }

    // Project updates collection
    match /project_updates/{updateId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.agent_id == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.agent_id == request.auth.uid;
    }

    // Project actions collection
    match /project_actions/{actionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && resource.data.creator_id == request.auth.uid;
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated() &&
        (resource.data.senderId == request.auth.uid ||
         resource.data.recipientId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() &&
        (resource.data.senderId == request.auth.uid ||
         resource.data.recipientId == request.auth.uid);
    }
  }
}
```

---

## Setup Instructions

### 1. Create Collections in Firebase Console
Go to Firebase Console > Firestore Database and create these collections. They will be created automatically when first documents are added, but you can create them manually for clarity.

### 2. Add Composite Indexes
Go to Firebase Console > Firestore Database > Indexes and add the composite indexes listed above for each collection.

Example for `candidate_projects`:
- Collection: `candidate_projects`
- Fields: `agent_id` (Ascending), `status` (Ascending), `created_at` (Descending)

### 3. Set Security Rules
Go to Firebase Console > Firestore Database > Rules and paste the security rules above.

### 4. Test the Flow

**For Agents**:
1. Accept a candidate's service request → Creates connection
2. Go to Projects page → See "Add New Project" button
3. Click it → See dropdown of connected candidates
4. Create project → Candidate gets notification

**For Candidates**:
1. Send service request to agent
2. Wait for agent acceptance → Becomes connected
3. Receive notification when project is assigned
4. Go to Projects page → See assigned projects
5. View updates and actions from agent

---

## Benefits of This Structure

1. **Connection-Based**: Only connected agents and candidates can work together
2. **Secure**: Security rules ensure users only see their own data
3. **Scalable**: Indexed queries for fast performance
4. **Real-Time**: Uses Firestore's real-time listeners for instant updates
5. **Notification System**: Users get notified about important events
6. **Audit Trail**: All actions are timestamped and tracked
7. **Flexible Messaging**: ConversationId groups messages into threads

---

## Future Enhancements

1. **Read Receipts**: Track when messages are read
2. **Typing Indicators**: Show when someone is typing
3. **File Attachments**: Add support for sharing files in projects
4. **Video Calls**: Integrate video calling for screen sharing
5. **Payment Tracking**: Add payment records to projects
6. **Rating System**: Let candidates rate agents after project completion
