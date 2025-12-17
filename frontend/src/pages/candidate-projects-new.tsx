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
  Tag, MessageSquare, Paperclip, BarChart3, FolderOpen, Star, Menu, X, Loader2
} from 'lucide-react';
import { candidateProjectsAPI } from '../lib/api';

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
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'assignee'>('none');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [connectedCandidates, setConnectedCandidates] = useState<any[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleProjectId, setScheduleProjectId] = useState<string | null>(null);
  const [schedulingProject, setSchedulingProject] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [earningsProjectId, setEarningsProjectId] = useState<string | null>(null);
  const [settingEarnings, setSettingEarnings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);


  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    totalBudget: 0,
    activeEarnings: 0,
    completedCount: 0
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
      async (snapshot) => {
        const projectsList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          // Filter out deleted projects
          .filter((project: any) => project.isDeleted !== true);

        // Fetch agent names from profile for candidates (always fetch to get real names, not Gmail)
        if (userRole === 'candidate') {
          const projectsWithNames = await Promise.all(
            projectsList.map(async (project: any) => {
              // Always fetch agent name from profile if agent_id exists
              if (project.agent_id) {
                try {
                  const profileDoc = await getDoc(doc(getDb(), 'profiles', project.agent_id));
                  if (profileDoc.exists()) {
                    const profileData = profileDoc.data();
                    const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
                    if (fullName) {
                      project.agent_name = fullName;
                    } else {
                      // Fallback to user email only if profile has no name
                      const userDoc = await getDoc(doc(getDb(), 'users', project.agent_id));
                      if (userDoc.exists()) {
                        const userData = userDoc.data();
                        project.agent_name = userData.email?.split('@')[0] || 'Agent';
                      }
                    }
                  } else {
                    // No profile found, use email from user doc
                    const userDoc = await getDoc(doc(getDb(), 'users', project.agent_id));
                    if (userDoc.exists()) {
                      const userData = userDoc.data();
                      project.agent_name = userData.email?.split('@')[0] || 'Agent';
                    }
                  }
                } catch (err) {
                  console.error('Error fetching agent name:', err);
                }
              }
              return project;
            })
          );
          setProjects(projectsWithNames);
          calculateStats(projectsWithNames);
        } else {
          setProjects(projectsList);
          calculateStats(projectsList);
        }
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


  // Get unique assignees (candidates for agents, agents for candidates)
  const uniqueAssignees = Array.from(new Set(
    projects.map(p => {
      if (userRole === 'agent') {
        return p.candidate_name || p.candidate_id;
      } else {
        return p.agent_name || p.agent_id || 'Unassigned';
      }
    }).filter(Boolean)
  ));

  // Filter and sort projects (Simplified)
  useEffect(() => {
    let filtered = [...projects];

    // Filter by history toggle - only show completed in history view
    if (showHistory) {
      filtered = filtered.filter(p => p.status === 'completed');
    } else {
      filtered = filtered.filter(p => p.status !== 'completed');
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(p => p.platform === platformFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(p => {
        const assigneeName = userRole === 'agent'
          ? (p.candidate_name || p.candidate_id)
          : (p.agent_name || p.agent_id || 'Unassigned');
        return assigneeName === assigneeFilter;
      });
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.platform?.toLowerCase().includes(query) ||
        p.candidate_name?.toLowerCase().includes(query) ||
        p.agent_name?.toLowerCase().includes(query)
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
  }, [projects, platformFilter, assigneeFilter, searchQuery, sortBy, showHistory, userRole]);

  // Simplified - No grouping, just return all filtered projects
  const getGroupedProjects = () => {
    return { 'All Projects': filteredProjects };
  };

  const groupedProjects = getGroupedProjects();

  const calculateStats = (projectsList: any[]) => {
    const activeProjects = projectsList.filter(p => p.status === 'active');
    const completedProjects = projectsList.filter(p => p.status === 'completed');

    const stats = {
      total: projectsList.length,
      active: activeProjects.length,
      pending: projectsList.filter(p => p.status === 'pending').length,
      completed: completedProjects.length,
      totalBudget: projectsList.reduce((sum, p) => sum + (p.budget || 0), 0),
      activeEarnings: activeProjects.reduce((sum, p) => sum + ((p.earnings?.monthly || 0)), 0),
      completedCount: completedProjects.length
    };
    setStats(stats);
  };

  const createProject = async (projectData: any) => {
    if (!user) return;

    // Prevent duplicate submissions
    if (creatingProject) return;

    setCreatingProject(true);

    try {
      // Get agent user document to fetch name
      const agentDoc = await getDoc(doc(getDb(), 'users', user.uid));
      const agentData = agentDoc.exists() ? agentDoc.data() : {};
      const agentName = agentData.name || user.displayName || user.email?.split('@')[0] || 'Agent';

      const projectRef = await addDoc(collection(getDb(), PROJECTS_COLLECTION), {
        ...projectData,
        agent_id: user.uid,
        agent_name: agentName,
        agent_email: user.email,
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
        isRead: false,
        createdAt: Timestamp.now()
      });

      // Close modal only after successful creation
      setShowProjectModal(false);

    } catch (err: any) {
      console.error('Error creating project:', err);
      alert('Failed to create project: ' + err.message);
    } finally {
      setCreatingProject(false);
    }
  };

  const scheduleScreenSharing = async (scheduleData: any) => {
    if (!user || !scheduleProjectId) return;

    // Prevent duplicate submissions
    if (schedulingProject) return;

    setSchedulingProject(true);

    try {
      const project = projects.find(p => p.id === scheduleProjectId);
      if (!project) return;

      // Add scheduled time to project
      await updateDoc(doc(getDb(), PROJECTS_COLLECTION, scheduleProjectId), {
        scheduled_screen_sharing: {
          date: scheduleData.date,
          time: scheduleData.time,
          scheduled_by: user.uid,
          scheduled_by_name: userRole === 'candidate' ? (user.displayName || user.email) : '',
          scheduled_at: Timestamp.now()
        },
        updated_at: Timestamp.now()
      });

      // Create notification for agent
      const recipientId = userRole === 'candidate' ? project.agent_id : project.candidate_id;
      await addDoc(collection(getDb(), 'notifications'), {
        userId: recipientId,
        type: 'screen_sharing_scheduled',
        title: 'Screen Sharing Scheduled',
        message: `Screen sharing has been scheduled for ${project.title} on ${scheduleData.date} at ${scheduleData.time}`,
        projectId: scheduleProjectId,
        scheduleData: scheduleData,
        isRead: false,
        createdAt: Timestamp.now()
      });

      // Close modal only after successful scheduling
      setShowScheduleModal(false);
      setScheduleProjectId(null);

      alert('Screen sharing session scheduled successfully! The agent has been notified.');
    } catch (err: any) {
      console.error('Error scheduling screen sharing:', err);
      alert('Failed to schedule screen sharing: ' + err.message);
    } finally {
      setSchedulingProject(false);
    }
  };

  const handleScheduleClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to project details
    setScheduleProjectId(projectId);
    setShowScheduleModal(true);
  };

  const setProjectEarnings = async (earningsData: any) => {
    if (!user || !earningsProjectId) return;

    // Prevent duplicate submissions
    if (settingEarnings) return;

    setSettingEarnings(true);

    try {
      const project = projects.find(p => p.id === earningsProjectId);
      if (!project) return;

      // Update project with earnings data
      await updateDoc(doc(getDb(), PROJECTS_COLLECTION, earningsProjectId), {
        earnings: {
          weekly: earningsData.weekly || 0,
          monthly: earningsData.monthly || 0,
          set_by: user.uid,
          set_at: Timestamp.now(),
          last_updated: Timestamp.now()
        },
        updated_at: Timestamp.now()
      });

      // Create notification for candidate
      if (project.candidate_id) {
        await addDoc(collection(getDb(), 'notifications'), {
          userId: project.candidate_id,
          type: 'earnings_updated',
          title: 'Earnings Updated',
          message: `Your earnings have been set for ${project.title}: $${earningsData.weekly}/week, $${earningsData.monthly}/month`,
          projectId: earningsProjectId,
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      // Close modal only after successful update
      setShowEarningsModal(false);
      setEarningsProjectId(null);

      alert('Earnings set successfully! The candidate has been notified.');
    } catch (err: any) {
      console.error('Error setting earnings:', err);
      alert('Failed to set earnings: ' + err.message);
    } finally {
      setSettingEarnings(false);
    }
  };

  const handleEarningsClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEarningsProjectId(projectId);
    setShowEarningsModal(true);
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


        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Stats Dashboard - Professional Redesign */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-blue-200 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium mt-1">Total Projects</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-green-200 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-xs sm:text-sm text-green-700 font-medium mt-1">Active</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-yellow-200 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-yellow-700 font-medium mt-1">Pending</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-purple-200 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-purple-700 font-medium mt-1">Completed</div>
            </div>

            {userRole === 'agent' && (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-emerald-300 hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white">${stats.activeEarnings.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">Monthly Earnings</div>
              </div>
            )}

            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-indigo-300 hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white">${stats.totalBudget.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-indigo-100 font-medium mt-1">Total Value</div>
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

              {/* Simplified Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Sort Order */}
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

                {/* Assignee Filter - Show candidates for agents, agents for candidates */}
                {uniqueAssignees.length > 0 && (
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                  >
                    <option value="all">All {userRole === 'agent' ? 'Candidates' : 'Agents'}</option>
                    {uniqueAssignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                )}

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

                {/* History Toggle */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                    showHistory
                      ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="hidden md:inline">
                    {showHistory ? 'History' : 'Show History'}
                  </span>
                  {showHistory && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{stats.completed}</span>}
                </button>

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
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedProjects).map(([groupName, groupProjects]) => (
                <div key={groupName}>
                  {/* Group Header */}
                  {groupBy !== 'none' && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {groupProjects.length}
                        </span>
                        {groupName}
                      </h3>
                    </div>
                  )}

                  {/* Projects for this group */}
                  {viewMode === 'grid' ? (
                    <GridView projects={groupProjects} onSelectProject={setSelectedProject} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} formatDate={formatDate} router={router} userRole={userRole} onScheduleClick={handleScheduleClick} onEarningsClick={handleEarningsClick} />
                  ) : viewMode === 'list' ? (
                    <ListView projects={groupProjects} onSelectProject={setSelectedProject} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} formatDate={formatDate} router={router} userRole={userRole} onScheduleClick={handleScheduleClick} onEarningsClick={handleEarningsClick} />
                  ) : (
                    <KanbanView projects={groupProjects} onSelectProject={setSelectedProject} getStatusIcon={getStatusIcon} getStatusColor={getStatusColor} formatDate={formatDate} router={router} userRole={userRole} onScheduleClick={handleScheduleClick} onEarningsClick={handleEarningsClick} />
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Create Project Modal */}
        {showProjectModal && userRole === 'agent' && (
          <CreateProjectModal
            onClose={() => setShowProjectModal(false)}
            onSubmit={createProject}
            connectedCandidates={connectedCandidates}
            isLoading={creatingProject}
          />
        )}

        {/* Schedule Screen Sharing Modal */}
        {showScheduleModal && (
          <ScheduleModal
            onClose={() => {
              setShowScheduleModal(false);
              setScheduleProjectId(null);
            }}
            onSubmit={scheduleScreenSharing}
            isLoading={schedulingProject}
          />
        )}

        {/* Set Earnings Modal */}
        {showEarningsModal && (
          <EarningsModal
            onClose={() => {
              setShowEarningsModal(false);
              setEarningsProjectId(null);
            }}
            onSubmit={setProjectEarnings}
            isLoading={settingEarnings}
            project={projects.find(p => p.id === earningsProjectId)}
          />
        )}
      </div>
    </>
  );
}

// Grid View Component
function GridView({ projects, onSelectProject, getStatusIcon, getStatusColor, formatDate, router, userRole, onScheduleClick, onEarningsClick }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {projects.map((project: any) => (
        <div
          key={project.id}
          onClick={() => router.push(`/candidate-projects?project=${project.id}`)}
          className="group bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden"
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
              {/* Assignment Info */}
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium text-blue-600">
                  {userRole === 'agent'
                    ? (project.candidate_name || 'Unknown Candidate')
                    : (project.agent_name || 'Unassigned')}
                </span>
              </div>

              {project.platform && (
                <div className="flex items-center text-gray-600">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">{project.platform}</span>
                </div>
              )}
              {project.budget && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-semibold">${project.budget.toLocaleString()}</span>
                </div>
              )}
              {project.earnings && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <div className="flex items-center text-emerald-700">
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                    <span className="font-bold">${project.earnings.weekly}/wk</span>
                  </div>
                  <div className="w-px h-4 bg-emerald-300"></div>
                  <div className="flex items-center text-teal-700">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-bold">${project.earnings.monthly}/mo</span>
                  </div>
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
            <div className="flex items-center gap-2">
              {/* Earnings Button - Only for agents on active projects */}
              {userRole === 'agent' && project.status === 'active' && (
                <button
                  onClick={(e) => onEarningsClick(project.id, e)}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors border border-emerald-200"
                  title="Set Earnings"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Earnings
                </button>
              )}
              {/* Schedule Button for both agents and candidates */}
              <button
                onClick={(e) => onScheduleClick(project.id, e)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                title="Schedule Screen Sharing"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </button>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                View Details
                <Eye className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// List View Component
function ListView({ projects, onSelectProject, getStatusIcon, getStatusColor, formatDate, router, userRole, onScheduleClick, onEarningsClick }: any) {
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
                {/* Assignment Info */}
                <span className="flex items-center font-medium text-blue-600">
                  <User className="w-4 h-4 mr-1.5 text-gray-400" />
                  {userRole === 'agent'
                    ? (project.candidate_name || 'Unknown Candidate')
                    : (project.agent_name || 'Unassigned')}
                </span>

                {project.platform && (
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1.5 text-gray-400" />
                    {project.platform}
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

              {/* Earnings Display */}
              {project.earnings && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-lg border border-emerald-200 mt-3 w-fit">
                  <div className="flex items-center text-emerald-700">
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                    <span className="font-bold text-sm">${project.earnings.weekly}/wk</span>
                  </div>
                  <div className="w-px h-4 bg-emerald-300"></div>
                  <div className="flex items-center text-teal-700">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-bold text-sm">${project.earnings.monthly}/mo</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Earnings Button - Only for agents on active projects */}
              {userRole === 'agent' && project.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEarningsClick(project.id, e);
                  }}
                  className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium text-sm hover:bg-emerald-100 transition-colors flex items-center"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Earnings
                </button>
              )}
              {/* Schedule Button for both agents and candidates */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleClick(project.id, e);
                }}
                className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-100 transition-colors flex items-center"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </button>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Kanban View Component
function KanbanView({ projects, onSelectProject, getStatusIcon, getStatusColor, formatDate, router, userRole, onScheduleClick, onEarningsClick }: any) {
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

                  {/* Assignment Info */}
                  <div className="flex items-center text-sm text-blue-600 font-medium mb-2">
                    <User className="w-4 h-4 mr-1" />
                    {userRole === 'agent'
                      ? (project.candidate_name || 'Unknown Candidate')
                      : (project.agent_name || 'Unassigned')}
                  </div>

                  {project.budget && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${project.budget.toLocaleString()}
                    </div>
                  )}

                  {/* Earnings Display */}
                  {project.earnings && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-1.5 rounded-lg border border-emerald-200 mb-2">
                      <div className="flex items-center text-emerald-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span className="font-bold text-xs">${project.earnings.weekly}/wk</span>
                      </div>
                      <div className="w-px h-3 bg-emerald-300"></div>
                      <div className="flex items-center text-teal-700">
                        <DollarSign className="w-3 h-3 mr-0.5" />
                        <span className="font-bold text-xs">${project.earnings.monthly}/mo</span>
                      </div>
                    </div>
                  )}

                  {project.platform && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg mb-3">
                      {project.platform}
                    </span>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-200">
                    {/* Earnings Button - Only for agents on active projects */}
                    {userRole === 'agent' && project.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEarningsClick(project.id, e);
                        }}
                        className="w-full px-2 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg font-medium text-xs hover:bg-emerald-100 transition-colors flex items-center justify-center"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        Set Earnings
                      </button>
                    )}
                    {/* Schedule Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleClick(project.id, e);
                      }}
                      className="w-full px-2 py-1.5 bg-purple-50 text-purple-600 rounded-lg font-medium text-xs hover:bg-purple-100 transition-colors flex items-center justify-center"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Schedule
                    </button>
                  </div>
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
function CreateProjectModal({ onClose, onSubmit, connectedCandidates, isLoading }: any) {
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
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.candidate_id || !formData.title || isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 inline-flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Schedule Screen Sharing Modal
function ScheduleModal({ onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    date: '',
    time: ''
  });

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-bold">Schedule Screen Sharing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-blue-900">
            <strong>📅 Schedule a time for screen sharing session</strong>
            <p className="mt-1 text-blue-700">The agent will be notified via email and in-app notification.</p>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Date *
            </label>
            <input
              type="date"
              required
              min={today}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Time *
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.date || !formData.time || isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 inline-flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Earnings Modal Component
function EarningsModal({ onClose, onSubmit, isLoading, project }: any) {
  const [formData, setFormData] = useState({
    weekly: project?.earnings?.weekly || 0,
    monthly: project?.earnings?.monthly || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6" />
            <h2 className="text-xl font-bold">Set Project Earnings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
            <strong>💰 Set earnings for: {project?.title}</strong>
            <p className="mt-1 text-emerald-700">
              Set weekly and monthly earnings for this active project. The candidate will be notified.
            </p>
          </div>

          {/* Weekly Earnings */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Weekly Earnings ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.weekly}
                onChange={(e) => setFormData({ ...formData, weekly: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="Enter weekly earnings"
              />
            </div>
          </div>

          {/* Monthly Earnings */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Monthly Earnings ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.monthly}
                onChange={(e) => setFormData({ ...formData, monthly: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="Enter monthly earnings"
              />
            </div>
          </div>

          {/* Summary */}
          {(formData.weekly > 0 || formData.monthly > 0) && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary:</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Weekly:</span>
                  <span className="font-bold">${formData.weekly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly:</span>
                  <span className="font-bold">${formData.monthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold">Yearly Est.:</span>
                  <span className="font-bold text-emerald-600">${(formData.monthly * 12).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (formData.weekly === 0 && formData.monthly === 0)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 inline-flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Set Earnings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
