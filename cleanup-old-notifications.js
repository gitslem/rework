/**
 * Cleanup Script: Delete all notifications created before today
 *
 * This script will delete all notifications from the Firestore 'notifications' collection
 * that were created before today (2025-12-11) to start fresh.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteOldNotifications() {
  try {
    console.log('🗑️  Starting cleanup of old notifications...');
    console.log('📅 Deleting all notifications before: 2025-12-11 00:00:00');

    // Get start of today (2025-12-11)
    const todayStart = new Date('2025-12-11T00:00:00Z');
    console.log('🕐 Cutoff timestamp:', todayStart.toISOString());

    // Query all notifications created before today
    const notificationsRef = db.collection('notifications');
    const oldNotificationsQuery = notificationsRef.where('createdAt', '<', admin.firestore.Timestamp.fromDate(todayStart));

    const snapshot = await oldNotificationsQuery.get();

    if (snapshot.empty) {
      console.log('✅ No old notifications found to delete.');
      return;
    }

    console.log(`📊 Found ${snapshot.size} old notifications to delete.`);

    // Delete in batches of 500 (Firestore limit)
    const batchSize = 500;
    let deletedCount = 0;
    let batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log(`  - Deleting notification ${doc.id} (type: ${data.type}, created: ${data.createdAt?.toDate().toISOString()})`);

      batch.delete(doc.ref);
      batchCount++;

      // Commit batch when it reaches 500 operations
      if (batchCount === batchSize) {
        await batch.commit();
        deletedCount += batchCount;
        console.log(`  ✓ Deleted batch of ${batchCount} notifications (Total: ${deletedCount})`);
        batch = db.batch();
        batchCount = 0;
      }
    }

    // Commit remaining items in the batch
    if (batchCount > 0) {
      await batch.commit();
      deletedCount += batchCount;
      console.log(`  ✓ Deleted final batch of ${batchCount} notifications (Total: ${deletedCount})`);
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} old notifications.`);
    console.log('🎉 Starting fresh from today: 2025-12-11');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
deleteOldNotifications()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
