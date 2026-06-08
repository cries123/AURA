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

async function loadFirebaseConfig(): Promise<FirebaseRuntimeConfig | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const response = await fetch('/.netlify/functions/firebase-config', {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
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
