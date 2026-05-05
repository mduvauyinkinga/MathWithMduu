import { app, auth, db } from './firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  addDoc,
  query,
  where 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { showAlert, showLoading, hideLoading, showModal, hideModal } from './utils.js'; // FIXED: Import shared utils - removes duplication

// DOM Elements
const registerBtn = document.getElementById('registerModalBtn');
const loginBtn = document.getElementById('loginBtn');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const dashboardLink = document.getElementById('dashboardLink');
const loading = document.getElementById('loading');
const alertContainer = document.getElementById('alertContainer');

let currentUser = null;
let userPlan = 'trial';


// Close modals
document.querySelectorAll('.close').forEach(close => {
  close.addEventListener('click', () => {
    hideModal('registerModal');
    hideModal('loginModal');
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    hideModal('registerModal');
    hideModal('loginModal');
  }
});

// Auth Functions
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();

  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const grade = document.getElementById('regGrade').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create user doc
    await setDoc(doc(db, 'users', uid), {
      name,
      email,
      grade,
      plan: 'trial',
      isPaid: false,
      trialUsed: false,
      createdAt: serverTimestamp()
    });

    showAlert('Trial account created! Welcome to MathWithMDU.', 'success');
    hideModal('registerModal');
    registerForm.reset();
    // User will be caught by auth listener
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    hideLoading();
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    hideModal('loginModal');
    loginForm.reset();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    hideLoading();
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

// Event Listeners
registerBtn.addEventListener('click', () => showModal('registerModal'));
loginBtn.addEventListener('click', () => showModal('loginModal'));

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const authBtns = document.querySelector('.auth-btns');

  if (user) {
    // Fetch user plan
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      userPlan = userDoc.data().plan || 'trial';
    }

    loginBtn.classList.add('hidden');
    registerBtn.style.display = 'none';
    logoutBtn.classList.remove('hidden');
    dashboardLink.classList.remove('hidden');
    dashboardLink.href = 'dashboard.html';
  } else {
    loginBtn.classList.remove('hidden');
    registerBtn.style.display = 'inline-block';
    logoutBtn.classList.add('hidden');
    dashboardLink.classList.add('hidden');
  }
});

// Add sample data on first load (dev only)
async function addSampleData() {
  const lessonsCol = collection(db, 'lessons');
  const papersCol = collection(db, 'past_papers');
  
  const lessonsSnap = await getDocs(query(lessonsCol, where('title', '==', 'Ratios Basics - Grade 10 Term 1')));
  if (lessonsSnap.empty) {
await addDoc(lessonsCol, {
      title: 'Ratios Basics - Grade 10 Term 1',
      grade: 10,
      term: 1,
      week: 1,
      topic: 'Ratios',
      description: 'Introduction to ratios, simplifying, dividing in ratio. Worked examples + practice.',
      fileURL: 'https://via.placeholder.com/300x400?text=Lesson+PDF', // Replace with real Storage URL
      isFree: true,
      plan: 'trial',
      createdAt: serverTimestamp()
    });

  }

  const papersSnap = await getDocs(query(papersCol, where('title', '==', 'Ratios Past Paper - Grade 10')));
  if (papersSnap.empty) {
await addDoc(papersCol, {
      title: 'Ratios Past Paper - Grade 10',
      grade: 10,
      topic: 'Ratios',
      linkedLessonId: 'sample-lesson', // ref later
      fileURL: 'https://via.placeholder.com/300x400?text=Past+Paper+PDF', // Replace
      isFree: true,
      plan: 'trial',
      createdAt: serverTimestamp()
    });

  }
}

// DEV ONLY: Add sample data - comment out for production
/*
addSampleData().catch(console.error);
*/

console.log('MathWithMDU App loaded - OPTIMIZED: Dev code commented, utils imported');


