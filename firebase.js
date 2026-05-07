import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';

// Firebase configuration
// SECURITY: avoid hard-coding config values in frontend source.
// Expected runtime injection:
//   window.__ENV__ = { firebaseConfig: { ... } }
// If missing, fail closed with a clear error.
const firebaseConfig = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.firebaseConfig)
  ? window.__ENV__.firebaseConfig
  : {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: ''
    };

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error('[MathWithMDU] Missing firebaseConfig. Inject window.__ENV__.firebaseConfig at runtime.');
}


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

