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


function bindDrawer() {
  const app = document.querySelector('.app');
  const toggle = document.getElementById('navToggle');
  const backdrop = document.getElementById('navBackdrop');
  const links = document.querySelectorAll('[data-route]');

  const open  = () => app.classList.add('nav-open');
  const close = () => app.classList.remove('nav-open');
  const toggleNav = () => app.classList.toggle('nav-open');

  toggle?.addEventListener('click', toggleNav);
  backdrop?.addEventListener('click', close);
  links.forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());
}

window.addEventListener('DOMContentLoaded', () => {
  initRouter(routes, '#/landing');
  bindDrawer();
});
window.addEventListener('hashchange', bindDrawer);
