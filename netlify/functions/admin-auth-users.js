const admin = require('firebase-admin');

const ADMIN_EMAILS = new Set([
  'criesemail123@gmail.com',
  'jaryn.b.healey@gmail.com',
]);

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return null;
}

function getAdminApp() {
  if (admin.apps.length) {
    return admin.apps[0];
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error('Firebase Admin service account is not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_PROJECT_ID, in Netlify environment variables.');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function listAllUsers(auth, nextPageToken, users = []) {
  const result = await auth.listUsers(1000, nextPageToken);
  const nextUsers = users.concat(result.users);

  if (result.pageToken) {
    return listAllUsers(auth, result.pageToken, nextUsers);
  }

  return nextUsers;
}

exports.handler = async (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing Firebase ID token.' }),
      };
    }

    const app = getAdminApp();
    const auth = admin.auth(app);
    const decodedToken = await auth.verifyIdToken(token);
    const callerEmail = decodedToken.email?.toLowerCase();

    if (!callerEmail || !ADMIN_EMAILS.has(callerEmail)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Admin access required.' }),
      };
    }

    const users = await listAllUsers(auth);

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
      body: JSON.stringify({
        users: users.map((user) => ({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          disabled: user.disabled,
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
          providerIds: user.providerData.map((provider) => provider.providerId),
        })),
      }),
    };
  } catch (error) {
    console.error('Failed to list Firebase Auth users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to list Firebase Auth users.',
      }),
    };
  }
};
