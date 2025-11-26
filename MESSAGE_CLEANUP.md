# Message Cleanup and Save Feature

## Overview
The messaging system supports saving important messages while automatically cleaning up old, unsaved messages to reduce storage costs and maintain privacy.

## Message Save Feature

### How It Works
- All messages have a `saved` field (boolean, default: false)
- Users can save important messages by clicking a "Save" button
- Saved messages are kept permanently
- Unsaved messages can be automatically deleted after a period of time

### Message Document Structure
```json
{
  "senderId": "firebase_uid",
  "senderName": "John Doe",
  "senderEmail": "john@example.com",
  "recipientId": "firebase_uid",
  "recipientName": "Jane Smith",
  "message": "Message content",
  "subject": "Subject line",
  "status": "unread" | "read",
  "saved": false,
  "savedBy": [],  // Array of user IDs who saved this message
  "conversationId": "conv_uid1_uid2",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Saving Messages (Frontend)
```typescript
// Save a message
const saveMessage = async (messageId: string, userId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  const messageDoc = await getDoc(messageRef);
  const savedBy = messageDoc.data()?.savedBy || [];

  await updateDoc(messageRef, {
    saved: true,
    savedBy: [...savedBy, userId],
    updatedAt: Timestamp.now()
  });
};

// Unsave a message
const unsaveMessage = async (messageId: string, userId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  const messageDoc = await getDoc(messageRef);
  const savedBy = messageDoc.data()?.savedBy || [];

  const newSavedBy = savedBy.filter(id => id !== userId);

  await updateDoc(messageRef, {
    saved: newSavedBy.length > 0,
    savedBy: newSavedBy,
    updatedAt: Timestamp.now()
  });
};
```

## Auto-Deletion of Unsaved Messages

### Why Delete Old Messages?
1. **Privacy**: Old unsaved messages may contain sensitive information
2. **Cost**: Reduce Firestore storage costs
3. **Performance**: Faster queries with less data
4. **Compliance**: Meet data retention policies

### Deletion Rules
- Unsaved messages older than **30 days** are automatically deleted
- Saved messages are **never** deleted automatically
- Messages in active conversations (last message < 7 days) are kept

### Implementation Options

#### Option 1: Firebase Cloud Function (Recommended)
Create a scheduled Cloud Function that runs daily:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cleanupOldMessages = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    // Find unsaved messages older than 30 days
    const oldMessagesQuery = db.collection('messages')
      .where('saved', '==', false)
      .where('createdAt', '<', thirtyDaysAgo);

    const snapshot = await oldMessagesQuery.get();

    if (snapshot.empty) {
      console.log('No old messages to delete');
      return null;
    }

    // Delete in batches
    const batch = db.batch();
    let deleteCount = 0;

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    await batch.commit();
    console.log(`Deleted ${deleteCount} old unsaved messages`);
    return null;
  });
```

**Deploy**:
```bash
firebase deploy --only functions:cleanupOldMessages
```

#### Option 2: Cloud Scheduler (No Functions)
If you don't want to use Cloud Functions, use Cloud Scheduler with a webhook:

1. Create an API endpoint in your backend
2. Set up Cloud Scheduler to call it daily
3. Endpoint queries and deletes old messages

#### Option 3: Client-Side Cleanup
Less reliable but possible:

```typescript
// Run on app startup
const cleanupOldMessages = async () => {
  const thirtyDaysAgo = Timestamp.fromDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  const oldMessagesQuery = query(
    collection(db, 'messages'),
    where('saved', '==', false),
    where('createdAt', '<', thirtyDaysAgo),
    limit(500) // Don't delete too many at once
  );

  const snapshot = await getDocs(oldMessagesQuery);

  const deletePromises = snapshot.docs.map(doc =>
    deleteDoc(doc.ref)
  );

  await Promise.all(deletePromises);
};
```

**Drawbacks**:
- Only runs when users open the app
- May cause performance issues
- Not reliable

### Recommended Approach
Use **Option 1 (Cloud Function)** for:
- Automatic, scheduled execution
- Server-side reliability
- No client performance impact
- Consistent deletion across all users

## Message Retention Policy

| Message Type | Retention Period | Auto-Delete |
|--------------|------------------|-------------|
| Saved messages | Forever | Never |
| Unsaved messages in active conversations (< 7 days) | 30 days | After 30 days |
| Unsaved messages in inactive conversations (> 7 days) | 30 days | After 30 days |
| Service requests | Forever (treated as saved) | Never |

## User Interface

### Save Button in Messages
```typescript
// In message list
<button
  onClick={() => message.saved ? unsaveMessage(message.id) : saveMessage(message.id)}
  className={message.saved ? 'text-yellow-500' : 'text-gray-400'}
>
  {message.saved ? '★' : '☆'} {message.saved ? 'Saved' : 'Save'}
</button>
```

### Filter Saved Messages
```typescript
// Query only saved messages
const savedMessagesQuery = query(
  collection(db, 'messages'),
  where('savedBy', 'array-contains', userId),
  orderBy('createdAt', 'desc')
);
```

## Privacy Notice for Users

Example text to show users:
```
⚠️ Message Privacy
- Unsaved messages are automatically deleted after 30 days
- Important messages should be marked as "Saved"
- Saved messages are kept permanently
- You can unsave messages at any time
```

## Security Rules Update

The existing rules already support saving messages:

```javascript
// Messages collection
match /messages/{messageId} {
  // Users can update messages they send or receive (for saving)
  allow update: if isAuthenticated() &&
    (resource.data.senderId == request.auth.uid ||
     resource.data.recipientId == request.auth.uid);
}
```

## Testing the Cleanup

### Manual Test
```typescript
// Create a test message 31 days old
await addDoc(collection(db, 'messages'), {
  senderId: 'test_user_1',
  recipientId: 'test_user_2',
  message: 'Test message',
  saved: false,
  createdAt: Timestamp.fromDate(new Date(Date.now() - 31 * 24 * 60 * 60 * 1000))
});

// Run cleanup function
// Check that message is deleted
```

## Migration Steps

If you have existing messages without the `saved` field:

```typescript
// One-time migration script
const migrateMessages = async () => {
  const messagesSnapshot = await getDocs(collection(db, 'messages'));

  const batch = writeBatch(db);
  let count = 0;

  messagesSnapshot.docs.forEach((doc) => {
    if (!doc.data().hasOwnProperty('saved')) {
      batch.update(doc.ref, {
        saved: false,
        savedBy: [],
        updatedAt: Timestamp.now()
      });
      count++;
    }
  });

  await batch.commit();
  console.log(`Migrated ${count} messages`);
};
```

## Best Practices

1. **Default to Unsaved**: All new messages start as unsaved
2. **Make Saving Easy**: Prominent save button in UI
3. **Warn Users**: Show notice about auto-deletion
4. **Preserve Important Messages**: Automatically save service requests and acceptance messages
5. **Allow Bulk Save**: Let users save entire conversations
6. **Show Save Status**: Clear visual indication of saved messages

## Future Enhancements

1. **Save Entire Conversations**: One click to save all messages in a thread
2. **Export Saved Messages**: Download saved messages as PDF/CSV
3. **Archive Instead of Delete**: Move old messages to archive instead of deleting
4. **Custom Retention Periods**: Let users choose 30/60/90 days
5. **Starred Messages**: Different from saved, for quick access
