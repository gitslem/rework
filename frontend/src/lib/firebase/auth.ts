import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseFirestore, isFirebaseConfigured } from './config';
import { User, UserRole } from '@/types';

// Detect if user is on mobile device
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if popup was blocked
const wasPopupBlocked = (popup: Window | null): boolean => {
  if (!popup) return true;
  if (popup.closed) return true;
  try {
    if (!popup.window) return true;
  } catch (e) {
    return true;
  }
  return false;
};

export const registerWithEmail = async (
  email: string,
  password: string,
  role: UserRole,
  firstName: string,
  lastName: string
): Promise<User> => {
  try {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please contact support.');
    }

    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Send verification email
    try {
      await sendEmailVerification(firebaseUser);
    } catch (emailError) {
      console.warn('Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails
    }

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

    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to register. Please try again.');
    }
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

export const signInWithGoogle = async (role: UserRole, useRedirect: boolean = false): Promise<User> => {
  try {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please contact support.');
    }

    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    let firebaseUser: FirebaseUser;

    // Check environment variable for redirect mode
    const envUseRedirect = typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_USE_AUTH_REDIRECT === 'true';

    console.log('OAuth Config:', {
      useRedirect,
      envUseRedirect,
      isMobile: isMobileDevice(),
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    });

    // Use redirect mode if:
    // 1. Environment variable is set to true (for custom domain)
    // 2. OR explicitly requested via parameter
    // 3. OR on mobile device
    const shouldUseRedirect = envUseRedirect || useRedirect || isMobileDevice();

    if (shouldUseRedirect) {
      console.log('Using REDIRECT mode for OAuth');
      // Store the role in session storage for after redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingRole', role);
        console.log('Stored pendingRole in sessionStorage:', role);
      }
      await signInWithRedirect(auth, provider);
      // The page will reload, so we throw to prevent further execution
      throw new Error('REDIRECT_IN_PROGRESS');
    }

    // Try popup first for desktop browsers
    try {
      const userCredential = await signInWithPopup(auth, provider);
      firebaseUser = userCredential.user;
    } catch (popupError: any) {
      // If popup was blocked or failed, fallback to redirect
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        // Store the role and try redirect instead
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingRole', role);
        }
        await signInWithRedirect(auth, provider);
        throw new Error('REDIRECT_IN_PROGRESS');
      }
      throw popupError;
    }

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

    // Don't show error for redirect in progress
    if (error.message === 'REDIRECT_IN_PROGRESS') {
      throw error;
    }

    // Provide user-friendly error messages
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups and try again, or we\'ll redirect you instead.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in was cancelled. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please wait a moment and try again.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to sign in with Google. Please try again.');
    }
  }
};

// Handle redirect result after OAuth redirect
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    console.log('=== handleRedirectResult called ===');
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
    console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

    if (!isFirebaseConfigured) {
      console.log('Firebase not configured, returning null');
      return null;
    }

    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    console.log('Getting redirect result from Firebase...');
    console.log('Current auth state before getRedirectResult:', auth.currentUser?.email || 'No user');

    const result = await getRedirectResult(auth);
    console.log('Redirect result:', result ? 'Found' : 'None');

    if (result) {
      console.log('Result details:', {
        hasUser: !!result.user,
        userEmail: result.user?.email,
        providerId: result.providerId,
        operationType: result.operationType
      });
    }

    if (!result || !result.user) {
      console.log('No redirect result or user');
      // Check if user is already signed in (might have completed redirect earlier)
      if (auth.currentUser) {
        console.log('But auth.currentUser exists:', auth.currentUser.email);
        console.log('This might be a page reload after successful sign-in');
      }
      return null;
    }

    const firebaseUser = result.user;
    console.log('Redirect user found:', firebaseUser.email, 'UID:', firebaseUser.uid);

    // Get the pending role from session storage
    const pendingRole = (typeof window !== 'undefined' ? sessionStorage.getItem('pendingRole') : null) as UserRole || 'candidate';
    console.log('Pending role from sessionStorage:', pendingRole);

    if (!pendingRole && typeof window !== 'undefined') {
      console.warn('WARNING: No pending role found in sessionStorage, defaulting to candidate');
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingRole');
    }

    // Check if user already exists
    console.log('Checking if user exists in Firestore...');
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    console.log('User exists:', userDoc.exists());

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      console.log('Returning existing user:', userData.email, 'Role:', userData.role);
      return userData;
    }

    // Create new user (same logic as signInWithGoogle)
    console.log('Creating new user in Firestore...');
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role: pendingRole,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      isActive: true,
      isVerified: firebaseUser.emailVerified,
      isCandidateApproved: false, // Changed: All new users need approval
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    console.log('User created in users collection');

    const profileData = {
      uid: firebaseUser.uid,
      firstName: '',
      lastName: '',
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
    console.log('Profile created with empty firstName/lastName');
    console.log('Returning new user:', userData.email, 'Role:', userData.role);

    return userData;
  } catch (error: any) {
    console.error('=== Redirect result error ===', error);
    return null;
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
