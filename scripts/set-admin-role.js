/**
 * Script to set a user's role to admin in Firestore
 *
 * Usage:
 *   node set-admin-role.js <user-email>
 *
 * Example:
 *   node set-admin-role.js admin@example.com
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setAdminRole(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Get all users and find by email
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();

    if (usersSnapshot.empty) {
      console.error('❌ No user found with that email');
      process.exit(1);
    }

    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log(`📋 Found user: ${userId}`);
    console.log(`   Current role: ${userData.role || 'none'}`);

    // Update role to admin
    await db.collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Successfully set role to admin!');
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${email}`);

    // Verify the update
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    console.log(`   New role: ${updatedData.role}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin role:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node set-admin-role.js <user-email>');
  process.exit(1);
}

setAdminRole(email);
