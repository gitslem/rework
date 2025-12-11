import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  addDoc,
  increment,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseFirestore } from './config';
import { Profile, ServiceRequest, Review, Message, Notification } from '@/types';

// ============ PROFILES ============

export const getProfile = async (uid: string): Promise<Profile | null> => {
  try {
    const db = getFirebaseFirestore();
    const profileDoc = await getDoc(doc(db, 'profiles', uid));
    if (profileDoc.exists()) {
      return { ...profileDoc.data(), uid: profileDoc.id } as Profile;
    }
    return null;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
};

export const updateProfile = async (uid: string, data: Partial<Profile>): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'profiles', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const getAgents = async (filters?: {
  platform?: string;
  minRating?: number;
  maxPrice?: number;
}): Promise<Profile[]> => {
  try {
    const db = getFirebaseFirestore();
    const constraints: QueryConstraint[] = [
      where('isAgentApproved', '==', true),
      where('agentVerificationStatus', '==', 'verified'),
      orderBy('agentSuccessRate', 'desc'),
      limit(50)
    ];

    if (filters?.platform) {
      constraints.push(where('agentServices', 'array-contains', filters.platform));
    }

    if (filters?.minRating) {
      constraints.push(where('averageRating', '>=', filters.minRating));
    }

    const q = query(collection(db, 'profiles'), ...constraints);
    const querySnapshot = await getDocs(q);

    const agents: Profile[] = [];
    querySnapshot.forEach((doc) => {
      agents.push({ ...doc.data(), uid: doc.id } as Profile);
    });

    return agents;
  } catch (error) {
    console.error('Get agents error:', error);
    return [];
  }
};

// ============ SERVICE REQUESTS ============

export const createServiceRequest = async (data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const db = getFirebaseFirestore();
    const docRef = await addDoc(collection(db, 'serviceRequests'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Create service request error:', error);
    throw error;
  }
};

export const getServiceRequest = async (id: string): Promise<ServiceRequest | null> => {
  try {
    const db = getFirebaseFirestore();
    const docSnap = await getDoc(doc(db, 'serviceRequests', id));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as ServiceRequest;
    }
    return null;
  } catch (error) {
    console.error('Get service request error:', error);
    return null;
  }
};

export const updateServiceRequest = async (id: string, data: Partial<ServiceRequest>): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'serviceRequests', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update service request error:', error);
    throw error;
  }
};

export const getServiceRequestsByUser = async (uid: string, role: 'candidate' | 'agent'): Promise<ServiceRequest[]> => {
  try {
    const db = getFirebaseFirestore();
    const field = role === 'candidate' ? 'candidateId' : 'agentId';
    const q = query(
      collection(db, 'serviceRequests'),
      where(field, '==', uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const requests: ServiceRequest[] = [];
    querySnapshot.forEach((doc) => {
      requests.push({ ...doc.data(), id: doc.id } as ServiceRequest);
    });

    return requests;
  } catch (error) {
    console.error('Get service requests error:', error);
    return [];
  }
};

// ============ MESSAGES ============

export const sendMessage = async (data: Omit<Message, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const db = getFirebaseFirestore();
    const docRef = await addDoc(collection(db, 'messages'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

export const getConversation = async (conversationId: string): Promise<Message[]> => {
  try {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ ...doc.data(), id: doc.id } as Message);
    });

    return messages;
  } catch (error) {
    console.error('Get conversation error:', error);
    return [];
  }
};

export const subscribeToConversation = (
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ ...doc.data(), id: doc.id } as Message);
    });
    callback(messages);
  });
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'messages', messageId), {
      isRead: true,
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
  }
};

export const saveMessage = async (messageId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'messages', messageId), {
      saved: true,
    });
  } catch (error) {
    console.error('Save message error:', error);
    throw error;
  }
};

export const unsaveMessage = async (messageId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'messages', messageId), {
      saved: false,
    });
  } catch (error) {
    console.error('Unsave message error:', error);
    throw error;
  }
};

export const deleteUnsavedMessages = async (userId: string, daysOld: number = 30): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Query unsaved messages older than cutoff date
    const messagesQuery = query(
      collection(db, 'messages'),
      where('recipientId', '==', userId),
      where('saved', '==', false),
      where('createdAt', '<', Timestamp.fromDate(cutoffDate))
    );

    const snapshot = await getDocs(messagesQuery);

    // Delete each message
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(`Deleted ${snapshot.size} unsaved messages older than ${daysOld} days`);
  } catch (error) {
    console.error('Delete unsaved messages error:', error);
    throw error;
  }
};

export const getUserConversations = async (uid: string): Promise<string[]> => {
  try {
    const db = getFirebaseFirestore();
    // Get all conversations where user is sender or recipient
    const q1 = query(collection(db, 'messages'), where('senderId', '==', uid));
    const q2 = query(collection(db, 'messages'), where('recipientId', '==', uid));

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const conversationIds = new Set<string>();
    snapshot1.forEach((doc) => conversationIds.add(doc.data().conversationId));
    snapshot2.forEach((doc) => conversationIds.add(doc.data().conversationId));

    return Array.from(conversationIds);
  } catch (error) {
    console.error('Get user conversations error:', error);
    return [];
  }
};

// ============ REVIEWS ============

export const createReview = async (data: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const db = getFirebaseFirestore();
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...data,
      createdAt: serverTimestamp(),
    });

    // Update reviewee's average rating
    await updateRevieweeRating(data.revieweeId);

    return docRef.id;
  } catch (error) {
    console.error('Create review error:', error);
    throw error;
  }
};

export const getReviewsForUser = async (uid: string): Promise<Review[]> => {
  try {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      reviews.push({ ...doc.data(), id: doc.id } as Review);
    });

    return reviews;
  } catch (error) {
    console.error('Get reviews error:', error);
    return [];
  }
};

const updateRevieweeRating = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const reviews = await getReviewsForUser(uid);
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await updateDoc(doc(db, 'profiles', uid), {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Update reviewee rating error:', error);
  }
};

// ============ NOTIFICATIONS ============

export const createNotification = async (data: Omit<Notification, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const db = getFirebaseFirestore();
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export const getUserNotifications = async (uid: string): Promise<Notification[]> => {
  try {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ ...doc.data(), id: doc.id } as Notification);
    });

    return notifications;
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
  }
};

export const subscribeToNotifications = (
  uid: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe => {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      console.log('🔔 Firestore onSnapshot triggered! Docs:', querySnapshot.size);
      const notifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        console.log('📄 Notification doc:', doc.id, doc.data());
        notifications.push({ ...doc.data(), id: doc.id } as Notification);
      });
      callback(notifications);
    },
    (error) => {
      console.error('❌ Notification subscription error:', error);
    }
  );
};

// ============ ADMIN ============

export const getPendingUsers = async (role: 'candidate' | 'agent'): Promise<any[]> => {
  try {
    const db = getFirebaseFirestore();
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      where(role === 'candidate' ? 'isCandidateApproved' : 'isAgentApproved', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const users: any[] = [];

    for (const userDoc of querySnapshot.docs) {
      const userData = userDoc.data();
      const profileDoc = await getDoc(doc(db, 'profiles', userDoc.id));
      const profileData = profileDoc.exists() ? profileDoc.data() : {};

      users.push({
        ...userData,
        ...profileData,
        uid: userDoc.id,
      });
    }

    return users;
  } catch (error) {
    console.error('Get pending users error:', error);
    return [];
  }
};

export const approveUser = async (uid: string, role: 'candidate' | 'agent'): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (role === 'candidate') {
      await updateDoc(doc(db, 'users', uid), {
        isCandidateApproved: true,
        candidateApprovedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'profiles', uid), {
        isAgentApproved: true,
        agentVerificationStatus: 'verified',
        agentVerifiedAt: serverTimestamp(),
      });
    }

    // Send notification
    await createNotification({
      userId: uid,
      title: 'Account Approved!',
      message: `Your ${role} account has been approved. You can now access all features.`,
      type: 'success',
      isRead: false,
    });
  } catch (error) {
    console.error('Approve user error:', error);
    throw error;
  }
};

export const rejectUser = async (uid: string, role: 'candidate' | 'agent', reason: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (role === 'agent') {
      await updateDoc(doc(db, 'profiles', uid), {
        agentVerificationStatus: 'rejected',
      });
    }

    // Send notification
    await createNotification({
      userId: uid,
      title: 'Account Not Approved',
      message: `Your ${role} application was not approved. Reason: ${reason}`,
      type: 'error',
      isRead: false,
    });
  } catch (error) {
    console.error('Reject user error:', error);
    throw error;
  }
};
