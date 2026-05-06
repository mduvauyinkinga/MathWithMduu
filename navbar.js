// Modern Navbar JS - Mobile Toggle + Scroll Effects
// Production fixes:
// 1) Bind listeners for ALL desktop+mobile .nav-links blocks (multiple exist per page).
// 2) Guard missing elements to avoid runtime crashes on pages with different navbar variants.
// 3) Ensure overlay + ESC + link clicks reliably close the mobile menu.
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navbar = document.querySelector('.navbar');
  const menuOverlay = document.querySelector('.menu-overlay');

  // If navbar/hamburger isn't present on this page, do nothing.
  if (!hamburger || !mobileMenu || !navbar) return;

  // Improve accessibility semantics at runtime (no layout/style changes).
  // Keeps behavior identical while preventing hidden accessibility warnings.
  if (!hamburger.hasAttribute('aria-controls')) {
    // Use the first mobile menu id if present, otherwise create a stable id.
    const existingId = mobileMenu.getAttribute('id');
    const controlsId = existingId || 'mobileMenu';
    if (!existingId) mobileMenu.setAttribute('id', controlsId);
    hamburger.setAttribute('aria-controls', controlsId);
  }
  if (!hamburger.hasAttribute('aria-expanded')) hamburger.setAttribute('aria-expanded', 'false');

  // Toggle mobile menu
  const openMenu = () => {
    mobileMenu.classList.add('active');
    hamburger.classList.add('active');
    navbar.classList.add('menu-open');
    if (menuOverlay) menuOverlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('active');
    hamburger.classList.remove('active');
    navbar.classList.remove('menu-open');
    if (menuOverlay) menuOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('active');
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Close on link click.
  // IMPORTANT: there can be multiple .nav-links blocks (desktop + mobile).
  // This handler ONLY closes the menu; it must NOT perform any hash/scroll logic.
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', (e) => {
      // If link uses a hash (e.g., #contact), do not run any extra JS that could
      // accidentally match/activate the wrong section. We only close the menu.
      // (Design/behavior preserved.)
      closeMenu();
    });
  });


  // Close on overlay click
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  // Scroll effect for sticky glow
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 50) {
      navbar.style.boxShadow = '0 10px 40px rgba(0, 150, 255, 0.3)';
    } else {
      navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
    }
  });

  // Keyboard support (ESC)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMenu();
    }
  });
});

