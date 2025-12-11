/**
 * Cleanup Page: Delete all old notifications
 *
 * This page allows admin users to delete all notifications created before today.
 * Navigate to /cleanup-notifications to use this tool.
 */

import { useState } from 'react';
import { collection, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase/config';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export default function CleanupNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [stats, setStats] = useState<{ found: number; deleted: number }>({ found: 0, deleted: 0 });

  const deleteOldNotifications = async () => {
    try {
      setIsLoading(true);
      setStatus('Starting cleanup...');
      setError('');
      setSuccess('');
      setStats({ found: 0, deleted: 0 });

      const db = getDb();

      // Get start of today (2025-12-11)
      const todayStart = new Date('2025-12-11T00:00:00Z');
      setStatus(`Querying notifications before ${todayStart.toISOString()}...`);

      // Query all notifications created before today
      const notificationsRef = collection(db, 'notifications');
      const oldNotificationsQuery = query(
        notificationsRef,
        where('createdAt', '<', Timestamp.fromDate(todayStart))
      );

      const snapshot = await getDocs(oldNotificationsQuery);

      if (snapshot.empty) {
        setSuccess('No old notifications found. Database is already clean!');
        setIsLoading(false);
        return;
      }

      setStats({ found: snapshot.size, deleted: 0 });
      setStatus(`Found ${snapshot.size} old notifications. Deleting...`);

      // Delete in batches of 500 (Firestore limit)
      const batchSize = 500;
      let deletedCount = 0;
      let batch = writeBatch(db);
      let batchCount = 0;

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        batchCount++;

        // Commit batch when it reaches 500 operations
        if (batchCount === batchSize) {
          await batch.commit();
          deletedCount += batchCount;
          setStats({ found: snapshot.size, deleted: deletedCount });
          setStatus(`Deleted ${deletedCount} / ${snapshot.size} notifications...`);
          batch = writeBatch(db);
          batchCount = 0;
        }
      }

      // Commit remaining items in the batch
      if (batchCount > 0) {
        await batch.commit();
        deletedCount += batchCount;
      }

      setStats({ found: snapshot.size, deleted: deletedCount });
      setSuccess(`Successfully deleted ${deletedCount} old notifications! Starting fresh from today.`);
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
            <h1 className="text-3xl font-bold text-gray-900">Cleanup Old Notifications</h1>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Warning</h3>
                <p className="text-sm text-yellow-700">
                  This will permanently delete all notifications created before <strong>December 11, 2025</strong>.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {stats.found > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Notifications Found:</span>
                <span className="text-lg font-bold text-blue-600">{stats.found}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium text-blue-900">Deleted:</span>
                <span className="text-lg font-bold text-green-600">{stats.deleted}</span>
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
              'Delete All Old Notifications'
            )}
          </button>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">What this does:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Deletes all notifications created before December 11, 2025</li>
              <li>Removes notifications for both agents and candidates</li>
              <li>Clears the notification history to start fresh</li>
              <li>Does not affect current projects or messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
