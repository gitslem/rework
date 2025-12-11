/**
 * Cleanup Page: Delete all old notifications and projects
 *
 * This page allows admin users to delete all notifications and projects created before today.
 * Navigate to /cleanup-notifications to use this tool.
 */

import { useState } from 'react';
import { collection, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase/config';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface Stats {
  notifications: { found: number; deleted: number };
  projects: { found: number; deleted: number };
}

export default function CleanupNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    notifications: { found: 0, deleted: 0 },
    projects: { found: 0, deleted: 0 }
  });

  const deleteOldNotifications = async () => {
    try {
      setIsLoading(true);
      setStatus('Starting cleanup...');
      setError('');
      setSuccess('');
      setStats({
        notifications: { found: 0, deleted: 0 },
        projects: { found: 0, deleted: 0 }
      });

      const db = getDb();

      // Get start of today (2025-12-11)
      const todayStart = new Date('2025-12-11T00:00:00Z');
      const todayTimestamp = Timestamp.fromDate(todayStart);

      // ============ DELETE OLD NOTIFICATIONS ============
      setStatus(`Querying notifications before ${todayStart.toISOString()}...`);

      const notificationsRef = collection(db, 'notifications');
      const oldNotificationsQuery = query(
        notificationsRef,
        where('createdAt', '<', todayTimestamp)
      );

      const notifSnapshot = await getDocs(oldNotificationsQuery);

      let notifStats = { found: notifSnapshot.size, deleted: 0 };
      setStats({ notifications: notifStats, projects: { found: 0, deleted: 0 } });

      if (!notifSnapshot.empty) {
        setStatus(`Found ${notifSnapshot.size} old notifications. Deleting...`);

        // Delete in batches of 500 (Firestore limit)
        const batchSize = 500;
        let batch = writeBatch(db);
        let batchCount = 0;

        for (const doc of notifSnapshot.docs) {
          batch.delete(doc.ref);
          batchCount++;

          if (batchCount === batchSize) {
            await batch.commit();
            notifStats.deleted += batchCount;
            setStats({ notifications: notifStats, projects: { found: 0, deleted: 0 } });
            setStatus(`Deleted ${notifStats.deleted} / ${notifSnapshot.size} notifications...`);
            batch = writeBatch(db);
            batchCount = 0;
          }
        }

        if (batchCount > 0) {
          await batch.commit();
          notifStats.deleted += batchCount;
          setStats({ notifications: notifStats, projects: { found: 0, deleted: 0 } });
        }

        setStatus(`✓ Deleted ${notifStats.deleted} notifications`);
      }

      // ============ DELETE OLD PROJECTS ============
      setStatus('Querying old projects...');

      const projectsRef = collection(db, 'candidate_projects');
      const oldProjectsQuery = query(
        projectsRef,
        where('created_at', '<', todayTimestamp)
      );

      const projectSnapshot = await getDocs(oldProjectsQuery);

      let projStats = { found: projectSnapshot.size, deleted: 0 };
      setStats({ notifications: notifStats, projects: projStats });

      if (!projectSnapshot.empty) {
        setStatus(`Found ${projectSnapshot.size} old projects. Deleting...`);

        let batch = writeBatch(db);
        let batchCount = 0;
        const batchSize = 500;

        for (const doc of projectSnapshot.docs) {
          const projectId = doc.id;

          // Delete the project
          batch.delete(doc.ref);
          batchCount++;

          // Delete related project updates
          const updatesQuery = query(
            collection(db, 'project_updates'),
            where('projectId', '==', projectId)
          );
          const updatesSnapshot = await getDocs(updatesQuery);
          updatesSnapshot.forEach((updateDoc) => {
            batch.delete(updateDoc.ref);
            batchCount++;
          });

          // Delete related project actions
          const actionsQuery = query(
            collection(db, 'project_actions'),
            where('projectId', '==', projectId)
          );
          const actionsSnapshot = await getDocs(actionsQuery);
          actionsSnapshot.forEach((actionDoc) => {
            batch.delete(actionDoc.ref);
            batchCount++;
          });

          if (batchCount >= batchSize) {
            await batch.commit();
            projStats.deleted++;
            setStats({ notifications: notifStats, projects: projStats });
            setStatus(`Deleted ${projStats.deleted} / ${projectSnapshot.size} projects...`);
            batch = writeBatch(db);
            batchCount = 0;
          }
        }

        if (batchCount > 0) {
          await batch.commit();
          projStats.deleted = projectSnapshot.size;
          setStats({ notifications: notifStats, projects: projStats });
        }

        setStatus(`✓ Deleted ${projStats.deleted} projects`);
      }

      // ============ CLEANUP COMPLETE ============
      const totalDeleted = notifStats.deleted + projStats.deleted;
      if (totalDeleted === 0) {
        setSuccess('No old data found. Database is already clean!');
      } else {
        setSuccess(
          `Successfully deleted ${notifStats.deleted} notifications and ${projStats.deleted} projects! Starting fresh from today.`
        );
      }

      setStatus('');
      setIsLoading(false);

    } catch (err: any) {
      console.error('Error during cleanup:', err);
      setError(err.message || 'An error occurred during cleanup');
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Cleanup Old Data</h1>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Warning</h3>
                <p className="text-sm text-yellow-700">
                  This will permanently delete all <strong>notifications AND projects</strong> created before <strong>December 11, 2025</strong>.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {(stats.notifications.found > 0 || stats.projects.found > 0) && (
            <div className="mb-6 space-y-3">
              {/* Notifications Stats */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Notifications</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Found:</span>
                  <span className="text-lg font-bold text-blue-600">{stats.notifications.found}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-medium text-blue-900">Deleted:</span>
                  <span className="text-lg font-bold text-green-600">{stats.notifications.deleted}</span>
                </div>
              </div>

              {/* Projects Stats */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">Projects</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-900">Found:</span>
                  <span className="text-lg font-bold text-purple-600">{stats.projects.found}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-medium text-purple-900">Deleted:</span>
                  <span className="text-lg font-bold text-green-600">{stats.projects.deleted}</span>
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">{status}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          <button
            onClick={deleteOldNotifications}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </span>
            ) : (
              'Delete All Old Data (Notifications & Projects)'
            )}
          </button>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">What this does:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Deletes all notifications created before December 11, 2025</li>
              <li>Deletes all projects created before December 11, 2025</li>
              <li>Removes project updates and actions for deleted projects</li>
              <li>Clears history for both agents and candidates</li>
              <li>Does NOT affect messages or user accounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
