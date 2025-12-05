/**
 * TEST PAGE: Firestore Rules Diagnostics
 *
 * This page helps diagnose why admin can't access projects
 * Visit: http://localhost:3000/test-admin-rules
 */

import { useState, useEffect } from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function TestAdminRules() {
  const [logs, setLogs] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      addLog('🔍 Starting Firestore Rules Diagnostics...');
      addLog('');

      // Check authentication
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          addLog('❌ Not authenticated');
          return;
        }

        addLog('✅ Authenticated');
        addLog(`   UID: ${firebaseUser.uid}`);
        addLog(`   Email: ${firebaseUser.email}`);
        addLog('');
        setUser(firebaseUser);

        // Check user document
        addLog('🔍 Checking user document...');
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            addLog('✅ User document exists');
            addLog(`   Role: "${userData.role}" (type: ${typeof userData.role})`);
            addLog(`   Role === "admin": ${userData.role === 'admin'}`);
            addLog(`   Role length: ${userData.role?.length || 0} characters`);

            // Check for hidden characters
            if (userData.role) {
              const roleBytes = Array.from(String(userData.role)).map((c) => c.charCodeAt(0));
              addLog(`   Role bytes: [${roleBytes.join(', ')}]`);
              addLog(`   Expected bytes for "admin": [97, 100, 109, 105, 110]`);
            }
          } else {
            addLog('❌ User document does not exist!');
          }
        } catch (error: any) {
          addLog(`❌ Error reading user document: ${error.message}`);
        }
        addLog('');

        // Test reading candidate_projects collection
        addLog('🔍 Testing candidate_projects read access...');
        try {
          const projectsSnapshot = await getDocs(collection(db, 'candidate_projects'));
          addLog(`✅ SUCCESS! Can read projects`);
          addLog(`   Found ${projectsSnapshot.size} projects`);

          if (projectsSnapshot.size > 0) {
            const firstProject = projectsSnapshot.docs[0];
            const data = firstProject.data();
            addLog(`   Sample project ID: ${firstProject.id}`);
            addLog(`   Agent ID: ${data.agent_id}`);
            addLog(`   Candidate ID: ${data.candidate_id}`);
          }
        } catch (error: any) {
          addLog(`❌ FAILED! Cannot read projects`);
          addLog(`   Error code: ${error.code}`);
          addLog(`   Error message: ${error.message}`);

          if (error.code === 'permission-denied') {
            addLog('');
            addLog('📋 DIAGNOSIS:');
            addLog('   The Firestore rules are BLOCKING admin access.');
            addLog('   This means either:');
            addLog('   1. The rules were NOT published in Firebase Console');
            addLog('   2. The role field has wrong value/type');
            addLog('   3. You\'re connected to wrong Firebase project');
          }
        }
        addLog('');

        // Test reading other collections
        addLog('🔍 Testing other collections...');

        const collections = ['users', 'profiles', 'project_updates', 'project_actions'];
        for (const collName of collections) {
          try {
            const snapshot = await getDocs(collection(db, collName));
            addLog(`✅ ${collName}: Can read (${snapshot.size} docs)`);
          } catch (error: any) {
            addLog(`❌ ${collName}: ${error.code}`);
          }
        }

        addLog('');
        addLog('🏁 Diagnostics complete!');
      });
    } catch (error: any) {
      addLog(`❌ Unexpected error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔧 Firestore Rules Diagnostics</h1>

      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Instructions:</h2>
        <ol style={{ marginLeft: '20px' }}>
          <li>Review the diagnostic logs below</li>
          <li>If you see "permission-denied", the rules are NOT properly deployed</li>
          <li>Go to Firebase Console → Firestore → Rules</li>
          <li>Look for the blue "Publish" button at the top</li>
          <li>Click "Publish" to deploy the rules</li>
          <li>Refresh this page to test again</li>
        </ol>
      </div>

      <div style={{
        backgroundColor: '#000',
        color: '#0f0',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'Courier New, monospace',
        fontSize: '13px',
        lineHeight: '1.5',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
        <strong>⚠️ Important:</strong> After reviewing the logs, if you see "permission-denied":
        <ol style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li>The rules are NOT deployed (most common)</li>
          <li>Check your role field has EXACTLY the value: <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px' }}>admin</code></li>
          <li>Verify you're logged into the correct Firebase project</li>
        </ol>
      </div>
    </div>
  );
}
