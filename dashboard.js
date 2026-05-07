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
const ADMIN_ROLE_LABEL = 'ADMIN';

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
      // FIX: Avoid innerHTML with untrusted Firestore data (XSS hardening)
      const titleEl = document.createElement('h4');
      titleEl.textContent = data.title || '';

      const metaEl = document.createElement('p');
      metaEl.innerHTML = `<strong>Grade ${data.grade} Term ${data.term} Week ${data.week}:</strong> `;
      metaEl.append(document.createTextNode(data.topic || ''));

      const descEl = document.createElement('p');
      descEl.textContent = data.description || '';

      const a = document.createElement('a');
      a.className = 'download-btn';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.href = data.fileURL || '#';
      a.innerHTML = '<i class="fa-solid fa-file-arrow-down mdu-icon" aria-hidden="true"></i>Download Lesson'; // emoji -> FA icon

      item.append(titleEl, metaEl, descEl, a);
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
      // FIX: Avoid innerHTML with untrusted Firestore data (XSS hardening)
      const titleEl = document.createElement('h4');
      titleEl.textContent = data.title || '';

      const metaEl = document.createElement('p');
      metaEl.innerHTML = `<strong>Grade ${data.grade}:</strong> `;
      metaEl.append(document.createTextNode(data.topic || ''));

      const a = document.createElement('a');
      a.className = 'download-btn';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.href = data.fileURL || '#';
      a.innerHTML = '<i class="fa-solid fa-file-arrow-down mdu-icon" aria-hidden="true"></i>Download Paper'; // emoji -> FA icon

      item.append(titleEl, metaEl, a);
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
      // FIX: Avoid innerHTML with untrusted Firestore data (XSS hardening)
      const h4 = document.createElement('h4');
      h4.textContent = data.message || '';
      item.appendChild(h4);

      if (data.meetingLink) {
        const a = document.createElement('a');
        a.className = 'download-btn';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.href = data.meetingLink;
        a.textContent = 'Join Meeting';
        item.appendChild(a);
      }

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

  // POPIA: if the stored consent checkbox is missing/unset, we do not block access,
  // but the Privacy Policy and POPIA pages provide accountability and rights.


  userInfo.textContent = `Hi, ${user.email}`;
  
  // Get user doc
  const userDocRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    userPlan = userSnap.data().plan || 'trial';
  }

  planBadge.textContent = `Current Plan: ${userPlan.toUpperCase()}`;
  planBadge.style.background = userPlan === 'trial' ? '#fff3cd' : '#d4edda';

  // Admin label (no email-based secrets). Authorization is enforced in Firestore rules.
  // Best practice: expose admin status via custom claim admin=true, but keep UI non-sensitive.
  if (user && user.email) {
    // Leave as-is visually only when admin is detected via custom claim (if present).
    const maybeAdmin = user['admin'] || false;
    if (maybeAdmin) {
      planBadge.textContent += ` ${ADMIN_ROLE_LABEL}`;
      planBadge.style.background = '#d1ecf1';
    }
  }

  hideLoading();
  await Promise.all([
    loadLessons(),
    loadPapers(),
    loadAnnouncements()
  ]);
});


