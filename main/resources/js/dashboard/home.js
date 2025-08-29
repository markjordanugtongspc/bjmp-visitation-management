// Sidebar toggle logic for dashboard
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('[data-sidebar-toggle]');
  const aside = document.querySelector('[data-sidebar]');
  const overlay = document.querySelector('[data-sidebar-overlay]');
  const nav = document.querySelector('[data-sidebar-nav]');
  if (!btn || !aside || !overlay) return;

  const open = () => {
    aside.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  };
  const close = () => {
    aside.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  };

  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Close sidebar on nav click (mobile only)
  if (nav) {
    nav.addEventListener('click', (e) => {
      const isLink = (e.target instanceof Element) && e.target.closest('a');
      if (isLink && window.innerWidth < 640) {
        close();
      }
    });
  }
});


