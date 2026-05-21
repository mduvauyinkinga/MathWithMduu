import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

// This file is loaded as an ES module on every page that needs the navbar.

function initNavbar() {
  // Support both older and newer navbar markup (only some pages contain both).
  const navLinks = document.querySelector('#navLinks');
  const menuToggle = document.querySelector('#menuToggle');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

    document.querySelectorAll('#navLinks a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  } else {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuOverlay = document.querySelector('.menu-overlay');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        menuOverlay?.classList.toggle('active');
      });

      document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('active');
          hamburger.classList.remove('active');
          menuOverlay?.classList.remove('active');
        });
      });

      menuOverlay?.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
        menuOverlay?.classList.remove('active');
      });
    }
  }

  initAuthListener();
  setActiveLink();
}

function initAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    const authSection = document.querySelector('#authSection');

    if (!user) {
      updateNavbarLoggedOut(authSection);
      return;
    }

    // Fetch role if available; default to user.
    let role = 'user';
    let displayName = user.email;

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        role = snap.data().role || 'user';
        displayName = snap.data().name || user.email;
      }
    } catch (err) {
      console.error('[MathWithMDU] Role fetch error:', err);
    }

    updateNavbarLoggedIn(authSection, displayName, role);
  });
}

function updateNavbarLoggedIn(authSection, name, role) {
  // If this page uses authSection placeholder, render there.
  if (authSection) {
    // Build DOM nodes to avoid innerHTML injection.
    // Ensure we don't rely on broken legacy escapeHtml().
    const userInfo = document.createElement('div');

    userInfo.className = 'user-info';

    const glow = document.createElement('span');
    glow.className = 'glow-text';
    glow.textContent = '👤 ' + String(name ?? '');

    const badge = document.createElement('span');
    badge.className = 'role-badge';
    badge.textContent = String(role ?? 'user').toUpperCase();

    const btn = document.createElement('button');
    btn.id = 'logoutBtn';
    btn.className = 'nav-btn';
    btn.type = 'button';
    btn.textContent = 'Logout';

    userInfo.append(glow, badge, btn);
    authSection.replaceChildren(userInfo);

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      }).catch(err => console.error('[MathWithMDU] logout error', err));
    });
  }

  // Also support pages that have fixed buttons.
  document.querySelectorAll('#loginBtn').forEach(b => b.classList.add('hidden'));
  document.querySelectorAll('#registerBtn').forEach(b => b.classList.add('hidden'));
  document.querySelectorAll('#adminBtn').forEach(b => b.classList.toggle('hidden', role !== 'admin'));
  document.querySelectorAll('#logoutBtn').forEach(b => b.classList.remove('hidden'));
  document.querySelectorAll('#dashboardLink').forEach(b => b.classList.remove('hidden'));


  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = role === 'admin' ? 'block' : 'none';
  });
}


function updateNavbarLoggedOut(authSection) {
  if (authSection) {
    authSection.replaceChildren();
    authSection.innerHTML = `
      <a href="login.html" class="nav-btn">Login</a>
      <a href="signup.html" class="nav-btn highlight">Sign Up</a>
    `;
  }

  document.querySelectorAll('#loginBtn').forEach(b => b.classList.remove('hidden'));
  document.querySelectorAll('#registerBtn').forEach(b => b.classList.remove('hidden'));
  document.querySelectorAll('#adminBtn').forEach(b => b.classList.add('hidden'));
  document.querySelectorAll('#logoutBtn').forEach(b => b.classList.add('hidden'));
  document.querySelectorAll('#dashboardLink').forEach(b => b.classList.add('hidden'));

  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = 'none';
  });
}


function setActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const scope = document.querySelector('.navbar') || document;
  scope.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;

    // Highlight only exact page matches.
    if (href === currentPage || (href === 'index.html' && currentPage === '')) {
      a.classList.add('active-link');
    }

    // If href contains anchors like index.html#home, also handle.
    if (href.startsWith('index.html') && currentPage === 'index.html') {
      // do not force active-link on every index anchor; dashboard.html does its own.
    }
  });
}

function escapeHtml(value) {
  // Correct HTML escaping (legacy use).
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', initNavbar);

