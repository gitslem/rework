import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore } from './config';
import { User, UserRole } from '@/types';

export const registerWithEmail = async (
  email: string,
  password: string,
  role: UserRole,
  firstName: string,
  lastName: string
): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Send verification email
    await sendEmailVerification(firebaseUser);

    // Create user document in Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role,
      displayName: `${firstName} ${lastName}`,
      photoURL: firebaseUser.photoURL || undefined,
      isActive: true,
      isVerified: false,
      isCandidateApproved: role === 'agent', // Auto-approve agents for now
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // Create profile document
    const profileData = {
      uid: firebaseUser.uid,
      firstName,
      lastName,
      bio: '',
      location: '',
      phone: '',
      website: '',
      linkedin: '',
      totalEarnings: 0,
      completedProjects: 0,
      averageRating: 0,
      totalReviews: 0,
      isAgentApproved: false,
      agentServices: [],
      agentSuccessRate: 0,
      agentTotalClients: 0,
      agentVerificationStatus: 'pending',
      agentPricing: {},
      agentPortfolio: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'profiles', firebaseUser.uid), profileData);

    return userData;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register');
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const signInWithGoogle = async (role: UserRole): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Check if user already exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    // Create new user
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      isActive: true,
      isVerified: firebaseUser.emailVerified,
      isCandidateApproved: role === 'agent',
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // Create basic profile without firstName/lastName
    // This ensures candidates will be directed to complete-profile page
    // Agents will fill this in during agent-signup
    const profileData = {
      uid: firebaseUser.uid,
      firstName: '', // Empty so users complete their profile
      lastName: '', // Empty so users complete their profile
      bio: '',
      avatarURL: firebaseUser.photoURL || '',
      location: '',
      phone: '',
      website: '',
      linkedin: '',
      totalEarnings: 0,
      completedProjects: 0,
      averageRating: 0,
      totalReviews: 0,
      isAgentApproved: false,
      agentServices: [],
      agentSuccessRate: 0,
      agentTotalClients: 0,
      agentVerificationStatus: 'pending',
      agentPricing: {},
      agentPortfolio: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'profiles', firebaseUser.uid), profileData);

    return userData;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const db = getFirebaseFirestore();
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};
