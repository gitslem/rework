import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '@/components/Logo';
import { Download, Calendar, FileText, Users, Filter, ArrowLeft } from 'lucide-react';
import { getFirebaseAuth, getFirebaseFirestore } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { User as UserType } from '@/types';

interface CandidateExportData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  createdAt: Date;
}

type TimeFilter = 'all' | '24hours' | '7days' | '30days';
type ExportFormat = 'csv' | 'txt';

export default function CandidatesExport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [candidates, setCandidates] = useState<CandidateExportData[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateExportData[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCandidates();
    }
  }, [isAdmin]);

  useEffect(() => {
    applyTimeFilter();
  }, [timeFilter, candidates]);

  const checkAdminAccess = async () => {
    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseFirestore();

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            router.push('/admin');
          }
        } else {
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

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const db = getFirebaseFirestore();

      // Get all users with role 'candidate'
      const usersQuery = query(collection(db, 'users'), where('role', '==', 'candidate'));
      const usersSnapshot = await getDocs(usersQuery);

      const candidatesData: CandidateExportData[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as UserType;

        // Get profile data
        const profileDoc = await getDoc(doc(db, 'profiles', userDoc.id));
        const profileData = profileDoc.exists() ? profileDoc.data() : {};

        candidatesData.push({
          uid: userDoc.id,
          email: userData.email || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          city: profileData.city || '',
          country: profileData.country || '',
          createdAt: userData.createdAt?.toDate() || new Date(),
        });
      }

      // Sort by creation date (newest first)
      candidatesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setCandidates(candidatesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setLoading(false);
    }
  };

  const applyTimeFilter = () => {
    const now = new Date();
    let filtered = candidates;

    switch (timeFilter) {
      case '24hours':
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filtered = candidates.filter(c => c.createdAt >= oneDayAgo);
        break;
      case '7days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = candidates.filter(c => c.createdAt >= sevenDaysAgo);
        break;
      case '30days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = candidates.filter(c => c.createdAt >= thirtyDaysAgo);
        break;
      case 'all':
      default:
        filtered = candidates;
    }

    setFilteredCandidates(filtered);
  };

  const generateCSV = (data: CandidateExportData[]): string => {
    const headers = ['Email', 'First Name', 'Last Name', 'City', 'Country', 'Registration Date'];
    const rows = data.map(c => [
      c.email,
      c.firstName,
      c.lastName,
      c.city,
      c.country,
      c.createdAt.toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const generateTXT = (data: CandidateExportData[]): string => {
    const lines = data.map(c => {
      const fullName = [c.firstName, c.lastName].filter(n => n).join(' ') || 'N/A';
      const location = [c.city, c.country].filter(l => l).join(', ') || 'N/A';
      return `Email: ${c.email}\nName: ${fullName}\nLocation: ${location}\nRegistered: ${c.createdAt.toLocaleDateString()}\n${'-'.repeat(50)}`;
    });

    return lines.join('\n');
  };

  const handleExport = () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates to export');
      return;
    }

    setExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      const timestamp = new Date().toISOString().split('T')[0];
      const filterLabel = timeFilter === 'all' ? 'all' : timeFilter;

      if (exportFormat === 'csv') {
        content = generateCSV(filteredCandidates);
        filename = `candidates_${filterLabel}_${timestamp}.csv`;
        mimeType = 'text/csv';
      } else {
        content = generateTXT(filteredCandidates);
        filename = `candidates_${filterLabel}_${timestamp}.txt`;
        mimeType = 'text/plain';
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Successfully exported ${filteredCandidates.length} candidates!`);
    } catch (error) {
      console.error('Error exporting candidates:', error);
      alert('Error exporting candidates. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case '24hours': return 'Last 24 Hours';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'All Time';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Export Candidates - Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Export Candidates</h1>
                  <p className="text-sm text-gray-600">Download candidate data in CSV or TXT format</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/candidates')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Candidates</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Filter className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filtered Results</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredCandidates.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Period</p>
                  <p className="text-lg font-semibold text-gray-900">{getTimeFilterLabel()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      value="all"
                      checked={timeFilter === 'all'}
                      onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">All Time</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      value="24hours"
                      checked={timeFilter === '24hours'}
                      onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Last 24 Hours</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      value="7days"
                      checked={timeFilter === '7days'}
                      onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Last 7 Days</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      value="30days"
                      checked={timeFilter === '30days'}
                      onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Last 30 Days</span>
                  </label>
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">CSV (Comma-Separated Values)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="txt"
                      checked={exportFormat === 'txt'}
                      onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">TXT (Plain Text)</span>
                  </label>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {exportFormat === 'csv'
                    ? 'CSV files can be opened in Excel, Google Sheets, and other spreadsheet applications.'
                    : 'TXT files contain formatted text with candidate information.'}
                </p>
              </div>
            </div>

            {/* Export Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleExport}
                disabled={exporting || filteredCandidates.length === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold ${
                  exporting || filteredCandidates.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>
                  {exporting
                    ? 'Exporting...'
                    : `Export ${filteredCandidates.length} Candidate${filteredCandidates.length !== 1 ? 's' : ''}`}
                </span>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No candidates found for the selected time period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.slice(0, 10).map((candidate) => (
                      <tr key={candidate.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {[candidate.firstName, candidate.lastName].filter(n => n).join(' ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {[candidate.city, candidate.country].filter(l => l).join(', ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {candidate.createdAt.toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCandidates.length > 10 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Showing 10 of {filteredCandidates.length} candidates. Export to see all.
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
