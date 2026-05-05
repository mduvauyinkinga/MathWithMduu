import { app, auth, db } from './firebase.js';
import { 
  onAuthStateChanged, 
  signOut 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { showAlert, showLoading, hideLoading } from './utils.js'; // FIXED: Shared utils - removes local duplication


// Elements
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const planBadge = document.getElementById('planBadge');
const lessonsList = document.getElementById('lessonsList');
const papersList = document.getElementById('papersList');
const announcementsList = document.getElementById('announcementsList');
const loading = document.getElementById('loading');
const alertContainer = document.getElementById('alertContainer');

let currentUser = null;
let userPlan = 'trial';
const ADMIN_EMAIL = 'dnmduduzi@gmail.com';

// FIXED: Utils imported above - local functions removed


logoutBtn.addEventListener('click', () => signOut(auth));

// Load content
async function loadLessons() {
  try {
    let q;
    if (userPlan === 'trial') {
      // Fallback: try plan then isFree
      q = query(collection(db, 'lessons'), where('isFree', '==', true), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    lessonsList.innerHTML = '';

    if (snapshot.empty) {
      lessonsList.innerHTML = '<p class="lesson-item">No lessons available yet. Check back soon or upgrade your plan!</p>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'lesson-item';
      item.innerHTML = `
        <h4>${data.title}</h4>
        <p><strong>Grade ${data.grade} Term ${data.term} Week ${data.week}:</strong> ${data.topic}</p>
        <p>${data.description}</p>
        <a href="${data.fileURL}" class="download-btn" target="_blank">
          📥 Download Lesson
        </a>
      `;
      lessonsList.appendChild(item);
    });
  } catch (error) {
    lessonsList.innerHTML = '<p class="lesson-item restricted">Error loading lessons. Try refreshing.</p>';
    console.error('Lessons error:', error);
  }
}

async function loadPapers() {
  try {
    let q;
    if (userPlan === 'trial') {
      q = query(collection(db, 'past_papers'), where('isFree', '==', true), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'past_papers'), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    papersList.innerHTML = '';

    if (snapshot.empty) {
      papersList.innerHTML = '<p class="lesson-item">No past papers available yet. Check back soon!</p>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'lesson-item';
      item.innerHTML = `
        <h4>${data.title}</h4>
        <p><strong>Grade ${data.grade}:</strong> ${data.topic}</p>
        <a href="${data.fileURL}" class="download-btn" target="_blank">
          📥 Download Paper
        </a>
      `;
      papersList.appendChild(item);
    });
  } catch (error) {
    papersList.innerHTML = '<p class="lesson-item restricted">Error loading papers. Try refreshing.</p>';
    console.error('Papers error:', error);
  }
}

async function loadAnnouncements() {
  try {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    announcementsList.innerHTML = '';

    if (snapshot.empty) {
      announcementsList.innerHTML = '<p>No announcements yet. Check WhatsApp for updates!</p>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'lesson-item';
      item.innerHTML = `
        <h4>${data.message}</h4>
        ${data.meetingLink ? `<a href="${data.meetingLink}" class="download-btn" target="_blank">Join Meeting</a>` : ''}
      `;
      announcementsList.appendChild(item);
    });
  } catch (error) {
    announcementsList.innerHTML = '<p>Error loading announcements.</p>';
    console.error('Announcements error:', error);
  }
}

// Auth listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  showLoading();

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  userInfo.textContent = `Hi, ${user.email}`;
  
  // Get user doc
  const userDocRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    userPlan = userSnap.data().plan || 'trial';
  }

  planBadge.textContent = `Current Plan: ${userPlan.toUpperCase()}`;
  planBadge.style.background = userPlan === 'trial' ? '#fff3cd' : '#d4edda';

  // Admin check
  if (user.email === ADMIN_EMAIL) {
    planBadge.textContent += ' 👨‍🏫 ADMIN';
    planBadge.style.background = '#d1ecf1';
  }

  hideLoading();
  loadLessons();
  loadPapers();
  loadAnnouncements();
});

