import admin from 'firebase-admin';

// Prevent multiple initializations
if (!admin.apps.length) {
  try {
    // Get credentials from environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // Handle newlines in private key (convert \n string to actual newlines)
      const processedKey = privateKey.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: processedKey,
        }),
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️ Firebase Admin credentials not found in environment variables');
      console.warn('   Make sure these are set in your .env file:');
      console.warn('   - FIREBASE_PROJECT_ID');
      console.warn('   - FIREBASE_CLIENT_EMAIL');
      console.warn('   - FIREBASE_PRIVATE_KEY');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

/**
 * Verify a Firebase ID token
 */
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

/**
 * Get user by Firebase UID
 */
export async function getFirebaseUser(uid: string): Promise<admin.auth.UserRecord | null> {
  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    console.error('Error getting Firebase user:', error);
    return null;
  }
}

/**
 * Revoke all refresh tokens for a user (for logout)
 */
export async function revokeUserTokens(uid: string): Promise<boolean> {
  try {
    await admin.auth().revokeRefreshTokens(uid);
    return true;
  } catch (error) {
    console.error('Error revoking tokens:', error);
    return false;
  }
}

export default admin;