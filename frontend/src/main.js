import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/responsive.css';

import { initRouter } from './utils/router.js';
import Landing from './modules/landing.js';
import Workspace from './modules/workspace.js';
import Reports from './modules/reports.js';
import Settings from './modules/settings.js';

import Tenders from './modules/tenders.js';

const routes = {
  '#/landing':   Landing,
  '#/workspace': Workspace,
  '#/reports':   Reports,
  '#/settings':  Settings,
  '#/tenders':   Tenders,     // NEW
};


function bindDrawerOnce() {
  const app      = document.querySelector('.app');
  const toggle   = document.getElementById('navToggle');
  const backdrop = document.getElementById('navBackdrop');
  const sidebar  = document.getElementById('sidebar');

  const open  = () => app.classList.add('nav-open');
  const close = () => app.classList.remove('nav-open');
  const toggleNav = () => app.classList.toggle('nav-open');

  // Attach ONCE
  toggle?.addEventListener('click', toggleNav, { once: false });
  backdrop?.addEventListener('click', close,   { once: false });

  // Sidebar link clicks (works even if links change later)
  sidebar?.addEventListener('click', (e) => {
    if (e.target.closest('[data-route]')) close();
  });

  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}


window.addEventListener('DOMContentLoaded', () => {
  initRouter(routes, '#/landing');   // your router still handles page render
  bindDrawerOnce();                  // bind drawer listeners ONCE
});

// ❌ Remove this line if you had it:
// window.addEventListener('hashchange', bindDrawer);

