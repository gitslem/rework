/**
 * Cleanup Script: Delete all notifications and projects created before today
 *
 * This script will delete all notifications and projects from Firestore
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

async function deleteOldData() {
  try {
    console.log('🗑️  Starting cleanup of old notifications and projects...');
    console.log('📅 Deleting all data before: 2025-12-11 00:00:00');

    // Get start of today (2025-12-11)
    const todayStart = new Date('2025-12-11T00:00:00Z');
    const todayTimestamp = admin.firestore.Timestamp.fromDate(todayStart);
    console.log('🕐 Cutoff timestamp:', todayStart.toISOString());

    // ============ DELETE OLD NOTIFICATIONS ============
    console.log('\n📬 Processing notifications...');
    const notificationsRef = db.collection('notifications');
    const oldNotificationsQuery = notificationsRef.where('createdAt', '<', todayTimestamp);

    const notifSnapshot = await oldNotificationsQuery.get();

    if (notifSnapshot.empty) {
      console.log('✅ No old notifications found.');
    } else {
      console.log(`📊 Found ${notifSnapshot.size} old notifications to delete.`);

      const batchSize = 500;
      let deletedCount = 0;
      let batch = db.batch();
      let batchCount = 0;

      for (const doc of notifSnapshot.docs) {
        const data = doc.data();
        console.log(`  - Deleting notification ${doc.id} (type: ${data.type})`);

        batch.delete(doc.ref);
        batchCount++;

        if (batchCount === batchSize) {
          await batch.commit();
          deletedCount += batchCount;
          console.log(`  ✓ Deleted batch of ${batchCount} notifications (Total: ${deletedCount})`);
          batch = db.batch();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        deletedCount += batchCount;
      }

      console.log(`✅ Deleted ${deletedCount} notifications.`);
    }

    // ============ DELETE OLD PROJECTS ============
    console.log('\n📁 Processing projects...');
    const projectsRef = db.collection('candidate_projects');
    const oldProjectsQuery = projectsRef.where('created_at', '<', todayTimestamp);

    const projectSnapshot = await oldProjectsQuery.get();

    if (projectSnapshot.empty) {
      console.log('✅ No old projects found.');
    } else {
      console.log(`📊 Found ${projectSnapshot.size} old projects to delete.`);

      let batch = db.batch();
      let batchCount = 0;
      const batchSize = 500;
      let deletedProjectCount = 0;

      for (const doc of projectSnapshot.docs) {
        const projectId = doc.id;
        const data = doc.data();
        console.log(`  - Deleting project ${projectId} (${data.title})`);

        // Delete the project
        batch.delete(doc.ref);
        batchCount++;

        // Delete related project updates
        const updatesSnapshot = await db.collection('project_updates')
          .where('projectId', '==', projectId)
          .get();

        console.log(`    → Deleting ${updatesSnapshot.size} project updates`);
        updatesSnapshot.forEach((updateDoc) => {
          batch.delete(updateDoc.ref);
          batchCount++;
        });

        // Delete related project actions
        const actionsSnapshot = await db.collection('project_actions')
          .where('projectId', '==', projectId)
          .get();

        console.log(`    → Deleting ${actionsSnapshot.size} project actions`);
        actionsSnapshot.forEach((actionDoc) => {
          batch.delete(actionDoc.ref);
          batchCount++;
        });

        deletedProjectCount++;

        if (batchCount >= batchSize) {
          await batch.commit();
          console.log(`  ✓ Deleted batch (Projects: ${deletedProjectCount})`);
          batch = db.batch();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`✅ Deleted ${deletedProjectCount} projects (with related updates and actions).`);
    }

    console.log('\n🎉 Cleanup complete! Starting fresh from today: 2025-12-11');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
deleteOldData()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
