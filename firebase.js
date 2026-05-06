import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJyh2rEHrp461pdUCVapZ81-YWyv9di38",
  authDomain: "mathwithmdu.firebaseapp.com",
  projectId: "mathwithmdu",
  storageBucket: "mathwithmdu.appspot.com",
  messagingSenderId: "23891407297",
  appId: "1:23891407297:web:c19e0b87025c3f51c0bf40",
  measurementId: "G-0414TYTBRK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

