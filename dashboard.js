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
if (!logoutBtn) {
  console.warn('[MathWithMDU] dashboard logoutBtn missing - check dashboard.html');
}

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


logoutBtn?.addEventListener('click', () => signOut(auth));


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

    // Clear safely (no HTML parsing)
    lessonsList.replaceChildren();

    if (snapshot.empty) {
      const empty = document.createElement('p');
      empty.className = 'lesson-item';
      empty.textContent = 'No lessons available yet. Check back soon or upgrade your plan!';
      lessonsList.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'lesson-item';

      const titleEl = document.createElement('h4');
      titleEl.textContent = data.title || '';

      const metaEl = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `Grade ${data.grade} Term ${data.term} Week ${data.week}:`;
      metaEl.append(strong);
      metaEl.append(document.createTextNode(' ' + (data.topic || '')));

      const descEl = document.createElement('p');
      descEl.textContent = data.description || '';

      const a = document.createElement('a');
      a.className = 'download-btn';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.href = data.fileURL || '#';

      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-file-arrow-down mdu-icon';
      icon.setAttribute('aria-hidden', 'true');

      const text = document.createTextNode('Download Lesson');

      a.append(icon, text);

      item.append(titleEl, metaEl, descEl, a);
      frag.appendChild(item);
    });

    lessonsList.appendChild(frag);
  } catch (error) {
    lessonsList.replaceChildren();
    const err = document.createElement('p');
    err.className = 'lesson-item restricted';
    err.textContent = 'Error loading lessons. Try refreshing.';
    lessonsList.appendChild(err);
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

    papersList.replaceChildren();

    if (snapshot.empty) {
      const empty = document.createElement('p');
      empty.className = 'lesson-item';
      empty.textContent = 'No past papers available yet. Check back soon!';
      papersList.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'lesson-item';

      const titleEl = document.createElement('h4');
      titleEl.textContent = data.title || '';

      const metaEl = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `Grade ${data.grade}:`;
      metaEl.append(strong);
      metaEl.append(document.createTextNode(' ' + (data.topic || '')));

      const a = document.createElement('a');
      a.className = 'download-btn';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.href = data.fileURL || '#';

      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-file-arrow-down mdu-icon';
      icon.setAttribute('aria-hidden', 'true');

      const text = document.createTextNode('Download Paper');

      a.append(icon, text);

      item.append(titleEl, metaEl, a);
      frag.appendChild(item);
    });

    papersList.appendChild(frag);
  } catch (error) {
    papersList.replaceChildren();
    const err = document.createElement('p');
    err.className = 'lesson-item restricted';
    err.textContent = 'Error loading papers. Try refreshing.';
    papersList.appendChild(err);
    console.error('Papers error:', error);
  }
}

async function loadAnnouncements() {
  try {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    announcementsList.replaceChildren();

    if (snapshot.empty) {
      const empty = document.createElement('p');
      empty.textContent = 'No announcements yet. Check WhatsApp for updates!';
      announcementsList.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();

    snapshot.forEach(doc => {
      const data = doc.data();
      const item = document.createElement('div');
      item.className = 'lesson-item';

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

      frag.appendChild(item);
    });

    announcementsList.appendChild(frag);
  } catch (error) {
    announcementsList.replaceChildren();
    const err = document.createElement('p');
    err.textContent = 'Error loading announcements.';
    announcementsList.appendChild(err);
    console.error('Announcements error:', error);
  }
}

// Auth listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  try {
    showLoading();

    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    if (!lessonsList || !papersList || !announcementsList) {
      showAlert('Dashboard failed to load (missing UI elements).', 'error');
      return;
    }
  } catch (_) {
    // ignore
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


