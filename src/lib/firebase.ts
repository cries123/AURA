import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseRuntimeConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  databaseId?: string;
};

let appInstance: FirebaseApp | null = null;
export let db: Firestore | null = null;
export let auth: Auth | null = null;

function hasRequiredConfig(config: FirebaseRuntimeConfig | null): config is FirebaseRuntimeConfig {
  return Boolean(config?.apiKey && config.authDomain && config.projectId && config.appId);
}

function loadFirebaseConfigFromEnv(): FirebaseRuntimeConfig | null {
  if (!import.meta.env.DEV) {
    return null;
  }

  const config: FirebaseRuntimeConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '',
  };

  return hasRequiredConfig(config) ? config : null;
}

async function loadFirebaseConfig(): Promise<FirebaseRuntimeConfig | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const envConfig = loadFirebaseConfigFromEnv();
  if (envConfig) {
    return envConfig;
  }

  try {
    const response = await fetch('/.netlify/functions/firebase-config', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    const remoteConfig = await response.json();
    return hasRequiredConfig(remoteConfig) ? remoteConfig : null;
  } catch (err) {
    console.warn('Firebase runtime config unavailable. Database features may be disabled.', err);
    return null;
  }
}

export const firebaseReady = loadFirebaseConfig().then((firebaseConfig) => {
  if (!hasRequiredConfig(firebaseConfig)) {
    console.warn('Firebase runtime config is missing or incomplete. Database features may be disabled.');
    return;
  }

  try {
    appInstance = initializeApp(firebaseConfig);
    db = firebaseConfig.databaseId
      ? getFirestore(appInstance, firebaseConfig.databaseId)
      : getFirestore(appInstance);
    auth = getAuth(appInstance);
  } catch (err) {
    console.error('Failed to initialize Firebase services:', err);
  }
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
