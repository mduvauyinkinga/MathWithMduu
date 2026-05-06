import { app, auth, db, storage } from './firebase.js';
import { showAlert } from './utils.js'; // FIXED: Shared utils import
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword // FIXED: Added missing import
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';

const ADMIN_EMAIL = 'dnmduduzi@gmail.com';

const adminLogin = document.getElementById('adminLogin');
const adminSection = document.getElementById('adminSection');
const authSection = document.getElementById('authSection');
const logoutBtn = document.getElementById('logoutBtn');
const adminInfo = document.getElementById('adminInfo');

const lessonForm = document.getElementById('lessonForm');
const paperForm = document.getElementById('paperForm');
const uploadForm = document.getElementById('uploadForm');
const announceForm = document.getElementById('announceForm');

// FIXED: showAlert imported from utils.js - local duplicate removed


adminLogin.addEventListener('click', () => {
  const email = prompt('Admin Email:');
  const password = prompt('Password:');
  
  if (email === ADMIN_EMAIL) {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Listener will handle
      })
      .catch(err => showAlert(err.message, 'error'));
  } else {
    showAlert('Invalid admin email', 'error');
  }
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

lessonForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById('lessonTitle').value,
    grade: parseInt(document.getElementById('lessonGrade').value),
    term: parseInt(document.getElementById('lessonTerm').value),
    week: parseInt(document.getElementById('lessonWeek').value),
    topic: document.getElementById('lessonTopic').value,
    description: document.getElementById('lessonDesc').value,
    fileURL: document.getElementById('lessonURL').value,
    isFree: document.getElementById('lessonFree').checked,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'lessons'), data);
    showAlert('Lesson uploaded!');
    lessonForm.reset();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

paperForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById('paperTitle').value,
    grade: parseInt(document.getElementById('paperGrade').value),
    topic: document.getElementById('paperTopic').value,
    fileURL: document.getElementById('paperURL').value,
    isFree: document.getElementById('paperFree').checked,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'past_papers'), data);
    showAlert('Paper uploaded!');
    paperForm.reset();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

announceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    message: document.getElementById('announceMsg').value,
    grade: document.getElementById('announceGrade').value,
    meetingLink: document.getElementById('announceLink').value,
    isImportant: document.getElementById('announceImportant').checked,
    date: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'announcements'), data);
    showAlert('Announcement posted!');
    announceForm.reset();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const file = document.getElementById('fileInput').files[0];
  const title = document.getElementById('fileTitle').value;
  const fileName = `uploads/${Date.now()}_${file.name}`;
  
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    showAlert('Admin access required', 'error');
    return;
  }

  const storageRef = ref(storage, fileName);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    },
    (error) => {
      showAlert('Upload failed: ' + error.message, 'error');
    },
    async () => {
      const url = await getDownloadURL(storageRef);
      
      // Save metadata to Firestore /uploads/{filename}
      await setDoc(doc(db, 'uploads', file.name), {
        title,
        fileName: file.name,
        downloadURL: url,
        uploadedBy: auth.currentUser.email,
        uploadedAt: serverTimestamp(),
        size: file.size
      });
      
      showAlert('File uploaded successfully!');
      uploadForm.reset();
    }
  );
});

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    adminInfo.textContent = `Logged in: ${user.email}`;
    authSection.classList.add('hidden');
    adminSection.classList.remove('hidden');
  } else if (user) {
    window.location.href = 'dashboard.html';
  } else {
    authSection.classList.remove('hidden');
    adminSection.classList.add('hidden');
  }
});

