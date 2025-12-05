import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { Trash2, AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';

export default function CleanupProjects() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      countProjects();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          console.log('🔐 Checking admin access for user:', firebaseUser.uid);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('👤 User data:', { uid: firebaseUser.uid, role: userData.role, email: firebaseUser.email });

            if (userData.role === 'admin') {
              console.log('✅ Admin access granted');
              setIsAdmin(true);
            } else {
              console.log('❌ User is not admin, role:', userData.role);
              router.push('/admin');
            }
          } else {
            console.log('❌ User document does not exist');
            router.push('/admin');
          }
        } else {
          console.log('❌ No authenticated user');
          router.push('/admin');
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error checking admin access:', error);
      setLoading(false);
      router.push('/admin');
    }
  };

  const countProjects = async () => {
    try {
      const db = getFirebaseFirestore();

      console.log('🔍 Admin counting projects...');

      // Count projects
      const projectsSnapshot = await getDocs(collection(db, 'candidate_projects'));
      console.log('✅ Projects count:', projectsSnapshot.size);
      setProjectCount(projectsSnapshot.size);

      // Count updates
      const updatesSnapshot = await getDocs(collection(db, 'project_updates'));
      console.log('✅ Updates count:', updatesSnapshot.size);
      setUpdateCount(updatesSnapshot.size);

      // Count actions
      const actionsSnapshot = await getDocs(collection(db, 'project_actions'));
      console.log('✅ Actions count:', actionsSnapshot.size);
      setActionCount(actionsSnapshot.size);
    } catch (error: any) {
      console.error('❌ Error counting projects:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.code === 'permission-denied') {
        alert('⚠️ PERMISSION DENIED: Firestore rules need to be deployed!\n\nThe local firestore.rules file has been updated, but the rules must be deployed to Firebase.\n\nPlease run: firebase deploy --only firestore:rules');
      }
    }
  };

  const deleteAllProjects = async () => {
    if (!confirm(`⚠️ WARNING: This will permanently delete ALL ${projectCount} projects, ${updateCount} updates, and ${actionCount} actions. This cannot be undone!\n\nType "DELETE" in the next prompt to confirm.`)) {
      return;
    }

    const confirmText = prompt('Type "DELETE" (all caps) to confirm deletion:');
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled.');
      return;
    }

    try {
      setDeleting(true);
      const db = getFirebaseFirestore();

      // Delete all projects
      setDeleteProgress('Deleting projects...');
      const projectsSnapshot = await getDocs(collection(db, 'candidate_projects'));
      let deleteCount = 0;
      for (const projectDoc of projectsSnapshot.docs) {
        await deleteDoc(projectDoc.ref);
        deleteCount++;
        if (deleteCount % 10 === 0) {
          setDeleteProgress(`Deleted ${deleteCount}/${projectCount} projects...`);
        }
      }

      // Delete all updates
      setDeleteProgress('Deleting project updates...');
      const updatesSnapshot = await getDocs(collection(db, 'project_updates'));
      deleteCount = 0;
      for (const updateDoc of updatesSnapshot.docs) {
        await deleteDoc(updateDoc.ref);
        deleteCount++;
        if (deleteCount % 10 === 0) {
          setDeleteProgress(`Deleted ${deleteCount}/${updateCount} updates...`);
        }
      }

      // Delete all actions
      setDeleteProgress('Deleting project actions...');
      const actionsSnapshot = await getDocs(collection(db, 'project_actions'));
      deleteCount = 0;
      for (const actionDoc of actionsSnapshot.docs) {
        await deleteDoc(actionDoc.ref);
        deleteCount++;
        if (deleteCount % 10 === 0) {
          setDeleteProgress(`Deleted ${deleteCount}/${actionCount} actions...`);
        }
      }

      setDeleteProgress('Cleanup complete!');
      setDeleted(true);
      setProjectCount(0);
      setUpdateCount(0);
      setActionCount(0);

      setTimeout(() => {
        setDeleting(false);
        setDeleteProgress('');
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting projects:', error);
      alert('Failed to delete projects: ' + error.message);
      setDeleting(false);
      setDeleteProgress('');
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Cleanup Projects - Admin | RemoteWorks</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Logo showText={false} size="lg" />
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Panel</span>
                <button
                  onClick={() => router.push('/')}
                  className="text-sm font-medium text-black hover:text-gray-600"
                >
                  Exit Admin
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Warning Banner */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h2>
                <p className="text-red-800">
                  This action will permanently delete ALL existing projects, updates, and actions from the database.
                  This is irreversible and cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-black mb-6">Current Database Status</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">{projectCount}</div>
                <div className="text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">{updateCount}</div>
                <div className="text-gray-600">Updates</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">{actionCount}</div>
                <div className="text-gray-600">Actions</div>
              </div>
            </div>
          </div>

          {/* Deletion Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-bold text-black mb-4">What will be deleted:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span>All candidate projects from all agents</span>
              </li>
              <li className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span>All project updates and progress reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span>All project actions and tasks</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This will allow agents to start creating projects afresh with the new system.
              </p>
            </div>
          </div>

          {/* Delete Button */}
          {!deleted ? (
            <button
              onClick={deleteAllProjects}
              disabled={deleting || projectCount === 0}
              className="w-full bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{deleteProgress || 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-6 h-6" />
                  <span>Delete All Projects</span>
                </>
              )}
            </button>
          ) : (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">Cleanup Complete!</h3>
              <p className="text-green-800">All projects have been successfully deleted.</p>
              <button
                onClick={() => router.push('/admin/projects')}
                className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Go to Project Management
              </button>
            </div>
          )}

          {projectCount === 0 && !deleted && (
            <div className="mt-4 text-center text-gray-600">
              No projects to delete. The database is already clean.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
