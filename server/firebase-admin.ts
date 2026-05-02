// Firebase Admin SDK configuration for server-side operations
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK if not already initialized
let adminApp: any = null;
let isFirebaseAdminInitialized = false;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      // Check if Firebase service account key is available
      const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKeyString) {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Firebase Admin features will be disabled.');
        return false;
      }

      // Parse the service account key from environment variable
      let serviceAccountKey;
      try {
        serviceAccountKey = JSON.parse(serviceAccountKeyString);
      } catch (parseError) {
        console.error('Error parsing Firebase service account key JSON:', parseError);
        return false;
      }
      
      adminApp = initializeApp({
        credential: cert(serviceAccountKey),
        projectId: serviceAccountKey.project_id
      });
      
      isFirebaseAdminInitialized = true;
      console.log('Firebase Admin SDK initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      return false;
    }
  } else {
    adminApp = getApps()[0];
    isFirebaseAdminInitialized = true;
    return true;
  }
}

// Attempt to initialize Firebase Admin on module load
initializeFirebaseAdmin();

// Get Firebase Admin Auth instance
export const adminAuth = isFirebaseAdminInitialized ? getAuth(adminApp) : null;

// Verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  if (!isFirebaseAdminInitialized || !adminAuth) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// Create custom token for user
export async function createCustomToken(uid: string) {
  if (!isFirebaseAdminInitialized || !adminAuth) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  
  try {
    const customToken = await adminAuth.createCustomToken(uid);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

export { isFirebaseAdminInitialized };

export default adminApp;