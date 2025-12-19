import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '../lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Calendar, Clock, X, DollarSign, TrendingUp, Loader2, Bell } from 'lucide-react';
import {
  CandidateProjectStatus,
  ProjectActionStatus,
  ProjectActionPriority
} from '../types';
import { candidateProjectsAPI } from '../lib/api';

// Firestore Collections
const PROJECTS_COLLECTION = 'candidate_projects';
const UPDATES_COLLECTION = 'project_updates';
const ACTIONS_COLLECTION = 'project_actions';

// Get Firestore instance
const getDb = () => getFirebaseFirestore();

export default function CandidateProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string>('candidate');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projectUpdates, setProjectUpdates] = useState<any[]>([]);
  const [projectActions, setProjectActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedCandidates, setConnectedCandidates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [projectNotificationCounts, setProjectNotificationCounts] = useState<Record<string, number>>({});

  // Sorting and filtering states
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'deadline' | 'platform'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'assignee'>('none');

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Earnings and Schedule modal states
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [earningsProjectId, setEarningsProjectId] = useState<string | null>(null);
  const [settingEarnings, setSettingEarnings] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleProjectId, setScheduleProjectId] = useState<string | null>(null);
  const [schedulingProject, setSchedulingProject] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  // Check Firebase authentication and get user role
  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getDb();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);

      // Get user document to check role
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

  // Fetch projects in real-time
  useEffect(() => {
    if (!user) return;

    const projectsQuery = query(
      collection(getDb(), PROJECTS_COLLECTION),
      where('status', '==', activeTab),
      userRole === 'agent'
        ? where('agent_id', '==', user.uid)
        : where('candidate_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      async (snapshot) => {
        const projectsList: any[] = snapshot.docs
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
                    const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
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
        } else {
          setProjects(projectsList);
        }

        setLoading(false);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, userRole, activeTab]);

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

        // Deduplicate by candidateId and filter out invalid entries
        const candidatesMap = new Map();

        snapshot.docs.forEach(doc => {
          const data = doc.data();

          // Skip if missing required fields
          if (!data.candidateId || !data.candidateName) {
            console.warn('Skipping connection with missing candidateId or candidateName:', doc.id);
            return;
          }

          // Keep only one connection per candidateId (most recent)
          if (!candidatesMap.has(data.candidateId)) {
            candidatesMap.set(data.candidateId, {
              id: doc.id,
              candidateId: data.candidateId,
              candidateName: data.candidateName,
              candidateEmail: data.candidateEmail || '',
              agentId: data.agentId,
              status: data.status,
              conversationId: data.conversationId,
              createdAt: data.createdAt
            });
          } else {
            // If duplicate, keep the most recent one
            const existing = candidatesMap.get(data.candidateId);
            const existingTime = existing.createdAt?.toMillis() || 0;
            const currentTime = data.createdAt?.toMillis() || 0;

            if (currentTime > existingTime) {
              candidatesMap.set(data.candidateId, {
                id: doc.id,
                candidateId: data.candidateId,
                candidateName: data.candidateName,
                candidateEmail: data.candidateEmail || '',
                agentId: data.agentId,
                status: data.status,
                conversationId: data.conversationId,
                createdAt: data.createdAt
              });
            }
          }
        });

        const candidates = Array.from(candidatesMap.values());
        setConnectedCandidates(candidates);

        console.log(`Loaded ${candidates.length} connected candidates`);
      } catch (err: any) {
        console.error('Error fetching connected candidates:', err);

        // Check if it's a Firestore index error
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          console.error('FIRESTORE INDEX ERROR: Create a composite index on connections collection with fields: agentId (ASC), status (ASC)');
          alert('Database configuration error. Please contact support.');
        }

        setConnectedCandidates([]);
      }
    };

    fetchConnections();
  }, [user, userRole]);

  // Subscribe to notifications in real-time
  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(getDb(), 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setNotifications(notifsList);

      // Count unread notifications per project
      const counts: Record<string, number> = {};
      notifsList.forEach((notif: any) => {
        if (notif.projectId) {
          counts[notif.projectId] = (counts[notif.projectId] || 0) + 1;
        }
      });
      setProjectNotificationCounts(counts);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch project details with real-time updates
  const fetchProjectDetails = async (projectId: string) => {
    try {
      // Get project
      const projectDoc = await getDoc(doc(getDb(), PROJECTS_COLLECTION, projectId));
      if (!projectDoc.exists()) {
        setError('Project not found');
        return;
      }

      const projectData = { id: projectDoc.id, ...projectDoc.data() };

      // Fetch initial updates
      const updatesQuery = query(
        collection(getDb(), UPDATES_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );

      const updatesSnapshot = await getDocs(updatesQuery);
      const initialUpdates = updatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjectUpdates(initialUpdates);

      // Fetch initial actions
      const actionsQuery = query(
        collection(getDb(), ACTIONS_COLLECTION),
        where('project_id', '==', projectId),
        orderBy('created_at', 'desc')
      );

      const actionsSnapshot = await getDocs(actionsQuery);
      const initialActions = actionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjectActions(initialActions);

      // Calculate statistics with initial data
      const totalHours = initialUpdates.reduce((sum, u: any) => sum + (u.hours_completed || 0), 0);
      const totalScreenSharingHours = initialUpdates.reduce((sum, u: any) => sum + (u.screen_sharing_hours || 0), 0);
      const pendingActionsCount = initialActions.filter((a: any) => a.status === 'pending').length;
      // Exclude completed screen_share and work_session from completed count
      const completedActionsCount = initialActions.filter((a: any) =>
        a.status === 'completed' &&
        a.action_type !== 'screen_share' &&
        a.action_type !== 'work_session'
      ).length;

      setSelectedProject({
        ...projectData,
        updates: initialUpdates,
        actions: initialActions,
        total_hours: totalHours,
        total_screen_sharing_hours: totalScreenSharingHours,
        pending_actions_count: pendingActionsCount,
        completed_actions_count: completedActionsCount
      });

      // Mark all notifications for this project as read
      const projectNotifications = notifications.filter((n: any) => n.projectId === projectId);
      for (const notification of projectNotifications) {
        try {
          await updateDoc(doc(getDb(), 'notifications', notification.id), {
            isRead: true
          });
        } catch (err) {
          console.error('Error marking notification as read:', err);
        }
      }

      // Subscribe to real-time updates
      const unsubUpdates = onSnapshot(updatesQuery, (snapshot) => {
        const updates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjectUpdates(updates);

        // Recalculate statistics
        const totalHours = updates.reduce((sum, u: any) => sum + (u.hours_completed || 0), 0);
        const totalScreenSharingHours = updates.reduce((sum, u: any) => sum + (u.screen_sharing_hours || 0), 0);

        setSelectedProject((prev: any) => prev ? {
          ...prev,
          updates,
          total_hours: totalHours,
          total_screen_sharing_hours: totalScreenSharingHours
        } : prev);
      });

      const unsubActions = onSnapshot(actionsQuery, (snapshot) => {
        const actions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjectActions(actions);

        // Recalculate statistics
        const pendingActionsCount = actions.filter((a: any) => a.status === 'pending').length;
        // Exclude completed screen_share and work_session from completed count
        const completedActionsCount = actions.filter((a: any) =>
          a.status === 'completed' &&
          a.action_type !== 'screen_share' &&
          a.action_type !== 'work_session'
        ).length;

        setSelectedProject((prev: any) => prev ? {
          ...prev,
          actions,
          pending_actions_count: pendingActionsCount,
          completed_actions_count: completedActionsCount
        } : prev);
      });

      // Return cleanup function
      return () => {
        unsubUpdates();
        unsubActions();
      };
    } catch (err: any) {
      console.error('Error fetching project details:', err);
      setError(err.message || 'Failed to fetch project details');
    }
  };

  const createProject = async (projectData: any) => {
    if (!user) return;

    // Prevent duplicate submissions
    if (creatingProject) {
      console.log('⚠️ Project creation already in progress, ignoring duplicate call');
      return;
    }

    setCreatingProject(true);

    try {
      // Get agent real name from profile
      let agentName = 'Agent';
      const agentProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
      if (agentProfileDoc.exists()) {
        const agentProfile = agentProfileDoc.data();
        agentName = agentProfile?.firstName && agentProfile?.lastName
          ? `${agentProfile.firstName} ${agentProfile.lastName}`
          : agentProfile?.firstName || user.email?.split('@')[0] || 'Agent';
      } else {
        agentName = user.email?.split('@')[0] || 'Agent';
      }

      const projectRef = await addDoc(collection(getDb(), PROJECTS_COLLECTION), {
        ...projectData,
        agent_id: user.uid,
        agent_name: agentName,
        agent_email: user.email,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Create notification for candidate
      console.log('🔔 Creating notification for candidate:', projectData.candidate_id);
      const notificationRef = await addDoc(collection(getDb(), 'notifications'), {
        userId: projectData.candidate_id,
        type: 'project_created',
        title: 'New Project Assigned',
        message: `You have been assigned to a new project: ${projectData.title}`,
        projectId: projectRef.id,
        isRead: false,
        createdAt: Timestamp.now()
      });
      console.log('✅ Notification created with ID:', notificationRef.id);

      // Send email notification
      try {
        console.log('📧 Preparing to send email notification...');

        // Agent name already fetched above

        // Get candidate email
        const candidateDoc = await getDoc(doc(getDb(), 'users', projectData.candidate_id));
        const candidateData = candidateDoc.data();
        const candidateEmail = candidateData?.email || projectData.candidate_email;

        // Get candidate real name from profile
        let candidateName = 'Candidate';
        const candidateProfileDoc = await getDoc(doc(getDb(), 'profiles', projectData.candidate_id));
        if (candidateProfileDoc.exists()) {
          const candidateProfile = candidateProfileDoc.data();
          candidateName = candidateProfile?.firstName && candidateProfile?.lastName
            ? `${candidateProfile.firstName} ${candidateProfile.lastName}`
            : candidateProfile?.firstName || candidateEmail?.split('@')[0] || 'Candidate';
        } else {
          candidateName = candidateEmail?.split('@')[0] || 'Candidate';
        }

        console.log('Candidate email:', candidateEmail);
        console.log('Candidate name:', candidateName);

        if (candidateEmail) {
          const emailData = {
            candidate_email: candidateEmail,
            candidate_name: candidateName,
            agent_name: agentName,
            project_title: projectData.title,
            project_description: projectData.description || '',
            project_id: projectRef.id,
            platform: projectData.platform
          };

          console.log('📤 Sending email with data:', emailData);

          const response = await candidateProjectsAPI.sendCreationEmail(emailData);

          console.log('📬 Email API response:', response.data);

          if (response.data.success) {
            console.log('✅ Email sent successfully!');
          } else {
            console.warn('⚠️ Email API returned success=false:', response.data.message);
          }
        } else {
          console.warn('⚠️ No candidate email found, skipping email notification');
        }
      } catch (emailErr: any) {
        console.error('❌ Failed to send email notification:', emailErr);
        console.error('Error details:', {
          message: emailErr.message,
          response: emailErr.response?.data,
          status: emailErr.response?.status
        });
        // Don't fail the project creation if email fails
      }

      // Close modal only after successful creation
      setShowProjectModal(false);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const createUpdate = async (updateData: any) => {
    if (!selectedProject || !user) return;

    try {
      await addDoc(collection(getDb(), UPDATES_COLLECTION), {
        ...updateData,
        project_id: selectedProject.id,
        agent_id: user.uid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Create app notification for candidate
      await addDoc(collection(getDb(), 'notifications'), {
        userId: selectedProject.candidate_id,
        type: 'info',
        title: 'Project Update',
        message: `New update on project "${selectedProject.title}": ${updateData.update_title || 'Progress update added'}`,
        projectId: selectedProject.id,
        isRead: false,
        createdAt: Timestamp.now()
      });

      // Send email notification
      try {
        console.log('📧 Preparing to send update email notification...');

        // Get agent real name from profile
        let agentName = 'Agent';
        const agentProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
        if (agentProfileDoc.exists()) {
          const agentProfile = agentProfileDoc.data();
          agentName = agentProfile?.firstName && agentProfile?.lastName
            ? `${agentProfile.firstName} ${agentProfile.lastName}`
            : agentProfile?.firstName || user.email?.split('@')[0] || 'Agent';
        } else {
          agentName = user.email?.split('@')[0] || 'Agent';
        }

        console.log('Agent name:', agentName);

        // Get candidate info from selected project
        const candidateDoc = await getDoc(doc(getDb(), 'users', selectedProject.candidate_id));
        const candidateData = candidateDoc.data();
        const candidateEmail = candidateData?.email;

        // Get candidate real name from profile
        let candidateName = 'Candidate';
        const candidateProfileDoc = await getDoc(doc(getDb(), 'profiles', selectedProject.candidate_id));
        if (candidateProfileDoc.exists()) {
          const candidateProfile = candidateProfileDoc.data();
          candidateName = candidateProfile?.firstName && candidateProfile?.lastName
            ? `${candidateProfile.firstName} ${candidateProfile.lastName}`
            : candidateProfile?.firstName || candidateEmail?.split('@')[0] || 'Candidate';
        } else {
          candidateName = candidateEmail?.split('@')[0] || 'Candidate';
        }

        console.log('Candidate email:', candidateEmail);

        if (candidateEmail) {
          const updateSummary = updateData.update_title || updateData.update_content?.substring(0, 100) || 'New progress update';

          const emailData = {
            candidate_email: candidateEmail,
            candidate_name: candidateName,
            agent_name: agentName,
            project_title: selectedProject.title,
            project_id: selectedProject.id,
            update_summary: updateSummary
          };

          console.log('📤 Sending update email with data:', emailData);

          const response = await candidateProjectsAPI.sendUpdateEmail(emailData);

          console.log('📬 Update email API response:', response.data);

          if (response.data.success) {
            console.log('✅ Update email sent successfully!');
          } else {
            console.warn('⚠️ Update email API returned success=false:', response.data.message);
          }
        } else {
          console.warn('⚠️ No candidate email found, skipping update email notification');
        }
      } catch (emailErr: any) {
        console.error('❌ Failed to send update email notification:', emailErr);
        console.error('Error details:', {
          message: emailErr.message,
          response: emailErr.response?.data,
          status: emailErr.response?.status
        });
        // Don't fail the update creation if email fails
      }

      setShowUpdateModal(false);
    } catch (err: any) {
      console.error('Error creating update:', err);
      setError(err.message || 'Failed to create update');
    }
  };

  const createAction = async (actionData: any) => {
    if (!selectedProject || !user) return;

    try {
      // Get creator name from profile
      let creatorName = 'Unknown';
      const creatorProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
      if (creatorProfileDoc.exists()) {
        const creatorProfile = creatorProfileDoc.data();
        creatorName = creatorProfile?.firstName && creatorProfile?.lastName
          ? `${creatorProfile.firstName} ${creatorProfile.lastName}`
          : creatorProfile?.firstName || user.email?.split('@')[0] || 'Unknown';
      } else {
        creatorName = user.email?.split('@')[0] || 'Unknown';
      }

      await addDoc(collection(getDb(), ACTIONS_COLLECTION), {
        ...actionData,
        project_id: selectedProject.id,
        creator_id: user.uid,
        creator_name: creatorName,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      // Create notification for assigned user(s)
      if (actionData.assigned_to_candidate) {
        await addDoc(collection(getDb(), 'notifications'), {
          userId: selectedProject.candidate_id,
          type: 'action_needed',
          title: 'Action Required',
          message: `New action on project "${selectedProject.title}": ${actionData.title}`,
          projectId: selectedProject.id,
          priority: actionData.priority || 'medium',
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      if (actionData.assigned_to_agent) {
        await addDoc(collection(getDb(), 'notifications'), {
          userId: selectedProject.agent_id,
          type: 'action_needed',
          title: 'Action Required',
          message: `New action on project "${selectedProject.title}": ${actionData.title}`,
          projectId: selectedProject.id,
          priority: actionData.priority || 'medium',
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      // Send email notification for the action
      const isAgent = userRole === 'agent';
      const recipientId = isAgent ? selectedProject.candidate_id : selectedProject.agent_id;

      // Send email for scheduled sessions (screen_share or work_session) using dedicated endpoint
      if (actionData.action_type === 'screen_share' || actionData.action_type === 'work_session') {
        try {
          // Determine recipient based on who created the action
          const isAgent = userRole === 'agent';
          const recipientId = isAgent ? selectedProject.candidate_id : selectedProject.agent_id;

          // Get recipient email and name from Firestore
          let recipientEmail = '';
          let recipientName = 'User';

          if (recipientId) {
            // Get recipient email from users collection
            const recipientUserDoc = await getDoc(doc(getDb(), 'users', recipientId));
            if (recipientUserDoc.exists()) {
              const recipientUserData = recipientUserDoc.data();
              recipientEmail = recipientUserData?.email || '';
            }

            // Get recipient real name from profiles
            const recipientProfileDoc = await getDoc(doc(getDb(), 'profiles', recipientId));
            if (recipientProfileDoc.exists()) {
              const recipientProfile = recipientProfileDoc.data();
              recipientName = recipientProfile?.firstName && recipientProfile?.lastName
                ? `${recipientProfile.firstName} ${recipientProfile.lastName}`
                : recipientProfile?.firstName || recipientEmail?.split('@')[0] || 'User';
            } else {
              recipientName = recipientEmail?.split('@')[0] || 'User';
            }
          }

          // Get requester real name from profile
          const requesterProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
          let requesterName = 'User';
          if (requesterProfileDoc.exists()) {
            const requesterProfile = requesterProfileDoc.data();
            requesterName = requesterProfile?.firstName && requesterProfile?.lastName
              ? `${requesterProfile.firstName} ${requesterProfile.lastName}`
              : requesterProfile?.firstName || user.email?.split('@')[0] || 'User';
          } else {
            requesterName = user.email?.split('@')[0] || 'User';
          }

          // Format scheduled time for email
          let scheduledTimeStr = null;
          if (actionData.scheduled_time) {
            const scheduledDate = new Date(actionData.scheduled_time);
            scheduledTimeStr = scheduledDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            });
          }

          // Call backend to send email
          await candidateProjectsAPI.sendScheduleEmail({
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            requester_name: requesterName,
            requester_role: isAgent ? 'agent' : 'candidate',
            project_title: selectedProject.title,
            project_id: selectedProject.id,
            action_type: actionData.action_type,
            scheduled_time: scheduledTimeStr,
            duration_minutes: actionData.duration_minutes,
            description: actionData.description
          });

          console.log('✅ Schedule email sent successfully');
        } catch (emailErr: any) {
          console.error('⚠️ Failed to send schedule email:', emailErr);
          console.error('Email error details:', {
            message: emailErr.message,
            response: emailErr.response?.data,
            status: emailErr.response?.status
          });
          // Don't fail the action creation if email fails
        }
      } else {
        // Send generic action email for all other action types
        try {
          // Get recipient email and name
          const isAgent = userRole === 'agent';
          const recipientId = isAgent ? selectedProject.candidate_id : selectedProject.agent_id;

          let recipientEmail = '';
          if (recipientId) {
            const recipientUserDoc = await getDoc(doc(getDb(), 'users', recipientId));
            if (recipientUserDoc.exists()) {
              const recipientUserData = recipientUserDoc.data();
              recipientEmail = recipientUserData?.email || '';
            }
          }

          if (recipientEmail) {
            // Get agent real name from profile
            let agentName = 'Agent';
            if (selectedProject.agent_id) {
              const agentProfileDoc = await getDoc(doc(getDb(), 'profiles', selectedProject.agent_id));
              if (agentProfileDoc.exists()) {
                const agentProfile = agentProfileDoc.data();
                agentName = agentProfile?.firstName && agentProfile?.lastName
                  ? `${agentProfile.firstName} ${agentProfile.lastName}`
                  : agentProfile?.firstName || 'Agent';
              }
            }

            // Get candidate real name from profile
            let candidateName = 'Candidate';
            if (selectedProject.candidate_id) {
              const candidateProfileDoc = await getDoc(doc(getDb(), 'profiles', selectedProject.candidate_id));
              if (candidateProfileDoc.exists()) {
                const candidateProfile = candidateProfileDoc.data();
                candidateName = candidateProfile?.firstName && candidateProfile?.lastName
                  ? `${candidateProfile.firstName} ${candidateProfile.lastName}`
                  : candidateProfile?.firstName || 'Candidate';
              }
            }

            const actionSummary = `New action required: ${actionData.title}${actionData.description ? ' - ' + actionData.description.substring(0, 100) : ''}`;

            const emailData = {
              candidate_email: recipientEmail,
              candidate_name: isAgent ? candidateName : agentName,
              agent_name: isAgent ? agentName : candidateName,
              project_title: selectedProject.title,
              project_id: selectedProject.id,
              update_summary: actionSummary
            };

            console.log('📤 Sending action email notification...');
            const response = await candidateProjectsAPI.sendUpdateEmail(emailData);

            if (response.data.success) {
              console.log('✅ Action email sent successfully!');
            } else {
              console.warn('⚠️ Action email API returned success=false:', response.data.message);
            }
          }
        } catch (emailErr: any) {
          console.error('⚠️ Failed to send action email:', emailErr);
          console.error('Email error details:', {
            message: emailErr.message,
            response: emailErr.response?.data,
            status: emailErr.response?.status
          });
          // Don't fail the action creation if email fails
        }
      }

      setShowActionModal(false);
    } catch (err: any) {
      console.error('Error creating action:', err);
      setError(err.message || 'Failed to create action');
    }
  };

  const updateActionStatus = async (actionId: string, status: ProjectActionStatus) => {
    if (!selectedProject || !user) return;

    try {
      const actionRef = doc(getDb(), ACTIONS_COLLECTION, actionId);

      // Get the action to retrieve its details
      const actionSnap = await getDoc(actionRef);
      const action = actionSnap.data();

      await updateDoc(actionRef, {
        status,
        ...(status === 'completed' ? { completed_at: Timestamp.now() } : {}),
        updated_at: Timestamp.now()
      });

      // Notify the other party about the status change
      if (action) {
        const isAgent = userRole === 'agent';
        const otherPartyId = isAgent ? selectedProject.candidate_id : selectedProject.agent_id;

        // Create notification for the other party
        const statusMessages: { [key: string]: string } = {
          'in_progress': 'started working on',
          'completed': 'completed',
          'cancelled': 'cancelled'
        };

        const actionMessage = statusMessages[status] || 'updated';

        await addDoc(collection(getDb(), 'notifications'), {
          userId: otherPartyId,
          type: 'action_status_changed',
          title: 'Action Status Updated',
          message: `${isAgent ? 'Agent' : 'Candidate'} ${actionMessage} action "${action.title}" on project "${selectedProject.title}"`,
          projectId: selectedProject.id,
          actionId: actionId,
          isRead: false,
          createdAt: Timestamp.now()
        });

        console.log(`✅ Notification sent for action status change to ${status}`);
      }
    } catch (err: any) {
      console.error('Error updating action:', err);
      setError(err.message || 'Failed to update action');
    }
  };

  const setProjectEarnings = async (earningsData: any) => {
    if (!user || !earningsProjectId) return;
    setSettingEarnings(true);
    setShowEarningsModal(false);

    try {
      const project = projects.find(p => p.id === earningsProjectId);
      if (!project) return;

      // Update earnings with new structure
      await updateDoc(doc(getDb(), PROJECTS_COLLECTION, earningsProjectId), {
        earnings: {
          hourly_rate: earningsData.hourly_rate || 0,
          payment_type: earningsData.payment_type || 'one_time',
          percentage: earningsData.percentage || 0,
          weekly_earned: earningsData.weekly_earned || 0,
          hours_worked_this_week: earningsData.hours_worked_this_week || 0,
          set_by: user.uid,
          set_at: Timestamp.now(),
          last_updated: Timestamp.now()
        },
        updated_at: Timestamp.now()
      });

      // Create in-app notification
      if (project.candidate_id) {
        const potentialWeekly = (earningsData.hourly_rate || 0) * 40;
        const candidateShare = earningsData.payment_type === 'percentage'
          ? earningsData.weekly_earned * (earningsData.percentage / 100)
          : earningsData.weekly_earned;

        await addDoc(collection(getDb(), 'notifications'), {
          userId: project.candidate_id,
          type: 'earnings_updated',
          title: 'Earnings Updated',
          message: `Your earnings have been set for ${project.title}: $${earningsData.hourly_rate}/hr (Potential: $${potentialWeekly.toFixed(2)}/week)${earningsData.weekly_earned > 0 ? `, Earned this week: $${candidateShare.toFixed(2)}` : ''}`,
          projectId: earningsProjectId,
          isRead: false,
          createdAt: Timestamp.now()
        });

        // Send email notification
        try {
          const candidateDoc = await getDoc(doc(getDb(), 'users', project.candidate_id));
          const candidateData = candidateDoc.data();
          const candidateEmail = candidateData?.email;

          const candidateProfileDoc = await getDoc(doc(getDb(), 'profiles', project.candidate_id));
          const candidateProfile = candidateProfileDoc.data();
          const candidateName = candidateProfile?.firstName || candidateData?.email?.split('@')[0] || 'Candidate';

          // Get agent name
          const agentProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
          const agentProfile = agentProfileDoc.data();
          const agentName = agentProfile?.firstName && agentProfile?.lastName
            ? `${agentProfile.firstName} ${agentProfile.lastName}`
            : user.email?.split('@')[0] || 'Your Agent';

          if (candidateEmail) {
            const emailData = {
              candidate_email: candidateEmail,
              candidate_name: candidateName,
              agent_name: agentName,
              project_title: project.title,
              project_id: earningsProjectId,
              update_summary: `Earnings updated: $${earningsData.hourly_rate}/hr${earningsData.payment_type === 'percentage' ? ` (${earningsData.percentage}% revenue share)` : ' (one-time fee)'}. Potential weekly: $${potentialWeekly.toFixed(2)}${earningsData.weekly_earned > 0 ? `, This week's earnings: $${candidateShare.toFixed(2)}` : ''}`
            };

            console.log('📤 Sending earnings update email:', emailData);
            await candidateProjectsAPI.sendUpdateEmail(emailData);
            console.log('✅ Earnings email sent successfully');
          }
        } catch (emailErr) {
          console.error('❌ Failed to send earnings email:', emailErr);
          // Don't fail the update if email fails
        }
      }
      alert('Earnings set successfully!');
    } catch (err: any) {
      console.error('Error setting earnings:', err);
      alert('Failed to set earnings: ' + err.message);
    } finally {
      setSettingEarnings(false);
      setEarningsProjectId(null);
    }
  };

  const scheduleScreenSharing = async (scheduleData: any) => {
    if (!user || !scheduleProjectId) return;
    setSchedulingProject(true);
    setShowScheduleModal(false);

    try {
      const project = projects.find(p => p.id === scheduleProjectId);
      if (!project) return;

      await updateDoc(doc(getDb(), PROJECTS_COLLECTION, scheduleProjectId), {
        scheduled_screen_sharing: {
          date: scheduleData.date,
          time: scheduleData.time,
          scheduled_by: user.uid,
          scheduled_at: Timestamp.now()
        },
        updated_at: Timestamp.now()
      });

      // Create in-app notification
      const recipientId = userRole === 'candidate' ? project.agent_id : project.candidate_id;
      await addDoc(collection(getDb(), 'notifications'), {
        userId: recipientId,
        type: 'screen_sharing_scheduled',
        title: 'Screen Sharing Scheduled',
        message: `Screen sharing scheduled for ${project.title} on ${scheduleData.date} at ${scheduleData.time}`,
        projectId: scheduleProjectId,
        scheduleData: scheduleData,
        isRead: false,
        createdAt: Timestamp.now()
      });

      // Send email notification
      try {
        const isCandidate = userRole === 'candidate';
        const recipientId = isCandidate ? project.agent_id : project.candidate_id;

        // Get requester name from profile
        const requesterProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
        const requesterProfile = requesterProfileDoc.exists() ? requesterProfileDoc.data() : null;
        const requesterName = requesterProfile?.firstName && requesterProfile?.lastName
          ? `${requesterProfile.firstName} ${requesterProfile.lastName}`
          : user.email?.split('@')[0] || 'User';

        // Get recipient email and name
        let recipientEmail = '';
        let recipientName = 'User';

        if (recipientId) {
          // First get recipient email from users collection
          const recipientUserDoc = await getDoc(doc(getDb(), 'users', recipientId));
          if (recipientUserDoc.exists()) {
            const recipientUserData = recipientUserDoc.data();
            recipientEmail = recipientUserData?.email || '';
          }

          // Then get recipient real name from profiles
          const recipientProfileDoc = await getDoc(doc(getDb(), 'profiles', recipientId));
          if (recipientProfileDoc.exists()) {
            const recipientProfile = recipientProfileDoc.data();
            recipientName = recipientProfile?.firstName && recipientProfile?.lastName
              ? `${recipientProfile.firstName} ${recipientProfile.lastName}`
              : recipientProfile?.firstName || recipientEmail?.split('@')[0] || 'User';
          } else {
            recipientName = recipientEmail?.split('@')[0] || 'User';
          }
        }

        // Format scheduled time
        const scheduledDateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);
        const scheduledTimeStr = scheduledDateTime.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });

        if (recipientEmail) {
          const emailData = {
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            requester_name: requesterName,
            requester_role: isCandidate ? 'candidate' : 'agent',
            project_title: project.title,
            project_id: scheduleProjectId,
            action_type: 'screen_share',
            scheduled_time: scheduledTimeStr,
            duration_minutes: 60,
            description: `Screen sharing session scheduled for ${scheduleData.date} at ${scheduleData.time}`
          };

          console.log('📤 Sending schedule email:', emailData);
          await candidateProjectsAPI.sendScheduleEmail(emailData);
          console.log('✅ Schedule email sent successfully');
        }
      } catch (emailErr) {
        console.error('❌ Failed to send schedule email:', emailErr);
        // Don't fail the scheduling if email fails
      }

      alert('Screen sharing scheduled successfully!');
    } catch (err: any) {
      console.error('Error scheduling:', err);
      alert('Failed to schedule: ' + err.message);
    } finally {
      setSchedulingProject(false);
      setScheduleProjectId(null);
    }
  };

  const handleEarningsClick = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEarningsProjectId(projectId);
    setShowEarningsModal(true);
  };

  const handleScheduleClick = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setScheduleProjectId(projectId);
    setShowScheduleModal(true);
  };

  const cancelSchedule = async (actionId: string) => {
    if (!user || !selectedProject) return;

    if (!confirm('Are you sure you want to cancel this scheduled session?')) return;

    try {
      // Update action status to cancelled
      await updateDoc(doc(getDb(), ACTIONS_COLLECTION, actionId), {
        status: 'cancelled',
        cancelled_by: user.uid,
        cancelled_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      const action = projectActions.find(a => a.id === actionId);
      if (!action) return;

      // Send notification to the other party
      const recipientId = userRole === 'candidate' ? selectedProject.agent_id : selectedProject.candidate_id;
      await addDoc(collection(getDb(), 'notifications'), {
        userId: recipientId,
        type: 'schedule_cancelled',
        title: 'Session Cancelled',
        message: `${userRole === 'candidate' ? 'Candidate' : 'Agent'} has cancelled the scheduled session for ${selectedProject.title}`,
        projectId: selectedProject.id,
        actionId: actionId,
        isRead: false,
        createdAt: Timestamp.now()
      });

      // Send email notification
      try {
        const isCandidate = userRole === 'candidate';

        // Get requester name from profile
        const requesterProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
        const requesterProfile = requesterProfileDoc.exists() ? requesterProfileDoc.data() : null;
        const requesterName = requesterProfile?.firstName && requesterProfile?.lastName
          ? `${requesterProfile.firstName} ${requesterProfile.lastName}`
          : user.email?.split('@')[0] || 'User';

        // Get recipient email and name
        let recipientEmail = '';
        let recipientName = 'User';

        if (recipientId) {
          // First get recipient email from users collection
          const recipientUserDoc = await getDoc(doc(getDb(), 'users', recipientId));
          if (recipientUserDoc.exists()) {
            const recipientUserData = recipientUserDoc.data();
            recipientEmail = recipientUserData?.email || '';
          }

          // Then get recipient real name from profiles
          const recipientProfileDoc = await getDoc(doc(getDb(), 'profiles', recipientId));
          if (recipientProfileDoc.exists()) {
            const recipientProfile = recipientProfileDoc.data();
            recipientName = recipientProfile?.firstName && recipientProfile?.lastName
              ? `${recipientProfile.firstName} ${recipientProfile.lastName}`
              : recipientProfile?.firstName || recipientEmail?.split('@')[0] || 'User';
          } else {
            recipientName = recipientEmail?.split('@')[0] || 'User';
          }
        }

        if (recipientEmail) {
          const emailData = {
            candidate_email: recipientEmail,
            candidate_name: recipientName,
            agent_name: requesterName,
            project_title: selectedProject.title,
            project_id: selectedProject.id,
            update_summary: `Scheduled ${action.action_type === 'screen_share' ? 'screen sharing' : 'work'} session has been cancelled by ${requesterName}. Session was scheduled for ${action.scheduled_time ? formatDate(action.scheduled_time) : 'TBD'}.`
          };

          console.log('📤 Sending cancellation email:', emailData);
          await candidateProjectsAPI.sendUpdateEmail(emailData);
          console.log('✅ Cancellation email sent successfully');
        }
      } catch (emailErr) {
        console.error('❌ Failed to send cancellation email:', emailErr);
      }

      alert('Session cancelled successfully!');
    } catch (err: any) {
      console.error('Error cancelling session:', err);
      alert('Failed to cancel session: ' + err.message);
    }
  };

  const rescheduleSession = async (actionId: string, newDate: string, newTime: string) => {
    if (!user || !selectedProject) return;

    try {
      const action = projectActions.find(a => a.id === actionId);
      if (!action) return;

      const oldScheduledTime = action.scheduled_time ? formatDate(action.scheduled_time) : 'TBD';

      // Update action with new scheduled time
      const newDateTime = Timestamp.fromDate(new Date(`${newDate}T${newTime}`));
      await updateDoc(doc(getDb(), ACTIONS_COLLECTION, actionId), {
        scheduled_time: newDateTime,
        rescheduled_by: user.uid,
        rescheduled_at: Timestamp.now(),
        previous_scheduled_time: action.scheduled_time,
        updated_at: Timestamp.now()
      });

      // Send notification
      const recipientId = userRole === 'candidate' ? selectedProject.agent_id : selectedProject.candidate_id;
      await addDoc(collection(getDb(), 'notifications'), {
        userId: recipientId,
        type: 'schedule_rescheduled',
        title: 'Session Rescheduled',
        message: `${userRole === 'candidate' ? 'Candidate' : 'Agent'} has rescheduled the session for ${selectedProject.title} to ${newDate} at ${newTime}`,
        projectId: selectedProject.id,
        actionId: actionId,
        isRead: false,
        createdAt: Timestamp.now()
      });

      // Send email notification
      try {
        const isCandidate = userRole === 'candidate';
        const recipientId = isCandidate ? selectedProject.agent_id : selectedProject.candidate_id;

        // Get requester name from profile
        const requesterProfileDoc = await getDoc(doc(getDb(), 'profiles', user.uid));
        const requesterProfile = requesterProfileDoc.exists() ? requesterProfileDoc.data() : null;
        const requesterName = requesterProfile?.firstName && requesterProfile?.lastName
          ? `${requesterProfile.firstName} ${requesterProfile.lastName}`
          : user.email?.split('@')[0] || 'User';

        // Get recipient email and name
        let recipientEmail = '';
        let recipientName = 'User';

        if (recipientId) {
          // First get recipient email from users collection
          const recipientUserDoc = await getDoc(doc(getDb(), 'users', recipientId));
          if (recipientUserDoc.exists()) {
            const recipientUserData = recipientUserDoc.data();
            recipientEmail = recipientUserData?.email || '';
          }

          // Then get recipient real name from profiles
          const recipientProfileDoc = await getDoc(doc(getDb(), 'profiles', recipientId));
          if (recipientProfileDoc.exists()) {
            const recipientProfile = recipientProfileDoc.data();
            recipientName = recipientProfile?.firstName && recipientProfile?.lastName
              ? `${recipientProfile.firstName} ${recipientProfile.lastName}`
              : recipientProfile?.firstName || recipientEmail?.split('@')[0] || 'User';
          } else {
            recipientName = recipientEmail?.split('@')[0] || 'User';
          }
        }

        const scheduledDateTime = new Date(`${newDate}T${newTime}`);
        const scheduledTimeStr = scheduledDateTime.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });

        if (recipientEmail) {
          const emailData = {
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            requester_name: requesterName,
            requester_role: isCandidate ? 'candidate' : 'agent',
            project_title: selectedProject.title,
            project_id: selectedProject.id,
            action_type: action.action_type,
            scheduled_time: scheduledTimeStr,
            duration_minutes: action.duration_minutes || 60,
            description: `Session rescheduled from ${oldScheduledTime} to ${newDate} at ${newTime}`
          };

          console.log('📤 Sending reschedule email:', emailData);
          await candidateProjectsAPI.sendScheduleEmail(emailData);
          console.log('✅ Reschedule email sent successfully');
        }
      } catch (emailErr) {
        console.error('❌ Failed to send reschedule email:', emailErr);
      }

      alert('Session rescheduled successfully!');
    } catch (err: any) {
      console.error('Error rescheduling session:', err);
      alert('Failed to reschedule session: ' + err.message);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user || userRole !== 'agent') {
      setError('Only agents can delete projects');
      return;
    }

    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      // Get project details before deletion for notification
      const projectDoc = await getDoc(doc(getDb(), PROJECTS_COLLECTION, projectId));
      const projectData = projectDoc.data();

      // Delete project document
      await deleteDoc(doc(getDb(), PROJECTS_COLLECTION, projectId));

      // Delete associated updates
      const updatesQuery = query(
        collection(getDb(), UPDATES_COLLECTION),
        where('project_id', '==', projectId)
      );
      const updatesSnapshot = await getDocs(updatesQuery);
      const updateDeletePromises = updatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(updateDeletePromises);

      // Delete associated actions
      const actionsQuery = query(
        collection(getDb(), ACTIONS_COLLECTION),
        where('project_id', '==', projectId)
      );
      const actionsSnapshot = await getDocs(actionsQuery);
      const actionDeletePromises = actionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(actionDeletePromises);

      // Create notification for candidate about project deletion
      if (projectData && projectData.candidate_id) {
        await addDoc(collection(getDb(), 'notifications'), {
          userId: projectData.candidate_id,
          type: 'project_deleted',
          title: 'Project Deleted',
          message: `Project "${projectData.title}" has been deleted by your agent`,
          isRead: false,
          createdAt: Timestamp.now()
        });
      }

      setSelectedProject(null);
      alert('Project deleted successfully');
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
      alert('Failed to delete project: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-600',
      pending: 'bg-yellow-600',
      completed: 'bg-blue-600',
      cancelled: 'bg-red-600',
      in_progress: 'bg-purple-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Get unique platforms for filter
  const uniquePlatforms = Array.from(new Set(projects.map(p => p.platform).filter(Boolean)));

  // Get unique assignees (candidates for agents, agents for candidates)
  const uniqueAssignees = Array.from(new Set(
    projects.map(p => {
      if (userRole === 'agent') {
        return p.candidate_name || p.candidate_id;
      } else {
        return p.agent_name || p.agent_id;
      }
    }).filter(Boolean)
  ));

  // Sort and filter projects
  const getSortedAndFilteredProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(p => p.platform === platformFilter);
    }

    // Apply assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(p => {
        const assigneeName = userRole === 'agent'
          ? (p.candidate_name || p.candidate_id)
          : (p.agent_name || p.agent_id);
        return assigneeName === assigneeFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'date':
          const aTime = a.created_at?.toMillis?.() || 0;
          const bTime = b.created_at?.toMillis?.() || 0;
          compareValue = aTime - bTime;
          break;
        case 'budget':
          compareValue = (a.budget || 0) - (b.budget || 0);
          break;
        case 'deadline':
          const aDeadline = a.deadline?.toMillis?.() || 0;
          const bDeadline = b.deadline?.toMillis?.() || 0;
          compareValue = aDeadline - bDeadline;
          break;
        case 'platform':
          compareValue = (a.platform || '').localeCompare(b.platform || '');
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  };

  // Group projects if grouping is enabled
  const getGroupedProjects = () => {
    const filtered = getSortedAndFilteredProjects();

    if (groupBy === 'none') {
      return { 'All Projects': filtered };
    }

    if (groupBy === 'assignee') {
      const grouped: { [key: string]: any[] } = {};

      filtered.forEach(project => {
        const groupKey = userRole === 'agent'
          ? (project.candidate_name || project.candidate_id || 'Unknown Candidate')
          : (project.agent_name || project.agent_id || 'Agent');

        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(project);
      });

      return grouped;
    }

    return { 'All Projects': filtered };
  };

  const sortedAndFilteredProjects = getSortedAndFilteredProjects();
  const groupedProjects = getGroupedProjects();

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Projects
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {userRole === 'agent'
                ? 'Manage candidate projects and provide updates'
                : 'View your projects and track progress'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(userRole === 'agent' ? '/agent-dashboard' : '/candidate-dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Active Projects
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Pending Projects
              </button>
            </nav>
          </div>
        </div>

        {/* Add Project Button for Agents */}
        {userRole === 'agent' && (
          <div className="mb-6">
            <button
              onClick={() => setShowProjectModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add New Project
            </button>
          </div>
        )}

        {/* Sorting and Filtering Controls */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="project-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Projects
              </label>
              <input
                id="project-search"
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description..."
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>

            {/* Assignee Filter */}
            <div>
              <label htmlFor="assignee-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {userRole === 'agent' ? 'Candidates' : 'Agents'}
              </label>
              <select
                id="assignee-filter"
                name="assignee"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All {userRole === 'agent' ? 'Candidates' : 'Agents'}</option>
                {uniqueAssignees.map(assignee => (
                  <option key={assignee} value={assignee}>{assignee}</option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platforms
              </label>
              <select
                id="platform-filter"
                name="platform"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All Platforms</option>
                {uniquePlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <select
                id="sort-order"
                name="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedAndFilteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedAndFilteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">
              {projects.length === 0 ? `No ${activeTab} projects found` : 'No projects match your filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredProjects.map((project: any) => (
              <div
                key={project.id}
                onClick={() => fetchProjectDetails(project.id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    {projectNotificationCounts[project.id] > 0 && (
                      <div className="relative">
                        <Bell className="w-5 h-5 text-red-500 animate-pulse" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {projectNotificationCounts[project.id]}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`${getStatusColor(project.status)} text-white text-xs px-2 py-1 rounded-full`}>
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {/* Assignment Info */}
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">
                      {userRole === 'agent' ? 'Candidate:' : 'Agent:'}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {userRole === 'agent'
                        ? (project.candidate_name || 'Unknown Candidate')
                        : (project.agent_name || 'Agent')}
                    </span>
                  </div>

                  {project.platform && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Platform:</span>
                      {project.platform}
                    </div>
                  )}

                  {project.budget && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Budget:</span>
                      ${project.budget}
                    </div>
                  )}

                  {project.earnings && project.earnings.hourly_rate && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center text-emerald-700 dark:text-emerald-400">
                          <DollarSign className="w-4 h-4 mr-1.5" />
                          <span className="font-bold text-sm">${project.earnings.hourly_rate}/hr</span>
                        </div>
                        <div className="w-px h-4 bg-emerald-300 dark:bg-emerald-700"></div>
                        <div className="flex items-center text-teal-700 dark:text-teal-400">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="font-bold text-sm">${(project.earnings.hourly_rate * 40).toFixed(0)}/wk</span>
                        </div>
                      </div>
                      {project.earnings.weekly_earned > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-xs text-blue-700 dark:text-blue-400">
                            {userRole === 'candidate' ? (
                              <>
                                {project.earnings.payment_type === 'percentage' ? (
                                  <span>💰 Your share: <strong>${(project.earnings.weekly_earned * (project.earnings.percentage || 0) / 100).toFixed(2)}</strong> this week ({project.earnings.percentage}%)</span>
                                ) : (
                                  <span>💰 Earned this week: <strong>${project.earnings.weekly_earned.toFixed(2)}</strong></span>
                                )}
                              </>
                            ) : (
                              <span>💰 Earned this week: <strong>${project.earnings.weekly_earned.toFixed(2)}</strong></span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {project.deadline && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="font-medium mr-2">Deadline:</span>
                      {formatDate(project.deadline)}
                    </div>
                  )}
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {userRole === 'agent' && project.status === 'active' && (
                    <button
                      onClick={(e) => handleEarningsClick(project.id, e)}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium text-sm flex items-center px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border border-emerald-200 dark:border-emerald-800"
                      title="Set Earnings"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Set Earnings
                    </button>
                  )}
                  {userRole === 'candidate' && (
                    <button
                      onClick={(e) => handleScheduleClick(project.id, e)}
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium text-sm flex items-center px-3 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-purple-200 dark:border-purple-800"
                      title="Schedule Screen Sharing"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Detail Modal - Same as before but using Firebase data */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            updates={projectUpdates}
            actions={projectActions}
            userRole={userRole}
            onClose={() => setSelectedProject(null)}
            onAddUpdate={() => setShowUpdateModal(true)}
            onAddAction={() => setShowActionModal(true)}
            onUpdateActionStatus={updateActionStatus}
            onDeleteProject={deleteProject}
            onCancelSchedule={cancelSchedule}
            onRescheduleSession={rescheduleSession}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
          />
        )}

        {/* Modals */}
        {showUpdateModal && selectedProject && userRole === 'agent' && (
          <UpdateFormModal
            onClose={() => setShowUpdateModal(false)}
            onSubmit={createUpdate}
          />
        )}

        {showActionModal && selectedProject && (
          <ActionFormModal
            onClose={() => setShowActionModal(false)}
            onSubmit={createAction}
          />
        )}

        {showProjectModal && userRole === 'agent' && (
          <ProjectFormModal
            onClose={() => setShowProjectModal(false)}
            onSubmit={createProject}
            connectedCandidates={connectedCandidates}
            isLoading={creatingProject}
          />
        )}

        {/* Earnings Modal */}
        {showEarningsModal && (
          <EarningsModal
            onClose={() => { setShowEarningsModal(false); setEarningsProjectId(null); }}
            onSubmit={setProjectEarnings}
            isLoading={settingEarnings}
            project={projects.find(p => p.id === earningsProjectId)}
          />
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <ScheduleModal
            onClose={() => { setShowScheduleModal(false); setScheduleProjectId(null); }}
            onSubmit={scheduleScreenSharing}
            isLoading={schedulingProject}
          />
        )}
      </div>
    </div>
  );
}

// ProjectDetailModal component (extracted for clarity)
function ProjectDetailModal({ project, updates, actions, userRole, onClose, onAddUpdate, onAddAction, onUpdateActionStatus, onDeleteProject, onCancelSchedule, onRescheduleSession, getStatusColor, getPriorityColor, formatDate }: any) {
  const [rescheduleAction, setRescheduleAction] = useState<any>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`${getStatusColor(project.status)} text-white text-sm px-3 py-1 rounded-full`}>
                  {project.status}
                </span>
                {project.platform && (
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Platform: {project.platform}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Buttons for Agents */}
          {userRole === 'agent' && (
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={onAddUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Update
              </button>
              <button
                onClick={onAddAction}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Action
              </button>
              <button
                onClick={() => onDeleteProject(project.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Project
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Project Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Project Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {project.total_hours || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {project.total_screen_sharing_hours || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Screen Share</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {project.pending_actions_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Actions</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {project.completed_actions_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
          </div>

          {/* Updates Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Project Updates ({updates.length})
            </h3>
            {updates.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {updates.map((update: any) => (
                  <div key={update.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {update.update_title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(update.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {update.update_content}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Hours:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {update.hours_completed || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {update.progress_percentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Sessions Section - Always Show */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Sessions ({actions.filter((action: any) =>
                (action.action_type === 'screen_share' || action.action_type === 'work_session') &&
                action.status !== 'completed' &&
                action.status !== 'cancelled'
              ).length})
            </h3>
            {actions.filter((action: any) =>
              (action.action_type === 'screen_share' || action.action_type === 'work_session') &&
              action.status !== 'completed' &&
              action.status !== 'cancelled'
            ).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No scheduled sessions yet</p>
            ) : (
              <div className="space-y-3">
                {actions
                  .filter((action: any) =>
                    (action.action_type === 'screen_share' || action.action_type === 'work_session') &&
                    action.status !== 'completed' &&
                    action.status !== 'cancelled'
                  )
                  .map((action: any) => (
                    <div
                      key={action.id}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {action.title}
                            </h4>
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {action.action_type === 'screen_share' ? '🖥️ Screen Share' : '💼 Work Session'}
                            </span>
                            <span className={`${getStatusColor(action.status)} text-white text-xs px-2 py-1 rounded-full`}>
                              {action.status}
                            </span>
                          </div>

                          {action.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {action.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {action.scheduled_time && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Clock className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Scheduled Time:</div>
                                  <div className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatDate(action.scheduled_time)}
                                  </div>
                                </div>
                              </div>
                            )}
                            {action.duration_minutes && (
                              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Clock className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Duration:</div>
                                  <div className="text-purple-600 dark:text-purple-400 font-semibold">
                                    {action.duration_minutes} minutes
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {action.assigned_to_candidate && (
                            <div className="mt-3 bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-400">
                              👤 Assigned to: Candidate{action.creator_name ? ` (by ${action.creator_name})` : ''}
                            </div>
                          )}
                          {action.assigned_to_agent && (
                            <div className="mt-3 bg-white dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-400">
                              👤 Assigned to: Agent{action.creator_name ? ` (by ${action.creator_name})` : ''}
                            </div>
                          )}
                        </div>

                        {action.status !== 'completed' && action.status !== 'cancelled' && (
                          <div className="flex flex-col gap-2">
                            {action.status === 'pending' && (
                              <button
                                onClick={() => onUpdateActionStatus(action.id, 'in_progress')}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 rounded transition-colors"
                              >
                                Start Session
                              </button>
                            )}
                            <button
                              onClick={() => onUpdateActionStatus(action.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded transition-colors"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => setRescheduleAction(action)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded transition-colors"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => onCancelSchedule(action.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Action Items ({actions.length})
            </h3>
            {actions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No actions yet</p>
            ) : (
              <div className="space-y-3">
                {actions.map((action: any) => (
                  <div key={action.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {action.title}
                          </h4>
                          <span className={`${getPriorityColor(action.priority)} text-white text-xs px-2 py-0.5 rounded`}>
                            {action.priority}
                          </span>
                          <span className={`${getStatusColor(action.status)} text-white text-xs px-2 py-0.5 rounded`}>
                            {action.status}
                          </span>
                        </div>
                        {action.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {action.description}
                          </p>
                        )}
                      </div>
                      {action.status !== 'completed' && action.status !== 'cancelled' && (
                        <div className="flex gap-2">
                          {action.status === 'pending' && (
                            <button
                              onClick={() => onUpdateActionStatus(action.id, 'in_progress')}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded transition-colors"
                            >
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => onUpdateActionStatus(action.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                          >
                            Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reschedule Modal */}
        {rescheduleAction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Reschedule Session</h2>
                </div>
                <button
                  onClick={() => setRescheduleAction(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-900 dark:text-blue-300">
                  <strong>📅 Rescheduling: {rescheduleAction.title}</strong>
                  <p className="mt-1 text-blue-700 dark:text-blue-400">
                    Select a new date and time for this session.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    New Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    New Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setRescheduleAction(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRescheduleSession(rescheduleAction.id, rescheduleData.date, rescheduleData.time);
                      setRescheduleAction(null);
                      setRescheduleData({ date: '', time: '' });
                    }}
                    disabled={!rescheduleData.date || !rescheduleData.time}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Form modals remain similar but simpler (no API calls needed)
function UpdateFormModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    update_title: '',
    update_content: '',
    hours_completed: 0,
    screen_sharing_hours: 0,
    progress_percentage: 0,
    blockers: [] as string[],
    next_steps: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Project Update</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Title *
            </label>
            <input
              type="text"
              required
              value={formData.update_title}
              onChange={(e) => setFormData({ ...formData, update_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Update Content *
            </label>
            <textarea
              required
              rows={4}
              value={formData.update_content}
              onChange={(e) => setFormData({ ...formData, update_content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours Completed
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.hours_completed}
                onChange={(e) => setFormData({ ...formData, hours_completed: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Screen Share Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.screen_sharing_hours}
                onChange={(e) => setFormData({ ...formData, screen_sharing_hours: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionFormModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action_type: 'task',
    assigned_to_candidate: false,
    assigned_to_agent: false,
    priority: 'medium' as ProjectActionPriority,
    status: 'pending' as ProjectActionStatus,
    platform: '',
    platform_url: '',
    scheduled_time: '',
    duration_minutes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format the data for submission
    const submitData: any = {
      ...formData,
      // Convert scheduled_time to ISO string if provided
      scheduled_time: formData.scheduled_time ? new Date(formData.scheduled_time).toISOString() : null,
      // Convert duration to number if provided
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Action Item</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action Type
              </label>
              <select
                value={formData.action_type}
                onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="task">Task</option>
                <option value="signup">Platform Signup</option>
                <option value="verification">Verification</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="screen_share">Screen Share Session</option>
                <option value="work_session">Work Session</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectActionPriority })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.assigned_to_candidate}
                onChange={(e) => setFormData({ ...formData, assigned_to_candidate: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Assign to Candidate</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.assigned_to_agent}
                onChange={(e) => setFormData({ ...formData, assigned_to_agent: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Assign to Agent</span>
            </label>
          </div>

          {/* Scheduling fields for screen share and work sessions */}
          {(formData.action_type === 'screen_share' || formData.action_type === 'work_session') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Session Scheduling
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    When should this session take place?
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="e.g., 60"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Expected session duration
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong className="text-blue-700 dark:text-blue-400">Note:</strong> {formData.action_type === 'screen_share'
                    ? 'The recipient will receive an email notification about this screen sharing request. Make sure both parties have screen sharing software ready.'
                    : 'The recipient will receive an email notification about this work session. Ensure both parties are available at the scheduled time.'}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Add Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectFormModal({ onClose, onSubmit, connectedCandidates, isLoading }: any) {
  const [formData, setFormData] = useState({
    candidate_id: '',
    candidate_name: '',
    candidate_email: '',
    title: '',
    description: '',
    platform: '',
    status: 'pending' as CandidateProjectStatus,
    budget: 0,
    tags: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Candidate *
            </label>
            {connectedCandidates && connectedCandidates.length > 0 ? (
              <select
                required
                value={formData.candidate_id}
                onChange={(e) => handleCandidateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a connected candidate...</option>
                {connectedCandidates.map((candidate: any) => (
                  <option key={candidate.candidateId} value={candidate.candidateId}>
                    {candidate.candidateName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                No connected candidates. Accept a service request to connect with candidates.
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Upwork, Freelancer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CandidateProjectStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg transition-colors ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-900 dark:text-blue-300">
            <strong>📅 Schedule a time for screen sharing session</strong>
            <p className="mt-1 text-blue-700 dark:text-blue-400">The other party will be notified via email and in-app notification.</p>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Select Date *
            </label>
            <input
              type="date"
              required
              min={today}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Select Time *
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    hourly_rate: project?.earnings?.hourly_rate || 0,
    payment_type: project?.earnings?.payment_type || 'one_time', // 'one_time' or 'percentage'
    percentage: project?.earnings?.percentage || 0,
    weekly_earned: project?.earnings?.weekly_earned || 0,
    hours_worked_this_week: project?.earnings?.hours_worked_this_week || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Calculate potential weekly earnings based on hourly rate and typical 40-hour week
  const calculatePotentialWeekly = () => {
    return formData.hourly_rate * 40;
  };

  // Calculate potential monthly earnings
  const calculatePotentialMonthly = () => {
    return calculatePotentialWeekly() * 4.33; // Average weeks per month
  };

  // Calculate actual earned this week
  const calculateActualEarned = () => {
    return formData.hourly_rate * formData.hours_worked_this_week;
  };

  // Calculate candidate's share if percentage model
  const calculateCandidateShare = () => {
    if (formData.payment_type === 'percentage' && formData.percentage > 0) {
      return formData.weekly_earned * (formData.percentage / 100);
    }
    return formData.weekly_earned;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm text-emerald-900 dark:text-emerald-300">
            <strong>💰 Set earnings for: {project?.title}</strong>
            <p className="mt-1 text-emerald-700 dark:text-emerald-400">
              Set hourly rate and payment structure. Update weekly earnings based on hours worked.
            </p>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Hourly Rate ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Enter hourly rate"
              />
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Payment Structure *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_type: 'one_time' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.payment_type === 'one_time'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white">One-Time Fee</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pay full hourly rate</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_type: 'percentage' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.payment_type === 'percentage'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Share</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Share percentage</div>
              </button>
            </div>
          </div>

          {/* Percentage if revenue share */}
          {formData.payment_type === 'percentage' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Candidate's Share (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Enter percentage"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
          )}

          {/* Weekly Earnings Section - For Agents to Update */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Earnings Update</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Hours Worked This Week
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.hours_worked_this_week}
                    onChange={(e) => setFormData({ ...formData, hours_worked_this_week: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Total Earned This Week ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weekly_earned}
                    onChange={(e) => setFormData({ ...formData, weekly_earned: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {formData.hours_worked_this_week > 0 && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Auto-calculated: </strong>${calculateActualEarned().toFixed(2)}
                  <span className="text-xs ml-2">({formData.hours_worked_this_week} hrs × ${formData.hourly_rate}/hr)</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {formData.hourly_rate > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Earnings Summary:</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span className="font-bold">${formData.hourly_rate.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Weekly (40 hrs):</span>
                  <span className="font-bold">${calculatePotentialWeekly().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Monthly:</span>
                  <span className="font-bold">${calculatePotentialMonthly().toFixed(2)}</span>
                </div>
                {formData.weekly_earned > 0 && (
                  <>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span className="font-semibold">Agent Earned This Week:</span>
                        <span className="font-bold">${formData.weekly_earned.toFixed(2)}</span>
                      </div>
                      {formData.payment_type === 'percentage' && (
                        <div className="flex justify-between text-teal-600 dark:text-teal-400 mt-1">
                          <span className="font-semibold">Candidate's Share ({formData.percentage}%):</span>
                          <span className="font-bold">${calculateCandidateShare().toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || formData.hourly_rate === 0}
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
