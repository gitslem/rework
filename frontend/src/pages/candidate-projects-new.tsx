import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  collection, query, where, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, doc, orderBy, Timestamp, onSnapshot
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '../lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Briefcase, Plus, Search, Filter, Grid3x3, LayoutList, Calendar,
  DollarSign, Clock, User, Users, TrendingUp, MoreVertical, Edit,
  Trash2, Eye, CheckCircle, Circle, AlertCircle, XCircle, ArrowLeft,
  Tag, MessageSquare, Paperclip, BarChart3, FolderOpen, Star, Menu, X, Bell
} from 'lucide-react';
import { candidateProjectsAPI } from '../lib/api';
import { subscribeToNotifications, markNotificationAsRead } from '../lib/firebase/firestore';

// Firestore Collections
const PROJECTS_COLLECTION = 'candidate_projects';
const UPDATES_COLLECTION = 'project_updates';
const ACTIONS_COLLECTION = 'project_actions';

const getDb = () => getFirebaseFirestore();

type ViewMode = 'grid' | 'list' | 'kanban';
type StatusFilter = 'all' | 'active' | 'pending' | 'completed' | 'on_hold';

export default function CandidateProjectsNew() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string>('candidate');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'budget' | 'deadline'>('date');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [connectedCandidates, setConnectedCandidates] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [projectNotificationCount, setProjectNotificationCount] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    totalBudget: 0
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getDb();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || 'candidate');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch projects
  useEffect(() => {
    if (!user) return;

    const projectsQuery = query(
      collection(getDb(), PROJECTS_COLLECTION),
      userRole === 'agent'
        ? where('agent_id', '==', user.uid)
        : where('candidate_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const projectsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsList);
        calculateStats(projectsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, userRole]);

  // Fetch connected candidates for agents
  useEffect(() => {
    if (!user || userRole !== 'agent') return;

    const fetchConnections = async () => {
      try {
        const connectionsQuery = query(
          collection(getDb(), 'connections'),
          where('agentId', '==', user.uid),
          where('status', '==', 'connected')
        );

        const snapshot = await getDocs(connectionsQuery);
        const candidatesMap = new Map();

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!data.candidateId || !data.candidateName) return;

          if (!candidatesMap.has(data.candidateId)) {
            candidatesMap.set(data.candidateId, {
              id: doc.id,
              candidateId: data.candidateId,
              candidateName: data.candidateName,
              candidateEmail: data.candidateEmail || ''
            });
          }
        });

        setConnectedCandidates(Array.from(candidatesMap.values()));
      } catch (err: any) {
        console.error('Error fetching connected candidates:', err);
        setConnectedCandidates([]);
      }
    };

    fetchConnections();
  }, [user, userRole]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);

      // Count project-related notifications
      const projectNotifs = notifs.filter(n =>
        !n.isRead && (
          n.type === 'action_needed' ||
          n.type === 'action_status_changed' ||
          n.type === 'project_update' ||
          n.metadata?.projectId
        )
      );
      setProjectNotificationCount(projectNotifs.length);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(p => p.platform === platformFilter);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.platform?.toLowerCase().includes(query) ||
        p.candidate_name?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        case 'deadline':
          const aDeadline = a.deadline?.toMillis() || 0;
          const bDeadline = b.deadline?.toMillis() || 0;
          return bDeadline - aDeadline;
        case 'date':
        default:
          const aTime = a.created_at?.toMillis() || 0;
          const bTime = b.created_at?.toMillis() || 0;
          return bTime - aTime;
      }
    });

    setFilteredProjects(filtered);
  }, [projects, statusFilter, platformFilter, searchQuery, sortBy]);

  const calculateStats = (projectsList: any[]) => {
    const stats = {
      total: projectsList.length,
      active: projectsList.filter(p => p.status === 'active').length,
      pending: projectsList.filter(p => p.status === 'pending').length,
      completed: projectsList.filter(p => p.status === 'completed').length,
      totalBudget: projectsList.reduce((sum, p) => sum + (p.budget || 0), 0)
    };
    setStats(stats);
  };

  const createProject = async (projectData: any) => {
    if (!user) return;

    try {
      const projectRef = await addDoc(collection(getDb(), PROJECTS_COLLECTION), {
        ...projectData,
        agent_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Create notification
      await addDoc(collection(getDb(), 'notifications'), {
        userId: projectData.candidate_id,
        type: 'project_created',
        title: 'New Project Assigned',
        message: `You have been assigned to a new project: ${projectData.title}`,
        projectId: projectRef.id,
        read: false,
        createdAt: Timestamp.now()
      });

      setShowProjectModal(false);
    } catch (err: any) {
      console.error('Error creating project:', err);
      alert('Failed to create project: ' + err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'on_hold':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const uniquePlatforms = Array.from(new Set(projects.map(p => p.platform).filter(Boolean)));

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Projects | RemoteWorks</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
        {/* Header - Modern & Responsive */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo & Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(userRole === 'agent' ? '/agent-dashboard' : '/candidate-dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">My Projects</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">{stats.total} total projects</p>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                    title="Project Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {projectNotificationCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {projectNotificationCount}
                      </span>
                    )}
                  </button>
                </div>

                {userRole === 'agent' && (
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200">
                {userRole === 'agent' && (
                  <button
                    onClick={() => {
                      setShowProjectModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Notification Dropdown Panel */}
        {showNotificationPanel && (
          <div className="fixed top-20 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-900">Project Notifications</h3>
              <button
                onClick={() => setShowNotificationPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.filter(n =>
                n.type === 'action_needed' ||
                n.type === 'action_status_changed' ||
                n.type === 'project_update' ||
                n.metadata?.projectId
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications
                    .filter(n =>
                      n.type === 'action_needed' ||
                      n.type === 'action_status_changed' ||
                      n.type === 'project_update' ||
                      n.metadata?.projectId
                    )
                    .map((notification) => (
                      <div
                        key={notification.id}
                        onClick={async () => {
                          // Mark as read
                          if (!notification.isRead) {
                            await markNotificationAsRead(notification.id);
                          }

                          // Navigate to project if projectId exists
                          if (notification.projectId || notification.metadata?.projectId) {
                            const projectId = notification.projectId || notification.metadata?.projectId;
                            router.push(`/candidate-projects?project=${projectId}`);
                          }

                          setShowNotificationPanel(false);
                        }}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-gray-900 ${
                              !notification.isRead ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.createdAt?.toDate?.() ?
                                new Date(notification.createdAt.toDate()).toLocaleString() :
                                'Just now'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {notifications.filter(n =>
              n.type === 'action_needed' ||
              n.type === 'action_status_changed' ||
              n.type === 'project_update' ||
              n.metadata?.projectId
            ).length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={async () => {
                    // Mark all project notifications as read
                    const projectNotifs = notifications.filter(n =>
                      !n.isRead && (
                        n.type === 'action_needed' ||
                        n.type === 'action_status_changed' ||
                        n.type === 'project_update' ||
                        n.metadata?.projectId
                      )
                    );
                    for (const notif of projectNotifs) {
                      await markNotificationAsRead(notif.id);
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Cards - Modern Design */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Projects</div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Active</div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Pending</div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Completed</div>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-sm border border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">${stats.totalBudget.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-purple-100 mt-1">Total Budget</div>
            </div>
          </div>

          {/* Filters & View Controls - Modern Design */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>

                {/* Platform Filter */}
                {uniquePlatforms.length > 0 && (
                  <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                  >
                    <option value="all">All Platforms</option>
                    {uniquePlatforms.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                )}

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="budget">Sort by Budget</option>
                  <option value="deadline">Sort by Deadline</option>
                </select>

                {/* View Mode Switcher */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    title="Grid View"
                  >
                    <Grid3x3 className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    title="List View"
                  >
                    <LayoutList className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    title="Kanban View"
                  >
                    <FolderOpen className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>

          {/* Projects Display */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">
                {projects.length === 0
                  ? "You don't have any projects yet."
                  : "No projects match your current filters."}
              </p>
              {userRole === 'agent' && projects.length === 0 && (
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Project
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <GridView projects={filteredProjects} onSelectProject={setSelectedProject} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} formatDate={formatDate} router={router} />
          ) : viewMode === 'list' ? (
            <ListView projects={filteredProjects} onSelectProject={setSelectedProject} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} formatDate={formatDate} router={router} />
          ) : (
            <KanbanView projects={filteredProjects} onSelectProject={setSelectedProject} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} formatDate={formatDate} router={router} />
          )}
        </main>

        {/* Create Project Modal */}
        {showProjectModal && userRole === 'agent' && (
          <CreateProjectModal
            onClose={() => setShowProjectModal(false)}
            onSubmit={createProject}
            connectedCandidates={connectedCandidates}
          />
        )}
      </div>
    </>
  );
}

// Grid View Component
function GridView({ projects, onSelectProject, getStatusIcon, getStatusColor, formatDate, router }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {projects.map((project: any) => (
        <div
          key={project.id}
          onClick={() => router.push(`/candidate-projects?project=${project.id}`)}
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Project Header */}
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1.5 capitalize">{project.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {project.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="space-y-2.5 text-sm">
              {project.platform && (
                <div className="flex items-center text-gray-600">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">{project.platform}</span>
                </div>
              )}
              {project.candidate_name && (
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{project.candidate_name}</span>
                </div>
              )}
              {project.budget && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-semibold">${project.budget.toLocaleString()}</span>
                </div>
              )}
              {project.deadline && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Due {formatDate(project.deadline)}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Project Footer */}
          <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Created {formatDate(project.created_at)}
            </span>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
              View Details
              <Eye className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// List View Component
function ListView({ projects, onSelectProject, getStatusIcon, getStatusColor, formatDate, router }: any) {
  return (
    <div className="space-y-3">
      {projects.map((project: any) => (
        <div
          key={project.id}
          onClick={() => router.push(`/candidate-projects?project=${project.id}`)}
          className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors truncate">
                  {project.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)} shrink-0`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1.5 capitalize">{project.status}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {project.platform && (
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1.5 text-gray-400" />
                    {project.platform}
                  </span>
                )}
                {project.candidate_name && (
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    {project.candidate_name}
                  </span>
                )}
                {project.budget && (
                  <span className="flex items-center font-semibold">
                    <DollarSign className="w-4 h-4 mr-1.5 text-gray-400" />
                    ${project.budget.toLocaleString()}
                  </span>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  Created {formatDate(project.created_at)}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button className="shrink-0 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Kanban View Component
function KanbanView({ projects, onSelectProject, getStatusIcon, getStatusColor, formatDate, router }: any) {
  const statuses = ['pending', 'active', 'on_hold', 'completed'];
  const statusLabels: any = {
    pending: 'Pending',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statuses.map(status => {
        const statusProjects = projects.filter((p: any) => p.status === status);
        return (
          <div key={status} className="bg-white/50 rounded-2xl border-2 border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center">
                {getStatusIcon(status)}
                <span className="ml-2">{statusLabels[status]}</span>
              </h3>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg">
                {statusProjects.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {statusProjects.map((project: any) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/candidate-projects?project=${project.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {project.title}
                  </h4>
                  {project.budget && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${project.budget.toLocaleString()}
                    </div>
                  )}
                  {project.platform && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      {project.platform}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Create Project Modal
function CreateProjectModal({ onClose, onSubmit, connectedCandidates }: any) {
  const [formData, setFormData] = useState({
    candidate_id: '',
    candidate_name: '',
    candidate_email: '',
    title: '',
    description: '',
    platform: '',
    status: 'pending',
    budget: 0,
    tags: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCandidateSelect = (candidateId: string) => {
    const selected = connectedCandidates.find((c: any) => c.candidateId === candidateId);
    if (selected) {
      setFormData({
        ...formData,
        candidate_id: selected.candidateId,
        candidate_name: selected.candidateName,
        candidate_email: selected.candidateEmail
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Candidate Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Candidate *
            </label>
            {connectedCandidates && connectedCandidates.length > 0 ? (
              <select
                required
                value={formData.candidate_id}
                onChange={(e) => handleCandidateSelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Choose a connected candidate...</option>
                {connectedCandidates.map((candidate: any) => (
                  <option key={candidate.candidateId} value={candidate.candidateId}>
                    {candidate.candidateName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-3 border border-yellow-200 rounded-xl bg-yellow-50 text-yellow-800 text-sm">
                No connected candidates. Accept a service request to connect with candidates.
              </div>
            )}
          </div>

          {/* Project Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Platform & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="e.g., Upwork, Freelancer"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.candidate_id || !formData.title}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
